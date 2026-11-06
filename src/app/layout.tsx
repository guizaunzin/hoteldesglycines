import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hôtel des Glycines — L'affaire du Rossignol",
  description: "Jeu d'enquête pour pratiquer la conversation en français (niveaux A2 et B1).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d2340",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
