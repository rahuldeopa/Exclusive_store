import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  ListMusic,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Loader2,
} from 'lucide-react';
import MediaStage from './MediaStage';
import SeekBar from './SeekBar';
import { CoverArt, DownloadButtons, EqBars, ModeSwitch, VideoThumb } from './parts';
import {
  PHONE_LANDSCAPE_QUERY,
  WIDE_QUERY,
  canElementFullscreen,
  cx,
  exitFullscreen,
  formatTime,
  getFullscreenElement,
  requestFullscreen,
  useMediaQuery,
} from './utils';

/**
 * Full-screen "now playing" experience + mini player.
 *
 * The media element lives in a single DOM tree whose classes change with the
 * layout (portrait, phone landscape, wide, immersive, mini). It is never
 * re-mounted, so rotating the phone, minimizing or expanding never interrupts playback.
 */
export default function AlbumPlayer({ player, onShare, shareState }) {
  const { view, mode, track, album, status, actions, wantPlay } = player;
  const phoneLandscape = useMediaQuery(PHONE_LANDSCAPE_QUERY);
  const wide = useMediaQuery(WIDE_QUERY);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const rootRef = useRef(null);
  const historyPushed = useRef(false);
  const swipeStart = useRef(null);

  const expanded = view === 'expanded';
  const isVideo = mode === 'video';
  // Pseudo-fullscreen (iPhone fallback) only applies while watching video in the expanded view.
  const fullscreenActive = isFullscreen || (pseudoFullscreen && expanded && isVideo);
  const immersive = expanded && isVideo && (phoneLandscape || fullscreenActive);
  const variant = view === 'mini' ? 'mini' : immersive ? 'immersive' : wide ? 'wide' : phoneLandscape ? 'landscape' : 'portrait';

  // ---------- fullscreen ----------
  useEffect(() => {
    const onChange = () => {
      const active = Boolean(getFullscreenElement());
      setIsFullscreen(active);
      if (!active) {
        try {
          screen.orientation?.unlock?.();
        } catch {
          // ignore
        }
      }
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange);
    };
  }, []);

  const toggleFullscreen = useCallback(async (want) => {
    if (!want) {
      exitFullscreen();
      setPseudoFullscreen(false);
      return;
    }
    if (canElementFullscreen()) {
      if (await requestFullscreen(rootRef.current)) return;
    }
    // iPhone: hand native <video> to the system player, otherwise fill the viewport.
    const el = player.engineRef.current?.getElement?.();
    if (el?.webkitEnterFullscreen && el.tagName === 'VIDEO') {
      try {
        el.webkitEnterFullscreen();
        return;
      } catch {
        // fall through
      }
    }
    setPseudoFullscreen(true);
  }, [player.engineRef]);

  // Leaving video / the expanded view always leaves fullscreen.
  useEffect(() => {
    if (expanded && isVideo) return;
    if (getFullscreenElement()) exitFullscreen();
  }, [expanded, isVideo]);

  // Lets page-level CSS react to the player (e.g. hide floating buttons under it).
  useEffect(() => {
    document.documentElement.dataset.albumPlayer = view;
    return () => {
      delete document.documentElement.dataset.albumPlayer;
    };
  }, [view]);

  // ---------- scroll lock while expanded ----------
  useEffect(() => {
    if (!expanded) return undefined;
    const { body, documentElement } = document;
    const prev = [body.style.overflow, documentElement.style.overflow];
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    return () => {
      [body.style.overflow, documentElement.style.overflow] = prev;
    };
  }, [expanded]);

  // ---------- Android back button / gesture minimizes the player ----------
  useEffect(() => {
    if (!expanded) return undefined;
    if (!historyPushed.current) {
      window.history.pushState({ ...(window.history.state || {}), albumPlayer: true }, '');
      historyPushed.current = true;
    }
    const onPop = () => {
      historyPushed.current = false;
      actions.minimize();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [expanded, actions]);

  const minimize = useCallback(() => {
    if (getFullscreenElement()) exitFullscreen();
    setPseudoFullscreen(false);
    if (historyPushed.current && window.history.state?.albumPlayer) {
      window.history.back(); // popstate handler minimizes
    } else {
      actions.minimize();
    }
  }, [actions]);

  const close = useCallback(() => {
    if (historyPushed.current && window.history.state?.albumPlayer) {
      historyPushed.current = false;
      window.history.back();
    }
    actions.close();
  }, [actions]);

  // ---------- keyboard shortcuts (desktop) ----------
  useEffect(() => {
    if (view === 'closed') return undefined;
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      const key = e.key.toLowerCase();
      const handled = {
        ' ': actions.toggle,
        k: actions.toggle,
        j: () => actions.seekBy(-10),
        l: () => actions.seekBy(10),
        arrowleft: () => actions.seekBy(-5),
        arrowright: () => actions.seekBy(5),
        m: actions.toggleMute,
        n: actions.next,
        p: actions.prev,
        f: () => isVideo && expanded && toggleFullscreen(!fullscreenActive),
        escape: () => (fullscreenActive ? toggleFullscreen(false) : expanded && minimize()),
      }[key];
      if (!handled) return;
      // Let focused buttons handle their own Space/Enter
      if (key === ' ' && (tag === 'BUTTON' || e.target?.getAttribute?.('role') === 'slider')) return;
      e.preventDefault();
      handled();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [view, actions, isVideo, expanded, fullscreenActive, toggleFullscreen, minimize]);

  // ---------- small enter animation when switching between mini / expanded ----------
  const lastView = useRef(view);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || lastView.current === view) return;
    const from = lastView.current;
    lastView.current = view;
    if (from === 'closed' || !el.animate) return;
    el.animate(
      view === 'mini'
        ? [{ transform: 'translateY(-24px)', opacity: 0.4 }, { transform: 'none', opacity: 1 }]
        : [{ transform: 'translateY(48px)', opacity: 0.6 }, { transform: 'none', opacity: 1 }],
      { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
  }, [view]);

  if (!track || view === 'closed') return null;

  const L = LAYOUT[variant](isVideo);
  const playing = status.playing;
  const busy = status.buffering && wantPlay;

  return (
    <motion.div
      ref={rootRef}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '110%' }}
      transition={{ type: 'spring', damping: 32, stiffness: 320 }}
      className={L.root}
      data-variant={variant}
      data-mode={mode}
      role={expanded ? 'dialog' : 'region'}
      aria-modal={expanded || undefined}
      aria-label={expanded ? `Now playing: ${track.title}` : 'Mini player'}
      onPointerDown={(e) => {
        if (variant === 'mini') swipeStart.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (variant !== 'mini' || !start) return;
        // Mini player: swipe up opens it, swipe down dismisses it
        const dy = e.clientY - start.y;
        if (Math.abs(dy) < 30 || Math.abs(dy) < Math.abs(e.clientX - start.x)) return;
        if (dy < 0) actions.expand();
        else close();
      }}
    >
      {/* Ambient backdrop from the artwork */}
      {expanded && !immersive && <Backdrop album={album} track={track} />}

      <div className={L.frame}>
        <div className={L.primary}>
          {L.topBar && (
            <TopBar player={player} onMinimize={minimize} showSwitch={!isVideo} />
          )}

          <div className={L.stageWrap}>
            <div className={L.stage}>
              <MediaStage
                player={player}
                interactive={expanded}
                immersive={immersive}
                isFullscreen={fullscreenActive}
                onToggleFullscreen={toggleFullscreen}
                onMinimize={minimize}
                showMinimize={!L.topBar}
              />
              {variant === 'mini' && (
                <button
                  type="button"
                  className="absolute inset-0 z-40"
                  onClick={actions.expand}
                  aria-label="Open player"
                />
              )}
            </div>
          </div>

          {variant === 'mini' && (
            <MiniBar player={player} busy={busy} onClose={close} />
          )}

          {L.details && (
            <div className={L.details}>
              {variant === 'landscape' && <TopBar player={player} onMinimize={minimize} showSwitch compact />}
              <NowPlayingInfo player={player} onShare={onShare} shareState={shareState} />
              {!isVideo && <SongControls player={player} busy={busy} compact={variant === 'landscape'} />}
              {!isVideo && (
                <ActionsRow player={player} onShare={onShare} shareState={shareState} showSwitch={false} />
              )}
              {variant !== 'wide' && <UpNext player={player} />}
            </div>
          )}
        </div>

        {variant === 'wide' && (
          <aside className="hidden lg:flex flex-col w-[380px] xl:w-[420px] shrink-0 h-full border-l border-white/[0.06] bg-black/20">
            <UpNext player={player} scrollable />
          </aside>
        )}
      </div>

      {variant === 'mini' && (
        <div className="absolute inset-x-3 bottom-0">
          <SeekBar variant="mini" current={status.current} duration={status.duration} />
        </div>
      )}

      {/* Keep the play state readable for assistive tech */}
      <span className="sr-only" aria-live="polite">{playing ? 'Playing' : 'Paused'} {track.title}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Layout table                                                        */
/* ------------------------------------------------------------------ */

const PANEL = 'fixed inset-0 z-[70] text-white bg-[#0b0a0e] overflow-hidden';
const SAFE_X = 'pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]';

const LAYOUT = {
  portrait: (isVideo) => ({
    root: PANEL,
    frame: 'relative h-full',
    primary: isVideo
      ? 'h-full flex flex-col'
      : 'h-full overflow-y-auto overscroll-contain',
    topBar: !isVideo,
    stageWrap: isVideo
      ? 'relative shrink-0 w-full bg-black pt-[env(safe-area-inset-top)]'
      : 'px-6 pt-2 pb-6 flex justify-center',
    stage: isVideo
      ? 'relative w-full aspect-video max-h-[45vh] mx-auto'
      : 'relative w-full max-w-[min(100%,44vh,440px)] aspect-square rounded-2xl overflow-hidden shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)]',
    details: isVideo
      ? 'flex-1 min-h-0 overflow-y-auto overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom))]'
      : 'pb-[calc(2rem+env(safe-area-inset-bottom))]',
  }),
  landscape: () => ({
    root: PANEL,
    frame: 'relative h-full',
    primary: 'h-full flex items-stretch',
    topBar: false,
    stageWrap: 'h-full shrink-0 flex items-center pl-[max(1.25rem,env(safe-area-inset-left))] py-5',
    stage: 'relative h-full max-h-[340px] aspect-square rounded-xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]',
    details: 'flex-1 min-w-0 h-full overflow-y-auto overscroll-contain pr-[max(0.5rem,env(safe-area-inset-right))] pb-6',
  }),
  wide: (isVideo) => ({
    root: PANEL,
    frame: 'relative h-full flex',
    primary: 'flex-1 min-w-0 h-full overflow-y-auto overscroll-contain',
    topBar: true,
    stageWrap: isVideo ? 'px-6 xl:px-10' : 'px-6 pt-2 pb-8 flex justify-center',
    stage: isVideo
      ? 'relative w-full max-w-[1280px] mx-auto aspect-video rounded-xl overflow-hidden bg-black shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)]'
      : 'relative w-full max-w-[min(440px,50vh)] aspect-square rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]',
    details: 'max-w-[1280px] mx-auto px-6 xl:px-10 pb-12',
  }),
  immersive: () => ({
    root: 'fixed inset-0 z-[70] text-white bg-black overflow-hidden',
    frame: 'h-full',
    primary: 'h-full',
    topBar: false,
    stageWrap: 'fixed inset-0 z-30 bg-black',
    stage: 'relative w-full h-full',
    details: null,
  }),
  mini: (isVideo) => ({
    root: cx(
      'fixed z-[70] text-white left-2 right-2 sm:left-auto sm:right-4 sm:w-[420px]',
      'bottom-[calc(0.5rem+env(safe-area-inset-bottom))] h-16 rounded-2xl overflow-hidden',
      'bg-[#1c1a21]/95 backdrop-blur-xl border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] touch-none'
    ),
    frame: 'h-full flex items-center',
    primary: 'h-full flex-1 min-w-0 flex items-center',
    topBar: false,
    stageWrap: 'h-full shrink-0 py-2 pl-2',
    stage: cx('relative h-full rounded-lg overflow-hidden', isVideo ? 'aspect-video' : 'aspect-square'),
    details: null,
  }),
};

/* ------------------------------------------------------------------ */
/* Pieces                                                              */
/* ------------------------------------------------------------------ */

function Backdrop({ album, track }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <CoverArt
        album={album}
        track={track}
        rounded=""
        className="absolute -inset-[20%] opacity-40 blur-[90px] saturate-150 scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#0b0a0e]/85 to-[#0b0a0e]" />
    </div>
  );
}

function TopBar({ player, onMinimize, showSwitch, compact = false }) {
  const { album } = player;
  return (
    <div
      className={cx(
        'relative z-10 flex items-center gap-2',
        compact ? 'pt-3 pb-1' : cx('pt-[max(0.75rem,env(safe-area-inset-top))] pb-2', SAFE_X)
      )}
    >
      <button
        type="button"
        onClick={onMinimize}
        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-white/90 hover:bg-white/10 active:bg-white/15"
        aria-label="Minimize player"
      >
        <ChevronDown className="w-7 h-7" />
      </button>
      <div className="flex-1 min-w-0 flex justify-center">
        {showSwitch ? (
          <ModeSwitch player={player} size={compact ? 'sm' : 'md'} />
        ) : (
          <div className="text-center min-w-0">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/50 font-semibold">Playing from album</p>
            <p className="text-sm font-semibold truncate">{album.title}</p>
          </div>
        )}
      </div>
      <div className="w-10 h-10 -mr-2" />
    </div>
  );
}

function NowPlayingInfo({ player, onShare, shareState }) {
  const { track, album, mode } = player;
  const isVideo = mode === 'video';
  return (
    <>
      <div className={cx(isVideo ? 'pt-4' : 'pt-1', 'px-5 sm:px-6 lg:px-0 min-w-0')}>
        <h2 className={cx('font-sans font-bold tracking-tight text-white leading-tight', isVideo ? 'text-lg sm:text-xl lg:text-2xl' : 'text-2xl sm:text-[28px] truncate')}>
          {track.title}
        </h2>
        <p className="mt-1 text-sm text-white/60 truncate">
          {track.credits || track.artist || album.artist}
        </p>
      </div>
      {isVideo && (
        <ActionsRow player={player} onShare={onShare} shareState={shareState} showSwitch />
      )}
    </>
  );
}

function ActionsRow({ player, onShare, shareState, showSwitch }) {
  const { track } = player;
  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-5 sm:px-6 lg:px-0 pb-1">
        {showSwitch && <ModeSwitch player={player} size="sm" className="shrink-0" />}
        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-full border border-white/10 bg-white/[0.08] text-[13px] font-semibold text-white/90 hover:bg-white/[0.14] active:bg-white/20"
          >
            {shareState === 'copied' ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
            {shareState === 'copied' ? 'Link copied' : 'Share'}
          </button>
        )}
        <DownloadButtons key={track.id} track={track} />
      </div>
    </div>
  );
}

function SongControls({ player, busy, compact }) {
  const { status, actions, repeat, shuffle, volume, muted } = player;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;
  return (
    <div className={cx('px-5 sm:px-6 lg:px-0', compact ? 'mt-3' : 'mt-5')}>
      <SeekBar current={status.current} duration={status.duration} buffered={status.buffered} onSeek={actions.seek} />
      <div className="flex justify-between text-[11px] font-medium tabular-nums text-white/55 -mt-1">
        <span>{formatTime(status.current)}</span>
        <span>{formatTime(status.duration)}</span>
      </div>

      <div className={cx('flex items-center justify-between max-w-[420px] mx-auto', compact ? 'mt-1' : 'mt-3')}>
        <IconToggle active={shuffle} onClick={actions.toggleShuffle} label="Shuffle">
          <Shuffle className="w-5 h-5" />
        </IconToggle>
        <button
          type="button"
          onClick={actions.prev}
          className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 transition"
          aria-label="Previous"
        >
          <SkipBack className="w-7 h-7 fill-current" />
        </button>
        <button
          type="button"
          onClick={actions.toggle}
          className={cx(
            'rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition',
            compact ? 'w-14 h-14' : 'w-[68px] h-[68px]'
          )}
          aria-label={status.playing ? 'Pause' : 'Play'}
        >
          {busy ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : status.playing ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>
        <button
          type="button"
          onClick={actions.next}
          className="w-12 h-12 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 transition"
          aria-label="Next"
        >
          <SkipForward className="w-7 h-7 fill-current" />
        </button>
        <IconToggle active={repeat !== 'off'} onClick={actions.cycleRepeat} label={`Repeat ${repeat}`}>
          <RepeatIcon className="w-5 h-5" />
        </IconToggle>
      </div>

      {/* Hardware volume is used on phones; show a slider on desktop only */}
      <div className="hidden [@media(pointer:fine)]:flex items-center gap-3 max-w-[420px] mx-auto mt-4">
        <button type="button" onClick={actions.toggleMute} className="text-white/70 hover:text-white" aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => actions.setVolume(parseFloat(e.target.value))}
          className="flex-1 accent-[var(--accent)] cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}

function IconToggle({ active, onClick, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cx(
        'relative w-11 h-11 flex items-center justify-center rounded-full transition-colors',
        active ? 'text-[var(--accent)]' : 'text-white/60 hover:text-white'
      )}
    >
      {children}
      {active && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent)]" />}
    </button>
  );
}

function MiniBar({ player, busy, onClose }) {
  const { track, album, status, actions } = player;
  return (
    <div className="flex-1 min-w-0 h-full flex items-center">
      <button
        type="button"
        onClick={actions.expand}
        className="flex-1 min-w-0 h-full text-left px-3"
        aria-label={`Open player: ${track.title}`}
      >
        <p className="text-sm font-semibold truncate">{track.title}</p>
        <p className="text-xs text-white/55 truncate">{track.artist || album.artist}</p>
      </button>
      <button
        type="button"
        onClick={actions.toggle}
        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition"
        aria-label={status.playing ? 'Pause' : 'Play'}
      >
        {busy ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : status.playing ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current ml-0.5" />
        )}
      </button>
      <button
        type="button"
        onClick={actions.next}
        className="hidden min-[380px]:flex w-11 h-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10 active:scale-90 transition"
        aria-label="Next"
      >
        <SkipForward className="w-5 h-5 fill-current" />
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-11 h-11 shrink-0 mr-1 flex items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white active:scale-90 transition"
        aria-label="Close player"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

function UpNext({ player, scrollable = false }) {
  const { tracks, order, trackIndex, album, mode, status, repeat, shuffle, actions } = player;
  const listRef = useRef(null);
  const isVideo = mode === 'video';
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  // Bring the current track into view, scrolling only the list itself (never the whole player).
  useEffect(() => {
    const list = listRef.current;
    const el = list?.querySelector('[data-current="true"]');
    if (!scrollable || !el) return;
    const top = el.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: Math.max(0, top - 8), behavior: 'smooth' });
    }
  }, [trackIndex, scrollable]);

  return (
    <section className={cx('mt-6', scrollable && 'mt-0 flex flex-col h-full min-h-0')} aria-label="Up next">
      <div className={cx('flex items-center gap-2 px-5 sm:px-6', scrollable ? 'pt-5 pb-3' : 'pb-2')}>
        <ListMusic className="w-4 h-4 text-[var(--accent)]" />
        <h3 className="font-sans text-sm font-bold tracking-wide uppercase text-white/80 flex-1">Up next</h3>
        <IconToggle active={shuffle} onClick={actions.toggleShuffle} label="Shuffle">
          <Shuffle className="w-4 h-4" />
        </IconToggle>
        <IconToggle active={repeat !== 'off'} onClick={actions.cycleRepeat} label={`Repeat ${repeat}`}>
          <RepeatIcon className="w-4 h-4" />
        </IconToggle>
      </div>
      <ol ref={listRef} className={cx('px-2 sm:px-3', scrollable && 'flex-1 min-h-0 overflow-y-auto overscroll-contain pb-6')}>
        {order.map((index) => {
          const t = tracks[index];
          const current = index === trackIndex;
          return (
            <li key={t.id} data-current={current}>
              <button
                type="button"
                onClick={() => actions.playTrack(index)}
                className={cx(
                  'w-full flex items-center gap-3 p-2 rounded-xl text-left transition-colors',
                  current ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05] active:bg-white/[0.08]'
                )}
                aria-current={current || undefined}
              >
                {isVideo ? (
                  <div className="relative w-28 sm:w-32 shrink-0">
                    <VideoThumb album={album} track={t} className="w-full aspect-video" />
                    <span className="absolute bottom-1 right-1 px-1 rounded bg-black/80 text-[10px] font-semibold tabular-nums text-white">
                      {t.durationLabel}
                    </span>
                  </div>
                ) : (
                  <CoverArt album={album} track={t} rounded="rounded-md" className="w-12 h-12 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className={cx('text-sm font-semibold truncate', current ? 'text-[var(--accent)]' : 'text-white')}>{t.title}</p>
                  <p className="text-xs text-white/50 truncate mt-0.5">{t.credits || t.artist || album.artist}</p>
                </div>
                {current ? (
                  <EqBars playing={status.playing} className="mr-2" />
                ) : (
                  !isVideo && <span className="text-xs tabular-nums text-white/40 mr-2">{t.durationLabel}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
