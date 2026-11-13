import { describe, it, expect } from 'vitest';
import {
  base32Encode,
  base32Decode,
  generateHotp,
  generateTotp,
  verifyTotp,
  buildOtpAuthUri,
  generateRecoveryCodes,
  consumeRecoveryCode,
  TOTP_STEP_SECONDS,
} from '@/lib/mfa/totp';

/**
 * RFC 6238 Appendix B vectors. The spec's tables use a SHA-1 secret of
 * "12345678901234567890" (raw ASCII), encoded here as base32.
 */
const RFC_SECRET = base32Encode(Buffer.from('12345678901234567890', 'ascii'));

describe('base32', () => {
  it('round-trips arbitrary bytes', () => {
    const bytes = Buffer.from([0x00, 0xff, 0x10, 0x7f, 0xab, 0xcd]);
    expect(base32Decode(base32Encode(bytes))).toEqual(bytes);
  });

  it('matches the RFC 4648 encoding of an ASCII string', () => {
    // "foobar" -> MZXW6YTBOI
    expect(base32Encode(Buffer.from('foobar', 'ascii'))).toBe('MZXW6YTBOI');
  });
});

describe('TOTP (RFC 6238 vectors, SHA-1, 8 digits truncated to 6)', () => {
  const vectors: { seconds: number; code: string }[] = [
    { seconds: 59, code: '287082' },
    { seconds: 1111111109, code: '081804' },
    { seconds: 1234567890, code: '005924' },
    { seconds: 2000000000, code: '279037' },
  ];

  for (const { seconds, code } of vectors) {
    it(`matches the vector at T=${seconds}`, () => {
      expect(generateTotp(RFC_SECRET, seconds * 1000)).toBe(code);
    });
  }

  it('steps every 30 seconds', () => {
    expect(TOTP_STEP_SECONDS).toBe(30);
    const a = generateHotp(RFC_SECRET, 0);
    const b = generateHotp(RFC_SECRET, 1);
    expect(a).not.toBe(b);
  });
});

describe('verifyTotp', () => {
  const at = 1234567890 * 1000;

  it('accepts the current code', () => {
    expect(verifyTotp(RFC_SECRET, generateTotp(RFC_SECRET, at), at)).not.toBeNull();
  });

  it('accepts one step of drift in either direction', () => {
    const previous = generateTotp(RFC_SECRET, at - TOTP_STEP_SECONDS * 1000);
    const next = generateTotp(RFC_SECRET, at + TOTP_STEP_SECONDS * 1000);
    expect(verifyTotp(RFC_SECRET, previous, at)).not.toBeNull();
    expect(verifyTotp(RFC_SECRET, next, at)).not.toBeNull();
  });

  it('rejects a code more than one step away', () => {
    const stale = generateTotp(RFC_SECRET, at - TOTP_STEP_SECONDS * 2 * 1000);
    expect(verifyTotp(RFC_SECRET, stale, at)).toBeNull();
  });

  it('rejects malformed input without throwing', () => {
    expect(verifyTotp(RFC_SECRET, '', at)).toBeNull();
    expect(verifyTotp(RFC_SECRET, 'abcdef', at)).toBeNull();
    expect(verifyTotp(RFC_SECRET, '12345', at)).toBeNull();
  });

  it('returns the counter so a step cannot be replayed silently', () => {
    const counter = verifyTotp(RFC_SECRET, generateTotp(RFC_SECRET, at), at);
    expect(counter).toBe(Math.floor(at / 1000 / TOTP_STEP_SECONDS));
  });
});

describe('buildOtpAuthUri', () => {
  it('produces a scannable otpauth URI with the expected parameters', () => {
    const uri = buildOtpAuthUri(RFC_SECRET, 'admin@propati.ng');
    expect(uri.startsWith('otpauth://totp/')).toBe(true);
    const params = new URLSearchParams(uri.split('?')[1]);
    expect(params.get('secret')).toBe(RFC_SECRET);
    expect(params.get('digits')).toBe('6');
    expect(params.get('period')).toBe('30');
    expect(params.get('issuer')).toBe('PropatiBox');
  });
});

describe('recovery codes', () => {
  it('issues eight unique codes and stores only hashes', async () => {
    const { plaintext, hashes } = await generateRecoveryCodes();
    expect(plaintext).toHaveLength(8);
    expect(new Set(plaintext).size).toBe(8);
    expect(hashes).toHaveLength(8);
    for (const hash of hashes) {
      expect(plaintext).not.toContain(hash);
    }
  });

  it('consumes a matching code and leaves the rest', async () => {
    const { plaintext, hashes } = await generateRecoveryCodes();
    const remaining = await consumeRecoveryCode(hashes, plaintext[3]);
    expect(remaining).not.toBeNull();
    expect(remaining).toHaveLength(7);
    // The used hash is gone, so the same code cannot be redeemed twice.
    expect(await consumeRecoveryCode(remaining!, plaintext[3])).toBeNull();
  });

  it('ignores case and surrounding whitespace', async () => {
    const { plaintext, hashes } = await generateRecoveryCodes();
    const remaining = await consumeRecoveryCode(hashes, `  ${plaintext[0].toLowerCase()}  `);
    expect(remaining).toHaveLength(7);
  });

  it('rejects an unknown code', async () => {
    const { hashes } = await generateRecoveryCodes();
    expect(await consumeRecoveryCode(hashes, 'AAAA-BBBB-CCCC')).toBeNull();
  });
});
