"use client";

import { TopSeasonsPlayer, TopStreakPlayer, TopActiveStreakPlayer } from "@/lib/types";
import { nf } from "@/lib/heat";

/** Standard competition ranking: ties get the same rank, next rank skips (1,1,3) */
function compRanks<T>(list: T[], valueFn: (item: T) => number): number[] {
  const ranks: number[] = [];
  for (let i = 0; i < list.length; i++) {
    if (i === 0 || valueFn(list[i]) !== valueFn(list[i - 1])) {
      ranks.push(i + 1);
    } else {
      ranks.push(ranks[i - 1]);
    }
  }
  return ranks;
}

export default function LongevityTable({
  topSeasons,
  topStreaks,
  topActiveStreaks,
}: {
  topSeasons: TopSeasonsPlayer[];
  topStreaks: TopStreakPlayer[];
  topActiveStreaks: TopActiveStreakPlayer[];
}) {
  const seasonRanks = compRanks(topSeasons, (p) => p.seasons);
  const streakRanks = compRanks(topStreaks, (p) => p.streak);
  const activeRanks = compRanks(topActiveStreaks, (p) => p.activeStreak);

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
                <td className="rk">{seasonRanks[i]}</td>
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
                <td className="rk">{streakRanks[i]}</td>
                <td className="nm">{p.name}</td>
                <td className="num hl">{p.streak}</td>
                <td className="num">{p.seasons}</td>
                <td className="num dim">{p.streakFrom}–{p.streakTo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="longevity-card">
        <h3>Aktiv streak (inkl. 2025)</h3>
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
            {topActiveStreaks.map((p, i) => (
              <tr key={p.pdga}>
                <td className="rk">{activeRanks[i]}</td>
                <td className="nm">{p.name}</td>
                <td className="num hl">{p.activeStreak}</td>
                <td className="num">{p.seasons}</td>
                <td className="num dim">{p.last! - p.activeStreak + 1}–{p.last}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
