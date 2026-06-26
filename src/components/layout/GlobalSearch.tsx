import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useNavigate } from 'react-router-dom';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import { useInventory } from '@/context/InventoryContext';
import {
  defaultVariant,
  groupSlug,
  type ProductGroup,
} from '@/pages/catalogue/inventory';
import { createProductIndex, searchGroups } from '@/pages/catalogue/productSearch';
import styles from './GlobalSearch.module.css';

/** Most results we ever show in the dropdown — keeps it scannable. */
const MAX_RESULTS = 7;

/** Where the "Se hele sortiment" shortcut goes. */
const CATALOGUE_PATH = '/sortiment';

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.icon}
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

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.clearIcon}
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

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.arrowIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <path
        d="M3 8h9M9 4.5 12.5 8 9 11.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Site-wide product search. Available in the header on every page. Focusing the
 * field opens a compact dropdown that shows a few suggestions straight away
 * (the first catalogue entries); as the user types it switches to fuzzy
 * Fuse.js matches. Each row is a thumbnail + title + price and jumps to that
 * product; a subtle footer link leads to the full catalogue.
 */
function GlobalSearch() {
  const navigate = useNavigate();
  const { groups, status } = useInventory();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [compactPlaceholder, setCompactPlaceholder] = useState(false);
  const maxResults = compactPlaceholder ? 5 : MAX_RESULTS;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dismissClickTimeout = useRef<number | null>(null);
  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  // Build the fuzzy index once per catalogue, not per keystroke.
  const index = useMemo(() => createProductIndex(groups), [groups]);

  const trimmed = query.trim();
  const hasQuery = trimmed.length > 0;

  // With a query: fuzzy matches. Without: the first catalogue entries, so the
  // dropdown is useful the moment it opens.
  const results = useMemo(() => {
    const base = hasQuery ? searchGroups(index, trimmed) : groups;
    return base.slice(0, maxResults);
  }, [hasQuery, index, groups, maxResults, trimmed]);

  const showPanel = open;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 720px)');
    const apply = () => setCompactPlaceholder(mediaQuery.matches);

    apply();
    mediaQuery.addEventListener('change', apply);

    return () => mediaQuery.removeEventListener('change', apply);
  }, []);

  // Reset the keyboard cursor whenever the query changes.
  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmed]);

  // Close on outside click.
  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const blockDismissClick = (clickEvent: MouseEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        clickEvent.stopImmediatePropagation();
        document.removeEventListener('click', blockDismissClick, true);
        if (dismissClickTimeout.current !== null) {
          window.clearTimeout(dismissClickTimeout.current);
          dismissClickTimeout.current = null;
        }
      };

      document.addEventListener('click', blockDismissClick, true);
      dismissClickTimeout.current = window.setTimeout(() => {
        document.removeEventListener('click', blockDismissClick, true);
        dismissClickTimeout.current = null;
      }, 500);
      setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [open]);

  useEffect(
    () => () => {
      if (dismissClickTimeout.current !== null) {
        window.clearTimeout(dismissClickTimeout.current);
      }
    },
    [],
  );

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
  };

  const reset = () => {
    setQuery('');
    close();
  };

  const goToGroup = (group: ProductGroup) => {
    navigate(`/sortiment/${groupSlug(group)}`);
    reset();
    inputRef.current?.blur();
  };

  const goToCatalogue = () => {
    navigate(CATALOGUE_PATH);
    reset();
    inputRef.current?.blur();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((current) =>
        results.length === 0 ? -1 : Math.min(current + 1, results.length - 1),
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      const target =
        activeIndex >= 0
          ? results[activeIndex]
          : hasQuery && results.length === 1
            ? results[0]
            : undefined;
      if (target) {
        event.preventDefault();
        goToGroup(target);
      }
      return;
    }

    if (event.key === 'Escape') {
      if (hasQuery) {
        event.preventDefault();
        reset();
      } else {
        close();
      }
    }
  };

  const activeDescendant =
    showPanel && activeIndex >= 0 ? optionId(activeIndex) : undefined;
  const loading = status === 'loading' && groups.length === 0;

  return (
    <div className={styles.root} ref={containerRef}>
      <div
        className={`${styles.field} ${showPanel ? styles.fieldOpen : ''}`}
        role="search"
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          aria-activedescendant={activeDescendant}
          aria-autocomplete="list"
          aria-controls={showPanel ? listboxId : undefined}
          aria-expanded={showPanel}
          aria-label="Søg efter produkter"
          autoComplete="off"
          className={styles.input}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={compactPlaceholder ? 'Søg...' : 'Søg efter produkter…'}
          ref={inputRef}
          role="combobox"
          type="text"
          value={query}
        />
        {hasQuery && (
          <button
            aria-label="Ryd søgning"
            className={styles.clear}
            onClick={() => {
              setQuery('');
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            type="button"
          >
            <CloseIcon />
          </button>
        )}
      </div>

      {showPanel && (
        <div className={styles.panel}>
          {loading ? (
            <p className={styles.hint}>Indlæser produkter…</p>
          ) : hasQuery && results.length === 0 ? (
            <p className={styles.hint}>Ingen produkter matcher “{trimmed}”.</p>
          ) : (
            <ul className={styles.list} id={listboxId} role="listbox">
              {results.map((group, position) => {
                const lead = defaultVariant(group);
                const active = position === activeIndex;
                return (
                  <li key={group.key} role="presentation">
                    <button
                      aria-selected={active}
                      className={`${styles.option} ${
                        active ? styles.optionActive : ''
                      }`}
                      id={optionId(position)}
                      // Pointer-down so the click registers before the input's
                      // blur can tear the panel down.
                      onMouseDown={(event) => {
                        event.preventDefault();
                        goToGroup(group);
                      }}
                      onMouseEnter={() => setActiveIndex(position)}
                      role="option"
                      type="button"
                    >
                      <img
                        alt=""
                        aria-hidden="true"
                        className={styles.thumb}
                        loading="lazy"
                        onError={(event) => {
                          const img = event.currentTarget;
                          if (img.src !== placeholderImage) {
                            img.src = placeholderImage;
                          }
                        }}
                        src={lead.imageUrl || placeholderImage}
                      />
                      <span className={styles.text}>
                        <span className={styles.title}>{group.title}</span>
                        <span className={styles.meta}>
                          <span className={styles.category}>
                            {group.category}
                          </span>
                          <span className={styles.price}>{lead.price}</span>
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <button
            className={styles.allLink}
            onMouseDown={(event) => {
              event.preventDefault();
              goToCatalogue();
            }}
            type="button"
          >
            <span>Se hele sortiment</span>
            <ArrowIcon />
          </button>
        </div>
      )}
    </div>
  );
}

export default GlobalSearch;
