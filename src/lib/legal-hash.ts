import crypto from 'crypto';

export function sha256Hex(input: Buffer | Uint8Array | string): string {
  const hash = crypto.createHash('sha256');
  if (typeof input === 'string') {
    hash.update(input, 'utf8');
  } else {
    hash.update(input);
  }
  return `sha256:${hash.digest('hex')}`;
}

export function computeDocumentVersionChainHash(
  previousChainHash: string | null,
  contentHash: string,
  createdAt: Date,
): string {
  const ts = createdAt.toISOString();
  const input = `${previousChainHash || ''}${contentHash}${ts}`;
  return sha256Hex(input);
}

export function computeAgreementIntegrityChain(
  signatureBindingHashes: string[],
  pdfContentHash: string,
  finalizedAt: Date,
): string {
  let acc = '';
  for (const bindingHash of signatureBindingHashes) {
    acc = sha256Hex(`${acc}${bindingHash}`);
  }
  return sha256Hex(`${acc}${pdfContentHash}${finalizedAt.toISOString()}`);
}

export function computeSignatureBindingHash(
  documentHash: string,
  signerId: string,
  signedAt: Date,
  ipAddress: string | null,
): string {
  return sha256Hex(`${documentHash}${signerId}${signedAt.toISOString()}${ipAddress || ''}`);
}

export function computeStampDutyLinkageHash(
  agreementPdfHash: string,
  certificateHash: string,
  paidAt: Date,
): string {
  return sha256Hex(`${agreementPdfHash}${certificateHash}${paidAt.toISOString()}`);
}
