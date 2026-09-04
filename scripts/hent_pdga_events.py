#!/usr/bin/env python3
"""
Henter alle PDGA-turneringer (events) arrangert i Norge, alle nivå (tier),
alle år, med full paginering. Skriver én ren JSON-fil til raw/.

Bruk:
    pip install requests
    export PDGA_USER=...      (Windows: set PDGA_USER=...)
    export PDGA_PASS=...      (Windows: set PDGA_PASS=...)
    python scripts/hent_pdga_events.py

Alternativt legges innloggingen i raw/pdga-auth.json, som aldri committes:
    { "username": "...", "password": "..." }

Skriv aldri passordet inn i denne fila - den ligger i git.
"""

import requests, time, json, sys, os
from pathlib import Path

# ---- konfig -------------------------------------------------------------
COUNTRY = "NO"
YEARS = range(1990, 2026)  # 1990 t.o.m. 2025
LIMIT = 200  # maks per kall
PAUSE = 0.3  # sekunder mellom kall (vær grei mot API-et)
BASE = "https://api.pdga.com/services/json"

ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw"
OUTFILE = RAW_DIR / "events_norge_alle.json"
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
    s.headers["Cookie"] = f"{d['session_name']}={d['sessid']}"
    print(f"Logget inn som {user}")


def fetch_year(year):
    """Henter alle events for ett år ved å bla med offset til siste side."""
    out, offset = [], 0
    while True:
        r = s.get(
            f"{BASE}/event",
            params={
                "country": COUNTRY,
                "start_date": f"{year}-01-01",
                "end_date": f"{year}-12-31",
                "limit": LIMIT,
                "offset": offset,
            },
        )
        r.raise_for_status()
        d = r.json()
        events = d.get("events", []) if d.get("status", 0) == 0 else []
        out.extend(events)
        if len(events) < LIMIT:  # siste side
            break
        offset += LIMIT
        time.sleep(PAUSE)
    return out


def main():
    login()
    seen = set()
    rows = []
    for y in YEARS:
        new = 0
        for e in fetch_year(y):
            tid = e.get("tournament_id")
            if tid in seen:
                continue
            seen.add(tid)
            rows.append(e)
            new += 1
        print(f"  {y}: {new} turneringer")
        time.sleep(PAUSE)

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    data = {
        "country": COUNTRY,
        "years": [YEARS.start, YEARS.stop - 1],
        "count": len(rows),
        "events": rows,
    }
    OUTFILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nFerdig: {len(rows)} turneringer skrevet til {OUTFILE}")


if __name__ == "__main__":
    main()
