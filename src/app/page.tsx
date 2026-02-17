import Link from "next/link";
import { StyleCarousel } from "@/components/landing/style-carousel";
import { WebsiteJsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <WebsiteJsonLd />
      {/* Hero Section */}
      <section className="flex flex-col items-center py-16 text-center md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold md:text-sm">
          Every face tells a legend
        </p>
        <h1 className="mb-5 max-w-3xl text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl md:leading-tight">
          Transform Your Photos Into{" "}
          <span className="text-saffron">Indian Art</span> Masterpieces
        </h1>
        <p className="mb-10 max-w-lg text-base text-muted md:text-lg">
          AI-powered portraits inspired by 15 authentic Indian art traditions.
          From Rajasthani Miniatures to Madhubani Folk Art.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create"
            className="rounded-xl bg-saffron px-8 py-4 text-base font-semibold text-white raised-3d hover:bg-saffron-dark"
          >
            Create Your Portrait
          </Link>
          <Link
            href="/gallery"
            className="rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground shadow-card transition-all hover:shadow-card-hover active:scale-[0.98]"
          >
            View Gallery
          </Link>
        </div>
        <p className="mt-5 text-sm text-muted">
          Starting at just <span className="font-semibold text-saffron">Rs 49</span>
        </p>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
          How It Works
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Choose a Style",
              desc: "Browse 15 authentic Indian art styles from Royal Heritage to Folk Art.",
            },
            {
              step: "2",
              title: "Upload Your Photo",
              desc: "Upload a clear photo of your pet or yourself. We handle the rest.",
            },
            {
              step: "3",
              title: "Get Your Portrait",
              desc: "AI transforms your photo in under 2 minutes. Download or order a print.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border bg-card p-6 text-center shadow-card"
            >
              <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-saffron/10 text-lg font-bold text-saffron">
                {item.step}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Style Showcase Carousel */}
      <section className="py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="mb-1 text-2xl font-bold text-foreground">
              15 Authentic Art Styles
            </h2>
            <p className="text-sm text-muted">
              Inspired by centuries-old Indian art traditions
            </p>
          </div>
          <Link
            href="/gallery"
            className="hidden text-sm font-medium text-saffron transition-colors hover:text-saffron-light sm:block"
          >
            View all &rarr;
          </Link>
        </div>
        <StyleCarousel />
        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/gallery"
            className="text-sm font-medium text-saffron transition-colors hover:text-saffron-light"
          >
            View all 15 styles &rarr;
          </Link>
        </div>
      </section>

      {/* Style Categories Overview */}
      <section className="py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              category: "Royal Heritage",
              count: 10,
              styles: "Rajasthani, Maratha, Tanjore, Mysore, Punjab...",
              gradient: "from-saffron/15 to-gold/15",
            },
            {
              category: "Folk Art",
              count: 3,
              styles: "Madhubani, Warli, Pichwai",
              gradient: "from-success/15 to-earth/15",
            },
            {
              category: "Modern",
              count: 2,
              styles: "Anime Portrait, Bollywood Retro",
              gradient: "from-royal-blue/15 to-deep-blue/15",
            },
          ].map((cat) => (
            <div
              key={cat.category}
              className={`rounded-xl border border-border bg-gradient-to-br ${cat.gradient} p-6`}
            >
              <h3 className="mb-1 text-lg font-semibold text-foreground">
                {cat.category}
              </h3>
              <p className="mb-2 text-2xl font-bold text-saffron">
                {cat.count} styles
              </p>
              <p className="text-sm text-muted">{cat.styles}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 text-center">
        <div className="rounded-2xl bg-gradient-to-r from-saffron/15 to-gold/15 px-6 py-10">
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Ready to Create Your Portrait?
          </h2>
          <p className="mb-6 text-muted">
            Upload your photo and see it transformed in under 2 minutes.
          </p>
          <Link
            href="/create"
            className="inline-block rounded-xl bg-saffron px-8 py-4 text-base font-semibold text-white raised-3d hover:bg-saffron-dark"
          >
            Get Started - From Rs 49
          </Link>
        </div>
      </section>
    </div>
  );
}
