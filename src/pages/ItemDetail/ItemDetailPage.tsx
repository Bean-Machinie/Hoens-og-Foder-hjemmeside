import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import ReserveAction from '@/components/ReserveAction/ReserveAction';
import { SITE } from '@/config/site';
import {
  defaultVariant,
  fetchProducts,
  findGroupBySlug,
  groupProducts,
  type Product,
  type ProductGroup,
} from '@/pages/catalogue/inventory';
import styles from './ItemDetailPage.module.css';

type Status = 'loading' | 'ready' | 'notfound' | 'error';

function statusClass(status: Product['status']): string {
  if (status === 'Nyhed') {
    return styles.statusNew;
  }
  if (status === 'Bestillingsvare') {
    return styles.statusOrder;
  }
  return styles.statusSoldOut;
}

function ItemDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Did the user arrive here from the catalogue grid? If so, going back
  // should be a real history pop so their filter and scroll are restored.
  const cameFromCatalogue = Boolean(
    (location.state as { fromCatalogue?: boolean } | null)?.fromCatalogue,
  );
  const [group, setGroup] = useState<ProductGroup | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setGroup(null);
    setSelected(null);

    fetchProducts()
      .then((all) => {
        if (cancelled) {
          return;
        }
        const groups = groupProducts(all.filter((item) => item.visible));
        const match = findGroupBySlug(groups, slug);
        if (match) {
          setGroup(match);
          setSelected(defaultVariant(match));
          setStatus('ready');
        } else {
          setStatus('notfound');
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        console.error('Failed to load product:', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

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
      {cameFromCatalogue ? (
        <button
          type="button"
          className={styles.back}
          onClick={() => navigate(-1)}
        >
          <span aria-hidden="true" className={styles.backArrow} />
          Tilbage til sortiment
        </button>
      ) : (
        <Link to="/sortiment" className={styles.back}>
          <span aria-hidden="true" className={styles.backArrow} />
          Tilbage til sortiment
        </Link>
      )}

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
