/**
 * V5 Prompts — Research-Backed Identity-First Style Transfer
 *
 * Based on comprehensive research of:
 * - Black Forest Labs official prompting guide (docs.bfl.ai)
 * - fal.ai API documentation (Kontext Pro default guidance_scale: 3.5)
 * - Community best practices for face preservation
 *
 * KEY CHANGES FROM V4:
 * 1. INSTRUCTIONAL VERB FORMAT: "Apply X to the background while keeping Y"
 *    per BFL prompting guide — not "CRITICAL:" preamble
 * 2. SPECIFIC SUBJECT REFERENCES: "the person in the photo" not pronouns
 * 3. KONTEXT PRO FOR ALL HUMANS: guidance_scale 3.5 (API default) — was 2.0-2.5
 *    which was TOO LOW causing the model to ignore identity instructions
 * 4. COMPOSITION LOCKING: "keep the exact same position, scale, and framing"
 * 5. NATURAL PRESERVATION LANGUAGE: "while maintaining the same facial features,
 *    expression, hairstyle, and gender" — what BFL recommends
 * 6. LORA ONLY FOR PETS: Human portraits NEVER use LoRA pipeline
 *    (pet-trained LoRAs were destroying human identity/gender)
 * 7. SHORTER PROMPTS: Max 512 tokens per Kontext API limit
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
  /** Human prompt template — instructional format for Kontext Pro */
  humanPrompt: string;
  /** Pet prompt template — breed/feature preservation focus */
  petPrompt: string;
  /** LoRA trigger word (for trained LoRAs) */
  loraTrigger: string | null;
}

// ─── V5 Shared prompt fragments ─────────────────────────────────────────────
// BFL recommends: be specific about identity markers, use descriptive subject
// references (not pronouns), and explicitly state what stays consistent.

const FACE_KEEP =
  "while maintaining the exact same facial features, expression, skin tone, " +
  "hairstyle, facial hair, and gender of the person in the photo. " +
  "Keep the person in the exact same position, scale, and camera angle.";

const PET_KEEP =
  "while maintaining the exact same breed, fur color, markings, eye color, " +
  "and body proportions of the animal in the photo. " +
  "Keep the animal in the exact same position and framing.";

/**
 * Per-style generation configs — V5 Research-Backed
 *
 * HUMAN portraits: guidance_scale 3.5 (Kontext Pro default) — this is the
 * sweet spot where the model both follows the prompt AND preserves identity.
 * Values below 3.0 caused identity instructions to be partially ignored.
 *
 * PET portraits with LoRA: guidance_scale 2.5 (Kontext LoRA default),
 * loraScale 1.0 (API default for maximum style adherence).
 */
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ROYAL STYLES (10) — Kontext Pro only (no LoRA for humans)
  // guidance_scale: 3.5 (API default — optimal identity + prompt balance)
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Rajasthani Mewar miniature painting style to the background and border of this portrait, " +
      FACE_KEEP +
      " Add an ornate golden border frame with rich jewel tones of deep red, gold, and emerald. " +
      "Place a palace courtyard background with arched pillars and jali patterns. " +
      "Use Mewar fine brushwork with visible ink outlines on background elements only.",

    petPrompt:
      "Apply Rajasthani Mewar miniature painting style to the background and frame of this photo, " +
      PET_KEEP +
      " Add ornate golden border frame with rich jewel tones of deep red and gold. " +
      "Place an ornate cushion beneath the animal in a palace courtyard with arched pillars. " +
      "Use Mewar fine brushwork with ink outlines and intricate floral patterns on background only.",
  },

  "maratha-heritage": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Maratha Peshwa-era court painting style to the background and composition of this portrait, " +
      FACE_KEEP +
      " Use a deep maroon and gold color palette. Add a fort rampart or durbar hall background " +
      "with stone pillars and draped textiles. Apply Peshwa painting style with strong " +
      "outlines and flat color fills to background elements only.",

    petPrompt:
      "Apply Maratha Peshwa-era court painting style to the background and setting of this photo, " +
      PET_KEEP +
      " Use deep maroon and gold colors. Place the animal in a regal fort setting with stone pillars and " +
      "draped textiles. Apply Peshwa style outlines to background elements and add Maratha motif borders.",
  },

  "tanjore-heritage": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      "Apply Tanjore Thanjavur painting style to the arch frame and background of this portrait, " +
      FACE_KEEP +
      " Add rich vibrant colors, prominent gold leaf embellishments, and gem-studded arch details " +
      "framing the subject. Use South Indian temple pillars in the background. " +
      "Apply semi-raised gold surface texture and vivid warm colors on the frame and background only. " +
      "Do not add any accessories or jewelry to the person.",

    petPrompt:
      "mrs_tanjore style. Apply Tanjore Thanjavur painting style to the frame and background, " +
      PET_KEEP +
      " Add rich vibrant colors, prominent gold leaf embellishments. Frame the animal in an ornate arch " +
      "with South Indian decorative pillars. Add gold-bordered cushion and floral garland details. " +
      "Use semi-raised gold textures and vivid warm colors.",
  },

  "mysore-palace": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Mysore Wodeyar court painting style to the background and frame of this portrait, " +
      FACE_KEEP +
      " Use elegant composition with muted gold tones and deep green accents. Add a palatial interior " +
      "background with carved wooden pillars and delicate curtain draping. " +
      "Apply refined brushwork with subtle gesso preparation and thin gold lines on decorative elements only.",

    petPrompt:
      "Apply Mysore Wodeyar court painting style to the background and setting of this photo, " +
      PET_KEEP +
      " Use elegant composition with muted gold tones and deep green accents. Place the animal in a " +
      "palatial setting with carved wooden pillars. Use refined brushwork with " +
      "subtle gold lines and the Mysore court aesthetic on background only.",
  },

  "punjab-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Sikh court painting style from the Punjab tradition to the background and setting of this portrait, " +
      FACE_KEEP +
      " Use vibrant rich colors and ornate textile backdrop with embroidery patterns. " +
      "Add a Lahore darbar hall background with marble pillars, chandeliers, and rich carpet. " +
      "Use bold Punjabi royal color palette with warm golden lighting on background only.",

    petPrompt:
      "Apply Sikh court painting style from the Punjab tradition to the background of this photo, " +
      PET_KEEP +
      " Use vibrant rich colors and ornate textile backdrop with embroidery patterns. " +
      "Place the animal on a cushioned throne in a darbar hall with marble pillars. " +
      "Use bold Punjabi royal color palette with warm golden lighting.",
  },

  "bengal-renaissance": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Bengal School painting style in the tradition of Abanindranath Tagore to the background of this portrait, " +
      FACE_KEEP +
      " Use soft watercolor wash technique, flowing graceful lines, and earthy muted " +
      "color palette with subtle golden undertones on the background. Add a dreamy atmospheric background " +
      "with soft gradients. Apply delicate brushstrokes to non-face areas only.",

    petPrompt:
      "Apply Bengal School watercolor painting style to the background of this photo, " +
      PET_KEEP +
      " Use soft wash technique, flowing graceful lines, and earthy muted tones with golden undertones. " +
      "Add a dreamy atmospheric background. Apply delicate brushstrokes " +
      "characteristic of the Bengal Renaissance style to background only.",
  },

  "kerala-mural": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Kerala Panchavarna mural painting style to the background and decorative frame of this portrait, " +
      FACE_KEEP +
      " Use bold thick black outlines and the five traditional colors: yellow ochre, red, green, blue, and white " +
      "on the background and border elements. Add decorative floral borders and lotus motifs. " +
      "Place a palace wall fresco background. Do not change the person's face or features.",

    petPrompt:
      "Apply Kerala Panchavarna mural painting style to the background and decorative frame of this photo, " +
      PET_KEEP +
      " Use bold thick black outlines and five traditional colors: yellow ochre, red, green, blue, and white. " +
      "Add decorative floral borders and lotus motifs. Use flat perspective with " +
      "ornate details characteristic of Kerala mural art on background only.",
  },

  "pahari-mountain": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Pahari Kangra school miniature painting style to the background and frame of this portrait, " +
      FACE_KEEP +
      " Use delicate fine brushwork, soft pastel colors, and rich accent tones on the setting. " +
      "Add a Himalayan mountain landscape background with flowering trees and gentle " +
      "streams. Include ornamental painted border with floral patterns around the portrait.",

    petPrompt:
      "Apply Pahari Kangra miniature painting style to the background of this photo, " +
      PET_KEEP +
      " Use delicate fine brushwork, soft pastel colors, and rich accents. Place the animal in a lyrical " +
      "Himalayan mountain landscape with flowering trees. Add ornamental painted border " +
      "with floral patterns and a serene mood.",
  },

  "deccani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Deccani painting style from the Bijapur-Golconda tradition to the background and frame of this portrait, " +
      FACE_KEEP +
      " Use rich luxurious colors and Persian-influenced composition. Add an ornate background " +
      "with Islamic domes, pointed arches, and geometric tile patterns. Include gold " +
      "accent details and refined courtly patterns on the border only.",

    petPrompt:
      "Apply Deccani painting style from the Bijapur tradition to the background of this photo, " +
      PET_KEEP +
      " Use rich luxurious colors and Persian-influenced composition. Place the animal in an ornate " +
      "setting with Islamic arches and geometric patterns. Add gold accents blending " +
      "Indian and Persian artistic elements on background only.",
  },

  "miniature-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Indo-Islamic miniature painting style to the background and decorative border of this portrait, " +
      FACE_KEEP +
      " Add intricate detailed brushwork and an ornate border filled with floral arabesque patterns. " +
      "Place a palace garden background with cypress trees, fountains, and blooming flowers. " +
      "Use rich colors with gold leaf accents and classical flat perspective on non-face elements only.",

    petPrompt:
      "Apply Indo-Islamic miniature painting style to the background and border of this photo, " +
      PET_KEEP +
      " Add intricate brushwork and ornate floral arabesque border. Place the animal in a palace garden " +
      "with cypress trees and flowers. Use rich colors with gold accents and flat perspective " +
      "characteristic of Mughal miniature art on background only.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES (3) — LoRA for pets only, Kontext Pro for humans
  // Human: guidance_scale 3.5 (Kontext Pro)
  // Pet LoRA: guidance_scale 2.5, loraScale 1.0 (API defaults)
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      "Apply Madhubani Mithila painting style to the background and decorative border of this portrait, " +
      FACE_KEEP +
      " Add bold black ink outlines and geometric patterns filling the background frame. " +
      "Use vibrant primary colors — red, yellow, blue, green. " +
      "Add fish, peacock, and lotus border motifs around the portrait. " +
      "Fill the background with dense geometric and floral Madhubani patterns. " +
      "Do not change or add anything to the person's face, hair, or body.",

    petPrompt:
      "mrs_madhubani style. Apply Madhubani Mithila folk art painting style to the background and borders, " +
      PET_KEEP +
      " Add bold black ink outlines and geometric patterns filling the background. Use vibrant primary colors " +
      "— red, yellow, blue, green. Add fish, peacock, and lotus border motifs. " +
      "Fill the background with dense Madhubani patterns.",
  },

  "warli-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "Apply Warli tribal art style to the background and border frame of this portrait only, " +
      FACE_KEEP +
      " The face and body must remain fully photorealistic — this is the most important requirement. " +
      "Create a dark terracotta brown background filled with traditional white Warli motifs: " +
      "circular sun, triangular mountains, dancing figure chains, and nature scenes in " +
      "white rice-paste line art. Add a Warli-patterned border frame around the portrait. " +
      "Never convert the face to painted, stylized, or stick figure style.",

    petPrompt:
      "mrs_warli style. Apply Warli tribal art style to the background and border frame only, " +
      PET_KEEP +
      " Keep the animal fully photorealistic. " +
      "Create a dark terracotta brown background filled with traditional white Warli motifs: " +
      "circular sun, triangular mountains, dancing figures, and nature scenes in white line art. " +
      "Add a Warli-patterned border frame. Never convert the animal to stick figures.",
  },

  "pichwai-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply Pichwai Nathdwara painting style to the background and decorative frame of this portrait, " +
      FACE_KEEP +
      " Add intricate lotus flower patterns throughout the background. Use a rich dark blue or black " +
      "background with detailed gold accents. Add cow motifs and decorative floral " +
      "garlands in the border. Use Pichwai ornate floral style with fine brushwork on background only.",

    petPrompt:
      "Apply Pichwai Nathdwara painting style to the background and frame of this photo, " +
      PET_KEEP +
      " Add intricate lotus flower patterns. Use rich dark blue or black background with gold accents. " +
      "Add decorative floral garlands and cow motifs in the border. " +
      "Use Pichwai ornate floral style with fine brushwork on background only.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES (2) — Kontext Pro only, guidance_scale 3.5
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Convert this portrait to anime art style, " +
      "while maintaining the same recognizable facial features, expression, hairstyle, and gender " +
      "of the person in the photo. Keep the exact same position and framing. " +
      "Use clean precise linework, vibrant saturated colors, and cel-shading. " +
      "Render detailed hair with strand highlights. " +
      "Add a Studio Ghibli inspired atmospheric background with soft bokeh lighting. " +
      "The face proportions, eye shape, nose, and jawline must match the original photo.",

    petPrompt:
      "Convert this photo to Japanese anime art style, " +
      PET_KEEP +
      " Use expressive cute eyes, clean precise linework, and vibrant colors. " +
      "Apply cel-shading with dynamic composition and soft atmospheric background. " +
      "Make the animal adorable in anime style while keeping its exact breed features and coloring.",
  },

  "bollywood-retro": {
    guidanceScale: 3.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Apply vintage 1970s hand-painted Bollywood movie poster style to the background of this portrait, " +
      FACE_KEEP +
      " Use bold saturated colors and visible painted brushstroke texture on the background. " +
      "Create dramatic composition with retro Indian cinema aesthetic — dramatic side lighting and " +
      "dramatic sky background. The face must remain a recognizable photorealistic likeness.",

    petPrompt:
      "Apply vintage 1970s Bollywood movie poster style to the background of this photo, " +
      PET_KEEP +
      " Use bold saturated colors and painted brushstroke texture. Create dramatic " +
      "composition with retro cinema lighting and dramatic sky background. " +
      "Use hand-painted poster style with oil paint texture on background only.",
  },
};

// ─── Default fallback config ─────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 3.5,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 1.0,
  loraTrigger: null,
  humanPrompt:
    "Apply a traditional Indian art style to the background and decorative frame of this portrait, " +
    FACE_KEEP +
    " Use rich colors, ornate details, and traditional artistic techniques on background only.",
  petPrompt:
    "Apply a traditional Indian art style to the background and frame of this photo, " +
    PET_KEEP +
    " Use rich colors, ornate details, and traditional artistic techniques on background only.",
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
 * V5: Human prompts NEVER include LoRA trigger words (humans use Kontext Pro).
 * Pet prompts include the trigger word when a LoRA is available.
 *
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
    if (subjectType === "pet") {
      // Pet prompts already have trigger word baked in (in petPrompt text)
      return config.petPrompt;
    }
    // Human prompts — pure Kontext Pro, no trigger words
    return config.humanPrompt;
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
  return `Apply traditional Indian art style to the background and frame of this photo while maintaining the exact same facial features, expression, and gender of the ${label}. Keep the ${label} photorealistic.`;
}
