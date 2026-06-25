/**
 * Opening-hours loading from the Google Sheet's "Information" tab.
 *
 * The shop owner edits one row per displayed line in the sheet (Dage | Tider);
 * the website fetches that tab as CSV and renders the rows in both the hero and
 * the footer. If the sheet is empty or unreachable, we fall back to the
 * hardcoded hours in SITE so the site never shows a blank schedule.
 */

import { parseCsv } from '@/pages/catalogue/inventory';
import { SITE } from '@/config/site';

/** Published "Information" tab of the same spreadsheet used for the catalogue. */
export const INFORMATION_CSV_URL =
  'https://docs.google.com/spreadsheets/d/1Xr349RUKU7m3k56wXA7pbRNKOvt_mCrJmOwgHEqMt4U/gviz/tq?tqx=out:csv&sheet=Information';

export interface OpeningHoursRow {
  /** Day or day-range label, e.g. "Mandag – Fredag". */
  days: string;
  /** Hours for that label, e.g. "16:00 – 19:00" or "Lukket". */
  hours: string;
}

/** The hardcoded hours used when the sheet has no usable rows. */
export const FALLBACK_OPENING_HOURS: readonly OpeningHoursRow[] =
  SITE.openingHours;

/**
 * Fetch the opening hours from the Information tab. Returns the parsed rows in
 * sheet order, or the SITE fallback if the sheet is empty or the request fails.
 */
export async function fetchOpeningHours(): Promise<OpeningHoursRow[]> {
  const url = `${INFORMATION_CSV_URL}&_cb=${Date.now()}`;

  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load Information CSV: ${response.status}`);
  }

  const csv = await response.text();
  const rows = parseCsv(csv)
    .map((row) => ({
      days: (row.Dage ?? '').trim(),
      hours: (row.Tider ?? '').trim(),
    }))
    .filter((row) => row.days !== '' || row.hours !== '');

  return rows.length > 0 ? rows : [...FALLBACK_OPENING_HOURS];
}
