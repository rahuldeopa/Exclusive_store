import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomVideoPlayer from './CustomVideoPlayer';
import CustomAudioPlayer from './CustomAudioPlayer';
import { Play, Pause, Clock, Info, ChevronDown } from 'lucide-react';

export default function PainAlbumSection({ initialContent }) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [playerMode, setPlayerMode] = useState('audio'); // 'audio' or 'video'
  
  // Try to find the matching media from backend if available
  const getMediaForTrack = (title) => {
    if (!initialContent?.media) return null;
    return initialContent.media.find(m => m.title.toLowerCase().includes(title.toLowerCase().split(' ')[0]));
  };

  const tracks = [
    { num: 1, title: 'Jah Light in my Soul', credits: 'beat by Workdonebeatz sung by Arion' },
    { num: 2, title: 'Elevation', credits: 'beat by Workdonebeatz sung by Chikorus YL' },
    { num: 3, title: 'Master Sculpture', credits: 'beat by Workdonebeatz sung by Amina' },
    { num: 4, title: 'Lift My Hands', credits: 'beat by Workdonebeatz sung by Amina' },
    { num: 5, title: 'Ride with God', credits: 'beat by Workdonebeatz sung by Chikorus YL' },
    { num: 6, title: 'Lessons from the Storm', credits: 'beat by Workdonebeatz sung by Chikorus YL' },
    { num: 7, title: 'Blessings on the Way', credits: 'beat by Workdonebeatz sung by Chikorus YL' },
    { num: 8, title: 'Worth more', credits: 'beat by Dioz sung by Chikorus YL' },
    { num: 9, title: 'Closer to You', credits: 'beat by Workdonebeatz sung by Chikorus YL' },
    { num: 10, title: 'Real Friends', credits: 'beat by Workdonebeatz sung by Chikorus YL' },
    { num: 11, title: 'Mask off', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL' },
    { num: 12, title: 'Blessings on the Way (remix)', credits: 'beat by Workdonebeatz sung by Amina and Chikorus YL' }
  ];

  const handlePlay = (track) => {
    setActiveTrack(track);
    // Here we could scroll to player or set it active
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] text-white font-sans selection:bg-[#ff6b35] selection:text-white pb-32">
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
              className={`grid grid-cols-[auto_1fr_auto] gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors group ${
                activeTrack?.num === track.num ? 'bg-white/10' : 'hover:bg-white/5'
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
                {/* Dummy duration since we don't have real audio duration */}
                3:45
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
      <AnimatePresence>
      {activeTrack && (
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] flex flex-col text-white"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between">
            <button onClick={() => setActiveTrack(null)} className="p-2 text-gray-400 hover:text-white transition-colors">
              <ChevronDown className="w-8 h-8" />
            </button>
            <div className="text-xs font-bold tracking-[0.2em] text-gray-300">NOW PLAYING FROM ALBUM</div>
            <div className="w-12"></div>
          </div>

          {/* Toggle */}
          <div className="flex justify-center mb-8">
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

          {/* Player Area */}
          <div className="flex-1 flex flex-col items-center justify-start px-6 pb-12 max-w-6xl mx-auto w-full overflow-y-auto">
            <motion.div 
              layout
              className={`w-full bg-black rounded-xl overflow-hidden shadow-2xl relative transition-all duration-500 flex-shrink-0 ${
                playerMode === 'audio' ? 'max-w-md aspect-square' : 'max-w-5xl aspect-video'
              }`}
            >
              {(() => {
                 const media = getMediaForTrack(activeTrack.title);
                 if (media && media.source === 'YOUTUBE') {
                    return (
                      <CustomVideoPlayer 
                        videoUrl={`https://www.youtube.com/watch?v=${media.youtubeId}`} 
                        title={activeTrack.title}
                        audioOnlyMode={playerMode === 'audio'}
                        coverNode={
                          <div className="w-full h-full bg-[#f5f5f5] flex flex-col items-center justify-center p-4 text-center border-4 border-black relative">
                            <div className="absolute top-[5%] text-black font-black text-2xl tracking-tighter">TURNING</div>
                            <div className="absolute top-[25%] text-black font-medium text-lg">MY</div>
                            <div className="absolute top-[40%] text-black font-black text-5xl md:text-7xl tracking-tighter">PAIN</div>
                            <div className="absolute top-[65%] text-black font-script text-2xl md:text-4xl italic">into</div>
                            <div className="absolute bottom-[5%] text-black font-black text-3xl md:text-5xl tracking-tighter">PURPOSE</div>
                            <svg className="absolute bottom-0 right-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <path d="M0 100 L100 0 L100 100 Z" fill="black" />
                            </svg>
                          </div>
                        }
                      />
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
            
            <div className={`w-full mt-12 flex flex-col items-start transition-all duration-500 ${playerMode === 'audio' ? 'max-w-md' : 'max-w-5xl'}`}>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{activeTrack.title}</h2>
              <p className="text-lg text-gray-400">{activeTrack.credits}</p>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
