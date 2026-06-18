export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="prov">
        <b>Player data © {year} PDGA.</b> Spillerdata kommer fra PDGAs offisielle
        database (
        <a href="https://www.pdga.com/" target="_blank" rel="noopener noreferrer">
          pdga.com
        </a>
        ) og brukes med tillatelse. Hvert spillernavn lenker til spillerprofilen på
        pdga.com.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Datagrunnlag.</b> Aggregert fra PDGAs player-statistics (country=NO, alle
        divisjoner): antall turneringer summert per spiller per år på tvers av
        divisjoner (MPO, FPO, MA1–MA4, masters, junior osv.), 1990–2025. «Sesonger» =
        antall år med minst én turnering. De tidlige årene er reelt tynne; første
        registrerte norske resultat er fra 1990.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Hvem er med?</b> Listen inneholder spillere med nåværende bosted Norge i
        spillerprofilen på PDGA. Dette betyr at utenlandske spillere bosatt i Norge
        vil være inkludert, mens norske spillere bosatt i utlandet ikke vil være
        inkludert.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Forbehold.</b> Spillere kan ha deltatt i PDGA-turneringer som ikke har
        blitt registrert på PDGA-nummeret deres. Dette gjelder særlig tidlig i
        tidsperioden.
      </div>
    </footer>
  );
}
