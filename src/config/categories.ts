import diverseImage from '@/assets/images/categories/diverse.webp';
import foderImage from '@/assets/images/categories/foder.webp';
import hundImage from '@/assets/images/categories/hund.webp';
import hoensImage from '@/assets/images/categories/høns.webp';
import staldImage from '@/assets/images/categories/stald.webp';
import sundhedImage from '@/assets/images/categories/sundhed.webp';
import udstyrImage from '@/assets/images/categories/udstyr.webp';

export interface ProductCategory {
  id: string;
  name: string;
  href: string;
  image: string;
}

/**
 * Shared product categories used across navigation, carousels and catalogue pages.
 * Keep category names and links centralized here to avoid duplicated website copy.
 */
export const PRODUCT_CATEGORIES = [
  { id: 'hoens', name: 'Høns', href: '/sortiment#hoens', image: hoensImage },
  { id: 'foder', name: 'Foder', href: '/sortiment#foder', image: foderImage },
  {
    id: 'udstyr',
    name: 'Udstyr',
    href: '/sortiment#udstyr',
    image: udstyrImage,
  },
  {
    id: 'stald-redemiljoe',
    name: 'Stald & Redemiljø',
    href: '/sortiment#stald-redemiljoe',
    image: staldImage,
  },
  {
    id: 'sundhed-trivsel',
    name: 'Sundhed & Trivsel',
    href: '/sortiment#sundhed-trivsel',
    image: sundhedImage,
  },
  {
    id: 'diverse',
    name: 'Diverse',
    href: '/sortiment#diverse',
    image: diverseImage,
  },
  {
    id: 'hund-kat',
    name: 'Hund & Kat',
    href: '/sortiment#hund-kat',
    image: hundImage,
  },
] as const satisfies readonly ProductCategory[];
