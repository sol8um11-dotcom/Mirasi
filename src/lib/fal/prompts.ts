/**
 * Kontext-optimized prompt templates and style configuration.
 *
 * V2 Prompts — Identity-First Approach
 *
 * Key principles for Flux Kontext Pro style transfer:
 * 1. IDENTITY FIRST: Front-load preservation ("Keep exact face..." before style description)
 * 2. Use "Restyle/Apply" not "Transform" (less aggressive verb = better identity preservation)
 * 3. Explicit facial feature checklist: face shape, eyes, nose, jawline, skin tone
 * 4. Slightly flattering: "enhance" skin and features subtly (never worse than original)
 * 5. Pets: "exact breed, fur pattern, markings, eye color, body proportions"
 * 6. Lower guidance_scale (3.0–4.5) to reduce identity drift while still applying style
 * 7. Style description AFTER preservation clause
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  /** Kontext guidance_scale — lower = better identity, higher = stronger style */
  guidanceScale: number;
  /** Inference steps — more steps = better quality but slower */
  numInferenceSteps: number;
  /** LoRA URL for pet pipeline (null = use Kontext Pro fallback for pets) */
  loraUrl: string | null;
  /** LoRA weight scale (0-4) */
  loraScale: number;
  /** Human prompt template — identity-first approach */
  humanPrompt: string;
  /** Pet prompt template — breed/feature preservation focus */
  petPrompt: string;
  /** LoRA trigger word (for trained LoRAs) */
  loraTrigger: string | null;
}

/**
 * Per-style generation configs — V2 Identity-Preserving Prompts
 *
 * Trained LoRAs are available for: warli-art, madhubani-art, tanjore-heritage.
 * Other styles use Kontext Pro (no LoRA) — train via fal-ai/flux-kontext-trainer
 * and paste the diffusers_lora_file URLs here when ready.
 */
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ROYAL STYLES (10)
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Rajasthani Mewar miniature painting with flat perspective, " +
      "ornate golden border frame, rich jewel tones of deep red, gold, and emerald green. " +
      "Add a palace courtyard background with arched pillars, jali patterns, and traditional " +
      "Rajput ornaments. Use Mewar fine brushwork with visible ink outlines.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Rajasthani Mewar miniature painting with flat perspective, " +
      "ornate golden border frame, rich jewel tones of deep red and gold. " +
      "Place the animal on an ornate cushion in a palace courtyard with arched pillars. " +
      "Use Mewar fine brushwork with ink outlines and intricate floral patterns.",
  },

  "maratha-heritage": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Maratha Peshwa-era court painting with bold composition, " +
      "deep maroon and gold color palette. Add a fort rampart or durbar hall background " +
      "with stone pillars and draped textiles. Use Peshwa painting style with strong " +
      "outlines and flat color fills. Add traditional Maratha ornaments.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Maratha Peshwa-era court painting with deep maroon and gold " +
      "colors. Place the animal in a regal fort setting with stone pillars and draped " +
      "textiles. Use Peshwa style with strong outlines and flat color fills, " +
      "decorative border with Maratha motifs.",
  },

  "tanjore-heritage": {
    guidanceScale: 4.0,
    numInferenceSteps: 28,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 0.9,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Tanjore Thanjavur painting with rich vibrant colors, " +
      "prominent gold leaf embellishments, and gem-studded details. Frame the subject " +
      "in an ornate arch with South Indian temple pillars. Add traditional jewelry, " +
      "silk garments with zari borders. Use semi-raised gold surface texture " +
      "and vivid warm color palette.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Tanjore Thanjavur painting with rich vibrant colors, " +
      "prominent gold leaf embellishments. Frame the animal in an ornate arch with " +
      "South Indian decorative pillars. Add gold-bordered cushion and floral garland " +
      "details. Use semi-raised gold textures and vivid warm colors.",
  },

  "mysore-palace": {
    guidanceScale: 3.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Mysore painting in the Wodeyar court tradition with elegant " +
      "composition, muted gold tones, and deep green accents. Add a palatial interior " +
      "with carved wooden pillars and delicate curtain draping. Use refined brushwork " +
      "with subtle gesso preparation and thin gold lines.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Mysore painting in the Wodeyar tradition with elegant " +
      "composition, muted gold tones, and deep green accents. Place the animal in a " +
      "palatial setting with carved wooden pillars. Use refined brushwork with " +
      "subtle gold lines and the Mysore court aesthetic.",
  },

  "punjab-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Sikh court painting from the Punjab tradition with vibrant " +
      "rich colors and ornate textiles featuring detailed embroidery patterns. " +
      "Add a Lahore darbar hall background with marble pillars, chandeliers, and rich carpet. " +
      "Use bold Punjabi royal color palette with warm golden lighting.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Sikh court painting from the Punjab tradition with vibrant " +
      "rich colors and ornate textile backdrop with embroidery patterns. " +
      "Place the animal on a cushioned throne in a darbar hall with marble pillars. " +
      "Use bold Punjabi royal color palette with warm golden lighting.",
  },

  "bengal-renaissance": {
    guidanceScale: 3.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Bengal School painting in the style of Abanindranath Tagore " +
      "with soft watercolor wash technique, flowing graceful lines, and earthy muted " +
      "color palette with subtle golden undertones. Add a dreamy atmospheric background " +
      "with soft gradients. Use delicate brushstrokes and poetic romantic composition.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Bengal School watercolor painting with soft wash technique, " +
      "flowing graceful lines, and earthy muted tones with golden undertones. " +
      "Add a dreamy atmospheric background. Use delicate brushstrokes " +
      "characteristic of the Bengal Renaissance style.",
  },

  "kerala-mural": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Kerala Panchavarna mural painting with bold thick black " +
      "outlines and the five traditional colors: yellow ochre, red, green, blue, and white. " +
      "Add decorative floral borders and lotus motifs. Use flat perspective with ornate " +
      "details. Place subject against a palace wall fresco background.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Kerala Panchavarna mural painting with bold thick black " +
      "outlines and five traditional colors: yellow ochre, red, green, blue, and white. " +
      "Add decorative floral borders and lotus motifs. Use flat perspective with " +
      "ornate details characteristic of Kerala mural art.",
  },

  "pahari-mountain": {
    guidanceScale: 3.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Pahari miniature painting in the Kangra school tradition " +
      "with delicate fine brushwork, soft pastel colors, and rich accent tones. " +
      "Add a Himalayan mountain landscape background with flowering trees and gentle " +
      "streams. Include ornamental painted border with floral patterns.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Pahari Kangra miniature painting with delicate fine " +
      "brushwork, soft pastel colors, and rich accents. Place the animal in a lyrical " +
      "Himalayan mountain landscape with flowering trees. Add ornamental painted border " +
      "with floral patterns and a serene mood.",
  },

  "deccani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Deccani painting from the Bijapur-Golconda tradition with " +
      "rich luxurious colors and Persian-influenced composition. Add an ornate background " +
      "with Islamic domes, pointed arches, and geometric tile patterns. Include gold " +
      "accent details and refined courtly textile patterns.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Deccani painting from the Bijapur tradition with rich " +
      "luxurious colors and Persian-influenced composition. Place the animal in an ornate " +
      "setting with Islamic arches and geometric patterns. Add gold accents blending " +
      "Indian and Persian artistic elements.",
  },

  "miniature-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as an Indo-Islamic miniature painting with intricate detailed " +
      "brushwork and an ornate decorative border filled with floral arabesque patterns. " +
      "Add a palace garden background with cypress trees, fountains, and blooming flowers. " +
      "Use rich colors with gold leaf accents and classical flat perspective.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as an Indo-Islamic miniature painting with intricate brushwork " +
      "and ornate floral arabesque border. Place the animal in a palace garden with " +
      "cypress trees and flowers. Use rich colors with gold accents and flat perspective " +
      "characteristic of Mughal miniature art.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES (3)
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 28,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 0.9,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Madhubani Mithila painting with bold black ink outlines " +
      "and geometric patterns filling every surface. Use vibrant primary colors — " +
      "red, yellow, blue, green. Add fish, peacock, and lotus border motifs. Fill the " +
      "background with dense geometric and floral patterns leaving no empty space. " +
      "Use symmetrical folk art composition with hand-painted texture.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Madhubani Mithila folk art painting with bold black ink " +
      "outlines and geometric patterns filling every surface. Use vibrant primary colors " +
      "— red, yellow, blue, green. Add fish, peacock, and lotus border motifs. " +
      "Fill the background with dense Madhubani patterns.",
  },

  "warli-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 28,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 0.9,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "Keep the recognizable face shape and proportions of this person. " +
      "Restyle the entire image as Warli tribal art — white geometric stick figures " +
      "and shapes on a dark terracotta brown background. Use Warli minimalist style " +
      "with circles, triangles, and lines. Add traditional Warli motifs: circular sun, " +
      "triangular mountains, dancing figure borders. Apply hand-painted rice-paste " +
      "on mud-wall texture. The person should be recognizable in geometric Warli form.",

    petPrompt:
      "Keep the recognizable shape and proportions of this animal. " +
      "Restyle the entire image as Warli tribal art — white geometric shapes on a " +
      "dark terracotta brown background. Use Warli minimalist style with circles, " +
      "triangles, and lines to represent the animal. Add traditional Warli motifs: " +
      "circular sun, triangular mountains, nature borders. Apply rice-paste on " +
      "mud-wall texture. The animal should be clearly recognizable in Warli form.",
  },

  "pichwai-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the skin look smooth and subtly flattering. " +
      "Restyle the image as a Pichwai painting from the Nathdwara tradition with intricate " +
      "lotus flower patterns throughout the composition. Use a rich dark blue or black " +
      "background with detailed gold accents. Add cow motifs and decorative floral " +
      "garlands in the border. Use Pichwai ornate floral style with fine brushwork.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Pichwai painting from the Nathdwara tradition with intricate " +
      "lotus flower patterns. Use rich dark blue or black background with gold accents. " +
      "Add decorative floral garlands and cow motifs in the border. " +
      "Use Pichwai ornate floral style with fine brushwork.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES (2)
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face shape, eyes, nose, jawline, hairstyle, and expression " +
      "of this person — do not alter any facial features. Make the person look slightly " +
      "more attractive with clearer skin. " +
      "Restyle the image as Japanese anime art with expressive eyes, clean precise " +
      "linework, and vibrant saturated colors. Render detailed hair with strand highlights. " +
      "Add a Studio Ghibli inspired atmospheric background with soft bokeh lighting. " +
      "Use cel-shading and crisp outlines.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as Japanese anime art with expressive cute eyes, clean precise " +
      "linework, and vibrant colors. Use cel-shading with dynamic composition and soft " +
      "atmospheric background. Make the animal adorable in anime style while keeping " +
      "its exact breed features and coloring.",
  },

  "bollywood-retro": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person — " +
      "do not alter any facial features. Make the person look glamorous with enhanced skin. " +
      "Restyle the image as a vintage hand-painted Bollywood movie poster from the 1970s " +
      "with bold saturated colors and visible painted brushstroke texture. Create dramatic " +
      "composition with retro Indian cinema aesthetic — dramatic side lighting and " +
      "dramatic sky background. Use hand-painted movie poster style with oil paint texture.",

    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a vintage hand-painted Bollywood movie poster from the 1970s " +
      "with bold saturated colors and painted brushstroke texture. Create dramatic " +
      "composition with retro cinema lighting and dramatic sky background. " +
      "Use hand-painted poster style with oil paint texture.",
  },
};

// ─── Default fallback config ─────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 3.5,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 0.85,
  loraTrigger: null,
  humanPrompt:
    "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person. " +
    "Restyle the image as a traditional Indian art style painting with rich colors, " +
    "ornate details, and traditional artistic techniques.",
  petPrompt:
    "Keep the exact same animal — same breed, fur color, markings, and eye color. " +
    "Restyle the image as a traditional Indian art style painting with rich colors, " +
    "ornate details, and traditional artistic techniques.",
};

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the full style configuration for a given style slug.
 */
export function getStyleConfig(slug: string): StyleConfig {
  return STYLE_CONFIGS[slug] ?? DEFAULT_CONFIG;
}

/**
 * Build the final prompt for a generation.
 *
 * Uses Kontext-optimized prompts from this module.
 * Falls back to DB prompt_template with {subject} replacement if no
 * Kontext prompt is configured (for future styles added via Supabase).
 */
export function buildPrompt(
  slug: string,
  subjectType: "human" | "pet",
  dbPromptTemplate?: string
): string {
  const config = STYLE_CONFIGS[slug];

  if (config) {
    // Use our Kontext-optimized prompt
    const basePrompt =
      subjectType === "pet" ? config.petPrompt : config.humanPrompt;

    // If LoRA trigger word exists, prepend it (for both humans and pets)
    if (config.loraTrigger) {
      return `${config.loraTrigger} style. ${basePrompt}`;
    }

    return basePrompt;
  }

  // Fallback: use DB prompt template with {subject} replacement
  if (dbPromptTemplate) {
    const subjectLabel = subjectType === "pet" ? "pet animal" : "person";
    return dbPromptTemplate
      .replace(/\{subject\}/gi, subjectLabel)
      .replace(/\{subject_type\}/gi, subjectType);
  }

  // Last resort fallback
  const label = subjectType === "pet" ? "pet" : "person";
  return `Keep the exact same features of this ${label}. Restyle the image as traditional Indian art with rich colors and ornate details.`;
}
