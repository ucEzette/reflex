const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    reactStrictMode: true,
    transpilePackages: [
        '@walletconnect/ethereum-provider',
        '@walletconnect/logger',
        '@walletconnect/modal',
        '@walletconnect/sign-client',
        '@walletconnect/utils',
        '@walletconnect/types',
        'pino',
    ],
    experimental: {
        esmExternals: 'loose',
        outputFileTracingExcludes: {
            '*': [
                '**/.next/cache/**',
                '**/.next/trace/**',
                '**/.next/export-detail.json',
                '.next/export-detail.json'
            ],
        },
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        config.resolve.alias = {
            ...config.resolve.alias,
            'pino': path.resolve(__dirname, 'src/lib/pino-mock.js'),
            '@farcaster/mini-app-solana': false,
            '@farcaster/auth-kit': false,
        };
        config.externals.push('pino-pretty', 'lokijs', 'encoding');
        return config;
    },
};

module.exports = nextConfig;