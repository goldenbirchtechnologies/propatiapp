export interface Agent {
  id: string;
  name: string;
  role: string;
  location: string;
  specialty: string[];
  rating: number;
  reviewCount: number;
  verificationTier: 'basic' | 'verified' | 'inspected' | 'certified';
  image: string;
  experience: number;
  listingsSold: number;
  clientsServed: number;
  bio: string;
}

const AGENT_NAMES = [
  'Chidi Okafor',
  'Amina Bello',
  'Emeka Nwosu',
  'Fatima Hassan',
  'Tunde Adeyemi',
  'Ngozi Eze',
  'Yusuf Ibrahim',
  'Chioma Eze',
  'Bayo Adeleke',
  'Kemi Adetola',
  'Obi Chukwu',
  'Zainab Mohammed',
];

const ROLES = [
  'Real Estate Agent',
  'Broker',
  'Property Consultant',
  'Estate Manager',
  'Realtor',
];

const SPECIALTIES_POOL = [
  'Residential Sales',
  'Commercial Leasing',
  'Short Lets',
  'Luxury Properties',
  'First-Time Buyers',
  'Property Management',
  'Investment Advisory',
  'Off-Plan Sales',
  'Industrial Properties',
  'Student Accommodation',
];

const LOCATIONS = [
  'Lekki Phase 1, Lagos',
  'Victoria Island, Lagos',
  'Ikeja GRA, Lagos',
  'Ikoyi, Lagos',
  'Surulere, Lagos',
  'Ajah, Lagos',
  'Yaba, Lagos',
  'Maitama, Abuja',
  'Wuse 2, Abuja',
  'Port Harcourt, Rivers',
];

const BIOS = [
  'Dedicated professional with over a decade of experience helping clients find their dream properties across Nigeria.',
  'Trusted advisor specializing in high-value transactions and client satisfaction.',
  'Results-driven agent with deep market knowledge in premium residential and commercial segments.',
  'Client-first approach with a proven track record of successful deals.',
  'Expert negotiator focused on delivering seamless property acquisition experiences.',
  'Passionate about matching people with spaces they love.',
];

const IMAGE_SEEDS = Array.from({ length: 30 }, (_, i) => `agent-${i + 1}`);

export function generateMockAgents(): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < 12; i++) {
    const name = AGENT_NAMES[i % AGENT_NAMES.length];
    const specialtyCount = 2 + (i % 3);
    const shuffledSpecialties = [...SPECIALTIES_POOL].sort(() => Math.random() - 0.5);
    const specialties = shuffledSpecialties.slice(0, specialtyCount);

    agents.push({
      id: `agent-${i + 1}`,
      name,
      role: ROLES[i % ROLES.length],
      location: LOCATIONS[i % LOCATIONS.length],
      specialty: specialties,
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
      reviewCount: 10 + Math.floor(Math.random() * 140),
      verificationTier: ['basic', 'verified', 'inspected', 'certified'][i % 4] as Agent['verificationTier'],
      image: `https://picsum.photos/seed/${IMAGE_SEEDS[i]}/800/800`,
      experience: 1 + (i % 12),
      listingsSold: 5 + Math.floor(Math.random() * 95),
      clientsServed: 10 + Math.floor(Math.random() * 190),
      bio: BIOS[i % BIOS.length],
    });
  }
  return agents;
}

export const ALL_AGENTS = generateMockAgents();
