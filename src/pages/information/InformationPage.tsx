import PageHeader from '@/components/ui/PageHeader';
import styles from './InformationPage.module.css';

interface InformationPageProps {
  title: string;
  lead: string;
}

function InformationPage({ title, lead }: InformationPageProps) {
  return (
    <>
      <PageHeader title={title}>{lead}</PageHeader>
      <section className={styles.section}>
        <div className="container">
          <p className={styles.placeholder}>
            Indholdet til denne side kan tilføjes her, når teksten er klar.
          </p>
        </div>
      </section>
    </>
  );
}

export default InformationPage;
