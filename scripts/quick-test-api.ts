/**
 * Quick API Key Verification + Single Style Test
 *
 * Verifies the fal.ai API key works, then runs a single generation
 * to confirm the full Kontext Pro pipeline.
 *
 * Usage: FAL_KEY=<key> npx tsx scripts/quick-test-api.ts
 */

import { fal } from "@fal-ai/client";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY not set");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

async function main() {
  console.log("Testing fal.ai API connection...\n");

  // Use a free Unsplash photo URL for testing
  // This is a portrait photo of a person (free to use)
  const testImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&q=80";

  const KONTEXT_PRO = "fal-ai/flux-pro/kontext";

  try {
    console.log("Submitting test generation (rajasthani-royal, human)...");
    const startTime = Date.now();

    const kontextInput: Record<string, unknown> = {
      image_url: testImageUrl,
      prompt:
        "Transform this portrait into a Rajasthani Mewar miniature painting. " +
        "Apply flat perspective with ornate golden border frame, rich jewel tones of deep red, " +
        "gold, and emerald green. Place the subject in a palace courtyard with arched pillars " +
        "and intricate jali patterns. Add traditional Rajput ornaments and detailed textile " +
        "patterns. Use the characteristic Mewar style fine brushwork with visible ink outlines. " +
        "Maintain the same facial features, expression, and pose of the person.",
      guidance_scale: 4.5,
      num_inference_steps: 50,
      output_format: "jpeg",
      safety_tolerance: "2",
    };

    const result = await fal.subscribe(KONTEXT_PRO, {
      input: kontextInput as never,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          process.stdout.write("\r  Status: In queue...");
        } else if (update.status === "IN_PROGRESS") {
          process.stdout.write("\r  Status: Generating...");
        }
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const data = result.data as { images?: Array<{ url: string; width: number; height: number }> };

    if (data.images && data.images.length > 0) {
      const img = data.images[0];
      console.log(`\n\n  API KEY VERIFIED!`);
      console.log(`  Generation time: ${elapsed}s`);
      console.log(`  Image URL: ${img.url}`);
      console.log(`  Dimensions: ${img.width}x${img.height}`);

      // Download to test-outputs
      const fs = await import("fs");
      const path = await import("path");
      const outDir = path.join(process.cwd(), "test-outputs");
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

      const response = await fetch(img.url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const outPath = path.join(outDir, `api-test-rajasthani-royal-human.jpg`);
      fs.writeFileSync(outPath, buffer);
      console.log(`  Saved: ${outPath}`);
      console.log(`\n  Your fal.ai key is working. Ready for full testing!\n`);
    } else {
      console.log("\n  WARNING: No images in response.");
      console.log("  Response:", JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error(`\n  API TEST FAILED`);
    console.error(`  Error: ${err instanceof Error ? err.message : err}`);
    if (err instanceof Error && err.message.includes("401")) {
      console.error("  → Invalid API key. Check your FAL_KEY.");
    } else if (err instanceof Error && err.message.includes("402")) {
      console.error("  → Insufficient credits. Add funds at fal.ai/dashboard.");
    } else if (err instanceof Error && err.message.includes("429")) {
      console.error("  → Rate limited. Wait a moment and try again.");
    }
    process.exit(1);
  }
}

main().catch(console.error);
