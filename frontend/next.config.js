/** @type {import('next').NextConfig} */
const nextConfig = {
    // We remove output: 'standalone' as Vercel's native builder 
    // is better optimized for Next.js when not using custom containers.

    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    // Ensure trailing slashes are consistent
    trailingSlash: false,
};

module.exports = nextConfig;
