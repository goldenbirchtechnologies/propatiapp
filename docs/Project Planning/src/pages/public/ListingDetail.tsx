import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ChevronLeft, BedDouble, Bath, Square, MapPin, CheckCircle,
  Heart, Share2, Phone, MessageSquare, Wifi, Car, Dumbbell,
  Shield, Star, ArrowLeft, ArrowRight, Zap, Wind, TreePine,
} from "lucide-react";
import { listings, formatPrice } from "../../data/mock";
import { Badge, StatusBadge, StarRating, Btn } from "../../components/ui";

const galleryImages = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop&auto=format",
];

const amenities = [
  { icon: Wifi, label: "High-Speed WiFi" },
  { icon: Car, label: "Covered Parking" },
  { icon: Dumbbell, label: "Fitness Center" },
  { icon: Zap, label: "24hr Generator" },
  { icon: Wind, label: "Central AC" },
  { icon: TreePine, label: "Garden & Pool" },
  { icon: Shield, label: "24hr Security" },
  { icon: Star, label: "Concierge Service" },
];

export default function ListingDetail() {
  const { id } = useParams();
  const listing = listings.find((l) => l.id === id) ?? listings[0];
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = ["Overview", "Amenities", "Location", "Agent"];

  return (
    <div className="bg-black min-h-screen pt-16">
      {/* Back */}
      <div className="border-b border-white/[0.06] bg-black/80 backdrop-blur sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/listings" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
            <ChevronLeft size={16} />
            Back to listings
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-sm text-zinc-400 line-clamp-1">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_340px] gap-8">
          {/* Left */}
          <div>
            {/* Gallery */}
            <div className="mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-zinc-900 h-80 sm:h-[440px] border border-white/[0.08]">
                <img
                  src={galleryImages[activeImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                {/* Prev/Next */}
                <button
                  onClick={() => setActiveImage((p) => (p - 1 + galleryImages.length) % galleryImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveImage((p) => (p + 1) % galleryImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-white hover:bg-black/90 transition-colors"
                >
                  <ArrowRight size={16} />
                </button>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setSaved(!saved)}
                    className={`w-9 h-9 rounded-full bg-black/70 backdrop-blur flex items-center justify-center transition-colors ${saved ? "text-red-400" : "text-white hover:text-red-400"}`}
                  >
                    <Heart size={16} fill={saved ? "currentColor" : "none"} />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-black/70 backdrop-blur flex items-center justify-center text-white hover:text-emerald-400 transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>

                {/* Counter */}
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded-md bg-black/70 backdrop-blur text-white text-xs">
                  {activeImage + 1} / {galleryImages.length}
                </div>
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? "border-emerald-500" : "border-zinc-800 hover:border-zinc-600"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant={listing.type as "rent" | "sale" | "lease" | "shortlet"}>
                    {listing.type}
                  </Badge>
                  {listing.verified && (
                    <Badge variant="success">
                      <CheckCircle size={10} /> Verified
                    </Badge>
                  )}
                  <Badge variant="obsidian">{listing.tier}</Badge>
                </div>
                <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm mt-1">
                  <MapPin size={13} />
                  {listing.address}
                </div>
              </div>
            </div>

            {/* Specs */}
            <div className="flex gap-6 py-4 border-y border-white/[0.07] mb-6">
              {listing.beds > 0 && (
                <div className="flex items-center gap-2">
                  <BedDouble size={16} className="text-emerald-500" />
                  <div>
                    <div className="text-white font-semibold">{listing.beds}</div>
                    <div className="text-zinc-600 text-xs">Bedrooms</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Bath size={16} className="text-emerald-500" />
                <div>
                  <div className="text-white font-semibold">{listing.baths}</div>
                  <div className="text-zinc-600 text-xs">Bathrooms</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Square size={16} className="text-emerald-500" />
                <div>
                  <div className="text-white font-semibold">{listing.sqft.toLocaleString()}</div>
                  <div className="text-zinc-600 text-xs">Sq. Ft.</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-white/[0.07] mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? "border-white text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-white font-semibold mb-3">About this property</h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  This stunning {listing.beds > 0 ? `${listing.beds}-bedroom` : "commercial"} property is situated in the heart of{" "}
                  {listing.address.split(",")[1]?.trim() ?? "Lagos"}, offering world-class finishes and premium amenities. The property features a
                  modern open-plan living area, designer kitchen with high-end appliances, and floor-to-ceiling windows that flood each room
                  with natural light.
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed mt-3">
                  Located in one of Lagos's most desirable neighborhoods, residents enjoy easy access to top schools, hospitals,
                  restaurants, and major business districts. 24-hour security, backup power, and a professional management team ensure
                  a seamless living experience.
                </p>
              </div>
            )}

            {activeTab === "amenities" && (
              <div className="grid sm:grid-cols-2 gap-2">
                {amenities.map((a) => (
                  <div key={a.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-950 border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <a.icon size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-sm text-zinc-300">{a.label}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "location" && (
              <div className="rounded-2xl overflow-hidden border border-white/[0.08] h-64 bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} className="text-zinc-700 mx-auto mb-2" />
                  <p className="text-zinc-600 text-sm">Map view — {listing.address}</p>
                </div>
              </div>
            )}

            {activeTab === "agent" && (
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-950 border border-white/[0.08]">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format"
                  alt="Agent"
                  className="w-14 h-14 rounded-full object-cover border-2 border-zinc-800"
                />
                <div className="flex-1">
                  <div className="text-white font-semibold">Yetunde Afolabi</div>
                  <div className="text-zinc-500 text-sm">Licensed Agent · Lekki</div>
                  <div className="flex items-center gap-1 mt-1">
                    <StarRating />
                    <span className="text-xs text-zinc-600">4.9 (128 reviews)</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="success"><CheckCircle size={10} /> Verified</Badge>
                    <Badge variant="info">23 Active Listings</Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — Contact card */}
          <div className="mt-6 lg:mt-0">
            <div className="sticky top-28 space-y-4">
              <div className="glass-card p-6">
                <div className="mb-4">
                  <div className="text-emerald-400 font-black text-3xl">{formatPrice(listing.price, listing.type)}</div>
                  <div className="text-zinc-500 text-sm">{listing.priceUnit}</div>
                </div>

                <div className="space-y-2">
                  <Btn variant="primary" size="lg" className="w-full justify-center">
                    <Phone size={15} />
                    Call Agent
                  </Btn>
                  <Btn variant="secondary" size="lg" className="w-full justify-center">
                    <MessageSquare size={15} />
                    Send Message
                  </Btn>
                  <button className="w-full h-11 px-4 text-sm font-medium rounded-lg text-white border border-[#25d366]/30 bg-[#25d366]/10 hover:bg-[#25d366]/20 transition-colors flex items-center justify-center gap-2">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#25d366">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp Agent
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&h=60&fit=crop&auto=format"
                      alt="Agent"
                      className="w-10 h-10 rounded-full object-cover border-2 border-zinc-800"
                    />
                    <div>
                      <div className="text-white text-sm font-medium">Yetunde Afolabi</div>
                      <div className="text-zinc-500 text-xs flex items-center gap-1">
                        <CheckCircle size={10} className="text-emerald-400" />
                        Verified Agent
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="glass-card p-4 space-y-3">
                {[
                  { icon: Shield, text: "Property documents verified by PROPATI" },
                  { icon: CheckCircle, text: "Landlord identity confirmed" },
                  { icon: Star, text: "Secure payment via escrow" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5 text-xs text-zinc-500">
                    <item.icon size={13} className="text-emerald-400 flex-shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
