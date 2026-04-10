import { registerAs } from '@nestjs/config';

export default registerAs('rate-limit', () => ({
  storage: process.env.RATE_LIMIT_STORAGE || 'memory',

  rules: {
    ws: {
      preConnect: {
        windowMs: parseInt(process.env.RATE_LIMIT_WS_PRE_WINDOW_MS || '60000', 10),
        maxAttempts: parseInt(process.env.RATE_LIMIT_WS_PRE_MAX_ATTEMPTS || '20', 10),
      },
      postConnect: {
        windowMs: parseInt(process.env.RATE_LIMIT_WS_POST_WINDOW_MS || '60000', 10),
        maxAttempts: parseInt(process.env.RATE_LIMIT_WS_POST_MAX_ATTEMPTS || '20', 10),
      },
    },
    rest: {
      preConnect: {
        ttl: parseInt(process.env.RATE_LIMIT_REST_PRE_TTL || '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_REST_PRE_LIMIT || '5', 10),
      },
      postConnect: {
        ttl: parseInt(process.env.RATE_LIMIT_REST_POST_TTL || '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_REST_POST_LIMIT || '10', 10),
      },
    },
  },
}));