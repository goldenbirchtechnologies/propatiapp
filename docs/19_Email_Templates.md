# 19 – Email Templates

## Implementation

Email templates live in `src/lib/email/templates/`.

### Available Templates

| Template | File | Trigger |
|----------|------|---------|
| Verification Update | `verification-update.ts` | Layer approve/reject |
| Inspection Scheduled | `inspection-scheduled.ts` | Layer 4 schedule |
| Payment Received | `payment-received.ts` | Transaction confirmed |
| Payment Confirmed | `payment-confirmed.ts` | Receipt delivery |
| Agreement Signed | `agreement-signed.ts` | Signature recorded |
| Verification Certified | `verification-certified.ts` | L5 approved |

### Email Service

- `src/lib/email.ts` — `sendEmail()` wrapper
- SMTP via Gmail or equivalent
- Fallback behavior when SMTP unset: noop

### Style

- Inline CSS for email client compatibility
- PROPATI brand colors (green/teal/blue accents)
- Clear CTA buttons
- Nigerian context (NGN, local phone formats)

### Planned

- Rent reminder: 7 days, 3 days, 1 day before due
- Welcome email after onboarding
- Org invitation email
- Password reset
- Dispute update
