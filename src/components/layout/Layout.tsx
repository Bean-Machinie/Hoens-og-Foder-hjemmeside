import { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { InventoryProvider } from '@/context/InventoryContext';
import ScrollRestoration from './ScrollRestoration';
import TopPanel from './TopPanel';
import styles from './Layout.module.css';

/**
 * App shell shared by every page: the top panel and the routed page content.
 * The footer (contact details + opening hours) lives only on the home page.
 *
 * The whole shell is wrapped in <InventoryProvider> so the header search and
 * the catalogue can share a single inventory load.
 */
function Layout() {
  const shellRef = useRef<HTMLDivElement | null>(null);

  // The sticky header's height changes with viewport width (the nav wraps on
  // small screens). Measure it and publish it as --app-header-height so sticky
  // sub-bars (e.g. the catalogue filter) can pin themselves directly beneath
  // it without hard-coding a fragile magic number.
  useEffect(() => {
    const header = shellRef.current?.querySelector('header');
    if (!header) {
      return;
    }

    const apply = () => {
      const { height } = header.getBoundingClientRect();
      document.documentElement.style.setProperty(
        '--app-header-height',
        `${Math.round(height)}px`,
      );
    };

    apply();

    const observer = new ResizeObserver(apply);
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  return (
    <InventoryProvider>
      <ScrollRestoration />
      <div className={styles.shell} ref={shellRef}>
        <TopPanel />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </InventoryProvider>
  );
}

export default Layout;
