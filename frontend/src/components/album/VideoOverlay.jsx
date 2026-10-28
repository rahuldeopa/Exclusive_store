import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  Headphones,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import SeekBar from './SeekBar';
import { cx, formatTime } from './utils';
import { hasAudio } from './usePlayer';

const HIDE_DELAY = 3000;
const DOUBLE_TAP_MS = 300;
const SEEK_STEP = 10;

/**
 * YouTube-app style controls drawn over the video:
 *  - tap toggles the controls, double-tap left/right seeks ±10s (keep tapping to add more)
 *  - swipe down minimizes, swipe up goes fullscreen
 *  - mouse: click toggles play, double-click toggles fullscreen
 */
export default function VideoOverlay({ player, immersive, isFullscreen, onToggleFullscreen, onMinimize, showMinimize = true }) {
  const { status, track, album, wantPlay, needsGesture, actions } = player;
  const [visible, setVisible] = useState(true);
  const [ripple, setRipple] = useState(null);
  const [scrubbing, setScrubbing] = useState(false);
  const hideTimer = useRef(null);
  const tapTimer = useRef(null);
  const rippleTimer = useRef(null);
  const lastTap = useRef({ time: 0, side: null });
  const streak = useRef({ side: null, until: 0, total: 0 });
  const pointerStart = useRef(null);
  const rootRef = useRef(null);

  const playing = status.playing;
  const buffering = status.buffering && wantPlay;

  const scheduleHide = useCallback(() => {
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
  }, []);

  const poke = useCallback(() => {
    setVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  // Keep controls up while paused or scrubbing; auto-hide while playing.
  useEffect(() => {
    if (playing && !scrubbing) scheduleHide();
    else clearTimeout(hideTimer.current);
  }, [playing, scrubbing, scheduleHide]);

  useEffect(() => () => {
    clearTimeout(hideTimer.current);
    clearTimeout(tapTimer.current);
    clearTimeout(rippleTimer.current);
  }, []);

  const showRipple = (side, total) => {
    setRipple({ side, total, key: Date.now() });
    clearTimeout(rippleTimer.current);
    rippleTimer.current = setTimeout(() => setRipple(null), 650);
  };

  const seekFromTap = (side) => {
    const delta = side === 'left' ? -SEEK_STEP : SEEK_STEP;
    actions.seekBy(delta);
    const now = Date.now();
    const total = streak.current.side === side && now < streak.current.until ? streak.current.total + SEEK_STEP : SEEK_STEP;
    streak.current = { side, until: now + 800, total };
    showRipple(side, total);
  };

  const isControl = (e) => Boolean(e.target.closest?.('[data-control]'));

  const onPointerDown = (e) => {
    if (isControl(e)) return;
    pointerStart.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const onPointerUp = (e) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || isControl(e)) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;

    // Vertical swipes
    if (Math.abs(dy) > 60 && Math.abs(dy) > Math.abs(dx) * 1.3) {
      if (dy > 0) {
        if (isFullscreen || immersive) onToggleFullscreen(false);
        else onMinimize();
      } else if (!isFullscreen) {
        onToggleFullscreen(true);
      }
      return;
    }
    if (Math.hypot(dx, dy) > 12) return;

    const rect = rootRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const side = x < 0.35 ? 'left' : x > 0.65 ? 'right' : 'center';
    const now = Date.now();

    if (e.pointerType === 'mouse') {
      // Desktop: click = play/pause, double click = fullscreen
      if (now - lastTap.current.time < DOUBLE_TAP_MS) {
        clearTimeout(tapTimer.current);
        lastTap.current = { time: 0, side: null };
        onToggleFullscreen(!isFullscreen);
        return;
      }
      lastTap.current = { time: now, side };
      clearTimeout(tapTimer.current);
      tapTimer.current = setTimeout(() => {
        actions.toggle();
        poke();
      }, DOUBLE_TAP_MS);
      return;
    }

    // Touch: continuing a seek streak
    if (side !== 'center' && streak.current.side === side && now < streak.current.until) {
      clearTimeout(tapTimer.current);
      seekFromTap(side);
      return;
    }

    // Touch: double tap on the sides seeks
    if (side !== 'center' && lastTap.current.side === side && now - lastTap.current.time < DOUBLE_TAP_MS) {
      clearTimeout(tapTimer.current);
      lastTap.current = { time: 0, side: null };
      seekFromTap(side);
      return;
    }

    lastTap.current = { time: now, side };
    clearTimeout(tapTimer.current);
    const toggleControls = () => {
      if (visible && playing) {
        clearTimeout(hideTimer.current);
        setVisible(false);
      } else {
        poke();
      }
    };
    if (side === 'center') toggleControls();
    else tapTimer.current = setTimeout(toggleControls, DOUBLE_TAP_MS);
  };

  const control = (handler) => ({
    'data-control': true,
    onClick: (e) => {
      e.stopPropagation();
      handler(e);
      poke();
    },
  });

  const showControls = visible || !playing || scrubbing;
  const canSong = hasAudio(track);
  const edgeX = 'px-[max(12px,env(safe-area-inset-left))] pr-[max(12px,env(safe-area-inset-right))]';

  return (
    <div
      ref={rootRef}
      className={cx(
        'absolute inset-0 z-20 select-none touch-none',
        showControls ? 'cursor-default' : 'cursor-none',
        needsGesture && 'pointer-events-none'
      )}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { pointerStart.current = null; }}
      onPointerMove={(e) => e.pointerType === 'mouse' && poke()}
      onMouseLeave={() => playing && !scrubbing && setVisible(false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Double-tap seek ripple */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={`${ripple.side}-${ripple.total}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cx(
              'absolute inset-y-0 w-[38%] flex items-center justify-center pointer-events-none bg-white/10',
              ripple.side === 'left' ? 'left-0 rounded-r-[50%]' : 'right-0 rounded-l-[50%]'
            )}
          >
            <div className="flex flex-col items-center gap-1 text-white">
              <div className="flex">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="text-lg leading-none"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 0.6, delay: (ripple.side === 'left' ? 2 - i : i) * 0.12, repeat: Infinity }}
                  >
                    {ripple.side === 'left' ? '◀' : '▶'}
                  </motion.span>
                ))}
              </div>
              <span className="text-xs font-semibold">{ripple.total} seconds</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div
        className={cx(
          'absolute inset-0 transition-opacity duration-200',
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Top bar */}
        <div className={cx('absolute top-0 inset-x-0 flex items-center gap-2 pt-[max(8px,env(safe-area-inset-top))]', edgeX)}>
          {(showMinimize || isFullscreen) && (
            <button
              type="button"
              {...control(() => (isFullscreen ? onToggleFullscreen(false) : onMinimize()))}
              className="w-10 h-10 -ml-1 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:bg-white/20"
              aria-label={isFullscreen ? 'Exit full screen' : 'Minimize player'}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}
          <div className={cx('min-w-0 flex-1', !immersive && 'invisible')}>
            <p className="text-white text-sm sm:text-base font-semibold truncate">{track?.title}</p>
            <p className="text-white/70 text-xs truncate">{track?.artist || album.artist}</p>
          </div>
          {canSong && (
            <button
              type="button"
              {...control(() => actions.setMode('audio'))}
              className="h-9 px-3 flex items-center gap-1.5 rounded-full bg-black/40 text-white text-xs font-semibold hover:bg-black/60 border border-white/15"
              aria-label="Switch to audio only"
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Audio only</span>
            </button>
          )}
        </div>

        {/* Center transport */}
        <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-14 pointer-events-none">
          <button
            type="button"
            {...control(actions.prev)}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 active:scale-90 transition"
            aria-label="Previous"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button
            type="button"
            {...control(actions.toggle)}
            className="pointer-events-auto w-16 h-16 sm:w-[72px] sm:h-[72px] flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 active:scale-90 transition"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {buffering ? (
              <Loader2 className="w-9 h-9 animate-spin" />
            ) : playing ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>
          <button
            type="button"
            {...control(actions.next)}
            className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 active:scale-90 transition"
            aria-label="Next"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Bottom bar */}
        <div
          className={cx(
            'absolute inset-x-0 bottom-0 flex flex-col',
            immersive ? 'pb-[max(10px,env(safe-area-inset-bottom))]' : 'pb-2.5',
            edgeX
          )}
        >
          <div className="flex items-center gap-2 text-white">
            <span className="text-xs sm:text-[13px] font-medium tabular-nums">
              {formatTime(status.current)}
              <span className="text-white/60"> / {formatTime(status.duration)}</span>
            </span>
            <div className="flex-1" />
            <div className="hidden [@media(pointer:fine)]:flex items-center gap-1 group/vol" data-control>
              <button
                type="button"
                {...control(actions.toggleMute)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10"
                aria-label={player.muted ? 'Unmute' : 'Mute'}
              >
                {player.muted || player.volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={player.muted ? 0 : player.volume}
                onChange={(e) => actions.setVolume(parseFloat(e.target.value))}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 focus:w-20 focus:opacity-100 transition-[width,opacity] duration-200 accent-[var(--accent)] cursor-pointer"
                aria-label="Volume"
              />
            </div>
            <button
              type="button"
              {...control(() => onToggleFullscreen(!isFullscreen))}
              className="w-10 h-10 -mr-1 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20"
              aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
          {immersive && (
            <div data-control className="pt-1">
              <SeekBar
                variant="overlay"
                current={status.current}
                duration={status.duration}
                buffered={status.buffered}
                onSeek={actions.seek}
                onScrubChange={(v) => setScrubbing(v != null)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Buffering indicator while controls are hidden */}
      {buffering && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-12 h-12 text-white/90 animate-spin drop-shadow" />
        </div>
      )}

      {/* Portrait: progress line glued to the bottom edge of the video, like YouTube */}
      {!immersive && (
        <div data-control className="absolute inset-x-0 bottom-0 z-10">
          <SeekBar
            variant="overlay"
            current={status.current}
            duration={status.duration}
            buffered={status.buffered}
            onSeek={actions.seek}
            onScrubChange={(v) => setScrubbing(v != null)}
            hideThumb={!showControls}
          />
        </div>
      )}

      {needsGesture && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold whitespace-nowrap">
          Tap the video to start playback
        </div>
      )}
    </div>
  );
}
