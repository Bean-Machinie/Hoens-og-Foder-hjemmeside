import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/config/navigation';
import { SITE } from '@/config/site';
import styles from './TopPanel.module.css';

/**
 * Top panel / site header. Holds the brand and the primary navigation
 * buttons that route to the other pages.
 */
function TopPanel() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.brand}>
          {SITE.name}
        </NavLink>

        <nav aria-label="Hovedmenu">
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default TopPanel;
