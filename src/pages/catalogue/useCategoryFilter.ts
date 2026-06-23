import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CATEGORY_IDS,
  type CategoryId,
  isCategoryId,
} from '@/config/categories';

/**
 * The URL search-param key that holds the active category filter.
 * Multiple categories are comma-separated, e.g. "?kategori=hoens,foder".
 */
export const CATEGORY_PARAM = 'kategori';

export interface CategoryFilter {
  /** Currently selected category ids, in canonical (config) order. */
  selected: CategoryId[];
  /** Fast membership lookups without scanning the array. */
  selectedSet: ReadonlySet<CategoryId>;
  /** True when no category is selected (i.e. "show everything"). */
  isEmpty: boolean;
  isSelected: (id: CategoryId) => boolean;
  /** Flip a single category on/off, preserving the rest. */
  toggle: (id: CategoryId) => void;
  /** Replace the whole selection with just this one category. */
  setOnly: (id: CategoryId) => void;
  /** Clear every category (back to showing everything). */
  clear: () => void;
}

/** Serialize selected ids in canonical order for a stable, tidy URL. */
function serialize(ids: Iterable<CategoryId>): string {
  const set = new Set(ids);
  return CATEGORY_IDS.filter((id) => set.has(id)).join(',');
}

/**
 * Single source of truth for the catalogue category filter, backed entirely by
 * the URL query string. Keeping the state in the URL (rather than component
 * state) means deep links from the home page and the nav menu, the browser
 * back/forward buttons, sharing and refreshing all "just work" for free.
 */
export function useCategoryFilter(): CategoryFilter {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse + sanitise the raw param into known ids only. Unknown or duplicate
  // values are silently dropped so a hand-edited URL can never break the page.
  const selected = useMemo<CategoryId[]>(() => {
    const raw = searchParams.get(CATEGORY_PARAM);
    if (!raw) {
      return [];
    }

    const found = new Set<CategoryId>();
    for (const part of raw.split(',')) {
      const id = part.trim();
      if (isCategoryId(id)) {
        found.add(id);
      }
    }

    return CATEGORY_IDS.filter((id) => found.has(id));
  }, [searchParams]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const commit = useCallback(
    (ids: Iterable<CategoryId>) => {
      const value = serialize(ids);
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (value) {
            next.set(CATEGORY_PARAM, value);
          } else {
            next.delete(CATEGORY_PARAM);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const toggle = useCallback(
    (id: CategoryId) => {
      const next = new Set(selectedSet);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      commit(next);
    },
    [commit, selectedSet],
  );

  const setOnly = useCallback((id: CategoryId) => commit([id]), [commit]);

  const clear = useCallback(() => commit([]), [commit]);

  const isSelected = useCallback(
    (id: CategoryId) => selectedSet.has(id),
    [selectedSet],
  );

  return {
    selected,
    selectedSet,
    isEmpty: selected.length === 0,
    isSelected,
    toggle,
    setOnly,
    clear,
  };
}
