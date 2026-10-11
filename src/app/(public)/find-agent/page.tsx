'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Star, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface AgentResult {
  id: string;
  name: string;
  team: string;
  company: string;
  photo: string;
  rating: number;
  reviewCount: number;
  teamPriceRange: string;
  salesLast12: number;
  teamSales: number;
  isTopAgent?: boolean;
  isZillowPremier?: boolean;
}

// Exact data from Zillow screenshot
const mockAgents: AgentResult[] = [
  {
    id: '1',
    name: 'Matt Laricy',
    team: 'TEAM',
    company: 'Americorp Real Estate',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 2022,
    teamPriceRange: '$43K - $4.3M',
    salesLast12: 572,
    teamSales: 5920,
    isTopAgent: true,
  },
  {
    id: '2',
    name: 'Patrick Shino',
    team: 'TEAM',
    company: 'FULTON GRACE REALTY',
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 1323,
    teamPriceRange: '$115K - $2.7M',
    salesLast12: 142,
    teamSales: 659,
    isTopAgent: true,
  },
  {
    id: '3',
    name: 'Sam B Shaffer',
    team: 'TEAM',
    company: 'Chicago Properties',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 895,
    teamPriceRange: '$130K - $5.7M',
    salesLast12: 142,
    teamSales: 2040,
    isTopAgent: true,
  },
  {
    id: '4',
    name: 'Vesta Preferred Realty',
    team: 'TEAM',
    company: 'Vesta Preferred LLC',
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 908,
    teamPriceRange: '$68K - $3.1M',
    salesLast12: 747,
    teamSales: 3362,
    isTopAgent: true,
  },
  {
    id: '5',
    name: 'Bari Levine Bruszer',
    team: '',
    company: "Refine Residential x @properties Christie's...",
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 576,
    teamPriceRange: '$114K - $4.3M',
    salesLast12: 114,
    teamSales: 2059,
    isTopAgent: true,
  },
];

export default function FindAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState('');
  const [activeTab, setActiveTab] = useState<'location' | 'name'>('location');
  const [results, setResults] = useState<AgentResult[]>(mockAgents);

  useEffect(() => {
    const loc = searchParams.get('location') || searchParams.get('q');
    if (loc) setLocation(loc);
  }, [searchParams]);

  const handleSearch = () => {
    const q = location.toLowerCase().trim();
    const filtered = q
      ? mockAgents.filter(a => a.name.toLowerCase().includes(q) || a.company.toLowerCase().includes(q))
      : mockAgents;
    setResults(filtered);
    if (location) router.push(`?location=${encodeURIComponent(location)}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero - exact Zillow clone */}
      <div className="relative h-[420px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=1600&h=600&fit=crop&crop=face"
          alt="Agent"
          fill
          className="object-cover object-top"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-xl drop-shadow-lg">
            A great agent makes<br />all the difference
          </h1>
          <div className="mt-6 bg-white rounded-lg shadow-xl max-w-xl overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <p className="text-sm font-bold text-zinc-900">Find a real estate agent</p>
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setActiveTab('location')}
                  className={`px-3 py-1.5 text-xs font-bold border ${activeTab === 'location' ? 'bg-white border-blue-600 text-blue-600' : 'bg-zinc-100 border-zinc-300 text-zinc-600'}`}
                >
                  Location
                </button>
                <button
                  onClick={() => setActiveTab('name')}
                  className={`px-3 py-1.5 text-xs font-bold border ${activeTab === 'name' ? 'bg-white border-blue-600 text-blue-600' : 'bg-zinc-100 border-zinc-300 text-zinc-600'}`}
                >
                  Name
                </button>
              </div>
            </div>
            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center border border-zinc-300 rounded-md overflow-hidden">
                <div className="pl-3 pr-2 text-zinc-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="City, neighborhood, or ZIP code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 h-10 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
                />
                <button onClick={handleSearch} className="pr-3">
                  <Search className="h-4 w-4 text-zinc-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agents in Chicago */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Real Estate Agents in Chicago, IL</h2>
          <p className="text-xs text-zinc-600 mt-1 max-w-2xl mx-auto">
            With over a million agents from all the top brokerages, a local agent knows your market and can guide you through the process from start to finish
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          {/* Get help card - light blue, spans one grid cell */}
          <div className="bg-[#E8F4FD] border border-[#CDE8FB] rounded-md p-6 flex flex-col justify-center">
            <div className="flex gap-3">
              <div className="text-blue-600 mt-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M12 13c-4 0-7 2-7 5v2h14v-2c0-3-3-5-7-5z" />
                  <path d="M16 8l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Get help finding an agent</h3>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  We will pair you with a Zillow Premier Agent who has the inside scoop on your market.
                </p>
                <Link href="#" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">
                  Connect with a local agent
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button className="px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-600 rounded-sm hover:bg-blue-50">
            View more
          </button>
        </div>
      </div>

      {/* Second help banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-zinc-900">Get help finding an agent</h2>
            <p className="text-xs text-zinc-600 mt-1">We will pair you with a Zillow Premier Agent who has the inside scoop on your market.</p>
            <Link href="#" className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-sm hover:bg-blue-700">
              Connect with a local agent
            </Link>
          </div>
          <div className="w-full md:w-[520px] h-[180px] relative flex-shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop"
              alt="For Sale"
              fill
              className="object-cover rounded-md"
            />
          </div>
        </div>
      </div>

      {/* FAQ - dark */}
      <div className="bg-[#1A2B49] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-center mb-6">Frequently asked questions</h2>
          <div className="space-y-0 divide-y divide-white/20">
            {[
              'How to find a good real estate agent near me?',
              'How to pick a real estate agent?',
              'How to contact a real estate agent?',
              'How do I leave a review for a real estate agent?',
              'What is the difference between an agent and a broker?',
            ].map((q) => (
              <details key={q} className="group py-3">
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-medium">
                  {q}
                  <svg className="w-4 h-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Are you a real estate agent? */}
      <div className="bg-white border-t border-zinc-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-sm font-bold text-zinc-900">Are you a real estate agent?</h3>
          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
            Check out the extensive resources you can find in our <Link href="#" className="text-blue-600 underline">Premier Agent® Resource Center</Link>, covering
            everything from <Link href="#" className="text-blue-600 underline">business plan templates</Link> to complete guides on{' '}
            <Link href="#" className="text-blue-600 underline">real estate marketing</Link>. Not a Premier Agent yet? Find out how{' '}
            <Link href="#" className="text-blue-600 underline">real estate advertising</Link> on Zillow and Trulia can help you get more leads.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-6 bg-zinc-100 p-4 text-xs">
            <div>
              <p className="font-bold text-zinc-900">Real Estate Agents</p>
              <ul className="mt-2 space-y-1 text-zinc-600">
                <li>Chicago Real Estate Agents</li>
                <li>Cicero Real Estate Agents</li>
                <li>Stickney Real Estate Agents</li>
                <li>Berwyn Real Estate Agents</li>
                <li>Forestview Real Estate Agents</li>
                <li><Link href="#" className="text-blue-600 font-bold">+ Show more</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-zinc-900">Mortgage Lenders</p>
              <ul className="mt-2 space-y-1 text-zinc-600">
                <li>Chicago Mortgage Lenders</li>
                <li>Cicero Mortgage Lenders</li>
                <li>Stickney Mortgage Lenders</li>
                <li>Berwyn Mortgage Lenders</li>
                <li>Forestview Mortgage Lenders</li>
                <li><Link href="#" className="text-blue-600 font-bold">+ Show more</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-zinc-900">Home Builders</p>
              <ul className="mt-2 space-y-1 text-zinc-600">
                <li>Chicago Home Builders</li>
                <li>Cicero Home Builders</li>
                <li>Stickney Home Builders</li>
                <li>Berwyn Home Builders</li>
                <li>Forestview Home Builders</li>
                <li><Link href="#" className="text-blue-600 font-bold">+ Show more</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: AgentResult }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-md p-4 flex gap-4">
      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
        <Image src={agent.photo} alt={agent.name} fill className="object-cover" />
        <div className="absolute -top-1 -left-1 w-6 h-6 bg-[#1A2B49] rounded-full flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">LP</span>
        </div>
        {agent.isTopAgent && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-sm">
            <Star className="h-3 w-3 fill-blue-600 text-blue-600" />
            <span className="text-[8px] font-bold text-zinc-900">Top Agent</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            {agent.team && <p className="text-[10px] font-bold text-zinc-500 tracking-widest">{agent.team}</p>}
            <h3 className="text-sm font-bold text-zinc-900 leading-tight">{agent.name}</h3>
            <p className="text-xs text-zinc-600">{agent.company}</p>
          </div>
          <div className="text-right flex items-center gap-1">
            <span className="text-xs font-bold text-zinc-900">{agent.rating.toFixed(1)}</span>
            <Star className="h-3 w-3 fill-blue-600 text-blue-600" />
            <span className="text-xs text-zinc-500">({agent.reviewCount.toLocaleString()})</span>
          </div>
        </div>
        <div className="mt-2 space-y-0.5">
          <p className="text-xs font-bold text-zinc-900">{agent.teamPriceRange} team price range</p>
          <p className="text-xs text-zinc-600">{agent.salesLast12} sales last 12 months</p>
          <p className="text-xs font-bold text-zinc-900">{agent.teamSales.toLocaleString()} team sales in Chicago</p>
        </div>
      </div>
    </div>
  );
}
