"use client";

import { Agg } from "@/lib/types";
import { nf } from "@/lib/heat";

export default function YearlyStatsTable({ agg }: { agg: Agg }) {
  // Show years in reverse order (newest first)
  const indices = agg.years.map((_, i) => i).reverse();

  return (
    <div className="yearly-stats-wrap">
      <table className="yearly-stats">
        <thead>
          <tr>
            <th>År</th>
            <th>Aktive spillere</th>
            <th>Nye spillere</th>
            <th>Deltakelser</th>
            <th>Snitt per spiller</th>
          </tr>
        </thead>
        <tbody>
          {indices.map((i) => (
            <tr key={agg.years[i]}>
              <td className="yr-col">{agg.years[i]}</td>
              <td>{nf(agg.yr_players[i])}</td>
              <td>{nf(agg.yr_new[i])}</td>
              <td>{nf(agg.yr_tour[i])}</td>
              <td>{agg.yr_avg[i].toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
