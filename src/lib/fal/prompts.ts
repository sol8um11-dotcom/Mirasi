/**
 * V7 Prompts — Intensified Style Effects + Face Recognition
 *
 * KEY CHANGES FROM V6:
 * 1. guidance_scale 5.0 (was 4.0) — much stronger style push
 * 2. MORE EMPHATIC style language: "heavily stylized", "bold and prominent",
 *    "every element must reflect the art tradition"
 * 3. TEXTURE + MEDIUM CUES: explicitly describe the physical medium
 *    (ink on paper, paint on canvas, gold leaf, rice paste) to trigger
 *    stronger material rendering
 * 4. REDUCED identity clause weight — shorter BLEND_FACE so style gets
 *    more token budget
 *
 * User feedback: "style has very minimal effects compared to thumbnails"
 * → We need the AI to go MUCH harder on the artistic transformation.
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  guidanceScale: number;
  numInferenceSteps: number;
  loraUrl: string | null;
  loraScale: number;
  humanPrompt: string;
  petPrompt: string;
  loraTrigger: string | null;
}

// ─── V7 Shared prompt fragments ─────────────────────────────────────────────
// Shorter identity clause = more token budget for style details.

const BLEND_FACE =
  "IMPORTANT: The face must remain recognizable as the same person — preserve the exact facial structure, " +
  "jawline, nose shape, eye shape, skin tone, facial hair, and gender. " +
  "Render the face in the artistic style but keep all identifying features intact.";

const PET_BLEND =
  "The animal must remain recognizable but fully rendered in the artistic style.";

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ROYAL STYLES (10) — guidance_scale 5.0 for intense style
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Rajasthani Mewar miniature painting as if " +
      "hand-painted with natural pigments on handmade paper. " +
      "The face, clothing, and every element must be heavily stylized in the Mewar court tradition — " +
      "fine ink outlines around all features, flat color fills with no photographic shading, " +
      "visible brushwork texture. Use rich jewel tones: deep vermillion, emerald green, gold, lapis blue. " +
      "Add ornate golden border frame with jali filigree patterns, Mughal arched pillars, " +
      "palace courtyard with blooming lotus pond. No photorealistic elements anywhere. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Rajasthani Mewar miniature painting. " +
      "Render the animal with fine ink outlines, flat color fills, and Mewar brushwork. " +
      "Use rich jewel tones. Add ornate golden border frame, palace courtyard, lotus motifs. " +
      PET_BLEND,
  },

  "maratha-heritage": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Maratha Peshwa-era court painting, " +
      "as if painted by a Deccani court artist with mineral pigments on cloth. " +
      "Heavy stylization: strong dark outlines around all features including face, " +
      "flat opaque color fills, no photographic shading or gradients. " +
      "Deep maroon, burnt sienna, antique gold palette. " +
      "Background: fort rampart durbar hall with massive stone pillars, war banners, " +
      "draped brocade textiles. Ornate painted border with Maratha saffron flag motifs. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Maratha Peshwa-era court painting. " +
      "Strong dark outlines, flat opaque fills. Deep maroon and gold palette. " +
      "Fort rampart background with stone pillars and war banners. " +
      PET_BLEND,
  },

  "tanjore-heritage": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      "Completely transform this portrait into an authentic Tanjore Thanjavur painting " +
      "with heavy gold leaf embellishments, as if on a wooden panel with gesso and gold foil. " +
      "The face and body must be rendered in the bold Tanjore style — " +
      "round face, almond eyes with thick kohl outlines, vibrant flat colors. " +
      "Prominent raised gold borders, gem-studded ornate arch frame, " +
      "South Indian temple pillars with carved figures. " +
      "Rich crimson, emerald green, royal blue with extensive gold leaf areas. " +
      "Semi-3D raised texture effect on gold elements. No photorealistic areas. " +
      BLEND_FACE,
    petPrompt:
      "mrs_tanjore style. Completely transform this photo into a Tanjore Thanjavur painting. " +
      "Heavy gold leaf, gem-studded arch, ornate frame, vibrant colors. " +
      "South Indian temple pillars. Rich raised gold texture throughout. " +
      PET_BLEND,
  },

  "mysore-palace": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Mysore Wodeyar court painting " +
      "in the elegant South Indian palatial style, as if painted with gesso on wood. " +
      "Refined brushwork with visible paint texture, muted antique gold leaf, " +
      "deep forest green and ivory color palette. " +
      "Palatial interior with ornately carved Mysore rosewood pillars, silk curtains, " +
      "chandeliers, and checkered marble floor. " +
      "The entire image should feel like a museum-quality Mysore painting. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Mysore Wodeyar court painting. " +
      "Refined brushwork, muted gold tones, deep green accents, palatial setting. " +
      PET_BLEND,
  },

  "punjab-royal": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Sikh court painting from the Lahore darbar, " +
      "painted in the bold Punjab Pahari tradition with opaque watercolors. " +
      "Vibrant saturated colors, thick visible outlines, flat opaque fills. " +
      "Rich saffron, royal blue, deep crimson, burnished gold palette. " +
      "Background: grand Lahore darbar hall with white marble pillars, crystal chandeliers, " +
      "Phulkari embroidered textile backdrop, Persian carpet. " +
      "Ornate border with Sikh symbols and floral motifs. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Sikh court painting. " +
      "Bold vibrant colors, thick outlines, grand darbar hall, Phulkari backdrop. " +
      PET_BLEND,
  },

  "bengal-renaissance": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Bengal School painting in the style of " +
      "Abanindranath Tagore, using wet-on-wet watercolor wash technique on textured paper. " +
      "Soft ethereal washes, bleeding color boundaries, visible water stains and paper texture. " +
      "Earthy ochre, muted terracotta, faded indigo, pale gold undertones. " +
      "Dreamy atmospheric background dissolving into soft color gradients. " +
      "Flowing graceful brushstrokes with intentional imperfections. " +
      "The entire image should feel like a century-old Bengal watercolor. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Bengal School watercolor painting. " +
      "Soft washes, bleeding colors, paper texture, dreamy atmosphere. Earthy muted tones. " +
      PET_BLEND,
  },

  "kerala-mural": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Kerala Panchavarna temple mural, " +
      "as if painted directly on a temple wall with natural vegetable pigments. " +
      "Very bold thick black outlines around ALL features including face — " +
      "this is the defining characteristic. Use ONLY the five traditional colors: " +
      "yellow ochre, red oxide, green, blue, and white. Flat perspective, no shading. " +
      "Elaborate decorative borders with lotus chains, mythical creatures. " +
      "Face rendered with the characteristic large eyes and ornate expression of Kerala murals. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Kerala Panchavarna temple mural. " +
      "Very bold black outlines. Only five colors: ochre, red, green, blue, white. " +
      "Flat perspective. Elaborate lotus borders. " +
      PET_BLEND,
  },

  "pahari-mountain": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Pahari Kangra school miniature painting, " +
      "painted with fine sable brushes and mineral pigments on wasli paper. " +
      "Delicate fine brushwork with visible individual brush lines, " +
      "soft pastel pinks, sky blues, and leaf greens with rich accent colors. " +
      "Lyrical Himalayan landscape background: snow-capped peaks, flowering trees " +
      "with individually painted leaves, gentle streams, grazing deer. " +
      "Ornamental painted border with intricate floral vine patterns. " +
      "Flat perspective typical of Kangra style. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Pahari Kangra miniature painting. " +
      "Fine brushwork, soft pastels, Himalayan landscape, flowering trees, ornamental border. " +
      PET_BLEND,
  },

  "deccani-royal": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a Deccani painting from the Bijapur-Golconda court, " +
      "blending Indian and Persian artistic traditions with opaque watercolors. " +
      "Rich luxurious colors: deep purple, turquoise, gold leaf, crimson. " +
      "Persian-influenced facial rendering with idealized proportions. " +
      "Background: ornate Islamic architecture with onion domes, pointed arches, " +
      "geometric zellige tile patterns, arabesque foliage. " +
      "Extensive gold leaf accents on clothing, border, and architecture. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Deccani painting from the Bijapur court. " +
      "Rich luxurious colors, Persian composition, Islamic architecture, gold leaf accents. " +
      PET_BLEND,
  },

  "miniature-art": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into an Indo-Islamic Mughal miniature painting, " +
      "as if painted by a master court artist with fine brushes and mineral pigments. " +
      "Intricate ultra-detailed brushwork, visible individual brush lines on face and clothing. " +
      "Rich saturated colors with real gold leaf accents, flat classical perspective. " +
      "Palace garden background: symmetrical cypress trees, marble fountains, " +
      "blooming roses and jasmine with individually painted petals. " +
      "Elaborate border: floral arabesque with gold leaf and lapis lazuli blue. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Mughal miniature painting. " +
      "Ultra-detailed brushwork, gold leaf accents, palace garden, ornate arabesque border. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES (3) — LoRA for pets only, Kontext Pro for humans
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 5.0,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      "Completely transform this portrait into an authentic Madhubani Mithila painting, " +
      "as if drawn with bamboo nibs and natural pigments on handmade paper. " +
      "EVERY surface must be filled with dense patterns — no empty space allowed. " +
      "Bold black ink outlines around all features including the face. " +
      "Vibrant primary colors filling every area: vermillion red, turmeric yellow, " +
      "indigo blue, leaf green. Characteristic double-line border technique. " +
      "Background densely packed with Madhubani motifs: fish, peacocks, " +
      "lotus flowers, sun/moon, geometric lattice patterns. " +
      BLEND_FACE,
    petPrompt:
      "mrs_madhubani style. Completely transform this photo into a Madhubani painting. " +
      "Bold black outlines, dense patterns everywhere, vibrant primary colors. " +
      "Fish, peacock, lotus motifs filling all space. " +
      PET_BLEND,
  },

  "warli-art": {
    guidanceScale: 5.0,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "Completely transform this portrait into authentic Warli tribal art, " +
      "as if painted with white rice paste on a dark mud wall. " +
      "The ENTIRE image including the face must be rendered in the Warli geometric style — " +
      "simplified triangular and circular shapes, stick-figure proportions, " +
      "white line art on dark terracotta/chocolate brown background. " +
      "Surround the portrait with traditional Warli scene: concentric circle sun, " +
      "triangular mountains, chain of dancing figures, trees with birds, " +
      "bullock carts, tarpa dancers in a spiral. Warli dot-pattern border frame. " +
      "No photographic or realistic elements anywhere — pure tribal art. " +
      BLEND_FACE,
    petPrompt:
      "mrs_warli style. Completely transform this photo into Warli tribal art. " +
      "White rice paste lines on dark terracotta. Geometric shapes, " +
      "dancing figures, sun circles, mountains. Pure tribal art style. " +
      PET_BLEND,
  },

  "pichwai-art": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into an authentic Pichwai Nathdwara temple painting, " +
      "as if painted on starched cloth with natural pigments. " +
      "Dense intricate lotus flower patterns covering EVERY surface. " +
      "Rich dark indigo/black background with detailed gold accents and raised texture. " +
      "Ornate border with sacred cows, decorative floral garlands, mango leaf torans. " +
      "Fine Pichwai brushwork with individually painted lotus petals and gold highlights. " +
      "The entire image should be overwhelmingly ornate and detailed. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a Pichwai Nathdwara painting. " +
      "Dense lotus patterns everywhere, dark indigo background, gold accents, " +
      "sacred cow motifs, floral garlands. Overwhelmingly ornate. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES (2)
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into high-quality anime art in the style of " +
      "Studio Ghibli / Makoto Shinkai. Full anime rendering — " +
      "clean precise vector-like linework, flat cel-shading with sharp shadow boundaries, " +
      "vibrant hyper-saturated colors, large expressive eyes with detailed iris reflections. " +
      "Detailed anime hair with individually rendered strands and highlight streaks. " +
      "Atmospheric background: cherry blossoms, golden hour light rays, soft bokeh particles. " +
      "No photographic elements — pure anime artwork. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into Studio Ghibli style anime art. " +
      "Flat cel-shading, clean linework, vibrant colors, expressive eyes. " +
      "Cherry blossom atmospheric background. Pure anime style. " +
      PET_BLEND,
  },

  "bollywood-retro": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Completely transform this portrait into a vintage 1970s hand-painted Bollywood movie poster. " +
      "Classic hand-painted oil/acrylic poster style — bold exaggerated colors, " +
      "thick visible paint strokes, dramatic chiaroscuro lighting, idealized features. " +
      "Dramatic composition: face fills 60% of frame with intense dramatic expression. " +
      "Fiery sunset/stormy sky background with painted clouds. " +
      "Vintage film grain texture and slightly worn poster aesthetic. " +
      "Think Sippy Films era — the face should look painted by a master poster artist, " +
      "not photographic at all. " +
      BLEND_FACE,
    petPrompt:
      "Completely transform this photo into a 1970s Bollywood movie poster style. " +
      "Bold painted strokes, dramatic lighting, fiery sky, vintage poster aesthetic. " +
      PET_BLEND,
  },
};

// ─── Default fallback ────────────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 5.0,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 1.0,
  loraTrigger: null,
  humanPrompt:
    "Completely transform this portrait into a traditional Indian art painting. " +
    "Heavy stylization with visible brushwork and traditional techniques. " +
    BLEND_FACE,
  petPrompt:
    "Completely transform this photo into a traditional Indian art painting. " +
    "Heavy stylization with visible brushwork and traditional techniques. " +
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
  return `Completely transform this portrait into traditional Indian art. Render the ${label} in heavily stylized artistic manner while keeping the face recognizable. No photographic elements.`;
}
