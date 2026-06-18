import { SITE } from '@/config/site';
import styles from './Footer.module.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.brand}>{SITE.name}</span>
        <span className={styles.copy}>
          © {year} {SITE.name}. Alle rettigheder forbeholdes.
        </span>
      </div>
    </footer>
  );
}

export default Footer;
