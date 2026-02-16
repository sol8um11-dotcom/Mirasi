/**
 * Prompt Testing Script
 *
 * Generates test images for all 15 styles using a sample image URL.
 * Run with: npx tsx scripts/test-prompts.ts <image-url> [style-slug] [subject-type]
 *
 * Examples:
 *   npx tsx scripts/test-prompts.ts "https://example.com/photo.jpg"
 *   npx tsx scripts/test-prompts.ts "https://example.com/photo.jpg" rajasthani-royal
 *   npx tsx scripts/test-prompts.ts "https://example.com/dog.jpg" madhubani-art pet
 *
 * Prerequisites:
 *   - FAL_KEY environment variable set
 *   - npm install -D tsx (if not already installed)
 *
 * Output: Downloads generated images to ./test-outputs/
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import { buildPrompt, getStyleConfig } from "../src/lib/fal/prompts";

// ─── Setup ───────────────────────────────────────────────────────────────────

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY environment variable not set.");
  console.error("Run: $env:FAL_KEY='your-key-here' (PowerShell)");
  console.error("  or: export FAL_KEY=your-key-here (bash)");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const KONTEXT_PRO = "fal-ai/flux-pro/kontext";
const OUTPUT_DIR = path.join(process.cwd(), "test-outputs");

const ALL_STYLES = [
  "rajasthani-royal", "maratha-heritage", "tanjore-heritage",
  "mysore-palace", "punjab-royal", "bengal-renaissance",
  "kerala-mural", "pahari-mountain", "deccani-royal", "miniature-art",
  "madhubani-art", "warli-art", "pichwai-art",
  "anime-portrait", "bollywood-retro",
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: npx tsx scripts/test-prompts.ts <image-url> [style-slug] [subject-type]");
    console.log("\nAvailable styles:");
    ALL_STYLES.forEach((s) => console.log(`  - ${s}`));
    process.exit(0);
  }

  const imageUrl = args[0];
  const targetStyle = args[1] || "all";
  const subjectType = (args[2] || "human") as "human" | "pet";

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const stylesToTest = targetStyle === "all"
    ? ALL_STYLES
    : [targetStyle];

  console.log(`\n🎨 Mirasi Prompt Tester`);
  console.log(`   Image: ${imageUrl}`);
  console.log(`   Subject: ${subjectType}`);
  console.log(`   Styles: ${stylesToTest.length}`);
  console.log(`   Output: ${OUTPUT_DIR}\n`);

  for (const slug of stylesToTest) {
    const config = getStyleConfig(slug);
    const prompt = buildPrompt(slug, subjectType);

    console.log(`\n─── ${slug} ───`);
    console.log(`  Guidance: ${config.guidanceScale}`);
    console.log(`  Steps: ${config.numInferenceSteps}`);
    console.log(`  Prompt: ${prompt.substring(0, 100)}...`);

    try {
      const startTime = Date.now();

      const kontextInput: Record<string, unknown> = {
        image_url: imageUrl,
        prompt,
        guidance_scale: config.guidanceScale,
        num_inference_steps: config.numInferenceSteps,
        output_format: "jpeg",
        safety_tolerance: "2",
      };
      const result = await fal.subscribe(KONTEXT_PRO, {
        input: kontextInput as never,
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const data = result.data as { images?: Array<{ url: string }> };

      if (data.images && data.images.length > 0) {
        const imgUrl = data.images[0].url;

        // Download the image
        const response = await fetch(imgUrl);
        const buffer = Buffer.from(await response.arrayBuffer());

        const filename = `${slug}_${subjectType}_${Date.now()}.jpg`;
        const filepath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(filepath, buffer);

        console.log(`  ✅ Done in ${elapsed}s → ${filename}`);
      } else {
        console.log(`  ❌ No images returned`);
      }
    } catch (err) {
      console.log(`  ❌ Error: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n✅ Done! Check ${OUTPUT_DIR} for results.\n`);
}

main().catch(console.error);
