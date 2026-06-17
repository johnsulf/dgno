# dgno - norsk diskgolf-statistikk

Interaktivt dashboard over antall PDGA-turneringer per norsk spiller per år
(1990–), summert på tvers av alle divisjoner. Bygget med Next.js (App Router) +
TypeScript.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne http://localhost:3000.

## Data og PDGA-vilkår

PDGA tillater at vi lagrer **kun den aggregerte dataen** som trengs for å vise
disse visningene - ikke rådataen bak. Derfor:

- `public/data/players.json` og `data/summary.json` er aggregerte (turneringer
  per spiller per år, totaler, årssummer) og sjekkes inn i repoet.
- Rådatauttrekket fra PDGA (`raw/pdga_norge_alle.json`) er **gitignored** og skal
  aldri committes eller publiseres.
- Hver side viser PDGA-attribusjon, og hvert spillernavn lenker til spillerens
  profil på pdga.com, slik attribusjonskravene på https://www.pdga.com/dev krever.

## Oppdatere dataene

1. Kjør PDGA-hentingsskriptet (Python) for å lage et ferskt råuttrekk.
2. Legg fila i `raw/pdga_norge_alle.json`.
3. Regenerer de aggregerte filene:

```bash
npm run build:data
```

Dette skriver `public/data/players.json` og `data/summary.json` på nytt.
Rådatafila blir liggende lokalt og er ekskludert fra git.

## Struktur

```
app/                 App Router (layout, side, global CSS)
components/          GrowthChart, StatStrip, TopBars, HeatmapTable, Footer
lib/                 typer + fargeskala
data/summary.json    liten oppsummering for server-render (hero/stats/topp)
public/data/         players.json (hele det aggregerte feltet, hentes klient-side)
scripts/build-data.mjs  regenererer aggregert data fra råuttrekket
```

## Deploy

Prosjektet er en standard Next.js-app og kan deployes rett på Vercel. Sørg for at
`raw/`-mappa ikke følger med (den er allerede gitignored).
