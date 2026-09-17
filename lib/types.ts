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

export type TopSeasonsPlayer = {
  pdga: string;
  name: string;
  seasons: number;
  total: number;
  first: number | null;
  last: number | null;
};

export type TopStreakPlayer = {
  pdga: string;
  name: string;
  streak: number;
  seasons: number;
  streakFrom: number;
  streakTo: number;
};

export type TopActiveStreakPlayer = {
  pdga: string;
  name: string;
  activeStreak: number;
  seasons: number;
  first: number | null;
  last: number | null;
};

export type Agg = {
  years: number[];
  yr_players: number[];
  yr_tour: number[];
  yr_new: number[];
  yr_avg: number[];
  yr_top5: [string, number][][];
};

export type Meta = {
  n_players: number;
  total_entries: number;
  span: [number, number];
  peak_players: number;
  peak_year: number;
  players_last: number;
};

export type Summary = {
  agg: Agg;
  meta: Meta;
  top: TopPlayer[];
  topSeasons: TopSeasonsPlayer[];
  topStreaks: TopStreakPlayer[];
  topActiveStreaks: TopActiveStreakPlayer[];
};

export type PlayersData = {
  years: number[];
  players: Player[];
};

/** Tekstene i `items` kan inneholde markdown-lenker: [tekst](url) */
export type Milestone = {
  year: number;
  items: string[];
};

/** Aggregat per fylke fra scripts/build-players-geo.mjs. Ingen enkeltspillere. */
export type CountyCounts = {
  total: number;
  current: number;
  pro: number;
  am: number;
};

export type CountyRow = CountyCounts & {
  code: string;
  name: string;
};

export type PlayersByCounty = {
  meta: {
    generated: string;
    source_fetched: string | null;
    total_players: number;
    current_members: number;
    matched: number;
    unmatched: number;
    no_city: number;
    coverage: number;
  };
  counties: CountyRow[];
  unknown: CountyCounts;
};

/** Ferdig projiserte SVG-paths fra scripts/build-county-paths.mjs. */
export type CountyPath = {
  code: string;
  name: string;
  d: string;
  centroid: [number, number];
};

export type CountyPaths = {
  viewBox: string;
  counties: CountyPath[];
};
