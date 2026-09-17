"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CountyPaths, CountyRow, PlayersByCounty } from "@/lib/types";
import { heat, nf } from "@/lib/heat";

type Metric = "total" | "current";

const METRIC_LABEL: Record<Metric, string> = {
  current: "Aktive medlemmer",
  total: "Alle registrerte",
};

const METRIC_LEGEND_LABEL: Record<Metric, string> = {
  current: "Aktive medlemmer",
  total: "Registrerte medlemmer",
};

const METRIC_SHARE_LABEL: Record<Metric, string> = {
  current: "Andel av aktive medlemmer",
  total: "Andel av registrerte medlemmer",
};

const UNKNOWN = "ukjent";

const pct = (n: number, total: number) =>
  total
    ? `${((n / total) * 100).toLocaleString("nb-NO", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      })} %`
    : "–";

export default function CountyMap({
  data,
  paths,
}: {
  data: PlayersByCounty;
  paths: CountyPaths;
}) {
  const [metric, setMetric] = useState<Metric>("current");
  const [hover, setHover] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const byCode = useMemo(
    () => new Map(data.counties.map((c) => [c.code, c])),
    [data.counties],
  );
  const grand =
    metric === "total" ? data.meta.total_players : data.meta.current_members;
  const maxV = Math.max(1, ...data.counties.map((c) => c[metric]));
  const minV = Math.min(...data.counties.map((c) => c[metric]));

  // Tabellrader: fylker sortert synkende, «Ukjent» alltid nederst.
  const rows = useMemo(() => {
    const sorted = [...data.counties].sort(
      (a, b) => b[metric] - a[metric] || a.name.localeCompare(b.name, "nb"),
    );
    const unknown: CountyRow = {
      code: UNKNOWN,
      name: "Ukjent",
      ...data.unknown,
    };
    return [...sorted, unknown];
  }, [data, metric]);

  const most = rows[0];
  const least = rows[rows.length - 2];
  // Pro/am-klassifisering gjelder alle registrerte, ikke bare aktive.
  const showClass = metric === "total";

  const fill = (v: number) => {
    const [r, g, b] = heat(v / maxV);
    return `rgb(${r},${g},${b})`;
  };

  const toggle = useCallback(
    (code: string) => setSelected((cur) => (cur === code ? null : code)),
    [],
  );

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [selected]);

  const active = hover ?? selected;
  const activeCounty = active && active !== UNKNOWN ? byCode.get(active) : null;
  const activePath = activeCounty
    ? paths.counties.find((p) => p.code === activeCounty.code)
    : null;
  const [vbW, vbH] = paths.viewBox.split(" ").slice(2).map(Number);

  const ariaLabel =
    `Kart over Norge som viser antall PDGA-medlemmer per fylke (${METRIC_LABEL[metric].toLowerCase()}). ` +
    `Flest i ${most.name} med ${nf(most[metric])}, færrest i ${least.name} med ${nf(least[metric])}. ` +
    `${nf(data.unknown[metric])} medlemmer kunne ikke plasseres i et fylke. Tallene finnes også i tabellen under.`;

  return (
    <>
      <div
        className="filter-presets county-toggle"
        role="group"
        aria-label="Velg hvilke medlemmer som telles i kart og tabell"
      >
        {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
          <button
            key={m}
            className={`filter-btn${metric === m ? " active" : ""}`}
            aria-pressed={metric === m}
            onClick={() => setMetric(m)}
          >
            {METRIC_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="county-layout">
        <div className="county-map-col">
          <div className="sec-head">
            <h2>Kart</h2>
          </div>
          <div className="chartcard county-card">
            <div className="chart-container county-map">
              <svg
                viewBox={paths.viewBox}
                role="img"
                aria-label={ariaLabel}
                onMouseLeave={() => setHover(null)}
              >
                {paths.counties.map((p) => {
                  const c = byCode.get(p.code);
                  const v = c ? c[metric] : 0;
                  const dim = active !== null && active !== p.code;
                  const isSel = selected === p.code;
                  return (
                    <path
                      key={p.code}
                      className={`county-path${isSel ? " selected" : ""}`}
                      d={p.d}
                      fill={fill(v)}
                      opacity={dim ? 0.4 : 1}
                      tabIndex={0}
                      role="button"
                      aria-pressed={isSel}
                      aria-label={`${p.name}: ${nf(v)} medlemmer`}
                      onMouseEnter={() => setHover(p.code)}
                      onFocus={() => setHover(p.code)}
                      onBlur={() => setHover(null)}
                      onClick={() => toggle(p.code)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggle(p.code);
                        }
                      }}
                    />
                  );
                })}
              </svg>

              {activeCounty && activePath && (
                <div
                  className="chart-tooltip"
                  style={{
                    left: `clamp(100px, ${(activePath.centroid[0] / vbW) * 100}%, calc(100% - 100px))`,
                    top: `min(${(activePath.centroid[1] / vbH) * 100}%, calc(100% - 140px))`,
                  }}
                >
                  <div className="chart-tooltip-year">{activeCounty.name}</div>
                  <div className="chart-tooltip-row">
                    <span>Alle registrerte</span>
                    <strong>{nf(activeCounty.total)}</strong>
                  </div>
                  <div className="chart-tooltip-row">
                    <span>Aktive medlemmer</span>
                    <strong>{nf(activeCounty.current)}</strong>
                  </div>
                  <div className="chart-tooltip-row">
                    <span>Pro / Am</span>
                    <strong>
                      {nf(activeCounty.pro)} / {nf(activeCounty.am)}
                    </strong>
                  </div>
                  <div className="chart-tooltip-row">
                    <span>{METRIC_SHARE_LABEL[metric]}</span>
                    <strong>{pct(activeCounty[metric], grand)}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="legend county-legend" aria-hidden="true">
              <span>{nf(minV)}</span>
              <span className="ramp" />
              <span>
                {nf(maxV)} {METRIC_LEGEND_LABEL[metric]}
              </span>
            </div>
          </div>
        </div>

        <div className="county-table">
          <div className="sec-head">
            <h2>Tabell</h2>
            {selected && (
              <span className="note">
                {rows.find((r) => r.code === selected)?.name} valgt · Esc
                nullstiller
              </span>
            )}
          </div>
          <div className="yearly-stats-wrap">
            <table
              className="yearly-stats county-stats"
              aria-label="Antall PDGA-medlemmer per fylke"
            >
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Fylke</th>
                  <th>{metric === "total" ? "Registrerte" : "Aktive"}</th>
                  <th>{METRIC_SHARE_LABEL[metric]}</th>
                  {showClass && <th className="cls">Pro</th>}
                  {showClass && <th className="cls">Am</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isUnknown = r.code === UNKNOWN;
                  return (
                    <tr
                      key={r.code}
                      className={
                        (selected === r.code ? "selected" : "") +
                        (isUnknown ? " unknown" : "")
                      }
                      onClick={() => !isUnknown && toggle(r.code)}
                      onMouseEnter={() => !isUnknown && setHover(r.code)}
                      onMouseLeave={() => setHover(null)}
                    >
                      <td className="yr-col" style={{ textAlign: "left" }}>
                        {r.name}
                      </td>
                      <td>{nf(r[metric])}</td>
                      <td>{pct(r[metric], grand)}</td>
                      {showClass && <td className="cls">{nf(r.pro)}</td>}
                      {showClass && <td className="cls">{nf(r.am)}</td>}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="yr-col" style={{ textAlign: "left" }}>
                    Sum
                  </td>
                  <td>{nf(grand)}</td>
                  <td>100 %</td>
                  {showClass && (
                    <td className="cls">
                      {nf(rows.reduce((s, r) => s + r.pro, 0))}
                    </td>
                  )}
                  {showClass && (
                    <td className="cls">
                      {nf(rows.reduce((s, r) => s + r.am, 0))}
                    </td>
                  )}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
