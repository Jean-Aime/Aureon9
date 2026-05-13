/**
 * Error tracking and logging service
 * Supports integration with Sentry or similar services
 */

const SENTRY_DSN = process.env.SENTRY_DSN || '';
const ENV = process.env.NODE_ENV || 'development';

// Initialize Sentry if available
let sentryClient = null;
if (SENTRY_DSN) {
  try {
    const Sentry = await import('@sentry/node');
    sentryClient = Sentry;
    sentryClient.init({
      dsn: SENTRY_DSN,
      environment: ENV,
      tracesSampleRate: 1.0,
    });
  } catch (e) {
    console.warn('Sentry not configured:', e.message);
  }
}

export class ErrorTracker {
  static captureException(error, context = {}) {
    // Log to console in development
    if (ENV === 'development') {
      console.error('Error:', error, context);
    }

    // Send to Sentry if configured
    if (sentryClient) {
      sentryClient.captureException(error, {
        extra: context,
      });
    }

    // Store in local logs
    this.logError({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static captureMessage(message, level = 'info', context = {}) {
    if (ENV === 'development') {
      console.log(`[${level}]`, message, context);
    }

    if (sentryClient) {
      sentryClient.captureMessage(message, level, {
        extra: context,
      });
    }

    this.logMessage({
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  static logError(error) {
    // In production, write to logging service
    // For now, just log to console in dev
    if (ENV === 'development') {
      console.error('[ERROR LOG]', error);
    }
  }

  static logMessage(log) {
    if (ENV === 'development') {
      console.log('[LOG]', log);
    }
  }

  static middleware() {
    return (err, req, res, next) => {
      this.captureException(err, {
        method: req.method,
        path: req.path,
        query: req.query,
        headers: req.headers,
      });

      res.status(err.status || 500).json({
        error: ENV === 'production' ? 'Internal server error' : err.message,
      });
    };
  }
}

export default ErrorTracker;
