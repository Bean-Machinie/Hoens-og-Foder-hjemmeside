import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { PhoneInput } from 'react-international-phone';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { format, startOfToday } from 'date-fns';
import { da } from 'date-fns/locale';
import { SITE } from '@/config/site';
import type { Product } from '@/pages/catalogue/inventory';
import 'react-international-phone/style.css';
import styles from './ReserveAction.module.css';

interface ReserveActionProps {
  product: Product;
}

type PickupMode = 'today' | 'pick';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#5592a7', dark: '#477b8d' },
  },
  typography: { fontFamily: 'inherit' },
});

function PhoneCallIcon() {
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

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.inlineIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <rect x="2" y="3" width="12" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 6h12M5.5 1.5v3M10.5 1.5v3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      className={styles.inlineIcon}
      viewBox="0 0 16 16"
      focusable="false"
    >
      <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 4.6V8l2.3 1.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M8 7v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="4.7" r="1" fill="#fff" />
    </svg>
  );
}

const DISCLAIMER =
  'Vi gemmer varen til og med den dag, du vælger. Henter du den ikke ' +
  'senest denne dag, kan vi desværre ikke garantere, at den fortsat er ' +
  'reserveret til dig.';

function ReserveAction({ product }: ReserveActionProps) {
  const fieldId = useId();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [pickupMode, setPickupMode] = useState<PickupMode>('today');
  const [pickedDate, setPickedDate] = useState<Date | undefined>(undefined);
  const [showErrors, setShowErrors] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarPos, setCalendarPos] = useState({ top: 0, left: 0 });
  const segmentRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const telHref = `tel:${SITE.phone.replace(/\s+/g, '')}`;
  const today = startOfToday();

  const pickupDate = pickupMode === 'today' ? today : pickedDate;

  const nameValid = name.trim().length > 0;
  const phoneValid = Boolean(phone && isValidPhoneNumber(phone));
  const dateValid = Boolean(pickupDate);
  const formValid = nameValid && phoneValid && dateValid;

  const positionCalendar = () => {
    const rect = segmentRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const calHeight = 360;
    const margin = 8;
    const below = rect.bottom + margin;
    const overflowsBottom = below + calHeight > window.innerHeight;
    const top =
      overflowsBottom && rect.top - calHeight - margin > 0
        ? rect.top - calHeight - margin
        : below;
    setCalendarPos({ top, left: rect.left });
  };

  const openCalendar = () => {
    setPickupMode('pick');
    positionCalendar();
    setCalendarOpen(true);
  };

  useEffect(() => {
    if (!calendarOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        calendarRef.current?.contains(target) ||
        segmentRef.current?.contains(target)
      ) {
        return;
      }
      setCalendarOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        setCalendarOpen(false);
      }
    };
    const onReflow = () => positionCalendar();

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('scroll', onReflow, true);
    window.addEventListener('resize', onReflow);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('scroll', onReflow, true);
      window.removeEventListener('resize', onReflow);
    };
  }, [calendarOpen]);

  const resetForm = () => {
    setSubmitted(false);
    setShowErrors(false);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
    setPickupMode('today');
    setPickedDate(undefined);
    setCalendarOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      window.setTimeout(resetForm, 200);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formValid || !pickupDate) {
      setShowErrors(true);
      return;
    }

    const prettyDate = format(pickupDate, 'EEEE d. MMMM yyyy', { locale: da });
    const subject = `Reservation: ${product.title}`;
    const body = [
      'Hej Høns og Foder,',
      '',
      'Jeg vil gerne reservere denne vare:',
      '',
      `Vare: ${product.title}`,
      product.price ? `Pris: ${product.price}` : '',
      `Afhentning: ${prettyDate}`,
      '',
      `Navn: ${name}`,
      `Telefon: ${phone}`,
      email ? `E-mail: ${email}` : '',
      message ? `Besked: ${message}` : '',
      '',
      'Venlig hilsen',
      name,
    ].join('\n');

    window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setSubmitted(true);
  };

  return (
    <div className={styles.actions}>
      <Dialog.Root open={open} onOpenChange={handleOpenChange}>
        <Dialog.Trigger asChild>
          <button type="button" className={styles.reserveTrigger}>
            Reservér varen
          </button>
        </Dialog.Trigger>

        <a className={styles.callButton} href={telHref}>
          <PhoneCallIcon />
          <span>Ring til butikken</span>
        </a>

        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content className={styles.panel} aria-describedby={undefined}>
            <div className={styles.panelHead}>
              <div>
                <Dialog.Title className={styles.panelTitle}>
                  Reservér varen
                </Dialog.Title>
                <p className={styles.panelSubtitle}>{product.title}</p>
              </div>
              <Dialog.Close className={styles.closeButton} aria-label="Luk">
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M4 4 12 12 M12 4 4 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </Dialog.Close>
            </div>

            {submitted ? (
              <div className={styles.success} role="status">
                <p className={styles.successTitle}>Tak for din reservation!</p>
                <p className={styles.successText}>
                  Vi har åbnet dit mailprogram med reservationen af{' '}
                  <strong>{product.title}</strong>. Tryk send, så vender vi
                  tilbage hurtigst muligt.
                </p>
                <Dialog.Close className={styles.successClose}>Luk</Dialog.Close>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={`${fieldId}-name`}>
                      Navn <span className={styles.req}>*</span>
                    </label>
                    <input
                      id={`${fieldId}-name`}
                      className={`${styles.input} ${
                        showErrors && !nameValid ? styles.inputError : ''
                      }`}
                      type="text"
                      autoComplete="name"
                      placeholder="Dit fulde navn"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor={`${fieldId}-phone`}>
                      Telefon <span className={styles.req}>*</span>
                    </label>
                    <div
                      className={`${styles.phoneWrap} ${
                        showErrors && !phoneValid ? styles.inputError : ''
                      }`}
                    >
                      <PhoneInput
                        defaultCountry="dk"
                        value={phone}
                        onChange={(value) => setPhone(value)}
                        placeholder="Tlf. nummer"
                        inputProps={{
                          id: `${fieldId}-phone`,
                          autoComplete: 'tel',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.field}>
                  <span className={styles.label}>
                    Hvornår henter du? <span className={styles.req}>*</span>
                    <Tooltip.Provider delayDuration={120}>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            className={styles.infoButton}
                            aria-label="Information om afhentning"
                          >
                            <InfoIcon />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className={styles.tooltip}
                            sideOffset={6}
                            collisionPadding={12}
                          >
                            {DISCLAIMER}
                            <Tooltip.Arrow className={styles.tooltipArrow} />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </span>

                  <div className={styles.segment} ref={segmentRef}>
                    <button
                      type="button"
                      className={`${styles.segmentButton} ${
                        pickupMode === 'today' ? styles.segmentActive : ''
                      }`}
                      onClick={() => {
                        setPickupMode('today');
                        setCalendarOpen(false);
                      }}
                      aria-pressed={pickupMode === 'today'}
                    >
                      <ClockIcon />
                      <span>I dag</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.segmentButton} ${
                        pickupMode === 'pick' ? styles.segmentActive : ''
                      }`}
                      onClick={() =>
                        calendarOpen ? setCalendarOpen(false) : openCalendar()
                      }
                      aria-haspopup="dialog"
                      aria-expanded={calendarOpen}
                    >
                      <CalendarIcon />
                      <span>
                        {pickupMode === 'pick' && pickedDate
                          ? format(pickedDate, 'd. MMM yyyy', { locale: da })
                          : 'Vælg dag'}
                      </span>
                    </button>
                  </div>

                  {calendarOpen && (
                    <div
                      ref={calendarRef}
                      className={styles.calendarPopover}
                      style={{ top: calendarPos.top, left: calendarPos.left }}
                      role="dialog"
                      aria-label="Vælg afhentningsdag"
                    >
                      <ThemeProvider theme={muiTheme}>
                        <LocalizationProvider
                          dateAdapter={AdapterDateFns}
                          adapterLocale={da}
                        >
                          <DateCalendar
                            value={pickedDate ?? null}
                            onChange={(date: Date | null) => {
                              setPickedDate(date ?? undefined);
                              setPickupMode('pick');
                              if (date) {
                                setCalendarOpen(false);
                              }
                            }}
                            disablePast
                          />
                        </LocalizationProvider>
                      </ThemeProvider>
                    </div>
                  )}

                  {showErrors && !dateValid && (
                    <p className={styles.errorText}>Vælg en afhentningsdag.</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor={`${fieldId}-email`}>
                    E-mail <span className={styles.optional}>(valgfri)</span>
                  </label>
                  <input
                    id={`${fieldId}-email`}
                    className={styles.input}
                    type="email"
                    autoComplete="email"
                    placeholder="dig@eksempel.dk"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
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
                    placeholder="Evt. ønsker eller spørgsmål…"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                  />
                </div>

                <button className={styles.submitButton} type="submit">
                  Send reservering
                </button>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

export default ReserveAction;
