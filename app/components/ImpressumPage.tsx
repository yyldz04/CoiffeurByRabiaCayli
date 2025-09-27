import { LegalPageTemplate } from './LegalPageTemplate';

export function ImpressumPage() {
  return (
    <LegalPageTemplate title="Impressum">
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Angaben gemäß § 5 TMG</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>COIFFEUR BY RABIA CAYLI</p>
              <p>Rechtsform: Einzelunternehmen</p>
              <p>Inhaberin: Rabia Cayli</p>
              <p>St. Ulrich Straße 28</p>
              <p>6843 Götzis</p>
              <p>Österreich</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Geschäftszeiten</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Montag - Freitag: 09:00 - 18:00 Uhr</p>
              <p>Samstag: Auf Anfrage</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Kontakt</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Telefon: +43 676 5209297</p>
              <p>E-Mail: contact@coiffeurbyrabiacayli.at</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Gewerberechtliche Informationen</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Berufsbezeichnung: Friseurin</p>
              <p>Zuständige Kammer: Wirtschaftskammer Vorarlberg</p>
              <p>Verliehen in: Österreich</p>
              <p>Gewerbeberechtigung: Friseurgewerbe</p>
              <p>UID-Nr.: [Ihre UID-Nummer hier eintragen]</p>
              <p>Firmenbuchnummer: [Falls eingetragen]</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Versicherungen</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Berufshaftpflichtversicherung: [Versicherungsgesellschaft]</p>
              <p>Versicherungsnummer: [Nummer hier eintragen]</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Datenschutz</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Datenschutzerklärung verfügbar unter: /datenschutz</p>
              <p>Verantwortlich für Datenverarbeitung: Rabia Cayli</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Urheberrecht</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>© 2024 COIFFEUR BY RABIA CAYLI</p>
              <p>Alle Inhalte dieser Website sind urheberrechtlich geschützt.</p>
              <p>Webdesign: [Ihr Webdesigner/Agentur]</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Haftungsausschluss</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>
                Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. 
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte 
                können wir jedoch keine Gewähr übernehmen.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">EU-Streitschlichtung</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:
              </p>
              <p>https://ec.europa.eu/consumers/odr/</p>
              <p>
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
                Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Barrierefreiheit</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>
                Wir bemühen uns, unsere Website barrierefrei zu gestalten. 
                Bei Problemen wenden Sie sich bitte an uns.
              </p>
            </div>
          </div>
    </LegalPageTemplate>
  );
}