import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Clock } from 'lucide-react';
import AlbumPlayer from './album/AlbumPlayer';
import { usePlayer } from './album/usePlayer';
import { buildPainAlbum } from './album/albums';

export default function PainAlbumSection({ initialContent }) {
  const [hoveredTrack, setHoveredTrack] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const tracks = [
    { num: 1, title: 'Jah Light in my Soul', credits: 'beat by Workdonebeatz sung by Arion', youtubeId: '-ImqIW1tJ1A', duration: '3:22' },
    { num: 2, title: 'Elevation', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'k2kFvuuOCZs', duration: '3:13' },
    { num: 3, title: 'Master Sculpture', credits: 'beat by Workdonebeatz sung by Amina', youtubeId: 'K5JlMyLrR9o', duration: '4:13' },
    { num: 4, title: 'Lift My Hands', credits: 'beat by Workdonebeatz sung by Amina', youtubeId: '8eCmIU392L4', duration: '4:20' },
    { num: 5, title: 'Ride with God', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: '97cxQm5Arj4', duration: '2:15' },
    { num: 6, title: 'Lessons from the Storm', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'lFi1WiPcpy0', duration: '4:07' },
    { num: 7, title: 'Blessings on the Way', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'RRPv3dPMHL0', duration: '3:32' },
    { num: 8, title: 'Worth more', credits: 'beat by Dioz sung by Chikorus YL', youtubeId: '2OXwAEdiOSc', duration: '2:41' },
    { num: 9, title: 'Net Worth', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'FjpUIHgRrDc', duration: '2:48' },
    { num: 10, title: 'Real Friends', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: '7cNq-GVlw6E', duration: '3:59' },
    { num: 11, title: 'Mask off', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL', youtubeId: 'M4kqqcu4dOQ', duration: '2:53' },
    {
      num: 12,
      title: 'Blessings on the Way (remix)',
      credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL',
      youtubeId: 'IzGX936iX1o',
      duration: '2:23',
      videoUrl: 'https://voiddrive.org/s/ab3f5f613a39ca9474d02038b39a9ba27f28affb03ec4e6a95b39c0b67c03c1f'
    }
  ];

  const totalDuration = '39:48';

  // YouTube-style player (expanded / mini / fullscreen) driven by this album's tracks
  const [album] = useState(() => buildPainAlbum(tracks, API_BASE));
  const player = usePlayer(album);
  const activeTrack = player.track ? tracks[player.trackIndex] : null;

  const handlePlay = (track) => {
    player.actions.playTrack(tracks.findIndex(t => t.num === track.num));
  };

  // Animated EQ bars for the playing track
  const EqBars = () => (
    <div className="flex items-end gap-[2px] h-4 w-4">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-[3px] bg-[#ff6b35] rounded-full"
          animate={{ height: ['4px', '14px', '6px', '16px', '4px'] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="w-full min-h-screen bg-[#030303] text-white font-sans selection:bg-[#ff6b35]/30 selection:text-white pb-32 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Cinematic Hero Header */}
      <div className="relative overflow-hidden">
        {/* Ambient gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#ff6b35]/8 rounded-full blur-[120px]" />
          <div className="absolute top-20 -left-20 w-[300px] h-[300px] bg-[#ff6b35]/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-40 bg-gradient-to-t from-[#030303] to-transparent" />
        </div>

        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative pt-28 pb-12 px-6 sm:px-8 md:px-12 lg:px-16 flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10 max-w-7xl mx-auto">
          {/* Album Cover */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            <div className="w-56 h-56 sm:w-60 sm:h-60 md:w-72 md:h-72 shrink-0 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),0_0_80px_-20px_rgba(255,107,53,0.15)]">
              <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 text-center relative">
                <div className="absolute top-[6%] text-[#0a0a0a] font-black text-xl sm:text-2xl tracking-tighter">TURNING</div>
                <div className="absolute top-[20%] text-[#0a0a0a] font-medium text-sm sm:text-base">MY</div>
                <div className="absolute top-[32%] text-[#0a0a0a] font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-none">PAIN</div>
                <div className="absolute top-[58%] text-[#0a0a0a] text-xl sm:text-2xl italic" style={{ fontFamily: 'Georgia, serif' }}>into</div>
                <div className="absolute bottom-[8%] text-[#0a0a0a] font-black text-3xl sm:text-4xl tracking-tighter">PURPOSE</div>
                <svg className="absolute bottom-0 right-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 100 L100 0 L100 100 Z" fill="#0a0a0a" />
                </svg>
              </div>
            </div>
            {/* Reflection glow beneath album art */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-[#ff6b35]/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </motion.div>

          {/* Album Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3 md:gap-4 text-center md:text-left pb-2"
          >
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff6b35]/80 px-3 py-1 rounded-full border border-[#ff6b35]/20 bg-[#ff6b35]/5">Album</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-white">
              Turning My Pain
              <br />
              <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">into Purpose</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#999] font-medium justify-center md:justify-start mt-1">
              <span className="font-semibold text-white/90">J.A.S.E., Amina, and Arion</span>
              <span className="text-[#555]">•</span>
              <span>2026</span>
              <span className="text-[#555]">•</span>
              <span>{tracks.length} songs, {totalDuration}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="px-6 sm:px-8 md:px-12 lg:px-16 py-6 flex items-center gap-5 max-w-7xl mx-auto"
      >
        <button
          className="w-14 h-14 rounded-full bg-[#ff6b35] hover:bg-[#ff8c5a] hover:shadow-[0_0_30px_rgba(255,107,53,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_8px_24px_rgba(255,107,53,0.3)]"
          onClick={() => handlePlay(tracks[0])}
        >
          <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
        </button>
      </motion.div>

      {/* Tracklist */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-14 max-w-7xl mx-auto">
        {/* Tracklist Header */}
        <div className="grid grid-cols-[32px_1fr_auto] sm:grid-cols-[40px_1fr_auto] gap-3 sm:gap-4 px-3 sm:px-5 py-3 text-[11px] text-[#666] border-b border-white/5 mb-2 uppercase tracking-[0.15em] font-semibold">
          <div className="text-right">#</div>
          <div>Title</div>
          <div className="flex justify-end"><Clock className="w-3.5 h-3.5" /></div>
        </div>

        {/* Tracks */}
        <div className="flex flex-col">
          {tracks.map((track, index) => {
            const isActive = activeTrack?.num === track.num;
            const isHovered = hoveredTrack === track.num;

            return (
              <motion.div
                key={track.num}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index + 0.3, duration: 0.4, ease: 'easeOut' }}
                onClick={() => handlePlay(track)}
                onMouseEnter={() => setHoveredTrack(track.num)}
                onMouseLeave={() => setHoveredTrack(null)}
                className={`grid grid-cols-[32px_1fr_auto] sm:grid-cols-[40px_1fr_auto] gap-3 sm:gap-4 px-3 sm:px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 group relative ${isActive
                    ? 'bg-white/[0.06]'
                    : 'hover:bg-white/[0.04]'
                  }`}
              >
                {/* Subtle left accent bar on active */}
                {isActive && (
                  <motion.div
                    layoutId="activeBar"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#ff6b35]"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Track Number / Play Icon / EQ */}
                <div className="text-right flex items-center justify-end">
                  {isActive ? (
                    <EqBars />
                  ) : isHovered ? (
                    <Play className="w-4 h-4 text-white" fill="currentColor" />
                  ) : (
                    <span className="text-sm tabular-nums text-[#666] font-medium">{track.num}</span>
                  )}
                </div>

                {/* Title & Credits */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[15px] font-medium truncate transition-colors duration-200 ${isActive ? 'text-[#ff6b35]' : 'text-white/90 group-hover:text-white'
                      }`}>
                      {track.title}
                    </span>
                    {track.videoUrl && (
                      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide bg-[#ff6b35]/15 text-[#ff6b35] border border-[#ff6b35]/25">
                        Direct Stream
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] text-[#555] group-hover:text-[#777] transition-colors duration-200 truncate">
                    {track.credits}
                  </span>
                </div>

                {/* Duration */}
                <div className="flex items-center text-[13px] tabular-nums text-[#555] font-medium">
                  {track.duration}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Elegant Divider */}
      <div className="max-w-7xl mx-auto px-8 md:px-12 lg:px-16 mt-16">
        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>
      </div>

      {/* Copyright / Info */}
      <div className="px-6 sm:px-8 md:px-12 lg:px-16 mt-10 pb-16 max-w-7xl mx-auto">
        <div className="text-[11px] leading-relaxed text-[#444] max-w-3xl flex flex-col gap-3 tracking-wide">
          <p>
            All songs are a collaborative effort from J.A.S.E., Amina, and Arion. Beat development and concept of the project were directed by J.A.S.E. (Follow God 8) under JASP Publishing Inc.
          </p>
          <p>
            All copyrights for the project music, videos, etc are solely held by J.A.S.E.(FollowGod8) under JASP Publishing Inc.
          </p>
          <p>
            All videos are also copyrighted, directed, and developed by J.A.S.E.(FollowGod8) under JASP PUBLISHING INC.
          </p>
          <p className="mt-4 text-[#333] font-semibold tracking-[0.2em] uppercase text-[10px]">© 2026 JASP Publishing Inc.</p>
        </div>
      </div>

      {/* ======== Now Playing (YouTube-style player) ======== */}
      {createPortal(
        <div style={{ '--accent': album.accent }}>
          <AnimatePresence>
            {player.view !== 'closed' && player.track && (
              <AlbumPlayer key="player" player={player} />
            )}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </div>
  );
}
