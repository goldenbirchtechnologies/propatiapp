import { getAppUrl } from '@/lib/urls';
// ===========================================================================
// PROPATI — Email Template: Agreement Created
// ===========================================================================

export interface AgreementCreatedEmailData {
  recipientName: string;
  recipientRole: 'landlord' | 'tenant';
  otherPartyName: string;
  propertyTitle: string;
  agreementId: string;
  startDate: string;
  endDate: string;
  rentAmount: string;
}

export function renderAgreementCreatedEmail(
  data: AgreementCreatedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    recipientRole,
    otherPartyName,
    propertyTitle,
    agreementId,
    startDate,
    endDate,
    rentAmount,
  } = data;
  const appUrl = getAppUrl();

  return {
    subject: 'New Rental Agreement Created — Action Required',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7c3aed; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .info-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📄 New Agreement Created</h1>
    </div>
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      <p>A new rental agreement has been created for you to review and sign.</p>
      <div class="info-box">
        <p><strong>Property:</strong> ${propertyTitle}</p>
        <p><strong>${
          recipientRole === 'landlord' ? 'Tenant' : 'Landlord'
        }:</strong> ${otherPartyName}</p>
        <p><strong>Lease Period:</strong> ${startDate} to ${endDate}</p>
        <p><strong>Rent Amount:</strong> ₦${rentAmount}</p>
      </div>
      <h3>Next Steps:</h3>
      <ol>
        <li>Review the agreement terms carefully</li>
        <li>Sign the agreement electronically</li>
        <li>Wait for the other party to sign</li>
      </ol>
      <a href="${appUrl}/agreements/${agreementId}" class="button">Review & Sign Agreement</a>
      <p><strong>Important:</strong> The agreement becomes binding only after both parties have signed.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `New Rental Agreement Created — Action Required

Hello ${recipientName},

A new rental agreement has been created for you to review and sign.

Property: ${propertyTitle}
${recipientRole === 'landlord' ? 'Tenant' : 'Landlord'}: ${otherPartyName}
Lease Period: ${startDate} to ${endDate}
Rent Amount: ₦${rentAmount}

Next Steps:
1. Review the agreement terms carefully
2. Sign the agreement electronically
3. Wait for the other party to sign

Review & Sign Agreement: ${appUrl}/agreements/${agreementId}

Important: The agreement becomes binding only after both parties have signed.

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
