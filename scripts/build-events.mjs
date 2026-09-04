// Regenerates the aggregated event datasets from a raw PDGA event pull.
//
// The raw file is NOT committed (see .gitignore). Only the aggregated output
// (data/events-summary.json + data/events-named.json) is stored, per PDGA's terms.
//
// Usage:
//   node scripts/build-events.mjs [path-to-raw-json]
// Default raw path: ./raw/events_norge_alle.json
//
// The raw file is the output of scripts/hent_pdga_events.py: a JSON object
// { country, years, count, events: [ ...one row per tournament... ] }

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---- filtre -------------------------------------------------------------
// PDGA oppgir ikke rundeantall, men varighet er en god proxy: endagsturneringer
// er i praksis ukesgolf. Sett til false for å ta med alt.
const SUMMARY_EXCLUDE_SINGLE_DAY = false; // graf + årstabell: alt er med
const NAMED_EXCLUDE_SINGLE_DAY = true; // turneringslista: kun flerdags
const NAMED_EXCLUDE_LEAGUES = true;
// -------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const rawPath =
  process.argv[2] || path.join(ROOT, "raw", "events_norge_alle.json");

if (!fs.existsSync(rawPath)) {
  console.error(`Fant ikke rådatafil: ${rawPath}`);
  console.error(
    "Kjør scripts/hent_pdga_events.py først, og legg fila i ./raw/ (eller oppgi sti som argument).",
  );
  process.exit(1);
}

const src = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
const rows = Array.isArray(src) ? src : src.events;
if (!Array.isArray(rows)) {
  console.error("Uventet format: fant ingen 'events'-liste i rådatafila.");
  process.exit(1);
}

const LEVELS = ["ES", "A", "B", "C", "L"];
const TIER_RANK = { ES: 0, A: 1, B: 2, C: 3, L: 4 };

// PDGA-tier -> nivå. X-prefiks betyr internasjonal utgave av samme nivå.
const TIER_MAP = {
  ES: "ES",
  M: "ES",
  NT: "A",
  A: "A",
  B: "B",
  C: "C",
  L: "L",
  LC: "L",
};

const pick = (o, ...keys) => {
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
};

const dateOnly = (v) => (v ? String(v).slice(0, 10) : null);

const unknownTiers = new Map();

function normalizeTier(raw) {
  if (!raw) return null;
  const t = String(raw).trim().toUpperCase();
  const base = t.startsWith("X") && t.length > 1 ? t.slice(1) : t;
  const level = TIER_MAP[base];
  if (!level) unknownTiers.set(t, (unknownTiers.get(t) || 0) + 1);
  return level ?? null;
}

function normalizeClass(raw) {
  const c = String(raw ?? "").trim().toLowerCase();
  if (c.startsWith("pro-am") || c === "proam" || c === "mixed") return "Pro-Am";
  if (c.startsWith("pro")) return "Pro";
  if (c.startsWith("am")) return "Am";
  return "Ukjent";
}

const events = [];
let cancelled = 0;
let skipped = 0;

for (const e of rows) {
  const id = String(pick(e, "tournament_id", "id", "event_id") ?? "");
  const name = pick(e, "tournament_name", "name", "event_name");
  const rawtier = pick(e, "tier", "tournament_tier", "event_tier");
  const start = dateOnly(pick(e, "start_date", "startdate", "date"));
  const end = dateOnly(pick(e, "end_date", "enddate")) ?? start;
  const tier = normalizeTier(rawtier);

  if (!id || !name || !tier || !start) {
    skipped++;
    continue;
  }

  const status = String(pick(e, "status", "event_status") ?? "").toLowerCase();
  const isCancelled = status.includes("cancel");
  if (isCancelled) cancelled++;

  events.push({
    id,
    name: String(name).trim(),
    tier,
    rawtier: String(rawtier).trim().toUpperCase(),
    year: Number(start.slice(0, 4)),
    date: start,
    city: pick(e, "city", "location") ?? null,
    cls: normalizeClass(pick(e, "classification", "class", "event_class")),
    multiDay: end > start,
    cancelled: isCancelled,
  });
}

if (unknownTiers.size) {
  console.warn(
    "Ukjente tier-koder (ikke tatt med):",
    [...unknownTiers].map(([t, n]) => `${t}=${n}`).join(", "),
  );
}
if (skipped) console.warn(`Hoppet over ${skipped} rader med manglende felter.`);

// ---- events-summary.json -------------------------------------------------
// Avlyste turneringer telles i meta.cancelled, men er ikke med i tallene.
const forSummary = events.filter(
  (e) => !e.cancelled && (!SUMMARY_EXCLUDE_SINGLE_DAY || e.multiDay),
);

// Fyller hele spennet, også år uten turneringer, så grafen ikke får hull.
const present = forSummary.map((e) => e.year);
const firstYear = Math.min(...present);
const lastYear = Math.max(...present);
const years = Array.from(
  { length: lastYear - firstYear + 1 },
  (_, i) => firstYear + i,
);
const byYear = years.map((year) => {
  const row = { year };
  for (const lv of LEVELS) row[lv] = 0;
  row.total = 0;
  return row;
});
const yearIdx = new Map(years.map((y, i) => [y, i]));

const byLevelTotal = Object.fromEntries(LEVELS.map((lv) => [lv, 0]));
const byClass = {};

for (const e of forSummary) {
  const row = byYear[yearIdx.get(e.year)];
  row[e.tier]++;
  row.total++;
  byLevelTotal[e.tier]++;
  byClass[e.cls] = (byClass[e.cls] || 0) + 1;
}

const peak = byYear.reduce((a, b) => (b.total >= a.total ? b : a), byYear[0]);

const summary = {
  meta: {
    n_events: forSummary.length,
    cancelled,
    span: [years[0], years[years.length - 1]],
    first_year: years[0],
    peak_year: peak.year,
    peak_count: peak.total,
  },
  levels: LEVELS,
  by_year: byYear,
  by_level_total: byLevelTotal,
  by_class: Object.fromEntries(
    Object.entries(byClass).sort((a, b) => b[1] - a[1]),
  ),
};

// ---- events-named.json ---------------------------------------------------
const named = events
  .filter((e) => !e.cancelled)
  .filter((e) => !NAMED_EXCLUDE_SINGLE_DAY || e.multiDay)
  .filter((e) => !NAMED_EXCLUDE_LEAGUES || e.tier !== "L")
  .sort(
    (a, b) =>
      b.year - a.year ||
      TIER_RANK[a.tier] - TIER_RANK[b.tier] ||
      a.name.localeCompare(b.name, "nb"),
  )
  .map(({ id, name, tier, rawtier, year, date, city, cls }) => ({
    id,
    name,
    tier,
    rawtier,
    year,
    date,
    city,
    cls,
  }));

fs.writeFileSync(
  path.join(ROOT, "data", "events-summary.json"),
  JSON.stringify(summary, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(ROOT, "data", "events-named.json"),
  JSON.stringify({ count: named.length, events: named }, null, 2) + "\n",
);

console.log(
  `data/events-summary.json: ${summary.meta.n_events} turneringer ${summary.meta.span[0]}-${summary.meta.span[1]}`,
);
console.log(`data/events-named.json:   ${named.length} turneringer`);
