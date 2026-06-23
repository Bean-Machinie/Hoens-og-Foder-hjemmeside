import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import {
  CATEGORY_IDS,
  categoryIdForName,
  type CategoryId,
} from '@/config/categories';
import { fetchProducts, type Product } from './inventory';
import { useCategoryFilter } from './useCategoryFilter';
import CategoryFilterBar from './CategoryFilterBar';
import styles from './CataloguePage.module.css';

/** Build a { categoryId: count } map across all visible products. */
function countByCategory(products: Product[]): Record<CategoryId, number> {
  const counts = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, 0]),
  ) as Record<CategoryId, number>;

  for (const product of products) {
    const id = categoryIdForName(product.category);
    if (id) {
      counts[id] += 1;
    }
  }

  return counts;
}

function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );
  const filter = useCategoryFilter();

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((all) => {
        if (cancelled) {
          return;
        }
        const visible = all.filter((product) => product.visible);
        setProducts(visible);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        console.error('Failed to load inventory:', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Counts only change when the product list changes, so memoise them.
  const counts = useMemo(() => countByCategory(products), [products]);

  // The actual filtering. Memoised on (products, selection) so toggling a
  // filter never re-scans the list unless something genuinely changed — this
  // keeps things snappy even with a large inventory.
  const filteredProducts = useMemo(() => {
    if (filter.isEmpty) {
      return products;
    }

    return products.filter((product) => {
      const id = categoryIdForName(product.category);
      return id !== undefined && filter.selectedSet.has(id);
    });
  }, [products, filter.isEmpty, filter.selectedSet]);

  return (
    <>
      <PageHeader title="Sortiment">
        Produkterne hentes direkte fra Google Sheets. Test-visning under
        opbygning.
      </PageHeader>

      {status === 'ready' && (
        <CategoryFilterBar
          filter={filter}
          counts={counts}
          totalCount={products.length}
          visibleCount={filteredProducts.length}
        />
      )}

      <section className={`container ${styles.section}`}>
        {status === 'loading' && <p>Indlæser produkter…</p>}
        {status === 'error' && (
          <p>Kunne ikke hente produkter. Prøv igen senere.</p>
        )}
        {status === 'ready' &&
          (filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                Ingen produkter i de valgte kategorier.
              </p>
              <button
                className={styles.emptyButton}
                onClick={filter.clear}
                type="button"
              >
                Ryd filtre
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map((product, index) => (
                <article
                  key={`${product.title}-${index}`}
                  className={`${styles.card} ${
                    product.status === 'Midlertidigt udsolgt'
                      ? styles.soldOut
                      : ''
                  }`}
                >
                  {product.status && (
                    <span
                      className={`${styles.status} ${
                        product.status === 'Nyhed'
                          ? styles.newProduct
                          : product.status === 'Bestillingsvare'
                            ? styles.orderOnly
                            : styles.temporarilySoldOut
                      }`}
                    >
                      {product.status}
                    </span>
                  )}
                  <img
                    className={styles.image}
                    src={product.imageUrl || placeholderImage}
                    alt={product.title}
                    loading="lazy"
                    onError={(event) => {
                      const img = event.currentTarget;
                      if (img.src !== placeholderImage) {
                        img.src = placeholderImage;
                      }
                    }}
                  />
                  <div className={styles.body}>
                    <h2 className={styles.title}>{product.title}</h2>
                    <p className={styles.category}>{product.category}</p>
                    <p className={styles.price}>{product.price}</p>
                    {product.barcode && product.barcode !== '-' && (
                      <p className={styles.barcode}>
                        Stregkode: {product.barcode}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ))}
      </section>
    </>
  );
}

export default CataloguePage;
