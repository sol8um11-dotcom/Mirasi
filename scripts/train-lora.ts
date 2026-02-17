/**
 * LoRA Training Script for Mirasi
 *
 * Trains style-specific LoRAs using fal-ai/flux-kontext-trainer.
 * Handles dataset upload, training job submission, status monitoring,
 * and outputs the LoRA URL for integration into prompts.ts.
 *
 * Usage:
 *   npx tsx scripts/train-lora.ts <style-slug> <dataset-zip-path> [--steps N] [--rank N] [--lr N]
 *
 * Examples:
 *   npx tsx scripts/train-lora.ts warli-art ./datasets/warli-art/warli-art-dataset.zip
 *   npx tsx scripts/train-lora.ts madhubani-art ./datasets/madhubani-art/madhubani-art-dataset.zip --steps 900 --rank 16
 *   npx tsx scripts/train-lora.ts tanjore-heritage ./datasets/tanjore-heritage/tanjore-heritage-dataset.zip --steps 1200 --rank 32
 *
 * Prerequisites:
 *   - FAL_KEY environment variable set
 *   - Dataset ZIP with images + optional .txt caption sidecar files
 *   - npm install -D tsx (if not installed)
 *
 * Output:
 *   - Trained LoRA URL (paste into src/lib/fal/prompts.ts)
 *   - Training config saved to ./training-runs/<slug>/<timestamp>/
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";

// ─── Environment ────────────────────────────────────────────────────────────

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY environment variable not set.");
  console.error("Run: $env:FAL_KEY='your-key-here' (PowerShell)");
  console.error("  or: export FAL_KEY=your-key-here (bash)");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

// ─── Style Metadata ─────────────────────────────────────────────────────────

interface TrainingConfig {
  triggerWord: string;
  defaultSteps: number;
  defaultRank: number;
  defaultLr: number;
  category: "bold" | "ornate" | "subtle" | "modern";
}

const STYLE_TRAINING: Record<string, TrainingConfig> = {
  "rajasthani-royal": { triggerWord: "mrs_rajasthani", defaultSteps: 1100, defaultRank: 16, defaultLr: 1e-4, category: "ornate" },
  "maratha-heritage": { triggerWord: "mrs_maratha", defaultSteps: 1100, defaultRank: 16, defaultLr: 1e-4, category: "ornate" },
  "tanjore-heritage": { triggerWord: "mrs_tanjore", defaultSteps: 1200, defaultRank: 32, defaultLr: 1e-4, category: "ornate" },
  "mysore-palace": { triggerWord: "mrs_mysore", defaultSteps: 1000, defaultRank: 16, defaultLr: 8e-5, category: "subtle" },
  "punjab-royal": { triggerWord: "mrs_punjab", defaultSteps: 1000, defaultRank: 16, defaultLr: 1e-4, category: "ornate" },
  "bengal-renaissance": { triggerWord: "mrs_bengal", defaultSteps: 1200, defaultRank: 16, defaultLr: 8e-5, category: "subtle" },
  "kerala-mural": { triggerWord: "mrs_kerala", defaultSteps: 900, defaultRank: 16, defaultLr: 1e-4, category: "bold" },
  "pahari-mountain": { triggerWord: "mrs_pahari", defaultSteps: 1200, defaultRank: 16, defaultLr: 8e-5, category: "subtle" },
  "deccani-royal": { triggerWord: "mrs_deccani", defaultSteps: 1000, defaultRank: 16, defaultLr: 1e-4, category: "ornate" },
  "miniature-art": { triggerWord: "mrs_miniature", defaultSteps: 1000, defaultRank: 16, defaultLr: 1e-4, category: "ornate" },
  "madhubani-art": { triggerWord: "mrs_madhubani", defaultSteps: 900, defaultRank: 16, defaultLr: 1e-4, category: "bold" },
  "warli-art": { triggerWord: "mrs_warli", defaultSteps: 800, defaultRank: 16, defaultLr: 1e-4, category: "bold" },
  "pichwai-art": { triggerWord: "mrs_pichwai", defaultSteps: 1100, defaultRank: 32, defaultLr: 1e-4, category: "ornate" },
  "anime-portrait": { triggerWord: "mrs_anime", defaultSteps: 800, defaultRank: 16, defaultLr: 1e-4, category: "modern" },
  "bollywood-retro": { triggerWord: "mrs_bollywood", defaultSteps: 900, defaultRank: 16, defaultLr: 1e-4, category: "modern" },
};

// ─── Argument Parsing ───────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Mirasi LoRA Training Script
============================

Usage:
  npx tsx scripts/train-lora.ts <style-slug> <dataset-zip-path> [options]

Options:
  --steps N      Training steps (default: per-style optimized)
  --rank N       LoRA rank (default: per-style optimized, 16 or 32)
  --lr N         Learning rate (default: per-style optimized)
  --no-autocap   Disable auto-captioning (use .txt sidecar files only)
  --seed N       Random seed for reproducibility
  --dry-run      Show config without starting training

Available styles (priority order):
  P0 (train first):  warli-art, madhubani-art, tanjore-heritage
  P1 (train second): kerala-mural, pichwai-art, bollywood-retro
  P2 (train third):  rajasthani-royal, pahari-mountain, bengal-renaissance, maratha-heritage
  P3 (train last):   mysore-palace, punjab-royal, deccani-royal, miniature-art, anime-portrait
`);
    process.exit(0);
  }

  const slug = args[0];
  const datasetPath = args[1];

  if (!STYLE_TRAINING[slug]) {
    console.error(`ERROR: Unknown style "${slug}".`);
    console.error(`Available: ${Object.keys(STYLE_TRAINING).join(", ")}`);
    process.exit(1);
  }

  if (!fs.existsSync(datasetPath)) {
    console.error(`ERROR: Dataset file not found: ${datasetPath}`);
    process.exit(1);
  }

  const styleConfig = STYLE_TRAINING[slug];

  // Parse optional flags
  let steps = styleConfig.defaultSteps;
  let rank = styleConfig.defaultRank;
  let lr = styleConfig.defaultLr;
  let autocaption = true;
  let seed: number | undefined;
  let dryRun = false;

  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case "--steps":
        steps = parseInt(args[++i], 10);
        break;
      case "--rank":
        rank = parseInt(args[++i], 10);
        break;
      case "--lr":
        lr = parseFloat(args[++i]);
        break;
      case "--no-autocap":
        autocaption = false;
        break;
      case "--seed":
        seed = parseInt(args[++i], 10);
        break;
      case "--dry-run":
        dryRun = true;
        break;
    }
  }

  return { slug, datasetPath, steps, rank, lr, autocaption, seed, dryRun, styleConfig };
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const { slug, datasetPath, steps, rank, lr, autocaption, seed, dryRun, styleConfig } = parseArgs();

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const runDir = path.join(process.cwd(), "training-runs", slug, timestamp);

  console.log(`
=======================================================
  Mirasi LoRA Training (Kontext Trainer)
=======================================================
  Style:           ${slug}
  Category:        ${styleConfig.category}
  Trigger Word:    ${styleConfig.triggerWord}
  Steps:           ${steps}
  Learning Rate:   ${lr}
  Dataset:         ${datasetPath}
  Output Dir:      ${runDir}
=======================================================
`);

  // Estimate cost
  const estimatedCost = (steps / 1000) * 2.5;
  console.log(`  Estimated cost: ~$${estimatedCost.toFixed(2)}\n`);

  if (dryRun) {
    console.log("  [DRY RUN] Would start training with the above config.");
    console.log("  Remove --dry-run to start actual training.\n");
    process.exit(0);
  }

  // Create run directory
  fs.mkdirSync(runDir, { recursive: true });

  // ── Step 1: Upload Dataset ZIP ──────────────────────────────────────────

  console.log("Step 1/3: Uploading dataset ZIP to fal.ai storage...");
  const startUpload = Date.now();

  const fileBuffer = fs.readFileSync(datasetPath);
  const fileName = path.basename(datasetPath);
  const file = new File([fileBuffer], fileName, { type: "application/zip" });
  const datasetUrl = await fal.storage.upload(file);

  const uploadTime = ((Date.now() - startUpload) / 1000).toFixed(1);
  console.log(`  Uploaded in ${uploadTime}s`);
  console.log(`  Dataset URL: ${datasetUrl}\n`);

  // ── Step 2: Submit Training Job ─────────────────────────────────────────

  console.log("Step 2/3: Submitting training job...");
  const startTrain = Date.now();

  // Kontext trainer API: image_data_url (singular), steps, learning_rate, default_caption
  // Dataset ZIP must have ROOT_start.EXT + ROOT_end.EXT pairs, optional ROOT.txt captions
  const defaultCaption = `A ${styleConfig.triggerWord} style image`;
  const trainingInput: Record<string, unknown> = {
    image_data_url: datasetUrl,
    steps,
    learning_rate: lr,
    default_caption: defaultCaption,
  };

  // Save training config
  const configPath = path.join(runDir, "training-config.json");
  fs.writeFileSync(configPath, JSON.stringify({
    slug,
    triggerWord: styleConfig.triggerWord,
    category: styleConfig.category,
    steps,
    lr,
    defaultCaption: `A ${styleConfig.triggerWord} style image`,
    datasetUrl,
    datasetPath,
    timestamp,
  }, null, 2));
  console.log(`  Config saved: ${configPath}`);

  let lastLogLine = "";

  try {
    const result = await fal.subscribe("fal-ai/flux-kontext-trainer", {
      input: trainingInput as never,
      logs: true,
      pollInterval: 5000,
      onQueueUpdate: (update) => {
        if (update.status === "IN_QUEUE") {
          process.stdout.write("\r  Status: In queue, waiting for GPU...");
        } else if (update.status === "IN_PROGRESS") {
          const logs = (update as { logs?: Array<{ message: string }> }).logs;
          if (logs && logs.length > 0) {
            const latestLog = logs[logs.length - 1].message;
            if (latestLog !== lastLogLine) {
              lastLogLine = latestLog;
              // Try to extract step progress
              const stepMatch = latestLog.match(/step\s+(\d+)/i);
              if (stepMatch) {
                const currentStep = parseInt(stepMatch[1], 10);
                const pct = ((currentStep / steps) * 100).toFixed(0);
                process.stdout.write(`\r  Training: step ${currentStep}/${steps} (${pct}%)     `);
              } else {
                process.stdout.write(`\r  Training: ${latestLog.substring(0, 60)}     `);
              }
            }
          }
        }
      },
    });

    const trainTime = ((Date.now() - startTrain) / 1000).toFixed(0);
    console.log(`\n  Training complete in ${trainTime}s\n`);

    // ── Step 3: Extract Results ─────────────────────────────────────────────

    console.log("Step 3/3: Extracting results...\n");

    const data = result.data as {
      diffusers_lora_file?: { url: string; file_name: string };
      config_file?: { url: string; file_name: string };
    };

    if (!data.diffusers_lora_file) {
      console.error("ERROR: No LoRA file in training output!");
      console.error("Full response:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const loraUrl = data.diffusers_lora_file.url;
    const loraFileName = data.diffusers_lora_file.file_name;

    // Save result
    const resultPath = path.join(runDir, "training-result.json");
    fs.writeFileSync(resultPath, JSON.stringify({
      loraUrl,
      loraFileName,
      configFile: data.config_file,
      trainingTimeSeconds: parseInt(trainTime, 10),
      timestamp,
    }, null, 2));

    console.log(`=======================================================`);
    console.log(`  TRAINING COMPLETE`);
    console.log(`=======================================================`);
    console.log(`  LoRA URL:      ${loraUrl}`);
    console.log(`  LoRA File:     ${loraFileName}`);
    console.log(`  Training Time: ${trainTime}s`);
    console.log(`  Estimated Cost: ~$${estimatedCost.toFixed(2)}`);
    console.log(`  Results Dir:   ${runDir}`);
    console.log(`=======================================================`);
    console.log(`
  NEXT STEPS:
  1. Update src/lib/fal/prompts.ts for "${slug}":
     - loraUrl: "${loraUrl}"
     - loraTrigger: "${styleConfig.triggerWord}"
     - numInferenceSteps: ${styleConfig.category === "bold" ? 28 : styleConfig.category === "subtle" ? 32 : 30}

  2. Test with:
     npx tsx scripts/test-lora-quality.ts ${slug}

  3. Compare LoRA vs Pro:
     npx tsx scripts/test-lora-quality.ts ${slug} --compare
`);

  } catch (err) {
    const trainTime = ((Date.now() - startTrain) / 1000).toFixed(0);
    console.error(`\n  Training FAILED after ${trainTime}s`);
    console.error(`  Error: ${err instanceof Error ? err.message : err}`);

    // Save error
    const errorPath = path.join(runDir, "training-error.json");
    fs.writeFileSync(errorPath, JSON.stringify({
      error: err instanceof Error ? err.message : String(err),
      trainingTimeSeconds: parseInt(trainTime, 10),
      timestamp,
    }, null, 2));

    process.exit(1);
  }
}

main().catch(console.error);
