/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
  // Ensure experimental optimizations for bundle reduction as per vercel-react-best-practices
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
