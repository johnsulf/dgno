"use client";

import { useCallback, useRef, useState } from "react";
import { nf } from "@/lib/heat";

export type EventLevel = "ES" | "A" | "B" | "C" | "L";

export type EventsYearRow = { year: number; total: number } & Record<
  EventLevel,
  number
>;

export type EventsSummary = {
  meta: {
    n_events: number;
    cancelled: number;
    span: [number, number];
    first_year: number;
    peak_year: number;
    peak_count: number;
  };
  levels: EventLevel[];
  by_year: EventsYearRow[];
  by_level_total: Record<EventLevel, number>;
  by_class: Record<string, number>;
};

// Stack order (bottom -> top) and colours. C is the broad base of the sport.
const LEVELS: { code: EventLevel; label: string; color: string }[] = [
  { code: "C", label: "C-tier", color: "#2bb6a8" },
  { code: "B", label: "B-tier", color: "#f4b942" },
  { code: "A", label: "A-tier", color: "#ff6a3d" },
  { code: "ES", label: "Elite Series", color: "#e9f1ec" },
  { code: "L", label: "Liga", color: "#5d827c" },
];

export default function EventsChart({ data }: { data: EventsSummary }) {
  const rows = data.by_year;
  const n = rows.length;
  const W = 1000,
    H = 300,
    pad = { l: 30, r: 30, t: 26, b: 26 };
  const innerW = W - pad.l - pad.r;
  const maxY = Math.max(...rows.map((d) => d.total), 1);

  const slotW = innerW / n;
  const barW = Math.min(slotW * 0.7, 34);
  const cx = (i: number) => pad.l + slotW * (i + 0.5);
  const y = (v: number) => H - pad.b - (H - pad.t - pad.b) * (v / maxY);

  const gridVals = [0, maxY / 2, maxY];
  const tickYears = rows
    .map((d) => d.year)
    .filter((yr) => yr % 5 === 0);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * W;
      let idx = Math.round((relX - pad.l) / slotW - 0.5);
      idx = Math.max(0, Math.min(n - 1, idx));
      setHoverIdx(idx);
    },
    [n, slotW]
  );

  const onMouseLeave = useCallback(() => setHoverIdx(null), []);

  return (
    <div className="chartcard">
      <h2>Turneringer arrangert i Norge per år</h2>
      <div className="chart-container">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Stablet søylediagram som viser antall PDGA-turneringer arrangert i Norge per år fra ${data.meta.span[0]} til ${data.meta.span[1]}, fordelt på nivå. Toppår: ${nf(
            data.meta.peak_count
          )} turneringer i ${data.meta.peak_year}.`}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {gridVals.map((v, k) => (
            <g key={k}>
              <line
                className="gridline"
                x1={pad.l}
                y1={y(v)}
                x2={W - pad.r}
                y2={y(v)}
              />
              <text className="axis-label" x={pad.l} y={y(v) - 4}>
                {nf(Math.round(v))}
              </text>
            </g>
          ))}

          {rows.map((row, i) => {
            let acc = 0;
            const dim = hoverIdx !== null && hoverIdx !== i;
            return (
              <g key={row.year} opacity={dim ? 0.4 : 1}>
                {LEVELS.map((lv) => {
                  const v = row[lv.code];
                  if (!v) return null;
                  const yTop = y(acc + v);
                  const h = y(acc) - yTop;
                  acc += v;
                  return (
                    <rect
                      key={lv.code}
                      x={cx(i) - barW / 2}
                      y={yTop}
                      width={barW}
                      height={h}
                      fill={lv.color}
                      rx={1}
                    />
                  );
                })}
              </g>
            );
          })}

          {tickYears.map((yr) => {
            const i = rows.findIndex((d) => d.year === yr);
            if (i < 0) return null;
            return (
              <text
                key={yr}
                className="axis-label"
                x={cx(i)}
                y={H - 8}
                textAnchor="middle"
              >
                {yr}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 16px",
            marginTop: 12,
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 12,
            color: "var(--color-muted, #83a8a1)",
          }}
        >
          {LEVELS.map((lv) => (
            <span
              key={lv.code}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <span
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 3,
                  background: lv.color,
                  display: "inline-block",
                }}
              />
              {lv.label}
              <strong style={{ color: "var(--color-text, #e9f1ec)" }}>
                {nf(data.by_level_total[lv.code])}
              </strong>
            </span>
          ))}
        </div>

        {/* Tooltip */}
        {hoverIdx !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `clamp(90px, ${(cx(hoverIdx) / W) * 100}%, calc(100% - 90px))`,
            }}
          >
            <div className="chart-tooltip-year">{rows[hoverIdx].year}</div>
            <div className="chart-tooltip-row">
              <span>Totalt</span>
              <strong>{nf(rows[hoverIdx].total)}</strong>
            </div>
            {LEVELS.filter((lv) => rows[hoverIdx][lv.code] > 0).map((lv) => (
              <div className="chart-tooltip-row" key={lv.code}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: 2,
                      background: lv.color,
                      display: "inline-block",
                    }}
                  />
                  {lv.label}
                </span>
                <strong>{nf(rows[hoverIdx][lv.code])}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
