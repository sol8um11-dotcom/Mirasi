/**
 * Comprehensive Style Test Runner
 *
 * Tests multiple styles with both human and pet subjects.
 * Uses free Unsplash photos for testing.
 * Generates all images and creates a summary report.
 *
 * Usage: FAL_KEY=<key> npx tsx scripts/run-style-tests.ts [--all | --p0 | --style slug]
 */

import { fal } from "@fal-ai/client";
import * as fs from "fs";
import * as path from "path";
import { buildPrompt, getStyleConfig } from "../src/lib/fal/prompts";

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) {
  console.error("ERROR: FAL_KEY not set");
  process.exit(1);
}

fal.config({ credentials: FAL_KEY });

const KONTEXT_PRO = "fal-ai/flux-pro/kontext";

// ─── Free test images from Unsplash (direct URLs, free to use) ─────────────

const TEST_SUBJECTS = {
  human_male: {
    label: "Human Male Portrait",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1024&q=80",
  },
  human_female: {
    label: "Human Female Portrait",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1024&q=80",
  },
  dog_labrador: {
    label: "Golden Labrador",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=1024&q=80",
  },
  cat_tabby: {
    label: "Tabby Cat",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1024&q=80",
  },
  dog_indie: {
    label: "Indie Dog",
    url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1024&q=80",
  },
};

// ─── Style groups ──────────────────────────────────────────────────────────

const P0_STYLES = ["warli-art", "madhubani-art", "tanjore-heritage"];
const P1_STYLES = ["kerala-mural", "pichwai-art", "bollywood-retro"];
const P2_STYLES = ["rajasthani-royal", "pahari-mountain", "bengal-renaissance", "maratha-heritage"];
const P3_STYLES = ["mysore-palace", "punjab-royal", "deccani-royal", "miniature-art", "anime-portrait"];
const ALL_STYLES = [...P0_STYLES, ...P1_STYLES, ...P2_STYLES, ...P3_STYLES];

// ─── Generate a single image ───────────────────────────────────────────────

async function generateImage(
  imageUrl: string,
  slug: string,
  subjectType: "human" | "pet",
): Promise<{ url: string; timeMs: number; width: number; height: number }> {
  const config = getStyleConfig(slug);
  const prompt = buildPrompt(slug, subjectType);

  const start = Date.now();
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

  const data = result.data as { images?: Array<{ url: string; width: number; height: number }> };
  if (!data.images || data.images.length === 0) {
    throw new Error("No images returned");
  }

  return {
    url: data.images[0].url,
    timeMs: Date.now() - start,
    width: data.images[0].width,
    height: data.images[0].height,
  };
}

// ─── Download image to disk ────────────────────────────────────────────────

async function downloadImage(url: string, filepath: string): Promise<number> {
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filepath, buffer);
  return buffer.length;
}

// ─── Main ──────────────────────────────────────────────────────────────────

interface TestResult {
  style: string;
  subject: string;
  subjectType: "human" | "pet";
  timeMs: number;
  width: number;
  height: number;
  fileSize: number;
  filePath: string;
  error?: string;
}

async function main() {
  const args = process.argv.slice(2);

  // Determine which styles to test
  let stylesToTest: string[];
  let testName: string;

  if (args.includes("--all")) {
    stylesToTest = ALL_STYLES;
    testName = "all-styles";
  } else if (args.includes("--p0")) {
    stylesToTest = P0_STYLES;
    testName = "p0-styles";
  } else if (args.includes("--p1")) {
    stylesToTest = P1_STYLES;
    testName = "p1-styles";
  } else if (args.includes("--style")) {
    const idx = args.indexOf("--style");
    const slug = args[idx + 1];
    if (!slug || !ALL_STYLES.includes(slug)) {
      console.error(`Invalid style: ${slug}`);
      console.error(`Available: ${ALL_STYLES.join(", ")}`);
      process.exit(1);
    }
    stylesToTest = [slug];
    testName = slug;
  } else {
    // Default: P0 + 2 representative others
    stylesToTest = [...P0_STYLES, "rajasthani-royal", "anime-portrait"];
    testName = "p0-plus-samples";
  }

  // Determine which subjects to test
  const humanOnly = args.includes("--human-only");
  const petOnly = args.includes("--pet-only");

  interface TestPlan {
    style: string;
    subjectKey: string;
    subjectType: "human" | "pet";
    imageUrl: string;
    label: string;
  }

  const testPlan: TestPlan[] = [];

  for (const style of stylesToTest) {
    if (!petOnly) {
      // One human test per style
      testPlan.push({
        style,
        subjectKey: "human_male",
        subjectType: "human",
        imageUrl: TEST_SUBJECTS.human_male.url,
        label: TEST_SUBJECTS.human_male.label,
      });
    }
    if (!humanOnly) {
      // One pet test per style
      testPlan.push({
        style,
        subjectKey: "dog_labrador",
        subjectType: "pet",
        imageUrl: TEST_SUBJECTS.dog_labrador.url,
        label: TEST_SUBJECTS.dog_labrador.label,
      });
    }
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = path.join(process.cwd(), "test-outputs", `${testName}_${timestamp}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const estCost = testPlan.length * 0.04;
  console.log(`
=======================================================
  Mirasi Style Test Runner
=======================================================
  Styles:    ${stylesToTest.length} (${stylesToTest.join(", ")})
  Tests:     ${testPlan.length} total generations
  Output:    ${outputDir}
  Est. Cost: ~$${estCost.toFixed(2)}
=======================================================
`);

  const results: TestResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < testPlan.length; i++) {
    const test = testPlan[i];
    const idx = String(i + 1).padStart(2, "0");
    const config = getStyleConfig(test.style);

    console.log(`[${i + 1}/${testPlan.length}] ${test.style} × ${test.label} (${test.subjectType})`);
    console.log(`  Guidance: ${config.guidanceScale}, Steps: ${config.numInferenceSteps}`);

    try {
      const gen = await generateImage(test.imageUrl, test.style, test.subjectType);

      const filename = `${idx}_${test.style}_${test.subjectType}.jpg`;
      const filepath = path.join(outputDir, filename);
      const fileSize = await downloadImage(gen.url, filepath);

      results.push({
        style: test.style,
        subject: test.label,
        subjectType: test.subjectType,
        timeMs: gen.timeMs,
        width: gen.width,
        height: gen.height,
        fileSize,
        filePath: filename,
      });

      successCount++;
      console.log(`  Done in ${(gen.timeMs / 1000).toFixed(1)}s — ${gen.width}x${gen.height} — ${(fileSize / 1024).toFixed(0)}KB`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      results.push({
        style: test.style,
        subject: test.label,
        subjectType: test.subjectType,
        timeMs: 0,
        width: 0,
        height: 0,
        fileSize: 0,
        filePath: "",
        error: errMsg,
      });

      failCount++;
      console.log(`  FAILED: ${errMsg}`);
    }

    // Small delay between requests to be polite
    if (i < testPlan.length - 1) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // ─── Generate Report ──────────────────────────────────────────────────

  const avgTime = results.filter(r => r.timeMs > 0).reduce((sum, r) => sum + r.timeMs, 0) /
    (results.filter(r => r.timeMs > 0).length || 1);

  const report = {
    testName,
    timestamp,
    summary: {
      total: testPlan.length,
      success: successCount,
      failed: failCount,
      avgTimeMs: Math.round(avgTime),
      avgTimeSec: (avgTime / 1000).toFixed(1),
      estimatedCost: `$${(successCount * 0.04).toFixed(2)}`,
    },
    results,
  };

  const reportPath = path.join(outputDir, "report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Generate visual review markdown
  let md = `# Style Test Results: ${testName}\n\n`;
  md += `**Date:** ${timestamp}\n`;
  md += `**Total:** ${successCount}/${testPlan.length} successful\n`;
  md += `**Avg Time:** ${(avgTime / 1000).toFixed(1)}s\n`;
  md += `**Cost:** ~$${(successCount * 0.04).toFixed(2)}\n\n`;

  md += `## Results\n\n`;
  md += `| # | Style | Subject | Time | Size | Quality (1-5) | Notes |\n`;
  md += `|---|-------|---------|------|------|---------------|-------|\n`;

  results.forEach((r, i) => {
    if (r.error) {
      md += `| ${i + 1} | ${r.style} | ${r.subject} | FAIL | - | - | ${r.error} |\n`;
    } else {
      md += `| ${i + 1} | ${r.style} | ${r.subject} | ${(r.timeMs / 1000).toFixed(1)}s | ${r.width}x${r.height} | _/5 | |\n`;
    }
  });

  md += `\n## Style Fidelity Notes\n\n`;
  for (const style of stylesToTest) {
    md += `### ${style}\n`;
    md += `- Human: \n`;
    md += `- Pet: \n\n`;
  }

  const mdPath = path.join(outputDir, "review.md");
  fs.writeFileSync(mdPath, md);

  console.log(`
=======================================================
  TEST COMPLETE
=======================================================
  Success:   ${successCount} / ${testPlan.length}
  Failed:    ${failCount}
  Avg Time:  ${(avgTime / 1000).toFixed(1)}s per image
  Cost:      ~$${(successCount * 0.04).toFixed(2)}
  Report:    ${reportPath}
  Review:    ${mdPath}
  Images:    ${outputDir}

  Next: Open ${outputDir} and review image quality!
=======================================================
`);
}

main().catch(console.error);
