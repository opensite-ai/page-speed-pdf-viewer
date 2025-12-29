import React, { useEffect } from 'react';
import { PDFViewerProps } from '../types';
import { usePDFDocument } from '../hooks/usePDFDocument';
import { usePageState } from '../hooks/usePageState';
import { usePageRenderer } from '../hooks/usePageRenderer';
import { useZoom } from '../hooks/useZoom';
import { useSearch } from '../hooks/useSearch';
import { PDFCanvas } from './PDFCanvas';
import { PDFControls } from './PDFControls';
import { PDFThumbnails } from './PDFThumbnails';
import styles from '../styles/PDFViewer.module.css';

export function PDFViewer({
  url,
  title,
  config = {},
  height = '600px',
  width = '100%',
  className,
  style,
  onDocumentLoad,
  onPageChange,
  onError,
  onProgress,
  onSearchResults,
}: PDFViewerProps) {
  const {
    showControls = true,
    showThumbnails = false,
    enableDownload = true,
    enablePrint = true,
    enableFullscreen = true,
    initialPage = 1,
    initialZoom = 'auto',
  } = config;

  const { document, pdfDoc, loading, error } = usePDFDocument(url, onError);
  const pageState = usePageState({
    totalPages: document?.numPages || 0,
    initialPage,
  });
  const { renderPage, pageInfo } = usePageRenderer(pdfDoc);
  const zoom = useZoom(initialZoom);
  const search = useSearch(pdfDoc);

  useEffect(() => {
    if (document) {
      onDocumentLoad?.(document);
    }
  }, [document, onDocumentLoad]);

  useEffect(() => {
    onPageChange?.(pageState.currentPage);
  }, [pageState.currentPage, onPageChange]);

  useEffect(() => {
    if (search.results.length > 0) {
      onSearchResults?.(search.results);
    }
  }, [search.results, onSearchResults]);

  if (error) {
    return (
      <div className={styles.error} style={{ height, width }}>
        <p>Failed to load PDF: {error.message}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.loading} style={{ height, width }}>
        <p>Loading PDF...</p>
      </div>
    );
  }

  return (
    <div
      className={`${styles.viewer} ${className || ''}`}
      style={{ height, width, ...style }}
    >
      {showControls && (
        <PDFControls
          pageState={pageState}
          zoom={zoom}
          search={search}
          document={document}
          enableDownload={enableDownload}
          enablePrint={enablePrint}
          enableFullscreen={enableFullscreen}
          url={url}
        />
      )}

      <div className={styles.content}>
        {showThumbnails && document && (
          <PDFThumbnails
            pdfDoc={pdfDoc}
            currentPage={pageState.currentPage}
            onSelectPage={pageState.goToPage}
            numPages={document.numPages}
          />
        )}

        <PDFCanvas
          pdfDoc={pdfDoc}
          pageNumber={pageState.currentPage}
          scale={zoom.zoomLevel}
          onRender={renderPage}
        />
      </div>
    </div>
  );
}

