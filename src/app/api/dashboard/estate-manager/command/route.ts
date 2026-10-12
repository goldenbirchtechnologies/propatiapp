import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const OPEN_TICKET_STATUSES = ['open', 'assigned', 'in_progress'];

/**
 * GET /api/dashboard/estate-manager/command?orgId=<id>
 *
 * Aggregated "Estate Operations & Facility Command" payload for the estate
 * manager dashboard. Every field is derived from live database records — no
 * synthetic values.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['estate_manager', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const orgId = request.nextUrl.searchParams.get('orgId');

    if (!orgId) {
      return NextResponse.json({ error: 'orgId is required' }, { status: 400 });
    }

    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        ownerId: true,
        address: true,
        maxUnits: true,
        _count: { select: { units: true, listings: true } },
      },
    });

    if (!org) {
      return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
    }

    if (user.role === 'estate_manager') {
      const isOwner = org.ownerId === user.id;
      const membership = isOwner
        ? null
        : await prisma.orgMember.findFirst({
            where: { orgId, userId: user.id, status: 'active' },
            select: { id: true },
          });
      if (!isOwner && !membership) {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
    }

    const [units, tickets, serviceCharges, utilityAllocations, turnoverTasks, listings] =
      await Promise.all([
        prisma.unit.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            unitNumber: true,
            buildingName: true,
            type: true,
            bedrooms: true,
            bathrooms: true,
            rent: true,
            serviceCharge: true,
            status: true,
            occupancy: true,
            leaseStartDate: true,
            leaseEndDate: true,
            nextMaintenanceDate: true,
            currentTenant: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
            listing: { select: { id: true, title: true, address: true } },
          },
          orderBy: [{ buildingName: 'asc' }, { unitNumber: 'asc' }],
        }),
        prisma.maintenanceTicket.findMany({
          where: { orgId },
          select: {
            id: true,
            title: true,
            category: true,
            priority: true,
            status: true,
            createdAt: true,
            raisedByUser: { select: { fullName: true } },
            assignedToUser: { select: { fullName: true } },
            listing: { select: { id: true, title: true, address: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.serviceCharge.findMany({
          where: { organizationId: orgId },
          select: {
            id: true,
            period: true,
            amount: true,
            status: true,
            dueDate: true,
            paidAt: true,
            createdAt: true,
            listing: { select: { id: true, title: true, address: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.utilityAllocation.findMany({
          where: { unit: { organizationId: orgId } },
          select: {
            id: true,
            type: true,
            amount: true,
            status: true,
            billingPeriod: true,
            dueDate: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.turnoverTask.findMany({
          where: { listing: { orgListings: { some: { orgId } } } },
          select: {
            id: true,
            status: true,
            priority: true,
            scheduledStart: true,
            listing: { select: { title: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.listing.findMany({
          where: { orgListings: { some: { orgId } } },
          select: { id: true, title: true, address: true, propertyType: true },
          orderBy: { title: 'asc' },
        }),
      ]);

    // ---- Fleet / unit aggregates -------------------------------------------
    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.occupancy === 'OCCUPIED');
    const vacantUnits = units.filter((u) => u.occupancy === 'VACANT');
    const noticeUnits = units.filter((u) => u.occupancy === 'NOTICE_GIVEN');
    const maintenanceUnits = units.filter((u) => u.status === 'MAINTENANCE');
    const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits.length / totalUnits) * 100) : 0;

    const activeTurnover = turnoverTasks.filter(
      (t) => t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress'
    );

    const monthlyRentRoll = units
      .filter((u) => u.occupancy === 'OCCUPIED')
      .reduce((sum, u) => sum + Number(u.rent), 0);

    // ---- Service charge / escrow pool aggregates ---------------------------
    const billableCharges = serviceCharges.filter((sc) => sc.status !== 'cancelled');
    const escrowBilled = billableCharges.reduce((sum, sc) => sum + Number(sc.amount), 0);
    const escrowCollected = serviceCharges
      .filter((sc) => sc.status === 'paid')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);
    const escrowPending = billableCharges
      .filter((sc) => sc.status !== 'paid')
      .reduce((sum, sc) => sum + Number(sc.amount), 0);
    const collectionRate = escrowBilled > 0 ? Math.round((escrowCollected / escrowBilled) * 100) : 0;

    const now = new Date();

    // ---- Maintenance / work order aggregates -------------------------------
    const openTickets = tickets.filter((t) => OPEN_TICKET_STATUSES.includes(t.status));
    const urgentTickets = tickets.filter((t) => t.priority === 'urgent');
    const highTickets = tickets.filter((t) => t.priority === 'high');
    const dispatchedTickets = tickets.filter((t) => t.status === 'assigned');
    const inProgressTickets = tickets.filter((t) => t.status === 'in_progress');
    const resolvedTickets = tickets.filter((t) => t.status === 'resolved' || t.status === 'closed');

    // ---- Utility (OpEx) aggregates -----------------------------------------
    const utilityOpex = utilityAllocations
      .filter((ua) => ua.status !== 'cancelled')
      .reduce((sum, ua) => sum + Number(ua.amount), 0);
    const utilityOpexPaid = utilityAllocations
      .filter((ua) => ua.status === 'paid')
      .reduce((sum, ua) => sum + Number(ua.amount), 0);

    const utilityBreakdown: Record<string, number> = {};
    for (const ua of utilityAllocations) {
      const key = String(ua.type);
      utilityBreakdown[key] = (utilityBreakdown[key] || 0) + Number(ua.amount);
    }

    // ---- Monthly inflow vs OpEx (12 months) --------------------------------
    const months: Array<{
      key: string;
      month: string;
      collections: number;
      opex: number;
      isCurrent: boolean;
    }> = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = monthStart.toLocaleString('en-US', { month: 'short' }).toUpperCase();

      const collections = serviceCharges
        .filter(
          (sc) =>
            sc.status === 'paid' &&
            (sc.paidAt ?? sc.createdAt) >= monthStart &&
            (sc.paidAt ?? sc.createdAt) < monthEnd
        )
        .reduce((sum, sc) => sum + Number(sc.amount), 0);

      const opex = utilityAllocations
        .filter((ua) => ua.createdAt >= monthStart && ua.createdAt < monthEnd)
        .reduce((sum, ua) => sum + Number(ua.amount), 0);

      months.push({
        key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
        month: label,
        collections: Math.round(collections),
        opex: Math.round(opex),
        isCurrent: i === 0,
      });
    }

    const collectionsYtd = serviceCharges
      .filter(
        (sc) => sc.status === 'paid' && (sc.paidAt ?? sc.createdAt).getFullYear() === now.getFullYear()
      )
      .reduce((sum, sc) => sum + Number(sc.amount), 0);
    const opexYtd = utilityAllocations
      .filter(
        (ua) => ua.status !== 'cancelled' && ua.createdAt.getFullYear() === now.getFullYear()
      )
      .reduce((sum, ua) => sum + Number(ua.amount), 0);

    // ---- Per-estate (per-listing) breakdown --------------------------------
    const estates = listings
      .map((listing) => {
        const estateUnits = units.filter((u) => u.listing?.id === listing.id);
        const charges = serviceCharges.filter((sc) => sc.listing?.id === listing.id);
        const billed = charges
          .filter((sc) => sc.status !== 'cancelled')
          .reduce((sum, sc) => sum + Number(sc.amount), 0);
        const collected = charges
          .filter((sc) => sc.status === 'paid')
          .reduce((sum, sc) => sum + Number(sc.amount), 0);
        const occupied = estateUnits.filter((u) => u.occupancy === 'OCCUPIED').length;

        return {
          id: listing.id,
          name: listing.title,
          address: listing.address,
          propertyType: listing.propertyType,
          unitCount: estateUnits.length,
          occupiedCount: occupied,
          billed: Math.round(billed),
          collected: Math.round(collected),
          paidRate: billed > 0 ? Math.round((collected / billed) * 100) : 0,
          openTickets: tickets.filter(
            (t) => t.listing?.id === listing.id && OPEN_TICKET_STATUSES.includes(t.status)
          ).length,
        };
      })
      .filter((e) => e.unitCount > 0 || e.billed > 0);

    // ---- Overdue service charges -------------------------------------------
    const overdueCharges = serviceCharges
      .filter(
        (sc) =>
          sc.status !== 'paid' && sc.status !== 'cancelled' && new Date(sc.dueDate).getTime() < now.getTime()
      )
      .map((sc) => {
        const days = Math.floor((now.getTime() - new Date(sc.dueDate).getTime()) / 86400000);
        return {
          id: sc.id,
          period: sc.period,
          amount: Number(sc.amount),
          status: sc.status,
          dueDate: sc.dueDate,
          daysOverdue: Math.max(0, days),
          listing: sc.listing,
        };
      })
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    return NextResponse.json({
      success: true,
      data: {
        generatedAt: now.toISOString(),
        org: {
          id: org.id,
          name: org.name,
          address: org.address,
          maxUnits: org.maxUnits,
        },
        fleet: {
          totalUnits,
          estateCount: estates.length,
          occupiedUnits: occupiedUnits.length,
          vacantUnits: vacantUnits.length,
          noticeUnits: noticeUnits.length,
          maintenanceUnits: maintenanceUnits.length,
          activeTurnover: activeTurnover.length,
          occupancyRate,
          monthlyRentRoll: Math.round(monthlyRentRoll),
        },
        escrow: {
          billed: Math.round(escrowBilled),
          collected: Math.round(escrowCollected),
          pending: Math.round(escrowPending),
          collectionRate,
          collectionsYtd: Math.round(collectionsYtd),
          opexYtd: Math.round(opexYtd),
          overdueCount: overdueCharges.length,
        },
        workOrders: {
          open: openTickets.length,
          urgent: urgentTickets.length,
          high: highTickets.length,
          dispatched: dispatchedTickets.length,
          inProgress: inProgressTickets.length,
          resolved: resolvedTickets.length,
          total: tickets.length,
        },
        utilities: {
          totalOpex: Math.round(utilityOpex),
          paidOpex: Math.round(utilityOpexPaid),
          breakdown: Object.entries(utilityBreakdown).map(([type, amount]) => ({
            type,
            amount: Math.round(amount),
          })),
        },
        months,
        estates,
        overdueCharges,
        recentTickets: tickets.slice(0, 10).map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category,
          priority: t.priority,
          status: t.status,
          createdAt: t.createdAt,
          raisedBy: t.raisedByUser?.fullName ?? null,
          assignedTo: t.assignedToUser?.fullName ?? null,
          listing: t.listing,
        })),
        recentCharges: serviceCharges.slice(0, 10).map((sc) => ({
          id: sc.id,
          period: sc.period,
          amount: Number(sc.amount),
          status: sc.status,
          dueDate: sc.dueDate,
          paidAt: sc.paidAt,
          listing: sc.listing,
        })),
        units: units.map((u) => ({
          id: u.id,
          unitNumber: u.unitNumber,
          buildingName: u.buildingName,
          type: u.type,
          bedrooms: u.bedrooms,
          bathrooms: u.bathrooms,
          rent: Number(u.rent),
          serviceCharge: u.serviceCharge ? Number(u.serviceCharge) : null,
          status: u.status,
          occupancy: u.occupancy,
          leaseStartDate: u.leaseStartDate,
          leaseEndDate: u.leaseEndDate,
          nextMaintenanceDate: u.nextMaintenanceDate,
          currentTenant: u.currentTenant,
          listing: u.listing,
        })),
        hasData: totalUnits > 0 || serviceCharges.length > 0 || tickets.length > 0,
      },
    });
  } catch (error) {
    console.error('Estate command GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
