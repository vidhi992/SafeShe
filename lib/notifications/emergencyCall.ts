import { db } from '@/lib/db';

export interface EmergencyCallResult {
  id: string;
  contactName: string;
  contactPhone: string;
  relationship: string;
  status: 'QUEUED' | 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'NO_ANSWER' | 'BUSY';
  provider: 'TWILIO' | 'DEMO_SIMULATOR';
  callSid?: string;
  note?: string;
}

export interface TriggerEmergencyCallsPayload {
  userId: string;
  emergencyEventId: string;
  lat: number;
  lng: number;
  locationName?: string;
}

/**
 * Server-Side Emergency Call Dispatcher
 * Initiates REAL phone calls to verified parents/guardians using Twilio REST API.
 * Operates in clearly marked DEMO MODE if Twilio credentials are not configured.
 */
export async function triggerEmergencyCalls(
  payload: TriggerEmergencyCallsPayload
): Promise<EmergencyCallResult[]> {
  const { userId, emergencyEventId, lat, lng, locationName } = payload;

  // 1. Fetch User & Enabled Verified Emergency Contacts (Max 5 to prevent recursion/rate-limit abuse)
  const contacts = await db.emergencyContact.findMany({
    where: {
      userId,
      isEnabled: true,
      isVerified: true,
    },
    orderBy: { priority: 'asc' },
    take: 5,
  });

  if (!contacts || contacts.length === 0) {
    console.log(`[EMERGENCY CALL] No verified emergency contacts configured for userId: ${userId}`);
    return [];
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  const isTwilioConfigured = Boolean(accountSid && authToken && fromNumber);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const incidentUrl = `${baseUrl}/emergency/incident/${emergencyEventId}`;
  const statusCallbackUrl = `${baseUrl}/api/webhooks/twilio/voice`;

  // TwiML Voice Message played when guardian answers the call
  const twimlXml = `<Response>
    <Say voice="alice" language="en-IN">
      Emergency alert from SafeShe. The SafeShe user has triggered an S O S emergency alert.
      Emergency location is available at ${locationName || 'the emergency incident link'}.
      Please check on them immediately.
    </Say>
  </Response>`;

  const callResults: EmergencyCallResult[] = [];

  for (const contact of contacts) {
    // 2. Create Initial EmergencyCall record in DB
    const dbCall = await db.emergencyCall.create({
      data: {
        emergencyEventId,
        emergencyContactId: contact.id,
        contactName: contact.name,
        contactPhone: contact.phoneNumber,
        provider: isTwilioConfigured ? 'TWILIO' : 'DEMO_SIMULATOR',
        status: 'INITIATED',
        initiatedAt: new Date(),
      },
    });

    if (isTwilioConfigured) {
      try {
        // Send HTTPS POST to Twilio Calls REST API
        const authHeader = `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`;
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

        const bodyParams = new URLSearchParams();
        bodyParams.append('To', contact.phoneNumber);
        bodyParams.append('From', fromNumber!);
        bodyParams.append('Twiml', twimlXml);
        bodyParams.append('StatusCallback', statusCallbackUrl);
        bodyParams.append('StatusCallbackEvent', 'initiated');
        bodyParams.append('StatusCallbackEvent', 'ringing');
        bodyParams.append('StatusCallbackEvent', 'answered');
        bodyParams.append('StatusCallbackEvent', 'completed');

        const twilioRes = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodyParams.toString(),
        });

        const twilioData = await twilioRes.json();

        if (twilioRes.ok && twilioData.sid) {
          // Update DB with Twilio Call SID
          await db.emergencyCall.update({
            where: { id: dbCall.id },
            data: {
              providerCallSid: twilioData.sid,
              status: twilioData.status === 'queued' ? 'QUEUED' : 'INITIATED',
            },
          });

          console.log(`[TWILIO REAL VOICE CALL INITIATED] To: ${contact.phoneNumber} (${contact.name}) | CallSid: ${twilioData.sid}`);

          callResults.push({
            id: dbCall.id,
            contactName: contact.name,
            contactPhone: contact.phoneNumber,
            relationship: contact.relationship,
            status: 'INITIATED',
            provider: 'TWILIO',
            callSid: twilioData.sid,
          });
        } else {
          console.error(`[TWILIO CALL FAILED] To: ${contact.phoneNumber} | Error:`, twilioData.message);

          await db.emergencyCall.update({
            where: { id: dbCall.id },
            data: {
              status: 'FAILED',
              failureReason: twilioData.message || 'Twilio API call initiation failed',
            },
          });

          callResults.push({
            id: dbCall.id,
            contactName: contact.name,
            contactPhone: contact.phoneNumber,
            relationship: contact.relationship,
            status: 'FAILED',
            provider: 'TWILIO',
            note: twilioData.message || 'Twilio call failed',
          });
        }
      } catch (err: any) {
        console.error(`[TWILIO NETWORK EXCEPTION] To: ${contact.phoneNumber}:`, err);

        await db.emergencyCall.update({
          where: { id: dbCall.id },
          data: {
            status: 'FAILED',
            failureReason: err.message || 'Network exception',
          },
        });

        callResults.push({
          id: dbCall.id,
          contactName: contact.name,
          contactPhone: contact.phoneNumber,
          relationship: contact.relationship,
          status: 'FAILED',
          provider: 'TWILIO',
          note: err.message,
        });
      }
    } else {
      // Clearly marked DEMO MODE logging (Twilio credentials not configured)
      console.log(`[DEMO MODE — EMERGENCY CALL SIMULATION] Simulated emergency voice call to ${contact.name} (${contact.phoneNumber})`);

      callResults.push({
        id: dbCall.id,
        contactName: contact.name,
        contactPhone: contact.phoneNumber,
        relationship: contact.relationship,
        status: 'INITIATED',
        provider: 'DEMO_SIMULATOR',
        note: 'DEMO MODE — Emergency call simulation logged (Twilio credentials not configured)',
      });
    }
  }

  return callResults;
}
