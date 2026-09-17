import type { Metadata } from "next";
import byCounty from "@/data/players-by-county.json";
import countyPaths from "@/data/norway-counties-paths.json";
import CountyMap from "@/components/CountyMap";
import { CountyPaths, PlayersByCounty } from "@/lib/types";
import { nf } from "@/lib/heat";

export const metadata: Metadata = {
  title: "PDGA-medlemmer per fylke",
};

export default function FylkerPage() {
  const data = byCounty as PlayersByCounty;
  const paths = countyPaths as CountyPaths;
  const year = new Date().getFullYear();
  const { meta } = data;
  const pctCoverage = (meta.coverage * 100).toLocaleString("nb-NO", {
    maximumFractionDigits: 1,
  });

  return (
    <>
      <div className="page-header">
        <h1>PDGA-medlemmer per fylke</h1>
        <p className="lede">
          Hvor kommer Norges PDGA-medlemmer fra? Oversikten viser antall
          medlemmer med aktivt medlemskap fordelt på fylke. Alle som noen gang
          har vært medlem kan også vises.
        </p>
      </div>

      <section className="county-section">
        <CountyMap data={data} paths={paths} />
      </section>

      <section>
        <div className="sec-head">
          <h2>Slik er fylke utledet</h2>
        </div>
        <p className="section-note">
          PDGA lagrer ikke fylke for norske medlemmer, bare et fritekstfelt for
          by som medlemmet selv har fylt ut. Vi slår dette opp mot Brings
          postnummerregister (poststed og kommune) og utleder fylke etter
          2024-inndelingen. Av {nf(meta.total_players)} medlemmer er{" "}
          {nf(meta.matched)} plassert; {nf(meta.no_city)} har ikke oppgitt by,
          og {nf(meta.unmatched - meta.no_city)} har skrevet noe vi ikke klarer
          å tolke (skrivefeil, utenlandske steder). Disse vises som «Ukjent» i
          tabellen i stedet for å skjules.
        </p>
        <p className="section-note">
          Feilkilder: samme stedsnavn kan finnes flere steder i landet, og da
          velges det største. Bosted er det som står i profilen i dag, ikke da
          medlemmet var aktivt. «Alle registrerte» inkluderer utløpte
          medlemskap; «Aktive medlemmer» er de med gyldig medlemskap per{" "}
          {meta.source_fetched ?? meta.generated}. Pro/am-fordelingen gjelder
          alle registrerte. Kartet viser kun aggregerte tall, ingen
          enkeltmedlemmer, i tråd med PDGAs vilkår.
        </p>
        <p className="section-note">
          <b>Player data © {year} PDGA.</b> Fylkesgrenser © Kartverket (CC BY
          4.0). Postnummerregister fra Bring.
        </p>
      </section>
    </>
  );
}
