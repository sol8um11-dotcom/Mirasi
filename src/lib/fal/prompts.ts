/**
 * Kontext-optimized prompt templates and style configuration.
 *
 * V3 Prompts — Maximum Identity Preservation
 *
 * Key principles for Flux Kontext Pro style transfer:
 * 1. IDENTITY FIRST: Triple-reinforced preservation clause at start AND end of prompt
 * 2. Use "Apply artistic style to background/clothing/border" not "Restyle the image"
 *    (keeps the face untouched, modifies everything else)
 * 3. Explicit facial feature checklist REPEATED: face shape, eyes, nose, jawline, skin tone, age
 * 4. CRITICAL block: "The face must be a photorealistic likeness"
 * 5. Very low guidance_scale (2.0–2.5) for non-LoRA = minimal identity drift
 * 6. LoRA styles: guidance 3.0, scale 0.7 (lower LoRA influence to protect identity)
 * 7. Warli: hybrid approach — photorealistic portrait with Warli decorative frame/background
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

// ─── Shared prompt fragments (V3: triple-reinforced identity) ────────────────

const IDENTITY_PREFIX =
  "CRITICAL: This is a portrait — the person's face must remain a photorealistic, recognizable likeness. " +
  "Preserve the EXACT same face, eye shape, eye color, nose shape, lip shape, jawline, cheekbones, " +
  "skin tone, skin texture, facial hair, age, and expression. Do NOT alter, age, de-age, or idealize " +
  "any facial features. The face must look like the same real person. ";

const IDENTITY_SUFFIX =
  " IMPORTANT: The face and head must remain photorealistic and identical to the input photo. " +
  "Only the background, clothing, borders, and artistic treatment should change — never the face.";

const PET_PREFIX =
  "CRITICAL: Keep the EXACT same animal — same breed, fur color pattern, markings, eye color, " +
  "ear shape, muzzle shape, and body proportions. The animal must be clearly the same individual. ";

const PET_SUFFIX =
  " IMPORTANT: The animal must remain photorealistic and identical to the input photo.";

/**
 * Per-style generation configs — V3 Maximum Identity Preservation
 *
 * Trained LoRAs are available for: warli-art, madhubani-art, tanjore-heritage.
 * Other styles use Kontext Pro (no LoRA) — train via fal-ai/flux-kontext-trainer
 * and paste the diffusers_lora_file URLs here when ready.
 */
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ROYAL STYLES (10) — guidanceScale: 2.0 for maximum face preservation
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply the artistic style of a Rajasthani Mewar miniature painting to the clothing, background, and frame only. " +
      "Add an ornate golden border frame, rich jewel tones of deep red, gold, and emerald green. " +
      "Place a palace courtyard background with arched pillars, jali patterns, and traditional " +
      "Rajput ornaments. Use Mewar fine brushwork with visible ink outlines on the background elements." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply the artistic style of a Rajasthani Mewar miniature painting to the background and frame. " +
      "Add ornate golden border frame, rich jewel tones of deep red and gold. " +
      "Place the animal on an ornate cushion in a palace courtyard with arched pillars. " +
      "Use Mewar fine brushwork with ink outlines and intricate floral patterns." +
      PET_SUFFIX,
  },

  "maratha-heritage": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply the artistic style of a Maratha Peshwa-era court painting to the clothing, background, and composition. " +
      "Use a deep maroon and gold color palette. Add a fort rampart or durbar hall background " +
      "with stone pillars and draped textiles. Apply Peshwa painting style with strong " +
      "outlines and flat color fills to background elements. Add traditional Maratha ornaments." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply the artistic style of a Maratha Peshwa-era court painting to the background and setting. " +
      "Use deep maroon and gold colors. Place the animal in a regal fort setting with stone pillars and " +
      "draped textiles. Apply Peshwa style outlines to background elements and add Maratha motif borders." +
      PET_SUFFIX,
  },

  "tanjore-heritage": {
    guidanceScale: 3.0,
    numInferenceSteps: 28,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 0.7,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Tanjore Thanjavur painting style to the clothing, ornaments, arch frame, and background. " +
      "Add rich vibrant colors, prominent gold leaf embellishments, and gem-studded details. Frame the subject " +
      "in an ornate arch with South Indian temple pillars. Add traditional jewelry, " +
      "silk garments with zari borders. Use semi-raised gold surface texture " +
      "and vivid warm color palette on all non-face elements." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Tanjore Thanjavur painting style to the frame, background, and decorative elements. " +
      "Add rich vibrant colors, prominent gold leaf embellishments. Frame the animal in an ornate arch with " +
      "South Indian decorative pillars. Add gold-bordered cushion and floral garland " +
      "details. Use semi-raised gold textures and vivid warm colors." +
      PET_SUFFIX,
  },

  "mysore-palace": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Mysore painting style in the Wodeyar court tradition to the clothing, background, and frame. " +
      "Use elegant composition, muted gold tones, and deep green accents. Add a palatial interior " +
      "with carved wooden pillars and delicate curtain draping. Use refined brushwork " +
      "with subtle gesso preparation and thin gold lines on the decorative elements." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Mysore painting style in the Wodeyar tradition to the background and setting. " +
      "Use elegant composition, muted gold tones, and deep green accents. Place the animal in a " +
      "palatial setting with carved wooden pillars. Use refined brushwork with " +
      "subtle gold lines and the Mysore court aesthetic." +
      PET_SUFFIX,
  },

  "punjab-royal": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Sikh court painting style from the Punjab tradition to the clothing, background, and setting. " +
      "Use vibrant rich colors and ornate textiles featuring detailed embroidery patterns. " +
      "Add a Lahore darbar hall background with marble pillars, chandeliers, and rich carpet. " +
      "Use bold Punjabi royal color palette with warm golden lighting." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Sikh court painting style from the Punjab tradition to the background and setting. " +
      "Use vibrant rich colors and ornate textile backdrop with embroidery patterns. " +
      "Place the animal on a cushioned throne in a darbar hall with marble pillars. " +
      "Use bold Punjabi royal color palette with warm golden lighting." +
      PET_SUFFIX,
  },

  "bengal-renaissance": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Bengal School painting style in the tradition of Abanindranath Tagore to the background and artistic treatment. " +
      "Use soft watercolor wash technique, flowing graceful lines, and earthy muted " +
      "color palette with subtle golden undertones on the background. Add a dreamy atmospheric background " +
      "with soft gradients. Apply delicate brushstrokes and poetic romantic composition to non-face elements." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Bengal School watercolor painting style to the background and artistic treatment. " +
      "Use soft wash technique, flowing graceful lines, and earthy muted tones with golden undertones. " +
      "Add a dreamy atmospheric background. Apply delicate brushstrokes " +
      "characteristic of the Bengal Renaissance style." +
      PET_SUFFIX,
  },

  "kerala-mural": {
    guidanceScale: 2.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Kerala Panchavarna mural painting style to the clothing, ornaments, background, and decorative frame. " +
      "Use bold thick black outlines and the five traditional colors: yellow ochre, red, green, blue, and white " +
      "on the background and border elements. Add decorative floral borders and lotus motifs. " +
      "Place subject against a palace wall fresco background." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Kerala Panchavarna mural painting style to the background and decorative frame. " +
      "Use bold thick black outlines and five traditional colors: yellow ochre, red, green, blue, and white. " +
      "Add decorative floral borders and lotus motifs. Use flat perspective with " +
      "ornate details characteristic of Kerala mural art." +
      PET_SUFFIX,
  },

  "pahari-mountain": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Pahari miniature painting style in the Kangra school tradition to the background and frame. " +
      "Use delicate fine brushwork, soft pastel colors, and rich accent tones on the setting. " +
      "Add a Himalayan mountain landscape background with flowering trees and gentle " +
      "streams. Include ornamental painted border with floral patterns." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Pahari Kangra miniature painting style to the background and setting. " +
      "Use delicate fine brushwork, soft pastel colors, and rich accents. Place the animal in a lyrical " +
      "Himalayan mountain landscape with flowering trees. Add ornamental painted border " +
      "with floral patterns and a serene mood." +
      PET_SUFFIX,
  },

  "deccani-royal": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Deccani painting style from the Bijapur-Golconda tradition to the clothing, background, and frame. " +
      "Use rich luxurious colors and Persian-influenced composition. Add an ornate background " +
      "with Islamic domes, pointed arches, and geometric tile patterns. Include gold " +
      "accent details and refined courtly textile patterns." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Deccani painting style from the Bijapur tradition to the background and setting. " +
      "Use rich luxurious colors and Persian-influenced composition. Place the animal in an ornate " +
      "setting with Islamic arches and geometric patterns. Add gold accents blending " +
      "Indian and Persian artistic elements." +
      PET_SUFFIX,
  },

  "miniature-art": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Indo-Islamic miniature painting style to the clothing, background, and decorative border. " +
      "Use intricate detailed brushwork and an ornate border filled with floral arabesque patterns. " +
      "Add a palace garden background with cypress trees, fountains, and blooming flowers. " +
      "Use rich colors with gold leaf accents and classical flat perspective on non-face elements." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Indo-Islamic miniature painting style to the background and decorative border. " +
      "Use intricate brushwork and ornate floral arabesque border. Place the animal in a palace garden with " +
      "cypress trees and flowers. Use rich colors with gold accents and flat perspective " +
      "characteristic of Mughal miniature art." +
      PET_SUFFIX,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES (3) — LoRA styles use guidanceScale: 3.0, loraScale: 0.7
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 3.0,
    numInferenceSteps: 28,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 0.7,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Madhubani Mithila painting style to the background, clothing, and decorative borders only. " +
      "Add bold black ink outlines and geometric patterns filling the background and frame. Use vibrant primary colors — " +
      "red, yellow, blue, green. Add fish, peacock, and lotus border motifs. Fill the " +
      "background with dense geometric and floral patterns leaving no empty space. " +
      "The face must remain a clear photorealistic likeness." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Madhubani Mithila folk art painting style to the background and decorative borders. " +
      "Add bold black ink outlines and geometric patterns filling the background. Use vibrant primary colors " +
      "— red, yellow, blue, green. Add fish, peacock, and lotus border motifs. " +
      "Fill the background with dense Madhubani patterns." +
      PET_SUFFIX,
  },

  "warli-art": {
    guidanceScale: 3.0,
    numInferenceSteps: 28,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 0.6,
    loraTrigger: "mrs_warli",
    humanPrompt:
      IDENTITY_PREFIX +
      "Keep the face fully photorealistic — this is the most important requirement. " +
      "Apply Warli tribal art style ONLY to the background, border, and decorative elements. " +
      "Create a dark terracotta brown background filled with traditional white Warli motifs: " +
      "circular sun, triangular mountains, dancing figure chains, and nature scenes painted in " +
      "white rice-paste line art. Add an ornate Warli-patterned border frame around the portrait. " +
      "The clothing can have Warli-inspired geometric patterns. " +
      "The face and skin MUST remain photorealistic — never convert to stick figures or geometric shapes." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Keep the animal fully photorealistic. " +
      "Apply Warli tribal art style ONLY to the background and decorative border. " +
      "Create a dark terracotta brown background filled with traditional white Warli motifs: " +
      "circular sun, triangular mountains, dancing figures, and nature scenes in white line art. " +
      "Add a Warli-patterned border frame. The animal must remain photorealistic — " +
      "never convert to stick figures or geometric shapes." +
      PET_SUFFIX,
  },

  "pichwai-art": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply Pichwai painting style from the Nathdwara tradition to the background, clothing, and decorative frame. " +
      "Add intricate lotus flower patterns throughout the background composition. Use a rich dark blue or black " +
      "background with detailed gold accents. Add cow motifs and decorative floral " +
      "garlands in the border. Use Pichwai ornate floral style with fine brushwork on non-face areas." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Pichwai painting style from the Nathdwara tradition to the background and frame. " +
      "Add intricate lotus flower patterns. Use rich dark blue or black background with gold accents. " +
      "Add decorative floral garlands and cow motifs in the border. " +
      "Use Pichwai ornate floral style with fine brushwork." +
      PET_SUFFIX,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES (2) — guidanceScale: 2.0
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 2.5,
    numInferenceSteps: 40,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply anime art style rendering while keeping the face clearly recognizable as the same person. " +
      "Use clean precise linework, vibrant saturated colors, and cel-shading. " +
      "Render detailed hair with strand highlights. " +
      "Add a Studio Ghibli inspired atmospheric background with soft bokeh lighting. " +
      "The face proportions, eye shape, nose, and jawline must match the original photo." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply Japanese anime art style with expressive cute eyes, clean precise " +
      "linework, and vibrant colors. Use cel-shading with dynamic composition and soft " +
      "atmospheric background. Make the animal adorable in anime style while keeping " +
      "its exact breed features and coloring." +
      PET_SUFFIX,
  },

  "bollywood-retro": {
    guidanceScale: 2.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      IDENTITY_PREFIX +
      "Apply vintage 1970s hand-painted Bollywood movie poster style to the composition and background. " +
      "Use bold saturated colors and visible painted brushstroke texture on the background elements. " +
      "Create dramatic composition with retro Indian cinema aesthetic — dramatic side lighting and " +
      "dramatic sky background. The face must remain a recognizable photorealistic likeness of the person." +
      IDENTITY_SUFFIX,

    petPrompt:
      PET_PREFIX +
      "Apply vintage 1970s hand-painted Bollywood movie poster style to the background and composition. " +
      "Use bold saturated colors and painted brushstroke texture. Create dramatic " +
      "composition with retro cinema lighting and dramatic sky background. " +
      "Use hand-painted poster style with oil paint texture." +
      PET_SUFFIX,
  },
};

// ─── Default fallback config ─────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 2.0,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 0.85,
  loraTrigger: null,
  humanPrompt:
    IDENTITY_PREFIX +
    "Apply a traditional Indian art style to the background, clothing, and decorative frame only. " +
    "Use rich colors, ornate details, and traditional artistic techniques." +
    IDENTITY_SUFFIX,
  petPrompt:
    PET_PREFIX +
    "Apply a traditional Indian art style to the background and frame. " +
    "Use rich colors, ornate details, and traditional artistic techniques." +
    PET_SUFFIX,
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
  return `Keep the exact same features of this ${label}. Apply traditional Indian art style to background and frame only. The face must remain photorealistic.`;
}
