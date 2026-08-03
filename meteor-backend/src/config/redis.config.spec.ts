import { redisConfig } from './index';

describe('redisConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.REDIS_URL;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('parses a Redis URL into host, port, and TLS settings', () => {
    process.env.REDIS_URL = 'rediss://default:secret@upstash.example.com:6379';

    const config = redisConfig();

    expect(config).toMatchObject({
      host: 'upstash.example.com',
      port: 6379,
      password: 'secret',
      tls: true,
    });
  });
});
