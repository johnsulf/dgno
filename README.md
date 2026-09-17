# dgno - norsk diskgolf-statistikk

Interaktivt dashboard over antall PDGA-turneringer per norsk spiller per år
(1990-), summert på tvers av alle divisjoner. Bygget med Next.js (App Router) +
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

- `public/data/players.json`, `data/summary.json`, `data/events-summary.json`,
  `data/events-named.json` og `data/players-by-county.json` er aggregerte
  (turneringer per spiller per år, totaler, årssummer, turneringsliste, antall
  spillere per fylke) og sjekkes inn i repoet.
- Rådatauttrekkene fra PDGA (`raw/pdga_norge_alle.json`,
  `raw/events_norge_alle.json` og `raw/players_norge_alle.json`) er
  **gitignored** og skal aldri committes eller publiseres.
- Hver side viser PDGA-attribusjon, og hvert spillernavn lenker til spillerens
  profil på pdga.com, slik attribusjonskravene på https://www.pdga.com/dev krever.

## Oppdatere dataene

Dataene oppdateres normalt én gang i året, etter nyttår. Rutinen er todelt:
hent rådata fra PDGA, og regenerer de aggregerte filene.

### 1. Innlogging

Begge hentingsskriptene trenger en PDGA-konto med API-tilgang. Innloggingen skal
**aldri** skrives inn i skriptene - de leser den fra miljøvariabler eller fra en
lokal fil som er gitignorert.

Enten miljøvariabler:

```bash
export PDGA_USER="din@epost.no"     # Windows: set PDGA_USER=...
export PDGA_PASS="passord"          # Windows: set PDGA_PASS=...
```

Eller `raw/pdga-auth.json`:

```json
{ "username": "din@epost.no", "password": "passord" }
```

### 2. Hent rådata

```bash
pip install requests
python3 scripts/hent_pdga.py           # -> raw/pdga_norge_alle.json
python3 scripts/hent_pdga_events.py    # -> raw/events_norge_alle.json
python3 scripts/hent_pdga_spillere.py  # -> raw/players_norge_alle.json
```

Sjekk at `YEARS` i de to første skriptene dekker inneværende år før du kjører.
Spillersøket (`hent_pdga_spillere.py`) har ikke år - det henter alle spillere
med bosted Norge, både aktive og utløpte medlemmer.

### 3. Regenerer aggregatene

```bash
npm run build:data         # -> public/data/players.json + data/summary.json
npm run build:events       # -> data/events-summary.json + data/events-named.json
npm run build:players-geo  # -> data/players-by-county.json
```

`build-events.mjs` advarer hvis den støter på ukjente tier-koder eller rader med
manglende felter, i stedet for å droppe dem stille. Les gjennom utskriften.

`build-players-geo.mjs` skriver ut de vanligste bynavnene den ikke klarte å
plassere i et fylke. Legg sikre treff inn i `geo/overrides.json` (normalisert
navn -> fylkeskode) og kjør på nytt. Resten havner ærlig i «Ukjent».

### 4. Sjekk og publiser

```bash
npm run dev             # kontroller tallene lokalt
git status              # raw/ skal ikke dukke opp
git add data public/data && git commit && git push
```

### Fylkeskartet (sjelden)

Kartet bygger på to åpne kilder som ikke har noe med PDGA-vilkårene å gjøre,
se `DATASOURCES.md`: Brings postnummerregister (poststed -> kommune -> fylke) og
Kartverkets fylkesgrenser. Begge ligger ferdig i `geo/` og trenger bare
oppdateres hvis fylkesinndelingen eller postnummerregisteret endrer seg:

```bash
npm run fetch:geo            # -> geo/postnummerregister.txt + geo/fylker-2024.topojson
npm run build:county-paths   # -> data/norway-counties-paths.json (ferdige SVG-paths)
npm run build:players-geo    # regenerer aggregatet med oppdatert stedsliste
```

### Filtre i turneringsdataene

PDGA-API-et oppgir ikke rundeantall, men varighet er en god proxy: de aller
fleste endagsturneringer er ukesgolf. Turneringslista viser derfor bare
flerdagsturneringer, mens grafen og årstabellen viser alt. Bryterne står øverst i
`scripts/build-events.mjs`:

```js
const SUMMARY_EXCLUDE_SINGLE_DAY = false; // graf + årstabell: alt er med
const NAMED_EXCLUDE_SINGLE_DAY = true;    // turneringslista: kun flerdags
const NAMED_EXCLUDE_LEAGUES = true;       // liga-tieren brukes lite i Norge
```

Forbeholdet: en ekte én-dags C-tier kan ha to runder, så et fåtall reelle
turneringer faller også ut. Avlyste turneringer telles i `meta.cancelled`, men
holdes utenfor turneringslista.

## Struktur

```
app/                       App Router (layout, sider, global CSS)
components/                GrowthChart, StatStrip, TopBars, HeatmapTable, CountyMap, Footer
lib/                       typer + fargeskala
data/summary.json          oppsummering for server-render (hero/stats/topp)
data/events-*.json         turneringsaggregater (årstabell + navngitt liste)
data/players-by-county.json  antall spillere per fylke (aggregat)
data/norway-counties-paths.json  fylkesgrenser som ferdige SVG-paths
data/milestones.json       historiske milepæler
geo/                       åpne geodata: postnummerregister, fylkesgrenser, overrides
public/data/               players.json (hele det aggregerte feltet, klient-side)
scripts/hent_pdga.py         henter spillerstatistikk fra PDGA-API-et
scripts/hent_pdga_events.py  henter turneringer fra PDGA-API-et
scripts/hent_pdga_spillere.py  henter spillerlista (med by) fra PDGA-API-et
scripts/hent_geo.mjs         henter Bring-register + Kartverket-grenser til geo/
scripts/build-data.mjs     regenererer spilleraggregatene
scripts/build-events.mjs   regenererer turneringsaggregatene
scripts/build-players-geo.mjs  regenererer fylkesaggregatet
scripts/build-county-paths.mjs projiserer fylkesgrensene til SVG
scripts/lib/fylker.mjs     fylkesliste + navnenormalisering
DATASOURCES.md             hvor dataene kommer fra, og hva som lagres
```

## Deploy

Prosjektet er en standard Next.js-app og kan deployes rett på Vercel. Sørg for at
`raw/`-mappa ikke følger med (den er allerede gitignored).
