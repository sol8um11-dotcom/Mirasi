import { GalleryClient } from "./gallery-client";

export const metadata = {
  title: "Style Gallery",
  description:
    "Browse 15 authentic Indian art styles. Rajasthani Royal, Tanjore Heritage, Madhubani Folk, Anime, and more. Preview before you create.",
};

export default function GalleryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
          Style Gallery
        </h1>
        <p className="text-muted">
          15 authentic Indian art styles. Choose your favourite and create your portrait.
        </p>
      </div>
      <GalleryClient />
    </div>
  );
}
