# CRITICAL RESEARCH FINDINGS — Feb 2026
## Why Our Output Looks Like Garbage & What To Do About It

---

## FINDING #1: FLUX KONTEXT PRO IS THE WRONG TOOL FOR FULL STYLE TRANSFER

**This is the root cause of our "photo with necklace" problem.**

Flux Kontext Pro uses **sequence concatenation** — it converts the input image to tokens and concatenates them with output tokens. This gives the model strong context about the original image, which is **great for editing** (changing a shirt color, adding glasses) but **actively works AGAINST full transformation**. The model is architecturally designed to PRESERVE the input image's photographic qualities.

Evidence:
- Replicate's model comparison rated Kontext Pro BELOW other models for oil painting style transfer — producing "painterly, unblended look" with "noticeable yellow tint"
- HuggingFace users report Kontext "has almost no artistic or pose understanding whatsoever"
- Community consensus: Kontext = editing tool, NOT a style transfer tool
- There is **NO `strength` / `denoise` parameter** on Kontext Pro — we literally cannot control how much transformation happens
- The "Kontinuous Kontext" research paper (arXiv 2510.08532) explicitly identifies this as a known architectural limitation

**Bottom line**: No amount of prompt engineering will fix this. We're using a screwdriver to hammer nails.

---

## FINDING #2: WHAT FABLE LIKELY USES

Fable (Surrealium) is deliberately opaque about their tech but analysis suggests:

- **Base model**: Almost certainly Flux or SDXL (only models capable of that output quality)
- **Identity preservation**: Likely IP-Adapter or similar face embedding approach
- **Style application**: Fine-tuned LoRAs trained on curated painting datasets per style
- **Key difference**: They probably use a **full img2img pipeline with high denoise** (0.7-0.85) — meaning the model regenerates the ENTIRE image, not edits it
- **Why their output looks like real art**: At denoise 0.7+, the model creates a completely new image that happens to preserve composition. Combined with a painting LoRA, every pixel is "repainted"
- Fable is **pet-first** — their "human engine" is announced for 2026, meaning human portrait transformation is harder for them too
- They charge $19/digital, $89+/print (premium positioning)
- 4.6/5 on Trustpilot (194 reviews), customer acquisition primarily through paid social ads

---

## FINDING #3: THE APPROACHES THAT ACTUALLY WORK (Ranked)

### OPTION A: fal.ai Flux Dev img2img (EASIEST FIX — Available on fal.ai right now)
**Endpoint**: `fal-ai/flux/dev/image-to-image`
- Has a proper `strength` parameter (0.0-1.0)
- At `strength: 0.85-0.95` = heavy transformation while keeping composition
- Combined with detailed painting prompt → full repaint
- **This is available TODAY on fal.ai** — we can switch immediately
- Cost: Similar to Kontext Pro
- Trade-off: Less identity preservation than Kontext (face may drift). May need face restoration step.

### OPTION B: Multi-Step Pipeline (BEST QUALITY)
```
Source Photo
    → [ControlNet preprocessor] → Extract pose/depth
    → [Flux/SDXL + Painting LoRA + ControlNet] → Generate painting
    → [PuLID / InstantID / Face Restore] → Re-inject face identity
    → [Inpainting] → Blend face into painting
    → [Upscaler] → Print quality
```
- This is what produces Fable-quality results
- More complex, more expensive per generation
- Requires self-hosting or ComfyUI API (not simple fal.ai call)

### OPTION C: ByteDance USO (NEWEST — August 2025)
- Built on FLUX.1-dev, explicitly designed for "style + subject unified generation"
- Separates content from style, applies both
- Open source (weights + training code available)
- Specifically designed for "portrait stylization while maintaining facial features"
- Very new — may not be production-ready yet

### OPTION D: Flux Kontext Pro with EXTREME Prompting (CHEAPEST FIX)
If we must stay on Kontext Pro:
- Set `guidance_scale: 7.0` (current 4.0-5.0 is too conservative)
- Use exhaustively detailed prompts: "Replace ALL photographic qualities with thick brushstrokes..."
- Run **2-3 iterative passes** (BFL officially recommends this for dramatic changes)
- Explicitly state what to REMOVE: "no photographic elements should remain"
- Try experimentally passing `strength: 0.9` — API may silently accept it even if undocumented

### OPTION E: Flux Kontext Max
- fal.ai has a Kontext Max endpoint with `image_prompt_strength` parameter (0-1, default 0.1)
- This may give us the transformation control Kontext Pro lacks
- Worth testing immediately

### OPTION F: SDXL + Painting LoRA + ControlNet + InstantID (GOLD STANDARD for painting quality)
- SDXL has the best painting LoRA ecosystem (ClassipeintXL, etc.)
- ControlNet preserves composition
- InstantID preserves face identity
- Produces the most convincing oil-painting textures
- Runs on 8GB+ VRAM, fastest inference
- Requires self-hosting

---

## FINDING #4: COMPARISON TABLE

| Approach | Painting Depth | Identity | Complexity | Cost/Image | Available Now? |
|----------|---------------|----------|------------|-----------|----------------|
| **Kontext Pro (current)** | LOW (edits, not transforms) | HIGH | Low | $0.04 | Yes (what we use) |
| **Flux Dev img2img** | HIGH (full repaint) | MEDIUM (needs help) | Low | ~$0.04 | Yes (fal.ai) |
| **Kontext Max** | MEDIUM-HIGH? | HIGH | Low | Higher | Yes (fal.ai) |
| **Multi-step pipeline** | HIGHEST | HIGH | HIGH | $0.10-0.20 | Needs engineering |
| **USO** | HIGH | HIGH | Medium | Self-host | Available but new |
| **SDXL pipeline** | HIGHEST | HIGH (with InstantID) | Medium | Self-host | Mature ecosystem |

---

## FINDING #5: KEY PROMPT ENGINEERING INSIGHTS

From BFL's official guide + community testing:

1. **"Transform" is the key verb** — signals complete change
2. **Style description FIRST, identity LAST** — model weights early tokens more
3. **Physical medium cues trigger stronger rendering**: "painted with oil pigments on stretched linen canvas"
4. **Explicitly state what to REMOVE**: "No photographic elements should remain — every pixel should appear hand-painted"
5. **Name specific artists/movements**: "in the style of Rembrandt's late portraits" vs. "oil painting style"
6. **Describe TEXTURE obsessively**: "thick visible brushstrokes, impasto texture, canvas grain, paint layering"
7. **guidance_scale 7.0** for maximum transformation (default 3.5 is too conservative)
8. **Iterative passes**: BFL officially recommends multi-step for dramatic changes
9. **150-300 tokens** optimal prompt length
10. **Prompt order**: [Full transformation instruction] → [Medium/material] → [Visual elements] → [Colors] → [Composition] → [Face preservation]

---

## RECOMMENDED ACTION PLAN

### Immediate (Today):
1. **Test Flux Dev img2img** (`fal-ai/flux/dev/image-to-image`) with `strength: 0.85` and detailed painting prompts — this is the fastest path to "real artwork" output
2. **Test Kontext Max** with `image_prompt_strength` parameter
3. **Test Kontext Pro at guidance_scale 7.0** with extreme transformation prompts

### Short-term (This Week):
4. Compare results from all 3 approaches
5. If Flux Dev img2img works → add face restoration step (PuLID or simple face-blend)
6. Rewrite all prompts with the new format (REMOVE photographic qualities explicitly)

### Medium-term:
7. Evaluate USO (ByteDance) for potential future pipeline
8. Consider multi-step pipeline if single-model results aren't good enough
9. Train style-specific LoRAs for Indian art styles on Flux Dev (not just Kontext LoRA)

---

## KEY LORAS FOR PAINTING STYLES (If we switch to Flux Dev or SDXL)

- **ClassipeintXL** (SDXL) — Most consistent oil painting LoRA
- **Oil Painting Renaissance** (Flux) — Trained on Renaissance paintings
- **Classic Oil Painting CE v3** (Flux + SDXL) — Cross-platform
- **Portrait Study** (Flux) — Portrait-specific oil painting
- **Realistic Oil Paintings** (Flux DoRA) — Includes ComfyUI workflow

---

## SOURCES

- fal.ai Flux Kontext Pro: https://fal.ai/models/fal-ai/flux-pro/kontext
- fal.ai Flux Dev img2img: https://fal.ai/models/fal-ai/flux/dev/image-to-image
- fal.ai Kontext Max: https://fal.ai/models/fal-ai/flux-pro/kontext/max/api
- BFL Prompting Guide: https://docs.bfl.ai/guides/prompting_guide_kontext_i2i
- Kontinuous Kontext paper: https://arxiv.org/html/2510.08532v1
- ByteDance USO: https://github.com/bytedance/USO
- Replicate model comparison: https://replicate.com/blog/compare-image-editing-models
- HuggingFace Kontext discussions: #17, #53
- Civitai ClassipeintXL: https://civitai.com/models/127139
