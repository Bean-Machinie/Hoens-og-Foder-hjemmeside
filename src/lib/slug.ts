/**
 * Turn an arbitrary string (e.g. a product title) into a URL-safe slug.
 *
 * Danish letters are transliterated (æ→ae, ø→oe, å→aa) before any remaining
 * diacritics are stripped, so "Æggebakke til høns" becomes
 * "aeggebakke-til-hoens".
 */

// Combining diacritical marks (U+0300–U+036F), left over after NFD normalisation.
const COMBINING_MARKS = new RegExp('[\\u0300-\\u036f]', 'g');

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}
