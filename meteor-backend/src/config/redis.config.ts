import { registerAs } from '@nestjs/config';

function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : 6379,
      password: parsed.password || undefined,
      tls: parsed.protocol === 'rediss:',
    };
  } catch {
    return null;
  }
}

export default registerAs('redis', () => {
  const redisUrl = process.env.REDIS_URL;
  const parsedRedisUrl = redisUrl ? parseRedisUrl(redisUrl) : null;

  return {
    host: parsedRedisUrl?.host || process.env.REDIS_HOST || 'localhost',
    port: parsedRedisUrl?.port || parseInt(process.env.REDIS_PORT || '6379', 10),
    password: parsedRedisUrl?.password || process.env.REDIS_PASSWORD || undefined,
    tls: parsedRedisUrl?.tls || process.env.REDIS_TLS === 'true' || undefined,
  };
});
