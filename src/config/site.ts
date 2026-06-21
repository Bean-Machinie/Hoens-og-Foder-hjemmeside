/**
 * Site-wide constants (name, contact details, etc.).
 * Edit these placeholders with the real business information.
 */
export const SITE = {
  name: 'Høns og Foder',
  tagline: 'Kvalitetsfoder og udstyr til dine høns',
  phone: '+45 51 28 58 58',
  email: 'hoensogfoder@gmail.com',
  address: 'Bundsvej 16, 3660 Stenløse',
  /** Opening hours, one row per group of days. */
  openingHours: [
    { days: 'Mandag–fredag', hours: '9–17' },
    { days: 'Lørdag', hours: '9–13' },
    { days: 'Søndag', hours: 'Lukket' },
  ],
} as const;
