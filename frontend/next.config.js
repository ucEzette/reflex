/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    reactStrictMode: true,
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                '**/.next/cache/**',
                '**/.next/trace/**',
                '**/.next/export-detail.json',
                '.next/export-detail.json'
            ],
        },
    },
};

module.exports = nextConfig;