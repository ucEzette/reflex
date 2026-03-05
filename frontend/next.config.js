/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                '**/*export-detail.json',
                '.next/export-detail.json',
                'export-detail.json',
            ],
        },
    },
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    trailingSlash: false,
};
module.exports = nextConfig;
