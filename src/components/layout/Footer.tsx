import { SITE } from '@/config/site';
import styles from './Footer.module.css';

function Footer() {
  const year = new Date().getFullYear();
  const telHref = `tel:${SITE.phone.replace(/\s+/g, '')}`;

  return (
    <footer id="kontakt" className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <span className={styles.brand}>{SITE.name}</span>
          <p className={styles.tagline}>{SITE.tagline}</p>
        </div>

        <div className={styles.details}>
          <div className={styles.headSpacer} aria-hidden="true" />
          <h2 className={styles.hoursHeading}>Åbningstider</h2>

          <dl className={styles.contact}>
            <div className={styles.contactRow}>
              <dt className={styles.label}>Telefon</dt>
              <dd className={styles.value}>
                <a href={telHref}>{SITE.phone}</a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt className={styles.label}>E-mail</dt>
              <dd className={styles.value}>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </dd>
            </div>
            <div className={styles.contactRow}>
              <dt className={styles.label}>Adresse</dt>
              <dd className={styles.value}>{SITE.address}</dd>
            </div>
          </dl>

          <dl className={styles.hours}>
            {SITE.openingHours.map((row) => (
              <div key={row.days} className={styles.hoursRow}>
                <dt className={styles.hoursDays}>{row.days}</dt>
                <dd className={styles.hoursTime}>{row.hours}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>
            © {year} {SITE.name}. Alle rettigheder forbeholdes.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
