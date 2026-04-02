import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMediaContent } from '../services/api';
import CustomAudioPlayer from './CustomAudioPlayer';
import CustomVideoPlayer from './CustomVideoPlayer';
import SkeletonLoader from './SkeletonLoader';

export default function MediaSection({ initialContent }) {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(!initialContent);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialContent) {
      if (initialContent.media) {
        const videos = initialContent.media.filter(item => item.type === 'VIDEO');
        const audio = initialContent.media.filter(item => item.type === 'AUDIO');
        setMedia({ videos, audio });
      } else {
        setMedia(initialContent); // Fallback for old structure/direct format
      }
      setLoading(false);
      return;
    }

    const loadMedia = async () => {
      try {
        setLoading(true);
        const mediaData = await getMediaContent();
        setMedia(mediaData);
      } catch (err) {
        console.error(err);
        setError('Content unavailable');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [initialContent]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative px-4 sm:px-8 py-20 max-w-7xl mx-auto">
        <div className="mb-16 mt-8">
            <SkeletonLoader width="300px" height="40px" className="mx-auto mb-4" />
            <SkeletonLoader width="150px" height="15px" className="mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
            <SkeletonLoader height="300px" className="rounded-2xl" />
            <SkeletonLoader height="300px" className="rounded-2xl" />
        </div>
        <div className="mb-16">
            <SkeletonLoader width="300px" height="40px" className="mx-auto mb-4" />
            <SkeletonLoader width="150px" height="15px" className="mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonLoader height="200px" className="rounded-2xl" />
            <SkeletonLoader height="200px" className="rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 dark:bg-purple-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400 dark:bg-cyan-600 rounded-full blur-3xl"></div>
      </div>

      {/* Sound wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-blue-500 dark:via-purple-500 to-transparent opacity-30"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-20">
        {/* VIDEOS SECTION */}
        <section className="mb-32 landscape:mb-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-pink-500"></div>
              <h2 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Music Videos
              </h2>
              <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-500"></div>
            </motion.div>
            <p className="text-slate-500 dark:text-gray-400 uppercase tracking-[0.3em] text-sm font-semibold">Visual Experience</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {media?.videos?.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative h-px my-24 ">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500/30 dark:via-purple-500/50 to-transparent"></div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 dark:from-purple-500 dark:to-pink-500"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
          >
            <div className="absolute inset-3 rounded-full bg-black"></div>
          </motion.div>
        </div>

        {/* AUDIO SECTION */}
        <section className="landscape:mt-12">
          <motion.div
            className="text-center mb-16 "
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div
              className="inline-flex items-center gap-3 mb-4"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-purple-500"></div>
              <h2 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-600 via-indigo-600 to-blue-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Audio Tracks
              </h2>
              <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-pink-500"></div>
            </motion.div>
            <p className="text-slate-500 dark:text-gray-400 uppercase tracking-[0.3em] text-sm font-semibold">Premium Sound</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {media?.audio?.map((track, index) => (
              <AudioCard key={track.id} track={track} index={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* =======================
   VIDEO CARD
 ======================= */

function VideoCard({ video, index }) {
  // Construct the appropriate URL based on source
  const videoUrl = video.source === 'YOUTUBE'
    ? `https://www.youtube.com/watch?v=${video.youtubeId}`
    : (video.playUrl || video.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group hover-lift"
    >
      <div className="relative glass-panel-light overflow-hidden flex flex-col landscape:flex-row landscape:lg:flex-col rounded-2xl h-full">
        {/* Video wrapper */}
        <div className="relative w-full aspect-video bg-slate-900 landscape:w-[65%] landscape:lg:w-full">
          <CustomVideoPlayer videoUrl={videoUrl} title={video.title} className="w-full h-full" />
        </div>

        {/* Content */}
        <div className="p-6 landscape:w-[35%] landscape:lg:w-full landscape:flex landscape:flex-col landscape:justify-center landscape:p-4">
          <div className="flex items-center gap-3 mb-3 landscape:mb-1">
            <div className="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 dark:from-purple-500 dark:to-pink-500 flex items-center justify-center landscape:w-8 landscape:h-8">
              <svg className="w-5 h-5 text-white landscape:w-4 landscape:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-slate-900 dark:text-white text-xl font-semibold group-hover:text-blue-600 dark:group-hover:text-purple-400 transition truncate landscape:text-base">
                {video.title}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-sm uppercase tracking-wider landscape:text-[10px] font-medium">Music Video</p>
            </div>
          </div>

          {/* Progress bar decoration */}
          <div className="relative h-1 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-linear-to-r from-blue-500 to-indigo-500 dark:from-purple-500 dark:to-pink-500 rounded-full transition-all"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: index * 0.2 + 0.5, duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-blue-600/0 via-blue-600/5 to-indigo-600/0 dark:from-purple-600/0 dark:via-purple-600/10 dark:to-pink-600/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
      </div>
    </motion.div>
  );
}

/* =======================
   AUDIO CARD
 ======================= */

function AudioCard({ track, index }) {
  // Use playUrl for R2 content, fallback to url
  const audioUrl = track.playUrl || track.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group hover-lift"
    >
      <div className="relative glass-panel-light rounded-2xl p-6 h-full flex flex-col">
        {/* Vinyl record decoration */}
        <div className="absolute top-6 right-6 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-current text-indigo-500 dark:text-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-current"></div>
            </div>
          </motion.div>
        </div>

        {/* Header */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-indigo-500 to-blue-500 dark:from-cyan-500 dark:to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 dark:shadow-cyan-500/30">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 ">
              <h3 className="text-slate-900 dark:text-white text-xl font-semibold mb-1 truncate group-hover:text-indigo-600 dark:group-hover:text-cyan-400 transition">
                {track.title}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs uppercase tracking-wider font-medium">Audio Track</p>
            </div>
          </div>

          {/* Decorative line */}
          <div className="h-px bg-linear-to-r from-blue-500/30 via-indigo-500/30 dark:from-cyan-500/50 dark:via-purple-500/50 to-transparent"></div>
        </div>

        {/* Audio Player */}
        <div className="flex-1 flex items-end ">
          <CustomAudioPlayer src={audioUrl} title={track.title} />
        </div>

        {/* Sound wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end gap-0.5 px-4 pb-4 opacity-5 dark:opacity-5 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-indigo-500 dark:bg-cyan-400 rounded-t"
              animate={{
                height: ['20%', `${Math.random() * 60 + 20}%`, '20%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.05,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-indigo-600/0 via-indigo-600/5 to-blue-600/0 dark:from-cyan-600/0 dark:via-cyan-600/10 dark:to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-2xl"></div>
      </div>
    </motion.div>
  );
}