import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { AgentReviewStatus } from '@prisma/client';

/**
 * GET /api/agent/reputation
 *
 * Reputation ledger for the signed-in agent. Returns verified client
 * reviews, the rating distribution, and the derived aggregate metrics the
 * reputation screen renders (overall rating, NPS proxy, deal volume,
 * verified-review share).
 *
 * Only `verified` reviews are counted towards the aggregates — pending or
 * rejected submissions are returned separately so the UI can show them as
 * unverified without letting them influence the score.
 */
export async function GET(request: NextRequest) {
  const authResult = await withAuth(request, ['agent', 'admin']);
  if (authResult instanceof NextResponse) return authResult;
  const { user } = authResult;

  try {
    const searchParams = request.nextUrl.searchParams;
    const scopeParam = searchParams.get('agentId');
    // An agent sees their own ledger; admins may inspect another agent's.
    const agentId = user.role === 'admin' && scopeParam ? scopeParam : user.id;

    const [reviews, agent, mandateCount, escrowCount] = await Promise.all([
      prisma.agentReview.findMany({
        where: { agentId },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        include: {
          reviewer: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          agreement: {
            select: {
              id: true,
              type: true,
              status: true,
              rentAmount: true,
              listing: { select: { id: true, title: true, area: true, state: true } },
            },
          },
          listing: { select: { id: true, title: true, area: true, state: true } },
        },
      }),
      prisma.user.findUnique({
        where: { id: agentId },
        select: {
          id: true,
          fullName: true,
          email: true,
          avatarUrl: true,
          agentTier: true,
          agentApproved: true,
          agentBio: true,
          agentAreas: true,
          ninVerified: true,
          bvnEncrypted: true,
          phoneVerified: true,
          idVerified: true,
          createdAt: true,
          businessProfiles: {
            select: { id: true, companyName: true, cacNumber: true, rcNumber: true, verified: true },
          },
          licenses: {
            where: { status: 'approved' },
            select: { id: true, board: true, licenseType: true, registrationNo: true, validUntil: true },
            orderBy: { reviewedAt: 'desc' },
            take: 1,
          },
        },
      }),
      prisma.agreement.count({ where: { agentId } }),
      prisma.transaction.count({ where: { agentId } }),
    ]);

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const verified = reviews.filter((r) => r.status === AgentReviewStatus.verified);
    const pending = reviews.filter((r) => r.status === AgentReviewStatus.pending);

    const distribution = [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      count: verified.filter((r) => r.rating === stars).length,
    }));

    const totalVerified = verified.length;
    const averageRating = totalVerified
      ? verified.reduce((sum, r) => sum + r.rating, 0) / totalVerified
      : 0;

    // Net-promoter style proxy: 5-star reviewers count as promoters,
    // 1–2 star reviewers as detractors. Pending reviews are excluded.
    const promoters = verified.filter((r) => r.rating === 5).length;
    const detractors = verified.filter((r) => r.rating <= 2).length;
    const netPromoter = totalVerified
      ? Math.round(((promoters - detractors) / totalVerified) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        agent: {
          id: agent.id,
          fullName: agent.fullName,
          email: agent.email,
          avatarUrl: agent.avatarUrl,
          agentTier: agent.agentTier,
          agentApproved: agent.agentApproved,
          agentBio: agent.agentBio,
          agentAreas: agent.agentAreas,
          createdAt: agent.createdAt,
          identity: {
            ninVerified: agent.ninVerified,
            bvnVerified: Boolean(agent.bvnEncrypted),
            phoneVerified: agent.phoneVerified,
            idVerified: agent.idVerified,
          },
          businessProfile: agent.businessProfiles[0] ?? null,
          primaryLicense: agent.licenses[0] ?? null,
        },
        reviews,
        verifiedReviews: verified,
        pendingReviews: pending,
        distribution,
        metrics: {
          totalReviews: reviews.length,
          verifiedReviews: totalVerified,
          pendingReviews: pending.length,
          averageRating: Number(averageRating.toFixed(2)),
          netPromoter,
          completedMandates: mandateCount,
          escrowTransactions: escrowCount,
          verifiedShare: reviews.length
            ? Math.round((totalVerified / reviews.length) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error('Agent reputation GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
