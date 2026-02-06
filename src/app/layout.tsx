import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrzedmiarAI - Wgraj PDF, odbierz gotowy przedmiar",
  description: "AI rozpoznaje pomieszczenia z rysunków technicznych i automatycznie oblicza powierzchnie. 10x szybciej niż ręcznie.",
  keywords: "przedmiar, kosztorys, AI, PDF, pomiary, budowa, wycena, powierzchnia, m2",
  openGraph: {
    title: "PrzedmiarAI - Wgraj PDF, odbierz gotowy przedmiar",
    description: "AI rozpoznaje pomieszczenia z rysunków technicznych i automatycznie oblicza powierzchnie. 10x szybciej niż ręcznie.",
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
