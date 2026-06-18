import Link from 'next/link';
import { Building2, Home, Shield, Search, Users, DollarSign, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const features = [
  {
    icon: Shield,
    title: '5-Layer Verification',
    description: 'Every property goes through document checks, identity matching, video verification, physical inspection, and admin certification.',
  },
  {
    icon: Search,
    title: 'Smart Search & Filters',
    description: 'Filter by location, price, type, verification tier, and more. Find exactly what you need in seconds.',
  },
  {
    icon: DollarSign,
    title: 'Secure Escrow Payments',
    description: 'Pay with confidence. Funds held in escrow until both parties confirm satisfaction. Powered by Paystack.',
  },
  {
    icon: Users,
    title: 'Direct Communication',
    description: 'Chat directly with landlords and agents. Schedule viewings, negotiate terms, and keep all communication in one place.',
  },
  {
    icon: Building2,
    title: 'Estate Manager Tools',
    description: 'Portfolio management, rent collection, maintenance tracking, and team collaboration for property managers.',
  },
  {
    icon: Star,
    title: 'Agent Pipeline',
    description: 'Manage listings, track commissions, schedule inspections, and grow your real estate business.',
  },
];

const stats = [
  { value: '10,000+', label: 'Verified Properties' },
  { value: '50,000+', label: 'Active Users' },
  { value: '₦2.5B+', label: 'Transactions Secured' },
  { value: '98%', label: 'User Satisfaction' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
              <Home className="h-6 w-6" />
              PROPATI
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/listings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Find Property
              </Link>
              <Link href="/listings?listingType=rent" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Rent
              </Link>
              <Link href="/listings?listingType=sale" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Buy
              </Link>
              <Link href="/listings?listingType=short_let" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Short Let
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 sm:py-32 lg:py-40 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6 text-sm">
                Nigeria's Most Trusted Property Marketplace
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Find Your Perfect{' '}
                <span className="text-primary">Verified</span> Property
              </h1>
              <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
                Rent, buy, or short-let with confidence. Every listing verified through our
                5-layer process. Secure payments via escrow. Direct communication with owners.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/sign-up?role=tenant">
                  <Button size="lg" className="w-full sm:w-auto gap-2">
                    <Search className="h-4 w-4" />
                    Start Searching
                  </Button>
                </Link>
                <Link href="/sign-up?role=landlord">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                    List Your Property
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <dl className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Search Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <form action="/listings" className="space-y-4 md:space-y-0 md:flex md:gap-4">
                  <div className="flex-1">
                    <label htmlFor="location" className="sr-only">
                      Location
                    </label>
                    <input
                      id="location"
                      type="text"
                      placeholder="Search areas (e.g., Lekki, Ikeja, Victoria Island)..."
                      className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select className="flex h-12 w-48 rounded-lg border border-input bg-background px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">All Types</option>
                      <option value="rent">Rent</option>
                      <option value="sale">Buy</option>
                      <option value="short_let">Short Let</option>
                    </select>
                    <select className="flex h-12 w-40 rounded-lg border border-input bg-background px-4 py-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      <option value="">Any Price</option>
                      <option value="500000">₦500k+</option>
                      <option value="1000000">₦1M+</option>
                      <option value="2000000">₦2M+</option>
                      <option value="5000000">₦5M+</option>
                    </select>
                    <Button type="submit" className="h-12 px-6 gap-2">
                      <Search className="h-4 w-4" />
                      Search
                    </Button>
                  </div>
                </form>
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Or <Link href="/listings" className="font-medium text-primary hover:underline">browse all listings</Link>
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Choose PROPATI?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built for the Nigerian property market with trust and transparency at our core.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="card-hover">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-primary p-8 text-center text-white md:px-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to Find Your Perfect Property?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Join thousands of Nigerians who trust PROPATI for their property needs.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/sign-up?role=tenant">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2">
                    Create Free Account
                  </Button>
                </Link>
                <Link href="/listings">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10 gap-2">
                    Browse Listings
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                <Home className="h-6 w-6" />
                PROPATI
              </Link>
              <p className="mt-4 text-sm text-muted-foreground max-w-xs">
                Nigeria's most trusted property marketplace. Verified listings, secure payments, happy homes.
              </p>
            </div>
            <nav>
              <h3 className="font-semibold">For Tenants</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/listings?listingType=rent" className="hover:text-foreground transition-colors">Rent Apartments</Link></li>
                <li><Link href="/listings?listingType=short_let" className="hover:text-foreground transition-colors">Short Let</Link></li>
                <li><Link href="/tenant/search" className="hover:text-foreground transition-colors">Tenant Dashboard</Link></li>
              </ul>
            </nav>
            <nav>
              <h3 className="font-semibold">For Landlords & Agents</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/sign-up?role=landlord" className="hover:text-foreground transition-colors">List Property</Link></li>
                <li><Link href="/sign-up?role=agent" className="hover:text-foreground transition-colors">Agent Tools</Link></li>
                <li><Link href="/dashboard/properties" className="hover:text-foreground transition-colors">Landlord Dashboard</Link></li>
              </ul>
            </nav>
            <nav>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </nav>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} PROPATI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}