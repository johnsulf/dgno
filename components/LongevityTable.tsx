"use client";

import { TopSeasonsPlayer, TopStreakPlayer } from "@/lib/types";
import { nf } from "@/lib/heat";

export default function LongevityTable({
  topSeasons,
  topStreaks,
}: {
  topSeasons: TopSeasonsPlayer[];
  topStreaks: TopStreakPlayer[];
}) {
  return (
    <div className="longevity-grid">
      <div className="longevity-card">
        <h3>Flest aktive år</h3>
        <table className="longevity-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Spiller</th>
              <th>Sesonger</th>
              <th>Turneringer</th>
              <th>Periode</th>
            </tr>
          </thead>
          <tbody>
            {topSeasons.map((p, i) => (
              <tr key={p.pdga}>
                <td className="rk">{i + 1}</td>
                <td className="nm">{p.name}</td>
                <td className="num hl">{p.seasons}</td>
                <td className="num">{nf(p.total)}</td>
                <td className="num dim">{p.first}–{p.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="longevity-card">
        <h3>Lengste streak (år på rad)</h3>
        <table className="longevity-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Spiller</th>
              <th>Streak</th>
              <th>Sesonger</th>
              <th>Periode</th>
            </tr>
          </thead>
          <tbody>
            {topStreaks.map((p, i) => (
              <tr key={p.pdga}>
                <td className="rk">{i + 1}</td>
                <td className="nm">{p.name}</td>
                <td className="num hl">{p.streak}</td>
                <td className="num">{p.seasons}</td>
                <td className="num dim">{p.first}–{p.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
