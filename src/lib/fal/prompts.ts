/**
 * V8 Prompts — Research-Driven Style Foundations
 *
 * Built from comprehensive research into each art tradition:
 * - Authentic art history sources (IGNCA, museum collections, academic scholarship)
 * - Style-specific visual characteristics, color palettes, composition rules
 * - Community prompt engineering best practices for Flux Kontext Pro
 * - Competitor analysis (Fable/Surreal)
 *
 * KEY CHANGES FROM V7:
 * 1. STYLE-SPECIFIC face blending (not one generic BLEND_FACE for all)
 *    - Each style describes HOW it renders faces, then asks for identity within that
 * 2. Research-backed terminology (do-rekha, panchavarna, hashiya, prabhavali, etc.)
 * 3. guidance_scale TUNED PER STYLE based on face preservation needs:
 *    - Styles with extreme face transformation (Warli): 4.0 (protect some identity)
 *    - Styles with moderate stylization (Madhubani, Tanjore): 4.5
 *    - Styles with naturalistic faces (Mughal, Bollywood): 5.0
 * 4. Prompt structure: Style → Medium → Elements → Colors → Composition → Face (last)
 *    (model weights early tokens more heavily)
 * 5. Shorter, more focused prompts (150-250 tokens optimal range)
 *
 * Reference: docs/style-foundations.md
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

// ─── V8 Shared constants ─────────────────────────────────────────────────────

const PET_BLEND =
  "The animal must remain recognizable but fully rendered in the artistic style — same breed, markings, and coloring.";

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES — The 3 LoRA styles + Pichwai
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      "Transform this portrait into an authentic Madhubani Mithila painting in the Bharni (filled color) style, " +
      "drawn with bamboo nibs and natural pigments on handmade paper. " +
      "Apply bold black DOUBLE-LINE (do-rekha) outlines around every form — two parallel lines with pattern fill between them. " +
      "Fill EVERY surface with dense decorative patterns — crosshatching, dots, geometric lattice — absolutely no empty space (horror vacui). " +
      "Use only traditional natural pigment colors: vermillion red, turmeric yellow, indigo blue, leaf green, black, white. " +
      "Flat matte colors, zero shading or gradients. " +
      "Pack the background with Madhubani motifs: stylized fish pairs, peacocks with fanned tails, lotus flowers, concentric-circle sun and moon, tree of life. " +
      "Frame with a multi-band decorative border: outer chain pattern, middle floral vine (lata), inner geometric band. " +
      "Render the face in Madhubani convention: large almond-shaped kohl-lined eyes dominating the face, flat single-color skin, " +
      "decorative rather than realistic — but preserve this person's facial structure, nose shape, and features so they are recognizable.",
    petPrompt:
      "mrs_madhubani style. Transform this photo into a Madhubani Mithila painting in Bharni style. " +
      "Bold black double-line outlines. Dense pattern fill on every surface — no empty space. " +
      "Vermillion, turmeric yellow, indigo, leaf green palette. Fish, peacock, lotus motifs. " +
      "Multi-band decorative border with chain and floral vine patterns. " +
      PET_BLEND,
  },

  "warli-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 30,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "Transform this portrait into authentic Warli tribal art painted with white rice paste on a dark reddish-brown mud wall. " +
      "Render the subject as an enlarged central Warli figure using ONLY geometric shapes: " +
      "circle for head, two joined triangles for torso, straight stick lines for limbs. " +
      "Use ONLY two colors: white on dark terracotta brown background — no other colors. " +
      "Lines must look hand-drawn with a bamboo stick — rough, slightly wobbly, textured, not clean vector art. " +
      "Fill the surrounding scene densely with traditional Warli motifs: " +
      "spiral Tarpa dance chain of connected figures, concentric-circle sun with rays, triangular mountains, " +
      "trees with dot-cluster leaves and perched birds, bullock carts, farming scenes, deer, peacocks. " +
      "Add a geometric border: zigzag or comb-ladder pattern. " +
      "Keep the subject's general build, hairstyle silhouette, and posture recognizable through the geometric rendering, " +
      "but commit fully to the Warli style — no photographic features.",
    petPrompt:
      "mrs_warli style. Transform this photo into Warli tribal art. " +
      "White rice paste on dark terracotta mud wall. Geometric shapes only — circles, triangles, lines. " +
      "Surround with Tarpa dance spiral, sun circles, trees with birds, farming scenes. " +
      "Rough bamboo-stick line quality. Zigzag border frame. " +
      PET_BLEND,
  },

  "pichwai-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into an authentic Pichwai painting from the Nathdwara Shrinathji temple tradition, " +
      "painted on starched cloth with natural mineral pigments and gold leaf. " +
      "Cover EVERY surface with dense intricate lotus flower patterns — individually painted petals in pink, white, and gold on a deep indigo-black background. " +
      "Add ornate gold leaf accents throughout: on clothing borders, jewelry, lotus highlights, and the elaborate multi-band border. " +
      "Include traditional Pichwai elements: sacred cows (kamadhenu), floral garlands (phool bangla), mango leaf torans, gopi attendant figures. " +
      "Strictly bilateral symmetry in composition. " +
      "Render the face with Pichwai conventions: idealized round features, large almond eyes, " +
      "flat rich colors with fine decorative brushwork — but preserve this person's facial structure and distinctive features.",
    petPrompt:
      "Transform this photo into a Pichwai Nathdwara temple painting. " +
      "Dense lotus flower patterns covering every surface. Deep indigo-black background with gold leaf accents. " +
      "Sacred cow motifs, floral garlands, mango leaf torans. Bilateral symmetry. " +
      "Ornate multi-band border with fine Pichwai brushwork. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SOUTH INDIAN STYLES — Tanjore, Mysore, Kerala Mural
  // ═══════════════════════════════════════════════════════════════════════════

  "tanjore-heritage": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      "Transform this portrait into an authentic Tanjore (Thanjavur) painting on a wooden panel with raised gesso and gold foil. " +
      "Apply EXTENSIVE metallic gold leaf covering 40-50% of the image: on the ornate prabhavali arch frame, " +
      "elaborate South Indian jewelry (tiered kiritam crown, multiple haram necklaces, keyura armlets, oddiyanam waist belt, payal anklets), " +
      "Dravidian temple pillar details, garment zari borders, and lotus pedestal. " +
      "The gold must look METALLIC and PHYSICALLY RAISED with embossed semi-3D texture, not flat yellow paint. " +
      "Deep crimson red background. Rich saturated jewel-tone colors — emerald green, royal blue, white — applied flat within bold black outlines. " +
      "Add gem-studding effect: sparkling embedded colored stones on crown, necklace pendant, and arch. " +
      "Multi-layered ornate border with mango-vine scrollwork and pearl-strand patterns. " +
      "Render the face with Tanjore conventions: round full features, large elongated kohl-lined almond eyes, " +
      "serene half-smile — but preserve this person's identity, bone structure, and skin tone.",
    petPrompt:
      "mrs_tanjore style. Transform this photo into a Tanjore Thanjavur painting. " +
      "Extensive metallic gold leaf with raised gesso texture. Ornate prabhavali arch, temple pillars. " +
      "Deep crimson background. Rich jewel-tone colors within bold outlines. " +
      "Gem-studded crown and jewelry. Multi-layered border with mango-vine scrollwork. " +
      PET_BLEND,
  },

  "mysore-palace": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a refined Mysore painting in the elegant Wodeyar court tradition, " +
      "painted with gesso technique on a wooden panel. " +
      "More subtle and refined than Tanjore: restrained gold leaf (10-20% coverage) with thin low-relief gesso, " +
      "muted but warm palette — soft reds, sage greens, warm ochres, soft blues, ivory. " +
      "Frame with a prabhavali arch and slender ornate rosewood-carved pillars in Mysore palace style. " +
      "Palatial interior setting: silk curtains, sandalwood-toned backdrop, jasmine garlands, Dasara festival elements. " +
      "Elegant multi-band border with refined floral patterns. " +
      "Fine precise brushwork with gentle curves and decorative interior patterning on textiles. " +
      "Render the face with South Indian painting conventions: rounded features, expressive eyes with kohl, " +
      "flat opaque skin tones — but preserve this person's identity, gender, and facial structure.",
    petPrompt:
      "Transform this photo into a refined Mysore Wodeyar court painting. " +
      "Restrained gold leaf, muted warm palette. Prabhavali arch with slender palace pillars. " +
      "Sage green, soft red, ivory tones. Fine brushwork, jasmine garlands. Elegant border. " +
      PET_BLEND,
  },

  "kerala-mural": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Kerala temple mural in the Panchavarna (five-color) tradition, " +
      "painted with natural vegetable pigments directly on a prepared temple wall surface. " +
      "Apply VERY BOLD thick black outlines around every element — this is the defining characteristic, " +
      "3-5 times thicker than other Indian painting traditions, creating a stained-glass effect. " +
      "Use ONLY the five traditional Panchavarna colors: yellow ochre (manayola), red oxide (chuvappu), " +
      "deep green (pachha), blue-black (neela), and white (velluppu). NO gold leaf, no other colors. " +
      "Add an elaborate tall kireedam (tiered crown) like Kathakali headpiece. " +
      "Ornate jewelry: multiple necklaces, large kundalams earrings, keyura armlets. " +
      "Border with padma-valli (lotus chain) pattern. Yellow ochre background. Completely flat, zero shadows. " +
      "Render the face with Kerala mural conventions: round full face, ENORMOUS elongated fish-shaped (matsya-netra) eyes " +
      "with dramatic kohl and upward tilt at outer corners — but preserve this person's identity and gender within those conventions.",
    petPrompt:
      "Transform this photo into a Kerala temple mural in Panchavarna style. " +
      "VERY bold thick black outlines. Only five colors: yellow ochre, red oxide, green, blue-black, white. " +
      "Flat, zero shadows. Elaborate lotus-chain border. Ornate jewelry and crown. " +
      "No gold leaf. Yellow ochre background. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MINIATURE / COURT PAINTING STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  "rajasthani-royal": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Rajasthani Mewar school miniature painting, " +
      "hand-painted with mineral pigments on burnished wasli paper. " +
      "Bold dark outlines defining every form with a stained-glass quality. " +
      "Flat saturated jewel-tone colors: brilliant vermillion red background (THE signature Mewar color), " +
      "deep ultramarine from lapis lazuli, malachite green, warm Indian yellow, shell gold for accents. " +
      "Frame the subject within an ornate jharokha (cusped arched window) with slender pillars and lotus finial dome. " +
      "Elaborate jewelry in shell gold: haar necklaces, sarpech turban ornament, bazuband armlets. " +
      "Golden nimbus/halo behind the head. Ornate floral vine border on deep blue ground. " +
      "Render the face in Mewar profile convention with a large frontal almond eye, " +
      "small chin, strong nose line — but preserve this person's distinctive features and gender within that convention.",
    petPrompt:
      "Transform this photo into a Rajasthani Mewar miniature painting. " +
      "Bold outlines, flat vermillion red background, deep jewel tones. " +
      "Jharokha window frame, shell gold accents, ornate floral vine border. " +
      "Burnished wasli paper quality. " +
      PET_BLEND,
  },

  "miniature-art": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Mughal miniature painting from the Jahangir period, " +
      "painted with ultra-fine squirrel-hair brushes and mineral pigments on burnished wasli paper. " +
      "INTRICATE fine brushwork with visible individual brush lines — the hallmark of Mughal craft. " +
      "Rich colors from natural pigments: lapis lazuli ultramarine, vermillion, malachite green, " +
      "gold leaf accents, orpiment yellow, lead white. " +
      "Render in three-quarter profile with a gold radiant nimbus behind the head. " +
      "Frame within an elaborate hashiya border system: outermost color band, " +
      "inner decorative border with gold islimi (scrolling vine) arabesques on deep blue, " +
      "innermost ruled gold lines. " +
      "Background: Char Bagh palace garden with symmetrical cypress trees, marble fountain, " +
      "blooming roses with individually painted petals. " +
      "The face should be the most naturalistic of any Indian tradition — subtle green underpaint for dimension, " +
      "individualized features with fine detail — preserve this person's exact likeness, bone structure, and expression.",
    petPrompt:
      "Transform this photo into a Mughal miniature painting from the Jahangir period. " +
      "Ultra-fine brushwork, mineral pigments, burnished wasli paper. " +
      "Gold leaf accents, nimbus, elaborate hashiya border with gold arabesques. " +
      "Palace garden background with cypress trees and marble fountain. " +
      PET_BLEND,
  },

  "pahari-mountain": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Pahari Kangra school miniature painting, " +
      "painted with fine sable brushes and mineral pigments on prepared wasli paper. " +
      "Extremely fine flowing calligraphic linework that swells and tapers with rhythmic grace. " +
      "Soft lyrical palette: pastel pinks, sky blues, leaf greens with rich accent colors — " +
      "the most tonally harmonious of all Indian miniature traditions. " +
      "Lush Himalayan landscape background: snow-capped peaks, flowering trees " +
      "with INDIVIDUALLY painted leaves (the signature Kangra element), gentle streams, grazing deer, flowering creepers. " +
      "Ornamental border with delicate floral vine on soft-colored ground. " +
      "Render the face in Kangra convention: soft rounded features, gentle downcast eyes, " +
      "dreamy romantic expression — but preserve this person's distinctive features and likeness.",
    petPrompt:
      "Transform this photo into a Pahari Kangra miniature painting. " +
      "Fine flowing linework, soft lyrical pastels, lush Himalayan landscape with individually painted leaves. " +
      "Flowering trees, gentle streams, ornamental floral vine border. " +
      PET_BLEND,
  },

  "deccani-royal": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Deccani painting from the Bijapur-Golconda court, " +
      "blending Indian and Persian artistic traditions with opaque watercolors and gold leaf. " +
      "Rich sensuous jewel-box colors: deep purple, turquoise teal, rich gold, crimson — " +
      "the most luxuriously saturated palette in Indian painting. " +
      "Refined flowing linework with soft facial modeling and fine textile pattern brushwork. " +
      "Background: ornate Islamic architecture with cusped onion domes, pointed arches, " +
      "geometric zellige tile patterns, arabesque foliage, night sky with gold stars. " +
      "Extensive gold leaf on clothing borders, architecture, and elaborate illuminated border with Persian-style floral margins. " +
      "Render the face with Deccani conventions: rounded sensuous features, large dreamy eyes, " +
      "rich adornment, distinctive turban — preserve this person's identity and expression.",
    petPrompt:
      "Transform this photo into a Deccani painting from the Bijapur-Golconda court. " +
      "Deep purple, turquoise, rich gold palette. Islamic architecture with domes and arches. " +
      "Gold leaf accents, night sky, illuminated Persian-style border. " +
      PET_BLEND,
  },

  "maratha-heritage": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Maratha Peshwa-era court painting, " +
      "painted by a Deccani court artist with mineral pigments on cloth. " +
      "Bold firm outlines, confident brushwork, flat opaque color fills — " +
      "a blend of Deccani elegance and Rajput directness. " +
      "Warm earthy palette: saffron (kesari) as the identity color, deep maroon, burnt sienna, antique gold, white. " +
      "Background: Shaniwar Wada fort durbar hall with massive stone pillars, saffron Bhagwa flags, " +
      "draped brocade textiles, ornate weapons display (tulwar, dhal shield). " +
      "Painted border with Maratha saffron motifs and floral elements. " +
      "Render the face with strong dark outlines, flat opaque skin, Maratha features — " +
      "preserve this person's identity, facial structure, and gender within the painted tradition.",
    petPrompt:
      "Transform this photo into a Maratha Peshwa-era court painting. " +
      "Bold outlines, flat opaque fills. Saffron, deep maroon, gold palette. " +
      "Fort durbar hall with stone pillars, saffron flags. Painted border. " +
      PET_BLEND,
  },

  "punjab-royal": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Sikh court painting from the Lahore darbar, " +
      "painted in the bold Punjab-Pahari tradition with opaque watercolors on wasli paper. " +
      "Vibrant saturated colors with thick visible outlines and flat opaque fills. " +
      "Rich saffron, royal blue, deep crimson, burnished gold palette — bold and regal. " +
      "Background: grand Lahore darbar hall with white marble pillars, crystal chandeliers, " +
      "Phulkari embroidered textile backdrop, Persian carpet with geometric patterns. " +
      "Elaborate turban ornament (sarpech) and multiple jewelry pieces in shell gold. Golden nimbus. " +
      "Ornate border with Sikh symbols (Khanda, Ik Onkar) and floral scrollwork. " +
      "Render the face in the Punjab portrait tradition — slightly more naturalistic than Mewar, " +
      "strong features, dignified expression — preserve this person's identity and features.",
    petPrompt:
      "Transform this photo into a Sikh court painting from the Lahore darbar. " +
      "Bold vibrant colors, thick outlines, saffron and royal blue palette. " +
      "Grand darbar hall with marble pillars, Phulkari backdrop. Golden nimbus. " +
      "Ornate border with Sikh symbols and floral scrollwork. " +
      PET_BLEND,
  },

  "bengal-renaissance": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a Bengal School painting in the tradition of Abanindranath Tagore, " +
      "using wet-on-wet watercolor wash technique on rough textured paper. " +
      "Soft ethereal translucent washes with deliberately bleeding color boundaries — " +
      "colors dissolve into each other with visible water stains and paper grain showing through. " +
      "MUTED earthy palette only: ochre, burnt sienna, dusty rose, sage green, faded indigo, gray-blue. " +
      "NOT bright primary colors — the Bengal School deliberately rejected vivid color. " +
      "Japanese Nihonga influence: asymmetric composition, generous empty space (ma), vignette format. " +
      "Dreamy atmospheric background dissolving into soft washes at the edges. " +
      "Flowing graceful minimal brushstrokes with intentional imperfections. " +
      "The face should feel soft, idealized, romantic with wistful three-quarter expression — " +
      "preserve this person's identity but render through soft dissolving watercolor washes.",
    petPrompt:
      "Transform this photo into a Bengal School watercolor painting in Abanindranath Tagore tradition. " +
      "Soft wet-on-wet washes, bleeding color edges, visible paper texture. " +
      "Muted earthy palette: ochre, sienna, dusty rose, sage, faded indigo. " +
      "Dreamy atmospheric dissolving background. Flowing minimal brushwork. " +
      PET_BLEND,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODERN STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  "anime-portrait": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into high-quality anime art blending Studio Ghibli warmth with Makoto Shinkai atmosphere. " +
      "Full anime rendering: clean precise linework with consistent weight, flat cel-shading with sharp two-tone shadow boundaries, " +
      "vibrant hyper-saturated colors. " +
      "Large expressive eyes with detailed multi-layered iris (highlight, reflection, pupil, color ring) — " +
      "but adapted for Indian features: warm skin tones (not pale), slightly more defined nose than anime default, " +
      "fuller lips, thick dark wavy hair with individually rendered strands and highlight streaks. " +
      "Atmospheric Indian background: golden hour light rays filtering through banyan trees, " +
      "soft bokeh particles, warm monsoon sky colors. " +
      "Pure anime artwork — no photographic elements. " +
      "Preserve this person's facial identity, skin tone, and distinctive features within the anime style.",
    petPrompt:
      "Transform this photo into Studio Ghibli / Makoto Shinkai anime art. " +
      "Clean linework, flat cel-shading, vibrant saturated colors, expressive eyes. " +
      "Atmospheric golden hour background with warm light. Pure anime style. " +
      PET_BLEND,
  },

  "bollywood-retro": {
    guidanceScale: 5.0,
    numInferenceSteps: 50,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "Transform this portrait into a vintage 1970s hand-painted Bollywood movie poster, " +
      "painted in thick oil/acrylic on canvas in the style of classic poster gully Mumbai artists. " +
      "Bold exaggerated colors with visible thick paint strokes. " +
      "Dramatic chiaroscuro lighting: strong directional key light on the face, deep warm shadows, " +
      "golden flesh tones with the characteristic 'Bollywood glow.' " +
      "Face fills 60% of the frame with an intense dramatic expression — expressive eyes with bright catchlight, " +
      "glossy full lips, windblown hair with painted highlight streaks. " +
      "Fiery sunset/stormy sky background with hand-painted clouds in orange, crimson, deep blue. " +
      "Vintage film grain texture and slightly worn poster patina. " +
      "The face should look painted by a master poster artist — idealized but recognizable. " +
      "Preserve this person's exact likeness, features, and expression with the drama and glamour of Bollywood poster art.",
    petPrompt:
      "Transform this photo into a 1970s Bollywood movie poster style. " +
      "Bold painted strokes, dramatic chiaroscuro lighting, fiery sky background. " +
      "Warm golden tones, vintage film grain, poster patina. Expressive and dramatic. " +
      PET_BLEND,
  },
};

// ─── Default fallback ────────────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 4.5,
  numInferenceSteps: 50,
  loraUrl: null,
  loraScale: 1.0,
  loraTrigger: null,
  humanPrompt:
    "Transform this portrait into a traditional Indian art painting. " +
    "Bold outlines, flat saturated colors, ornate decorative elements, traditional composition. " +
    "Preserve the person's facial identity while fully rendering in the artistic style.",
  petPrompt:
    "Transform this photo into a traditional Indian art painting. " +
    "Bold outlines, flat saturated colors, ornate decorative elements. " +
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
  return `Transform this portrait into traditional Indian art. Render the ${label} in heavily stylized artistic manner while keeping recognizable. Bold outlines, flat colors, ornate details.`;
}
