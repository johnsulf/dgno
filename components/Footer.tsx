export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="prov">
        <b>Player data © {year} PDGA.</b> Spillerdata kommer fra PDGAs
        offisielle database (
        <a
          href="https://www.pdga.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          pdga.com
        </a>
        ) og brukes med tillatelse. Hvert spillernavn lenker til spillerprofilen
        på pdga.com.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Event data © {year} PDGA.</b> Turneringsdata kommer fra PDGAs
        offisielle database (
        <a
          href="https://www.pdga.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          pdga.com
        </a>
        ) og brukes med tillatelse. Turneringsnavn lenker til turneringssiden på
        pdga.com.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Hvilke spillere er med?</b> Datasettet inneholder spillere med nåværende bosted
        Norge i spillerprofilen på PDGA. Dette betyr at utenlandske spillere
        bosatt i Norge vil være inkludert, mens norske spillere bosatt i
        utlandet ikke vil være inkludert.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Forbehold.</b> Spillere kan ha deltatt i PDGA-turneringer som ikke
        har blitt registrert på PDGA-nummeret deres. Dette gjelder særlig tidlig
        i tidsperioden.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Hvilke turneringer er med?</b> Turneringssiden inneholder alle PDGA-sanksjonerte turneringer arrangert i Norge. Se Turneringer for detaljer. Spillerstatistikkene inneholder alle turneringer de har spilt uavhengig av hvor.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        <b>Oppdatering.</b> Dataene oppdateres etter nyttår hvert år.
      </div>
      <div className="prov" style={{ borderTop: "none", paddingTop: 10 }}>
        Laget av{" "}
        <b>
          <a
            href="https://www.pdga.com/player/94422"
            target="_blank"
            rel="noopener noreferrer"
          >
            Erlend Johnsen
          </a>
        </b>{" "}
        i samarbeid med{" "}
        <b>
          <a
            href="https://www.pdga.com/player/31549"
            target="_blank"
            rel="noopener noreferrer"
          >
            Håvard G. Frøysa
          </a>
        </b>
        .
      </div>
    </footer>
  );
}
