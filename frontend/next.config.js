/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Ignore problematic modules
    config.externals = config.externals || [];
    config.externals.push({
      '@react-native-async-storage/async-storage': 'commonjs @react-native-async-storage/async-storage',
    });
    
    return config;
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY || '',
  },
}

module.exports = nextConfig 