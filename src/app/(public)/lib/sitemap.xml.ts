export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://propatiapp.vercel.app';
  const entries = [
    { url: '/', priority: 1 },
    { url: '/listings', priority: 0.9 },
    { url: '/properties', priority: 0.9 },
    { url: '/short-let', priority: 0.8 },
    { url: '/agents', priority: 0.7 },
    { url: '/pricing', priority: 0.6 },
    { url: '/about-us', priority: 0.5 },
    { url: '/help-center', priority: 0.5 },
    { url: '/contact-us', priority: 0.5 },
    { url: '/sign-in', priority: 0.3 },
    { url: '/sign-up', priority: 0.3 },
  ];
  return {
    sitemap: entries.map(e => ({ ...e, changefreq: e.priority >= 1 ? 'always' : 'weekly', lastModified: new Date().toISOString() })),
  };
}
