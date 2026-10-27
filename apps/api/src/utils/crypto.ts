import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard 96-bit IV for AES-GCM

/**
 * Derive 32-byte key from SESSION_SECRET
 */
function getDerivedKey(): Buffer {
  return crypto.createHash('sha256').update(env.SESSION_SECRET).digest();
}

/**
 * Encrypt plaintext string using AES-256-GCM
 * Returns string in format: iv:authTag:encrypted (hex encoded)
 */
export function encryptToken(plainText: string): string {
  const key = getDerivedKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt string encrypted with encryptToken
 */
export function decryptToken(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format');
  }

  const [ivHex, authTagHex, encryptedText] = parts;
  const key = getDerivedKey();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Create HMAC signed state for OAuth CSRF protection
 */
export function createOAuthState(userId: string): string {
  const hmac = crypto.createHmac('sha256', env.SESSION_SECRET);
  const signature = hmac.update(userId).digest('hex');
  return `${userId}.${signature}`;
}

/**
 * Verify HMAC signed state and return userId, or null if invalid
 */
export function verifyOAuthState(state: string): string | null {
  try {
    const parts = state.split('.');
    if (parts.length !== 2) return null;

    const [userId, signature] = parts;
    const hmac = crypto.createHmac('sha256', env.SESSION_SECRET);
    const expectedSig = hmac.update(userId).digest('hex');

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expectedBuf.length) {
      return null;
    }

    if (crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return userId;
    }
    return null;
  } catch {
    return null;
  }
}
