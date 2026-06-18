import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Norsk diskgolf i tall · 1990–2025",
    template: "%s · Norsk diskgolf i tall",
  },
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
        <Header />
        <main id="main-content" className="wrap page-content">
          {children}
        </main>
        <div className="wrap">
          <Footer />
        </div>
      </body>
    </html>
  );
}
