# PROPATI — Next.js 14 Property Marketplace

Nigeria's most trusted property marketplace with 5-layer verification, escrow payments, and estate management tools.

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Authentication**: Clerk
- **Payments**: Paystack
- **Styling**: Tailwind CSS + Radix UI (shadcn/ui)
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Playwright

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/           # Public routes (landing, listings, auth)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── dashboard/      # Role-specific dashboards
│   │   ├── tenant/         # Tenant portal
│   │   ├── agent/          # Agent portal
│   │   ├── admin/          # Admin console
│   │   └── estate-manager/ # Estate manager B2B
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Base UI components (shadcn/ui)
│   ├── layout/             # Layout components (sidebar, topbar)
│   ├── listings/           # Listing-specific components
│   ├── verification/       # Verification wizard components
│   ├── agreements/         # Agreement components
│   └── orgs/               # Organisation components
├── lib/                    # Core utilities & clients
│   ├── prisma.ts           # Prisma singleton
│   ├── auth.ts             # Clerk auth helpers
│   ├── utils.ts            # Utility functions
│   ├── validators.ts       # Zod schemas
│   ├── paystack.ts         # Paystack client
│   ├── cloudinary.ts       # Cloudinary upload helpers
│   ├── prembly.ts          # Prembly identity verification
│   ├── termii.ts           # Termii SMS client
│   ├── email.ts            # Email templates & sender
│   ├── verification.ts     # 5-layer verification state machine
│   └── fees.ts             # Fee calculation logic
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles

prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Development seed data
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Supabase)
- Clerk account
- Paystack account
- Cloudinary account
- Prembly/IdentityPass account
- Termii account

### Installation

```bash
# Clone and install dependencies
cd propati-nextjs
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start development server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Supabase pooler) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `PAYSTACK_SECRET_KEY` | Paystack secret key |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials |
| `PREMBLY_API_KEY` | IdentityPass/Prembly API key |
| `TERMII_API_KEY` / `TERMII_SENDER_ID` | Termii SMS credentials |
| `SMTP_*` | Email SMTP configuration |

## 📋 Available Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run test             # Run Vitest tests
npm run test:ui          # Run Vitest with UI
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations (dev)
npm run prisma:migrate:prod # Deploy migrations (prod)
npm run prisma:studio    # Open Prisma Studio
npm run prisma:seed      # Seed database
npm run db:push          # Push schema changes
npm run db:reset         # Reset database
```

## 🗄️ Database Schema

The schema includes 24 tables covering:

- **Authentication**: Users, refresh tokens, password resets, phone OTPs
- **Listings**: Properties, images, saved listings, flags, verifications
- **Transactions**: Payments, escrow, fee calculations
- **Agreements**: Digital agreements, e-signatures, rent schedules
- **Messaging**: Conversations, messages, notifications
- **Organisations**: B2B estate management, teams, subscriptions, maintenance
- **Auxiliary**: Disputes, screening calls, email logs

See `DATABASE_SCHEMA.md` for complete documentation.

## 🔐 Authentication Flow

1. User signs up via Clerk (email/phone)
2. Clerk webhook creates/syncs user in database
3. User completes role-specific onboarding
4. Role-based dashboard access via middleware

## 💳 Payment Flow

1. User initiates payment → Paystack checkout
2. Webhook confirms payment → `in_escrow`
3. Agreement signed → Rent schedule generated
4. Admin releases escrow → Paystack transfer to payee
5. Receipt generated & emailed

## ✅ Verification System (5 Layers)

1. **Documents** - Title docs, survey plan, ID
2. **Identity** - NIN/BVN match via Prembly
3. **Video** - Live video with QR code
4. **Inspection** - Physical inspection by PROPATI agent
5. **Certification** - Admin final approval → Certified badge

## 🏢 Estate Manager Features

- Portfolio & unit management
- Rent ledger & collection
- Maintenance ticket system (Kanban)
- Team management with roles
- Subscription billing (Paystack)
- Reports & analytics

## 🧪 Testing

```bash
# Unit & integration tests
npm run test

# E2E tests (requires dev server running)
npx playwright test
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect repository to Vercel
2. Add environment variables
3. Deploy automatically on push to main

### Database Migrations

```bash
# Production
npm run prisma:migrate:prod
```

## 📄 License

Proprietary - PROPATI 2024

---

Built with ❤️ for the Nigerian property market.