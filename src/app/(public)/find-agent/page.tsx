import type { Metadata } from 'next';
import type { AgentLicenseBoard } from '@prisma/client';
import Link from 'next/link';
import { ArrowRight, Building2, ChevronDown, MapPin, Search, ShieldCheck, Star, Users } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionLabel } from '@/components/ui/section-label';
import {
  AGENT_BOARDS,
  DEFAULT_LIMIT,
  getAgentDirectoryFacets,
  listPublicAgents,
  type AgentDirectoryFacets,
  type PublicAgent,
} from '@/lib/agents/public-directory';
import { FaqAccordion, type Faq } from './_components/faq-accordion';

export const metadata: Metadata = {
  title: 'Find an agent | PropatiBox',
  description:
    'Browse licensed estate surveyors and property brokers across Nigeria. Every agent in this directory holds an approved, in-date licence from a professional board.',
};

const FAQS: Faq[] = [
  {
    q: 'How is an agent verified?',
    a: 'An agent must hold a licence from a professional board our team verifies, and that licence must still be in date. The board shown on each card is the one we actually checked.',
  },
  {
    q: 'What does the licence badge on a card mean?',
    a: 'It means we hold an approved credential for that agent from that board and it has not expired. If an agent has no badge, we could not confirm a licence and they will not appear in search results that filter by board.',
  },
  {
    q: 'Where do the ratings come from?',
    a: 'From reviews left by people who had a completed agreement with that agent. Only reviews our team has verified are counted. An agent without verified reviews shows "No reviews yet" rather than a placeholder score.',
  },
  {
    q: "What if there's no agent in my area?",
    a: 'The jurisdiction list only shows places where an agent currently operates, so if yours is missing, nobody is listed there yet. Tell us where you are looking and we will let you know when an agent covers it.',
  },
];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

function isBoard(value: string | undefined): value is AgentLicenseBoard {
  return !!value && (AGENT_BOARDS as readonly string[]).includes(value);
}

const BOARD_LABELS: Record<string, string> = {
  LASRERA: 'Real Estate License',
  ESVARBON: 'Estate Surveyor Register',
  NIESV: 'Chartered Estate Surveyor',
  EAR: 'Estate Agent License',
};

function boardLabel(board: string) {
  return BOARD_LABELS[board] ?? board;
}

function directoryHref(
  current: { q?: string; territory?: string },
  patch: { board?: AgentLicenseBoard; page?: number } = {}
): string {
  const params = new URLSearchParams();
  if (current.q) params.set('q', current.q);
  if (current.territory) params.set('territory', current.territory);
  if (patch.board) params.set('board', patch.board);
  if (patch.page && patch.page > 1) params.set('page', String(patch.page));
  const qs = params.toString();
  return qs ? `/find-agent?${qs}` : '/find-agent';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function AgentCard({ agent }: { agent: PublicAgent }) {
  return (
    <article className="glass-card flex min-w-0 flex-col gap-4 p-5">
      <div className="flex min-w-0 items-start gap-3">
        <Avatar className="size-12 shrink-0">
          {agent.avatarUrl && <AvatarImage src={agent.avatarUrl} alt="" />}
          <AvatarFallback className="text-sm font-semibold">{initials(agent.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{agent.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-muted-foreground">
            {agent.isAgency ? (
              <Building2 aria-hidden className="h-3.5 w-3.5 shrink-0" />
            ) : (
              <Users aria-hidden className="h-3.5 w-3.5 shrink-0" />
            )}
            <span className="truncate">{agent.isAgency ? 'Agency' : 'Individual agent'}</span>
            {agent.tier === 'senior' && (
              <Badge variant="info" className="ml-1 shrink-0">
                Senior
              </Badge>
            )}
          </p>

          <div className="mt-1.5 text-sm">
            {agent.rating !== null ? (
              <span className="inline-flex items-center gap-1.5">
                <Star aria-hidden className="h-3.5 w-3.5 fill-[#4edea3] text-[#4edea3]" />
                <span className="font-medium text-foreground">{agent.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">
                  ({agent.reviewCount} {agent.reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">No reviews yet</span>
            )}
          </div>
        </div>
      </div>

      {agent.bio && <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{agent.bio}</p>}

      {agent.territories.length > 0 && (
        <p className="flex min-w-0 items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{agent.territories.join(' · ')}</span>
        </p>
      )}

      {(agent.boards.length > 0 || agent.listingCount > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {agent.boards.map((board) => (
            <Badge key={board} variant="success">
              <ShieldCheck aria-hidden className="h-3 w-3" />
              boardLabel(board)
            </Badge>
          ))}
          {agent.listingCount > 0 && (
            <span className="text-sm text-muted-foreground">
              {agent.listingCount} active {agent.listingCount === 1 ? 'listing' : 'listings'}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <Button asChild size="sm">
          <Link href={`/contact-us?agent=${encodeURIComponent(agent.id)}`}>Enquire</Link>
        </Button>
      </div>
    </article>
  );
}

export default async function FindAgentPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const q = first(params.q);
  const territory = first(params.territory);
  const rawBoard = first(params.board);
  const board = isBoard(rawBoard) ? rawBoard : undefined;
  const requestedPage = Number(first(params.page) ?? 1);
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;

  const current = { q, territory };

  let agents: PublicAgent[] = [];
  let total = 0;
  let limit = DEFAULT_LIMIT;
  let facets: AgentDirectoryFacets = {
    boards: AGENT_BOARDS.map((value) => ({ value, count: 0 })),
    territories: [],
  };
  let unavailable = false;

  try {
    const [result, facetResult] = await Promise.all([
      listPublicAgents({ q, territory, board, page }),
      getAgentDirectoryFacets(),
    ]);
    agents = result.data;
    total = result.total;
    limit = result.limit;
    facets = facetResult;
  } catch (error) {
    // A marketing page must still render if the database is unreachable.
    unavailable = true;
    console.error('[find-agent] directory unavailable:', error instanceof Error ? error.message : 'unknown error');
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasFilters = Boolean(q || territory || board);
  const visibleBoards = facets.boards.filter((entry) => entry.count > 0 || entry.value === board);

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-[#002113] via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,108,73,0.10),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20">
          <SectionLabel>Verified agent directory</SectionLabel>

          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
            A great agent makes <span className="text-[#4edea3]">all the difference</span>.
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            Every agent here holds a licence from a Nigerian professional board that our team has approved and that
            is still in date. Search by name or firm, or narrow the list to a board or a jurisdiction.
          </p>

          <form
            action="/find-agent"
            method="get"
            className="mt-8 flex max-w-4xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 sm:flex-row sm:items-center"
          >
            {board && <input type="hidden" name="board" value={board} />}

            <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
              <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
              <label htmlFor="agent-search" className="sr-only">
                Search by agent, firm or neighbourhood
              </label>
              <input
                id="agent-search"
                name="q"
                type="search"
                defaultValue={q ?? ''}
                placeholder="Agent, firm, or neighbourhood"
                className="h-12 w-full min-w-0 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            <div className="relative min-w-0 sm:w-56">
              <label htmlFor="agent-territory" className="sr-only">
                Jurisdiction
              </label>
              <select
                id="agent-territory"
                name="territory"
                defaultValue={territory ?? ''}
                className="h-12 w-full appearance-none rounded-xl border border-border bg-card pl-3 pr-10 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">All jurisdictions</option>
                {facets.territories.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.value} ({entry.count})
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
            </div>

            <Button type="submit" className="h-12 shrink-0 px-6">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {unavailable
                  ? 'Directory unavailable'
                  : total === 0
                    ? 'No agents match these filters'
                    : `${total} licensed ${total === 1 ? 'agent' : 'agents'}`}
              </h2>
              {q && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Results for <span className="text-foreground">“{q}”</span>
                  {territory ? ` in ${territory}` : ''}
                </p>
              )}
            </div>

            {hasFilters && (
              <Button asChild variant="outline" size="sm">
                <Link href="/find-agent">Clear filters</Link>
              </Button>
            )}
          </div>

          {visibleBoards.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <Link
                href={directoryHref(current)}
                aria-current={!board ? 'true' : undefined}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  !board
                    ? 'border-[rgba(0,108,73,0.45)] bg-[rgba(0,108,73,0.18)] text-[#4edea3]'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                All boards
              </Link>
              {visibleBoards.map((entry) => {
                const selected = entry.value === board;
                return (
                  <Link
                    key={entry.value}
                    href={directoryHref(current, { board: selected ? undefined : entry.value })}
                    aria-current={selected ? 'true' : undefined}
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-[rgba(0,108,73,0.45)] bg-[rgba(0,108,73,0.18)] text-[#4edea3]'
                        : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    boardLabel(entry.value)
                    <span className="ml-1.5 text-xs opacity-70">{entry.count}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {agents.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                variant="bordered"
                size="md"
                icon={Users}
                title={unavailable ? 'We could not load the directory' : 'No agents match these filters'}
                description={
                  unavailable
                    ? 'Something went wrong on our side. Try again in a moment.'
                    : hasFilters
                      ? 'Try a different board or jurisdiction, or clear the filters to see everyone.'
                      : 'No agent has an approved, in-date licence for a professional board yet. As agents complete verification they will appear here.'
                }
                action={
                  hasFilters ? (
                    <Button asChild variant="outline">
                      <Link href="/find-agent">Clear filters</Link>
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
              <Button asChild variant="outline" size="sm" className={page <= 1 ? 'pointer-events-none opacity-50' : ''}>
                <Link href={directoryHref(current, { board, page: Math.max(1, page - 1) })}>Previous</Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
              >
                <Link href={directoryHref(current, { board, page: Math.min(totalPages, page + 1) })}>Next</Link>
              </Button>
            </nav>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            How we vet the network
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The directory only lists what we can evidence.
          </p>
          <div className="mt-8">
            <FaqAccordion faqs={FAQS} />
          </div>
        </div>
      </section>

      {/* Jurisdiction ledger */}
      {facets.territories.length > 0 && (
        <section className="border-t border-border py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Where agents operate
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Only jurisdictions with at least one listed agent appear here.
            </p>

            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {facets.territories.map((entry) => (
                <li key={entry.value} className="min-w-0">
                  <Link
                    href={`/find-agent?territory=${encodeURIComponent(entry.value)}`}
                    className="glass-card flex min-w-0 items-center justify-between gap-3 p-4 transition-colors hover:border-[rgba(0,108,73,0.45)]"
                  >
                    <span className="truncate text-sm font-medium text-foreground">{entry.value}</span>
                    <span className="shrink-0 text-sm text-muted-foreground">{entry.count}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button asChild variant="outline">
                <Link href="/contact-us">
                  Ask about another area
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Accreditation CTA */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="glass-card flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-foreground md:text-2xl">Are you a licensed agent?</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Add your board licence to your PropatiBox profile and it appears here once our verification team
                approves it.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/verification">Submit a licence</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
