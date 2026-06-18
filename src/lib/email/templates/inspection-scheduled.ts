// ===========================================================================
// PROPATI — Email Template: Inspection Scheduled
// ===========================================================================

export interface InspectionScheduledEmailData {
  recipientName: string;
  propertyTitle: string;
  inspectionDate: string;
  inspectionTime: string;
  propertyAddress: string;
  agentName?: string;
  agentPhone?: string;
}

export function renderInspectionScheduledEmail(
  data: InspectionScheduledEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    propertyTitle,
    inspectionDate,
    inspectionTime,
    propertyAddress,
    agentName,
    agentPhone,
  } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    subject: 'Property Inspection Scheduled — Please Confirm',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #0891b2; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .info-box { background-color: #e0f2fe; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background-color: #0891b2; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 Inspection Scheduled</h1>
    </div>
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      <p>Your property inspection has been scheduled.</p>
      <div class="info-box">
        <p><strong>Property:</strong> ${propertyTitle}</p>
        <p><strong>Address:</strong> ${propertyAddress}</p>
        <p><strong>Date:</strong> ${inspectionDate}</p>
        <p><strong>Time:</strong> ${inspectionTime}</p>
        ${
          agentName
            ? `
        <p><strong>Inspector:</strong> ${agentName}</p>
        ${agentPhone ? `<p><strong>Contact:</strong> ${agentPhone}</p>` : ''}
        `
            : ''
        }
      </div>
      <h3>What to Prepare:</h3>
      <ul>
        <li>Ensure the property is accessible</li>
        <li>Have all relevant documents ready</li>
        <li>Be available for questions</li>
      </ul>
      <a href="${appUrl}/dashboard" class="button">View Details</a>
      <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `📅 Inspection Scheduled

Hello ${recipientName},

Your property inspection has been scheduled.

Property: ${propertyTitle}
Address: ${propertyAddress}
Date: ${inspectionDate}
Time: ${inspectionTime}
${agentName ? `Inspector: ${agentName}` : ''}
${agentPhone ? `Contact: ${agentPhone}` : ''}

What to Prepare:
- Ensure the property is accessible
- Have all relevant documents ready
- Be available for questions

View Details: ${appUrl}/dashboard

If you need to reschedule, please contact us at least 24 hours in advance.

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
