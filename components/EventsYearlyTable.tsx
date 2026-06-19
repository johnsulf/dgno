import { nf } from "@/lib/heat";
import type { EventLevel, EventsYearRow } from "@/components/EventsChart";

const LEVEL_LABELS: Record<EventLevel, string> = {
  C: "C-tier",
  B: "B-tier",
  A: "A-tier",
  ES: "Elite Series",
  L: "Liga",
};

const LEVEL_ORDER: EventLevel[] = ["C", "B", "A", "ES", "L"];

export default function EventsYearlyTable({
  rows,
  levels,
}: {
  rows: EventsYearRow[];
  levels: EventLevel[];
}) {
  const visibleLevels = LEVEL_ORDER.filter((level) => levels.includes(level));
  const sortedRows = [...rows].sort((a, b) => b.year - a.year);

  return (
    <div className="yearly-stats-wrap">
      <table
        className="yearly-stats"
        aria-label="Turneringer arrangert i Norge per år og nivå"
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>År</th>
            <th>Totalt</th>
            {visibleLevels.map((level) => (
              <th key={level}>{LEVEL_LABELS[level]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.year}>
              <td className="yr-col" style={{ textAlign: "left" }}>
                {row.year}
              </td>
              <td>{nf(row.total)}</td>
              {visibleLevels.map((level) => (
                <td key={`${row.year}-${level}`}>{nf(row[level] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
