// ===========================================================================
// PROPATI — WhatsApp Service (Twilio)
// Phase H: WhatsApp notifications via Twilio API
// ===========================================================================

import twilio from 'twilio';

// ===========================================================================
// CONFIGURATION
// ===========================================================================

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_WHATSAPP_NUMBER =
  process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+141****8886';

// Mock mode: enabled if Twilio credentials look invalid or missing
const MOCK_MODE =
  !TWILIO_ACCOUNT_SID ||
  !TWILIO_AUTH_TOKEN ||
  !/^AC[0-9a-zA-Z]+$/.test(TWILIO_ACCOUNT_SID);

// ===========================================================================
// CLIENT
// ===========================================================================

let client: ReturnType<typeof twilio> | null = null;

if (!MOCK_MODE) {
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

// ===========================================================================
// WHATSAPP SERVICE
// ===========================================================================

export interface SendWhatsAppParams {
  to: string; // Phone with country code: +234XXXXXXXXXX
  message: string;
}

export async function sendWhatsApp(params: SendWhatsAppParams): Promise<void> {
  const { to, message } = params;

  // Mock mode: log to console
  if (MOCK_MODE || !client) {
    console.log('\n=== WHATSAPP (MOCK MODE) ===');
    console.log('To:', to);
    console.log('Message:', message);
    console.log('============================\n');
    return;
  }

  // Production mode: send via Twilio
  try {
    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log(`WhatsApp sent successfully to ${to}:`, result.sid);
  } catch (error) {
    console.error('WhatsApp send error:', error);
    throw new Error(`Failed to send WhatsApp: ${error}`);
  }
}
