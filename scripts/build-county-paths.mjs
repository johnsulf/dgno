// Regner fylkesgeometrien om til ferdige SVG-path-strenger, slik at
// frontend hverken trenger d3 eller GeoJSON i runtime - bare <path d="...">.
//
//   node scripts/build-county-paths.mjs
//
// Leser  geo/fylker-2024.topojson   (fra scripts/hent_geo.mjs)
// Skriver data/norway-counties-paths.json
//
// Kjøres bare når geometrien endres. Ingen PDGA-data involvert.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoArea, geoConicConformal, geoPath } from "d3-geo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const srcPath = path.join(ROOT, "geo", "fylker-2024.topojson");
const outPath = path.join(ROOT, "data", "norway-counties-paths.json");

if (!fs.existsSync(srcPath)) {
  console.error(`Fant ikke ${srcPath}. Kjør scripts/hent_geo.mjs først.`);
  process.exit(1);
}

// Stående format: Norge er langstrakt, og Finnmark skal ikke bli en stripe.
const W = 600;
const H = 900;

const topo = JSON.parse(fs.readFileSync(srcPath, "utf-8"));
const fc = feature(topo, topo.objects.fylker);

// d3-geo tolker polygoner sfærisk og krever at ytre ringer går med klokka.
// Kartverket leverer blandet retning, og en feilvendt ring blir «hele kloden
// minus fylket». Vend ringer slik at ytre ring < halvkule og hull > halvkule.
const HEMISPHERE = 2 * Math.PI;
function rewind(geometry) {
  const polys =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const rings of polys) {
    rings.forEach((ring, i) => {
      const area = geoArea({ type: "Polygon", coordinates: [ring] });
      const isHole = i > 0;
      if (isHole ? area < HEMISPHERE : area > HEMISPHERE) ring.reverse();
    });
  }
}
for (const f of fc.features) rewind(f.geometry);

// Konisk konform projeksjon med standardparalleller i Sør- og Nord-Norge,
// rotert så landet står noenlunde rett i rammen.
const projection = geoConicConformal()
  .parallels([60, 70])
  .rotate([-15, 0])
  .fitSize([W, H], fc);
const pathGen = geoPath(projection);

// Én desimal er mer enn nok for et 600×900-kart og halverer filstørrelsen.
const round = (d) => d.replace(/(\d+\.\d)\d+/g, "$1");

const counties = fc.features
  .map((f) => {
    const [cx, cy] = pathGen.centroid(f);
    return {
      code: f.properties.code,
      name: f.properties.name,
      d: round(pathGen(f)),
      centroid: [Math.round(cx * 10) / 10, Math.round(cy * 10) / 10],
    };
  })
  .sort((a, b) => a.code.localeCompare(b.code));

const out = { viewBox: `0 0 ${W} ${H}`, counties };
fs.writeFileSync(outPath, JSON.stringify(out) + "\n");
console.log(
  `data/norway-counties-paths.json: ${counties.length} fylker, ${(fs.statSync(outPath).size / 1024).toFixed(0)} kB`,
);
