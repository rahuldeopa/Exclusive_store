import { useState } from 'react';
import { Check, Download, Film, Headphones, Loader2 } from 'lucide-react';
import { cx, runDownload } from './utils';
import { hasAudio, hasVideo } from './usePlayer';

/** Album / track artwork: an image URL or the album's custom cover component. */
export function CoverArt({ album, track, className, rounded = 'rounded-xl', eager = false }) {
  const src = track?.artwork || album.cover;
  const Custom = album.CoverComponent;
  return (
    <div className={cx('relative overflow-hidden bg-[#141317]', rounded, className)}>
      {Custom && !track?.artwork ? (
        <Custom />
      ) : src ? (
        <img
          src={src}
          alt={`${album.title} cover`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : null}
    </div>
  );
}

/** 16:9 video thumbnail that falls back to the cover art if it fails to load. */
export function VideoThumb({ album, track, className, rounded = 'rounded-lg' }) {
  const [failed, setFailed] = useState(false);
  if (!track.thumbnail || failed) {
    return (
      <div className={cx('relative overflow-hidden bg-[#141317]', rounded, className)}>
        <CoverArt album={album} track={track} rounded="" className="absolute inset-0 opacity-60 blur-[1px] scale-110" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/3 max-w-16 aspect-square">
            <CoverArt album={album} track={track} rounded="rounded-md" className="w-full h-full shadow-lg" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={cx('relative overflow-hidden bg-[#141317]', rounded, className)}>
      <img
        src={track.thumbnail}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={() => setFailed(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export function EqBars({ playing = true, className }) {
  return (
    <span className={cx('inline-flex items-end gap-[3px] h-4 w-4', className)} aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cx('eq-bar w-[3px] rounded-full bg-[var(--accent)]', !playing && 'eq-bar-paused')}
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}

/** YouTube Music style "Song | Video" switch. */
export function ModeSwitch({ player, className, size = 'md' }) {
  const { track, mode, actions } = player;
  const options = [
    { key: 'audio', label: 'Song', Icon: Headphones, enabled: hasAudio(track) },
    { key: 'video', label: 'Video', Icon: Film, enabled: hasVideo(track) },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Playback mode"
      className={cx('inline-flex p-1 rounded-full bg-white/[0.08] border border-white/[0.08]', className)}
    >
      {options.map(({ key, label, Icon, enabled }) => {
        const active = mode === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={!enabled}
            onClick={() => actions.setMode(key)}
            className={cx(
              'flex items-center gap-1.5 rounded-full font-semibold transition-colors duration-200',
              size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-[13px]',
              active ? 'bg-white text-black shadow' : 'text-white/70 hover:text-white',
              !enabled && 'opacity-35 cursor-not-allowed hover:text-white/70'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

/** Per-track download buttons with preparing / done feedback. */
export function DownloadButtons({ track, compact = false }) {
  const [state, setState] = useState({});
  if (!track?.downloads?.length) return null;

  const start = async (item) => {
    if (state[item.key] === 'busy') return;
    setState((s) => ({ ...s, [item.key]: 'busy' }));
    try {
      await runDownload(item);
      setState((s) => ({ ...s, [item.key]: 'done' }));
    } catch (err) {
      console.error('Download failed:', err);
      if (item.fallbackHref) window.open(item.fallbackHref, '_blank', 'noopener');
      setState((s) => ({ ...s, [item.key]: 'error' }));
    } finally {
      setTimeout(() => setState((s) => ({ ...s, [item.key]: undefined })), 2500);
    }
  };

  return track.downloads.map((item) => {
    const st = state[item.key];
    return (
      <button
        key={item.key}
        type="button"
        onClick={() => start(item)}
        disabled={st === 'busy'}
        className={cx(
          'shrink-0 inline-flex items-center gap-2 h-9 rounded-full border text-[13px] font-semibold transition-colors',
          compact ? 'px-3' : 'px-4',
          st === 'done'
            ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
            : st === 'error'
              ? 'border-red-400/30 bg-red-400/10 text-red-300'
              : 'border-white/10 bg-white/[0.08] text-white/90 hover:bg-white/[0.14] active:bg-white/20'
        )}
        aria-label={`Download ${item.label}`}
      >
        {st === 'busy' ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : st === 'done' ? (
          <Check className="w-4 h-4" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{st === 'busy' ? 'Preparing…' : st === 'done' ? 'Started' : st === 'error' ? 'Failed' : item.label}</span>
      </button>
    );
  });
}
