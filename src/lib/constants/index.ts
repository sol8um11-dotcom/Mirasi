// App constants
export const APP_NAME = "Mirasi";
export const APP_DESCRIPTION =
  "Transform your photos into stunning Indian art portraits. AI-powered art in Rajasthani, Tanjore, Madhubani, and 12 more styles.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Image constraints
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
export const COMPRESSED_MAX_WIDTH = 1024;
export const COMPRESSED_MAX_HEIGHT = 1024;
export const COMPRESSED_QUALITY = 0.8;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// AI Generation
export const GENERATION_TIMEOUT_MS = 120_000; // 2 minutes
export const GENERATION_POLL_INTERVAL_MS = 3_000; // Poll every 3s
export const HD_IMAGE_SIZE = 4096; // After upscaling

// Pricing (in paise - INR smallest unit)
export const PRICING = {
  digital: {
    single: 4900, // INR 49
    pack3: 9900, // INR 99
    pack5: 14900, // INR 149
  },
} as const;

// Style categories
export const STYLE_CATEGORIES = {
  royal: { label: "Royal Heritage", count: 10 },
  folk: { label: "Folk Art", count: 3 },
  modern: { label: "Modern", count: 2 },
} as const;

// Regions for filter
export const REGIONS = [
  "Rajasthan",
  "Maharashtra",
  "Tamil Nadu",
  "Karnataka",
  "Punjab",
  "Bengal",
  "Kerala",
  "Himachal Pradesh",
  "Deccan",
  "Pan-Indian",
  "Bihar",
  "Japan",
  "Bollywood",
] as const;

// Styles that are live (trained LoRAs ready or generation-ready)
export const LIVE_STYLES = new Set([
  "warli-art",
  "madhubani-art",
  "tanjore-heritage",
]);

// DPDP compliance
export const DPDP_PHOTO_RETENTION_DAYS = 30;
export const DPDP_CONSENT_VERSION = "1.0";

// Watermark settings
export const WATERMARK_TEXT = "Mirasi";
export const WATERMARK_OPACITY = 0.3;

// Rate limiting
export const MAX_GENERATIONS_PER_DAY = 10;
export const MAX_FREE_GENERATIONS = 1; // Free preview generations before payment required
export const MAX_UPLOADS_PER_HOUR = 20;
