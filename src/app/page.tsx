'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [category, setCategory] = useState<'residential' | 'commercial'>('residential');
  const [budgetValue, setBudgetValue] = useState(100000);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(value);
  };

  const toggleCategory = (cat: 'residential' | 'commercial') => {
    setCategory(cat);
  };

  return (
    <div className="bg-surface font-body-lg text-on-surface antialiased">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline shadow-sm">
        <div className="flex justify-between items-center h-20 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-display-lg text-display-lg font-bold text-primary dark:text-primary-fixed uppercase tracking-tighter">
              PROPATI
            </Link>
            <nav className="hidden md:flex gap-6">
              <div className="group relative py-4 cursor-pointer active:opacity-80 transition-all text-primary dark:text-primary-fixed border-b-2 border-primary dark:border-primary-fixed pb-1 font-body-lg text-body-lg">
                Browse
                {/* Mega Menu */}
                <div className="absolute top-[100%] left-0 w-[600px] bg-white shadow-xl rounded-xl p-8 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 border border-outline-variant z-50">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-bold text-primary mb-4">Residential</h4>
                      <ul className="space-y-2">
                        <li className="hover:text-primary cursor-pointer text-on-surface-variant">Apartments for Rent</li>
                        <li className="hover:text-primary cursor-pointer text-on-surface-variant">Houses for Sale</li>
                        <li className="hover:text-primary cursor-pointer text-on-surface-variant">Short-let Stays</li>
                        <li className="hover:text-primary cursor-pointer text-on-surface-variant">Luxury Estates</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-commercial-gold mb-4">Commercial</h4>
                      <ul className="space-y-2">
                        <li className="hover:text-commercial-gold cursor-pointer text-on-surface-variant">Office Spaces</li>
                        <li className="hover:text-commercial-gold cursor-pointer text-on-surface-variant">Retail Warehouses</li>
                        <li className="hover:text-commercial-gold cursor-pointer text-on-surface-variant">Industrial Hubs</li>
                        <li className="hover:text-commercial-gold cursor-pointer text-on-surface-variant">Land for Lease</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <Link href="/listings" className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed cursor-pointer active:opacity-80 transition-all font-body-lg text-body-lg">
                Listings
              </Link>
              <Link href="/insights" className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed cursor-pointer active:opacity-80 transition-all font-body-lg text-body-lg">
                Insights
              </Link>
              <Link href="/valuation" className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed cursor-pointer active:opacity-80 transition-all font-body-lg text-body-lg">
                Valuation
              </Link>
              <Link href="/agency" className="text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed cursor-pointer active:opacity-80 transition-all font-body-lg text-body-lg">
                Agency
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-on-surface-variant">
              <button className="material-symbols-outlined hover:bg-surface-container-low transition-colors p-2 rounded-full">
                notifications
              </button>
              <button className="material-symbols-outlined hover:bg-surface-container-low transition-colors p-2 rounded-full">
                favorite
              </button>
            </div>
            <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-bold transition-all active:scale-95 shadow-md">
              List Property
            </button>
            <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant cursor-pointer">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUsw3rrhZQeZSpdx-CFPuAgeo8o3Jg8C_Q52bF_KqzBBVOROOXz7Y04WZSTBpc9URRbBfcPDIuNb9nzmPx36SCPkS2vkZ5lJy-oTNlssYjurz-6lU1zjTcP9ici5-ZwmFWCVHPk3G46IyNTPCMdr0Gc438UG6oLLAQ6Czg94jAn0EDJOQINNTxkDU8mGeDass0QF85fduGX79fm72xF5ig3YBd-lCn7-wngkl2Z-tjzg9x_ecUdND7"
                alt="Professional agent avatar"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* Hero Section with Advanced Search */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyb0_8AiXYjkWOvrsX6HKuCTBTF-B13KXmbZe5bAP1hmhDGL9RuD8j76Iav5tzCSZArlSJYJnuXQcbqOpqOZHonaHU8bjq5ObRDzvQZhc3UIxTadhK_79Hd6w1HrrKjVqPSXW-kHMteFwkQV83tZmLF02BTqc8sUDd9oh6pVT98cFHhGuL81_GwnzbP0cj70-QkU9histim_P_kC3Pj6zxycSpIWcJ7CL8W2OzJeizckcrR8GWKn3G"
              alt="Contemporary architectural masterpiece"
              fill
              className="object-cover brightness-[0.7]"
              priority
            />
          </div>
          <div className="relative z-10 w-full max-w-container-max px-margin-desktop text-center">
            <h1 className="font-display-lg text-[64px] leading-tight font-extrabold text-white mb-6 drop-shadow-lg">
              Define Your Future Environment.
            </h1>
            {/* Advanced Search Box */}
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-4xl mx-auto border border-white/20">
              <div className="flex flex-col gap-6">
                {/* Category Toggles */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => toggleCategory('residential')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                      category === 'residential'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined">home</span>
                    Residential
                  </button>
                  <button
                    onClick={() => toggleCategory('commercial')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                      category === 'commercial'
                        ? 'bg-commercial-gold text-white'
                        : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined">business</span>
                    Commercial
                  </button>
                </div>
                {/* Main Search Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-7 relative">
                    <input
                      type="text"
                      className="w-full h-14 px-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary font-body-lg"
                      placeholder="Enter city, neighborhood, or specific building name..."
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">
                      search
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <select className="w-full h-14 px-4 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary font-body-lg appearance-none">
                      {category === 'residential' ? (
                        <>
                          <option value="buy">Looking to Buy</option>
                          <option value="rent">Looking to Rent</option>
                        </>
                      ) : (
                        <>
                          <option value="buy">Purchase Assets</option>
                          <option value="rent">Rent Facility</option>
                          <option value="lease">Looking to Lease</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <button className="w-full h-14 bg-primary-container text-white rounded-xl font-bold hover:brightness-110 transition-all flex items-center justify-center gap-2">
                      Search
                    </button>
                  </div>
                </div>
                {/* Budget & Advanced Row */}
                <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-outline-variant">
                  <div className="flex flex-col gap-2 items-start w-full md:w-1/2">
                    <div className="flex justify-between w-full font-label-caps text-on-surface-variant">
                      <span>Budget Range</span>
                      <span className="font-bold text-primary">
                        Up to {formatCurrency(budgetValue)}
                      </span>
                    </div>
                    <input
                      type="range"
                      className="range-slider w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer"
                      min="100000"
                      max="100000000"
                      step="100000"
                      value={budgetValue}
                      onChange={(e) => setBudgetValue(parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                      Advanced Filters
                    </button>
                    <button className="flex items-center gap-2 font-label-caps text-on-surface-variant hover:text-primary transition-colors">
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
        <section className="py-24 px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">Featured Opportunities</h2>
              <p className="text-on-surface-variant">Verified listings curated for professional standards and reliability.</p>
            </div>
            <div className="flex bg-surface-container p-1 rounded-full border border-outline-variant">
              <button className="px-6 py-2 rounded-full font-bold text-body-sm bg-white shadow-sm text-primary">All</button>
              <button className="px-6 py-2 rounded-full font-bold text-body-sm text-on-surface-variant hover:text-primary transition-colors">Residential</button>
              <button className="px-6 py-2 rounded-full font-bold text-body-sm text-on-surface-variant hover:text-primary transition-colors">Commercial</button>
            </div>
          </div>
          {/* Property Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Property Card 1 (Residential) */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-outline-variant transition-all hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBd5-x5XSuD07lQq6ik0pXMxCimmUDW0GS-60ev8nygMkfARM_DljZDhDKgNY8hskF4HPBermPzpn2AgHQxNVDLZtJfy_jsxPyrfO86P10E6wt4NBaK-5_pVlQHMQ4ufgLA4xdf_t1ETubPd2d_T7KOzSuCfZQ83QFnKCygE5Pmm-txZ8eprWRPepNgcNQmxTh1yt1E2QDqm8NNRUoxHufHFBbtgqylNlWZNI5zkemCvCzVo7RtdArv"
                  alt="Modern residential apartment interior"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-residential-teal text-white font-label-caps rounded-full shadow-lg">RESIDENTIAL</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-type-sale text-white font-label-caps rounded-full shadow-lg">FOR SALE</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg font-label-caps text-primary font-bold">
                  ₦125,000,000
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-2 group-hover:text-primary transition-colors">
                  The Emerald Heights Penthouse
                </h3>
                <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-body-sm">Ikoyi, Lagos State</span>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-outline-variant">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">bed</span> 4
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">bathtub</span> 5
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">square_foot</span> 450m²
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Property Card 2 (Commercial) */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-outline-variant transition-all hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfqMDKHi4JwIPQDIw3dxaVj6Xs92UxO9c3wvgz0kmRZ6b4Cv77d9tpdPLJ6TeppTKbDa7yh1LBQxnfT6sFv0kg5MyP9i1GVIgvpgk_rlaw_rjG5uxb5kTTK3EGZX2Yr1ExhgjqY5_oyulsejlQ6CE2gxtAKutX1FafjKDk2Mn4I5OmZ8sNBySHANNH82nF2Z2mP2QztGGznx7woQiV8p9RHkxkUb1dX5pmd88EfBWT1M9qysJlccEp"
                  alt="Commercial office building exterior"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-commercial-gold text-white font-label-caps rounded-full shadow-lg">COMMERCIAL</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-type-lease text-white font-label-caps rounded-full shadow-lg">FOR LEASE</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg font-label-caps text-primary font-bold">
                  ₦8,500,000/yr
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-2 group-hover:text-commercial-gold transition-colors">
                  Apex Tower Corporate Hub
                </h3>
                <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-body-sm">Victoria Island, Lagos</span>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-outline-variant">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">meeting_room</span> 12
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">local_parking</span> 20
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">square_foot</span> 1200m²
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-commercial-gold hover:bg-commercial-gold hover:text-white transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Property Card 3 (Residential - Rent) */}
            <div className="group bg-white rounded-2xl overflow-hidden border border-outline-variant transition-all hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05)] cursor-pointer">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_zSArSuecOv0eGbbb3ZV0K2EovHLqoAB29ytOppsaRlx5pQz98hjzqbLMVHGjOAXtxr1g9J9iylmS38eFbAjirM8VaWlN2VhdbpEt7wlaUWLKTjrwgxMXlCdEIWPumsFOeSgtzDDZgDufLR8qaL_pE1_-oHEr73Ab5xzZ0K0wdcVCBaiKBF3Lq0it0WgvnKejX-0auJ30Usv00LFD63t58qrY_WYRnYiKfRQsRD8eeglTnINwg1Xn"
                  alt="Residential duplex exterior"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="px-3 py-1 bg-residential-teal text-white font-label-caps rounded-full shadow-lg">RESIDENTIAL</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-type-rent text-white font-label-caps rounded-full shadow-lg">FOR RENT</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg font-label-caps text-primary font-bold">
                  ₦4,200,000/yr
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-title-md text-title-md text-on-surface mb-2 group-hover:text-primary transition-colors">
                  Oakwood Garden Duplex
                </h3>
                <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <span className="text-body-sm">Lekki Phase 1, Lagos</span>
                </div>
                <div className="flex justify-between items-center py-4 border-t border-outline-variant">
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">bed</span> 3
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">bathtub</span> 4
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant font-label-caps">
                      <span className="material-symbols-outlined text-[16px]">pool</span> Yes
                    </div>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Callout (Asymmetric) */}
        <section className="mb-24 px-margin-desktop max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-residential-teal-soft rounded-3xl p-12 flex flex-col justify-center items-start border border-primary/10">
              <span className="px-4 py-1 bg-primary text-on-primary font-label-caps rounded-full mb-6">Residential Sector</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Curated Living Spaces for the Discerning Professional.</h2>
              <p className="text-on-surface-variant mb-8 text-lg">Access exclusive listings in the most sought-after neighborhoods. Our residential portfolio is strictly vetted for structural integrity and legal transparency.</p>
              <button className="border-b-2 border-primary text-primary font-bold hover:gap-4 flex items-center gap-2 transition-all group">
                Explore Residential Portfolio
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">trending_flat</span>
              </button>
            </div>
            <div className="bg-commercial-gold-soft rounded-3xl p-12 flex flex-col justify-center items-start border border-commercial-gold/10">
              <span className="px-4 py-1 bg-commercial-gold text-white font-label-caps rounded-full mb-6">Commercial Sector</span>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Strategic Business Locations to Scale Your Operations.</h2>
              <p className="text-on-surface-variant mb-8 text-lg">From Class-A office towers to strategic retail storefronts, we connect institutions with high-yield commercial assets.</p>
              <button className="border-b-2 border-commercial-gold text-commercial-gold font-bold hover:gap-4 flex items-center gap-2 transition-all group">
                View Commercial Insights
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">trending_flat</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-surface-container-highest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter px-margin-desktop max-w-container-max mx-auto mb-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-title-md text-title-md font-bold text-primary dark:text-primary-fixed mb-6 uppercase">PROPATI</h3>
            <p className="text-on-surface-variant text-body-sm pr-8">Nigeria&apos;s premier real estate taxonomy platform. Professional standards, verified listings, and data-driven insights.</p>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Residential</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Residential Rent</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Residential Buy</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Short-let</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Room Share</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Commercial</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Commercial Lease</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Commercial Buy</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Industrial Units</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-on-surface mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Help Center</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Terms of Service</Link></li>
              <li><Link href="#" className="text-on-surface-variant hover:text-primary underline transition-colors duration-200 text-body-sm">Professional Standards</Link></li>
            </ul>
          </div>
        </div>
        <div className="px-margin-desktop max-w-container-max mx-auto pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-on-surface-variant font-body-sm">© 2024 PROPATI Real Estate. Professional Standards Assured.</span>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">face_nod</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">alternate_email</span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">dine_in</span>
          </div>
        </div>
      </footer>

      {/* Custom CSS for range slider and Material Symbols */}
      <style jsx global>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .range-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0e7c6a;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .range-slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #0e7c6a;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}
