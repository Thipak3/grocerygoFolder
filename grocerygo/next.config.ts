import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   turbopack: {
    root: process.cwd(),
   },
   serverExternalPackages: ["mongoose"],
   images:{
    remotePatterns:[
        
      {     protocol: "https",
        hostname:"lh3.googleusercontent.com"},
        {     protocol: "https",
        hostname: "images.unsplash.com",},
        {
          protocol: "https",
          hostname: "res.cloudinary.com",
        },
    ]
   }
};

export default nextConfig;
