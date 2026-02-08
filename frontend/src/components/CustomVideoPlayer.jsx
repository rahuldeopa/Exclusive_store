import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomVideoPlayer({ videoUrl, title }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [volume, setVolume] = useState(100);
    const [isMuted, setIsMuted] = useState(false);
    const [showQuality, setShowQuality] = useState(false);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [availableQualities, setAvailableQualities] = useState([]);
    const [isReady, setIsReady] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSeeking, setIsSeeking] = useState(false);

    const playerRef = useRef(null); // For YT instance
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);
    const playerDivRef = useRef(null); // For YT Div
    const nativeVideoRef = useRef(null); // For HTML5 Video

    // Extract video ID from YouTube URL
    const getVideoId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const videoId = getVideoId(videoUrl);
    const isYouTube = !!videoId;

    // Unified Player Interface
    const playerAdapter = {
        playVideo: () => {
            if (isYouTube && playerRef.current?.playVideo) {
                playerRef.current.playVideo();
            } else if (nativeVideoRef.current) {
                nativeVideoRef.current.play().catch(e => console.error("Play error:", e));
            }
        },
        pauseVideo: () => {
            if (isYouTube && playerRef.current?.pauseVideo) {
                playerRef.current.pauseVideo();
            } else if (nativeVideoRef.current) {
                nativeVideoRef.current.pause();
            }
        },
        seekTo: (time) => {
            if (isYouTube && playerRef.current?.seekTo) {
                playerRef.current.seekTo(time, true);
            } else if (nativeVideoRef.current) {
                nativeVideoRef.current.currentTime = time;
            }
        },
        setVolume: (vol) => {
            if (isYouTube && playerRef.current?.setVolume) {
                playerRef.current.setVolume(vol);
            } else if (nativeVideoRef.current) {
                nativeVideoRef.current.volume = vol / 100;
            }
        },
        mute: () => {
            if (isYouTube && playerRef.current?.mute) {
                playerRef.current.mute();
            } else if (nativeVideoRef.current) {
                nativeVideoRef.current.muted = true;
            }
        },
        unMute: () => {
            if (isYouTube && playerRef.current?.unMute) {
                playerRef.current.unMute();
            } else if (nativeVideoRef.current) {
                nativeVideoRef.current.muted = false;
            }
        }
    };


    // Load YouTube IFrame API
    useEffect(() => {
        if (!isYouTube) {
            setIsReady(true);
            return;
        }

        // Load YouTube API script if not already loaded
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Initialize player when API is ready
        const initPlayer = () => {
            if (playerDivRef.current && videoId && !playerRef.current) {
                playerRef.current = new window.YT.Player(playerDivRef.current, {
                    videoId: videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        modestbranding: 1,
                        rel: 0,
                        showinfo: 0,
                        iv_load_policy: 3,
                        disablekb: 1,
                        fs: 0,
                        playsinline: 1,
                    },
                    events: {
                        onReady: (event) => {
                            setIsReady(true);
                            event.target.setVolume(volume);

                            // Set default quality levels (YouTube standard qualities)
                            const defaultQualities = ['auto', 'hd1080', 'hd720', 'large', 'medium', 'small'];
                            setAvailableQualities(defaultQualities);

                            // Try to get actual available qualities after a short delay
                            setTimeout(() => {
                                try {
                                    const qualities = event.target.getAvailableQualityLevels();
                                    if (qualities && qualities.length > 0) {
                                        setAvailableQualities(qualities);
                                    }
                                } catch (e) {
                                    console.log('Could not get quality levels');
                                }
                            }, 1000);
                        },
                        onStateChange: (event) => {
                            if (event.data === window.YT.PlayerState.PLAYING) {
                                setIsPlaying(true);
                            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                            }
                        },
                    },
                });
            }
        };

        // Set up the API ready callback
        if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        // If API is already loaded, initialize immediately
        if (window.YT && window.YT.Player) {
            initPlayer();
        }

        // Cleanup
        return () => {
            if (playerRef.current && playerRef.current.destroy) {
                try {
                    playerRef.current.destroy();
                } catch (e) {
                    // Player might already be destroyed
                }
                playerRef.current = null;
            }
        };
    }, [videoId, isYouTube]);

    // HTML5 Video Event Listeners
    useEffect(() => {
        if (isYouTube) return;

        const video = nativeVideoRef.current;
        if (!video) return;

        const updateTime = () => {
            if (!isSeeking) setCurrentTime(video.currentTime);
            setDuration(video.duration || 0);
        };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);
        const onLoaded = () => {
            setDuration(video.duration || 0);
            setIsReady(true);
            // Sync initial volume
            video.volume = volume / 100;
            video.muted = isMuted;
        };

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);
        video.addEventListener('loadedmetadata', onLoaded);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('loadedmetadata', onLoaded);
        };
    }, [isYouTube, isSeeking]);


    // Handle play/pause
    const togglePlay = () => {
        if (isPlaying) {
            playerAdapter.pauseVideo();
        } else {
            playerAdapter.playVideo();
        }
    };

    // Handle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Handle volume
    const handleVolumeChange = (e) => {
        const newVolume = parseInt(e.target.value);
        setVolume(newVolume);

        if (newVolume === 0) {
            setIsMuted(true);
            playerAdapter.mute();
        } else {
            setIsMuted(false);
            playerAdapter.unMute();
            playerAdapter.setVolume(newVolume);
        }
    };

    const toggleMute = () => {
        if (isMuted) {
            playerAdapter.unMute();
            setIsMuted(false);
            // Restore volume if it was 0
            if (volume === 0) {
                const restored = 50;
                setVolume(restored);
                playerAdapter.setVolume(restored);
            }
        } else {
            playerAdapter.mute();
            setIsMuted(true);
        }
    };

    // Handle quality change (Specific to YT for now)
    const handleQualityChange = (quality) => {
        if (isYouTube && playerRef.current && playerRef.current.setPlaybackQuality) {
            try {
                playerRef.current.setPlaybackQuality(quality);

                setCurrentQuality(quality);
                setShowQuality(false);

                console.log(`Quality changed to: ${quality}`);
            } catch (error) {
                console.error('Error changing quality:', error);
            }
        }
    };

    // Handle seek
    const handleSeek = (e) => {
        if (duration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            const seekTime = pos * duration;
            playerAdapter.seekTo(seekTime);
            setCurrentTime(seekTime);
        }
    };

    // Format time for display
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Track progress (Only for YT, HTML5 uses event listener)
    useEffect(() => {
        let interval;
        if (isYouTube && isPlaying && playerRef.current) {
            interval = setInterval(() => {
                if (playerRef.current && !isSeeking) {
                    const current = playerRef.current.getCurrentTime();
                    const total = playerRef.current.getDuration();
                    setCurrentTime(current);
                    if (total && total !== duration) {
                        setDuration(total);
                    }
                }
            }, 100); // Update every 100ms for smooth progress
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isPlaying, isSeeking, duration, isYouTube]);

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) {
                setShowControls(false);
            }
        }, 3000);
    };

    // Listen for fullscreen changes
    useEffect(() => {
        let scrollPosition = 0;

        const handleFullscreenChange = () => {
            const isNowFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isNowFullscreen);

            // When entering fullscreen, save scroll position
            if (isNowFullscreen) {
                scrollPosition = window.scrollY;
            }
            // When exiting fullscreen, restore scroll position and keep video in view
            else if (containerRef.current) {
                // Small delay to ensure DOM has updated
                setTimeout(() => {
                    // Scroll to the saved position
                    window.scrollTo(0, scrollPosition);
                    // Ensure the video is in view
                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            style={{ cursor: (showControls || !isPlaying) ? 'default' : 'none' }}
        >
            {/* Player Container */}
            {isYouTube ? (
                <div
                    ref={playerDivRef}
                    className="absolute inset-0 w-full h-full"
                />
            ) : (
                <video
                    ref={nativeVideoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-contain"
                    playsInline
                />
            )}

            {/* Overlay to block default UI and capture clicks */}
            <div
                className="absolute inset-0 z-10"
                onClick={togglePlay}
            />

            {/* Custom Controls */}
            <AnimatePresence>
                {(showControls || !isPlaying) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/80 via-black/50 to-transparent p-4 landscape:p-2 pointer-events-auto"
                    >
                        {/* Progress Bar */}
                        <div className="mb-3 landscape:mb-1">
                            <div
                                className="relative w-full h-1 bg-white/20 rounded-full cursor-pointer group/progress"
                                onClick={handleSeek}
                            >
                                {/* Progress */}
                                <div
                                    className="absolute top-0 left-0 h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                />
                                {/* Hover effect */}
                                <div className="absolute inset-0 h-full bg-white/10 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                                {/* Scrubber */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                    style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transform: 'translate(-50%, -50%)' }}
                                />
                            </div>
                            {/* Time Display */}
                            <div className="flex justify-between items-center mt-1 text-xs text-white/70 landscape:mt-0 landscape:scale-95">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Play/Pause Button */}
                            <button
                                onClick={togglePlay}
                                disabled={!isReady}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition disabled:opacity-50"
                            >
                                {isPlaying ? (
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMute}
                                    className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                                >
                                    {isMuted || volume === 0 ? (
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                                        </svg>
                                    )}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                />
                            </div>

                            <div className="flex-1" />

                            {/* Quality Selector (YT Only) */}
                            {isYouTube && availableQualities.length > 0 && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowQuality(!showQuality)}
                                        className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition text-white text-xs font-semibold"
                                    >
                                        HD
                                    </button>
                                    <AnimatePresence>
                                        {showQuality && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-full mb-2 right-0 bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden min-w-[100px]"
                                            >
                                                {availableQualities.map((quality) => (
                                                    <button
                                                        key={quality}
                                                        onClick={() => handleQualityChange(quality)}
                                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-white/20 transition ${currentQuality === quality ? 'text-purple-400' : 'text-white'
                                                            }`}
                                                    >
                                                        {quality === 'auto' ? 'Auto' : quality.toUpperCase()}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Fullscreen Button */}
                            <button
                                onClick={toggleFullscreen}
                                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
                            >
                                {isFullscreen ? (
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Center Play Button (when paused) */}
            {!isPlaying && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center z-15 pointer-events-none"
                >
                    <div className="w-20 h-20 rounded-full bg-purple-500/30 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
