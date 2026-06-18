import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, PaginatedResponse } from '@/types';

declare global {
  interface Window {
    __CLERK_TOKEN__: string | null;
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
    if (typeof window !== 'undefined' && (window as unknown as { Clerk?: { session?: { getToken: () => Promise<string> } } }).Clerk?.session?.getToken) {
      const token = await (window as unknown as { Clerk: { session: { getToken: () => Promise<string> } } }).Clerk.session.getToken();
      window.__CLERK_TOKEN__ = token;
      return token;
    }
    throw new Error('Unable to get fresh token');
  }

  initializeAuth(): void {
    if (typeof window !== 'undefined') {
      if ((window as unknown as { Clerk?: { session?: { getToken: () => Promise<string> } } }).Clerk?.session?.getToken) {
        this.getFreshToken().catch(() => {});
      }
    }
  }

  private standardizeError(error: AxiosError): { message: string; status: number; details?: unknown; code?: string } {
    if (error.response) {
      const data = error.response.data as ApiResponse<unknown>;
      return {
        message: data?.error || data?.message || 'An error occurred',
        status: error.response.status,
        details: data?.details,
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
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<T>(url, data);
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
export const apiEndpoints = {
  listings: {
    getAll: (params?: ListingsFilters) => api.get<PaginatedResponse<any>>('/listings', params),
    getById: (id: string) => api.get<any>(`/listings/${id}`),
    create: (data: any) => api.post<any>('/listings', data),
    update: (id: string, data: any) => api.patch<any>(`/listings/${id}`, data),
    delete: (id: string) => api.delete<void>(`/listings/${id}`),
    save: (listingId: string) => api.post<void>(`/listings/${listingId}/save`),
    flag: (listingId: string, data: any) => api.post<void>(`/listings/${listingId}/flag`, data),
  },
  verifications: {
    getStatus: (listingId: string) => api.get<any>(`/verification/${listingId}/status`),
    submitLayer1: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/layer1`, data),
    submitLayer2: (listingId: string, data: any) => api.post<any>(`/verification/${listingId}/layer2`, data),
  },
  agreements: {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/agreements', params),
    getById: (id: string) => api.get<any>(`/agreements/${id}`),
    create: (data: any) => api.post<any>('/agreements', data),
    sign: (id: string, data: any) => api.post<any>(`/agreements/${id}/sign`, data),
    preview: (id: string) => api.get<any>(`/agreements/${id}/preview`),
  },
  messages: {
    getConversations: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/messages', params),
    createConversation: (data: any) => api.post<any>('/messages', data),
    getMessages: (conversationId: string, params?: MessageFilters) => api.get<any>(`/messages/${conversationId}`, params),
    sendMessage: (conversationId: string, data: any) => api.post<any>(`/messages/${conversationId}`, data),
  },
  payments: {
    getTransactions: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/payments', params),
    initiate: (data: any) => api.post<any>('/payments', data),
    verify: (id: string) => api.post<any>(`/payments/${id}/verify`),
    releaseEscrow: (id: string) => api.post<any>(`/payments/${id}/release`),
  },
  users: {
    getProfile: () => api.get<any>('/users/me/profile'),
    updateProfile: (data: any) => api.patch<any>('/users/me/profile', data),
    getNotifications: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/users/me/notifications', params),
    markNotificationRead: (id: string) => api.patch<any>(`/users/me/notifications/${id}/read`),
  },
  organizations: {
    getAll: (params?: PaginationParams) => api.get<PaginatedResponse<any>>('/orgs', params),
    create: (data: any) => api.post<any>('/orgs', data),
    getById: (id: string) => api.get<any>(`/orgs/${id}`),
    update: (id: string, data: any) => api.patch<any>(`/orgs/${id}`, data),
    delete: (id: string) => api.delete<void>(`/orgs/${id}`),
  },
};