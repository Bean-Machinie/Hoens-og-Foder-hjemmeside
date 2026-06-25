/**
 * Fuzzy product search for the Sortiment page.
 *
 * Built on Fuse.js (https://www.fusejs.io) — a small, dependency-free,
 * well-maintained fuzzy-matching library. We deliberately don't roll our own:
 * Fuse already solves typo tolerance, weighted multi-field ranking and
 * relevance scoring far better than anything hand-written.
 *
 * The search is intentionally *forgiving*. A shopper can type a slightly
 * misspelled product name ("sussux"), a colour or material mentioned only in
 * the description ("hvid", "gylden"), a variant size ("8 mm"), a category
 * ("foder") or a price — and still land on the right card. Each whitespace
 * separated word is matched independently and combined with AND semantics, so
 * "hvid høne" narrows to entries matching *both* terms across *any* field.
 */

import Fuse, { type IFuseOptions } from 'fuse.js';
import type { ProductGroup } from './inventory';

/**
 * Fuse options tuned for a small catalogue of physical products.
 *
 * - `threshold: 0.4` keeps matching forgiving enough to absorb a typo or two
 *   without drowning the user in irrelevant hits.
 * - `ignoreLocation: true` means a match counts wherever it appears in the
 *   text, not just near the start — essential when searching long descriptions.
 * - `keys` are weighted so a hit in the product title outranks a hit buried in
 *   a description, which matches what shoppers expect.
 */
const FUSE_OPTIONS: IFuseOptions<ProductGroup> = {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.45 },
    { name: 'category', weight: 0.2 },
    { name: 'variants.variant', weight: 0.15 },
    { name: 'variants.description', weight: 0.12 },
    { name: 'variants.status', weight: 0.05 },
    { name: 'variants.price', weight: 0.03 },
  ],
};

/** Build a reusable Fuse index over the catalogue entries. */
export function createProductIndex(groups: ProductGroup[]): Fuse<ProductGroup> {
  return new Fuse(groups, FUSE_OPTIONS);
}

/** Split a raw query into meaningful, lowercased search tokens. */
function tokenize(query: string): string[] {
  return query
    .trim()
    .toLocaleLowerCase('da-DK')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Run a forgiving, multi-word fuzzy search and return the matching catalogue
 * entries ordered by relevance (best match first).
 *
 * Every token must match (AND), but each token is matched fuzzily and across
 * all fields independently — so word order and field don't matter. When the
 * query is empty the original list is returned untouched, preserving the
 * catalogue's natural ordering.
 */
export function searchGroups(
  index: Fuse<ProductGroup>,
  groups: ProductGroup[],
  query: string,
): ProductGroup[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return groups;
  }

  // Accumulate, per catalogue entry, the summed Fuse score across every token.
  // A lower score is a better match in Fuse, so we keep adding and sort
  // ascending at the end. An entry survives only if it matched *all* tokens.
  let surviving: Map<ProductGroup, number> | null = null;

  for (const token of tokens) {
    const hits = index.search(token);
    const scoreByGroup = new Map<ProductGroup, number>();
    for (const hit of hits) {
      scoreByGroup.set(hit.item, hit.score ?? 1);
    }

    if (surviving === null) {
      surviving = scoreByGroup;
      continue;
    }

    const intersection = new Map<ProductGroup, number>();
    for (const [group, accumulated] of surviving) {
      const tokenScore = scoreByGroup.get(group);
      if (tokenScore !== undefined) {
        intersection.set(group, accumulated + tokenScore);
      }
    }
    surviving = intersection;
  }

  if (!surviving) {
    return [];
  }

  return [...surviving.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([group]) => group);
}
