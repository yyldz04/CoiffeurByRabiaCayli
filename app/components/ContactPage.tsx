import Image from 'next/image';

export function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-0 md:px-4 xl:px-0">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-2xl md:text-4xl tracking-[0.2em] mb-6 md:mb-8 uppercase">
          KONTAKT
        </h2>
        <p className="text-white/70 uppercase">
          Kontaktieren Sie uns für Anfragen und Informationen
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* Contact Information */}
        <div className="border-t border-b border-l border-white/20 p-6 md:p-12 md:border-r">
          <h3 className="text-xl md:text-2xl tracking-[0.15em] mb-6 md:mb-8 uppercase">
            KONTAKT AUFNEHMEN
          </h3>

          <div className="space-y-8">
            <div>
              <h4 className="tracking-[0.1em] mb-2 uppercase">
                ADRESSE
              </h4>
              <p className="text-white/70 uppercase">
                St. Ulrich Straße 28
                <br />
                6843 Götzis
                <br />
                Österreich
              </p>
            </div>

            <div>
              <h4 className="tracking-[0.1em] mb-2 uppercase">
                TELEFON
              </h4>
              <p className="text-white/70 uppercase">
                <a href="tel:+436765209297">+43 676 5209297</a>
              </p>
            </div>

            <div>
              <h4 className="tracking-[0.1em] mb-2 uppercase">
                E-MAIL
              </h4>
              <p className="text-white/70 uppercase">
                <a href="mailto:contact@coiffeurbyrabiacayli.at">contact@coiffeurbyrabiacayli.at</a>
              </p>
            </div>

            <div>
              <h4 className="tracking-[0.1em] mb-2 uppercase">
                ÖFFNUNGSZEITEN
              </h4>
              <div className="text-white/70 uppercase space-y-1">
                <div className="flex justify-between">
                  <span>Montag</span>
                  <span>9:00 - 19:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span>Dienstag</span>
                  <span>9:00 - 19:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span>Mittwoch</span>
                  <span>9:00 - 19:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span>Donnerstag</span>
                  <span>9:00 - 19:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span>Freitag</span>
                  <span>9:00 - 19:00 Uhr</span>
                </div>
                <div className="flex justify-between">
                  <span>Samstag</span>
                  <span>Auf Anfrage</span>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div>
              <h4 className="tracking-[0.1em] mb-4 uppercase">
                STANDORT
              </h4>
              <div className="border border-white/20 aspect-video bg-white/5 flex items-center justify-center">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d412.0627449603479!2d9.640753125757318!3d47.33542876167068!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479b3e4121edee71%3A0xb7fd23f00692fa7d!2sSankt-Ulrich-Stra%C3%9Fe%2028%2C%206840%20G%C3%B6tzis!5e0!3m2!1sen!2sat!4v1758365614590!5m2!1sen!2sat" width="600" height="450" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="border-t border-b border-r border-white/20 p-6 md:p-12 md:border-l">
          <h3 className="text-xl md:text-2xl tracking-[0.15em] mb-6 md:mb-8 uppercase">
            NACHRICHT SENDEN
          </h3>

          <div className="space-y-4">
            {/* WhatsApp Card */}
            <div
              className="border border-white/20 p-6 cursor-pointer transition-colors hover:bg-white/5"
              onClick={() =>
                window.open("https://wa.me/436765209297", "_blank")
              }
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="tracking-[0.05em] uppercase">
                  WhatsApp
                </h4>
                <Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} className="w-5 h-5" />
              </div>
              <p className="text-white/70 mb-4 uppercase">
                Schreiben Sie uns direkt über WhatsApp für
                schnelle Antworten und Terminvereinbarungen.
              </p>
              <p className="text-white/60 uppercase tracking-[0.05em]">
                +43 676 5209297
              </p>
            </div>

            {/* Instagram Card */}
            <div
              className="border border-white/20 p-6 cursor-pointer transition-colors hover:bg-white/5"
              onClick={() =>
                window.open(
                  "https://www.instagram.com/coiffeur.by.rabiacayli/",
                  "_blank",
                )
              }
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="tracking-[0.05em] uppercase">
                  Instagram
                </h4>
                <Image src="/instagram.png" alt="Instagram" width={20} height={20} className="w-5 h-5" />
              </div>
              <p className="text-white/70 mb-4 uppercase">
                Folgen Sie uns für Inspiration und senden Sie
                uns eine Nachricht über Instagram.
              </p>
              <p className="text-white/60 uppercase tracking-[0.05em]">
                @coiffeur.by.rabiacayli
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}