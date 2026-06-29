import type { Metadata } from "next";
import events from "@/data/events-summary.json";
import eventsNamed from "@/data/events-named.json";
import EventsChart, { EventsSummary } from "@/components/EventsChart";
import EventsTable, { NamedEvent } from "@/components/EventsTable";
import EventsYearlyTable from "@/components/EventsYearlyTable";

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
          på nivå - fra de første på begynnelsen av 2000-tallet til{" "}
          {data.meta.peak_count} i {data.meta.peak_year}.
        </p>
      </div>

      <section>
        <EventsChart data={data} />
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="sec-head">
          <h2>Årstabell for turneringer</h2>
        </div>
        <EventsYearlyTable rows={data.by_year} levels={data.levels} />
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="sec-head">
          <h2>Alle turneringer (ES, A og B-tier)</h2>
        </div>
        <EventsTable events={named} />
      </section>
    </>
  );
}
