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
          <h2>Velkommen til vores lille gårdbutik på landet</h2>
          <p>
            Vores hyggelige gårdbutik er fyldt med foder, høns, udstyr og gode
            råd.
          </p>
          <p>
            Du er altid velkommen til at kigge forbi – vi hjælper både
            nybegyndere og erfarne dyrevenner.
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
