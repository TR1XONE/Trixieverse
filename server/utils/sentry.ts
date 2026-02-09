import { createRequire } from 'module';

const require = createRequire(import.meta.url);

let Sentry: any = null;
let nodeProfilingIntegration: (() => any) | null = null;

try {
  Sentry = require('@sentry/node');
  try {
    ({ nodeProfilingIntegration } = require('@sentry/profiling-node'));
  } catch {
    nodeProfilingIntegration = null;
  }
} catch {
  Sentry = null;
  nodeProfilingIntegration = null;
}

/**
 * Initialize Sentry for error tracking
 * Call this FIRST in server startup, before anything else
 */
export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!Sentry) {
    console.warn(
      'Sentry packages not installed. Error tracking disabled. Install @sentry/node to enable.'
    );
    return;
  }

  if (!dsn) {
    console.warn(
      'SENTRY_DSN not configured. Error tracking disabled. Set SENTRY_DSN in .env to enable.'
    );
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
      ...(nodeProfilingIntegration ? [nodeProfilingIntegration()] : []),
    ],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    maxBreadcrumbs: 50,
  });

  console.log('✅ Sentry initialized successfully');
}

/**
 * Capture exception with optional context
 */
export function captureException(
  error: Error,
  context?: Record<string, any>
) {
  if (!Sentry) return;
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    return Sentry.captureException(error);
  });
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  if (!Sentry) return;
  return Sentry.captureMessage(message, level);
}

export function sentryRequestHandler() {
  return Sentry?.Handlers?.requestHandler?.() ?? ((req: any, res: any, next: any) => next());
}

export function sentryErrorHandler() {
  return Sentry?.Handlers?.errorHandler?.() ?? ((err: any, req: any, res: any, next: any) => next(err));
}

export default Sentry;
