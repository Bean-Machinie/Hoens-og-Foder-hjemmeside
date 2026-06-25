import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchProducts,
  groupProducts,
  type Product,
  type ProductGroup,
} from '@/pages/catalogue/inventory';

export type InventoryStatus = 'loading' | 'ready' | 'error';

interface InventoryContextValue {
  /** Visible products, flattened (one row per variant). */
  products: Product[];
  /** Catalogue entries (variants collapsed into groups). */
  groups: ProductGroup[];
  status: InventoryStatus;
}

const InventoryContext = createContext<InventoryContextValue | null>(null);

/**
 * Loads the inventory exactly once for the whole app and shares it through
 * context. Both the catalogue page and the global header search read from
 * here, so the Google Sheet is fetched a single time per session instead of
 * once per page that happens to need product data.
 */
export function InventoryProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<InventoryStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((all) => {
        if (cancelled) {
          return;
        }
        setProducts(all.filter((product) => product.visible));
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        console.error('Failed to load inventory:', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Collapse variant rows into catalogue entries once per product change.
  const groups = useMemo(() => groupProducts(products), [products]);

  const value = useMemo<InventoryContextValue>(
    () => ({ products, groups, status }),
    [products, groups, status],
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

/** Access the shared inventory. Must be used inside <InventoryProvider>. */
export function useInventory(): InventoryContextValue {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
