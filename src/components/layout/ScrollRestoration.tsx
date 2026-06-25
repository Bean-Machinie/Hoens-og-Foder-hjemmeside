import { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const STORAGE_PREFIX = 'scroll-pos:';

/**
 * Jump the window instantly, bypassing the global `scroll-behavior: smooth`
 * (which would otherwise animate restoration — we want it to feel immediate).
 */
function jumpTo(y: number) {
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, y);
  root.style.scrollBehavior = previous;
}

/**
 * App-wide scroll management for client-side navigation.
 *
 * React Router doesn't restore scroll on its own, which feels wrong in two
 * different ways — so we handle the two cases differently:
 *
 *   • PUSH (clicking a link to a new page)  → start at the top. Going from a
 *     scrolled-down home page to the catalogue should land at the top.
 *   • POP (browser back/forward, and our in-page "Tilbage" button) → return to
 *     exactly where the user was. Coming back to the catalogue from a product
 *     should restore both the scroll position and (via the URL) the filter.
 *   • REPLACE (e.g. toggling a category filter, which rewrites the query) →
 *     leave the scroll where it is, so adjusting filters doesn't jump the page.
 *
 * Positions are remembered per history entry (location.key) in sessionStorage,
 * so they survive within the browsing session.
 */
function ScrollRestoration() {
  const { key } = useLocation();
  const navigationType = useNavigationType();

  // Take over from the browser's native restoration so ours is the only one
  // acting — otherwise the two fight and produce jumps.
  useEffect(() => {
    if (!('scrollRestoration' in window.history)) {
      return;
    }
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  // Continuously record how far the current history entry is scrolled.
  useEffect(() => {
    const save = () => {
      sessionStorage.setItem(STORAGE_PREFIX + key, String(window.scrollY));
    };
    window.addEventListener('scroll', save, { passive: true });
    return () => window.removeEventListener('scroll', save);
  }, [key]);

  // Place the viewport when a navigation lands. useLayoutEffect runs before
  // paint, so there's no visible flash of the wrong position.
  useLayoutEffect(() => {
    if (navigationType === 'POP') {
      const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
      const y = raw === null ? 0 : Number.parseInt(raw, 10);
      jumpTo(y);
      // Re-apply on the next frame in case late content shifts the height.
      const frame = requestAnimationFrame(() => jumpTo(y));
      return () => cancelAnimationFrame(frame);
    }

    if (navigationType === 'PUSH') {
      jumpTo(0);
    }
    // REPLACE: intentionally leave the scroll position untouched.
    return undefined;
  }, [key, navigationType]);

  return null;
}

export default ScrollRestoration;
