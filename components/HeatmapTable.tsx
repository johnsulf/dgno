"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayersData, Player } from "@/lib/types";
import { heat, nf } from "@/lib/heat";

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function HeatmapTable() {
  const [data, setData] = useState<PlayersData | null>(null);
  const [sortK, setSortK] = useState<string>("total");
  const [dir, setDir] = useState<number>(-1);
  const [shown, setShown] = useState<number>(200);
  const [query, setQuery] = useState<string>("");
  const debouncedQuery = useDebounced(query, 150);
  const bodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    let alive = true;
    const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
    fetch(`${base}/data/players.json`)
      .then((r) => r.json())
      .then((d: PlayersData) => {
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const YEARS = data?.years ?? [];
  const MAXC = useMemo(() => {
    let m = 0;
    if (data) for (const p of data.players) for (const v of p.y) if (v > m) m = v;
    return m || 1;
  }, [data]);

  function sortFn(k: string): (p: Player) => number | string {
    if (k === "name") return (p) => p.name.toLowerCase();
    if (k === "total") return (p) => p.total;
    if (k === "seasons") return (p) => p.seasons;
    const idx = YEARS.indexOf(+k);
    return (p) => p.y[idx];
  }

  // Render rows imperatively for performance (5700+ rows × ~38 cols).
  useEffect(() => {
    if (!data || !bodyRef.current) return;
    const raw = debouncedQuery.trim().toLowerCase();
    const s = raw.length >= 3 ? raw : "";

    // Build global rank map based on total (original order)
    const globalRank = new Map<string, number>();
    const ranked = data.players.slice().sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
    for (let i = 0; i < ranked.length; i++) globalRank.set(ranked[i].pdga, i + 1);

    let list = s
      ? data.players.filter(
          (p) => p.name.toLowerCase().includes(s) || p.pdga.includes(s)
        )
      : data.players;
    const v = sortFn(sortK);
    list = list.slice().sort((a, b) => {
      const xa = v(a);
      const xb = v(b);
      if (xa < xb) return -dir;
      if (xa > xb) return dir;
      return a.total < b.total ? 1 : -1;
    });
    const limit = s ? list.length : Math.min(shown, list.length);
    const vis = list.slice(0, limit);

    const raf = requestAnimationFrame(() => {
      if (!bodyRef.current) return;
      let html = "";
      for (let i = 0; i < vis.length; i++) {
        const p = vis[i];
        const rank = globalRank.get(p.pdga) ?? (i + 1);
        let c =
          `<td class="pin nmcell"><div class="nm"><span class="rank">${rank}</span>` +
          `<a href="https://www.pdga.com/player/${esc(p.pdga)}" target="_blank" rel="noopener noreferrer">${esc(
            p.name
          )}</a></div>` +
          `<div class="meta">#${esc(p.pdga)} · ${p.first}–${p.last}</div></td>` +
          `<td class="tot">${p.total}</td><td class="sea">${p.seasons}</td>`;
        for (const val of p.y) {
          if (!val) {
            c += `<td class="cell empty">·</td>`;
          } else {
            const t = val / MAXC;
            const [r, g, b] = heat(t);
            const txt = t > 0.45 ? "#0b181b" : "#cfe6df";
            c += `<td class="cell" style="background:rgb(${r},${g},${b});color:${txt}">${val}</td>`;
          }
        }
        html += `<tr>${c}</tr>`;
      }
      bodyRef.current.innerHTML = html;
    });
    return () => cancelAnimationFrame(raf);
  }, [data, sortK, dir, shown, debouncedQuery, MAXC]);

  function onSort(k: string) {
    if (k === sortK) setDir((d) => -d);
    else {
      setSortK(k);
      setDir(k === "name" ? 1 : -1);
    }
  }

  const filteredCount = useMemo(() => {
    if (!data) return 0;
    const raw = debouncedQuery.trim().toLowerCase();
    const s = raw.length >= 3 ? raw : "";
    if (!s) return Math.min(shown, data.players.length);
    return data.players.filter(
      (p) => p.name.toLowerCase().includes(s) || p.pdga.includes(s)
    ).length;
  }, [data, debouncedQuery, shown]);

  const total = data?.players.length ?? 0;
  const searching = debouncedQuery.trim().length >= 3;
  const hideBtns = searching || shown >= total;

  const arrow = (k: string) =>
    sortK === k ? <span className="arr">{dir < 0 ? " ▼" : " ▲"}</span> : null;

  return (
    <>
      <div className="controls">
        <label className="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Søk (min. 3 tegn)…"
            autoComplete="off"
            aria-label="Søk etter spiller eller PDGA-nummer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="legend" aria-hidden="true">
          <span>færre</span>
          <span className="ramp" />
          <span>flere turneringer</span>
        </div>
      </div>

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th
                className="pin sortable"
                onClick={() => onSort("name")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort("name"); } }}
                tabIndex={0}
                scope="col"
                aria-sort={sortK === "name" ? (dir < 0 ? "descending" : "ascending") : undefined}
              >
                Spiller{arrow("name")}
              </th>
              <th
                className="tot sortable"
                onClick={() => onSort("total")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort("total"); } }}
                tabIndex={0}
                scope="col"
                aria-sort={sortK === "total" ? (dir < 0 ? "descending" : "ascending") : undefined}
              >
                Total{arrow("total")}
              </th>
              <th
                className="sea sortable"
                onClick={() => onSort("seasons")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort("seasons"); } }}
                tabIndex={0}
                scope="col"
                aria-sort={sortK === "seasons" ? (dir < 0 ? "descending" : "ascending") : undefined}
              >
                Ses.{arrow("seasons")}
              </th>
              {YEARS.map((y) => (
                <th
                  key={y}
                  className="yr sortable"
                  onClick={() => onSort(String(y))}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSort(String(y)); } }}
                  tabIndex={0}
                  scope="col"
                  aria-sort={sortK === String(y) ? (dir < 0 ? "descending" : "ascending") : undefined}
                >
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={bodyRef} />
        </table>
      </div>

      <div className="tablefoot" aria-live="polite">
        {data ? (
          <span>
            viser {nf(filteredCount)} av {nf(total)} spillere
          </span>
        ) : (
          <span>laster data…</span>
        )}
        {!hideBtns && (
          <>
            <button className="btn" onClick={() => setShown((n) => n + 500)}>
              Vis 500 flere
            </button>
            <button className="btn" onClick={() => setShown(total)}>
              Vis alle
            </button>
          </>
        )}
      </div>
    </>
  );
}
