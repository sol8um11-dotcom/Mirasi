"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { useUser } from "@/hooks/use-user";

const navItems = [
  { label: "Gallery", href: "/gallery" },
  { label: "Pricing", href: "/pricing" },
];

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useUser();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Spacer pushes nav & CTA right */}
        <div className="flex-1" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-saffron",
                pathname === item.href
                  ? "text-saffron"
                  : "text-foreground/70"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div className="hidden flex-1 md:block" />

        {/* CTA + Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/create"
            className="rounded-lg bg-saffron px-4 py-2.5 text-sm font-semibold text-white raised-3d hover:bg-saffron-dark"
          >
            Create Portrait
          </Link>

          {/* Auth state — "Sign In" when logged out, account icon when logged in */}
          {!loading && !user && (
            <Link
              href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
              className="hidden rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-sand hover:text-saffron md:block"
            >
              Sign In
            </Link>
          )}
          {!loading && user && (
            <Link
              href="/account"
              className="hidden rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-sand md:block"
              aria-label="My Account"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M3 16C3 13.2386 5.68629 11 9 11C12.3137 11 15 13.2386 15 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
