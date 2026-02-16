import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PasscodeGate from '../components/PasscodeGate';
import MediaSection from '../components/MediaSection';
import AudiobookSection from '../components/AudiobookSection';
import ShortFilmSection from '../components/ShortFilmSection';

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
            className="w-full min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header - Dark premium theme */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/30 border-b border-white/10 shadow-lg ">
              <motion.div
                className="max-w-7xl mx-auto px-6 md:px-8 py-5 flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {/* Logo/Brand */}
                <div className="flex items-center gap-4">
                  <motion.div
                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Premium Collection
                    </h1>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Limited Edition</p>
                  </div>
                </div>

                {/* Lock Button */}
                <motion.button
                  className="group px-5 py-2.5 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-white/10 text-gray-300 hover:text-white transition-all duration-300 uppercase text-sm tracking-wider font-medium rounded-xl backdrop-blur-sm flex items-center gap-2"
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
                <div className="absolute inset-0 opacity-20">
                  <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full blur-3xl"
                    animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute top-40 right-20 w-96 h-96 bg-pink-600 rounded-full blur-3xl"
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-8"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium uppercase tracking-wider">Access Granted</span>
                    </motion.div>

                    {/* Main heading */}
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                      <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                        Welcome to
                      </span>
                      <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {mediaContent?.title || 'Your Collection'}
                      </span>
                    </h2>

                    <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto mb-4">
                      Explore exclusive music videos and premium audio tracks
                    </p>
                    <p className="text-gray-500 text-sm uppercase tracking-[0.3em]">
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
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-lg">Music Videos</p>
                      <p className="text-gray-400 text-sm">HD Quality</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/30">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-lg">Audio Tracks</p>
                      <p className="text-gray-400 text-sm">Premium Sound</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-pink-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-lg">Exclusive</p>
                      <p className="text-gray-400 text-sm">Limited Edition</p>
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
                      className="inline-flex flex-col items-center gap-2 text-gray-400"
                      animate={{ y: [0, 10, 0] }}
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
            ) : (
              <MediaSection initialContent={mediaContent} />
            )}

            {/* Footer */}
            <footer className="relative border-t border-white/10 bg-black/30 backdrop-blur-xl">
              <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Premium Collection
                    </span>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mb-2">
                  © 2026 Premium Music Collection. All rights reserved.
                </p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">
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
