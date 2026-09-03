import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomVideoPlayer({ videoUrl, title, passcode, contentId, seekTrigger, audioOnlyMode = false, coverNode = null }) {
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
    const [isBuffering, setIsBuffering] = useState(true);

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
                        cc_load_policy: 0,
                        vq: 'hd1080',
                    },
                    events: {
                        onReady: (event) => {
                            setIsReady(true);
                            event.target.setVolume(volume);

                            // Force captions off
                            try {
                                event.target.unloadModule("captions");
                                event.target.unloadModule("cc");
                            } catch (e) { }

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
                                // Enforce quality immediately when playback starts
                                event.target.setPlaybackQuality('hd1080');
                            } else if (event.data === window.YT.PlayerState.PAUSED) {
                                setIsPlaying(false);
                            } else if (event.data === window.YT.PlayerState.ENDED) {
                                setIsPlaying(false);
                                // Prevent YouTube's "More Videos" screen by resetting the player
                                event.target.seekTo(0);
                                event.target.stopVideo();
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

    // Aggressive Quality Enforcer Loop
    useEffect(() => {
        if (!isYouTube || !isReady) return;

        // This loop aggressively tells YouTube to upgrade the stream
        const enforceInterval = setInterval(() => {
            if (playerRef.current && isPlaying) {
                try {
                    const currentQ = playerRef.current.getPlaybackQuality();
                    if (currentQ !== 'hd1080' && currentQ !== 'highres' && currentQ !== 'hd720') {
                        playerRef.current.setPlaybackQuality('hd1080');
                    }
                } catch (e) { }
            }
        }, 3000);

        return () => clearInterval(enforceInterval);
    }, [isYouTube, isReady, isPlaying]);

    // ABR Exploit: Lie to YouTube about player size to force 1080p
    useEffect(() => {
        if (!isYouTube || !isReady) return;

        const fakeSizeInterval = setInterval(() => {
            if (playerRef.current && playerRef.current.setSize) {
                // By forcing the API to believe the player is massive (1920x1080), 
                // YouTube's ABR algorithm is forced to serve the 1080p stream
                // regardless of the actual CSS rendering size on the screen.
                playerRef.current.setSize(1920, 1080);
                
                // Repeatedly ping the quality enforcer too
                try {
                    playerRef.current.setPlaybackQuality('hd1080');
                } catch(e) {}
            }
        }, 2000);

        return () => clearInterval(fakeSizeInterval);
    }, [isYouTube, isReady]);

    // Persistence Logic
    const storageKey = passcode && contentId ? `playback_${passcode}_${contentId}` : null;

    // Load initial time
    useEffect(() => {
        if (!isReady || !storageKey) return;

        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            try {
                const { time } = JSON.parse(savedProgress);
                if (time > 0) {
                    playerAdapter.seekTo(time);
                    setCurrentTime(time);
                    // Ensure video stays paused after seeking to saved position
                    setTimeout(() => {
                        playerAdapter.pauseVideo();
                        setIsPlaying(false);
                    }, 300);
                }
            } catch (e) {
                console.error("Error loading video progress", e);
            }
        }
    }, [isReady, storageKey]);

    // Save progress periodically
    useEffect(() => {
        if (!storageKey || !isPlaying) return;

        const saveInterval = setInterval(() => {
            const timeToSave = isYouTube
                ? (playerRef.current?.getCurrentTime?.() || 0)
                : (nativeVideoRef.current?.currentTime || 0);

            if (timeToSave > 0) {
                localStorage.setItem(storageKey, JSON.stringify({ time: timeToSave }));
            }
        }, 5000);

        return () => clearInterval(saveInterval);
    }, [isPlaying, storageKey, isYouTube]);

    // External Seek Trigger
    useEffect(() => {
        if (seekTrigger?.time !== undefined && isReady) {
            playerAdapter.seekTo(seekTrigger.time);
            setCurrentTime(seekTrigger.time);
        }
    }, [seekTrigger, isReady]);

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
            setIsBuffering(false);
            // Sync initial volume
            video.volume = volume / 100;
            video.muted = isMuted;
        };
        const onWaiting = () => setIsBuffering(true);
        const onPlaying = () => setIsBuffering(false);
        const onCanPlay = () => setIsBuffering(false);

        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('ended', onEnded);
        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('waiting', onWaiting);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('canplay', onCanPlay);

        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('waiting', onWaiting);
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('canplay', onCanPlay);
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
        const container = containerRef.current;
        if (!container) return;

        // Check for native fullscreen support
        const hasNativeFullscreen =
            container.requestFullscreen ||
            container.webkitRequestFullscreen ||
            container.mozRequestFullScreen ||
            container.msRequestFullscreen;

        if (!document.fullscreenElement &&
            !document.webkitFullscreenElement &&
            !document.mozFullScreenElement &&
            !document.msFullscreenElement) {

            if (hasNativeFullscreen) {
                // Try native fullscreen
                if (container.requestFullscreen) {
                    container.requestFullscreen();
                } else if (container.webkitRequestFullscreen) {
                    container.webkitRequestFullscreen();
                } else if (container.mozRequestFullScreen) {
                    container.mozRequestFullScreen();
                } else if (container.msRequestFullscreen) {
                    container.msRequestFullscreen();
                }
            } else {
                // Pseudo-fullscreen fallback for iOS
                container.classList.add('pseudo-fullscreen');
                document.body.style.overflow = 'hidden'; // Lock scroll
                setIsFullscreen(true);
            }
        } else {
            // Exit native fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }

            // Cleanup pseudo-fullscreen if active
            if (container.classList.contains('pseudo-fullscreen')) {
                container.classList.remove('pseudo-fullscreen');
                document.body.style.overflow = '';
                setIsFullscreen(false);
            }
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
            const isNowFullscreen = !!(
                document.fullscreenElement ||
                document.webkitFullscreenElement ||
                document.mozFullScreenElement ||
                document.msFullscreenElement
            );

            setIsFullscreen(isNowFullscreen);

            // When entering fullscreen, save scroll position
            if (isNowFullscreen) {
                scrollPosition = window.scrollY;
            }
            // When exiting fullscreen, restore scroll position and keep video in view
            else if (containerRef.current) {
                // Ensure pseudo-fullscreen class is also removed
                containerRef.current.classList.remove('pseudo-fullscreen');
                document.body.style.overflow = '';

                // Small delay to ensure DOM has updated
                setTimeout(() => {
                    // Scroll to the saved position
                    window.scrollTo(0, scrollPosition);
                    // Ensure the video is in view
                    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
            }
        };

        const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
        events.forEach(event => document.addEventListener(event, handleFullscreenChange));

        return () => {
            events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
        };
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
            <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${audioOnlyMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
            </div>

            {/* Audio Only Cover Overlay */}
            {audioOnlyMode && coverNode && (
                <div className="absolute inset-0 z-[5] flex items-center justify-center bg-[#121212] overflow-hidden pointer-events-none">
                    {coverNode}
                </div>
            )}

            {/* Honest Loader for Native Video (Proxy) */}
            {!isYouTube && isBuffering && (
                <div className="absolute inset-0 z-[15] flex items-center justify-center bg-black/80 pointer-events-none">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-[#ff6b35] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(255,107,53,0.5)]"></div>
                        <p className="text-white mt-5 font-bold text-sm tracking-widest drop-shadow-md">PREPARING HD STREAM</p>
                        <p className="text-gray-400 text-xs mt-2 font-medium">(This takes ~10 seconds to merge tracks)</p>
                    </div>
                </div>
            )}

            {/* Full Protective Shield: Blocks all YT UI (Share, Logo, Right-Click) and captures clicks for custom play/pause */}
            <div
                className="absolute inset-0 z-10"
                onClick={togglePlay}
                onContextMenu={(e) => e.preventDefault()}
                style={{ cursor: 'pointer' }}
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
                            <div className="relative w-full h-2 flex items-center group/progress">
                                {/* Track Background */}
                                <div className="absolute left-0 right-0 h-1 bg-white/20 rounded-full pointer-events-none" />
                                {/* Progress Fill */}
                                <div
                                    className="absolute left-0 h-1 bg-[#ff6b35] rounded-full pointer-events-none transition-all duration-75"
                                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                />
                                {/* Hover effect */}
                                <div className="absolute left-0 right-0 h-1 bg-white/10 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none" />
                                {/* Native Range Input (Draggable) */}
                                <input
                                    type="range"
                                    min="0"
                                    max={duration || 100}
                                    value={currentTime || 0}
                                    onChange={(e) => {
                                        const time = parseFloat(e.target.value);
                                        setCurrentTime(time);
                                        playerAdapter.seekTo(time);
                                    }}
                                    onMouseDown={() => setIsSeeking(true)}
                                    onMouseUp={() => setIsSeeking(false)}
                                    onTouchStart={() => setIsSeeking(true)}
                                    onTouchEnd={() => setIsSeeking(false)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 m-0"
                                />
                                {/* Scrubber */}
                                <div
                                    className="absolute h-3 w-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                                    style={{ left: `calc(${duration > 0 ? (currentTime / duration) * 100 : 0}% - 6px)` }}
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
                                {/* Volume Control (Hidden on mobile as OS controls volume) */}
                                <div
                                    className="relative hidden sm:flex items-center gap-2 group/volume"
                                    onMouseEnter={() => setShowVolume(true)}
                                    onMouseLeave={() => setShowVolume(false)}
                                >
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>
                            </div>

                            <div className="flex-1" />

                            {/* Quality Selector (YT Only) */}
                            {isYouTube && !audioOnlyMode && availableQualities.length > 0 && (
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
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute bottom-full right-0 mb-4 bg-black/80 backdrop-blur-md rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.5)] border border-white/10 overflow-y-auto max-h-[120px] md:max-h-[250px] min-w-[100px] md:min-w-[120px] flex flex-col z-[100] hide-scrollbar"
                                            >
                                                {['auto', ...availableQualities.filter(q => q !== 'auto' && q !== 'unknown')].map((quality) => (
                                                    <button
                                                        key={quality}
                                                        onClick={() => handleQualityChange(quality)}
                                                        className={`w-full px-3 py-2 md:px-4 md:py-2.5 text-left text-xs md:text-sm font-medium transition-colors flex items-center gap-2 ${currentQuality === quality ? 'text-[#ff6b35] bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {currentQuality === quality && <span className="text-[#ff6b35] text-[10px]">●</span>}
                                                        <span className={currentQuality !== quality ? 'ml-3 md:ml-4' : ''}>
                                                            {quality === 'hd2160' ? '4K' :
                                                                quality === 'hd1440' ? '1440p' :
                                                                    quality === 'hd1080' ? '1080p' :
                                                                        quality === 'highres' ? 'Highest' :
                                                                            quality === 'hd720' ? '720p' :
                                                                                quality === 'large' ? '480p' :
                                                                                    quality === 'medium' ? '360p' :
                                                                                        quality === 'small' ? '240p' :
                                                                                            quality === 'tiny' ? '144p' :
                                                                                                quality === 'auto' ? 'Auto' : 'Unknown'}
                                                        </span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Fullscreen Button */}
                            {!audioOnlyMode && (
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
                            )}
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
                    <div className="w-20 h-20 rounded-full bg-[#ff6b35]/20 border border-[#ff6b35]/50 backdrop-blur-md flex items-center justify-center">
                        <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
