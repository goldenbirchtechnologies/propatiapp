'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import {
  Users,
  Mail,
  Phone,
  ExternalLink,
  X as Twitter,
  ArrowRight,
  Award,
  Handshake,
} from 'lucide-react';

/* ================================================================
   TEAM PAGE — leadership and staff bios
   ================================================================ */

interface TeamMember {
  name: string;
  role: string;
  department: string;
  bio: string;
  avatarFallback: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
}

const leadership: TeamMember[] = [
  {
    name: 'Chidi Okonkwo',
    role: 'Chief Executive Officer',
    department: 'Executive',
    bio: 'Chidi founded PROPATI in 2021 with a mission to make Nigeria&apos;s property market transparent and accessible. Previously, he led product at a top fintech company and holds an MBA from Lagos Business School.',
    avatarFallback: 'CO',
    email: 'chidi@propati.ng',
    twitter: 'https://twitter.com/chidi_okonkwo',
    linkedin: 'https://linkedin.com/in/chidi-okonkwo',
  },
  {
    name: 'Amina Bello',
    role: 'Chief Operating Officer',
    department: 'Operations',
    bio: 'Amina oversees day-to-day operations, ensuring that listings, payments, and tenant support run smoothly across all Nigerian states. She brings 12 years of real estate operations experience.',
    avatarFallback: 'AB',
    email: 'amina@propati.ng',
    linkedin: 'https://linkedin.com/in/amina-bello',
  },
  {
    name: 'Emeka Eze',
    role: 'Chief Technology Officer',
    department: 'Engineering',
    bio: 'Emeka leads a 40-person engineering team building secure, scalable infrastructure for property transactions. He was previously a senior engineer at a major cloud provider and holds a BEng from UNILAG.',
    avatarFallback: 'EE',
    email: 'emeka@propati.ng',
    twitter: 'https://twitter.com/emeka_eze',
    linkedin: 'https://linkedin.com/in/emeka-eze',
  },
  {
    name: 'Fatima Abdullahi',
    role: 'Chief Financial Officer',
    department: 'Finance',
    bio: 'Fatima manages PROPATI&apos;s financial strategy, investor relations, and regulatory compliance. A chartered accountant with a background in private equity, she ensures the company remains well-capitalized.',
    avatarFallback: 'FA',
    email: 'fatima@propati.ng',
    linkedin: 'https://linkedin.com/in/fatima-abdullahi',
  },
];

const coreTeam: TeamMember[] = [
  {
    name: 'Ngozi Okafor',
    role: 'Head of Product',
    department: 'Product',
    bio: 'Ngozi defines the product roadmap and works closely with engineering and design to ship features that delight tenants, landlords, and agents alike.',
    avatarFallback: 'NO',
    email: 'ngozi@propati.ng',
  },
  {
    name: 'Tunde Bakare',
    role: 'Head of Sales & Partnerships',
    department: 'Commercial',
    bio: 'Tunde drives agent adoption and landlord partnerships across Nigeria. His extensive network in the real estate industry has helped onboard 2,000+ verified agents.',
    avatarFallback: 'TB',
    phone: '+234 801 234 5678',
    linkedin: 'https://linkedin.com/in/tunde-bakare',
  },
  {
    name: 'Blessing Adeyemi',
    role: 'Head of Customer Success',
    department: 'Support',
    bio: 'Blessing leads the customer success team, ensuring every user — from first-time tenants to top-tier landlords — gets the help they need.',
    avatarFallback: 'BA',
    email: 'blessing@propati.ng',
  },
  {
    name: 'Yusuf Garba',
    role: 'Head of Engineering',
    department: 'Engineering',
    bio: 'Yusuf manages the backend and platform engineering teams, focusing on reliability, security, and performance across PROPATI&apos;s cloud infrastructure.',
    avatarFallback: 'YG',
    email: 'yusuf@propati.ng',
    twitter: 'https://twitter.com/yusuf_garba',
  },
  {
    name: 'Chinwe Nwosu',
    role: 'Legal Counsel',
    department: 'Legal',
    bio: 'Chinwe advises on contracts, property disputes, and regulatory compliance. She ensures PROPATI&apos;s agreements are fair, enforceable, and aligned with Nigerian law.',
    avatarFallback: 'CN',
    email: 'chinwe@propati.ng',
  },
  {
    name: 'Oluwatobi Adeleke',
    role: 'Head of Marketing',
    department: 'Marketing',
    bio: 'Oluwatobi drives brand awareness through content, events, and digital campaigns. She has a background in brand strategy at a leading advertising agency.',
    avatarFallback: 'OA',
    email: 'oluwatobi@propati.ng',
    linkedin: 'https://linkedin.com/in/oluwatobi-adeleke',
  },
];

function ContactActions({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
      {member.email && (
        <Link
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          {member.email}
        </Link>
      )}
      {member.phone && (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          {member.phone}
        </span>
      )}
      {member.linkedin && (
        <Link
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          LinkedIn
        </Link>
      )}
      {member.twitter && (
        <Link
          href={member.twitter}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <Twitter className="h-3.5 w-3.5" />
          Twitter
        </Link>
      )}
    </div>
  );
}

function MemberCard({ member, featured = false }: { member: TeamMember; featured?: boolean }) {
  return (
    <Card
      className={cn(
        'flex flex-col h-full border-border shadow-1 transition-shadow hover:shadow-card-hover',
        featured && 'border-primary/30 bg-primary/[0.02]'
      )}
    >
      <CardContent className="flex flex-1 flex-col p-6 gap-4">
        {/* Avatar + badge */}
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 border-2 border-border">
            <AvatarImage src={undefined} alt={member.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
              {member.avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-foreground truncate">{member.name}</h3>
            <p className="text-sm text-primary font-medium">{member.role}</p>
            {featured && (
              <Badge variant="outline" className="mt-1 text-xs border-primary/40 text-primary">Executive</Badge>
            )}
          </div>
        </div>

        {/* Bio */}
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">{member.bio}</p>

        {/* Contact actions */}
        <ContactActions member={member} />
      </CardContent>
    </Card>
  );
}

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.08),transparent_40%)]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 mb-4">
              Leadership &amp; Team
            </p>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              The people building PROPATI
            </h1>
            <p className="mt-4 text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              A diverse team of engineers, operators, and real estate professionals committed to transforming the Nigerian property market.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="secondary" asChild>
                <Link href="#leadership" className="gap-2">
                  <Award className="h-4 w-4" />
                  Meet the Leadership
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" asChild>
                <Link href="#core-team">
                  <Users className="h-4 w-4 mr-2" />
                  Core Team
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Section */}
      <section id="leadership" className="py-16 md:py-24 bg-surface-dim/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider px-4 py-1.5">
              <Award className="h-3.5 w-3.5" />
              Executive Leadership
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-on-surface">
              Our executive team
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Years of combined experience in real estate, technology, finance, and law guide every decision we make.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {leadership.map((member) => (
              <MemberCard key={member.name} member={member} featured />
            ))}
          </div>
        </div>
      </section>

      {/* Core Team Section */}
      <section id="core-team" className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-residential-teal/10 text-residential-teal text-xs font-semibold uppercase tracking-wider px-4 py-1.5">
              <Users className="h-3.5 w-3.5" />
              Core Team
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl font-bold text-on-surface">
              Our department heads
            </h2>
            <p className="mt-2 text-muted-foreground max-w-xl mx-auto">
              Every department at PROPATI is led by a specialist deeply invested in making the platform a success.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {coreTeam.map((member) => (
              <MemberCard key={member.name} member={member} />
            ))}
          </div>

          {/* Join CTA */}
          <div className="mt-16 text-center">
            <Card className="border-border bg-card shadow-1 max-w-2xl mx-auto">
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <Handshake className="h-10 w-10 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Interested in joining the team?</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  We&apos;re always looking for talented individuals who care about transparency, technology, and trust.
                </p>
                <Button size="lg" asChild>
                  <Link href="/careers" className="gap-2">
                    View Open Roles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="py-12 md:py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Users className="h-10 w-10 mx-auto text-primary mb-4" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Want to connect with the team?</h2>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto">
            Reach out directly via email, or open a support ticket and we&apos;ll route you to the right person.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/support">
                <Mail className="h-4 w-4 mr-2" />
                Open a Support Ticket
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact-us">
                <Phone className="h-4 w-4 mr-2" />
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
