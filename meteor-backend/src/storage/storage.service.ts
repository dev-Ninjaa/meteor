import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface UploadResult {
  url: string;
  cid: string;
  size: number;
  filename: string;
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly pinataApiKey: string;
  private readonly pinataSecretKey: string;
  private readonly pinataJwt: string;
  private readonly usePinata: boolean;

  constructor(private readonly configService: ConfigService) {
    this.pinataApiKey = this.configService.get<string>('PINATA_API_KEY', '');
    this.pinataSecretKey = this.configService.get<string>('PINATA_SECRET_KEY', '');
    this.pinataJwt = this.configService.get<string>('PINATA_JWT', '');
    this.usePinata = !!(this.pinataApiKey || this.pinataJwt);
  }

  /**
   * Upload a file buffer to Pinata (IPFS)
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<UploadResult> {
    if (this.usePinata) {
      return this.uploadToPinata(buffer, filename, contentType);
    }
    
    // Fallback: return local mock URL (for development without Pinata)
    return this.mockUpload(buffer, filename, contentType);
  }

  /**
   * Upload to Pinata IPFS
   */
  private async uploadToPinata(
    buffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<UploadResult> {
    try {
      const formData = new FormData();
      // Convert Buffer to base64 string then to blob
      const base64 = buffer.toString('base64');
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: contentType });
      formData.append('file', blob, filename);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          ...(this.pinataJwt ? { Authorization: `Bearer ${this.pinataJwt}` } : {}),
          ...(this.pinataApiKey && this.pinataSecretKey ? {
            pinata_api_key: this.pinataApiKey,
            pinata_secret_api_key: this.pinataSecretKey,
          } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Pinata upload failed: ${error}`);
      }

      const data = await response.json();
      const cid = data.IpfsHash;
      
      return {
        url: `https://gateway.pinata.cloud/ipfs/${cid}`,
        cid,
        size: buffer.length,
        filename,
      };
    } catch (error) {
      this.logger.error(`Pinata upload error: ${error}`);
      throw error;
    }
  }

  /**
   * Mock upload for development (returns a local URL pattern)
   * In production, you MUST configure Pinata or another storage provider
   */
  private async mockUpload(
    buffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<UploadResult> {
    this.logger.warn(
      `Mock upload used for ${filename} (${buffer.length} bytes). ` +
      'Configure PINATA_API_KEY and PINATA_SECRET_KEY for real IPFS uploads.'
    );

    // Generate a deterministic mock CID based on content
    const crypto = await import('crypto');
    const hash = crypto.createHash('sha256').update(buffer).digest('hex').slice(0, 46);
    const mockCid = `bafybeig${hash}`;

    return {
      url: `https://gateway.pinata.cloud/ipfs/${mockCid}`,
      cid: mockCid,
      size: buffer.length,
      filename,
    };
  }

  /**
   * Upload JSON data to Pinata
   */
  async uploadJSON(data: any, filename: string = 'data.json'): Promise<UploadResult> {
    const buffer = Buffer.from(JSON.stringify(data, null, 2));
    return this.uploadFile(buffer, filename, 'application/json');
  }

  /**
   * Get gateway URL for a CID
   */
  getGatewayUrl(cid: string): string {
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  /**
   * Check if storage is configured
   */
  isConfigured(): boolean {
    return this.usePinata;
  }
}