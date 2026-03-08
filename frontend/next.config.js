/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    reactStrictMode: true,
    
    // Tell the Next.js tracer to ignore the missing export-detail.json file
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                '**/.next/export-detail.json',
                '.next/export-detail.json'
            ],
        },
    },
};

module.exports = nextConfig;