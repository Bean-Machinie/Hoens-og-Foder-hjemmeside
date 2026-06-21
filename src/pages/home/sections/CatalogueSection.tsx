import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Button from '@/components/ui/Button';
import styles from './CatalogueSection.module.css';

interface CatalogueItem {
  id: string;
  name: string;
  description: string;
}

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
  {
    id: 'tilbehoer',
    name: 'Tilbehør',
    description: 'Praktisk tilbehør til hønseholdet.',
  },
];

function CatalogueSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: (_viewSize, snapSize) => snapSize / 2,
    loop: true,
    skipSnaps: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section id="sortiment" className={styles.section}>
      <div className="container">
        <div className={styles.top}>
          <header className={styles.header}>
            <h2>Hvad leder du efter i dag?</h2>
            <p className={styles.intro}>
              Klik på en kategori og gå på opdagelse i butikken.
            </p>
          </header>
        </div>

        <div className={styles.carouselShell}>
          <button
            aria-label="Forrige vare"
            className={`${styles.control} ${styles.previous}`}
            onClick={scrollPrev}
            type="button"
          >
            <span aria-hidden="true" />
          </button>

          <div className={styles.carousel} ref={emblaRef}>
            <ul className={styles.track}>
              {ITEMS.map((item) => (
                <li key={item.id} className={styles.slide}>
                  <article className={styles.card}>
                    <div className={styles.thumb} aria-hidden="true" />
                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{item.name}</h3>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>

          <button
            aria-label="Næste vare"
            className={`${styles.control} ${styles.next}`}
            onClick={scrollNext}
            type="button"
          >
            <span aria-hidden="true" />
          </button>
        </div>

        <div className={styles.footer}>
          <div className={styles.dots} aria-label="Vælg sortiment-slide">
            {ITEMS.map((item, index) => (
              <button
                aria-label={`Gå til slide ${index + 1}`}
                aria-current={selectedIndex === index ? 'true' : undefined}
                className={`${styles.dot} ${
                  selectedIndex === index ? styles.dotActive : ''
                }`}
                key={item.id}
                onClick={() => scrollTo(index)}
                type="button"
              />
            ))}
          </div>

          <Button to="/sortiment">Se hele Udvalget</Button>
        </div>
      </div>
    </section>
  );
}

export default CatalogueSection;
