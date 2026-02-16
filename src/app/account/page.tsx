import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AccountDashboard, type AccountDashboardProps } from "./account-dashboard";

export const metadata = {
  title: "My Account",
  description: "View your portrait history, downloads, and account settings.",
};

export default async function AccountPage() {
  // Auth check (server-side)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account");
  }

  const admin = createAdminClient();

  // Fetch data in parallel
  const [generationsResult, ordersResult, profileResult] = await Promise.all([
    admin
      .from("generations")
      .select("id, subject_type, status, preview_image_path, created_at, style_id, styles(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("orders")
      .select("id, amount, currency, status, created_at, generation_id, generations(style_id, styles(name))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("profiles")
      .select("email, full_name, phone, dpdp_consent, dpdp_consent_at, marketing_consent, created_at")
      .eq("id", user.id)
      .single(),
  ]);

  // Check which generations have paid orders
  const paidGenerationIds = new Set(
    (ordersResult.data ?? [])
      .filter((o: Record<string, unknown>) => o.status === "paid")
      .map((o: Record<string, unknown>) => o.generation_id as string)
  );

  // Build preview URLs for generations that have preview images
  const portraits: AccountDashboardProps["portraits"] = (
    generationsResult.data ?? []
  ).map((g: Record<string, unknown>) => {
    const styles = g.styles as Record<string, unknown> | null;
    let previewUrl: string | null = null;

    if (g.preview_image_path) {
      // Preview images bucket is public
      const { data } = admin.storage
        .from("preview-images")
        .getPublicUrl(g.preview_image_path as string);
      previewUrl = data.publicUrl;
    }

    return {
      id: g.id as string,
      styleName: (styles?.name as string) ?? "Unknown Style",
      subjectType: g.subject_type as string,
      status: g.status as string,
      previewUrl,
      createdAt: g.created_at as string,
      hasPaid: paidGenerationIds.has(g.id as string),
    };
  });

  const orders: AccountDashboardProps["orders"] = (
    ordersResult.data ?? []
  ).map((o: Record<string, unknown>) => {
    const generations = o.generations as Record<string, unknown> | null;
    const styles = generations?.styles as Record<string, unknown> | null;

    return {
      id: o.id as string,
      amount: o.amount as number,
      currency: o.currency as string,
      status: o.status as string,
      createdAt: o.created_at as string,
      styleName: (styles?.name as string) ?? "Unknown Style",
    };
  });

  const profileData = profileResult.data;
  const profile: AccountDashboardProps["profile"] = {
    email: (profileData?.email as string) ?? user.email ?? null,
    fullName: profileData?.full_name as string | null,
    phone: profileData?.phone as string | null,
    dpdpConsent: (profileData?.dpdp_consent as boolean) ?? false,
    dpdpConsentAt: profileData?.dpdp_consent_at as string | null,
    marketingConsent: (profileData?.marketing_consent as boolean) ?? false,
    createdAt: (profileData?.created_at as string) ?? user.created_at,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-foreground">My Account</h1>
      <p className="mb-8 text-muted">
        Your portraits, orders, and settings
      </p>

      <AccountDashboard
        portraits={portraits}
        orders={orders}
        profile={profile}
      />
    </div>
  );
}
