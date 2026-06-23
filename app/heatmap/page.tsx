import type { Metadata } from "next";
import HeatmapTable from "@/components/HeatmapTable";

export const metadata: Metadata = {
  title: "Heatmap – deltakelser per spiller",
};

export default function HeatmapPage() {
  return (
    <>
      <div className="page-header">
        <h1>Deltakelser per spiller per år</h1>
        <p className="lede">
          Komplett oversikt over antall turneringer spilt per spiller per år.
          Søk, sorter og utforsk datene.
        </p>
      </div>

      <section>
        <div className="sec-head">
          <span className="note">
            klikk en kolonne for å sortere · søk treffer alle spalter
          </span>
        </div>
        <HeatmapTable />
      </section>
    </>
  );
}
