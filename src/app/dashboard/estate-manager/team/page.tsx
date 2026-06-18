'use client';

import { useState } from 'react';
import { useOrganizations, useOrganizationMembers, useInviteMember, useRemoveMember, useUpdateMemberRole } from '@/hooks/useOrganizations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Users, Mail, Trash2, Edit, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function TeamManagementPage() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('maintenance');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: membersData, isLoading: membersLoading } = useOrganizationMembers(
    orgId || '',
    !!orgId
  );

  const inviteMember = useInviteMember();
  const removeMember = useRemoveMember();
  const updateMemberRole = useUpdateMemberRole();

  const handleInvite = async () => {
    if (!orgId || !inviteEmail) return;

    try {
      await inviteMember.mutateAsync({
        orgId,
        email: inviteEmail,
        role: inviteRole,
      });
      toast({
        title: 'Success',
        description: 'Invitation sent successfully',
      });
      setIsInviteDialogOpen(false);
      setInviteEmail('');
      setInviteRole('maintenance');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveMember = async () => {
    if (!orgId || !memberToRemove) return;

    try {
      await removeMember.mutateAsync({
        orgId,
        userId: memberToRemove,
      });
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      setMemberToRemove(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!orgId) return;

    try {
      await updateMemberRole.mutateAsync({
        orgId,
        userId,
        role: newRole,
      });
      toast({
        title: 'Success',
        description: 'Role updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  if (orgsLoading || membersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No organization found</p>
      </div>
    );
  }

  const members = membersData?.data || [];
  const activeMembers = members.filter((m: any) => m.status === 'active');
  const pendingMembers = members.filter((m: any) => m.status === 'pending');

  const roleLabels: Record<string, string> = {
    manager: 'Manager',
    accountant: 'Accountant',
    maintenance: 'Maintenance',
    owner_view: 'View Only',
  };

  const roleColors: Record<string, string> = {
    manager: 'default',
    accountant: 'secondary',
    maintenance: 'outline',
    owner_view: 'outline',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members and their roles
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join {org.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="owner_view">View Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={handleInvite}
                disabled={!inviteEmail || inviteMember.isPending}
              >
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              {org.maxSeats} seats available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeMembers.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Mail className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingMembers.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member: any) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.user?.fullName || 'Pending'}
                    </TableCell>
                    <TableCell>
                      {member.user?.email || member.email}
                    </TableCell>
                    <TableCell>
                      {member.status === 'active' ? (
                        <Select
                          value={member.role}
                          onValueChange={(value) =>
                            handleRoleChange(member.userId, value)
                          }
                          disabled={org.ownerId === member.userId}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="accountant">Accountant</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="owner_view">View Only</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant={roleColors[member.role] as any}>
                          {roleLabels[member.role]}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          member.status === 'active'
                            ? 'default'
                            : member.status === 'pending'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.joinedAt
                        ? new Date(member.joinedAt).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {org.ownerId !== member.userId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMemberToRemove(member.userId || member.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No team members</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => setIsInviteDialogOpen(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? They will lose access to
              the organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveMember}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
