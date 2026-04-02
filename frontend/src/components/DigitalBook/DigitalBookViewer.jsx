import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, BookOpen, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ReactReader } from 'react-reader';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import VideoTrigger from './VideoTrigger';
import AudioSection from './AudioSection';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function DigitalBookViewer({ passcode, initialContent }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [location, setLocation] = useState(null); // For EPUB
  const [renderError, setRenderError] = useState(false);
  const [epubData, setEpubData] = useState(null);
  const [epubLoading, setEpubLoading] = useState(false);
  const [epubError, setEpubError] = useState(null);

  if (!initialContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
        <p className="animate-pulse font-medium">Loading Digital Book...</p>
      </div>
    );
  }

  const docMedia = initialContent.media?.find(m => m.type === 'DOCUMENT');
  const videos = initialContent.media?.filter(m => m.type === 'VIDEO') || [];
  const audios = initialContent.media?.filter(m => m.type === 'AUDIO') || [];

  const bookUrl = docMedia?.url || docMedia?.playUrl;

  if (!bookUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <BookOpen className="w-16 h-16 mb-4 opacity-50" />
        <h2 className="text-xl font-bold">No Book Document Found</h2>
        <p className="text-sm">Please upload a PDF or EPUB in the Admin Panel.</p>
      </div>
    );
  }

  // Detect EPUB from URL or fallback string
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

  // Mapping logic:
  // For PDFs, we map video/audio exact 'order' to the 'pageNumber'.
  // We also fallback to show unbound audio on the last page.
  const pageVideos = videos.filter(v => v.order === pageNumber);
  const isLastPdfPage = numPages && pageNumber === numPages;
  const pageAudios = audios.filter(a => a.order === pageNumber || (isLastPdfPage && !a.order));

  // For EPUB, 'order' maps to the chapter/location roughly. Since `location` in epubjs is abstract,
  // we just show ALL videos/audios on the side for MVP if they have no order, or provide a toggle.
  // We'll just list them unbound for EPUB.
  const unboundVideos = isEpub ? videos : pageVideos;
  const unboundAudios = isEpub ? audios : pageAudios;

  const handlePrevPage = () => setPageNumber(p => Math.max(p - 1, 1));
  const handleNextPage = () => setPageNumber(p => Math.min(p + 1, numPages || 1));

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-[#0f1115] text-slate-800 dark:text-slate-200 transition-colors duration-500 selection:bg-blue-200 dark:selection:bg-blue-900 pb-20 leading-[1.6]">

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#fcfcfc]/90 dark:bg-[#0f1115]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <div>
              <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100">{initialContent.title}</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Digital Book Format</p>
            </div>
          </div>

          {!isEpub && numPages && (
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Page {pageNumber} of {numPages}
            </div>
          )}
        </div>

        {/* Progress Bar (PDF only) */}
        {!isEpub && numPages && (
          <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${(pageNumber / numPages) * 100}%` }}
            />
          </div>
        )}
      </header>

      {/* Reader Content Area */}
      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-10 pb-32 min-h-[75vh] flex flex-col md:flex-row gap-8">

        {/* Book Container */}
        <div className="flex-1 bg-white dark:bg-black rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative" style={{ minHeight: isEpub ? '70vh' : 'auto' }}>

          {isEpub ? (
            <div className="absolute inset-0 flex flex-col justify-center">
              {epubLoading ? (
                <div className="flex flex-col items-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                  <p className="animate-pulse font-medium text-sm">Downloading Book...</p>
                </div>
              ) : epubError ? (
                <div className="text-red-500 p-8 text-center border-dashed border-2 border-red-300 rounded-xl m-8">
                  Failed to load EPUB: {epubError}
                </div>
              ) : epubData ? (
                <div className="absolute inset-0">
                  <ReactReader
                    url={epubData}
                    location={location}
                    locationChanged={(epubcifi) => setLocation(epubcifi)}
                    getRendition={(rendition) => {
                      // Ensure nice styling internally
                      rendition.themes.default({
                        '::selection': { background: 'rgba(59, 130, 246, 0.3)' }
                      })
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex justify-center p-4">
              {renderError ? (
                <div className="text-red-500 p-8 text-center border-dashed border-2 border-red-300 rounded-xl">
                  Failed to load PDF. Cross-Origin Resource Sharing (CORS) might be blocking the file from Supabase, or the file is corrupted.
                </div>
              ) : (
                <Document
                  file={bookUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={() => setRenderError(true)}
                  loading={<Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mt-20" />}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={pageNumber}
                      initial={{ opacity: 0, x: 10, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Page
                        pageNumber={pageNumber}
                        width={Math.min(window.innerWidth - 40, 800)}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-sm border border-slate-100 dark:border-slate-800/50"
                      />
                    </motion.div>
                  </AnimatePresence>
                </Document>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Media Sidebar triggers */}
        {(unboundVideos.length > 0 || unboundAudios.length > 0) && (
          <div className="w-full md:w-80 shrink-0 flex flex-col gap-6 pt-4">
            <div className="sticky top-24">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                {isEpub ? "Book Media" : `Page ${pageNumber} Media`}
              </h3>

              {unboundVideos.length === 0 && unboundAudios.length === 0 && !isEpub && (
                <p className="text-sm text-slate-400 italic">No media mapped to this page.</p>
              )}

              <div className="space-y-4">
                {unboundVideos.map((video, idx) => {
                  const vUrl = video.url || video.playUrl || (video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : '');
                  return <VideoTrigger key={idx} title={video.title} url={vUrl} />;
                })}

                {unboundAudios.length > 0 && (
                  <div className="mt-8">
                    <AudioSection tracks={unboundAudios.map((a, i) => {
                      const aUrl = a.url || a.playUrl || '';
                      return { id: i, title: a.title, url: aUrl };
                    })} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* PDF Bottom Navigation */}
      {!isEpub && numPages && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-full shadow-lg z-50">
          <button
            onClick={handlePrevPage}
            disabled={pageNumber <= 1}
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-700 dark:text-slate-300"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <span className="text-xs font-bold font-mono tracking-widest px-4 text-slate-500 dark:text-slate-400">
            {pageNumber} / {numPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={pageNumber >= numPages}
            className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-700 dark:text-slate-300"
            aria-label="Next Page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

    </div>
  );
}
