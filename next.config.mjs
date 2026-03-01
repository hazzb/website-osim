/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "iuizpfvmmjiimvqvxxci.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "vzvzvpvvzvzvzvzvzvzv.supabase.co", // In case of other buckets or projects
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  output: "export",
};

export default nextConfig;
