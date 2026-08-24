import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Fail the production build on type or lint errors rather than shipping past them.
  typedRoutes: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
