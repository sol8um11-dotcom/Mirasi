import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-cream-dark">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-2">
              <Logo size="md" />
            </div>
            <p className="text-sm text-muted">
              AI-powered Indian art portraits. Transform your photos into
              masterpieces.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/gallery" className="text-muted hover:text-saffron">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted hover:text-saffron">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-muted hover:text-saffron">
                  Create Portrait
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted hover:text-saffron">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted hover:text-saffron">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-muted hover:text-saffron">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-4 text-center text-xs text-muted">
          <p>
            &copy; {new Date().getFullYear()} Mirasi. All art styles
            inspired by traditional Indian art traditions.
          </p>
        </div>
      </div>
    </footer>
  );
}
