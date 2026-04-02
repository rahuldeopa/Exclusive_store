import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PasscodeGate from '../components/PasscodeGate';
import MediaSection from '../components/MediaSection';
import AudiobookSection from '../components/AudiobookSection';
import ShortFilmSection from '../components/ShortFilmSection';
import DigitalBookViewer from '../components/DigitalBook/DigitalBookViewer';

/**
 * Landing Page
 * Premium music store experience with ceremonial unlock transition
 */
export default function Landing() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mediaContent, setMediaContent] = useState(null);
  const [passcode, setPasscode] = useState('');

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
            <PasscodeGate onUnlock={handleUnlock} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-500"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header - Light premium theme */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-500">
              <motion.div
                className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between"
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Logo/Brand */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Premium Collection
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-[0.15em] font-medium">Limited Edition</p>
                  </div>
                </div>

                {/* Lock Button */}
                <motion.button
                  className="group px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 uppercase text-xs tracking-widest font-semibold rounded-xl flex items-center gap-2 shadow-sm"
                  onClick={() => setIsUnlocked(false)}
                  title="Re-lock content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Lock</span>
                </motion.button>
              </motion.div>
            </header>

            {/* Generic Hero Section - Only shown for MUSIC or when no specific immersive experience is active */}
            {mediaContent?.type === 'MUSIC' && (
              <section className="relative w-full py-24 overflow-hidden ">
                {/* Background decorations */}
                <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
                  <motion.div
                    className="absolute top-20 left-10 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full blur-3xl"
                    animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute top-40 right-20 w-120 h-120 bg-indigo-200 dark:bg-purple-600 rounded-full blur-3xl"
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-full mb-8 shadow-sm"
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                      <span className="text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-widest">Access Granted</span>
                    </motion.div>

                    {/* Main heading */}
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight">
                      <span className="block text-slate-800 dark:text-white">
                        Welcome to
                      </span>
                      <span className="block text-blue-600 dark:text-blue-400">
                        {mediaContent?.title || 'Your Collection'}
                      </span>
                    </h2>

                    <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-4 font-medium">
                      Explore exclusive music videos and premium audio tracks
                    </p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
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
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-slate-800 dark:text-white font-bold text-lg">Music Videos</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">HD Quality</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <svg className="w-8 h-8 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <p className="text-slate-800 dark:text-white font-bold text-lg">Audio Tracks</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Premium Sound</p>
                    </div>

                    <div className="text-center group">
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300">
                        <svg className="w-8 h-8 text-cyan-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <p className="text-slate-800 dark:text-white font-bold text-lg">Exclusive</p>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Limited Edition</p>
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
                      className="inline-flex flex-col items-center gap-2 text-slate-400 font-semibold"
                      animate={{ y: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <span className="text-sm uppercase tracking-wider">Scroll to explore</span>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.div>
                  </motion.div>
                </div>
              </section>
            )}

            {/* Experience Dispatcher */}
            {mediaContent?.type === 'AUDIOBOOK' ? (
              <AudiobookSection initialContent={mediaContent} passcode={passcode} />
            ) : mediaContent?.type === 'SHORT_FILM' ? (
              <ShortFilmSection initialContent={mediaContent} passcode={passcode} />
            ) : mediaContent?.type === 'DIGITAL_BOOK' ? (
              <DigitalBookViewer initialContent={mediaContent} passcode={passcode} />
            ) : (
              <MediaSection initialContent={mediaContent} />
            )}

            {/* Footer */}
            <footer className="relative border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl transition-colors duration-500">
              <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Premium Collection
                    </span>
                  </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-2 font-medium">
                  © 2026 Premium Music Collection. All rights reserved.
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest font-semibold">
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
