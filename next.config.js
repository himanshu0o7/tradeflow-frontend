 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.kp5bot.com/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;