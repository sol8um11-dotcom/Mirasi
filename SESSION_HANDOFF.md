# SESSION HANDOFF — Feb 2026
## "Image Quality is THE Problem — Mirasi vs Fable"

---

## THE CORE PROBLEM

**Our generation looks like a joke compared to Fable by Surrealium.**

Using the SAME input photo:
- **Fable**: Produces a fully transformed, painterly artwork — the person looks like they were painted by a master artist. Complete style transformation with stunning identity preservation.
- **Mirasi**: Just adds a necklace/accessory on the original photo. The person still looks like a photograph with decorations pasted on. NOT a real style transformation.

**This is an existential problem** — we're an Indian market app where users are already reluctant to pay. The generated image is THE product. If it doesn't look amazing, nobody buys.

---

## WHAT THE USER WANTS — THE PLAN

### Phase 1: Deep Style Foundation Research (PER STYLE)
For every P0 style, create a comprehensive "Style Foundation File" covering:
- What makes this style foundationally & aesthetically recognizable
- Every visual element that MUST be present
- What stays CONSTANT in every generation (non-negotiable elements)
- What CAN VARY (subjects, compositions, color variations)
- Edge cases and common AI failure modes
- Reference to authentic art history sources

**Status of existing foundations:**
| Style | Foundation File | Depth |
|-------|----------------|-------|
| Madhubani | `E:\Fable clone\Madhubani_Mithila_Style_Foundation.md` | DEEP (80+ pages) |
| Warli | `E:\Fable clone\chitrashala\docs\warli-art-style-foundation.md` | DEEP |
| Tanjore | `E:\Fable clone\Tanjore_Painting_Style_Foundation.md` | DEEP |
| Kerala Mural | `E:\Fable clone\chitrashala\docs\kerala-mural-style-foundation.md` | DEEP |
| Mughal Miniature | `E:\Fable clone\Mughal_Miniature_Painting_Style_Foundation.md` | DEEP |
| Rajasthani | `E:\Fable clone\Rajasthani_Miniature_Painting_Style_Foundation.md` | DEEP |
| Pichwai | NONE | MISSING |
| Mysore | NONE | MISSING |
| Pahari/Kangra | NONE | MISSING |
| Bengal School | NONE | MISSING |
| Deccani | NONE | MISSING |
| Maratha | NONE | MISSING |
| Punjab Royal | NONE | MISSING |
| Anime | NONE | MISSING |
| Bollywood Retro | NONE | MISSING |

### Phase 2: Prompt Engineering Research from UGC Platforms
Research how people get BEST results from the models we use:
- **Flux Kontext Pro** community tips (Reddit, Discord, Civitai, fal.ai community)
- **Flux Kontext LoRA** best practices
- What parameters actually produce painterly/artistic output vs. photo-with-decorations
- Guidance scale experiments that worked for others
- Prompt structures that force FULL style transformation (not just accessory addition)

### Phase 3: Fable/Surrealium Competitor Deep-Dive
Analyze HOW Fable achieves such efficient, high-quality results:
- Their before/after comparison analysis
- What model(s) they likely use
- Their approach to style transformation (full repaint vs. overlay)
- European style focus but we need to match/exceed for Indian styles

### Phase 4: Build Best Prompt + Settings Per Style × Subject Type
Once research is complete:
- Craft optimal prompt for each style × subject combination
- Tune guidance_scale, strength, inference steps per style
- Possibly need different strategies for different styles
- A/B test systematically

---

## CURRENT TECHNICAL STATE

### Models Used
- **Humans** → `fal-ai/flux-pro/kontext` (Kontext Pro) — $0.04/image
- **Pets with LoRA** → `fal-ai/flux-kontext-lora` — $0.035/MP
- **Pets without LoRA** → Falls back to Kontext Pro

### Current Parameters
```
Kontext Pro (humans):
  guidance_scale: 4.0-5.0 (per style)
  safety_tolerance: "2"
  output_format: "jpeg"
  // Does NOT accept num_inference_steps

Kontext LoRA (pets):
  guidance_scale: 4.0-5.0 (per style)
  num_inference_steps: 30
  strength: 0.88
  resolution_mode: "match_input"
  lora_scale: 1.0
```

### Trained LoRAs (3 of 15)
| Style | LoRA Trigger | Status |
|-------|-------------|--------|
| Madhubani | mrs_madhubani | Trained |
| Warli | mrs_warli | Trained |
| Tanjore | mrs_tanjore | Trained |
| All others | — | NOT TRAINED (use Pro fallback) |

### Key Prompt Engineering Findings (from V8 research)
- **Instructional verb format** works: "Transform this portrait into X"
- **Style first, identity last** — model weights early tokens more
- **Physical medium cues** help: "painted with rice paste on mud wall"
- **guidance_scale 3.5-5.0** sweet spot (below = weak style, above = face distortion)
- **No negative prompt** on Kontext Pro
- **150-300 tokens** optimal prompt length
- **Order matters**: Style → Medium → Elements → Colors → Composition → Face

### Watermark Issue
User says watermark looks VERY BAD. Current implementation:
- Repeating diagonal "mirasi" text grid + centered logo spiral
- White text with drop shadow, opacity 0.13-0.18
- File: `src/lib/image/watermark.ts`
- Needs complete redesign

---

## ALL P0 STYLES (Current Priority)

The 15 styles are grouped as:
- **Royal Heritage (10)**: Rajasthani, Maratha, Tanjore, Mysore, Punjab, Bengal, Kerala Mural, Pahari, Deccani, Miniature
- **Folk Art (3)**: Madhubani, Warli, Pichwai
- **Modern (2)**: Anime, Bollywood Retro

Current V8 prompts are in: `src/lib/fal/prompts.ts`
Style foundations summary: `docs/style-foundations.md`

---

## FILE STRUCTURE (Key Files)

```
E:\Fable clone\chitrashala\
├── src/lib/fal/
│   ├── prompts.ts          ← ALL style prompts & configs (V8)
│   └── index.ts            ← fal.ai API integration
├── src/lib/image/
│   └── watermark.ts        ← Watermark (needs redesign)
├── docs/
│   ├── style-foundations.md ← Summary of all 15 styles
│   ├── warli-art-style-foundation.md
│   └── kerala-mural-style-foundation.md
├── memory.md               ← Session state tracking

Root level (E:\Fable clone\):
├── Madhubani_Mithila_Style_Foundation.md
├── Tanjore_Painting_Style_Foundation.md
├── Mughal_Miniature_Painting_Style_Foundation.md
├── Rajasthani_Miniature_Painting_Style_Foundation.md
├── Indian_Art_Styles_Market_Research.md
└── SESSION_HANDOFF.md      ← THIS FILE
```

---

## TECH STACK SUMMARY
- **Next.js 16** + React 19 + Tailwind v4
- **Supabase** (Postgres + Auth + Storage)
- **fal.ai** (Flux Kontext Pro + Kontext LoRA)
- **Razorpay** (Indian payments, UPI)
- **Sharp** (server-side watermarking)
- **Deployed at**: https://mirasi.vercel.app/
- **PWA**: Serwist service worker

---

## WHAT THE NEXT SESSION SHOULD DO

1. **Analyze Fable's before/after images** the user will provide — understand what makes their output look like real artwork
2. **Research UGC platforms** for Flux Kontext Pro tips on achieving full painterly transformations (not photo + decorations)
3. **Create missing style foundation files** for remaining styles
4. **Identify the root cause** of why our prompts produce "photo with necklace" instead of "fully transformed artwork"
5. **Redesign the watermark** to look professional, not ugly
6. **Iterate prompts** with research-backed improvements
7. **Test systematically** — before/after comparisons for each style

---

## CRITICAL INSIGHT

The problem isn't just prompts — it might be:
- **guidance_scale too conservative** (4.0-5.0 might not force enough transformation)
- **Missing "strength" parameter** on Kontext Pro (only set on LoRA pipeline)
- **Prompt structure** not aggressive enough about FULL transformation
- **Need to study** what Fable does differently — they might use a completely different model, multi-step pipeline, or inpainting approach
- **The "identity preservation" clause at the end** might be pulling the model back toward photorealism

The user wants us to be systematic: Research → Foundation → Prompt Engineering → Build → Test. No rushing to prompts without understanding the fundamentals first.
