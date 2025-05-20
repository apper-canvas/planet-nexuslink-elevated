import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import { getIcon } from '../../utils/iconUtils';
import { getFileExtension, getFileTypeIcon } from '../../utils/exportUtils';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentViewer = ({ document, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Icons
  const XIcon = getIcon('x');
  const ZoomInIcon = getIcon('zoom-in');
  const ZoomOutIcon = getIcon('zoom-out');
  const DownloadIcon = getIcon('download');
  const ChevronLeftIcon = getIcon('chevron-left');
  const ChevronRightIcon = getIcon('chevron-right');
  const InfoIcon = getIcon('info');
  const FileIcon = getIcon(getFileTypeIcon(document.filename));

  useEffect(() => {
    // Reset states when document changes
    setCurrentPage(1);
    setZoom(1);
    setLoading(true);
    setError(null);
  }, [document]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error while loading document:', error);
    setError('Failed to load document. Please try again.');
    setLoading(false);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleZoomIn = () => {
    if (zoom < 2) setZoom(zoom + 0.25);
  };

  const handleZoomOut = () => {
    if (zoom > 0.5) setZoom(zoom - 0.25);
  };

  const handleDownload = () => {
    // In a real app, this would handle the download of the actual file
    // For this example, we're simulating the download
    const downloadLink = document.url || `#fake-download-${document.id}`;
    const link = document.createElement('a');
    link.href = downloadLink;
    link.setAttribute('download', document.filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Determine if we can render the document based on file type
  const fileExtension = getFileExtension(document.filename);
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-surface-800 rounded-xl shadow-soft w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Document toolbar */}
        <div className="document-toolbar justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700" disabled={zoom <= 0.5}>
              <ZoomOutIcon className="w-4 h-4" />
            </button>
            <span className="text-sm">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700" disabled={zoom >= 2}>
              <ZoomInIcon className="w-4 h-4" />
            </button>
            {isPdf && (
              <>
                <div className="h-5 w-px bg-surface-300 dark:bg-surface-600 mx-1"></div>
                <button onClick={handlePrevPage} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700" disabled={currentPage <= 1}>
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-sm">{`${currentPage} / ${numPages || '?'}`}</span>
                <button onClick={handleNextPage} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700" disabled={currentPage >= numPages}>
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleInfo} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700">
              <InfoIcon className="w-4 h-4" />
            </button>
            <button onClick={handleDownload} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700">
              <DownloadIcon className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-200 dark:hover:bg-surface-700">
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document viewer */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-surface-100 dark:bg-surface-900">
          {loading && (
            <div className="flex flex-col items-center justify-center text-surface-500">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
              <p>Loading document...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center text-red-500">
              <FileIcon className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-lg font-semibold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && isPdf && (
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }}>
              <Document file={document.url} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
                <Page pageNumber={currentPage} renderTextLayer={false} renderAnnotationLayer={false} />
              </Document>
            </div>
          )}

          {!loading && !error && isImage && (
            <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s' }} className="max-h-full">
              <img src={document.url} alt={document.filename} className="max-h-[70vh] object-contain" />
            </div>
          )}

          {!loading && !error && !isPdf && !isImage && (
            <div className="flex flex-col items-center justify-center text-surface-500">
              <FileIcon className="w-16 h-16 mb-4 opacity-70" />
              <p className="text-lg font-semibold mb-2">{document.filename}</p>
              <p>This file type cannot be previewed</p>
              <button onClick={handleDownload} className="mt-4 btn-primary">Download File</button>
            </div>
          )}
        </div>

        {/* Document info panel */}
        {showInfo && (
          <div className="border-t border-surface-200 dark:border-surface-700 p-4">
            <h3 className="font-semibold mb-2">Document Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-surface-500">Filename:</div>
              <div>{document.filename}</div>
              <div className="text-surface-500">Added by:</div>
              <div>{document.uploadedBy}</div>
              <div className="text-surface-500">Date added:</div>
              <div>{new Date(document.uploadedAt).toLocaleString()}</div>
              <div className="text-surface-500">Last modified:</div>
              <div>{new Date(document.modifiedAt || document.uploadedAt).toLocaleString()}</div>
              <div className="text-surface-500">Version:</div>
              <div>v{document.version || 1}.0</div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default DocumentViewer;