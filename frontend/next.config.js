/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    reactStrictMode: true,
    
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                // Exclude the massive build caches from server bundles (fixes 250MB error)
                '**/.next/cache/**',
                '**/.next/trace/**',
                
                // Keep the previous fix for the Vercel routing bug
                '**/.next/export-detail.json',
                '.next/export-detail.json'
            ],
        },
    },
};

module.exports = nextConfig;