import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import GrowthChart from "@/components/GrowthChart";
import StatStrip from "@/components/StatStrip";
import Link from "next/link";

const S = summary as unknown as Summary;

export default function Home() {
  return (
    <>
      <header className="hero">
        <div className="eyebrow">PDGA-statistikk · Norge · 1990–2025</div>
        <h1>
          Turnering for turnering:
          <br />
          norsk diskgolf i <span className="hl">36 sesonger</span>
        </h1>
        <p className="lede">
          Antall PDGA-turneringer spilt per spiller per år, summert på tvers av
          alle divisjoner - hele det norske feltet, fra det aller første
          registrerte resultatet i 1990 til 2025.
        </p>

        <GrowthChart agg={S.agg} />
        <StatStrip meta={S.meta} lead={S.top[0]} />
      </header>

      <section className="quick-links">
        <div className="sec-head">
          <h2>Utforsk tallene</h2>
        </div>
        <div className="link-grid">
          <Link href="/statistikk" className="link-card">
            <h3>Statistikk år for år</h3>
            <p>
              Aktive spillere, nye spillere, deltakelser og snitt for hvert år.
            </p>
          </Link>
          <Link href="/topp" className="link-card">
            <h3>Mest aktive spillere</h3>
            <p>Hvem har spilt flest turneringer totalt gjennom alle år?</p>
          </Link>
          <Link href="/events" className="link-card">
            <h3>Turneringer arrangert i Norge</h3>
            <p>Graf, årstabell og komplett turneringsliste per nivå.</p>
          </Link>
          <Link href="/veteraner" className="link-card">
            <h3>Veteraner og streaks</h3>
            <p>Flest aktive sesonger og lengste sammenhengende rekker.</p>
          </Link>
          <Link href="/heatmap" className="link-card">
            <h3>Spillerdetaljer</h3>
            <p>Fullstendig oversikt over deltakelser per spiller per år.</p>
          </Link>
          <Link href="/historie" className="link-card">
            <h3>Historie</h3>
            <p>Norsk diskgolf gjennom tidene – fra pionertid til massesport.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
