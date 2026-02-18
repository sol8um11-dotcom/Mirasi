# Mirasi Session Memory — Last Updated Feb 2026

## Where We Left Off

### Current State: QUALITY CRISIS — Root Cause IDENTIFIED

**ROOT CAUSE FOUND**: Flux Kontext Pro is an IMAGE EDITING model, not a STYLE TRANSFER model. It's architecturally designed to preserve the input photo — that's why we get "photo with necklace" instead of "fully painted artwork." No amount of prompt engineering can fix a fundamental model limitation.

### THE FIX — Model Switch Required
**READ: `docs/CRITICAL_RESEARCH_FINDINGS.md`** for full research with sources.

**Immediate options to test:**
1. **`fal-ai/flux/dev/image-to-image`** with `strength: 0.85` — full repaint with composition preservation (available NOW on fal.ai)
2. **`fal-ai/flux-pro/kontext/max`** — has `image_prompt_strength` parameter (0-1) that Kontext Pro lacks
3. **Kontext Pro at `guidance_scale: 7.0`** with extreme prompts + iterative passes (cheapest fix)
4. **Multi-step pipeline**: Generate painting → face-swap identity back → blend

### Fable Competitor Analysis (Complete)
- Pet-first, human engine coming 2026
- Likely uses Flux/SDXL + IP-Adapter + style LoRAs + high denoise img2img
- $19 digital, $89+ prints
- 4.6/5 Trustpilot (194 reviews)
- Premium branding (Swedish fortress atelier), paid social ads acquisition
- Full analysis in `docs/CRITICAL_RESEARCH_FINDINGS.md`

### User's Systematic Plan
1. Deep style foundation research per style ← 6 of 15 DONE
2. UGC platform research on prompt engineering ← DONE (see CRITICAL_RESEARCH_FINDINGS.md)
3. Fable competitor deep-dive ← DONE
4. Build best prompt + settings per style × subject ← NEXT: must switch models first

### Style Foundation Files Status
**COMPLETE (6 of 15)**:
- Madhubani: `E:\Fable clone\Madhubani_Mithila_Style_Foundation.md`
- Warli: `docs/warli-art-style-foundation.md`
- Tanjore: `E:\Fable clone\Tanjore_Painting_Style_Foundation.md`
- Kerala Mural: `docs/kerala-mural-style-foundation.md`
- Mughal: `E:\Fable clone\Mughal_Miniature_Painting_Style_Foundation.md`
- Rajasthani: `E:\Fable clone\Rajasthani_Miniature_Painting_Style_Foundation.md`

**MISSING (9)**: Pichwai, Mysore, Pahari, Bengal, Deccani, Maratha, Punjab, Anime, Bollywood

### Trained LoRAs: 3 of 15 (PET only)
- mrs_madhubani, mrs_warli, mrs_tanjore

### Key Technical Facts
- Humans → Kontext Pro (NEEDS REPLACEMENT)
- Kontext Pro does NOT have strength/denoise parameter — this is the core problem
- Flux Dev img2img HAS strength parameter (0-1) — key alternative
- Kontext Max has `image_prompt_strength` — worth testing
- guidance_scale 7.0 may help if staying on Kontext Pro (current 4.0-5.0 is too low)
- BFL recommends iterative passes for dramatic transformations
- Watermark needs complete redesign

### Previous Session Accomplishments
- Fixed all MVP bugs (generation, auth, pricing, logo, spiral)
- V4→V5→V6→V7→V8 prompt evolution
- LoRA training for 3 P0 styles
- Rate limits raised to 999 for testing
- Deployed at https://mirasi.vercel.app/
