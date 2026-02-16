/**
 * LoRA Quality Testing Script for Mirasi
 *
 * Generates test images for a style using both Kontext Pro (control)
 * and Kontext LoRA (treatment), then creates a side-by-side comparison
 * report with quality metrics.
 *
 * Usage:
 *   npx tsx scripts/test-lora-quality.ts <style-slug> [options]
 *
 * Options:
 *   --compare       Generate both Pro and LoRA versions for A/B comparison
 *   --pro-only      Only generate Kontext Pro versions (baseline)
 *   --lora-only     Only generate Kontext LoRA versions
 *   --photos <dir>  Custom test photos directory
 *   --scale N       Override loraScale (0-4)
 *   --steps N       Override inference steps
 *   --seed N        Seed for reproducibility
 *
 * Examples:
 *   npx tsx scripts/test-lora-quality.ts warli-art --compare
 *   npx tsx scripts/test-lora-quality.ts madhubani-art --lora-only --scale 0.9
 *   npx tsx scripts/test-lora-quality.ts tanjore-heritage --photos ./my-test-photos
 *
 * Prerequisites:
 *   - FAL_KEY environment variable set
 *   - Test photos in ./datasets/test-photos/ (or specified dir)
 *   - For LoRA tests: loraUrl must be configured in prompts.ts
 *
 * Output:
 *   ./test-outputs/<style-slug>/
 *     pro_001.jpg, pro_002.jpg, ...
 *     lora_001.jpg, lora_002.jpg, ...
 *     report.json (timing, config, file paths)
 *     scorecard.md (markdown template for manual scoring)
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";

// We import from the actual prompts module to test the real config
import { getStyleConfig, buildPrompt } from "../src/lib/fal/prompts";

// ─── Environment ────────────────────────────────────────────────────────────

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY environment variable not set.");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const KONTEXT_PRO = "fal-ai/flux-pro/kontext";
const KONTEXT_LORA = "fal-ai/flux-kontext-lora";

// ─── Default Test Photos ────────────────────────────────────────────────────

// If no photos directory is provided, we use these URLs for quick testing.
// Replace with your actual test set URLs after uploading them.
const PLACEHOLDER_TEST_URLS = [
  // These are placeholder — replace with real Unsplash/Pexels URLs of test pets
  { label: "labrador", url: "" },
  { label: "indie-dog", url: "" },
  { label: "pomeranian", url: "" },
  { label: "german-shepherd", url: "" },
  { label: "persian-cat", url: "" },
  { label: "tabby-cat", url: "" },
  { label: "black-cat", url: "" },
  { label: "parrot", url: "" },
  { label: "pug", url: "" },
  { label: "indie-dark", url: "" },
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface TestResult {
  label: string;
  proImagePath?: string;
  proTimeMs?: number;
  loraImagePath?: string;
  loraTimeMs?: number;
  error?: string;
}

// ─── Argument Parsing ───────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Mirasi LoRA Quality Tester
============================

Usage:
  npx tsx scripts/test-lora-quality.ts <style-slug> [options]

Options:
  --compare       A/B: Generate both Pro and LoRA versions
  --pro-only      Only generate Pro versions (baseline)
  --lora-only     Only generate LoRA versions
  --photos <dir>  Custom test photos directory
  --urls <file>   JSON file with test photo URLs [{label, url}]
  --scale N       Override loraScale
  --steps N       Override inference steps for LoRA
  --seed N        Seed for reproducibility
  --limit N       Max photos to test

Available styles: Run "npx tsx scripts/train-lora.ts" for the full list
`);
    process.exit(0);
  }

  const slug = args[0];
  const config = getStyleConfig(slug);

  let mode: "compare" | "pro-only" | "lora-only" = "compare";
  let photosDir: string | null = null;
  let urlsFile: string | null = null;
  let scaleOverride: number | null = null;
  let stepsOverride: number | null = null;
  let seed: number | undefined;
  let limit = Infinity;

  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case "--compare":
        mode = "compare";
        break;
      case "--pro-only":
        mode = "pro-only";
        break;
      case "--lora-only":
        mode = "lora-only";
        break;
      case "--photos":
        photosDir = args[++i];
        break;
      case "--urls":
        urlsFile = args[++i];
        break;
      case "--scale":
        scaleOverride = parseFloat(args[++i]);
        break;
      case "--steps":
        stepsOverride = parseInt(args[++i], 10);
        break;
      case "--seed":
        seed = parseInt(args[++i], 10);
        break;
      case "--limit":
        limit = parseInt(args[++i], 10);
        break;
    }
  }

  return { slug, config, mode, photosDir, urlsFile, scaleOverride, stepsOverride, seed, limit };
}

// ─── Generate with Kontext Pro ──────────────────────────────────────────────

async function generatePro(
  imageUrl: string,
  prompt: string,
  guidanceScale: number,
  steps: number,
  seed?: number
): Promise<{ url: string; timeMs: number }> {
  const start = Date.now();

  const kontextInput: Record<string, unknown> = {
    image_url: imageUrl,
    prompt,
    guidance_scale: guidanceScale,
    num_inference_steps: steps,
    output_format: "jpeg",
    safety_tolerance: "2",
    ...(seed !== undefined && { seed }),
  };

  const result = await fal.subscribe(KONTEXT_PRO, {
    input: kontextInput as never,
  });

  const data = result.data as { images?: Array<{ url: string }> };
  if (!data.images || data.images.length === 0) {
    throw new Error("No images returned from Kontext Pro");
  }

  return { url: data.images[0].url, timeMs: Date.now() - start };
}

// ─── Generate with Kontext LoRA ─────────────────────────────────────────────

async function generateLora(
  imageUrl: string,
  prompt: string,
  loraUrl: string,
  loraScale: number,
  guidanceScale: number,
  steps: number,
  seed?: number
): Promise<{ url: string; timeMs: number }> {
  const start = Date.now();

  const result = await fal.subscribe(KONTEXT_LORA, {
    input: {
      image_url: imageUrl,
      prompt,
      loras: [{ path: loraUrl, scale: loraScale }],
      guidance_scale: guidanceScale,
      num_inference_steps: steps,
      output_format: "jpeg",
      ...(seed !== undefined && { seed }),
    },
  });

  const data = result.data as { images?: Array<{ url: string }> };
  if (!data.images || data.images.length === 0) {
    throw new Error("No images returned from Kontext LoRA");
  }

  return { url: data.images[0].url, timeMs: Date.now() - start };
}

// ─── Download Image ─────────────────────────────────────────────────────────

async function downloadImage(url: string, filepath: string): Promise<void> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
}

// ─── Generate Scorecard ─────────────────────────────────────────────────────

function generateScorecard(
  slug: string,
  results: TestResult[],
  outputDir: string
): void {
  let md = `# LoRA Quality Scorecard: ${slug}\n\n`;
  md += `**Date:** ${new Date().toISOString().slice(0, 10)}\n\n`;
  md += `## Scoring Guide\n\n`;
  md += `Rate each image 1-5 on:\n`;
  md += `- **SF** (Style Fidelity): Does it look like authentic ${slug} art?\n`;
  md += `- **SI** (Subject Identity): Can you recognize the specific animal?\n`;
  md += `- **TQ** (Technical Quality): No artifacts, clean composition?\n`;
  md += `- **OA** (Overall Appeal): Would a customer buy this?\n\n`;
  md += `**Pass thresholds:** SF >= 3.5, SI >= 3.5, TQ >= 4.0, OA >= 3.5\n\n`;

  md += `## Results\n\n`;
  md += `| # | Subject | Pro SF | Pro SI | Pro TQ | Pro OA | LoRA SF | LoRA SI | LoRA TQ | LoRA OA | Winner |\n`;
  md += `|---|---------|--------|--------|--------|--------|---------|---------|---------|---------|--------|\n`;

  results.forEach((r, i) => {
    const proFile = r.proImagePath ? path.basename(r.proImagePath) : "N/A";
    const loraFile = r.loraImagePath ? path.basename(r.loraImagePath) : "N/A";
    md += `| ${i + 1} | ${r.label} | _/5 | _/5 | _/5 | _/5 | _/5 | _/5 | _/5 | _/5 | |\n`;
  });

  md += `\n## Averages\n\n`;
  md += `| Metric | Pro Avg | LoRA Avg | Delta |\n`;
  md += `|--------|---------|----------|-------|\n`;
  md += `| SF | | | |\n`;
  md += `| SI | | | |\n`;
  md += `| TQ | | | |\n`;
  md += `| OA | | | |\n`;

  md += `\n## Timing\n\n`;
  md += `| # | Subject | Pro (s) | LoRA (s) |\n`;
  md += `|---|---------|---------|----------|\n`;
  results.forEach((r, i) => {
    const proTime = r.proTimeMs ? (r.proTimeMs / 1000).toFixed(1) : "N/A";
    const loraTime = r.loraTimeMs ? (r.loraTimeMs / 1000).toFixed(1) : "N/A";
    md += `| ${i + 1} | ${r.label} | ${proTime} | ${loraTime} |\n`;
  });

  md += `\n## Notes\n\n`;
  md += `_Add observations about specific images, failure modes, or patterns here._\n`;

  const scorecardPath = path.join(outputDir, "scorecard.md");
  fs.writeFileSync(scorecardPath, md);
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { slug, config, mode, photosDir, urlsFile, scaleOverride, stepsOverride, seed, limit } = parseArgs();

  const needsLora = mode === "compare" || mode === "lora-only";
  const needsPro = mode === "compare" || mode === "pro-only";

  // Validate LoRA availability
  if (needsLora && !config.loraUrl) {
    console.error(`\nERROR: Style "${slug}" has no loraUrl configured in prompts.ts.`);
    console.error("Train a LoRA first with: npx tsx scripts/train-lora.ts");
    console.error("\nYou can still run with --pro-only for baseline testing.\n");
    if (mode === "lora-only") process.exit(1);
    console.log("Falling back to --pro-only mode.\n");
  }

  const actualMode = (needsLora && !config.loraUrl) ? "pro-only" : mode;

  // Get test photos
  let testPhotos: Array<{ label: string; url: string }> = [];

  if (urlsFile) {
    // Load from JSON file
    const data = JSON.parse(fs.readFileSync(urlsFile, "utf-8"));
    testPhotos = data;
  } else if (photosDir) {
    // Upload local photos to fal storage
    console.log("Uploading test photos to fal.ai storage...\n");
    const imageExts = [".jpg", ".jpeg", ".png", ".webp"];
    const files = fs.readdirSync(photosDir)
      .filter(f => imageExts.includes(path.extname(f).toLowerCase()))
      .sort()
      .slice(0, limit);

    for (const file of files) {
      const filePath = path.join(photosDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      const blob = new File(
        [fileBuffer],
        file,
        { type: file.endsWith(".png") ? "image/png" : "image/jpeg" }
      );
      const url = await fal.storage.upload(blob);
      const label = path.parse(file).name;
      testPhotos.push({ label, url });
      console.log(`  Uploaded: ${file} → ${label}`);
    }
    console.log();

    // Save URLs for future runs
    const urlsOutPath = path.join(photosDir, "uploaded-urls.json");
    fs.writeFileSync(urlsOutPath, JSON.stringify(testPhotos, null, 2));
    console.log(`  Saved URLs to ${urlsOutPath} for reuse\n`);
  } else {
    // Use placeholder URLs
    testPhotos = PLACEHOLDER_TEST_URLS.filter(p => p.url);
    if (testPhotos.length === 0) {
      console.error("ERROR: No test photos available.");
      console.error("Either:");
      console.error("  1. Use --photos <directory> to provide local photos");
      console.error("  2. Use --urls <file.json> to provide URLs");
      console.error("  3. Fill in PLACEHOLDER_TEST_URLS in this script");
      process.exit(1);
    }
  }

  testPhotos = testPhotos.slice(0, limit);

  // Setup output directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = path.join(process.cwd(), "test-outputs", slug, timestamp);
  fs.mkdirSync(outputDir, { recursive: true });

  const loraScale = scaleOverride ?? config.loraScale;
  const loraSteps = stepsOverride ?? (config.loraUrl ? 30 : config.numInferenceSteps);
  const proPrompt = buildPrompt(slug, "pet");
  const loraPrompt = config.loraTrigger
    ? `${config.loraTrigger} style. ${config.petPrompt}`
    : proPrompt;

  console.log(`
=======================================================
  Mirasi LoRA Quality Test
=======================================================
  Style:      ${slug}
  Mode:       ${actualMode}
  Photos:     ${testPhotos.length}
  Output:     ${outputDir}
  Pro Config: guidance=${config.guidanceScale}, steps=${config.numInferenceSteps}
  ${actualMode !== "pro-only" ? `LoRA Config: url=${config.loraUrl?.substring(0, 40)}..., scale=${loraScale}, steps=${loraSteps}` : "LoRA: N/A (pro-only mode)"}
  Seed:       ${seed ?? "random"}
  Est. Cost:  ~$${(testPhotos.length * (actualMode === "compare" ? 0.08 : 0.04)).toFixed(2)}
=======================================================
`);

  const results: TestResult[] = [];

  for (let i = 0; i < testPhotos.length; i++) {
    const photo = testPhotos[i];
    const idx = String(i + 1).padStart(3, "0");
    const result: TestResult = { label: photo.label };

    console.log(`\n[${i + 1}/${testPhotos.length}] ${photo.label}`);

    // Generate Pro version
    if (actualMode === "compare" || actualMode === "pro-only") {
      try {
        process.stdout.write("  Pro: generating...");
        const pro = await generatePro(
          photo.url,
          proPrompt,
          config.guidanceScale,
          config.numInferenceSteps,
          seed
        );
        const proPath = path.join(outputDir, `pro_${idx}_${photo.label}.jpg`);
        await downloadImage(pro.url, proPath);
        result.proImagePath = proPath;
        result.proTimeMs = pro.timeMs;
        console.log(` done (${(pro.timeMs / 1000).toFixed(1)}s)`);
      } catch (err) {
        console.log(` ERROR: ${err instanceof Error ? err.message : err}`);
        result.error = `Pro: ${err instanceof Error ? err.message : err}`;
      }
    }

    // Generate LoRA version
    if ((actualMode === "compare" || actualMode === "lora-only") && config.loraUrl) {
      try {
        process.stdout.write("  LoRA: generating...");
        const lora = await generateLora(
          photo.url,
          loraPrompt,
          config.loraUrl,
          loraScale,
          config.guidanceScale,
          loraSteps,
          seed
        );
        const loraPath = path.join(outputDir, `lora_${idx}_${photo.label}.jpg`);
        await downloadImage(lora.url, loraPath);
        result.loraImagePath = loraPath;
        result.loraTimeMs = lora.timeMs;
        console.log(` done (${(lora.timeMs / 1000).toFixed(1)}s)`);
      } catch (err) {
        console.log(` ERROR: ${err instanceof Error ? err.message : err}`);
        result.error = (result.error ? result.error + " | " : "") +
          `LoRA: ${err instanceof Error ? err.message : err}`;
      }
    }

    results.push(result);

    // Rate limit
    if (i < testPhotos.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Save report
  const reportPath = path.join(outputDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify({
    slug,
    mode: actualMode,
    timestamp,
    config: {
      guidanceScale: config.guidanceScale,
      numInferenceSteps: config.numInferenceSteps,
      loraUrl: config.loraUrl,
      loraScale,
      loraSteps,
      loraTrigger: config.loraTrigger,
      seed,
    },
    results,
    summary: {
      total: testPhotos.length,
      proSuccess: results.filter(r => r.proImagePath).length,
      loraSuccess: results.filter(r => r.loraImagePath).length,
      avgProTimeMs: Math.round(
        results.filter(r => r.proTimeMs).reduce((sum, r) => sum + (r.proTimeMs ?? 0), 0) /
        (results.filter(r => r.proTimeMs).length || 1)
      ),
      avgLoraTimeMs: Math.round(
        results.filter(r => r.loraTimeMs).reduce((sum, r) => sum + (r.loraTimeMs ?? 0), 0) /
        (results.filter(r => r.loraTimeMs).length || 1)
      ),
    },
  }, null, 2));

  // Generate scorecard
  generateScorecard(slug, results, outputDir);

  const proCount = results.filter(r => r.proImagePath).length;
  const loraCount = results.filter(r => r.loraImagePath).length;

  console.log(`
=======================================================
  TEST COMPLETE
=======================================================
  Pro images:  ${proCount} generated
  LoRA images: ${loraCount} generated
  Report:      ${reportPath}
  Scorecard:   ${path.join(outputDir, "scorecard.md")}

  NEXT STEPS:
  1. Open ${outputDir} and review all generated images
  2. Fill in the scorecard.md with 1-5 ratings
  3. Check if averages meet pass thresholds:
     SF >= 3.5, SI >= 3.5, TQ >= 4.0, OA >= 3.5
  4. If LoRA scores significantly > Pro → ready to deploy
  5. If not → iterate (adjust scale, steps, or retrain)
=======================================================
`);
}

main().catch(console.error);
