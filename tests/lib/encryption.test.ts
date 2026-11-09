import { describe, it, expect, afterEach, vi } from 'vitest';
import crypto from 'crypto';

type EncryptionModule = typeof import('@/lib/encryption');

const KEY_VAR = 'ENCRYPTION_KEY';
const originalKey = process.env[KEY_VAR];

/**
 * Loads a fresh copy of the module so the key cache is rebuilt for `key`.
 * Resolution is cached per module instance, so each key shape needs its own.
 */
async function loadWithKey(key: string | undefined): Promise<EncryptionModule> {
  if (key === undefined) delete process.env[KEY_VAR];
  else process.env[KEY_VAR] = key;
  vi.resetModules();
  return import('@/lib/encryption');
}

afterEach(() => {
  if (originalKey === undefined) delete process.env[KEY_VAR];
  else process.env[KEY_VAR] = originalKey;
  vi.resetModules();
});

describe('encryption key resolution', () => {
  // Regression: a base64 key was read as UTF-8, so `openssl rand -base64 32`
  // (44 characters) produced a 44-byte buffer and AES-256-GCM rejected it with
  // "Invalid key length". Every onboarding save that encrypted a field 500'd.
  it('accepts the documented base64 key (44 chars decoding to 32 bytes)', async () => {
    const key = crypto.randomBytes(32).toString('base64');
    expect(key).toHaveLength(44);

    const { encryptSensitiveValue, decryptSensitiveValue } = await loadWithKey(key);

    const ciphertext = encryptSensitiveValue('0123456789');
    expect(decryptSensitiveValue(ciphertext)).toBe('0123456789');
  });

  it('accepts a 32-character ASCII key', async () => {
    const { encryptSensitiveValue, decryptSensitiveValue } = await loadWithKey('k'.repeat(32));

    expect(decryptSensitiveValue(encryptSensitiveValue('12345678901'))).toBe('12345678901');
  });

  it('derives a key from a longer passphrase that is not base64', async () => {
    const passphrase = 'correct horse battery staple, correct horse battery';
    expect(passphrase.length).toBeGreaterThanOrEqual(32);

    const { encryptSensitiveValue, decryptSensitiveValue } = await loadWithKey(passphrase);

    expect(decryptSensitiveValue(encryptSensitiveValue('0123456789'))).toBe('0123456789');
  });

  it('throws when the key is not set', async () => {
    const { encryptSensitiveValue } = await loadWithKey(undefined);

    expect(() => encryptSensitiveValue('0123456789')).toThrow(/ENCRYPTION_KEY/);
  });

  it('throws when the key is too short', async () => {
    const { encryptSensitiveValue } = await loadWithKey('too-short');

    expect(() => encryptSensitiveValue('0123456789')).toThrow(/ENCRYPTION_KEY/);
  });
});

describe('encryptSensitiveValue / decryptSensitiveValue', () => {
  it('round-trips an account number and a BVN', async () => {
    const mod = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(mod.decryptSensitiveValue(mod.encryptSensitiveValue('0123456789'))).toBe('0123456789');
    expect(mod.decryptSensitiveValue(mod.encryptSensitiveValue('12345678901'))).toBe('12345678901');
  });

  it('uses a fresh IV per call so equal inputs differ on the wire', async () => {
    const { encryptSensitiveValue } = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(encryptSensitiveValue('0123456789')).not.toBe(encryptSensitiveValue('0123456789'));
  });

  it('never embeds the plaintext in the ciphertext', async () => {
    const { encryptSensitiveValue } = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(encryptSensitiveValue('0123456789')).not.toContain('0123456789');
  });

  it('rejects a tampered ciphertext rather than returning garbage', async () => {
    const { encryptSensitiveValue, decryptSensitiveValue } = await loadWithKey(
      crypto.randomBytes(32).toString('base64')
    );
    const [iv, tag, data] = encryptSensitiveValue('0123456789').split('.');
    const flipped = Buffer.from(data, 'base64');
    flipped[0] ^= 0xff;

    expect(() => decryptSensitiveValue([iv, tag, flipped.toString('base64')].join('.'))).toThrow();
  });

  it('rejects a malformed payload', async () => {
    const { decryptSensitiveValue } = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(() => decryptSensitiveValue('not-a-payload')).toThrow(/Malformed encrypted value/);
  });
});

describe('hashSensitiveValue', () => {
  it('is deterministic for the same identifier', async () => {
    const { hashSensitiveValue } = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(hashSensitiveValue('12345678901')).toBe(hashSensitiveValue('12345678901'));
  });

  it('normalises case and surrounding whitespace so lookups stay stable', async () => {
    const { hashSensitiveValue } = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(hashSensitiveValue('  ab1234567 ')).toBe(hashSensitiveValue('AB1234567'));
  });

  it('differs between identifiers', async () => {
    const { hashSensitiveValue } = await loadWithKey(crypto.randomBytes(32).toString('base64'));

    expect(hashSensitiveValue('12345678901')).not.toBe(hashSensitiveValue('12345678902'));
  });
});
