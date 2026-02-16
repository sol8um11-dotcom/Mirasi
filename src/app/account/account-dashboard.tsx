"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { formatINR, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DPDP_PHOTO_RETENTION_DAYS } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PortraitItem {
  id: string;
  styleName: string;
  subjectType: string;
  status: string;
  previewUrl: string | null;
  createdAt: string;
  hasPaid: boolean;
}

interface OrderItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  styleName: string;
}

interface ProfileData {
  email: string | null;
  fullName: string | null;
  phone: string | null;
  dpdpConsent: boolean;
  dpdpConsentAt: string | null;
  marketingConsent: boolean;
  createdAt: string;
}

export interface AccountDashboardProps {
  portraits: PortraitItem[];
  orders: OrderItem[];
  profile: ProfileData;
}

type Tab = "portraits" | "orders" | "settings";

// ─── Main Component ──────────────────────────────────────────────────────────

export function AccountDashboard({
  portraits,
  orders,
  profile,
}: AccountDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("portraits");

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "portraits", label: "My Portraits", count: portraits.length },
    { key: "orders", label: "Orders", count: orders.length },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === tab.key
                ? "border-saffron text-saffron"
                : "border-transparent text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs text-muted">({tab.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "portraits" && <PortraitsTab portraits={portraits} />}
      {activeTab === "orders" && <OrdersTab orders={orders} />}
      {activeTab === "settings" && <SettingsTab profile={profile} />}
    </div>
  );
}

// ─── Portraits Tab ───────────────────────────────────────────────────────────

function PortraitsTab({ portraits }: { portraits: PortraitItem[] }) {
  if (portraits.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
        <p className="mb-2 text-sm font-medium text-foreground">
          No portraits yet
        </p>
        <p className="mb-4 text-xs text-muted">
          Create your first AI art portrait to see it here.
        </p>
        <Button
          variant="primary"
          onClick={() => (window.location.href = "/create")}
        >
          Create Portrait
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {portraits.map((p) => (
        <div
          key={p.id}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
        >
          {/* Image */}
          <div className="relative aspect-square bg-sand">
            {p.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.previewUrl}
                alt={`${p.styleName} portrait`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-xs text-muted">
                  {p.status === "processing"
                    ? "Generating..."
                    : p.status === "failed"
                      ? "Failed"
                      : "Pending"}
                </span>
              </div>
            )}

            {/* Status badge */}
            <span
              className={cn(
                "absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                p.status === "completed"
                  ? "bg-success/20 text-success"
                  : p.status === "processing"
                    ? "bg-saffron/20 text-saffron"
                    : p.status === "failed"
                      ? "bg-error/20 text-error"
                      : "bg-muted/20 text-muted"
              )}
            >
              {p.status}
            </span>

            {/* Paid badge */}
            {p.hasPaid && (
              <span className="absolute top-2 left-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-gold">
                HD Purchased
              </span>
            )}
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-sm font-medium text-foreground">{p.styleName}</p>
            <p className="text-xs text-muted">
              {p.subjectType === "pet" ? "Pet" : "Human"} &middot;{" "}
              {formatDate(p.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Orders Tab ──────────────────────────────────────────────────────────────

function OrdersTab({ orders }: { orders: OrderItem[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center shadow-card">
        <p className="mb-2 text-sm font-medium text-foreground">
          No orders yet
        </p>
        <p className="text-xs text-muted">
          Purchase an HD portrait to see your order history.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <div
          key={o.id}
          className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-card"
        >
          <div>
            <p className="text-sm font-medium text-foreground">
              {o.styleName}
            </p>
            <p className="text-xs text-muted">{formatDate(o.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-foreground">
              {formatINR(o.amount / 100)}
            </p>
            <span
              className={cn(
                "text-[10px] font-semibold",
                o.status === "paid"
                  ? "text-success"
                  : o.status === "failed"
                    ? "text-error"
                    : "text-muted"
              )}
            >
              {o.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab({ profile }: { profile: ProfileData }) {
  const [dpdpConsent, setDpdpConsent] = useState(profile.dpdpConsent);
  const [marketingConsent, setMarketingConsent] = useState(
    profile.marketingConsent
  );
  const [saving, setSaving] = useState(false);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveConsent = useCallback(async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dpdpConsent,
          marketingConsent,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setMessage("Preferences saved.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to save preferences."
      );
    } finally {
      setSaving(false);
    }
  }, [dpdpConsent, marketingConsent]);

  const handleDeleteData = useCallback(async () => {
    if (!confirm("This will permanently delete all your photos and generated portraits. This cannot be undone. Continue?")) {
      return;
    }
    setDeleteRequested(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/delete-data", { method: "POST" });
      const json = await res.json();
      if (json.error) throw new Error(json.error.message);
      setMessage("Your data has been queued for deletion. Photos will be removed within 24 hours.");
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Failed to request data deletion."
      );
      setDeleteRequested(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Profile info */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-foreground">
          Account Information
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Email</span>
            <span className="text-foreground">{profile.email ?? "Not set"}</span>
          </div>
          {profile.phone && (
            <div className="flex justify-between">
              <span className="text-muted">Phone</span>
              <span className="text-foreground">{profile.phone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Member since</span>
            <span className="text-foreground">
              {formatDate(profile.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* DPDP Consent Management */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Data Privacy (DPDP Act 2023)
        </h3>
        <p className="mb-4 text-xs text-muted">
          Your photos are auto-deleted after {DPDP_PHOTO_RETENTION_DAYS} days.
          All EXIF/GPS metadata is stripped on upload.
        </p>

        <div className="space-y-4">
          {/* Data processing consent */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dpdpConsent}
              onChange={(e) => setDpdpConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-saffron"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Data Processing Consent
              </p>
              <p className="text-xs text-muted">
                I consent to Mirasi processing my uploaded photos for AI portrait
                generation. Required to use the service.
              </p>
              {profile.dpdpConsentAt && (
                <p className="mt-1 text-[10px] text-muted">
                  Consented on {formatDate(profile.dpdpConsentAt)}
                </p>
              )}
            </div>
          </label>

          {/* Marketing consent */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-border accent-saffron"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                Marketing Communications
              </p>
              <p className="text-xs text-muted">
                Receive updates about new art styles, features, and offers.
                Optional.
              </p>
            </div>
          </label>

          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSaveConsent}
          >
            Save Preferences
          </Button>
        </div>
      </div>

      {/* Data Deletion */}
      <div className="rounded-xl border border-error/20 bg-card p-5 shadow-card">
        <h3 className="mb-1 text-sm font-semibold text-foreground">
          Delete My Data
        </h3>
        <p className="mb-4 text-xs text-muted">
          Request deletion of all your uploaded photos and generated portraits.
          Your account and order history will be retained for legal compliance.
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={deleteRequested}
          onClick={handleDeleteData}
          className="border-error/30 text-error hover:bg-error/5"
        >
          {deleteRequested ? "Deletion Requested" : "Delete All My Photos"}
        </Button>
      </div>

      {/* Status message */}
      {message && (
        <p className="text-center text-xs text-muted">{message}</p>
      )}
    </div>
  );
}
