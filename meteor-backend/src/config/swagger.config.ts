import { registerAs } from '@nestjs/config';

export default registerAs('swagger', () => ({
  enabled: true,
  title: 'Meteor API',
  description: 'Real-time bounty marketplace API with AI assistance and Monad escrow payments',
  version: '1.0',
  path: 'docs',
}));
