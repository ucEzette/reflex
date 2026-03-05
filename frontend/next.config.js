const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Standard standalone output for Vercel monorepo compatibility
    output: 'standalone',

    experimental: {
        // Essential for Vercel build to find dependencies in monorepo subfolders
        // Points to the repository root
        outputFileTracingRoot: path.join(__dirname, '../'),
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
