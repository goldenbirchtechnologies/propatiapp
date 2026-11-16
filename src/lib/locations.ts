export const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', callingCode: '+234' },
  { code: 'GH', name: 'Ghana', callingCode: '+233' },
  { code: 'US', name: 'United States', callingCode: '+1' },
  { code: 'UK', name: 'United Kingdom', callingCode: '+44' },
  { code: 'CA', name: 'Canada', callingCode: '+1' },
  { code: 'ZA', name: 'South Africa', callingCode: '+27' },
  { code: 'KE', name: 'Kenya', callingCode: '+254' },
  { code: 'EG', name: 'Egypt', callingCode: '+20' },
] as const;

export type CountryCode = (typeof COUNTRIES)[number]['code'];

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

export const LAGOS_LOCAL_GOVERNMENTS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Badagry', 'Epe',
  'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe',
  'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu',
  'Surulere', 'Badagry',
] as const;

export const MAJOR_CITIES: Record<string, string[]> = {
  Lagos: [
    'Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba', 'Festac Town',
    'Amuwo-Odofin', 'Epe', 'Ikorodu', 'Badagry', 'Ogudu', 'Gbagada',
  ],
  Abuja: [
    'Wuse', 'Garki', 'Asokoro', 'Maitama', 'Wuse II', 'Gwarimpa', 'Jabi',
    'Lokogoma', 'Kubwa', 'Gwagwalada', 'Bwari', 'Kuje',
  ],
  'Port Harcourt': [
    'Eleme', 'Obio-Akpor', 'Port Harcourt City', 'Rumuokoro', 'Aluu',
    'Rumuola', 'Eneka', 'Okrika', 'Omagwa', 'Rumuhi',
  ],
  Ibadan: [
    'Bodija', 'Sasa', 'Mokola', 'Eleyele', 'Igbo-Ora', 'Oyo', 'Ibarapa',
    'Ido', 'Akinyele', 'Lagelu', 'Atiba', 'Irepo',
  ],
  Kano: [
    'Fagge', 'Nassarawa', 'Tarauni', 'Ungogo', 'Minjibir', 'Kumbotso',
    'Dala', 'Gwale', 'Kofar Mata', 'Bompai', 'Machina',
  ],
} as Record<string, string[]>;

export interface AddressData {
  country: string;
  state: string;
  city: string;
  streetAddress: string;
  coordinates?: { lat: number; lng: number };
}
