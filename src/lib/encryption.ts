import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw || raw.length < 32) {
    throw new Error(
      'ENCRYPTION_KEY is not set or is too short. It must be at least 32 characters.'
    );
  }
  return Buffer.from(raw, 'utf8');
}

function getHashPepper(): string {
  return process.env.ENCRYPTION_KEY || 'propati-development-pepper';
}

/**
 * Encrypts a sensitive identifier (NIN, BVN, ID number) with AES-256-GCM.
 * The output carries its own IV and auth tag so it can be decrypted later.
 */
export function encryptSensitiveValue(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join('.');
}

export function decryptSensitiveValue(payload: string): string {
  const [ivPart, tagPart, dataPart] = payload.split('.');
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error('Malformed encrypted value');
  }
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getEncryptionKey(),
    Buffer.from(ivPart, 'base64')
  );
  decipher.setAuthTag(Buffer.from(tagPart, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataPart, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}

/**
 * Deterministic hash used to look up an identifier without storing it in the
 * clear. The pepper stops an attacker from reversing the hash with a rainbow
 * table of known Nigerian identifiers.
 */
export function hashSensitiveValue(value: string): string {
  return crypto
    .createHash('sha256')
    .update(`${getHashPepper()}:${value.trim().toUpperCase()}`)
    .digest('hex');
}

/** Hashes a one-time code for storage; the plaintext is never persisted. */
export function hashOtp(code: string, userId: string): string {
  return crypto
    .createHash('sha256')
    .update(`${userId}:${code}`)
    .digest('hex');
}

/** Constant-time comparison for OTP codes. */
export function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
