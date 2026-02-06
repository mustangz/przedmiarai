import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrzedmiarAI - Przedmiar w sekundy, nie godziny",
  description: "AI automatycznie mierzy powierzchnie z rysunków PDF. Oszczędź 80% czasu na wycenach budowlanych.",
  keywords: "przedmiar, kosztorys, AI, PDF, pomiary, budowa, wycena",
  openGraph: {
    title: "PrzedmiarAI - Przedmiar w sekundy, nie godziny",
    description: "AI automatycznie mierzy powierzchnie z rysunków PDF. Oszczędź 80% czasu na wycenach.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
