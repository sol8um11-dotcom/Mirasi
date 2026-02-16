export * from "./database";
import type { StyleCategory } from "./database";

// App-level types

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: AppError;
}

// Image processing types
export interface CompressedImage {
  file: File;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

// fal.ai types
export interface FalQueueResponse {
  request_id: string;
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  response_url?: string;
}

export interface FalGenerationResult {
  images: Array<{
    url: string;
    width: number;
    height: number;
    content_type: string;
  }>;
  seed: number;
  prompt: string;
}

// Razorpay types
export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// UI types
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface StyleCardData {
  id: string;
  name: string;
  slug: string;
  category: StyleCategory;
  shortDescription: string;
  thumbnailUrl: string;
  supportsDogs: boolean;
  supportsCats: boolean;
  supportsHumans: boolean;
  region: string;
}
