import styles from './AboutSection.module.css';

function AboutSection() {
  return (
    <section id="om-os" className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.media} aria-hidden="true" />
        <div className={styles.content}>
          <h2>Om os</h2>
          <p>
            Vi er et lille familiedrevet firma med passion for høns. Gennem
            mange år har vi hjulpet både nybegyndere og erfarne hønseholdere
            med at finde det rette foder og udstyr.
          </p>
          <p>
            Vores mål er enkelt: sunde høns og glade ejere. Derfor udvælger vi
            vores varer med omhu og giver gerne et godt råd med på vejen.
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
