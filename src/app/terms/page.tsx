export const metadata = {
  title: "Terms of Service",
  description: "Mirasi Terms of Service. Read our terms for using our AI art portrait service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Terms of Service
      </h1>
      <div className="prose prose-sm max-w-none text-muted">
        <p className="mb-4">
          <strong className="text-foreground">Last updated:</strong> February 2025
        </p>
        <p className="mb-4">
          Welcome to Mirasi. By using our service, you agree to the
          following terms.
        </p>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Service Description
        </h2>
        <p className="mb-4">
          Mirasi provides AI-powered portrait generation, transforming
          uploaded photos into various Indian art styles. We offer digital
          downloads and physical print products.
        </p>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          User Responsibilities
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>You must be at least 18 years old to use this service</li>
          <li>You must own or have permission to use any photos you upload</li>
          <li>You agree not to upload inappropriate, offensive, or illegal content</li>
          <li>You are responsible for maintaining the security of your account</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Intellectual Property
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>Art styles are inspired by traditional Indian art traditions</li>
          <li>Generated portraits are for personal, non-commercial use</li>
          <li>You retain rights to your uploaded photos</li>
          <li>We retain rights to the AI-generated art style and process</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Payments & Refunds
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>All prices are in Indian Rupees (INR) and include GST</li>
          <li>Payments are processed securely via Razorpay</li>
          <li>Digital products: One free regeneration if unsatisfied</li>
          <li>Physical products: Free replacement for transit damage (48hr reporting)</li>
          <li>Custom products are non-refundable after printing</li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Disclaimer
        </h2>
        <p className="mb-4">
          AI-generated art may vary in quality. We provide sample images that
          represent typical output quality. Results depend on the quality and
          content of your uploaded photo.
        </p>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Contact
        </h2>
        <p>
          For queries, contact us at{" "}
          <strong className="text-foreground">support@mirasi.in</strong>
        </p>
      </div>
    </div>
  );
}
