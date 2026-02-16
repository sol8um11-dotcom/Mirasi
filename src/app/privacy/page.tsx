export const metadata = {
  title: "Privacy Policy",
  description: "Mirasi Privacy Policy. DPDP Act 2023 compliant. Learn how we protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Privacy Policy
      </h1>
      <div className="prose prose-sm max-w-none text-muted">
        <p className="mb-4">
          <strong className="text-foreground">Last updated:</strong> February 2025
        </p>
        <p className="mb-4">
          Mirasi (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your
          privacy in compliance with the Digital Personal Data Protection Act,
          2023 (DPDP Act).
        </p>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Data We Collect
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>Account information (email or phone number)</li>
          <li>Photos you upload for portrait generation</li>
          <li>Payment transaction details (processed by Razorpay)</li>
          <li>Usage analytics (anonymized)</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          How We Use Your Data
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>To generate AI art portraits from your uploaded photos</li>
          <li>To process payments and deliver digital/physical products</li>
          <li>To communicate order updates</li>
          <li>To improve our service (anonymized analytics only)</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Photo Data Protection
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>EXIF/GPS metadata is stripped from all uploaded photos</li>
          <li>Source photos are automatically deleted after 30 days</li>
          <li>Photos are never shared with third parties for training AI models</li>
          <li>You can request immediate deletion of all your data at any time</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Your Rights Under DPDP Act
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>Right to access your personal data</li>
          <li>Right to correction of inaccurate data</li>
          <li>Right to erasure (right to be forgotten)</li>
          <li>Right to withdraw consent</li>
          <li>Right to data portability</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Contact
        </h2>
        <p>
          For privacy-related queries, contact our Data Protection Officer at{" "}
          <strong className="text-foreground">privacy@mirasi.in</strong>
        </p>
      </div>
    </div>
  );
}
