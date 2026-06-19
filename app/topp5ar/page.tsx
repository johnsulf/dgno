import type { Metadata } from "next";
import playersData from "@/public/data/players.json";
import TopBars from "@/components/TopBars";
import { TopPlayer } from "@/lib/types";

export const metadata: Metadata = {
  title: "Mest aktive siste fem år",
};

const LAST_N = 5;

export default function Topp5ArPage() {
  const years: number[] = playersData.years;
  const startIdx = years.indexOf(years[years.length - LAST_N]);
  const fromYear = years[startIdx];
  const toYear = years[years.length - 1];

  const top: TopPlayer[] = (playersData.players as {
    pdga: string;
    name: string;
    first: number | null;
    last: number | null;
    y: number[];
  }[])
    .map((p) => ({
      pdga: p.pdga,
      name: p.name,
      total: p.y.slice(startIdx).reduce((s, v) => s + v, 0),
      first: p.first,
      last: p.last,
    }))
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);

  return (
    <>
      <div className="page-header">
        <h1>Mest aktive siste {LAST_N} år</h1>
        <p className="lede">
          Hvem har spilt flest PDGA-turneringer de siste {LAST_N} sesongene?
          Her er topp 20, alle divisjoner, {fromYear}–{toYear}.
        </p>
      </div>

      <section>
        <div className="sec-head">
          <span className="note">
            flest turneringer totalt, alle divisjoner, {fromYear}–{toYear}
          </span>
        </div>
        <TopBars top={top} />
      </section>
    </>
  );
}
