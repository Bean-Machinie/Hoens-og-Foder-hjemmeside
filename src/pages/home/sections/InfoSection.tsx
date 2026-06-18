import { SITE } from '@/config/site';
import styles from './InfoSection.module.css';

function InfoSection() {
  return (
    <section id="kontakt" className={styles.section}>
      <div className="container">
        <header className={styles.header}>
          <h2>Kontakt &amp; information</h2>
          <p className={styles.intro}>
            Har du spørgsmål? Ring eller skriv – vi hjælper gerne.
          </p>
        </header>

        <dl className={styles.grid}>
          <div className={styles.item}>
            <dt className={styles.label}>Telefon</dt>
            <dd className={styles.value}>
              <a href={`tel:${SITE.phone.replace(/\s+/g, '')}`}>{SITE.phone}</a>
            </dd>
          </div>

          <div className={styles.item}>
            <dt className={styles.label}>E-mail</dt>
            <dd className={styles.value}>
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </dd>
          </div>

          <div className={styles.item}>
            <dt className={styles.label}>Adresse</dt>
            <dd className={styles.value}>{SITE.address}</dd>
          </div>

          <div className={styles.item}>
            <dt className={styles.label}>Åbningstider</dt>
            <dd className={styles.value}>{SITE.openingHours}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export default InfoSection;
