/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    reactStrictMode: true,
    output: 'standalone',
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