export interface ProductCategory {
  id: string;
  name: string;
  href: string;
}

/**
 * Shared product categories used across navigation, carousels and catalogue pages.
 * Keep category names and links centralized here to avoid duplicated website copy.
 */
export const PRODUCT_CATEGORIES = [
  { id: 'hoens', name: 'Høns', href: '/sortiment#hoens' },
  { id: 'foder', name: 'Foder', href: '/sortiment#foder' },
  { id: 'udstyr', name: 'Udstyr', href: '/sortiment#udstyr' },
  {
    id: 'stand-redemiljoe',
    name: 'Stand & Redemiljø',
    href: '/sortiment#stand-redemiljoe',
  },
  {
    id: 'sundhed-trivsel',
    name: 'Sundhed & Trivsel',
    href: '/sortiment#sundhed-trivsel',
  },
  { id: 'diverse', name: 'Diverse', href: '/sortiment#diverse' },
  { id: 'hund-kat', name: 'Hund & Kat', href: '/sortiment#hund-kat' },
] as const satisfies readonly ProductCategory[];
