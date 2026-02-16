import Link from "next/link";
import { cn } from "@/lib/utils";
import { FAQJsonLd } from "@/components/seo/json-ld";

export const metadata = {
  title: "Pricing",
  description:
    "Affordable AI art portraits starting at Rs 49. Digital downloads and premium print options available. No subscriptions.",
};

const plans = [
  {
    name: "Single Portrait",
    price: "49",
    period: "per portrait",
    description: "Try one style and see the magic",
    features: [
      "1 AI portrait generation",
      "Choose from 15 art styles",
      "Watermarked preview free",
      "HD digital download (1024px)",
      "Re-generate once if unsatisfied",
    ],
    cta: "Create Portrait",
    href: "/create",
    popular: false,
  },
  {
    name: "Portrait Pack",
    price: "99",
    period: "3 portraits",
    description: "Most popular - try multiple styles",
    features: [
      "3 AI portrait generations",
      "Mix & match any styles",
      "HD digital downloads (1024px)",
      "Save Rs 48 vs buying individually",
      "Re-generate each once",
    ],
    cta: "Get 3 Portraits",
    href: "/create",
    popular: true,
  },
  {
    name: "Collection",
    price: "149",
    period: "5 portraits",
    description: "Best value for art lovers",
    features: [
      "5 AI portrait generations",
      "All 15 styles available",
      "HD digital downloads (1024px)",
      "Save Rs 96 vs buying individually",
      "Priority generation queue",
    ],
    cta: "Get 5 Portraits",
    href: "/create",
    popular: false,
  },
];

const faqs = [
  {
    q: "What resolution are the portraits?",
    a: "Digital downloads are 1024x1024 pixels, perfect for social media and phone wallpapers. Print-ready 4K (4096px) upscaling available for premium orders.",
  },
  {
    q: "Can I use these commercially?",
    a: "Portraits are licensed for personal, non-commercial use only. Contact us for commercial licensing.",
  },
  {
    q: "How long does generation take?",
    a: "Most portraits are ready in under 2 minutes. You'll see a live progress indicator while your art is being created.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept UPI (GPay, PhonePe, Paytm), credit/debit cards, net banking, and wallets via Razorpay.",
  },
  {
    q: "What if I don't like the result?",
    a: "Every portrait includes one free re-generation. If you're still not satisfied, contact support for a resolution.",
  },
  {
    q: "Is my photo data safe?",
    a: "We strip all EXIF/GPS metadata on upload. Your photos are auto-deleted after 30 days. We're fully DPDP Act 2023 compliant.",
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <FAQJsonLd
        faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))}
      />
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
          Simple, Transparent Pricing
        </h1>
        <p className="text-muted">
          No subscriptions. No hidden fees. Pay per portrait.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-2xl border p-6 shadow-card transition-all hover:shadow-card-hover",
              plan.popular
                ? "border-saffron bg-card ring-1 ring-saffron"
                : "border-border bg-card"
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-saffron px-3 py-0.5 text-xs font-semibold text-white">
                Most Popular
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {plan.name}
              </h3>
              <p className="text-sm text-muted">{plan.description}</p>
            </div>

            <div className="mb-6">
              <span className="text-3xl font-bold text-foreground">
                Rs {plan.price}
              </span>
              <span className="ml-1 text-sm text-muted">/{plan.period}</span>
            </div>

            <ul className="mb-6 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5 flex-shrink-0 text-success"
                  >
                    <path
                      d="M4 8L7 11L12 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-foreground/80">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={plan.href}
              className={cn(
                "block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all active:scale-[0.98]",
                plan.popular
                  ? "bg-saffron text-white hover:bg-saffron-dark"
                  : "border border-border bg-card text-foreground hover:bg-card-hover"
              )}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>

      {/* Payment Methods */}
      <div className="mb-16 text-center">
        <p className="mb-4 text-sm font-medium text-muted">
          Secure payments powered by
        </p>
        <div className="flex items-center justify-center gap-6 text-xs text-muted">
          <span className="flex items-center gap-1 rounded-lg bg-sand px-3 py-1.5 font-medium">
            UPI
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-sand px-3 py-1.5 font-medium">
            Cards
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-sand px-3 py-1.5 font-medium">
            Net Banking
          </span>
          <span className="flex items-center gap-1 rounded-lg bg-sand px-3 py-1.5 font-medium">
            Wallets
          </span>
        </div>
      </div>

      {/* FAQs */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-center text-xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-card shadow-card"
            >
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="flex-shrink-0 text-muted transition-transform group-open:rotate-180"
                >
                  <path
                    d="M4 6L8 10L12 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </summary>
              <div className="border-t border-border px-5 py-4 text-sm text-muted">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
