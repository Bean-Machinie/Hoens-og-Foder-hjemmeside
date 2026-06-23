import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import ReserveAction from '@/components/ReserveAction/ReserveAction';
import { SITE } from '@/config/site';
import {
  fetchProducts,
  findProductBySlug,
  type Product,
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
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setProduct(null);

    fetchProducts()
      .then((all) => {
        if (cancelled) {
          return;
        }
        const match = findProductBySlug(
          all.filter((item) => item.visible),
          slug,
        );
        if (match) {
          setProduct(match);
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
    if (product) {
      document.title = `${product.title} – ${SITE.name}`;
    }
    return () => {
      document.title = SITE.name;
    };
  }, [product]);

  return (
    <section className={`container ${styles.page}`}>
      <Link to="/sortiment" className={styles.back}>
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

      {status === 'ready' && product && (
        <article className={styles.layout}>
          <div
            className={`${styles.media} ${
              product.status === 'Midlertidigt udsolgt' ? styles.mediaSoldOut : ''
            }`}
          >
            {product.status && (
              <span className={`${styles.statusBadge} ${statusClass(product.status)}`}>
                {product.status}
              </span>
            )}
            <img
              className={styles.image}
              src={product.imageUrl || placeholderImage}
              alt={product.title}
              onError={(event) => {
                const img = event.currentTarget;
                if (img.src !== placeholderImage) {
                  img.src = placeholderImage;
                }
              }}
            />
          </div>

          <div className={styles.info}>
            <header className={styles.header}>
              <p className={styles.category}>{product.category}</p>
              <h1 className={styles.title}>{product.title}</h1>
              {product.price && <p className={styles.price}>{product.price}</p>}
            </header>

            {/* Always rendered with a reserved min-height so the layout stays
                structured even for items without a description. */}
            <div className={styles.description}>
              {product.description.trim() ? (
                product.description
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
              <ReserveAction product={product} />
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

export default ItemDetailPage;
