import type { AgentLicenseBoard, AgentTier, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * Public agent directory.
 *
 * This module is the only place that knows which agent columns may reach an
 * unauthenticated visitor. Everything it returns is either a public business fact
 * (name, territories, licence board, review score) or a count. Identity documents,
 * contact details, bank details and reviewer notes are never selected, so they
 * cannot leak through a forgotten `include`.
 */

export const AGENT_BOARDS = ['LASRERA', 'ESVARBON', 'NIESV', 'EAR'] as const;

export const DEFAULT_LIMIT = 12;
export const MAX_LIMIT = 50;
export const MAX_TERRITORY_FACETS = 12;

export type PublicAgent = {
  id: string;
  name: string;
  isAgency: boolean;
  avatarUrl: string | null;
  bio: string | null;
  tier: AgentTier;
  territories: string[];
  /** Licence boards with an approved, unexpired credential. Never `agentApproved`. */
  boards: AgentLicenseBoard[];
  rating: number | null;
  reviewCount: number;
  listingCount: number;
};

export type AgentDirectoryQuery = {
  q?: string;
  board?: AgentLicenseBoard;
  territory?: string;
  page?: number;
  limit?: number;
};

export type AgentDirectoryResult = {
  data: PublicAgent[];
  total: number;
  page: number;
  limit: number;
};

export type AgentDirectoryFacets = {
  boards: { value: AgentLicenseBoard; count: number }[];
  territories: { value: string; count: number }[];
};

/**
 * `agentApproved` defaults to `true` in the schema, so on its own it is not a gate.
 * A directory entry is a live agent account with approval, no ban, and no deactivation.
 */
const PUBLIC_AGENT_WHERE = {
  role: 'agent',
  isActive: true,
  isBanned: false,
  agentApproved: true,
} satisfies Prisma.UserWhereInput;

const PUBLIC_AGENT_SELECT = {
  id: true,
  fullName: true,
  avatarUrl: true,
  agentBio: true,
  agentTier: true,
  agentAreas: true,
  agentOnboardingProfile: {
    select: { legalName: true, isAgency: true, operationalTerritories: true },
  },
  licenses: {
    where: { status: 'approved' },
    select: { board: true, validUntil: true },
  },
  reviewsReceived: {
    where: { status: 'verified' },
    select: { rating: true },
  },
  _count: {
    select: { managedListings: { where: { status: 'active' } } },
  },
} satisfies Prisma.UserSelect;

type PublicAgentRow = Prisma.UserGetPayload<{ select: typeof PUBLIC_AGENT_SELECT }>;

function asStringArray(value: Prisma.JsonValue | null | undefined): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
}

function toPublicAgent(row: PublicAgentRow, now: Date): PublicAgent {
  const profile = row.agentOnboardingProfile;

  const territories = asStringArray(profile?.operationalTerritories);
  const fallbackAreas = asStringArray(row.agentAreas);

  const boards = Array.from(
    new Set(
      row.licenses
        .filter((license) => !license.validUntil || license.validUntil > now)
        .map((license) => license.board)
    )
  ).sort();

  const ratings = row.reviewsReceived.map((review) => review.rating);
  const rating = ratings.length
    ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
    : null;

  return {
    id: row.id,
    name: profile?.legalName?.trim() || row.fullName,
    isAgency: profile?.isAgency ?? false,
    avatarUrl: row.avatarUrl ?? null,
    bio: row.agentBio?.trim() || null,
    tier: row.agentTier,
    territories: territories.length ? territories : fallbackAreas,
    boards,
    rating,
    reviewCount: ratings.length,
    listingCount: row._count.managedListings,
  };
}

function buildWhere(query: AgentDirectoryQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { ...PUBLIC_AGENT_WHERE };

  const q = query.q?.trim();
  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' } },
      { agentBio: { contains: q, mode: 'insensitive' } },
      { agentOnboardingProfile: { legalName: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (query.board) {
    where.licenses = { some: { board: query.board, status: 'approved' } };
  }

  const agentProfileFilter: Prisma.AgentProfileWhereInput = {};
  const territory = query.territory?.trim();
  if (territory) {
    // `operationalTerritories` is a validated JSON string[] (`validators.ts:1142`).
    agentProfileFilter.operationalTerritories = { array_contains: territory };
  }
  if (Object.keys(agentProfileFilter).length > 0) {
    where.agentOnboardingProfile = { is: agentProfileFilter };
  }

  return where;
}

export async function listPublicAgents(query: AgentDirectoryQuery = {}): Promise<AgentDirectoryResult> {
  const page = Math.max(1, Math.floor(query.page ?? 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(query.limit ?? DEFAULT_LIMIT)));
  const where = buildWhere(query);

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: PUBLIC_AGENT_SELECT,
      // Alphabetical only: a deterministic order is what keeps pagination stable, and
      // the licence tier is surfaced as a badge rather than used as a sort key.
      orderBy: { fullName: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  const now = new Date();
  return { data: rows.map((row) => toPublicAgent(row, now)), total, page, limit };
}

/**
 * Live, approved agents holding at least one approved licence — the only number the
 * marketing surfaces may present as "verified agents".
 */
export async function countVerifiedPublicAgents(): Promise<number> {
  return prisma.user.count({
    where: { ...PUBLIC_AGENT_WHERE, licenses: { some: { status: 'approved' } } },
  });
}

/**
 * Counts behind the filter chips and the jurisdiction ledger. Only territories that
 * actually have an agent are returned, so no link in the ledger can land on an empty
 * result set.
 */
export async function getAgentDirectoryFacets(): Promise<AgentDirectoryFacets> {
  const [licenseRows, agents] = await Promise.all([
    prisma.agentLicense.findMany({
      where: { status: 'approved', agent: { is: PUBLIC_AGENT_WHERE } },
      select: { board: true },
    }),
    prisma.user.findMany({
      where: PUBLIC_AGENT_WHERE,
      select: {
        agentAreas: true,
        agentOnboardingProfile: { select: { operationalTerritories: true } },
      },
    }),
  ]);

  const boardCounts = new Map<AgentLicenseBoard, number>(AGENT_BOARDS.map((board) => [board, 0]));
  for (const row of licenseRows) {
    boardCounts.set(row.board, (boardCounts.get(row.board) ?? 0) + 1);
  }

  const territoryCounts = new Map<string, number>();
  for (const agent of agents) {
    const territories = asStringArray(agent.agentOnboardingProfile?.operationalTerritories);
    const list = territories.length ? territories : asStringArray(agent.agentAreas);
    for (const territory of new Set(list)) {
      territoryCounts.set(territory, (territoryCounts.get(territory) ?? 0) + 1);
    }
  }

  return {
    boards: AGENT_BOARDS.map((board) => ({ value: board, count: boardCounts.get(board) ?? 0 })),
    territories: Array.from(territoryCounts, ([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
      .slice(0, MAX_TERRITORY_FACETS),
  };
}
