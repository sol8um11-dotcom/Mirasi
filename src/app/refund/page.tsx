export const metadata = {
  title: "Refund Policy",
  description: "Mirasi Refund Policy. Clear and fair refund terms for digital and physical products.",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">
        Refund Policy
      </h1>
      <div className="prose prose-sm max-w-none text-muted">
        <p className="mb-4">
          <strong className="text-foreground">Last updated:</strong> February 2025
        </p>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Digital Products
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Before generation:</strong> Full
            refund minus Rs 50 processing fee
          </li>
          <li>
            <strong className="text-foreground">After generation, before download:</strong>{" "}
            50% refund or one free regeneration
          </li>
          <li>
            <strong className="text-foreground">After download:</strong> No
            monetary refund, one free revision available
          </li>
          <li>
            <strong className="text-foreground">Quality issues:</strong> Free
            regeneration at no cost for objectively wrong outputs
          </li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          Physical Products
        </h2>
        <ul className="mb-4 list-disc space-y-1 pl-5">
          <li>
            <strong className="text-foreground">Before printing:</strong> Full
            refund minus Rs 100 processing fee
          </li>
          <li>
            <strong className="text-foreground">After printing:</strong> No refund
            (custom product)
          </li>
          <li>
            <strong className="text-foreground">Transit damage:</strong> Free
            replacement with photo evidence within 48 hours
          </li>
          <li>
            <strong className="text-foreground">Quality defects:</strong> Free
            replacement or full refund
          </li>
        </ul>

        <h2 className="mb-3 mt-8 text-lg font-semibold text-foreground">
          How to Request a Refund
        </h2>
        <p className="mb-4">
          Email us at{" "}
          <strong className="text-foreground">support@mirasi.in</strong>{" "}
          with your order ID and reason. We process refunds within 5-7 business
          days to your original payment method.
        </p>
      </div>
    </div>
  );
}
