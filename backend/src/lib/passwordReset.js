import { randomBytes } from 'crypto';
import prisma from './db.js';
import { hash, compare } from 'bcryptjs';

// Store reset tokens in memory (in production, use database)
const resetTokens = new Map();
const verificationTokens = new Map();
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour for password reset
const VERIFICATION_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours for email verification

/**
 * Generate a password reset token
 */
export function generateResetToken(userId) {
  const token = randomBytes(32).toString('hex');
  const hashedToken = hash(token, 10);
  
  resetTokens.set(token, {
    userId,
    hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + TOKEN_EXPIRY,
    used: false,
  });

  // Auto-cleanup expired tokens
  setTimeout(() => resetTokens.delete(token), TOKEN_EXPIRY);

  return token;
}

/**
 * Verify and use a reset token
 */
export function verifyResetToken(token) {
  const record = resetTokens.get(token);

  if (!record) {
    return { valid: false, error: 'Invalid token' };
  }

  if (Date.now() > record.expiresAt) {
    resetTokens.delete(token);
    return { valid: false, error: 'Token expired' };
  }

  if (record.used) {
    return { valid: false, error: 'Token already used' };
  }

  return { valid: true, userId: record.userId };
}

/**
 * Mark reset token as used
 */
export function markResetTokenAsUsed(token) {
  const record = resetTokens.get(token);
  if (record) {
    record.used = true;
  }
}

/**
 * Generate an email verification token
 */
export function generateVerificationToken(userId) {
  const token = randomBytes(32).toString('hex');
  
  verificationTokens.set(token, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + VERIFICATION_EXPIRY,
    verified: false,
  });

  // Auto-cleanup expired tokens
  setTimeout(() => verificationTokens.delete(token), VERIFICATION_EXPIRY);

  return token;
}

/**
 * Verify an email verification token
 */
export function verifyEmailToken(token) {
  const record = verificationTokens.get(token);

  if (!record) {
    return { valid: false, error: 'Invalid token' };
  }

  if (Date.now() > record.expiresAt) {
    verificationTokens.delete(token);
    return { valid: false, error: 'Token expired' };
  }

  if (record.verified) {
    return { valid: false, error: 'Email already verified' };
  }

  return { valid: true, userId: record.userId };
}

/**
 * Mark email as verified
 */
export async function markEmailAsVerified(token, userId) {
  const record = verificationTokens.get(token);
  if (record) {
    record.verified = true;
  }

  // Update user in database
  return prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true },
  });
}

/**
 * Update user password
 */
export async function updateUserPassword(userId, newPassword) {
  const passwordHash = await hash(newPassword, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
