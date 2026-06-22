# PROPATI — Testing Guide

**Version:** 1.0  
**Stack:** Vitest (unit/integration) · Playwright (E2E) · Prisma (test DB) · MSW (API mocking)

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Test Types and When to Use Them](#2-test-types-and-when-to-use-them)
3. [Vitest Setup](#3-vitest-setup)
4. [Writing Unit Tests](#4-writing-unit-tests)
5. [Writing Integration Tests](#5-writing-integration-tests)
6. [Playwright E2E Setup](#6-playwright-e2e-setup)
7. [Writing E2E Tests](#7-writing-e2e-tests)
8. [Test Data and Seeding](#8-test-data-and-seeding)
9. [Mocking Patterns](#9-mocking-patterns)
10. [CI Gates](#10-ci-gates)
11. [Coverage Targets](#11-coverage-targets)

---

## 1. Testing Philosophy

Test the contract, not the implementation. A good test breaks when behaviour changes, not when code is refactored.

**Priority order:**
1. Business logic (verification state machine, payment fee calculation, agreement signing)
2. API route auth + validation (security layer)
3. Critical user journeys E2E (listing, verification submission, payment)
4. UI components (only when they have non-trivial logic)

Don't test:
- Framework behaviour (Prisma generating correct SQL, Next.js routing)
- Third-party services (test against their sandbox, not mocks)
- Implementation details (private functions, internal state)

---

## 2. Test Types and When to Use Them

| Type | Tool | Use For | Speed |
|------|------|---------|-------|
| **Unit** | Vitest | Pure functions, business logic, utility functions | < 1ms |
| **Integration** | Vitest + Prisma | API route handlers with real DB | 10–100ms |
| **E2E** | Playwright | Critical user journeys through the browser | 1–30s |

### File Naming

```
src/lib/income.ts         → src/lib/income.test.ts
src/app/api/listings/     → src/app/api/listings/route.test.ts
e2e/listing-creation.spec.ts
```

---

## 3. Vitest Setup

### 3.1 Install Dependencies

```bash
pnpm add -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event
pnpm add -D @testing-library/jest-dom msw happy-dom
```

### 3.2 vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['src/test/**', '**/*.config.*', 'prisma/**'],
    },
  },
});
```

### 3.3 src/test/setup.ts

```typescript
import '@testing-library/jest-dom';
import { server } from './msw-server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 3.4 package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "type-check": "tsc --noEmit"
  }
}
```

---

## 4. Writing Unit Tests

### 4.1 Business Logic: Income Banding

```typescript
// src/lib/income.test.ts
import { toIncomeBand } from './income';

describe('toIncomeBand', () => {
  it('returns the correct band for each bracket', () => {
    expect(toIncomeBand(800_000n)).toBe('Below ₦1.2M/yr');
    expect(toIncomeBand(1_200_000n)).toBe('₦1.2M–₦3M/yr');
    expect(toIncomeBand(2_999_999n)).toBe('₦1.2M–₦3M/yr');
    expect(toIncomeBand(3_000_000n)).toBe('₦3M–₦6M/yr');
    expect(toIncomeBand(12_000_000n)).toBe('₦12M+/yr');
  });
});
```

### 4.2 Business Logic: Fee Computation

```typescript
// src/lib/fees.test.ts
import { computePlatformFee, computeAgentCommission } from './fees';

describe('computePlatformFee', () => {
  it('charges 10% for rent transactions', () => {
    expect(computePlatformFee(1_000_000n, 'rent')).toBe(100_000n);
  });

  it('charges 2% for sale transactions', () => {
    expect(computePlatformFee(50_000_000n, 'sale')).toBe(1_000_000n);
  });

  it('returns BigInt, not number', () => {
    const fee = computePlatformFee(500_000n, 'rent');
    expect(typeof fee).toBe('bigint');
  });
});
```

### 4.3 Business Logic: Verification State Machine

```typescript
// src/lib/verification.test.ts
import { canAdvanceToLayer, getNextLayer } from './verification';

describe('canAdvanceToLayer', () => {
  it('allows layer 2 only when layer 1 is approved', () => {
    expect(canAdvanceToLayer({ l1Status: 'approved', currentLayer: 1 }, 2)).toBe(true);
    expect(canAdvanceToLayer({ l1Status: 'pending', currentLayer: 1 }, 2)).toBe(false);
  });

  it('blocks layer 4 when layer 3 is pending', () => {
    const state = { l1Status: 'approved', l2Status: 'approved', l3Status: 'pending', currentLayer: 3 };
    expect(canAdvanceToLayer(state, 4)).toBe(false);
  });
});
```

### 4.4 Utility: Encryption Round-Trip

```typescript
// src/lib/encryption.test.ts
import { encrypt, decrypt, hmac } from './encryption';

describe('AES-256-GCM', () => {
  it('round-trips plaintext correctly', () => {
    const plaintext = '12345678901'; // NIN
    expect(decrypt(encrypt(plaintext))).toBe(plaintext);
  });

  it('each encryption produces a unique ciphertext (different IVs)', () => {
    const a = encrypt('12345678901');
    const b = encrypt('12345678901');
    expect(a).not.toBe(b); // different IVs → different ciphertext
  });

  it('hmac is deterministic', () => {
    expect(hmac('12345678901')).toBe(hmac('12345678901'));
  });

  it('hmac differs from encryption (uses different key)', () => {
    expect(hmac('12345678901')).not.toBe(encrypt('12345678901'));
  });
});
```

---

## 5. Writing Integration Tests

Integration tests run API route handlers against a real test database (isolated from staging/production).

### 5.1 Test Database Setup

```bash
# Create a test-specific .env.test.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/propati_test
DIRECT_URL=postgresql://postgres:password@localhost:5432/propati_test

# Create and migrate the test DB
NODE_ENV=test pnpm prisma migrate deploy
NODE_ENV=test pnpm prisma db seed
```

For CI, use a Supabase test project or a local Postgres via Docker:
```yaml
# .github/workflows/ci.yml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_DB: propati_test
      POSTGRES_PASSWORD: testpassword
    ports:
      - 5432:5432
```

### 5.2 API Route Integration Test Pattern

```typescript
// src/app/api/listings/route.test.ts
import { POST } from './route';
import { prisma } from '@/lib/prisma';
import { createMockAuth } from '@/test/helpers';

// Reset DB state between tests
beforeEach(async () => {
  await prisma.listing.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/listings', () => {
  it('creates a listing for authenticated landlord', async () => {
    const { req } = createMockAuth('landlord', {
      body: {
        title: 'Test Flat',
        listingType: 'rent',
        propertyType: 'apartment',
        address: '1 Test Street',
        area: 'Lekki',
        state: 'Lagos',
        price: 500000,
      }
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.data.id).toBeTruthy();
    expect(data.data.status).toBe('draft');
  });

  it('rejects unauthenticated requests', async () => {
    const req = new Request('http://localhost/api/listings', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 422 for invalid body', async () => {
    const { req } = createMockAuth('landlord', {
      body: { title: 'X' }, // too short
    });

    const res = await POST(req);
    expect(res.status).toBe(422);

    const data = await res.json();
    expect(data.code).toBe('VALIDATION_ERROR');
    expect(data.details.fieldErrors.title).toBeDefined();
  });

  it('rejects tenant creating a listing', async () => {
    const { req } = createMockAuth('tenant', {
      body: { title: 'Test Flat', listingType: 'rent' },
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });
});
```

### 5.3 Test Helper: createMockAuth

```typescript
// src/test/helpers.ts
import { User } from '@prisma/client';

type Role = 'landlord' | 'tenant' | 'agent' | 'admin' | 'estate_manager';

export function createMockAuth(role: Role, opts?: { body?: object }) {
  // Creates a mock user and Request that withAuth() will accept
  const user: Partial<User> = {
    id: `test_${role}_id`,
    clerkId: `user_test_${role}`,
    role,
    isActive: true,
    isBanned: false,
  };

  // Mock Clerk auth to return this user
  vi.mock('@clerk/nextjs/server', () => ({
    auth: () => ({ userId: user.clerkId }),
  }));

  // Mock Prisma lookup of user
  vi.mock('@/lib/prisma', async () => {
    const real = await vi.importActual('@/lib/prisma');
    return {
      ...real,
      prisma: {
        ...(real as any).prisma,
        user: { findUnique: vi.fn().mockResolvedValue(user) },
      },
    };
  });

  const req = new Request('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: opts?.body ? JSON.stringify(opts.body) : undefined,
  });

  return { req, user };
}
```

---

## 6. Playwright E2E Setup

### 6.1 Install

```bash
pnpm add -D @playwright/test
pnpm exec playwright install --with-deps chromium
```

### 6.2 playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### 6.3 Page Object Model

```typescript
// e2e/pages/auth.ts
import { Page } from '@playwright/test';

export class AuthPage {
  constructor(private page: Page) {}

  async signIn(email: string, password: string) {
    await this.page.goto('/sign-in');
    await this.page.fill('[name="identifier"]', email);
    await this.page.click('button:has-text("Continue")');
    await this.page.fill('[name="password"]', password);
    await this.page.click('button:has-text("Continue")');
    await this.page.waitForURL('/dashboard');
  }

  async signOut() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('text=Sign out');
    await this.page.waitForURL('/');
  }
}
```

---

## 7. Writing E2E Tests

### 7.1 Critical Journey: Listing Search and View

```typescript
// e2e/listings.spec.ts
import { test, expect } from '@playwright/test';

test('anonymous user can search and view a listing', async ({ page }) => {
  await page.goto('/listings');

  // Search
  await page.fill('[data-testid="search-area"]', 'Lekki');
  await page.click('[data-testid="search-button"]');

  // Should show results
  await expect(page.locator('[data-testid="listing-card"]')).toHaveCount({ min: 1 });

  // Click first listing
  await page.locator('[data-testid="listing-card"]').first().click();
  await expect(page).toHaveURL(/\/listings\//);

  // Key elements should be visible
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('[data-testid="listing-price"]')).toBeVisible();
  await expect(page.locator('[data-testid="verification-badge"]')).toBeVisible();
});
```

### 7.2 Critical Journey: Landlord Creates Listing

```typescript
// e2e/create-listing.spec.ts
import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth';

test('landlord can create a listing', async ({ page }) => {
  const auth = new AuthPage(page);
  await auth.signIn('landlord@propati.test', process.env.TEST_LANDLORD_PASSWORD!);

  await page.goto('/dashboard/listings/new');
  await page.fill('[name="title"]', 'Test 3-Bed Flat, Lekki');
  await page.selectOption('[name="listingType"]', 'rent');
  await page.selectOption('[name="propertyType"]', 'apartment');
  await page.fill('[name="address"]', '14 Test Street, Lekki Phase 1');
  await page.fill('[name="area"]', 'Lekki Phase 1');
  await page.fill('[name="price"]', '800000');
  await page.selectOption('[name="bedrooms"]', '3');

  await page.click('[data-testid="submit-listing"]');

  await expect(page).toHaveURL(/\/dashboard\/listings\//);
  await expect(page.locator('[data-testid="listing-status"]')).toHaveText('Draft');
});
```

### 7.3 Critical Journey: Tenant Sends Message

```typescript
// e2e/messaging.spec.ts
import { test, expect } from '@playwright/test';

test('tenant can message a landlord about a listing', async ({ page }) => {
  // Sign in as tenant
  await page.goto('/sign-in');
  await page.fill('[name="identifier"]', 'tenant@propati.test');
  // ... complete sign in

  // Navigate to a listing
  await page.goto('/listings/test-listing-id');
  await page.click('[data-testid="contact-landlord"]');

  // Message dialog appears
  await expect(page.locator('[data-testid="message-dialog"]')).toBeVisible();
  await page.fill('[data-testid="message-input"]', 'Hi, is this property still available?');
  await page.click('[data-testid="send-message"]');

  // Confirmation
  await expect(page.locator('[data-testid="message-sent-confirmation"]')).toBeVisible();
});
```

---

## 8. Test Data and Seeding

### 8.1 Seed File

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const admin = await prisma.user.upsert({
    where: { clerkId: 'user_test_admin' },
    update: {},
    create: {
      clerkId: 'user_test_admin',
      email: 'admin@propati.test',
      fullName: 'Test Admin',
      role: 'admin',
      isActive: true,
    },
  });

  // Landlord with verified listing
  const landlord = await prisma.user.upsert({
    where: { clerkId: 'user_test_landlord' },
    update: {},
    create: {
      clerkId: 'user_test_landlord',
      email: 'landlord@propati.test',
      fullName: 'Emeka Test',
      role: 'landlord',
      ninVerified: true,
      isActive: true,
    },
  });

  await prisma.listing.upsert({
    where: { id: 'test-listing-id' },
    update: {},
    create: {
      id: 'test-listing-id',
      title: '3-Bed Test Flat, Lekki',
      listingType: 'rent',
      propertyType: 'apartment',
      address: '1 Test Crescent, Lekki Phase 1',
      area: 'Lekki Phase 1',
      state: 'Lagos',
      price: 800000n,
      bedrooms: 3,
      bathrooms: 3,
      verificationTier: 'certified',
      status: 'active',
      ownerId: landlord.id,
    },
  });

  // Tenant
  await prisma.user.upsert({
    where: { clerkId: 'user_test_tenant' },
    update: {},
    create: {
      clerkId: 'user_test_tenant',
      email: 'tenant@propati.test',
      fullName: 'Adaeze Test',
      role: 'tenant',
      phoneVerified: true,
      isActive: true,
    },
  });

  console.log('Seed complete');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

### 8.2 Seed Command

```bash
pnpm prisma db seed
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node --transpile-only prisma/seed.ts"
  }
}
```

---

## 9. Mocking Patterns

### 9.1 Prembly Mock Mode

Set `PREMBLY_API_KEY=mock` in `.env.test.local`. The Prembly client returns a fixed response:

```typescript
// src/lib/prembly.ts
export async function lookupNIN(nin: string) {
  if (process.env.PREMBLY_API_KEY === 'mock') {
    if (nin === '12345678901') {
      return { found: true, name: 'TEST USER', dateOfBirth: '1985-01-01', gender: 'male', matchToken: 'mock_token' };
    }
    return { found: false };
  }
  // Real Prembly API call...
}
```

### 9.2 Paystack Mock

Paystack provides Test mode keys (`sk_test_xxx`, `pk_test_xxx`). Use these in local and staging environments. No mocking needed — Paystack Test mode simulates the full payment flow.

Test card numbers (Paystack):
```
Success: 4084080000005408
Declined: 4084084084084081
```

### 9.3 SMS Mock

In tests, the SMS sending function checks `NODE_ENV`:

```typescript
// src/lib/sms.ts
export async function sendSMS(phone: string, message: string) {
  if (process.env.NODE_ENV === 'test') {
    // In tests, just record that SMS was "sent"
    console.log(`[TEST SMS] To: ${phone} | ${message}`);
    return { success: true, messageId: 'test_msg_id' };
  }
  // Real Termii API call...
}
```

For asserting SMS was called in integration tests:
```typescript
import * as sms from '@/lib/sms';
const spy = vi.spyOn(sms, 'sendSMS').mockResolvedValue({ success: true, messageId: 'mock' });
// ... run test ...
expect(spy).toHaveBeenCalledWith('08012345678', expect.stringContaining('rent'));
```

### 9.4 MSW for External APIs (Unit Tests)

```typescript
// src/test/msw-server.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('https://api.prembly.com/identitypass/verification/nin', () => {
    return HttpResponse.json({
      status: true,
      data: { nin: '12345678901', first_name: 'TEST', last_name: 'USER' }
    });
  }),
];

export const server = setupServer(...handlers);
```

---

## 10. CI Gates

The following must pass before a PR can merge:

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  checks:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env: { POSTGRES_PASSWORD: test, POSTGRES_DB: propati_test }
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm prisma migrate deploy
        env:
          DIRECT_URL: postgresql://postgres:test@localhost:5432/propati_test
          DATABASE_URL: postgresql://postgres:test@localhost:5432/propati_test
      - run: pnpm test --run --coverage
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/propati_test
          ENCRYPTION_KEY: 0000000000000000000000000000000000000000000000000000000000000000
          NIN_HMAC_KEY: 1111111111111111111111111111111111111111111111111111111111111111
          PREMBLY_API_KEY: mock
      - uses: codecov/codecov-action@v4
```

### Gate Summary

| Gate | Failure Blocks Merge? |
|------|----------------------|
| TypeScript compile | Yes |
| ESLint | Yes |
| Unit tests | Yes |
| Integration tests | Yes |
| E2E tests (on staging) | Yes (optional for feature branches, required for staging → main) |
| Coverage < 70% on new code | Warning only |

---

## 11. Coverage Targets

| Module | Target |
|--------|--------|
| `src/lib/` (business logic) | 90% |
| `src/app/api/` (API routes) | 80% |
| `src/components/` (UI) | 50% (logic-heavy components) |
| Overall | 70% |

Check coverage locally:
```bash
pnpm test:coverage
# Open coverage/index.html for visual report
```

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer

## Core Platform Concept
- Property marketplace (residential, commercial, industrial, short-let)
- Financial infrastructure (rent + booking payments)
- Legal infrastructure (law firm network)
- Identity verification system
- Property management system
- Enforcement and compliance layer
