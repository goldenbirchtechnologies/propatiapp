// ===========================================================================
// PROPATI — Email Template: Rent Due Reminder
// ===========================================================================

export interface RentReminderEmailData {
  tenantName: string;
  propertyTitle: string;
  amount: string;
  dueDate: string;
  daysUntilDue: number;
  agreementId: string;
}

export function renderRentReminderEmail(
  data: RentReminderEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const { tenantName, propertyTitle, amount, dueDate, daysUntilDue, agreementId } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const urgencyColor = daysUntilDue <= 1 ? '#dc2626' : daysUntilDue <= 3 ? '#f59e0b' : '#2563eb';
  const urgencyMessage =
    daysUntilDue === 0
      ? 'Your rent is due TODAY'
      : daysUntilDue === 1
      ? 'Your rent is due TOMORROW'
      : `Your rent is due in ${daysUntilDue} days`;

  return {
    subject: `Rent Reminder: ${urgencyMessage} — ${propertyTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: ${urgencyColor}; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .info-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: ${urgencyColor}; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Rent Reminder</h1>
    </div>
    <div class="content">
      <h2>Hello ${tenantName},</h2>
      <p><strong>${urgencyMessage}</strong></p>
      <div class="info-box">
        <p><strong>Property:</strong> ${propertyTitle}</p>
        <p><strong>Amount Due:</strong> ₦${amount}</p>
        <p><strong>Due Date:</strong> ${dueDate}</p>
      </div>
      <h3>How to Pay:</h3>
      <ol>
        <li>Click the button below to access the payment page</li>
        <li>Choose your preferred payment method</li>
        <li>Complete the secure payment process</li>
      </ol>
      <a href="${appUrl}/agreements/${agreementId}/pay" class="button">Pay Rent Now</a>
      <p><small>Late payments may incur additional charges as per your agreement terms.</small></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `🔔 Rent Reminder

Hello ${tenantName},

${urgencyMessage}

Property: ${propertyTitle}
Amount Due: ₦${amount}
Due Date: ${dueDate}

How to Pay:
1. Visit the payment page
2. Choose your preferred payment method
3. Complete the secure payment process

Pay Rent Now: ${appUrl}/agreements/${agreementId}/pay

Late payments may incur additional charges as per your agreement terms.

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
