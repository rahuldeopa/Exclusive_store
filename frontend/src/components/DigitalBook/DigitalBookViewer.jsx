import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Loader2, Maximize2, Minimize2, Volume2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactReader } from 'react-reader';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import VideoTrigger from './VideoTrigger';
import AudioSection from './AudioSection';
import { useTheme } from '../../contexts/ThemeContext';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DigitalBookViewer({ passcode, initialContent }) {
  const { isDark } = useTheme();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [location, setLocation] = useState(null); // For EPUB
  const [renderError, setRenderError] = useState(false);
  const [epubData, setEpubData] = useState(null);
  const [epubLoading, setEpubLoading] = useState(false);
  const [epubError, setEpubError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rendition, setRendition] = useState(null);

  useEffect(() => {
    if (rendition) {
      rendition.themes.override('color', isDark ? '#f5f3f0' : '#0a0a0a');
      rendition.themes.override('background', isDark ? '#0a0a0a' : '#ffffff');
    }
  }, [isDark, rendition]);

  if (!initialContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#888888] bg-[#f5f3f0] dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center p-12 rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a]">
          <Loader2 className="w-12 h-12 animate-spin mb-6 text-[#ff6b35]" />
          <p className="text-lg font-medium text-[#0a0a0a] dark:text-[#f5f3f0] animate-pulse">Preparing your library...</p>
        </div>
      </div>
    );
  }

  const docMedia = initialContent.media?.find(m => m.type === 'DOCUMENT');
  const videos = initialContent.media?.filter(m => m.type === 'VIDEO') || [];
  const audios = initialContent.media?.filter(m => m.type === 'AUDIO') || [];
  const bookUrl = docMedia?.url || docMedia?.playUrl;

  if (!bookUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-[#888888] bg-[#f5f3f0] dark:bg-[#0a0a0a]">
        <div className="flex flex-col items-center p-12 rounded-3xl bg-white dark:bg-[#1a1a1a] shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-slate-100 dark:bg-[#2a2a2a] rounded-full flex items-center justify-center mb-6">
            <BookOpen className="w-10 h-10 text-[#888888]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a0a0a] dark:text-[#f5f3f0] mb-2 font-serif">No Document Available</h2>
          <p className="text-[#888888] mb-8">We couldn't find a PDF or EPUB for this title. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  const isEpub = bookUrl.toLowerCase().includes('.epub') || bookUrl.toLowerCase().includes('type=epub');

  useEffect(() => {
    if (isEpub && bookUrl) {
      setEpubLoading(true);
      fetch(bookUrl)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch EPUB");
          return res.arrayBuffer();
        })
        .then(buffer => {
          setEpubData(buffer);
          setEpubLoading(false);
        })
        .catch(err => {
          console.error("Error fetching EPUB:", err);
          setEpubError(err.message);
          setEpubLoading(false);
        });
    }
  }, [isEpub, bookUrl]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const pageVideos = videos.filter(v => v.order === pageNumber);
  const isLastPdfPage = numPages && pageNumber === numPages;
  const pageAudios = audios.filter(a => a.order === pageNumber || (isLastPdfPage && !a.order));
  const unboundVideos = isEpub ? videos : pageVideos;
  const unboundAudios = isEpub ? audios : pageAudios;

  const handlePrevPage = () => setPageNumber(p => Math.max(p - 1, 1));
  const handleNextPage = () => setPageNumber(p => Math.min(p + 1, numPages || 1));

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className={`min-h-screen bg-[#f5f3f0] dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-[#f5f3f0] transition-colors duration-500 selection:bg-[#ff6b35]/30 pb-20 leading-[1.6] ${isFullscreen ? 'pseudo-fullscreen' : ''}`}>

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-[#ff6b35]/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-[#ff6b35]" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold text-[#0a0a0a] dark:text-[#f5f3f0] tracking-tight font-serif">{initialContent.title}</h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#888888] font-bold">Digital Library</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEpub && numPages && (
              <div className="hidden sm:block text-xs font-medium text-[#888888] mr-4">
                Page {pageNumber} / {numPages}
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors text-[#888888]"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!isEpub && numPages && (
          <div className="w-full h-1 bg-[#1a1a1a]">
            <div
              className="h-full bg-[#ff6b35] transition-all duration-300 ease-out shadow-[0_0_8px_rgba(255,107,53,0.5)]"
              style={{ width: `${(pageNumber / numPages) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Main Reader Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8 pb-32 flex flex-col lg:flex-row gap-10">

        {/* Reader Stage */}
        <div className="flex-1 flex flex-col items-center">
          <div className={`relative w-full max-w-4xl transition-all duration-500
            ${isFullscreen ? 'max-w-none' : 'bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden shadow-[#ff6b35]/10'}
            ${!isFullscreen ? 'min-h-[70vh] lg:min-h-[85vh]' : 'h-full'}`}>

            {isEpub ? (
              <div className={`relative ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[70vh] lg:h-[85vh]'} overflow-hidden`}>
                {epubLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f3f0] dark:bg-[#0a0a0a] text-[#888888] z-10">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#ff6b35]" />
                    <p className="font-medium text-sm">Downloading Chapter...</p>
                  </div>
                ) : epubError ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="text-[#ff6b35] p-8 text-center border-dashed border-2 border-[#ff6b35]/30 rounded-2xl max-w-sm">
                      <p className="font-bold mb-2">Reader Error</p>
                      <p className="text-sm opacity-80">{epubError}</p>
                    </div>
                  </div>
                ) : epubData ? (
                  <div className="h-full w-full overflow-hidden">
                    <ReactReader
                      url={epubData}
                      location={location}
                      locationChanged={(epubcifi) => setLocation(epubcifi)}
                      getRendition={(val) => {
                        setRendition(val);
                        val.themes.default({
                          '::selection': { background: 'rgba(255, 107, 53, 0.3)' },
                          body: {
                            fontFamily: 'Georgia, serif',
                            margin: '0 auto',
                            color: isDark ? '#f5f3f0' : '#0a0a0a',
                            background: isDark ? '#0a0a0a' : '#ffffff'
                          }
                        })
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex justify-center p-2 sm:p-6 h-full">
                {renderError ? (
                  <div className="text-[#ff6b35] p-12 text-center border-dashed border-2 border-[#ff6b35]/30 rounded-2xl max-w-md">
                    <p className="font-bold mb-2">PDF Load Failed</p>
                    <p className="text-sm opacity-80">The document could not be loaded. This may be due to CORS restrictions or a corrupted file.</p>
                  </div>
                ) : (
                  <Document
                    file={bookUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={() => setRenderError(true)}
                    loading={<div className="py-20 flex flex-col items-center"><Loader2 className="w-10 h-10 animate-spin text-[#ff6b35] mb-4" /><p className="text-sm text-[#888888]">Rendering Page...</p></div>}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={pageNumber}
                        initial={{ opacity: 0, y: 10, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.99 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="shadow-2xl ring-1 ring-[#2a2a2a]"
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={Math.min(window.innerWidth - 60, 850)}
                          renderTextLayer={true}
                          renderAnnotationLayer={true}
                          className="bg-white dark:bg-[#1a1a1a]"
                        />
                      </motion.div>
                    </AnimatePresence>
                  </Document>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Media Companion Sidebar */}
        {(unboundVideos.length > 0 || unboundAudios.length > 0) && (
          <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-8">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-4 bg-[#ff6b35] rounded-full" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#0a0a0a] dark:text-[#f5f3f0]">
                  {isEpub ? "Companion Media" : `Page ${pageNumber} Assets`}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {unboundVideos.map((video, idx) => {
                  const vUrl = video.url || video.playUrl || (video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : '');
                  return (
                    <div key={idx} className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] to-[#e55a24] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                      <VideoTrigger title={video.title} url={vUrl} />
                    </div>
                  );
                })}

                {unboundAudios.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
                    <div className="flex items-center gap-2 mb-4 text-[#888888]">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-widest">Audio Notes</span>
                    </div>
                    <AudioSection
                      tracks={unboundAudios.map((a, i) => ({
                        id: i,
                        title: a.title,
                        url: a.url || a.playUrl || ''
                      }))}
                    />
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </main>

      {/* Refined PDF Navigation */}
      {!isEpub && numPages && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-full shadow-2xl z-50 transition-all hover:scale-105 active:scale-95">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-[#2a2a2a] disabled:opacity-20 transition-colors text-[#0a0a0a] dark:text-[#f5f3f0]"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center px-3">
            <span className="text-[10px] font-bold uppercase tracking-tighter text-[#888888]">Page</span>
            <span className="text-sm font-mono font-bold text-[#0a0a0a] dark:text-[#f5f3f0]">
              {pageNumber} <span className="text-[#888888] mx-1">/</span> {numPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={pageNumber >= numPages}
            className="p-3 rounded-full hover:bg-slate-200 dark:hover:bg-[#2a2a2a] disabled:opacity-20 transition-colors text-[#0a0a0a] dark:text-[#f5f3f0]"
            aria-label="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
