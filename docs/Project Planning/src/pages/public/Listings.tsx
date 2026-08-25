import { useState } from "react";
import { Link } from "react-router";
import { SlidersHorizontal, Grid3X3, List, X, ChevronDown } from "lucide-react";
import { listings } from "../../data/mock";
import { PropertyCard, Btn } from "../../components/ui";

const categories = ["All", "Rent", "Buy", "Shortlet", "Lease", "Room Share"];
const bedroomOptions = ["Any", "1", "2", "3", "4", "5+"];
const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Most Verified"];

export default function Listings() {
  const [category, setCategory] = useState("All");
  const [bedrooms, setBedrooms] = useState("Any");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState("Newest First");
  const [search, setSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const filtered = listings.filter((l) => {
    const matchesCategory = category === "All" || l.type === category.toLowerCase();
    const matchesSearch =
      !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.address.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-30 bg-black/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search location or property…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category tabs */}
          <div className="hidden md:flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  category === cat
                    ? "bg-emerald-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Sort */}
            <div className="relative hidden sm:block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-3 pr-7 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none cursor-pointer"
              >
                {sortOptions.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
              >
                <Grid3X3 size={13} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}
              >
                <List size={13} />
              </button>
            </div>

            {/* Filter drawer toggle */}
            <button
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 border border-zinc-800 bg-zinc-950 rounded-lg hover:border-zinc-600 transition-colors"
            >
              <SlidersHorizontal size={12} />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0 space-y-6">
            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Type</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                      category === cat ? "bg-emerald-500/10 text-emerald-400" : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Min (₦)"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Max (₦)"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Bedrooms</h3>
              <div className="flex flex-wrap gap-1.5">
                {bedroomOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBedrooms(b)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      bedrooms === b
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Verification</h3>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm text-zinc-300">Verified only</span>
              </label>
            </div>

            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Amenities</h3>
              <div className="space-y-2">
                {["Swimming Pool", "Gym", "24/7 Security", "Generator", "Car Park", "Smart Home"].map((a) => (
                  <label key={a} className="flex items-center gap-2.5 cursor-pointer">
                    <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-950 flex-shrink-0" />
                    <span className="text-sm text-zinc-400 hover:text-zinc-200">{a}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-zinc-500">
                Showing <span className="text-white font-medium">{filtered.length}</span> properties
                {category !== "All" && ` · ${category}`}
              </p>
            </div>

            <div className={viewMode === "grid" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
              {filtered.map((listing) => (
                <Link key={listing.id} to={`/listings/${listing.id}`}>
                  <PropertyCard listing={listing} />
                </Link>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-3 py-20 text-center text-zinc-600">
                  No properties match your filters. Try adjusting your search.
                </div>
              )}
            </div>

            {/* Load more */}
            <div className="text-center mt-10">
              <Btn variant="secondary" size="lg">
                Load more listings
              </Btn>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setFilterOpen(false)} />
          <div className="relative ml-auto w-[320px] h-full bg-zinc-950 border-l border-white/[0.08] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
              <span className="text-white font-semibold">Filters</span>
              <button onClick={() => setFilterOpen(false)} className="text-zinc-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Bedrooms</h3>
                <div className="flex flex-wrap gap-2">
                  {bedroomOptions.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBedrooms(b)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        bedrooms === b ? "bg-emerald-500 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input type="text" placeholder="Min (₦)" className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none" />
                  <input type="text" placeholder="Max (₦)" className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-700 focus:outline-none" />
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-white/[0.08] flex gap-2">
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 text-sm text-zinc-400 border border-zinc-800 rounded-lg hover:text-white transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setFilterOpen(false)}
                className="flex-1 py-2.5 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
