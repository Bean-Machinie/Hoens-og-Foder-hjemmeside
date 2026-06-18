import Button from '@/components/ui/Button';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
  return (
    <section className={`container ${styles.section}`}>
      <p className={styles.code}>404</p>
      <h1>Siden blev ikke fundet</h1>
      <p className={styles.text}>
        Beklager – vi kunne ikke finde den side, du ledte efter.
      </p>
      <Button to="/">Tilbage til forsiden</Button>
    </section>
  );
}

export default NotFoundPage;
