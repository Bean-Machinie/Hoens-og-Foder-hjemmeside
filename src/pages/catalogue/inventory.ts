/**
 * Inventory data loading for the Sortiment page (proof of concept).
 *
 * Loads products from a published Google Sheets CSV, parses each row into a
 * Product object and exposes helpers for image handling. No filtering, sorting
 * or stock logic lives here yet — this is intentionally minimal.
 */

import { slugify } from '@/lib/slug';

export const INVENTORY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1Xr349RUKU7m3k56wXA7pbRNKOvt_mCrJmOwgHEqMt4U/gviz/tq?tqx=out:csv&sheet=Items';

export interface Product {
  title: string;
  category: string;
  barcode: string;
  description: string;
  price: string;
  status: ProductStatus;
  visible: boolean;
  imageUrl: string;
  /** Shared group name from the sheet's "Variantgruppe" column. '' = no group. */
  variantGroup: string;
  /** This row's variant label from the sheet's "Variant" column, e.g. "8 mm". */
  variant: string;
}

export function productSlug(product: Product): string {
  return slugify(product.title);
}

export function findProductBySlug(
  products: Product[],
  slug: string,
): Product | undefined {
  return products.find((product) => productSlug(product) === slug);
}

/**
 * A catalogue entry as shown to the customer. A "group" bundles several sheet
 * rows that share the same Variantgruppe (e.g. the same product in different
 * sizes); a normal product is just a group with a single variant.
 */
export interface ProductGroup {
  /** Stable key, unique per catalogue entry. */
  key: string;
  /** Title shown on the card / detail page. */
  title: string;
  /** Website category (shared by all variants in the group). */
  category: string;
  /** Variants, sorted ascending by their numeric size where possible. */
  variants: Product[];
  /** True when this entry offers a choice of variants (2+ variants). */
  isGrouped: boolean;
}

/** Parse a Danish price string ("1.299,00 DKK") into a number for comparison. */
export function parsePriceValue(price: string): number {
  const cleaned = price
    .replace(/[^\d.,]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

/** Leading number in a variant label ("12 mm" -> 12), for numeric sorting. */
function variantSortValue(variant: string): number {
  const match = variant.replace(',', '.').match(/-?\d+(\.\d+)?/);
  return match ? Number.parseFloat(match[0]) : Number.POSITIVE_INFINITY;
}

function isInStock(product: Product): boolean {
  return product.status !== 'Midlertidigt udsolgt';
}

/**
 * The variant a group should default to: the cheapest in-stock variant, or - if
 * every variant is sold out - simply the cheapest one.
 */
export function defaultVariant(group: ProductGroup): Product {
  const inStock = group.variants.filter(isInStock);
  const pool = inStock.length > 0 ? inStock : group.variants;
  return pool.reduce((cheapest, current) =>
    parsePriceValue(current.price) < parsePriceValue(cheapest.price)
      ? current
      : cheapest,
  );
}

export function groupSlug(group: ProductGroup): string {
  return slugify(group.title);
}

/**
 * Collapse a flat product list into catalogue entries. Rows sharing a non-empty
 * Variantgruppe become one grouped entry; everything else stays standalone.
 * First-seen order is preserved so the catalogue ordering is stable.
 */
export function groupProducts(products: Product[]): ProductGroup[] {
  const byGroup = new Map<string, Product[]>();
  const order: string[] = [];

  products.forEach((product, index) => {
    const groupName = product.variantGroup.trim();
    const key = groupName ? `g:${groupName}` : `s:${index}:${product.title}`;
    if (!byGroup.has(key)) {
      byGroup.set(key, []);
      order.push(key);
    }
    byGroup.get(key)!.push(product);
  });

  return order.map((key) => {
    const variants = byGroup.get(key)!;
    const grouped = key.startsWith('g:') && variants.length >= 2;
    const sorted = grouped
      ? [...variants].sort(
          (a, b) => variantSortValue(a.variant) - variantSortValue(b.variant),
        )
      : variants;
    const groupName = variants[0].variantGroup.trim();

    return {
      key,
      title: grouped && groupName ? groupName : variants[0].title,
      category: variants[0].category,
      variants: sorted,
      isGrouped: grouped,
    };
  });
}

export function findGroupBySlug(
  groups: ProductGroup[],
  slug: string,
): ProductGroup | undefined {
  return groups.find((group) => groupSlug(group) === slug);
}

export type ProductStatus =
  | 'Nyhed'
  | 'Bestillingsvare'
  | 'Midlertidigt udsolgt'
  | 'Flere Varianter'
  | '';

export function toWebsiteCategory(sheetCategory: string): string {
  return sheetCategory.trim();
}

export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') {
        i += 1;
      }
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ''));
  if (nonEmpty.length === 0) {
    return [];
  }

  const headers = nonEmpty[0].map((h) => h.trim());
  return nonEmpty.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = (cells[index] ?? '').trim();
    });
    return record;
  });
}

export function toDirectImageUrl(url: string): string {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return '';
  }

  const markdownMatch = trimmedUrl.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/);
  const imageUrl = markdownMatch?.[1] ?? trimmedUrl;

  const fileMatch = imageUrl.match(/\/file\/d\/([^/]+)/);
  const queryMatch = imageUrl.match(/[?&]id=([^&]+)/);
  const fileId = fileMatch?.[1] ?? queryMatch?.[1];

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return imageUrl;
}

function toBoolean(value: string): boolean {
  return value.trim().toUpperCase() === 'TRUE';
}

function toProductStatus(value: string): ProductStatus {
  const normalized = value.trim().toLocaleLowerCase('da-DK');
  const statuses: Record<string, ProductStatus> = {
    nyhed: 'Nyhed',
    bestillingsvare: 'Bestillingsvare',
    'midlertidigt udsolgt': 'Midlertidigt udsolgt',
    'flere varianter': 'Flere Varianter',
  };

  return statuses[normalized] ?? '';
}

export async function fetchProducts(): Promise<Product[]> {
  const url = `${INVENTORY_CSV_URL}&_cb=${Date.now()}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load inventory CSV: ${response.status}`);
  }

  const csv = await response.text();
  return parseCsv(csv).map((row) => ({
    title: row.Navn ?? '',
    category: toWebsiteCategory(row.Kategori ?? ''),
    barcode: row.Stregkode ?? '',
    price: row.Pris ?? '',
    description: row.Beskrivelse ?? '',
    status: toProductStatus(row.Status ?? ''),
    visible: toBoolean(row.Synlighed ?? ''),
    imageUrl: toDirectImageUrl(row.imageUrl ?? ''),
    variantGroup: row.Variantgruppe ?? '',
    variant: row.Variant ?? '',
  }));
}
