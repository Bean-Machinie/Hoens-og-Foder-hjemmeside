/**
 * Product search for the catalogue / header search.
 *
 * This is a hybrid matcher tuned to feel "smart" on a small shop catalogue:
 *
 *   1. Direct matching first — normalized substring & word-prefix matching
 *      across the title, category and every variant's text. This is what makes
 *      short and partial queries work: typing "h" returns everything that
 *      contains an "h", "høn" returns the hens, "20" finds 20 mm, etc.
 *   2. Fuzzy fallback — only when a word has no direct hit do we fall back to
 *      Fuse.js, which absorbs typos ("sussux" -> "Sussex").
 *
 * Results are ranked so the most relevant matches (title prefix > title word >
 * title substring > category > anywhere > fuzzy) float to the top, and every
 * search word must match somewhere (AND semantics) for a product to show.
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { ProductGroup } from './inventory';

const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

/** Lowercase, fold Danish letters and strip diacritics for forgiving matching. */
function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '');
}

interface IndexedEntry {
  group: ProductGroup;
  /** Original catalogue order, used as a stable tie-breaker. */
  order: number;
  /** Normalized product title. */
  title: string;
  /** Title split into normalized words, for fast prefix checks. */
  titleWords: string[];
  /** Normalized website category. */
  category: string;
  /** Everything searchable about the product, normalized and concatenated. */
  haystack: string;
}

/** Fuse is only used for typo tolerance, so keep it forgiving. */
const FUSE_OPTIONS: IFuseOptions<ProductGroup> = {
  includeScore: true,
  threshold: 0.42,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'category', weight: 0.2 },
    { name: 'variants.variant', weight: 0.15 },
    { name: 'variants.description', weight: 0.1 },
    { name: 'variants.status', weight: 0.05 },
  ],
};

export interface ProductSearchIndex {
  fuse: Fuse<ProductGroup>;
  entries: IndexedEntry[];
}

/** Build a reusable search index over the catalogue entries. */
export function createProductIndex(groups: ProductGroup[]): ProductSearchIndex {
  const entries: IndexedEntry[] = groups.map((group, order) => {
    const variantText = group.variants
      .map(
        (variant) =>
          `${variant.variant} ${variant.description} ${variant.status} ${variant.price}`,
      )
      .join(' ');

    const title = normalize(group.title);
    const category = normalize(group.category);
    const haystack = normalize(
      `${group.title} ${group.category} ${variantText}`,
    );

    return {
      group,
      order,
      title,
      titleWords: title.split(/\s+/).filter(Boolean),
      category,
      haystack,
    };
  });

  return { fuse: new Fuse(groups, FUSE_OPTIONS), entries };
}

/**
 * Score a single search word against one entry by direct matching.
 * Returns 0 when there is no direct (non-fuzzy) hit anywhere.
 */
function directScore(token: string, entry: IndexedEntry): number {
  if (entry.title === token) {
    return 120;
  }
  if (entry.title.startsWith(token)) {
    return 100;
  }
  if (entry.titleWords.some((word) => word.startsWith(token))) {
    return 80;
  }
  if (entry.title.includes(token)) {
    return 60;
  }
  if (entry.category.startsWith(token)) {
    return 50;
  }
  if (entry.category.includes(token)) {
    return 40;
  }
  if (entry.haystack.includes(token)) {
    return 20;
  }
  return 0;
}

/**
 * Run the hybrid search and return matching catalogue entries, best first.
 * An empty query returns everything in catalogue order.
 */
export function searchGroups(
  index: ProductSearchIndex,
  query: string,
): ProductGroup[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return index.entries.map((entry) => entry.group);
  }

  // For each word, precompute Fuse's fuzzy matches once. Only consulted when a
  // word has no direct hit on a given product, so typos still resolve.
  const fuzzyByToken = tokens.map((token) => {
    const map = new Map<ProductGroup, number>();
    if (token.length >= 2) {
      for (const hit of index.fuse.search(token)) {
        map.set(hit.item, hit.score ?? 1);
      }
    }
    return map;
  });

  const scored: { group: ProductGroup; score: number; order: number }[] = [];

  for (const entry of index.entries) {
    let total = 0;
    let matchedEveryToken = true;

    for (let i = 0; i < tokens.length; i += 1) {
      let tokenScore = directScore(tokens[i], entry);

      if (tokenScore === 0) {
        const fuzzy = fuzzyByToken[i].get(entry.group);
        if (fuzzy === undefined) {
          matchedEveryToken = false;
          break;
        }
        // Map a Fuse score (0 = perfect, ~0.42 = worst kept) to a small
        // positive value that always ranks below any direct hit.
        tokenScore = Math.max(1, 16 - fuzzy * 20);
      }

      total += tokenScore;
    }

    if (matchedEveryToken) {
      scored.push({ group: entry.group, score: total, order: entry.order });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.order - b.order);
  return scored.map((item) => item.group);
}
