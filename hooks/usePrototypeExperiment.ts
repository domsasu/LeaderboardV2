import { useEffect, useState } from 'react';

/** Must match `storageKey` default in `public/prototype-toolbar.js` */
export const PROTO_EXPERIMENT_STORAGE_KEY = 'proto-experiment';

function readSessionExperiment(): string {
  try {
    const v = sessionStorage.getItem(PROTO_EXPERIMENT_STORAGE_KEY);
    if (v != null && v !== '') return v;
  } catch {
    /* ignore */
  }
  return 'a';
}

/** Reads `proto-experiment-<id>` from `document.body`. */
function readBodyExperiment(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.body.className.match(/\bproto-experiment-([\w-]+)\b/);
  return m ? m[1] : null;
}

/**
 * Current prototype toolbar experiment id (`a`, `b`, `c`, `d`, …), kept in sync with
 * `sessionStorage`, `body.proto-experiment-*`, and the `experiment-changed` event.
 */
export function usePrototypeExperiment(): string {
  const [id, setId] = useState(() => readBodyExperiment() ?? readSessionExperiment());

  useEffect(() => {
    const syncFromDom = () => {
      setId(readBodyExperiment() ?? readSessionExperiment());
    };

    const onExperimentChanged = (e: Event) => {
      const ce = e as CustomEvent<{ id?: string }>;
      if (ce.detail?.id != null && ce.detail.id !== '') {
        setId(ce.detail.id);
        return;
      }
      syncFromDom();
    };

    syncFromDom();
    window.addEventListener('experiment-changed', onExperimentChanged);
    const mo = new MutationObserver(syncFromDom);
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const t = window.setTimeout(syncFromDom, 0);

    return () => {
      window.removeEventListener('experiment-changed', onExperimentChanged);
      mo.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return id;
}
