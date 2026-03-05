/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    experimental: {
        outputFileTracingExcludes: {
            '*': [
                '**/*export-detail.json',
                '.next/export-detail.json',
                'export-detail.json',
                '**/*404.html',
                '.next/export/404.html',
                'export/404.html',
                '404.html',
                '**/*500.html',
                '.next/export/500.html',
                'export/500.html',
                '500.html',
                '**/.next/cache/**/*',
            ],
        },
    },
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    trailingSlash: false,
};
module.exports = nextConfig;
