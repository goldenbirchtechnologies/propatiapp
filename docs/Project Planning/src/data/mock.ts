export const listings = [
  {
    id: "1",
    title: "Luxury 3-Bedroom Apartment",
    address: "14 Bourdillon Road, Ikoyi, Lagos",
    price: 4500000,
    priceUnit: "per year",
    type: "rent" as const,
    beds: 3,
    baths: 3,
    sqft: 2100,
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop&auto=format",
    verified: true,
    tier: "Obsidian",
    tierColor: "#c9952a",
    badge: "Featured",
  },
  {
    id: "2",
    title: "Modern 2-Bedroom Flat",
    address: "7 Adetokunbo Ademola, Victoria Island, Lagos",
    price: 2800000,
    priceUnit: "per year",
    type: "rent" as const,
    beds: 2,
    baths: 2,
    sqft: 1450,
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop&auto=format",
    verified: true,
    tier: "Diamond",
    tierColor: "#3b82f6",
    badge: "New",
  },
  {
    id: "3",
    title: "4-Bedroom Detached House",
    address: "22 Banana Island, Ikoyi, Lagos",
    price: 950000000,
    priceUnit: "outright",
    type: "sale" as const,
    beds: 4,
    baths: 5,
    sqft: 5200,
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop&auto=format",
    verified: true,
    tier: "Obsidian",
    tierColor: "#c9952a",
    badge: "Premium",
  },
  {
    id: "4",
    title: "Short-Let Studio Apartment",
    address: "5 Ozumba Mbadiwe, Victoria Island, Lagos",
    price: 85000,
    priceUnit: "per night",
    type: "shortlet" as const,
    beds: 1,
    baths: 1,
    sqft: 680,
    image: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=600&h=400&fit=crop&auto=format",
    verified: false,
    tier: "Silver",
    tierColor: "#71717a",
    badge: null,
  },
  {
    id: "5",
    title: "Commercial Office Space",
    address: "1 Sanusi Fafunwa, Victoria Island, Lagos",
    price: 12000000,
    priceUnit: "per year",
    type: "lease" as const,
    beds: 0,
    baths: 4,
    sqft: 4800,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop&auto=format",
    verified: true,
    tier: "Gold",
    tierColor: "#c9952a",
    badge: "Hot",
  },
  {
    id: "6",
    title: "Serviced 1-Bedroom Apartment",
    address: "18 Ligali Ayorinde, Victoria Island, Lagos",
    price: 1500000,
    priceUnit: "per year",
    type: "rent" as const,
    beds: 1,
    baths: 1,
    sqft: 820,
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop&auto=format",
    verified: true,
    tier: "Gold",
    tierColor: "#c9952a",
    badge: null,
  },
];

export const typeColors: Record<string, string> = {
  rent: "#3b82f6",
  lease: "#8b5cf6",
  sale: "#10b981",
  shortlet: "#f59e0b",
  roomshare: "#ec4899",
};

export const testimonials = [
  {
    name: "Adaeze Okonkwo",
    role: "Tenant · Victoria Island",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&auto=format",
    text: "PROPATI found me a verified apartment in 48 hours. The landlord verification gave me total peace of mind. No more wasting weekends viewing fake listings.",
    rating: 5,
  },
  {
    name: "Emeka Nwosu",
    role: "Landlord · Ikoyi",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
    text: "My 6 units are always occupied. The dashboard makes rent collection and maintenance tracking effortless. Best property management tool in Nigeria, period.",
    rating: 5,
  },
  {
    name: "Yetunde Afolabi",
    role: "Real Estate Agent · Lekki",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&auto=format",
    text: "My commission pipeline tripled in 3 months. The CRM and inspection tools are exactly what agents need. PROPATI understands the Nigerian market.",
    rating: 5,
  },
];

export const stats = [
  { value: "50,000+", label: "Verified Listings" },
  { value: "120,000+", label: "Happy Tenants" },
  { value: "8,500+", label: "Landlords" },
  { value: "₦2.4B+", label: "Rent Collected" },
];

export const mockTenants = [
  { id: "T001", name: "Chidi Okafor", unit: "Flat 3A", rent: "₦2,400,000", status: "Active", dueDate: "Sep 1, 2026", phone: "+234 803 456 7890" },
  { id: "T002", name: "Ngozi Eze", unit: "Flat 1B", rent: "₦1,800,000", status: "Overdue", dueDate: "Aug 1, 2026", phone: "+234 706 123 4567" },
  { id: "T003", name: "Tunde Bakare", unit: "Penthouse", rent: "₦7,200,000", status: "Active", dueDate: "Oct 1, 2026", phone: "+234 813 987 6543" },
  { id: "T004", name: "Amaka Obi", unit: "Flat 2C", rent: "₦2,100,000", status: "Active", dueDate: "Sep 15, 2026", phone: "+234 901 234 5678" },
  { id: "T005", name: "Femi Adeyemi", unit: "Flat 4D", rent: "₦1,600,000", status: "Notice", dueDate: "Aug 30, 2026", phone: "+234 802 345 6789" },
];

export const mockApplications = [
  { id: "APP-001", applicant: "Chukwu Obi", property: "3BR Flat, Ikoyi", date: "Aug 20, 2026", status: "Pending", score: 82 },
  { id: "APP-002", applicant: "Sola Adewale", property: "2BR Flat, VI", date: "Aug 19, 2026", status: "Approved", score: 91 },
  { id: "APP-003", applicant: "Kemi Fadipe", property: "Studio, Lekki", date: "Aug 18, 2026", status: "Rejected", score: 45 },
  { id: "APP-004", applicant: "Bode Martins", property: "4BR House, Ikoyi", date: "Aug 17, 2026", status: "Under Review", score: 74 },
  { id: "APP-005", applicant: "Dupe Oladele", property: "1BR Flat, VI", date: "Aug 16, 2026", status: "Pending", score: 68 },
];

export const mockTransactions = [
  { id: "TXN-9821", type: "Rent Payment", amount: "₦2,400,000", from: "Chidi Okafor", to: "Emeka Nwosu", date: "Aug 1, 2026", status: "Completed" },
  { id: "TXN-9820", type: "Agent Commission", amount: "₦180,000", from: "PROPATI", to: "Yetunde Afolabi", date: "Jul 31, 2026", status: "Completed" },
  { id: "TXN-9819", type: "Escrow Release", amount: "₦7,200,000", from: "Escrow", to: "Tunde Bakare", date: "Jul 30, 2026", status: "Processing" },
  { id: "TXN-9818", type: "Rent Payment", amount: "₦1,800,000", from: "Ngozi Eze", to: "Emeka Nwosu", date: "Jul 28, 2026", status: "Failed" },
  { id: "TXN-9817", type: "Subscription Fee", amount: "₦150,000", from: "Lagos Estate Mgmt", to: "PROPATI", date: "Jul 25, 2026", status: "Completed" },
];

export const mockMaintenanceTickets = [
  { id: "MNT-201", title: "AC Unit Not Cooling", unit: "Flat 3A", priority: "High", status: "Open", date: "Aug 22, 2026", tenant: "Chidi Okafor" },
  { id: "MNT-202", title: "Leaking Pipe in Kitchen", unit: "Flat 1B", priority: "Critical", status: "In Progress", date: "Aug 21, 2026", tenant: "Ngozi Eze" },
  { id: "MNT-203", title: "Door Lock Faulty", unit: "Penthouse", priority: "Medium", status: "Resolved", date: "Aug 19, 2026", tenant: "Tunde Bakare" },
  { id: "MNT-204", title: "Ceiling Fan Broken", unit: "Flat 2C", priority: "Low", status: "Open", date: "Aug 18, 2026", tenant: "Amaka Obi" },
];

export const mockUsers = [
  { id: "USR-1001", name: "Emeka Nwosu", email: "emeka@example.com", role: "Landlord", status: "Verified", joined: "Jan 2025", listings: 6 },
  { id: "USR-1002", name: "Yetunde Afolabi", email: "yetunde@example.com", role: "Agent", status: "Verified", joined: "Feb 2025", listings: 23 },
  { id: "USR-1003", name: "Chidi Okafor", email: "chidi@example.com", role: "Tenant", status: "Active", joined: "Mar 2025", listings: 0 },
  { id: "USR-1004", name: "Aisha Mohammed", email: "aisha@example.com", role: "Estate Manager", status: "Verified", joined: "Jan 2025", listings: 45 },
  { id: "USR-1005", name: "Bola Adekunle", email: "bola@example.com", role: "Landlord", status: "Pending", joined: "Aug 2026", listings: 1 },
  { id: "USR-1006", name: "Kola Adeyemi", email: "kola@example.com", role: "Agent", status: "Suspended", joined: "Jun 2025", listings: 0 },
];

export const mockVerificationQueue = [
  { id: "VRF-501", property: "Obsidian Penthouse, Ikoyi", owner: "Emeka Nwosu", submitted: "Aug 22, 2026", type: "Property Docs", status: "Pending Review", tier: "Obsidian" },
  { id: "VRF-502", property: "3BR Flat, Victoria Island", owner: "Bola Adekunle", submitted: "Aug 21, 2026", type: "Identity + Docs", status: "In Review", tier: "Gold" },
  { id: "VRF-503", property: "Commercial Office, VI", owner: "Lagos Corp Ltd", submitted: "Aug 20, 2026", type: "Company Docs", status: "Additional Info Needed", tier: "Diamond" },
  { id: "VRF-504", property: "Studio, Lekki Phase 1", owner: "Ngozi Eze", submitted: "Aug 19, 2026", type: "Property Docs", status: "Approved", tier: "Silver" },
];

export const mockDeals = [
  { id: "DL-001", property: "3BR Apartment, Ikoyi", client: "Mr. Adamu Bello", value: "₦4,500,000", stage: "Negotiation", probability: 75, agent: "Yetunde Afolabi", updated: "Aug 23, 2026" },
  { id: "DL-002", property: "4BR House, Lekki Phase 2", client: "Mrs. Folake Obi", value: "₦850,000,000", stage: "Offer Made", probability: 60, agent: "Yetunde Afolabi", updated: "Aug 22, 2026" },
  { id: "DL-003", property: "Studio, VI", client: "Mr. Emeka Uche", value: "₦1,200,000", stage: "Viewing Scheduled", probability: 40, agent: "Yetunde Afolabi", updated: "Aug 21, 2026" },
  { id: "DL-004", property: "Commercial, Ikoyi", client: "Zenith Corp", value: "₦24,000,000", stage: "Due Diligence", probability: 85, agent: "Yetunde Afolabi", updated: "Aug 20, 2026" },
  { id: "DL-005", property: "2BR Flat, Gbagada", client: "Miss Titi Alabi", value: "₦1,800,000", stage: "Closed", probability: 100, agent: "Yetunde Afolabi", updated: "Aug 15, 2026" },
];

export const mockUnits = [
  { id: "UN-001", name: "Flat 1A", type: "1BR", floor: 1, status: "Occupied", tenant: "Chidi Okafor", rent: "₦2,000,000", leaseEnd: "Dec 2026" },
  { id: "UN-002", name: "Flat 1B", type: "1BR", floor: 1, status: "Vacant", tenant: null, rent: "₦2,000,000", leaseEnd: null },
  { id: "UN-003", name: "Flat 2A", type: "2BR", floor: 2, status: "Occupied", tenant: "Ngozi Eze", rent: "₦3,200,000", leaseEnd: "Jun 2027" },
  { id: "UN-004", name: "Flat 2B", type: "2BR", floor: 2, status: "Maintenance", tenant: null, rent: "₦3,200,000", leaseEnd: null },
  { id: "UN-005", name: "Penthouse", type: "4BR", floor: 10, status: "Occupied", tenant: "Tunde Bakare", rent: "₦12,000,000", leaseEnd: "Mar 2027" },
];

export const mockInvoices = [
  { id: "INV-2026-001", description: "Annual Rent — Flat 3A", amount: "₦2,400,000", issued: "Jul 1, 2026", due: "Aug 1, 2026", status: "Paid" },
  { id: "INV-2026-002", description: "Annual Rent — Flat 1B", amount: "₦1,800,000", issued: "Jul 1, 2026", due: "Aug 1, 2026", status: "Overdue" },
  { id: "INV-2026-003", description: "Short-let Booking — Sep 2026", amount: "₦340,000", issued: "Aug 20, 2026", due: "Aug 25, 2026", status: "Pending" },
  { id: "INV-2026-004", description: "Agent Commission — DL-004", amount: "₦360,000", issued: "Aug 18, 2026", due: "Aug 30, 2026", status: "Pending" },
  { id: "INV-2026-005", description: "Platform Subscription — Gold", amount: "₦150,000", issued: "Aug 1, 2026", due: "Aug 15, 2026", status: "Paid" },
];

export const formatPrice = (price: number, type: string) => {
  if (price >= 1000000000) return `₦${(price / 1000000000).toFixed(1)}B`;
  if (price >= 1000000) return `₦${(price / 1000000).toFixed(1)}M`;
  if (price >= 1000) return `₦${(price / 1000).toFixed(0)}K`;
  return `₦${price.toLocaleString()}`;
};
