import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

let apiPromise = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT);
    };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    tag.onerror = () => {
      apiPromise = null;
      reject(new Error('YouTube API failed to load'));
    };
    document.head.appendChild(tag);
  });
  return apiPromise;
}

const STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

/**
 * YouTube IFrame player driven entirely by our own controls (controls=0).
 * One player instance is kept for the lifetime of the engine; tracks are swapped
 * with loadVideoById so mobile browsers keep the playback session unlocked.
 */
const YouTubeEngine = forwardRef(function YouTubeEngine(
  { videoId, autoplay, startAt = 0, volume = 1, muted = false, events },
  ref
) {
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const readyRef = useRef(false);
  const eventsRef = useRef(events);
  const optsRef = useRef({ autoplay, startAt, volume, muted });
  const loadedIdRef = useRef(null);
  const videoIdRef = useRef(videoId);
  const gestureTimerRef = useRef(null);
  const stateRef = useRef(STATE.UNSTARTED);

  useEffect(() => {
    eventsRef.current = events;
    optsRef.current = { autoplay, startAt, volume, muted };
  });

  const emit = (name, ...args) => eventsRef.current?.[name]?.(...args);

  // If playback hasn't actually started shortly after we asked for it, the
  // browser blocked autoplay (typically iOS). Ask the user to tap the video.
  const watchForBlockedPlay = () => {
    clearTimeout(gestureTimerRef.current);
    gestureTimerRef.current = setTimeout(() => {
      if (stateRef.current !== STATE.PLAYING && stateRef.current !== STATE.BUFFERING) {
        emit('onNeedsGesture', true);
      }
    }, 3500);
  };

  const play = () => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    p.playVideo();
    watchForBlockedPlay();
  };

  useImperativeHandle(ref, () => ({
    play,
    pause: () => {
      clearTimeout(gestureTimerRef.current);
      playerRef.current?.pauseVideo?.();
    },
    seek: (time) => playerRef.current?.seekTo?.(Math.max(0, time), true),
    getElement: () => null,
  }));

  // cc_load_policy=0 is only a hint: YouTube still turns captions on when the
  // uploader or the viewer's account defaults to them, and again for every new
  // video. Unload the captions module whenever it appears.
  const hideCaptions = () => {
    const p = playerRef.current;
    if (!p?.unloadModule) return;
    try {
      p.unloadModule('captions');
      p.unloadModule('cc');
    } catch {
      // module not loaded
    }
  };

  const applyAudio = () => {
    const p = playerRef.current;
    if (!p || !readyRef.current) return;
    const { volume: v, muted: m } = optsRef.current;
    p.setVolume(Math.round(v * 100));
    if (m) p.mute();
    else p.unMute();
  };

  const loadVideo = (id) => {
    const p = playerRef.current;
    if (!p || !readyRef.current || !id) return;
    const { autoplay: shouldPlay, startAt: resumeAt } = optsRef.current;
    loadedIdRef.current = id;
    emit('onWaiting');
    if (shouldPlay) {
      p.loadVideoById({ videoId: id, startSeconds: resumeAt || 0 });
      watchForBlockedPlay();
    } else {
      p.cueVideoById({ videoId: id, startSeconds: resumeAt || 0 });
    }
  };

  // Create the player once.
  useEffect(() => {
    let cancelled = false;
    const mount = document.createElement('div');
    hostRef.current?.appendChild(mount);

    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            cc_load_policy: 0,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              if (cancelled) return;
              readyRef.current = true;
              applyAudio();
              hideCaptions();
              loadVideo(videoIdRef.current);
            },
            onStateChange: ({ data }) => {
              stateRef.current = data;
              switch (data) {
                case STATE.PLAYING:
                  hideCaptions();
                  clearTimeout(gestureTimerRef.current);
                  emit('onNeedsGesture', false);
                  emit('onPlay');
                  emit('onPlaying');
                  break;
                case STATE.PAUSED:
                  emit('onPause');
                  break;
                case STATE.BUFFERING:
                  emit('onWaiting');
                  break;
                case STATE.CUED:
                  emit('onCanPlay');
                  emit('onReady', { duration: playerRef.current?.getDuration?.() || 0 });
                  break;
                case STATE.ENDED:
                  emit('onPause');
                  emit('onEnded');
                  break;
                default:
                  break;
              }
            },
            // Fired when a module (e.g. captions) loads for the current video.
            onApiChange: hideCaptions,
            onError: ({ data }) => emit('onError', `youtube error ${data}`),
          },
        });
      })
      .catch((err) => emit('onError', err.message));

    const poll = setInterval(() => {
      const p = playerRef.current;
      if (!p || !readyRef.current || !p.getCurrentTime) return;
      emit('onTime', {
        current: p.getCurrentTime() || 0,
        duration: p.getDuration() || 0,
        buffered: p.getVideoLoadedFraction?.() || 0,
      });
    }, 250);

    return () => {
      cancelled = true;
      clearInterval(poll);
      clearTimeout(gestureTimerRef.current);
      try {
        playerRef.current?.destroy?.();
      } catch {
        // already gone
      }
      playerRef.current = null;
      readyRef.current = false;
      mount.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    videoIdRef.current = videoId;
    if (readyRef.current && loadedIdRef.current !== videoId) loadVideo(videoId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  useEffect(() => {
    applyAudio();
  }, [volume, muted]);

  return <div ref={hostRef} className="yt-host absolute inset-0 w-full h-full bg-black" />;
});

export default YouTubeEngine;
