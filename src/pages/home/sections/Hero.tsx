import Button from '@/components/ui/Button';
import { SITE } from '@/config/site';
import styles from './Hero.module.css';

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>{SITE.name}</h1>
          <p className={styles.subtitle}>{SITE.tagline}</p>
          <p className={styles.lead}>
            Velkommen. Her finder du foder, tilbehør og gode råd til et sundt
            hønsehold – uanset om du har tre høns i baghaven eller en hel flok.
          </p>
          <div className={styles.actions}>
            <Button to="/sortiment">Se sortiment</Button>
            <Button to="/kontakt" variant="secondary">
              Kontakt os
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
