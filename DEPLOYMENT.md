# PROPATI — Deployment Guide

## Stack
- **Frontend + API:** Vercel (Next.js 14)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Payments:** Paystack
- **Files/Images:** Cloudinary
- **Domain:** propati.ng

---

## Security Status — What Is and Isn't Exposed

| Variable | Reaches Browser? | Safe? |
|----------|-----------------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | ✅ Designed to be public |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | ✅ Yes | ✅ Designed to be public |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | ✅ Just a URL |
| `CLERK_SECRET_KEY` | ❌ Never | ✅ Server only |
| `PAYSTACK_SECRET_KEY` | ❌ Never | ✅ Server only — can initiate transfers |
| `CLOUDINARY_API_SECRET` | ❌ Never | ✅ Server only — can delete all files |
| `DATABASE_URL` | ❌ Never | ✅ Server only — direct DB access |
| `CLERK_WEBHOOK_SECRET` | ❌ Never | ✅ Server only |

**Rule:** Only variables prefixed `NEXT_PUBLIC_` reach the browser. All secrets are server-side only. Your codebase is clean — no hardcoded secrets found in any source file.

---

## Step 1 — Push to GitHub

### 1.1 Create the repository
1. Go to [github.com/new](https://github.com/new)
2. Name: `propati`
3. Set to **Private** (switch to Public after launch if desired)
4. Do NOT tick "Initialize with README" — you already have code
5. Click **Create repository**

### 1.2 Push your code
```bash
git remote add origin https://github.com/YOUR_USERNAME/propati.git
git branch -M main
git push -u origin main
```

### 1.3 Verify nothing sensitive was pushed
After pushing, go to GitHub and confirm:
- `.env` does NOT appear in the file list ✅
- Only `.env.example` is visible ✅

---

## Step 2 — Supabase Setup

### 2.1 Get your connection strings
In Supabase dashboard → **Settings → Database → Connection string**:

| Variable | Where | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Supabase pooler → Transaction mode | Port 6543, add `?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | Direct connection | Port 5432, host is `db.YOUR_REF.supabase.com` |

### 2.2 Run migrations on production
Once your DIRECT_URL resolves (direct connection to Supabase):
```bash
npx prisma migrate deploy
```
Or paste the SQL from the SQL editor in Supabase dashboard.

---

## Step 3 — Clerk Setup

### 3.1 Get your keys
In [dashboard.clerk.com](https://dashboard.clerk.com):
- **API Keys** → copy Publishable Key and Secret Key

### 3.2 Configure allowed origins
Clerk → **Settings → Domains** → Add:
- `https://propati.ng`
- `https://www.propati.ng`
- Your Vercel preview URL (e.g. `https://propati.vercel.app`)

### 3.3 Set up the webhook
Clerk → **Webhooks → Add endpoint**:
- URL: `https://propati.ng/api/auth/clerk-webhook`
- Events: `user.created`, `user.updated`, `user.deleted`
- Copy the **Signing Secret** → this becomes `CLERK_WEBHOOK_SECRET`

### 3.4 Redirect URLs
Clerk → **Settings → Redirects**:
```
Sign-in:       /sign-in
Sign-up:       /sign-up
After sign-in: /dashboard
After sign-up: /onboarding
After sign-out: /
```

---

## Step 4 — Vercel Deployment

### 4.1 Connect repo
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub `propati` repo
3. Framework: **Next.js** (auto-detected)
4. Root directory: `/`

### 4.2 Set custom build command
Vercel → **Settings → Build & Development Settings**:
```
Build Command:   npx prisma generate && next build
Install Command: npm install
```
The `prisma generate` step is critical — without it the build fails.

### 4.3 Add all environment variables
Vercel → **Settings → Environment Variables**. Add each one:

```
DATABASE_URL
DIRECT_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_SIGN_IN_URL        = /sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL        = /sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL  = /dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL  = /onboarding
PAYSTACK_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME                = dvukqxabs
CLOUDINARY_API_KEY                   = 341375281211525
CLOUDINARY_API_SECRET                = (your secret)
PREMBLY_API_KEY
PREMBLY_APP_ID
TERMII_API_KEY
TERMII_SENDER_ID                     = PROPATI
SMTP_HOST                            = smtp.gmail.com
SMTP_PORT                            = 587
SMTP_USER
SMTP_PASS
EMAIL_FROM                           = PROPATI <noreply@propati.ng>
REMITA_MERCHANT_ID
REMITA_SERVICE_TYPE_ID               = 4430731
REMITA_API_KEY
REMITA_BASE_URL                      = https://login.remita.net
NEXT_PUBLIC_APP_URL                  = https://propati.ng
NODE_ENV                             = production
```

Set scope: **Production** for live keys, **Preview** for test keys.

### 4.4 Deploy
Click **Deploy**. First deploy ~3 minutes.

---

## Step 5 — Custom Domain (propati.ng)

### 5.1 Add to Vercel
Vercel → **Settings → Domains** → Add `propati.ng` and `www.propati.ng`

### 5.2 DNS records at your registrar
| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

SSL is automatic. No setup needed.

### 5.3 Update Clerk
Add `https://propati.ng` to Clerk → **Settings → Domains**

---

## Step 6 — Paystack Webhook

Paystack → **Settings → API Keys & Webhooks**:
- Webhook URL: `https://propati.ng/api/webhook/paystack`
- Copy webhook secret → set as `PAYSTACK_WEBHOOK_SECRET` in Vercel

---

## Step 7 — Post-Deployment Checklist

### Auth
- [ ] Sign up as landlord → role picker → onboarding → `/dashboard/landlord`
- [ ] Sign up as tenant → `/dashboard/tenant`
- [ ] Sign up as agent → `/dashboard/agent`
- [ ] Sign in → correct dashboard per role
- [ ] Wrong role accessing another dashboard → redirected away

### Core features
- [ ] `/listings` search page loads with filters
- [ ] Listing detail page loads with verification badge
- [ ] Landlord can add a listing with images (Cloudinary upload)
- [ ] Tenant can apply to a listing
- [ ] Messages work between landlord and tenant
- [ ] Verification wizard loads for landlord

### Payments
- [ ] Test card: `5078 5078 5078 5078`, any future expiry, CVV `000`
- [ ] Webhook fires → transaction status updates to `in_escrow`
- [ ] Admin can release escrow

### Admin
- [ ] `/admin` loads for admin role
- [ ] Verification queue shows submissions
- [ ] Flagged listings page loads

---

## Step 8 — Going Live with Paystack

1. Complete Paystack business verification at [paystack.com](https://paystack.com)
2. Get live keys → **Settings → API Keys**
3. Update Vercel env vars: `[REPLACE_WITH_YOUR_PAYSTACK_SECRET]` and public key — never store real secrets in code or docs
4. Update webhook URL in Paystack to `https://propati.ng/api/webhook/paystack`
5. Do one real ₦50 test transaction before announcing

---

## Ongoing Deployment Workflow

Every push to `main` auto-deploys to production.

Safe workflow:
```bash
# 1. Create a feature branch
git checkout -b feature/my-feature

# 2. Make changes, commit
git add -A
git commit -m "feat: describe change"

# 3. Push branch → Vercel creates a preview URL (not production)
git push origin feature/my-feature

# 4. Test on the Vercel preview URL

# 5. Merge to main → auto-deploys to production
git checkout main
git merge feature/my-feature
git push origin main
```

## Rollback
If a deploy breaks production:
- Vercel → **Deployments** → click any previous deploy → **Promote to Production**
- Takes 30 seconds, zero downtime

---

*PROPATI Technologies Ltd — propati.ng*
