import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PasscodeGate from '../components/PasscodeGate';
import MediaSection from '../components/MediaSection';
import AudiobookSection from '../components/AudiobookSection';
import ShortFilmSection from '../components/ShortFilmSection';
import DigitalBookViewer from '../components/DigitalBook/DigitalBookViewer';
import PainAlbumSection from '../components/PainAlbumSection';
import { Video, Music, Sparkles, ArrowDown, Lock } from 'lucide-react';

/**
 * Landing Page
 * Premium music store experience with ceremonial unlock transition
 */
export default function Landing() {
  const [searchParams] = useSearchParams();
  const initialPasscode = searchParams.get('passcode') || '';
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [passcode, setPasscode] = useState(initialPasscode);

  const handleUnlock = (content, code) => {
    setIsUnlocked(true);
    setMediaContent(content);
    setPasscode(code);
  };

  return (
    <div className="w-full min-h-screen">
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <motion.div
            key="gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
          >
            <PasscodeGate onUnlock={handleUnlock} initialPasscode={initialPasscode} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="w-full min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f5f3f0] transition-colors duration-500"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header - Light premium theme */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 dark:bg-[#0a0a0a]/80 border-b border-[#e5e5e5] dark:border-[#2a2a2a] shadow-sm transition-colors duration-500">
              <motion.div
                className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Logo/Brand */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center shadow-md shadow-[#ff6b35]/10"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Music className="w-5 h-5 text-[#ff6b35]" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0] tracking-tight">
                      Premium Collection
                    </h1>
                    <p className="text-[#888888] text-[10px] uppercase tracking-[0.2em] font-bold">Limited Edition</p>
                  </div>
                </div>

                {/* Lock Button */}
                <motion.button
                  className="group px-5 py-2.5 bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#ff6b35]/50 hover:bg-slate-50 dark:hover:bg-[#2d2d2d] text-[#888888] hover:text-[#0a0a0a] dark:hover:text-[#f5f3f0] transition-all duration-300 uppercase text-xs tracking-widest font-bold rounded-xl flex items-center gap-2 shadow-sm"
                  onClick={() => setIsUnlocked(false)}
                  title="Re-lock content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Lock className="w-4 h-4" />
                  <span>Lock</span>
                </motion.button>
              </motion.div>
            </header>

            {/* Generic Hero Section - Only shown for MUSIC or when no specific immersive experience is active and not PAIN passcode */}
            {mediaContent?.type === 'MUSIC' && passcode?.toUpperCase() !== 'PAIN' && (
              <section className="relative w-full py-24 overflow-hidden ">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <motion.div
                    className="absolute top-20 left-10 w-80 h-80 bg-[#ff6b35]/5 rounded-full blur-3xl"
                    animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute top-40 right-20 w-120 h-120 bg-[#ff6b35]/5 rounded-full blur-3xl"
                    animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                <div className="relative max-w-6xl mx-auto px-6 md:px-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="mb-8"
                  >
                    {/* Status badge */}
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#ff6b35]/10 border border-[#ff6b35]/25 rounded-full mb-8 shadow-sm"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35] animate-pulse shadow-[0_0_8px_rgba(255,107,53,0.6)]"></div>
                      <span className="text-[#ff6b35] text-[10px] font-bold uppercase tracking-widest">Access Granted</span>
                    </motion.div>

                    {/* Main heading */}
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-light font-serif mb-6 leading-tight tracking-tight">
                      <span className="block text-[#0a0a0a] dark:text-[#f5f3f0]">
                        Welcome to
                      </span>
                      <span className="block text-[#ff6b35] italic">
                        {mediaContent?.title || 'Your Collection'}
                      </span>
                    </h2>

                    <p className="text-[#888888] text-base md:text-lg max-w-2xl mx-auto mb-4 font-light">
                      Explore exclusive music videos and premium audio tracks
                    </p>
                    <p className="text-[#555555] text-xs font-bold uppercase tracking-[0.25em]">
                      Limited Edition • Premium Content
                    </p>
                  </motion.div>

                  {/* Stats or features */}
                  <motion.div
                    className="flex flex-wrap justify-center gap-6 md:gap-12 mt-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-[#1a1a1a]/50 border border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <Video className="w-6 h-6 text-[#ff6b35]" />
                      </div>
                      <p className="text-[#0a0a0a] dark:text-[#f5f3f0] font-bold text-lg font-serif">Music Videos</p>
                      <p className="text-[#888888] text-sm font-light">HD Quality</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-[#1a1a1a]/50 border border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <Music className="w-6 h-6 text-[#ff6b35]" />
                      </div>
                      <p className="text-[#0a0a0a] dark:text-[#f5f3f0] font-bold text-lg font-serif">Audio Tracks</p>
                      <p className="text-[#888888] text-sm font-light">Premium Sound</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-white/60 dark:bg-[#1a1a1a]/50 border border-[#e5e5e5] dark:border-[#2a2a2a] flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <Sparkles className="w-6 h-6 text-[#ff6b35]" />
                      </div>
                      <p className="text-[#0a0a0a] dark:text-[#f5f3f0] font-bold text-lg font-serif">Exclusive</p>
                      <p className="text-[#888888] text-sm font-light">Limited Edition</p>
                    </div>
                  </motion.div>

                  {/* Scroll indicator */}
                  <motion.div
                    className="mt-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                  >
                    <motion.div
                      className="inline-flex flex-col items-center gap-2 text-[#888888] font-bold"
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className="text-xs uppercase tracking-[0.2em]">Scroll to explore</span>
                      <ArrowDown className="w-5 h-5 text-[#ff6b35]" />
                    </motion.div>
                  </motion.div>
                </div>
              </section>
            )}

            {/* Experience Dispatcher */}
            {passcode?.toUpperCase() === 'PAIN' ? (
              <PainAlbumSection initialContent={mediaContent} />
            ) : mediaContent?.type === 'AUDIOBOOK' ? (
              <AudiobookSection initialContent={mediaContent} passcode={passcode} />
            ) : mediaContent?.type === 'SHORT_FILM' ? (
              <ShortFilmSection initialContent={mediaContent} passcode={passcode} />
            ) : mediaContent?.type === 'DIGITAL_BOOK' ? (
              <DigitalBookViewer initialContent={mediaContent} passcode={passcode} />
            ) : (
              <MediaSection initialContent={mediaContent} />
            )}

            {/* Footer */}
            <footer className="relative border-t border-[#e5e5e5] dark:border-[#2a2a2a] bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center shadow-md">
                      <Music className="w-4 h-4 text-[#ff6b35]" />
                    </div>
                    <span className="text-xl font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0] tracking-tight">
                      Premium Collection
                    </span>
                  </div>
                </div>
                <p className="text-[#888888] text-sm mb-2 font-light">
                  © 2026 Premium Music Collection. All rights reserved.
                </p>
                <p className="text-[#555555] text-xs uppercase tracking-widest font-bold">
                  Limited Edition • Exclusive Content
                </p>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
