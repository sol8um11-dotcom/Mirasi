/**
 * V10 Prompts — PuLID Flux Identity-Preserving Generation
 *
 * CRITICAL CHANGE: Humans now use PuLID Flux (fal-ai/flux-pulid).
 * PuLID GENERATES a new image from the text prompt while PRESERVING facial
 * identity from the reference image. This gives us BOTH full painterly
 * transformation AND identity preservation — what Kontext Pro and Flux Dev
 * img2img couldn't do individually.
 *
 * KEY CHANGES FROM V9:
 * 1. Added `idWeight` (0-1) per style — PuLID's identity vs style dial
 *    - Higher idWeight = stronger identity (face more recognizable)
 *    - Lower idWeight = stronger style transformation
 *    - Naturalistic styles (Mughal, Bollywood): 0.75-0.8 (need clear face)
 *    - Moderate styles (Tanjore, Rajasthani): 0.65-0.7
 *    - Abstract styles (Warli): 0.5 (face becomes geometric)
 * 2. guidance_scale tuned for PuLID (default 4.0, range 0-20)
 * 3. Prompts describe the ARTWORK to generate (PuLID generates from prompt,
 *    not edits an existing image)
 *
 * ROUTING:
 * - Humans → PuLID Flux (fal-ai/flux-pulid) with id_weight per style
 * - Pets with LoRA → Kontext LoRA (unchanged)
 * - Pets without LoRA → Kontext Pro (PuLID is for human faces)
 *
 * Reference: docs/CRITICAL_RESEARCH_FINDINGS.md, docs/style-foundations.md
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  guidanceScale: number;
  numInferenceSteps: number;
  /** Transformation intensity — used by LoRA pipeline (0.01-1.0). */
  strength: number;
  /** PuLID identity weight (0-1). Higher = more identity, lower = more style. */
  idWeight: number;
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
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.88,
    idWeight: 0.6,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      "A Madhubani Mithila painting in the Bharni (filled color) style, drawn with bamboo nibs and natural pigments on handmade paper. " +
      "The entire image is a hand-painted artwork — thick visible brushstrokes, paper grain texture, natural pigment finish. " +
      "No photographic elements remain — every pixel is painted. " +
      "Bold black DOUBLE-LINE (do-rekha) outlines around every form — two parallel lines with intricate pattern fill between them. " +
      "EVERY surface filled with dense decorative patterns — crosshatching, dots, geometric lattice — absolutely no empty space (horror vacui). " +
      "Only traditional natural pigment colors: vermillion red, turmeric yellow, indigo blue, leaf green, black, white. " +
      "Flat matte colors, zero shading or gradients. " +
      "Background packed with Madhubani motifs: stylized fish pairs, peacocks with fanned tails, lotus flowers, concentric-circle sun and moon. " +
      "Multi-band decorative border: outer chain pattern, middle floral vine (lata), inner geometric band. " +
      "Face rendered in Madhubani convention: large almond-shaped kohl-lined eyes dominating the face, flat single-color skin, " +
      "decorative rather than realistic — but the person's facial structure, nose shape, and features remain recognizable.",
    petPrompt:
      "mrs_madhubani style. Transform this photo into a Madhubani Mithila painting in Bharni style. " +
      "Bold black double-line outlines. Dense pattern fill on every surface — no empty space. " +
      "Vermillion, turmeric yellow, indigo, leaf green palette. Fish, peacock, lotus motifs. " +
      "Multi-band decorative border with chain and floral vine patterns. " +
      PET_BLEND,
  },

  "warli-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.92,
    idWeight: 0.5,
    loraUrl: "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      "A Warli tribal painting on a dark reddish-brown mud wall, painted with white rice paste using a bamboo stick. " +
      "The entire image is a hand-painted mural — rough mud wall texture visible, paint applied unevenly as in authentic Warli art. " +
      "No photographic elements remain — every pixel shows mud wall or white rice paste paint. " +
      "The subject rendered as an enlarged central Warli figure using ONLY geometric shapes: " +
      "circle for head, two joined triangles for torso, straight stick lines for limbs. " +
      "ONLY two colors in the entire image: white rice paste on dark terracotta brown — no other colors. " +
      "Lines are rough, slightly wobbly, textured bamboo-stick strokes — NOT clean vector art. " +
      "Surrounding scene densely filled with traditional Warli motifs: " +
      "spiral Tarpa dance chain of connected figures, concentric-circle sun with rays, triangular mountains, " +
      "trees with dot-cluster leaves and perched birds, bullock carts, farming scenes, deer, peacocks. " +
      "Geometric border: zigzag or comb-ladder pattern. " +
      "The subject's general build, hairstyle silhouette, and posture remain recognizable through the geometric rendering.",
    petPrompt:
      "mrs_warli style. Transform this photo into Warli tribal art. " +
      "White rice paste on dark terracotta mud wall. Geometric shapes only — circles, triangles, lines. " +
      "Surround with Tarpa dance spiral, sun circles, trees with birds, farming scenes. " +
      "Rough bamboo-stick line quality. Zigzag border frame. " +
      PET_BLEND,
  },

  "pichwai-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.88,
    idWeight: 0.65,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Pichwai painting from the Nathdwara Shrinathji temple tradition, painted on starched cloth with natural mineral pigments and gold leaf. " +
      "The entire image is a hand-painted artwork on cloth — visible fabric weave texture, thick mineral pigment strokes, gold leaf shimmer. " +
      "No photographic elements remain — every pixel is painted with traditional Pichwai brushwork. " +
      "EVERY surface covered with dense intricate lotus flower patterns — individually painted petals in pink, white, and gold on a deep indigo-black background. " +
      "Ornate gold leaf accents throughout: clothing borders, jewelry, lotus highlights, elaborate multi-band border. " +
      "Traditional Pichwai elements: sacred cows (kamadhenu), floral garlands (phool bangla), mango leaf torans. " +
      "Strictly bilateral symmetry. " +
      "Face rendered with Pichwai conventions: idealized round features, large almond eyes, " +
      "flat rich colors with fine decorative brushwork — but the person's facial structure and features remain recognizable.",
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
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.88,
    idWeight: 0.65,
    loraUrl: "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      "A Tanjore (Thanjavur) painting on a wooden panel with raised gesso relief and gold foil, painted with mineral pigments. " +
      "The entire image is a traditional painting — visible wood panel texture, thick gesso ridges, metallic gold leaf shimmer, mineral pigment surface. " +
      "No photographic elements remain — every pixel is painted or gilded. " +
      "EXTENSIVE metallic gold leaf covering 40-50% of the image: ornate prabhavali arch frame, " +
      "elaborate South Indian jewelry (tiered kiritam crown, multiple haram necklaces, keyura armlets, oddiyanam waist belt), " +
      "Dravidian temple pillar details, garment zari borders, lotus pedestal. " +
      "Gold must look METALLIC and PHYSICALLY RAISED with embossed semi-3D texture, not flat yellow paint. " +
      "Deep crimson red background. Rich saturated jewel-tone colors — emerald green, royal blue, white — applied flat within bold black outlines. " +
      "Gem-studding effect: sparkling embedded colored stones on crown, necklace pendant, and arch. " +
      "Multi-layered ornate border with mango-vine scrollwork and pearl-strand patterns. " +
      "Face rendered with Tanjore conventions: round full features, large elongated kohl-lined almond eyes, " +
      "serene half-smile — the person's identity, bone structure, and skin tone remain recognizable.",
    petPrompt:
      "mrs_tanjore style. Transform this photo into a Tanjore Thanjavur painting. " +
      "Extensive metallic gold leaf with raised gesso texture. Ornate prabhavali arch, temple pillars. " +
      "Deep crimson background. Rich jewel-tone colors within bold outlines. " +
      "Gem-studded crown and jewelry. Multi-layered border with mango-vine scrollwork. " +
      PET_BLEND,
  },

  "mysore-palace": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A refined Mysore painting in the Wodeyar court tradition, painted with gesso technique and mineral pigments on a wooden panel. " +
      "The entire image is a traditional painting — visible wood grain, thin gesso relief, fine precise brushstrokes, matte pigment surface. " +
      "No photographic elements remain — every pixel is painted by hand. " +
      "Restrained gold leaf (10-20% coverage) with thin low-relief gesso — more subtle and refined than Tanjore. " +
      "Muted warm palette: soft reds, sage greens, warm ochres, soft blues, ivory. " +
      "Prabhavali arch with slender ornate rosewood-carved pillars in Mysore palace style. " +
      "Palatial interior: silk curtains, sandalwood-toned backdrop, jasmine garlands, Dasara festival elements. " +
      "Elegant multi-band border with refined floral patterns. Fine precise brushwork with gentle curves. " +
      "Face rendered with South Indian conventions: rounded features, expressive kohl-lined eyes, " +
      "flat opaque skin — the person's identity, gender, and facial structure remain recognizable.",
    petPrompt:
      "Transform this photo into a refined Mysore Wodeyar court painting. " +
      "Restrained gold leaf, muted warm palette. Prabhavali arch with slender palace pillars. " +
      "Sage green, soft red, ivory tones. Fine brushwork, jasmine garlands. Elegant border. " +
      PET_BLEND,
  },

  "kerala-mural": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.90,
    idWeight: 0.55,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Kerala temple mural in the Panchavarna (five-color) tradition, painted with natural vegetable pigments on a prepared temple wall. " +
      "The entire image is a wall painting — rough plaster texture visible, thick opaque pigments, visible brush marks on lime-washed surface. " +
      "No photographic elements remain — every pixel is painted on temple wall. " +
      "VERY BOLD thick black outlines around every element — 3-5 times thicker than other traditions, creating a stained-glass effect. " +
      "ONLY five Panchavarna colors: yellow ochre (manayola), red oxide (chuvappu), deep green (pachha), blue-black (neela), white (velluppu). " +
      "NO gold leaf, no other colors. Yellow ochre background. Completely flat, zero shadows. " +
      "Elaborate tall kireedam (tiered crown) like Kathakali headpiece. " +
      "Ornate jewelry: multiple necklaces, large kundalams earrings, keyura armlets. " +
      "Border with padma-valli (lotus chain) pattern. " +
      "Face rendered with Kerala mural conventions: round full face, ENORMOUS elongated fish-shaped (matsya-netra) eyes " +
      "with dramatic kohl and upward tilt — the person's identity and gender remain recognizable within these conventions.",
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
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.65,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Rajasthani Mewar school miniature painting, hand-painted with mineral pigments on burnished wasli paper. " +
      "The entire image is a traditional miniature — smooth burnished paper surface, fine brushstrokes, shell gold shimmer, opaque mineral pigment finish. " +
      "No photographic elements remain — every pixel is hand-painted on paper. " +
      "Bold dark outlines defining every form with a stained-glass quality. " +
      "Flat saturated jewel-tone colors: brilliant vermillion red background (signature Mewar color), " +
      "deep ultramarine from lapis lazuli, malachite green, warm Indian yellow, shell gold accents. " +
      "Subject framed within an ornate jharokha (cusped arched window) with slender pillars and lotus finial dome. " +
      "Elaborate jewelry in shell gold: haar necklaces, sarpech turban ornament, bazuband armlets. " +
      "Golden nimbus/halo behind the head. Ornate floral vine border on deep blue ground. " +
      "Face rendered in Mewar convention with large frontal almond eye, small chin, strong nose line — " +
      "the person's distinctive features and gender remain recognizable within that convention.",
    petPrompt:
      "Transform this photo into a Rajasthani Mewar miniature painting. " +
      "Bold outlines, flat vermillion red background, deep jewel tones. " +
      "Jharokha window frame, shell gold accents, ornate floral vine border. " +
      "Burnished wasli paper quality. " +
      PET_BLEND,
  },

  "miniature-art": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.85,
    idWeight: 0.75,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Mughal miniature painting from the Jahangir period, painted with ultra-fine squirrel-hair brushes and mineral pigments on burnished wasli paper. " +
      "The entire image is a traditional miniature — smooth burnished paper, ultra-fine individual brush lines visible, gold leaf shimmer, opaque pigment surface. " +
      "No photographic elements remain — every pixel is meticulously painted. " +
      "INTRICATE fine brushwork — the hallmark of Mughal craft. " +
      "Rich colors: lapis lazuli ultramarine, vermillion, malachite green, gold leaf accents, orpiment yellow, lead white. " +
      "Three-quarter profile with a gold radiant nimbus behind the head. " +
      "Elaborate hashiya border system: outermost color band, inner border with gold islimi arabesques on deep blue, innermost ruled gold lines. " +
      "Background: Char Bagh palace garden with symmetrical cypress trees, marble fountain, blooming roses with individually painted petals. " +
      "Face is the most naturalistic of any Indian tradition — subtle green underpaint for dimension, " +
      "individualized features with fine detail — the person's exact likeness, bone structure, and expression remain recognizable.",
    petPrompt:
      "Transform this photo into a Mughal miniature painting from the Jahangir period. " +
      "Ultra-fine brushwork, mineral pigments, burnished wasli paper. " +
      "Gold leaf accents, nimbus, elaborate hashiya border with gold arabesques. " +
      "Palace garden background with cypress trees and marble fountain. " +
      PET_BLEND,
  },

  "pahari-mountain": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Pahari Kangra school miniature painting, painted with fine sable brushes and mineral pigments on prepared wasli paper. " +
      "The entire image is a traditional miniature — smooth paper surface, fine flowing brushstrokes, delicate pigment washes. " +
      "No photographic elements remain — every pixel is painted. " +
      "Extremely fine flowing calligraphic linework that swells and tapers with rhythmic grace. " +
      "Soft lyrical palette: pastel pinks, sky blues, leaf greens with rich accent colors — " +
      "the most tonally harmonious of all Indian miniature traditions. " +
      "Lush Himalayan landscape background: snow-capped peaks, flowering trees " +
      "with INDIVIDUALLY painted leaves (signature Kangra element), gentle streams, grazing deer, flowering creepers. " +
      "Ornamental border with delicate floral vine on soft-colored ground. " +
      "Face rendered in Kangra convention: soft rounded features, gentle downcast eyes, " +
      "dreamy romantic expression — the person's distinctive features and likeness remain recognizable.",
    petPrompt:
      "Transform this photo into a Pahari Kangra miniature painting. " +
      "Fine flowing linework, soft lyrical pastels, lush Himalayan landscape with individually painted leaves. " +
      "Flowering trees, gentle streams, ornamental floral vine border. " +
      PET_BLEND,
  },

  "deccani-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Deccani painting from the Bijapur-Golconda court, painted with opaque watercolors and gold leaf on prepared paper. " +
      "The entire image is a traditional court painting — smooth paper surface, fine flowing brushstrokes, gold leaf shimmer, opaque watercolor washes. " +
      "No photographic elements remain — every pixel is painted. " +
      "Rich sensuous jewel-box colors: deep purple, turquoise teal, rich gold, crimson — " +
      "the most luxuriously saturated palette in Indian painting. " +
      "Refined flowing linework with soft facial modeling and fine textile pattern brushwork. " +
      "Background: ornate Islamic architecture with cusped onion domes, pointed arches, " +
      "geometric zellige tile patterns, arabesque foliage, night sky with gold stars. " +
      "Extensive gold leaf on clothing borders, architecture, elaborate illuminated border with Persian-style floral margins. " +
      "Face rendered with Deccani conventions: rounded sensuous features, large dreamy eyes, " +
      "rich adornment — the person's identity and expression remain recognizable.",
    petPrompt:
      "Transform this photo into a Deccani painting from the Bijapur-Golconda court. " +
      "Deep purple, turquoise, rich gold palette. Islamic architecture with domes and arches. " +
      "Gold leaf accents, night sky, illuminated Persian-style border. " +
      PET_BLEND,
  },

  "maratha-heritage": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Maratha Peshwa-era court painting, painted by a Deccani court artist with mineral pigments on cloth. " +
      "The entire image is a traditional painting on cloth — visible fabric texture, thick opaque pigments, bold confident brushstrokes. " +
      "No photographic elements remain — every pixel is painted. " +
      "Bold firm outlines, confident brushwork, flat opaque color fills — " +
      "a blend of Deccani elegance and Rajput directness. " +
      "Warm earthy palette: saffron (kesari) as the identity color, deep maroon, burnt sienna, antique gold, white. " +
      "Background: Shaniwar Wada fort durbar hall with massive stone pillars, saffron Bhagwa flags, " +
      "draped brocade textiles, ornate weapons display (tulwar, dhal shield). " +
      "Painted border with Maratha saffron motifs and floral elements. " +
      "Face rendered with strong dark outlines, flat opaque skin — " +
      "the person's identity, facial structure, and gender remain recognizable within the painted tradition.",
    petPrompt:
      "Transform this photo into a Maratha Peshwa-era court painting. " +
      "Bold outlines, flat opaque fills. Saffron, deep maroon, gold palette. " +
      "Fort durbar hall with stone pillars, saffron flags. Painted border. " +
      PET_BLEND,
  },

  "punjab-royal": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Sikh court painting from the Lahore darbar, painted in the bold Punjab-Pahari tradition with opaque watercolors on wasli paper. " +
      "The entire image is a traditional court painting — smooth paper surface, thick opaque pigments, visible brushstrokes, shell gold shimmer. " +
      "No photographic elements remain — every pixel is painted. " +
      "Vibrant saturated colors with thick visible outlines and flat opaque fills. " +
      "Rich saffron, royal blue, deep crimson, burnished gold palette — bold and regal. " +
      "Background: grand Lahore darbar hall with white marble pillars, crystal chandeliers, " +
      "Phulkari embroidered textile backdrop, Persian carpet with geometric patterns. " +
      "Elaborate turban ornament (sarpech) and multiple jewelry pieces in shell gold. Golden nimbus. " +
      "Ornate border with Sikh symbols (Khanda, Ik Onkar) and floral scrollwork. " +
      "Face rendered in Punjab portrait tradition — slightly more naturalistic than Mewar, " +
      "strong features, dignified expression — the person's identity and features remain recognizable.",
    petPrompt:
      "Transform this photo into a Sikh court painting from the Lahore darbar. " +
      "Bold vibrant colors, thick outlines, saffron and royal blue palette. " +
      "Grand darbar hall with marble pillars, Phulkari backdrop. Golden nimbus. " +
      "Ornate border with Sikh symbols and floral scrollwork. " +
      PET_BLEND,
  },

  "bengal-renaissance": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.88,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A Bengal School painting in the tradition of Abanindranath Tagore, using wet-on-wet watercolor wash technique on rough textured paper. " +
      "The entire image is a watercolor painting — visible paper grain, water stains, bleeding pigment edges, translucent wash layers. " +
      "No photographic elements remain — every pixel is soft watercolor on rough paper. " +
      "Soft ethereal translucent washes with deliberately bleeding color boundaries — colors dissolve into each other. " +
      "MUTED earthy palette only: ochre, burnt sienna, dusty rose, sage green, faded indigo, gray-blue. " +
      "NOT bright primary colors — the Bengal School deliberately rejected vivid color. " +
      "Japanese Nihonga influence: asymmetric composition, generous empty space (ma), vignette format. " +
      "Dreamy atmospheric background dissolving into soft washes at the edges. " +
      "Flowing graceful minimal brushstrokes with intentional imperfections. " +
      "Face feels soft, idealized, romantic with wistful three-quarter expression — " +
      "the person's identity remains recognizable but rendered through soft dissolving watercolor washes.",
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
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.87,
    idWeight: 0.7,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A high-quality anime artwork blending Studio Ghibli warmth with Makoto Shinkai atmospheric lighting. " +
      "The entire image is pure anime art — clean precise linework, flat cel-shading, digital painting surface. " +
      "No photographic elements remain — every pixel is anime illustration. " +
      "Clean precise linework with consistent weight, flat cel-shading with sharp two-tone shadow boundaries, " +
      "vibrant hyper-saturated colors. " +
      "Large expressive eyes with detailed multi-layered iris (highlight, reflection, pupil, color ring) — " +
      "adapted for Indian features: warm skin tones (not pale), slightly more defined nose, " +
      "fuller lips, thick dark wavy hair with individually rendered strands and highlight streaks. " +
      "Atmospheric Indian background: golden hour light rays filtering through banyan trees, " +
      "soft bokeh particles, warm monsoon sky colors. " +
      "The person's facial identity, skin tone, and distinctive features remain recognizable within the anime style.",
    petPrompt:
      "Transform this photo into Studio Ghibli / Makoto Shinkai anime art. " +
      "Clean linework, flat cel-shading, vibrant saturated colors, expressive eyes. " +
      "Atmospheric golden hour background with warm light. Pure anime style. " +
      PET_BLEND,
  },

  "bollywood-retro": {
    guidanceScale: 3.5,
    numInferenceSteps: 40,
    strength: 0.85,
    idWeight: 0.8,
    loraUrl: null,
    loraScale: 1.0,
    loraTrigger: null,
    humanPrompt:
      "A vintage 1970s hand-painted Bollywood movie poster, painted in thick oil and acrylic on canvas by a master poster gully Mumbai artist. " +
      "The entire image is a hand-painted poster — thick visible oil paint brushstrokes, canvas weave texture, impasto highlights, slight poster patina. " +
      "No photographic elements remain — every pixel is thick oil paint on canvas. " +
      "Bold exaggerated colors with visible thick paint strokes. " +
      "Dramatic chiaroscuro lighting: strong directional key light on the face, deep warm shadows, " +
      "golden flesh tones with the characteristic 'Bollywood glow.' " +
      "Face fills 60% of the frame with an intense dramatic expression — expressive eyes with bright catchlight, " +
      "glossy full lips, windblown hair with painted highlight streaks. " +
      "Fiery sunset/stormy sky background with hand-painted clouds in orange, crimson, deep blue. " +
      "Vintage film grain and slightly worn poster patina. " +
      "The person's exact likeness, features, and expression remain recognizable — painted by a master artist with drama and glamour.",
    petPrompt:
      "Transform this photo into a 1970s Bollywood movie poster style. " +
      "Bold painted strokes, dramatic chiaroscuro lighting, fiery sky background. " +
      "Warm golden tones, vintage film grain, poster patina. Expressive and dramatic. " +
      PET_BLEND,
  },
};

// ─── Default fallback ────────────────────────────────────────────────────────

const DEFAULT_CONFIG: StyleConfig = {
  guidanceScale: 3.5,
  numInferenceSteps: 40,
  strength: 0.87,
  idWeight: 0.7,
  loraUrl: null,
  loraScale: 1.0,
  loraTrigger: null,
  humanPrompt:
    "A traditional Indian art painting with bold outlines, flat saturated colors, ornate decorative elements, and traditional composition. " +
    "The entire image is a hand-painted artwork — no photographic elements remain. " +
    "The person's facial identity remains recognizable within the artistic style.",
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
