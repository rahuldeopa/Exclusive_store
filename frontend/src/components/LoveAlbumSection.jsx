import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Clock,
  ChevronDown,
  Disc3,
  Headphones,
  Film,
  Download,
  Check,
  Loader2,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  ExternalLink,
  Sparkles,
  Share2
} from 'lucide-react';

export default function LoveAlbumSection({ initialContent, passcode = 'LOVE' }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [playerMode, setPlayerMode] = useState('audio'); // 'audio' or 'video'
  const [hoveredTrack, setHoveredTrack] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [downloading, setDownloading] = useState({ audio: false, video: false });
  const [downloadDone, setDownloadDone] = useState({ audio: false, video: false });
  const [copiedLink, setCopiedLink] = useState(false);

  const audioRef = useRef(null);

  const tracks = [
    {
      num: 1,
      title: 'One More Night',
      credits: 'Beat by Wordonebeatz sung by Arion',
      audioId: '1-2t8AtIal12E0zaF0q31UkMYHmOGvIJJ',
      videoId: '1h5dH03UuEB1a5PBU-tFydGLaY8IOJrjI',
      duration: '2:41'
    },
    {
      num: 2,
      title: 'Something About You',
      credits: 'Beat by Wordonebeatz sung by Chikorus YL',
      audioId: '1XdUKap1dDQbMPY6cRePuC3xZ0b67Vtjw',
      videoId: '11XMy_WtW8O39s0keOJsugmR-9lnwozFw',
      duration: '3:58'
    },
    {
      num: 3,
      title: 'Blinded By Love',
      credits: 'Beat by Dioz sung by Amina',
      audioId: null, // Audio stream directly from video/preview
      videoId: '1vN7nxZhT3WaR5-2_GY37OwPk6sSEKumN',
      duration: '4:52'
    },
    {
      num: 4,
      title: 'Why Me?',
      credits: 'Beat by Dioz sung by Amina',
      audioId: '1xj-i_idnzt0VV7Zb0mTFDwlffn8MeIwT',
      videoId: '13IlWB4XpaNmUbTppBOWSKRIV1Q3lJYpN',
      duration: '3:55'
    },
    {
      num: 5,
      title: 'It Must Be Love',
      credits: 'Beat by Wordonebeatz sung by Amina',
      audioId: '1BPrqI4tmqq6pPFUnaSes_HjoMQOfghZQ',
      videoId: '167HxRX4XLA5O36CYsLeWHOeGEUidHZSP',
      duration: '4:21'
    },
    {
      num: 6,
      title: 'I Hear Birds Singing',
      credits: 'Beat by Wordonebeatz/Dioz sung by Amina',
      audioId: '1ZoQKc_MUYFnlqCWqon4SPko_BaayG8Hj',
      videoId: '1wIxjs-9Mqx6r6Kjda9HADsaqKm95NjCg',
      duration: '5:14'
    },
    {
      num: 7,
      title: 'Love Bombing',
      credits: 'Beat by Wordonebeatz/Dioz sung by Amina',
      audioId: '1xfe_Mbj1JktRm2dpDS024-4u9EXrk5Sa',
      videoId: '1qZs_ejv3IyIV8XRg3ZiSMxLeA8GAKFX5',
      duration: '6:03'
    },
    {
      num: 8,
      title: 'Broken Promises',
      credits: 'Beat by Wordonebeatz sung by Amina',
      audioId: '1IxMWIme3Kx0MeNRyEXM7jZg7Rgf5qiIg',
      videoId: '1oF8bvKPpSFFt_-cP32WiJKyuVdOpVrU3',
      duration: '5:18'
    },
    {
      num: 9,
      title: 'What For',
      credits: 'Beat by Dioz sung by Amina',
      audioId: '1RqeqTJQ_RDzCQQbrfBaaDp6w5N1i8NNV',
      videoId: '1JVS-dD-dFgZmrBoGWVILRNtX-OhAH-xS',
      duration: '4:54'
    },
    {
      num: 10,
      title: 'Where Have You Been',
      credits: 'Beat by Dioz sung by Amina',
      audioId: '18W-6d6RO4SRGlPliNGSsFhHRpxdk6RQ1',
      videoId: '1oqOcPy_8vQ3NhuPRHYoSBwqDrcN_UkvP',
      duration: '5:39'
    },
    {
      num: 11,
      title: 'Love Shouldn’t Hurt',
      credits: 'Beat by Wordonebeatz/Dioz sung by Amina',
      audioId: '1HZHz5McZvx34oB-4SQLU3K-MSn26Xrqo',
      videoId: '19XwdSDjPq9XcCUJa9u3K0WN1tLPb4gyy',
      duration: '3:30'
    },
    {
      num: 12,
      title: 'Falling Idols',
      credits: 'Beat by Wordonebeatz/Dioz sung by Amina',
      audioId: '1CPbwTggG08vkNa0rKRnNR6OUOYAG7QKf',
      videoId: '1rcPVhLG7bSuxLNg_JJi1dWIxusbT9aW0',
      duration: '5:49'
    }
  ];

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  const totalDuration = '56:14';
  const albumCoverUrl = '/love_is_blind_cover.jpg';

  const getAudioUrl = (track) => {
    if (!track) return null;
    if (track.audioId) {
      return `${API_BASE}/api/download/drive-audio?id=${track.audioId}`;
    }
    // Track 3 fallback to direct video stream if audioId is null
    if (track.videoId) {
      return `${API_BASE}/api/download/drive-audio?id=${track.videoId}&confirm=t`;
    }
    return null;
  };

  const getVideoEmbedUrl = (track) => {
    if (!track || !track.videoId) return null;
    return `https://drive.google.com/file/d/${track.videoId}/preview`;
  };

  const handlePlay = (track, mode = 'audio') => {
    setActiveTrack(track);
    setPlayerMode(mode);
    setCurrentTime(0);
    setIsPlayingAudio(true);
  };

  const currentIndex = activeTrack ? tracks.findIndex(t => t.num === activeTrack.num) : -1;
  const nextTrack = currentIndex !== -1 ? tracks[(currentIndex + 1) % tracks.length] : tracks[0];
  const prevTrack = currentIndex !== -1 ? tracks[(currentIndex - 1 + tracks.length) % tracks.length] : tracks[tracks.length - 1];

  const prefetchQueueRef = useRef(new Set());

  // Intelligent Queue Pre-caching:
  // Automatically pre-caches the next and previous tracks in queue both on backend disk and browser memory
  useEffect(() => {
    if (!activeTrack) {
      // Pre-cache first 2 tracks on album load
      [tracks[0], tracks[1]].forEach(track => {
        if (track) {
          const url = getAudioUrl(track);
          if (url && !prefetchQueueRef.current.has(track.num)) {
            prefetchQueueRef.current.add(track.num);
            fetch(`${url}&prefetch=true`).catch(() => {});
          }
        }
      });
      return;
    }

    const curIdx = tracks.findIndex(t => t.num === activeTrack.num);
    if (curIdx === -1) return;

    const queueToPrefetch = [
      tracks[(curIdx + 1) % tracks.length], // Immediate next track
      tracks[(curIdx - 1 + tracks.length) % tracks.length], // Previous track
      tracks[(curIdx + 2) % tracks.length] // Next + 1
    ];

    queueToPrefetch.forEach(track => {
      if (track && !prefetchQueueRef.current.has(track.num)) {
        prefetchQueueRef.current.add(track.num);
        const url = getAudioUrl(track);
        if (url) {
          fetch(`${url}&prefetch=true`).catch(() => {});
        }
      }
    });
  }, [activeTrack]);

  const handleNext = () => {
    if (!activeTrack) return;
    const curIdx = tracks.findIndex(t => t.num === activeTrack.num);
    let nextT;
    if (isShuffled) {
      const remaining = tracks.filter(t => t.num !== activeTrack.num);
      nextT = remaining[Math.floor(Math.random() * remaining.length)] || tracks[0];
    } else {
      nextT = tracks[(curIdx + 1) % tracks.length];
    }
    setActiveTrack(nextT);
    setCurrentTime(0);
    setIsPlayingAudio(true);
  };

  const handlePrev = () => {
    if (!activeTrack) return;
    const curIdx = tracks.findIndex(t => t.num === activeTrack.num);
    const prevT = tracks[(curIdx - 1 + tracks.length) % tracks.length];
    setActiveTrack(prevT);
    setCurrentTime(0);
    setIsPlayingAudio(true);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeTrack) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAudio(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTrack]);

  // Audio element management
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrack && playerMode === 'audio') {
      const url = getAudioUrl(activeTrack);
      if (url && audio.src !== url) {
        audio.src = url;
        audio.load();
        const p = audio.play();
        if (p !== undefined) {
          p.then(() => {
            setIsPlayingAudio(true);
          }).catch(e => {
            console.log('Autoplay pending user gesture:', e);
            setIsPlayingAudio(false);
          });
        }
      }
    } else {
      audio.pause();
      setIsPlayingAudio(false);
    }
  }, [activeTrack, playerMode]);

  const togglePlayAudio = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      const p = audio.play();
      if (p !== undefined) {
        p.then(() => {
          setIsPlayingAudio(true);
        }).catch(err => {
          console.error('Play failed:', err);
        });
      }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatSeconds = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio Download Handler
  const handleAudioDownload = async (track) => {
    if (downloading.audio) return;
    setDownloading(prev => ({ ...prev, audio: true }));
    setDownloadDone(prev => ({ ...prev, audio: false }));

    const url = getAudioUrl(track);
    const safeTitle = track.title.replace(/[^\w\s-]/gi, '_').trim();

    try {
      // Trigger native download
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = `${safeTitle}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadDone(prev => ({ ...prev, audio: true }));
      setTimeout(() => setDownloadDone(prev => ({ ...prev, audio: false })), 3000);
    } catch (err) {
      console.error('Audio download error:', err);
      window.open(url, '_blank');
    } finally {
      setDownloading(prev => ({ ...prev, audio: false }));
    }
  };

  // Video Download Handler
  const handleVideoDownload = (track) => {
    if (downloading.video) return;
    setDownloading(prev => ({ ...prev, video: true }));
    setDownloadDone(prev => ({ ...prev, video: false }));

    const confirmUrl = `https://drive.usercontent.google.com/download?id=${track.videoId}&export=download&confirm=t`;
    try {
      const a = document.createElement('a');
      a.href = confirmUrl;
      a.target = '_blank';
      a.download = `${track.title}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadDone(prev => ({ ...prev, video: true }));
      setTimeout(() => setDownloadDone(prev => ({ ...prev, video: false })), 3000);
    } catch (err) {
      console.error('Video download error:', err);
      window.open(`https://drive.google.com/file/d/${track.videoId}/view`, '_blank');
    } finally {
      setDownloading(prev => ({ ...prev, video: false }));
    }
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
          className="w-[3px] bg-[#ff4d6d] rounded-full shadow-[0_0_8px_rgba(255,77,109,0.8)]"
          animate={{ height: ['4px', '16px', '7px', '18px', '4px'] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="w-full min-h-screen bg-[#050204] text-white font-sans selection:bg-[#ff4d6d]/40 selection:text-white pb-36 select-none relative overflow-x-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Hidden audio element for high fidelity audio playback */}
      <audio
        ref={audioRef}
        loop={isLooping}
        preload="auto"
        onPlay={() => setIsPlayingAudio(true)}
        onPause={() => setIsPlayingAudio(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (!isLooping) {
            handleNext();
          }
        }}
        onError={(e) => {
          console.error('Audio playback status:', e);
        }}
      />

      {/* Queue Preloaders: Pre-buffers next & previous tracks in browser media cache for instant playback */}
      {nextTrack && (
        <audio
          key={`preload-next-${nextTrack.num}`}
          src={getAudioUrl(nextTrack)}
          preload="auto"
          className="hidden"
          muted
        />
      )}
      {prevTrack && prevTrack.num !== nextTrack.num && (
        <audio
          key={`preload-prev-${prevTrack.num}`}
          src={getAudioUrl(prevTrack)}
          preload="auto"
          className="hidden"
          muted
        />
      )}

      {/* Cinematic Ambient Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Crimson velvet radial orb */}
        <div className="absolute -top-32 -right-20 w-[650px] h-[650px] bg-[#e63956]/12 rounded-full blur-[140px]" />
        {/* Subtle rose gold glow */}
        <div className="absolute top-48 -left-32 w-[500px] h-[500px] bg-[#d4af37]/8 rounded-full blur-[130px]" />
        {/* Bottom obsidian vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#050204] via-[#050204]/90 to-transparent" />
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
            <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-2xl overflow-hidden bg-black/90 shadow-[0_25px_60px_-12px_rgba(230,57,86,0.3),0_0_80px_-20px_rgba(212,175,55,0.2)] border border-[#ff4d6d]/20 relative">
              <img
                src={albumCoverUrl}
                alt="Love is Blind 2026"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              
              {/* Play Overlay Button on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30 backdrop-blur-[2px]">
                <button
                  onClick={() => handlePlay(tracks[0])}
                  className="w-16 h-16 rounded-full bg-[#ff4d6d] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,77,109,0.7)] hover:scale-110 active:scale-95 transition-transform"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              </div>
            </div>

            {/* Ambient reflection glow beneath cover */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-12 bg-[#ff4d6d]/20 blur-2xl rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
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
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#ff4d6d] px-3.5 py-1 rounded-full border border-[#ff4d6d]/30 bg-[#ff4d6d]/10 backdrop-blur-md">
                Official Studio Album
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#d4af37] px-3 py-1 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/5">
                Limited Edition 2026
              </span>
            </div>

            {/* Album Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light font-serif tracking-tight leading-[1.05] text-white">
              Love is Blind <span className="text-[#ff4d6d] italic font-sans font-bold">2026</span>
            </h1>

            {/* Artists */}
            <p className="text-lg md:text-xl font-medium text-white/90 tracking-wide">
              J.A.S.E, Amina, Arion, Chikorus YL
            </p>

            {/* Project Details */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm text-[#888] font-medium justify-center md:justify-start mt-1">
              <span className="text-[#bbb]">Directed by J.A.S.E. (Follow God 8)</span>
              <span className="text-[#555]">•</span>
              <span className="text-[#bbb]">JASP Publishing Inc.</span>
              <span className="text-[#555]">•</span>
              <span className="text-[#ff4d6d] font-semibold">{tracks.length} Songs</span>
              <span className="text-[#555]">•</span>
              <span>{totalDuration}</span>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start mt-4 pt-2">
              <button
                onClick={() => handlePlay(tracks[0])}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff4d6d] to-[#e63956] text-white font-semibold text-sm tracking-wide shadow-[0_6px_25px_rgba(255,77,109,0.4)] hover:shadow-[0_8px_35px_rgba(255,77,109,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Album</span>
              </button>

              <button
                onClick={() => handlePlay(tracks[0], 'video')}
                className="px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-[#ff4d6d]/40 text-white font-medium text-sm transition-all duration-300 flex items-center gap-2 active:scale-95 backdrop-blur-md"
              >
                <Film className="w-4 h-4 text-[#ff4d6d]" />
                <span>Watch Videos</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#aaa] hover:text-white transition-all duration-200"
                title="Copy share link with passcode"
              >
                {copiedLink ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tracklist Container */}
      <div className="px-4 sm:px-6 md:px-10 lg:px-14 max-w-7xl mx-auto">
        {/* Tracklist Table Header */}
        <div className="grid grid-cols-[36px_1fr_auto] sm:grid-cols-[44px_1fr_120px_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-3.5 text-[11px] text-[#666] border-b border-white/[0.06] mb-3 uppercase tracking-[0.2em] font-semibold">
          <div className="text-right">#</div>
          <div>Title & Credits</div>
          <div className="hidden sm:block text-center">Format</div>
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
                className={`grid grid-cols-[36px_1fr_auto] sm:grid-cols-[44px_1fr_120px_auto] gap-3 sm:gap-4 px-4 sm:px-6 py-4 rounded-xl cursor-pointer transition-all duration-200 group relative border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff4d6d]/15 via-white/[0.04] to-transparent border-[#ff4d6d]/30 shadow-[0_4px_20px_rgba(255,77,109,0.15)]'
                    : 'border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
                }`}
              >
                {/* Active side indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTrackBar"
                    className="absolute left-0 top-3 bottom-3 w-[3.5px] rounded-r-full bg-[#ff4d6d] shadow-[0_0_12px_#ff4d6d]"
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
                        isActive ? 'text-[#ff4d6d] font-semibold' : 'text-white/95 group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </span>
                  </div>
                  <span className="text-[12.5px] sm:text-[13px] text-[#777] group-hover:text-[#aaa] transition-colors duration-200 truncate mt-0.5">
                    {track.credits}
                  </span>
                </div>

                {/* Video / Audio badges */}
                <div className="hidden sm:flex items-center justify-center gap-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-white/[0.04] text-[#aaa] border border-white/[0.08]">
                    <Headphones className="w-2.5 h-2.5 text-[#ff4d6d]" /> Audio
                  </span>
                  {track.videoId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(track, 'video');
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-[#ff4d6d]/10 hover:bg-[#ff4d6d]/20 text-[#ff4d6d] border border-[#ff4d6d]/25 transition-colors"
                      title="Play Video"
                    >
                      <Film className="w-2.5 h-2.5" /> Video
                    </button>
                  )}
                </div>

                {/* Duration & Quick Actions */}
                <div className="flex items-center justify-end gap-3 text-[13px] tabular-nums text-[#777] font-medium">
                  <span className="group-hover:text-white transition-colors">{track.duration}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 my-16">
        <div className="relative h-px">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff4d6d]/20 to-transparent" />
        </div>
      </div>

      {/* Verbatim Copyright & Credits Section */}
      <div className="px-6 sm:px-10 lg:px-14 max-w-7xl mx-auto">
        <div className="glass-panel rounded-2xl p-8 sm:p-10 border border-white/[0.06] bg-black/40 backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold watermark emblem */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-[#d4af37]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#ff4d6d]/10 border border-[#ff4d6d]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#ff4d6d]" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-light text-white tracking-tight">Project Credits & Legal</h2>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#888] font-semibold">Love is Blind 2026</p>
            </div>
          </div>

          <div className="text-[12px] sm:text-[13px] leading-relaxed text-[#888] max-w-4xl space-y-4 tracking-wide font-light">
            <p>
              All songs are a collaborative effort from J.A.S.E., Amina, Arion, and Chikorus YL. Beat development and
              concept of the project were directed by J.A.S.E. (Follow God 8) under JASP Publishing Inc.
            </p>
            <p>
              All copyrights for the project’s music, videos, and lyrics are solely held by J.A.S.E. (FollowGod8) under
              JASP Publishing Inc.
            </p>
            <p>
              All videos are copyrighted, directed, and developed by J.A.S.E. (FollowGod8 under JASP Publishing Inc.
            </p>
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
              <p className="text-[#bbb] font-bold tracking-[0.2em] uppercase text-[11px]">
                © 2026 JASP PUBLISHING INC.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-[#777] uppercase tracking-wider">
                <span>Passcode Access:</span>
                <span className="text-[#ff4d6d] font-bold">{passcode?.toUpperCase() || 'LOVE'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Now Playing Modal ================= */}
      <AnimatePresence>
        {activeTrack && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-0 z-50 bg-[#050204] flex flex-col disable-select overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Ambient Background Glow behind player */}
            <div
              className="absolute inset-0 z-0 opacity-25 scale-125 pointer-events-none"
              style={{
                backgroundImage: `url(${albumCoverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(100px) saturate(140%) brightness(0.6)',
              }}
            />
            {/* Deep Vignette */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/50 via-[#050204]/80 to-[#050204] pointer-events-none" />

            {/* Modal Content */}
            <div className="relative z-10 flex flex-col h-full w-full">
              {/* Header */}
              <div className="sticky top-0 z-40 p-4 sm:p-6 flex items-center justify-between shrink-0 bg-[#050204]/80 backdrop-blur-md border-b border-white/[0.04]">
                <button
                  onClick={() => setActiveTrack(null)}
                  className="p-2 text-[#777] hover:text-white transition-colors duration-200"
                  title="Close modal"
                >
                  <ChevronDown className="w-7 h-7" />
                </button>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold tracking-[0.3em] text-[#ff4d6d] uppercase">
                    Love is Blind 2026
                  </span>
                  <span className="text-xs text-[#888] font-medium truncate max-w-[200px] sm:max-w-xs">
                    {activeTrack.title}
                  </span>
                </div>
                <button
                  onClick={() => window.open(activeTrack.audioId ? getAudioUrl(activeTrack) : getVideoEmbedUrl(activeTrack), '_blank')}
                  className="p-2 text-[#777] hover:text-white transition-colors duration-200"
                  title="Open source"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Toggle (Audio / Video) */}
              <div className="flex justify-center mt-3 mb-4 shrink-0">
                <div className="flex bg-white/[0.05] backdrop-blur-md rounded-full p-1 gap-1 border border-white/[0.08] shadow-inner">
                  <button
                    onClick={() => {
                      setPlayerMode('audio');
                      setIsPlayingAudio(true);
                    }}
                    className={`px-6 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      playerMode === 'audio'
                        ? 'bg-[#ff4d6d] text-white shadow-[0_2px_15px_rgba(255,77,109,0.5)]'
                        : 'text-[#888] hover:text-white'
                    }`}
                  >
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Audio Experience</span>
                  </button>
                  <button
                    onClick={() => {
                      setPlayerMode('video');
                      setIsPlayingAudio(false);
                    }}
                    className={`px-6 sm:px-8 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                      playerMode === 'video'
                        ? 'bg-[#ff4d6d] text-white shadow-[0_2px_15px_rgba(255,77,109,0.5)]'
                        : 'text-[#888] hover:text-white'
                    }`}
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Music Video</span>
                  </button>
                </div>
              </div>

              {/* Main Player Container */}
              <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pb-8 max-w-5xl mx-auto w-full overflow-y-auto">
                {playerMode === 'video' ? (
                  /* ================= Video Mode ================= */
                  <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/[0.08] relative">
                    <iframe
                      src={getVideoEmbedUrl(activeTrack)}
                      title={activeTrack.title}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  /* ================= Audio Mode ================= */
                  <div className="w-full max-w-lg flex flex-col items-center">
                    {/* Vinyl Cover Art Showcase */}
                    <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4">
                      {/* Spinning Vinyl Record Effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#111] border-4 border-[#222] shadow-2xl flex items-center justify-center pointer-events-none"
                        animate={{ rotate: isPlayingAudio ? 360 : 0 }}
                        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                      >
                        {/* Vinyl grooves */}
                        <div className="w-4/5 h-4/5 rounded-full border border-white/5" />
                        <div className="w-3/5 h-3/5 rounded-full border border-white/5" />
                        <div className="w-2/5 h-2/5 rounded-full border border-white/5" />
                      </motion.div>

                      {/* Cover Card */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(255,77,109,0.25)] border border-[#ff4d6d]/20 bg-black">
                        <img
                          src={albumCoverUrl}
                          alt="Album Art"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      </div>
                    </div>

                    {/* Scrub Bar */}
                    <div className="w-full mt-6 mb-2">
                      <div className="relative flex items-center">
                        <input
                          type="range"
                          min={0}
                          max={duration || 100}
                          value={currentTime}
                          onChange={handleSeek}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d6d] hover:bg-white/20 transition-all"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#777] font-medium tabular-nums mt-1.5 px-0.5">
                        <span>{formatSeconds(currentTime)}</span>
                        <span>{formatSeconds(duration || 0)}</span>
                      </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center justify-between w-full mt-2 px-4">
                      {/* Shuffle */}
                      <button
                        onClick={() => setIsShuffled(!isShuffled)}
                        className={`p-2 transition-colors ${isShuffled ? 'text-[#ff4d6d]' : 'text-[#666] hover:text-white'}`}
                        title="Shuffle"
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>

                      {/* Prev Track */}
                      <button
                        onClick={handlePrev}
                        className="p-3 text-white/80 hover:text-white transition-transform active:scale-90"
                        title="Previous Track"
                      >
                        <SkipBack className="w-6 h-6 fill-current" />
                      </button>

                      {/* Play/Pause Button */}
                      <button
                        onClick={togglePlayAudio}
                        className="w-16 h-16 rounded-full bg-[#ff4d6d] hover:bg-[#ff6482] text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,77,109,0.5)] transition-all hover:scale-105 active:scale-95"
                        title={isPlayingAudio ? 'Pause' : 'Play'}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-7 h-7 fill-current" />
                        ) : (
                          <Play className="w-7 h-7 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Next Track */}
                      <button
                        onClick={handleNext}
                        className="p-3 text-white/80 hover:text-white transition-transform active:scale-90"
                        title="Next Track"
                      >
                        <SkipForward className="w-6 h-6 fill-current" />
                      </button>

                      {/* Repeat */}
                      <button
                        onClick={() => setIsLooping(!isLooping)}
                        className={`p-2 transition-colors ${isLooping ? 'text-[#ff4d6d]' : 'text-[#666] hover:text-white'}`}
                        title="Repeat"
                      >
                        <Repeat className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Volume Bar */}
                    <div className="flex items-center gap-3 w-4/5 mt-5 px-4 py-2 bg-white/[0.03] rounded-full border border-white/[0.05]">
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-[#888] hover:text-white transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-[#ff4d6d]" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          setVolume(parseFloat(e.target.value));
                          setIsMuted(false);
                        }}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4d6d]"
                      />
                    </div>
                  </div>
                )}

                {/* Track Info & Downloads Toolbar */}
                <div className="w-full max-w-4xl mt-6 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{activeTrack.title}</h3>
                    <p className="text-sm text-[#888] mt-0.5">{activeTrack.credits}</p>
                  </div>

                  {/* Download Options */}
                  <div className="flex items-center gap-3">
                    {/* Audio Download */}
                    <button
                      onClick={() => handleAudioDownload(activeTrack)}
                      disabled={downloading.audio}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                        downloadDone.audio
                          ? 'bg-green-500/10 border-green-500/30 text-green-400'
                          : downloading.audio
                          ? 'bg-white/[0.03] border-white/[0.08] text-[#888] cursor-wait'
                          : 'bg-white/[0.05] border-white/[0.08] text-[#aaa] hover:bg-white/[0.1] hover:border-[#ff4d6d]/40 hover:text-white active:scale-95'
                      }`}
                    >
                      {downloadDone.audio ? (
                        <Check className="w-4 h-4" />
                      ) : downloading.audio ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>{downloading.audio ? 'Preparing...' : downloadDone.audio ? 'Saved!' : 'Audio (WAV)'}</span>
                    </button>

                    {/* Video Download */}
                    {activeTrack.videoId && (
                      <button
                        onClick={() => handleVideoDownload(activeTrack)}
                        disabled={downloading.video}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                          downloadDone.video
                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                            : downloading.video
                            ? 'bg-white/[0.03] border-white/[0.08] text-[#888] cursor-wait'
                            : 'bg-white/[0.05] border-white/[0.08] text-[#aaa] hover:bg-white/[0.1] hover:border-[#ff4d6d]/40 hover:text-white active:scale-95'
                        }`}
                      >
                        {downloadDone.video ? (
                          <Check className="w-4 h-4" />
                        ) : downloading.video ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Film className="w-4 h-4" />
                        )}
                        <span>{downloading.video ? 'Downloading...' : downloadDone.video ? 'Saved!' : 'Video (MP4)'}</span>
                      </button>
                    )}
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
