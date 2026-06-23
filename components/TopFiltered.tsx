"use client";

import { useState, useMemo } from "react";
import playersData from "@/public/data/players.json";
import TopBars from "@/components/TopBars";
import { nf } from "@/lib/heat";
import { TopPlayer } from "@/lib/types";

type FilterMode = "total" | "last5" | "last10" | "year" | "range";

export default function TopFiltered() {
  const years: number[] = playersData.years;
  const currentYear = years[years.length - 1];

  const [mode, setMode] = useState<FilterMode>("total");
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [rangeFrom, setRangeFrom] = useState<number>(years[0]);
  const [rangeTo, setRangeTo] = useState<number>(currentYear);

  const { fromIdx, toIdx, filteredYears } = useMemo(() => {
    let fromIdx: number;
    let toIdx: number;

    switch (mode) {
      case "total":
        fromIdx = 0;
        toIdx = years.length - 1;
        break;
      case "last5":
        fromIdx = years.length - 5;
        toIdx = years.length - 1;
        break;
      case "last10":
        fromIdx = years.length - 10;
        toIdx = years.length - 1;
        break;
      case "year":
        fromIdx = years.indexOf(selectedYear);
        toIdx = fromIdx;
        break;
      case "range": {
        fromIdx = years.indexOf(rangeFrom);
        toIdx = years.indexOf(rangeTo);
        if (fromIdx > toIdx) [fromIdx, toIdx] = [toIdx, fromIdx];
        break;
      }
    }

    fromIdx = Math.max(0, fromIdx);
    toIdx = Math.min(years.length - 1, toIdx);

    return {
      fromIdx,
      toIdx,
      filteredYears: years.slice(fromIdx, toIdx + 1),
    };
  }, [mode, selectedYear, rangeFrom, rangeTo, years]);

  const topPlayers = useMemo(() => {
    const players = (
      playersData.players as {
        pdga: string;
        name: string;
        first: number | null;
        last: number | null;
        y: number[];
      }[]
    )
      .map((p) => {
        const slice = p.y.slice(fromIdx, toIdx + 1);
        return {
          pdga: p.pdga,
          name: p.name,
          first: p.first,
          last: p.last,
          yearly: slice,
          total: slice.reduce((s, v) => s + v, 0),
        };
      })
      .filter((p) => p.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);

    return players;
  }, [fromIdx, toIdx]);

  const top: TopPlayer[] = topPlayers.map((p) => ({
    pdga: p.pdga,
    name: p.name,
    total: p.total,
    first: p.first,
    last: p.last,
  }));

  const periodLabel =
    mode === "year"
      ? `${selectedYear}`
      : `${years[fromIdx]}–${years[toIdx]}`;

  const showYearlyCols = filteredYears.length > 1 && filteredYears.length <= 15;

  return (
    <>
      <div className="filter-bar">
        <div className="filter-presets">
          <button
            className={`filter-btn${mode === "total" ? " active" : ""}`}
            onClick={() => setMode("total")}
          >
            Totalt
          </button>
          <button
            className={`filter-btn${mode === "last5" ? " active" : ""}`}
            onClick={() => setMode("last5")}
          >
            Siste 5 år
          </button>
          <button
            className={`filter-btn${mode === "last10" ? " active" : ""}`}
            onClick={() => setMode("last10")}
          >
            Siste 10 år
          </button>
          <button
            className={`filter-btn${mode === "year" ? " active" : ""}`}
            onClick={() => setMode("year")}
          >
            Enkeltår
          </button>
          <button
            className={`filter-btn${mode === "range" ? " active" : ""}`}
            onClick={() => setMode("range")}
          >
            Egendefinert
          </button>
        </div>

        {mode === "year" && (
          <div className="filter-detail">
            <label className="filter-detail-label">Velg år:</label>
            <select
              className="filter-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {[...years].reverse().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === "range" && (
          <div className="filter-detail">
            <label className="filter-detail-label">Fra:</label>
            <select
              className="filter-select"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label className="filter-detail-label">Til:</label>
            <select
              className="filter-select"
              value={rangeTo}
              onChange={(e) => setRangeTo(Number(e.target.value))}
            >
              {[...years].reverse().map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <section>
        <div className="sec-head">
          <span className="note">
            flest turneringer, alle divisjoner, {periodLabel}
          </span>
        </div>
        <TopBars top={top} showActiveYears={mode === "total"} />
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="sec-head">
          <span className="note">
            tabellvisning{filteredYears.length > 1 ? ` per år (${periodLabel})` : ` (${periodLabel})`} for topp 20
          </span>
        </div>
        <div className="yearly-stats-wrap">
          <table
            className="yearly-stats"
            aria-label={`Topp 20 mest aktive ${periodLabel}`}
          >
            <thead>
              <tr>
                <th style={{ width: showYearlyCols ? "28%" : "auto", textAlign: "left" }}>
                  Spiller
                </th>
                {showYearlyCols &&
                  filteredYears.map((year) => <th key={year}>{year}</th>)}
                <th>Totalt</th>
              </tr>
            </thead>
            <tbody>
              {topPlayers.map((p) => (
                <tr key={p.pdga}>
                  <td style={{ textAlign: "left" }}>
                    <a
                      href={`https://www.pdga.com/player/${p.pdga}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.name}
                    </a>
                  </td>
                  {showYearlyCols &&
                    p.yearly.map((count, i) => (
                      <td key={`${p.pdga}-${filteredYears[i]}`}>
                        {nf(count)}
                      </td>
                    ))}
                  <td>{nf(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
