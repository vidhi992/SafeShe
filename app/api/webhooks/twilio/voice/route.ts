import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const params = new URLSearchParams(text);

    const callSid = params.get('CallSid');
    const callStatus = params.get('CallStatus');

    if (!callSid || !callStatus) {
      return NextResponse.json({ error: 'Missing CallSid or CallStatus' }, { status: 400 });
    }

    console.log(`[TWILIO VOICE WEBHOOK] CallSid: ${callSid} | CallStatus: ${callStatus}`);

    let mappedStatus: 'QUEUED' | 'INITIATED' | 'RINGING' | 'ANSWERED' | 'COMPLETED' | 'FAILED' | 'NO_ANSWER' | 'BUSY' = 'INITIATED';

    const statusLower = callStatus.toLowerCase();
    if (statusLower === 'queued') mappedStatus = 'QUEUED';
    else if (statusLower === 'initiated') mappedStatus = 'INITIATED';
    else if (statusLower === 'ringing') mappedStatus = 'RINGING';
    else if (statusLower === 'in-progress' || statusLower === 'answered') mappedStatus = 'ANSWERED';
    else if (statusLower === 'completed') mappedStatus = 'COMPLETED';
    else if (statusLower === 'failed') mappedStatus = 'FAILED';
    else if (statusLower === 'no-answer') mappedStatus = 'NO_ANSWER';
    else if (statusLower === 'busy') mappedStatus = 'BUSY';

    const updateData: any = {
      status: mappedStatus,
      updatedAt: new Date(),
    };

    if (mappedStatus === 'ANSWERED') {
      updateData.answeredAt = new Date();
    } else if (mappedStatus === 'COMPLETED' || mappedStatus === 'FAILED' || mappedStatus === 'NO_ANSWER' || mappedStatus === 'BUSY') {
      updateData.completedAt = new Date();
    }

    // Update database record safely using CallSid
    const updatedCall = await db.emergencyCall.updateMany({
      where: { providerCallSid: callSid },
      data: updateData,
    });

    return new Response('<Response></Response>', {
      headers: { 'Content-Type': 'text/xml' },
      status: 200,
    });
  } catch (error) {
    console.error('[TWILIO VOICE WEBHOOK ERROR]:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
