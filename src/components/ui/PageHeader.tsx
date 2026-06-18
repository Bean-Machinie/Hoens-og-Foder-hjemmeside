import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

/** Simple page intro used at the top of inner (non-home) pages. */
function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className={styles.header}>
      <div className="container">
        <h1>{title}</h1>
        {children && <p className={styles.lead}>{children}</p>}
      </div>
    </div>
  );
}

export default PageHeader;
