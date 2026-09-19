import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/services/auth';
import { StorageService } from '@/lib/services/storage-service';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const evidences = await db.evidence.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ evidences });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch evidence vault' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || 'Vault Media Record';
    const description = formData.get('description') as string | null;
    const incidentId = formData.get('incidentId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadRes = await StorageService.uploadEvidenceFile(buffer, file.name, file.type);

    const evidence = await db.evidence.create({
      data: {
        userId: user.id,
        incidentId: incidentId || null,
        title,
        description: description || file.name,
        fileType: file.type,
        fileSize: file.size,
        fileUrl: uploadRes.fileUrl,
        cryptoHash: uploadRes.cryptoHash,
      },
    });

    return NextResponse.json({ success: true, evidence });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to upload evidence' }, { status: 500 });
  }
}
