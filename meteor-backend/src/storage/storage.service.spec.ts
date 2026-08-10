import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const createService = (values: Record<string, string> = {}): StorageService => {
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => values[key] ?? defaultValue),
    } as unknown as ConfigService;
    return new StorageService(configService);
  };

  const sampleBuffer = Buffer.from('test file content');

  describe('uploadFile', () => {
    it('routes to mock upload when no Pinata credentials are configured', async () => {
      const service = createService({});
      const result = await service.uploadFile(sampleBuffer, 'test.txt', 'text/plain');

      expect(result).toMatchObject({ filename: 'test.txt', size: sampleBuffer.length });
      expect(result.url).toContain('gateway.pinata.cloud/ipfs/');
      expect(result.cid).toBeTruthy();
    });

    it('returns a deterministic CID for identical content', async () => {
      const service = createService({});
      const first = await service.uploadFile(sampleBuffer, 'a.txt', 'text/plain');
      const second = await service.uploadFile(sampleBuffer, 'b.txt', 'text/plain');

      expect(first.cid).toBe(second.cid);
    });
  });

  describe('mockUpload', () => {
    it('produces a valid IPFS-style CID', async () => {
      const service = createService({});
      const result = await service.uploadFile(sampleBuffer, 'file.txt', 'text/plain');

      expect(result.cid).toMatch(/^bafybeig[a-f0-9]{46}$/);
    });

    it('reflects the buffer size and filename', async () => {
      const service = createService({});
      const result = await service.uploadFile(sampleBuffer, 'hello.txt', 'text/plain');

      expect(result.size).toBe(sampleBuffer.length);
      expect(result.filename).toBe('hello.txt');
    });
  });

  describe('isConfigured', () => {
    it('returns false without Pinata credentials', () => {
      const service = createService({});
      expect(service.isConfigured()).toBe(false);
    });

    it('returns true when PINATA_JWT is set', () => {
      const service = createService({ PINATA_JWT: 'test-jwt' });
      expect(service.isConfigured()).toBe(true);
    });

    it('returns true when PINATA_API_KEY is set', () => {
      const service = createService({ PINATA_API_KEY: 'test-key' });
      expect(service.isConfigured()).toBe(true);
    });
  });

  describe('uploadJSON', () => {
    it('uploads serialized JSON with application/json content type', async () => {
      const service = createService({});
      const data = { hello: 'world', n: 42 };
      const result = await service.uploadJSON(data);

      const expectedBuffer = Buffer.from(JSON.stringify(data, null, 2));
      expect(result.size).toBe(expectedBuffer.length);
      expect(result.filename).toBe('data.json');
    });
  });

  describe('getGatewayUrl', () => {
    it('returns the Pinata gateway URL for a CID', () => {
      const service = createService({});
      expect(service.getGatewayUrl('bafybeig123')).toBe(
        'https://gateway.pinata.cloud/ipfs/bafybeig123'
      );
    });
  });
});