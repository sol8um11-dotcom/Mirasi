"use client";

import imageCompression from "browser-image-compression";
import {
  COMPRESSED_MAX_WIDTH,
  COMPRESSED_MAX_HEIGHT,
  COMPRESSED_QUALITY,
  MAX_IMAGE_SIZE_MB,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";
import type { CompressedImage } from "@/types";

/**
 * Validate and compress an uploaded image
 * - Strips EXIF/GPS data (DPDP compliance)
 * - Resizes to max 1024x1024
 * - Compresses to ~80% quality
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  // Validate file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error(
      "Unsupported file type. Please upload a JPG, PNG, or WebP image."
    );
  }

  // Validate file size (pre-compression)
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    throw new Error(
      `File too large. Maximum size is ${MAX_IMAGE_SIZE_MB}MB.`
    );
  }

  const originalSize = file.size;

  // Compress with browser-image-compression
  // This automatically strips EXIF data including GPS coordinates
  const compressedFile = await imageCompression(file, {
    maxWidthOrHeight: Math.max(COMPRESSED_MAX_WIDTH, COMPRESSED_MAX_HEIGHT),
    maxSizeMB: 1, // Target ~1MB after compression
    useWebWorker: true,
    initialQuality: COMPRESSED_QUALITY,
    fileType: "image/jpeg", // Convert everything to JPEG for consistency
    preserveExif: false, // DPDP: Strip all EXIF including GPS
  });

  // Get dimensions
  const dimensions = await getImageDimensions(compressedFile);

  return {
    file: new File([compressedFile], `photo.jpg`, { type: "image/jpeg" }),
    width: dimensions.width,
    height: dimensions.height,
    originalSize,
    compressedSize: compressedFile.size,
  };
}

/**
 * Get image dimensions from a File
 */
function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read image dimensions"));
    };

    img.src = url;
  });
}

/**
 * Create a preview URL for display (revoke with URL.revokeObjectURL when done)
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
