import { getAppUrl } from '@/lib/urls';
// ===========================================================================
// PROPATI — Email Template: Welcome
// ===========================================================================

export interface WelcomeEmailData {
  name: string;
  role: string;
}

export function renderWelcomeEmail(data: WelcomeEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { name, role } = data;

  const roleGreeting =
    role === 'landlord'
      ? 'list and verify your properties'
      : role === 'tenant'
      ? 'find your perfect home'
      : role === 'agent'
      ? 'manage your clients and properties'
      : 'get started';

  return {
    subject: 'Welcome to PROPATI — Nigeria\'s Verified Property Marketplace',
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
    .button { display: inline-block; padding: 12px 30px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to PROPATI</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>Thank you for joining PROPATI, Nigeria's first verified property marketplace.</p>
      <p>As a <strong>${role}</strong>, you can now ${roleGreeting} with confidence.</p>
      <h3>What's Next?</h3>
      <ul>
        ${
          role === 'landlord'
            ? '<li>Complete your profile verification</li><li>List your first property</li><li>Submit documents for verification</li>'
            : role === 'tenant'
            ? '<li>Complete your tenant profile</li><li>Browse verified properties</li><li>Schedule inspections</li>'
            : role === 'agent'
            ? '<li>Complete your agent profile</li><li>Get approved by admin</li><li>Start managing properties</li>'
            : '<li>Complete your profile</li><li>Explore the platform</li>'
        }
      </ul>
      <a href="${
        getAppUrl()
      }/dashboard" class="button">Go to Dashboard</a>
      <p>If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
      <p>Nigeria's Verified Property Marketplace</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `Welcome to PROPATI

Hello ${name},

Thank you for joining PROPATI, Nigeria's first verified property marketplace.

As a ${role}, you can now ${roleGreeting} with confidence.

What's Next?
${
  role === 'landlord'
    ? '- Complete your profile verification\n- List your first property\n- Submit documents for verification'
    : role === 'tenant'
    ? '- Complete your tenant profile\n- Browse verified properties\n- Schedule inspections'
    : role === 'agent'
    ? '- Complete your agent profile\n- Get approved by admin\n- Start managing properties'
    : '- Complete your profile\n- Explore the platform'
}

Visit your dashboard: ${
      getAppUrl()
    }/dashboard

If you have any questions, feel free to reach out to our support team.

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
Nigeria's Verified Property Marketplace
    `,
  };
}
