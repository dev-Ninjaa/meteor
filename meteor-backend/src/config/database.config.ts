import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL || 'postgresql://meteor:meteor123@localhost:5432/meteor_db',
}));
