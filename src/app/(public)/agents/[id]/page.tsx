'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Briefcase, Users, Phone, Mail, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgentCard, type Agent } from '@/components/agents/AgentCard';
import { ALL_AGENTS, generateMockAgents } from '@/lib/mock-agents';

const verificationColors = {
  basic: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  inspected: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  certified: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
} as const;

const verificationLabels = {
  basic: 'Basic',
  verified: 'Verified',
  inspected: 'Inspected',
  certified: 'Certified',
} as const;

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className="h-5 w-5 fill-warning text-warning" />
      ))}
      {hasHalf && (
        <span className="relative inline-flex">
          <Star className="h-5 w-5 text-muted" />
          <span className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="h-5 w-5 fill-warning text-warning" />
          </span>
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className="h-5 w-5 text-muted" />
      ))}
      <span className="ml-2 text-base font-bold text-on-surface">{rating.toFixed(1)}</span>
      <span className="text-sm text-on-surface-variant ml-1">rating</span>
    </span>
  );
}

function AgentProfileInner() {
  const params = useParams();
  const agentId = params.id as string;

  // Try to find agent in the shared list; fall back to a deterministic mock lookup.
  const agent: Agent | undefined = ALL_AGENTS.find((a) => a.id === agentId) ??
    generateMockAgents().find((a) => a.id === agentId);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center py-16 px-margin-mobile md:px-margin-desktop">
        <h1 className="text-2xl font-bold text-on-surface mb-2">Agent not found</h1>
        <p className="text-on-surface-variant mb-6">
          The agent profile you are looking for does not exist or has been removed.
        </p>
        <Link href="/agents">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Agents
          </Button>
        </Link>
      </div>
    );
  }

  // Mock active listings from same data source (re-using property template style)
  const activeListings = React.useMemo(() => {
    const items: { id: string; title: string; price: number; location: string; image: string }[] = [];
    for (let i = 0; i < 4; i++) {
      items.push({
        id: `${agent.id}-listing-${i + 1}`,
        title:
          i % 2 === 0
            ? '3 Bedroom Luxury Apartment with Pool'
            : 'Modern Office Space in Prime Location',
        price: (i + 1) * 8000000 + 2000000,
        location: agent.location,
        image: `https://picsum.photos/seed/${agent.id}-listing-${i + 1}/800/600`,
      });
    }
    return items;
  }, [agent.id, agent.location]);

  return (
    <div className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="bg-surface-elevated border-b border-outline-variant">
        <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-4">
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Agents
          </Link>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-6">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Left sidebar / agent summary */}
          <aside className="space-y-6">
            <div className="bg-white dark:bg-card rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="relative w-full aspect-square bg-surface-container">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 320px"
                />
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h1 className="text-xl font-bold text-on-surface font-display">{agent.name}</h1>
                  <p className="text-sm text-on-surface-variant">{agent.role}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={cn('capitalize font-semibold', verificationColors[agent.verificationTier])}>
                    {verificationLabels[agent.verificationTier]}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <StarRating rating={agent.rating} />
                </div>
                <p className="text-xs text-on-surface-variant">{agent.reviewCount} verified reviews</p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm text-on-surface">
                    <MapPin className="h-4 w-4 text-on-surface-variant" />
                    <span>{agent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface">
                    <Briefcase className="h-4 w-4 text-on-surface-variant" />
                    <span>{agent.experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-on-surface">
                    <Users className="h-4 w-4 text-on-surface-variant" />
                    <span>{agent.clientsServed} clients served</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <Button className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Agent
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Request Callback
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-8">
            {/* About */}
            <section className="bg-white dark:bg-card rounded-xl border border-outline-variant p-6 shadow-sm">
              <h2 className="text-headline-lg font-semibold text-on-surface mb-3">About</h2>
              <p className="text-body-md text-on-surface-variant leading-relaxed">{agent.bio}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {agent.specialty.map((spec) => (
                  <Badge key={spec} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Stats */}
            <section className="grid gap-6 sm:grid-cols-3">
              <div className="bg-white dark:bg-card rounded-xl border border-outline-variant p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary font-display">{agent.experience}y</p>
                <p className="text-sm text-on-surface-variant mt-1">Years of Experience</p>
              </div>
              <div className="bg-white dark:bg-card rounded-xl border border-outline-variant p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary font-display">{agent.listingsSold}</p>
                <p className="text-sm text-on-surface-variant mt-1">Properties Sold</p>
              </div>
              <div className="bg-white dark:bg-card rounded-xl border border-outline-variant p-5 shadow-sm text-center">
                <p className="text-3xl font-bold text-primary font-display">{agent.clientsServed}</p>
                <p className="text-sm text-on-surface-variant mt-1">Clients Served</p>
              </div>
            </section>

            {/* Active Listings */}
            <section>
              <h2 className="text-headline-lg font-semibold text-on-surface mb-4">Active Listings</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {activeListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="bg-white dark:bg-card rounded-xl overflow-hidden border border-outline-variant shadow-sm transition-all duration-200 card-hover"
                  >
                    <div className="relative w-full aspect-[4/3] bg-surface-container">
                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xl font-bold text-on-surface mb-1">
                        {listing.price.toLocaleString('en-NG', {
                          style: 'currency',
                          currency: 'NGN',
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      <h3 className="text-base font-semibold text-on-surface mb-2 line-clamp-1">
                        {listing.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <span className="material-symbols-outlined text-[18px]"><MaterialIcon name=location_on className="material-symbols-outlined" />
                        <span className="text-sm line-clamp-1">{listing.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* More from this agent placeholder */}
            <section>
              <h2 className="text-headline-lg font-semibold text-on-surface mb-4">Recommended Agents</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_AGENTS.filter((a) => a.id !== agent.id).slice(0, 3).map((recommended) => (
                  <AgentCard key={recommended.id} agent={recommended} />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AgentProfileInner;
