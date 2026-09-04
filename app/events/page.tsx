import type { Metadata } from "next";
import events from "@/data/events-summary.json";
import eventsNamed from "@/data/events-named.json";
import EventsChart, { EventsSummary } from "@/components/EventsChart";
import EventsTable, { NamedEvent } from "@/components/EventsTable";
import EventsYearlyTable from "@/components/EventsYearlyTable";
import { nf } from "@/lib/heat";

export const metadata: Metadata = {
  title: "Turneringer arrangert i Norge",
};

export default function TurneringerPage() {
  const data = events as unknown as EventsSummary;
  const named = (eventsNamed as { count: number; events: NamedEvent[] }).events;

  return (
    <>
      <div className="page-header">
        <h1>Turneringer arrangert i Norge</h1>
        <p className="lede">
          Antall PDGA-sanksjonerte turneringer arrangert i Norge per år, fordelt
          på nivå. Avlyste turneringer er holdt utenfor.
        </p>
      </div>

      <section>
        <EventsChart data={data} />
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="sec-head">
          <h2>Årstabell for turneringer</h2>
          <span className="note">alle nivåer</span>
        </div>
        <p className="section-note">
          Grafen og tabellen teller alt PDGA har sanksjonert i Norge, også
          endagsturneringer og ukesgolf. Liga (L) er tatt med som eget nivå, men
          brukes lite her til lands, de fleste ukesgolfer sanksjoneres i stedet
          som frittstående C-tiere.
        </p>
        <EventsYearlyTable rows={data.by_year} levels={data.levels} />
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="sec-head">
          <h2>Turneringer over flere dager</h2>
        </div>
        <p className="section-note">
          Denne lista viser bare turneringer som gikk over mer enn én dag, og
          uten liga. Årsak er å filtrere bort endagsarrangementer. Av{" "}
          {nf(data.meta.n_events)} sanksjonerte turneringer er{" "}
          {nf(data.meta.n_events - named.length)} endagsarrangement. Forbeholdet
          er at en ekte endagsturnering med to runder også faller utenfor.
        </p>
        <EventsTable events={named} />
      </section>
    </>
  );
}
