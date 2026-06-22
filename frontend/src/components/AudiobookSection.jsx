import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAudioPlayer from './CustomAudioPlayer';
import CustomVideoPlayer from './CustomVideoPlayer';
import { BookOpen, ChevronRight, Play, CheckCircle, Clock } from 'lucide-react';

export default function AudiobookSection({ initialContent, passcode }) {
    const chapters = initialContent?.media || [];
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
    const [parsedChapters, setParsedChapters] = useState([]);
    const [seekTarget, setSeekTarget] = useState(null);

    const mainMedia = chapters[0]; // Assume first media is the primary video/audio for the experience
    const storageKey = `playback_${passcode}_${initialContent?.id}`;

    // Parse chapters from description if available
    useEffect(() => {
        if (mainMedia?.description) {
            const lines = mainMedia.description.split('\n');
            const timestampRegex = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s+(.+)/;
            const foundChapters = [];

            lines.forEach(line => {
                const match = line.match(timestampRegex);
                if (match) {
                    const hours = match[1] ? parseInt(match[1]) : 0;
                    const minutes = parseInt(match[2]);
                    const seconds = parseInt(match[3]);
                    const title = match[4].trim();
                    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

                    foundChapters.push({
                        time: totalSeconds,
                        title: title
                    });
                }
            });

            if (foundChapters.length > 0) {
                setParsedChapters(foundChapters);
            } else {
                // Fallback to media items if no timestamps found
                setParsedChapters(chapters.map(m => ({ title: m.title, time: 0, mediaId: m.id })));
            }
        } else {
            setParsedChapters(chapters.map(m => ({ title: m.title, time: 0, mediaId: m.id })));
        }
    }, [mainMedia]);

    // Load progress from localStorage
    useEffect(() => {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            try {
                const { chapterIndex, time } = JSON.parse(savedProgress);
                if (chapterIndex >= 0 && chapterIndex < parsedChapters.length) {
                    setCurrentChapterIndex(chapterIndex);
                    // We don't necessarily seek here, CustomVideoPlayer will load time from localStorage
                }
            } catch (e) {
                console.error("Error parsing saved progress", e);
            }
        }
    }, [storageKey, parsedChapters.length]);

    // Save progress when chapter changes
    useEffect(() => {
        if (!storageKey) return;
        const savedProgress = localStorage.getItem(storageKey) || '{}';
        const progress = JSON.parse(savedProgress);
        progress.chapterIndex = currentChapterIndex;
        localStorage.setItem(storageKey, JSON.stringify(progress));
    }, [currentChapterIndex, storageKey]);

    const handleChapterClick = (index, chapter) => {
        setCurrentChapterIndex(index);
        setSeekTarget({ time: chapter.time, ts: Date.now() });
    };

    const currentChapter = chapters[currentChapterIndex];

    const nextChapter = () => {
        if (currentChapterIndex < parsedChapters.length - 1) {
            handleChapterClick(currentChapterIndex + 1, parsedChapters[currentChapterIndex + 1]);
        }
    };

    const prevChapter = () => {
        if (currentChapterIndex > 0) {
            handleChapterClick(currentChapterIndex - 1, parsedChapters[currentChapterIndex - 1]);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f5f3f0] selection:bg-[#ff6b35]/30 font-sans overflow-x-hidden transition-colors duration-500">
            {/* Immersive Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 bg-[#f5f3f0] dark:bg-[#0a0a0a] transition-colors duration-500">
                <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-[#ff6b35]/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-[#ff6b35]/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 py-6 px-4 sm:px-6 md:px-8 lg:py-24 lg:px-12 landscape-audiobook-grid">

                {/* Left Side: Chapter List */}
                <div className="lg:col-span-4 space-y-4 sm:space-y-6 z-10">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
                        <div className="p-2 sm:p-3 bg-[#ff6b35]/10 rounded-xl sm:rounded-2xl border border-[#ff6b35]/25 shadow-sm">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff6b35]" />
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0] tracking-tight">Chapters</h2>
                    </div>

                    <div className="space-y-2 sm:space-y-3 max-h-[35vh] sm:max-h-[40vh] lg:max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                        {parsedChapters.map((chapter, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleChapterClick(index, chapter)}
                                className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-300 flex items-center gap-3 sm:gap-4 group ${currentChapterIndex === index
                                    ? 'bg-[#ff6b35]/10 border-[#ff6b35]/30 shadow-md dark:shadow-[#ff6b35]/5'
                                    : 'bg-white/40 dark:bg-[#1a1a1a]/40 border-[#e5e5e5] dark:border-[#2a2a2a] hover:bg-white/80 dark:hover:bg-[#1a1a1a]/80 hover:border-[#ff6b35]/30'
                                    }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-bold tracking-tight transition-colors shrink-0 ${currentChapterIndex === index ? 'bg-[#ff6b35] text-white' : 'bg-slate-100 dark:bg-[#2a2a2a] text-[#888888] group-hover:bg-[#ff6b35]/20 group-hover:text-[#ff6b35]'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${currentChapterIndex === index ? 'text-[#ff6b35]' : 'text-[#888888] group-hover:text-[#0a0a0a] dark:group-hover:text-[#f5f3f0]'}`}>
                                        {chapter.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-[#555555]" />
                                        <span className="text-[10px] text-[#888888] uppercase tracking-wider font-bold">
                                            {chapter.time > 0 ? `${Math.floor(chapter.time / 60)}:${(chapter.time % 60).toString().padStart(2, '0')}` : `Chapter ${index + 1}`}
                                        </span>
                                    </div>
                                </div>
                                {currentChapterIndex === index && (
                                    <motion.div layoutId="active-indicator">
                                        <Play className="w-4 h-4 text-[#ff6b35] fill-current" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Player Experience */}
                <div className="lg:col-span-8 z-10 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentChapterIndex}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="glass-panel-light p-4 sm:p-6 md:p-10 lg:p-16 relative overflow-hidden h-full flex flex-col justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[600px] rounded-2xl sm:rounded-3xl lg:rounded-4xl transition-colors duration-500"
                        >
                            {/* Animated pattern background */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ff6b35,transparent_70%)]"></div>
                            </div>

                            <div className="relative z-10 space-y-12">
                                <div className="text-center space-y-4">
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 bg-[#ff6b35]/10 border border-[#ff6b35]/25 rounded-full text-[#ff6b35] text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
                                    >
                                        Now Playing • Chapter {currentChapterIndex + 1}
                                    </motion.span>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0] leading-tight"
                                    >
                                        {parsedChapters[currentChapterIndex]?.title}
                                    </motion.h3>
                                </div>

                                {/* Player Logic */}
                                <div className="py-4 sm:py-6 lg:py-8 flex-1 flex flex-col justify-center">
                                    {mainMedia?.source === 'YOUTUBE' ? (
                                        <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video bg-black transform transition-transform duration-700 hover:scale-[1.01]">
                                            <CustomVideoPlayer
                                                videoUrl={`https://www.youtube.com/watch?v=${mainMedia.youtubeId}`}
                                                title={mainMedia.title}
                                                passcode={passcode}
                                                contentId={initialContent?.id}
                                                seekTrigger={seekTarget}
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-12">
                                            <CustomAudioPlayer
                                                src={mainMedia?.playUrl || mainMedia?.url}
                                                title={mainMedia?.title}
                                                passcode={passcode}
                                                contentId={initialContent?.id}
                                                chapterIndex={currentChapterIndex}
                                                seekTrigger={seekTarget}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center justify-between pt-4 sm:pt-6 lg:pt-8 border-t border-slate-200 dark:border-white/5">
                                    <button
                                        disabled={currentChapterIndex === 0}
                                        onClick={prevChapter}
                                        className="flex items-center gap-2 text-[#888888] hover:text-[#0a0a0a] dark:hover:text-[#f5f3f0] transition-colors disabled:opacity-20 disabled:cursor-not-allowed group"
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-bold uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm">Previous</span>
                                    </button>

                                    <div className="flex gap-1 sm:gap-1.5 max-w-[120px] sm:max-w-none overflow-hidden h-2">
                                        {parsedChapters.map((_, i) => (
                                            <div key={i} className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full transition-all duration-300 shrink-0 ${i === currentChapterIndex ? 'w-4 sm:w-6 bg-[#ff6b35]' : 'bg-[#2a2a2a]'}`}></div>
                                        ))}
                                    </div>

                                    <button
                                        disabled={currentChapterIndex === chapters.length - 1}
                                        onClick={nextChapter}
                                        className="flex items-center gap-2 text-[#888888] hover:text-[#0a0a0a] dark:hover:text-[#f5f3f0] transition-colors disabled:opacity-20 disabled:cursor-not-allowed group"
                                    >
                                        <span className="font-bold uppercase tracking-wider sm:tracking-widest text-xs sm:text-sm">Next</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
