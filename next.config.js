/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.clerk.dev' },
      { protocol: 'https', hostname: 'img.clerk.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  output: 'standalone',
  async redirects() {
    return [
      { source: '/properties', destination: '/listings', permanent: false },
      { source: '/properties/:path*', destination: '/listings/:path*', permanent: false },
      { source: '/shortlet', destination: '/listings?listingType=short_let', permanent: false },
      { source: '/shortlet/:path*', destination: '/listings?listingType=short_let', permanent: false },
      { source: '/investment', destination: '/compare', permanent: false },
      { source: '/find-my-agent', destination: '/find-agent', permanent: false },
      { source: '/find-my-agent/:path*', destination: '/find-agent/:path*', permanent: false },
      { source: '/find-an-agent', destination: '/find-agent', permanent: false },
      { source: '/find-an-agent/:path*', destination: '/find-agent/:path*', permanent: false },
    ];
  },
};

module.exports = nextConfig;
