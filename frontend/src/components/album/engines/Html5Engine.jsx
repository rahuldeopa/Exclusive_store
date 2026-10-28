import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

/**
 * Plays direct media files through a single persistent <audio>/<video> element.
 * The element is reused across tracks (only `src` changes) so mobile browsers keep
 * treating it as user-activated, which lets the next track autoplay.
 */
const Html5Engine = forwardRef(function Html5Engine(
  { kind = 'video', src, poster, autoplay, startAt = 0, volume = 1, muted = false, loadTimeout = 0, events },
  ref
) {
  const mediaRef = useRef(null);
  const eventsRef = useRef(events);
  const optsRef = useRef({ autoplay, startAt });

  useEffect(() => {
    eventsRef.current = events;
    optsRef.current = { autoplay, startAt };
  });

  const emit = (name, ...args) => eventsRef.current?.[name]?.(...args);

  const play = () => {
    const el = mediaRef.current;
    if (!el) return;
    const p = el.play();
    p?.catch((err) => {
      if (err?.name === 'NotAllowedError') emit('onNeedsGesture', true);
    });
  };

  useImperativeHandle(ref, () => ({
    play,
    pause: () => mediaRef.current?.pause(),
    seek: (time) => {
      const el = mediaRef.current;
      if (!el) return;
      const max = Number.isFinite(el.duration) ? el.duration : time;
      el.currentTime = Math.max(0, Math.min(time, max));
    },
    getElement: () => mediaRef.current,
  }));

  // Wire up element events once.
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return undefined;

    const bufferedFraction = () => {
      const { buffered, currentTime, duration } = el;
      if (!duration || !Number.isFinite(duration) || !buffered?.length) return 0;
      for (let i = 0; i < buffered.length; i += 1) {
        if (buffered.start(i) <= currentTime + 0.5 && buffered.end(i) >= currentTime) {
          return buffered.end(i) / duration;
        }
      }
      return 0;
    };

    const time = () => emit('onTime', {
      current: el.currentTime,
      duration: Number.isFinite(el.duration) ? el.duration : 0,
      buffered: bufferedFraction(),
    });

    const handlers = {
      timeupdate: time,
      progress: time,
      durationchange: time,
      play: () => emit('onPlay'),
      playing: () => {
        emit('onNeedsGesture', false);
        emit('onPlaying');
      },
      // A failing source also fires "pause"; that isn't the user pausing, so don't
      // let it cancel autoplay of the fallback source.
      pause: () => {
        if (!el.error) emit('onPause');
      },
      waiting: () => emit('onWaiting'),
      stalled: () => emit('onWaiting'),
      canplay: () => emit('onCanPlay'),
      ended: () => emit('onEnded'),
      error: () => {
        // Errors on an emptied element (src removed) are expected noise.
        if (!el.getAttribute('src')) return;
        emit('onError', el.error?.message || `media error ${el.error?.code ?? ''}`.trim());
      },
    };

    Object.entries(handlers).forEach(([name, fn]) => el.addEventListener(name, fn));
    return () => Object.entries(handlers).forEach(([name, fn]) => el.removeEventListener(name, fn));
  }, []);

  // Load a new source. Playback is requested synchronously so it stays inside the
  // user gesture that selected the track (required by iOS Safari).
  useEffect(() => {
    const el = mediaRef.current;
    if (!el || !src) return undefined;

    const { autoplay: shouldPlay, startAt: resumeAt } = optsRef.current;
    let metadataLoaded = false;

    const onMeta = () => {
      metadataLoaded = true;
      if (resumeAt > 0 && Number.isFinite(el.duration) && resumeAt < el.duration - 1) {
        el.currentTime = resumeAt;
      }
      emit('onReady', { duration: el.duration });
    };

    el.addEventListener('loadedmetadata', onMeta, { once: true });
    el.src = src;
    el.load();
    emit('onWaiting');
    if (shouldPlay) play();

    let timer;
    if (loadTimeout > 0) {
      timer = setTimeout(() => {
        if (!metadataLoaded) emit('onError', 'timeout');
      }, loadTimeout);
    }

    return () => {
      clearTimeout(timer);
      el.removeEventListener('loadedmetadata', onMeta);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (mediaRef.current) mediaRef.current.muted = muted;
  }, [muted]);

  // Release the network connection when the engine goes away.
  useEffect(() => () => {
    const el = mediaRef.current;
    if (!el) return;
    el.pause();
    el.removeAttribute('src');
    el.load();
  }, []);

  if (kind === 'audio') {
    return <audio ref={mediaRef} preload="auto" className="hidden" />;
  }

  return (
    <video
      ref={mediaRef}
      poster={poster}
      playsInline
      preload="auto"
      disablePictureInPicture={false}
      controlsList="nodownload noremoteplayback"
      className="absolute inset-0 w-full h-full object-contain bg-black"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
});

export default Html5Engine;
