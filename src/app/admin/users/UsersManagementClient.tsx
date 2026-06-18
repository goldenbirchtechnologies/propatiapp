'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ActionConfirmationDialog } from '@/components/admin/action-confirmation-dialog';
import { Search, Eye, Ban, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@prisma/client';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  _count: {
    ownedListings: number;
    participatedTransactions: number;
  };
}

interface UsersManagementClientProps {
  users: User[];
}

export default function UsersManagementClient({ users: initialUsers }: UsersManagementClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'users' | 'agent-applications'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'suspend' | 'activate' | null;
  }>({ open: false, action: null });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive) ||
        (statusFilter === 'suspended' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleSuspendUser = async (userId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) throw new Error('Failed to suspend user');

      toast({ title: 'Success', description: 'User suspended successfully' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to suspend user', variant: 'destructive' });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to activate user');

      toast({ title: 'Success', description: 'User activated successfully' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to activate user', variant: 'destructive' });
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/change-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) throw new Error('Failed to change role');

      toast({ title: 'Success', description: 'User role updated successfully' });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      router.refresh();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to change role', variant: 'destructive' });
    }
  };

  const openActionDialog = (user: User, action: 'suspend' | 'activate') => {
    setSelectedUser(user);
    setActionDialog({ open: true, action });
  };

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedUser || !actionDialog.action) return;

    if (actionDialog.action === 'suspend') {
      await handleSuspendUser(selectedUser.id, reason);
    } else if (actionDialog.action === 'activate') {
      await handleActivateUser(selectedUser.id);
    }

    setActionDialog({ open: false, action: null });
    setSelectedUser(null);
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

  const renderUsersTable = () => {
    if (filteredUsers.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
            No users found
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Name
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Email
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Role
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Joined Date
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Stats
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                    >
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text)' }}>
                      {user.fullName}
                    </span>
                  </div>
                </td>
                <td className="p-4" style={{ color: 'var(--text)' }}>
                  {user.email}
                </td>
                <td className="p-4">
                  <Select
                    value={user.role}
                    onValueChange={(value) => handleChangeRole(user.id, value as UserRole)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        <Badge className={getRoleBadge(user.role)}>{user.role}</Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="landlord">Landlord</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="estate_manager">Estate Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="p-4">
                  <Badge className={user.isActive ? 'tag-green' : 'tag-red'}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                </td>
                <td className="p-4" style={{ color: 'var(--text)' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <p style={{ color: 'var(--text)' }}>
                      {user._count.ownedListings} listings
                    </p>
                    <p style={{ color: 'var(--muted)' }}>
                      {user._count.participatedTransactions} transactions
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {user.isActive ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openActionDialog(user, 'suspend')}
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openActionDialog(user, 'activate')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1
            className="font-heading font-bold"
            style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}
          >
            Users Management
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Manage platform users, roles, and permissions.
          </p>
        </div>

        <div className="card">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="users">All Users ({users.length})</TabsTrigger>
              <TabsTrigger value="agent-applications">Agent Applications</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6 space-y-4">
              {/* Filters */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4"
                      style={{ color: 'var(--muted)' }}
                    />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="landlord">Landlord</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="estate_manager">Estate Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {renderUsersTable()}
            </TabsContent>

            <TabsContent value="agent-applications" className="mt-6">
              <div className="text-center py-12">
                <p className="text-lg font-medium" style={{ color: 'var(--muted)' }}>
                  No pending agent applications
                </p>
                <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
                  Agent applications will appear here for review
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ActionConfirmationDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ open, action: null })}
        title={actionDialog.action === 'suspend' ? 'Suspend User' : 'Activate User'}
        description={
          actionDialog.action === 'suspend'
            ? 'This will suspend the user account. Provide a reason for suspension.'
            : 'This will reactivate the user account and restore access.'
        }
        confirmText={actionDialog.action === 'suspend' ? 'Suspend' : 'Activate'}
        onConfirm={handleConfirmAction}
        danger={actionDialog.action === 'suspend'}
        requireReason={actionDialog.action === 'suspend'}
        reasonLabel="Reason for suspension"
        reasonPlaceholder="Explain why you are suspending this user..."
      />
    </>
  );
}
