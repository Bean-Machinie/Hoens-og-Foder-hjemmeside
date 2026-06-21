import { Outlet } from 'react-router-dom';
import TopPanel from './TopPanel';
import styles from './Layout.module.css';

/**
 * App shell shared by every page: the top panel and the routed page content.
 * The footer (contact details + opening hours) lives only on the home page.
 */
function Layout() {
  return (
    <div className={styles.shell}>
      <TopPanel />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
