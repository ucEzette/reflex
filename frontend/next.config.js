const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Standard standalone output for Vercel monorepo compatibility
    output: 'standalone',

    experimental: {
        // Essential for Vercel build to find dependencies in monorepo subfolders
        // Points to the repository root
        outputFileTracingRoot: path.join(__dirname, '../'),
        // Explicitly exclude the phantom export manifest to prevent nft tracing crashes on Vercel
        outputFileTracingExcludes: {
            '*': [
                '**/.next/export-detail.json',
            ],
        },
    },

    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    trailingSlash: false,
};

module.exports = nextConfig;
