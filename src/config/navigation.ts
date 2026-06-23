import boxIcon from '@/assets/icons/box.svg';

export interface NavMenuItem {
  label: string;
  href: string;
  dividerAfter?: boolean;
  icon?: string;
  iconEmphasis?: boolean;
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
      {
        label: 'Alt sortiment',
        href: '/sortiment',
        dividerAfter: true,
        icon: boxIcon,
      },
      { label: 'Høns', href: '/sortiment#hoens' },
      { label: 'Foder', href: '/sortiment#foder' },
      { label: 'Sundhed', href: '/sortiment#sundhed' },
      { label: 'Udstyr', href: '/sortiment#udstyr' },
      { label: 'Trivsel', href: '/sortiment#trivsel' },
      { label: 'Stald', href: '/sortiment#stald' },
      { label: 'Diverse', href: '/sortiment#diverse' },
      { label: 'Vildtfugle', href: '/sortiment#vildtfugle' },
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
  { type: 'link', label: 'Kontakt', href: '/#kontakt' },
];
