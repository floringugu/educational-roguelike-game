import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// True while the system asks for reduced motion (FR-VIS-007). The component
// renders again if the player changes the setting with the app open.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readPreference, readPreferenceWithoutBrowser);
}

function subscribe(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readPreference(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

// Used when React renders without a browser, as in the tests.
function readPreferenceWithoutBrowser(): boolean {
  return false;
}
