# Mirasi LoRA Training Guide

**Project:** Mirasi -- AI Indian Art Portrait PWA
**Target API:** fal-ai/flux-kontext-trainer
**Integration point:** `src/lib/fal/prompts.ts` (loraUrl + loraTrigger fields)
**Last updated:** February 2026

---

## Table of Contents

1. [Why LoRAs Are Needed](#1-why-loras-are-needed)
2. [Dataset Collection Strategy](#2-dataset-collection-strategy)
3. [Training Plan Per Style](#3-training-plan-per-style)
4. [fal.ai flux-kontext-trainer API Reference](#4-falai-flux-kontext-trainer-api-reference)
5. [Cost Estimate](#5-cost-estimate)
6. [Integration Into Mirasi Codebase](#6-integration-into-mirasi-codebase)
7. [Testing Protocol](#7-testing-protocol)
8. [Appendix: Style-by-Style Reference Sheet](#appendix-style-by-style-reference-sheet)

---

## 1. Why LoRAs Are Needed

### The Problem

Mirasi uses two fal.ai endpoints:

- **Kontext Pro** (`fal-ai/flux-pro/kontext`) for human portraits -- works well because the prompts describe the target style in detail and humans have consistent facial structure that the model preserves.
- **Kontext LoRA** (`fal-ai/flux-kontext-lora`) for pet portraits -- currently falls back to Kontext Pro because no LoRAs are trained yet.

When using Kontext Pro alone for pets, several problems arise:

1. **Weaker style adherence on animals.** The model was optimized for human portraits. Pet fur textures, body proportions, and poses confuse the style transfer, resulting in half-photographic, half-stylized outputs.
2. **Identity loss.** Without a LoRA anchoring the style, the model tries to simultaneously change the art style AND preserve animal features, often compromising both.
3. **Inconsistency across breeds.** A Golden Retriever might stylize well in Madhubani but a Persian cat does not, because the prompt-only approach lacks structural understanding of the target style.
4. **Folk styles are hardest hit.** Warli (geometric stick figures), Madhubani (dense pattern fill), and Kerala Mural (bold outlines + flat color) require radical departure from photorealism. Prompt engineering alone cannot force these transformations reliably on animal subjects.

### The Solution

A dedicated LoRA per style teaches the model the visual grammar of each tradition -- its line quality, color palette, pattern density, and compositional rules. Combined with the existing prompt templates and the Kontext LoRA endpoint, this produces dramatically better pet portraits.

The LoRA approach also lets us use lower inference steps for pets (30 vs 50 for humans), reducing per-image cost and latency while improving quality.

### Current Architecture (already built)

The codebase already supports LoRAs. In `src/lib/fal/prompts.ts`, each `StyleConfig` has:

```typescript
loraUrl: string | null;   // URL to trained LoRA weights (currently all null)
loraScale: number;         // Weight scale 0-4 (pre-configured per style)
loraTrigger: string | null; // Trigger word (currently all null)
```

In `src/lib/fal/index.ts`, the pet pipeline already routes to `fal-ai/flux-kontext-lora` when `loraUrl` is present:

```typescript
loras: [{ path: params.loraUrl!, scale: params.loraScale ?? 0.85 }]
```

All we need to do is train the LoRAs and paste the URLs.

---

## 2. Dataset Collection Strategy

### 2.1 Overview of the Approach

Each LoRA requires a dataset of **before/after image pairs** that teach the model what the style transformation looks like. The workflow:

1. **Collect reference images** of authentic art in each tradition (public domain sources).
2. **Collect diverse pet/animal photos** as "before" images.
3. **Use Kontext Pro to generate "after" images** -- run each pet photo through Kontext Pro with our existing prompts, then manually curate the best outputs.
4. **Augment with authentic art references** -- include some real art pieces as captioned examples.
5. **Package as a ZIP of images with captions** for the fal.ai trainer.

### 2.2 Where to Find Reference Images for Each Style

#### General Public Domain Sources

| Source | URL | What It Has |
|--------|-----|-------------|
| **Wikimedia Commons** | commons.wikimedia.org | Largest source. Search by art tradition name. Most pre-1930 Indian art is public domain. |
| **Google Arts & Culture** | artsandculture.google.com | High-res scans from partner museums. Check license per image. |
| **National Museum, New Delhi** | nationalmuseumindia.gov.in | Government collection, many images available. Miniatures, textiles, murals. |
| **Victoria & Albert Museum** | collections.vam.ac.uk | Extensive South Asian art collection. Many images CC0 or public domain. |
| **British Museum** | britishmuseum.org/collection | Large Indian miniature collection. CC BY-NC-SA 4.0 for many images. |
| **Metropolitan Museum of Art** | metmuseum.org/art/collection | Open Access program (CC0) for public domain works. Search "Indian painting". |
| **Cleveland Museum of Art** | clevelandart.org/art/collection | Open Access. Strong Indian miniature and textile collection. |
| **Los Angeles County Museum of Art** | collections.lacma.org | South Asian art department. Many open access images. |
| **Smithsonian (Freer/Sackler)** | asia.si.edu/collections | Extensive Indian and Persian miniature collection. |
| **Indian Culture Portal** | indianculture.gov.in | Government of India portal aggregating cultural content. |
| **Digital Library of India** | dli.ernet.in | Scanned historical texts with illustrated pages. |
| **Internet Archive** | archive.org | Scanned books of Indian art. Search specific traditions. |

#### Style-Specific Sources

**Rajasthani Royal (Mewar Miniature)**
- Wikimedia: Category "Mewar paintings", "Rajasthani miniature paintings"
- City Palace Museum, Udaipur digital collection
- National Museum, New Delhi -- Rajasthani miniature gallery
- Met Museum: Search "Mewar" or "Rajput painting"

**Maratha Heritage (Peshwa-era)**
- Raja Dinkar Kelkar Museum, Pune (limited digital)
- Wikimedia: "Maratha painting", "Peshwa era art"
- British Library Online Gallery: Company School paintings from Maharashtra

**Tanjore Heritage (Thanjavur)**
- Thanjavur Art Gallery (government museum)
- Wikimedia: Category "Tanjore paintings"
- V&A Museum: Search "Thanjavur"
- Government Museum, Chennai

**Mysore Palace (Wodeyar)**
- Jaganmohan Palace Art Gallery, Mysore (limited digital)
- Wikimedia: "Mysore painting"
- Karnataka State Archives

**Punjab Royal (Sikh Court)**
- Wikimedia: "Sikh painting", "Punjab Hills painting"
- Government Museum and Art Gallery, Chandigarh
- V&A: Search "Sikh" or "Punjab painting"

**Bengal Renaissance (Bengal School)**
- Wikimedia: "Bengal School of Art", "Abanindranath Tagore"
- National Gallery of Modern Art, New Delhi
- Rabindra Bharati Museum, Kolkata
- Note: Much Bengal School work is early 20th century, so verify public domain status (70 years after artist death in India).

**Kerala Mural**
- Wikimedia: "Kerala mural paintings"
- Kerala Museum, Kochi
- Mattancherry Palace murals (government heritage site)
- Padmanabhapuram Palace mural documentation

**Pahari Mountain (Kangra/Basohli)**
- Wikimedia: "Pahari painting", "Kangra painting", "Basohli painting"
- Bhuri Singh Museum, Chamba
- National Museum, New Delhi -- Pahari gallery
- Met Museum and Cleveland Museum: Search "Pahari"

**Deccani Royal (Bijapur/Golconda)**
- Wikimedia: "Deccani painting"
- Salar Jung Museum, Hyderabad (limited digital)
- British Museum: Bijapur and Golconda paintings
- V&A: Search "Deccani"

**Miniature Art (Indo-Islamic/Mughal)**
- Wikimedia: "Mughal painting" (largest category, hundreds of images)
- Met Museum Open Access: Extensive Mughal collection
- British Library: Mughal manuscripts
- Chester Beatty Library, Dublin

**Madhubani Art (Mithila)**
- Wikimedia: "Madhubani art", "Mithila painting"
- Mithila Museum (Japan) -- digital collection
- Ethnic Arts Foundation Mithila archives
- Government of Bihar cultural portals
- Note: Many contemporary Madhubani artists are alive. Use only traditional/anonymous pieces or those explicitly licensed.

**Warli Art**
- Wikimedia: "Warli painting"
- Tribal Museum, Pune
- TRIFED (Tribal Cooperative Marketing Development Federation of India)
- Adivasi art documentation projects
- Note: Traditional Warli is communal/anonymous. Safe for reference purposes.

**Pichwai Art (Nathdwara)**
- Wikimedia: "Pichwai", "Nathdwara painting"
- Nathdwara temple trust publications
- Albert Hall Museum, Jaipur
- V&A: Search "Pichwai"

**Anime Portrait**
- Not needed from museums. Use existing anime/manga style references that are openly licensed or generate synthetic examples.
- Danbooru (check license), Safebooru (SFW subset)

**Bollywood Retro**
- Wikimedia: "Hindi film posters"
- National Film Archive of India
- Film Heritage Foundation
- Note: Most vintage Bollywood posters are copyrighted. Use only pre-1958 public domain posters or generate synthetic references via Kontext Pro.

### 2.3 Creating Before/After Pairs

This is the core of the dataset. Each training example is an image pair: the "before" (a regular photo) and the "after" (the same subject in the target art style).

#### Step 1: Collect 40-50 Diverse Pet Photos

Source from:
- Unsplash, Pexels (free commercial use)
- Personal photos (with permission)
- Open Images Dataset (Google)

Aim for diversity:
- Dogs: 15+ breeds (Labrador, Pomeranian, German Shepherd, Indie, Pug, etc.)
- Cats: 10+ varieties (Persian, Indie, Siamese, tabby, etc.)
- Other: Parrot, rabbit, hamster (5-8 images for stretch coverage)
- Poses: Front-facing, side profile, sitting, lying down
- Lighting: Indoor, outdoor, studio, natural light

#### Step 2: Generate "After" Images via Kontext Pro

For each pet photo, run it through the existing Mirasi pipeline using Kontext Pro with the style's pet prompt. This can be done via the fal.ai playground or a script:

```typescript
// scripts/generate-training-pairs.ts
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

const STYLES_TO_TRAIN = ["warli-art", "madhubani-art", "tanjore-heritage"];
const PET_PHOTOS = [/* array of public URLs to pet photos */];

for (const style of STYLES_TO_TRAIN) {
  for (const photoUrl of PET_PHOTOS) {
    const result = await fal.subscribe("fal-ai/flux-pro/kontext", {
      input: {
        image_url: photoUrl,
        prompt: getStyleConfig(style).petPrompt,
        guidance_scale: getStyleConfig(style).guidanceScale,
        num_inference_steps: 50,
        output_format: "jpeg",
      },
    });
    // Save result.data.images[0].url with style + photo index naming
  }
}
```

#### Step 3: Curate Ruthlessly

Not every generated image will be good. For each style:

- Generate 40-50 images
- Manually review and keep only the best 25-35
- Reject images that: lost the pet's identity, have artifacts, mixed styles, incomplete transformation
- Aim for at least **20 strong pairs**, ideally **30**

#### Step 4: Add Authentic Art References

For each style, include 5-10 real art examples (without paired "before" images) as additional captioned training data. These anchor the LoRA to the authentic visual language.

Caption format:
```
A [style_trigger] painting of [subject description]. [Key visual characteristics].
```

Example:
```
A mrs_warli painting of two deer under a tree. White geometric stick figures on dark terracotta background, triangles and circles, rice paste texture on mud wall.
```

### 2.4 Image Quality Requirements

| Requirement | Specification |
|-------------|--------------|
| **Minimum resolution** | 1024x1024 pixels |
| **Preferred resolution** | 1024x1024 to 2048x2048 |
| **Format** | JPEG or PNG |
| **Compression** | No visible artifacts. JPEG quality >= 90. |
| **Aspect ratio** | Square (1:1) preferred. The trainer will center-crop non-square images. |
| **Color space** | sRGB |
| **File size** | Under 10 MB per image |
| **No watermarks** | Training images must be clean -- no watermarks, logos, or text overlays |
| **Consistent framing** | Subject should be centered and fill 60-80% of the frame |

### 2.5 Dataset Packaging

The fal.ai trainer expects a ZIP file uploaded to a URL. Structure:

```
warli-art-dataset.zip
  image_001.jpg
  image_002.jpg
  ...
  image_030.jpg
```

Captions can be provided as `.txt` files with matching names, or via the API's `captions` parameter. Matching `.txt` sidecar files are the most common approach:

```
warli-art-dataset.zip
  image_001.jpg
  image_001.txt    # "A mrs_warli painting of a golden retriever..."
  image_002.jpg
  image_002.txt
  ...
```

---

## 3. Training Plan Per Style

### 3.1 Priority Order

Train the most visually distinctive styles first -- these benefit most from LoRAs because their visual language diverges furthest from photorealism.

| Priority | Style | Slug | Rationale |
|----------|-------|------|-----------|
| **P0 -- Train First** | Warli Art | `warli-art` | Most abstract. Geometric stick figures on terracotta. Prompt-only approach fails frequently. |
| **P0** | Madhubani Art | `madhubani-art` | Dense pattern fill, bold outlines. Needs LoRA to achieve consistent pattern density. |
| **P0** | Tanjore Heritage | `tanjore-heritage` | Gold leaf texture, gem-studded details. Unique material quality needs learned representation. |
| **P1 -- Train Second** | Kerala Mural | `kerala-mural` | Bold outlines, flat Panchavarna colors. Distinctive enough to benefit strongly from LoRA. |
| **P1** | Pichwai Art | `pichwai-art` | Intricate lotus patterns, dark backgrounds. Pattern complexity benefits from LoRA. |
| **P1** | Bollywood Retro | `bollywood-retro` | Hand-painted poster aesthetic. Specific texture and composition language. |
| **P2 -- Train Third** | Rajasthani Royal | `rajasthani-royal` | Miniature style with specific flat perspective. Already decent with prompts. |
| **P2** | Pahari Mountain | `pahari-mountain` | Kangra soft pastels. Subtler style, prompts work reasonably well. |
| **P2** | Bengal Renaissance | `bengal-renaissance` | Watercolor wash. Lower guidance already helps. LoRA refines. |
| **P2** | Maratha Heritage | `maratha-heritage` | Similar to Rajasthani but bolder. Moderate LoRA benefit. |
| **P3 -- Train Last** | Mysore Palace | `mysore-palace` | Subtle gold tones. Close to general miniature. Lowest marginal gain. |
| **P3** | Punjab Royal | `punjab-royal` | Vibrant court paintings. Prompts work adequately. |
| **P3** | Deccani Royal | `deccani-royal` | Persian-influenced. Prompts capture the fusion well. |
| **P3** | Miniature Art | `miniature-art` | General Indo-Islamic. Broadest category, hardest to pin down with LoRA. |
| **P3** | Anime Portrait | `anime-portrait` | Already strong prompt-based performance. Many existing anime LoRAs available. |

### 3.2 Trigger Word Convention

All Mirasi LoRAs use the prefix `mrs_` (short for "mirasi") followed by the style's short identifier:

| Style | Trigger Word |
|-------|-------------|
| Warli Art | `mrs_warli` |
| Madhubani Art | `mrs_madhubani` |
| Tanjore Heritage | `mrs_tanjore` |
| Kerala Mural | `mrs_kerala` |
| Pichwai Art | `mrs_pichwai` |
| Bollywood Retro | `mrs_bollywood` |
| Rajasthani Royal | `mrs_rajasthani` |
| Pahari Mountain | `mrs_pahari` |
| Bengal Renaissance | `mrs_bengal` |
| Maratha Heritage | `mrs_maratha` |
| Mysore Palace | `mrs_mysore` |
| Punjab Royal | `mrs_punjab` |
| Deccani Royal | `mrs_deccani` |
| Miniature Art | `mrs_miniature` |
| Anime Portrait | `mrs_anime` |

The trigger word is prepended to the prompt automatically in `buildPrompt()`:
```typescript
if (subjectType === "pet" && config.loraTrigger) {
  return `${config.loraTrigger} style. ${basePrompt}`;
}
```

### 3.3 Recommended Training Parameters

#### Bold/Abstract Styles (Warli, Madhubani, Kerala Mural)

These styles require the model to learn a fundamentally different visual representation. They need fewer steps because the style signal is strong and unambiguous.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Steps** | 800-1000 | Bold styles converge quickly. Over-training causes loss of subject identity. |
| **Learning rate** | 1e-4 (0.0001) | Default. Works well for style LoRAs. |
| **LoRA rank** | 16 | Good balance of expressiveness vs. file size for distinct styles. |
| **Dataset size** | 20-25 pairs | Sufficient for high-contrast styles. |
| **Resolution** | 1024 | Matches our generation output size. |

#### Ornate/Detailed Styles (Tanjore, Pichwai, Rajasthani, Deccani, Miniature)

These styles have complex visual detail (gold leaf, intricate patterns, specific border designs) that requires more training to internalize.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Steps** | 1000-1200 | More detail to learn. Needs extra steps to capture ornamentation. |
| **Learning rate** | 1e-4 (0.0001) | Default. |
| **LoRA rank** | 16-32 | Consider rank 32 for the most intricate styles (Tanjore, Pichwai). |
| **Dataset size** | 25-30 pairs | More examples needed for nuanced detail. |
| **Resolution** | 1024 | Standard. |

#### Subtle/Soft Styles (Bengal, Pahari, Mysore)

These styles are closer to photorealism and use soft washes, muted tones, and gentle brushwork. They need more training to learn the subtle differences.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Steps** | 1000-1500 | Subtle styles need more steps to differentiate from base model. |
| **Learning rate** | 8e-5 (0.00008) | Slightly lower to prevent overshooting the subtle style target. |
| **LoRA rank** | 16 | Rank 16 is sufficient for style shifts close to the base. |
| **Dataset size** | 25-30 pairs | More variety helps the model generalize the subtle aesthetic. |
| **Resolution** | 1024 | Standard. |

#### Modern Styles (Anime, Bollywood Retro)

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| **Steps** | 800-1000 | Well-represented aesthetics in base model. LoRA just needs to dial in specifics. |
| **Learning rate** | 1e-4 | Default. |
| **LoRA rank** | 16 | Standard. |
| **Dataset size** | 20-25 pairs | Fewer needed since base model already knows these aesthetics. |
| **Resolution** | 1024 | Standard. |

---

## 4. fal.ai flux-kontext-trainer API Reference

### Endpoint

```
fal-ai/flux-kontext-trainer
```

### Input Schema

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `images_data_url` | string | Yes | -- | URL to a ZIP file containing training images (and optional caption .txt files). Must be publicly accessible or a fal.ai storage URL. |
| `trigger_word` | string | Yes | -- | The trigger word for the LoRA (e.g., `mrs_warli`). Will be used in captions. |
| `steps` | integer | No | 1000 | Number of training steps. Range: 100-10000. |
| `learning_rate` | float | No | 0.0001 | Learning rate for LoRA training. |
| `rank` | integer | No | 16 | LoRA rank (dimensionality). Higher = more expressive but larger file. Common values: 4, 8, 16, 32. |
| `batch_size` | integer | No | 1 | Training batch size. Keep at 1 for small datasets. |
| `resolution` | string | No | "1024" | Training resolution. Options: "512", "768", "1024". |
| `autocaption` | boolean | No | true | Auto-generate captions for images that lack .txt sidecar files. |
| `seed` | integer | No | random | Random seed for reproducibility. |

### Output Schema

| Field | Type | Description |
|-------|------|-------------|
| `diffusers_lora_file` | object | The trained LoRA weights file. Contains `url` (string) and `file_name` (string). |
| `config_file` | object | Training config for reference. Contains `url` and `file_name`. |

The `diffusers_lora_file.url` is what gets pasted into `loraUrl` in the style config.

### Submitting a Training Job

```typescript
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY! });

const result = await fal.subscribe("fal-ai/flux-kontext-trainer", {
  input: {
    images_data_url: "https://storage.fal.ai/your-dataset.zip",
    trigger_word: "mrs_warli",
    steps: 1000,
    learning_rate: 0.0001,
    rank: 16,
    resolution: "1024",
    autocaption: false,  // We provide our own captions
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      console.log(`Training: ${update.logs?.slice(-1)[0]?.message}`);
    }
  },
});

console.log("LoRA URL:", result.data.diffusers_lora_file.url);
```

### Uploading the Dataset ZIP

Before training, upload the dataset ZIP to fal.ai storage:

```typescript
import { fal } from "@fal-ai/client";
import fs from "fs";

const file = new File(
  [fs.readFileSync("./datasets/warli-art-dataset.zip")],
  "warli-art-dataset.zip",
  { type: "application/zip" }
);

const uploadedUrl = await fal.storage.upload(file);
console.log("Dataset URL:", uploadedUrl);
// Use this URL as images_data_url in the training call
```

### Pricing

fal.ai charges for Flux LoRA training based on step count:

| Item | Cost |
|------|------|
| Training | Approximately $2.50 per 1000 steps |
| Minimum charge | ~$0.50 per training run |
| Storage | Trained LoRA files hosted on fal.ai CDN at no extra cost |

Note: Pricing may change. Check fal.ai/pricing for current rates. The Kontext-specific trainer may differ slightly from the standard Flux trainer pricing.

---

## 5. Cost Estimate

### Dataset Generation (One-Time)

Using Kontext Pro to generate the "after" images for training pairs:

| Item | Calculation | Cost |
|------|-------------|------|
| Images per style | 40 generated, ~30 kept | |
| Cost per image (Kontext Pro) | $0.04 | |
| Images across 15 styles | 40 x 15 = 600 images | |
| **Dataset generation total** | 600 x $0.04 | **$24.00** |

### LoRA Training (One-Time)

| Priority | Styles | Avg Steps | Cost per Style | Subtotal |
|----------|--------|-----------|----------------|----------|
| P0 (3 styles) | Warli, Madhubani, Tanjore | 1000 | $2.50 | $7.50 |
| P1 (3 styles) | Kerala, Pichwai, Bollywood | 1000 | $2.50 | $7.50 |
| P2 (4 styles) | Rajasthani, Pahari, Bengal, Maratha | 1200 | $3.00 | $12.00 |
| P3 (5 styles) | Mysore, Punjab, Deccani, Miniature, Anime | 1000 | $2.50 | $12.50 |
| **Training total** | 15 styles | | | **$39.50** |

### Re-Training Budget

Assume 30% of styles need a second training iteration after quality review:

| Item | Calculation | Cost |
|------|-------------|------|
| Re-trains | 5 styles x $2.75 avg | $13.75 |
| Additional dataset images | 50 x $0.04 | $2.00 |
| **Re-training budget** | | **$15.75** |

### Total Budget

| Category | Cost |
|----------|------|
| Dataset generation | $24.00 |
| LoRA training (15 styles) | $39.50 |
| Re-training buffer (30%) | $15.75 |
| **Grand total** | **$79.25** |

This is a one-time cost. Trained LoRAs are reused for every generation thereafter. Per-image inference cost with LoRA is approximately $0.035/megapixel (slightly cheaper than Kontext Pro at $0.04/image).

---

## 6. Integration Into Mirasi Codebase

### 6.1 Updating Style Configs

Once a LoRA is trained, you get a URL like:

```
https://v3.fal.media/files/abc/xyz123/warli_lora_weights.safetensors
```

Update the style config in `src/lib/fal/prompts.ts`:

```typescript
// BEFORE
"warli-art": {
  guidanceScale: 5.5,
  numInferenceSteps: 50,
  loraUrl: null,           // <-- null = pets use Kontext Pro fallback
  loraScale: 0.9,
  loraTrigger: null,       // <-- null = no trigger word
  humanPrompt: "...",
  petPrompt: "...",
},

// AFTER
"warli-art": {
  guidanceScale: 5.5,
  numInferenceSteps: 30,   // <-- Reduced for LoRA pipeline (faster + cheaper)
  loraUrl: "https://v3.fal.media/files/abc/xyz123/warli_lora_weights.safetensors",
  loraScale: 0.9,
  loraTrigger: "mrs_warli",
  humanPrompt: "...",       // <-- Unchanged, humans still use Kontext Pro
  petPrompt: "...",         // <-- May optionally simplify since LoRA carries style
},
```

### 6.2 How the Pipeline Routes Automatically

No other code changes are needed. The existing logic in `src/lib/fal/index.ts` already handles the routing:

```typescript
// submitGeneration() checks:
const useLora = params.subjectType === "pet" && params.loraUrl;

if (useLora) {
  // Routes to fal-ai/flux-kontext-lora with LoRA weights
} else {
  // Routes to fal-ai/flux-pro/kontext (Kontext Pro)
}
```

And `buildPrompt()` in `prompts.ts` already prepends the trigger word:

```typescript
if (subjectType === "pet" && config.loraTrigger) {
  return `${config.loraTrigger} style. ${basePrompt}`;
}
```

### 6.3 Recommended loraScale Values

The `loraScale` controls how strongly the LoRA influences generation. Already pre-configured in the style configs:

| Style Category | loraScale | Rationale |
|---------------|-----------|-----------|
| Folk (Warli, Madhubani) | 0.90 | High influence needed for abstract styles |
| Most Royal & Pichwai | 0.85 | Standard influence for detailed traditional styles |
| Bengal, Pahari, Mysore | 0.80 | Lower influence to preserve soft subtlety |
| Anime, Bollywood | 0.85 | Standard |

After training, fine-tune these values by running test generations at 0.7, 0.8, 0.85, 0.9, and 1.0, then picking the sweet spot.

### 6.4 Pet Inference Steps Reduction

With LoRAs, pet inference steps can be reduced from 50 to 28-35 (the LoRA provides structural guidance that the model would otherwise need extra steps to hallucinate from the prompt alone):

| Style Type | Current Steps | With LoRA |
|------------|--------------|-----------|
| Bold folk | 50 | 28-30 |
| Ornate royal | 50 | 32-35 |
| Subtle styles | 50 | 30-35 |

Update `numInferenceSteps` in the style config when enabling each LoRA.

---

## 7. Testing Protocol

### 7.1 Test Dataset

Maintain a fixed test set of 10 pet photos that are NEVER used in training:

| # | Subject | Breed/Type | Pose | Notes |
|---|---------|-----------|------|-------|
| 1 | Dog | Labrador (golden) | Front-facing | Common Indian pet |
| 2 | Dog | Indie/Pariah | Side profile | Most common Indian breed |
| 3 | Dog | Pomeranian | Sitting | Small breed test |
| 4 | Dog | German Shepherd | Standing | Large breed test |
| 5 | Cat | Persian (white) | Front-facing | Light fur test |
| 6 | Cat | Indie (tabby) | Lying down | Common Indian cat |
| 7 | Cat | Black cat | Sitting | Dark fur test |
| 8 | Parrot | Indian Ringneck | Perched | Non-mammal test |
| 9 | Dog | Pug | Close-up face | Flat face test |
| 10 | Dog | Indie (dark) | Outdoor, natural light | Challenging lighting |

### 7.2 Evaluation Criteria

Score each test output on a 1-5 scale across four dimensions:

**Style Fidelity (SF)** -- Does it look like authentic art from that tradition?
- 5: Indistinguishable from hand-curated examples
- 4: Clearly in the right tradition with minor inconsistencies
- 3: Right general direction but missing key characteristics
- 2: Vaguely stylized but not clearly the target tradition
- 1: Looks like a generic filter or wrong style

**Subject Identity (SI)** -- Can you recognize the specific animal?
- 5: Instantly recognizable, breed and unique markings preserved
- 4: Breed clearly correct, most features preserved
- 3: General animal type correct, some features lost
- 2: Hard to tell breed, significant feature loss
- 1: Unrecognizable or wrong animal

**Technical Quality (TQ)** -- Is the image well-formed?
- 5: No artifacts, clean composition, proper framing
- 4: Minor imperfections that most users would not notice
- 3: Noticeable artifacts or composition issues
- 2: Significant quality problems
- 1: Broken/unusable output

**Overall Appeal (OA)** -- Would a customer be happy to purchase this?
- 5: Would enthusiastically share on social media
- 4: Satisfied customer, would consider buying
- 3: Acceptable but not exciting
- 2: Disappointing, would request refund
- 1: Unacceptable

### 7.3 Pass/Fail Thresholds

| Metric | Minimum to Ship | Target |
|--------|-----------------|--------|
| Average SF across test set | >= 3.5 | >= 4.0 |
| Average SI across test set | >= 3.5 | >= 4.0 |
| Average TQ across test set | >= 4.0 | >= 4.5 |
| Average OA across test set | >= 3.5 | >= 4.0 |
| No single image below | 2 in any dimension | 3 in any dimension |

### 7.4 A/B Comparison

For each test image, generate both:
- **Control:** Kontext Pro with existing pet prompt (no LoRA)
- **Treatment:** Kontext LoRA with trained weights

Create a side-by-side comparison grid. The LoRA version should score meaningfully higher on Style Fidelity while maintaining comparable Subject Identity.

### 7.5 Testing Script

```typescript
// scripts/test-lora.ts
import { fal } from "@fal-ai/client";
import { getStyleConfig, buildPrompt } from "../src/lib/fal/prompts";

const TEST_PHOTOS = [
  "https://example.com/test/labrador.jpg",
  "https://example.com/test/indie-dog.jpg",
  // ... all 10 test photos
];

const STYLE = "warli-art";
const config = getStyleConfig(STYLE);

for (const photo of TEST_PHOTOS) {
  // Control: Kontext Pro (no LoRA)
  const controlResult = await fal.subscribe("fal-ai/flux-pro/kontext", {
    input: {
      image_url: photo,
      prompt: buildPrompt(STYLE, "pet"),
      guidance_scale: config.guidanceScale,
      num_inference_steps: 50,
      output_format: "jpeg",
    },
  });

  // Treatment: Kontext LoRA
  const loraResult = await fal.subscribe("fal-ai/flux-kontext-lora", {
    input: {
      image_url: photo,
      prompt: `${config.loraTrigger} style. ${config.petPrompt}`,
      loras: [{ path: config.loraUrl!, scale: config.loraScale }],
      guidance_scale: config.guidanceScale,
      num_inference_steps: 30,
      output_format: "jpeg",
    },
  });

  // Save both for side-by-side comparison
  console.log(`Control: ${controlResult.data.images[0].url}`);
  console.log(`LoRA:    ${loraResult.data.images[0].url}`);
}
```

### 7.6 Iteration Protocol

If a style fails testing:

1. **Low Style Fidelity (< 3.5):**
   - Increase training steps by 200-300
   - Add more authentic art references to the dataset
   - Increase LoRA rank to 32
   - Review dataset for low-quality or off-style examples

2. **Low Subject Identity (< 3.5):**
   - Decrease `loraScale` by 0.05-0.10
   - Reduce training steps by 100-200 (may be overfit)
   - Ensure dataset has diverse subjects, not just one breed

3. **Low Technical Quality (< 4.0):**
   - Check dataset for compression artifacts
   - Ensure all training images are >= 1024x1024
   - Try different seed values
   - Increase inference steps by 5-10

4. **Re-train if needed** -- budget allows 5 re-training runs (see cost estimate above).

---

## Appendix: Style-by-Style Reference Sheet

Quick reference for all 15 styles with training parameters and key visual markers.

| # | Style | Slug | Trigger | Steps | LR | Rank | Scale | Key Visual Markers |
|---|-------|------|---------|-------|-----|------|-------|--------------------|
| 1 | Rajasthani Royal | `rajasthani-royal` | `mrs_rajasthani` | 1100 | 1e-4 | 16 | 0.85 | Flat perspective, golden borders, jewel tones, jali patterns |
| 2 | Maratha Heritage | `maratha-heritage` | `mrs_maratha` | 1100 | 1e-4 | 16 | 0.85 | Maroon/gold palette, fort ramparts, strong outlines |
| 3 | Tanjore Heritage | `tanjore-heritage` | `mrs_tanjore` | 1200 | 1e-4 | 32 | 0.85 | Gold leaf, gem-studded, semi-raised surface, temple arch |
| 4 | Mysore Palace | `mysore-palace` | `mrs_mysore` | 1000 | 8e-5 | 16 | 0.80 | Muted gold, deep green, carved pillars, thin gold lines |
| 5 | Punjab Royal | `punjab-royal` | `mrs_punjab` | 1000 | 1e-4 | 16 | 0.85 | Vibrant colors, embroidery patterns, darbar hall, marble |
| 6 | Bengal Renaissance | `bengal-renaissance` | `mrs_bengal` | 1200 | 8e-5 | 16 | 0.80 | Soft watercolor wash, muted earth tones, golden undertones |
| 7 | Kerala Mural | `kerala-mural` | `mrs_kerala` | 900 | 1e-4 | 16 | 0.90 | Bold black outlines, 5 colors (ochre/red/green/blue/white) |
| 8 | Pahari Mountain | `pahari-mountain` | `mrs_pahari` | 1200 | 8e-5 | 16 | 0.80 | Soft pastels, Himalayan landscape, flowering trees, floral border |
| 9 | Deccani Royal | `deccani-royal` | `mrs_deccani` | 1000 | 1e-4 | 16 | 0.85 | Persian-Indian fusion, Islamic arches, geometric tiles, gold |
| 10 | Miniature Art | `miniature-art` | `mrs_miniature` | 1000 | 1e-4 | 16 | 0.85 | Arabesque border, palace garden, cypress trees, gold leaf |
| 11 | Madhubani Art | `madhubani-art` | `mrs_madhubani` | 900 | 1e-4 | 16 | 0.90 | Bold black outlines, dense pattern fill, primary colors, no empty space |
| 12 | Warli Art | `warli-art` | `mrs_warli` | 800 | 1e-4 | 16 | 0.90 | White stick figures on terracotta, circles/triangles/lines |
| 13 | Pichwai Art | `pichwai-art` | `mrs_pichwai` | 1100 | 1e-4 | 32 | 0.85 | Lotus patterns, dark blue/black background, gold accents, cow motifs |
| 14 | Anime Portrait | `anime-portrait` | `mrs_anime` | 800 | 1e-4 | 16 | 0.85 | Large eyes, cel-shading, clean linework, vibrant saturated colors |
| 15 | Bollywood Retro | `bollywood-retro` | `mrs_bollywood` | 900 | 1e-4 | 16 | 0.85 | Hand-painted brush texture, dramatic lighting, 1970s poster layout |

---

## Execution Checklist

- [ ] **Phase 1: Dataset Prep (Week 1-2)**
  - [ ] Collect 40-50 diverse pet photos (Unsplash/Pexels, cleared for commercial use)
  - [ ] Download 5-10 authentic reference images per style from museum sources
  - [ ] Write `scripts/generate-training-pairs.ts`
  - [ ] Generate P0 datasets (Warli, Madhubani, Tanjore)
  - [ ] Manually curate outputs -- keep best 25-30 per style
  - [ ] Write captions for all training images
  - [ ] Package into ZIPs, upload to fal.ai storage

- [ ] **Phase 2: P0 Training (Week 2)**
  - [ ] Train Warli LoRA (800 steps, rank 16)
  - [ ] Train Madhubani LoRA (900 steps, rank 16)
  - [ ] Train Tanjore LoRA (1200 steps, rank 32)
  - [ ] Run test suite against all 10 test photos
  - [ ] Score and evaluate, iterate if needed

- [ ] **Phase 3: P0 Integration (Week 2-3)**
  - [ ] Update `prompts.ts` with LoRA URLs and trigger words
  - [ ] Adjust `numInferenceSteps` for pet pipeline
  - [ ] Deploy to staging, test end-to-end with real uploads
  - [ ] Validate watermarking and payment flow still work

- [ ] **Phase 4: P1 Training (Week 3)**
  - [ ] Generate datasets for Kerala Mural, Pichwai, Bollywood Retro
  - [ ] Train all three, test, iterate

- [ ] **Phase 5: P2 Training (Week 3-4)**
  - [ ] Generate datasets for Rajasthani, Pahari, Bengal, Maratha
  - [ ] Train all four, test, iterate

- [ ] **Phase 6: P3 Training (Week 4)**
  - [ ] Generate datasets for remaining 5 styles
  - [ ] Train, test, iterate
  - [ ] Final integration pass -- all 15 styles enabled

- [ ] **Phase 7: Production Validation (Week 4-5)**
  - [ ] Full regression test across all 15 styles x 10 test photos
  - [ ] Verify pricing and latency are acceptable
  - [ ] Deploy to production
  - [ ] Monitor first 100 real user generations for quality
