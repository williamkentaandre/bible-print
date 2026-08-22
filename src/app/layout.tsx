import type { Metadata, Viewport } from "next";
import {
  Alex_Brush,
  Allura,
  EB_Garamond,
  Great_Vibes,
  Pinyon_Script,
  Source_Sans_3,
} from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const greatVibes = Great_Vibes({
  variable: "--font-script-vibes",
  subsets: ["latin"],
  weight: "400",
});

const allura = Allura({
  variable: "--font-script-allura",
  subsets: ["latin"],
  weight: "400",
});

const alexBrush = Alex_Brush({
  variable: "--font-script-alex",
  subsets: ["latin"],
  weight: "400",
});

const pinyon = Pinyon_Script({
  variable: "--font-script-pinyon",
  subsets: ["latin"],
  weight: "400",
});

const ebGaramond = EB_Garamond({
  variable: "--font-roman",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bibledeco.com"),
  title: "Bible Deco",
  description:
    "Choisissez un verset, voyez-le chez vous, téléchargez 12 PDF prêts à faire tirer.",
  openGraph: {
    title: "Bible Deco",
    description: "Le verset que vous aimez, accroché chez vous.",
    locale: "fr_FR",
    type: "website",
    siteName: "Bible Deco",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4efe7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${sourceSans.variable} ${greatVibes.variable} ${allura.variable} ${alexBrush.variable} ${pinyon.variable} ${ebGaramond.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
