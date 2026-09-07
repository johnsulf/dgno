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
          på nivå.
        </p>
      </div>

      <section>
        <EventsChart data={data} />
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="sec-head">
          <h2>Årstabell for antall turneringer</h2>
          <span className="note">alle nivåer</span>
        </div>
        <p className="section-note">
Antall PDGA-sanksjonerte turneringer i Norge per år og nivå, uavhengig av lengde. Avlyste turneringer er fjernet. Liga (L) er tatt med som eget nivå, men brukes lite i Norge da ukesgolfer i stedet sanksjoneres som frittstående C-tiere. Dataene er de samme som grafen over.
        </p>
        <EventsYearlyTable rows={data.by_year} levels={data.levels} />
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="sec-head">
          <h2>Turneringer over flere dager</h2>
        </div>
        <p className="section-note">
Liste over PDGA-turneringer arrangert i Norge. Endagsturneringer er filtrert bort for å få en liste over "ekte" turneringer uten PDGA-sanksjonerte ukesgolfer etc. Ideelt skulle en ikke filtrert bort turneringer med flere runder på samme dag, men dette er ikke mulig da datasettet bare inneholder informasjon om dato og ikke antall runder. Liga (L) er ikke inkludert.
        </p>
        <EventsTable events={named} />
      </section>
    </>
  );
}
