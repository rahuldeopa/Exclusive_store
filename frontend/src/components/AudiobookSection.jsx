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
        <div className="w-full min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
            {/* Immersive Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[40vw] h-[40vw] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 py-24 px-6 md:px-12">

                {/* Left Side: Chapter List */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                            <BookOpen className="w-6 h-6 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Chapters</h2>
                    </div>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {parsedChapters.map((chapter, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleChapterClick(index, chapter)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group ${currentChapterIndex === index
                                    ? 'bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                    }`}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold tracking-tight transition-colors ${currentChapterIndex === index ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-semibold truncate ${currentChapterIndex === index ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                        {chapter.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                            {chapter.time > 0 ? `${Math.floor(chapter.time / 60)}:${(chapter.time % 60).toString().padStart(2, '0')}` : `Chapter ${index + 1}`}
                                        </span>
                                    </div>
                                </div>
                                {currentChapterIndex === index && (
                                    <motion.div layoutId="active-indicator">
                                        <Play className="w-4 h-4 text-indigo-400 fill-current" />
                                    </motion.div>
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Player Experience */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentChapterIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="bg-white/2 backdrop-blur-3xl border border-white/5 rounded-4xl p-8 md:p-16 shadow-2xl relative overflow-hidden h-full flex flex-col justify-center min-h-[600px]"
                        >
                            {/* Animated pattern background */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#6366f1,transparent_70%)]"></div>
                            </div>

                            <div className="relative z-10 space-y-12">
                                <div className="text-center space-y-4">
                                    <motion.span
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-bold uppercase tracking-[0.2em]"
                                    >
                                        Now Playing • Chapter {currentChapterIndex + 1}
                                    </motion.span>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight"
                                    >
                                        {parsedChapters[currentChapterIndex]?.title}
                                    </motion.h3>
                                </div>

                                {/* Player Logic */}
                                <div className="py-8 flex-1 flex flex-col justify-center">
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
                                <div className="flex items-center justify-between pt-8 border-t border-white/5">
                                    <button
                                        disabled={currentChapterIndex === 0}
                                        onClick={prevChapter}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed group"
                                    >
                                        <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                        <span className="font-bold uppercase tracking-widest text-sm">Previous</span>
                                    </button>

                                    <div className="flex gap-1.5">
                                        {parsedChapters.map((_, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentChapterIndex ? 'w-6 bg-indigo-500' : 'bg-white/10'}`}></div>
                                        ))}
                                    </div>

                                    <button
                                        disabled={currentChapterIndex === chapters.length - 1}
                                        onClick={nextChapter}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed group"
                                    >
                                        <span className="font-bold uppercase tracking-widest text-sm">Next</span>
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
