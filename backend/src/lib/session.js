// Rate limiting for login attempts
const loginAttempts = new Map();
const ATTEMPT_LIMIT = 5;
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes
const LOCKOUT_TIME = 30 * 60 * 1000; // 30 minutes

export function checkLoginRateLimit(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record) {
    loginAttempts.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      locked: false,
      lockedUntil: null,
    });
    return { allowed: true, remaining: ATTEMPT_LIMIT - 1 };
  }

  // Check if lockout has expired
  if (record.locked && now > record.lockedUntil) {
    record.locked = false;
    record.attempts = 1;
    record.firstAttempt = now;
    return { allowed: true, remaining: ATTEMPT_LIMIT - 1 };
  }

  // If currently locked, reject
  if (record.locked) {
    return {
      allowed: false,
      remaining: 0,
      lockedUntil: new Date(record.lockedUntil),
    };
  }

  // Check if window has expired
  if (now - record.firstAttempt > ATTEMPT_WINDOW) {
    record.attempts = 1;
    record.firstAttempt = now;
    return { allowed: true, remaining: ATTEMPT_LIMIT - 1 };
  }

  // Increment attempts
  record.attempts += 1;

  // Lock if exceeds limit
  if (record.attempts > ATTEMPT_LIMIT) {
    record.locked = true;
    record.lockedUntil = now + LOCKOUT_TIME;
    return {
      allowed: false,
      remaining: 0,
      lockedUntil: new Date(record.lockedUntil),
    };
  }

  return {
    allowed: true,
    remaining: ATTEMPT_LIMIT - record.attempts,
  };
}

export function resetLoginAttempts(identifier) {
  loginAttempts.delete(identifier);
}

// Session timeout management
const sessions = new Map();
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour before expiry

export function createSession(userId, token) {
  const now = Date.now();
  sessions.set(userId, {
    token,
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT,
    lastActivityAt: now,
  });
  return token;
}

export function updateSessionActivity(userId) {
  const session = sessions.get(userId);
  if (session) {
    session.lastActivityAt = Date.now();
  }
}

export function getSessionStatus(userId) {
  const session = sessions.get(userId);
  if (!session) {
    return { valid: false, requiresRefresh: false };
  }

  const now = Date.now();
  const timeUntilExpiry = session.expiresAt - now;

  if (timeUntilExpiry <= 0) {
    sessions.delete(userId);
    return { valid: false, requiresRefresh: false };
  }

  return {
    valid: true,
    requiresRefresh: timeUntilExpiry <= REFRESH_THRESHOLD,
    expiresIn: timeUntilExpiry,
  };
}

export function invalidateSession(userId) {
  sessions.delete(userId);
}

export function middleware(req, res, next) {
  if (req.auth) {
    updateSessionActivity(req.auth.id);
    const status = getSessionStatus(req.auth.id);
    if (!status.valid) {
      res.status(401).json({ error: 'Session expired' });
      return;
    }
  }
  next();
}
