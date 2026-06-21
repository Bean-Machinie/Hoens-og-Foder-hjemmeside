import archiveIcon from '@/assets/icons/archive.svg';
import boxIcon from '@/assets/icons/box.svg';
import shieldIcon from '@/assets/icons/shield.svg';
import wheatIcon from '@/assets/icons/wheat.svg';

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
      {
        label: 'Foder',
        href: '/sortiment#foder',
        icon: wheatIcon,
        iconEmphasis: true,
      },
      { label: 'Udstyr', href: '/sortiment#udstyr', icon: archiveIcon },
      { label: 'Tilskud', href: '/sortiment#tilskud', icon: shieldIcon },
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
