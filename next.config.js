/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { isServer }) => {
 
    const noopPath = path.resolve(__dirname, 'lib', 'noop-document.js');
    
    if (!config.resolve) {
      config.resolve = {};
    }
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['next/document'] = noopPath;
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
      
      config.externals = config.externals || [];
      config.externals.push({
        '@stellar/stellar-sdk': 'commonjs @stellar/stellar-sdk',
        '@stellar/stellar-base': 'commonjs @stellar/stellar-base',
        'sodium-native': 'commonjs sodium-native',
        'require-addon': 'commonjs require-addon',
      });
    }
    
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/sodium-native/,
      },
      {
        module: /node_modules\/require-addon/,
      },
      {
        module: /node_modules\/@stellar\/stellar-base/,
      },
    ];
    
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
