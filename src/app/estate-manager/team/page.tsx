import { Metadata } from 'next';
import { Users, Plus, Mail, Shield, UserCog, UserX, MoreHorizontal, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const metadata: Metadata = {
  title: 'Team | PROPATI Estate Manager',
  description: 'Manage your organization team members and roles',
};

const mockMembers = [
  { id: '1', name: 'Adebayo Johnson', email: 'adebayo@company.com', role: 'manager', status: 'active', avatar: null, joinedAt: '2024-01-10', invitedBy: 'You' },
  { id: '2', name: 'Fatima Okonkwo', email: 'fatima@company.com', role: 'accountant', status: 'active', avatar: null, joinedAt: '2024-01-15', invitedBy: 'Adebayo Johnson' },
  { id: '3', name: 'James Peter', email: 'james@company.com', role: 'maintenance', status: 'active', avatar: null, joinedAt: '2024-02-01', invitedBy: 'Adebayo Johnson' },
  { id: '4', name: 'Sarah Williams', email: 'sarah@company.com', role: 'owner_view', status: 'active', avatar: null, joinedAt: '2024-02-10', invitedBy: 'You' },
  { id: '5', name: 'Michael Chen', email: 'michael@company.com', role: 'manager', status: 'pending', avatar: null, joinedAt: '2024-02-20', invitedBy: 'You' },
];

const roleConfig = {
  manager: { label: 'Manager', permissions: 'Full access: portfolio, ledger, maintenance, team, billing, reports', color: 'bg-purple-100 text-purple-700' },
  accountant: { label: 'Accountant', permissions: 'Ledger, billing, reports (read)', color: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'Maintenance', permissions: 'Maintenance tickets only', color: 'bg-green-100 text-green-700' },
  owner_view: { label: 'Owner View', permissions: 'Read-only: portfolio, ledger, reports', color: 'bg-gray-100 text-gray-700' },
};

const planLimits = {
  starter: { seats: 1, units: 20 },
  growth: { seats: 5, units: 100 },
  enterprise: { seats: -1, units: -1 },
};

const currentPlan = 'growth';
const usedSeats = mockMembers.filter(m => m.status === 'active').length;
const maxSeats = planLimits[currentPlan as keyof typeof planLimits].seats;

export default function EstateManagerTeamPage() {
  const canInvite = maxSeats === -1 || usedSeats < maxSeats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground">Manage team members, roles, and permissions</p>
        </div>
        <Button className="gap-2" disabled={!canInvite}>
          <Plus className="h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Seat Usage */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Seat Usage</h3>
            <p className="text-sm text-muted-foreground">
              {usedSeats} of {maxSeats === -1 ? 'Unlimited' : maxSeats} seats used ({currentPlan} plan)
            </p>
          </div>
          <div className="w-48">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: maxSeats === -1 ? '100%' : `${(usedSeats / maxSeats) * 100}%` }}
              />
            </div>
          </div>
        </div>
        {!canInvite && (
          <p className="mt-2 text-sm text-destructive">
            Seat limit reached. Upgrade plan to add more members.
          </p>
        )}
      </div>

      {/* Team Members Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Member</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Invited By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mockMembers.map((member) => {
                  const role = roleConfig[member.role as keyof typeof roleConfig];
                  return (
                    <tr key={member.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar || ''} alt={member.name} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className={role.color}>{role.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={member.status === 'active' ? 'default' : 'outline'}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{member.joinedAt}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{member.invitedBy}</td>
                      <td className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Member Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Select defaultValue={member.role} onValueChange={(value) => console.log('Change role to', value)}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Change role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(roleConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {member.status === 'pending' && (
                              <DropdownMenuItem className="text-green-600" onClick={() => console.log('Resend invite')}>
                                Resend Invitation
                              </DropdownMenuItem>
                            )}
                            {member.status === 'active' && (
                              <DropdownMenuItem className="text-destructive" onClick={() => console.log('Remove member')}>
                                Remove Member
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Role Permissions Reference */}
      <div className="card">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(roleConfig).map(([key, config]) => (
              <div key={key} className="p-4 bg-muted/50 rounded-lg">
                <Badge variant="secondary" className={`${config.color} mb-2`}>{config.label}</Badge>
                <p className="text-sm text-muted-foreground">{config.permissions}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
    </div>
  );
}