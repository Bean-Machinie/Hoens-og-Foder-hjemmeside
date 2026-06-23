import archiveIcon from '@/assets/icons/archive.svg';
import boxIcon from '@/assets/icons/box.svg';
import chickenIcon from '@/assets/icons/chicken.svg';
import diverseIcon from '@/assets/icons/diverse.svg';
import farmFenceIcon from '@/assets/icons/farm-fence.svg';
import featherIcon from '@/assets/icons/feather.svg';
import heartIcon from '@/assets/icons/heart.svg';
import smileIcon from '@/assets/icons/smile.svg';
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
      { label: 'Høns', href: '/sortiment#hoens', icon: chickenIcon, iconEmphasis: true },
      { label: 'Foder', href: '/sortiment#foder', icon: wheatIcon, iconEmphasis: true },
      { label: 'Sundhed', href: '/sortiment#sundhed', icon: heartIcon },
      { label: 'Udstyr', href: '/sortiment#udstyr', icon: archiveIcon },
      { label: 'Trivsel', href: '/sortiment#trivsel', icon: smileIcon },
      { label: 'Stald', href: '/sortiment#stald', icon: farmFenceIcon },
      { label: 'Diverse', href: '/sortiment#diverse', icon: diverseIcon },
      { label: 'Vildtfugle', href: '/sortiment#vildtfugle', icon: featherIcon },
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
