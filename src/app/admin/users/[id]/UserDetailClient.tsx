'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActionConfirmationDialog } from '@/components/admin/action-confirmation-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, DollarSign, Calendar, Ban, CheckCircle2, Mail, UserCog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@prisma/client';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  ownedListings: {
    id: string;
    title: string;
    propertyType: string;
    price: number;
    status: string;
    createdAt: Date;
  }[];
  participatedTransactions?: {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: Date;
  }[];
  _count: {
    ownedListings: number;
    participatedTransactions?: number;
  };
}

interface RevenueData {
  _sum: {
    amount: number | null;
    platformFee: number | null;
  };
}

interface UserDetailClientProps {
  user: UserData;
  revenueData: RevenueData;
  initialError?: string;
}

export default function UserDetailClient({ user: initialUser, revenueData, initialError }: UserDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(initialUser);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(initialError || null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'activate' | 'reset-password' | null;
  }>({ open: false, action: null });

  const handleAction = async (action: 'suspend' | 'activate' | 'reset-password', reason?: string) => {
    try {
      const endpoints: Record<string, string> = {
        suspend: `/api/admin/users/${user.id}/suspend`,
        activate: `/api/admin/users/${user.id}/activate`,
        'reset-password': `/api/admin/users/${user.id}/reset-password`,
      };

      const opts: RequestInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      };

      if (action === 'suspend') {
        opts.body = JSON.stringify({ reason });
      }

      const response = await fetch(endpoints[action], opts);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Failed to ${action} user`);
      }

      toast({ title: 'Success', description: `User ${action === 'suspend' ? 'suspended' : action === 'activate' ? 'activated' : 'reset email sent'} successfully` });

      if (action === 'suspend') setUser({ ...user, isActive: false });
      if (action === 'activate') setUser({ ...user, isActive: true });

      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : `Failed to ${action} user`,
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const handleChangeRole = async (newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/change-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to change role');
      }

      toast({ title: 'Success', description: 'User role updated successfully' });
      setUser({ ...user, role: newRole });
      router.refresh();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to change role',
        variant: 'destructive',
      });
      setError(err instanceof Error ? err.message : 'Failed to change role');
    }
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!actionDialog.action) return;

    if (actionDialog.action === 'suspend') {
      await handleAction('suspend', reason);
    } else if (actionDialog.action === 'activate') {
      await handleAction('activate');
    } else if (actionDialog.action === 'reset-password') {
      await handleAction('reset-password');
    }

    setActionDialog({ open: false, action: null });
  };

  const getRoleBadge = (role: UserRole) => {
    const roleMap: Record<string, string> = {
      landlord: 'tag-blue',
      tenant: 'tag-green',
      agent: 'tag-purple',
      admin: 'tag-red',
      estate_manager: 'tag-gold',
    };
    return roleMap[role] || 'tag-gray';
  };

  const accountAge = Math.floor(
    (new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const totalListings = user._count.ownedListings;
  const totalTransactions = user._count.participatedTransactions ?? 0;

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Details</h1>
            <p className="text-muted-foreground mt-1">View and manage user information</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">Unable to load page</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              router.refresh();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-border" />
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <button onClick={() => router.push('/admin/users')} className="hover:text-foreground">
                Users
              </button>
              <span>/</span>
              <span className="text-foreground font-medium truncate max-w-[200px]">{user.fullName}</span>
            </nav>
          </div>
          <div className="flex gap-2">
            <Badge className={user.isActive ? 'tag-green' : 'tag-red'}>
              {user.isActive ? 'Active' : 'Suspended'}
            </Badge>
            <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">
              Listings
              {totalListings > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{totalListings}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="transactions">
              Transactions
              {totalTransactions > 0 && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">{totalTransactions}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl text-white"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                  >
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
                      {user.fullName}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>{user.email}</p>
                    {user.phone && (
                      <p className="text-sm" style={{ color: 'var(--muted)' }}>{user.phone}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total Listings</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{totalListings}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total Transactions</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{totalTransactions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total Revenue</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                      ₦{((revenueData._sum.amount || 0) / 100).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Account Age</p>
                    <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>{accountAge} days</p>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCog className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                  <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Admin Actions</h3>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Change Role</span>
                    <Select value={user.role} onValueChange={(value) => handleChangeRole(value as UserRole)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenant">Tenant</SelectItem>
                        <SelectItem value="landlord">Landlord</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="estate_manager">Estate Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" onClick={() => setActionDialog({ open: true, action: 'reset-password' })}>
                      <Mail className="h-4 w-4 mr-2" />
                      Reset Password
                    </Button>
                    {user.isActive ? (
                      <Button variant="destructive" onClick={() => setActionDialog({ open: true, action: 'suspend' })}>
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend Account
                      </Button>
                    ) : (
                      <Button variant="outline" onClick={() => setActionDialog({ open: true, action: 'activate' })}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Activate Account
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings" className="mt-6">
            <div className="card p-6">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Recent Listings</h3>
              {user.ownedListings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Title</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Price</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.ownedListings.map((listing) => (
                        <tr key={listing.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                          <td className="p-3" style={{ color: 'var(--text)' }}>{listing.title}</td>
                          <td className="p-3" style={{ color: 'var(--text)' }}>{listing.propertyType}</td>
                          <td className="p-3" style={{ color: 'var(--text)' }}>₦{listing.price.toLocaleString()}</td>
                          <td className="p-3">
                            <Badge className="tag-green">{listing.status}</Badge>
                          </td>
                          <td className="p-3" style={{ color: 'var(--text)' }}>
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                  <div className="text-gray-400 mb-3">
                    <Building2 className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No listings found</h3>
                  <p className="mt-1 text-gray-500">This user has not created unknown property listings.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <div className="card p-6">
              <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Recent Transactions</h3>
              {user.participatedTransactions && user.participatedTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Amount</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                        <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user.participatedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                          <td className="p-3" style={{ color: 'var(--text)' }}>{transaction.type}</td>
                          <td className="p-3" style={{ color: 'var(--text)' }}>₦{(transaction.amount / 100).toLocaleString()}</td>
                          <td className="p-3">
                            <Badge className="tag-green">{transaction.status}</Badge>
                          </td>
                          <td className="p-3" style={{ color: 'var(--text)' }}>
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-12 text-center">
                  <div className="text-gray-400 mb-3">
                    <DollarSign className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No transactions found</h3>
                  <p className="mt-1 text-gray-500">This user has no transaction history yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ActionConfirmationDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, action: null })}
        title={
          actionDialog.action === 'suspend'
            ? 'Suspend User'
            : actionDialog.action === 'activate'
            ? 'Activate User'
            : 'Reset Password'
        }
        description={
          actionDialog.action === 'suspend'
            ? 'This will suspend the user account. Provide a reason for suspension.'
            : actionDialog.action === 'activate'
            ? 'This will reactivate the user account and restore access.'
            : 'Send a password reset email to the user?'
        }
        confirmText={
          actionDialog.action === 'suspend'
            ? 'Suspend'
            : actionDialog.action === 'activate'
            ? 'Activate'
            : 'Send Email'
        }
        onConfirm={handleConfirmAction}
        danger={actionDialog.action === 'suspend'}
        requireReason={actionDialog.action === 'suspend'}
        reasonLabel="Reason for suspension"
        reasonPlaceholder="Explain why you are suspending this user..."
      />
    </>
  );
}
