export function isAllowedCorsOrigin(origin: string | undefined, configuredOrigins: string): boolean {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = origin.toLowerCase();
  const allowedOrigins = configuredOrigins
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  for (const allowedOrigin of allowedOrigins) {
    if (allowedOrigin === '*' || allowedOrigin === normalizedOrigin) {
      return true;
    }

    if (allowedOrigin.includes('vercel.app')) {
      try {
        const hostname = new URL(normalizedOrigin).hostname.toLowerCase();
        if (hostname === 'vercel.app' || hostname.endsWith('.vercel.app')) {
          return true;
        }
      } catch {
        // Ignore parsing errors and continue checking other patterns.
      }
    }

    if (allowedOrigin.startsWith('http://localhost') || allowedOrigin.startsWith('https://localhost')) {
      try {
        const hostname = new URL(normalizedOrigin).hostname.toLowerCase();
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return true;
        }
      } catch {
        // Ignore parsing errors and continue checking other patterns.
      }
    }

    if (allowedOrigin.includes('*')) {
      const escapedPattern = allowedOrigin
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\\\*/g, '.*');
      const regex = new RegExp(`^${escapedPattern}$`, 'i');
      if (regex.test(normalizedOrigin)) {
        return true;
      }
    }
  }

  return false;
}
