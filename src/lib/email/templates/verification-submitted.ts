import { getAppUrl } from '@/lib/urls';
// ===========================================================================
// PROPATI — Email Template: Verification Submitted
// ===========================================================================

export interface VerificationSubmittedEmailData {
  name: string;
  listingTitle: string;
  listingId: string;
}

export function renderVerificationSubmittedEmail(
  data: VerificationSubmittedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, listingTitle, listingId } = data;
  const appUrl = getAppUrl();

  return {
    subject: 'Verification Submitted — Under Review',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Submitted</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>Your property listing "<strong>${listingTitle}</strong>" has been submitted for verification.</p>
      <p>Our team will review your documents within 24-48 hours. You'll receive an email notification once the review is complete.</p>
      <h3>What Happens Next?</h3>
      <ol>
        <li><strong>Document Review</strong> — We verify your ownership documents</li>
        <li><strong>Identity Verification</strong> — We match your identity with property records</li>
        <li><strong>Physical Inspection</strong> (if required) — We schedule an on-site visit</li>
        <li><strong>Final Certification</strong> — Your listing gets verified</li>
      </ol>
      <a href="${appUrl}/verification/${listingId}" class="button">Track Verification Status</a>
      <p>If you have any questions, contact us at support@propati.ng</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Verification Submitted

Hello ${name},

Your property listing "${listingTitle}" has been submitted for verification.

Our team will review your documents within 24-48 hours. You'll receive an email notification once the review is complete.

What Happens Next?
1. Document Review — We verify your ownership documents
2. Identity Verification — We match your identity with property records
3. Physical Inspection (if required) — We schedule an on-site visit
4. Final Certification — Your listing gets verified

Track verification status: ${appUrl}/verification/${listingId}

If you have any questions, contact us at support@propati.ng

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
