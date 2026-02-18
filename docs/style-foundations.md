# Mirasi Style Foundations — Research Summary

> Compiled from deep research into authentic art history sources, museum collections,
> academic references, and community prompt engineering insights.
> This file drives V8 prompt engineering for all 15 styles.

---

## RESEARCH METHODOLOGY
- Authentic art history sources (IGNCA, Lalit Kala Akademi, museum collections)
- Academic scholarship (B.N. Goswamy, Milo Cleveland Beach, Andrew Topsfield, etc.)
- Museum references (V&A, Met, National Museum Delhi, Thanjavur Art Gallery)
- Community UGC platforms for Flux Kontext Pro prompt engineering
- Competitor analysis (Fable by Surreal/SURREAL network)

---

## FLUX KONTEXT PRO — PROMPT ENGINEERING FINDINGS

### What Works Best
- **Instructional verb format**: "Transform this portrait into X" (confirmed by BFL guide)
- **Style description FIRST, identity preservation LAST** — model weights early tokens more
- **Physical medium cues** trigger stronger style rendering ("as if painted with rice paste on mud wall")
- **Specific color names** from traditional pigments ("vermillion red" not just "red")
- **guidance_scale 3.5-5.0** is the sweet spot. Below 3.5 = weak style. Above 6.0 = face degradation
- **No negative prompt support** on Kontext Pro
- **enhance_prompt = false** (we don't set this, default is fine) — setting true can override style cues
- **Prompt length**: 150-300 tokens optimal. Too short = generic. Too long = diluted focus
- **Order matters**: [Style transformation instruction] → [Medium/material cues] → [Specific visual elements] → [Color palette] → [Background/composition] → [Face preservation clause]

### What Doesn't Work
- Vague style descriptions ("make it artistic")
- Conflicting instructions ("photorealistic AND completely stylized")
- Too many "NO" instructions — model responds better to positive descriptions
- Extremely high guidance_scale (>6.0) — causes artifacts and face distortion
- Very long prompts (>400 tokens) — later tokens get less weight

---

## STYLE-BY-STYLE FOUNDATION SUMMARIES

### 1. MADHUBANI (Mithila) — P0 LoRA Style
**Immediately recognizable by**: (1) Total surface pattern density — ZERO empty space, (2) Bold black DOUBLE-LINE outlines (do-rekha), (3) Specific motif vocabulary (fish, peacock, lotus, sun/moon)
**Sub-style for AI**: Bharni (filled/colored) — most commercially expected
**Mandatory elements**: Bold black double-line outlines, horror vacui pattern fill, flat perspective, natural pigment colors, decorative multi-band border, large almond eyes with kohl
**Color palette**: Vermillion red, turmeric yellow, indigo blue, leaf green, black, white — warm, matte, natural pigment look
**Face conventions**: LARGE eyes (1/3 to 1/2 face width), elongated almond/fish shape, frontal gaze even in profile, heavy kohl, flat single-color skin
**Background**: NEVER empty — layers of motifs + fill patterns (crosshatch, dots, lattice)
**Border**: Multi-band — outer chain pattern, middle floral vine, inner geometric, innermost line
**Critical mistakes to avoid**: Empty space, missing double-line technique, photographic shading, perspective/depth, small realistic eyes

### 2. WARLI — P0 LoRA Style
**Immediately recognizable by**: (1) White on dark terracotta brown, (2) Geometric stick figures with triangle torsos, (3) Tarpa dance spiral
**ONLY 2 colors**: White rice paste on dark reddish-brown (laterite clay) background
**ONLY 3 shapes**: Circle (sun/divine), Triangle (mountains/torso), Square/line (sacred/human-made)
**Face convention**: DOT HEAD ONLY — no facial features. This is non-negotiable for authenticity
**Portrait approach**: Enlarged central Warli figure with dot-circle head, subtle distinguishing marks (hairstyle lines, pose, held objects), surrounded by full Warli scene
**Line quality**: Rough, textured, slightly wobbly bamboo-stick lines — NOT clean vector art
**Composition**: Central motif (Tarpa dance/Chauk/Tree of Life) surrounded by daily life scenes
**Border**: Zigzag, comb/ladder, dot rows, or chain geometric patterns
**Critical mistakes to avoid**: Realistic faces, multiple colors, smooth vector lines, filled/solid figures, isolated motifs on blank background

### 3. TANJORE (Thanjavur) — P0 LoRA Style
**Immediately recognizable by**: (1) GOLD LEAF everywhere (40-60% coverage), (2) Raised 3D gesso texture, (3) Frontal deity under ornate arch
**THE defining element**: Metallic gold leaf — must read as REFLECTIVE METALLIC, not yellow paint
**Gold goes on**: Prabhavali arch, ALL jewelry, crown, throne, halo, garment borders, pillar details, lotus pedestal
**Color palette**: Deep crimson red background (#8B0000), emerald green, royal blue, white, black outlines, warm ochre skin
**Face conventions**: Round full face, large almond kohl-lined eyes, slight half-smile, frontal orientation
**Composition**: Frontal hieratic figure framed by prabhavali arch on temple pillars, gem-studded elements
**Border**: Multi-layered (3-5 bands) — mango vine scrollwork, pearl strand, lotus chain, gold and deep red
**Critical mistakes to avoid**: Flat yellow paint instead of metallic gold, no raised texture, profile view, landscape background, pastel colors, insufficient gold (<30%)

### 4. RAJASTHANI MINIATURE (Mewar focus)
**Immediately recognizable by**: (1) Profile faces with frontal eyes, (2) Jewel-tone saturated colors, (3) Ornate borders, (4) Court/palace settings
**Sub-school for default**: Mewar — boldest, most purely Indian, most recognizable
**Color palette**: Brilliant vermillion red (signature Mewar), warm Indian yellow, deep ultramarine, malachite green, lead white, shell gold
**Face conventions**: Strict profile, large dark almond eye (frontal in profile face), small rounded chin, strong nose, upturned Rajput mustache on males
**Figure proportions**: Stocky (1:5-1:6 head-to-body), broad-shouldered, robust
**Composition**: Flat color backgrounds (vermillion red most Mewar), jharokha window framing, court scenes, horizontal registers
**Border**: Floral scroll vine on contrasting ground — gold vine on deep blue/red/black
**Gold**: Shell gold for jewelry, halos, borders — must be present
**Critical mistakes to avoid**: Western perspective, frontal faces, pastel/washed colors, missing gold, wrong turban style

### 5. MUGHAL MINIATURE (Jahangir period focus)
**Immediately recognizable by**: (1) Ultra-fine brushwork with visible individual brush lines, (2) Elaborate hashiya (multi-nested) borders with gold arabesques, (3) Naturalistic yet idealized portraiture
**Color palette**: Lapis lazuli ultramarine, vermillion, malachite green, gold leaf, orpiment yellow, lead white
**Face conventions**: 3/4 profile (more naturalistic than Rajput), individualized features, subtle green underpaint for facial shading, nimbus/halo for royals
**Composition**: Jharokha portrait (cusped arch window), char bagh garden scenes, elaborate hashiya border system (5 nested zones)
**Portrait format**: Standing or seated figure with gold nimbus, attendants with fly-whisk/peacock fan
**Border**: THE most elaborate — multiple nested borders with gold floral arabesques (islimi vine), inner decorative band, ruled lines
**Gold**: Extensive — burnished shell gold for borders, jewelry, nimbus, architectural details
**Critical mistakes to avoid**: Too bold/thick lines (must be ultra-fine), flat/unsophisticated color, missing border system, missing nimbus, anime-style eyes

### 6. KERALA MURAL
**Immediately recognizable by**: (1) BOLD thick black outlines (3-5x thicker than other traditions), (2) ONLY 5 colors, (3) GREEN skin for divine figures, (4) Large fish-shaped eyes, (5) Ornate kireedam crown
**STRICT 5-color palette**: Yellow ochre, Red oxide, Deep green, Blue-black, White — NO exceptions
**NO gold leaf** — this differentiates from Tanjore. Yellow ochre provides all golden effects
**Face conventions**: Round full face, ENORMOUS fish-shaped (matsya-netra) eyes, dramatic kohl, upward-tilted at outer corners, serene expression for Sathvika figures
**Figure classification**: Sathvika (divine/green skin/serene), Rajasika (warrior/warm red-toned skin/intense), Tamasika (demon/dark skin/fierce)
**Crown**: Tall multi-tiered kireedam (identical to Kathakali headpiece)
**Border**: Padma-valli (lotus chain) — THE signature border motif
**Critical mistakes to avoid**: More than 5 colors, thin outlines, Western shading, gold leaf (that's Tanjore), blue skin instead of green

### 7. PICHWAI (Nathdwara)
**Immediately recognizable by**: Dense lotus patterns covering EVERY surface, dark indigo/black background, sacred cow motifs, Shrinathji depiction
**Color palette**: Deep indigo/black background, gold/silver leaf, vermillion, cadmium yellow, emerald green
**Key principle**: Overwhelming ornate density — MORE decorative fill than even Madhubani
**Composition**: Bilateral symmetry, central axis, horizontal registers, horror vacui
**Seasonal variations**: Different palettes/motifs for 12 months and festivals

### 8. PAHARI (Kangra focus)
**Immediately recognizable by**: Soft lyrical naturalism, lush Himalayan landscapes with individually painted leaves, pastel-to-saturated palette, idealized feminine beauty
**Color palette**: Soft pastel pinks, sky blues, leaf greens with rich accent colors
**Face conventions**: Soft rounded features, gentle eyes, dreamy expression
**Landscape**: THE defining element — lush flowering trees with individual leaves, gentle streams, snow-capped peaks, grazing deer
**Line work**: Extremely fine, flowing, calligraphic quality

### 9. BENGAL SCHOOL (Abanindranath Tagore)
**Immediately recognizable by**: Soft watercolor washes, wet-on-wet bleeding edges, ethereal dreamy quality, muted earthy palette
**Color palette**: MUTED — ochres, siennas, dusty rose, sage, gray-blues. NOT bright primaries
**Technique**: Wet-on-wet watercolor wash, deliberately anti-colonial rejection of Western realism
**Japanese influence**: Nihonga wash technique visible in soft bleeding edges
**Face conventions**: Soft, idealized, romantic, three-quarter view, wistful expression
**Background**: Atmospheric wash dissolving into soft gradients, paper shows through

### 10. DECCANI (Bijapur-Golconda)
**Immediately recognizable by**: Rich sensuous colors (deep purple, turquoise, gold), Persian-Indian blend, fantastical elements, night scenes
**Color palette**: Deep purples/mauves, turquoise/teal, rich gold, deep greens — jewel-box luminosity
**Composition**: Layered depth, architectural framing with onion domes and pointed arches, Islamic geometric patterns
**Face conventions**: Rounded sensuous faces, large dreamy eyes, rich adornment

### 11. MYSORE PAINTING
**Immediately recognizable by**: Refined elegance (more subtle than Tanjore), restrained gold (10-20% vs Tanjore's 40-60%), muted palette
**Key difference from Tanjore**: Less gold, more refined, muted colors, slight low-relief gesso
**Color palette**: Soft reds, sage greens, warm ochres, soft blues — moderate saturation

### 12. MARATHA (Peshwa era)
**Immediately recognizable by**: Fort/durbar settings, saffron flags, Maratha martial elements, Deccani-Rajput blend
**Color palette**: Warm earthy tones, saffron/kesari, deep reds, white, gold for weaponry
**Composition**: Durbar scenes, fort architecture (Raigad/Sinhagad), procession formats

### 13. PUNJAB ROYAL (Sikh court)
**Immediately recognizable by**: Bold Pahari-Sikh blend, Lahore darbar grandeur, Phulkari textile motifs
**Color palette**: Saffron, royal blue, deep crimson, burnished gold

### 14. ANIME
**For Indian context**: Studio Ghibli warmth + Shinkai atmosphere
**Key adaptations for Indian faces**: Warm skin tones (not pale), more defined nose than anime default, fuller lips, thick dark wavy/curly hair, broader facial structure
**Color palette**: Hyper-saturated but warm, Indian environmental cues (laterite red, monsoon skies, festival colors)

### 15. BOLLYWOOD RETRO
**Immediately recognizable by**: Hand-painted oil/acrylic poster style, dramatic chiaroscuro, exaggerated idealized features, compressed narrative montage
**Color palette**: Saturated bold, warm golden flesh tones, dominant reds, "Bollywood orange," deep blue/black for drama
**Face rendering**: Idealized star likeness, dramatic directional lighting, expressive eyes with catchlight, glossy lips, windblown hair
**Vintage aesthetic**: Film grain, slightly worn poster texture, hand-painted typography feel

---

## CROSS-STYLE COMPARISON: FACE TREATMENT

| Style | Face View | Eye Size | Face Shape | Shading | Identity Approach |
|-------|-----------|----------|------------|---------|-------------------|
| Madhubani | Frontal or profile (frontal eye in profile) | HUGE (1/3-1/2 face) | Oval/elongated | ZERO — flat | Decorative mask |
| Warli | N/A — dot only | N/A | Circle dot | ZERO | No individual identity |
| Tanjore | Frontal | Very large, almond | Round/full | ZERO — flat | Idealized divine |
| Rajasthani | Profile | Large almond | Varies by school | Minimal | Idealized with markers |
| Mughal | 3/4 profile | Naturalistic | Naturalistic | Subtle green underpaint | Most individual |
| Kerala Mural | 3/4 or frontal | ENORMOUS fish-shape | Round/full | ZERO — flat | Category-based (3 gunas) |
| Bengal School | 3/4 | Moderate, soft | Soft oval | Soft watercolor wash | Idealized romantic |
| Bollywood Retro | 3/4 or frontal | Dramatic, expressive | Idealized | Strong chiaroscuro | Star-likeness preserved |
| Anime | 3/4 or frontal | Large, expressive | Simplified | Cel-shading | Simplified recognition |

---

## KEY INSIGHT FOR PROMPT V8

**The fundamental tension**: Each art style has its OWN face convention that is DIFFERENT from photographic reality. The prompt must:
1. Transform the overall image convincingly into the art style
2. Apply the art style's face conventions (large eyes, flat rendering, profile view, etc.)
3. BUT keep enough of the subject's individual features to be recognizable

**The solution**: Style-specific face blending instructions that describe HOW the style renders faces, then ask for identity preservation WITHIN those conventions.

Example: For Madhubani, instead of "keep the face photorealistic," say "render the face with Madhubani's large almond-shaped kohl-lined eyes and flat color skin, but preserve the subject's facial structure, nose shape, and overall appearance so they are recognizable."
