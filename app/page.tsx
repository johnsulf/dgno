import summary from "@/data/summary.json";
import events from "@/data/events-summary.json";
import { Summary } from "@/lib/types";
import GrowthChart from "@/components/GrowthChart";
import StatStrip from "@/components/StatStrip";
import Link from "next/link";

const S = summary as unknown as Summary;
const nEvents = (events as { meta: { n_events: number } }).meta.n_events;

export default function Home() {
  const [firstYear, lastYear] = S.meta.span;
  const seasons = S.agg.years.length;

  return (
    <>
      <header className="hero">
        <div className="eyebrow">
          PDGA-statistikk · Norge · {firstYear}-{lastYear}
        </div>
        <h1>
          Norsk diskgolf år for år
        </h1>

        <GrowthChart agg={S.agg} />
        <StatStrip meta={S.meta} lead={S.top[0]} nEvents={nEvents} />
      </header>

      <section className="quick-links">
        <div className="sec-head">
          <h2>Utforsk tallene</h2>
        </div>
        <div className="link-grid">
          <Link href="/statistikk" className="link-card">
            <h3>Statistikk år for år</h3>
            <p>
              Antall spillere, nye spillere, deltakelser og snitt for hvert år.
            </p>
          </Link>
          <Link href="/topp" className="link-card">
            <h3>Mest aktive spillere</h3>
            <p>Hvem har flest spilte turneringer totalt gjennom alle år?</p>
          </Link>
          <Link href="/events" className="link-card">
            <h3>Turneringer arrangert i Norge</h3>
            <p>Graf, årstabell og turneringsliste per nivå.</p>
          </Link>
          <Link href="/veteraner" className="link-card">
            <h3>Veteraner og sammenhengende rekker</h3>
            <p>Flest sesonger og lengste sammenhengende rekker.</p>
          </Link>
          <Link href="/heatmap" className="link-card">
            <h3>Spillerdetaljer</h3>
            <p>Fullstendig oversikt over deltakelser per spiller per år.</p>
          </Link>
          <Link href="/milepaeler" className="link-card">
            <h3>Historiske milepæler</h3>
            <p>Fra første norske medlem i 1987 til Elite Series og EM i 2025.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
