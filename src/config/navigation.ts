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
  {
    type: 'dropdown',
    label: 'Information',
    items: [
      { label: 'Nye hønseejere', href: '/information/nye-honseejere' },
      { label: 'Pasning og trivsel', href: '/information/pasning-og-trivsel' },
      { label: 'Fodervejledning', href: '/information/fodervejledning' },
      {
        label: 'Ofte stillede spørgsmål',
        href: '/information/ofte-stillede-sporgsmal',
      },
    ],
  },
  { type: 'link', label: 'Om os', href: '/om-os' },
  { type: 'link', label: 'Kontakt', href: '/kontakt' },
];
