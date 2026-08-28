import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse as _ApiResponse, PaginatedResponse as _PaginatedResponse } from '@/types';
export type { ApiResponse, PaginatedResponse } from '@/types';
// Re-export validator types so hooks can import from a single place
export type {
  CreateUserInput,
  UpdateUserInput,
  CreateListingInput,
  UpdateListingInput,
  ListingFilters,
  InitiatePaymentInput,
  CreateAgreementInput,
  UpdateAgreementInput,
  SignAgreementInput,
  CreateConversationInput,
  SendMessageInput,
  CreateOrganisationInput,
  UpdateOrganisationInput,
  InviteOrgMemberInput,
  CreateMaintenanceTicketInput,
  UpdateMaintenanceTicketInput,
  ScheduleScreeningInput,
  UpdateScreeningInput,
  CreateDisputeInput,
  OnboardingFormData,
} from '@/lib/validators';
type ApiResponse<T = unknown> = _ApiResponse<T>;
type PaginatedResponse<T> = _PaginatedResponse<T>;

declare global {
  interface Window {
    __CLERK_TOKEN__: string | null;
    Clerk?: { session?: { getToken: () => Promise<string> } };
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      withCredentials: true,
    });
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (typeof window !== 'undefined' && window.__CLERK_TOKEN__) {
          config.headers.Authorization = `Bearer ${window.__CLERK_TOKEN__}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }
          originalRequest._retry = true;
          this.isRefreshing = true;
          try {
            const token = await this.getFreshToken();
            this.failedQueue.forEach(({ resolve }) => resolve(token));
            this.failedQueue = [];
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError as Error));
            this.failedQueue = [];
            if (typeof window !== 'undefined') {
              window.location.href = '/sign-in';
            }
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        const standardizedError = this.standardizeError(error);
        return Promise.reject(standardizedError);
      }
    );
  }

  async getFreshToken(): Promise<string> {
    if (typeof window !== 'undefined' && window.Clerk?.session?.getToken) {
      const token = await window.Clerk.session.getToken();
      window.__CLERK_TOKEN__ = token;
      return token;
    }
    throw new Error('Unable to get fresh token');
  }

  initializeAuth(): void {
    if (typeof window !== 'undefined') {
      if (window.Clerk?.session?.getToken) {
        this.getFreshToken().catch(() => {});
      }
    }
  }

  private standardizeError(error: AxiosError): { message: string; status: number; details?: unknown | null; code?: string } {
    if (error.response) {
      const data = error.response.data as ApiResponse<unknown>;
      return {
        message: data?.error || data?.message || 'An error occurred',
        status: error.response.status,
        details: (data as Record<string, unknown> | null)?.details ?? null,
        code: error.code,
      };
    } else if (error.request) {
      return { message: 'Network error - please check your connection', status: 0, code: error.code };
    } else {
      return { message: error.message || 'An unexpected error occurred', status: 0, code: error.code };
    }
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data as Parameters<typeof this.client.post>[1]);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data as Parameters<typeof this.client.put>[1]);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data as Parameters<typeof this.client.patch>[1]);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  getAxiosInstance(): AxiosInstance {
    return this.client;
  }
}

export const api = new ApiClient();

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
  code?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ListingsFilters extends PaginationParams {
  listingType?: 'rent' | 'sale' | 'short_let' | 'share' | 'commercial';
  propertyType?: 'apartment' | 'house' | 'duplex' | 'land' | 'office' | 'shop' | 'warehouse';
  area?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  verificationTier?: 'basic' | 'verified' | 'inspected' | 'certified';
  status?: 'draft' | 'active' | 'suspended' | 'deleted';
}

export interface MessageFilters extends PaginationParams {
  conversationId: string;
  since?: string;
}

// Convenience API methods
// ─── Domain type aliases (re-exported for hook consumers) ───────────────────

export interface Listing {
  id: string;
  title: string;
  description?: string | null;
  listingType: string;
  propertyType?: string | null;
  address: string;
  area: string;
  state: string;
  price: number;
  pricePeriod?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  toilets?: number | null;
  status: string;
  verificationTier: string;
  landlordId: string;
  agentId?: string | null;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  publicId?: string | null;
  caption?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Verification {
  id: string;
  listingId: string;
  overallStatus: string;
  layer1Status: string;
  layer2Status?: string | null;
  verificationTier: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface Agreement {
  id: string;
  type: string;
  status: string;
  listingId: string;
  tenantId: string;
  landlordId: string;
  agentId?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  rentAmount?: number | null;
  monthlyRent?: number | null; // Legacy field - use rentAmount
  rentPeriod?: 'monthly' | 'quarterly' | 'annually' | null;
  cautionDeposit?: number | null;
  serviceCharge?: number | null;
  terms?: string | null;
  landlordSignedAt?: string | null;
  tenantSignedAt?: string | null;
  landlord?: { id: string; fullName: string; email: string; [key: string]: unknown };
  tenant?: { id: string; fullName: string; email: string; [key: string]: unknown };
  listing?: {
    id: string;
    title: string;
    address: string;
    photos?: string[];
    bedrooms?: number;
    bathrooms?: number;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface AgreementSignature {
  id: string;
  agreementId: string;
  userId: string;
  signedAt: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  listingId?: string | null;
  isArchived: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
  participants: unknown[];
  lastMessage?: Message | null;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string | null;
  createdAt: string;
  [key: string]: unknown;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  listingId?: string | null;
  payerId: string;
  payeeId: string;
  reference?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  escrowBalance: number;
  currency: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string | null;
  phone?: string | null;
  ninVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  profileCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  [key: string]: unknown;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
}

export interface UserOrganization {
  id: string;
  name: string;
  role: string;
  status: string;
  planTier: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  planTier: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface OrgMember {
  id: string;
  orgId: string;
  userId: string;
  role: string;
  status: string;
  invitedAt: string;
  joinedAt?: string | null;
  [key: string]: unknown;
}

export interface OrgInvite {
  id: string;
  orgId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface AgentInvite {
  id: string;
  landlordId: string;
  agentId?: string | null;
  email: string;
  token: string;
  status: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  createdAt: string;
  sender?: UserSummary | null;
  recipient?: UserSummary | null;
}

export interface MaintenanceTicket {
  id: string;
  listingId: string;
  reportedById: string;
  assignedToId?: string | null;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface ScreeningCall {
  id: string;
  listingId: string;
  landlordId: string;
  tenantId: string;
  scheduledAt: string;
  status: string;
  meetingUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  [key: string]: unknown;
}

export interface Dispute {
  id: string;
  transactionId: string;
  raisedById: string;
  againstId: string;
  type: string;
  status: string;
  description: string;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

// ─── API endpoint methods ────────────────────────────────────────────────────

export const apiEndpoints = {
  listings: {
    getAll: (params?: ListingsFilters) => api.get<PaginatedResponse<any>>('/listings', params),
    getById: (id: string) => api.get<any>(`/listings/${id}`),
    getMyListings: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/listings/mine', params),
    getSaved: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/listings/saved', params),
    create: (data: any) => api.post<any>('/listings', data),
    update: (id: string, data: any) => api.patch<any>(`/listings/${id}`, data),
    delete: (id: string) => api.delete<void>(`/listings/${id}`),
    save: (listingId: string) => api.post<void>(`/listings/${listingId}/save`),
    unsave: (listingId: string) => api.delete<void>(`/listings/${listingId}/save`),
    flag: (listingId: string, data: any) => api.post<void>(`/listings/${listingId}/flag`, data),
  },
  verifications: {
    // Core management
    start: (listingId: string) => api.post<any>('/verification/start', { listingId }),
    getById: (id: string) => api.get<any>(`/verification/${id}`),
    getStatus: (id: string) => api.get<any>(`/verification/${id}/status`),
    getMy: (params?: { status?: string; listingId?: string }) => api.get<any>('/verification/my', params),
    update: (id: string, data: any) => api.patch<any>(`/verification/${id}`, data),
    cancel: (id: string) => api.delete<void>(`/verification/${id}`),
    submitForReview: (id: string) => api.post<any>(`/verification/${id}/submit`),

    // Legacy layer endpoints (by listing ID)
    getStatusByListing: (listingId: string) => api.get<any>(`/verification/${listingId}/status`),
    getAdminQueue: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/verification/queue', params),
    submitLayer1: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/layer1`, data),
    submitLayer2: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/layer2`, data),
    confirmLayer2: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/layer2/confirm`, data),
    uploadVideo: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/video`, data),
    requestInspection: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/inspection`, data),
    adminReview: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/review`, data),
  },
  agreements: {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/agreements', params),
    getById: (id: string) => api.get<any>(`/agreements/${id}`),
    getByListing: (listingId: string) => api.get<any>(`/agreements/listing/${listingId}`),
    create: (data: any) => api.post<any>('/agreements', data),
    update: (id: string, data: any) => api.patch<any>(`/agreements/${id}`, data),
    sign: (id: string, data: any) => api.post<any>(`/agreements/${id}/sign`, data),
    terminate: (id: string) => api.post<any>(`/agreements/${id}/terminate`),
    preview: (id: string) => api.get<any>(`/agreements/${id}/preview`),
  },
  messages: {
    getConversations: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/conversations', params),
    createConversation: (data: any) => api.post<any>('/conversations', data),
    getMessages: (params: { conversationId: string; limit?: number } | any) => {
      const conversationId = (params as { conversationId: string }).conversationId;
      return api.get<any>(`/conversations/${conversationId}/messages`, params);
    },
    sendMessage: (data: { conversationId: string; content: string; attachmentUrl?: string; attachmentType?: 'image' | 'document' | 'video' }) => api.post<any>(`/conversations/${data.conversationId}/messages`, data),
    createConversation: (data: any) => api.post<any>('/conversations', data),
    markAsRead: (conversationId: string) => api.post<any>(`/conversations/${conversationId}/mark-read`, {}),
    archiveConversation: (conversationId: string) => api.post<any>(`/conversations/${conversationId}/mark-read`, { action: 'archive' }),
    blockConversation: (conversationId: string) => api.post<any>(`/conversations/${conversationId}/mark-read`, { action: 'block' }),
  },
  payments: {
    getTransactions: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/payments/transactions', params),
    getTransaction: (id: string) => api.get<any>(`/payments/transactions/${id}`),
    initiate: (data: any) => api.post<any>('/payments/initiate', data),
    verify: (reference: string) => api.get<any>(`/payments/verify/${reference}`),
    releaseEscrow: (id: string, data: any) => api.post<any>(`/payments/release-escrow/${id}`, data),
    getReceipt: (id: string) => api.get<any>(`/payments/transactions/${id}/receipt`),
  },
  users: {
    getProfile: () => api.get<any>('/users/me/profile'),
    getById: (id: string) => api.get<any>(`/users/${id}`),
    updateProfile: (data: any) => api.patch<any>('/users/me/profile', data),
    completeOnboarding: (data: any) => api.post<any>('/users/me/onboarding', data),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post<any>('/users/me/avatar', formData);
    },
    verifyPhone: (data: any) => api.post<any>('/users/me/verify/phone', data),
    requestPhoneOTP: (phone: string) => api.post<any>('/users/me/verify/phone/request', { phone }),
    verifyNIN: (data: any) => api.post<any>('/users/me/verify/nin', data),
    verifyBVN: (data: any) => api.post<any>('/users/me/verify/bvn', data),
    getNotifications: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/users/me/notifications', params),
    markNotificationRead: (id: string) => api.patch<any>(`/users/me/notifications/${id}/read`),
  },
  organizations: {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/orgs', params),
    create: (data: any) => api.post<any>('/orgs', data),
    getById: (id: string) => api.get<any>(`/orgs/${id}`),
    update: (id: string, data: any) => api.patch<any>(`/orgs/${id}`, data),
    delete: (id: string) => api.delete<void>(`/orgs/${id}`),
    getMembers: (orgId: string) => api.get<any>(`/orgs/${orgId}/members`),
    getListings: (orgId: string, params?: PaginationParams) => api.get<PaginatedResponse<any>>(`/orgs/${orgId}/listings`, params),
    inviteMember: (data: any) => api.post<any>(`/orgs/${data.orgId}/members/invite`, data),
    acceptInvite: (token: string) => api.post<any>('/orgs/invites/accept', { token }),
    removeMember: (orgId: string, userId: string) => api.delete<void>(`/orgs/${orgId}/members/${userId}`),
    updateMemberRole: (orgId: string, userId: string, role: string) => api.patch<any>(`/orgs/${orgId}/members/${userId}`, { role }),
    addListing: (orgId: string, listingId: string) => api.post<any>(`/orgs/${orgId}/listings`, { listingId }),
    removeListing: (orgId: string, listingId: string) => api.delete<void>(`/orgs/${orgId}/listings/${listingId}`),
  },
  maintenance: {
    getTickets: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/maintenance', params),
    getTicket: (id: string) => api.get<any>(`/maintenance/${id}`),
    create: (data: any) => api.post<any>('/maintenance', data),
    update: (id: string, data: any) => api.patch<any>(`/maintenance/${id}`, data),
    assign: (ticketId: string, userId: string) => api.patch<any>(`/maintenance/${ticketId}/assign`, { userId }),
  },
  screenings: {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/screenings', params),
    getById: (id: string) => api.get<any>(`/screenings/${id}`),
    schedule: (data: any) => api.post<any>('/screenings', data),
    update: (id: string, data: any) => api.patch<any>(`/screenings/${id}`, data),
  },
  disputes: {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/disputes', params),
    getById: (id: string) => api.get<any>(`/disputes/${id}`),
    create: (data: any) => api.post<any>('/disputes', data),
    adminAction: (disputeId: string, data: any) => api.post<any>(`/disputes/${disputeId}/action`, data),
  },
  agentInvites: {
    list: (params?: PaginationParams) => api.get<PaginatedResponse<AgentInvite>>('/agent-invites', params),
    create: (data: { email: string; permissions?: string[]; scope?: string; listingIds?: string[] }) => api.post<AgentInvite>('/agent-invites', data),
    accept: (id: string) => api.post<any>(`/agent-invites/${id}/accept`, {}),
    revoke: (id: string) => api.post<any>(`/agent-invites/${id}/revoke`, {}),
  },
  invoices: {
    list: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/invoices', params),
    getById: (id: string) => api.get<any>(`/invoices/${id}`),
    create: (data: any) => api.post<any>('/invoices', data),
    update: (id: string, data: any) => api.patch<any>(`/invoices/${id}`, data),
    send: (id: string) => api.post<any>(`/invoices/${id}/send`, {}),
    markPaid: (id: string) => api.post<any>(`/invoices/${id}/mark-paid`, {}),
    receipt: (id: string) => api.get<any>(`/invoices/${id}/receipt`),
  },
  tenants: {
    getAll: (orgId: string) => api.get<any>(`/dashboard/estate-manager/tenants?orgId=${encodeURIComponent(orgId)}`),
  },
};