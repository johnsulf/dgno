// Laster ned de åpne geodataene som fylkeskartet bygger på. Ingen PDGA-data
// involvert; resultatet committes i geo/. Se DATASOURCES.md.
//
//   node scripts/hent_geo.mjs
//
// Skriver:
//   geo/postnummerregister.txt   Bring, konvertert cp1252 -> UTF-8
//   geo/fylker-2024.topojson     Kartverket kommuneinfo, 15 fylker, forenklet
//
// Kartverkets geometri er ~7 MB. Vi trenger et lite oversiktskart, ikke
// kartografisk presisjon, så den forenkles topologisk (delte grenser
// forblir delte, ingen sprekker) før den skrives. Selve SVG-projeksjonen
// gjøres i scripts/build-county-paths.mjs.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { topology } from "topojson-server";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { FYLKER } from "./lib/fylker.mjs";

// ---- forenkling -----------------------------------------------------------
const QUANTIZATION = 1e4; // koordinatgitter
const KEEP = 0.1; // andel av punktene som beholdes (etter viktighet)
// -------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const GEO = path.join(ROOT, "geo");
fs.mkdirSync(GEO, { recursive: true });

const BRING_URL = "https://www.bring.no/postnummerregister-ansi.txt";
const KARTVERKET = "https://api.kartverket.no/kommuneinfo/v1";

async function hentPostnummer() {
  const r = await fetch(BRING_URL);
  if (!r.ok) throw new Error(`Bring: HTTP ${r.status}`);
  const buf = await r.arrayBuffer();
  const txt = new TextDecoder("windows-1252").decode(buf);
  const out = path.join(GEO, "postnummerregister.txt");
  fs.writeFileSync(out, txt.replace(/\r\n/g, "\n"));
  console.log(`geo/postnummerregister.txt: ${txt.split("\n").length} rader`);
}

async function hentFylker() {
  const features = [];
  for (const f of FYLKER) {
    const url = `${KARTVERKET}/fylker/${f.code}/omrade?utkoordsys=4258`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Kartverket ${f.code}: HTTP ${r.status}`);
    const d = await r.json();
    features.push({
      type: "Feature",
      properties: { code: f.code, name: f.name },
      geometry: d.omrade,
    });
    console.log(`  ${f.code} ${f.name}`);
  }
  const fc = { type: "FeatureCollection", features };
  let topo = topology({ fylker: fc }, QUANTIZATION);
  topo = presimplify(topo);
  topo = simplify(topo, quantile(topo, KEEP));
  const out = path.join(GEO, "fylker-2024.topojson");
  fs.writeFileSync(out, JSON.stringify(topo));
  console.log(
    `geo/fylker-2024.topojson: ${features.length} fylker, ${(fs.statSync(out).size / 1024).toFixed(0)} kB`,
  );
}

await hentPostnummer();
await hentFylker();
