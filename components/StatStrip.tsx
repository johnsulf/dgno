import { Meta, TopPlayer } from "@/lib/types";
import { nf } from "@/lib/heat";

export default function StatStrip({
  meta,
  lead,
}: {
  meta: Meta;
  lead: TopPlayer;
}) {
  return (
    <div className="stats">
      <div className="stat">
        <div className="n">{nf(meta.n_players)}</div>
        <div className="l">
          unike spillere
          <br />
          alle divisjoner
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
        <div className="n">{nf(meta.players_2025)}</div>
        <div className="l">
          spillere i 2025
          <br />
          mot <b>49</b> i 2007
        </div>
      </div>
    </div>
  );
}
