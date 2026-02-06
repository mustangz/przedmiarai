import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const GA_ID = "G-8Z9Y6MQJ3M";

export const metadata: Metadata = {
  title: "PrzedmiarAI - Wgraj PDF lub DWG, odbierz gotowy przedmiar",
  description: "AI rozpoznaje pomieszczenia z rysunków PDF i DWG, automatycznie oblicza powierzchnie. 10x szybciej niż ręcznie.",
  keywords: "przedmiar, kosztorys, AI, PDF, pomiary, budowa, wycena, powierzchnia, m2",
  openGraph: {
    title: "PrzedmiarAI - Wgraj PDF lub DWG, odbierz gotowy przedmiar",
    description: "AI rozpoznaje pomieszczenia z rysunków PDF i DWG, automatycznie oblicza powierzchnie. 10x szybciej niż ręcznie.",
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
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
