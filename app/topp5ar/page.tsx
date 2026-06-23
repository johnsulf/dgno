import type { Metadata } from "next";
import playersData from "@/public/data/players.json";
import TopBars from "@/components/TopBars";
import { nf } from "@/lib/heat";
import { TopPlayer } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mest aktive siste fem år",
};

const LAST_N = 5;

type PlayerRecent = {
  pdga: string;
  name: string;
  first: number | null;
  last: number | null;
  recent: number[];
  total: number;
};

function sliceWithTies(arr: PlayerRecent[], limit = 20): PlayerRecent[] {
  if (arr.length <= limit) return arr;
  const cutoffValue = arr[limit - 1].total;
  let idx = limit;
  while (idx < arr.length && arr[idx].total === cutoffValue) {
    idx++;
  }
  return arr.slice(0, idx);
}

export default function Topp5ArPage() {
  const years: number[] = playersData.years;
  const recentYears = years.slice(-LAST_N);
  const startIdx = years.length - LAST_N;
  const fromYear = years[startIdx];
  const toYear = years[years.length - 1];

  const topRecent: PlayerRecent[] = sliceWithTies(
    (
      playersData.players as {
        pdga: string;
        name: string;
        first: number | null;
        last: number | null;
        y: number[];
      }[]
    )
      .map((p) => ({
        pdga: p.pdga,
        name: p.name,
        first: p.first,
        last: p.last,
        recent: p.y.slice(startIdx),
        total: p.y.slice(startIdx).reduce((s, v) => s + v, 0),
      }))
      .filter((p) => p.total > 0)
      .sort((a, b) => b.total - a.total),
    20,
  );

  const top: TopPlayer[] = topRecent.map((p) => ({
    pdga: p.pdga,
    name: p.name,
    total: p.total,
    first: p.first,
    last: p.last,
  }));

  return (
    <>
      <div className="page-header">
        <h1>Mest aktive siste {LAST_N} år</h1>
        <p className="lede">
          Hvem har spilt flest PDGA-turneringer de siste {LAST_N} sesongene? Her
          er topp 20, alle divisjoner, {fromYear}–{toYear}.
        </p>
      </div>

      <section>
        <div className="sec-head">
          <span className="note">
            flest turneringer totalt, alle divisjoner, {fromYear}–{toYear}
          </span>
        </div>
        <TopBars top={top} showActiveYears={false} />
      </section>

      <section style={{ marginTop: 32 }}>
        <div className="sec-head">
          <span className="note">
            tabellvisning av turneringer per år ({fromYear}–{toYear}) for topp
            20
          </span>
        </div>
        <div className="yearly-stats-wrap">
          <table
            className="yearly-stats"
            aria-label="Topp 20 siste fem år per sesong"
          >
            <thead>
              <tr>
                <th style={{ width: "28%", textAlign: "left" }}>Spiller</th>
                {recentYears.map((year) => (
                  <th key={year}>{year}</th>
                ))}
                <th>Totalt</th>
              </tr>
            </thead>
            <tbody>
              {topRecent.map((p) => (
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
                  {p.recent.map((count, i) => (
                    <td key={`${p.pdga}-${recentYears[i]}`}>{nf(count)}</td>
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
