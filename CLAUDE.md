# Mirasi - AI Indian Art Portrait PWA

## Project Overview
AI-powered portrait generator transforming photos into Indian art styles. Mobile-first PWA targeting the Indian market (32M pet-owning households, $3.6B market).

**Live URL:** https://mirasi.vercel.app/
**Brand name:** Mirasi (Meera + Rasa = rebel poet-princess + aesthetic emotion theory)
**Tagline:** "Every face tells a legend"
**Logo:** Paisley Spiral "Subtle Almond Eye" — spiral flows into upper eyelid (one continuous stroke), gold pupil beneath, no lower lid boundary. Polished with glow filter.
**Brand Font:** Urbanist (Bold, geometric sans-serif) for display/wordmark; Geist for UI body text
**Wordmark:** Full saffron (#C75B12) "mirasi" in Urbanist, gold (#D4A843) dots on both "i" letters matching the logo's eye pupil
**Theme:** Dark mode — #0A0A0A background, #F0EDE6 foreground, saffron/gold brand colors pop on dark
**Inspired by:** fable.surrealium.world (Swedish AI pet portrait product)
**Differentiator:** Indian art styles + India-priced + physical prints + zero direct competition

## Tech Stack
- **Frontend:** Next.js 16.1.6 (App Router, Server Components), Tailwind CSS v4
- **PWA:** Serwist (@serwist/next)
- **Database/Auth/Storage:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Razorpay (UPI mandatory for India)
- **AI Pipeline:** Flux Kontext Pro API via fal.ai (~$0.04/image)
- **Upscaling:** Real-ESRGAN via fal.ai
- **Deployment:** Vercel
- **CDN:** Cloudflare (free tier)

## 15 Art Styles (Launch)
### Royal (10)
1. Rajasthani Royal - Mewar/Udaipur miniature
2. Maratha Heritage - Peshwa/Shivaji-era portraiture
3. Tanjore Heritage - Thanjavur painting with gold leaf
4. Mysore Palace - Wodeyar/Mysore painting
5. Punjab Royal - Sikh court painting
6. Bengal Renaissance - Kalighat + Bengal School
7. Kerala Mural - Panchavarna mural tradition
8. Pahari Mountain - Kangra/Basohli miniature
9. Deccani Royal - Bijapur/Golconda tradition
10. Miniature Art - General Indo-Islamic miniature

### Folk (3)
11. Madhubani Art - Mithila painting
12. Warli Art - Warli tribal art
13. Pichwai Art - Nathdwara temple painting

### Modern (2)
14. Anime Portrait - Japanese anime/manga
15. Bollywood Retro - Hand-painted movie poster

## Cultural Sensitivity Rules
- Name styles after ART TRADITIONS, never dynasties
- Equal regional representation (North/South/East/West)
- Pets in SECULAR settings only (no religious backgrounds)
- No dogs in Islamic-influenced styles (Miniature Art, Deccani Royal)
- English default, never force Hindi
- Content moderation before marketing

## Key Architecture Decisions
1. **Dual AI pipeline**: Humans → Kontext Pro (identity preservation), Pets → Kontext LoRA (trained style LoRAs)
2. **Queue-based generation**: fal.ai queue → client polls 3s → post-processing on completion
3. **Server-side watermarking**: Sharp SVG composite — diagonal ribbon banner + background grid
4. **Client-side image compression**: browser-image-compression, strips EXIF/GPS for DPDP
5. **CSS-first mobile approach**: scroll-snap, native dialog, details/summary — minimize JS
6. **Supabase Storage**: integrated with RLS, simpler than R2 for MVP

## AI Pipeline (Dual Architecture)
- **Human portraits → Kontext Pro** (`fal-ai/flux-pro/kontext`) — best identity preservation ($0.04/image)
  - guidance_scale: 4.0 (slightly above default 3.5 for stronger style application)
  - Does NOT accept num_inference_steps (handled internally)
  - safety_tolerance: "2"
- **Pet portraits → Kontext LoRA** (`fal-ai/flux-kontext-lora`) — custom-trained style LoRAs ($0.035/MP)
  - guidance_scale: 2.5 (API default)
  - num_inference_steps: 30 (API default)
  - strength: 0.88 (API default, "higher is better")
  - loraScale: 1.0 (API default)
  - resolution_mode: "match_input"
- **Fallback**: If no LoRA trained for a style, pets also use Kontext Pro
- **CRITICAL**: LoRAs were trained on PET datasets only — NEVER apply to humans (causes gender swap + identity destruction)

### V6 Prompt Strategy
- **"Transform this entire portrait into X"** — full style blending, NOT just background
- **Face is recognizable but artistically rendered** — painted/stylized, not photorealistic
- **BLEND_FACE suffix**: "The face must be recognizable as the same person — same face structure, gender, skin tone, and expression — but rendered in the artistic style, not as a photograph."
- **guidance_scale 4.0** for humans pushes stronger style application
- **LoRA trigger words**: `mrs_<style>` convention (e.g., `mrs_warli`, `mrs_madhubani`)

### Trained LoRAs (3 of 15)
| Style | Trigger | LoRA URL | Training |
|-------|---------|----------|----------|
| warli-art | mrs_warli | v3b.fal.media/...pCzgeZ2O... | 800 steps, rank 16 |
| madhubani-art | mrs_madhubani | v3b.fal.media/...jx30OuCd... | 900 steps, rank 16 |
| tanjore-heritage | mrs_tanjore | v3b.fal.media/...F77SIFKQ... | 1200 steps, rank 32 |

## Database Schema
- `profiles` - Extends auth.users, DPDP consent tracking
- `styles` - 15 art styles with prompt templates
- `generations` - AI generation jobs with status tracking
- `orders` - Razorpay order records
- `payments` - Verified payment details
- `downloads` - Download tracking (analytics + abuse prevention)

## Project Structure
```
src/
  app/           - Next.js App Router pages + API routes
  components/    - UI components (ui/, layout/, landing/, create/, result/, payment/, account/)
  lib/           - Business logic (supabase/, fal/, razorpay/, image/, constants/, utils/)
  hooks/         - Custom React hooks
  types/         - TypeScript type definitions
  sw.ts          - Serwist service worker
scripts/         - LoRA training and testing scripts
datasets/        - LoRA training datasets
training-runs/   - Training run outputs
docs/            - LoRA training guide
supabase/
  migrations/    - SQL migration files
```

## Key Files
- `src/lib/fal/prompts.ts` — V6 style configs, prompt templates, buildPrompt()
- `src/lib/fal/index.ts` — fal.ai client, submitGeneration(), routing logic
- `src/app/api/generate/route.ts` — Generation trigger with rate limiting
- `src/app/api/generation/[id]/route.ts` — Polling + post-processing + watermarking
- `src/app/create/create-flow.tsx` — 4-step creation UI state machine
- `src/lib/image/watermark.ts` — Diagonal ribbon watermark via Sharp
- `src/lib/constants/index.ts` — Rate limits, pricing, image constraints

## Rate Limits (TESTING MODE)
- `MAX_GENERATIONS_PER_DAY` = 999 (was 10)
- `MAX_FREE_GENERATIONS` = 999 (was 1)
- `MAX_UPLOADS_PER_HOUR` = 20

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FAL_KEY=
RAZORPAY_KEY_ID=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```

## Important Notes
- **Build command**: `npm run build` (uses --webpack flag, required for Serwist)
- **Dev command**: `npm run dev` (also uses --webpack)
- **Next.js 16 middleware deprecation**: Using middleware.ts for Supabase auth refresh
- **Serwist + Turbopack**: Not compatible. Must use webpack.

## Training Scripts (`scripts/`)
- `setup-training-dirs.ts` — Create dataset directory structure
- `generate-training-pairs.ts` — Generate before/after pairs for LoRA training
- `train-lora.ts` — Upload dataset + submit to fal-ai/flux-kontext-trainer
- `integrate-lora.ts` — Update prompts.ts with trained LoRA URL
- `test-lora-quality.ts` — A/B test: Kontext Pro vs LoRA
- `test-prompts.ts` — Quick prompt testing across styles

## LoRA Training Priority
- **P0** (done): warli-art, madhubani-art, tanjore-heritage
- **P1**: kerala-mural, pichwai-art, bollywood-retro
- **P2**: rajasthani-royal, pahari-mountain, bengal-renaissance, maratha-heritage
- **P3**: mysore-palace, punjab-royal, deccani-royal, miniature-art, anime-portrait

## Phase Plan
- [x] Phase A: Project scaffolding, Supabase, Auth, PWA, Layout
- [x] Phase B: Landing page + static pages
- [x] Phase C: Core creation flow (upload, AI pipeline, result)
- [x] Phase D: Razorpay payment integration
- [x] Phase E: User dashboard + DPDP compliance
- [x] Phase F: SEO + performance optimization
- [x] Phase G: Polish + deploy to Vercel
- [x] Phase H: LoRA training for P0 styles (warli, madhubani, tanjore)
- [ ] Phase I: Production deployment + monitoring + remaining LoRA training
