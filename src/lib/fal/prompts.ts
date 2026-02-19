/**
 * V12.1 Prompts — "Time Machine for Your Face"
 *
 * PRODUCT VISION: A user uploads a selfie and sees themselves painted by a
 * master artist in an era & style they never imagined. It should spark joy.
 *
 * PRIORITY 1: Keep the person's FACE — eyes, nose, jawline, skin tone, expression.
 * PRIORITY 2: Enhance with the style's foundational elements — clothing, jewelry,
 *             crown, background, border, palette, technique — all from the art tradition.
 * WHAT NOT TO DO: Keep ANYTHING else from the uploaded photo — no original clothes,
 *                 no original background, no original hairstyle, no original lighting.
 *
 * HOW KONTEXT PRO WORKS: It's an image-editing model. It sees the FULL input photo
 * and edits it. So we must EXPLICITLY command: "completely replace the clothing,
 * hair, background, and body with [style elements]" — otherwise it preserves them.
 *
 * Every prompt follows this structure:
 * 1. FACE LOCK — keep only the face, replace everything else
 * 2. WHAT TO PAINT — complete portrait composition from art-historical research
 * 3. STYLE TECHNIQUE — brushwork, outlines, palette, perspective rules
 *
 * ROUTING:
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
  /** PuLID identity weight — UNUSED (kept for interface compat) */
  idWeight: number;
  /** LoRA URL for pet pipeline (null = use Kontext Pro fallback for pets) */
  loraUrl: string | null;
  /** LoRA weight scale (0-4) */
  loraScale: number;
  /** Human prompt template — face-lock + full scene replacement */
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
 * FACE LOCK — the critical instruction that tells Kontext Pro:
 * "Keep ONLY the face. Replace EVERYTHING else."
 *
 * This is aggressive by design. Kontext Pro preserves input by default,
 * so we must explicitly command replacement of clothes, hair, background, body.
 */
const FACE_LOCK =
  "Keep ONLY this person's face — same eyes, nose, jawline, skin tone, and expression. " +
  "COMPLETELY REPLACE everything else: remove their original clothing, hair style, background, " +
  "and body. Paint an entirely new portrait where only the face comes from the photo.";

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
      FACE_LOCK +
      " Paint this person as a beautifully adorned figure in a Madhubani Mithila painting. " +
      "Replace their clothes with traditional Mithila wedding attire covered in intricate pattern fills. " +
      "Give them an elaborate Mithila hairstyle decorated with flowers and ornaments. " +
      "Draw bold black double-line (do-rekha) outlines on every contour of the figure and surroundings. " +
      "Fill EVERY background space with dense Madhubani motifs — fish (matsya), peacocks (mayur), lotus flowers, " +
      "sun and moon circles, and geometric crosshatching. Leave absolutely NO empty space (horror vacui). " +
      "Use only the traditional natural pigment palette: warm turmeric yellow, brick-red vermillion, deep indigo blue, " +
      "earthy leaf green, chalky rice-paste white, and lamp-soot black. Matte earthy textures throughout. " +
      "Frame with a thick double-line border filled with a repeating fish-and-lotus chain pattern. " +
      "Flat perspective, no shadows, no shading — pure hand-painted folk art on paper.",
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
      FACE_LOCK +
      " Transform this person into the central figure of a Warli tribal art painting. " +
      "Replace their entire body with a Warli geometric stick figure — triangle torso (two triangles joined at apex " +
      "like a bowtie), circle head bearing their face, stick limbs — all in white rice-paste. " +
      "Replace the background completely with dark terracotta mud-brown. " +
      "Surround with a lively Warli village scene: concentric circle sun, triangle mountains, " +
      "chain-dance figures (tarpa dance in a spiral), rice paddy fields, flying birds, " +
      "trees made of stacked triangles, and a sacred Chauk square enclosure. " +
      "ONLY white figures on dark reddish-brown terracotta — absolutely NO other colors. " +
      "Lines should look slightly rough and hand-drawn like bamboo-stick on mud wall. " +
      "The person's face should be recognizable sitting atop the geometric Warli body.",
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
      FACE_LOCK +
      " Paint this person as a richly adorned divine figure in an ornate Pichwai painting from the Nathdwara tradition. " +
      "Replace their clothes with elaborate Pichwai-style silk garments with gold zari borders and floral embroidery. " +
      "Give them an ornate crown and heavy traditional jewelry — necklaces, armlets, earrings, all in gold with gems. " +
      "Replace the background completely with a deep midnight-blue or black ground " +
      "covered with intricate lotus flower (kamal) patterns in pink, white, and red. " +
      "Add sacred cows (kamadhenu) flanking the figure and decorative floral garlands (haar) draping from above. " +
      "Place a lotus pond at the base with pink lotuses on dark water. " +
      "Rich Pichwai palette: midnight blue, deep greens, lotus pink, vermillion, and prominent gold leaf accents " +
      "on all jewelry and ornamental details. Fine detailed brushwork throughout.",
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
      FACE_LOCK +
      " Paint this person as a majestic royal figure in an authentic Tanjore Thanjavur painting on a wooden panel. " +
      "Replace their clothes with rich silk garments in deep red and green with gold zari borders. " +
      "Give them an elaborate golden crown (kiritam) and a radiant gold halo behind the head. " +
      "Adorn with lavish South Indian temple jewelry: multi-strand haram necklace, heavy kundala earrings, " +
      "keyura armlets, oddiyanam waistband — all gleaming burnished gold embedded with gems. " +
      "Place the figure beneath an elaborate golden prabhavali arch — THE signature Tanjore element. " +
      "Cover 40-60% of the surface with raised gold leaf: the arch, all jewelry, crown, halo, throne, garment borders. " +
      "Embed gem-studded details (emerald green, ruby red, pearl white dots) into the gold areas. " +
      "Place ornate Dravidian temple pillars on either side. Deep maroon-red background behind the arch. " +
      "Tanjore palette: deep red, dark green, rich blue, abundant gold leaf with visible raised gesso texture. " +
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
      FACE_LOCK +
      " Paint this person as an elegant royal figure in a refined Mysore painting from the Wodeyar court tradition. " +
      "Replace their clothes with sophisticated South Indian royal attire — fine silk with subtle gold zari thread patterns. " +
      "Give them delicate but regal jewelry and an understated royal headdress. " +
      "Replace the background with a grand Mysore palace interior: carved rosewood pillars, " +
      "draped silk curtains in deep green and ivory, ornate cusped arches, a crystal chandelier above, " +
      "and a richly patterned carpet beneath the figure's feet. " +
      "Use the Mysore palette: muted warm gold tones, deep forest green, soft ivory, warm sandalwood brown. " +
      "Unlike Tanjore's heavy gold, Mysore uses thin delicate gold line work — refined, not opulent. " +
      "Gentle gesso preparation with elegant restrained brushwork. " +
      "Classical South Indian refinement — understated luxury, not loud grandeur.",
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
      FACE_LOCK +
      " Paint this person as a noble divine figure on an ancient Kerala temple wall in the Panchavarna mural style. " +
      "Replace their hair and clothing entirely: give them an ornate tall kireedam crown " +
      "(multi-tiered tapering crown with floral rosettes, pointed finial, and side ear-flaps) " +
      "and traditional Kerala white-and-gold garments with ornamental sashes. " +
      "Adorn with elaborate temple jewelry: multi-strand pearl haram, heavy kundala earrings, " +
      "keyura armlets, layered ornamental chains — all painted in yellow ochre (NOT gold leaf). " +
      "Give the figure large elongated fish-shaped eyes (matsya-netra) with dramatically heavy black kohl outlines " +
      "and prominent bright white sclera. Full rounded face, high domed forehead, elongated earlobes. " +
      "Use ONLY the Panchavarna five-color palette: warm yellow ochre, deep red oxide, " +
      "rich malachite green, blue-black for all outlines, and bright white for eyes and highlights. " +
      "THE defining feature: bold, thick, uniform black outlines on EVERY element — non-negotiable. " +
      "Frame with a padma-valli (lotus chain) border of stylized lotus flowers and buds. " +
      "Background is a flat warm color fill. Completely FLAT — NO shadows, NO shading, NO depth, NO gold leaf.",
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
      FACE_LOCK +
      " Paint this person as a Rajput royal in a Rajasthani Mewar school miniature painting. " +
      "Replace their clothes with elaborate Rajput court attire: a large layered Mewar turban (pagri) " +
      "with a jeweled sarpech ornament, rich silk angarkha with gold zari borders, " +
      "multiple pearl necklaces (haar), armlets (bazuband), and a gold nimbus/halo behind the head. " +
      "Seat the figure inside a jharokha (projecting balcony window) with a cusped arch above " +
      "and slender decorated pillars on each side. " +
      "An attendant with a morchhaal (peacock-feather fan) stands behind. " +
      "Replace the background completely with flat unmodulated vermillion red — THE signature Mewar color. " +
      "Add a narrow blue sky band with stylized scrolling clouds at the top. " +
      "Banana trees and flowering creepers flanking the composition. " +
      "Bold saturated jewel-tone palette: brilliant vermillion, deep ultramarine blue, emerald green, " +
      "warm Indian yellow, and burnished shell gold for jewelry, halo, and border. " +
      "STRONG dark outlines on all forms. Flat perspective — no Western shading or shadows. " +
      "Frame with an ornate floral scroll border: gold vine-and-flower on deep blue ground.",
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
      FACE_LOCK +
      " Paint this person as a Mughal nobleman in a Shah Jahan period miniature painting. " +
      "Replace their clothes with a sumptuous Mughal jama (long robe) of translucent muslin over rich silk, " +
      "and a jeweled turban featuring a kalgi (feathered plume) and sarpech ornament. " +
      "Give them pearl necklaces, gem-set rings, and a rose or iris held in one delicate hand. " +
      "Place a radiant gold nimbus (halo with radiating gold lines) behind the head. " +
      "Set the figure inside a jharokha (ornate window-balcony) with a multi-lobed cusped arch, " +
      "marble surround with carved stonework, and a projecting canopy (chajja). " +
      "Replace the background with a pale green ground or soft sky blue with thin horizon line. " +
      "Ultra-fine brushwork throughout — individual eyelashes, eyebrow hairs, fine beard strands visible. " +
      "Authentic Mughal palette: lapis lazuli blue, malachite green, vermillion red, orpiment golden yellow, " +
      "lead white, and abundant burnished shell gold. " +
      "Frame with the NON-NEGOTIABLE elaborate multi-zone Mughal border: " +
      "outermost zone of gold floral arabesques with naturalistic flowers (iris, tulip, rose) on colored ground, " +
      "inner framing lines in gold-black-gold-blue sequence. Burnished wasli paper texture.",
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
      FACE_LOCK +
      " Paint this person as a graceful figure in a lyrical Pahari miniature from the Kangra school. " +
      "Replace their clothes with flowing garments in soft pastel colors with fine gold borders: " +
      "pale saffron, delicate rose-pink, cream white, and soft sage green. " +
      "Give them refined jewelry: a thin gold haar necklace, small kundala earrings, delicate bangles. " +
      "Replace the background completely with a dreamy Himalayan landscape — " +
      "soft rolling hills in graduated blue-green tones, flowering dogwood and rhododendron trees " +
      "in full bloom, and a gentle stream winding through lush meadows. " +
      "The figure radiates tender emotion (shringar rasa) with soft almond eyes and a gentle expression. " +
      "Kangra palette: soft luminous pastels with rich accent tones — warm terracotta, deep green, " +
      "sky blue, pale lemon yellow, and touches of gold. " +
      "Delicate ultra-fine line work integrated with soft tonal washes. " +
      "Flowering creepers and blossoming trees frame the composition. " +
      "Ornamental painted border with floral vine pattern on a contrasting ground.",
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
      FACE_LOCK +
      " Paint this person as a Deccani nobleman in a lavish Bijapur-Golconda court painting. " +
      "Replace their clothes with a luxurious flowing jama in rich brocade patterns " +
      "and a distinctive tall rounded Deccani turban with a jeweled aigrette. " +
      "Give them elaborate pearl and gem jewelry — layered necklaces, armlets, rings — and a gold nimbus behind the head. " +
      "Replace the background with an opulent palatial setting: " +
      "massive pointed Islamic arches, ornate geometric tile patterns on the floor, " +
      "and richly draped textiles in deep jewel tones cascading behind the figure. " +
      "Opulent Deccani palette: deep purple, intense saffron gold, rich emerald green, " +
      "lapis blue, and abundant gold leaf accents. The Deccani style is MORE lavish and " +
      "fantastical than Mughal — bolder colors, more ornamental, dreamlike quality. " +
      "Ornate border with arabesque floral scrolls and geometric interlace on gold ground.",
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
      FACE_LOCK +
      " Paint this person as a Maratha warrior noble in a Peshwa-era court painting. " +
      "Replace their clothes with traditional Maratha court attire: a distinctive Maratha pagdi (turban) " +
      "with gold kalgi ornament, fitted angarkha, patka waistband, and dhoti in rich saffron and maroon. " +
      "Give them Maratha jewelry: a Kolhapuri necklace, wristbands, and finger rings. " +
      "The figure holds a curved Maratha sword (talwar) or sits regally on a low throne with bolster cushions. " +
      "Replace the background with a Maratha durbar hall — massive stone pillars, " +
      "draped rich textiles, and a fort rampart or hill-fort landscape visible through an arch behind. " +
      "Maratha palette: deep maroon, warm saffron, burnished gold, ivory white, and dark green. " +
      "Strong bold outlines with flat color fills in the Peshwa painting tradition. " +
      "Decorative border featuring Maratha motifs and gold ruling lines.",
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
      FACE_LOCK +
      " Paint this person as a magnificent Sikh royal in a Lahore darbar court painting. " +
      "Replace their clothes with magnificent Sikh royal attire: an elaborate dastar (turban) " +
      "with a jeweled kalgi and gold turra plume, a rich brocade angarkha " +
      "with detailed phulkari embroidery borders, and a kirpan (ceremonial dagger) at the waist. " +
      "Give them multiple strand pearl necklaces, gem-set armlets, and gold rings. " +
      "Seat the figure on a raised cushioned throne in the grand Lahore darbar hall — " +
      "replace the background with tall marble pillars, crystal chandeliers, " +
      "and a richly patterned carpet beneath. " +
      "Vibrant Punjab royal palette: warm golden tones, deep saffron, rich burgundy, " +
      "emerald green, ivory white, and abundant gold throughout. " +
      "Warm golden lighting suffuses the entire scene. " +
      "Fine brushwork with visible textile embroidery detail. " +
      "Ornate gold-ruled border with Sikh motifs.",
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
      FACE_LOCK +
      " Paint this person as an ethereal figure in a Bengal School painting by Abanindranath Tagore. " +
      "Replace their clothes with soft, flowing, almost weightless garments rendered in transparent watercolor layers — " +
      "pale terracotta, dusky rose, and warm golden fabric that drapes gracefully. " +
      "Replace the background completely with a dreamy gradient wash suggesting mist or twilight " +
      "in atmospheric blue-grey and warm sepia tones. " +
      "The figure emerges from the washes, edges dissolving softly into the background — no hard outlines. " +
      "Bengal School palette: earthy muted tones with warm golden undertones — " +
      "soft terracotta, warm sepia, muted olive green, dusky rose, pale gold, " +
      "and atmospheric blue-grey washes. Colors look transparent and luminous, " +
      "like Japanese wash painting merged with Indian sensibility. " +
      "Delicate brushstrokes, poetic romantic mood throughout. " +
      "Simple thin ruled line frame in gold or sepia — no ornate border.",
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
      FACE_LOCK +
      " Transform this person into a stunning anime character portrait. " +
      "Replace their hair with dynamic anime-styled hair with individual strand highlights and flowing movement. " +
      "Replace their clothes with stylish anime-appropriate attire with clean folds and fabric rendering. " +
      "Give them large expressive anime eyes with detailed irises, light reflections, and catch-light dots, " +
      "while keeping their face recognizable. " +
      "Clean precise black linework and vibrant saturated colors throughout. " +
      "Apply professional cel-shading with crisp shadows and smooth gradients on skin and clothing. " +
      "Replace the background with a Studio Ghibli inspired atmospheric scene — " +
      "soft bokeh light particles, gentle sky gradient, and dreamy clouds. " +
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
      FACE_LOCK +
      " Paint this person as a glamorous Bollywood star in a vintage hand-painted 1970s movie poster. " +
      "Replace their clothes with dramatic, stylish retro Bollywood costume — " +
      "flowing fabric, bold patterns, dramatic collar or drape. " +
      "Style their hair in a classic 70s Bollywood look — voluminous, dramatic, cinematic. " +
      "Dramatic side lighting sculpts the face, making them look like a film hero. " +
      "Replace the background with a dramatic painted sky — sweeping clouds, golden hour lighting, " +
      "sunset oranges and deep blues. " +
      "Visible oil-paint brushstroke texture throughout — this must look hand-painted, not photographic. " +
      "Bold saturated 70s Bollywood poster palette: deep sunset oranges, dramatic reds, golden yellows, intense shadows. " +
      "The person should look glamorous with luminous enhanced skin and dramatic makeup-like rendering. " +
      "Oil paint texture and visible hand-painted brushwork on every surface.",
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
    FACE_LOCK +
    " Paint this person as a regal figure in a traditional Indian art portrait " +
    "with rich colors, ornate traditional clothing, elaborate jewelry, " +
    "decorative borders, and authentic artistic techniques.",
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
  return `${FACE_LOCK} Paint this ${label} in a traditional Indian art style with rich colors, ornate details, and traditional artistic techniques.`;
}
