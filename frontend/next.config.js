/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: { ignoreBuildErrors: true },
    eslint: { ignoreDuringBuilds: true },
    trailingSlash: true,
    reactStrictMode: true,
};
module.exports = nextConfig;
