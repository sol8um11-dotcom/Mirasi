import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mirasi - Indian Art Portraits",
    short_name: "Mirasi",
    description:
      "Transform your photos into stunning Indian art portraits. AI-powered art in Rajasthani, Tanjore, Madhubani, and 12 more styles.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#C75B12",
    orientation: "portrait",
    categories: ["art", "entertainment", "lifestyle", "photo"],
    lang: "en-IN",
    dir: "ltr",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
