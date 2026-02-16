// Auto-generated types would come from Supabase CLI
// For now, manually define types matching our schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type StyleCategory = "royal" | "folk" | "modern";
export type SubjectType = "pet" | "human";
export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
export type OrderStatus = "created" | "paid" | "failed" | "refunded";
export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "emi";

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  dpdp_consent: boolean;
  dpdp_consent_at: string | null;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Style {
  id: string;
  name: string;
  slug: string;
  category: StyleCategory;
  description: string;
  short_description: string;
  prompt_template: string;
  negative_prompt: string;
  preview_image_url: string;
  thumbnail_url: string;
  supports_dogs: boolean;
  supports_cats: boolean;
  supports_humans: boolean;
  region: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  style_id: string;
  subject_type: SubjectType;
  source_image_path: string;
  generated_image_path: string | null;
  preview_image_path: string | null;
  fal_request_id: string | null;
  status: GenerationStatus;
  error_message: string | null;
  prompt_used: string | null;
  generation_time_ms: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  generation_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  currency: string;
  method: PaymentMethod | null;
  status: string;
  verified: boolean;
  created_at: string;
}

export interface Download {
  id: string;
  user_id: string;
  generation_id: string;
  payment_id: string;
  download_type: "watermarked" | "hd";
  ip_address: string | null;
  user_agent: string | null;
  downloaded_at: string;
}

// Joined types for common queries
export interface GenerationWithStyle extends Generation {
  style: Style;
}

export interface OrderWithPayment extends Order {
  payment: Payment | null;
  generation: GenerationWithStyle;
}
