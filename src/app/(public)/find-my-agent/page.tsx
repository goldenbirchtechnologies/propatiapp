'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Star, ChevronDown, Grid, List } from 'lucide-react';
import Image from 'next/image';

interface AgentResult {
  id: string;
  name: string;
  title: string;
  company: string;
  photo: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  salesVolume: string;
  priceRange: string;
  location: string;
  specialities: string[];
  isTopAgent: boolean;
}

// Mock agent data — in production this queries Supabase or Zillow-style live API
const mockAgents: AgentResult[] = [
  {
    id: '1',
    name: 'Matt Larity',
    title: 'Real Estate Agent',
    company: 'Americorp Real Estate',
    photo: 'https://images.unsplash.com/photo-1507003211169-c0a010004511?w=150&h=150&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 2022,
    salesCount: 5920,
    salesVolume: 'Chicago',
    priceRange: '$43K - $4.3M',
    location: 'Chicago, IL',
    specialities: ['First-Time Home Buyer', 'Relocation', 'Waterfront'],
    isTopAgent: true,
  },
  {
    id: '2',
    name: 'Sam B Shaffer',
    title: 'Real Estate Agent',
    company: 'Chicago Properties',
    photo: 'https://images.unsplash.com/photo-1507003211169-c0a010004511?w=150&h=150&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 895,
    salesCount: 3200,
    salesVolume: 'Chicago',
    priceRange: '$130K - $5.7M',
    location: 'Chicago, IL',
    specialities: ['First-Time Home Buyer', 'New Construction'],
    isTopAgent: true,
  },
  {
    id: '3',
    name: 'Vesta Preferred Realty',
    title: 'Broker',
    company: 'Vesta Preferred LLC',
    photo: 'https://images.unsplash.com/photo-1507003211169-c0a010004511?w=150&h=150&fit=crop&crop=face',
    rating: 5.0,
    reviewCount: 908,
    salesCount: 4500,
    salesVolume: 'Chicago',
    priceRange: '$50K - $3.2M',
    location: 'Chicago, IL',
    specialities: ['First-Time Home Buyer', 'Relocation', 'Luxury'],
    isTopAgent: true,
  },
  {
    id: '4',
    name: 'Jennifer Martinez',
    title: 'Real Estate Agent',
    company: 'Dream Home Realty',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c2a77d604?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 1432,
    salesCount: 4800,
    salesVolume: 'Chicago',
    priceRange: '$75K - $2.8M',
    location: 'Chicago, IL',
    specialities: ['First-Time Home Buyer', 'Investors'],
    isTopAgent: false,
  },
  {
    id: '5',
    name: 'David Kim',
    title: 'Real Estate Agent',
    company: 'Urban Edge Realty',
    photo: 'https://images.unsplash.com/photo-1507003211169-c0a010004511?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    reviewCount: 765,
    salesCount: 3100,
    salesVolume: 'Chicago',
    priceRange: '$95K - $4.1M',
    location: 'Chicago, IL',
    specialities: ['Relocation', 'Waterfront', 'First-Time Home Buyer'],
    isTopAgent: false,
  },
  {
    id: '6',
    name: 'Sarah Thompson',
    title: 'Broker Associate',
    company: 'Windy City Real Estate',
    photo: 'https://images.unsplash.com/photo-1507003211169-c0a010004511?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    reviewCount: 920,
    salesCount: 3850,
    salesVolume: 'Chicago',
    priceRange: '$60K - $3.9M',
    location: 'Chicago, IL',
    specialities: ['Luxury', 'Investors'],
    isTopAgent: false,
  },
];

export default function FindMyAgentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState('Chicago, IL');
  const [agentName, setAgentName] = useState('');
  const [activeFilter, setActiveFilter] = useState<'buying' | 'selling'>('buying');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [results, setResults] = useState<AgentResult[]>(mockAgents);
  const [showFilters, setShowFilters] = useState(false);

  // Live query: sync URL params to form state
  useEffect(() => {
    const loc = searchParams.get('location');
    const name = searchParams.get('q') || searchParams.get('agent');
    const filter = searchParams.get('filter');

    if (loc) setLocation(loc);
    if (name) setAgentName(name);
    if (filter === 'selling') setActiveFilter('selling');
    else if (filter === 'buying') setActiveFilter('buying');
  }, [searchParams]);

  // Live query: filter agents based on search (simulated — real impl calls API)
  const handleSearch = () => {
    const query = agentName.toLowerCase().trim();
    const filtered = query
      ? mockAgents.filter(a =>
          a.name.toLowerCase().includes(query) ||
          a.company.toLowerCase().includes(query)
      )
      : mockAgents;
    setResults(filtered);
    // Live query: update URL
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (query) params.set('q', query);
    params.set('filter', activeFilter);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleLocationChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black pb-12">
      {/* Header Section */}
      <div className="bg-white dark:bg-[#09090b] border-b border-zinc-200 dark:border-white/[0.07]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Find a Real Estate Agent
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-xl">
            Search verified real estate agents by location, name, or specialty.
            Get matched with top-rated professionals for buying, selling, or renting.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6 mb-6">
        <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-md p-4">
          <div className="flex gap-3">
            {/* Location input */}
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="City, neighborhood, or ZIP code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleLocationChange}
                className="w-full pl-9 h-10 text-sm bg-[#F8FAFC] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Agent name input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Agent name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full pl-9 h-10 text-sm bg-[#F8FAFC] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Find My Agent Button — cloned from Zillow screenshot */}
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            >
              <Search className="h-4 w-4" />
              <span className="font-semibold">Find My Agent</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveFilter('buying')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeFilter === 'buying'
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Buying
          </button>
          <button
            onClick={() => setActiveFilter('selling')}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeFilter === 'selling'
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Selling
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="pb-3 px-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
          >
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="py-4 flex flex-wrap gap-4">
            <select className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
              <option>Specialty</option>
              <option>First-Time Home Buyer</option>
              <option>Luxury</option>
              <option>Investors</option>
            </select>
            <select className="text-sm border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
              <option>Language</option>
              <option>English</option>
              <option>Spanish</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {results.length} agents found
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {results.map((agent) => (
            <AgentCard key={agent.id} agent={agent} viewMode={viewMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ agent, viewMode }: { agent: AgentResult; viewMode: 'grid' | 'list' }) {
  return (
    <div
      className={`bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 cursor-pointer transition-shadow hover:shadow-md ${
        viewMode === 'list' ? 'flex items-center gap-6' : 'flex flex-col items-center text-center'
      }`}
    >
      <div className={`relative ${viewMode === 'list' ? 'w-20 h-20' : 'w-24 h-24'} rounded-full overflow-hidden mb-4 ${viewMode === 'list' ? 'mb-0' : ''}`}>
        <Image
          src={agent.photo}
          alt={agent.name}
          fill
          className="object-cover"
        />
        {agent.isTopAgent && (
          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            TOP
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className={viewMode === 'list' ? 'text-left' : 'text-center'}>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{agent.name}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{agent.title} · {agent.company}</p>

          <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-white">{agent.rating}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-400">({agent.reviewCount} reviews)</span>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
            <div>{agent.priceRange}</div>
            <div>{agent.salesCount.toLocaleString()} transactions</div>
          </div>
        </div>
      </div>
    </div>
  );
}
