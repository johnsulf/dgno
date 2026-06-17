import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import GrowthChart from "@/components/GrowthChart";
import StatStrip from "@/components/StatStrip";
import TopBars from "@/components/TopBars";
import HeatmapTable from "@/components/HeatmapTable";
import Footer from "@/components/Footer";

const S = summary as unknown as Summary;

export default function Home() {
  return (
    <main id="main-content" className="wrap">
      <header className="hero">
        <div className="eyebrow">PDGA-statistikk · Norge · 1990–2025</div>
        <h1>
          Turnering for turnering:
          <br />
          norsk diskgolf i <span className="hl">36 sesonger</span>
        </h1>
        <p className="lede">
          Antall PDGA-turneringer spilt per spiller per år, summert på tvers av alle
          divisjoner - hele det norske feltet, fra det aller første registrerte
          resultatet i 1990 til 2025.
        </p>

        <GrowthChart agg={S.agg} />
        <StatStrip meta={S.meta} lead={S.top[0]} />
      </header>

      <section>
        <div className="sec-head">
          <h2>Mest aktive gjennom tidene</h2>
          <span className="note">
            flest turneringer totalt, alle divisjoner, 1990–2025
          </span>
        </div>
        <TopBars top={S.top} />
      </section>

      <section>
        <div className="sec-head">
          <h2>Deltakelser per spiller per år</h2>
          <span className="note">
            klikk en kolonne for å sortere · søk treffer hele feltet
          </span>
        </div>
        <HeatmapTable />
      </section>

      <Footer />
    </main>
  );
}
