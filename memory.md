# Mirasi Session Memory — Last Updated Feb 2026

## Where We Left Off

### Current State: V6 Prompts + Testing Phase
The MVP is fully deployed at https://mirasi.vercel.app/. All generation bugs are fixed, rate limits are temporarily raised (999) for intensive testing. The user is about to test the V6 prompts which do full style blending (subject rendered IN the art style, not photorealistic on styled background).

### What Just Shipped (This Session)
1. **Fixed generation button** — Multiple root causes: middleware redirecting API to HTML, silent auth failures, free limit counting current record against itself, invalid `image_size` parameter
2. **Fixed header** — Now auth-aware (shows "Sign In" when logged out, account icon when logged in)
3. **Fixed pricing ₹ icon** — 3 iterations, ended with native Unicode `\u20B9`
4. **Fixed logo gold dots** — Size reduced 0.11em→0.09em, top 0.08em→0.02em
5. **Reworked hero spiral** — Complete rewrite with comet trail, bloom effect, artist easing
6. **V4→V5→V6 Prompt Evolution**:
   - V4: Gender-preserving but photorealistic face (still used pet LoRAs on humans)
   - V5: Correct routing (humans→Pro, pets→LoRA) but "background only" approach kept subject as photo
   - V6: Full style blending — "Transform this entire portrait into X" — face recognizable but artistically rendered
7. **Critical bug: Pet LoRAs applied to humans** — Root cause of gender-swapping. LoRAs trained on pet datasets were being applied to ALL subjects. Fixed routing: humans ALWAYS use Kontext Pro.
8. **API parameter fixes** — Removed invalid `num_inference_steps` from Kontext Pro (not supported), added `strength: 0.88` and `resolution_mode: match_input` to LoRA pipeline
9. **Ribbon watermark** — Replaced text grid with diagonal saffron-gold ribbon banner
10. **Polling route fix** — Now checks `subject_type === "pet" && loraUrl` to determine which fal endpoint to poll

### Pending Items for Next Session
- [ ] **Test V6 prompt quality** — User needs to generate with all 3 live styles (warli, madhubani, tanjore) and evaluate blending quality
- [ ] **Iterate on prompts if needed** — May need to adjust guidance_scale (currently 4.0) based on test results
- [ ] **Train remaining LoRAs** — P1 (kerala-mural, pichwai-art, bollywood-retro), then P2, P3
- [ ] **Restore rate limits** — Set MAX_GENERATIONS_PER_DAY and MAX_FREE_GENERATIONS back to production values after testing
- [ ] **Production monitoring** — Error tracking, generation analytics
- [ ] **Physical prints flow** — Not yet built (future phase)

### Key Bugs Discovered & Fixed
| Bug | Root Cause | Fix |
|-----|-----------|-----|
| Generation button does nothing | Middleware redirected API POST to HTML login page | Return 401 JSON for /api/ routes |
| Generation blocked on first try | Free limit counted current pending record against itself | Exclude current generationId from count |
| Gender swap (male→female) | Pet-trained LoRAs applied to human portraits | Route humans to Kontext Pro ONLY |
| Identity loss / photorealistic paste | guidance_scale 2.0 too low, "background only" prompts | V6: guidance_scale 4.0, "Transform entire portrait" |
| Wrong polling endpoint | Polling checked loraUrl but not subject_type | Check subject_type === "pet" AND loraUrl |
| Invalid API param | num_inference_steps sent to Kontext Pro (not supported) | Removed; Pro handles steps internally |

### Research Findings (Flux Kontext)
- **Kontext Pro default guidance_scale: 3.5** (range 0-20)
- **Kontext LoRA default guidance_scale: 2.5** (range 0-20)
- **Kontext LoRA default strength: 0.88** — docs say "higher is better"
- **Kontext Pro does NOT accept num_inference_steps**
- **Max prompt tokens: 512** per Kontext API
- **BFL prompting guide**: Use instructional verb format, specific subject references (not pronouns), explicitly state what to preserve
- **LoRA scale 0.8-1.0** recommended for identity preservation; 0.5 was too weak
- **Community finding**: "portrait" in prompts causes right-side positioning bias; use "selfie" instead

### Git Commits This Session
- `ce27f31` — Generation fix + ₹ icon + logo dots + spiral
- `22c76f7` — Auth fix for generate
- `b1f912c` — Auth-aware header
- `ae50cf7` — V4 gender-preserving prompts
- `8550198` — V5 prompts + LoRA routing fix
- `a1594fc` — API parameter cleanup
- `2f83588` — Daily limit raised to 999
- `cc04ee2` — V6 prompts + ribbon watermark + polling fix
