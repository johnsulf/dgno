"use client";

import { useMemo, useState } from "react";
import { nf } from "@/lib/heat";

export type NamedEvent = {
  id: string;
  name: string;
  tier: "ES" | "A" | "B";
  rawtier: string;
  year: number;
  date: string;
  city: string | null;
  cls: string;
};

const TIER_COLOR: Record<NamedEvent["tier"], string> = {
  ES: "#e9f1ec",
  A: "#ff6a3d",
  B: "#f4b942",
};
const TIER_RANK: Record<NamedEvent["tier"], number> = { ES: 0, A: 1, B: 2 };
const FILTERS: ("ALL" | "ES" | "A" | "B")[] = ["ALL", "ES", "A", "B"];

type SortKey = "year" | "name" | "tier" | "city";

export default function EventsTable({ events }: { events: NamedEvent[] }) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState<"ALL" | "ES" | "A" | "B">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [dir, setDir] = useState<number>(-1);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = events.filter((e) => {
      if (tier !== "ALL" && e.tier !== tier) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        (e.city ?? "").toLowerCase().includes(q)
      );
    });
    const val = (e: NamedEvent): string | number =>
      sortKey === "year"
        ? e.year
        : sortKey === "tier"
          ? TIER_RANK[e.tier]
          : sortKey === "city"
            ? (e.city ?? "").toLowerCase()
            : e.name.toLowerCase();
    rows = [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (x < y) return -dir;
      if (x > y) return dir;
      return b.year - a.year;
    });
    return rows;
  }, [events, query, tier, sortKey, dir]);

  function onSort(k: SortKey) {
    if (k === sortKey) setDir((d) => -d);
    else {
      setSortKey(k);
      setDir(k === "name" || k === "city" ? 1 : -1);
    }
  }

  const arrow = (k: SortKey) =>
    sortKey === k ? (
      <span className="ev-arr">{dir < 0 ? " ▼" : " ▲"}</span>
    ) : null;

  return (
    <div className="ev-root">
      <style>{CSS}</style>

      <div className="ev-controls">
        <label className="ev-search">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Søk etter turnering eller sted…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </label>
        <div className="ev-filters">
          {FILTERS.map((f) => (
            <button
              key={f}
              className="ev-chip"
              aria-pressed={tier === f}
              onClick={() => setTier(f)}
            >
              {f === "ALL" ? "Alle" : f === "ES" ? "Elite Series" : `${f}-tier`}
            </button>
          ))}
        </div>
      </div>

      <div className="ev-wrap">
        <table className="ev-table">
          <thead>
            <tr>
              <th onClick={() => onSort("year")}>År{arrow("year")}</th>
              <th onClick={() => onSort("name")}>Turnering{arrow("name")}</th>
              <th onClick={() => onSort("tier")}>Nivå{arrow("tier")}</th>
              <th onClick={() => onSort("city")}>Sted{arrow("city")}</th>
              <th>Klasse</th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id}>
                <td className="ev-year">{e.year}</td>
                <td className="ev-name">
                  <a
                    href={`https://www.pdga.com/tour/event/${e.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {e.name}
                  </a>
                </td>
                <td>
                  <span
                    className="ev-pill"
                    style={{ background: TIER_COLOR[e.tier] }}
                  >
                    {e.tier === "ES" ? "ES" : e.tier}
                  </span>
                </td>
                <td className="ev-city">{e.city ?? "—"}</td>
                <td className="ev-cls">{e.cls}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ev-foot">
        viser {nf(list.length)} av {nf(events.length)} turneringer
      </div>
    </div>
  );
}

const CSS = `
.ev-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.ev-search{flex:1;min-width:200px;display:flex;align-items:center;gap:8px;background:var(--color-panel,#102528);border:1px solid var(--color-line,#1d3a3e);border-radius:10px;padding:9px 13px;color:var(--color-muted,#83a8a1)}
.ev-search>svg{width:15px;height:15px;flex-shrink:0}
.ev-search input{flex:1;background:none;border:none;outline:none;color:var(--color-text,#e9f1ec);font:inherit;font-size:14px}
.ev-search input::placeholder{color:var(--color-muted2,#5d827c)}
.ev-filters{display:flex;gap:6px;flex-wrap:wrap}
.ev-chip{background:var(--color-panel,#102528);border:1px solid var(--color-line,#1d3a3e);color:var(--color-muted,#83a8a1);border-radius:8px;padding:7px 12px;font:inherit;font-size:13px;cursor:pointer}
.ev-chip[aria-pressed="true"]{border-color:var(--color-teal,#2bb6a8);color:var(--color-teal,#2bb6a8)}
.ev-wrap{border:1px solid var(--color-line,#1d3a3e);border-radius:14px;overflow:auto;background:var(--color-panel2,#0e2024);max-height:72vh}
table.ev-table{width:100%;border-collapse:separate;border-spacing:0;font-size:14px}
.ev-table thead th{position:sticky;top:0;background:#0b181b;color:var(--color-muted,#83a8a1);font-family:var(--font-mono,monospace);font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.04em;text-align:left;padding:10px 12px;border-bottom:1px solid var(--color-line2,#24474c);cursor:pointer;white-space:nowrap;user-select:none}
.ev-table tbody td{padding:9px 12px;border-bottom:1px solid rgba(29,58,62,.5);vertical-align:middle}
.ev-table tbody tr:hover{background:#16302f}
.ev-year{font-family:var(--font-mono,monospace);color:var(--color-muted,#83a8a1);white-space:nowrap}
.ev-name a{color:var(--color-text,#e9f1ec);text-decoration:none;font-weight:600}
.ev-name a:hover{color:var(--color-teal,#2bb6a8);text-decoration:underline}
.ev-city{color:var(--color-muted,#83a8a1)}
.ev-cls{font-family:var(--font-mono,monospace);color:var(--color-muted2,#5d827c);font-size:12px;white-space:nowrap}
.ev-pill{display:inline-block;padding:2px 9px;border-radius:999px;font-family:var(--font-mono,monospace);font-size:11px;font-weight:700;color:#0b181b}
.ev-foot{margin-top:12px;color:var(--color-muted2,#5d827c);font-family:var(--font-mono,monospace);font-size:13px}
.ev-arr{color:var(--color-brass,#f2a93b)}
`;
