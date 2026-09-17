# Datakilder

Oversikt over eksterne data som brukes, og hva som lagres i repoet.

## PDGA (spillere, turneringer)

- Kilde: PDGA REST API (https://www.pdga.com/dev), hentet med
  `scripts/hent_pdga.py`, `scripts/hent_pdga_events.py` og
  `scripts/hent_pdga_spillere.py`.
- Vilkår: skriftlig avtale med PDGA (Steve Ganz, PDGA support): *«You may
  store only the historical data required to render the views that you've
  shared. In other words, you may only store the aggregated data that you
  produced but not the raw source data used to aggregate the data.»*
- Lagres: kun aggregater i `data/` og `public/data/`. Rådata ligger i `raw/`
  (gitignored) og committes aldri.
- Attribusjon: «Player data © {år} PDGA» / «Event data © {år} PDGA» i footer
  og på fylkessiden.

### Fylkeskartet spesielt

`data/players-by-county.json` inneholder antall spillere per fylke (totalt,
aktive medlemmer, pro, am) og en «Ukjent»-bøtte. Ingen rad kan spores til en
enkeltspiller. Fylke utledes i `scripts/build-players-geo.mjs` fra spillerens
eget fritekstfelt `city` hos PDGA (`state_prov` er tomt for norske spillere).

## Bring - postnummerregisteret

- Kilde: https://www.bring.no/tjenester/adressetjenester/postnummer
  (fil: `https://www.bring.no/postnummerregister-ansi.txt`, cp1252,
  tab-separert: postnummer, poststed, kommunenummer, kommunenavn, kategori).
- Hentet: 2026-09-16 med `scripts/hent_geo.mjs`, konvertert til UTF-8 og
  lagret som `geo/postnummerregister.txt`.
- Bruk: poststed → kommunenummer → fylke (to første siffer i kommunenummeret
  etter 2024-inndelingen). Kommunenavn brukes som sekundært oppslag, og
  postnummer slås opp direkte dersom spilleren har tatt det med.
- Kollisjoner: samme poststedsnavn kan finnes i flere fylker (Vik, Sand,
  Berg …). Registeret har ikke befolkningstall, så vi velger fylket der
  poststedet har **flest postnumre** – en enkel proxy for størrelse, samme
  pragmatiske idé som svenske ratingkartan bruker.
- Svalbard (kommunenr 21xx) og Jan Mayen (22xx) er ikke fylker og havner i
  «Ukjent».

## Kartverket - Kommuneinfo API (fylkesgrenser)

- Kilde: https://api.kartverket.no/kommuneinfo/v1/fylker/{nr}/omrade
  (EPSG:4258). Lisens: CC BY 4.0, © Kartverket.
- Hentet: 2026-09-16 med `scripts/hent_geo.mjs`. Geometrien forenkles
  topologisk (topojson, kvantisering 1e4, 10 % av punktene beholdes) og lagres
  som `geo/fylker-2024.topojson` (~95 kB).
- `scripts/build-county-paths.mjs` projiserer den (`d3-geo`,
  `geoConicConformal`, paralleller 60°/70°) til ferdige SVG-paths i
  `data/norway-counties-paths.json` (~45 kB), slik at frontend ikke trenger
  d3 eller GeoJSON.

## Egne data

- `geo/overrides.json`: manuelle rettinger fra bynavn til fylke (bydeler,
  feilstavinger). Vårt eget arbeid.
- `data/milestones.json`: historiske milepæler, skrevet for hånd.

## Feilkilder i fylkeskartet

- Bygger på hva spilleren selv har skrevet i by-feltet; noen mangler
  (`meta.no_city`), noen har skrivefeil eller utenlandske steder.
- Et bynavn kan finnes flere steder i landet; da velges det største.
- Bosted er det som står i profilen nå, ikke da spilleren var aktiv.
