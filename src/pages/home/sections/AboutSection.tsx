import informationImage from '@/assets/images/information_Image.webp';
import styles from './AboutSection.module.css';

const ADDRESS = 'Bundsvej 16, 3660 Stenløse';
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed&t=k`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`;

function AboutSection() {
  return (
    <section id="find-vej" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.imageWrap} aria-hidden="true">
          <img
            alt=""
            className={styles.image}
            decoding="async"
            loading="lazy"
            src={informationImage}
          />
        </div>

        <div className={styles.content}>
          <h2>Velkommen til Høns og Foder</h2>
          <p>
            I vores gårdbutik finder du høns, foder og udstyr til både nye og
            erfarne dyreejere. Vi sælger foder til høns, hunde og katte samt
            udstyr og andre varer til pasning og pleje af dyr.
          </p>
          <p>
            Hos os kan du finde det, du skal bruge i hverdagen, uanset om du
            allerede har dyr derhjemme eller skal i gang med høns for første
            gang.
          </p>
          <p>
            Kig forbi butikken og se udvalget. Vi hjælper dig med at finde det
            rigtige foder, det rette udstyr eller de høns, der passer til dig.
          </p>
        </div>

        <aside className={styles.location} aria-labelledby="find-vej-title">
          <div className={styles.locationHeading}>
            <h2 id="find-vej-title">Find vej</h2>
            <address>{ADDRESS}</address>
          </div>

          <div className={styles.mapFrame}>
            <iframe
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={MAP_EMBED_URL}
              title={`Google Maps – ${ADDRESS}`}
            />
          </div>

          <a
            className={styles.mapButton}
            href={MAP_DIRECTIONS_URL}
            rel="noreferrer"
            target="_blank"
          >
            Åbn i Google Maps
          </a>
        </aside>
      </div>
    </section>
  );
}

export default AboutSection;
