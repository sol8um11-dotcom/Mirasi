import sharp from "sharp";
import { WATERMARK_TEXT, WATERMARK_OPACITY } from "@/lib/constants";

/**
 * Apply a saffron/gold metallic "Mirasi" watermark grid to an image.
 * Server-only — uses Sharp (not available in browser).
 *
 * Design:
 * - 4x4 grid of rotated text covering the full image
 * - Saffron-gold (#C75B12) primary fill with metallic gold (#D4A843) stroke
 * - Subtle drop-shadow for embossed "ancient coin" feel
 * - Difficult to crop out while remaining semi-transparent
 */
export async function watermarkImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 768;
  const height = metadata.height || 1024;

  // Scale font size relative to image dimensions
  const fontSize = Math.max(Math.round(Math.min(width, height) / 14), 28);
  const text = WATERMARK_TEXT;
  const opacity = WATERMARK_OPACITY;

  // Build SVG watermark overlay — 4x4 grid for better coverage on portrait images
  const positions: Array<{ x: number; y: number }> = [];
  const rows = 4;
  const cols = 4;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      positions.push({
        x: Math.round((width * (col + 0.5)) / cols),
        y: Math.round((height * (row + 0.5)) / rows),
      });
    }
  }

  const textElements = positions
    .map(
      ({ x, y }) =>
        `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" transform="rotate(-30, ${x}, ${y})">${text}</text>`
    )
    .join("\n    ");

  // Saffron-gold metallic watermark with embossed ancient feel
  // Primary fill: saffron gold, Stroke: darker gold for metallic edge
  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="wm-emboss" x="-5%" y="-5%" width="110%" height="110%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feOffset in="blur" dx="1" dy="1.5" result="shadow" />
          <feFlood flood-color="#3D1A00" flood-opacity="${opacity * 0.4}" result="shadowFill" />
          <feComposite in="shadowFill" in2="shadow" operator="in" result="dropShadow" />
          <feMerge>
            <feMergeNode in="dropShadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#wm-emboss)">
        <style>
          text {
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: ${fontSize}px;
            font-weight: 700;
            fill: rgba(199, 91, 18, ${opacity});
            paint-order: stroke;
            stroke: rgba(212, 168, 67, ${opacity * 0.6});
            stroke-width: 1.5px;
            letter-spacing: 0.15em;
          }
        </style>
        ${textElements}
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
