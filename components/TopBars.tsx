import { TopPlayer } from "@/lib/types";

export default function TopBars({ top }: { top: TopPlayer[] }) {
  const players = top.slice(0, 20);
  const mx = players[0]?.total ?? 1;
  const ranks: number[] = [];
  for (let i = 0; i < players.length; i++) {
    if (i === 0 || players[i].total !== players[i - 1].total) {
      ranks.push(i + 1);
    } else {
      ranks.push(ranks[i - 1]);
    }
  }
  return (
    <ol className="bars" aria-label="Topp 20 mest aktive spillere">
      {players.map((p, i) => (
        <li className="bar" key={p.pdga}>
          <div className="rk">{ranks[i]}</div>
          <div className="track">
            <div
              className="fill"
              style={{ width: `${((p.total / mx) * 100).toFixed(1)}%` }}
            />
            <div className="lab">
              <span className="nm">
                <a
                  href={`https://www.pdga.com/player/${p.pdga}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.name}
                </a>
                <small>
                  #{p.pdga} · {p.first}–{p.last}
                </small>
              </span>
              <span className="v">{p.total}</span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
