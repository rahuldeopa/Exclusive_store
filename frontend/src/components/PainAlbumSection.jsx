import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomVideoPlayer from './CustomVideoPlayer';
import CustomAudioPlayer from './CustomAudioPlayer';
import { Play, Pause, Clock, ChevronDown, Disc3, Music2, Headphones, Volume2, Download, Check, Loader2 } from 'lucide-react';

export default function PainAlbumSection({ initialContent }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [playerMode, setPlayerMode] = useState('audio'); // 'audio' or 'video'
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [downloading, setDownloading] = useState({ audio: false, video: false });
  const [downloadDone, setDownloadDone] = useState({ audio: false, video: false });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const handleDownload = async (youtubeId, trackTitle, directAudioUrl = null) => {
    if (downloading.audio) return;

    // If we have a direct URL (like WeShare or Supabase), just download it directly
    if (directAudioUrl) {
      window.open(directAudioUrl, '_blank');
      return;
    }

    setDownloading(prev => ({ ...prev, audio: true }));
    setDownloadDone(prev => ({ ...prev, audio: false }));

    try {
      const response = await fetch(
        `${API_BASE}/api/download/youtube?id=${encodeURIComponent(youtubeId)}&type=audio`
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const blob = await response.blob();
      
      const disposition = response.headers.get('Content-Disposition');
      let downloadFilename;
      if (disposition) {
        const match = disposition.match(/filename="?([^";\n]+)"?/);
        downloadFilename = match ? match[1] : null;
      }
      if (!downloadFilename) {
        const safeName = trackTitle.replace(/[^\w\s-]/gi, '_').trim();
        downloadFilename = `${safeName}_audio.m4a`;
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setDownloadDone(prev => ({ ...prev, audio: true }));
      setTimeout(() => setDownloadDone(prev => ({ ...prev, audio: false })), 3000);
    } catch (err) {
      console.error(`Download error (audio):`, err);
      alert(`Download failed. Please try again.`);
    } finally {
      setDownloading(prev => ({ ...prev, audio: false }));
    }
  };

  const handleVideoDownload = (youtubeId, directVideoUrl = null) => {
    if (directVideoUrl) {
      window.open(directVideoUrl, '_blank');
      return;
    }
    // Vercel doesn't support ffmpeg, so we redirect video downloads to a clean, ad-free external service (cobalt.tools)
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    window.open(`https://cobalt.tools/?u=${encodeURIComponent(url)}`, '_blank');
  };

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
    { num: 12, title: 'Blessings on the Way (remix)', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL', youtubeId: 'IzGX936iX1o', duration: '2:23' }
  ];

  const totalDuration = '39:48';

  // Map directly from our hardcoded list, fallback to backend
  const getMediaForTrack = (title) => {
    const track = tracks.find(t => t.title === title);
    if (track && track.youtubeId) {
      return { source: 'YOUTUBE', youtubeId: track.youtubeId };
    }
    if (!initialContent?.media) return null;
    return initialContent.media.find(m => m.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]));
  };

  const handlePlay = (track) => {
    setActiveTrack(track);
  };

  // Lock body scroll when modal is open to prevent double scrollbars
  useEffect(() => {
    if (activeTrack) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTrack]);

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
                className={`grid grid-cols-[32px_1fr_auto] sm:grid-cols-[40px_1fr_auto] gap-3 sm:gap-4 px-3 sm:px-5 py-3.5 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                  isActive
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
                  <span className={`text-[15px] font-medium truncate transition-colors duration-200 ${
                    isActive ? 'text-[#ff6b35]' : 'text-white/90 group-hover:text-white'
                  }`}>
                    {track.title}
                  </span>
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

      {/* ======== Now Playing Modal ======== */}
      <style>{`
        @media (max-height: 600px) and (orientation: landscape) {
          .mobile-landscape-full { 
            width: 100% !important;
            max-width: calc((100vh - 140px) * 1.777) !important;
            height: auto !important;
            max-height: calc(100vh - 140px) !important;
            aspect-ratio: 16/9 !important;
            border-radius: 8px !important;
            margin: 0 auto !important;
          }
          .mobile-landscape-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
      <AnimatePresence>
        {activeTrack && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#030303] flex flex-col disable-select overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Dynamic Ambient Background Glow */}
            <div 
              className="absolute inset-0 z-0 opacity-30 scale-125 pointer-events-none"
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${activeTrack.youtubeId}/maxresdefault.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px) saturate(120%) brightness(0.6)',
              }}
            />
            {/* Deep vignette overlay */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-[#030303]/70 to-[#030303] pointer-events-none" />
            <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#030303_75%)] pointer-events-none" />

            {/* Content wrapper */}
            <div className="relative z-10 flex flex-col h-full w-full">
              {/* Header */}
              <div className="p-4 md:p-6 flex items-center justify-between">
                <button onClick={() => setActiveTrack(null)} className="p-2 text-[#666] hover:text-white transition-colors duration-200">
                  <ChevronDown className="w-7 h-7" />
                </button>
                <div className="text-[10px] font-bold tracking-[0.3em] text-[#555] uppercase">Now Playing from Album</div>
                <div className="w-11" />
              </div>

              {/* Audio / Video Toggle */}
              <div className="flex justify-center mb-4 md:mb-8">
                <div className="flex bg-white/[0.04] backdrop-blur-sm rounded-full p-1 gap-1 border border-white/[0.06]">
                  <button
                    onClick={() => setPlayerMode('audio')}
                    className={`px-7 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      playerMode === 'audio'
                        ? 'bg-white text-[#030303] shadow-[0_2px_12px_rgba(255,255,255,0.15)]'
                        : 'text-[#666] hover:text-white/80'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    Audio
                  </button>
                  <button
                    onClick={() => setPlayerMode('video')}
                    className={`px-7 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      playerMode === 'video'
                        ? 'bg-white text-[#030303] shadow-[0_2px_12px_rgba(255,255,255,0.15)]'
                        : 'text-[#666] hover:text-white/80'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Video
                  </button>
                </div>
              </div>

              {/* Player Area */}
              <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 pb-8 md:pb-12 max-w-6xl mx-auto w-full overflow-y-auto mobile-landscape-container">
                <motion.div
                  layout
                  className={`w-full bg-black/60 rounded-2xl overflow-visible shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative transition-all duration-500 flex-shrink-0 mobile-landscape-full border border-white/[0.04] ${
                    playerMode === 'audio' ? 'max-w-md aspect-square' : 'max-w-5xl aspect-video'
                  }`}
                >
                  {(() => {
                    const media = getMediaForTrack(activeTrack.title);
                    if (media && media.source === 'YOUTUBE') {
                      if (playerMode === 'video') {
                        return (
                          <CustomVideoPlayer
                            videoUrl={`https://www.youtube.com/watch?v=${media.youtubeId}`}
                            title={activeTrack.title}
                          />
                        );
                      } else {
                        return (
                          <CustomVideoPlayer
                            videoUrl={`https://www.youtube.com/watch?v=${media.youtubeId}`}
                            title={activeTrack.title}
                            audioOnlyMode={true}
                            coverNode={
                              <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 text-center relative">
                                <div className="absolute top-[6%] text-[#0a0a0a] font-black text-2xl tracking-tighter">TURNING</div>
                                <div className="absolute top-[20%] text-[#0a0a0a] font-medium text-base">MY</div>
                                <div className="absolute top-[32%] text-[#0a0a0a] font-black text-5xl md:text-7xl tracking-tighter leading-none">PAIN</div>
                                <div className="absolute top-[58%] text-[#0a0a0a] text-xl md:text-2xl italic" style={{ fontFamily: 'Georgia, serif' }}>into</div>
                                <div className="absolute bottom-[8%] text-[#0a0a0a] font-black text-3xl md:text-5xl tracking-tighter">PURPOSE</div>
                                <svg className="absolute bottom-0 right-0 w-full h-full opacity-[0.06]" viewBox="0 0 100 100" preserveAspectRatio="none">
                                  <path d="M0 100 L100 0 L100 100 Z" fill="#0a0a0a" />
                                </svg>
                              </div>
                            }
                          />
                        );
                      }
                    } else if (media && (media.playUrl || media.url)) {
                      if (playerMode === 'video') {
                        return <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">No video available for this track</div>;
                      }
                      return (
                        <div className="w-full h-full relative">
                          <div className="absolute inset-0 z-0">
                            <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 text-center relative">
                              <div className="absolute top-[6%] text-[#0a0a0a] font-black text-2xl tracking-tighter">TURNING</div>
                              <div className="absolute top-[20%] text-[#0a0a0a] font-medium text-base">MY</div>
                              <div className="absolute top-[32%] text-[#0a0a0a] font-black text-5xl md:text-7xl tracking-tighter leading-none">PAIN</div>
                              <div className="absolute top-[58%] text-[#0a0a0a] text-xl md:text-2xl italic" style={{ fontFamily: 'Georgia, serif' }}>into</div>
                              <div className="absolute bottom-[8%] text-[#0a0a0a] font-black text-3xl md:text-5xl tracking-tighter">PURPOSE</div>
                            </div>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm p-2">
                            <CustomAudioPlayer src={media.playUrl || media.url} title={activeTrack.title} />
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-sm text-[#555] italic">
                          Media source linked from backend will play here. (Track: {activeTrack.title})
                        </div>
                      );
                    }
                  })()}
                </motion.div>

                {/* Track Info Below Player */}
                <div className={`w-full mt-6 md:mt-10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${
                  playerMode === 'audio' ? 'max-w-md' : 'max-w-5xl'
                }`}>
                  <div className="flex flex-col items-start">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-1.5 tracking-tight">{activeTrack.title}</h2>
                    <p className="text-base text-[#777]">{activeTrack.credits}</p>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                    {/* Audio Download */}
                    <button
                      onClick={() => {
                        const media = initialContent?.media?.find(m => 
                          m.title?.toLowerCase() === activeTrack.title.toLowerCase() || m.youtubeId === activeTrack.youtubeId
                        );
                        // If backend provides an audio type URL, or a general URL that we know is a file
                        const directUrl = media?.type === 'audio' ? (media.playUrl || media.url) : null;
                        handleDownload(activeTrack.youtubeId, activeTrack.title, directUrl);
                      }}
                      disabled={downloading.audio}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 border ${
                        downloadDone.audio
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : downloading.audio
                            ? 'bg-white/[0.03] border-white/[0.08] text-[#888] cursor-wait'
                            : 'bg-white/[0.04] border-white/[0.08] text-[#aaa] hover:bg-white/[0.08] hover:border-[#ff6b35]/30 hover:text-white active:scale-95'
                      }`}
                    >
                      {downloadDone.audio ? (
                        <Check className="w-4 h-4" />
                      ) : downloading.audio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span className="hidden sm:inline">{downloading.audio ? 'Preparing...' : downloadDone.audio ? 'Done!' : 'Audio'}</span>
                      <span className="sm:hidden">{downloading.audio ? '...' : downloadDone.audio ? '✓' : 'MP3'}</span>
                    </button>

                    {/* Video Download */}
                    <button
                      onClick={() => {
                        const media = initialContent?.media?.find(m => 
                          m.title?.toLowerCase() === activeTrack.title.toLowerCase() || m.youtubeId === activeTrack.youtubeId
                        );
                        const directUrl = media?.type === 'video' ? (media.playUrl || media.url) : null;
                        handleVideoDownload(activeTrack.youtubeId, directUrl);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 border bg-white/[0.04] border-white/[0.08] text-[#aaa] hover:bg-white/[0.08] hover:border-[#ff6b35]/30 hover:text-white active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Video</span>
                      <span className="sm:hidden">MP4</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
