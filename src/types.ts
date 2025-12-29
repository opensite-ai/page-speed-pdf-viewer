import type { CSSProperties } from 'react';

/**
 * PDF viewer configuration options
 */
export interface PDFViewerConfig {
  /** Initial page number (1-indexed) */
  initialPage?: number;

  /** Initial zoom level (0.5 to 3.0, or 'auto' / 'page-fit' / 'page-width') */
  initialZoom?: number | 'auto' | 'page-fit' | 'page-width';

  /** Enable text selection */
  textSelection?: boolean;

  /** Enable search functionality */
  search?: boolean;

  /** Show page controls (next/prev buttons, page input) */
  showControls?: boolean;

  /** Show thumbnail sidebar */
  showThumbnails?: boolean;

  /** Enable download button */
  enableDownload?: boolean;

  /** Enable print button */
  enablePrint?: boolean;

  /** Enable fullscreen button */
  enableFullscreen?: boolean;

  /** Custom worker script URL for PDF.js */
  workerUrl?: string;

  /** Cache size in MB (default: 50) */
  cacheSize?: number;

  /** Enable progressive loading for linearized PDFs */
  progressiveLoading?: boolean;
}

/**
 * PDF document metadata
 */
export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

/**
 * Page rendering information
 */
export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

/**
 * Search result
 */
export interface SearchResult {
  pageNumber: number;
  text: string;
  position: {
    x: number;
    y: number;
  };
}

/**
 * PDF document instance
 */
export interface PDFDocument {
  numPages: number;
  fingerprint: string;
  metadata: PDFMetadata;
  isLinearized: boolean;
  isEncrypted: boolean;
}

/**
 * Viewer props
 */
export interface PDFViewerProps {
  /** PDF URL or file path */
  url: string;

  /** Document title for display */
  title?: string;

  /** Configuration options */
  config?: Partial<PDFViewerConfig>;

  /** Container height (CSS value) */
  height?: string | number;

  /** Container width (CSS value) */
  width?: string | number;

  /** CSS class name */
  className?: string;

  /** Inline styles */
  style?: CSSProperties;

  /** Called when PDF is loaded */
  onDocumentLoad?: (doc: PDFDocument) => void;

  /** Called when page changes */
  onPageChange?: (pageNumber: number) => void;

  /** Called on rendering errors */
  onError?: (error: Error) => void;

  /** Called during progressive loading */
  onProgress?: (progress: { loaded: number; total: number }) => void;

  /** Called when search results found */
  onSearchResults?: (results: SearchResult[]) => void;
}

/**
 * Page canvas cache entry
 */
export interface CacheEntry {
  canvas: HTMLCanvasElement;
  timestamp: number;
  scale: number;
}

/**
 * Page render task
 */
export interface RenderTask {
  pageNumber: number;
  scale: number;
  rotation: number;
  priority: 'high' | 'normal' | 'low';
}

