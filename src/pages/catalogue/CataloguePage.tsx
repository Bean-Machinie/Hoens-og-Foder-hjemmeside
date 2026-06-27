import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import {
  CATEGORY_IDS,
  categoryIdForName,
  type CategoryId,
} from '@/config/categories';
import {
  cardStatuses,
  defaultVariant,
  groupSlug,
  type ProductGroup,
  type ProductStatus,
} from './inventory';
import { useInventory } from '@/context/InventoryContext';
import { useCategoryFilter } from './useCategoryFilter';
import CategoryFilterBar from './CategoryFilterBar';
import FilterBarSkeleton from './FilterBarSkeleton';
import styles from './CataloguePage.module.css';

/** Number of placeholder cards shown while the inventory is loading. */
const SKELETON_COUNT = 8;

/** Module class for a non-"Nyhed" badge (those sit in the top-right stack). */
function cardBadgeClass(status: ProductStatus): string {
  if (status === 'Bestillingsvare') {
    return styles.orderOnly;
  }
  if (status === 'Flere Varianter') {
    return styles.multipleVariants;
  }
  return styles.temporarilySoldOut;
}

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
  // Inventory is loaded once, app-wide, and shared via context.
  const { groups, status } = useInventory();
  const location = useLocation();
  const filter = useCategoryFilter();
  const catalogueHref = `${location.pathname}${location.search}`;

  // Counts only change when the catalogue entries change, so memoise them.
  const counts = useMemo(() => countByCategory(groups), [groups]);

  // The actual filtering. Memoised on (groups, selection) so toggling a filter
  // never re-scans the list unless something genuinely changed.
  const filteredGroups = useMemo(() => {
    if (filter.isEmpty) {
      return groups;
    }

    return groups.filter((group) => {
      const id = categoryIdForName(group.category);
      return id !== undefined && filter.selectedSet.has(id);
    });
  }, [groups, filter.isEmpty, filter.selectedSet]);

  return (
    <div className={styles.page}>
      {status === 'loading' && <FilterBarSkeleton />}

      {status === 'ready' && (
        <CategoryFilterBar
          filter={filter}
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
              {filteredGroups.map((group) => {
                // The cheapest in-stock variant drives the card: its image,
                // its (lowest) price, and its status badges.
                const lead = defaultVariant(group);
                // A card can show several badges at once (e.g. "Nyhed" and
                // "Flere Varianter"). "Nyhed" is pinned to the top-left corner;
                // any other badges stack in the top-right corner.
                const statuses = cardStatuses(group, lead);
                const showNew = statuses.includes('Nyhed');
                const otherStatuses = statuses.filter((s) => s !== 'Nyhed');
                const soldOut = lead.statuses.includes('Midlertidigt udsolgt');

                return (
                  <Link
                    key={group.key}
                    to={`/sortiment/${groupSlug(group)}`}
                    state={{ catalogueHref, fromCatalogue: true, backDelta: -1 }}
                    className={styles.cardLink}
                    aria-label={group.title}
                  >
                    <article
                      className={`${styles.card} ${
                        soldOut ? styles.soldOut : ''
                      }`}
                    >
                      {showNew && (
                        <span className={`${styles.status} ${styles.newProduct}`}>
                          Nyhed
                        </span>
                      )}
                      {otherStatuses.length > 0 && (
                        <div className={styles.statusStack}>
                          {otherStatuses.map((s) => (
                            <span
                              key={s}
                              className={`${styles.status} ${cardBadgeClass(s)}`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
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
    </div>
  );
}

export default CataloguePage;
