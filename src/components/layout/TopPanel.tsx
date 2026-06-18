import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import facebookIcon from '@/assets/icons/facebook.svg';
import { NAV_ITEMS } from '@/config/navigation';
import { SITE } from '@/config/site';
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
  const [openNavMenu, setOpenNavMenu] = useState<string | null>(null);
  const [hoverHighlight, setHoverHighlight] = useState<HighlightState>({
    left: 0,
    width: 0,
    visible: false,
  });
  const [openHighlight, setOpenHighlight] = useState<HighlightState>({
    left: 0,
    width: 0,
    visible: false,
  });

  const getNavItemHighlight = (label: string): HighlightState | null => {
    const navElement = navRef.current;
    const triggerElement = triggerRefs.current[label];

    if (!navElement || !triggerElement) {
      return null;
    }

    const navRect = navElement.getBoundingClientRect();
    const triggerRect = triggerElement.getBoundingClientRect();

    return {
      left: triggerRect.left - navRect.left - HIGHLIGHT_PADDING,
      width: triggerRect.width + HIGHLIGHT_PADDING * 2,
      visible: true,
    };
  };

  const isLinkActive = (href: string) => {
    const [pathname] = href.split('#');
    return pathname === '/'
      ? location.pathname === '/'
      : location.pathname === pathname;
  };

  const isDropdownActive = (label: string) => {
    const item = NAV_ITEMS.find((navItem) => navItem.label === label);
    return item?.type === 'dropdown' && item.items.some((menuItem) => isLinkActive(menuItem.href));
  };

  const closeNavMenu = () => {
    setOpenNavMenu(null);
    setHoverHighlight((current) => ({ ...current, visible: false }));
    setOpenHighlight((current) => ({ ...current, visible: false }));
  };

  const focusFirstMenuItem = (label: string) => {
    window.requestAnimationFrame(() => {
      menuItemRefs.current[`${label}-0`]?.focus();
    });
  };

  const handleNavPointerMove = (label: string) => {
    if (openNavMenu === label) {
      setHoverHighlight((current) => ({ ...current, visible: false }));
      return;
    }

    const nextHighlight = getNavItemHighlight(label);

    if (nextHighlight) {
      setHoverHighlight(nextHighlight);
    }
  };

  const handleDropdownClick = (label: string) => {
    setOpenNavMenu((current) => (current === label ? null : label));
    setHoverHighlight((current) => ({ ...current, visible: false }));
  };

  const handleDropdownKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    label: string,
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpenNavMenu(label);
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
    if (!openNavMenu) {
      setOpenHighlight((current) => ({ ...current, visible: false }));
      return;
    }

    const nextHighlight = getNavItemHighlight(openNavMenu);

    if (nextHighlight) {
      setOpenHighlight(nextHighlight);
    }
  }, [openNavMenu, location.pathname]);

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

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <div aria-hidden="true" />

          <Link to="/" className={styles.brand}>
            {SITE.name}
          </Link>

          <div className={styles.metaArea}>
            <a
              aria-label="Facebook"
              className={styles.socialLink}
              href="https://www.facebook.com/"
              rel="noreferrer"
              target="_blank"
            >
              <img aria-hidden="true" className={styles.socialIcon} src={facebookIcon} />
            </a>
            <Link className={styles.metaButton} to="/kontakt">
              Kontakt
            </Link>
          </div>
        </div>
      </div>

      <nav
        aria-label="Hovedmenu"
        className={styles.navBar}
        onPointerLeave={() => setHoverHighlight((current) => ({ ...current, visible: false }))}
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
        <span
          aria-hidden="true"
          className={`${styles.navOpenHighlight} ${
            openHighlight.visible ? styles.navHighlightVisible : ''
          }`}
          style={{
            transform: `translateX(${openHighlight.left}px)`,
            width: openHighlight.width,
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
                    onPointerMove={() => handleNavPointerMove(item.label)}
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
                      onPointerMove={() => handleNavPointerMove(item.label)}
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
                            {menuItem.label}
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
