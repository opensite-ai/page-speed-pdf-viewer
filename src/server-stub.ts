/**
 * Server stub for @page-speed/pdf-viewer
 * 
 * This module is used when the package is imported in a server-side context
 * (React Server Components, Node.js, etc.) to prevent the canvas dependency
 * from being resolved during build time.
 * 
 * The actual PDF viewer components require browser APIs and pdfjs-dist,
 * which has a canvas dependency that cannot be resolved in server environments.
 */

import type { ReactElement } from 'react';
import type {
  PDFViewerProps,
  PDFDocument,
  PDFViewerConfig,
  PDFMetadata,
  PageInfo,
  SearchResult,
  RenderTask,
  CacheEntry,
} from './types';

const SERVER_ERROR_MESSAGE =
  '@page-speed/pdf-viewer components cannot be rendered on the server. ' +
  'Please use dynamic imports with ssr: false or wrap in a client-only boundary.';

/**
 * Server stub for PDFViewer - renders null and logs a warning
 */
export function PDFViewer(_props: PDFViewerProps): ReactElement | null {
  if (typeof window === 'undefined') {
    console.warn(SERVER_ERROR_MESSAGE);
  }
  return null;
}

/**
 * Server stub for PDFCanvas
 */
export function PDFCanvas(_props: {
  pdfDoc: unknown;
  pageNumber: number;
  scale: number;
  onRender?: (canvas: HTMLCanvasElement) => void;
}): ReactElement | null {
  return null;
}

/**
 * Server stub for PDFControls
 */
export function PDFControls(_props: {
  pageState: ReturnType<typeof usePageState>;
  zoom: ReturnType<typeof useZoom>;
  search: ReturnType<typeof useSearch>;
  document: PDFDocument | null;
  enableDownload?: boolean;
  enablePrint?: boolean;
  enableFullscreen?: boolean;
  url: string;
}): ReactElement | null {
  return null;
}

/**
 * Server stub for PDFThumbnails
 */
export function PDFThumbnails(_props: {
  pdfDoc: unknown;
  currentPage: number;
  onSelectPage: (page: number) => void;
  numPages: number;
}): ReactElement | null {
  return null;
}

/**
 * Server stub for usePDFDocument hook
 */
export function usePDFDocument(
  _url: string,
  _onError?: (error: Error) => void
): {
  document: PDFDocument | null;
  pdfDoc: unknown;
  loading: boolean;
  error: Error | null;
} {
  return {
    document: null,
    pdfDoc: null,
    loading: false,
    error: null,
  };
}

/**
 * Server stub for usePageState hook
 */
export function usePageState(_options: {
  totalPages: number;
  initialPage?: number;
}): {
  currentPage: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  canNext: boolean;
  canPrev: boolean;
} {
  return {
    currentPage: 1,
    goToPage: () => {},
    nextPage: () => {},
    prevPage: () => {},
    canNext: false,
    canPrev: false,
  };
}

/**
 * Server stub for usePageRenderer hook
 */
export function usePageRenderer(_pdfDoc: unknown): {
  renderPage: (pageNumber: number, scale: number) => Promise<HTMLCanvasElement | null>;
  pageInfo: PageInfo | null;
} {
  return {
    renderPage: async () => null,
    pageInfo: null,
  };
}

/**
 * Server stub for useZoom hook
 */
export function useZoom(
  _initialZoom?: number | 'auto' | 'page-fit' | 'page-width'
): {
  zoomLevel: number;
  zoomMode: 'auto' | 'page-fit' | 'page-width' | 'custom';
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (level: number | 'auto' | 'page-fit' | 'page-width') => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
} {
  return {
    zoomLevel: 1,
    zoomMode: 'auto',
    zoomIn: () => {},
    zoomOut: () => {},
    setZoom: () => {},
    canZoomIn: false,
    canZoomOut: false,
  };
}

/**
 * Server stub for useSearch hook
 */
export function useSearch(_pdfDoc: unknown): {
  query: string;
  results: SearchResult[];
  currentResult: number;
  searching: boolean;
  search: (query: string) => void;
  nextResult: () => void;
  prevResult: () => void;
} {
  return {
    query: '',
    results: [],
    currentResult: 0,
    searching: false,
    search: () => {},
    nextResult: () => {},
    prevResult: () => {},
  };
}

// Server-safe utility stubs
// Note: Some utilities use browser APIs (document, window) so we provide stubs

/**
 * Check if URL points to a linearized PDF (server stub - always returns false)
 */
export async function isLinearizedPDF(_url: string): Promise<boolean> {
  return false;
}

/**
 * Download PDF file (server stub - no-op)
 */
export function downloadPDF(_url: string, _filename?: string): void {
  console.warn('downloadPDF is not available on the server');
}

/**
 * Calculate optimal scale for page fit (pure function - safe for server)
 */
export function calculateScaleForPageFit(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  const widthRatio = containerWidth / pageWidth;
  const heightRatio = containerHeight / pageHeight;
  return Math.min(widthRatio, heightRatio);
}

/**
 * Format file size for display (pure function - safe for server)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract text from PDF page (server stub - returns empty string)
 */
export async function extractPageText(_pdfDoc: unknown, _pageNumber: number): Promise<string> {
  return '';
}

/**
 * Configuration for linearized PDF loading
 */
export const linearizedPDFConfig = {
  rangeChunkSize: 65536,
  disableAutoFetch: false,
  disableStream: false,
};

/**
 * Get optimal range header for linearized PDF fetch (pure function - safe for server)
 */
export function getOptimalRangeHeader(fileSize: number): { start: number; end: number } {
  const chunkSize = Math.min(65536, Math.ceil(fileSize * 0.1));
  return {
    start: 0,
    end: chunkSize - 1,
  };
}

/**
 * Create fetch handler for progressive loading (server stub - returns no-op)
 */
export function createProgressiveFetchHandler(
  _onProgress?: (loaded: number, total: number) => void
): (range: { start: number; end: number }) => Promise<ArrayBuffer> {
  return async () => new ArrayBuffer(0);
}

// Re-export types
export type {
  PDFViewerConfig,
  PDFViewerProps,
  PDFDocument,
  PDFMetadata,
  PageInfo,
  SearchResult,
  RenderTask,
  CacheEntry,
} from './types';
