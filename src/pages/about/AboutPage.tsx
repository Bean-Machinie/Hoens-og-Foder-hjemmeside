import PageHeader from '@/components/ui/PageHeader';
import styles from './AboutPage.module.css';

function AboutPage() {
  return (
    <>
      <PageHeader title="Om os">
        Lidt mere om hvem vi er. Foreløbig en pladsholder, som vi bygger videre
        på.
      </PageHeader>
      <section className={`container ${styles.section}`}>
        <p>Indhold følger.</p>
      </section>
    </>
  );
}

export default AboutPage;
