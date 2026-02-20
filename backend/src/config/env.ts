import { z } from 'zod';

// Clerk keys are optional for demo mode
// When not provided or using placeholder values, the app runs in demo mode
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().optional(), // Redis is optional

  // Clerk keys are optional - empty string defaults allow demo mode
  CLERK_SECRET_KEY: z.string().default(''),
  CLERK_WEBHOOK_SECRET: z.string().default(''),
  CLERK_PUBLISHABLE_KEY: z.string().default(''),

  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  RATE_LIMIT_READ_PER_MIN: z.coerce.number().default(100),
  RATE_LIMIT_WRITE_PER_MIN: z.coerce.number().default(20),

  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = validateEnv();

// Helper to check if Clerk is properly configured (not demo mode)
// Returns true only if all Clerk keys are provided with real values
export function isClerkConfigured(): boolean {
  const { CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, CLERK_PUBLISHABLE_KEY } = env;

  // Check if any key is missing or empty
  if (!CLERK_SECRET_KEY || !CLERK_WEBHOOK_SECRET || !CLERK_PUBLISHABLE_KEY) {
    return false;
  }

  // Check for placeholder values
  const placeholderPatterns = [
    'your_clerk',
    'sk_test_your',
    'pk_test_your',
    'whsec_your',
    'placeholder',
    'xxx',
  ];

  const allKeys = [CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, CLERK_PUBLISHABLE_KEY];

  for (const key of allKeys) {
    for (const pattern of placeholderPatterns) {
      if (key.toLowerCase().includes(pattern)) {
        return false;
      }
    }
  }

  // Check if keys have proper prefixes (basic validation)
  const hasValidSecretKey = CLERK_SECRET_KEY.startsWith('sk_test_') || CLERK_SECRET_KEY.startsWith('sk_live_');
  const hasValidPublishableKey = CLERK_PUBLISHABLE_KEY.startsWith('pk_test_') || CLERK_PUBLISHABLE_KEY.startsWith('pk_live_');
  const hasValidWebhookSecret = CLERK_WEBHOOK_SECRET.startsWith('whsec_');

  return hasValidSecretKey && hasValidPublishableKey && hasValidWebhookSecret;
}
