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
      <div className="w-full min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] transition-colors duration-500 relative px-4 sm:px-8 py-20 max-w-7xl mx-auto text-[#0a0a0a] dark:text-[#f5f3f0]">
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
      <div className="w-full min-h-screen flex items-center justify-center bg-[#f5f3f0] dark:bg-[#0a0a0a] transition-colors duration-500 text-[#0a0a0a] dark:text-[#f5f3f0]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-950/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] transition-colors duration-500 relative overflow-hidden text-[#0a0a0a] dark:text-[#f5f3f0]">
      {/* Ambient background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff6b35] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ff6b35] rounded-full blur-3xl"></div>
      </div>

      {/* Sound wave decoration */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#ff6b35]/30 to-transparent opacity-30"></div>

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
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></div>
              <h2 className="text-4xl md:text-5xl font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0]">
                Music Videos
              </h2>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></div>
            </motion.div>
            <p className="text-[#888888] uppercase tracking-[0.3em] text-xs font-bold">Visual Experience</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {media?.videos?.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative h-px my-24 ">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#ff6b35]/20 to-transparent"></div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#ff6b35]/20 border border-[#ff6b35]/40 backdrop-blur-md"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 8, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
          >
            <div className="absolute inset-2.5 rounded-full bg-black flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[#ff6b35] rounded-full"></div>
            </div>
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
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></div>
              <h2 className="text-4xl md:text-5xl font-light font-serif text-[#0a0a0a] dark:text-[#f5f3f0]">
                Audio Tracks
              </h2>
              <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b35]"></div>
            </motion.div>
            <p className="text-[#888888] uppercase tracking-[0.3em] text-xs font-bold">Premium Sound</p>
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
            <div className="shrink-0 w-10 h-10 rounded-full bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center landscape:w-8 landscape:h-8">
              <svg className="w-5 h-5 text-[#ff6b35] landscape:w-4 landscape:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[#0a0a0a] dark:text-[#f5f3f0] text-xl font-light font-serif group-hover:text-[#ff8c5a] transition truncate landscape:text-base">
                {video.title}
              </h3>
              <p className="text-[#888888] text-xs uppercase tracking-wider landscape:text-[10px] font-bold">Music Video</p>
            </div>
          </div>

          {/* Progress bar decoration */}
          <div className="relative h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-[#ff6b35] rounded-full transition-all"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: index * 0.2 + 0.5, duration: 1.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#ff6b35]/0 via-[#ff6b35]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
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
        <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-15 transition-opacity">
          <motion.div
            className="w-16 h-16 rounded-full border-4 border-current text-[#ff6b35]"
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
            <div className="shrink-0 w-12 h-12 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/20 flex items-center justify-center shadow-lg shadow-[#ff6b35]/5">
              <svg className="w-6 h-6 text-[#ff6b35]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 ">
              <h3 className="text-[#0a0a0a] dark:text-[#f5f3f0] text-xl font-light font-serif mb-1 truncate group-hover:text-[#ff8c5a] transition">
                {track.title}
              </h3>
              <p className="text-[#888888] text-xs uppercase tracking-wider font-bold">Audio Track</p>
            </div>
          </div>

          {/* Decorative line */}
          <div className="h-px bg-linear-to-r from-[#ff6b35]/20 via-[#ff6b35]/10 to-transparent"></div>
        </div>

        {/* Audio Player */}
        <div className="flex-1 flex items-end ">
          <CustomAudioPlayer src={audioUrl} title={track.title} />
        </div>

        {/* Sound wave decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end gap-0.5 px-4 pb-4 opacity-5 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-[#ff6b35] rounded-t"
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
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-[#ff6b35]/0 via-[#ff6b35]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl rounded-2xl"></div>
      </div>
    </motion.div>
  );
}