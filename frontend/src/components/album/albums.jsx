import { parseDuration, safeFileName } from './utils';

/**
 * Turn the track lists defined in the album sections into the shape the
 * YouTube-style player understands: a prioritized list of sources per mode.
 */

const youtubeThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Fire-and-forget server-side prefetch so the next track is cached on the backend. */
function createPrefetcher(urlFor) {
  const done = new Set();
  return (track) => {
    if (!track || done.has(track.id)) return;
    const url = urlFor(track);
    if (!url) return;
    done.add(track.id);
    fetch(url).catch(() => {});
  };
}

/* ------------------------------------------------------------------ */
/* Love is Blind 2026 (Google Drive files via the backend proxy)       */
/* ------------------------------------------------------------------ */

export function buildLoveAlbum(tracks, apiBase) {
  const proxy = (id, confirm = false) =>
    `${apiBase}/api/download/drive-audio?id=${encodeURIComponent(id)}${confirm ? '&confirm=t' : ''}`;
  // Served straight from Google Drive to the viewer's browser (no backend hop).
  const direct = (id) => `https://drive.usercontent.google.com/download?id=${encodeURIComponent(id)}&export=download&confirm=t`;
  // Track 3 has no separate audio master: its audio is streamed from the video file.
  const audioUrl = (t) => (t.audioId ? proxy(t.audioId) : proxy(t.videoId, true));
  const audioFileId = (t) => t.audioId || t.videoId;

  return {
    id: 'love-is-blind-2026',
    title: 'Love is Blind 2026',
    artist: 'J.A.S.E, Amina, Arion, Chikorus YL',
    accent: '#ff4d6d',
    cover: '/love_is_blind_cover.jpg',
    defaultMode: 'audio',
    tracks: tracks.map((t) => ({
      id: `love-${t.num}`,
      num: t.num,
      title: t.title,
      credits: t.credits,
      durationLabel: t.duration,
      duration: parseDuration(t.duration),
      audioId: t.audioId,
      thumbnail: t.videoId ? `https://drive.google.com/thumbnail?id=${t.videoId}&sz=w640` : undefined,
      // Try Drive directly first, then our backend proxy. Both play in our own player.
      audio: [
        { type: 'html5', src: direct(audioFileId(t)), timeout: 15000 },
        { type: 'html5', src: audioUrl(t) },
      ],
      video: t.videoId
        ? [
          { type: 'html5', src: direct(t.videoId), timeout: 15000 },
          { type: 'html5', src: proxy(t.videoId, true), timeout: 20000 },
          // Last resort: Google Drive's own embed (its own controls, not ours).
          { type: 'iframe', src: `https://drive.google.com/file/d/${t.videoId}/preview` },
        ]
        : [],
      downloads: [
        { key: 'audio', label: 'Audio (WAV)', href: audioUrl(t), filename: `${safeFileName(t.title)}.wav`, strategy: 'link' },
        ...(t.videoId
          ? [{
            key: 'video',
            label: 'Video (MP4)',
            href: `https://drive.usercontent.google.com/download?id=${t.videoId}&export=download&confirm=t`,
            filename: `${safeFileName(t.title)}.mp4`,
            strategy: 'link',
          }]
          : []),
      ],
    })),
    prefetch: createPrefetcher((t) => `${audioUrl(t)}&prefetch=true`),
  };
}

/* ------------------------------------------------------------------ */
/* Turning My Pain into Purpose (YouTube)                              */
/* ------------------------------------------------------------------ */

/** The album's typographic cover, scaled to any size with container query units. */
export function PainCover() {
  return (
    <div
      className="absolute inset-0 bg-[#f5f5f5] text-[#0a0a0a] overflow-hidden"
      style={{ containerType: 'size' }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-between py-[7cqh] leading-none">
        <span className="font-black tracking-tighter" style={{ fontSize: '11cqw' }}>TURNING</span>
        <span className="font-medium" style={{ fontSize: '6cqw' }}>MY</span>
        <span className="font-black tracking-tighter" style={{ fontSize: '27cqw' }}>PAIN</span>
        <span className="italic" style={{ fontSize: '9cqw', fontFamily: 'Georgia, serif' }}>into</span>
        <span className="font-black tracking-tighter" style={{ fontSize: '15cqw' }}>PURPOSE</span>
      </div>
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 100 L100 0 L100 100 Z" fill="#0a0a0a" />
      </svg>
    </div>
  );
}

export function buildPainAlbum(tracks, apiBase) {
  return {
    id: 'turning-my-pain-into-purpose',
    title: 'Turning My Pain into Purpose',
    artist: 'J.A.S.E., Amina, and Arion',
    accent: '#ff6b35',
    CoverComponent: PainCover,
    defaultMode: 'audio',
    tracks: tracks.map((t) => ({
      id: `pain-${t.num}`,
      num: t.num,
      title: t.title,
      credits: t.credits,
      durationLabel: t.duration,
      duration: parseDuration(t.duration),
      thumbnail: youtubeThumb(t.youtubeId),
      sessionArtwork: youtubeThumb(t.youtubeId),
      audio: [{ type: 'youtube', id: t.youtubeId }],
      // A direct high-quality file is preferred when available, with YouTube as fallback.
      video: t.videoUrl
        ? [{ type: 'html5', src: t.videoUrl, timeout: 15000 }, { type: 'youtube', id: t.youtubeId }]
        : [{ type: 'youtube', id: t.youtubeId }],
      downloads: [
        {
          key: 'audio',
          label: 'Audio',
          href: `${apiBase}/api/download/youtube?id=${encodeURIComponent(t.youtubeId)}&type=audio`,
          filename: `${safeFileName(t.title)}_audio.m4a`,
          strategy: 'blob',
        },
        t.videoUrl
          ? { key: 'video', label: 'Video', href: t.videoUrl, filename: `${safeFileName(t.title)}.mp4`, strategy: 'blob', fallbackHref: t.videoUrl }
          : {
            key: 'video',
            label: 'Video',
            // Video muxing needs ffmpeg, which the API host doesn't have; use cobalt instead.
            href: `https://cobalt.tools/?u=${encodeURIComponent(`https://www.youtube.com/watch?v=${t.youtubeId}`)}`,
            strategy: 'external',
          },
      ],
    })),
  };
}
