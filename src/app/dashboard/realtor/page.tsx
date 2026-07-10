'use client';

import Link from 'next/link';

export default function RealtorDashboardPage() {
  return (
    <div className="p-margin-mobile md:p-lg space-y-lg">
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .glass-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(226, 232, 240, 0.5);
        }
      `}</style>
      {/* Top Row Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-lg">
        {/* Stat 1 */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-secondary p-sm bg-secondary/10 rounded-lg">
              account_balance_wallet
            </span>
            <span className="text-tertiary-fixed-dim text-label-sm font-bold">+12% this month</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md">Total Commission (₦)</p>
          <h3 className="font-headline-md text-headline-md text-primary">₦12,400,000</h3>
        </div>
        {/* Stat 2 */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-secondary p-sm bg-secondary/10 rounded-lg">
              rocket_launch
            </span>
            <span className="text-on-surface-variant text-label-sm font-medium">3 closed today</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md">Active Deals</p>
          <h3 className="font-headline-md text-headline-md text-primary">18</h3>
        </div>
        {/* Stat 3 */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-secondary p-sm bg-secondary/10 rounded-lg">
              apartment
            </span>
            <span className="text-on-surface-variant text-label-sm font-medium">95% Occupancy</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md">Managed Units</p>
          <h3 className="font-headline-md text-headline-md text-primary">42</h3>
        </div>
        {/* Stat 4 */}
        <div className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-sm">
            <span className="material-symbols-outlined text-secondary p-sm bg-secondary/10 rounded-lg">
              event_available
            </span>
            <span className="text-error text-label-sm font-bold">Action Required</span>
          </div>
          <p className="text-on-surface-variant font-label-md text-label-md">Pending Inspections</p>
          <h3 className="font-headline-md text-headline-md text-primary">5</h3>
        </div>
      </div>
      {/* Main Layout: Kanban + Widgets */}
      <div className="bento-grid">
        {/* Deal Pipeline (Kanban Board) - 8 Cols */}
        <section className="col-span-12 xl:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
          <div className="flex justify-between items-center mb-lg">
            <h4 className="font-headline-sm text-headline-sm text-primary">Deal Pipeline</h4>
            <div className="flex gap-sm">
              <button
                className="p-base text-on-surface-variant hover:text-primary transition-colors"
                aria-label="Filter"
              >
                <span className="material-symbols-outlined">filter_list</span>
              </button>
              <button
                className="p-base text-on-surface-variant hover:text-primary transition-colors"
                aria-label="More options"
              >
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
          <div className="flex gap-lg overflow-x-auto pb-md scroll-hide">
            {/* Column 1: Enquiry */}
            <div className="flex-shrink-0 w-64 space-y-md">
              <div className="flex items-center justify-between bg-surface-container p-sm rounded-lg">
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                  Enquiry
                </span>
                <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                  4
                </span>
              </div>
              <div className="space-y-md">
                {/* Card */}
                <div className="bg-white border border-outline-variant rounded-xl p-sm shadow-sm hover:-translate-y-1 hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                  <div className="w-full h-32 rounded-lg mb-sm overflow-hidden bg-surface-dim">
                    <img
                      className="w-full h-full object-cover"
                      data-alt="A luxury penthouse in Lagos, Nigeria, showcasing a sleek exterior with floor-to-ceiling glass windows and a private balcony overlooking the city skyline at dusk. The building is illuminated with warm, golden ambient lighting. The photography is sharp and architectural, emphasizing luxury and modern design."
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWD1mSNDJ6gt_XdeNGwHD2hNBEDzWzkKERrmZmtRlvTWQuo-Ne71I3pY1C-e_mIj_1ZOXP-32KcxSMO1_yLiG27I1K-cW4kOc2FrT2gbUmHqY3rArjRe8ShSsdhluRHtbK3NIGFoJW8LhiH5AkI6Q9-Oxt7aLos5Xzgn5B2hkQYCu4bF0WqEeIlRW9wo78gBygMXgFjuKIhcA0EfZ_VhrFSaog_8fF6uF9Ne1jeU1--igfzySZObegavkgdCxjrmiHWNJJSXTr0i4"
                    />
                  </div>
                  <div className="px-xs pb-xs">
                    <h5 className="font-bold text-body-sm text-primary truncate">
                      The Obsidian Penthouse
                    </h5>
                    <p className="text-body-sm text-on-surface-variant mb-sm">Emeka Okafor</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-label-md bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded-full">
                        2 Days
                      </span>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border border-white bg-slate-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Card 2 */}
                <div className="bg-white border border-outline-variant rounded-xl p-sm shadow-sm hover:-translate-y-1 transition-all">
                  <div className="px-xs py-xs">
                    <h5 className="font-bold text-body-sm text-primary truncate">Ikoyi Garden Suite</h5>
                    <p className="text-body-sm text-on-surface-variant mb-sm">Bolanle T.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-label-md bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">
                        4 Days
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Column 2: Viewing Scheduled */}
            <div className="flex-shrink-0 w-64 space-y-md">
              <div className="flex items-center justify-between bg-surface-container p-sm rounded-lg">
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                  Viewing
                </span>
                <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                  3
                </span>
              </div>
              <div className="space-y-md">
                <div className="bg-white border border-outline-variant rounded-xl p-sm shadow-sm hover:-translate-y-1 transition-all">
                  <div className="px-xs py-xs">
                    <h5 className="font-bold text-body-sm text-primary truncate">
                      Victoria Island Studio
                    </h5>
                    <p className="text-body-sm text-on-surface-variant mb-sm">James Wilson</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-label-md bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded-full">
                        1 Day
                      </span>
                      <span className="material-symbols-outlined text-sm text-secondary">
                        calendar_today
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Column 3: Offer Made */}
            <div className="flex-shrink-0 w-64 space-y-md">
              <div className="flex items-center justify-between bg-surface-container p-sm rounded-lg">
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                  Offer
                </span>
                <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                  2
                </span>
              </div>
              <div className="space-y-md">
                <div className="bg-white border border-outline-variant border-l-4 border-l-secondary rounded-xl p-sm shadow-sm hover:-translate-y-1 transition-all">
                  <div className="px-xs py-xs">
                    <h5 className="font-bold text-body-sm text-primary truncate">Banana Island Villa</h5>
                    <p className="text-body-sm text-on-surface-variant mb-sm">Aliko D.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-label-md bg-secondary-container/20 text-secondary-container px-2 py-0.5 rounded-full">
                        6 Days
                      </span>
                      <span className="font-bold text-primary">₦45M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Column 4: Agreement Signed */}
            <div className="flex-shrink-0 w-64 space-y-md">
              <div className="flex items-center justify-between bg-surface-container p-sm rounded-lg">
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                  Agreement
                </span>
                <span className="bg-primary/10 text-primary px-2 rounded-full text-[10px] font-bold">
                  1
                </span>
              </div>
            </div>
            {/* Column 5: Completed */}
            <div className="flex-shrink-0 w-64 space-y-md">
              <div className="flex items-center justify-between bg-surface-container-high p-sm rounded-lg">
                <span className="font-label-md text-label-md uppercase tracking-widest text-primary">
                  Completed
                </span>
                <span className="bg-tertiary-fixed-dim/20 text-on-tertiary-container px-2 rounded-full text-[10px] font-bold">
                  8
                </span>
              </div>
            </div>
          </div>
        </section>
        {/* Sidebar Widgets - 4 Cols */}
        <aside className="col-span-12 xl:col-span-4 space-y-lg">
          {/* Commission Tracker Widget */}
          <div className="bg-primary-container text-on-primary rounded-xl p-lg shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
            <h4 className="font-headline-sm text-headline-sm text-secondary-fixed mb-lg">
              Commission Tracker
            </h4>
            <div className="space-y-lg">
              <div>
                <div className="flex justify-between items-center mb-xs">
                  <span className="text-label-sm font-label-sm opacity-80">Paid</span>
                  <span className="text-body-sm font-bold text-secondary-fixed">₦8.2M</span>
                </div>
                <div className="h-2 bg-primary/40 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary-container w-[65%]"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="bg-primary/20 p-md rounded-lg border border-on-primary-container/10">
                  <p className="text-label-sm font-label-sm opacity-60 uppercase mb-xs">Pending</p>
                  <p className="font-headline-sm text-headline-sm text-secondary-fixed">₦3.1M</p>
                </div>
                <div className="bg-primary/20 p-md rounded-lg border border-on-primary-container/10">
                  <p className="text-label-sm font-label-sm opacity-60 uppercase mb-xs">Confirmed</p>
                  <p className="font-headline-sm text-headline-sm text-secondary-fixed">₦1.1M</p>
                </div>
              </div>
              <button className="w-full text-center py-sm text-label-md font-label-md text-secondary-fixed-dim hover:underline transition-all">
                View Full Report →
              </button>
            </div>
          </div>
          {/* Managed Listings Preview */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-lg shadow-sm">
            <div className="flex justify-between items-center mb-md">
              <h4 className="font-headline-sm text-headline-sm text-primary">Top Listings</h4>
              <span className="text-label-sm font-label-sm text-secondary">Active: 42</span>
            </div>
            <div className="space-y-md">
              {/* Listing Item */}
              <div className="flex items-center gap-md group cursor-pointer p-xs hover:bg-surface-container rounded-lg transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    data-alt="A modern duplex house in Lekki Phase 1, Lagos, featuring a sharp white facade with dark grey accents. The building has an elegant stone-paved driveway and manicured tropical greenery. The photo is taken in bright daylight, highlighting the premium finish and cleanliness."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv8iug6DqkzeNOSD8-suQP0zF370wiX-t_uJ1l28jr_af6WoZCkrSWNOO7CXEkuz2VoErNZCCNC83H_r642UZXlXx5v8D2fO0SzEUxeGi9EEkd-cGhml5qegS0V5VMCd_jCk-HzMKSYTbH6W5NLGt25T-NTPVd-dGP1sTfmaR5bq1QTl6AF5h5c507LNUqre73dTRwngOJjfo6WZIuYv3-RulmAB4pjDmvEhHRfi-KRhEmUFVT6dN9FOpxiZnoX0Y9TOqNB91NzZc"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-sm text-primary truncate">Lekki Phase 1 Duplex</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">₦120M / Year</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-body-sm text-primary">452</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">Views</p>
                </div>
              </div>
              {/* Listing Item 2 */}
              <div className="flex items-center gap-md group cursor-pointer p-xs hover:bg-surface-container rounded-lg transition-colors">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    data-alt="A stylish boutique apartment complex in Ikeja GRA, Lagos. The building features an artistic blend of wood-style panels and dark metal railings. It is surrounded by lush green lawns and a clear blue sky. The visual style is premium corporate photography, conveying trust and quality."
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsRVinY5B4y_SJCUSPVTE1-BKy4RzSKqIXLxkcHmdJ4_ByG98wFYgCOwO1ZI2qSJM3E2A_YAK1YjH6WmvOvG75nDpf79a4S7XEMPKlIRYWpftjFAG0fxeE5JwcJStoXm36vtxdtO5-GowRS0-h1fXa_-tf079iK7nDd1LFxRVaObRg2x4a8gcOywHCRUtKb3cvyA5ML7OF29u5Y9MSEdUSAdBPFXHQqjX0GayHc3-VHuPJdQ44qHyEe8BcE11EiHVjAbchZmLQ_6E"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-body-sm text-primary truncate">Ikeja GRA Boutique</p>
                  <p className="text-label-sm font-label-sm text-on-surface-variant">₦8.5M / Year</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-body-sm text-primary">318</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">Views</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-lg border border-primary text-primary py-3 rounded-xl font-label-md text-label-md hover:bg-primary hover:text-white transition-all">
              Manage All Listings
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
