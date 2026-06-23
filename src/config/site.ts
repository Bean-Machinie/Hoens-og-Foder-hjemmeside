/**
 * Site-wide constants (name, contact details, etc.).
 * Edit these placeholders with the real business information.
 */
export const SITE = {
  name: 'Høns og Foder',
  tagline: 'Kvalitetsfoder og udstyr til dine høns',
  phone: '+45 51 28 58 58',
  email: 'hoensogfoder@mail.dk',
  address: 'Bundsvej 16, 3660 Stenløse',
  /** Opening hours, one row per group of days. Single source of truth for
   *  both the hero and the footer. */
  openingHours: [
    { days: 'Mandag – Fredag', hours: '16:00 – 19:00' },
    { days: 'Lørdag', hours: '9:00 – 14:00' },
    { days: 'Søndag', hours: 'Lukket' },
  ],
} as const;
