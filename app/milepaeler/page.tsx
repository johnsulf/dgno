import type { Metadata } from "next";
import milestonesData from "@/data/milestones.json";
import { Milestone } from "@/lib/types";
import MilestoneText from "@/components/MilestoneText";

const MILESTONES = (milestonesData as { milestones: Milestone[] }).milestones;

const DECADES = [...new Set(MILESTONES.map((m) => Math.floor(m.year / 10) * 10))];

export const metadata: Metadata = {
  title: "Historiske milepæler",
};

export default function MilepaelerPage() {
  return (
    <>
      <div className="page-header">
        <h1>Historiske milepæler</h1>
        <p className="lede">
          Fra det første norske PDGA-medlemmet i 1987 til i dag.
        </p>
      </div>

      <nav className="period-nav" aria-label="Tiår">
        {DECADES.map((d) => (
          <a
            key={d}
            href={`#aar-${MILESTONES.find((m) => Math.floor(m.year / 10) * 10 === d)!.year}`}
            className="period-nav-link"
          >
            {d}-tallet
          </a>
        ))}
      </nav>

      <ol className="timeline">
        {MILESTONES.map((m) => (
          <li key={m.year} id={`aar-${m.year}`} className="timeline-item">
            <div className="timeline-year">{m.year}</div>
            <ul>
              {m.items.map((item, i) => (
                <li key={i}>
                  <MilestoneText text={item} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </>
  );
}
