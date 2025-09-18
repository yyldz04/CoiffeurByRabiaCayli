export function DatenschutzPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-16">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-4xl tracking-[0.2em] mb-6 md:mb-8 uppercase">Datenschutzerklärung</h2>
      </div>

      <div className="border border-white/20 p-6 md:p-12">
        <div className="space-y-8">
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">1. Datenschutz auf einen Blick</h3>
            <div className="text-white/70 space-y-4 uppercase">
              <h4 className="tracking-[0.05em] uppercase">Allgemeine Hinweise</h4>
              <p>
                Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren 
                personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">2. Allgemeine Hinweise und Pflichtinformationen</h3>
            <div className="text-white/70 space-y-4 uppercase">
              <h4 className="tracking-[0.05em] uppercase">Datenschutz</h4>
              <p>
                Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. 
                Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der 
                gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">3. Datenerfassung auf dieser Website</h3>
            <div className="text-white/70 space-y-4 uppercase">
              <h4 className="tracking-[0.05em] uppercase">Kontaktformular</h4>
              <p>
                Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben 
                aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten 
                zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">4. Ihre Rechte</h3>
            <div className="text-white/70 space-y-4 uppercase">
              <p>
                Sie haben jederzeit das Recht unentgeltlich Auskunft über Herkunft, Empfänger und 
                Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem 
                ein Recht, die Berichtigung, Sperrung oder Löschung dieser Daten zu verlangen.
              </p>
            </div>
          </div>

          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">5. Kontakt</h3>
            <div className="text-white/70 space-y-2 uppercase">
              <p>Bei Fragen zum Datenschutz wenden Sie sich bitte an:</p>
              <p>Salon Owner</p>
              <p>E-Mail: hallo@cbrc.at</p>
              <p>Telefon: +43 1 123-4567</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}