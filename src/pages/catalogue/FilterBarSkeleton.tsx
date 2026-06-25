import styles from './CategoryFilterBar.module.css';

/**
 * Ghost version of <CategoryFilterBar> shown while the inventory loads.
 * It reuses the real bar's `.bar` and `.inner` classes so the frame,
 * padding, sticky offset and breakpoints line up exactly with the real
 * bar — no layout shift when the data arrives.
 */
function FilterBarSkeleton() {
  return (
    <div className={styles.bar} aria-hidden="true">
      <div className={`container ${styles.inner}`}>
        <div className={`${styles.skeleton} ${styles.skeletonTrigger}`} />
        <div className={`${styles.skeleton} ${styles.skeletonCount}`} />
      </div>
    </div>
  );
}

export default FilterBarSkeleton;
