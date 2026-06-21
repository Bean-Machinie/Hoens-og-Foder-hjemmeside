import Hero from './sections/Hero';
import CatalogueSection from './sections/CatalogueSection';
import AboutSection from './sections/AboutSection';
import InfoSection from './sections/InfoSection';
import styles from './HomePage.module.css';

/**
 * Home page. Composes the page from its sections in order:
 * hero → catalogue → store information and directions → contact information.
 */
function HomePage() {
  return (
    <div className={styles.page}>
      <Hero />
      <CatalogueSection />
      <AboutSection />
      <InfoSection />
    </div>
  );
}

export default HomePage;
