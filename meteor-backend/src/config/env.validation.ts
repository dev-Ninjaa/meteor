import { Logger } from '@nestjs/common';

interface EnvValidationRule {
  name: string;
  required: boolean;
  productionOnly?: boolean;
  message?: string;
}

const REQUIRED_ENV_VARS: EnvValidationRule[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    message: 'PostgreSQL connection string',
  },
  {
    name: 'JWT_SECRET',
    required: true,
    message: 'JWT signing secret (min 32 chars in production)',
  },
  { name: 'REDIS_HOST', required: true },
  { name: 'REDIS_PORT', required: true },
  {
    name: 'GEMINI_API_KEY',
    required: false,
    productionOnly: true,
    message: 'Google Gemini API key (required in production for AI features)',
  },
  {
    name: 'MONAD_RPC_URL',
    required: false,
    productionOnly: true,
    message: 'Monad RPC URL (required in production for blockchain features)',
  },
  {
    name: 'MONAD_ESCROW_CONTRACT_ADDRESS',
    required: false,
    productionOnly: true,
    message: 'Monad escrow contract address (required in production for payments)',
  },
  { name: 'CORS_ORIGIN', required: false },
  { name: 'LOG_LEVEL', required: false },
];

export function validateEnv(): void {
  const logger = new Logger('ConfigValidation');
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of REQUIRED_ENV_VARS) {
    const value = process.env[rule.name];
    const isMissing = !value || value.trim() === '';

    if (isMissing && rule.required) {
      if (rule.productionOnly && !isProduction) {
        warnings.push(
          `${rule.name}: ${rule.message || rule.name} is missing (recommended for production)`,
        );
      } else {
        errors.push(`${rule.name}: ${rule.message || rule.name} is required but not set`);
      }
    }

    if (!isMissing && rule.name === 'JWT_SECRET' && isProduction) {
      if ((value as string).length < 32) {
        errors.push(
          `JWT_SECRET: must be at least 32 characters in production (got ${(value as string).length})`,
        );
      }
    }
  }

  if (errors.length > 0) {
    logger.error('Environment validation failed:\n' + errors.map((e) => `  - ${e}`).join('\n'));
    throw new Error(`Environment validation failed:\n${errors.join('\n')}`);
  }

  if (warnings.length > 0) {
    logger.warn('Environment validation warnings:\n' + warnings.map((w) => `  - ${w}`).join('\n'));
  }

  logger.log('Environment validation passed');
}
