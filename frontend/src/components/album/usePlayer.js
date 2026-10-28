import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { clamp } from './utils';

const naturalOrder = (count) => Array.from({ length: count }, (_, i) => i);

const shuffledOrder = (count, first) => {
  const rest = naturalOrder(count).filter((i) => i !== first);
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return first == null ? rest : [first, ...rest];
};

/**
 * Picks the playable sources for a track in the requested mode.
 * Audio mode falls back to the video file (played with the picture hidden),
 * and tracks that only have an embeddable iframe are always shown as video.
 */
export function resolveSources(track, preferredMode) {
  if (!track) return null;
  const video = track.video || [];
  const audio = track.audio?.length ? track.audio : video.filter((s) => s.type !== 'iframe');

  if (preferredMode === 'video' && video.length) return { mode: 'video', list: video };
  if (audio.length) return { mode: 'audio', list: audio };
  return { mode: 'video', list: video };
}

export const hasVideo = (track) => Boolean(track?.video?.length);
export const hasAudio = (track) => resolveSources(track, 'audio')?.mode === 'audio';

const EMPTY_STATUS = { playing: false, buffering: false, current: 0, duration: 0, buffered: 0 };

export function usePlayer(album) {
  const { tracks } = album;
  const [trackIndex, setTrackIndex] = useState(null);
  const [order, setOrder] = useState(() => naturalOrder(tracks.length));
  const [view, setView] = useState('closed'); // closed | expanded | mini
  const [preferredMode, setPreferredMode] = useState(album.defaultMode || 'audio');
  const [sourceIndex, setSourceIndex] = useState(0);
  const [status, setStatus] = useState(EMPTY_STATUS);
  const [error, setError] = useState(null);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [wantPlay, setWantPlay] = useState(false);
  const [resumeAt, setResumeAt] = useState(0);
  const [repeat, setRepeat] = useState('off'); // off | all | one
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const engineRef = useRef(null);
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const track = trackIndex == null ? null : tracks[trackIndex];
  const resolved = useMemo(() => resolveSources(track, preferredMode), [track, preferredMode]);
  const source = resolved?.list[sourceIndex] || null;
  const mode = resolved?.mode || preferredMode;
  const position = trackIndex == null ? -1 : order.indexOf(trackIndex);

  const loadTrack = useCallback((index, { play = true } = {}) => {
    setTrackIndex(index);
    setSourceIndex(0);
    setResumeAt(0);
    setError(null);
    setNeedsGesture(false);
    setStatus(EMPTY_STATUS);
    setWantPlay(play);
  }, []);

  /** Start (or resume) a track from the album UI. */
  const playTrack = useCallback((index, { mode: requestedMode, expand = true } = {}) => {
    const modeChanges = requestedMode && requestedMode !== preferredMode;
    if (requestedMode) setPreferredMode(requestedMode);

    if (index === trackIndex && !error) {
      if (modeChanges) setResumeAt(statusRef.current.current);
      engineRef.current?.play();
      setWantPlay(true);
    } else {
      loadTrack(index);
    }
    if (expand) setView('expanded');
    else setView((v) => (v === 'closed' ? 'mini' : v));
  }, [preferredMode, trackIndex, error, loadTrack]);

  const play = useCallback(() => {
    if (error) {
      setError(null);
      setSourceIndex(0);
      setResumeAt(statusRef.current.current);
      setReloadKey((k) => k + 1);
      setWantPlay(true);
      return;
    }
    engineRef.current?.play();
    setWantPlay(true);
  }, [error]);

  const pause = useCallback(() => {
    engineRef.current?.pause();
    setWantPlay(false);
  }, []);

  const toggle = useCallback(() => {
    if (statusRef.current.playing) pause();
    else play();
  }, [play, pause]);

  const seek = useCallback((time) => {
    const { duration } = statusRef.current;
    const t = clamp(time, 0, duration || time);
    engineRef.current?.seek(t);
    setStatus((s) => ({ ...s, current: t }));
  }, []);

  const seekBy = useCallback((delta) => seek(statusRef.current.current + delta), [seek]);

  const goToPosition = useCallback((pos) => {
    const index = order[(pos + order.length) % order.length];
    loadTrack(index);
  }, [order, loadTrack]);

  const next = useCallback(() => {
    if (position === -1) return;
    goToPosition(position + 1);
  }, [position, goToPosition]);

  const prev = useCallback(() => {
    if (position === -1) return;
    if (statusRef.current.current > 3) {
      seek(0);
      return;
    }
    goToPosition(position - 1);
  }, [position, goToPosition, seek]);

  const handleEnded = useCallback(() => {
    if (repeat === 'one') {
      engineRef.current?.seek(0);
      engineRef.current?.play();
      return;
    }
    if (position < order.length - 1 || repeat === 'all') {
      goToPosition(position + 1);
      return;
    }
    // End of album: rewind and stop.
    setWantPlay(false);
    engineRef.current?.pause();
    engineRef.current?.seek(0);
  }, [repeat, position, order.length, goToPosition]);

  /** Switch between "Song" and "Video" while keeping the playback position. */
  const setMode = useCallback((nextMode) => {
    if (!track || nextMode === mode) {
      setPreferredMode(nextMode);
      return;
    }
    if (nextMode === 'video' && !hasVideo(track)) return;
    setResumeAt(statusRef.current.current);
    setWantPlay(statusRef.current.playing || wantPlay);
    setSourceIndex(0);
    setError(null);
    setPreferredMode(nextMode);
  }, [track, mode, wantPlay]);

  const toggleShuffle = useCallback(() => {
    const nextShuffle = !shuffle;
    setShuffle(nextShuffle);
    setOrder(nextShuffle ? shuffledOrder(tracks.length, trackIndex) : naturalOrder(tracks.length));
  }, [shuffle, tracks.length, trackIndex]);

  const cycleRepeat = useCallback(() => {
    setRepeat((r) => (r === 'off' ? 'all' : r === 'all' ? 'one' : 'off'));
  }, []);

  const playAll = useCallback(({ shuffled = false, mode: requestedMode } = {}) => {
    const nextOrder = shuffled ? shuffledOrder(tracks.length) : naturalOrder(tracks.length);
    setShuffle(shuffled);
    setOrder(nextOrder);
    if (requestedMode) setPreferredMode(requestedMode);
    loadTrack(nextOrder[0]);
    setView('expanded');
  }, [tracks.length, loadTrack]);

  const close = useCallback(() => {
    engineRef.current?.pause();
    setWantPlay(false);
    setView('closed');
    setTrackIndex(null);
    setStatus(EMPTY_STATUS);
  }, []);

  /** Events emitted by whichever engine is currently mounted. */
  const engineEvents = useMemo(() => ({
    onTime: ({ current, duration, buffered }) => setStatus((s) => ({
      ...s,
      current,
      duration: duration || s.duration,
      buffered,
    })),
    onPlay: () => {
      setStatus((s) => ({ ...s, playing: true }));
      setWantPlay(true);
    },
    onPause: () => {
      setStatus((s) => ({ ...s, playing: false, buffering: false }));
      setWantPlay(false);
    },
    onWaiting: () => setStatus((s) => ({ ...s, buffering: true })),
    onPlaying: () => setStatus((s) => ({ ...s, buffering: false, playing: true })),
    onCanPlay: () => setStatus((s) => ({ ...s, buffering: false })),
    onReady: ({ duration }) => setStatus((s) => ({ ...s, duration: duration || s.duration })),
    onEnded: handleEnded,
    onNeedsGesture: setNeedsGesture,
    onError: (reason) => {
      const list = resolved?.list || [];
      if (sourceIndex < list.length - 1) {
        console.warn(`[player] source ${sourceIndex} failed (${reason}), trying fallback`);
        setResumeAt(statusRef.current.current);
        setSourceIndex(sourceIndex + 1);
        return;
      }
      console.error('[player] playback failed:', reason);
      setError(reason || 'error');
      setStatus((s) => ({ ...s, playing: false, buffering: false }));
    },
  }), [handleEnded, resolved, sourceIndex]);

  // Warm up / prefetch neighbouring tracks so skipping feels instant.
  useEffect(() => {
    if (!album.prefetch) return;
    if (trackIndex == null) {
      album.prefetch(tracks[0]);
      return;
    }
    const pos = order.indexOf(trackIndex);
    [pos + 1, pos - 1, pos + 2].forEach((p) => {
      const t = tracks[order[(p + order.length) % order.length]];
      if (t) album.prefetch(t);
    });
  }, [album, tracks, trackIndex, order]);

  useMediaSession({
    album, track, status, play, pause, next, prev, seek, seekBy,
  });

  const actions = useMemo(() => ({
    playTrack,
    playAll,
    play,
    pause,
    toggle,
    seek,
    seekBy,
    next,
    prev,
    setMode,
    toggleShuffle,
    cycleRepeat,
    setVolume: (v) => {
      setVolume(clamp(v, 0, 1));
      if (v > 0) setMuted(false);
    },
    toggleMute: () => setMuted((m) => !m),
    expand: () => setView('expanded'),
    minimize: () => setView('mini'),
    close,
  }), [playTrack, playAll, play, pause, toggle, seek, seekBy, next, prev, setMode, toggleShuffle, cycleRepeat, close]);

  return {
    album,
    tracks,
    track,
    trackIndex,
    order,
    position,
    view,
    setView,
    mode,
    preferredMode,
    source,
    sourceIndex,
    status,
    error,
    needsGesture,
    wantPlay,
    resumeAt,
    repeat,
    shuffle,
    volume,
    muted,
    reloadKey,
    engineRef,
    engineEvents,
    actions,
  };
}

/** Lock-screen / notification / hardware media key integration. */
function useMediaSession({ album, track, status, play, pause, next, prev, seek, seekBy }) {
  const supported = typeof navigator !== 'undefined' && 'mediaSession' in navigator;

  useEffect(() => {
    if (!supported || !track) return;
    const artwork = track.sessionArtwork || track.artwork || album.artwork || album.cover;
    const absolute = artwork ? new URL(artwork, window.location.href).href : null;
    try {
      navigator.mediaSession.metadata = new window.MediaMetadata({
        title: track.title,
        artist: track.artist || album.artist,
        album: album.title,
        artwork: absolute ? [{ src: absolute, sizes: '512x512' }] : [],
      });
    } catch {
      // MediaMetadata unsupported
    }
  }, [supported, track, album]);

  useEffect(() => {
    if (!supported) return undefined;
    const handlers = {
      play,
      pause,
      nexttrack: next,
      previoustrack: prev,
      seekbackward: (d) => seekBy(-(d?.seekOffset || 10)),
      seekforward: (d) => seekBy(d?.seekOffset || 10),
      seekto: (d) => d?.seekTime != null && seek(d.seekTime),
    };
    Object.entries(handlers).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // action unsupported on this browser
      }
    });
    return () => Object.keys(handlers).forEach((action) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch {
        // ignore
      }
    });
  }, [supported, play, pause, next, prev, seek, seekBy]);

  useEffect(() => {
    if (!supported) return;
    navigator.mediaSession.playbackState = track ? (status.playing ? 'playing' : 'paused') : 'none';
  }, [supported, track, status.playing]);

  const { duration, current } = status;
  const second = Math.floor(current);
  useEffect(() => {
    if (!supported || !navigator.mediaSession.setPositionState) return;
    if (!duration || !Number.isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        position: Math.min(second, duration),
        playbackRate: 1,
      });
    } catch {
      // ignore invalid states
    }
  }, [supported, duration, second]);
}
