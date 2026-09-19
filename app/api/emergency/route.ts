import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';
import { NotificationService } from '@/lib/services/notification-service';
import { triggerEmergencyCalls } from '@/lib/notifications/emergencyCall';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      const events = await db.emergencyEvent.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { emergencyCalls: true },
      });
      return NextResponse.json({ success: true, events });
    }

    const emergencyEvent = await db.emergencyEvent.findUnique({
      where: { id: eventId },
      include: { emergencyCalls: true },
    });

    if (!emergencyEvent || emergencyEvent.userId !== user.id) {
      return NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      emergencyEvent,
      emergencyCalls: emergencyEvent.emergencyCalls,
    });
  } catch (error) {
    console.error('Get emergency status error:', error);
    return NextResponse.json({ error: 'Failed to fetch emergency status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, lat, lng, locationName, triggerNote } = await req.json();

    const finalLat = typeof lat === 'number' ? lat : 20.5937;
    const finalLng = typeof lng === 'number' ? lng : 78.9629;

    // 1. Create Emergency Event
    const emergencyEvent = await db.emergencyEvent.create({
      data: {
        userId: user.id,
        type: type || 'MANUAL_SOS', // MANUAL_SOS, SILENT_SOS, VOICE_SOS, DEVIATION_TIMEOUT
        status: 'ACTIVE',
        lat: finalLat,
        lng: finalLng,
        locationName: locationName || 'Current User Geolocation',
        triggerNote: triggerNote || 'Hold 3-Second SOS Triggered',
      },
    });

    // 2. Fetch User Trusted Contacts
    const trustedContacts = await db.trustedContact.findMany({
      where: { userId: user.id },
    });

    // 3. Initiate REAL Emergency Guardian Phone Calls via Twilio / Telephony Provider
    const emergencyCalls = await triggerEmergencyCalls({
      userId: user.id,
      emergencyEventId: emergencyEvent.id,
      lat: finalLat,
      lng: finalLng,
      locationName: emergencyEvent.locationName || undefined,
    });

    // 4. Dispatch SMS/Email Alerts to Trusted Contacts
    const notificationsSent = await NotificationService.sendEmergencyAlerts(
      user.id,
      user.name,
      emergencyEvent.lat,
      emergencyEvent.lng,
      trustedContacts
    );

    // 5. Create Incident Timeline Record
    await db.incidentTimeline.create({
      data: {
        emergencyEventId: emergencyEvent.id,
        title: `SOS Emergency Alert Activated (${type || 'MANUAL'})`,
        description: `Location logged at ${emergencyEvent.locationName}. Initiated ${emergencyCalls.length} guardian calls and notified ${trustedContacts.length} trusted contacts.`,
        category: 'SOS',
      },
    });

    return NextResponse.json({
      success: true,
      emergencyEvent,
      emergencyCalls,
      trustedContactsNotifiedCount: trustedContacts.length,
      notificationsSent,
      isTwilioConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    });
  } catch (error) {
    console.error('Emergency trigger error:', error);
    return NextResponse.json({ error: 'Failed to initiate emergency escalation' }, { status: 500 });
  }
}
