import { APP_NAME, APP_URL } from "@/lib/constants";

/**
 * JSON-LD structured data for SEO.
 * Renders as a <script type="application/ld+json"> tag.
 */
export function WebsiteJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: APP_NAME,
    url: APP_URL,
    description:
      "Transform your photos into stunning Indian art portraits. AI-powered art in 15 authentic styles.",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "49",
      priceCurrency: "INR",
      description: "Single AI art portrait",
    },
    creator: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
