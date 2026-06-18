import type { Metadata } from "next";
import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import TopBars from "@/components/TopBars";

const S = summary as unknown as Summary;

export const metadata: Metadata = {
  title: "Mest aktive spillere",
};

export default function ToppPage() {
  return (
    <>
      <div className="page-header">
        <h1>Mest aktive spillere</h1>
        <p className="lede">
          Hvem har spilt flest PDGA-turneringer totalt? Her er topp 20, alle
          divisjoner, 1990–2025.
        </p>
      </div>

      <section>
        <div className="sec-head">
          <span className="note">
            flest turneringer totalt, alle divisjoner, 1990–2025
          </span>
        </div>
        <TopBars top={S.top} />
      </section>
    </>
  );
}
