type Robots = {
  rules: {
    userAgent: string;
    allow: string[];
    disallow: string[];
    crawlDelay?: number;
  }[];
  sitemap: string;
};

const base = (process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || 'https://propatiapp.vercel.app').replace(/\/$/, '');

export default function robots(): Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/'],
      disallow: ['/api/', '/dashboard/', '/sign-in', '/sign-up', '/onboarding', '/admin'],
      crawlDelay: 1,
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
