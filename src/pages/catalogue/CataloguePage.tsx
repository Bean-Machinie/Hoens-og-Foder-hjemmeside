import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import {
  CATEGORY_IDS,
  categoryIdForName,
  type CategoryId,
} from '@/config/categories';
import {
  defaultVariant,
  fetchProducts,
  groupProducts,
  groupSlug,
  type Product,
  type ProductGroup,
} from './inventory';
import { useCategoryFilter } from './useCategoryFilter';
import { useProductSearch } from './useProductSearch';
import { createProductIndex, searchGroups } from './productSearch';
import CategoryFilterBar from './CategoryFilterBar';
import FilterBarSkeleton from './FilterBarSkeleton';
import styles from './CataloguePage.module.css';

/** Number of placeholder cards shown while the inventory is loading. */
const SKELETON_COUNT = 8;

/** Build a { categoryId: count } map across all catalogue entries (groups). */
function countByCategory(groups: ProductGroup[]): Record<CategoryId, number> {
  const counts = Object.fromEntries(
    CATEGORY_IDS.map((id) => [id, 0]),
  ) as Record<CategoryId, number>;

  for (const group of groups) {
    const id = categoryIdForName(group.category);
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
  const search = useProductSearch();

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

  // Collapse variant rows into catalogue entries. Only recompute when the
  // underlying product list changes.
  const groups = useMemo(() => groupProducts(products), [products]);

  // Counts only change when the catalogue entries change, so memoise them.
  const counts = useMemo(() => countByCategory(groups), [groups]);

  // Build the fuzzy-search index once per catalogue, not on every keystroke.
  const searchIndex = useMemo(() => createProductIndex(groups), [groups]);

  // The actual filtering. First apply the free-text fuzzy search (which also
  // orders results by relevance), then narrow by the selected categories. Both
  // steps are skipped when inactive, so the natural catalogue order is kept.
  const filteredGroups = useMemo(() => {
    const searched = search.isEmpty
      ? groups
      : searchGroups(searchIndex, groups, search.query);

    if (filter.isEmpty) {
      return searched;
    }

    return searched.filter((group) => {
      const id = categoryIdForName(group.category);
      return id !== undefined && filter.selectedSet.has(id);
    });
  }, [
    groups,
    searchIndex,
    search.isEmpty,
    search.query,
    filter.isEmpty,
    filter.selectedSet,
  ]);

  return (
    <>
      {status === 'loading' && <FilterBarSkeleton />}

      {status === 'ready' && (
        <CategoryFilterBar
          filter={filter}
          search={search}
          counts={counts}
          totalCount={groups.length}
          visibleCount={filteredGroups.length}
        />
      )}

      <section className={`container ${styles.section}`}>
        {status === 'loading' && (
          <div className={styles.grid} aria-hidden="true">
            {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
              <article
                key={`skeleton-${index}`}
                className={`${styles.card} ${styles.skeletonCard}`}
              >
                <div className={`${styles.image} ${styles.skeleton}`} />
                <div className={styles.body}>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonTitle}`}
                  />
                  <div
                    className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonCategory}`}
                  />
                  <div
                    className={`${styles.skeleton} ${styles.skeletonLine} ${styles.skeletonPrice}`}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
        {status === 'error' && (
          <p>Kunne ikke hente produkter. Prøv igen senere.</p>
        )}
        {status === 'ready' &&
          (filteredGroups.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                {!search.isEmpty
                  ? `Ingen produkter matcher “${search.query.trim()}”.`
                  : 'Ingen produkter i de valgte kategorier.'}
              </p>
              <button
                className={styles.emptyButton}
                onClick={() => {
                  filter.clear();
                  search.clear();
                }}
                type="button"
              >
                Ryd filtre
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredGroups.map((group) => {
                // The cheapest in-stock variant drives the card: its image,
                // its (lowest) price, and its status badge.
                const lead = defaultVariant(group);
                // If any row in the group is flagged "Flere Varianter", that
                // badge takes priority; otherwise the lead variant's status.
                const cardStatus = group.variants.some(
                  (v) => v.status === 'Flere Varianter',
                )
                  ? 'Flere Varianter'
                  : lead.status;

                return (
                  <Link
                    key={group.key}
                    to={`/sortiment/${groupSlug(group)}`}
                    className={styles.cardLink}
                    aria-label={group.title}
                  >
                    <article
                      className={`${styles.card} ${
                        lead.status === 'Midlertidigt udsolgt'
                          ? styles.soldOut
                          : ''
                      }`}
                    >
                      {cardStatus && (
                        <span
                          className={`${styles.status} ${
                            cardStatus === 'Nyhed'
                              ? styles.newProduct
                              : cardStatus === 'Bestillingsvare'
                                ? styles.orderOnly
                                : cardStatus === 'Flere Varianter'
                                  ? styles.multipleVariants
                                  : styles.temporarilySoldOut
                          }`}
                        >
                          {cardStatus}
                        </span>
                      )}
                      <img
                        className={styles.image}
                        src={lead.imageUrl || placeholderImage}
                        alt={group.title}
                        loading="lazy"
                        onError={(event) => {
                          const img = event.currentTarget;
                          if (img.src !== placeholderImage) {
                            img.src = placeholderImage;
                          }
                        }}
                      />
                      <div className={styles.body}>
                        <h2 className={styles.title}>{group.title}</h2>
                        <p className={styles.category}>{group.category}</p>
                        <p className={styles.price}>{lead.price}</p>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          ))}
      </section>
    </>
  );
}

export default CataloguePage;
