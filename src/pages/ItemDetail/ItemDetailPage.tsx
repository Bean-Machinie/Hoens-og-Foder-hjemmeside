import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import ReserveAction from '@/components/ReserveAction/ReserveAction';
import { SITE } from '@/config/site';
import { useInventory } from '@/context/InventoryContext';
import {
  defaultVariant,
  findGroupBySlug,
  groupSlug,
  type Product,
  type ProductGroup,
} from '@/pages/catalogue/inventory';
import styles from './ItemDetailPage.module.css';

type Status = 'loading' | 'ready' | 'notfound' | 'error';
const MIN_RELATED_CARDS_PER_SEQUENCE = 8;
const RELATED_BASE_SPEED = 10;
const RELATED_FRICTION = 0.985;
const RELATED_RESUME_DELAY = 1400;
const RELATED_DRAG_THRESHOLD = 8;
const RELATED_MAX_FLING_SPEED = 900;

interface ItemDetailLocationState {
  catalogueHref?: string;
  fromCatalogue?: boolean;
}

function statusClass(status: Product['status']): string {
  if (status === 'Nyhed') {
    return styles.statusNew;
  }
  if (status === 'Bestillingsvare') {
    return styles.statusOrder;
  }
  return styles.statusSoldOut;
}

function cardStatusClass(status: Product['status']): string {
  if (status === 'Nyhed') {
    return styles.relatedNew;
  }
  if (status === 'Bestillingsvare') {
    return styles.relatedOrder;
  }
  if (status === 'Flere Varianter') {
    return styles.relatedVariants;
  }
  return styles.relatedSoldOut;
}

function productWords(group: ProductGroup): Set<string> {
  return new Set(
    `${group.title} ${group.category} ${group.variants
      .map((variant) => `${variant.variant} ${variant.description}`)
      .join(' ')}`
      .toLocaleLowerCase('da-DK')
      .split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word.length >= 4),
  );
}

function RelatedProductCard({
  catalogueHref,
  decorative = false,
  group,
}: {
  catalogueHref: string;
  decorative?: boolean;
  group: ProductGroup;
}) {
  const lead = defaultVariant(group);
  const cardStatus = group.variants.some(
    (variant) => variant.status === 'Flere Varianter',
  )
    ? 'Flere Varianter'
    : lead.status;

  return (
    <Link
      aria-label={group.title}
      className={styles.relatedCardLink}
      draggable={false}
      onDragStart={(event) => event.preventDefault()}
      state={{ catalogueHref, fromCatalogue: true }}
      tabIndex={decorative ? -1 : undefined}
      to={`/sortiment/${groupSlug(group)}`}
    >
      <article
        className={`${styles.relatedCard} ${
          lead.status === 'Midlertidigt udsolgt' ? styles.relatedCardSoldOut : ''
        }`}
      >
        {cardStatus && (
          <span className={`${styles.relatedStatus} ${cardStatusClass(cardStatus)}`}>
            {cardStatus}
          </span>
        )}
        <img
          alt={group.title}
          className={styles.relatedImage}
          draggable={false}
          loading="lazy"
          onError={(event) => {
            const img = event.currentTarget;
            if (img.src !== placeholderImage) {
              img.src = placeholderImage;
            }
          }}
          src={lead.imageUrl || placeholderImage}
        />
        <div className={styles.relatedBody}>
          <h3 className={styles.relatedTitle}>{group.title}</h3>
          <p className={styles.relatedCategory}>{group.category}</p>
          <p className={styles.relatedPrice}>{lead.price}</p>
        </div>
      </article>
    </Link>
  );
}

function RelatedProductsLoop({
  catalogueHref,
  sequence,
}: {
  catalogueHref: string;
  sequence: ProductGroup[];
}) {
  const loopRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const firstSequenceRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(RELATED_BASE_SPEED);
  const lastTimestampRef = useRef<number | null>(null);
  const dragRef = useRef({
    active: false,
    captured: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTimestamp: 0,
    moved: false,
    lastDragAt: 0,
  });
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || sequence.length === 0) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );

    const applyTransform = () => {
      const width = firstSequenceRef.current?.getBoundingClientRect().width ?? 0;
      if (width <= 0) {
        return;
      }

      offsetRef.current = ((offsetRef.current % width) + width) % width;
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    if (prefersReducedMotion.matches) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return undefined;
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }

      const delta = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      if (!dragRef.current.active) {
        const elapsedSinceDrag = timestamp - dragRef.current.lastDragAt;
        const targetVelocity =
          elapsedSinceDrag > RELATED_RESUME_DELAY ? RELATED_BASE_SPEED : 0;
        velocityRef.current =
          velocityRef.current * RELATED_FRICTION +
          targetVelocity * (1 - RELATED_FRICTION);
        offsetRef.current += velocityRef.current * delta;
      }

      applyTransform();
      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [sequence.length]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragRef.current = {
      active: true,
      captured: false,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTimestamp: performance.now(),
      moved: false,
      lastDragAt: performance.now(),
    };
    velocityRef.current = 0;
    setDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    const deltaX = event.clientX - dragRef.current.lastX;
    const now = performance.now();
    const elapsed = Math.max(16, now - dragRef.current.lastTimestamp);
    const distanceFromStart = Math.hypot(
      event.clientX - dragRef.current.startX,
      event.clientY - dragRef.current.startY,
    );

    dragRef.current.lastX = event.clientX;
    dragRef.current.lastTimestamp = now;
    const hasDragged =
      dragRef.current.moved || distanceFromStart > RELATED_DRAG_THRESHOLD;
    dragRef.current.moved = hasDragged;
    dragRef.current.lastDragAt = now;

    if (hasDragged) {
      event.preventDefault();
      if (!dragRef.current.captured) {
        event.currentTarget.setPointerCapture(event.pointerId);
        dragRef.current.captured = true;
      }
    }

    offsetRef.current -= deltaX;
    velocityRef.current = Math.max(
      -RELATED_MAX_FLING_SPEED,
      Math.min(RELATED_MAX_FLING_SPEED, (-deltaX / elapsed) * 1000),
    );

    const width = firstSequenceRef.current?.getBoundingClientRect().width ?? 0;
    if (width > 0 && trackRef.current) {
      offsetRef.current = ((offsetRef.current % width) + width) % width;
      trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    }
  };

  const endDrag = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) {
      return;
    }

    if (
      event &&
      dragRef.current.captured &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current.active = false;
    dragRef.current.lastDragAt = performance.now();
    window.setTimeout(() => setDragging(false), 0);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.moved) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  };

  return (
    <section className={styles.related} aria-labelledby="related-title">
      <div className={styles.relatedHeading}>
        <h2 id="related-title">Lignende produkter</h2>
      </div>
      <div
        aria-label="Lignende produkter"
        className={`${styles.relatedLoop} ${
          dragging ? styles.relatedLoopDragging : ''
        }`}
        onClickCapture={handleClickCapture}
        onPointerCancel={(event) => endDrag(event)}
        onPointerDown={handlePointerDown}
        onPointerLeave={(event) => endDrag(event)}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => endDrag(event)}
        ref={loopRef}
        role="region"
      >
        <div className={styles.relatedTrack} ref={trackRef}>
          {[0, 1].map((copyIndex) => (
            <div
              aria-hidden={copyIndex > 0}
              className={styles.relatedSequence}
              key={copyIndex}
              ref={copyIndex === 0 ? firstSequenceRef : undefined}
            >
              {sequence.map((item, index) => (
                <RelatedProductCard
                  catalogueHref={catalogueHref}
                  decorative={copyIndex > 0}
                  group={item}
                  key={`${copyIndex}-${item.key}-${index}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ItemDetailPage() {
  const { slug = '' } = useParams();
  const location = useLocation();
  const { groups, status: inventoryStatus } = useInventory();
  const catalogueHref =
    (location.state as ItemDetailLocationState | null)?.catalogueHref ??
    '/sortiment';
  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    if (inventoryStatus === 'loading') {
      setStatus('loading');
      setGroup(null);
      setSelected(null);
      return;
    }

    if (inventoryStatus === 'error') {
      setStatus('error');
      setGroup(null);
      setSelected(null);
      return;
    }

    const match = findGroupBySlug(groups, slug);
    if (match) {
      setGroup(match);
      setSelected(defaultVariant(match));
      setStatus('ready');
    } else {
      setGroup(null);
      setSelected(null);
      setStatus('notfound');
    }
  }, [groups, inventoryStatus, slug]);

  const similarProducts = useMemo(() => {
    if (!group) {
      return [];
    }

    const currentWords = productWords(group);

    return groups
      .filter((candidate) => candidate.key !== group.key)
      .map((candidate, order) => {
        const candidateWords = productWords(candidate);
        let sharedWords = 0;

        for (const word of candidateWords) {
          if (currentWords.has(word)) {
            sharedWords += 1;
          }
        }

        const sameCategory = candidate.category === group.category;
        return {
          group: candidate,
          order,
          score: (sameCategory ? 100 : 0) + sharedWords * 8,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .slice(0, 12)
      .map((item) => item.group);
  }, [group, groups]);

  const relatedSequence = useMemo(() => {
    if (similarProducts.length === 0) {
      return [];
    }

    const repeatCount = Math.max(
      1,
      Math.ceil(MIN_RELATED_CARDS_PER_SEQUENCE / similarProducts.length),
    );

    return Array.from({ length: repeatCount }).flatMap(() => similarProducts);
  }, [similarProducts]);

  // Keep the browser tab title in sync with the current product.
  useEffect(() => {
    if (group) {
      document.title = `${group.title} – ${SITE.name}`;
    }
    return () => {
      document.title = SITE.name;
    };
  }, [group]);

  useEffect(() => {
    setImageOpen(false);
  }, [selected]);

  useEffect(() => {
    if (!imageOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setImageOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [imageOpen]);

  return (
    <section className={`container ${styles.page}`}>
      <Link to={catalogueHref} className={styles.back}>
        <span aria-hidden="true" className={styles.backArrow} />
        Tilbage til sortiment
      </Link>

      {status === 'loading' && (
        <div className={styles.layout} aria-hidden="true">
          <div className={`${styles.media} ${styles.skeleton}`} />
          <div className={styles.info}>
            <div className={`${styles.skeleton} ${styles.skelLine} ${styles.skelCategory}`} />
            <div className={`${styles.skeleton} ${styles.skelLine} ${styles.skelTitle}`} />
            <div className={`${styles.skeleton} ${styles.skelLine} ${styles.skelPrice}`} />
            <div className={`${styles.skeleton} ${styles.skelBlock}`} />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.message}>
          <p>Kunne ikke hente varen. Prøv igen senere.</p>
        </div>
      )}

      {status === 'notfound' && (
        <div className={styles.message}>
          <h1 className={styles.notFoundTitle}>Varen blev ikke fundet</h1>
          <p>
            Den vare, du leder efter, findes ikke længere eller er ikke
            tilgængelig.
          </p>
          <Link to="/sortiment" className={styles.messageLink}>
            Se hele sortimentet
          </Link>
        </div>
      )}

      {status === 'ready' && group && selected && (
        <>
        <article className={styles.layout}>
          <div
            className={`${styles.media} ${
              selected.status === 'Midlertidigt udsolgt' ? styles.mediaSoldOut : ''
            }`}
          >
            {selected.status && selected.status !== 'Flere Varianter' && (
              <span className={`${styles.statusBadge} ${statusClass(selected.status)}`}>
                {selected.status}
              </span>
            )}
            <button
              aria-label={`Vis større billede af ${group.title}`}
              className={styles.imageButton}
              onClick={() => setImageOpen(true)}
              type="button"
            >
              <img
                className={styles.image}
                src={selected.imageUrl || placeholderImage}
                alt={group.title}
                onError={(event) => {
                  const img = event.currentTarget;
                  if (img.src !== placeholderImage) {
                    img.src = placeholderImage;
                  }
                }}
              />
              <span className={styles.zoomCue} aria-hidden="true">
                Forstør
              </span>
            </button>
          </div>

          <div className={styles.info}>
            <header className={styles.header}>
              <p className={styles.category}>{group.category}</p>
              <h1 className={styles.title}>{group.title}</h1>
              {selected.price && <p className={styles.price}>{selected.price}</p>}
              {selected.barcode.trim() && (
                <p className={styles.barcode}>
                  <span>Stregkode</span>
                  {selected.barcode}
                </p>
              )}
            </header>

            {group.isGrouped && (
              <div className={styles.variants}>
                <span className={styles.variantLabel} id="variant-label">
                  Vælg variant
                </span>
                <div
                  className={styles.variantOptions}
                  role="group"
                  aria-labelledby="variant-label"
                >
                  {group.variants.map((variant) => {
                    const active = variant === selected;
                    const soldOut = variant.status === 'Midlertidigt udsolgt';
                    return (
                      <button
                        key={variant.barcode || variant.title}
                        type="button"
                        className={`${styles.variantChip} ${
                          active ? styles.variantChipActive : ''
                        } ${soldOut ? styles.variantChipSoldOut : ''}`}
                        aria-pressed={active}
                        onClick={() => setSelected(variant)}
                      >
                        {variant.variant || variant.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Always rendered with a reserved min-height so the layout stays
                structured even for items without a description. */}
            <div className={styles.description}>
              {selected.description.trim() ? (
                selected.description
                  .split(/\n+/)
                  .filter((line) => line.trim() !== '')
                  .map((line, index) => <p key={index}>{line}</p>)
              ) : (
                <p className={styles.descriptionEmpty}>
                  Der er endnu ikke tilføjet en beskrivelse til denne vare.
                </p>
              )}
            </div>

            <div className={styles.reserve}>
              <ReserveAction product={selected} />
            </div>
          </div>
        </article>

        {similarProducts.length > 0 && (
          <RelatedProductsLoop
            catalogueHref={catalogueHref}
            sequence={relatedSequence}
          />
        )}

        {imageOpen && (
          <div
            aria-label={`Større billede af ${group.title}`}
            aria-modal="true"
            className={styles.lightbox}
            onClick={() => setImageOpen(false)}
            role="dialog"
          >
            <div
              className={styles.lightboxPanel}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                aria-label="Luk billede"
                className={styles.lightboxClose}
                onClick={() => setImageOpen(false)}
                type="button"
              >
                <span aria-hidden="true" />
              </button>
              <img
                alt={group.title}
                className={styles.lightboxImage}
                src={selected.imageUrl || placeholderImage}
              />
              <p className={styles.lightboxCaption}>{group.title}</p>
            </div>
          </div>
        )}
        </>
      )}
    </section>
  );
}

export default ItemDetailPage;
