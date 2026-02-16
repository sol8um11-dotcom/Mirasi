import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
      <p className="mb-2 text-6xl font-bold text-saffron">404</p>
      <h2 className="mb-2 text-xl font-bold text-foreground">Page Not Found</h2>
      <p className="mb-6 max-w-sm text-sm text-muted">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-saffron px-6 py-3 text-sm font-semibold text-white hover:bg-saffron-dark"
        >
          Go Home
        </Link>
        <Link
          href="/create"
          className="rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-card-hover"
        >
          Create Portrait
        </Link>
      </div>
    </div>
  );
}
