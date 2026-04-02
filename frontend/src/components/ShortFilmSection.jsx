import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomVideoPlayer from './CustomVideoPlayer';
import { Film, Play, Star, Plus, Check, X, Maximize2, Info, Clock, Share2 } from 'lucide-react';

export default function ShortFilmSection({ initialContent, passcode }) {
    const videoMedia = initialContent?.media?.find(m => m.type === 'VIDEO');
    const [showPlayer, setShowPlayer] = useState(false);
    const [isInPlaylist, setIsInPlaylist] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    if (!videoMedia) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-900 dark:text-white transition-colors duration-500">
                <Film className="w-16 h-16 text-slate-400 dark:text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold">No film content available</h2>
            </div>
        );
    }

    const togglePlaylist = () => {
        setIsInPlaylist(!isInPlaylist);
        // Toast or subtle notification could go here
    };

    return (
        <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500/30 dark:selection:bg-purple-500/30 font-sans overflow-x-hidden transition-colors duration-500">
            {/* Immersive Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-linear-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                <div className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-blue-500/5 dark:bg-purple-900/10 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-indigo-500/5 dark:bg-indigo-900/10 rounded-full blur-[180px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-5 dark:opacity-20" />
            </div>

            {/* Poster Hero Experience */}
            <main className="relative min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 md:px-6 py-10 sm:py-14 md:py-20 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-6xl aspect-4/3 sm:aspect-video md:aspect-21/9 lg:aspect-21/7 rounded-2xl sm:rounded-3xl md:rounded-4xl overflow-hidden group shadow-[0_20px_60px_-15px_rgba(30,41,59,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-200 dark:border-white/5 transition-colors duration-500"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Background Poster Image / Placeholder */}
                    <div className="absolute inset-0 bg-linear-to-br from-blue-100 via-indigo-100 to-slate-200 dark:from-indigo-900 dark:via-purple-900 dark:to-black">
                        <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/40 group-hover:bg-slate-900/5 dark:group-hover:bg-black/20 transition-colors duration-700" />
                        {/* If we had a poster URL: <img src={videoMedia.posterUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s]" /> */}
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-linear-to-t from-white/90 via-white/50 to-transparent dark:from-black dark:via-black/40 transition-colors duration-500" />
                    <div className="absolute inset-0 bg-linear-to-r from-white/90 via-transparent to-transparent opacity-90 dark:from-black dark:via-transparent dark:opacity-80 transition-colors duration-500" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-4 sm:p-6 md:p-10 lg:p-16 flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="max-w-3xl space-y-3 sm:space-y-4 md:space-y-6"
                        >
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-slate-800 dark:text-white transition-colors duration-500">
                                <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-slate-100 dark:bg-white/10 backdrop-blur-md rounded-md text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/20">4K ULTRA HD</span>
                                <span className="flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-500/20 backdrop-blur-md rounded-md text-[8px] sm:text-[10px] font-black uppercase tracking-widest border border-yellow-500/30 text-yellow-400">
                                    <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> Premium Exclusive
                                </span>
                            </div>

                            <h1 className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-black italic uppercase tracking-tighter leading-[1.2] text-slate-900 dark:text-white drop-shadow-xl dark:drop-shadow-2xl pt-2 sm:pt-4 md:pt-6 transition-colors duration-500">
                                {videoMedia.title}
                            </h1>

                            <p className="text-slate-700 dark:text-white/60 text-xs sm:text-sm md:text-base lg:text-lg max-w-2xl font-light leading-relaxed line-clamp-2 md:line-clamp-3 transition-colors duration-500">
                                {videoMedia.description || "An extraordinary cinematic journey that pushes the boundaries of storytelling. Witness a masterpiece of visual poetry, exclusively available in this premium collection."}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 md:pt-4">
                                <button
                                    onClick={() => setShowPlayer(true)}
                                    className="group/btn px-5 py-2.5 sm:px-7 sm:py-3 md:px-10 md:py-5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] shadow-xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105 flex items-center gap-2 sm:gap-3 active:scale-95"
                                >
                                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                    Watch Film
                                </button>

                                <button
                                    onClick={togglePlaylist}
                                    className={`px-4 py-2.5 sm:px-6 sm:py-3 md:px-8 md:py-5 backdrop-blur-xl rounded-xl sm:rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] border transition-all flex items-center gap-2 sm:gap-3 active:scale-95 ${isInPlaylist
                                        ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-500/20 dark:border-green-500/50 dark:text-green-400'
                                        : 'bg-white/50 border-slate-300 text-slate-700 hover:bg-slate-100 dark:bg-white/10 dark:border-white/20 dark:text-white dark:hover:bg-white/20 dark:hover:border-white/30'
                                        }`}
                                >
                                    {isInPlaylist ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    <span className="hidden sm:inline">{isInPlaylist ? 'In Playlist' : 'Add to Playlist'}</span>
                                    <span className="sm:hidden">{isInPlaylist ? 'Added' : 'Add'}</span>
                                </button>

                                <button className="p-2.5 sm:p-3 md:p-5 bg-white/50 border border-slate-300 text-slate-700 hover:bg-slate-100 dark:bg-white/10 backdrop-blur-xl dark:border-white/20 rounded-xl sm:rounded-2xl dark:text-white dark:hover:bg-white/20 transition-all active:scale-95">
                                    <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Animated Particles Decor */}
                    <div className="absolute top-10 right-10 flex gap-2">
                        {[1, 2, 3].map(i => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_indigo]"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Additional Info Cards */}
                <div className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8 md:mt-12">
                    <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-4xl glass-panel-light space-y-2 sm:space-y-4">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 dark:text-indigo-400" />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Duration</h3>
                        <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-gray-100">12:45 <span className="text-xs sm:text-sm text-slate-500 dark:text-white/40 font-normal">MIN</span></p>
                    </div>
                    <div className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl md:rounded-4xl glass-panel-light space-y-2 sm:space-y-4 sm:col-span-1 md:col-span-2">
                        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500 dark:text-purple-400" />
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">About the Film</h3>
                        <p className="text-slate-600 dark:text-white/60 text-xs sm:text-sm leading-relaxed">
                            Captured using high-end anamorphic lenses, this production explores the delicate balance between reality and perception. A must-watch for cinephiles who appreciate atmospheric cinematography and deep narrative layers.
                        </p>
                    </div>
                </div>
            </main>

            {/* Immersive Video Modal (The "Wide View") */}
            <AnimatePresence>
                {showPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-1 sm:p-2 md:p-4 lg:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.05, opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="relative w-full max-w-7xl aspect-video bg-black rounded-xl sm:rounded-2xl md:rounded-3xl lg:rounded-4xl overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]"
                        >
                            {/* Modal Header/Top Bar */}
                            <div className="absolute top-0 inset-x-0 p-3 sm:p-4 md:p-6 flex items-center justify-between z-50 pointer-events-none bg-linear-to-b from-black/80 to-transparent">
                                <div>
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/40 mb-0.5 sm:mb-1 block">Now Playing Cinema</span>
                                    <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-tight truncate max-w-[200px] sm:max-w-none">{videoMedia.title}</h2>
                                </div>
                                <button
                                    onClick={() => setShowPlayer(false)}
                                    className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white pointer-events-auto transition-all transform hover:rotate-90 active:scale-90"
                                >
                                    <X size={20} className="sm:hidden" />
                                    <X size={24} className="hidden sm:block" />
                                </button>
                            </div>

                            {/* Player Wrapper */}
                            <div className="w-full h-full pointer-events-auto">
                                <CustomVideoPlayer
                                    videoUrl={videoMedia.source === 'YOUTUBE' ? `https://www.youtube.com/watch?v=${videoMedia.youtubeId}` : videoMedia.url}
                                    title={videoMedia.title}
                                    passcode={passcode}
                                    contentId={initialContent?.id}
                                />
                            </div>

                            {/* Fullscreen Tooltip Hint */}
                            <div className="absolute bottom-24 right-8 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-bold text-white flex items-center gap-2">
                                    <Maximize2 size={12} /> Fullscreen available in controls
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Credits Decor */}
            <footer className="w-full py-8 px-4 sm:py-12 sm:px-6 md:py-20 md:px-8 flex justify-center opacity-30 dark:opacity-20 hover:opacity-100 transition-opacity duration-700">
                <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-slate-800 dark:text-white">
                        <span>Direction</span>
                        <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-white" />
                        <span>Cinematography</span>
                        <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-white" />
                        <span>Sound</span>
                    </div>
                    <p className="text-[8px] sm:text-[10px] uppercase font-bold tracking-widest text-center text-slate-600 dark:text-white">Exclusive Production © 2026</p>
                </div>
            </footer>
        </div>
    );
}
