import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import Button from '@/components/ui/Button';
import { PRODUCT_CATEGORIES } from '@/config/categories';
import styles from './CatalogueSection.module.css';

function CatalogueSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
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
      if (!emblaApi) {
        return;
      }

      const currentIndex = emblaApi.selectedScrollSnap();
      const matchingSlides = [index, index + PRODUCT_CATEGORIES.length];
      const nearestSlide = matchingSlides.reduce((nearest, candidate) =>
        Math.abs(candidate - currentIndex) < Math.abs(nearest - currentIndex)
          ? candidate
          : nearest,
      );

      emblaApi.scrollTo(nearestSlide);
    },
    [emblaApi],
  );

  // The carousel is draggable, so a tap that turns into a drag must not also
  // navigate. Record where the pointer went down and cancel the click if it
  // moved more than a few pixels before release.
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const handleCardPointerDown = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      dragStart.current = { x: event.clientX, y: event.clientY };
    },
    [],
  );

  const handleCardClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const start = dragStart.current;
      if (!start) {
        return;
      }
      const movedFar =
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8;
      if (movedFar) {
        event.preventDefault();
      }
    },
    [],
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setSelectedIndex(
      emblaApi.selectedScrollSnap() % PRODUCT_CATEGORIES.length,
    );
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
              {[...PRODUCT_CATEGORIES, ...PRODUCT_CATEGORIES].map((item, index) => {
                const isClone = index >= PRODUCT_CATEGORIES.length;

                return (
                  <li
                    aria-hidden={isClone ? 'true' : undefined}
                    key={`${item.id}-${index}`}
                    className={styles.slide}
                  >
                    <Link
                      aria-label={`Vis ${item.name} i sortimentet`}
                      className={styles.cardLink}
                      draggable={false}
                      onClick={handleCardClick}
                      onPointerDown={handleCardPointerDown}
                      tabIndex={isClone ? -1 : undefined}
                      to={item.href}
                    >
                      <article className={styles.card}>
                        <img
                          alt=""
                          aria-hidden="true"
                          className={styles.thumb}
                          decoding="async"
                          draggable={false}
                          loading="lazy"
                          src={item.image}
                        />
                        <div className={styles.cardBody}>
                          <h3 className={styles.cardTitle}>{item.name}</h3>
                        </div>
                      </article>
                    </Link>
                  </li>
                );
              })}
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
            {PRODUCT_CATEGORIES.map((item, index) => (
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
