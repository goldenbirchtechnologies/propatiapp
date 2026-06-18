'use client';

import { useUser } from '@clerk/nextjs';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrganizationTickets } from '@/hooks/useOrganizationTickets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Home, DollarSign, Wrench, Plus, FolderKanban, Users, FileText } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function EstateManagerDashboard() {
  const { user } = useUser();
  const { data: orgsData, isLoading: orgsLoading } = useOrganizations();

  // Get first organization (estate managers typically manage one org)
  const org = orgsData?.data?.[0];
  const orgId = org?.id;

  const { data: ticketsData } = useOrganizationTickets(orgId || '', {
    status: 'open',
    limit: 5,
  }, !!orgId);

  if (orgsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Building2 className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No Organization Found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          You need to create or be invited to an organization to access the estate manager dashboard.
        </p>
        <Button asChild>
          <Link href="/dashboard/estate-manager/setup">Create Organization</Link>
        </Button>
      </div>
    );
  }

  // Mock calculations (replace with real data from API)
  const totalUnits = org.maxUnits || 0;
  const occupiedUnits = Math.floor(totalUnits * 0.75); // Mock 75% occupancy
  const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0';
  const monthlyRent = 4250000; // Mock value in Naira
  const openTickets = ticketsData?.data?.length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{org.name}</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.firstName || 'Manager'}
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {org.planTier.toUpperCase()} Plan
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnits}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedUnits} occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalUnits - occupiedUnits} vacant units
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{(monthlyRent / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-muted-foreground">
              Total expected revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Maintenance requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href={`/dashboard/estate-manager/portfolio`}>
                <FolderKanban className="h-5 w-5 mb-2" />
                <span className="font-semibold">View Portfolio</span>
                <span className="text-xs text-muted-foreground">
                  Manage all units
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href={`/dashboard/estate-manager/maintenance`}>
                <Wrench className="h-5 w-5 mb-2" />
                <span className="font-semibold">Maintenance</span>
                <span className="text-xs text-muted-foreground">
                  Track tickets
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href={`/dashboard/estate-manager/ledger`}>
                <FileText className="h-5 w-5 mb-2" />
                <span className="font-semibold">Rent Ledger</span>
                <span className="text-xs text-muted-foreground">
                  Payment tracking
                </span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto flex-col items-start p-4">
              <Link href={`/dashboard/estate-manager/team`}>
                <Users className="h-5 w-5 mb-2" />
                <span className="font-semibold">Team</span>
                <span className="text-xs text-muted-foreground">
                  Manage members
                </span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {openTickets > 0 ? (
            <div className="space-y-3">
              {ticketsData?.data?.slice(0, 5).map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.listing?.title || 'No unit assigned'}
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-2">
                    {ticket.status}
                  </Badge>
                </div>
              ))}
              <Button asChild variant="link" className="w-full">
                <Link href={`/dashboard/estate-manager/maintenance`}>
                  View All Tickets
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
