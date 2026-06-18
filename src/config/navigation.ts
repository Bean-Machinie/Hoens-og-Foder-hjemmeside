/**
 * Central navigation config.
 * The top panel and the router both read from this list, so adding a page
 * is a one-line change here plus a route in App.tsx.
 */
export interface NavItem {
  /** Route path used by React Router. */
  path: string;
  /** Label shown in the top panel. */
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Hjem' },
  { path: '/sortiment', label: 'Sortiment' },
  { path: '/om-os', label: 'Om os' },
  { path: '/kontakt', label: 'Kontakt' },
];
