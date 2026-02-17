import sharp from "sharp";

/**
 * Apply a 3D Mirasi paisley spiral watermark that wraps around the image.
 * Server-only — uses Sharp (not available in browser).
 *
 * Design:
 * - The Mirasi logo's paisley spiral is tiled across the image
 * - Spirals are rendered in saffron-gold at varying sizes and opacities
 * - 3D perspective effect: spirals get larger/more opaque toward the
 *   edges, creating the illusion of wrapping around the image
 * - A subtle "PREVIEW" text is placed in the center
 * - Background grid of tiny spirals for crop resistance
 */
export async function watermarkImage(imageBuffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width || 1024;
  const height = metadata.height || 1024;
  const minDim = Math.min(width, height);

  // The Mirasi paisley spiral SVG paths (from logo.tsx, viewBox 0 0 64 64)
  // We'll compose these into a single symbol and tile it
  const spiralPaths = `
    <path d="M32 7 C19 8 8 19 9 33 C10 47 20 57 33 56 C46 55 54 45 53 33"
      stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <path d="M53 33 C52 23 44 16 35 16 C26 17 20 24 20 32"
      stroke-width="2.8" stroke-linecap="round" fill="none"/>
    <path d="M20 32 C20 40 26 46 34 45 C40 44 44 39 43 34 C41.5 30 38 28 35 28.5 C33 29 31 29.5 29.5 31"
      stroke-width="2" stroke-linecap="round" fill="none"/>
    <circle cx="34" cy="31.5" r="2" fill="currentColor"/>
  `;

  // ─── Layer 1: Background grid of tiny spirals (crop-resistant) ──────
  const gridSize = Math.round(minDim / 6);
  const gridCols = Math.ceil(width / gridSize) + 1;
  const gridRows = Math.ceil(height / gridSize) + 1;
  const gridSpiralSize = Math.round(gridSize * 0.5);

  let gridElements = "";
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      const x = col * gridSize + (row % 2 === 0 ? 0 : gridSize / 2);
      const y = row * gridSize;
      const rotation = ((row + col) * 45) % 360;
      gridElements += `
        <g transform="translate(${x}, ${y}) rotate(${rotation}, ${gridSpiralSize / 2}, ${gridSpiralSize / 2}) scale(${gridSpiralSize / 64})"
           stroke="rgba(199, 91, 18, 0.08)" fill="rgba(212, 168, 67, 0.06)">
          ${spiralPaths}
        </g>`;
    }
  }

  // ─── Layer 2: 3D edge spirals (larger, more opaque near edges) ──────
  // Creates the illusion of spirals wrapping around the image frame
  const edgeSpirals: Array<{
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
  }> = [];

  // Top edge spirals
  const numEdge = 8;
  for (let i = 0; i < numEdge; i++) {
    const t = (i + 0.5) / numEdge;
    // Top
    edgeSpirals.push({
      x: t * width,
      y: minDim * 0.04,
      size: minDim * (0.12 + Math.sin(t * Math.PI) * 0.06),
      opacity: 0.25 + Math.sin(t * Math.PI) * 0.1,
      rotation: -15 + i * 12,
    });
    // Bottom
    edgeSpirals.push({
      x: t * width,
      y: height - minDim * 0.04,
      size: minDim * (0.12 + Math.sin(t * Math.PI) * 0.06),
      opacity: 0.25 + Math.sin(t * Math.PI) * 0.1,
      rotation: 180 + 15 - i * 12,
    });
  }

  // Left and right edge spirals
  const numSide = 6;
  for (let i = 0; i < numSide; i++) {
    const t = (i + 0.5) / numSide;
    // Left
    edgeSpirals.push({
      x: minDim * 0.04,
      y: t * height,
      size: minDim * (0.1 + Math.sin(t * Math.PI) * 0.05),
      opacity: 0.22 + Math.sin(t * Math.PI) * 0.08,
      rotation: 90 + i * 15,
    });
    // Right
    edgeSpirals.push({
      x: width - minDim * 0.04,
      y: t * height,
      size: minDim * (0.1 + Math.sin(t * Math.PI) * 0.05),
      opacity: 0.22 + Math.sin(t * Math.PI) * 0.08,
      rotation: -90 - i * 15,
    });
  }

  // Corner spirals — largest, most prominent (3D wrap illusion)
  const cornerSize = minDim * 0.18;
  const cornerOffset = minDim * 0.06;
  const corners = [
    { x: cornerOffset, y: cornerOffset, rotation: 30, opacity: 0.35 },
    { x: width - cornerOffset, y: cornerOffset, rotation: -30, opacity: 0.35 },
    { x: cornerOffset, y: height - cornerOffset, rotation: 150, opacity: 0.35 },
    { x: width - cornerOffset, y: height - cornerOffset, rotation: -150, opacity: 0.35 },
  ];

  corners.forEach((c) =>
    edgeSpirals.push({ ...c, size: cornerSize })
  );

  let edgeElements = "";
  for (const spiral of edgeSpirals) {
    const scale = spiral.size / 64;
    const halfSize = spiral.size / 2;
    edgeElements += `
      <g transform="translate(${spiral.x - halfSize}, ${spiral.y - halfSize}) rotate(${spiral.rotation}, ${halfSize}, ${halfSize}) scale(${scale})"
         stroke="rgba(199, 91, 18, ${spiral.opacity})" fill="rgba(212, 168, 67, ${spiral.opacity * 0.7})">
        ${spiralPaths}
      </g>`;
  }

  // ─── Layer 3: Center "PREVIEW" badge ────────────────────────────────
  const badgeFontSize = Math.max(Math.round(minDim / 20), 18);
  const badgeY = height * 0.5;
  const badgeX = width * 0.5;

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="spiral-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feOffset in="blur" dx="1" dy="2" result="shadow"/>
          <feFlood flood-color="#000000" flood-opacity="0.3" result="shadowFill"/>
          <feComposite in="shadowFill" in2="shadow" operator="in" result="dropShadow"/>
          <feMerge>
            <feMergeNode in="dropShadow"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3"/>
        </filter>
      </defs>

      <!-- Layer 1: Subtle background grid -->
      ${gridElements}

      <!-- Layer 2: 3D edge spirals with drop shadow -->
      <g filter="url(#spiral-shadow)">
        ${edgeElements}
      </g>

      <!-- Layer 3: Center PREVIEW text -->
      <text x="${badgeX}" y="${badgeY}"
        text-anchor="middle" dominant-baseline="central"
        font-family="Georgia, serif" font-size="${badgeFontSize}px" font-weight="700"
        fill="rgba(199, 91, 18, 0.15)" letter-spacing="0.4em"
        transform="rotate(-25, ${badgeX}, ${badgeY})">PREVIEW</text>
    </svg>
  `);

  const watermarked = await sharp(imageBuffer)
    .composite([{ input: svgOverlay, top: 0, left: 0 }])
    .jpeg({ quality: 85 })
    .toBuffer();

  return watermarked;
}
