import type { Metadata } from "next";
import summary from "@/data/summary.json";
import { Summary } from "@/lib/types";
import GrowthChart from "@/components/GrowthChart";

const S = summary as unknown as Summary;

const PERIODS = [
  {
    id: "pionertid",
    title: "Pionertiden (1990–1999)",
    years: "1990–1999",
    content: `De tidligste sporene av organisert diskgolf i Norge. Det første registrerte
PDGA-resultatet for en norsk spiller dukker opp i 1990, men aktiviteten var 
svært begrenset gjennom hele tiåret. Bare en håndfull spillere deltok i 
PDGA-sanksjoner, og de fleste turneringene foregikk i Skandinavia for øvrig.

Sporten var i sin spede begynnelse, og det fantes knapt dedikerte baner i Norge.
Entusiastene som drev sporten videre i denne perioden la grunnlaget for det som 
skulle komme.`,
  },
  {
    id: "oppstart",
    title: "Oppstart og vekst (2000–2009)",
    years: "2000–2009",
    content: `Rundt årtusenskiftet begynte ting å skje. De første dedikerte diskgolfbanene 
ble anlagt, og antallet aktive spillere begynte å vokse jevnt. PDGA-turneringer
ble mer vanlig på norsk jord, og miljøet fikk en klarere struktur.

Mot slutten av tiåret hadde Norge flere hundre spillere med PDGA-medlemskap, og 
turneringskalenderen begynte å fylles opp. Sporten var fortsatt noe for spesielt
interesserte, men fundamentet for seriøs vekst var lagt.`,
  },
  {
    id: "modning",
    title: "Modning (2010–2018)",
    years: "2010–2018",
    content: `I dette tiåret modnet norsk diskgolf som organisert idrett. Antall baner 
eksploderte, turneringene ble flere og større, og divisjonsstrukturen ble
tydeligere. Norske spillere begynte å gjøre seg bemerket internasjonalt.

Sporten fikk også mer synlighet gjennom sosiale medier og strømming av 
turneringer. Mot slutten av perioden var det tydelig at en eksplosiv vekstfase 
var i emning.`,
  },
  {
    id: "eksplosjon",
    title: "Eksplosjon (2019–2025)",
    years: "2019–2025",
    content: `Pandemien i 2020 ble et paradoksalt vendepunkt: som en utendørs, 
lavterskel-aktivitet med naturlig avstand fikk diskgolf et massivt oppsving.
Antall aktive spillere i Norge mer enn doblet seg på få år.

2025 representerer et foreløpig høydepunkt, med tusenvis av aktive 
PDGA-spillere, en lang turnseringssesong og et bredt spekter av divisjoner. 
Fra en håndfull pionerer på 90-tallet til en av Norges raskest voksende 
idretter – reisen har vært bemerkelsesverdig.`,
  },
];

export const metadata: Metadata = {
  title: "Historie",
};

export default function HistoriePage() {
  return (
    <>
      <div className="page-header">
        <h1>Norsk diskgolf gjennom tidene</h1>
        <p className="lede">
          Fra de aller første PDGA-registreringene i 1990 til dagens tusenvis av
          aktive spillere – historien om norsk diskgolf i tall og tekst.
        </p>
      </div>

      <section>
        <GrowthChart agg={S.agg} />
      </section>

      <nav className="period-nav" aria-label="Tidsperioder">
        {PERIODS.map((p) => (
          <a key={p.id} href={`#${p.id}`} className="period-nav-link">
            {p.years}
          </a>
        ))}
      </nav>

      <div className="periods">
        {PERIODS.map((period) => (
          <article key={period.id} id={period.id} className="period-card">
            <div className="period-badge">{period.years}</div>
            <h2>{period.title}</h2>
            {period.content.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}
