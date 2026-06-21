import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import placeholderImage from '@/assets/images/inventory/placeholder.webp';
import { fetchProducts, type Product } from './inventory';
import styles from './CataloguePage.module.css';

function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading',
  );

  useEffect(() => {
    let cancelled = false;

    fetchProducts()
      .then((all) => {
        if (cancelled) {
          return;
        }
        const visible = all.filter((product) => product.visible);
        console.log('Parsed products:', all);
        console.log('Visible products:', visible);
        setProducts(visible);
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

  return (
    <>
      <PageHeader title="Sortiment">
        Produkterne hentes direkte fra Google Sheets. Test-visning under
        opbygning.
      </PageHeader>
      <section className={`container ${styles.section}`}>
        {status === 'loading' && <p>Indlæser produkter…</p>}
        {status === 'error' && (
          <p>Kunne ikke hente produkter. Prøv igen senere.</p>
        )}
        {status === 'ready' && (
          <>
            <p className={styles.count}>
              {products.length} produkt(er) indlæst
            </p>
            <div className={styles.grid}>
              {products.map((product, index) => (
                <article
                  key={`${product.title}-${index}`}
                  className={styles.card}
                >
                  <img
                    className={styles.image}
                    src={product.imageUrl || placeholderImage}
                    alt={product.title}
                    loading="lazy"
                    onError={(event) => {
                      const img = event.currentTarget;
                      if (img.src !== placeholderImage) {
                        img.src = placeholderImage;
                      }
                    }}
                  />
                  <div className={styles.body}>
                    <h2 className={styles.title}>{product.title}</h2>
                    <p className={styles.category}>{product.category}</p>
                    <p className={styles.price}>{product.price}</p>
                    {product.description && (
                      <p className={styles.description}>
                        {product.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}

export default CataloguePage;
