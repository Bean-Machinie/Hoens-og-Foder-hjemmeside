export interface NavMenuItem {
  label: string;
  href: string;
  dividerAfter?: boolean;
}

export type NavItem =
  | {
      type: 'link';
      label: string;
      href: string;
    }
  | {
      type: 'dropdown';
      label: string;
      items: NavMenuItem[];
    };

export const NAV_ITEMS: NavItem[] = [
  { type: 'link', label: 'Hjem', href: '/' },
  {
    type: 'dropdown',
    label: 'Sortiment',
    items: [
      { label: 'Alt sortiment', href: '/sortiment', dividerAfter: true },
      { label: 'Foder', href: '/sortiment#foder' },
      { label: 'Udstyr', href: '/sortiment#udstyr' },
      { label: 'Tilskud', href: '/sortiment#tilskud' },
    ],
  },
  { type: 'link', label: 'Om os', href: '/om-os' },
  { type: 'link', label: 'Kontakt', href: '/kontakt' },
];
