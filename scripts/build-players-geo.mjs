// Regenerates the per-county player aggregate from a raw PDGA player-search pull.
//
// The raw file is NOT committed (see .gitignore). Only the aggregated output
// (data/players-by-county.json) is stored, per PDGA's terms: counts per county,
// nothing that can be traced back to an individual player.
//
// Usage:
//   node scripts/build-players-geo.mjs [path-to-raw-json]
// Default raw path: ./raw/players_norge_alle.json
//
// The raw file is the output of scripts/hent_pdga_spillere.py: a JSON object
// { country, fetched, count, players: [ ...one row per player... ] }
//
// Fylke utledes fra spillerens eget fritekstfelt `city` via
//   1. geo/overrides.json            (manuelle rettinger)
//   2. postnummer, hvis spilleren har tatt det med
//   3. poststed i postnummerregisteret (flest postnumre vinner ved kollisjon)
//   4. kommunenavn i postnummerregisteret
//   5. første/siste ord som kommunenavn («Oslo Krokhol», «Fyllingsdalen Bergen»)
// Stavevarianter med aa/oe for å/ø prøves også. Alt annet havner i «Ukjent».
// Se DATASOURCES.md.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FYLKER, FYLKE_NAME, normalize } from "./lib/fylker.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const rawPath =
  process.argv[2] || path.join(ROOT, "raw", "players_norge_alle.json");
const outPath = path.join(ROOT, "data", "players-by-county.json");

if (!fs.existsSync(rawPath)) {
  console.error(`Fant ikke rådatafil: ${rawPath}`);
  console.error(
    "Kjør scripts/hent_pdga_spillere.py først, og legg fila i ./raw/ (eller oppgi sti som argument).",
  );
  process.exit(1);
}

const src = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
const rows = Array.isArray(src) ? src : src.players;
if (!Array.isArray(rows)) {
  console.error("Uventet format: fant ingen 'players'-liste i rådatafila.");
  process.exit(1);
}

// ---- oppslagstabeller ---------------------------------------------------
const overridesPath = path.join(ROOT, "geo", "overrides.json");
const registerPath = path.join(ROOT, "geo", "postnummerregister.txt");
if (!fs.existsSync(registerPath)) {
  console.error(`Fant ikke ${registerPath}. Kjør scripts/hent_geo.mjs først.`);
  process.exit(1);
}

const overrides = {};
for (const [k, v] of Object.entries(
  JSON.parse(fs.readFileSync(overridesPath, "utf-8")),
)) {
  if (k.startsWith("_")) continue;
  if (!FYLKE_NAME[v]) {
    console.error(`overrides.json: ukjent fylkeskode "${v}" for "${k}"`);
    process.exit(1);
  }
  overrides[normalize(k)] = v;
}

// poststed -> { fylkeskode -> antall postnumre }. Samme navn kan finnes i flere
// fylker (Vik, Sand, Berg ...); vi velger det med flest postnumre som en enkel
// proxy for størrelse. Kommunenavn er sekundært oppslag.
const byPoststed = new Map();
const byKommune = new Map();
const byPostnr = new Map();
for (const line of fs.readFileSync(registerPath, "utf-8").split("\n")) {
  const [postnr, poststed, kommunenr, kommunenavn] = line.split("\t");
  if (!poststed || !kommunenr) continue;
  const fylke = kommunenr.slice(0, 2);
  if (!FYLKE_NAME[fylke]) continue; // Svalbard/Jan Mayen
  byPostnr.set(postnr, fylke);
  const p = normalize(poststed);
  if (!byPoststed.has(p)) byPoststed.set(p, new Map());
  const m = byPoststed.get(p);
  m.set(fylke, (m.get(fylke) || 0) + 1);
  const k = normalize(kommunenavn);
  if (!byKommune.has(k)) byKommune.set(k, new Map());
  const km = byKommune.get(k);
  km.set(fylke, (km.get(fylke) || 0) + 1);
}
const best = (m) => [...m].sort((a, b) => b[1] - a[1])[0][0];

function lookupKey(key) {
  if (overrides[key]) return overrides[key];
  if (byPoststed.has(key)) return best(byPoststed.get(key));
  if (byKommune.has(key)) return best(byKommune.get(key));
  // «Kristiansand S», «Oslo 3»: fjern etterstilt enkeltbokstav/tall
  const stripped = key.replace(/\s+[a-z0-9]$/, "");
  if (stripped !== key && byPoststed.has(stripped))
    return best(byPoststed.get(stripped));
  // «Oslo Krokhol», «Fyllingsdalen Bergen»: første/siste ord som kommune
  const words = key.split(" ");
  if (words.length > 1) {
    for (const w of [words[0], words[words.length - 1]]) {
      if (byKommune.has(w)) return best(byKommune.get(w));
      if (byPoststed.has(w)) return best(byPoststed.get(w));
    }
  }
  return null;
}

function lookup(city) {
  const key = normalize(city);
  if (!key) return null;
  const postnr = key.match(/\b(\d{4})\b/);
  if (postnr && byPostnr.has(postnr[1])) return byPostnr.get(postnr[1]);
  // Eksakt nøkkel først, så aa->a / oe->o (folk skriver «Aalesund», «Godoey»)
  const variants = [
    key,
    key.replace(/aa/g, "a"),
    key.replace(/oe/g, "o"),
    key.replace(/aa/g, "a").replace(/oe/g, "o"),
  ];
  for (const v of new Set(variants)) {
    const hit = lookupKey(v);
    if (hit) return hit;
  }
  return null;
}

// ---- aggregering --------------------------------------------------------
const empty = () => ({ total: 0, current: 0, pro: 0, am: 0 });
const counties = Object.fromEntries(FYLKER.map((f) => [f.code, empty()]));
const unknown = empty();
const unmatchedNames = new Map();
let noCity = 0;
let current = 0;

for (const p of rows) {
  const isCurrent =
    String(p.membership_status ?? "").toLowerCase() === "current";
  const cls = String(p.classification ?? "").toUpperCase();
  const city = String(p.city ?? "").trim();
  if (!city) noCity++;
  const fylke = lookup(city);
  const bucket = fylke ? counties[fylke] : unknown;
  if (!fylke && city) {
    const k = normalize(city);
    unmatchedNames.set(k, (unmatchedNames.get(k) || 0) + 1);
  }
  bucket.total++;
  if (isCurrent) {
    bucket.current++;
    current++;
  }
  if (cls === "P") bucket.pro++;
  else if (cls === "A") bucket.am++;
}

const total = rows.length;
const matched = total - unknown.total;

const out = {
  meta: {
    generated: new Date().toISOString().slice(0, 10),
    source_fetched: src.fetched ?? null,
    total_players: total,
    current_members: current,
    matched,
    unmatched: unknown.total,
    no_city: noCity,
    coverage: Math.round((matched / total) * 1000) / 1000,
  },
  counties: FYLKER.map((f) => ({ code: f.code, name: f.name, ...counties[f.code] })),
  unknown,
};

// Sikkerhetsnett: aggregatet skal aldri inneholde spillerfelter.
const forbidden = ["pdga_number", "first_name", "last_name", "rating", "city"];
const json = JSON.stringify(out, null, 2);
for (const f of forbidden) {
  if (json.includes(`"${f}"`)) {
    console.error(`STOPP: output inneholder feltet "${f}" - ikke skrevet.`);
    process.exit(1);
  }
}

fs.writeFileSync(outPath, json + "\n");

console.log(
  `data/players-by-county.json: ${total} spillere, ${matched} plassert (${(out.meta.coverage * 100).toFixed(1)} %), ${unknown.total} ukjent (${noCity} uten by)`,
);
if (unmatchedNames.size) {
  const top = [...unmatchedNames].sort((a, b) => b[1] - a[1]).slice(0, 40);
  console.log(
    `\nVanligste bynavn uten treff (kandidater for geo/overrides.json):\n  ` +
      top.map(([n, c]) => `${n} (${c})`).join("\n  "),
  );
}
