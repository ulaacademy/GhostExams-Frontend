import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone", // ✅ هذه أهم شيء
  images: {
    domains: [
      "ula-academy-exams.s3.eu-north-1.amazonaws.com",
      "localhost",
      "ge-api.ghostexams.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ula-academy-exams.s3.eu-north-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ge-api.ghostexams.com",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/dashboard/exams/view/teacher",
        destination: "/dashboard/exams/view/TeacherExamView",
      },
      {
        source: "/dashboard/exams/view/:examId",
        destination: "/dashboard/exams/view/[examId]",
      },
    ];
  },
};

export default nextConfig;
