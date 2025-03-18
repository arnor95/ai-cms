/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // No need for appDir: false since it's now the default in Next.js 15+
  },
  // Ensure we don't try to build/load from non-existent src/app directory
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix: Ensure ignored is an array before spreading
    const ignored = Array.isArray(config.watchOptions?.ignored) 
      ? config.watchOptions.ignored 
      : [];
    
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [...ignored, '**/src/app/**']
    };
    return config;
  },
  env: {
    // Always use real generation, not mock
    NEXT_PUBLIC_MOCK_GENERATION: 'false',
    MOCK_GENERATION: 'false'
  }
}

module.exports = nextConfig 