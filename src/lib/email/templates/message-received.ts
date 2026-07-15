import { getAppUrl } from '@/lib/urls';
// ===========================================================================
// PROPATI — Email Template: New Message Received
// ===========================================================================

export interface MessageReceivedEmailData {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  propertyTitle?: string;
  conversationId: string;
}

export function renderMessageReceivedEmail(
  data: MessageReceivedEmailData
): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    recipientName,
    senderName,
    messagePreview,
    propertyTitle,
    conversationId,
  } = data;
  const appUrl = getAppUrl();

  return {
    subject: `New Message from ${senderName}${
      propertyTitle ? ` — ${propertyTitle}` : ''
    }`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px 20px; background-color: #f9f9f9; }
    .message-box { background-color: #fff; border: 1px solid #ddd; padding: 15px; margin: 20px 0; border-radius: 5px; font-style: italic; }
    .button { display: inline-block; padding: 12px 30px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💬 New Message</h1>
    </div>
    <div class="content">
      <h2>Hello ${recipientName},</h2>
      <p>You have received a new message from <strong>${senderName}</strong>${
      propertyTitle ? ` regarding <strong>${propertyTitle}</strong>` : ''
    }.</p>
      <div class="message-box">
        "${messagePreview}"
      </div>
      <a href="${appUrl}/dashboard/messages?conversationId=${conversationId}" class="button">Read & Reply</a>
      <p><small>To manage your notification preferences, visit your account settings.</small></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PROPATI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `,
    text: `💬 New Message

Hello ${recipientName},

You have received a new message from ${senderName}${
      propertyTitle ? ` regarding ${propertyTitle}` : ''
    }.

"${messagePreview}"

Read & Reply: ${appUrl}/dashboard/messages?conversationId=${conversationId}

To manage your notification preferences, visit your account settings.

---
© ${new Date().getFullYear()} PROPATI. All rights reserved.
    `,
  };
}
