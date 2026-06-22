/**
 * Inventory data loading for the Sortiment page (proof of concept).
 *
 * Loads products from a published Google Sheets CSV, parses each row into a
 * Product object and exposes helpers for image handling. No filtering, sorting
 * or stock logic lives here yet — this is intentionally minimal.
 */

/** Published Google Sheets CSV (File → Share → Publish to web → CSV). */
export const INVENTORY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRA8r74-ifqfq6h7tAbu7g-VqR08qY5QlAN-2bxgOVE-cnMebEYstBWSs9LJChhu55NlXbbR-uVF_L7/pub?output=csv';

export interface Product {
  title: string;
  category: string;
  barcode: string;
  description: string;
  price: string;
  status: ProductStatus;
  visible: boolean;
  imageUrl: string;
}

export type ProductStatus =
  | 'Nyhed'
  | 'Bestillingsvare'
  | 'Midlertidigt udsolgt'
  | '';

const WEBSITE_CATEGORY_BY_SHEET_CATEGORY: Record<string, string> = {
  'HØNS - FODER': 'Foder',
  'HØNS - SUNDHED': 'Sundhed',
  'HØNS - UDSTYR': 'Udstyr',
  'HØNS - TRIVSEL': 'Trivsel',
  'HØNS - STALD': 'Stald',
  'TILBEHØR - FODER': 'Udstyr',
  'HØNS - DIVERSE': 'Diverse',
  'TILBEHØR - STALD': 'Stald',
  'VILDTFUGLE - TILBEHØR': 'Vildtfugle',
  'VILDTFUGLE - FODER': 'Vildtfugle',
  HØNS: 'Høns',
  GNAVER: 'Diverse',
  HANE: 'Høns',
  KYLLINGER: 'Høns',
  DIVERSE: 'Diverse',
};

export function toWebsiteCategory(sheetCategory: string): string {
  const normalized = sheetCategory.trim().toLocaleUpperCase('da-DK');
  return WEBSITE_CATEGORY_BY_SHEET_CATEGORY[normalized] ?? 'Diverse';
}

/**
 * Parse a CSV string into an array of row objects keyed by the header row.
 * Handles quoted fields (which may contain commas, e.g. "119,00 DKK").
 */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'; // escaped quote
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
      // Commit field/row on a line break, swallowing \r\n pairs.
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

  // Flush the trailing field/row if the file doesn't end with a newline.
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

/**
 * Convert a Google Drive share URL into a direct, embeddable image URL.
 * Returns other URLs unchanged. Empty input returns an empty string.
 *
 * Supported share formats:
 *   https://drive.google.com/file/d/FILE_ID/view?usp=...
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID
 */
export function toDirectImageUrl(url: string): string {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return '';
  }

  // Also accept a URL pasted as a Markdown link: [URL](URL).
  const markdownMatch = trimmedUrl.match(/^\[[^\]]*\]\((https?:\/\/[^)]+)\)$/);
  const imageUrl = markdownMatch?.[1] ?? trimmedUrl;

  const fileMatch = imageUrl.match(/\/file\/d\/([^/]+)/);
  const queryMatch = imageUrl.match(/[?&]id=([^&]+)/);
  const fileId = fileMatch?.[1] ?? queryMatch?.[1];

  if (fileId) {
    // The thumbnail endpoint embeds reliably in <img> without CORS issues.
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
  };

  return statuses[normalized] ?? '';
}

/** Fetch the CSV and return every parsed product (visible and hidden). */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(INVENTORY_CSV_URL);
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
  }));
}
