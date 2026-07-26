'use client';

import * as React from 'react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar } from 'lucide-react';

/* ================================================================
   BLOG / NEWS — Cards & Categories
   ================================================================ */

type Category = 'All' | 'Guides' | 'Market' | 'Legal' | 'Agent Stories';

const categories: Category[] = ['All', 'Guides', 'Market', 'Legal', 'Agent Stories'];

const posts = [
  {
    title: '5 Rights Every Nigerian Tenant Should Know',
    excerpt:
      'From rent control to habitability standards, understand what protections you are entitled to before signing a lease.',
    category: 'Guides',
    date: '2025-06-12',
    readTime: '6 min read',
  },
  {
    title: 'How to Price Your Rental in Lekki Phase 1',
    excerpt:
      'A data-driven look at average rents, vacancy rates, and seasonal trends for premium apartments.',
    category: 'Market',
    date: '2025-05-28',
    readTime: '8 min read',
  },
  {
    title: 'Escrow 101: Why Secure Payments Matter',
    excerpt:
      'How PROPATI escrow protects both tenants and landlords from fraud and disputes.',
    category: 'Legal',
    date: '2025-05-10',
    readTime: '5 min read',
  },
  {
    title: 'Agent Spotlight: Ada’s Rise to Top Broker',
    excerpt:
      'From podcasting to property deals, Ada shares her rituals and tech stack for closing faster.',
    category: 'Agent Stories',
    date: '2025-04-22',
    readTime: '10 min read',
  },
  {
    title: 'The Ultimate Move-In Checklist',
    excerpt:
      'Utility transfers, painting allowances, and inspection tips every tenant should run through.',
    category: 'Guides',
    date: '2025-04-05',
    readTime: '4 min read',
  },
  {
    title: 'Q2 Market Report: Short-Let Demand in Lagos',
    excerpt:
      'New short-let regulations, occupancy data, and hotspots for corporate rentals this quarter.',
    category: 'Market',
    date: '2025-03-18',
    readTime: '7 min read',
  },
  {
    title: 'What Landlords Must Disclose by Law',
    excerpt:
      'Covenants, service charges, and known defects — transparency requirements for landlords in Nigeria.',
    category: 'Legal',
    date: '2025-03-02',
    readTime: '6 min read',
  },
  {
    title: 'Building Trust with Digital Verification',
    excerpt:
      'How certified inspections, drone footage, and digitised records are reshaping property trust.',
    category: 'Agent Stories',
    date: '2025-02-14',
    readTime: '9 min read',
  },
];

const categoryColorMap: Record<string, string> = {
  Guides: 'bg-residential-teal/10 text-residential-teal border-residential-teal/20',
  Market: 'bg-commercial-gold/10 text-commercial-gold border-commercial-gold/20',
  Legal: 'bg-tertiary/10 text-tertiary border-tertiary/20',
  'Agent Stories': 'bg-primary/10 text-primary border-primary/20',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredPosts =
    activeCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Blog & News
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Insights for smarter property decisions
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Guides, market analysis, legal tips, and stories from the front line of
              Nigerian real estate.
            </p>
          </div>
        </div>
      </section>

      {/* Categories + Grid */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-semibold transition-colors border',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary'
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Cards */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                No articles in this category yet.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <Card
                  key={post.title}
                  className="rounded-xl border-border bg-card hover:shadow-2 transition-all group cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-full text-xs font-semibold px-2.5 py-0.5',
                          categoryColorMap[post.category] ||
                            'bg-muted/50 text-muted-foreground border-border'
                        )}
                      >
                        {post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.date)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {post.readTime}
                      </span>
                      <span className="inline-flex items-center text-sm font-semibold text-primary">
                        Read{' '}
                        <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
