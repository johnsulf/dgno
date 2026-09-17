#!/usr/bin/env python3
"""
Henter alle PDGA-registrerte spillere med bosted Norge (nåværende og utløpte
medlemmer) via Player Search, med full paginering. Skriver én ren JSON-fil
til raw/. Fila brukes kun som input til scripts/build-players-geo.mjs, som
aggregerer per fylke - rådata skal aldri committes.

Bruk:
    pip install requests
    export PDGA_USER=...      (Windows: set PDGA_USER=...)
    export PDGA_PASS=...      (Windows: set PDGA_PASS=...)
    python scripts/hent_pdga_spillere.py

Alternativt legges innloggingen i raw/pdga-auth.json, som aldri committes:
    { "username": "...", "password": "..." }

Skriv aldri passordet inn i denne fila - den ligger i git.
"""

import requests, time, json, sys, os
from datetime import date
from pathlib import Path

# ---- konfig -------------------------------------------------------------
COUNTRY = "NO"
LIMIT = 200  # maks per kall
PAUSE = 0.3  # sekunder mellom kall (vær grei mot API-et)
BASE = "https://api.pdga.com/services/json"

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw"
OUTFILE = RAW_DIR / "players_norge_alle.json"
AUTH_FILE = RAW_DIR / "pdga-auth.json"
# -------------------------------------------------------------------------

s = requests.Session()
s.headers.update({"Content-Type": "application/json"})


def credentials():
    user = os.environ.get("PDGA_USER")
    pw = os.environ.get("PDGA_PASS")
    if user and pw:
        return user, pw
    if AUTH_FILE.exists():
        d = json.loads(AUTH_FILE.read_text(encoding="utf-8"))
        if d.get("username") and d.get("password"):
            return d["username"], d["password"]
    sys.exit(
        f"Mangler innlogging. Sett PDGA_USER og PDGA_PASS, eller lag {AUTH_FILE} "
        'med {"username": "...", "password": "..."}'
    )


def login():
    user, pw = credentials()
    r = s.post(
        f"{BASE}/user/login", data=json.dumps({"username": user, "password": pw})
    )
    r.raise_for_status()
    d = r.json()
    if "sessid" not in d:
        sys.exit(f"Innlogging feilet: {d}")
    # PDGA vil ha cookien <session_name>=<sessid> på alle videre kall
    s.headers["Cookie"] = f"{d['session_name']}={d['sessid']}"
    print(f"Logget inn som {user}")


def fetch_all():
    """Henter alle spillere i landet ved å bla med offset til siste side.
    Ingen city/class-filter - vi vil ha hele feltet."""
    out, offset = [], 0
    while True:
        r = s.get(
            f"{BASE}/players",
            params={"country": COUNTRY, "limit": LIMIT, "offset": offset},
        )
        r.raise_for_status()
        d = r.json()
        players = d.get("players", []) if d.get("status", 0) == 0 else []
        out.extend(players)
        print(f"  offset {offset}: {len(players)} rader")
        if len(players) < LIMIT:  # siste side
            break
        offset += LIMIT
        time.sleep(PAUSE)
    return out


def main():
    login()
    seen = set()  # pdga_number -> dedup-sikring
    rows = []
    for p in fetch_all():
        key = p.get("pdga_number")
        if key in seen:
            continue
        seen.add(key)
        rows.append(p)

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    data = {
        "country": COUNTRY,
        "fetched": date.today().isoformat(),
        "count": len(rows),
        "players": rows,
    }
    OUTFILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nFerdig: {len(rows)} spillere skrevet til {OUTFILE}")


if __name__ == "__main__":
    main()
