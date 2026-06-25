import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * The URL search-param key that holds the free-text search query,
 * e.g. "?sog=hvid+sussex". Kept in the URL — exactly like the category filter —
 * so deep links, browser back/forward, sharing and refreshing all keep the
 * search box in sync for free.
 */
export const SEARCH_PARAM = 'sog';

export interface ProductSearch {
  /** The raw query as typed (may include trailing spaces while typing). */
  query: string;
  /** True when there is no meaningful query to search on. */
  isEmpty: boolean;
  /** Replace the current query. Empty/whitespace removes the param entirely. */
  setQuery: (value: string) => void;
  /** Clear the search box. */
  clear: () => void;
}

/**
 * Single source of truth for the catalogue free-text search, backed by the URL
 * query string. Mirrors useCategoryFilter so both filters compose cleanly.
 */
export function useProductSearch(): ProductSearch {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get(SEARCH_PARAM) ?? '';

  const setQuery = useCallback(
    (value: string) => {
      setSearchParams(
        (params) => {
          const next = new URLSearchParams(params);
          if (value.trim()) {
            next.set(SEARCH_PARAM, value);
          } else {
            next.delete(SEARCH_PARAM);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const clear = useCallback(() => setQuery(''), [setQuery]);

  return useMemo(
    () => ({
      query,
      isEmpty: query.trim() === '',
      setQuery,
      clear,
    }),
    [query, setQuery, clear],
  );
}
