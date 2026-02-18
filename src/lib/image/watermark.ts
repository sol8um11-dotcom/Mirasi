import sharp from "sharp";

/**
 * Professional Mirasi watermark for preview images.
 * Server-only — uses Sharp (not available in browser).
 *
 * Design philosophy — clean & professional like premium stock sites:
 *  • Repeating diagonal "mirasi" text in a grid (crop-resistant)
 *  • Single centered logo spiral at moderate opacity
 *  • Semi-transparent white text with subtle shadow for readability on any bg
 *  • Does NOT destroy the image — user can still evaluate the art quality
 *  • Hard to remove due to repeating pattern across entire image
 */
export async function watermarkImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;
  const minDim = Math.min(width, height);

  // ─── Sizing ──────────────────────────────────────────────────────────
  // Text size scales with image dimensions
  const fontSize = Math.max(Math.round(minDim / 28), 16);
  const logoSize = Math.round(minDim * 0.22); // Center logo spiral
  const gridSpacingX = Math.round(fontSize * 10); // Horizontal gap between repeats
  const gridSpacingY = Math.round(fontSize * 6); // Vertical gap between repeats

  // ─── Mirasi paisley spiral SVG (from logo.tsx, viewBox 0 0 64 64) ──
  const spiralSvg = `
    <g transform="translate(${(width - logoSize) / 2}, ${(height - logoSize) / 2}) scale(${logoSize / 64})"
       stroke="rgba(255,255,255,0.13)" fill="none" stroke-linecap="round">
      <path d="M32 7 C19 8 8 19 9 33 C10 47 20 57 33 56 C46 55 54 45 53 33" stroke-width="3.5"/>
      <path d="M53 33 C52 23 44 16 35 16 C26 17 20 24 20 32" stroke-width="2.8"/>
      <path d="M20 32 C20 40 26 46 34 45 C40 44 44 39 43 34 C41.5 30 38 28 35 28.5 C33 29 31 29.5 29.5 31" stroke-width="2"/>
      <circle cx="34" cy="31.5" r="2" fill="rgba(255,255,255,0.13)"/>
    </g>`;

  // ─── Repeating diagonal text grid ────────────────────────────────────
  // Calculate how many columns/rows we need to cover the rotated area
  // When rotated -30°, we need extra coverage so no gaps appear
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
      // Alternate rows get offset for staggered pattern
      const stagger = row % 2 === 0 ? 0 : gridSpacingX / 2;
      textElements += `
        <text x="${x + stagger}" y="${y}"
          font-family="'Urbanist', 'Inter', Arial, sans-serif"
          font-size="${fontSize}px" font-weight="700"
          fill="rgba(255,255,255,0.18)"
          letter-spacing="0.15em">mirasi</text>`;
    }
  }

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="ts" x="-5%" y="-5%" width="110%" height="110%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.35"/>
        </filter>
      </defs>

      <!-- Layer 1: Center logo spiral (subtle brand presence) -->
      ${spiralSvg}

      <!-- Layer 2: Repeating diagonal text pattern (crop-resistant) -->
      <g transform="rotate(-30, ${width / 2}, ${height / 2})" filter="url(#ts)">
        ${textElements}
      </g>
    </svg>
  `);

  const watermarked = await sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();

  return watermarked;
}
