import Hero from './sections/Hero';
import CatalogueSection from './sections/CatalogueSection';
import AboutSection from './sections/AboutSection';
import styles from './HomePage.module.css';

/**
 * Home page. Composes the page from its sections in order:
 * hero → catalogue → store information and directions.
 * Contact details and opening hours now live in the site footer.
 */
function HomePage() {
  return (
    <div className={styles.page}>
      <Hero />
      <CatalogueSection />
      <AboutSection />
    </div>
  );
}

export default HomePage;
