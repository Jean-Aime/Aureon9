/**
 * External API Key Authentication
 * Validates API keys from other websites (ODIEXA, AAL, AUREX, Ont, ODIEBOARD)
 */

// Map of trusted websites to their API keys
// In production, these should be stored in a secure database/vault
// Format: { "WEBSITE_CODE": "api_key_hash" }
const TRUSTED_WEBSITES = {
  ODIEXA: process.env.API_KEY_ODIEXA || 'dev-key-odiexa-12345',
  AAL: process.env.API_KEY_AAL || 'dev-key-aal-12345',
  AUREX: process.env.API_KEY_AUREX || 'dev-key-aurex-12345',
  ONT: process.env.API_KEY_ONT || 'dev-key-ont-12345',
  ODIEBOARD: process.env.API_KEY_ODIEBOARD || 'dev-key-odieboard-12345',
};

// Rate limiting: requests per minute per website
const RATE_LIMITS = {
  ODIEXA: 1000,
  AAL: 500,
  AUREX: 1000,
  ONT: 500,
  ODIEBOARD: 200,
};

// Track request counts per website (in-memory; use Redis in production)
const requestCounts = new Map();

/**
 * Reset request counts every minute
 */
function resetRequestCounts() {
  requestCounts.clear();
}

setInterval(resetRequestCounts, 60 * 1000);

/**
 * Middleware: Validate external API key and rate limiting
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Express next middleware
 */
export function externalAuthMiddleware(req, res, next) {
  // Extract API key from header
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const sourceWebsite = req.headers['x-source-website'];

  if (!apiKey || !sourceWebsite) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_CREDENTIALS',
        message: 'Missing X-API-Key or X-Source-Website header',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Validate website is in trusted list
  if (!TRUSTED_WEBSITES[sourceWebsite]) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_SOURCE_WEBSITE',
        message: `Unknown source website: ${sourceWebsite}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Validate API key
  if (TRUSTED_WEBSITES[sourceWebsite] !== apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_API_KEY',
        message: 'Invalid API key for source website',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Check rate limit
  const currentCount = (requestCounts.get(sourceWebsite) || 0) + 1;
  const limit = RATE_LIMITS[sourceWebsite] || 500;

  if (currentCount > limit) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded for ${sourceWebsite}. Limit: ${limit} requests per minute`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  requestCounts.set(sourceWebsite, currentCount);

  // Attach auth info to request
  req.externalAuth = {
    sourceWebsite,
    apiKey,
  };

  next();
}

/**
 * Get list of supported websites
 */
export function getSupportedWebsites() {
  return Object.keys(TRUSTED_WEBSITES);
}

/**
 * Get rate limits for a website
 */
export function getRateLimit(sourceWebsite) {
  return RATE_LIMITS[sourceWebsite] || 500;
}

/**
 * Check current request count for a website (for monitoring)
 */
export function getRequestCount(sourceWebsite) {
  return requestCounts.get(sourceWebsite) || 0;
}
