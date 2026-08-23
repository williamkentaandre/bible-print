import type { Metadata } from "next";
import "./studio.css";

export const metadata: Metadata = {
  title: "Studio épingles",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function StudioLayout({ children }: LayoutProps<"/studio">) {
  return children;
}
