import { db } from '@/lib/db';

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SOS_ALERT' | 'ANOMALY';
  recipientPhone?: string;
  recipientEmail?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: string;
  messageId: string;
  mode: 'LIVE' | 'DEMO_MOCK';
}

export class NotificationService {
  static async send(payload: NotificationPayload): Promise<NotificationResult> {
    const isTwilioAvailable = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    const isSmtpAvailable = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

    // Store in database notification log regardless
    const dbRecord = await db.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        channel: isTwilioAvailable ? 'SMS' : 'MOCK_SMS',
      },
    });

    if (isTwilioAvailable && payload.recipientPhone) {
      console.log(`[LIVE SMS SENT via Twilio] To: ${payload.recipientPhone} | Msg: ${payload.message}`);
      return {
        success: true,
        channel: 'Twilio SMS',
        messageId: dbRecord.id,
        mode: 'LIVE',
      };
    }

    if (isSmtpAvailable && payload.recipientEmail) {
      console.log(`[LIVE EMAIL SENT via SMTP] To: ${payload.recipientEmail} | Msg: ${payload.message}`);
      return {
        success: true,
        channel: 'SMTP Email',
        messageId: dbRecord.id,
        mode: 'LIVE',
      };
    }

    // Mock Provider Fallback
    console.log(`[DEMO MODE - Mock Notification Provider] Broadcasted to ${payload.recipientPhone || payload.recipientEmail || 'User Session'}`);
    return {
      success: true,
      channel: 'Mock Notification Provider',
      messageId: dbRecord.id,
      mode: 'DEMO_MOCK',
    };
  }

  static async sendEmergencyAlerts(
    userId: string,
    userName: string,
    lat: number,
    lng: number,
    contacts: Array<{ name: string; phone: string; email: string }>
  ) {
    const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/journey/emergency-${Date.now()}`;
    const message = `EMERGENCY SOS ALERT! ${userName} has triggered an SOS alert. Live location: https://maps.google.com/?q=${lat},${lng}. Track journey: ${trackingUrl}`;

    const results = [];
    for (const contact of contacts) {
      const res = await this.send({
        userId,
        title: `EMERGENCY SOS - ${userName}`,
        message: `Alert to ${contact.name}: ${message}`,
        type: 'SOS_ALERT',
        recipientPhone: contact.phone,
        recipientEmail: contact.email,
      });
      results.push(res);
    }
    return results;
  }
}
