import type { Metadata } from "next";
import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import LongevityTable from "@/components/LongevityTable";

const S = summary as unknown as Summary;

export const metadata: Metadata = {
  title: "Veteraner og streaks",
};

export default function VeteranerPage() {
  return (
    <>
      <div className="page-header">
        <h1>Veteraner og streaks</h1>
        <p className="lede">
          Hvem har holdt på lengst? Flest aktive sesonger, lengste sammenhengende
          rekker, og hvem som fortsatt er aktive.
        </p>
      </div>

      <section>
        <LongevityTable
          topSeasons={S.topSeasons}
          topStreaks={S.topStreaks}
          topActiveStreaks={S.topActiveStreaks}
        />
      </section>
    </>
  );
}
