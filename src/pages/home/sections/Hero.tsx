import Button from '@/components/ui/Button';
import heroImage from '@/assets/images/Hero_Image.webp';
import { SITE } from '@/config/site';
import styles from './Hero.module.css';

function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrap} aria-hidden="true">
        <img className={styles.image} draggable={false} src={heroImage} />
      </div>

      <div className={`container ${styles.inner}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>{SITE.name}</h1>
          <p className={styles.subtitle}>
            Hos os finder du alt det du skal bruge: Høns, Kvalitetsfoder, og
            Personlig vejledning
          </p>

          <div className={styles.hours}>
            <p className={styles.hoursTitle}>Åbningstider:</p>
            <p>Man - Fre: 16:00 - 19:00</p>
            <p>Lørdag: 9:00 - 14:00</p>
            <p>Søndag: Lukket</p>
          </div>

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
