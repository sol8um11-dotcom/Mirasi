# Mirasi - AI Indian Art Portrait PWA

## Project Overview
AI-powered portrait generator transforming photos into Indian art styles. Mobile-first PWA targeting the Indian market (32M pet-owning households, $3.6B market).

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
1. **Flux Kontext API for both pets & humans** (MVP simplicity, custom LoRA in Phase 2)
2. **Queue-based generation** (fal.ai queue → client polls → post-processing on completion)
3. **Server-side watermarking** (Sharp, HD image never exposed until payment)
4. **Client-side image compression** (browser-image-compression, strips EXIF/GPS for DPDP)
5. **CSS-first mobile approach** (scroll-snap, native dialog, details/summary - minimize JS)
6. **Supabase Storage** (integrated with RLS, simpler than R2 for MVP)

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
supabase/
  migrations/    - SQL migration files
```

## Build Log

### Session 1 (Feb 2025) - Market Research
- Reverse-engineered Fable's tech stack and UX
- Researched Indian pet demographics (32M households, $3.6B market)
- AI model training feasibility (SDXL + LoRA, Flux Kontext)
- Selected 15 art styles with real demand data
- Competitive analysis (ChitraShakti, PortraitFlip, Crown & Paw)
- Cultural sensitivity research (7 survival rules)
- Pre-MVP gaps audit (legal, payments, fulfillment)
- Created 5 research documents in project root

### Session 2 (Feb 2025) - MVP Development Start
- Created Next.js 16 project with TypeScript, Tailwind v4, App Router
- Project name: chitrashala (Sanskrit for "art gallery/studio")
- Installed core deps: @supabase/supabase-js, @supabase/ssr, @serwist/next, browser-image-compression, @fal-ai/client, razorpay, sharp, clsx, tailwind-merge

### Session 3 (Feb 2025) - Phase A Complete + Rebrand to Mirasi
- **Rebrand**: ChitraShala → Mirasi (Meera + Rasa). Paisley Spiral logo (Concept 4). Updated all 12+ files.
- **Logo component**: src/components/ui/logo.tsx - LogoIcon (standalone SVG) + Logo (icon + wordmark, 3 sizes)
- **next.config.ts**: Serwist PWA wrapper, remote image patterns (Supabase, fal.media), optimizeCss
- **globals.css**: Full design token system - saffron/gold brand colors, cream/sand neutrals, deep-blue text, shadows, animations, scroll-snap, dialog, shimmer
- **Service Worker** (sw.ts): Serwist with offline fallback page
- **PWA Manifest** (manifest.ts): Standalone, portrait orientation, saffron theme
- **Supabase clients**: client.ts (browser), server.ts (RSC), admin.ts (service role), middleware.ts (session refresh)
- **Middleware**: Auth protection for /account, /api/upload, /api/generate routes
- **Database migrations**: 001_initial_schema.sql (6 tables, RLS, triggers, storage buckets), 002_seed_styles.sql (15 art styles with prompt templates)
- **Types**: Full TypeScript types for database, API responses, fal.ai, Razorpay, UI
- **Auth flow**: Google OAuth + Phone OTP (India-friendly), /auth/login with 3-step UI, /auth/callback
- **Layout shell**: Root layout with SEO metadata, Header (logo, nav, CTA), BottomNav (5-tab mobile), Footer
- **UI primitives**: Button (4 variants, 3 sizes, loading state), Spinner
- **Pages**: Home (hero, how-it-works, style categories, CTA), Create, Gallery, Pricing, Account, Privacy, Terms, Refund, Offline
- **Utilities**: cn() (clsx+twMerge), formatINR, formatDate, slugify, isValidIndianPhone, formatFileSize
- **Image processing**: Client-side compression with EXIF stripping (DPDP compliance)
- **Build**: Successful with webpack (required for Serwist), 15 static routes generated
- **Fix**: Next.js 16 defaults to Turbopack; Serwist requires webpack, added --webpack to scripts
- **Fix**: middleware.ts deprecation warning (proxy replaces middleware in Next.js 16, but Supabase SSR needs it)

### Session 4 (Feb 2025) - Logo Finalization + Dark Theme
- **Logo refinement**: 3 rounds of iteration via standalone HTML files (logo-refined.html → logo-refined-v2.html → enamel pin mockup)
  - Round 1: 6 Paisley Spiral variations → user picks Concept 1 "Refined Paisley Spiral"
  - Round 2: 6 "eye at center" variations → user picks V1 "Subtle Almond Eye"
  - Round 3: User generates enamel pin mockup, requests edits (upper lid only, no lower boundary, spiral flows into eyelid)
- **Font exploration**: Created logo-fonts.html with 14 fonts × 5 color treatments × 5 curated combos. Researched typography from premium brands (Airbnb, Spotify, Zomato, CRED). User chose #9 Urbanist.
- **Logo SVG rewrite** (logo.tsx): 3-path spiral (3.5→2.8→2 stroke width), inner path flows into upper eyelid, gold pupil with feGaussianBlur glow filter, no lower eyelid boundary
- **Wordmark**: Full saffron "mirasi" in Urbanist Bold, gold dots on both "i" letters via `.split("").map()` + absolute-positioned circles
- **Urbanist font**: Added to layout.tsx via next/font/google, `--font-display: var(--font-urbanist)` in globals.css
- **Dark theme**: Rewrote all semantic design tokens in globals.css @theme inline block
  - background=#0A0A0A, foreground=#F0EDE6, card=#141210, border=#2A2520, muted=#9B8E7E
  - Sand=#1E1C18, cream=#0A0A0A, cream-dark=#141210
  - Shadows: rgba(0,0,0,...) with higher opacity for dark
  - Dialog backdrop: rgba(0,0,0,0.7)
- **Component audit for dark theme**: Most components auto-adapted via semantic token classes. Manual fixes:
  - page.tsx: Gradient opacities bumped /10 → /15 for dark visibility
  - gallery-client.tsx: Note section bg-sand/50 → bg-card, text-earth-dark → text-foreground/70
  - style-card.tsx: Paisley placeholder SVG updated to match new logo design
- **manifest.ts**: background_color #FFFBF0 → #0A0A0A
- **Build**: Clean compilation, 15 static routes generated successfully
- **Standalone HTML files created**: logo-refined.html, logo-refined-v2.html, logo-fonts.html (design exploration tools)

### Session 5 (Feb 2025) - Phase B Carousel + Phase C Core Creation Flow
- **Phase B completion**: Built `style-carousel.tsx` — CSS scroll-snap horizontal carousel of 15 art styles on landing page. Desktop: chevron buttons + fade edges. Mobile: native swipe. Cards link to `/create?style={slug}`.
- **Logo refinement**: Fixed double dots on "i" letters (dotless ı U+0131), moved gold dots closer (top:4-5px), fixed navy bg from #1B2A4A to deeper #0F1A2E.
- **Phase C: fal.ai integration** (`src/lib/fal/index.ts`): Queue-based wrapper for Flux Kontext Pro API — `submitGeneration()`, `checkGenerationStatus()`, `getGenerationResult()`
- **Phase C: Watermarking** (`src/lib/image/watermark.ts`): Sharp-based diagonal "Mirasi" text watermark, 3x3 grid, rotated -30deg, opacity 0.3, SVG composite
- **Phase C: API Routes**:
  - `/api/upload` — FormData upload, Supabase Storage, rate limiting (20/hour), generation row creation
  - `/api/generate` — Trigger fal.ai queue, prompt template substitution, rate limiting (10/day)
  - `/api/generation/[id]` — Poll fal.ai status, post-process on completion (download → watermark → upload preview + HD), ownership verification
- **Phase C: Polling hook** (`src/hooks/use-generation.ts`): Client-side polling every 3s, timeout at 120s, auto-stops on completion/failure
- **Phase C: Create flow UI** (`src/app/create/create-flow.tsx`): 4-step state machine (select-style → upload-photo → generating → result). Style grid with category filters, subject type selector, drag-and-drop upload with client compression, progress bar, watermarked result viewer with download/purchase CTAs
- **Build**: Clean compilation, 17 routes (14 static + 3 dynamic API routes)

### Session 6 (Feb 2025) - Logo V5 Emboss + Phase D Payment Integration
- **Logo V5 Emboss**: Toned down yellow boundary from V4. Light bevel #D4A843 at 30% (was #F0B860 at 70%), ridge highlight #E8C878 at 20% (was #F5D590 at 40%), dilate radius 0.35 (was 0.5). Shadow-driven depth with restrained highlights.
- **SVG filter ID collision fix**: Multiple LogoIcon instances shared same DOM IDs. Fixed with React `useId()` hook for unique IDs per instance.
- **CSS border-color transition**: Added `border-color 0.2s ease` to `.raised-3d`.
- **Pricing update**: Rs 99 → Rs 49 single portrait. Updated constants (4900 paise), pricing page, landing hero, landing CTA.
- **Phase D: Razorpay Payment Integration**:
  - `src/lib/razorpay/index.ts` — Lazy singleton Razorpay instance, createRazorpayOrder, verifyPaymentSignature (HMAC-SHA256), verifyWebhookSignature
  - `src/app/api/order/create/route.ts` — Auth + ownership + double-purchase guard → Razorpay order → DB insert
  - `src/app/api/verify-payment/route.ts` — HMAC verify → order "paid" → payment record → signed download URL (5-min)
  - `src/app/api/webhook/razorpay/route.ts` — Signature verify → idempotent payment.captured/failed handling → always 200
  - `src/app/api/download/[generationId]/route.ts` — Auth + payment verify → signed URL → download tracking
  - `src/hooks/use-razorpay.ts` — Dynamic checkout.js loading, saffron theme modal
  - `src/app/create/create-flow.tsx` — Full purchase state machine (idle→creating-order→checkout-open→verifying→purchased), 409 double-purchase recovery, HD download after payment
  - `src/lib/supabase/middleware.ts` — Added /api/order, /api/verify-payment, /api/download to protectedPaths
- **Build**: Clean compilation, 20 routes (15 static + 5 dynamic)
- **Phase E: User Dashboard + DPDP Compliance**:
  - `src/app/account/page.tsx` — Server component fetching generations, orders, profile via admin client with parallel queries
  - `src/app/account/account-dashboard.tsx` — Client component with 3-tab UI (Portraits grid, Orders list, Settings)
  - Settings tab: DPDP data processing consent toggle, marketing consent, data deletion (DPDP Right to Erasure)
  - `src/app/api/account/consent/route.ts` — Update DPDP + marketing consent prefs
  - `src/app/api/account/delete-data/route.ts` — Delete all storage files (source, generated, preview), clear DB paths, revoke consent
  - `src/app/account/loading.tsx` — Skeleton loading state
  - Middleware: added /api/account to protectedPaths
- **Phase F: SEO + Performance Optimization**:
  - `src/app/sitemap.ts` — Dynamic sitemap with all public routes
  - `src/app/robots.ts` — Robots.txt disallowing /api/, /auth/, /account
  - `src/components/seo/json-ld.tsx` — WebsiteJsonLd (home) + FAQJsonLd (pricing) structured data
  - Footer added to layout (desktop only, hidden on mobile where BottomNav shows)
  - Fixed "Rs 99" → "Rs 49" in root metadata description
- **Phase G: Polish + Deploy Prep**:
  - `src/app/error.tsx` — Global error boundary with retry + go home buttons
  - `src/app/not-found.tsx` — Custom 404 page with saffron branding
- **Build**: Clean compilation, 24 routes (14 static + 10 dynamic)

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
- **Next.js 16 middleware deprecation**: Using middleware.ts for Supabase auth refresh. Proxy convention doesn't support this pattern yet.
- **Serwist + Turbopack**: Not compatible. Must use webpack. Follow https://github.com/serwist/serwist/issues/54

## Phase Plan
- [x] Phase A: Project scaffolding, Supabase, Auth, PWA, Layout
- [x] Phase B: Landing page + static pages (Gallery & Pricing done, landing carousel done)
- [x] Phase C: Core creation flow (upload, AI pipeline, result)
- [x] Phase D: Razorpay payment integration
- [x] Phase E: User dashboard + DPDP compliance
- [x] Phase F: SEO + performance optimization
- [x] Phase G: Polish + deploy to Vercel
