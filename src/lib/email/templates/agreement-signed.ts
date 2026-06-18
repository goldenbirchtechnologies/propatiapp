// ===========================================================================
// PROPATI — Email Template: Agreement Signed
// ===========================================================================

export interface AgreementSignedEmailData {
  recipientName: string;
  signerName: string;
  propertyTitle: string;
  agreementId: string;
  fullySignedNow: boolean;
}

export function renderAgreementSignedEmail(
  data: AgreementSignedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    signerName,
    propertyTitle,
    agreementId,
    fullySignedNow,
  } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    subject: fullySignedNow
      ? '✓ Agreement Fully Signed — Contract Active'
      : 'Agreement Signed — Awaiting Your Signature',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${
      fullySignedNow ? '#16a34a' : '#f59e0b'
    }; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background-color: ${
      fullySignedNow ? '#16a34a' : '#f59e0b'
    }; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${fullySignedNow ? '✓ Agreement Active' : '📝 Signature Received'}</h1>
    </div>
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      <p><strong>${signerName}</strong> has signed the rental agreement for "<strong>${propertyTitle}</strong>".</p>
      ${
        fullySignedNow
          ? `
      <h3>🎉 Your Agreement is Now Active!</h3>
      <p>Both parties have signed the agreement. The contract is now legally binding.</p>
      <ul>
        <li>✓ All terms are now in effect</li>
        <li>✓ Payments can be processed</li>
        <li>✓ Move-in can proceed as scheduled</li>
      </ul>
      `
          : `
      <h3>⏳ Waiting for Your Signature</h3>
      <p>The agreement is pending your signature. Please review and sign at your earliest convenience.</p>
      `
      }
      <a href="${appUrl}/agreements/${agreementId}" class="button">${
      fullySignedNow ? 'View Agreement' : 'Sign Agreement'
    }</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `${
      fullySignedNow ? '✓ Agreement Active' : '📝 Signature Received'
    }

Hello ${recipientName},

${signerName} has signed the rental agreement for "${propertyTitle}".

${
  fullySignedNow
    ? `
🎉 Your Agreement is Now Active!

Both parties have signed the agreement. The contract is now legally binding.

- ✓ All terms are now in effect
- ✓ Payments can be processed
- ✓ Move-in can proceed as scheduled
`
    : `
⏳ Waiting for Your Signature

The agreement is pending your signature. Please review and sign at your earliest convenience.
`
}

${fullySignedNow ? 'View Agreement' : 'Sign Agreement'}: ${appUrl}/agreements/${agreementId}

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
