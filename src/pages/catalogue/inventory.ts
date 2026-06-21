/**
 * Inventory data loading for the Sortiment page (proof of concept).
 *
 * Loads products from a published Google Sheets CSV, parses each row into a
 * Product object and exposes helpers for image handling. No filtering, sorting
 * or stock logic lives here yet — this is intentionally minimal.
 */

/** Published Google Sheets CSV (File → Share → Publish to web → CSV). */
export const INVENTORY_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vT6WaOandMt_yh74KZ4dM8DCKg8PNzTmGZYP45fPkt1qpU_BX6Hs7k0_10Rh_yTx9N1DJ_uXMqQRi8J/pub?gid=0&single=true&output=csv';

export interface Product {
  title: string;
  category: string;
  description: string;
  price: string;
  unit: string;
  availability: string;
  visible: boolean;
  imageUrl: string;
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
  if (!url) {
    return '';
  }

  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  const queryMatch = url.match(/[?&]id=([^&]+)/);
  const fileId = fileMatch?.[1] ?? queryMatch?.[1];

  if (fileId) {
    // The thumbnail endpoint embeds reliably in <img> without CORS issues.
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return url;
}

function toBoolean(value: string): boolean {
  return value.trim().toUpperCase() === 'TRUE';
}

/** Fetch the CSV and return every parsed product (visible and hidden). */
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(INVENTORY_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to load inventory CSV: ${response.status}`);
  }

  const csv = await response.text();
  return parseCsv(csv).map((row) => ({
    title: row.title ?? '',
    category: row.category ?? '',
    description: row.description ?? '',
    price: row.price ?? '',
    unit: row.unit ?? '',
    availability: row.availability ?? '',
    visible: toBoolean(row.visible ?? ''),
    imageUrl: toDirectImageUrl(row.imageUrl ?? ''),
  }));
}
