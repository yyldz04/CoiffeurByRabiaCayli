export function ImpressumPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-4xl tracking-[0.2em] mb-6 md:mb-8 uppercase">Impressum</h2>
      </div>

      <div className="border border-white/20 p-6 md:p-12">
        <div className="space-y-8">
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Angaben gemäß § 5 TMG</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>COIFFEUR BY RABIA CAYLI  </p>
              <p>Salon Owner</p>
              <p>Mariahilfer Straße 123</p>
              <p>1060 Wien</p>
              <p>Österreich</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Kontakt</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Telefon: +43 1 123-4567</p>
              <p>E-Mail: hallo@cbrc.at</p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">Berufsrechtliche Regelungen</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Berufsbezeichnung: Friseurin</p>
              <p>Zuständige Kammer: Wirtschaftskammer Wien</p>
              <p>Verliehen in: Österreich</p>
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
        </div>
      </div>
    </div>
  );
}