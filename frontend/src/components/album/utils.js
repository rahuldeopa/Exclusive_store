import { useEffect, useState } from 'react';

export const cx = (...classes) => classes.filter(Boolean).join(' ');

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ss = s.toString().padStart(2, '0');
  return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${ss}` : `${m}:${ss}`;
};

/** Parses "m:ss" / "h:mm:ss" strings into seconds. */
export const parseDuration = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  return value.split(':').reduce((total, part) => total * 60 + (parseInt(part, 10) || 0), 0);
};

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Phone held sideways: short viewport in landscape. */
export const PHONE_LANDSCAPE_QUERY = '(orientation: landscape) and (max-height: 540px)';
/** Laptop / desktop / large tablet in landscape. */
export const WIDE_QUERY = '(min-width: 1024px) and (min-height: 541px)';

/** iPhone Safari cannot put arbitrary elements in fullscreen. */
export const canElementFullscreen = () => {
  if (typeof document === 'undefined') return false;
  const el = document.documentElement;
  return Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
    Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
};

export const getFullscreenElement = () =>
  document.fullscreenElement || document.webkitFullscreenElement || null;

export async function requestFullscreen(el) {
  if (!el) return false;
  try {
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else return false;
    // Rotate phones to landscape like the YouTube app. Unsupported on desktop / iOS.
    screen.orientation?.lock?.('landscape').catch(() => {});
    return true;
  } catch {
    return false;
  }
}

export function exitFullscreen() {
  try {
    screen.orientation?.unlock?.();
  } catch {
    // ignore
  }
  if (!getFullscreenElement()) return;
  if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
}

export const safeFileName = (name) => (name || 'track').replace(/[^\w\s-]/gi, '_').trim();

/**
 * Runs a track download. Strategies:
 *  - link:     native <a download> navigation (server sends Content-Disposition)
 *  - blob:     fetch first so we can surface failures, then save the blob
 *  - external: open a helper page in a new tab
 */
export async function runDownload({ href, filename, strategy = 'link' }) {
  if (strategy === 'external') {
    window.open(href, '_blank', 'noopener');
    return;
  }

  if (strategy === 'blob') {
    const response = await fetch(href);
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);
    const disposition = response.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?([^";\n]+)"?/);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    triggerAnchor(url, match?.[1] || filename);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return;
  }

  triggerAnchor(href, filename, true);
}

function triggerAnchor(href, filename, newTab = false) {
  const a = document.createElement('a');
  a.href = href;
  if (filename) a.download = filename;
  if (newTab) {
    a.target = '_blank';
    a.rel = 'noopener';
  }
  document.body.appendChild(a);
  a.click();
  a.remove();
}
