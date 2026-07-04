'use client';

import { ReactNode } from 'react';

interface ProfileShellProps {
  navigation: { label: string; href: string; icon?: ReactNode }[];
  userRole: string;
  userName: string;
  children: ReactNode;
}

export default function ProfileShell({ navigation, userRole, userName, children }: ProfileShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="flex">
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[var(--bg-raised)] border-r border-[var(--border-default)]">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center gap-2 px-4 mb-6">
              <div className="h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-[var(--on-primary)] font-bold">P</div>
              <span className="font-display font-bold text-lg text-[var(--text-primary)]">Propati</span>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] transition-colors"
                >
                  {item.icon && <span className="h-5 w-5">{item.icon}</span>}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 lg:pl-64">
          <div className="py-8 px-6 lg:px-10 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
