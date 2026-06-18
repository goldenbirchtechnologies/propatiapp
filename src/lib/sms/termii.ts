// ===========================================================================
// PROPATI — SMS Service (Termii)
// Phase H: SMS notifications via Termii API
// ===========================================================================

// ===========================================================================
// CONFIGURATION
// ===========================================================================

const TERMII_API_KEY = process.env.TERMII_API_KEY || '';
const TERMII_SENDER_ID = process.env.TERMII_SENDER_ID || 'PROPATI';
const TERMII_API_URL = 'https://api.ng.termii.com/api/sms/send';

// Mock mode: enabled if API key is not configured
const MOCK_MODE = !TERMII_API_KEY;

// ===========================================================================
// SMS SERVICE
// ===========================================================================

export interface SendSMSParams {
  to: string; // Phone number in format: 234XXXXXXXXXX (without +)
  message: string;
}

export async function sendSMS(params: SendSMSParams): Promise<void> {
  const { to, message } = params;

  // Mock mode: log to console
  if (MOCK_MODE) {
    console.log('\n=== SMS (MOCK MODE) ===');
    console.log('To:', to);
    console.log('Message:', message);
    console.log('=======================\n');
    return;
  }

  // Production mode: send via Termii API
  try {
    const response = await fetch(TERMII_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        from: TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: TERMII_API_KEY,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Termii API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    console.log(`SMS sent successfully to ${to}:`, data);
  } catch (error) {
    console.error('SMS send error:', error);
    throw new Error(`Failed to send SMS: ${error}`);
  }
}
