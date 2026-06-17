import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Norsk diskgolf - turneringer per spiller per år, 1990–2025",
  description:
    "Antall PDGA-turneringer spilt per norsk spiller per år, summert på tvers av alle divisjoner, fra 1990 til i dag.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Hopp til hovedinnhold
        </a>
        {children}
      </body>
    </html>
  );
}
