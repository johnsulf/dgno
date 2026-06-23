// Regenerates the aggregated datasets from a raw PDGA pull.
//
// The raw file is NOT committed (see .gitignore). Only the aggregated output
// (data/summary.json + public/data/players.json) is stored, per PDGA's terms.
//
// Usage:
//   node scripts/build-data.mjs [path-to-raw-json]
// Default raw path: ./raw/pdga_norge_alle.json
//
// The raw file is the output of the PDGA pull script: a JSON object
// { country, years, count, players: [ ...one row per player/year/division... ] }

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const rawPath =
  process.argv[2] || path.join(ROOT, "raw", "pdga_norge_alle.json");

if (!fs.existsSync(rawPath)) {
  console.error(`Fant ikke rådatafil: ${rawPath}`);
  console.error(
    "Kjør PDGA-hentingen først, og legg fila i ./raw/ (eller oppgi sti som argument).",
  );
  process.exit(1);
}

const src = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
const rows = Array.isArray(src) ? src : src.players;

// Dedup at (pdga, year, division) so duplicate responses are not double-counted.
const perDiv = new Map(); // key -> tournaments
const name = new Map(); // pdga -> { year, name }
for (const p of rows) {
  const pdga = p.pdga_number;
  const yr = parseInt(p.year, 10);
  const div = p.division_code || "?";
  const t = parseInt(p.tournaments || "0", 10) || 0;
  perDiv.set(`${pdga}|${yr}|${div}`, t);
  const nm =
    `${(p.first_name || "").trim()} ${(p.last_name || "").trim()}`.trim();
  const cur = name.get(pdga);
  if (!cur || yr >= cur.year) name.set(pdga, { year: yr, name: nm });
}

// Sum tournaments per (pdga, year) across divisions.
const tour = new Map(); // `${pdga}|${yr}` -> total tournaments
for (const [key, t] of perDiv) {
  const [pdga, yr] = key.split("|");
  const k = `${pdga}|${yr}`;
  tour.set(k, (tour.get(k) || 0) + t);
}

const allYears = [
  ...new Set([...tour.keys()].map((k) => +k.split("|")[1])),
].sort((a, b) => a - b);
const y0 = allYears[0];
const y1 = allYears[allYears.length - 1];
const years = [];
for (let y = y0; y <= y1; y++) years.push(y);

const pdgas = [...new Set([...tour.keys()].map((k) => k.split("|")[0]))];

const total = new Map();
const seasons = new Map();
const firstYr = new Map();
const lastYr = new Map();
for (const [k, t] of tour) {
  const [pdga, yrStr] = k.split("|");
  const yr = +yrStr;
  total.set(pdga, (total.get(pdga) || 0) + t);
  if (t > 0) {
    seasons.set(pdga, (seasons.get(pdga) || 0) + 1);
    firstYr.set(pdga, Math.min(firstYr.get(pdga) ?? 9999, yr));
    lastYr.set(pdga, Math.max(lastYr.get(pdga) ?? 0, yr));
  }
}

// Compute longest streak and active streak for each player
const streakInfo = new Map(); // pdga -> { max, maxFrom, maxTo, active }
for (const pdga of pdgas) {
  let maxStreak = 0,
    maxFrom = 0,
    maxTo = 0;
  let cur = 0,
    curFrom = 0;
  for (const yr of years) {
    if ((tour.get(`${pdga}|${yr}`) || 0) > 0) {
      if (cur === 0) curFrom = yr;
      cur++;
      if (cur > maxStreak) {
        maxStreak = cur;
        maxFrom = curFrom;
        maxTo = yr;
      }
    } else {
      cur = 0;
    }
  }
  // Active streak = streak that includes the last year
  let active = 0;
  for (let i = years.length - 1; i >= 0; i--) {
    if ((tour.get(`${pdga}|${years[i]}`) || 0) > 0) active++;
    else break;
  }
  streakInfo.set(pdga, { max: maxStreak, maxFrom, maxTo, active });
}

const players = pdgas.map((pdga) => ({
  pdga,
  name: name.get(pdga).name,
  total: total.get(pdga) || 0,
  seasons: seasons.get(pdga) || 0,
  streak: streakInfo.get(pdga)?.max || 0,
  first: firstYr.get(pdga) ?? null,
  last: lastYr.get(pdga) ?? null,
  y: years.map((yr) => tour.get(`${pdga}|${yr}`) || 0),
}));
players.sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

// Per-year aggregates
const yrPlayers = years.map(
  (y) => pdgas.filter((pd) => (tour.get(`${pd}|${y}`) || 0) > 0).length,
);
const yrTour = years.map((y) =>
  pdgas.reduce((s, pd) => s + (tour.get(`${pd}|${y}`) || 0), 0),
);
const yrNew = years.map(
  (y) => pdgas.filter((pd) => firstYr.get(pd) === y).length,
);
const yrAvg = years.map((y, i) =>
  yrPlayers[i] > 0 ? Math.round((yrTour[i] / yrPlayers[i]) * 10) / 10 : 0,
);

// Top 5 players per year (for chart tooltip)
const yrTop5 = years.map((y) => {
  const ranked = pdgas
    .map((pd) => ({ name: name.get(pd).name, t: tour.get(`${pd}|${y}`) || 0 }))
    .filter((r) => r.t > 0)
    .sort((a, b) => b.t - a.t)
    .slice(0, 5);
  return ranked.map((r) => [r.name, r.t]);
});

const totalEntries = [...total.values()].reduce((a, b) => a + b, 0);
let peakPlayers = 0;
let peakYear = y0;
yrPlayers.forEach((n, i) => {
  if (n > peakPlayers) {
    peakPlayers = n;
    peakYear = years[i];
  }
});

const playersData = { years, players };

// Helper: include all ties at the cutoff position
function sliceWithTies(array, valueKey, limit = 20) {
  if (array.length <= limit) return array;
  const cutoffValue = array[limit - 1][valueKey];
  let idx = limit;
  while (idx < array.length && array[idx][valueKey] === cutoffValue) {
    idx++;
  }
  return array.slice(0, idx);
}

const summary = {
  agg: {
    years,
    yr_players: yrPlayers,
    yr_tour: yrTour,
    yr_new: yrNew,
    yr_avg: yrAvg,
    yr_top5: yrTop5,
  },
  meta: {
    n_players: players.length,
    total_entries: totalEntries,
    span: [y0, y1],
    peak_players: peakPlayers,
    peak_year: peakYear,
    players_2025: yrPlayers[years.indexOf(2025)] ?? 0,
  },
  top: sliceWithTies(players, "total", 20).map((p) => ({
    pdga: p.pdga,
    name: p.name,
    total: p.total,
    first: p.first,
    last: p.last,
  })),
  topSeasons: sliceWithTies(
    [...players].sort((a, b) => b.seasons - a.seasons || b.total - a.total),
    "seasons",
    20,
  ).map((p) => ({
    pdga: p.pdga,
    name: p.name,
    seasons: p.seasons,
    total: p.total,
    first: p.first,
    last: p.last,
  })),
  topStreaks: sliceWithTies(
    [...players].sort((a, b) => b.streak - a.streak || b.seasons - a.seasons),
    "streak",
    20,
  ).map((p) => {
    const si = streakInfo.get(p.pdga);
    return {
      pdga: p.pdga,
      name: p.name,
      streak: p.streak,
      seasons: p.seasons,
      streakFrom: si.maxFrom,
      streakTo: si.maxTo,
    };
  }),
  topActiveStreaks: sliceWithTies(
    [...players]
      .map((p) => ({ ...p, activeStreak: streakInfo.get(p.pdga)?.active || 0 }))
      .filter((p) => p.activeStreak > 0)
      .sort((a, b) => b.activeStreak - a.activeStreak || b.seasons - a.seasons),
    "activeStreak",
    20,
  ).map((p) => ({
    pdga: p.pdga,
    name: p.name,
    activeStreak: p.activeStreak,
    seasons: p.seasons,
    first: p.first,
    last: p.last,
  })),
};

fs.mkdirSync(path.join(ROOT, "public", "data"), { recursive: true });
fs.writeFileSync(
  path.join(ROOT, "public", "data", "players.json"),
  JSON.stringify(playersData),
);
fs.writeFileSync(
  path.join(ROOT, "data", "summary.json"),
  JSON.stringify(summary),
);

console.log(
  `OK: ${players.length} spillere, ${y0}–${y1}, ${totalEntries} deltakelser`,
);
console.log("Skrev public/data/players.json og data/summary.json");
