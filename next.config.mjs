/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration to handle permission issues
  webpack: (config, { isServer }) => {
    // Exclude problematic paths from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/.bin/**',
        '**/node_modules/@puppeteer/**',
        '**/node_modules/.cache/**'
      ]
    };
    
    // Add module rules to exclude problematic directories
    config.module.rules.push({
      test: /node_modules[\\/]\.bin[\\/]/,
      use: 'null-loader',
    });
    
    // Add fallback for fs module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig