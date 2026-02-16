"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M3 8.5L11 3L19 8.5V18C19 18.5523 18.5523 19 18 19H4C3.44772 19 3 18.5523 3 18V8.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M8 19V13H14V19" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Gallery",
    href: "/gallery",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 15L8 11L12 14L15 12L19 15" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Create",
    href: "/create",
    icon: (
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <circle cx="13" cy="13" r="12" fill="currentColor" className="text-saffron" />
        <path d="M13 8V18M8 13H18" stroke="white" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    isMain: true,
  },
  {
    label: "Pricing",
    href: "/pricing",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 3V19M7 7H14C15.6569 7 17 8.34315 17 10C17 11.6569 15.6569 13 14 13H7M7 13H15C16.6569 13 18 14.3431 18 16C18 17.6569 16.6569 19 15 19H7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Account",
    href: "/account",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4 19C4 15.6863 7.13401 13 11 13C14.866 13 18 15.6863 18 19"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname.startsWith("/auth")) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      <div
        className="mx-auto flex h-16 max-w-md items-center justify-around"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors",
                item.isMain
                  ? "-mt-4"
                  : isActive
                    ? "text-saffron"
                    : "text-muted"
              )}
              aria-label={item.label}
            >
              <span className={cn(isActive && !item.isMain && "text-saffron")}>
                {item.icon}
              </span>
              {!item.isMain && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
