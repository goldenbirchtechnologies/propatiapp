// ===========================================================================
// PROPATI — Email Template: Verification Rejected
// ===========================================================================

export interface VerificationRejectedEmailData {
  name: string;
  listingTitle: string;
  listingId: string;
  reason: string;
}

export function renderVerificationRejectedEmail(
  data: VerificationRejectedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, listingTitle, listingId, reason } = data;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    subject: 'Verification Update — Additional Information Required',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .reason-box { background-color: #fee; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 30px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Update</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>We've reviewed your property listing "<strong>${listingTitle}</strong>", but we need additional information to proceed.</p>
      <div class="reason-box">
        <strong>Reason:</strong><br/>
        ${reason}
      </div>
      <h3>What to Do Next:</h3>
      <ol>
        <li>Review the feedback above</li>
        <li>Update your documents or information</li>
        <li>Resubmit for verification</li>
      </ol>
      <a href="${appUrl}/verification/${listingId}" class="button">Update & Resubmit</a>
      <p>If you have questions or need assistance, contact support@propati.ng</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Verification Update — Additional Information Required

Hello ${name},

We've reviewed your property listing "${listingTitle}", but we need additional information to proceed.

Reason:
${reason}

What to Do Next:
1. Review the feedback above
2. Update your documents or information
3. Resubmit for verification

Update & resubmit: ${appUrl}/verification/${listingId}

If you have questions or need assistance, contact support@propati.ng

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
