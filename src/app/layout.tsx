import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Urbanist } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Mirasi - AI Indian Art Portraits",
    template: "%s | Mirasi",
  },
  description:
    "Transform your photos into stunning Indian art portraits. AI-powered art in Rajasthani, Tanjore, Madhubani, and 12 more styles. Starting at just Rs 49.",
  keywords: [
    "Indian art portrait",
    "AI portrait",
    "pet portrait India",
    "Rajasthani painting",
    "Tanjore painting",
    "Madhubani art",
    "custom portrait",
    "Mirasi",
  ],
  authors: [{ name: "Mirasi" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Mirasi",
    title: "Mirasi - AI Indian Art Portraits",
    description:
      "Transform your photos into stunning Indian art. 15 authentic styles from Rajasthani Royal to Madhubani Folk.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mirasi - AI Indian Art Portraits",
    description:
      "Transform your photos into stunning Indian art. 15 authentic styles.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C75B12",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${urbanist.variable} antialiased bg-background text-foreground`}
      >
        <div className="flex min-h-dvh flex-col">
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <div className="hidden md:block">
            <Footer />
          </div>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
