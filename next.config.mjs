/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Wallet adapter UI ships ESM that Next must transpile for the App Router.
  transpilePackages: ["@solana/wallet-adapter-react-ui"],
  images: {
    unoptimized: true, // Allow token logos from any decentralized or centralized CDN without domain blocking
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
