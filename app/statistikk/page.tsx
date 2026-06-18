import type { Metadata } from "next";
import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import YearlyStatsTable from "@/components/YearlyStatsTable";

const S = summary as unknown as Summary;

export const metadata: Metadata = {
  title: "Statistikk år for år",
};

export default function StatistikkPage() {
  return (
    <>
      <div className="page-header">
        <h1>Statistikk år for år</h1>
        <p className="lede">
          Aktive spillere, nye spillere, deltakelser og snitt – sesong for sesong fra
          1990 til 2025.
        </p>
      </div>

      <section>
        <div className="sec-head">
          <span className="note">
            aktive spillere, nye spillere, deltakelser og snitt
          </span>
        </div>
        <YearlyStatsTable agg={S.agg} />
      </section>
    </>
  );
}
