/**
 * Training Directory Setup Script
 *
 * Creates the full directory structure for LoRA training datasets.
 * Run once before starting dataset collection.
 *
 * Usage:
 *   npx tsx scripts/setup-training-dirs.ts
 *
 * Creates:
 *   datasets/
 *     pet-photos/            ← Put 40-50 diverse pet photos here
 *       README.txt
 *     test-photos/           ← Put 10 held-out test photos here (never used in training)
 *       README.txt
 *     <style-slug>/          ← One per style
 *       pairs/               ← Before/after pairs (for review)
 *       for-training/        ← Training images + captions (for ZIP)
 *       references/          ← Authentic art reference images
 *       README.txt
 *   training-runs/           ← Training job outputs (auto-created by train-lora.ts)
 */

import * as fs from "fs";
import * as path from "path";

const STYLES = [
  { slug: "warli-art", priority: "P0", name: "Warli Art" },
  { slug: "madhubani-art", priority: "P0", name: "Madhubani Art" },
  { slug: "tanjore-heritage", priority: "P0", name: "Tanjore Heritage" },
  { slug: "kerala-mural", priority: "P1", name: "Kerala Mural" },
  { slug: "pichwai-art", priority: "P1", name: "Pichwai Art" },
  { slug: "bollywood-retro", priority: "P1", name: "Bollywood Retro" },
  { slug: "rajasthani-royal", priority: "P2", name: "Rajasthani Royal" },
  { slug: "pahari-mountain", priority: "P2", name: "Pahari Mountain" },
  { slug: "bengal-renaissance", priority: "P2", name: "Bengal Renaissance" },
  { slug: "maratha-heritage", priority: "P2", name: "Maratha Heritage" },
  { slug: "mysore-palace", priority: "P3", name: "Mysore Palace" },
  { slug: "punjab-royal", priority: "P3", name: "Punjab Royal" },
  { slug: "deccani-royal", priority: "P3", name: "Deccani Royal" },
  { slug: "miniature-art", priority: "P3", name: "Miniature Art" },
  { slug: "anime-portrait", priority: "P3", name: "Anime Portrait" },
];

const BASE = process.cwd();

function mkdirSafe(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  Created: ${path.relative(BASE, dirPath)}`);
  } else {
    console.log(`  Exists:  ${path.relative(BASE, dirPath)}`);
  }
}

function writeIfNew(filePath: string, content: string): void {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`  Created: ${path.relative(BASE, filePath)}`);
  }
}

function main() {
  console.log(`
=======================================================
  Mirasi Training Directory Setup
=======================================================
`);

  // ── Pet Photos ──────────────────────────────────────────────────────────

  console.log("Setting up pet-photos directory...");
  const petPhotosDir = path.join(BASE, "datasets", "pet-photos");
  mkdirSafe(petPhotosDir);
  writeIfNew(
    path.join(petPhotosDir, "README.txt"),
    `PET PHOTOS FOR LORA TRAINING
============================

Place 40-50 diverse pet photos here for generating training pairs.

Requirements:
- Resolution: At least 1024x1024 px (square preferred)
- Format: JPEG or PNG
- Quality: No compression artifacts, no watermarks
- Subject: Clear, well-lit, centered pet

Diversity targets:
- Dogs: 15+ breeds (Labrador, Indie, Pomeranian, GSD, Pug, etc.)
- Cats: 10+ varieties (Persian, Indie, Siamese, tabby, etc.)
- Other: 5-8 images (parrot, rabbit, hamster)
- Poses: Front-facing, side profile, sitting, lying down
- Lighting: Indoor, outdoor, studio, natural light

Naming convention (helps auto-captioning):
- labrador_01.jpg, indie-dog_01.jpg, persian-cat_01.jpg
- pomeranian_01.jpg, gsd_01.jpg, pug_01.jpg
- tabby-cat_01.jpg, black-cat_01.jpg, parrot_01.jpg

Sources (free commercial use):
- Unsplash: unsplash.com (search "dog portrait", "cat close up")
- Pexels: pexels.com (search "pet portrait")
- Open Images Dataset: storage.googleapis.com/openimages

DO NOT use these photos in the test-photos/ directory.
`
  );

  // ── Test Photos ─────────────────────────────────────────────────────────

  console.log("\nSetting up test-photos directory...");
  const testPhotosDir = path.join(BASE, "datasets", "test-photos");
  mkdirSafe(testPhotosDir);
  writeIfNew(
    path.join(testPhotosDir, "README.txt"),
    `TEST PHOTOS (HELD-OUT SET)
==========================

Place exactly 10 pet photos here. These are NEVER used in training.
They're used only for evaluating trained LoRA quality.

Required test set (one of each):
1. labrador_01.jpg     - Golden Labrador, front-facing
2. indie-dog_01.jpg    - Indian pariah dog, side profile
3. pomeranian_01.jpg   - Pomeranian, sitting
4. gsd_01.jpg          - German Shepherd, standing
5. persian-cat_01.jpg  - White Persian cat, front-facing
6. tabby-cat_01.jpg    - Indie tabby cat, lying down
7. black-cat_01.jpg    - Black cat, sitting
8. parrot_01.jpg       - Indian Ringneck parrot, perched
9. pug_01.jpg          - Pug, close-up face
10. indie-dark_01.jpg  - Dark indie dog, outdoor natural light

IMPORTANT: These must be different photos from pet-photos/ directory.
DO NOT use any of these photos for training.
`
  );

  // ── Style Directories ─────────────────────────────────────────────────

  console.log("\nSetting up style directories...");
  for (const style of STYLES) {
    console.log(`\n  [${style.priority}] ${style.name} (${style.slug}):`);

    const styleDir = path.join(BASE, "datasets", style.slug);
    mkdirSafe(path.join(styleDir, "pairs"));
    mkdirSafe(path.join(styleDir, "for-training"));
    mkdirSafe(path.join(styleDir, "references"));

    writeIfNew(
      path.join(styleDir, "README.txt"),
      `${style.name.toUpperCase()} TRAINING DATA
${"=".repeat(style.name.length + 14)}

Priority: ${style.priority}
Slug: ${style.slug}

Directory structure:
  pairs/          - Before/after pairs generated by generate-training-pairs.ts
                    before_001.jpg (original photo)
                    after_001.jpg  (Kontext Pro styled)
                    Used for manual review only.

  for-training/   - Training images + captions (for ZIP packaging)
                    image_001.jpg  (styled "after" images)
                    image_001.txt  (caption text files)
                    Also add reference images here.

  references/     - Authentic ${style.name} art from museums/public domain
                    Place 5-10 high-quality reference images here.
                    These will be manually added to for-training/ with captions.

Workflow:
  1. Run: npx tsx scripts/generate-training-pairs.ts ${style.slug} ./datasets/pet-photos
  2. Review pairs/ — delete poor quality outputs
  3. Add reference images from references/ to for-training/
  4. ZIP for-training/ contents: cd for-training && zip ../${style.slug}-dataset.zip *
  5. Train: npx tsx scripts/train-lora.ts ${style.slug} ./datasets/${style.slug}/${style.slug}-dataset.zip
`
    );
  }

  // ── Training Runs ────────────────────────────────────────────────────

  console.log("\nSetting up training-runs directory...");
  mkdirSafe(path.join(BASE, "training-runs"));
  writeIfNew(
    path.join(BASE, "training-runs", "README.txt"),
    `TRAINING RUNS
=============

This directory is auto-populated by train-lora.ts.

Structure:
  <style-slug>/
    <timestamp>/
      training-config.json  - Parameters used
      training-result.json  - LoRA URL and metadata
      training-error.json   - Error details (if failed)
`
  );

  // ── Update .gitignore ──────────────────────────────────────────────────

  const gitignorePath = path.join(BASE, ".gitignore");
  const gitignore = fs.readFileSync(gitignorePath, "utf-8");

  const additions = [
    "",
    "# training data (large files, not for git)",
    "/datasets",
    "/training-runs",
  ];

  const newEntries = additions.filter(entry =>
    entry === "" || !gitignore.includes(entry)
  );

  if (newEntries.length > 1) {
    fs.appendFileSync(gitignorePath, "\n" + newEntries.join("\n") + "\n");
    console.log("\nUpdated .gitignore with dataset/training exclusions");
  }

  // ── Summary ───────────────────────────────────────────────────────────

  console.log(`
=======================================================
  SETUP COMPLETE
=======================================================

  Directory structure created at: ${path.join(BASE, "datasets")}

  NEXT STEPS:

  1. Collect pet photos:
     - Download 40-50 diverse pet photos to datasets/pet-photos/
     - Download 10 test photos to datasets/test-photos/
     - Sources: Unsplash, Pexels (free commercial use)

  2. Collect reference art:
     - For each P0 style (warli, madhubani, tanjore):
       Add 5-10 authentic art images to datasets/<style>/references/
     - Sources: See docs/lora-training-guide.md Section 2.2

  3. Generate training pairs (P0 first):
     npx tsx scripts/generate-training-pairs.ts warli-art ./datasets/pet-photos
     npx tsx scripts/generate-training-pairs.ts madhubani-art ./datasets/pet-photos
     npx tsx scripts/generate-training-pairs.ts tanjore-heritage ./datasets/pet-photos

  4. Review and curate:
     Open datasets/<style>/pairs/ and delete poor outputs

  5. Package and train:
     See docs/lora-training-guide.md for full workflow

=======================================================
`);
}

main();
