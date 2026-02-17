import sharp from "sharp";
import { WATERMARK_TEXT } from "@/lib/constants";

/**
 * Apply a diagonal ribbon watermark across the preview image.
 * Server-only — uses Sharp (not available in browser).
 *
 * Design:
 * - Semi-transparent saffron-gold ribbon across the lower-right corner
 * - "Mirasi" text on the ribbon in white with gold stroke
 * - Repeated subtle "Mirasi" text grid behind for crop-resistance
 * - Professional, premium feel — not obtrusive but clearly watermarked
 */
export async function watermarkImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  const text = WATERMARK_TEXT;

  // ─── Layer 1: Subtle background grid (crop-resistant) ───────────────
  const gridFontSize = Math.max(Math.round(Math.min(width, height) / 18), 20);
  const gridPositions: Array<{ x: number; y: number }> = [];
  const rows = 5;
  const cols = 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      gridPositions.push({
        x: Math.round((width * (col + 0.5)) / cols),
        y: Math.round((height * (row + 0.5)) / rows),
      });
    }
  }
  const gridText = gridPositions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
          transform="rotate(-30, ${x}, ${y})"
          font-family="Georgia, serif" font-size="${gridFontSize}px" font-weight="700"
          fill="rgba(199, 91, 18, 0.12)" letter-spacing="0.15em">${text}</text>`
    )
    .join("\n    ");

  // ─── Layer 2: Diagonal ribbon banner ────────────────────────────────
  // Ribbon runs from lower-left to upper-right area
  const ribbonWidth = Math.round(Math.min(width, height) * 0.12);
  const ribbonFontSize = Math.max(Math.round(ribbonWidth * 0.38), 16);
  const ribbonSmallFont = Math.max(Math.round(ribbonWidth * 0.2), 10);

  // Ribbon center point — positioned in lower-right quadrant
  const cx = width * 0.65;
  const cy = height * 0.65;
  const ribbonLength = Math.sqrt(width * width + height * height);
  const halfLen = ribbonLength / 2;

  // Ribbon angle: -35 degrees (bottom-left to top-right diagonal)
  const angle = -35;
  const rad = (angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // Ribbon endpoints
  const x1 = cx - halfLen * cosA;
  const y1 = cy - halfLen * sinA;
  const x2 = cx + halfLen * cosA;
  const y2 = cy + halfLen * sinA;

  // Perpendicular offset for ribbon width
  const hw = ribbonWidth / 2;
  const px = -sinA * hw;
  const py = cosA * hw;

  // Four corners of the ribbon rectangle
  const p1 = `${x1 + px},${y1 + py}`;
  const p2 = `${x2 + px},${y2 + py}`;
  const p3 = `${x2 - px},${y2 - py}`;
  const p4 = `${x1 - px},${y1 - py}`;

  // Text positions along the ribbon — repeat "Mirasi" multiple times
  const textPositions: Array<{ x: number; y: number }> = [];
  const spacing = ribbonFontSize * 5;
  const numTexts = Math.ceil(ribbonLength / spacing) + 1;
  const startOffset = -halfLen + spacing * 0.5;

  for (let i = 0; i < numTexts; i++) {
    const t = startOffset + i * spacing;
    textPositions.push({
      x: cx + t * cosA,
      y: cy + t * sinA,
    });
  }

  const ribbonTextElements = textPositions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
          transform="rotate(${angle}, ${x}, ${y})"
          font-family="Georgia, serif" font-size="${ribbonFontSize}px" font-weight="700"
          fill="rgba(255, 255, 255, 0.92)" letter-spacing="0.2em"
          paint-order="stroke" stroke="rgba(184, 134, 46, 0.7)" stroke-width="1.5px"
        >${text}</text>`
    )
    .join("\n    ");

  // "Preview" text in smaller font, placed between main texts
  const previewPositions = textPositions.slice(0, -1).map(({ x, y }, i) => {
    const next = textPositions[i + 1];
    return {
      x: (x + next.x) / 2,
      y: (y + next.y) / 2 + ribbonWidth * 0.22,
    };
  });

  const previewTextElements = previewPositions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central"
          transform="rotate(${angle}, ${x}, ${y})"
          font-family="Georgia, serif" font-size="${ribbonSmallFont}px" font-weight="400"
          fill="rgba(255, 255, 255, 0.6)" letter-spacing="0.3em"
          font-style="italic"
        >PREVIEW</text>`
    )
    .join("\n    ");

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ribbon-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
          <feOffset in="blur" dx="2" dy="3" result="shadow" />
          <feFlood flood-color="#000000" flood-opacity="0.35" result="shadowFill" />
          <feComposite in="shadowFill" in2="shadow" operator="in" result="dropShadow" />
          <feMerge>
            <feMergeNode in="dropShadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <!-- Subtle background grid for crop-resistance -->
      ${gridText}

      <!-- Diagonal ribbon with drop shadow -->
      <g filter="url(#ribbon-shadow)">
        <polygon points="${p1} ${p2} ${p3} ${p4}"
          fill="rgba(180, 90, 20, 0.72)" />

        <!-- Gold edge lines -->
        <line x1="${x1 + px}" y1="${y1 + py}" x2="${x2 + px}" y2="${y2 + py}"
          stroke="rgba(212, 168, 67, 0.8)" stroke-width="1.5" />
        <line x1="${x1 - px}" y1="${y1 - py}" x2="${x2 - px}" y2="${y2 - py}"
          stroke="rgba(212, 168, 67, 0.8)" stroke-width="1.5" />

        <!-- Mirasi text on ribbon -->
        ${ribbonTextElements}
        ${previewTextElements}
      </g>
    </svg>
  `);

  // Composite watermark onto image
  const watermarked = await sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();

  return watermarked;
}
