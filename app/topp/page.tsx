import type { Metadata } from "next";
import TopFiltered from "@/components/TopFiltered";

export const metadata: Metadata = {
  title: "Mest aktive spillere",
};

export default function ToppPage() {
  return (
    <>
      <div className="page-header">
        <h1>Mest aktive spillere</h1>
        <p className="lede">
          Hvem har spilt flest PDGA-turneringer? Filtrer på periode og se topp
          20, alle divisjoner.
        </p>
      </div>

      <TopFiltered />
    </>
  );
}
