import type { Metadata } from "next";
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
  title: "Bible Print",
  description:
    "Choisissez un verset biblique, voyez-le chez vous, et obtenez un fichier d’impression soigné. 5 € la feuille.",
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
