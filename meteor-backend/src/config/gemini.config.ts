import { resolve } from 'path';
import { config as loadEnv } from 'dotenv';
import { registerAs } from '@nestjs/config';

const envPaths = [resolve(process.cwd(), '.env'), resolve(process.cwd(), '.env.example')];

export default registerAs('gemini', () => {
  for (const envPath of envPaths) {
    loadEnv({ path: envPath });
  }

  return {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  };
});
