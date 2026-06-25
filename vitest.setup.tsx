import { vi } from 'vitest';

// DOM-dependent polyfill — only load when jsdom is available
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@testing-library/jest-dom');
} catch {
  // ignore in node environment
}

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Clerk
vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ userId: 'test_user', isLoaded: true, isSignedIn: true }),
  useUser: () => ({ user: { id: 'test_user', fullName: 'Test User', primaryEmailAddress: { emailAddress: 'test@example.com' } } }),
  auth: () => ({ userId: 'test_user' }),
  currentUser: () => Promise.resolve({ id: 'test_user', fullName: 'Test User', emailAddresses: [{ emailAddress: 'test@example.com' }] }),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    listing: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    transaction: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn((fn) => fn(prisma)),
  },
}));

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_test_abc123');
vi.stubEnv('CLERK_SECRET_KEY', 'sk_test_abc123');
vi.stubEnv('DATABASE_URL', 'postgresql://test:test@localhost:5432/test');
vi.stubEnv('PAYSTACK_SECRET_KEY', 'sk_test_...');
vi.stubEnv('CLOUDINARY_CLOUD_NAME', 'test');
vi.stubEnv('PREMBLY_API_KEY', 'test');
vi.stubEnv('TERMII_API_KEY', 'test');