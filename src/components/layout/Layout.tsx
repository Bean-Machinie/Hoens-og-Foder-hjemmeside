import { Outlet } from 'react-router-dom';
import TopPanel from './TopPanel';
import Footer from './Footer';
import styles from './Layout.module.css';

/**
 * App shell shared by every page: top panel, the routed page content,
 * and the footer. Pages render into <Outlet />.
 */
function Layout() {
  return (
    <div className={styles.shell}>
      <TopPanel />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
