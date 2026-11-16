import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Use lower bcrypt cost in test environment for faster execution.
const BCRYPT_SALT_ROUNDS = process.env.NODE_ENV === 'test' ? 4 : 10;
import { encryptSensitiveValue, decryptSensitiveValue } from '@/lib/encryption';

/**
 * RFC 6238 TOTP, SHA-1, 6 digits, 30-second step — the parameters every
 * authenticator app assumes by default. Implemented directly on node:crypto
 * rather than pulled from a dependency so the window, the step and the
 * secret encoding are all visible in one file.
 */

export const TOTP_DIGITS = 6;
export const TOTP_STEP_SECONDS = 30;
/** How many steps either side of "now" a code is accepted for (clock drift). */
export const TOTP_WINDOW = 1;

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** RFC 4648 base32, unpadded — the encoding authenticator apps expect. */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Invalid base32 character');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

/** A fresh 160-bit secret, matching the SHA-1 block size HMAC expects. */
export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

/**
 * HOTP (RFC 4226) for a single counter. TOTP is this with the counter set to
 * floor(now / step), which is what makes a code expire without any state.
 */
export function generateHotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac('sha1', key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, '0');
}

export function generateTotp(secret: string, atMs: number = Date.now()): string {
  return generateHotp(secret, Math.floor(atMs / 1000 / TOTP_STEP_SECONDS));
}

/**
 * Checks a submitted code against the current step and ±TOTP_WINDOW steps.
 * Comparison is constant-time: a timing difference here would leak the digits.
 *
 * Returns the counter that matched (or null) so callers can record it and
 * refuse to accept the same step twice.
 */
export function verifyTotp(
  secret: string,
  token: string,
  atMs: number = Date.now()
): number | null {
  const candidate = token.replace(/\s/g, '');
  if (!/^\d{6}$/.test(candidate)) return null;

  const currentCounter = Math.floor(atMs / 1000 / TOTP_STEP_SECONDS);
  for (let drift = -TOTP_WINDOW; drift <= TOTP_WINDOW; drift++) {
    const counter = currentCounter + drift;
    if (counter < 0) continue;
    const expected = generateHotp(secret, counter);
    const a = Buffer.from(expected);
    const b = Buffer.from(candidate);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return counter;
    }
  }
  return null;
}

/** The otpauth:// URI an authenticator app scans. */
export function buildOtpAuthUri(secret: string, accountName: string, issuer = 'PropatiBox'): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

const RECOVERY_CODE_COUNT = 8;

function formatRecoveryCode(raw: string): string {
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/**
 * Eight single-use recovery codes: returned in plaintext exactly once (for the
 * user to write down), stored only as bcrypt hashes.
 */
export async function generateRecoveryCodes(): Promise<{
  plaintext: string[];
  hashes: string[];
}> {
  const plaintext: string[] = [];
  for (let i = 0; i < RECOVERY_CODE_COUNT; i++) {
    plaintext.push(formatRecoveryCode(crypto.randomBytes(6).toString('hex').toUpperCase()));
  }
  const hashes = await Promise.all(plaintext.map((code) => bcrypt.hash(code, BCRYPT_SALT_ROUNDS)));
  return { plaintext, hashes };
}

/**
 * Consumes a recovery code. Returns the hashes that remain, or null when the
 * code matches nothing — the caller stores the remainder, which is what makes
 * each code single-use.
 */
export async function consumeRecoveryCode(
  hashes: string[],
  code: string
): Promise<string[] | null> {
  const normalised = code.trim().toUpperCase();
  for (let i = 0; i < hashes.length; i++) {
    if (await bcrypt.compare(normalised, hashes[i])) {
      return [...hashes.slice(0, i), ...hashes.slice(i + 1)];
    }
  }
  return null;
}

export function encryptMfaSecret(secret: string): string {
  return encryptSensitiveValue(secret);
}

export function decryptMfaSecret(payload: string): string {
  return decryptSensitiveValue(payload);
}
