import PageHeader from '@/components/ui/PageHeader';
import styles from './CataloguePage.module.css';

function CataloguePage() {
  return (
    <>
      <PageHeader title="Sortiment">
        Her kommer det fulde sortiment. Foreløbig en pladsholder, som vi bygger
        videre på.
      </PageHeader>
      <section className={`container ${styles.section}`}>
        <p>Indhold følger.</p>
      </section>
    </>
  );
}

export default CataloguePage;
