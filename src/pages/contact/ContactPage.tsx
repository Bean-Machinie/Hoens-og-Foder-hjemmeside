import PageHeader from '@/components/ui/PageHeader';
import { SITE } from '@/config/site';
import styles from './ContactPage.module.css';

function ContactPage() {
  return (
    <>
      <PageHeader title="Kontakt">
        Sådan får du fat i os. Foreløbig en pladsholder, som vi bygger videre
        på.
      </PageHeader>
      <section className={`container ${styles.section}`}>
        <p>
          Telefon: <a href={`tel:${SITE.phone.replace(/\s+/g, '')}`}>{SITE.phone}</a>
        </p>
        <p>
          E-mail: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
        <p>{SITE.address}</p>
      </section>
    </>
  );
}

export default ContactPage;
