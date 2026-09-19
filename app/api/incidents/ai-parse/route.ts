import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/services/auth';
import { parseIncidentNarrative } from '@/lib/services/ai-service';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { narrativeText } = await req.json();
    if (!narrativeText || narrativeText.trim().length < 10) {
      return NextResponse.json({ error: 'Please provide a detailed incident narrative (minimum 10 characters).' }, { status: 400 });
    }

    const structuredData = await parseIncidentNarrative(narrativeText);

    return NextResponse.json({ success: true, report: structuredData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI narrative' }, { status: 500 });
  }
}
