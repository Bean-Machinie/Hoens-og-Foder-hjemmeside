import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchOpeningHours,
  FALLBACK_OPENING_HOURS,
  type OpeningHoursRow,
} from '@/lib/openingHours';

export type InformationStatus = 'loading' | 'ready' | 'error';

interface InformationContextValue {
  /** Opening hours to display. Always populated (sheet data or fallback). */
  openingHours: OpeningHoursRow[];
  status: InformationStatus;
}

const InformationContext = createContext<InformationContextValue | null>(null);

/**
 * Loads the editable store information (opening hours) once for the whole app
 * and shares it through context. Both the hero and the footer read from here,
 * so the Google Sheet's "Information" tab is fetched a single time per session.
 *
 * While loading or on error we serve the hardcoded SITE hours, so the schedule
 * is never blank.
 */
export function InformationProvider({ children }: { children: ReactNode }) {
  const [openingHours, setOpeningHours] = useState<OpeningHoursRow[]>([
    ...FALLBACK_OPENING_HOURS,
  ]);
  const [status, setStatus] = useState<InformationStatus>('loading');

  useEffect(() => {
    let cancelled = false;

    fetchOpeningHours()
      .then((rows) => {
        if (cancelled) {
          return;
        }
        setOpeningHours(rows);
        setStatus('ready');
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        console.error('Failed to load opening hours:', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<InformationContextValue>(
    () => ({ openingHours, status }),
    [openingHours, status],
  );

  return (
    <InformationContext.Provider value={value}>
      {children}
    </InformationContext.Provider>
  );
}

/** Access the shared store information. Must be used inside <InformationProvider>. */
export function useInformation(): InformationContextValue {
  const context = useContext(InformationContext);
  if (!context) {
    throw new Error('useInformation must be used within an InformationProvider');
  }
  return context;
}
