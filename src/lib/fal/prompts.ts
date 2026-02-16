/**
 * Kontext-optimized prompt templates and style configuration.
 *
 * Key principles for Flux Kontext Pro style transfer:
 * 1. Use "Transform this portrait..." not "A portrait of {subject}..."
 * 2. Name the exact art tradition + describe visual characteristics
 * 3. Explicitly state what to preserve: face, expression, pose
 * 4. Describe background, colors, textures specific to the tradition
 * 5. Humans: higher guidance (4.0) + more steps (50) for strong style
 * 6. Pets: use LoRA when available, fallback to Pro with adapted prompt
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  /** Kontext guidance_scale — higher = stronger style adherence */
  guidanceScale: number;
  /** Inference steps — more steps = better quality but slower */
  numInferenceSteps: number;
  /** LoRA URL for pet pipeline (null = use Kontext Pro fallback for pets) */
  loraUrl: string | null;
  /** LoRA weight scale (0-4) */
  loraScale: number;
  /** Human prompt template — uses Kontext "transform" pattern */
  humanPrompt: string;
  /** Pet prompt template — adapted for animal features */
  petPrompt: string;
  /** LoRA trigger word (for trained LoRAs) */
  loraTrigger: string | null;
}

/**
 * Per-style generation configs.
 *
 * LoRA URLs are null for now — once you train style LoRAs via
 * fal-ai/flux-kontext-trainer, paste the diffusers_lora_file URLs here.
 */
const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ROYAL STYLES (10)
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Rajasthani Mewar miniature painting. " +
      "Apply flat perspective with ornate golden border frame, rich jewel tones of deep red, " +
      "gold, and emerald green. Place the subject in a palace courtyard with arched pillars " +
      "and intricate jali patterns. Add traditional Rajput ornaments and detailed textile " +
      "patterns. Use the characteristic Mewar style fine brushwork with visible ink outlines. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Rajasthani Mewar miniature painting. " +
      "Apply flat perspective with ornate golden border frame, rich jewel tones of deep red " +
      "and gold. Place the animal on an ornate cushion in a palace courtyard setting with " +
      "arched pillars. Use traditional Mewar fine brushwork with visible ink outlines and " +
      "intricate floral patterns in the background. Maintain the animal's exact features, " +
      "coloring, and expression.",
  },

  "maratha-heritage": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Maratha Peshwa-era court painting. " +
      "Apply bold composition with deep maroon and gold color palette. Place the subject " +
      "in a fort rampart or durbar hall background with stone pillars and draped textiles. " +
      "Add dignified martial posture elements with traditional Maratha ornaments. Use the " +
      "characteristic Peshwa painting style with strong outlines and flat color fills. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Maratha Peshwa-era court painting. " +
      "Apply bold composition with deep maroon and gold colors. Place the animal in a " +
      "regal fort setting with stone pillars and draped textiles. Use characteristic " +
      "Peshwa painting style with strong outlines and flat color fills, decorative border " +
      "with Maratha motifs. Maintain the animal's exact features, coloring, and expression.",
  },

  "tanjore-heritage": {
    guidanceScale: 5.0, // Higher for strong gold leaf effect
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Tanjore Thanjavur painting. " +
      "Apply rich vibrant colors with prominent gold leaf embellishments and gem-studded " +
      "details. Frame the subject in an ornate arch with South Indian temple-inspired " +
      "decorative pillars. Add detailed traditional jewelry, silk garments with zari " +
      "borders. Use the characteristic Tanjore style with semi-raised gold surface, " +
      "warm lighting, and vivid color palette. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Tanjore Thanjavur painting. " +
      "Apply rich vibrant colors with prominent gold leaf embellishments. Frame the " +
      "animal in an ornate arch with South Indian decorative pillars. Add gold-bordered " +
      "cushion and floral garland details. Use the Tanjore style with semi-raised gold " +
      "textures and vivid warm color palette. Maintain the animal's exact features, " +
      "coloring, and expression.",
  },

  "mysore-palace": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Mysore painting in the Wodeyar court tradition. " +
      "Apply elegant composition with muted gold tones and deep green accents. Place the " +
      "subject in a palatial Mysore palace interior with carved wooden pillars and " +
      "delicate curtain draping. Use refined brushwork with subtle gesso preparation, " +
      "thin gold lines, and the characteristic South Indian royal court aesthetic. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Mysore painting in the Wodeyar tradition. " +
      "Apply elegant composition with muted gold tones and deep green accents. Place the " +
      "animal in a palatial setting with carved wooden pillars. Use refined brushwork " +
      "with subtle gold lines and the Mysore court aesthetic. " +
      "Maintain the animal's exact features, coloring, and expression.",
  },

  "punjab-royal": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Sikh court painting from the Punjab tradition. " +
      "Apply vibrant rich colors with ornate textiles featuring detailed embroidery " +
      "patterns. Place the subject in a Lahore darbar hall setting with marble pillars, " +
      "chandeliers, and rich carpet. Add traditional Punjabi royal jewelry and headwear " +
      "details. Use the characteristic bold color palette with warm golden lighting. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Sikh court painting from the Punjab tradition. " +
      "Apply vibrant rich colors with ornate textile backdrop featuring embroidery patterns. " +
      "Place the animal on a cushioned throne in a darbar hall with marble pillars. " +
      "Use bold Punjabi royal color palette with warm golden lighting and decorative border. " +
      "Maintain the animal's exact features, coloring, and expression.",
  },

  "bengal-renaissance": {
    guidanceScale: 3.5, // Lower for softer wash effect
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Bengal School painting in the style of " +
      "Abanindranath Tagore. Apply soft watercolor wash technique with flowing " +
      "graceful lines and an earthy muted color palette with subtle golden undertones. " +
      "Create an atmospheric dreamy background with soft gradients. Use delicate " +
      "brushstrokes and the poetic romantic composition characteristic of the Bengal " +
      "Renaissance movement. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Bengal School watercolor painting. " +
      "Apply soft wash technique with flowing graceful lines and earthy muted tones " +
      "with subtle golden undertones. Create a dreamy atmospheric background. " +
      "Use delicate brushstrokes characteristic of the Bengal Renaissance style. " +
      "Maintain the animal's exact features, coloring, and expression.",
  },

  "kerala-mural": {
    guidanceScale: 5.0, // Higher for bold outline style
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Kerala Panchavarna mural painting. " +
      "Apply bold thick black outlines with the five traditional mural colors: " +
      "yellow ochre, red, green, blue, and white. Add decorative floral borders " +
      "and lotus motifs in the traditional fresco style. Use flat perspective with " +
      "ornate details, stylized features with large expressive eyes characteristic " +
      "of Kerala mural art. Place subject against a palace wall fresco background. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Kerala Panchavarna mural painting. " +
      "Apply bold thick black outlines with five traditional colors: yellow ochre, " +
      "red, green, blue, and white. Add decorative floral borders and lotus motifs. " +
      "Use flat perspective with ornate details characteristic of Kerala mural art. " +
      "Maintain the animal's exact features, coloring, and expression.",
  },

  "pahari-mountain": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Pahari miniature painting in the Kangra school " +
      "tradition. Apply delicate fine brushwork with soft pastel colors and rich accent " +
      "tones. Place the subject in a lyrical Himalayan mountain landscape background " +
      "with flowering trees and gentle streams. Add an ornamental painted border with " +
      "floral patterns. Create a romantic serene mood with the characteristic Kangra " +
      "school elegance. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Pahari Kangra miniature painting. " +
      "Apply delicate fine brushwork with soft pastel colors and rich accents. " +
      "Place the animal in a lyrical Himalayan mountain landscape with flowering " +
      "trees. Add ornamental painted border with floral patterns and serene mood. " +
      "Maintain the animal's exact features, coloring, and expression.",
  },

  "deccani-royal": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Deccani painting from the Bijapur-Golconda " +
      "tradition. Apply rich luxurious colors with Persian-influenced composition. " +
      "Place the subject in an ornate architectural background with Islamic domes, " +
      "pointed arches, and geometric tile patterns. Add gold accent details and " +
      "refined courtly textile patterns. Use the characteristic Deccani style blending " +
      "Indian and Persian artistic elements. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Deccani painting from the Bijapur tradition. " +
      "Apply rich luxurious colors with Persian-influenced composition. Place the animal " +
      "in an ornate setting with Islamic arches and geometric patterns. Add gold accents " +
      "and the Deccani style blending Indian and Persian elements. " +
      "Maintain the animal's exact features, coloring, and expression.",
  },

  "miniature-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into an Indo-Islamic miniature painting. " +
      "Apply intricate detailed brushwork with an ornate decorative border filled " +
      "with floral arabesque patterns. Place the subject in a palace garden " +
      "background with cypress trees, fountains, and blooming flowers. Use rich " +
      "colors with gold leaf accents, classical flat perspective, and the highly " +
      "refined composition characteristic of Mughal-era miniature art. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into an Indo-Islamic miniature painting. " +
      "Apply intricate detailed brushwork with ornate floral arabesque border. " +
      "Place the animal in a palace garden with cypress trees and flowers. " +
      "Use rich colors with gold accents and flat perspective characteristic of " +
      "Mughal miniature art. Maintain the animal's exact features, coloring, " +
      "and expression.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES (3)
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 5.0, // High for bold geometric patterns
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.9,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Madhubani Mithila painting. " +
      "Apply bold black ink outlines with geometric patterns filling every surface. " +
      "Use vibrant primary colors — red, yellow, blue, green — in characteristic " +
      "Madhubani style. Add nature motifs with fish, peacock, and lotus borders. " +
      "Fill the background completely with dense geometric and floral patterns " +
      "leaving no empty space. Use symmetrical folk art composition with " +
      "hand-painted texture. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Madhubani Mithila folk art painting. " +
      "Apply bold black ink outlines with geometric patterns filling every surface. " +
      "Use vibrant primary colors — red, yellow, blue, green. Add fish, peacock, " +
      "and lotus border motifs. Fill the background with dense geometric and floral " +
      "Madhubani patterns. Maintain the animal's exact features and expression " +
      "while applying the folk art style.",
  },

  "warli-art": {
    guidanceScale: 5.5, // Highest — needs to override photorealism completely
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.9,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into Warli tribal art. Convert to white geometric " +
      "stick figures and shapes on a dark terracotta brown background. Use the " +
      "characteristic Warli minimalist style with circles, triangles, and lines. " +
      "Add traditional Warli motifs: circular sun, triangular mountains, dancing " +
      "figure borders, farming and nature scenes. Apply the hand-painted rice-paste " +
      "on mud-wall texture. Completely stylize the portrait into geometric Warli forms " +
      "while maintaining recognizable facial features and pose.",

    petPrompt:
      "Transform this photo of a pet into Warli tribal art. Convert to white " +
      "geometric shapes on a dark terracotta brown background. Use Warli minimalist " +
      "style with circles, triangles, and lines to represent the animal. Add " +
      "traditional Warli motifs: circular sun, triangular mountains, nature borders. " +
      "Apply rice-paste on mud-wall texture. Maintain recognizable animal shape " +
      "and features in the geometric Warli style.",
  },

  "pichwai-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Pichwai painting from the Nathdwara tradition. " +
      "Apply intricate lotus flower patterns throughout the composition. Use a rich " +
      "dark blue or black background with detailed gold accents. Add cow motifs and " +
      "decorative floral garlands in the border. Use the characteristic Pichwai " +
      "ornate floral style with fine detailed brushwork and traditional Indian " +
      "textile art aesthetic. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a Pichwai painting from the Nathdwara " +
      "tradition. Apply intricate lotus flower patterns throughout. Use rich dark " +
      "blue or black background with gold accents. Add decorative floral garlands " +
      "and traditional cow motifs in the border. Use Pichwai ornate floral style " +
      "with fine brushwork. Maintain the animal's exact features, coloring, " +
      "and expression.",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES (2)
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 4.0,
    numInferenceSteps: 40,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into Japanese anime manga art style. " +
      "Apply expressive large eyes, clean precise linework, and vibrant saturated " +
      "colors. Render detailed hair with individual strand highlights. Create a " +
      "Studio Ghibli inspired atmospheric background with soft bokeh lighting. " +
      "Use the characteristic anime aesthetic with cel-shading, dynamic " +
      "composition, and crisp outlines. " +
      "Maintain the same facial features, hairstyle, and expression of the person.",

    petPrompt:
      "Transform this photo of a pet into Japanese anime manga art style. " +
      "Apply expressive large cute eyes, clean precise linework, and vibrant " +
      "colors. Use cel-shading with dynamic composition and soft atmospheric " +
      "background. Make the animal adorable in anime chibi style while " +
      "maintaining its exact breed features, coloring, and expression.",
  },

  "bollywood-retro": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 0.85,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a vintage hand-painted Bollywood movie poster " +
      "from the 1970s. Apply bold saturated colors with visible painted brushstroke " +
      "texture. Create a dramatic composition with retro Indian cinema aesthetic — " +
      "dramatic side lighting, stylized glamorous features, and film poster layout " +
      "with dramatic sky background. Use the characteristic hand-painted movie " +
      "poster style with rich oil paint texture. " +
      "Maintain the same facial features, expression, and pose of the person.",

    petPrompt:
      "Transform this photo of a pet into a vintage hand-painted Bollywood movie " +
      "poster from the 1970s. Apply bold saturated colors with painted brushstroke " +
      "texture. Create dramatic composition with retro cinema lighting and dramatic " +
      "sky background. Use hand-painted movie poster style with oil paint texture. " +
      "Maintain the animal's exact features, coloring, and expression while giving " +
      "it a dramatic Bollywood star treatment.",
  },
};

// ─── Default fallback config ─────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 4.0,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 0.85,
  loraTrigger: null,
  humanPrompt:
    "Transform this portrait into traditional Indian art style painting. " +
    "Apply rich colors, ornate details, and traditional artistic techniques. " +
    "Maintain the same facial features, expression, and pose of the person.",
  petPrompt:
    "Transform this photo of a pet into traditional Indian art style painting. " +
    "Apply rich colors, ornate details, and traditional artistic techniques. " +
    "Maintain the animal's exact features, coloring, and expression.",
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

    // If LoRA trigger word exists, prepend it
    if (subjectType === "pet" && config.loraTrigger) {
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
  return `Transform this photo of a ${label} into traditional Indian art style. Maintain the subject's likeness and features while applying the artistic style.`;
}
