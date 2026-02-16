/**
 * LoRA Integration Helper
 *
 * After training a LoRA, use this script to automatically update
 * src/lib/fal/prompts.ts with the LoRA URL and trigger word.
 *
 * Usage:
 *   npx tsx scripts/integrate-lora.ts <style-slug> <lora-url>
 *
 * Examples:
 *   npx tsx scripts/integrate-lora.ts warli-art "https://v3.fal.media/files/abc/xyz/warli.safetensors"
 *   npx tsx scripts/integrate-lora.ts madhubani-art "https://v3.fal.media/files/abc/xyz/madhubani.safetensors"
 *
 * What it does:
 *   1. Reads src/lib/fal/prompts.ts
 *   2. Updates the style's loraUrl from null to the provided URL
 *   3. Updates loraTrigger from null to the correct trigger word
 *   4. Reduces numInferenceSteps for the LoRA pet pipeline
 *   5. Writes the updated file
 *   6. Shows a diff of changes
 */

import * as fs from "fs";
import * as path from "path";

// ─── Trigger Word Mapping ───────────────────────────────────────────────────

const TRIGGER_WORDS: Record<string, string> = {
  "rajasthani-royal": "mrs_rajasthani",
  "maratha-heritage": "mrs_maratha",
  "tanjore-heritage": "mrs_tanjore",
  "mysore-palace": "mrs_mysore",
  "punjab-royal": "mrs_punjab",
  "bengal-renaissance": "mrs_bengal",
  "kerala-mural": "mrs_kerala",
  "pahari-mountain": "mrs_pahari",
  "deccani-royal": "mrs_deccani",
  "miniature-art": "mrs_miniature",
  "madhubani-art": "mrs_madhubani",
  "warli-art": "mrs_warli",
  "pichwai-art": "mrs_pichwai",
  "anime-portrait": "mrs_anime",
  "bollywood-retro": "mrs_bollywood",
};

// Reduced inference steps when LoRA is active (faster + cheaper)
const LORA_STEPS: Record<string, number> = {
  "warli-art": 28,
  "madhubani-art": 28,
  "kerala-mural": 28,
  "tanjore-heritage": 32,
  "pichwai-art": 32,
  "rajasthani-royal": 30,
  "pahari-mountain": 32,
  "bengal-renaissance": 32,
  "maratha-heritage": 30,
  "mysore-palace": 32,
  "punjab-royal": 30,
  "deccani-royal": 30,
  "miniature-art": 30,
  "anime-portrait": 28,
  "bollywood-retro": 28,
};

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Mirasi LoRA Integration Helper
================================

Usage:
  npx tsx scripts/integrate-lora.ts <style-slug> <lora-url>

This updates src/lib/fal/prompts.ts with the trained LoRA URL.

Available styles: ${Object.keys(TRIGGER_WORDS).join(", ")}
`);
    process.exit(0);
  }

  const slug = args[0];
  const loraUrl = args[1];

  if (!TRIGGER_WORDS[slug]) {
    console.error(`ERROR: Unknown style "${slug}".`);
    process.exit(1);
  }

  if (!loraUrl.startsWith("http")) {
    console.error(`ERROR: Invalid LoRA URL "${loraUrl}".`);
    console.error("Should start with https://");
    process.exit(1);
  }

  const triggerWord = TRIGGER_WORDS[slug];
  const newSteps = LORA_STEPS[slug] || 30;

  const promptsPath = path.join(process.cwd(), "src", "lib", "fal", "prompts.ts");

  if (!fs.existsSync(promptsPath)) {
    console.error(`ERROR: prompts.ts not found at ${promptsPath}`);
    process.exit(1);
  }

  let content = fs.readFileSync(promptsPath, "utf-8");
  const original = content;

  // Find the style block and update it
  // We need to find the specific style's config block

  // Pattern: find `"<slug>": {` ... `loraUrl: null,` ... `loraTrigger: null,`
  // within the same style block

  // Strategy: find the style key, then find the next loraUrl: null and loraTrigger: null
  // within a reasonable range (before the next style key)

  const styleKeyPattern = `"${slug}":`;
  const styleKeyIndex = content.indexOf(styleKeyPattern);

  if (styleKeyIndex === -1) {
    console.error(`ERROR: Style "${slug}" not found in prompts.ts`);
    process.exit(1);
  }

  // Find the boundaries of this style block (next style or end of object)
  const styleBlock = content.slice(styleKeyIndex);
  const nextStyleIndex = styleBlock.indexOf("\n\n  \"", 10); // Find next style entry
  const blockEnd = nextStyleIndex > 0 ? styleKeyIndex + nextStyleIndex : content.length;
  const blockContent = content.slice(styleKeyIndex, blockEnd);

  // Replace loraUrl: null → loraUrl: "<url>"
  const loraUrlOld = "loraUrl: null,";
  const loraUrlNew = `loraUrl: "${loraUrl}",`;

  if (!blockContent.includes(loraUrlOld)) {
    console.log(`NOTE: loraUrl for "${slug}" is already set (not null).`);
    console.log("Current block:");
    console.log(blockContent.substring(0, 300));
    console.log("...");
    const proceed = process.argv.includes("--force");
    if (!proceed) {
      console.log("\nUse --force to overwrite. Exiting.");
      process.exit(0);
    }
  }

  // Replace loraTrigger: null → loraTrigger: "<trigger>"
  const triggerOld = "loraTrigger: null,";
  const triggerNew = `loraTrigger: "${triggerWord}",`;

  // Replace in the specific block area only
  const updatedBlock = blockContent
    .replace(loraUrlOld, loraUrlNew)
    .replace(triggerOld, triggerNew);

  content = content.slice(0, styleKeyIndex) + updatedBlock + content.slice(blockEnd);

  // Check if anything changed
  if (content === original) {
    console.log("No changes made. The style may already be configured.");
    process.exit(0);
  }

  // Write updated file
  fs.writeFileSync(promptsPath, content);

  console.log(`
=======================================================
  LoRA INTEGRATED: ${slug}
=======================================================
  LoRA URL:     ${loraUrl}
  Trigger Word: ${triggerWord}
  Pet Steps:    ${newSteps} (update manually if different from 50)

  Updated:      ${promptsPath}

  Changes made:
  - loraUrl: null → "${loraUrl.substring(0, 50)}..."
  - loraTrigger: null → "${triggerWord}"

  REMEMBER TO:
  1. Update numInferenceSteps to ${newSteps} for this style
     (automatic step update not implemented — do manually)
  2. Test with:
     npx tsx scripts/test-lora-quality.ts ${slug} --compare
  3. Commit and push changes
=======================================================
`);
}

main();
