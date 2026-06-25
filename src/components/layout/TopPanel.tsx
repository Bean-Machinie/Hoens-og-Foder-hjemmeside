import { KeyboardEvent, MouseEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation';
import { SITE } from '@/config/site';
import FacebookFollowCallout from '@/components/ui/FacebookFollowCallout';
import GlobalSearch from './GlobalSearch';
import styles from './TopPanel.module.css';

interface HighlightState {
  left: number;
  width: number;
  visible: boolean;
}

const HIGHLIGHT_PADDING = 6;

function TopPanel() {
  const location = useLocation();
  const navRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLAnchorElement | HTMLButtonElement | null>>({});
  const menuItemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const revealHighlightFrame = useRef<number | null>(null);
  const hoveredNavLabel = useRef<string | null>(null);
  const [openNavMenu, setOpenNavMenu] = useState<string | null>(null);
  const [hoverHighlight, setHoverHighlight] = useState<HighlightState>({
    left: 0,
    width: 0,
    visible: false,
  });

  const scrollToHash = (hash: string) => {
    const id = hash.replace('#', '');
    const target = id ? document.getElementById(id) : null;
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleNavLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.includes('#')) {
      return;
    }

    const [path, hash] = href.split('#');
    const targetPath = path || '/';

    // Same page: smooth-scroll to the section without touching the URL.
    if (location.pathname === targetPath) {
      event.preventDefault();
      scrollToHash(`#${hash}`);
    }
    // Other page: let <Link> navigate to "/#kontakt"; the effect below
    // scrolls once the home page (and its footer) have mounted.
  };

  const getNavItemHighlight = (label: string): HighlightState | null => {
    const navElement = navRef.current;
    const triggerElement = triggerRefs.current[label];

    if (!navElement || !triggerElement || !triggerElement.isConnected) {
      return null;
    }

    const navRect = navElement.getBoundingClientRect();
    const triggerRect = triggerElement.getBoundingClientRect();
    const left = triggerRect.left - navRect.left - HIGHLIGHT_PADDING;
    const width = triggerRect.width + HIGHLIGHT_PADDING * 2;

    if (
      !Number.isFinite(left) ||
      !Number.isFinite(width) ||
      width <= 0 ||
      left < -HIGHLIGHT_PADDING ||
      left + width > navRect.width + HIGHLIGHT_PADDING
    ) {
      return null;
    }

    return { left, width, visible: true };
  };

  const showNavHighlight = (label: string) => {
    const nextHighlight = getNavItemHighlight(label);

    if (!nextHighlight) {
      return;
    }

    if (revealHighlightFrame.current !== null) {
      window.cancelAnimationFrame(revealHighlightFrame.current);
    }

    setHoverHighlight((current) => {
      if (current.visible) {
        return nextHighlight;
      }

      return { ...nextHighlight, visible: false };
    });

    revealHighlightFrame.current = window.requestAnimationFrame(() => {
      revealHighlightFrame.current = window.requestAnimationFrame(() => {
        setHoverHighlight((current) => ({ ...current, visible: true }));
        revealHighlightFrame.current = null;
      });
    });
  };

  const hideNavHighlight = () => {
    if (revealHighlightFrame.current !== null) {
      window.cancelAnimationFrame(revealHighlightFrame.current);
      revealHighlightFrame.current = null;
    }

    setHoverHighlight((current) => ({ ...current, visible: false }));
  };

  const handleNavPointerEnter = (label: string) => {
    hoveredNavLabel.current = label;
    showNavHighlight(label);
  };

  const handleNavPointerLeave = () => {
    hoveredNavLabel.current = null;

    if (openNavMenu) {
      showNavHighlight(openNavMenu);
    } else {
      hideNavHighlight();
    }
  };
  const isLinkActive = (href: string) => {
    const [beforeHash, hash] = href.split('#');
    const [rawPath, query] = beforeHash.split('?');
    const targetPath = rawPath || '/';

    if (location.pathname !== targetPath) {
      return false;
    }

    // Hash links (e.g. "/#kontakt") match on the hash.
    if (hash) {
      return location.hash === `#${hash}`;
    }

    // Category links (e.g. "/sortiment?kategori=hoens") are active when that
    // exact category is the only one selected in the URL.
    if (query) {
      const targetCategory = new URLSearchParams(query).get('kategori');
      const currentCategory = new URLSearchParams(location.search).get(
        'kategori',
      );
      return targetCategory === currentCategory;
    }

    // Plain "/sortiment" ("Alt sortiment") is active only with no filter set.
    if (targetPath === '/sortiment') {
      return !new URLSearchParams(location.search).has('kategori');
    }

    return true;
  };

  const isDropdownActive = (label: string) => {
    const item = NAV_ITEMS.find((navItem) => navItem.label === label);
    return item?.type === 'dropdown' && item.items.some((menuItem) => isLinkActive(menuItem.href));
  };

  const closeNavMenu = () => {
    setOpenNavMenu(null);

    if (hoveredNavLabel.current) {
      showNavHighlight(hoveredNavLabel.current);
    } else {
      hideNavHighlight();
    }
  };

  const focusFirstMenuItem = (label: string) => {
    window.requestAnimationFrame(() => {
      menuItemRefs.current[`${label}-0`]?.focus();
    });
  };

  const handleDropdownClick = (label: string) => {
    const nextOpenMenu = openNavMenu === label ? null : label;
    setOpenNavMenu(nextOpenMenu);

    if (nextOpenMenu) {
      showNavHighlight(nextOpenMenu);
    } else if (!hoveredNavLabel.current) {
      hideNavHighlight();
    }
  };

  const handleDropdownKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    label: string,
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpenNavMenu(label);
      showNavHighlight(label);
      focusFirstMenuItem(label);
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeNavMenu();
      triggerRefs.current[label]?.focus();
    }
  };

  const handleMenuKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    label: string,
  ) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeNavMenu();
      triggerRefs.current[label]?.focus();
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) {
        return;
      }

      closeNavMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    closeNavMenu();
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== '/' || !location.hash) {
      return;
    }

    const hash = location.hash;
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const id = hash.replace('#', '');
        const target = id ? document.getElementById(id) : null;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.pathname, location.hash]);

  useEffect(
    () => () => {
      if (revealHighlightFrame.current !== null) {
        window.cancelAnimationFrame(revealHighlightFrame.current);
      }
    },
    [],
  );

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div className={styles.searchArea}>
            <GlobalSearch />
          </div>

          <Link to="/" className={styles.brand}>
            {SITE.name}
          </Link>

          <div className={styles.metaArea}>
            <FacebookFollowCallout />
          </div>
        </div>
      </div>

      <nav
        aria-label="Hovedmenu"
        className={styles.navBar}
        onPointerLeave={handleNavPointerLeave}
        ref={navRef}
      >
        <span
          aria-hidden="true"
          className={`${styles.navHighlight} ${
            hoverHighlight.visible ? styles.navHighlightVisible : ''
          }`}
          style={{
            transform: `translateX(${hoverHighlight.left}px)`,
            width: hoverHighlight.width,
          }}
        />

        <div className={styles.navScroller}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li className={styles.navItem} key={item.label}>
                {item.type === 'link' ? (
                  <Link
                    className={`${styles.navLink} ${
                      isLinkActive(item.href) ? styles.active : ''
                    }`}
                    onClick={(event) => handleNavLinkClick(event, item.href)}
                    onPointerEnter={() => handleNavPointerEnter(item.label)}
                    ref={(element) => {
                      triggerRefs.current[item.label] = element;
                    }}
                    to={item.href}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      aria-expanded={openNavMenu === item.label}
                      aria-haspopup="menu"
                      className={`${styles.navLink} ${styles.navButton} ${
                        isDropdownActive(item.label) ? styles.active : ''
                      }`}
                      onClick={() => handleDropdownClick(item.label)}
                      onKeyDown={(event) => handleDropdownKeyDown(event, item.label)}
                      onPointerEnter={() => handleNavPointerEnter(item.label)}
                      ref={(element) => {
                        triggerRefs.current[item.label] = element;
                      }}
                      type="button"
                    >
                      {item.label}
                    </button>

                    {openNavMenu === item.label ? (
                      <div
                        className={styles.dropdown}
                        onKeyDown={(event) => handleMenuKeyDown(event, item.label)}
                        onPointerEnter={() => handleNavPointerEnter(item.label)}
                        role="menu"
                      >
                        {item.items.map((menuItem, index) => (
                          <Link
                            className={`${styles.dropdownItem} ${
                              menuItem.dividerAfter ? styles.dividerAfter : ''
                            }`}
                            key={menuItem.href}
                            onClick={closeNavMenu}
                            ref={(element) => {
                              menuItemRefs.current[`${item.label}-${index}`] = element;
                            }}
                            role="menuitem"
                            tabIndex={0}
                            to={menuItem.href}
                          >
                            {menuItem.icon ? (
                              <img
                                alt=""
                                aria-hidden="true"
                                className={`${styles.dropdownIcon} ${
                                  menuItem.iconEmphasis ? styles.dropdownIconEmphasis : ''
                                }`}
                                src={menuItem.icon}
                              />
                            ) : null}
                            <span>{menuItem.label}</span>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

export default TopPanel;
