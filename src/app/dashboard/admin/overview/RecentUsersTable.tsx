'use client';

import { DataTable, Avatar } from '@/components/ui';

type RecentUser = {
  id: string;
  fullName: string | null;
  email: string;
  role: string;
  createdAt: Date | string;
};

export default function RecentUsersTable({ users }: { users: RecentUser[] }) {
  return (
    <DataTable
      columns={[
        {
          key: 'fullName',
          label: 'User',
          render: (row) => (
            <div className="flex items-center gap-3">
              <Avatar name={String(row.fullName || '')} size="sm" />
              <div>
                <div className="text-zinc-900 dark:text-white text-sm font-medium">{String(row.fullName)}</div>
                <div className="text-zinc-600 text-xs">{String(row.email)}</div>
              </div>
            </div>
          ),
        },
        {
          key: 'role',
          label: 'Role',
          render: (row) => (
            <span className="capitalize text-zinc-600 dark:text-zinc-400">{String(row.role).replace('_', ' ')}</span>
          ),
        },
        {
          key: 'createdAt',
          label: 'Joined',
          render: (row) => (
            <span className="text-zinc-600 dark:text-zinc-400">
              {new Date(String(row.createdAt)).toLocaleDateString('en-NG', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          ),
        },
      ]}
      data={users as unknown as Record<string, unknown>[]}
    />
  );
}