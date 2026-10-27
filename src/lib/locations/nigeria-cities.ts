/**
 * City suggestions per Nigerian state. This is a convenience list for
 * autocomplete only — cities are stored as free text, because the list is
 * partial (13 of 37 states) and users must be able to enter a city that is
 * not listed here.
 */
export const CITIES_BY_STATE: Record<string, string[]> = {
  Abia: ['Umuahia', 'Aba', 'Ohafia'],
  Abuja: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Jabi', 'Wuye'],
  FCT: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Jabi', 'Wuye'],
  Anambra: ['Awka', 'Onitsha', 'Nnewi'],
  Delta: ['Asaba', 'Warri', 'Sapele'],
  Edo: ['Benin City', 'Auchi', 'Ekpoma'],
  Enugu: ['Enugu', 'Nsukka', 'Awgu'],
  Kano: ['Nassarawa', 'Fagge', 'Gwale', 'Dala'],
  Kaduna: ['Kaduna', 'Zaria', 'Kafanchan'],
  Lagos: ['Lekki', 'Victoria Island', 'Ikeja', 'Surulere', 'Yaba', 'Ikoyi'],
  Ogun: ['Abeokuta', 'Sagamu', 'Ilaro'],
  Oyo: ['Ibadan', 'Oyo', 'Egbeda'],
  Rivers: ['Port Harcourt', 'Obio-Akpor', 'Eleme'],
};

export function getCitySuggestions(stateName: string): string[] {
  return CITIES_BY_STATE[stateName] ?? [];
}
