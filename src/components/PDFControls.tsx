import React from 'react';
import { PDFDocument } from '../types';
import styles from '../styles/PDFViewer.module.css';

interface PDFControlsProps {
  pageState: any;
  zoom: any;
  search: any;
  document: PDFDocument | null;
  enableDownload: boolean;
  enablePrint: boolean;
  enableFullscreen: boolean;
  url: string;
}

export function PDFControls({
  pageState,
  zoom,
  search,
  document: pdfDocument,
  enableDownload,
  enablePrint,
  enableFullscreen,
  url,
}: PDFControlsProps) {
  if (!pdfDocument) return null;

  return (
    <div className={styles.controls}>
      {/* Navigation */}
      <button
        onClick={pageState.prevPage}
        disabled={!pageState.canPrev}
        title="Previous page"
      >
        {'<'}
      </button>

      <input
        type="number"
        min="1"
        max={pdfDocument.numPages}
        value={pageState.currentPage}
        onChange={(e) => pageState.goToPage(parseInt(e.target.value, 10) || 1)}
        className={styles.pageInput}
      />

      <span className={styles.pageTotal}>of {pdfDocument.numPages}</span>

      <button
        onClick={pageState.nextPage}
        disabled={!pageState.canNext}
        title="Next page"
      >
        {'>'}
      </button>

      {/* Zoom */}
      <button
        onClick={zoom.zoomOut}
        disabled={!zoom.canZoomOut}
        title="Zoom out"
      >
        -
      </button>

      <span className={styles.zoomLevel}>
        {Math.round(zoom.zoomLevel * 100)}%
      </span>

      <button
        onClick={zoom.zoomIn}
        disabled={!zoom.canZoomIn}
        title="Zoom in"
      >
        +
      </button>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={search.query}
        onChange={(e) => search.search(e.target.value)}
        className={styles.searchInput}
      />

      {search.results.length > 0 && (
        <span className={styles.searchResults}>
          {search.results.length} results
        </span>
      )}

      {/* Actions */}
      {enableDownload && (
        <a href={url} download className={styles.button} title="Download">
          Download
        </a>
      )}

      {enablePrint && (
        <button onClick={() => window.print()} title="Print">
          Print
        </button>
      )}

      {enableFullscreen && typeof document !== 'undefined' && (
        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement?.requestFullscreen();
            }
          }}
          title="Fullscreen"
        >
          Fullscreen
        </button>
      )}
    </div>
  );
}

