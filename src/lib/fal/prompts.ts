/**
 * V6 Prompts — Full Style Blending with Face Recognition
 *
 * KEY CHANGES FROM V5:
 * 1. FULL ARTISTIC RENDERING: The entire portrait (face + body + background)
 *    is rendered in the art style — not just the background
 * 2. FACE RECOGNITION, NOT PHOTOREALISM: "The face should be recognizable as
 *    the same person" rather than "keep the face photorealistic"
 * 3. STYLE BLENDING: "Transform this entire portrait into X style" — the
 *    subject should look like they were PAINTED in that tradition
 * 4. STILL PRESERVE IDENTITY: Same face structure, gender, expression —
 *    but rendered artistically, not as a photo pasted on a painting
 *
 * The user's goal: output should look like an authentic piece of Indian art
 * that happens to feature the person's recognizable face — not a photo
 * with a fancy background.
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  /** Kontext guidance_scale — 3.5 is API default for Pro, 2.5 for LoRA */
  guidanceScale: number;
  /** Inference steps — more steps = better quality but slower */
  numInferenceSteps: number;
  /** LoRA URL for pet pipeline (null = use Kontext Pro fallback for pets) */
  loraUrl: string | null;
  /** LoRA weight scale (0-2, default 1.0 per API docs) */
  loraScale: number;
  /** Human prompt template */
  humanPrompt: string;
  /** Pet prompt template */
  petPrompt: string;
  /** LoRA trigger word (for trained LoRAs) */
  loraTrigger: string | null;
}

// ─── V6 Shared prompt fragments ─────────────────────────────────────────────
// Goal: blend subject INTO the art style. Face should be recognizable but
// artistically rendered — not a photorealistic cutout on a styled background.

const BLEND_FACE =
  "The face must be recognizable as the same person — same face structure, " +
  "gender, skin tone, and expression — but rendered in the artistic style, " +
  "not as a photograph. The entire image should look like one cohesive artwork.";

const PET_BLEND =
  "The animal must be recognizable as the same breed and individual — same fur color, " +
  "markings, and features — but rendered in the artistic style. " +
  "The entire image should look like one cohesive artwork.";

/**
 * Per-style generation configs — V6 Full Style Blending
 *
 * HUMAN portraits: guidance_scale 4.0 — slightly above default 3.5 to
 * push stronger style application while Kontext preserves identity.
 *
 * PET portraits with LoRA: guidance_scale 2.5, loraScale 1.0 (API defaults).
 */
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ROYAL STYLES (10) — Kontext Pro, full style rendering
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Rajasthani Mewar miniature painting. " +
      "Render the person in the classic Mewar court style with fine ink outlines, " +
      "flat color fills, and visible brushwork across the entire image including the face. " +
      "Use rich jewel tones of deep red, gold, and emerald. " +
      "Add an ornate golden border frame, palace courtyard with arched pillars and jali patterns. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Rajasthani Mewar miniature painting. " +
      "Render the animal in the classic Mewar style with fine ink outlines and flat color fills. " +
      "Use rich jewel tones of deep red and gold. Add an ornate golden border, " +
      "palace courtyard with arched pillars and intricate floral patterns. " +
      PET_BLEND,
  },

  "maratha-heritage": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Maratha Peshwa-era court painting. " +
      "Render the person in the Peshwa painting tradition with strong outlines, " +
      "flat color fills, and the deep maroon and gold color palette. " +
      "Place in a fort rampart or durbar hall with stone pillars and draped textiles. " +
      "The entire image should look like an authentic Peshwa court artwork. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Maratha Peshwa-era court painting. " +
      "Render the animal in the Peshwa painting style with strong outlines and flat fills. " +
      "Use deep maroon and gold colors. Place in a regal fort setting. " +
      PET_BLEND,
  },

  "tanjore-heritage": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      "Transform this entire portrait into a Tanjore Thanjavur painting. " +
      "Render the person in the rich Tanjore tradition with vibrant colors, " +
      "prominent gold leaf embellishments, and the characteristic semi-raised surface texture. " +
      "Frame the subject in an ornate gem-studded arch with South Indian temple pillars. " +
      "The entire image — face, body, and background — should have the Tanjore aesthetic. " +
      BLEND_FACE,
    petPrompt:
      "mrs_tanjore style. Transform this entire photo into a Tanjore Thanjavur painting. " +
      "Render the animal in the Tanjore style with vibrant colors, gold leaf embellishments. " +
      "Frame in an ornate arch with South Indian pillars and gem-studded details. " +
      PET_BLEND,
  },

  "mysore-palace": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Mysore Wodeyar court painting. " +
      "Render the person in the elegant Mysore tradition with refined brushwork, " +
      "muted gold tones, and deep green accents. Place in a palatial interior " +
      "with carved wooden pillars and delicate curtain draping. " +
      "Apply the Mysore gesso-work aesthetic across the entire composition. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Mysore Wodeyar court painting. " +
      "Render the animal in the elegant Mysore style with refined brushwork, " +
      "muted gold tones, and deep green accents. Place in a palatial setting. " +
      PET_BLEND,
  },

  "punjab-royal": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Sikh court painting from the Punjab tradition. " +
      "Render the person in the bold Punjabi royal style with vibrant rich colors " +
      "and ornate textile patterns. Place in a Lahore darbar hall with marble pillars, " +
      "chandeliers, and rich carpet. Apply warm golden lighting and the Sikh court " +
      "painting aesthetic to the entire image. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Sikh court painting from the Punjab tradition. " +
      "Render the animal in the bold Punjabi royal style. Place on a cushioned throne " +
      "in a darbar hall with marble pillars and warm golden lighting. " +
      PET_BLEND,
  },

  "bengal-renaissance": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Bengal School painting in the tradition " +
      "of Abanindranath Tagore. Render the person using soft watercolor wash technique, " +
      "flowing graceful lines, and earthy muted tones with subtle golden undertones. " +
      "Create a dreamy atmospheric quality with soft gradients. " +
      "The entire image should look like a Bengal Renaissance watercolor artwork. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Bengal School watercolor painting. " +
      "Render the animal using soft wash technique, flowing lines, and earthy muted tones. " +
      "Create a dreamy atmospheric quality throughout the image. " +
      PET_BLEND,
  },

  "kerala-mural": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Kerala Panchavarna mural painting. " +
      "Render the person with bold thick black outlines and the five traditional colors: " +
      "yellow ochre, red, green, blue, and white. Use the flat Kerala mural style " +
      "across the entire image. Add decorative floral borders, lotus motifs, " +
      "and a palace wall fresco background. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Kerala Panchavarna mural painting. " +
      "Render the animal with bold thick black outlines and the five traditional colors. " +
      "Add decorative floral borders, lotus motifs, and flat perspective. " +
      PET_BLEND,
  },

  "pahari-mountain": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Pahari Kangra school miniature painting. " +
      "Render the person with delicate fine brushwork, soft pastel colors, and rich accents. " +
      "Place in a lyrical Himalayan mountain landscape with flowering trees and gentle streams. " +
      "Include an ornamental painted border with floral patterns. " +
      "The entire composition should feel like an authentic Kangra miniature. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Pahari Kangra miniature painting. " +
      "Render the animal with delicate fine brushwork and soft pastel colors. " +
      "Place in a Himalayan mountain landscape with flowering trees. " +
      "Add ornamental border with floral patterns. " +
      PET_BLEND,
  },

  "deccani-royal": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Deccani painting from the Bijapur-Golconda tradition. " +
      "Render the person in the rich Deccani style with luxurious colors and " +
      "Persian-influenced composition. Add an ornate background with Islamic domes, " +
      "pointed arches, geometric tile patterns, and gold accents. " +
      "The entire artwork should blend Indian and Persian artistic sensibilities. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Deccani painting from the Bijapur tradition. " +
      "Render the animal in the Deccani style with rich colors and Persian-influenced composition. " +
      "Place in an ornate setting with Islamic arches and geometric patterns. " +
      PET_BLEND,
  },

  "miniature-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into an Indo-Islamic miniature painting. " +
      "Render the person in the classic miniature style with intricate detailed brushwork, " +
      "rich colors, gold leaf accents, and flat perspective. " +
      "Place in a palace garden with cypress trees, fountains, and blooming flowers. " +
      "Add an ornate border filled with floral arabesque patterns. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into an Indo-Islamic miniature painting. " +
      "Render the animal in miniature style with intricate brushwork and gold accents. " +
      "Place in a palace garden with cypress trees and flowers. " +
      "Add ornate floral arabesque border. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES (3) — LoRA for pets only, Kontext Pro for humans
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      "Transform this entire portrait into a Madhubani Mithila painting. " +
      "Render the person in the Madhubani folk art style with bold black ink outlines, " +
      "dense geometric patterns, and vibrant primary colors — red, yellow, blue, green. " +
      "Fill the entire composition with characteristic Madhubani patterns including " +
      "fish, peacock, and lotus motifs. The face and body should be stylized in " +
      "the Madhubani tradition while remaining recognizable. " +
      BLEND_FACE,
    petPrompt:
      "mrs_madhubani style. Transform this entire photo into a Madhubani Mithila painting. " +
      "Render the animal in the Madhubani folk art style with bold black ink outlines " +
      "and vibrant primary colors. Fill the background with dense geometric patterns, " +
      "fish, peacock, and lotus motifs. " +
      PET_BLEND,
  },

  "warli-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "Transform this entire portrait into Warli tribal art. " +
      "Render the person blended into the Warli painting tradition — the face should be " +
      "recognizable but artistically rendered, not a photograph. " +
      "Use a dark terracotta brown background filled with traditional white Warli motifs: " +
      "circular sun, triangular mountains, dancing figure chains, and nature scenes " +
      "in white rice-paste line art. Add a Warli-patterned border frame. " +
      "The person's features should harmonize with the Warli aesthetic. " +
      BLEND_FACE,
    petPrompt:
      "mrs_warli style. Transform this entire photo into Warli tribal art. " +
      "Render the animal blended into the Warli style on a dark terracotta brown background " +
      "filled with traditional white Warli motifs: circular sun, triangular mountains, " +
      "dancing figures, and nature scenes in white line art. " +
      PET_BLEND,
  },

  "pichwai-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a Pichwai Nathdwara painting. " +
      "Render the person in the ornate Pichwai style with intricate lotus flower patterns, " +
      "rich dark blue or black background, and detailed gold accents throughout. " +
      "Add cow motifs, decorative floral garlands, and fine Pichwai brushwork " +
      "across the entire composition. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a Pichwai Nathdwara painting. " +
      "Render the animal in the Pichwai style with intricate lotus patterns, " +
      "rich dark blue background, gold accents, and decorative floral garlands. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES (2)
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into anime art style. " +
      "Render the person as an anime character with clean precise linework, " +
      "vibrant saturated colors, cel-shading, and detailed hair with strand highlights. " +
      "The face proportions and features must match the original person but in anime style. " +
      "Add a Studio Ghibli inspired atmospheric background with soft bokeh lighting. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into Japanese anime art style. " +
      "Render the animal as an anime character with expressive cute eyes, " +
      "clean precise linework, vibrant colors, and cel-shading. " +
      "Add a dynamic atmospheric background. " +
      PET_BLEND,
  },

  "bollywood-retro": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this entire portrait into a vintage 1970s hand-painted Bollywood movie poster. " +
      "Render the person in the classic hand-painted poster style with bold saturated colors, " +
      "visible painted brushstroke texture, dramatic side lighting, and a dramatic sky. " +
      "The entire image should look like an authentic 70s Bollywood poster — " +
      "the face should be recognizable but painted, not photographic. " +
      BLEND_FACE,
    petPrompt:
      "Transform this entire photo into a vintage 1970s Bollywood movie poster style. " +
      "Render the animal with bold saturated colors, painted brushstroke texture, " +
      "dramatic composition, and retro cinema lighting. " +
      PET_BLEND,
  },
};

// ─── Default fallback config ─────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 4.0,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 1.0,
  loraTrigger: null,
  humanPrompt:
    "Transform this entire portrait into a traditional Indian art painting. " +
    "Render the person in the artistic style with rich colors and ornate details. " +
    BLEND_FACE,
  petPrompt:
    "Transform this entire photo into a traditional Indian art painting. " +
    "Render the animal in the artistic style with rich colors and ornate details. " +
    PET_BLEND,
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
 * V6: Human prompts NEVER include LoRA trigger words (humans use Kontext Pro).
 * Pet prompts include the trigger word when a LoRA is available.
 */
export function buildPrompt(
  slug: string,
  subjectType: "human" | "pet",
  dbPromptTemplate?: string
): string {
  const config = STYLE_CONFIGS[slug];

  if (config) {
    if (subjectType === "pet") {
      return config.petPrompt;
    }
    return config.humanPrompt;
  }

  // Fallback: use DB prompt template with {subject} replacement
  if (dbPromptTemplate) {
    const subjectLabel = subjectType === "pet" ? "pet animal" : "person";
    return dbPromptTemplate
      .replace(/\{subject\}/gi, subjectLabel)
      .replace(/\{subject_type\}/gi, subjectType);
  }

  // Last resort
  const label = subjectType === "pet" ? "pet" : "person";
  return `Transform this entire portrait into traditional Indian art. Render the ${label} in the artistic style while keeping the face recognizable as the same individual. The entire image should look like one cohesive artwork.`;
}
