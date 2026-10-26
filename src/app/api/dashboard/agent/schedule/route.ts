import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

type ScheduleItem = {
  id: string;
  title: string;
  listing: string;
  date: string;
  time: string;
  type: 'inspection' | 'meeting';
  status: 'upcoming' | 'completed' | 'cancelled';
  address: string;
};

function formatTime(value: Date) {
  return value.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

function mapStatus(raw: string): ScheduleItem['status'] {
  const s = raw.toLowerCase();
  if (s === 'completed' || s === 'verified' || s === 'approved') return 'completed';
  if (s === 'cancelled' || s === 'rejected' || s === 'no_show') return 'cancelled';
  return 'upcoming';
}

/**
 * GET /api/dashboard/agent/schedule
 *
 * The signed-in agent's field calendar: physical inspections (Verification
 * layer 4 assigned to this agent) plus screening calls on their listings.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const [inspections, screenings] = await Promise.all([
      prisma.verification.findMany({
        where: { l4AgentId: user.id, l4ScheduledAt: { not: null } },
        orderBy: { l4ScheduledAt: 'asc' },
        take: 50,
        select: {
          id: true,
          l4ScheduledAt: true,
          l4Status: true,
          listing: { select: { title: true, address: true, area: true, state: true } },
        },
      }),
      prisma.screeningCall.findMany({
        where: { listing: { agentId: user.id } },
        orderBy: { scheduledAt: 'asc' },
        take: 50,
        select: {
          id: true,
          scheduledAt: true,
          status: true,
          listing: { select: { title: true, address: true, area: true, state: true } },
        },
      }),
    ]);

    const items: ScheduleItem[] = [
      ...inspections.map((v) => {
        const when = v.l4ScheduledAt as Date;
        return {
          id: `insp-${v.id}`,
          title: 'Property Inspection',
          listing: v.listing?.title ?? 'Property',
          date: when.toISOString().slice(0, 10),
          time: formatTime(when),
          type: 'inspection' as const,
          status: mapStatus(v.l4Status),
          address: [v.listing?.address, v.listing?.area, v.listing?.state].filter(Boolean).join(', '),
        };
      }),
      ...screenings.map((s) => ({
        id: `scr-${s.id}`,
        title: 'Tenant Screening Call',
        listing: s.listing?.title ?? 'Property',
        date: s.scheduledAt.toISOString().slice(0, 10),
        time: formatTime(s.scheduledAt),
        type: 'meeting' as const,
        status: mapStatus(s.status),
        address: [s.listing?.address, s.listing?.area, s.listing?.state].filter(Boolean).join(', '),
      })),
    ].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Agent schedule GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
