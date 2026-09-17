// Fylkesinndelingen fra 1.1.2024 (15 fylker). Koden er fylkesnummeret, som
// også er de to første sifrene i kommunenummeret - det er slik
// postnummerregisteret kobles til fylke.
//
// Svalbard (21) og Jan Mayen (22) er ikke fylker og havner i «Ukjent».

export const FYLKER = [
  { code: "03", name: "Oslo" },
  { code: "11", name: "Rogaland" },
  { code: "15", name: "Møre og Romsdal" },
  { code: "18", name: "Nordland" },
  { code: "31", name: "Østfold" },
  { code: "32", name: "Akershus" },
  { code: "33", name: "Buskerud" },
  { code: "34", name: "Innlandet" },
  { code: "39", name: "Vestfold" },
  { code: "40", name: "Telemark" },
  { code: "42", name: "Agder" },
  { code: "46", name: "Vestland" },
  { code: "50", name: "Trøndelag" },
  { code: "55", name: "Troms" },
  { code: "56", name: "Finnmark" },
];

export const FYLKE_NAME = Object.fromEntries(FYLKER.map((f) => [f.code, f.name]));

/**
 * Normaliserer et fritekst-stedsnavn til en oppslagsnøkkel.
 * Både «Bodø», «BODØ», «Bodo» og «Bodø, Norway» blir «bodo».
 *
 * æ/ø/å skrives som ae/o/a - det er slik folk faktisk skriver uten norsk
 * tastatur («Tonsberg», «Alesund», «Kyrksaeterora»). Postnummer beholdes
 * som egne tokens så byggescriptet kan slå dem opp direkte.
 */
export function normalize(raw) {
  let s = String(raw ?? "")
    .toLowerCase()
    .trim()
    // land-suffiks: "oslo, norway", "oslo norge", "oslo (norway)"
    .replace(/[,(\s]+(norway|norge|noreg|no)\)?\s*$/i, "")
    // ASCII-varianter av æøå
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    // andre diakritika (é, ü ...)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    // tegnsetting -> mellomrom, kollaps
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return s;
}
