import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

/**
 * CustomAudioPlayer Component
 * Premium audio player with dark, music-focused aesthetic
 */
export default function CustomAudioPlayer({ src, title, passcode, contentId, chapterIndex, seekTrigger }) {
  const { isDark } = useTheme();
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showVolume, setShowVolume] = useState(false);

  // Persistence Logic
  const storageKey = passcode && contentId ? `playback_${passcode}_${contentId}` : null;

  // Load initial time
  useEffect(() => {
    if (storageKey) {
      const savedProgress = localStorage.getItem(storageKey);
      if (savedProgress) {
        try {
          const { chapterIndex: savedChapter, time } = JSON.parse(savedProgress);
          // For audiobooks, only restore if the chapter matches
          if (chapterIndex !== undefined) {
            if (savedChapter === chapterIndex && time > 0) {
              if (audioRef.current) audioRef.current.currentTime = time;
              setCurrentTime(time);
            }
          } else if (time > 0) {
            if (audioRef.current) audioRef.current.currentTime = time;
            setCurrentTime(time);
          }
        } catch (e) {
          console.error("Error loading progress", e);
        }
      }
    }
  }, [storageKey, chapterIndex, src]);

  // Save progress periodically
  useEffect(() => {
    if (!storageKey || !isPlaying) return;

    const saveInterval = setInterval(() => {
      if (audioRef.current) {
        const progress = {
          time: audioRef.current.currentTime,
          chapterIndex: chapterIndex // undefined for single audio
        };
        localStorage.setItem(storageKey, JSON.stringify(progress));
      }
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [isPlaying, storageKey, chapterIndex]);

  // External Seek Trigger
  useEffect(() => {
    if (seekTrigger?.time !== undefined) {
      if (audioRef.current) audioRef.current.currentTime = seekTrigger.time;
      setCurrentTime(seekTrigger.time);
    }
  }, [seekTrigger]);

  // Update current time as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isSeeking) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      // Optional: clear progress on end? Or not.
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isSeeking]);

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {
          // Handle autoplay restrictions
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <audio
        ref={audioRef}
        src={src}
        aria-label={`Audio player for ${title}`}
        preload="metadata"
      />

      {/* Player Container */}
      <motion.div
        className="relative backdrop-blur-xl bg-white/40 dark:bg-[#1a1a1a]/40 border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-2xl p-5 overflow-hidden group hover:border-[#ff6b35]/40 hover:shadow-lg hover:shadow-[#ff6b35]/5 transition-all duration-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b35]/3 via-transparent to-transparent pointer-events-none" />

        {/* Pulsing glow effects */}
        <motion.div
          className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff6b35]/10 rounded-full blur-3xl"
          animate={{
            scale: isPlaying ? [1, 1.2, 1] : 1,
            opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.1,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#ff6b35]/10 rounded-full blur-3xl"
          animate={{
            scale: isPlaying ? [1, 1.2, 1] : 1,
            opacity: isPlaying ? [0.2, 0.4, 0.2] : 0.1,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1.5,
          }}
        />

        <div className="relative z-10 space-y-4 pt-10">
          {/* Top Section: Play Button + Track Info */}
          <div className="flex items-start gap-4">
            {/* Play/Pause Button */}
            <motion.button
              className="relative flex items-center justify-center w-16 h-16 rounded-2xl shrink-0 bg-[#ff6b35] hover:bg-[#ff8c5a] shadow-xl shadow-[#ff6b35]/20 group/btn overflow-hidden"
              onClick={handlePlayPause}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />

              <AnimatePresence mode="wait">
                {isPlaying ? (
                  <motion.svg
                    key="pause"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7 text-white relative z-10"
                    initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="play"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-7 h-7 text-white ml-1 relative z-10"
                    initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path d="M8 5v14l11-7z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Track Info */}
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0] truncate mb-1">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="flex items-center gap-1"
                      animate={isPlaying ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-1 h-1 rounded-full bg-[#ff6b35]"></div>
                      <span className="text-[10px] text-[#ff6b35] uppercase tracking-wider font-bold">
                        {isPlaying ? 'Now Playing' : 'Ready'}
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Volume Control */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowVolume(true)}
                  onMouseLeave={() => setShowVolume(false)}
                >
                  <button
                    className="w-9 h-9 flex items-center justify-center text-slate-500 dark:text-gray-400 hover:text-[#0a0a0a] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-lg transition-all duration-200"
                    aria-label="Volume"
                  >
                    {volume === 0 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      </svg>
                    ) : volume < 0.5 ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume Slider Popup */}
                  <AnimatePresence>
                    {showVolume && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className="absolute bottom-full right-0 mb-2 p-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-white/20 shadow-2xl"
                      >
                        <div className="flex flex-col items-center gap-2">
                           <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">{Math.round(volume * 100)}%</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={volume * 100}
                            onChange={handleVolumeChange}
                            className="w-24 h-1 bg-slate-200 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#ff6b35]"
                            style={{
                              background: `linear-gradient(to right, rgb(255 107 53) 0%, rgb(255 107 53) ${volume * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} ${volume * 100}%, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 100%)`
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar Section */}
          <div className="space-y-2">
            <div className="relative h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer group/progress">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                onMouseDown={handleSeekStart}
                onMouseUp={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchEnd={handleSeekEnd}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                aria-label="Audio progress"
              />

              {/* Background track */}
              <div className="absolute inset-0 bg-slate-300/20 dark:bg-white/5 rounded-full"></div>

              {/* Progress fill with gradient */}
              <motion.div
                className="absolute inset-y-0 left-0 h-full bg-[#ff6b35] rounded-full"
                style={{ width: `${progress}%` }}
                transition={{ duration: isSeeking ? 0 : 0.1 }}
              />

              {/* Progress glow effect */}
              <motion.div
                className="absolute inset-y-0 left-0 h-full bg-[#ff6b35] rounded-full blur-md"
                style={{ width: `${progress}%` }}
                initial={{ opacity: 0.15 }}
                animate={{ opacity: isPlaying ? [0.15, 0.3, 0.15] : 0.15 }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              {/* Hover indicator dot */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-[#ff6b35]/50 border-2 border-[#ff6b35] opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#ff6b35] font-medium">{formatTime(currentTime)}</span>
              <span className="text-slate-400 dark:text-gray-500">/</span>
              <span className="text-slate-600 dark:text-gray-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Waveform Visualization */}
          <motion.div
            className="flex items-end justify-center gap-0.5 h-16 px-1 rounded-xl bg-slate-200/30 dark:bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-full"
                style={{
                  background: isPlaying
                    ? 'rgb(255 107 53)'
                    : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                }}
                animate={
                  isPlaying
                    ? {
                      height: [
                        `${Math.random() * 15 + 10}%`,
                        `${Math.random() * 70 + 30}%`,
                        `${Math.random() * 15 + 10}%`,
                      ],
                      opacity: [0.4, 1, 0.4],
                    }
                    : { height: '20%', opacity: 0.3 }
                }
                transition={{
                  duration: 0.6 + Math.random() * 0.4,
                  delay: i * 0.015,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>

          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div
                  key="playing"
                  className="flex items-center gap-2 text-[#ff6b35]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <motion.div
                    className="flex gap-0.5"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <div className="w-0.5 h-3 bg-current rounded-full"></div>
                    <div className="w-0.5 h-4 bg-current rounded-full"></div>
                    <div className="w-0.5 h-3 bg-current rounded-full"></div>
                  </motion.div>
                  <span className="text-xs font-medium uppercase tracking-wider">Playing</span>
                </motion.div>
              ) : (
                <motion.div
                  key="paused"
                  className="flex items-center gap-2 text-slate-500 dark:text-gray-500"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                  <span className="text-xs font-medium uppercase tracking-wider">Paused</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Outer glow effect */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#ff6b35]/0 via-[#ff6b35]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm pointer-events-none -z-10"></div>
      </motion.div>
    </div>
  );
}