export type Player = {
  pdga: string;
  name: string;
  total: number;
  seasons: number;
  first: number | null;
  last: number | null;
  y: number[];
};

export type TopPlayer = Pick<Player, "pdga" | "name" | "total" | "first" | "last">;

export type Agg = {
  years: number[];
  yr_players: number[];
  yr_tour: number[];
  yr_top5: [string, number][][];
};

export type Meta = {
  n_players: number;
  total_entries: number;
  span: [number, number];
  peak_players: number;
  peak_year: number;
  players_2025: number;
};

export type Summary = {
  agg: Agg;
  meta: Meta;
  top: TopPlayer[];
};

export type PlayersData = {
  years: number[];
  players: Player[];
};
