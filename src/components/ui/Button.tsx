import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary';

interface ButtonProps {
  children: ReactNode;
  /** When set, the button renders as a router link to this path. */
  to?: string;
  variant?: Variant;
  onClick?: () => void;
}

/**
 * Shared button. Renders a router <Link> when `to` is provided,
 * otherwise a native <button>.
 */
function Button({ children, to, variant = 'primary', onClick }: ButtonProps) {
  const className = `${styles.button} ${styles[variant]}`;

  if (to) {
    return (
      <Link to={to} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
