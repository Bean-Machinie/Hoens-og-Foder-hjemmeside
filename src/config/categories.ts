import diverseImage from '@/assets/images/categories/diverse.webp';
import foderImage from '@/assets/images/categories/foder.webp';
import hundImage from '@/assets/images/categories/hund.webp';
import hoensImage from '@/assets/images/categories/høns.webp';
import kaninImage from '@/assets/images/categories/Kanin.png';
import staldImage from '@/assets/images/categories/stald.webp';
import sundhedImage from '@/assets/images/categories/sundhed.webp';
import udstyrImage from '@/assets/images/categories/udstyr.webp';
import vildtfugleImage from '@/assets/images/categories/vildtfugle.webp';

export interface ProductCategory {
  id: string;
  name: string;
  href: string;
  image: string;
}

/**
 * Shared product categories used across navigation, carousels and catalogue pages.
 * Keep category names and links centralized here to avoid duplicated website copy.
 *
 * These are the exact categories used in the Google Sheet's "Kategori" column.
 */
export const PRODUCT_CATEGORIES = [
  { id: 'hoens', name: 'Høns', href: '/sortiment?kategori=hoens', image: hoensImage },
  { id: 'foder', name: 'Foder', href: '/sortiment?kategori=foder', image: foderImage },
  {
    id: 'udstyr',
    name: 'Udstyr',
    href: '/sortiment?kategori=udstyr',
    image: udstyrImage,
  },
  {
    id: 'sundhed',
    name: 'Sundhed',
    href: '/sortiment?kategori=sundhed',
    image: sundhedImage,
  },
  {
    id: 'stald',
    name: 'Stald',
    href: '/sortiment?kategori=stald',
    image: staldImage,
  },
  {
    id: 'kanin-smadyr',
    name: 'Kanin & smådyr',
    href: '/sortiment?kategori=kanin-smadyr',
    image: kaninImage,
  },
  {
    id: 'diverse',
    name: 'Diverse',
    href: '/sortiment?kategori=diverse',
    image: diverseImage,
  },
  {
    id: 'vildtfugle',
    name: 'Vildtfugle',
    href: '/sortiment?kategori=vildtfugle',
    image: vildtfugleImage,
  },
  {
    id: 'hund-kat',
    name: 'Hund & Kat',
    href: '/sortiment?kategori=hund-kat',
    image: hundImage,
  },
] as const satisfies readonly ProductCategory[];

/** A category id as used in URLs and filter state (e.g. "hoens", "foder"). */
export type CategoryId = (typeof PRODUCT_CATEGORIES)[number]['id'];

/** Ordered list of every valid category id — drives the filter UI order. */
export const CATEGORY_IDS = PRODUCT_CATEGORIES.map(
  (category) => category.id,
) as CategoryId[];

const CATEGORY_BY_ID = new Map<string, ProductCategory>(
  PRODUCT_CATEGORIES.map((category) => [category.id, category]),
);

const CATEGORY_ID_BY_NAME = new Map<string, CategoryId>(
  PRODUCT_CATEGORIES.map((category) => [category.name, category.id]),
);

/** Look up a category by its id, or undefined if the id is unknown. */
export function getCategoryById(id: string): ProductCategory | undefined {
  return CATEGORY_BY_ID.get(id);
}

/** Type guard: is this string one of our known category ids? */
export function isCategoryId(value: string): value is CategoryId {
  return CATEGORY_BY_ID.has(value);
}

/**
 * Map an exact category display name from the sheet (e.g. "Høns") back to its
 * url id (e.g. "hoens"). Returns undefined for unknown category names.
 */
export function categoryIdForName(name: string): CategoryId | undefined {
  return CATEGORY_ID_BY_NAME.get(name);
}
