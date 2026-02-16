import type { StyleCategory } from "@/types";

export interface StyleInfo {
  name: string;
  slug: string;
  category: StyleCategory;
  shortDescription: string;
  region: string;
  supportsDogs: boolean;
  supportsCats: boolean;
  supportsHumans: boolean;
}

/**
 * Static styles data for gallery/landing pages.
 * In production, this comes from Supabase, but we use this for
 * SSG/static rendering on landing/gallery pages.
 */
export const STYLES_DATA: StyleInfo[] = [
  // ROYAL (10)
  {
    name: "Rajasthani Royal",
    slug: "rajasthani-royal",
    category: "royal",
    shortDescription: "Mewar/Udaipur miniature portrait with ornate golden borders and jewel tones",
    region: "Rajasthan",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Maratha Heritage",
    slug: "maratha-heritage",
    category: "royal",
    shortDescription: "Peshwa-era court portrait with deep maroon, gold, and martial dignity",
    region: "Maharashtra",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Tanjore Heritage",
    slug: "tanjore-heritage",
    category: "royal",
    shortDescription: "Thanjavur painting with rich colors and gold leaf embellishments",
    region: "Tamil Nadu",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Mysore Palace",
    slug: "mysore-palace",
    category: "royal",
    shortDescription: "Wodeyar court style with elegant compositions and muted gold tones",
    region: "Karnataka",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Punjab Royal",
    slug: "punjab-royal",
    category: "royal",
    shortDescription: "Sikh court painting with vibrant colors and rich textile details",
    region: "Punjab",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Bengal Renaissance",
    slug: "bengal-renaissance",
    category: "royal",
    shortDescription: "Bengal School wash painting with flowing lines and earthy palette",
    region: "Bengal",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Kerala Mural",
    slug: "kerala-mural",
    category: "royal",
    shortDescription: "Panchavarna mural tradition with bold outlines and five primary colors",
    region: "Kerala",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Pahari Mountain",
    slug: "pahari-mountain",
    category: "royal",
    shortDescription: "Kangra/Basohli miniature with lyrical composition and mountain landscapes",
    region: "Himachal Pradesh",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Deccani Royal",
    slug: "deccani-royal",
    category: "royal",
    shortDescription: "Bijapur/Golconda tradition with rich, luxurious Persian-influenced art",
    region: "Deccan",
    supportsDogs: false,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Miniature Art",
    slug: "miniature-art",
    category: "royal",
    shortDescription: "Indo-Islamic miniature portrait with intricate detail and ornate borders",
    region: "Pan-Indian",
    supportsDogs: false,
    supportsCats: true,
    supportsHumans: true,
  },
  // FOLK (3)
  {
    name: "Madhubani Art",
    slug: "madhubani-art",
    category: "folk",
    shortDescription: "Mithila folk art with geometric patterns, bold lines, and nature motifs",
    region: "Bihar",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Warli Art",
    slug: "warli-art",
    category: "folk",
    shortDescription: "Tribal art with white geometric figures on earthy terracotta backgrounds",
    region: "Maharashtra",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Pichwai Art",
    slug: "pichwai-art",
    category: "folk",
    shortDescription: "Nathdwara tradition with intricate lotus patterns and rich dark backgrounds",
    region: "Rajasthan",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  // MODERN (2)
  {
    name: "Anime Portrait",
    slug: "anime-portrait",
    category: "modern",
    shortDescription: "Japanese anime/manga style with expressive eyes and vibrant colors",
    region: "Japan",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
  {
    name: "Bollywood Retro",
    slug: "bollywood-retro",
    category: "modern",
    shortDescription: "Vintage hand-painted movie poster style from the 1960s-80s era",
    region: "Bollywood",
    supportsDogs: true,
    supportsCats: true,
    supportsHumans: true,
  },
];
