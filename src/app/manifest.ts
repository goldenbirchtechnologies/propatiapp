import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PROPATI - Nigeria Property Marketplace',
    short_name: 'PROPATI',
    description: 'Nigeria\'s most trusted property marketplace. Verified listings, secure payments, escrow, and rental agreements.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    categories: ['real estate', 'property', 'rentals'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
