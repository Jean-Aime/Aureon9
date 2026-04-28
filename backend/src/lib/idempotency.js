/**
 * Idempotency Layer
 * Prevents duplicate processing of external API events (e.g., double-rewarding)
 * Tracks external event IDs and caches responses
 */

import prisma from './db.js';

// In-memory cache for recent idempotency keys (production should use Redis)
const idempotencyCache = new Map();

/**
 * Check if an external event has already been processed
 * @param {string} sourceWebsite - Website sending the request (ODIEXA, AAL, etc.)
 * @param {string} externalId - Unique ID from source website
 * @returns {object|null} Cached response if found, null if new event
 */
export async function checkIdempotency(sourceWebsite, externalId) {
  if (!sourceWebsite || !externalId) {
    return null;
  }

  const cacheKey = `${sourceWebsite}:${externalId}`;

  // Check in-memory cache first
  if (idempotencyCache.has(cacheKey)) {
    return idempotencyCache.get(cacheKey);
  }

  // Check database for previously processed event
  try {
    const existingLog = await prisma.auditLog.findFirst({
      where: {
        sourceWebsite,
        externalId,
      },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    if (existingLog && existingLog.payloadJson) {
      // Return the cached response from the payload
      return existingLog.payloadJson.response || null;
    }
  } catch (error) {
    console.error('Idempotency check error:', error);
    // Don't fail the request if cache check fails; continue processing
  }

  return null;
}

/**
 * Record an idempotent event as processed
 * @param {object} params - Event details
 * @param {string} params.sourceWebsite - Source website
 * @param {string} params.externalId - External event ID
 * @param {string} params.entityType - Entity type affected
 * @param {string} params.entityId - Entity ID
 * @param {string} params.action - Action performed
 * @param {object} params.requestPayload - Original request
 * @param {object} params.responsePayload - Response sent back
 * @param {string} params.actorUserId - Actor (optional)
 */
export async function recordIdempotentEvent(params) {
  const {
    sourceWebsite,
    externalId,
    entityType,
    entityId,
    action,
    requestPayload,
    responsePayload,
    actorUserId = null,
  } = params;

  if (!sourceWebsite || !externalId) {
    return null;
  }

  const cacheKey = `${sourceWebsite}:${externalId}`;

  // Store in memory cache
  idempotencyCache.set(cacheKey, responsePayload);

  // Prune old entries (keep last 1000)
  if (idempotencyCache.size > 1000) {
    const firstKey = idempotencyCache.keys().next().value;
    idempotencyCache.delete(firstKey);
  }

  // Store in database audit trail
  try {
    await prisma.auditLog.create({
      data: {
        sourceWebsite,
        externalId,
        entityType,
        entityId,
        action,
        actorUserId,
        payloadJson: {
          request: requestPayload,
          response: responsePayload,
        },
      },
    });
  } catch (error) {
    console.error('Failed to record idempotent event:', error);
    // Don't fail the response if audit logging fails
  }

  return responsePayload;
}

/**
 * Clear idempotency cache (for testing or manual cleanup)
 */
export function clearIdempotencyCache() {
  idempotencyCache.clear();
}

/**
 * Get cache statistics
 */
export function getIdempotencyCacheStats() {
  return {
    size: idempotencyCache.size,
    entries: Array.from(idempotencyCache.keys()),
  };
}
