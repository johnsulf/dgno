import { Meta, TopPlayer } from "@/lib/types";
import { nf } from "@/lib/heat";

export default function StatStrip({
  meta,
  lead,
  nEvents,
}: {
  meta: Meta;
  lead: TopPlayer;
  nEvents: number;
}) {
  return (
    <div className="stats">
      <div className="stat">
        <div className="n">{nf(meta.n_players)}</div>
        <div className="l">
          unike spillere
          <br />
          totalt
        </div>
      </div>
      <div className="stat">
        <div className="n teal">{nf(meta.total_entries)}</div>
        <div className="l">
          turneringsdeltakelser
          <br />
          summert over alle år
        </div>
      </div>
      <div className="stat">
        <div className="n amber">{lead.total}</div>
        <div className="l">
          turneringer
          <br />
          flest: <b>{lead.name}</b>
        </div>
      </div>
      <div className="stat">
        <div className="n">{nf(nEvents)}</div>
        <div className="l">
          arrangerte turneringer
          <br />
          totalt
        </div>
      </div>
    </div>
  );
}
