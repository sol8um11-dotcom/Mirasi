/**
 * V12 Prompts — Portrait-First + Style Foundation Research
 *
 * APPROACH: "Face transplant into authentic art portraits"
 * Instead of "restyle this photo", we describe a COMPLETE portrait composition
 * in each art style and tell the model to use ONLY the face from the input photo.
 *
 * Every human prompt is built from actual art-historical research:
 * - Madhubani: Bold black double-line outlines, horror vacui pattern fill, natural pigment palette
 * - Warli: White-on-terracotta, geometric stick figures, circles+triangles+lines only
 * - Tanjore: Gold leaf 40-60% coverage, raised gesso, prabhavali arch, gem-studded
 * - Kerala Mural: Panchavarna 5-color system, bold black outlines, green divine skin, kireedam crown
 * - Mughal Miniature: Jharokha format, ultra-fine brushwork, gold nimbus, elaborate border system
 * - Rajasthani: Mewar flat vermillion grounds, bold outlines, profile convention, jharokha frame
 *
 * ROUTING (unchanged from V11):
 * - Humans → Kontext Pro (identity-preserving)
 * - Pets with LoRA → Kontext LoRA
 * - Pets without LoRA → Kontext Pro
 */

// ─── Style-Specific Configuration ────────────────────────────────────────────

export interface StyleConfig {
  /** Kontext guidance_scale — lower = better identity, higher = stronger style */
  guidanceScale: number;
  /** Inference steps — more steps = better quality but slower */
  numInferenceSteps: number;
  /** Transformation intensity — used by LoRA pipeline only (0.01-1.0). */
  strength: number;
  /** PuLID identity weight — UNUSED in V12 (kept for interface compat) */
  idWeight: number;
  /** LoRA URL for pet pipeline (null = use Kontext Pro fallback for pets) */
  loraUrl: string | null;
  /** LoRA weight scale (0-4) */
  loraScale: number;
  /** Human prompt template — portrait-first approach */
  humanPrompt: string;
  /** Pet prompt template — breed/feature preservation focus */
  petPrompt: string;
  /** LoRA trigger word (for trained LoRAs) */
  loraTrigger: string | null;
}

// ─── Shared constants ────────────────────────────────────────────────────────

const PET_BLEND =
  "The animal must remain recognizable but fully rendered in the artistic style — same breed, markings, and coloring.";

/**
 * Portrait-first identity anchor used across all human prompts.
 * Tells the model: use ONLY the face, we'll describe everything else.
 */
const FACE_ANCHOR =
  "Use ONLY the face of this person — preserve the exact eyes, nose, jawline, skin tone, and expression. " +
  "Do not alter any facial features. The face must be clearly recognizable as this specific person.";

const STYLE_CONFIGS: Record<string, StyleConfig> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FOLK STYLES — Madhubani, Warli, Pichwai
  // ═══════════════════════════════════════════════════════════════════════════

  "madhubani-art": {
    guidanceScale: 4.0,
    numInferenceSteps: 50,
    strength: 0.88,
    idWeight: 0.7,
    loraUrl:
      "https://v3b.fal.media/files/b/0a8ec276/jx30OuCdAxTZ1paR_qbuw_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_madhubani",
    humanPrompt:
      FACE_ANCHOR +
      " Create a Madhubani Mithila portrait painting. " +
      "The person is shown as a decorated figure with bold black double-line (do-rekha) outlines on every contour. " +
      "Dress the figure in traditional Mithila wedding attire with intricate pattern-filled clothing. " +
      "Fill EVERY background space with dense Madhubani motifs — fish (matsya), peacocks (mayur), lotus flowers (kamal), " +
      "sun and moon circles, and geometric crosshatching patterns. Leave absolutely NO empty space (horror vacui). " +
      "Use the traditional natural pigment palette: warm turmeric yellow, brick-red vermillion, deep indigo blue, earthy leaf green, " +
      "chalky rice-paste white, and lamp-soot black. All colors should look matte and earthy, like natural pigments on handmade paper. " +
      "Frame the portrait with a thick double-line border filled with a repeating fish-and-lotus chain pattern. " +
      "Flat perspective, no shadows, no shading — pure folk art aesthetic.",
    petPrompt:
      "mrs_madhubani style. Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Madhubani Mithila painting of this animal with bold black double-line outlines on every contour. " +
      "Fill EVERY background space with dense Madhubani motifs — fish, peacocks, lotus flowers, geometric patterns. " +
      "Leave no empty space. Use traditional pigments: turmeric yellow, vermillion red, indigo blue, leaf green, " +
      "rice-paste white, lamp-soot black. Frame with a double-line fish-and-lotus border. " +
      PET_BLEND,
  },

  "warli-art": {
    guidanceScale: 4.5,
    numInferenceSteps: 50,
    strength: 0.92,
    idWeight: 0.7,
    loraUrl:
      "https://v3b.fal.media/files/b/0a8ec235/pCzgeZ2OXUEjTnY4hjH7d_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_warli",
    humanPrompt:
      FACE_ANCHOR +
      " Create a Warli tribal art portrait. " +
      "The figure is constructed ONLY from geometric shapes — triangle torso (two triangles joined at apex like a bowtie), " +
      "circle head, stick limbs — in white rice-paste on a dark terracotta mud-brown background. " +
      "Surround the figure with a Warli village scene: concentric circle sun, triangle mountains, " +
      "chain-dance figures (tarpa dance in a spiral), rice paddy fields, birds, trees made of stacked triangles, " +
      "and a sacred Chauk square border. ONLY white on dark reddish-brown terracotta — absolutely NO other colors. " +
      "Lines should look slightly rough and hand-drawn like a bamboo-stick application. " +
      "The person should be recognizable through their face placed on the geometric Warli figure form.",
    petPrompt:
      "mrs_warli style. Keep the recognizable shape and proportions of this animal. " +
      "Create a Warli tribal art scene — white geometric shapes on dark terracotta brown background. " +
      "The animal is built from circles, triangles, and lines. Surround with Warli village motifs: " +
      "tarpa dance chain, triangle mountains, rice fields, concentric circle sun. " +
      "ONLY white on terracotta brown, no other colors. Bamboo-stick drawn texture. " +
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
      FACE_ANCHOR +
      " Create an ornate Pichwai painting portrait in the Nathdwara Shrinathji tradition. " +
      "The person is shown as a richly adorned figure standing against a deep midnight-blue or black background " +
      "completely covered with intricate lotus flower (kamal) patterns in pink, white, and red. " +
      "Dress the figure in elaborate Pichwai-style garments with gold zari borders and floral embroidery. " +
      "Surround with sacred cows (kamadhenu) and decorative floral garlands (haar) draping from above. " +
      "Add a lotus pond at the base with pink lotuses on dark water. " +
      "Use rich Pichwai palette: midnight blue, deep greens, lotus pink, vermillion, and prominent gold leaf accents " +
      "on jewelry and ornamental details. Fine detailed brushwork throughout.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Pichwai painting portrait with intricate lotus patterns on deep midnight-blue background. " +
      "Surround with sacred cows, floral garlands, and lotus pond. " +
      "Rich palette: midnight blue, lotus pink, gold accents, fine brushwork. " +
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
    loraUrl:
      "https://v3b.fal.media/files/b/0a8ed157/F77SIFKQEWb94CrH4Gh6s_adapter_model.safetensors",
    loraScale: 1.0,
    loraTrigger: "mrs_tanjore",
    humanPrompt:
      FACE_ANCHOR +
      " Create a Tanjore Thanjavur painting portrait on a wooden panel. " +
      "The person stands as a richly adorned royal figure beneath an elaborate golden prabhavali arch " +
      "(the ornate decorative arch that is THE signature element of Tanjore art). " +
      "Cover 40-60% of the surface with raised gold leaf — the prabhavali arch, all jewelry, crown (kiritam), " +
      "halo behind the head, throne (sinhasana), and garment borders must all gleam with burnished gold. " +
      "Embed gem-studded details (emerald green, ruby red, pearl white dots) into the gold areas. " +
      "Dress the figure in rich silk garments with gold zari borders. Adorn with elaborate South Indian temple jewelry: " +
      "multi-strand haram necklace, kundala earrings, keyura armlets, oddiyanam waistband, all in gold with gems. " +
      "Place ornate Dravidian temple pillars on either side. Background is deep maroon-red behind the arch. " +
      "Use the Tanjore palette: deep red, dark green, rich blue, and abundant gold leaf with visible raised gesso texture. " +
      "Bold outlines, frontal pose, large expressive eyes.",
    petPrompt:
      "mrs_tanjore style. Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Tanjore Thanjavur painting with the animal beneath a golden prabhavali arch. " +
      "Cover 40-60% with raised gold leaf — arch, halo, decorative borders, and garland details. " +
      "Embed gem accents. Deep maroon-red background. Dravidian temple pillars on sides. " +
      "Bold outlines, rich silk cushion, gold zari border frame. " +
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
      FACE_ANCHOR +
      " Create a Mysore painting portrait in the Wodeyar court tradition. " +
      "The person is shown as an elegant royal figure seated in a palatial Mysore interior " +
      "with carved rosewood pillars, draped silk curtains, and a richly patterned carpet. " +
      "Dress the figure in refined South Indian royal attire with subtle gold zari textiles and delicate jewelry. " +
      "Use the Mysore palette: muted gold tones, deep forest green, soft ivory, warm browns, and restrained gold accents. " +
      "Unlike Tanjore's bold gold, Mysore gold is thinner and more delicate with fine gold line work rather than heavy leaf. " +
      "Apply gentle gesso preparation with refined brushwork. Background shows a palace interior " +
      "with cusped arches and chandelier. Elegant, understated composition with classical South Indian refinement.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Mysore painting portrait in Wodeyar court style. Animal in a palatial interior " +
      "with carved rosewood pillars and silk curtains. Muted gold, deep green, soft ivory palette. " +
      "Delicate gold line work, refined brushwork, elegant composition. " +
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
      FACE_ANCHOR +
      " Create a Kerala Panchavarna mural painting portrait as seen on ancient temple walls. " +
      "The person is depicted as a noble Sathvika figure with an ornate tall kireedam crown " +
      "(multi-tiered tapering crown with floral rosettes, pointed finial, and side ear-flaps). " +
      "Use ONLY the Panchavarna five-color palette: warm yellow ochre (manayola), deep red oxide (chuvappu), " +
      "rich malachite green (pachha), blue-black (neela) for all outlines, and bright white (velluppu) for eyes and highlights. " +
      "THE defining feature: bold, thick, uniform black outlines on EVERY element — this is non-negotiable. " +
      "Give the figure large elongated fish-shaped eyes (matsya-netra) with heavy black kohl outlines " +
      "and prominent white sclera. Full rounded face, high forehead, elongated earlobes. " +
      "Adorn with elaborate temple jewelry: multi-strand pearl haram, heavy kundala earrings, " +
      "keyura armlets, ornamental chains. Dress in traditional Kerala white-and-gold garments. " +
      "Frame with a padma-valli (lotus chain) border — continuous chain of stylized lotus flowers and buds. " +
      "Completely FLAT rendering — absolutely NO shadows, NO shading, NO depth. " +
      "NO gold leaf (use only yellow ochre paint). Background is a flat warm color fill.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Kerala Panchavarna mural painting of this animal. " +
      "Use ONLY five colors: yellow ochre, red oxide, malachite green, blue-black outlines, bright white. " +
      "Bold thick black outlines on everything. Large elongated eyes with heavy kohl. " +
      "Lotus chain (padma-valli) decorative border. Completely flat — no shadows, no shading. " +
      "NO gold leaf, only yellow ochre paint. Temple wall painting aesthetic. " +
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
      FACE_ANCHOR +
      " Create a Rajasthani Mewar school miniature painting portrait. " +
      "The person is depicted as a royal figure seated in a jharokha (projecting balcony window) " +
      "with a cusped arch above and slender pillars on each side. " +
      "Show the figure in profile view with one large dark almond-shaped frontal eye (the signature Rajasthani convention). " +
      "Dress in elaborate Rajput court attire: a large layered Mewar turban (pagri) with a jeweled sarpech ornament, " +
      "rich silk angarkha with gold zari borders, multiple pearl necklaces, armlets, and a gold nimbus/halo behind the head. " +
      "An attendant with a morchhaal (peacock-feather fan) stands behind. " +
      "Background: flat unmodulated vermillion red — THE signature Mewar color. " +
      "Narrow blue sky band with stylized scrolling clouds at the top. " +
      "Banana trees and flowering creepers flanking the composition. " +
      "Use bold, saturated jewel-tone palette: brilliant vermillion red, deep ultramarine blue, emerald green, " +
      "warm Indian yellow, and burnished shell gold for jewelry, halo, and border details. " +
      "STRONG dark outlines on all forms. Flat perspective — no Western shading or shadows. " +
      "Frame with an ornate floral scroll border: gold vine-and-flower pattern on deep blue ground.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Rajasthani Mewar miniature painting. The animal rests on an ornate cushion " +
      "inside a jharokha window with cusped arch. Flat vermillion red background. " +
      "Bold dark outlines, jewel-tone palette (red, blue, green, gold). " +
      "Gold nimbus behind head, floral scroll border on blue ground. Flat perspective. " +
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
      FACE_ANCHOR +
      " Create a Mughal miniature painting portrait in the Shah Jahan period style. " +
      "The person is depicted as a noble figure standing in a jharokha (ornate window-balcony) " +
      "with a multi-lobed cusped arch, marble surround with carved stonework, and a projecting canopy (chajja). " +
      "Show in three-quarter profile with ultra-fine brushwork — individual eyelashes, eyebrow hairs, " +
      "and fine beard strands visible. Place a radiant gold nimbus (halo with radiating gold lines) behind the head. " +
      "Dress in a sumptuous Mughal jama (long robe) of translucent muslin over rich silk, " +
      "with a jeweled turban featuring a kalgi (feathered plume) and sarpech. " +
      "The figure holds a rose or iris in one delicate hand. Adorn with pearl necklaces and gem-set rings. " +
      "Use the authentic Mughal palette: lapis lazuli ultramarine blue, malachite green, vermillion red, " +
      "orpiment golden yellow, lead white, and abundant shell gold with burnished gold leaf. " +
      "Frame with the NON-NEGOTIABLE elaborate multi-zone Mughal border system: " +
      "outermost zone with gold floral arabesques and naturalistic flowers (iris, tulip, rose) on a colored ground, " +
      "inner framing lines in gold-black-gold-blue sequence, and an inner border. " +
      "Background: pale green or sky blue with thin horizon line. On burnished wasli paper.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Mughal miniature painting portrait. The animal in a jharokha window with cusped arch. " +
      "Ultra-fine brushwork, gold nimbus behind head. Lapis blue, malachite green, vermillion, gold palette. " +
      "Elaborate multi-zone floral arabesque border (non-negotiable). " +
      "Pale green background, burnished wasli paper texture. " +
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
      FACE_ANCHOR +
      " Create a Pahari miniature painting portrait in the Kangra school style. " +
      "The person is depicted as a graceful figure in a lyrical Himalayan landscape " +
      "with soft rolling hills in graduated blue-green tones, flowering dogwood and rhododendron trees, " +
      "and a gentle stream winding through lush meadows. " +
      "Show with delicate, refined features — soft almond eyes, gentle expression full of tender emotion (shringar rasa). " +
      "Dress in flowing garments of soft pastel colors with fine gold borders: " +
      "pale saffron, delicate rose-pink, cream white, and soft sage green. " +
      "Adorn with refined jewelry: thin gold haar, small kundala earrings, delicate bangles. " +
      "Use the Kangra palette: soft pastels with rich accent tones — " +
      "warm terracotta, deep green, sky blue, pale lemon yellow, and touches of gold. " +
      "Delicate ultra-fine line work integrated with soft tonal washes. " +
      "Flowering creepers and blossoming trees frame the composition. " +
      "Frame with an ornamental painted border with floral vine pattern on a contrasting ground.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Pahari Kangra miniature painting. The animal in a lyrical Himalayan landscape " +
      "with rolling hills, flowering trees, gentle stream. Soft pastels with rich accents. " +
      "Delicate fine brushwork and tonal washes. Ornamental floral vine border. " +
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
      FACE_ANCHOR +
      " Create a Deccani miniature painting portrait in the Bijapur-Golconda court tradition. " +
      "The person is depicted as a Deccani nobleman standing in a palatial setting " +
      "with massive pointed Islamic arches, ornate geometric tile patterns on the floor, " +
      "and a richly draped textile backdrop in deep jewel tones. " +
      "Dress in luxurious Deccani court attire: a flowing jama with rich brocade patterns, " +
      "a distinctive Deccani turban (tall, rounded, with a jeweled aigrette), " +
      "elaborate pearl and gem jewelry. Place a gold nimbus behind the head. " +
      "Use the opulent Deccani palette: deep purple, intense saffron gold, rich emerald green, " +
      "lapis blue, and abundant gold leaf accents. The Deccani style is MORE lavish and " +
      "fantastical than Mughal — bolder colors, more ornamental, dreamlike quality. " +
      "Frame with an ornate border featuring arabesque floral scrolls and geometric interlace on gold ground.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Deccani miniature painting. The animal in a palatial setting with pointed arches " +
      "and geometric tile patterns. Deep purple, saffron gold, emerald, lapis blue palette. " +
      "Ornate arabesque border, gold accents, lavish Deccani court aesthetic. " +
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
      FACE_ANCHOR +
      " Create a Maratha Peshwa-era court painting portrait. " +
      "The person is depicted as a Maratha noble in a durbar hall setting " +
      "with massive stone pillars, draped rich textiles, and ornate Maratha architecture. " +
      "Dress in traditional Maratha court attire: a distinctive Maratha pagdi (turban) " +
      "with gold kalgi ornament, fitted angarkha, patka waistband, and dhoti. " +
      "Adorn with traditional Maratha jewelry: Kolhapuri necklace, wristbands, and finger rings. " +
      "The figure holds a curved Maratha sword (talwar) or sits on a low throne with bolster cushions. " +
      "Use the Maratha palette: deep maroon, warm saffron, burnished gold, ivory white, and dark green. " +
      "Strong bold outlines with flat color fills in the Peshwa painting tradition. " +
      "Background shows a fort rampart or hill-fort landscape visible through an arch. " +
      "Frame with a decorative border featuring Maratha motifs and gold ruling lines.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Maratha Peshwa-era court painting. The animal in a durbar hall " +
      "with stone pillars and draped textiles. Deep maroon, saffron, gold, ivory palette. " +
      "Strong outlines, flat color fills, decorative Maratha motif border. " +
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
      FACE_ANCHOR +
      " Create a Sikh court painting portrait in the Lahore darbar tradition. " +
      "The person is depicted as a Sikh nobleman seated on a raised cushioned throne " +
      "in the grand Lahore darbar hall with tall marble pillars, crystal chandeliers, " +
      "and a richly patterned carpet beneath. " +
      "Dress in magnificent Sikh royal attire: an elaborate dastar (turban) with a jeweled kalgi " +
      "and a gold turra plume, a rich brocade angarkha with detailed phulkari embroidery borders, " +
      "multiple strand pearl necklaces, and a kirpan (ceremonial dagger) at the waist. " +
      "Use the vibrant Punjab royal palette: warm golden tones, deep saffron, rich burgundy, " +
      "emerald green, ivory white, and abundant gold throughout. " +
      "Warm golden lighting suffuses the scene. " +
      "Fine brushwork with visible textile embroidery detail. " +
      "Frame with an ornate gold-ruled border with Sikh motifs.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Sikh court painting. The animal on a cushioned throne in a Lahore darbar hall " +
      "with marble pillars and chandelier. Warm golden, saffron, burgundy, emerald palette. " +
      "Rich brocade textile backdrop, gold accents, fine embroidery detail. " +
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
      FACE_ANCHOR +
      " Create a Bengal School painting portrait in the style of Abanindranath Tagore. " +
      "The person is depicted as an ethereal figure emerging from soft watercolor washes, " +
      "with flowing graceful brushstrokes that blend into a dreamy atmospheric background. " +
      "Dress in soft, draping garments rendered in transparent watercolor layers — " +
      "the fabric appears light, almost weightless. " +
      "Use the Bengal School palette: earthy muted tones with warm golden undertones — " +
      "soft terracotta, warm sepia, muted olive green, dusky rose, pale gold, " +
      "and atmospheric blue-grey washes. Colors should look transparent and luminous, " +
      "like Japanese wash painting merged with Indian sensibility. " +
      "Delicate brushstrokes, poetic romantic mood. The edges of the figure " +
      "should dissolve softly into the background — no hard outlines. " +
      "Background is a dreamy gradient wash suggesting mist or twilight. " +
      "No ornate border — a simple thin ruled line frame in gold or sepia.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Bengal School watercolor painting. The animal emerging from soft washes " +
      "with dreamy atmospheric background. Earthy muted tones with golden undertones. " +
      "Transparent luminous watercolor layers, edges dissolving into background. " +
      "Delicate brushstrokes, poetic romantic mood. Simple ruled line frame. " +
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
      FACE_ANCHOR +
      " Create a high-quality Japanese anime portrait. " +
      "The person is depicted as an anime character with large expressive eyes featuring detailed irises " +
      "with light reflections and catch-light dots, clean precise black linework, and vibrant saturated colors. " +
      "Render detailed hair with individual strand highlights and dynamic flow. " +
      "Dress in stylish anime-appropriate attire with clean folds and fabric rendering. " +
      "Apply professional cel-shading with crisp shadows and smooth gradients on skin and clothing. " +
      "Background is a Studio Ghibli inspired atmospheric scene with soft bokeh light particles, " +
      "gentle sky gradient, and dreamy clouds. " +
      "High contrast, vivid colors, manga-quality illustration. " +
      "Make the person look slightly more attractive with clearer luminous skin.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a Japanese anime portrait with large expressive cute eyes, clean precise linework, " +
      "and vibrant colors. Professional cel-shading, dynamic composition. " +
      "Studio Ghibli atmospheric background with bokeh. Make the animal adorable in anime style. " +
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
      FACE_ANCHOR +
      " Create a vintage hand-painted Bollywood movie poster from the 1970s golden era. " +
      "The person is depicted as a glamorous Bollywood star with dramatic side lighting, " +
      "enhanced features, and a heroic cinematic pose. " +
      "Visible oil-paint brushstroke texture throughout — this must look hand-painted, not photographic. " +
      "Bold saturated colors with the signature 70s Bollywood poster palette: " +
      "deep sunset oranges, dramatic reds, golden yellows, and intense shadows. " +
      "Background features a dramatic painted sky with sweeping clouds and golden hour lighting. " +
      "Add Hindi film typography-style decorative elements. " +
      "The person should look glamorous with luminous enhanced skin and dramatic makeup-like rendering. " +
      "Oil paint texture and visible brushwork on every surface.",
    petPrompt:
      "Keep the exact same animal — same breed, fur color, markings, eye color, ear shape, " +
      "and body proportions. Do not change any physical features of the pet. " +
      "Create a vintage 1970s hand-painted Bollywood movie poster style. " +
      "Bold saturated colors, dramatic lighting, painted oil-paint brushstroke texture. " +
      "Dramatic sky background, golden hour glow, cinematic composition. " +
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
    FACE_ANCHOR +
    " Create a traditional Indian art portrait with rich colors, ornate details, " +
    "elaborate jewelry, decorative borders, and traditional artistic techniques.",
  petPrompt:
    "Keep the exact same animal — same breed, fur color, markings, and eye color. " +
    "Create a traditional Indian art portrait with rich colors, ornate details, " +
    "and traditional artistic techniques. " +
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
  return `${FACE_ANCHOR} Create a traditional Indian art portrait of this ${label} with rich colors and ornate details.`;
}
