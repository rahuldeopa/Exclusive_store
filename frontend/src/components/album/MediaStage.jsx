import { forwardRef, useImperativeHandle } from 'react';
import { AlertCircle, ChevronDown, RotateCw, SkipForward } from 'lucide-react';
import Html5Engine from './engines/Html5Engine';
import YouTubeEngine from './engines/YouTubeEngine';
import VideoOverlay from './VideoOverlay';
import { CoverArt } from './parts';
import { cx } from './utils';

/** Embedded third-party player (e.g. Google Drive preview). We can't control it. */
const IframeEngine = forwardRef(function IframeEngine({ src, title }, ref) {
  useImperativeHandle(ref, () => ({
    play: () => {},
    pause: () => {},
    seek: () => {},
    getElement: () => null,
  }));
  return (
    <iframe
      src={src}
      title={title}
      className="absolute inset-0 w-full h-full border-0 bg-black"
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
    />
  );
});

export default function MediaStage({ player, interactive, immersive, isFullscreen, onToggleFullscreen, onMinimize, showMinimize = true }) {
  const {
    album, track, source, mode, engineRef, engineEvents, wantPlay, resumeAt, volume, muted,
    reloadKey, error, needsGesture, actions,
  } = player;

  if (!track) return null;

  const isVideo = mode === 'video';
  const common = { ref: engineRef, autoplay: wantPlay, startAt: resumeAt, volume, muted, events: engineEvents };

  let engine = null;
  if (source?.type === 'html5') {
    engine = (
      <Html5Engine
        key={`html5-${mode}-${reloadKey}`}
        {...common}
        kind={mode}
        src={source.src}
        poster={track.thumbnail}
        loadTimeout={source.timeout || 0}
      />
    );
  } else if (source?.type === 'youtube') {
    engine = <YouTubeEngine key={`yt-${reloadKey}`} {...common} videoId={source.id} />;
  } else if (source?.type === 'iframe') {
    engine = <IframeEngine key={`iframe-${source.src}`} ref={engineRef} src={source.src} title={track.title} />;
  }

  // YouTube needs a real tap on its own iframe the very first time on iOS.
  const revealForGesture = needsGesture && source?.type === 'youtube';

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {engine}

      {!isVideo && (
        <div
          className={cx(
            'absolute inset-0 z-10 transition-opacity duration-300',
            revealForGesture && 'opacity-0 pointer-events-none'
          )}
        >
          <CoverArt album={album} track={track} rounded="" className="w-full h-full" eager />
        </div>
      )}

      {isVideo && interactive && source?.type !== 'iframe' && !error && (
        <VideoOverlay
          player={player}
          immersive={immersive}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          onMinimize={onMinimize}
          showMinimize={showMinimize}
        />
      )}

      {isVideo && interactive && showMinimize && source?.type === 'iframe' && (
        <button
          type="button"
          onClick={onMinimize}
          className="absolute top-2 left-2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
          aria-label="Minimize player"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      )}

      {revealForGesture && !isVideo && interactive && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/75 text-white text-xs font-semibold whitespace-nowrap pointer-events-none">
          Tap to start playback
        </div>
      )}

      {error && interactive && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/80 backdrop-blur-sm text-center px-6">
          <AlertCircle className="w-9 h-9 text-[var(--accent)]" />
          <div>
            <p className="text-white font-semibold">Couldn&apos;t load this {isVideo ? 'video' : 'track'}</p>
            <p className="text-white/60 text-sm mt-1">Check your connection and try again.</p>
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={actions.play}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white text-black text-sm font-semibold active:scale-95 transition"
            >
              <RotateCw className="w-4 h-4" /> Retry
            </button>
            <button
              type="button"
              onClick={actions.next}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-white/10 text-white text-sm font-semibold border border-white/15 active:scale-95 transition"
            >
              <SkipForward className="w-4 h-4" /> Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
