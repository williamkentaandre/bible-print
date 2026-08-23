import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bible Deco",
  description: "Choose a verse, see it in your home, download 12 print-ready PDFs.",
  openGraph: {
    title: "Bible Deco",
    description: "The verse you love, on your wall.",
    locale: "en_GB",
    type: "website",
    siteName: "Bible Deco",
    images: [
      {
        url: "/en/opengraph-image?v=premium",
        width: 1200,
        height: 630,
        alt: "Bible Deco – the verse you love, on your wall.",
      },
    ],
  },
  alternates: {
    canonical: "/en",
    languages: {
      fr: "/",
      en: "/en",
    },
  },
};

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return children;
}
