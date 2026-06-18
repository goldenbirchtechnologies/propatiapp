import QRCode from 'qrcode';

export interface VerificationQRData {
  type: 'PROPATI_VERIFICATION';
  verificationId: string;
  listingId: string;
  timestamp: number;
}

/**
 * Generate QR code for video verification
 * @param verificationId - Verification record ID
 * @param listingId - Listing ID
 * @returns Base64 encoded QR code image (data:image/png;base64...)
 */
export async function generateVerificationQR(
  verificationId: string,
  listingId: string
): Promise<string> {
  const data: VerificationQRData = {
    type: 'PROPATI_VERIFICATION',
    verificationId,
    listingId,
    timestamp: Date.now(),
  };

  const qrDataString = JSON.stringify(data);

  try {
    const qrCode = await QRCode.toDataURL(qrDataString, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 2,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return qrCode;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Parse QR code data
 * @param qrData - Raw QR code data string
 * @returns Parsed verification data
 */
export function parseVerificationQR(qrData: string): VerificationQRData {
  try {
    const parsed = JSON.parse(qrData);

    if (parsed.type !== 'PROPATI_VERIFICATION') {
      throw new Error('Invalid QR code type');
    }

    if (!parsed.verificationId || !parsed.listingId || !parsed.timestamp) {
      throw new Error('Missing required QR code data');
    }

    // Check if QR code is not older than 24 hours
    const ageInHours = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
    if (ageInHours > 24) {
      throw new Error('QR code expired (older than 24 hours)');
    }

    return parsed as VerificationQRData;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Invalid QR code data');
  }
}

/**
 * Generate QR code as SVG string
 */
export async function generateVerificationQRSVG(
  verificationId: string,
  listingId: string
): Promise<string> {
  const data: VerificationQRData = {
    type: 'PROPATI_VERIFICATION',
    verificationId,
    listingId,
    timestamp: Date.now(),
  };

  const qrDataString = JSON.stringify(data);

  try {
    const qrCode = await QRCode.toString(qrDataString, {
      errorCorrectionLevel: 'M',
      type: 'svg',
      margin: 2,
      width: 300,
    });

    return qrCode;
  } catch (error) {
    console.error('QR code SVG generation failed:', error);
    throw new Error('Failed to generate QR code SVG');
  }
}
