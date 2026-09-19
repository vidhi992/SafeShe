import { generateCryptoHash } from '@/lib/utils';

export interface StorageUploadResult {
  fileUrl: string;
  cryptoHash: string;
  fileSize: number;
  fileType: string;
}

export class StorageService {
  static MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
  static ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
  ];

  static async uploadEvidenceFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<StorageUploadResult> {
    if (fileBuffer.length > this.MAX_FILE_SIZE) {
      throw new Error('File size exceeds the 50MB limit for secure vault storage.');
    }

    if (!this.ALLOWED_TYPES.includes(mimeType)) {
      throw new Error(`File format (${mimeType}) is not permitted. Allowed: Images, Audio, Video, PDF.`);
    }

    // Generate SHA-256 Hash of file buffer for cryptographic evidence integrity
    const hash = await generateCryptoHash(fileBuffer.toString('base64'));

    // Simulated local private storage URL or Cloudinary fallback
    const simulatedUrl = `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&evidence_file=${encodeURIComponent(
      fileName
    )}&hash=${hash.slice(0, 8)}`;

    return {
      fileUrl: simulatedUrl,
      cryptoHash: hash,
      fileSize: fileBuffer.length,
      fileType: mimeType,
    };
  }

  static getSignedTemporaryUrl(fileUrl: string, expiresInMinutes = 15): string {
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
    return `${fileUrl}&expires=${expiresAt}&token=signed_vault_token_${Math.random().toString(36).substring(7)}`;
  }
}
