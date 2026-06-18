import Button from '@/components/ui/Button';
import styles from './CatalogueSection.module.css';

interface CatalogueItem {
  id: string;
  name: string;
  description: string;
}

/** Placeholder catalogue items — replace with real products later. */
const ITEMS: CatalogueItem[] = [
  {
    id: 'laegfoder',
    name: 'Lægfoder',
    description: 'Komplet foder til æglæggende høner.',
  },
  {
    id: 'kyllingefoder',
    name: 'Kyllingefoder',
    description: 'Næringsrigt opstartsfoder til kyllinger.',
  },
  {
    id: 'tilskud',
    name: 'Tilskud & grit',
    description: 'Skaller, grit og vitaminer til en sund flok.',
  },
  {
    id: 'udstyr',
    name: 'Udstyr',
    description: 'Drikkekar, foderautomater og redekasser.',
  },
];

function CatalogueSection() {
  return (
    <section id="sortiment" className={styles.section}>
      <div className="container">
        <header className={styles.header}>
          <h2>Vores sortiment</h2>
          <p className={styles.intro}>
            Et udvalg af vores mest populære varer. Se hele sortimentet for
            priser og detaljer.
          </p>
        </header>

        <ul className={styles.grid}>
          {ITEMS.map((item) => (
            <li key={item.id} className={styles.card}>
              <div className={styles.thumb} aria-hidden="true" />
              <h3 className={styles.cardTitle}>{item.name}</h3>
              <p className={styles.cardText}>{item.description}</p>
            </li>
          ))}
        </ul>

        <div className={styles.footer}>
          <Button to="/sortiment">Se hele sortimentet</Button>
        </div>
      </div>
    </section>
  );
}

export default CatalogueSection;
