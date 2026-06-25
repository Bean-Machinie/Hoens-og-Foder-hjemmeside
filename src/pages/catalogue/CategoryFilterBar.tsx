import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  PRODUCT_CATEGORIES,
  type CategoryId,
} from '@/config/categories';
import type { CategoryFilter } from './useCategoryFilter';
import type { ProductSearch } from './useProductSearch';
import styles from './CategoryFilterBar.module.css';

interface CategoryFilterBarProps {
  filter: CategoryFilter;
  search: ProductSearch;
  /** Number of products in each category (across all visible products). */
  counts: Record<CategoryId, number>;
  /** Total products available (before filtering). */
  totalCount: number;
  /** Products currently shown (after filtering). */
  visibleCount: number;
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.checkIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <path
        d="M13.5 4.5 6.5 11.5 2.5 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.closeIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <path
        d="M4 4 12 12 M12 4 4 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FunnelIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.funnelIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <path
        d="M1.5 2.5h13l-5 6v4l-3 1.5V8.5l-5-6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.searchIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <circle
        cx="7"
        cy="7"
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="m11 11 3.5 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryFilterBar({
  filter,
  search,
  counts,
  totalCount,
  visibleCount,
}: CategoryFilterBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const menuId = useId();
  const searchId = useId();

  const activeCount = filter.selected.length;

  // Close on outside click and on Escape; return focus to the trigger so
  // keyboard users aren't stranded.
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const closeAndRefocus = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndRefocus();
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape' && search.query) {
      event.preventDefault();
      search.clear();
    }
  };

  return (
    <div className={styles.bar}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.controls} ref={containerRef}>
          <button
            aria-controls={open ? menuId : undefined}
            aria-expanded={open}
            aria-haspopup="menu"
            className={`${styles.trigger} ${open ? styles.triggerOpen : ''} ${
              activeCount > 0 ? styles.triggerActive : ''
            }`}
            onClick={() => setOpen((value) => !value)}
            ref={triggerRef}
            type="button"
          >
            <FunnelIcon />
            <span>Filtrér</span>
            {activeCount > 0 && (
              <span className={styles.badge}>{activeCount}</span>
            )}
            <span aria-hidden="true" className={styles.caret} />
          </button>

          {open && (
            <div
              aria-label="Filtrér på kategori"
              className={styles.menu}
              id={menuId}
              onKeyDown={handleMenuKeyDown}
              role="menu"
            >
              <div className={styles.menuHead}>
                <span className={styles.menuTitle}>Kategorier</span>
                <button
                  className={styles.clearLink}
                  disabled={filter.isEmpty}
                  onClick={filter.clear}
                  type="button"
                >
                  Ryd alt
                </button>
              </div>

              <ul className={styles.options}>
                {PRODUCT_CATEGORIES.map((category) => {
                  const count = counts[category.id] ?? 0;
                  const checked = filter.isSelected(category.id);
                  const disabled = count === 0 && !checked;

                  return (
                    <li key={category.id}>
                      <button
                        aria-checked={checked}
                        className={`${styles.option} ${
                          checked ? styles.optionChecked : ''
                        }`}
                        disabled={disabled}
                        onClick={() => filter.toggle(category.id)}
                        role="menuitemcheckbox"
                        type="button"
                      >
                        <span className={styles.checkbox} aria-hidden="true">
                          {checked && <CheckIcon />}
                        </span>
                        <span className={styles.optionLabel}>
                          {category.name}
                        </span>
                        <span className={styles.optionCount}>{count}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Free-text fuzzy search. Replaces the old removable-chip row: the
            active-filter count now lives on the trigger badge, which frees this
            space for a far more useful search field. */}
        <div className={styles.search} role="search">
          <label className="sr-only" htmlFor={searchId}>
            Søg i produkter
          </label>
          <span className={styles.searchIconWrap} aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            className={styles.searchInput}
            id={searchId}
            onChange={(event) => search.setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Søg – navn, farve, type, størrelse …"
            ref={searchInputRef}
            type="search"
            value={search.query}
          />
          {search.query && (
            <button
              aria-label="Ryd søgning"
              className={styles.searchClear}
              onClick={() => {
                search.clear();
                searchInputRef.current?.focus();
              }}
              type="button"
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <p className={styles.count}>
          {filter.isEmpty && search.isEmpty
            ? `${totalCount} produkter`
            : `${visibleCount} af ${totalCount} produkter`}
        </p>
      </div>
    </div>
  );
}

export default CategoryFilterBar;
