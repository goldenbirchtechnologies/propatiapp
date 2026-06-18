'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ActionConfirmationDialog } from '@/components/admin/action-confirmation-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, DollarSign, Calendar, Ban, CheckCircle2, Mail } from 'lucide-react';
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
  participatedTransactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: Date;
  }[];
  _count: {
    ownedListings: number;
    participatedTransactions: number;
  };
}

interface UserDetailClientProps {
  user: UserData;
  revenueData: {
    _sum: {
      amount: number | null;
      platformFee: number | null;
    };
  };
}

export default function UserDetailClient({ user: initialUser, revenueData }: UserDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(initialUser);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'activate' | 'reset-password' | null;
  }>({ open: false, action: null });

  const handleSuspendUser = async (reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend user');

      toast({ title: 'Success', description: 'User suspended successfully' });
      setUser({ ...user, isActive: false });
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to suspend user', variant: 'destructive' });
    }
  };

  const handleActivateUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/activate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to activate user');

      toast({ title: 'Success', description: 'User activated successfully' });
      setUser({ ...user, isActive: true });
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to activate user', variant: 'destructive' });
    }
  };

  const handleChangeRole = async (newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/change-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to change role');

      toast({ title: 'Success', description: 'User role updated successfully' });
      setUser({ ...user, role: newRole });
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to change role', variant: 'destructive' });
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to send reset email');

      toast({ title: 'Success', description: 'Password reset email sent' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset email',
        variant: 'destructive',
      });
    }
  };

  const openActionDialog = (action: 'suspend' | 'activate' | 'reset-password') => {
    setActionDialog({ open: true, action });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!actionDialog.action) return;

    if (actionDialog.action === 'suspend') {
      await handleSuspendUser(reason);
    } else if (actionDialog.action === 'activate') {
      await handleActivateUser();
    } else if (actionDialog.action === 'reset-password') {
      await handleResetPassword();
    }

    setActionDialog({ open: false, action: null });
  };

  const getRoleBadge = (role: UserRole) => {
    const roleMap = {
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

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1
              className="font-heading font-bold"
              style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
            >
              User Details
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              View and manage user information
            </p>
          </div>
        </div>

        {/* User Information Card */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
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
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  {user.email}
                </p>
                {user.phone && (
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    {user.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={user.isActive ? 'tag-green' : 'tag-red'}>
                {user.isActive ? 'Active' : 'Suspended'}
              </Badge>
              <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Total Listings
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                {user._count.ownedListings}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Total Transactions
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                {user._count.participatedTransactions}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Total Revenue
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                ₦{((revenueData._sum.amount || 0) / 100).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Account Age
              </p>
              <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text)' }}>
                {accountAge} days
              </p>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
            Admin Actions
          </h3>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Change Role:
              </span>
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
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => openActionDialog('reset-password')}>
                <Mail className="h-4 w-4 mr-2" />
                Reset Password
              </Button>
              {user.isActive ? (
                <Button variant="destructive" onClick={() => openActionDialog('suspend')}>
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Account
                </Button>
              ) : (
                <Button variant="outline" onClick={() => openActionDialog('activate')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Activate Account
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Listings Table */}
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
            Recent Listings
          </h3>
          {user.ownedListings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Title
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Type
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Price
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Status
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.ownedListings.map((listing) => (
                    <tr key={listing.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3" style={{ color: 'var(--text)' }}>
                        {listing.title}
                      </td>
                      <td className="p-3" style={{ color: 'var(--text)' }}>
                        {listing.propertyType}
                      </td>
                      <td className="p-3" style={{ color: 'var(--text)' }}>
                        ₦{listing.price.toLocaleString()}
                      </td>
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
            <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
              No listings found
            </p>
          )}
        </div>

        {/* Transactions Table */}
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>
            Recent Transactions
          </h3>
          {user.participatedTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Type
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Amount
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Status
                    </th>
                    <th className="text-left p-3 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {user.participatedTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-3" style={{ color: 'var(--text)' }}>
                        {transaction.type}
                      </td>
                      <td className="p-3" style={{ color: 'var(--text)' }}>
                        ₦{(transaction.amount / 100).toLocaleString()}
                      </td>
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
            <p className="text-center py-8" style={{ color: 'var(--muted)' }}>
              No transactions found
            </p>
          )}
        </div>
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
