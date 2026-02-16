/**
 * Training Pair Generator for Mirasi LoRA Training
 *
 * Generates "after" images from pet photos using Kontext Pro,
 * creating the before/after pairs needed for LoRA training.
 * Also generates caption .txt sidecar files for each image.
 *
 * Usage:
 *   npx tsx scripts/generate-training-pairs.ts <style-slug> <pet-photos-dir> [--limit N]
 *
 * Examples:
 *   npx tsx scripts/generate-training-pairs.ts warli-art ./datasets/pet-photos
 *   npx tsx scripts/generate-training-pairs.ts madhubani-art ./datasets/pet-photos --limit 10
 *   npx tsx scripts/generate-training-pairs.ts tanjore-heritage ./datasets/pet-photos
 *
 * Input:
 *   A directory of pet photos (JPEG/PNG). Photos should be:
 *   - At least 1024x1024 px
 *   - Square or near-square aspect ratio
 *   - Clear, well-lit subject
 *   - No watermarks
 *
 * Output:
 *   ./datasets/<style-slug>/pairs/
 *     before_001.jpg      (original pet photo, resized)
 *     after_001.jpg        (Kontext Pro generated)
 *     after_001.txt        (caption for training)
 *     ...
 *   ./datasets/<style-slug>/for-training/
 *     image_001.jpg        (the "after" images only — for ZIP packaging)
 *     image_001.txt        (captions)
 *     ...
 *
 * Prerequisites:
 *   - FAL_KEY environment variable set
 *   - Pet photos in the input directory
 *   - npm install -D tsx
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";

// ─── Environment ────────────────────────────────────────────────────────────

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY environment variable not set.");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const KONTEXT_PRO = "fal-ai/flux-pro/kontext";

// ─── Style Prompts & Config ────────────────────────────────────────────────

interface StyleTrainingPrompt {
  petPrompt: string;
  guidanceScale: number;
  triggerWord: string;
  captionTemplate: (subject: string) => string;
}

const STYLE_PROMPTS: Record<string, StyleTrainingPrompt> = {
  "warli-art": {
    petPrompt:
      "Transform this photo of a pet into Warli tribal art. Convert to white " +
      "geometric shapes on a dark terracotta brown background. Use Warli minimalist " +
      "style with circles, triangles, and lines to represent the animal. Add " +
      "traditional Warli motifs: circular sun, triangular mountains, nature borders. " +
      "Apply rice-paste on mud-wall texture. Maintain recognizable animal shape " +
      "and features in the geometric Warli style.",
    guidanceScale: 5.5,
    triggerWord: "mrs_warli",
    captionTemplate: (subject) =>
      `A mrs_warli painting of ${subject}. White geometric stick figures and shapes on dark terracotta brown background, circles, triangles, and lines, rice paste texture on mud wall, minimalist tribal art style.`,
  },
  "madhubani-art": {
    petPrompt:
      "Transform this photo of a pet into a Madhubani Mithila folk art painting. " +
      "Apply bold black ink outlines with geometric patterns filling every surface. " +
      "Use vibrant primary colors — red, yellow, blue, green. Add fish, peacock, " +
      "and lotus border motifs. Fill the background with dense geometric and floral " +
      "Madhubani patterns. Maintain the animal's exact features and expression " +
      "while applying the folk art style.",
    guidanceScale: 5.0,
    triggerWord: "mrs_madhubani",
    captionTemplate: (subject) =>
      `A mrs_madhubani painting of ${subject}. Bold black ink outlines, dense geometric and floral patterns filling every surface, vibrant red yellow blue green primary colors, fish and peacock border motifs, Mithila folk art style.`,
  },
  "tanjore-heritage": {
    petPrompt:
      "Transform this photo of a pet into a Tanjore Thanjavur painting. " +
      "Apply rich vibrant colors with prominent gold leaf embellishments. Frame the " +
      "animal in an ornate arch with South Indian decorative pillars. Add gold-bordered " +
      "cushion and floral garland details. Use the Tanjore style with semi-raised gold " +
      "textures and vivid warm color palette. Maintain the animal's exact features, " +
      "coloring, and expression.",
    guidanceScale: 5.0,
    triggerWord: "mrs_tanjore",
    captionTemplate: (subject) =>
      `A mrs_tanjore painting of ${subject}. Rich vibrant colors, prominent gold leaf embellishments, ornate arch frame with South Indian temple pillars, semi-raised gold surface texture, vivid warm color palette, Thanjavur painting style.`,
  },
  "kerala-mural": {
    petPrompt:
      "Transform this photo of a pet into a Kerala Panchavarna mural painting. " +
      "Apply bold thick black outlines with five traditional colors: yellow ochre, " +
      "red, green, blue, and white. Add decorative floral borders and lotus motifs. " +
      "Use flat perspective with ornate details characteristic of Kerala mural art. " +
      "Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 5.0,
    triggerWord: "mrs_kerala",
    captionTemplate: (subject) =>
      `A mrs_kerala mural painting of ${subject}. Bold thick black outlines, five traditional Panchavarna colors yellow ochre red green blue white, decorative lotus border motifs, flat perspective, Kerala temple mural fresco style.`,
  },
  "pichwai-art": {
    petPrompt:
      "Transform this photo of a pet into a Pichwai painting from the Nathdwara " +
      "tradition. Apply intricate lotus flower patterns throughout. Use rich dark " +
      "blue or black background with gold accents. Add decorative floral garlands " +
      "and traditional cow motifs in the border. Use Pichwai ornate floral style " +
      "with fine brushwork. Maintain the animal's exact features, coloring, " +
      "and expression.",
    guidanceScale: 4.5,
    triggerWord: "mrs_pichwai",
    captionTemplate: (subject) =>
      `A mrs_pichwai painting of ${subject}. Intricate lotus flower patterns, rich dark blue black background, gold accents, decorative floral garlands, fine ornate brushwork, Nathdwara Pichwai tradition.`,
  },
  "bollywood-retro": {
    petPrompt:
      "Transform this photo of a pet into a vintage hand-painted Bollywood movie " +
      "poster from the 1970s. Apply bold saturated colors with painted brushstroke " +
      "texture. Create dramatic composition with retro cinema lighting and dramatic " +
      "sky background. Use hand-painted movie poster style with oil paint texture. " +
      "Maintain the animal's exact features, coloring, and expression while giving " +
      "it a dramatic Bollywood star treatment.",
    guidanceScale: 4.5,
    triggerWord: "mrs_bollywood",
    captionTemplate: (subject) =>
      `A mrs_bollywood vintage hand-painted movie poster of ${subject}. Bold saturated colors, painted brushstroke texture, dramatic side lighting, 1970s retro Indian cinema aesthetic, oil paint texture, dramatic sky background.`,
  },
  "rajasthani-royal": {
    petPrompt:
      "Transform this photo of a pet into a Rajasthani Mewar miniature painting. " +
      "Apply flat perspective with ornate golden border frame, rich jewel tones of deep red " +
      "and gold. Place the animal on an ornate cushion in a palace courtyard setting with " +
      "arched pillars. Use traditional Mewar fine brushwork with visible ink outlines and " +
      "intricate floral patterns in the background. Maintain the animal's exact features, " +
      "coloring, and expression.",
    guidanceScale: 4.5,
    triggerWord: "mrs_rajasthani",
    captionTemplate: (subject) =>
      `A mrs_rajasthani Mewar miniature painting of ${subject}. Flat perspective, ornate golden border frame, rich jewel tones deep red and gold, palace courtyard arched pillars, fine brushwork with ink outlines, intricate floral patterns.`,
  },
  "pahari-mountain": {
    petPrompt:
      "Transform this photo of a pet into a Pahari Kangra miniature painting. " +
      "Apply delicate fine brushwork with soft pastel colors and rich accents. " +
      "Place the animal in a lyrical Himalayan mountain landscape with flowering " +
      "trees. Add ornamental painted border with floral patterns and serene mood. " +
      "Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 4.0,
    triggerWord: "mrs_pahari",
    captionTemplate: (subject) =>
      `A mrs_pahari Kangra miniature painting of ${subject}. Delicate fine brushwork, soft pastel colors, Himalayan mountain landscape, flowering trees, ornamental floral border, serene romantic mood, Pahari school style.`,
  },
  "bengal-renaissance": {
    petPrompt:
      "Transform this photo of a pet into a Bengal School watercolor painting. " +
      "Apply soft wash technique with flowing graceful lines and earthy muted tones " +
      "with subtle golden undertones. Create a dreamy atmospheric background. " +
      "Use delicate brushstrokes characteristic of the Bengal Renaissance style. " +
      "Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 3.5,
    triggerWord: "mrs_bengal",
    captionTemplate: (subject) =>
      `A mrs_bengal School watercolor painting of ${subject}. Soft wash technique, flowing graceful lines, earthy muted tones, subtle golden undertones, dreamy atmospheric background, delicate brushstrokes, Bengal Renaissance style.`,
  },
  "maratha-heritage": {
    petPrompt:
      "Transform this photo of a pet into a Maratha Peshwa-era court painting. " +
      "Apply bold composition with deep maroon and gold colors. Place the animal in a " +
      "regal fort setting with stone pillars and draped textiles. Use characteristic " +
      "Peshwa painting style with strong outlines and flat color fills, decorative border " +
      "with Maratha motifs. Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 4.5,
    triggerWord: "mrs_maratha",
    captionTemplate: (subject) =>
      `A mrs_maratha Peshwa-era court painting of ${subject}. Bold composition, deep maroon and gold palette, fort rampart setting, stone pillars, strong outlines, flat color fills, Maratha decorative border motifs.`,
  },
  "mysore-palace": {
    petPrompt:
      "Transform this photo of a pet into a Mysore painting in the Wodeyar tradition. " +
      "Apply elegant composition with muted gold tones and deep green accents. Place the " +
      "animal in a palatial setting with carved wooden pillars. Use refined brushwork " +
      "with subtle gold lines and the Mysore court aesthetic. " +
      "Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 4.0,
    triggerWord: "mrs_mysore",
    captionTemplate: (subject) =>
      `A mrs_mysore Wodeyar court painting of ${subject}. Elegant composition, muted gold tones, deep green accents, palatial setting, carved wooden pillars, refined brushwork, subtle thin gold lines, South Indian royal aesthetic.`,
  },
  "punjab-royal": {
    petPrompt:
      "Transform this photo of a pet into a Sikh court painting from the Punjab tradition. " +
      "Apply vibrant rich colors with ornate textile backdrop featuring embroidery patterns. " +
      "Place the animal on a cushioned throne in a darbar hall with marble pillars. " +
      "Use bold Punjabi royal color palette with warm golden lighting and decorative border. " +
      "Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 4.5,
    triggerWord: "mrs_punjab",
    captionTemplate: (subject) =>
      `A mrs_punjab Sikh court painting of ${subject}. Vibrant rich colors, ornate embroidery textile backdrop, cushioned throne, darbar hall marble pillars, bold Punjabi royal color palette, warm golden lighting, decorative border.`,
  },
  "deccani-royal": {
    petPrompt:
      "Transform this photo of a pet into a Deccani painting from the Bijapur tradition. " +
      "Apply rich luxurious colors with Persian-influenced composition. Place the animal " +
      "in an ornate setting with Islamic arches and geometric patterns. Add gold accents " +
      "and the Deccani style blending Indian and Persian elements. " +
      "Maintain the animal's exact features, coloring, and expression.",
    guidanceScale: 4.5,
    triggerWord: "mrs_deccani",
    captionTemplate: (subject) =>
      `A mrs_deccani Bijapur-Golconda painting of ${subject}. Rich luxurious colors, Persian-influenced composition, Islamic pointed arches, geometric tile patterns, gold accent details, Indian-Persian artistic fusion.`,
  },
  "miniature-art": {
    petPrompt:
      "Transform this photo of a pet into an Indo-Islamic miniature painting. " +
      "Apply intricate detailed brushwork with ornate floral arabesque border. " +
      "Place the animal in a palace garden with cypress trees and flowers. " +
      "Use rich colors with gold accents and flat perspective characteristic of " +
      "Mughal miniature art. Maintain the animal's exact features, coloring, " +
      "and expression.",
    guidanceScale: 4.5,
    triggerWord: "mrs_miniature",
    captionTemplate: (subject) =>
      `A mrs_miniature Indo-Islamic Mughal miniature painting of ${subject}. Intricate detailed brushwork, ornate floral arabesque border, palace garden with cypress trees, rich colors, gold leaf accents, flat perspective.`,
  },
  "anime-portrait": {
    petPrompt:
      "Transform this photo of a pet into Japanese anime manga art style. " +
      "Apply expressive large cute eyes, clean precise linework, and vibrant " +
      "colors. Use cel-shading with dynamic composition and soft atmospheric " +
      "background. Make the animal adorable in anime chibi style while " +
      "maintaining its exact breed features, coloring, and expression.",
    guidanceScale: 4.0,
    triggerWord: "mrs_anime",
    captionTemplate: (subject) =>
      `A mrs_anime Japanese anime art style portrait of ${subject}. Expressive large cute eyes, clean precise linework, vibrant saturated colors, cel-shading, dynamic composition, soft atmospheric background, adorable anime chibi style.`,
  },
};

// ─── Subject Detection (basic filename heuristics) ──────────────────────────

function guessSubject(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("labrador") || lower.includes("lab")) return "a golden labrador dog";
  if (lower.includes("indie") || lower.includes("pariah")) return "an Indian pariah dog";
  if (lower.includes("pomeranian") || lower.includes("pom")) return "a pomeranian dog";
  if (lower.includes("gsd") || lower.includes("german-shepherd") || lower.includes("shepherd")) return "a German shepherd dog";
  if (lower.includes("pug")) return "a pug dog";
  if (lower.includes("persian")) return "a white Persian cat";
  if (lower.includes("tabby")) return "a tabby cat";
  if (lower.includes("black-cat")) return "a black cat";
  if (lower.includes("siamese")) return "a Siamese cat";
  if (lower.includes("parrot") || lower.includes("ringneck")) return "an Indian ringneck parrot";
  if (lower.includes("rabbit") || lower.includes("bunny")) return "a rabbit";
  if (lower.includes("cat")) return "a cat";
  if (lower.includes("dog") || lower.includes("puppy")) return "a dog";
  return "an animal";
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
Mirasi Training Pair Generator
================================

Usage:
  npx tsx scripts/generate-training-pairs.ts <style-slug> <pet-photos-dir> [options]

Options:
  --limit N      Max photos to process (default: all)
  --start N      Start from photo N (for resuming, 1-indexed)
  --seed N       Base seed for reproducibility
  --skip-upload  Don't upload photos to fal, use existing URLs file

Available styles: ${Object.keys(STYLE_PROMPTS).join(", ")}
`);
    process.exit(0);
  }

  const slug = args[0];
  const photosDir = args[1];

  if (!STYLE_PROMPTS[slug]) {
    console.error(`ERROR: Unknown style "${slug}".`);
    process.exit(1);
  }

  if (!fs.existsSync(photosDir)) {
    console.error(`ERROR: Photos directory not found: ${photosDir}`);
    process.exit(1);
  }

  // Parse flags
  let limit = Infinity;
  let startFrom = 1;
  let baseSeed: number | undefined;

  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case "--limit":
        limit = parseInt(args[++i], 10);
        break;
      case "--start":
        startFrom = parseInt(args[++i], 10);
        break;
      case "--seed":
        baseSeed = parseInt(args[++i], 10);
        break;
    }
  }

  const style = STYLE_PROMPTS[slug];

  // Find all image files in the photos directory
  const imageExts = [".jpg", ".jpeg", ".png", ".webp"];
  const allPhotos = fs.readdirSync(photosDir)
    .filter(f => imageExts.includes(path.extname(f).toLowerCase()))
    .sort();

  const photos = allPhotos.slice(startFrom - 1, startFrom - 1 + limit);

  if (photos.length === 0) {
    console.error("ERROR: No image files found in", photosDir);
    process.exit(1);
  }

  // Create output directories
  const pairsDir = path.join(process.cwd(), "datasets", slug, "pairs");
  const trainingDir = path.join(process.cwd(), "datasets", slug, "for-training");
  fs.mkdirSync(pairsDir, { recursive: true });
  fs.mkdirSync(trainingDir, { recursive: true });

  console.log(`
=======================================================
  Mirasi Training Pair Generator
=======================================================
  Style:       ${slug}
  Trigger:     ${style.triggerWord}
  Guidance:    ${style.guidanceScale}
  Photos:      ${photos.length} / ${allPhotos.length}
  Pairs Dir:   ${pairsDir}
  Training Dir: ${trainingDir}
  Est. Cost:   ~$${(photos.length * 0.04).toFixed(2)} (Kontext Pro)
=======================================================
`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < photos.length; i++) {
    const photoFile = photos[i];
    const photoPath = path.join(photosDir, photoFile);
    const idx = String(i + startFrom).padStart(3, "0");
    const subject = guessSubject(photoFile);

    console.log(`\n[${i + 1}/${photos.length}] ${photoFile} → ${subject}`);

    try {
      // Upload photo to fal storage
      process.stdout.write("  Uploading...");
      const fileBuffer = fs.readFileSync(photoPath);
      const file = new File(
        [fileBuffer],
        photoFile,
        { type: photoFile.endsWith(".png") ? "image/png" : "image/jpeg" }
      );
      const uploadedUrl = await fal.storage.upload(file);
      console.log(" done");

      // Generate styled version
      process.stdout.write("  Generating...");
      const startTime = Date.now();

      const kontextInput: Record<string, unknown> = {
        image_url: uploadedUrl,
        prompt: style.petPrompt,
        guidance_scale: style.guidanceScale,
        num_inference_steps: 50,
        output_format: "jpeg",
        safety_tolerance: "2",
        ...(baseSeed !== undefined && { seed: baseSeed + i }),
      };

      const result = await fal.subscribe(KONTEXT_PRO, {
        input: kontextInput as never,
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const data = result.data as { images?: Array<{ url: string }> };

      if (!data.images || data.images.length === 0) {
        console.log(` no images returned`);
        failCount++;
        continue;
      }

      console.log(` done (${elapsed}s)`);

      // Download generated image
      process.stdout.write("  Downloading...");
      const imgResponse = await fetch(data.images[0].url);
      const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());

      // Save pair: before + after
      const beforePath = path.join(pairsDir, `before_${idx}.jpg`);
      const afterPath = path.join(pairsDir, `after_${idx}.jpg`);
      fs.copyFileSync(photoPath, beforePath);
      fs.writeFileSync(afterPath, imgBuffer);

      // Save for training: just the "after" with caption
      const trainingImgPath = path.join(trainingDir, `image_${idx}.jpg`);
      const trainingCaptionPath = path.join(trainingDir, `image_${idx}.txt`);
      fs.writeFileSync(trainingImgPath, imgBuffer);
      fs.writeFileSync(trainingCaptionPath, style.captionTemplate(subject));

      console.log(" saved");
      console.log(`  Caption: ${style.captionTemplate(subject).substring(0, 80)}...`);

      successCount++;
    } catch (err) {
      console.log(`  ERROR: ${err instanceof Error ? err.message : err}`);
      failCount++;
    }

    // Rate limit: slight delay between requests
    if (i < photos.length - 1) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  console.log(`
=======================================================
  GENERATION COMPLETE
=======================================================
  Success: ${successCount} / ${photos.length}
  Failed:  ${failCount} / ${photos.length}
  Pairs:   ${pairsDir}
  Training: ${trainingDir}

  NEXT STEPS:
  1. Review pairs in ${pairsDir}
     - Delete any poor quality after_*.jpg files
     - Remove corresponding entries from for-training/

  2. Add 5-10 authentic art reference images:
     - Add to ${trainingDir} as reference_001.jpg, etc.
     - Write captions: reference_001.txt

  3. Package for training:
     cd ${trainingDir}
     zip ../${slug}-dataset.zip *

  4. Start training:
     npx tsx scripts/train-lora.ts ${slug} ./datasets/${slug}/${slug}-dataset.zip
=======================================================
`);
}

main().catch(console.error);
