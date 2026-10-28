import { useRef, useState } from 'react';
import { clamp, cx, formatTime } from './utils';

/**
 * Scrubber with a generous touch target. While dragging, the thumb follows the
 * finger and a time bubble is shown; the seek is committed on release.
 *
 * variant:
 *  - overlay: YouTube-style thin bar sitting on the video's bottom edge
 *  - song:    regular bar for the audio player
 *  - mini:    non-interactive progress line for the mini player
 */
export default function SeekBar({
  current,
  duration,
  buffered = 0,
  onSeek,
  onScrubChange,
  variant = 'song',
  className,
  label = 'Seek',
  hideThumb = false,
}) {
  const trackRef = useRef(null);
  const [scrub, setScrub] = useState(null);
  const interactive = variant !== 'mini' && duration > 0;

  const shown = scrub ?? current;
  const pct = duration > 0 ? clamp((shown / duration) * 100, 0, 100) : 0;
  const bufferedPct = clamp(buffered * 100, 0, 100);

  const timeAt = (clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    return clamp((clientX - rect.left) / rect.width, 0, 1) * duration;
  };

  const update = (value) => {
    setScrub(value);
    onScrubChange?.(value);
  };

  const onPointerDown = (e) => {
    if (!interactive) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    update(timeAt(e.clientX));
  };

  const onPointerMove = (e) => {
    if (scrub == null) return;
    e.stopPropagation();
    update(timeAt(e.clientX));
  };

  const finish = (e) => {
    if (scrub == null) return;
    e.stopPropagation();
    onSeek?.(timeAt(e.clientX));
    update(null);
  };

  const onKeyDown = (e) => {
    if (!interactive) return;
    const step = e.shiftKey ? 30 : 5;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') onSeek?.(clamp(current + step, 0, duration));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') onSeek?.(clamp(current - step, 0, duration));
    else if (e.key === 'Home') onSeek?.(0);
    else if (e.key === 'End') onSeek?.(duration);
    else return;
    e.preventDefault();
    e.stopPropagation();
  };

  const dragging = scrub != null;
  const thin = variant === 'overlay' || variant === 'mini';

  return (
    <div
      className={cx(
        'relative w-full select-none touch-none group/seek',
        variant === 'mini' ? 'h-0.5' : variant === 'overlay' ? 'h-6 -my-2.5' : 'h-8',
        interactive && 'cursor-pointer',
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finish}
      onPointerCancel={() => update(null)}
      onClick={(e) => e.stopPropagation()}
      role={interactive ? 'slider' : 'progressbar'}
      tabIndex={interactive ? 0 : -1}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={Math.round(duration || 0)}
      aria-valuenow={Math.round(shown || 0)}
      aria-valuetext={`${formatTime(shown)} of ${formatTime(duration)}`}
      onKeyDown={onKeyDown}
    >
      <div
        ref={trackRef}
        className={cx(
          'absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-[height] duration-150',
          thin ? 'bg-white/25' : 'bg-white/15',
          variant === 'mini' ? 'h-0.5' : thin ? (dragging ? 'h-1.5' : 'h-[3px] group-hover/seek:h-1.5') : 'h-1 group-hover/seek:h-1.5',
          dragging && !thin && 'h-1.5'
        )}
      >
        <div className="absolute inset-y-0 left-0 bg-white/30" style={{ width: `${bufferedPct}%` }} />
        <div className="absolute inset-y-0 left-0 bg-[var(--accent)]" style={{ width: `${pct}%` }} />
      </div>

      {interactive && (
        <div
          className={cx(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_0_4px_rgba(0,0,0,0.15)] transition-[width,height,opacity] duration-150 pointer-events-none',
            dragging ? 'w-4 h-4 opacity-100' : hideThumb ? 'w-3 h-3 opacity-0' : thin ? 'w-3 h-3 opacity-100' : 'w-3 h-3 opacity-0 group-hover/seek:opacity-100 group-focus-visible/seek:opacity-100 [@media(pointer:coarse)]:opacity-100'
          )}
          style={{ left: `${pct}%` }}
        />
      )}

      {dragging && (
        <div
          className="absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 rounded-md bg-black/85 text-white text-xs font-semibold tabular-nums pointer-events-none whitespace-nowrap"
          style={{ left: `clamp(24px, ${pct}%, calc(100% - 24px))` }}
        >
          {formatTime(scrub)}
        </div>
      )}
    </div>
  );
}
