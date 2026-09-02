"use client";

import { useCallback, useRef, useState } from "react";
import { Agg } from "@/lib/types";
import { nf } from "@/lib/heat";

export default function GrowthChart({ agg }: { agg: Agg }) {
  const YEARS = agg.years;
  const yt = agg.yr_tour;
  const W = 1000,
    H = 300,
    pad = { l: 30, r: 30, t: 26, b: 26 };
  const maxY = Math.max(...yt);
  const x = (i: number) => pad.l + (W - pad.l - pad.r) * (i / (YEARS.length - 1));
  const y = (v: number) => H - pad.b - (H - pad.t - pad.b) * (v / maxY);

  let area = `M ${x(0)} ${y(0)}`;
  let line = `M ${x(0)} ${y(yt[0])}`;
  yt.forEach((v, i) => {
    area += ` L ${x(i)} ${y(v)}`;
    if (i) line += ` L ${x(i)} ${y(v)}`;
  });
  area += ` L ${x(yt.length - 1)} ${y(0)} Z`;

  const gridVals = [0, maxY / 2, maxY];
  const tickYears = YEARS.filter((yr) => yr % 5 === 0);

  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width * W;
      // Find closest year index
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < YEARS.length; i++) {
        const d = Math.abs(x(i) - relX);
        if (d < minDist) { minDist = d; closest = i; }
      }
      setHoverIdx(closest);
    },
    [YEARS.length]
  );

  const onMouseLeave = useCallback(() => setHoverIdx(null), []);

  return (
    <div className="chartcard">
      <h2>Turneringsdeltakelser av norske PDGA-medlemmer per år</h2>
      <div className="chart-container">
        <svg
          ref={svgRef}
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Linjediagram som viser turneringsdeltakelser per år fra ${YEARS[0]} til ${YEARS[YEARS.length - 1]}.`}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
        >
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f4b942" stopOpacity=".55" />
              <stop offset="1" stopColor="#2bb6a8" stopOpacity=".04" />
            </linearGradient>
          </defs>
          {gridVals.map((v, k) => (
            <g key={k}>
              <line className="gridline" x1={pad.l} y1={y(v)} x2={W - pad.r} y2={y(v)} />
              <text className="axis-label" x={pad.l} y={y(v) - 4}>
                {nf(Math.round(v))}
              </text>
            </g>
          ))}
          <path className="area" d={area} />
          <path className="aline" d={line} />
          {tickYears.map((yr) => {
            const i = YEARS.indexOf(yr);
            if (i < 0) return null;
            return (
              <text
                key={yr}
                className="axis-label"
                x={x(i)}
                y={H - 8}
                textAnchor="middle"
              >
                {yr}
              </text>
            );
          })}
          {/* Hover crosshair */}
          {hoverIdx !== null && (
            <>
              <line
                x1={x(hoverIdx)} y1={pad.t} x2={x(hoverIdx)} y2={H - pad.b}
                stroke="var(--color-muted)" strokeWidth={1} strokeDasharray="4 3" opacity={0.6}
              />
              <circle
                cx={x(hoverIdx)} cy={y(yt[hoverIdx])} r={5}
                fill="var(--color-hot)" stroke="var(--color-text)" strokeWidth={2}
              />
            </>
          )}
        </svg>
        {/* Tooltip */}
        {hoverIdx !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `clamp(90px, ${(x(hoverIdx) / W) * 100}%, calc(100% - 90px))`,
            }}
          >
            <div className="chart-tooltip-year">{YEARS[hoverIdx]}</div>
            <div className="chart-tooltip-row">
              <span>Deltakelser</span>
              <strong>{nf(yt[hoverIdx])}</strong>
            </div>
            <div className="chart-tooltip-row">
              <span>Spillere</span>
              <strong>{nf(agg.yr_players[hoverIdx])}</strong>
            </div>
            {agg.yr_top5?.[hoverIdx]?.length > 0 && (
              <div className="chart-tooltip-top5">
                {agg.yr_top5[hoverIdx].map(([name, count], i) => (
                  <div key={i} className="chart-tooltip-player">
                    <span>{i + 1}. {name}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
