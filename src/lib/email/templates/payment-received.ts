// ===========================================================================
// PROPATI — Email Template: Payment Received
// ===========================================================================

export interface PaymentReceivedEmailData {
  recipientName: string;
  amount: string;
  payerName: string;
  propertyTitle: string;
  transactionId: string;
  paymentType: string;
}

export function renderPaymentReceivedEmail(
  data: PaymentReceivedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    amount,
    payerName,
    propertyTitle,
    transactionId,
    paymentType,
  } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    subject: 'Payment Received — Transaction Confirmed',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .amount-box { background-color: #d1fae5; border: 2px solid #16a34a; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }
    .amount { font-size: 36px; font-weight: bold; color: #16a34a; }
    .info-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payment Received</h1>
    </div>
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      <p>We've successfully received a payment for your property.</p>
      <div class="amount-box">
        <div class="amount">₦${amount}</div>
        <p>${paymentType}</p>
      </div>
      <div class="info-box">
        <p><strong>From:</strong> ${payerName}</p>
        <p><strong>Property:</strong> ${propertyTitle}</p>
        <p><strong>Transaction ID:</strong> ${transactionId}</p>
      </div>
      <p>The funds are being processed and will be released according to your agreement terms.</p>
      <a href="${appUrl}/transactions/${transactionId}" class="button">View Transaction Details</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `💰 Payment Received

Hello ${recipientName},

We've successfully received a payment for your property.

Amount: ₦${amount}
Type: ${paymentType}

From: ${payerName}
Property: ${propertyTitle}
Transaction ID: ${transactionId}

The funds are being processed and will be released according to your agreement terms.

View Transaction Details: ${appUrl}/transactions/${transactionId}

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
