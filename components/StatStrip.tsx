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
          unike spillere totalt
        </div>
      </div>
      <div className="stat">
        <div className="n teal">{nf(meta.total_entries)}</div>
        <div className="l">
          turneringsdeltakelser summert over alle år
        </div>
      </div>
      <div className="stat">
        <div className="n amber">{lead.total}</div>
        <div className="l">
          turneringer spilt av <b>{lead.name}</b> er flest
        </div>
      </div>
      <div className="stat">
        <div className="n">{nf(nEvents)}</div>
        <div className="l">
          arrangerte turneringer totalt
        </div>
      </div>
    </div>
  );
}
