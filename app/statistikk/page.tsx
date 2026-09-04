import type { Metadata } from "next";
import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import YearlyStatsTable from "@/components/YearlyStatsTable";

const S = summary as unknown as Summary;

export const metadata: Metadata = {
  title: "Statistikk år for år",
};

export default function StatistikkPage() {
  const [firstYear, lastYear] = S.meta.span;

  return (
    <>
      <div className="page-header">
        <h1>Statistikk år for år</h1>
        <p className="lede">
          Antall spillere med minst én turnering, nye spillere, deltakelser og
          snitt - sesong for sesong fra {firstYear} til {lastYear}.
        </p>
      </div>

      <section>
        <YearlyStatsTable agg={S.agg} />
      </section>
    </>
  );
}
