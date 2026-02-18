# WARLI TRIBAL ART — Complete Style Foundation Document
## For AI Prompt Engineering & Image Generation

> **Purpose**: This document provides an exhaustive reference for Warli art's visual language,
> enabling precise AI prompt construction that produces *authentically Warli* outputs rather than
> "realistic portrait with Warli decorations sprinkled around it."

---

## 1. HISTORICAL ORIGINS & CULTURAL CONTEXT

### The Warli Tribe
- **Location**: The Warli (also spelled Varli) are an indigenous Adivasi tribe inhabiting the
  northern Sahyadri mountain range in the Dahanu-Talasari belt of Palghar district (formerly
  Thane district), Maharashtra, India. They also extend into parts of Gujarat and the union
  territory of Dadra and Nagar Haveli.
- **Population**: Approximately 300,000+ people. One of the largest tribes in India.
- **Language**: Warli (also called Varli), an unwritten Indo-Aryan language of the southern
  Bhil group. The tribe has NO written script — their painting tradition IS their primary
  form of communication, record-keeping, and cultural transmission.
- **Livelihood**: Subsistence agriculture (rice paddy cultivation), fishing, hunting, and
  gathering. This agrarian life is the PRIMARY subject matter of the art.

### Dating & Archaeological Connection
- **Age**: Warli painting is estimated to date back **2,500 to 3,000 years**, making it one
  of the oldest continuous art traditions in the world.
- **Cave painting lineage**: The geometric stick-figure style bears strong visual resemblance
  to prehistoric rock shelter paintings found at:
  - **Bhimbetka** (Madhya Pradesh, UNESCO World Heritage Site, ~30,000 years old)
  - **Ratnagiri** and **Raigad** rock shelters in the Western Ghats
  - **Edakkal Caves** (Kerala)
- The Warli style is considered a *living continuation* of Neolithic/Mesolithic rock art
  traditions. The same visual vocabulary — stick figures, concentric circles, hunting scenes,
  chain dances — appears in both prehistoric caves and modern Warli paintings.
- **Critical point**: Unlike many Indian art traditions that evolved through royal/courtly
  patronage, Warli art remained a purely tribal, ritualistic, non-commercial tradition until
  the 1970s. It was practiced exclusively by women as part of marriage and fertility rituals.

### Modern Discovery & Recognition
- **1970s**: Warli art was "discovered" by the outside world when **Jivya Soma Mashe**
  (1934-2018), a Warli tribesman, began creating paintings on paper for exhibition. He is
  considered the father of the modern Warli art movement.
- **Padma Shri**: Jivya Soma Mashe was awarded India's fourth-highest civilian honor in 2011.
- Traditionally, only **married women** painted Warli art, and ONLY during specific rituals
  (marriages, harvests, festivals). Jivya Soma Mashe broke this gender restriction.
- The art received a GI (Geographical Indication) tag, linking it specifically to the
  tribal regions of Maharashtra.

---

## 2. DEFINING VISUAL CHARACTERISTICS

### 2A. THE THREE FUNDAMENTAL SHAPES

Warli art uses ONLY three geometric shapes. Every element in the entire visual vocabulary
is constructed from combinations of these three shapes. This is the most critical rule:

| Shape | Represents | Symbolic Meaning | Visual Notes |
|-------|-----------|-----------------|--------------|
| **Circle** | Sun, Moon, sacred | Nature, cosmic cycles, the divine | Drawn as simple rings or filled dots. Concentric circles for sun/moon. Never perfectly round — hand-drawn wobble is authentic. |
| **Triangle** | Mountains, trees, human torso | Stability, the earthly realm, mountains (triangles pointing up), trees (two triangles stacked) | The MOST used shape. Human torsos are TWO triangles joined at the apex (like a bowtie/hourglass). Single triangles = mountains, huts. |
| **Square/Rectangle** | Sacred enclosure, land, the Chauk | Human creation, the terrestrial world, sacred feminine space | The square is the MOST sacred shape — it represents the "Chauk" (sacred enclosure) and the earth. Used for borders, the central ritual square, and house structures. Lines are extensions of the square. |

**CRITICAL FOR PROMPT ENGINEERING**: Every single element in a Warli painting — humans,
animals, trees, buildings, tools, the sun, the moon — MUST be reducible to circles,
triangles, and straight lines. If any element looks "organic" or "curved" or "realistic,"
it is NOT Warli.

### 2B. COLOR PALETTE

**Traditional Warli uses ONLY TWO COLORS:**

| Element | Color | Material | Hex Approximation |
|---------|-------|----------|-------------------|
| **Background** | Dark reddish-brown / terracotta / chocolate | Mixture of mud, cow dung, and red earth (geru/laterite clay) applied as a plaster on the wall | `#8B4513` to `#A0522D` (saddle brown to sienna). Can range from `#6B3410` (very dark) to `#B5651D` (lighter earth). NOT orange. NOT bright red. Think "wet red clay" or "dark terracotta pot." |
| **Figures/Lines** | White / cream / off-white | Rice paste (rice flour + water + gum) applied with bamboo stick | `#F5F0E8` to `#FFFFFF`. Traditional rice paste is slightly warm/cream, never pure clinical white. Can appear slightly textured/grainy. |

**Why these specific materials?**
- The **mud-and-dung wall** is the literal surface of the tribal hut's interior walls. Women
  prepare this surface fresh before festivals and marriages. The reddish color comes from
  laterite soil (iron-rich clay) abundant in the Sahyadri region.
- The **white rice paste** is sacred — rice is the staple crop and offering. Using rice paste
  to paint connects the art directly to sustenance, fertility, and life.
- **NO other colors exist in traditional Warli art.** Any Warli art using yellow, blue, green,
  or multiple colors is a modern/commercial adaptation. Authentic Warli is STRICTLY
  white-on-terracotta-brown.

**For AI prompts**: Always specify "ONLY white on dark terracotta/chocolate brown background"
and explicitly state "NO other colors." The AI will tend to add colors if not firmly
instructed otherwise.

### 2C. LINE WORK & APPLICATION TECHNIQUE

**Tool**: A bamboo stick (or twig) chewed at one end to create a rough "brush" tip. NOT a
fine brush. NOT a pen. The bamboo's natural fibers create an inherently rough, slightly
irregular line.

**Medium**: White rice paste (rice flour mixed with water and natural gum/binding agents).
The paste is slightly thick, not watery — it sits ON TOP of the wall surface rather than
soaking in, creating a slight relief/texture.

**Line characteristics**:
- **ROUGH and TEXTURED**: Lines are never smooth or clean. They have visible grain, slight
  wobble, and uneven thickness. This is THE hallmark of authentic Warli.
- **Uniform-ish width**: Despite the roughness, lines maintain a relatively consistent width
  (the bamboo stick's natural width). Approximately 2-4mm equivalent.
- **No shading, no gradients, no fills**: Lines are OUTLINES ONLY. Bodies are NOT filled in
  with solid white. The terracotta background shows through inside every figure.
  (Exception: some dot/dash fill patterns inside the Chauk square and specific ritual areas.)
- **Dots**: Made by dabbing the bamboo tip. Used for eyes (single dot), decorative borders,
  grain patterns, and small motifs. Dots are slightly irregular, never perfectly round.
- **Dashes**: Short repeated strokes used for texturing, depicting rain, grain, grass, or
  as decorative borders.

**For AI prompts**: Specify "rough textured white lines as if drawn with a bamboo stick on
rough mud wall, NOT clean vector lines." The AI defaults to smooth/clean — you must
counteract this.

### 2D. SCALE & PROPORTIONS

- **Figures are TINY relative to the composition**: In a traditional wall painting (which can
  be 3-6 feet across), individual human figures might be only 2-4 inches tall. The power of
  Warli art is in the MASS of tiny figures creating patterns, not in any single large figure.
- **Human figures**: Approximately 5-7 "head heights" tall (somewhat realistic proportion but
  rendered as geometric sticks). The triangular torso is the largest body part.
- **NO HIERARCHY OF SCALE for humans**: All human figures in a scene are approximately the
  same size. There is no "important figure is bigger" convention (unlike Egyptian or Indian
  miniature art). The exception is the Chauk, which is larger than surrounding figures.
- **Animals vary in scale**: Horses and bullocks are depicted larger than humans (realistic
  relative scale). Birds are smaller. Fish are small dashes.
- **Trees are tall**: Trees are one of the larger elements, extending the full height of a
  composition band with spreading branches.
- **Flat perspective**: There is NO perspective, NO foreshortening, NO depth. Everything
  exists on one flat plane. Figures are shown in pure profile or frontal view. The
  "ground" is simply the bottom of the composition band.

---

## 3. THE HUMAN FIGURE IN WARLI ART (Critical for Portrait Transformation)

### 3A. Anatomy of a Warli Human Figure

This is THE most critical section for portrait AI prompt engineering:

```
        o          ← HEAD: A simple filled circle (dot). NO facial features.
       /|\            No eyes, no nose, no mouth. Just a dot/circle.
      / | \           Sometimes a slightly larger circle for women.
     /  |  \
    /___|___\      ← TORSO: TWO TRIANGLES joined at their apex points,
    \   |   /        forming an hourglass/bowtie shape.
     \  |  /         Upper triangle = chest/shoulders (point down).
      \ | /          Lower triangle = waist/hips (point up).
       \|/           The two triangles share a single apex point at the waist.
        |
       / \         ← LEGS: Two straight lines angling out from the bottom
      /   \          of the lower triangle. Sometimes with tiny feet
     /     \         (small horizontal dashes).

    ARMS: Two straight lines extending from the top corners of the
    upper triangle. Often shown in action poses — carrying things,
    dancing with hands raised, holding tools.
```

**ABSOLUTE RULES FOR WARLI HUMAN FIGURES:**

1. **HEAD = CIRCLE/DOT ONLY**: The head is a simple filled white circle. There are
   NO facial features whatsoever — no eyes, no nose, no mouth, no ears, no hair detail.
   This is non-negotiable. A face with features is NOT Warli.

2. **TORSO = TWO JOINED TRIANGLES**: The iconic hourglass/bowtie shape. This is what
   makes a Warli figure instantly identifiable. The triangles are drawn as outlines
   (not filled solid white).

3. **LIMBS = STRAIGHT LINES**: Arms and legs are simple straight lines. No muscle
   definition, no joints, no thickness variation. Pure sticks.

4. **NO CLOTHING DETAIL**: Figures are naked geometric forms. No folds, no texture,
   no garment rendering. (Some modern Warli shows women with a triangular skirt
   extension, but traditional figures are unclothed geometry.)

5. **ACTION DEFINES IDENTITY**: You cannot tell WHO a figure is by looking at them
   (since all figures look identical). Identity comes from WHAT THEY ARE DOING and
   their position in the scene. A farmer is identified by holding a tool near a field.
   A dancer is identified by being in the dance circle.

6. **GENDER DISTINCTION**: Minimal. Women sometimes have a slightly larger head circle,
   or a triangular hair/topknot extension above the head dot. Men sometimes have a
   slightly narrower torso proportion. But the difference is very subtle.

### 3B. FACE/PORTRAIT DEPICTION — Critical for AI Portrait Use Case

**THIS IS THE CORE CHALLENGE**: Warli art fundamentally does NOT depict individual
faces or portraits. The human face is ALWAYS a featureless dot/circle. This is not
a limitation — it is a philosophical and spiritual position:

- In Warli cosmology, the individual is subordinate to the community. The art
  depicts COLLECTIVE life, not individual identity.
- Faces are considered spiritually significant — depicting them realistically
  could trap or harm the spirit.
- The featureless face makes every figure universal — any viewer can see
  themselves in any figure.

**For AI portrait transformation, you have several authentic approaches:**

| Approach | Authenticity | Description |
|----------|-------------|-------------|
| **A. Pure Warli (most authentic)** | Highest | Transform the person into a standard Warli stick figure (dot head, triangle torso, stick limbs) placed centrally in a Warli scene. Identity is lost but art style is perfect. |
| **B. Enlarged Warli figure (recommended)** | High | Create a larger-than-usual central Warli figure with the dot-circle head, but add *subtle* distinguishing marks — hairstyle suggestion via simple lines above the dot, body proportion hints, a characteristic pose or held object that connects to the original person. Surround with traditional Warli scene. |
| **C. Hybrid face (artistic license)** | Medium | Keep the face as a larger circle but add MINIMAL geometric features: two dots for eyes, a tiny line for nose, maybe a curved line for smile. Still geometric, still simple, but slightly more identifiable. This exists in some contemporary Warli work. |
| **D. Portrait in Warli frame (least authentic)** | Low | Render a somewhat realistic but simplified face (flat colors, minimal shading) surrounded by a Warli-style border and motifs. This is what the current AI produces — it looks like "realistic face + Warli stickers" and is the LEAST desirable outcome. |

**RECOMMENDATION FOR MIRASI**: Use Approach B or C. The figure should be clearly Warli
(geometric, stick-figure, white on brown) but larger/more central than typical Warli
figures. Add just enough geometric distinction (suggested hairstyle lines, body shape
hints) to create a connection to the original person without breaking the Warli visual
language. NEVER render realistic facial features.

---

## 4. CORE MOTIFS & THEIR MEANINGS

### 4A. TARPA DANCE (Most Iconic Warli Motif)

The Tarpa dance is the single most recognizable Warli motif and appears in virtually
every traditional Warli painting.

**What it is**: The Tarpa is a trumpet-like wind instrument made from a dried gourd and
bamboo tubes. During harvest festivals and marriages, a musician plays the Tarpa while
men and women form a large chain/spiral dance around them.

**Visual rendering**:
- A **spiral or concentric chain** of human figures, all holding hands (connected by
  their stick-line arms).
- Figures face the SAME DIRECTION, moving in the spiral.
- At the center (or one end) of the spiral: a single figure holding the Tarpa instrument
  (depicted as a V-shaped or angled line extending from the figure's mouth/face area).
- The chain can be:
  - A **tight spiral** (most iconic — looks like a coiled spring from above)
  - A **large circle/ring** of figures
  - A **winding S-curve** or **serpentine chain**
- Figures in the dance chain are IDENTICAL in size and shape.
- The spiral radiates energy outward — it represents the cosmic cycle, community unity,
  and the rhythm of agricultural life.

**For AI prompts**: "Spiral chain of connected Warli stick figures dancing around a
central Tarpa musician, figures holding hands in a continuous spiral line."

### 4B. CHAUK (Sacred Square / Fertility Goddess)

The Chauk is the most sacred motif in Warli art and is the ONLY motif traditionally
painted INSIDE the home (on the interior wall of the main room, near the entrance).

**What it is**: A large decorated SQUARE containing the figure of **Palaghata** (also
called Palaghat or Haritalika), the Warli mother goddess / fertility deity.

**Visual rendering**:
- A **prominent SQUARE** drawn with double or decorated lines. This is the largest
  single geometric shape in the composition.
- Inside the square: a stylized female figure (the goddess), often depicted:
  - Standing or seated centrally
  - With extended or raised arms
  - Sometimes with a horse figure on either side
  - Sometimes with a comb, mirror, and other fertility/marriage symbols
- The square's borders may contain:
  - Comb-like patterns (rows of short parallel lines)
  - Dot patterns
  - Small triangular decorations
  - Grain/rice motifs
- The Chauk is drawn ONLY during marriage ceremonies by married women.
  Unmarried women and men traditionally do not paint the Chauk.

**For AI prompts**: "Central sacred square (Chauk) with decorated borders containing
a stylized female figure, flanked by horses, surrounded by marriage celebration scenes."

### 4C. SUN AND MOON

**Sun**:
- A circle (can be filled or outline-only) surrounded by short radiating straight lines (rays).
- Sometimes depicted as concentric circles with rays — like a target/bullseye with spikes.
- Always appears in the upper portion of the composition.
- Represents life force, time, agricultural cycles.

**Moon**:
- A simple circle (usually just an outline ring, not filled).
- Sometimes a crescent (rare in traditional work, more common in modern).
- Distinguished from the sun by the ABSENCE of rays.
- May appear as a slightly larger circle than the sun.

**Stars**: Simple dots or tiny asterisk shapes (intersection of two or three short lines).

### 4D. TREES

Trees in Warli art have a very specific rendering style:

- **Trunk**: A single vertical straight line.
- **Branches**: Diagonal straight lines extending from the trunk at roughly 45-degree
  angles, arranged in pairs going up the trunk (like a simplified conifer/pine shape,
  but with more organic branch angles).
- **Leaves**: NOT individually depicted. Instead, branches end in:
  - Small clusters of dots
  - Tiny circles at branch tips
  - Simply bare branches (common in traditional work)
- **Specific tree types**:
  - **Palm tree**: Tall straight trunk with a cluster of diagonal lines fanning from the top
  - **Banyan/large tree**: Thicker trunk (double lines), more horizontal spreading branches,
    sometimes with hanging aerial root lines
  - **Fruit tree**: Branches with small circles (fruits) at the tips
- **Birds in trees**: Very commonly depicted. Small V-shaped or triangular birds perch on
  branches or fly near the tree.

**For AI prompts**: "Warli-style trees with single-line trunks, angled branch lines, dots
or circles for foliage clusters, birds perched on branches."

### 4E. ANIMALS

Each animal has a specific geometric rendering convention:

**BIRDS**:
- Body: Small triangle or diamond shape
- Wings: Two angled lines extending from the body (in flight) or folded (perched)
- Beak: Tiny line extending from the point of the triangle
- Often depicted in flocks — rows of identical bird shapes flying in formation
- Peacocks: Larger triangle body with a fan of radiating lines behind (tail)

**DEER/ANTELOPE**:
- Body: Horizontal rectangle or elongated triangle
- Legs: Four straight lines descending from the body
- Head: Small triangle or circle at one end
- Horns/Antlers: Branching lines (like tree branches) extending from the head
- Often depicted running (legs angled) in groups

**HORSES**:
- Body: Larger horizontal rectangle/trapezoid
- Legs: Four straight lines, often with one pair angled forward (running pose)
- Head: Triangle extending forward and slightly up from the body
- Tail: Single line or tassel of lines at the rear
- Mane: Series of short lines along the neck
- IMPORTANT: Horses often appear flanking the Chauk or carrying riders

**BULLOCKS/CATTLE**:
- Similar to horses but with:
  - Broader, more rectangular body
  - Curved horns (one of the FEW curved lines allowed in Warli — the horn arc)
  - Often depicted yoked together pulling a cart
- Bullock carts are a very common motif: two bullocks + geometric cart + driver figure

**FISH**:
- Simple elongated diamond/leaf shape
- Tail: Small V at one end
- Sometimes just a row of small chevron shapes (>>>) representing a school of fish
- Appear in river/stream scenes

**SNAKES/SERPENTS**:
- Zigzag lines or S-curves (another exception to the straight-line rule)
- Sometimes with a small triangle or dot head
- Often appear near water or around the Chauk

**SCORPIONS**:
- A circle (body) with multiple radiating lines (legs) and a curved line (tail/stinger)

### 4F. DAILY LIFE SCENES

Warli art is essentially a visual documentation of daily tribal life. Common scenes include:

**Agricultural scenes**:
- Plowing: Figure behind bullocks with a plow (triangle shape)
- Sowing: Figure bending forward scattering dots (seeds)
- Harvesting: Figures with sickles (curved line + handle) cutting grain
- Threshing: Figures beating grain on the ground
- Rice paddy: Horizontal wavy lines with small figures standing in them

**Hunting scenes**:
- Figures with bows (curved line with string) and arrows
- Figures carrying spears (long diagonal lines)
- Animal targets (deer, boar) running ahead of hunters
- Dogs accompanying hunters

**Fishing scenes**:
- Figures standing in/near wavy water lines
- Holding nets (triangular mesh patterns) or fishing lines
- Fish shapes in the water area

**Domestic scenes**:
- Cooking: Figure near a triangle (fire/hearth) with a circular pot
- Grinding grain: Figure bent over a rectangular grinding stone
- Carrying water: Figures with circles (water pots) on their heads
- Weaving: Figures seated at rectangular looms

**Festival/celebration scenes**:
- Tarpa dance (described above)
- Marriage procession: Line of figures walking in sequence
- Music: Figures with instruments (drums = circles, flutes = lines)
- Drinking toddy: Figures near a tall palm tree with collection pots

**Market/trade scenes**:
- Figures carrying goods on heads or in baskets
- Bullock carts loaded with produce
- Groups of figures gathered in a marketplace arrangement

---

## 5. COMPOSITION RULES & PATTERNS

### 5A. OVERALL COMPOSITION STRUCTURE

Traditional Warli paintings follow a specific compositional logic:

**1. THE CENTRAL MOTIF**:
- The composition is organized around a central focal element, typically:
  - The **Chauk** (sacred square) for marriage/ritual paintings
  - The **Tarpa dance spiral** for festival/celebration paintings
  - A **large tree** (Tree of Life) for general/nature paintings
- This central element is the largest single motif and everything else radiates from it.

**2. BAND/REGISTER COMPOSITION**:
- Scenes are often organized in horizontal bands (registers), similar to:
  - Egyptian tomb paintings
  - Mesopotamian cylinder seals
  - Medieval European narrative art
- Each band depicts a different aspect of life or a different scene:
  - Top band: Sky elements (sun, moon, birds, flying figures)
  - Middle bands: Main scenes (dance, farming, hunting, festivals)
  - Bottom band: Water/ground scenes (fish, rivers, earthbound animals)
- Bands may be separated by decorative lines, zigzag borders, or dot rows.

**3. HORROR VACUI (Fear of Empty Space)**:
- Traditional Warli paintings fill EVERY available space with motifs.
- If there is an empty area between major scenes, it will be filled with:
  - Small decorative elements (dots, dashes, small triangles)
  - Individual figures doing activities
  - Animals, birds, trees
  - Small geometric patterns
- White space/empty terracotta is minimized. The painting should feel DENSE with life.

**4. RADIAL/SPIRAL ORGANIZATION**:
- Around central motifs, subsidiary elements often spiral outward in concentric zones:
  - Zone 1 (innermost): The central motif (Chauk/dance/tree)
  - Zone 2: Closely related figures (dancers around the Chauk, etc.)
  - Zone 3: Daily life scenes
  - Zone 4: Nature elements (trees, animals)
  - Zone 5 (outermost): Border decoration

**5. NARRATIVE SEQUENCE**:
- Warli art is inherently NARRATIVE — it tells stories.
- Scenes progress around the central motif, sometimes clockwise.
- There is no strict reading order; the viewer's eye wanders through the
  entire composition discovering vignettes.
- This is similar to the "continuous narrative" tradition in Indian temple
  sculpture and Buddhist Jataka panels.

### 5B. BORDER/FRAME CONVENTIONS

Borders are an integral part of Warli composition and are ALWAYS present:

**Traditional border types**:
1. **Simple line border**: Single or double straight white lines forming a rectangle
   around the entire composition. The most basic and common.
2. **Zigzag/chevron border**: A continuous zigzag line (like mountains or waves) running
   along all four edges.
3. **Dot border**: A row of evenly-spaced dots along the edges.
4. **Comb/ladder border**: Two parallel lines with short perpendicular lines between them
   (like a ladder or comb teeth). Very common.
5. **Chain border**: Repeated small geometric motifs (diamonds, triangles, circles)
   connected in a continuous chain.
6. **Figurative border**: Small repeated figures (dancers, birds, animals) arranged in
   a continuous row along the edges.
7. **Compound border**: Multiple border types nested — e.g., an outer line border,
   then a zigzag, then a dot row, then another line border.

**Border rules**:
- Borders are ALWAYS geometric/straight-line based.
- Border elements repeat uniformly — the same motif at the same interval.
- Corner treatment: Borders typically just meet at right angles. Sometimes a small
  decorative element (circle, dot cluster, small figure) is placed at corners.
- The border frames the scene like a window into the Warli world.

**For AI prompts**: Always specify a border. "Traditional Warli border frame with
geometric zigzag patterns, ladder/comb motifs, and dot rows" adds significant
authenticity.

---

## 6. TEXTURE & MEDIUM — The Tactile Quality

### 6A. THE MUD WALL SURFACE

The "canvas" of Warli art is not paper or cloth — it is a **prepared mud wall**:

- **Base layer**: The wall of the tribal hut is made of bamboo, mud, and thatch.
- **Preparation**: A mixture of **cow dung and red laterite clay (geru)** is applied
  as a smooth plaster. This creates the characteristic reddish-brown surface.
- **Texture**: The surface is NOT smooth. It has a slightly rough, granular texture
  from the clay and dung mixture. This texture is visible through the white paint
  and gives the art its characteristic "earthy" quality.
- **Imperfections**: Slight bumps, cracks, and unevenness in the wall surface are
  part of the authentic look. The painting follows the wall's contours.

### 6B. THE RICE PASTE APPLICATION

- **Consistency**: The rice paste is somewhat thick — thicker than watercolor but
  thinner than house paint. It sits on the surface with slight relief.
- **Opacity**: Semi-opaque. In thin applications, the terracotta background shows
  through slightly, creating a warm-tinted white. In thicker applications (dots,
  where the bamboo dabs multiple times), the white is more solid.
- **Drying appearance**: When dried, rice paste has a slightly matte, chalky finish.
  It can crack slightly on textured surfaces, adding to the aged quality.
- **Granularity**: Under close inspection, individual rice grains/flour particles
  are sometimes visible in the dried paste, creating a subtle speckled texture.

### 6C. TEXTURE KEYWORDS FOR AI PROMPTS

To achieve authentic Warli texture in AI generation, use terms like:
- "rough mud wall texture"
- "chalky white rice paste on earthy terracotta"
- "matte finish, not glossy"
- "slightly grainy white pigment"
- "visible wall texture through the paint"
- "hand-painted with bamboo stick, rough irregular lines"
- "aged fresco quality"
- "natural earth tones with chalky white"

---

## 7. WHAT MAKES WARLI ART IMMEDIATELY RECOGNIZABLE

The "instant recognition" factors, in order of importance:

1. **WHITE ON DARK TERRACOTTA/BROWN**: This color scheme is so distinctive that even
   a glimpse triggers "Warli" recognition. No other major Indian art tradition uses
   this specific combination.

2. **GEOMETRIC STICK FIGURES**: The triangle-torso, dot-head, stick-limb human figure
   is unique to Warli. The bowtie/hourglass torso shape is the single most
   recognizable element.

3. **TARPA DANCE SPIRAL**: The spiral chain of connected dancing figures is the "logo"
   of Warli art. Instantly identifiable.

4. **OVERALL DENSITY & SCALE**: Many tiny figures filling the entire space creates a
   distinctive visual texture that reads as "Warli" even from a distance.

5. **FLATNESS**: Zero depth, zero shading, zero perspective. Pure 2D geometry.

6. **ROUGH LINE QUALITY**: The slightly wobbly, textured quality of bamboo-drawn lines
   distinguishes Warli from clean graphic design that merely uses similar shapes.

7. **BORDER FRAMING**: The geometric border creates a "window" effect characteristic
   of Warli compositions.

---

## 8. MODERN vs. TRADITIONAL WARLI

### What Has Changed (Contemporary/Commercial Warli):
- **Color additions**: Modern Warli sometimes uses multiple colors (red, yellow, orange,
  blue) on various background colors (black, cream, navy). This is a commercial
  adaptation for products, textiles, and home decor.
- **Smooth surfaces**: Modern Warli is often painted on paper, canvas, fabric, or
  printed digitally. This loses the mud-wall texture.
- **Clean lines**: Modern artists sometimes use fine brushes or markers, producing
  cleaner lines than the traditional bamboo stick.
- **Individual subjects**: Modern Warli sometimes depicts single figures, portraits,
  or isolated motifs rather than full scene narratives. This is a departure from
  tradition.
- **Scale shift**: Modern works sometimes feature fewer, larger figures rather than
  many tiny ones.
- **Male artists**: Traditionally women-only, now many male artists (following Jivya
  Soma Mashe) practice Warli painting.
- **Commercial products**: Warli motifs appear on clothing, bags, pottery, jewelry,
  furniture, wall decor. These often use isolated motifs rather than full compositions.

### What Purists Maintain:
- **White on natural earth-brown ONLY**: No color additions.
- **Rice paste on mud wall**: The original medium is considered sacred.
- **Ritual context**: Painting during specific ceremonies (marriage, harvest).
- **Full scene composition**: Complete life narratives, not isolated motifs.
- **Bamboo stick application**: Not brushes or markers.
- **Community subject**: Scenes of collective life, not individual portraits.
- **Horror vacui**: Filling the entire space with life and activity.
- **The three shapes only**: Circles, triangles, squares/lines.

### For Mirasi's AI Use:
The style should lean HEAVILY traditional while making the one necessary concession
of centering a single figure (for the portrait use case). Everything else — color
palette, line quality, motif vocabulary, border treatment, surrounding scene — should
be strictly traditional.

---

## 9. COMMON MISTAKES / WHAT TO AVOID (Inauthenticity Markers)

These are things that make Warli art look FAKE, COMMERCIAL, or INAUTHENTIC:

### CRITICAL ERRORS (Must Avoid):

1. **REALISTIC FACES**: The #1 mistake. If the face has eyes, nose, mouth rendered
   realistically, it is NOT Warli. The current AI outputs show this exact problem —
   the face is an illustrated portrait, not a Warli dot-circle.

2. **SHADING OR GRADIENTS**: ANY tonal variation, shadow, highlight, or gradient is
   anti-Warli. The style is FLAT. White lines on flat brown. Period.

3. **CURVED ORGANIC LINES**: Warli uses straight lines and geometric shapes. Flowing,
   curvy, organic lines (like Art Nouveau or Madhubani) are wrong. The only exceptions
   are the slight natural wobble of hand-drawing, bull horns, and serpent bodies.

4. **FILLED/SOLID FIGURES**: Human and animal figures should be OUTLINES, not solid
   white silhouettes. The terracotta background should show through inside the figure.
   (Exceptions: the head dot is filled, and some modern Warli fills the triangular torso.)

5. **MULTIPLE COLORS**: Using blue, green, yellow, red, etc. instantly marks it as
   commercial/modern, not traditional Warli.

6. **CLEAN VECTOR LINES**: Perfectly smooth, mathematically precise lines are wrong.
   Warli lines should have the hand-drawn quality of bamboo stick application.

7. **3D/PERSPECTIVE RENDERING**: Any sense of depth, vanishing point, or three-
   dimensional space is wrong. Warli is ruthlessly flat.

8. **ISOLATED MOTIFS ON BLANK BACKGROUND**: A single Warli figure floating on a
   plain background looks like clip art, not authentic Warli. The scene should be
   FULL of activity.

9. **WRONG BROWN TONE**: Using orange, bright red, cream, black, or grey as the
   background instead of the specific earth-brown/terracotta. The brown should look
   like WET RED CLAY or a TERRACOTTA POT.

10. **THICK OUTLINES ON FIGURES**: Making human figures with heavy thick outlines
    like a coloring book. Warli lines are delicate — the bamboo stick makes thin,
    wispy lines, not thick bold outlines.

### MODERATE ERRORS (Reduce Authenticity):

11. **Missing border**: Traditional Warli always has a border frame.
12. **Missing Tarpa/Chauk/central motif**: Without a recognizable central composition
    element, it looks like scattered random figures.
13. **Proportionally huge single figure**: One giant figure dominating the frame is
    not how Warli compositions work (though acceptable for portrait use case).
14. **Western/modern elements**: Cars, phones, skyscrapers mixed with Warli figures
    (unless intentionally creating modern hybrid art).
15. **Too-perfect geometry**: Mathematically perfect triangles and circles. Warli
    shapes should have hand-drawn imperfection.
16. **Blank/empty areas**: Large areas of un-decorated terracotta background feel
    incomplete by Warli standards.

---

## 10. COMPREHENSIVE PROMPT ENGINEERING GUIDELINES

### 10A. WHAT THE CURRENT PROMPT GETS WRONG

Looking at the current Mirasi prompt for `warli-art`:
```
"Completely transform this portrait into authentic Warli tribal art,
as if painted with white rice paste on a dark mud wall.
The ENTIRE image including the face must be rendered in the Warli geometric style —
simplified triangular and circular shapes, stick-figure proportions,
white line art on dark terracotta/chocolate brown background.
Surround the portrait with traditional Warli scene..."
```

**Problems identified from the test outputs**:
1. The AI interprets "portrait" as requiring a REALISTIC face rendering. Despite saying
   "Warli geometric style," the face comes out as an illustrated portrait.
2. "Stick-figure proportions" is too vague — the AI compromises with a semi-realistic
   body plus some stick-figure scaling.
3. The surrounding Warli motifs look good, but the CENTRAL SUBJECT breaks the style.
4. The terracotta background color and texture are reasonably good.
5. The motifs around the figure (dancers, sun, mountains) are decent but need to be
   denser, more numerous, and more tightly composed.

### 10B. KEY TERMS & PHRASES FOR AI PROMPTS

**Physical medium terms** (trigger texture/material rendering):
- "white rice paste painted with bamboo stick on dark red-brown mud wall"
- "chalky matte white pigment on rough laterite clay plaster"
- "hand-painted on earthen wall surface"
- "rough granular texture of dried rice paste on mud"

**Geometric/shape terms** (trigger correct figure style):
- "geometric stick figures with triangular torsos and circle dot heads"
- "hourglass/bowtie shaped human torsos made of two joined triangles"
- "NO facial features — heads are simple filled white dots/circles"
- "straight-line limbs, no curved organic forms"
- "constructed ONLY from circles, triangles, and straight lines"

**Composition terms** (trigger correct layout):
- "dense composition filled with tiny figures and motifs"
- "horror vacui — every space filled with life"
- "spiral Tarpa dance chain of connected figures"
- "central Chauk sacred square"
- "horizontal narrative bands"
- "geometric zigzag and comb-pattern border frame"

**Color terms** (trigger correct palette):
- "ONLY white on dark terracotta/chocolate brown"
- "NO other colors — strictly monochromatic white on earth-brown"
- "dark red-brown laterite mud wall background"
- "color of wet red clay or unglazed terracotta"

**Anti-terms** (explicitly forbid unwanted elements):
- "NOT realistic, NOT illustrated, NOT cartoon"
- "NO facial features, NO eyes, NO nose, NO mouth"
- "NO shading, NO gradients, NO highlights, NO 3D"
- "NO smooth clean vector lines"
- "NO colors other than white and terracotta brown"
- "NO perspective, NO depth, completely flat"

### 10C. RECOMMENDED PROMPT STRUCTURE (for portrait transformation)

**For Human Portraits:**
```
Transform this photo into PURE AUTHENTIC Warli tribal art painted with white rice
paste on a dark mud wall using a bamboo stick. The person MUST be depicted as a
Warli geometric stick figure — triangular bowtie torso, simple circle DOT for head
with NO facial features (no eyes, no nose, no mouth — just a white filled circle),
straight stick lines for arms and legs. Make the central figure slightly larger than
surrounding figures but still entirely geometric. [If preserving some identity:]
Suggest the person's distinctive features ONLY through body proportion, posture, and
a simplified geometric hair silhouette above the head dot — NOT through facial detail.

Fill the ENTIRE composition densely with traditional Warli scenes: spiral Tarpa dance
chain, Chauk sacred square, concentric-circle sun with rays, single-line trees with
dot-cluster foliage and perching birds, triangular mountains, bullock carts, farming
figures, hunting scenes, deer, horses, peacocks. Every area must contain motifs —
no empty space.

Use ONLY white on dark terracotta/chocolate brown (#8B4513). NO other colors.
NO shading. NO gradients. Completely flat. Rough textured lines as if drawn with
bamboo stick on rough mud wall — NOT clean vector art. Slight hand-drawn wobble
in all lines. Matte chalky white finish.

Frame with traditional Warli border: geometric zigzag, comb/ladder patterns, dot
rows forming a rectangular border around the entire scene.

CRITICAL: This must look like authentic indigenous tribal wall painting, NOT an
illustration with Warli decorations. Every element including the central figure
must be pure geometric abstraction.
```

**For Pet Portraits:**
```
Transform this photo into PURE AUTHENTIC Warli tribal art painted with white rice
paste on a dark mud wall. The animal MUST be depicted in the Warli geometric style —
body as a simple rectangle/triangle outline, four straight-line legs, triangle or
circle head, characteristic features suggested through geometric simplification
(pointed triangle ears for a dog, curved horn lines for a bull, branching antler
lines for a deer). The animal should be white outline on dark terracotta — NOT
a detailed realistic animal rendering.

Fill the surrounding space densely with Warli motifs: spiral Tarpa dance, trees
with birds, concentric-circle sun and moon, triangular mountains, farming scenes,
other geometric animals, bullock carts, human stick figures doing daily activities.

ONLY white on dark terracotta/chocolate brown. NO other colors. NO shading. Flat.
Rough bamboo-stick line texture. Matte chalky white. Dense composition — no empty
space. Geometric zigzag border frame.
```

---

## 11. REFERENCE DIMENSIONS & TECHNICAL SPECS

### Traditional Wall Painting Sizes:
- Small ritual paintings: 2x2 feet to 3x3 feet
- Large marriage Chauk: 4x4 feet to 6x6 feet
- Full narrative walls: Can span an entire wall (8-12 feet wide, 4-6 feet tall)

### Figure Proportions (relative):
- Human figure height: ~1/15th to 1/20th of total composition height
- Human head (dot): ~1/6th of figure height
- Torso (triangle pair): ~2/6ths of figure height
- Legs: ~3/6ths of figure height
- Arms: Extend to approximately hip level when hanging, above head when raised
- Tree height: 2-5x human figure height
- Animal (horse/bull): 1-2x human figure height
- Bird: 1/3rd to 1/2 human figure height
- Sun/Moon: 1-2x human figure height in diameter

### Recommended AI Generation Resolution:
- Square format (1:1) works well for Warli compositions
- Vertical (3:4 or 2:3) works for portrait-oriented pieces
- Minimum 1024x1024 for detail preservation
- The dense composition with many tiny figures NEEDS high resolution

---

## 12. GLOSSARY OF WARLI-SPECIFIC TERMS

| Term | Meaning |
|------|---------|
| **Tarpa** | Trumpet-like instrument; also the name of the associated spiral dance |
| **Chauk** | Sacred square motif; the central ritual painting |
| **Palaghata/Palaghat** | Fertility/mother goddess depicted inside the Chauk |
| **Geru** | Red laterite earth/clay used for the wall surface |
| **Lagna Chauk** | Marriage-specific Chauk painting |
| **Devchauk** | Chauk painted for deity worship |
| **Kansari** | Grain goddess motif |
| **Naran Dev** | Male deity figure |
| **Hirwa** | Sacred grove/forest motif |
| **Bhondla** | Ring/circle dance (similar to Tarpa but without the instrument) |
| **Gauri** | Clay figure of the goddess, placed within the Chauk during rituals |
| **Savari** | Procession scene showing figures riding horses |

---

## 13. SUMMARY: THE FIVE NON-NEGOTIABLES

For any AI output to read as "authentic Warli art," these five elements MUST be present:

1. **WHITE ON DARK TERRACOTTA BROWN** — Only these two colors. Nothing else.
2. **GEOMETRIC STICK FIGURES** — Triangle torso, dot head, stick limbs. No realistic anatomy.
3. **NO FACIAL FEATURES** — The head is a dot/circle. Period.
4. **DENSE FILLED COMPOSITION** — Many figures, many motifs, minimal empty space.
5. **ROUGH HAND-DRAWN LINE QUALITY** — Bamboo stick texture, not clean vector art.

If ALL five are present, the output will read as Warli. If ANY ONE is missing, the
output will read as "something vaguely tribal-looking" or "portrait with Warli stickers."

---

*Document compiled from art historical knowledge spanning IGNCA (Indira Gandhi National
Centre for the Arts) documentation, Tribal Research Institute publications, museum
collections from the National Museum New Delhi and Bhau Daji Lad Museum Mumbai, academic
sources on Adivasi art traditions, the work and legacy of Jivya Soma Mashe, and
ethnographic documentation of Warli tribal communities in Maharashtra.*
