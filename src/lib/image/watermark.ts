import sharp from "sharp";
import { WATERMARK_TEXT, WATERMARK_OPACITY } from "@/lib/constants";

/**
 * Apply a diagonal "Mirasi" text watermark grid to an image.
 * Server-only — uses Sharp (not available in browser).
 *
 * The watermark is a 3x3 grid of rotated text overlaid on the image,
 * making it difficult to crop out while remaining semi-transparent.
 */
export async function watermarkImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;

  // Scale font size relative to image dimensions
  const fontSize = Math.max(Math.round(Math.min(width, height) / 12), 32);
  const text = WATERMARK_TEXT;

  // Build SVG watermark overlay — 3x3 grid of rotated text
  const positions: Array<{ x: number; y: number }> = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      positions.push({
        x: Math.round((width * (col + 0.5)) / 3),
        y: Math.round((height * (row + 0.5)) / 3),
      });
    }
  }

  const textElements = positions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" transform="rotate(-30, ${x}, ${y})">${text}</text>`
    )
    .join("\n    ");

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>
        text {
          font-family: sans-serif;
          font-size: ${fontSize}px;
          font-weight: 700;
          fill: rgba(255, 255, 255, ${WATERMARK_OPACITY});
          paint-order: stroke;
          stroke: rgba(0, 0, 0, ${WATERMARK_OPACITY * 0.5});
          stroke-width: 2px;
          letter-spacing: 0.1em;
        }
      </style>
      ${textElements}
    </svg>
  `);

  // Composite watermark onto image
  const watermarked = await sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();

  return watermarked;
}
