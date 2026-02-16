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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
                <Film className="w-16 h-16 text-gray-600 mb-4" />
                <h2 className="text-2xl font-bold">No film content available</h2>
            </div>
        );
    }

    const togglePlaylist = () => {
        setIsInPlaylist(!isInPlaylist);
        // Toast or subtle notification could go here
    };

    return (
        <div className="w-full min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
            {/* Immersive Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-[70vw] h-[70vw] bg-purple-900/10 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-indigo-900/10 rounded-full blur-[180px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />
            </div>

            {/* Poster Hero Experience */}
            <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="relative z-10 w-full max-w-6xl aspect-21/9 md:aspect-21/7 rounded-4xl overflow-hidden group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Background Poster Image / Placeholder */}
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-900 via-purple-900 to-black">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700" />
                        {/* If we had a poster URL: <img src={videoMedia.posterUrl} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[3s]" /> */}
                    </div>

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-linear-to-r from-black via-transparent to-transparent opacity-80" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="max-w-3xl space-y-6"
                        >
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-md text-[10px] font-black uppercase tracking-widest border border-white/10">4K ULTRA HD</span>
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 backdrop-blur-md rounded-md text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 text-yellow-500">
                                    <Star className="w-3 h-3 fill-current" /> Premium Exclusive
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter leading-[1.2] text-white drop-shadow-2xl pt-6">
                                {videoMedia.title}
                            </h1>

                            <p className="text-white/60 text-base md:text-lg max-w-2xl font-light leading-relaxed line-clamp-2 md:line-clamp-3">
                                {videoMedia.description || "An extraordinary cinematic journey that pushes the boundaries of storytelling. Witness a masterpiece of visual poetry, exclusively available in this premium collection."}
                            </p>

                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                <button
                                    onClick={() => setShowPlayer(true)}
                                    className="group/btn px-10 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-indigo-500 hover:text-white transition-all transform hover:scale-105 flex items-center gap-3 active:scale-95"
                                >
                                    <Play className="w-5 h-5 fill-current" />
                                    Watch Film
                                </button>

                                <button
                                    onClick={togglePlaylist}
                                    className={`px-8 py-5 backdrop-blur-xl rounded-2xl font-black uppercase text-xs tracking-[0.2em] border transition-all flex items-center gap-3 active:scale-95 ${isInPlaylist
                                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {isInPlaylist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                    {isInPlaylist ? 'In Playlist' : 'Add to Playlist'}
                                </button>

                                <button className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95">
                                    <Share2 className="w-5 h-5" />
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
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                    <div className="p-8 rounded-4xl bg-white/2 border border-white/5 backdrop-blur-3xl space-y-4">
                        <Clock className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest">Duration</h3>
                        <p className="text-2xl font-bold">12:45 <span className="text-sm text-white/40 font-normal">MIN</span></p>
                    </div>
                    <div className="p-8 rounded-4xl bg-white/2 border border-white/5 backdrop-blur-3xl space-y-4 md:col-span-2">
                        <Info className="w-6 h-6 text-purple-400" />
                        <h3 className="text-sm font-black uppercase tracking-widest">About the Film</h3>
                        <p className="text-white/60 text-sm leading-relaxed">
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
                        className="fixed inset-0 z-100 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 1.05, opacity: 0, y: -20 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="relative w-full max-w-7xl aspect-video bg-black rounded-4xl overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]"
                        >
                            {/* Modal Header/Top Bar */}
                            <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-50 pointer-events-none bg-linear-to-b from-black/80 to-transparent">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1 block">Now Playing Cinema</span>
                                    <h2 className="text-xl font-bold tracking-tight">{videoMedia.title}</h2>
                                </div>
                                <button
                                    onClick={() => setShowPlayer(false)}
                                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white pointer-events-auto transition-all transform hover:rotate-90 active:scale-90"
                                >
                                    <X size={24} />
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
            <footer className="w-full py-20 px-8 flex justify-center opacity-20 hover:opacity-100 transition-opacity duration-700">
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.5em]">
                        <span>Direction</span>
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <span>Cinematography</span>
                        <div className="w-1 h-1 rounded-full bg-white" />
                        <span>Sound</span>
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-center">Exclusive Production © 2026</p>
                </div>
            </footer>
        </div>
    );
}
