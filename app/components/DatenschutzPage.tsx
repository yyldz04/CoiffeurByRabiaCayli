import { LegalPageTemplate } from './LegalPageTemplate';

export function DatenschutzPage() {
  return (
    <LegalPageTemplate 
      title="Datenschutzerklärung"
      subtitle={`Stand: ${new Date().toLocaleDateString('de-DE')} | DSGVO-konform`}
    >
          {/* 1. Verantwortlicher */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">1. Verantwortlicher für die Datenverarbeitung</h3>
            <div className="text-white/70 space-y-4">
              <p>
                <strong>COIFFEUR BY RABIA CAYLI</strong><br />
                Inhaberin: Rabia Cayli<br />
                E-Mail: contact@coiffeurbyrabiacayli.at<br />
                Telefon: +43 676 5209297
              </p>
              <p>
                Als Betreiberin dieser Website nehme ich den Schutz Ihrer persönlichen Daten sehr ernst. 
                Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der 
                Verarbeitung von personenbezogenen Daten durch diese Website.
              </p>
            </div>
          </div>

          {/* 2. Datenerfassung und -verwendung */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">2. Datenerfassung und -verwendung</h3>
            <div className="text-white/70 space-y-4">
              <h4 className="tracking-[0.05em] uppercase font-semibold">2.1 Terminbuchung</h4>
              <p>
                Bei der Buchung eines Termins über unsere Website erheben wir folgende personenbezogene Daten:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Vor- und Nachname</strong> (erforderlich - zur Identifikation)</li>
                <li><strong>E-Mail-Adresse</strong> (erforderlich - zur Terminbestätigung und Kommunikation)</li>
                <li><strong>Telefonnummer</strong> (erforderlich - für dringende Rückfragen)</li>
                <li><strong>Geschlecht</strong> (erforderlich - zur korrekten Serviceauswahl)</li>
                <li><strong>Gewünschter Service und Termin</strong> (erforderlich - Vertragserfüllung)</li>
                <li><strong>Besondere Wünsche</strong> (optional - zur besseren Serviceerbringung)</li>
              </ul>
              
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded mt-4">
                <p className="text-sm">
                  <strong>⚠️ Wichtiger Hinweis zu besonderen Wünschen:</strong><br />
                  Bitte keine Gesundheitsdaten eintragen. Gesundheitsangaben verarbeiten wir nur mit ausdrücklicher Einwilligung. 
                  Bei gesundheitlichen Bedenken sprechen Sie uns bitte direkt an.
                </p>
              </div>
              
              <p className="text-sm text-white/60 mt-4">
                <strong>Datenquellen:</strong> Alle Daten erheben wir direkt von Ihnen über das Buchungsformular, 
                per Telefon oder E-Mail. Ohne die erforderlichen Angaben können wir keine Terminbuchung durchführen.
              </p>
              
              <h4 className="tracking-[0.05em] uppercase font-semibold mt-6">2.2 Rechtsgrundlage</h4>
              <p>
                Die Verarbeitung Ihrer Daten erfolgt auf Grundlage von:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO</strong> - Vertragserfüllung (Terminbuchung)</li>
                <li><strong>Art. 6 Abs. 1 lit. c DSGVO</strong> - Rechtliche Verpflichtung (steuer-/unternehmensrechtliche Aufbewahrung)</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO</strong> - Berechtigtes Interesse (Kundenbetreuung)</li>
              </ul>
            </div>
          </div>

          {/* 3. Datenverarbeitung */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">3. Zweck der Datenverarbeitung</h3>
            <div className="text-white/70 space-y-4">
              <p>Ihre personenbezogenen Daten werden ausschließlich für folgende Zwecke verarbeitet:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Durchführung und Verwaltung von Terminbuchungen</li>
                <li>Terminbestätigung und -erinnerung</li>
                <li>Kommunikation bezüglich Ihrer Termine</li>
                <li>Erbringung der gebuchten Dienstleistungen</li>
                <li>Erfüllung gesetzlicher Aufbewahrungspflichten</li>
              </ul>
            </div>
          </div>

          {/* 4. Datenweitergabe */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">4. Datenweitergabe an Dritte</h3>
            <div className="text-white/70 space-y-4">
              <p>
                Ihre personenbezogenen Daten werden grundsätzlich nicht an Dritte weitergegeben. 
                Eine Ausnahme besteht nur in folgenden Fällen:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Auftragsverarbeiter:</strong> Supabase (Hosting/Datenbank). Verarbeitung primär in EU-Region; bei Übermittlungen in Drittländer werden Standardvertragsklauseln (SCC) eingesetzt.</li>
                <li><strong>Social Media:</strong> Bei Klick auf WhatsApp/Instagram-Buttons erfolgt eine Weiterleitung zu Meta Platforms Inc. Es erfolgt erst bei Klick eine Verbindung zu Meta.</li>
                <li><strong>Gesetzliche Verpflichtungen:</strong> Bei behördlichen Anfragen oder rechtlichen Verpflichtungen</li>
              </ul>
              <p className="text-sm text-white/60">
                <strong>Hinweis:</strong> WhatsApp und Instagram sind Dienste von Meta Platforms Inc. 
                Bei der Nutzung dieser Dienste gelten die Datenschutzbestimmungen von Meta.
              </p>
            </div>
          </div>

          {/* 5. Datenspeicherung */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">5. Datenspeicherung und -löschung</h3>
            <div className="text-white/70 space-y-4">
              <p>
                <strong>Speicherdauern nach Datenkategorien:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Termin- & Kommunikationsdaten:</strong> 3 Jahre nach dem letzten Termin (allgemeine zivilrechtliche Verjährung)</li>
                <li><strong>Rechnungs-/Buchhaltungsdaten:</strong> 7 Jahre (gesetzliche Aufbewahrung nach §132 BAO/§§190, 212 UGB)</li>
                <li><strong>Kontaktanfragen:</strong> 1 Jahr nach Bearbeitung</li>
              </ul>
              <p>
                <strong>Automatisierte Entscheidungen/Profiling:</strong> Finden nicht statt. 
                Alle Terminbuchungen werden manuell bearbeitet.
              </p>
              <p>
                <strong>Automatische Löschung:</strong> Nach Ablauf der jeweiligen Speicherfrist werden Ihre 
                Daten automatisch gelöscht, es sei denn, Sie haben ausdrücklich einer längeren 
                Speicherung zugestimmt.
              </p>
              <p>
                <strong>Frühzeitige Löschung:</strong> Sie können jederzeit die Löschung Ihrer 
                Daten beantragen (siehe Ihre Rechte).
              </p>
            </div>
          </div>

          {/* 6. Cookies */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">6. Cookies und Tracking</h3>
            <div className="text-white/70 space-y-4">
              <p>
                Diese Website verwendet nur technisch notwendige Cookies für die ordnungsgemäße 
                Funktionsweise der Website. Es werden keine Tracking-Cookies oder Analyse-Tools 
                eingesetzt.
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-white/20">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-3">Cookie-Name</th>
                      <th className="text-left p-3">Zweck</th>
                      <th className="text-left p-3">Laufzeit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-white/10">
                      <td className="p-3">Session-Cookies</td>
                      <td className="p-3">Funktionsfähigkeit der Website</td>
                      <td className="p-3">Session-Ende</td>
                    </tr>
                    <tr className="border-b border-white/10">
                      <td className="p-3">supabase-auth-token</td>
                      <td className="p-3">Admin-Authentifizierung (nur bei Admin-Login)</td>
                      <td className="p-3">24 Stunden</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="text-sm text-white/60">
                <strong>Rechtliche Grundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Funktionsfähigkeit).
              </p>
            </div>
          </div>

          {/* 7. Datensicherheit */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">7. Datensicherheit</h3>
            <div className="text-white/70 space-y-4">
              <p>
                Wir verwenden geeignete technische und organisatorische Sicherheitsmaßnahmen, 
                um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, teilweisen oder 
                vollständigen Verlust, Zerstörung oder gegen den unbefugten Zugriff Dritter zu schützen.
              </p>
              <p>
                <strong>Implementierte Maßnahmen:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS-Verschlüsselung der gesamten Website</li>
                <li>Sichere Datenbank mit Row-Level-Security</li>
                <li>Regelmäßige Sicherheitsupdates</li>
                <li>Zugriffsbeschränkungen auf persönliche Daten</li>
              </ul>
            </div>
          </div>

          {/* 8. Ihre Rechte */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">8. Ihre Rechte nach der DSGVO</h3>
            <div className="text-white/70 space-y-4">
              <p>Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-white/10 p-4">
                  <h4 className="font-semibold mb-2">📋 Auskunftsrecht (Art. 15 DSGVO)</h4>
                  <p className="text-sm">Recht auf Auskunft über gespeicherte Daten</p>
                </div>
                <div className="border border-white/10 p-4">
                  <h4 className="font-semibold mb-2">✏️ Berichtigungsrecht (Art. 16 DSGVO)</h4>
                  <p className="text-sm">Recht auf Korrektur unrichtiger Daten</p>
                </div>
                <div className="border border-white/10 p-4">
                  <h4 className="font-semibold mb-2">🗑️ Löschungsrecht (Art. 17 DSGVO)</h4>
                  <p className="text-sm">Recht auf Löschung der Daten</p>
                </div>
                <div className="border border-white/10 p-4">
                  <h4 className="font-semibold mb-2">⏸️ Einschränkungsrecht (Art. 18 DSGVO)</h4>
                  <p className="text-sm">Recht auf Einschränkung der Verarbeitung</p>
                </div>
                <div className="border border-white/10 p-4">
                  <h4 className="font-semibold mb-2">📤 Datenübertragbarkeit (Art. 20 DSGVO)</h4>
                  <p className="text-sm">Recht auf Übertragung der Daten</p>
                </div>
                <div className="border border-white/10 p-4">
                  <h4 className="font-semibold mb-2">❌ Widerspruchsrecht (Art. 21 DSGVO)</h4>
                  <p className="text-sm">Recht auf Widerspruch gegen die Verarbeitung</p>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded">
                <p className="text-sm">
                  <strong>Hinweis:</strong> Um Ihre Rechte auszuüben, kontaktieren Sie uns bitte 
                  per E-Mail oder Telefon. Wir werden Ihren Antrag innerhalb von 30 Tagen bearbeiten. 
                  Die Frist kann um bis zu zwei Monate verlängert werden; wir informieren Sie innerhalb 
                  eines Monats über eine Verlängerung.
                </p>
              </div>
            </div>
          </div>

          {/* 9. Beschwerderecht */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">9. Beschwerderecht bei der Aufsichtsbehörde</h3>
            <div className="text-white/70 space-y-4">
              <p>
                Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die 
                Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren.
              </p>
              <p>
                <strong>Zuständige Aufsichtsbehörde in Österreich:</strong><br />
                Österreichische Datenschutzbehörde<br />
                Barichgasse 40-42<br />
                1030 Wien<br />
                E-Mail: dsb@dsb.gv.at<br />
                Web: <a href="https://www.dsb.gv.at" className="text-blue-400 hover:text-blue-300">www.dsb.gv.at</a>
              </p>
            </div>
          </div>

          {/* 10. Änderungen */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">10. Änderungen dieser Datenschutzerklärung</h3>
            <div className="text-white/70 space-y-4">
              <p>
                Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren, um sie an 
                geänderte Rechtslagen oder bei Änderungen unserer Dienstleistungen sowie der 
                Datenverarbeitung anzupassen. Für Ihren erneuten Besuch gilt dann die neue 
                Datenschutzerklärung.
              </p>
            </div>
          </div>

          {/* 11. Kontakt */}
          <div>
            <h3 className="tracking-[0.1em] mb-4 uppercase">11. Kontakt für Datenschutzanfragen</h3>
            <div className="text-white/70 space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 p-6 rounded">
                <p className="mb-4">
                  Bei Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte wenden Sie sich bitte an:
                </p>
                <div className="space-y-2">
                  <p><strong>COIFFEUR BY RABIA CAYLI</strong></p>
                  <p>Inhaberin: Rabia Cayli</p>
                  <p>📧 E-Mail: <a href="mailto:contact@coiffeurbyrabiacayli.at" className="text-blue-400 hover:text-blue-300">contact@coiffeurbyrabiacayli.at</a></p>
                  <p>📞 Telefon: <a href="tel:+436765209297" className="text-blue-400 hover:text-blue-300">+43 676 5209297</a></p>
                </div>
                <p className="text-sm mt-4 text-white/60">
                  Wir antworten auf alle Anfragen innerhalb von 30 Tagen.
                </p>
              </div>
            </div>
          </div>
    </LegalPageTemplate>
  );
}