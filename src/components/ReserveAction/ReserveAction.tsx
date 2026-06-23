import { useId, useState, type FormEvent } from 'react';
import { SITE } from '@/config/site';
import type { Product } from '@/pages/catalogue/inventory';
import styles from './ReserveAction.module.css';

interface ReserveActionProps {
  product: Product;
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.phoneIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <path
        d="M5.2 1.9 6.5 4a1 1 0 0 1-.2 1.2l-1 .9a8.3 8.3 0 0 0 3.7 3.7l.9-1a1 1 0 0 1 1.2-.2l2.1 1.3a1 1 0 0 1 .4 1.3l-.7 1.5a1.3 1.3 0 0 1-1.4.7C7.9 14.1 1.9 8.1 1.2 2.8A1.3 1.3 0 0 1 1.9 1.4l1.5-.7a1 1 0 0 1 1.3.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Reservation block shown on each item page: an on-page form that collects the
 * customer's name, phone and an optional message, plus a "call the shop" link.
 *
 * There is no backend yet, so submitting opens the customer's email app with a
 * pre-filled reservation addressed to the shop. To deliver without leaving the
 * page, replace the body of `handleSubmit` with a POST to a form/email service
 * (Formspree, Netlify Forms, a serverless endpoint, etc.).
 */
function ReserveAction({ product }: ReserveActionProps) {
  const fieldId = useId();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const telHref = `tel:${SITE.phone.replace(/\s+/g, '')}`;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const subject = `Reservation: ${product.title}`;
    const body = [
      'Hej Høns og Foder,',
      '',
      'Jeg vil gerne reservere denne vare:',
      '',
      `Vare: ${product.title}`,
      product.price ? `Pris: ${product.price}` : '',
      '',
      `Navn: ${name}`,
      `Telefon: ${phone}`,
      message ? `Besked: ${message}` : '',
      '',
      'Venlig hilsen',
      name,
    ]
      .filter((line) => line !== null)
      .join('\n');

    // TODO: swap this for a POST to your form/email service for an in-page
    // confirmation without opening the customer's mail client.
    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.panel}>
        <div className={styles.success} role="status">
          <p className={styles.successTitle}>Tak for din reservation!</p>
          <p className={styles.successText}>
            Vi har åbnet dit mailprogram med reservationen af{' '}
            <strong>{product.title}</strong>. Tryk send, så vender vi tilbage
            hurtigst muligt. Du er også altid velkommen til at ringe.
          </p>
          <a className={styles.callButton} href={telHref}>
            <PhoneIcon />
            <span>Ring til butikken</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${fieldId}-name`}>
            Navn
          </label>
          <input
            id={`${fieldId}-name`}
            className={styles.input}
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${fieldId}-phone`}>
            Telefon
          </label>
          <input
            id={`${fieldId}-phone`}
            className={styles.input}
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor={`${fieldId}-message`}>
            Besked <span className={styles.optional}>(valgfri)</span>
          </label>
          <textarea
            id={`${fieldId}-message`}
            className={`${styles.input} ${styles.textarea}`}
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <button className={styles.reserveButton} type="submit">
          Reservér varen
        </button>
      </form>

      <div className={styles.divider}>
        <span>eller</span>
      </div>

      <a className={styles.callButton} href={telHref}>
        <PhoneIcon />
        <span>Ring til butikken</span>
      </a>
    </div>
  );
}

export default ReserveAction;
