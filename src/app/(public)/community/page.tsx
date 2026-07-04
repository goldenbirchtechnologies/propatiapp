'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

/* ================================================================
   COMMUNITY — Events & Market Updates
   Sections: hero, events (RSVP mock), market stats, CTA band
   Style: tokens-only, reuses public section patterns
   ================================================================ */

type EventCategory = 'Webinar' | 'Meetup' | 'Workshop' | 'Market Update';

type CommunityEvent = {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees: number;
  rsvpCount: number;
};

const events: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'Lekki Phase 1 Market Trends 2026 — Live Webinar',
    category: 'Market Update',
    date: '2025-07-12',
    time: '10:00 AM — 11:30 AM (WAT)',
    location: 'Online (Zoom)',
    description:
      'Join our chief analyst for a data-led walkthrough of rents, yields, and buyer sentiment across Lekki Phase 1.',
    attendees: 234,
    rsvpCount: 189,
  },
  {
    id: 'evt-2',
    title: 'Tenant Rights: Know Before You Sign — Workshop',
    category: 'Workshop',
    date: '2025-07-19',
    time: '2:00 PM — 4:00 PM (WAT)',
    location: 'Ikeja GRA Community Centre',
    description:
      'A practical workshop on deposit protection, habitability standards, and how to dispute unfair evictions.',
    attendees: 120,
    rsvpCount: 98,
  },
  {
    id: 'evt-3',
    title: 'PROPATI Agents Networking Night',
    category: 'Meetup',
    date: '2025-07-25',
    time: '6:00 PM — 9:00 PM (WAT)',
    location: 'Victoria Island, Lagos',
    description:
      'Connect with fellow agents, share leads, and learn commission tips from top performers on the platform.',
    attendees: 80,
    rsvpCount: 64,
  },
  {
    id: 'evt-4',
    title: 'How to Price Short-Lets for Corporate Rentals — Webinar',
    category: 'Webinar',
    date: '2025-08-02',
    time: '11:00 AM — 12:00 PM (WAT)',
    location: 'Online (Zoom)',
    description:
      'Short-let demand is booming. Learn dynamic pricing, occupancy optimisation, and guest-verification workflows.',
    attendees: 310,
    rsvpCount: 275,
  },
];

const categoryColorMap: Record<EventCategory, string> = {
  Webinar: 'bg-primary/10 text-primary border-primary/20',
  Meetup: 'bg-secondary/10 text-secondary border-secondary/20',
  Workshop: 'bg-warning/10 text-warning border-warning/20',
  'Market Update': 'bg-residential-teal/10 text-residential-teal border-residential-teal/20',
};

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type MarketStat = {
  label: string;
  value: string;
  change: string;
  changeDirection: 'up' | 'down';
  helper?: string;
};

const marketStats: MarketStat[] = [
  { label: 'Avg. Rent (1BR, Lekki)', value: '₦4.2M/yr', change: '+8.4%', changeDirection: 'up', helper: 'vs Q2 2025' },
  { label: 'Avg. Rent (2BR, VI)', value: '₦7.8M/yr', change: '+5.1%', changeDirection: 'up', helper: 'vs Q2 2025' },
  { label: 'Avg. Sale (3BR, Ikeja)', value: '₦185M', change: '+3.2%', changeDirection: 'up', helper: 'vs Q2 2025' },
  { label: 'Days on Market (Lagos)', value: '42 days', change: '-6.0%', changeDirection: 'down', helper: 'faster closings' },
  { label: 'Short-Let Occupancy (Ikoyi)', value: '89%', change: '+4.5%', changeDirection: 'up', helper: 'peak season' },
  { label: 'Active Listings (Lagos)', value: '12,480', change: '+2.1%', changeDirection: 'up', helper: 'new uploads this month' },
];

export default function CommunityPage() {
  const [rsvpSet, setRsvpSet] = useState<Set<string>>(new Set());

  const handleRsvp = (eventId: string) => {
    setRsvpSet((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Community & Market
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Events, RSVPs & latest stats
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Meet other property players, register for workshops, and stay ahead of the
              market with live data from Nigerian real estate.
            </p>
          </div>
        </div>
      </section>

      {/* Events + RSVP */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Upcoming Events</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                RSVP mock — click RSVP to simulate booking your spot.
              </p>
            </div>
            <Badge variant="outline" className="rounded-full border-border text-xs font-semibold">
              {events.length} events
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => {
              const isRsvped = rsvpSet.has(event.id);
              return (
                <Card
                  key={event.id}
                  className="rounded-xl border-border bg-card hover:shadow-2 transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-full text-xs font-semibold px-2.5 py-0.5',
                            categoryColorMap[event.category]
                          )}
                        >
                          {event.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.rsvpCount}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatEventDate(event.date)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {event.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {event.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="font-medium">{event.location}</span>
                      <span className="text-border">·</span>
                      <span>{event.time}</span>
                    </div>

                    <div className="mt-5 flex items-center justify-between">
                      <div className="w-full bg-muted rounded-full h-2 mr-4">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((event.rsvpCount / event.attendees) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {Math.round((event.rsvpCount / event.attendees) * 100)}%
                      </span>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <Button
                        size="sm"
                        variant={isRsvped ? 'secondary' : 'default'}
                        className="gap-2"
                        onClick={() => handleRsvp(event.id)}
                      >
                        {isRsvped ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            RSVP&apos;d
                          </>
                        ) : (
                          <>RSVP</>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {event.attendees - event.rsvpCount} spots left
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Market Stats */}
      <section className="py-12 md:py-16 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Latest Property Market Stats</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Key signals from Lagos &amp; Abuja — refreshed monthly.
              </p>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {marketStats.map((stat) => (
              <Card key={stat.label} className="rounded-xl border-border bg-background shadow-1">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-bold text-foreground">{stat.value}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border',
                        stat.changeDirection === 'up'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      )}
                    >
                      {stat.changeDirection === 'up' ? '↑' : '↓'} {stat.change}
                    </span>
                    {stat.helper && (
                      <span className="text-xs text-muted-foreground">{stat.helper}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Join the PROPATI community</h2>
          <p className="mt-3 text-primary-foreground/80 max-w-2xl mx-auto">
            From webinars to neighbourhood meetups, there&apos;s a seat for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              View All Events <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Become a Member
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
