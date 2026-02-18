import sharp from "sharp";

/**
 * Professional Mirasi watermark for preview images.
 * Server-only — uses Sharp (not available in browser).
 *
 * Design: Clean, minimal, professional — like Getty/Shutterstock.
 *  - Sparse diagonal "mirasi" text, widely spaced, very low opacity
 *  - Thin single-line text (not bold) so it doesn't dominate the artwork
 *  - No logo overlay — let the art speak for itself
 *  - Subtle enough to evaluate art quality but present enough to deter theft
 */
export async function watermarkImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;
  const minDim = Math.min(width, height);

  // ─── Sizing — sparse and subtle ─────────────────────────────────────
  const fontSize = Math.max(Math.round(minDim / 22), 18);
  const gridSpacingX = Math.round(fontSize * 14); // Wide horizontal spacing
  const gridSpacingY = Math.round(fontSize * 9);  // Wide vertical spacing

  // ─── Sparse diagonal text grid ──────────────────────────────────────
  const diagonal = Math.sqrt(width * width + height * height);
  const cols = Math.ceil(diagonal / gridSpacingX) + 2;
  const rows = Math.ceil(diagonal / gridSpacingY) + 2;
  const offsetX = (diagonal - width) / 2;
  const offsetY = (diagonal - height) / 2;

  let textElements = "";
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * gridSpacingX - offsetX;
      const y = row * gridSpacingY - offsetY;
      const stagger = row % 2 === 0 ? 0 : gridSpacingX / 2;
      textElements += `
        <text x="${x + stagger}" y="${y}"
          font-family="'Urbanist', 'Inter', Arial, sans-serif"
          font-size="${fontSize}px" font-weight="400"
          fill="rgba(255,255,255,0.12)"
          letter-spacing="0.2em">mirasi</text>`;
    }
  }

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ts" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.25"/>
        </filter>
      </defs>

      <!-- Sparse diagonal text watermark -->
      <g transform="rotate(-35, ${width / 2}, ${height / 2})" filter="url(#ts)">
        ${textElements}
      </g>
    </svg>
  `);

  const watermarked = await sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 88 })
    .toBuffer();

  return watermarked;
}
