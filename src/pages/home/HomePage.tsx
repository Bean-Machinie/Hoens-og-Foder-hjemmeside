import Hero from './sections/Hero';
import CatalogueSection from './sections/CatalogueSection';
import AboutSection from './sections/AboutSection';
import Footer from '@/components/layout/Footer';
import styles from './HomePage.module.css';

/**
 * Home page. Composes the page from its sections in order:
 * hero → catalogue → store information and directions → footer with
 * contact details and opening hours.
 */
function HomePage() {
  return (
    <div className={styles.page}>
      <Hero />
      <CatalogueSection />
      <AboutSection />
      <Footer />
    </div>
  );
}

export default HomePage;
