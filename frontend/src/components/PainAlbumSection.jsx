import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomVideoPlayer from './CustomVideoPlayer';
import CustomAudioPlayer from './CustomAudioPlayer';
import { Play, Pause, Clock, Info, ChevronDown, Download } from 'lucide-react';

export default function PainAlbumSection({ initialContent }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [playerMode, setPlayerMode] = useState('audio'); // 'audio' or 'video'

  const tracks = [
    { num: 1, title: 'Jah Light in my Soul', credits: 'beat by Workdonebeatz sung by Arion', youtubeId: '-ImqIW1tJ1A', duration: '3:22' },
    { num: 2, title: 'Elevation', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'k2kFvuuOCZs', duration: '3:13' },
    { num: 3, title: 'Master Sculpture', credits: 'beat by Workdonebeatz sung by Amina', youtubeId: 'K5JlMyLrR9o', duration: '4:13' },
    { num: 4, title: 'Lift My Hands', credits: 'beat by Workdonebeatz sung by Amina', youtubeId: '8eCmIU392L4', duration: '4:20' },
    { num: 5, title: 'Ride with God', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: '97cxQm5Arj4', duration: '2:15' },
    { num: 6, title: 'Lessons from the Storm', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'lFi1WiPcpy0', duration: '4:07' },
    { num: 7, title: 'Blessings on the Way', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'RRPv3dPMHL0', duration: '3:32' },
    { num: 8, title: 'Worth more', credits: 'beat by Dioz sung by Chikorus YL', youtubeId: '2OXwAEdiOSc', duration: '2:41' },
    { num: 9, title: 'Net Worth', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: 'FjpUIHgRrDc', duration: '2:48' },
    { num: 10, title: 'Real Friends', credits: 'beat by Workdonebeatz sung by Chikorus YL', youtubeId: '7cNq-GVlw6E', duration: '3:59' },
    { num: 11, title: 'Mask off', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL', youtubeId: 'M4kqqcu4dOQ', duration: '2:53' },
    { num: 12, title: 'Blessings on the Way (remix)', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL', youtubeId: 'IzGX936iX1o', duration: '2:23' }
  ];

  // Map directly from our hardcoded list, fallback to backend
  const getMediaForTrack = (title) => {
    const track = tracks.find(t => t.title === title);
    if (track && track.youtubeId) {
      return { source: 'YOUTUBE', youtubeId: track.youtubeId };
    }
    if (!initialContent?.media) return null;
    return initialContent.media.find(m => m.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]));
  };

  const handlePlay = (track) => {
    setActiveTrack(track);
    // Here we could scroll to player or set it active
  };

  // Lock body scroll when modal is open to prevent double scrollbars
  useEffect(() => {
    if (activeTrack) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTrack]);

  return (
    <div
      className="w-full min-h-screen bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] text-white font-sans selection:bg-[#ff6b35] selection:text-white pb-32 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Spotify-style Header */}
      <div className="relative pt-24 pb-8 px-8 md:px-12 flex flex-col md:flex-row items-end gap-8 bg-gradient-to-b from-[#4a4a4a] to-transparent">
        <div className="w-52 h-52 md:w-64 md:h-64 shrink-0 shadow-2xl rounded-sm overflow-hidden bg-white flex items-center justify-center">
          {/* The attached image depicts a crow on hands with text "TURNING MY PAIN into PURPOSE" */}
          <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 text-center border-4 border-black relative">
            <div className="absolute top-2 left-2 right-2 text-black font-black text-xl tracking-tighter">TURNING</div>
            <div className="absolute top-8 left-4 text-black font-medium text-sm">MY</div>
            <div className="absolute top-14 left-2 right-2 text-black font-black text-4xl tracking-tighter">PAIN</div>
            <div className="absolute top-24 left-6 text-black font-script text-xl italic">into</div>
            <div className="absolute bottom-10 left-2 right-2 text-black font-black text-3xl tracking-tighter">PURPOSE</div>
            {/* Mocking the drawing */}
            <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-20" viewBox="0 0 100 100">
              <path d="M50 50 L90 10 L100 50 Z" fill="black" />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Album</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-2">Turning My Pain into Purpose</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300 font-medium">
            <span className="font-bold text-white">J.A.S.E., Amina, and Arion</span>
            <span>•</span>
            <span>2026</span>
            <span>•</span>
            <span>12 songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="px-8 md:px-12 py-6 flex items-center gap-6">
        <button
          className="w-14 h-14 rounded-full bg-[#ff6b35] hover:bg-[#ff8c5a] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xl"
          onClick={() => handlePlay(tracks[0])}
        >
          <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
        </button>
      </div>

      {/* Tracklist */}
      <div className="px-8 md:px-12 mt-4">
        {/* Tracklist Header */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-gray-800 mb-4 uppercase tracking-wider">
          <div className="w-8 text-right">#</div>
          <div>Title</div>
          <div className="flex justify-end"><Clock className="w-4 h-4" /></div>
        </div>

        {/* Tracks */}
        <div className="flex flex-col gap-1">
          {tracks.map((track) => (
            <div
              key={track.num}
              onClick={() => handlePlay(track)}
              className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors group ${activeTrack?.num === track.num ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
            >
              <div className="w-8 text-right flex items-center justify-end text-gray-400 group-hover:text-white">
                {activeTrack?.num === track.num ? (
                  <Play className="w-4 h-4 text-[#ff6b35]" fill="currentColor" />
                ) : (
                  <span className="group-hover:hidden">{track.num}</span>
                )}
                <Play className="w-4 h-4 text-white hidden group-hover:block" fill="currentColor" />
              </div>
              <div className="flex flex-col justify-center">
                <span className={`text-base font-medium ${activeTrack?.num === track.num ? 'text-[#ff6b35]' : 'text-white'}`}>
                  {track.title}
                </span>
                <span className="text-sm text-gray-400 group-hover:text-gray-300">
                  {track.credits}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                {track.duration}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Copyrights / Info */}
      <div className="px-8 md:px-12 mt-16 pb-16">
        <div className="text-xs text-gray-500 max-w-3xl flex flex-col gap-2">
          <p>
            All songs are a collaborative effort from J.A.S.E., Amina, and Arion. Beat development and concept of the project were directed by J.A.S.E. (Follow God 8) under JASP Publishing Inc.
          </p>
          <p>
            All copyrights for the project music, videos, etc are solely held by J.A.S.E.(FollowGod8) under JASP Publishing Inc.
          </p>
          <p>
            All videos are also copyrighted, directed, and developed by J.A.S.E.(FollowGod8) under JASP PUBLISHING INC.
          </p>
        </div>
      </div>

      {/* Player Modal - Spotify Now Playing Style */}
      <style>{`
        @media (max-height: 600px) and (orientation: landscape) {
          .mobile-landscape-full { 
            width: 100% !important;
            max-width: calc((100vh - 140px) * 1.777) !important;
            height: auto !important;
            max-height: calc(100vh - 140px) !important;
            aspect-ratio: 16/9 !important;
            border-radius: 8px !important;
            margin: 0 auto !important;
          }
          .mobile-landscape-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
      `}</style>
      <AnimatePresence>
        {activeTrack && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col disable-select overflow-hidden"
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Dynamic Ambient Background Glow */}
            <div 
              className="absolute inset-0 z-0 opacity-40 scale-110 pointer-events-none"
              style={{
                backgroundImage: `url(https://img.youtube.com/vi/${activeTrack.youtubeId}/maxresdefault.jpg)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(80px) saturate(150%)',
              }}
            />
            {/* Dark gradient overlay to ensure text contrast */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/60 to-[#0a0a0a] pointer-events-none" />

            {/* Content wrapper with relative z-index so it sits above the background */}
            <div className="relative z-10 flex flex-col h-full w-full">
              {/* Header */}
              <div className="p-4 md:p-6 flex items-center justify-between">
              <button onClick={() => setActiveTrack(null)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <ChevronDown className="w-8 h-8" />
              </button>
              <div className="text-xs font-bold tracking-[0.2em] text-gray-300">NOW PLAYING FROM ALBUM</div>
              <div className="w-12"></div>
            </div>

            {/* Toggle */}
            {getMediaForTrack(activeTrack.title)?.source !== 'YOUTUBE' && (
              <div className="flex justify-center mb-4 md:mb-8">
                <div className="flex bg-black/50 rounded-full p-1 gap-1">
                  <button
                    onClick={() => setPlayerMode('audio')}
                    className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors ${playerMode === 'audio' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Audio
                  </button>
                  <button
                    onClick={() => setPlayerMode('video')}
                    className={`px-8 py-2 rounded-full text-sm font-semibold transition-colors ${playerMode === 'video' ? 'bg-white text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Video
                  </button>
                </div>
              </div>
            )}

            {/* Player Area */}
            <div className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 pb-8 md:pb-12 max-w-6xl mx-auto w-full overflow-y-auto mobile-landscape-container">
              <motion.div
                layout
                className={`w-full bg-black rounded-xl overflow-visible shadow-2xl relative transition-all duration-500 flex-shrink-0 mobile-landscape-full ${
                  (playerMode === 'audio' && getMediaForTrack(activeTrack.title)?.source !== 'YOUTUBE') ? 'max-w-md aspect-square' : 'max-w-5xl aspect-video'
                }`}
              >
                {(() => {
                  const media = getMediaForTrack(activeTrack.title);
                  if (media && media.source === 'YOUTUBE') {
                    return (
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${media.youtubeId}?autoplay=1`}
                        title={activeTrack.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-xl bg-black"
                      ></iframe>
                    );
                  } else if (media && (media.playUrl || media.url)) {
                    if (playerMode === 'video') {
                      return <div className="w-full h-full flex items-center justify-center text-gray-500">No video available for this track</div>;
                    }
                    return (
                      <div className="w-full h-full relative">
                        <div className="absolute inset-0 z-0">
                          <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 text-center border-4 border-black relative">
                            <div className="absolute top-[5%] text-black font-black text-2xl tracking-tighter">TURNING</div>
                            <div className="absolute top-[25%] text-black font-medium text-lg">MY</div>
                            <div className="absolute top-[40%] text-black font-black text-5xl md:text-7xl tracking-tighter">PAIN</div>
                            <div className="absolute top-[65%] text-black font-script text-2xl md:text-4xl italic">into</div>
                            <div className="absolute bottom-[5%] text-black font-black text-3xl md:text-5xl tracking-tighter">PURPOSE</div>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/80 p-2">
                          <CustomAudioPlayer src={media.playUrl || media.url} title={activeTrack.title} />
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 italic">
                        Media source linked from backend will play here. (Track: {activeTrack.title})
                      </div>
                    );
                  }
                })()}
            </motion.div>
            
            <div className={`w-full mt-6 md:mt-12 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-500 ${
              (playerMode === 'audio' && getMediaForTrack(activeTrack.title)?.source !== 'YOUTUBE') ? 'max-w-md' : 'max-w-5xl'
            }`}>
              <div className="flex flex-col items-start">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 drop-shadow-md">{activeTrack.title}</h2>
                <p className="text-lg text-gray-300 drop-shadow">{activeTrack.credits}</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {/* 
                  Download buttons temporarily parked due to Vercel IP blocking issues with YouTube
                */}
              </div>
            </div>
          </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
