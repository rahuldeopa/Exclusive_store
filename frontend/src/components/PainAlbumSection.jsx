import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  Headphones,
  Film,
  Check,
  Sparkles,
  Share2
} from 'lucide-react';
import AlbumPlayer from './album/AlbumPlayer';
import { usePlayer } from './album/usePlayer';
import { DownloadButtons } from './album/parts';
import { buildPainAlbum, PainCover } from './album/albums';
import { warmUpYouTube } from './album/engines/YouTubeEngine';

export default function PainAlbumSection({ initialContent, passcode = 'PAIN' }) {
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Playback comes from YouTube; the Drive IDs are the files behind the Download buttons.
  const tracks = [
    { num: 1, title: 'Jah Light in my Soul', credits: 'beat by Workdonebeatz sung by Arion', youtubeId: '-ImqIW1tJ1A', duration: '3:22', driveAudioId: '1H5BB5UyWS9tYVpeKpAjDWUcFoUTW75Kl', driveVideoId: '12Mo3sv5oGKash2eRdSUZSrbLQg4BT_CF' },
    { num: 2, title: 'Elevation', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'k2kFvuuOCZs', duration: '3:13', driveAudioId: '1EfdD288JknKoUgokS7ygFWw-MvYnRYpK', driveVideoId: '1WA-yQUeaaW_LuVddChPCMNmUM6Wj2ZcE' },
    { num: 3, title: 'Master Sculpture', credits: 'beat by Workdonebeatz sung by Amina', youtubeId: 'K5JlMyLrR9o', duration: '4:13', driveAudioId: '1RDVQX0IVyXCsWlgFIo45kRxbpI3Q7TJr', driveVideoId: '1R--VyrRwNViEjMVEsH-gnjPzwaXTBRA7' },
    { num: 4, title: 'Lift My Hands', credits: 'beat by Workdonebeatz sung by Amina', youtubeId: '8eCmIU392L4', duration: '4:20', driveAudioId: '1-U92cquElCngD1ePoYKCPLvuoEPz_K-f', driveVideoId: '1zG3Yaoy8sju-kS5_DgEyoXuw-w1psDrE' },
    { num: 5, title: 'Ride with God', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: '97cxQm5Arj4', duration: '2:15', driveAudioId: '1KbO4SHvvUD4vCpIDSzVLbgrCnyyRa4US', driveVideoId: '1rsgG-qME3QbdE9T3Ve-k5QCpUAkUIB9v' },
    { num: 6, title: 'Lessons from the Storm', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'lFi1WiPcpy0', duration: '4:07', driveAudioId: '1yMftdc0NjEx9HB73Tzd5xjS3idAFPMhv', driveVideoId: '1y8xf61EcWrepZwsBHGlf-2_2B9J_nH1V' },
    { num: 7, title: 'Blessings on the Way', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'RRPv3dPMHL0', duration: '3:32', driveAudioId: '1s6td6V2tT3cyyBkpBxrpTk71COlrZLM7', driveVideoId: '1qws8-INFRGWtthI0EY_UmozqPtQW5mus' },
    { num: 8, title: 'Worth more', credits: 'beat by Dioz sung by Chikorus YL', youtubeId: '2OXwAEdiOSc', duration: '2:41', driveAudioId: '1YGNQqXnl2zVhk7DB20gzKZD1xOCL09hw', driveVideoId: '1EA3Yu_nc27jRn-2aniplfQAaubdRoqnJ' },
    { num: 9, title: 'Net Worth', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'FjpUIHgRrDc', duration: '2:48', driveAudioId: '1D0gL1S3zQu0cquC1MoIUDdiytvTpy2ds', driveVideoId: '1p50-ZT0pcijkuM2LSK5HUCv30-hHPRmI' },
    { num: 10, title: 'Real Friends', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: '7cNq-GVlw6E', duration: '3:59', driveAudioId: '1vpRtLTO0IYR1CuzS_iPe3wgXpXxxU2ls', driveVideoId: '1Q4TaKwYjBBhienZIpReEWsgvpue_NzNy' },
    { num: 11, title: 'Mask off', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL', youtubeId: 'M4kqqcu4dOQ', duration: '2:53', driveAudioId: '16g8LH21wNxsYecQZC8wqQUyVjHlT9OXu', driveVideoId: '1Qaz-zyz2_POM05t8-aUtOUk344f4j3SJ' },
    { num: 12, title: 'Blessings on the Way (remix)', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL', youtubeId: 'IzGX936iX1o', duration: '2:23', driveAudioId: '1CBRlEk2UZLhONyBkF7dkeBmBa8PkP6qo', driveVideoId: '10CMrVdB-8AGsuth6sZclj5X19jgZkQoV' }
  ];

  const totalDuration = '39:48';

  // YouTube-style player (expanded / mini / fullscreen) driven by this album's tracks
  const [album] = useState(() => buildPainAlbum(tracks));
  const player = usePlayer(album);
  const activeTrack = player.track ? tracks[player.trackIndex] : null;

  // Fetch YouTube's player code now so the first click doesn't have to wait for it.
  useEffect(() => {
    warmUpYouTube(tracks[0].youtubeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = (track, mode = 'audio') => {
    player.actions.playTrack(tracks.findIndex(t => t.num === track.num), { mode });
  };

  const handleShare = () => {
    const currentUrl = window.location.origin + window.location.pathname + `?passcode=${encodeURIComponent(passcode)}`;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Animated EQ Bars
  const EqBars = () => (
    <div className="flex items-end gap-[3px] h-4 w-4">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-[3px] bg-[#ff6b35] rounded-full shadow-[0_0_8px_rgba(255,107,53,0.8)]"
          animate={{ height: ['4px', '16px', '7px', '18px', '4px'] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="w-full min-h-screen bg-[#050302] text-white font-sans selection:bg-[#ff6b35]/40 selection:text-white pb-36 select-none relative overflow-x-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Ember radial orb */}
        <div className="absolute -top-32 -right-20 w-[650px] h-[650px] bg-[#ff6b35]/12 rounded-full blur-[140px]" />
        {/* Subtle gold glow */}
        <div className="absolute top-48 -left-32 w-[500px] h-[500px] bg-[#d4af37]/8 rounded-full blur-[130px]" />
        {/* Bottom obsidian vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050302] via-[#050302]/90 to-transparent" />
      </div>

      {/* Hero Section */}
      <div className="relative pt-24 sm:pt-32 pb-14 px-6 sm:px-8 md:px-12 lg:px-16 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12">
          {/* Album Cover Art */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative group shrink-0"
          >
            <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-black/90 shadow-[0_25px_60px_-12px_rgba(255,107,53,0.3),0_0_80px_-20px_rgba(212,175,55,0.2)] border border-[#ff6b35]/20 relative">
              <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <PainCover />
              </div>

              {/* Play Overlay Button on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                <button
                  onClick={() => handlePlay(tracks[0])}
                  className="w-16 h-16 rounded-full bg-[#ff6b35] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,107,53,0.7)] hover:scale-110 active:scale-95 transition-transform"
                  aria-label="Play album"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              </div>
            </div>

            {/* Ambient reflection glow beneath cover */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-[#ff6b35]/20 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>

          {/* Album Metadata & Editorial Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3 md:gap-4 text-center md:text-left flex-1"
          >
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff6b35] px-3.5 py-1 rounded-full border border-[#ff6b35]/30 bg-[#ff6b35]/10 backdrop-blur-md">
                Official Studio Album
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#d4af37] px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5">
                Limited Edition 2026
              </span>
            </div>

            {/* Album Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light font-serif tracking-tight leading-[1.05] text-white">
              Turning My Pain <span className="text-[#ff6b35] italic font-sans font-bold">into Purpose</span>
            </h1>

            {/* Artists */}
            <p className="text-lg md:text-xl font-medium text-white/90 tracking-wide">
              J.A.S.E., Amina, and Arion
            </p>

            {/* Project Details */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-[#888] font-medium justify-center md:justify-start mt-1">
              <span className="text-[#bbb]">Directed by J.A.S.E. (Follow God 8)</span>
              <span className="text-[#555]">•</span>
              <span className="text-[#bbb]">JASP Publishing Inc.</span>
              <span className="text-[#555]">•</span>
              <span className="text-[#ff6b35] font-semibold">{tracks.length} Songs</span>
              <span className="text-[#555]">•</span>
              <span>{totalDuration}</span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mt-4 pt-2">
              <button
                onClick={() => handlePlay(tracks[0])}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#e8541f] text-white font-semibold text-sm tracking-wide shadow-[0_6px_25px_rgba(255,107,53,0.4)] hover:shadow-[0_8px_35px_rgba(255,107,53,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Album</span>
              </button>

              <button
                onClick={() => handlePlay(tracks[0], 'video')}
                className="px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#ff6b35]/40 text-white font-medium text-sm transition-all duration-300 flex items-center gap-2 active:scale-95 backdrop-blur-md"
              >
                <Film className="w-4 h-4 text-[#ff6b35]" />
                <span>Watch Videos</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#aaa] hover:text-white transition-all duration-200"
                title="Copy share link with passcode"
                aria-label="Copy share link with passcode"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tracklist Container */}
      <div className="relative px-4 sm:px-6 md:px-10 lg:px-14 max-w-7xl mx-auto">
        {/* Tracklist Table Header */}
        <div className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[44px_1fr_120px_172px_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 text-[11px] text-[#666] border-b border-white/[0.06] mb-3 uppercase tracking-[0.2em] font-semibold">
          <div className="text-right">#</div>
          <div>Title & Credits</div>
          <div className="hidden sm:block text-center">Format</div>
          <div className="hidden sm:block text-center">Download</div>
          <div className="flex justify-end pr-2"><Clock className="w-3.5 h-3.5" /></div>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col gap-1.5">
          {tracks.map((track, index) => {
            const isActive = activeTrack?.num === track.num;
            const isHovered = hoveredTrack === track.num;

            return (
              <motion.div
                key={track.num}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * index + 0.1, duration: 0.4 }}
                onClick={() => handlePlay(track, 'audio')}
                onMouseEnter={() => setHoveredTrack(track.num)}
                onMouseLeave={() => setHoveredTrack(null)}
                className={`grid grid-cols-[36px_1fr_auto] sm:grid-cols-[44px_1fr_120px_172px_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-4 rounded-xl cursor-pointer transition-all duration-200 group relative border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff6b35]/15 via-white/[0.04] to-transparent border-[#ff6b35]/30 shadow-[0_4px_20px_rgba(255,107,53,0.15)]'
                    : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
                }`}
              >
                {/* Active side indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTrackBar"
                    className="absolute left-0 top-3 bottom-3 w-[3.5px] rounded-r-full bg-[#ff6b35] shadow-[0_0_12px_#ff6b35]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Track Number / Play / EQ */}
                <div className="text-right flex items-center justify-end">
                  {isActive ? (
                    <EqBars />
                  ) : isHovered ? (
                    <Play className="w-4 h-4 text-white fill-current" />
                  ) : (
                    <span className="text-sm tabular-nums text-[#666] font-medium">{track.num}</span>
                  )}
                </div>

                {/* Title and Credits */}
                <div className="flex flex-col justify-center min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[15px] sm:text-base font-medium truncate transition-colors duration-200 ${
                        isActive ? 'text-[#ff6b35] font-semibold' : 'text-white/95 group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                  </div>
                  <span className="text-[12.5px] sm:text-[13px] text-[#777] group-hover:text-[#aaa] transition-colors duration-200 truncate mt-0.5">
                    {track.credits}
                  </span>
                  {/* Phones have no Download column, so the buttons sit under the credits */}
                  <div className="flex sm:hidden items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                    <DownloadButtons key={track.num} track={album.tracks[index]} dense />
                  </div>
                </div>

                {/* Video / Audio badges */}
                <div className="hidden sm:flex items-center justify-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-white/[0.04] text-[#aaa] border border-white/[0.08]">
                    <Headphones className="w-2.5 h-2.5 text-[#ff6b35]" /> Audio
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlay(track, 'video');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-[#ff6b35]/10 hover:bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/25 transition-colors"
                    title="Play Video"
                  >
                    <Film className="w-2.5 h-2.5" /> Video
                  </button>
                </div>

                {/* Downloads */}
                <div className="hidden sm:flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <DownloadButtons key={track.num} track={album.tracks[index]} dense />
                </div>

                {/* Duration */}
                <div className="flex items-center justify-end gap-3 text-[13px] tabular-nums text-[#777] font-medium">
                  <span className="group-hover:text-white transition-colors">{track.duration}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 my-16">
        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff6b35]/20 to-transparent" />
        </div>
      </div>

      {/* Verbatim Copyright & Credits Section */}
      <div className="relative px-6 sm:px-10 lg:px-14 max-w-7xl mx-auto">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-white/[0.06] bg-black/40 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold watermark emblem */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ff6b35]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-light text-white tracking-tight">Project Credits & Legal</h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] font-semibold">Turning My Pain into Purpose</p>
            </div>
          </div>

          <div className="text-[12px] sm:text-[13px] leading-relaxed text-[#888] max-w-4xl space-y-4 tracking-wide font-light">
            <p>
              All songs are a collaborative effort from J.A.S.E., Amina, and Arion. Beat development and concept of the project were directed by J.A.S.E. (Follow God 8) under JASP Publishing Inc.
            </p>
            <p>
              All copyrights for the project music, videos, etc are solely held by J.A.S.E.(FollowGod8) under JASP Publishing Inc.
            </p>
            <p>
              All videos are also copyrighted, directed, and developed by J.A.S.E.(FollowGod8) under JASP PUBLISHING INC.
            </p>
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
              <p className="text-[#bbb] font-bold tracking-[0.2em] uppercase text-[11px]">
                © 2026 JASP PUBLISHING INC.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-[#777] uppercase tracking-wider">
                <span>Passcode Access:</span>
                <span className="text-[#ff6b35] font-bold">{passcode?.toUpperCase() || 'PAIN'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Now Playing (YouTube-style player) ================= */}
      {createPortal(
        <div style={{ '--accent': album.accent }}>
          <AnimatePresence>
            {player.view !== 'closed' && player.track && (
              <AlbumPlayer key="player" player={player} onShare={handleShare} shareState={copiedLink ? 'copied' : null} />
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
}
