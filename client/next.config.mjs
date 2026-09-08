/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "lucide-react"],
  },
};

export default nextConfig;
