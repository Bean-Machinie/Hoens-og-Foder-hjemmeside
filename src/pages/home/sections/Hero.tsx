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

          <div className={styles.hours}>
            <p className={styles.hoursTitle}>Åbningstider:</p>
            <div className={styles.hoursList}>
              {SITE.openingHours.map((row) => (
                <p key={row.days}>
                  {row.days}: {row.hours}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
