import Hero from './sections/Hero';
import CatalogueSection from './sections/CatalogueSection';
import AboutSection from './sections/AboutSection';
import InfoSection from './sections/InfoSection';

/**
 * Home page. Composes the page from its sections in order:
 * hero → catalogue → about → information.
 */
function HomePage() {
  return (
    <>
      <Hero />
      <CatalogueSection />
      <AboutSection />
      <InfoSection />
    </>
  );
}

export default HomePage;
