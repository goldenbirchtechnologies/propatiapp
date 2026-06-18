import { User as ClerkUser } from '@clerk/nextjs/server';
import { UserRole as Role, AgentTier } from '@prisma/client';

// Extend Clerk's User type with our custom metadata
declare module '@clerk/nextjs/server' {
  interface UserPublicMetadata {
    role?: Role;
    ninVerified?: boolean;
    phoneVerified?: boolean;
    idVerified?: boolean;
    profileCompleted?: boolean;
    agentTier?: AgentTier;
    agentApproved?: boolean;
    agentAreas?: string[];
  }

  interface UserPrivateMetadata {
    // Private metadata (not exposed to client)
  }

  interface UserUnsafeMetadata {
    // Unsafe metadata (can be modified from client)
  }
}

// Custom session claims
declare module '@clerk/nextjs/server' {
  interface SessionClaims {
    metadata: UserPublicMetadata & {
      role: Role;
    };
  }
}

// NextAuth-like user type for our app
export interface AppUser {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl: string | null;
  phone: string | null;
  ninVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  profileCompleted: boolean;
  agentTier: AgentTier;
  agentApproved: boolean;
  agentBio: string | null;
  agentAreas: string[] | null;
  isActive: boolean;
  isBanned: boolean;
  organizations: AppOrganization[];
}

export interface AppOrganization {
  id: string;
  name: string;
  role: string;
  status: string;
  planTier: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Webhook event types
export interface ClerkWebhookEvent {
  type: string;
  data: Record<string, unknown>;
  object: 'event';
}

export interface PaystackWebhookEvent {
  event: string;
  data: Record<string, unknown>;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

// Dashboard stats types
export interface DashboardStats {
  totalUsers?: number;
  totalListings?: number;
  totalTransactions?: number;
  totalRevenue?: number;
  pendingVerifications?: number;
  openFlags?: number;
  openDisputes?: number;
  propertiesCount?: number;
  activeListings?: number;
  pendingPayments?: number;
}

// Form types
export interface OnboardingFormData {
  firstName: string;
  lastName: string;
  phone: string;
  // Tenant fields
  employmentStatus?: string;
  employmentType?: string;
  employerName?: string;
  jobTitle?: string;
  yearlyIncome?: number;
  // Landlord fields
  companyName?: string;
  bio?: string;
  // Agent fields
  agentBio?: string;
  agentAreas?: string;
  // Estate Manager fields
  orgName?: string;
  billingEmail?: string;
  orgAddress?: string;
  cacNumber?: string;
}