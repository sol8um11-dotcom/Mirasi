# Mirasi Session Memory — Last Updated Feb 2026

## Where We Left Off

### Current State: V11 — BACK TO BASICS (Kontext Pro + V2 Prompts)

**KEY LESSON LEARNED**: The very first session (V2) produced the BEST results.
Every subsequent "improvement" DEGRADED quality:
- V3-V8: Longer, more aggressive prompts → worse style, identity drift
- V9: Flux Dev img2img → destroyed facial identity at high strength
- V10: PuLID Flux → beautiful style but ZERO facial resemblance

**V11 FIX**: Reverted to the original working formula:
- Kontext Pro for ALL humans (proven identity preservation)
- Short V2 identity-first prompts ("Keep exact same face..." + "Restyle as...")
- guidance_scale 3.0-4.5 range (not 7.0!)
- "Restyle" verb (gentler than "Transform")

### Pipeline Routing (V11)
- Humans → Kontext Pro (`fal-ai/flux-pro/kontext`)
- Pets with LoRA → Kontext LoRA (`fal-ai/flux-kontext-lora`)
- Pets without LoRA → Kontext Pro (fallback)

### REMOVED Models
- PuLID Flux (`fal-ai/flux-pulid`) — generated beautiful art but lost facial identity completely
- Flux Dev img2img (`fal-ai/flux/dev/image-to-image`) — destroyed identity at strength 0.85+

### Fable Competitor Analysis (Complete)
- Pet-first, human engine coming 2026
- Likely uses Flux/SDXL + IP-Adapter + style LoRAs + high denoise img2img
- $19 digital, $89+ prints
- Full analysis in `docs/CRITICAL_RESEARCH_FINDINGS.md`

### Style Foundation Files Status
**COMPLETE (6 of 15)**:
- Madhubani, Warli, Tanjore, Kerala Mural, Mughal, Rajasthani

**MISSING (9)**: Pichwai, Mysore, Pahari, Bengal, Deccani, Maratha, Punjab, Anime, Bollywood

### Trained LoRAs: 3 of 15 (PET only)
- mrs_madhubani, mrs_warli, mrs_tanjore

### Key Technical Facts
- Kontext Pro does NOT support num_inference_steps or strength params
- Only guidance_scale controls style/identity balance on Kontext Pro
- guidance_scale 7.0 causes over-saturation (sweet spot is 3.0-4.5)
- LoRA pipeline (Kontext LoRA) DOES support strength and num_inference_steps
- Rate limits set to 999 for testing
- Watermark: sparse diagonal "mirasi" text

### Pending Tasks
- Remove sign-in requirement for free preview generation
- Complete remaining 9 style foundation files
- Train remaining 12 LoRAs
- Restore production rate limits when ready

### Deployed at
https://mirasi.vercel.app/
