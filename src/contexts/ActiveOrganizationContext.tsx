'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Organization } from '@/lib/api';

interface ActiveOrganizationContextValue {
  organization: Organization | null;
  organizations: Organization[];
  loading: boolean;
  setOrganization: (org: Organization | null) => void;
  refetch: () => void;
}

const ActiveOrganizationContext = createContext<ActiveOrganizationContextValue | undefined>(undefined);

const STORAGE_KEY = 'propati:activeOrgId';

export function ActiveOrganizationProvider({
  children,
  initialOrganizations = [],
  initialOrganization = null,
}: {
  children: ReactNode;
  initialOrganizations?: Organization[];
  initialOrganization?: Organization | null;
}) {
  const [organization, setOrganizationState] = useState<Organization | null>(initialOrganization);
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [loading, setLoading] = useState(false);

  // On mount, restore persisted org preference from localStorage
  useEffect(() => {
    if (initialOrganization) return;
    setLoading(true);
    const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (savedId && initialOrganizations.length > 0) {
      const saved = initialOrganizations.find((o) => o.id === savedId);
      if (saved) {
        setOrganizationState(saved);
        try { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, saved.id); } catch {}
      }
    } else if (initialOrganizations.length > 0) {
      const first = initialOrganizations[0];
      setOrganizationState(first);
      try { if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, first.id); } catch {}
    }
    setLoading(false);
  }, [initialOrganizations, initialOrganization]);

  const setOrganization = useCallback((org: Organization | null) => {
    setOrganizationState(org);
    try {
      if (typeof window !== 'undefined') {
        if (org) localStorage.setItem(STORAGE_KEY, org.id);
        else localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  }, []);

  const refetch = useCallback(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  }, []);

  return (
    <ActiveOrganizationContext.Provider
      value={{ organization, organizations, loading, setOrganization, refetch }}
    >
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

export function useActiveOrganization() {
  const ctx = useContext(ActiveOrganizationContext);
  if (!ctx) {
    throw new Error('useActiveOrganization must be used within an ActiveOrganizationProvider');
  }
  return ctx;
}

export function useActiveOrganizationId() {
  const { organization, loading } = useActiveOrganization();
  return { orgId: organization?.id ?? null, loading };
}
