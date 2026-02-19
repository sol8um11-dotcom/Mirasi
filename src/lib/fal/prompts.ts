/**
 * V11 Prompts — Back to Basics: Kontext Pro + V2 Identity-First Prompts
 *
 * LESSON LEARNED: The very first session (V2) produced the BEST results.
 * Every "improvement" since then degraded quality:
 * - V3-V8: Longer, more aggressive prompts → worse style, identity drift
 * - V9: Flux Dev img2img → destroyed facial identity
 * - V10: PuLID Flux → beautiful style but ZERO facial resemblance
 *
 * THE FIX: Revert to what worked.
 * - Kontext Pro for ALL humans (proven identity preservation)
 * - Short, concise prompts (~4-5 sentences)
 * - Identity-first: "Keep exact same face..." BEFORE style description
 * - "Restyle" verb (gentler than "Transform")
 * - guidance_scale 3.0-4.5 range
 *
 * ROUTING:
 * - Humans → Kontext Pro (identity-preserving style transfer)
 * - Pets with LoRA → Kontext LoRA (trained style LoRAs)
 * - Pets without LoRA → Kontext Pro (fallback)
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  /** Kontext guidance_scale — lower = better identity, higher = stronger style */
  guidanceScale: number;
  /** Inference steps — more steps = better quality but slower */
  numInferenceSteps: number;
  /** Transformation intensity — used by LoRA pipeline only (0.01-1.0). */
  strength: number;
  /** PuLID identity weight — UNUSED in V11 (kept for interface compat) */
  idWeight: number;
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

// ─── Shared constants ────────────────────────────────────────────────────────

const PET_BLEND =
  "The animal must remain recognizable but fully rendered in the artistic style — same breed, markings, and coloring.";

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES — The 3 LoRA styles + Pichwai
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    strength: 0.88,
    idWeight: 0.7,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
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
      "mrs_madhubani style. Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Madhubani Mithila folk art painting with bold black ink " +
      "outlines and geometric patterns filling every surface. Use vibrant primary colors " +
      "— red, yellow, blue, green. Add fish, peacock, and lotus border motifs. " +
      "Fill the background with dense Madhubani patterns. " +
      PET_BLEND,
  },

  "warli-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    strength: 0.92,
    idWeight: 0.7,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "Keep the recognizable face shape and proportions of this person. " +
      "Restyle the entire image as Warli tribal art — white geometric stick figures " +
      "and shapes on a dark terracotta brown background. Use Warli minimalist style " +
      "with circles, triangles, and lines. Add traditional Warli motifs: circular sun, " +
      "triangular mountains, dancing figure borders. Apply hand-painted rice-paste " +
      "on mud-wall texture. The person should be recognizable in geometric Warli form.",
    petPrompt:
      "mrs_warli style. Keep the recognizable shape and proportions of this animal. " +
      "Restyle the entire image as Warli tribal art — white geometric shapes on a " +
      "dark terracotta brown background. Use Warli minimalist style with circles, " +
      "triangles, and lines to represent the animal. Add traditional Warli motifs: " +
      "circular sun, triangular mountains, nature borders. Apply rice-paste on " +
      "mud-wall texture. The animal should be clearly recognizable in Warli form. " +
      PET_BLEND,
  },

  "pichwai-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.88,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "Use Pichwai ornate floral style with fine brushwork. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH INDIAN STYLES — Tanjore, Mysore, Kerala Mural
  // ═══════════════════════════════════════════════════════════════════════════

  "tanjore-heritage": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    strength: 0.88,
    idWeight: 0.7,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
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
      "mrs_tanjore style. Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Restyle the image as a Tanjore Thanjavur painting with rich vibrant colors, " +
      "prominent gold leaf embellishments. Frame the animal in an ornate arch with " +
      "South Indian decorative pillars. Add gold-bordered cushion and floral garland " +
      "details. Use semi-raised gold textures and vivid warm colors. " +
      PET_BLEND,
  },

  "mysore-palace": {
    guidanceScale: 3.0,
    numInferenceSteps: 50,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "subtle gold lines and the Mysore court aesthetic. " +
      PET_BLEND,
  },

  "kerala-mural": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    strength: 0.90,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "ornate details characteristic of Kerala mural art. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MINIATURE / COURT PAINTING STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "Use Mewar fine brushwork with ink outlines and intricate floral patterns. " +
      PET_BLEND,
  },

  "miniature-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.85,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "characteristic of Mughal miniature art. " +
      PET_BLEND,
  },

  "pahari-mountain": {
    guidanceScale: 3.0,
    numInferenceSteps: 50,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "with floral patterns and a serene mood. " +
      PET_BLEND,
  },

  "deccani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "Indian and Persian artistic elements. " +
      PET_BLEND,
  },

  "maratha-heritage": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "decorative border with Maratha motifs. " +
      PET_BLEND,
  },

  "punjab-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "Use bold Punjabi royal color palette with warm golden lighting. " +
      PET_BLEND,
  },

  "bengal-renaissance": {
    guidanceScale: 3.0,
    numInferenceSteps: 50,
    strength: 0.88,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "characteristic of the Bengal Renaissance style. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "its exact breed features and coloring. " +
      PET_BLEND,
  },

  "bollywood-retro": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    strength: 0.85,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
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
      "Use hand-painted poster style with oil paint texture. " +
      PET_BLEND,
  },
};

// ─── Default fallback ────────────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 3.5,
  numInferenceSteps: 50,
  strength: 0.87,
  idWeight: 0.7,
  loraUrl: null,
  loraScale: 1.0,
  loraTrigger: null,
  humanPrompt:
    "Keep the exact same face, eyes, nose, jawline, skin tone, and expression of this person. " +
    "Restyle the image as a traditional Indian art style painting with rich colors, " +
    "ornate details, and traditional artistic techniques.",
  petPrompt:
    "Keep the exact same animal — same breed, fur color, markings, and eye color. " +
    "Restyle the image as a traditional Indian art style painting with rich colors, " +
    "ornate details, and traditional artistic techniques. " +
    PET_BLEND,
};

// ─── Public API ──────────────────────────────────────────────────────────────

export function getStyleConfig(slug: string): StyleConfig {
  return STYLE_CONFIGS[slug] ?? DEFAULT_CONFIG;
}

export function buildPrompt(
  slug: string,
  subjectType: "human" | "pet",
  dbPromptTemplate?: string
): string {
  const config = STYLE_CONFIGS[slug];

  if (config) {
    return subjectType === "pet" ? config.petPrompt : config.humanPrompt;
  }

  if (dbPromptTemplate) {
    const subjectLabel = subjectType === "pet" ? "pet animal" : "person";
    return dbPromptTemplate
      .replace(/\{subject\}/gi, subjectLabel)
      .replace(/\{subject_type\}/gi, subjectType);
  }

  const label = subjectType === "pet" ? "pet" : "person";
  return `Keep the exact same features of this ${label}. Restyle the image as traditional Indian art with rich colors and ornate details.`;
}
