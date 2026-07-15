'use client';

import Link from 'next/link';
import MaterialIcon from '@/components/icons/material-icon';

export default function MarketplacePage() {
  const categories = [
    {
      title: 'Residential Sector',
      subtitle: 'Curated Living Spaces for the Discerning Professional.',
      description:
        'Access exclusive listings in the most sought-after neighborhoods. Our residential portfolio is strictly vetted for structural integrity and legal transparency.',
      tag: 'Residential Sector',
      color: 'text-primary',
      bg: 'bg-residential-teal-soft',
      border: 'border-primary/10',
      hoverClass: 'hover:text-primary hover:border-primary',
      buttonText: 'Explore Residential Portfolio',
      icon: 'trending_flat',
    },
    {
      title: 'Commercial Sector',
      subtitle: 'Strategic Business Locations to Scale Your Operations.',
      description:
        'From Class-A office towers to strategic retail storefronts, we connect institutions with high-yield commercial assets.',
      tag: 'Commercial Sector',
      color: 'text-commercial-gold',
      bg: 'bg-commercial-gold-soft',
      border: 'border-commercial-gold/10',
      hoverClass: 'hover:text-commercial-gold hover:border-commercial-gold',
      buttonText: 'View Commercial Insights',
      icon: 'trending_flat',
    },
  ];

  const properties = [
    {
      id: 1,
      title: 'The Emerald Heights Penthouse',
      price: '₦125,000,000',
      location: 'Ikoyi, Lagos State',
      type: 'Residential',
      listingType: 'FOR SALE',
      typeColor: 'bg-residential-teal',
      listingColor: 'bg-type-sale',
      beds: 4,
      baths: 5,
      area: '450m²',
      iconBed: 'bed',
      iconBath: 'bathtub',
      iconArea: 'square_foot',
      hoverTitle: 'group-hover:text-primary',
      hoverForward: 'text-primary',
      hoverForwardBg: 'bg-surface-container-low',
    },
    {
      id: 2,
      title: 'Apex Tower Corporate Hub',
      price: '₦8,500,000/yr',
      location: 'Victoria Island, Lagos',
      type: 'Commercial',
      listingType: 'FOR LEASE',
      typeColor: 'bg-commercial-gold',
      listingColor: 'bg-type-lease',
      beds: 12,
      baths: null,
      area: '1200m²',
      iconBed: 'meeting_room',
      iconBath: null,
      iconArea: 'square_foot',
      hoverTitle: 'group-hover:text-commercial-gold',
      hoverForward: 'text-commercial-gold',
      hoverForwardBg: 'bg-surface-container-low',
    },
    {
      id: 3,
      title: 'Oakwood Garden Duplex',
      price: '₦4,200,000/yr',
      location: 'Lekki Phase 1, Lagos',
      type: 'Residential',
      listingType: 'FOR RENT',
      typeColor: 'bg-residential-teal',
      listingColor: 'bg-type-rent',
      beds: 3,
      baths: 4,
      area: null,
      iconBed: 'bed',
      iconBath: 'bathtub',
      iconArea: 'square_foot',
      hoverTitle: 'group-hover:text-primary',
      hoverForward: 'text-primary',
      hoverForwardBg: 'bg-surface-container-low',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Top Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-surface/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-display-lg font-display-lg font-bold text-primary uppercase tracking-tighter">
              PROPATI
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-primary font-body-lg text-body-lg border-b-2 border-primary pb-1">
                Browse
              </span>
              <Link href="/listings" className="text-muted-foreground font-body-lg text-body-lg hover:text-primary transition-colors">
                Listings
              </Link>
              <Link href="/insights" className="text-muted-foreground font-body-lg text-body-lg hover:text-primary transition-colors">
                Insights
              </Link>
              <Link href="/valuation" className="text-muted-foreground font-body-lg text-body-lg hover:text-primary transition-colors">
                Valuation
              </Link>
              <Link href="/agency" className="text-muted-foreground font-body-lg text-body-lg hover:text-primary transition-colors">
                Agency
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with Advanced Search */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden -mt-20">
            <div className="absolute inset-0 z-0">
              <div className="w-full h-full bg-surface-container/30" />
            </div>
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="font-display-lg text-4xl sm:text-5xl md:text-6xl leading-tight font-extrabold text-white mb-6 drop-shadow-lg">
                Define Your Future Environment.
              </h1>

              {/* Advanced Search Box */}
              <div className="bg-white/95 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-white/20">
                <div className="flex flex-col gap-6">
                  {/* Category Toggles */}
                  <div className="flex items-center justify-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all bg-primary text-white">
                      <span className="material-symbols-outlined">home</span>
                      Residential
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all bg-surface-container-high text-muted-foreground hover:bg-surface-container-highest">
                      <span className="material-symbols-outlined">business</span>
                      Commercial
                    </button>
                  </div>

                  {/* Main Search Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-7 relative">
                      <input
                        className="w-full h-14 pl-12 bg-background border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary font-body-lg"
                        placeholder="Enter city, neighborhood, or specific building name..."
                        type="text"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                        search
                      </span>
                    </div>
                    <div className="md:col-span-3">
                      <select className="w-full h-14 px-4 bg-background border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary font-body-lg appearance-none">
                        <option>Looking to Buy</option>
                        <option>Looking to Rent</option>
                        <option>Looking to Lease</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <button className="w-full h-14 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md">
                        Search
                      </button>
                    </div>
                  </div>

                  {/* Budget & Advanced Row */}
                  <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-border">
                    <div className="flex flex-col gap-2 items-start w-full md:w-1/2">
                      <div className="flex justify-between w-full text-xs font-label-caps text-muted-foreground">
                        <span>Budget Range</span>
                        <span className="font-bold text-primary">₦500k - ₦50M+</span>
                      </div>
                      <input
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer range-slider"
                        max="100000000"
                        min="100000"
                        step="100000"
                        type="range"
                      />
                    </div>
                    <div className="flex gap-4">
                      <Link
                        href="/properties/advanced-search"
                        className="flex items-center gap-2 text-xs font-label-caps text-muted-foreground hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        Advanced Filters
                      </Link>
                      <button className="flex items-center gap-2 text-xs font-label-caps text-muted-foreground hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        Map View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Properties Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-headline-lg font-heading-lg text-foreground mb-2">
                  Featured Opportunities
                </h2>
                <p className="text-muted-foreground">Verified listings curated for professional standards and reliability.</p>
              </div>
              <div className="flex bg-muted p-1 rounded-full border border-border">
                <button className="px-6 py-2 rounded-full font-bold text-sm bg-white shadow-sm text-primary">All</button>
                <button className="px-6 py-2 rounded-full font-bold text-sm text-muted-foreground hover:text-primary transition-colors">
                  Residential
                </button>
                <button className="px-6 py-2 rounded-full font-bold text-sm text-muted-foreground hover:text-primary transition-colors">
                  Commercial
                </button>
              </div>
            </div>

            {/* Property Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {properties.map((property) => (
                <article
                  key={property.id}
                  className="group bg-card rounded-2xl overflow-hidden border border-border transition-all hover:shadow-card-hover cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <div className="w-full h-full bg-muted group-hover:scale-110 transition-transform duration-700" />
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-3 py-1 ${property.typeColor} text-white font-label-caps rounded-full shadow-lg`}>
                        {property.type}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 ${property.listingColor} text-white font-label-caps rounded-full shadow-lg`}>
                        {property.listingType}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg font-label-caps text-primary font-bold">
                      {property.price}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`text-title-md font-title-md text-foreground mb-2 ${property.hoverTitle} transition-colors`}>
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <span className="material-symbols-outlined text-[18px]">location_on</span>
                      <span className="text-sm">{property.location}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-t border-border">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1 text-muted-foreground font-label-caps">
                          <MaterialIcon name={property.iconBed} className="material-symbols-outlined text-[16px]" /> {property.beds}
                        </div>
                        {property.iconBath && (
                          <div className="flex items-center gap-1 text-muted-foreground font-label-caps">
                            <MaterialIcon name={property.iconBath} className="material-symbols-outlined text-[16px]" /> {property.baths}
                          </div>
                        )}
                        {property.area && (
                          <div className="flex items-center gap-1 text-muted-foreground font-label-caps">
                            {property.area ? (<><MaterialIcon name={property.iconArea} className="material-symbols-outlined text-[16px]" /> {property.area}</>) : null}
                          </div>
                        )}
                      </div>
                      <button className={`w-10 h-10 rounded-full ${property.hoverForwardBg} flex items-center justify-center ${property.hoverForward} hover:bg-primary hover:text-white transition-all`}>
                        <MaterialIcon name=""arrow_forward"" className="material-symbols-outlined" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Category Callout */}
          <section className="mb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map((cat) => (
                <div
                  key={cat.title}
                  className={`${cat.bg} rounded-3xl p-10 sm:p-12 flex flex-col justify-center items-start border ${cat.border}`}
                >
                  <span className="px-4 py-1 bg-primary text-white font-label-caps rounded-full mb-6">
                    {cat.tag}
                  </span>
                  <h2 className="text-headline-lg font-heading-lg text-foreground mb-4">{cat.title}</h2>
                  <p className="text-muted-foreground mb-8 text-lg">{cat.description}</p>
                  <button
                    className={`border-b-2 ${cat.color} font-bold hover:gap-4 flex items-center gap-2 transition-all group`}
                  >
                    {cat.buttonText}
                    <MaterialIcon name=""arrow_forward"" className="material-symbols-outlined group-hover:translate-x-2 transition-transform" />
                      {cat.icon}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </section>

        {/* Footer */}
        <footer className="w-full py-12 bg-surface-container-highest border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-title-md font-title-md font-bold text-primary mb-4 uppercase tracking-tight">
                  PROPATI
                </h3>
                <p className="text-sm text-muted-foreground pr-8">
                  Nigeria&apos;s premier real estate marketplace. Professional standards, verified listings, and data-driven insights.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Residential</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/properties/residential-rent" className="hover:text-primary underline">Residential Rent</Link></li>
                  <li><Link href="/properties/residential-buy" className="hover:text-primary underline">Residential Buy</Link></li>
                  <li><Link href="/properties/short-let" className="hover:text-primary underline">Short-let</Link></li>
                  <li><Link href="/properties/room-share" className="hover:text-primary underline">Room Share</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Commercial</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/properties/commercial-lease" className="hover:text-primary underline">Commercial Lease</Link></li>
                  <li><Link href="/properties/commercial-buy" className="hover:text-primary underline">Commercial Buy</Link></li>
                  <li><Link href="/properties/industrial" className="hover:text-primary underline">Industrial Units</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Support</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><Link href="/help-center" className="hover:text-primary underline">Help Center</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-primary underline">Terms of Service</Link></li>
                  <li><Link href="/professional-standards" className="hover:text-primary underline">Professional Standards</Link></li>
                </ul>
              </div>
            </div>
            <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <span className="text-sm text-muted-foreground font-body-sm">
                &copy; {new Date().getFullYear()} PROPATI Real Estate. Professional Standards Assured.
              </span>
              <div className="flex gap-6">
                <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-primary">public</span>
                <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-primary">share</span>
                <span className="material-symbols-outlined text-muted-foreground cursor-pointer hover:text-primary">hub</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
