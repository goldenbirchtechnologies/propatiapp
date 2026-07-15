import { getAppUrl } from '@/lib/urls';
// ===========================================================================
// PROPATI — Email Template: Verification Approved
// ===========================================================================

export interface VerificationApprovedEmailData {
  name: string;
  listingTitle: string;
  listingId: string;
  tier: string;
}

export function renderVerificationApprovedEmail(
  data: VerificationApprovedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, listingTitle, listingId, tier } = data;
  const appUrl = getAppUrl();

  return {
    subject: '✓ Verification Approved — Your Property is Certified',
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
    .badge { display: inline-block; padding: 8px 16px; background-color: #16a34a; color: white; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .button { display: inline-block; padding: 12px 30px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Verification Approved!</h1>
    </div>
    <div class="content">
      <h2>Congratulations ${name}!</h2>
      <p>Your property listing "<strong>${listingTitle}</strong>" has been successfully verified.</p>
      <p><span class="badge">${tier.toUpperCase()} VERIFIED</span></p>
      <h3>What This Means:</h3>
      <ul>
        <li>✓ Your property is now marked as <strong>verified</strong></li>
        <li>✓ Higher visibility in search results</li>
        <li>✓ Increased tenant trust and inquiries</li>
        <li>✓ Access to verified-only features</li>
      </ul>
      <a href="${appUrl}/listings/${listingId}" class="button">View Your Listing</a>
      <p>Thank you for choosing PROPATI. We're excited to help you find the perfect tenant.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `✓ Verification Approved

Congratulations ${name}!

Your property listing "${listingTitle}" has been successfully verified.

Tier: ${tier.toUpperCase()} VERIFIED

What This Means:
- ✓ Your property is now marked as verified
- ✓ Higher visibility in search results
- ✓ Increased tenant trust and inquiries
- ✓ Access to verified-only features

View your listing: ${appUrl}/listings/${listingId}

Thank you for choosing PROPATI. We're excited to help you find the perfect tenant.

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
