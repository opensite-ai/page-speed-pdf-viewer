/**
 * CSS styles for PDFViewer component.
 * These are injected at runtime to ensure styles are always available.
 */
const PDF_VIEWER_STYLES = `
/* Core viewer layout */
.PDFViewer_viewer { display: flex; flex-direction: column; background: #f5f5f5; font-family: system-ui, -apple-system, sans-serif; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); height: 100%; width: 100%; }

/* Controls */
.PDFViewer_controls { display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #fff; border-bottom: 1px solid #e0e0e0; overflow-x: auto; flex-wrap: wrap; flex-shrink: 0; z-index: 10; position: relative; }
.PDFViewer_controls button { padding: 8px 14px; background: #007bff; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 150ms, box-shadow 150ms; white-space: nowrap; }
.PDFViewer_controls button:hover:not(:disabled) { background: #0056b3; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.PDFViewer_controls button:disabled { opacity: 0.5; cursor: not-allowed; background: #6c757d; }

.PDFViewer_pageInput { width: 60px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; text-align: center; font-weight: 500; }
.PDFViewer_pageInput:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 2px rgba(0,123,255,0.1); }
.PDFViewer_pageTotal { font-size: 14px; color: #666; font-weight: 500; white-space: nowrap; }
.PDFViewer_zoomLevel { font-size: 14px; color: #333; min-width: 60px; text-align: center; font-weight: 600; }

.PDFViewer_searchInput { padding: 6px 12px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
.PDFViewer_searchResults { font-size: 12px; color: #666; }

.PDFViewer_button { padding: 6px 12px; background: #28a745; color: #fff; border: none; border-radius: 4px; text-decoration: none; cursor: pointer; transition: background 150ms; font-size: 14px; font-weight: 500; }
.PDFViewer_button:hover { background: #218838; }

/* Main content */
.PDFViewer_content { display: flex; flex: 1; overflow: hidden; min-height: 0; }
.PDFViewer_canvas { flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; background: #fff; padding: 20px; }
.PDFViewer_canvas canvas { max-width: 100%; height: auto !important; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: block; }

/* Thumbnails */
.PDFViewer_thumbnails { width: 120px; overflow-y: auto; background: #fff; border-right: 1px solid #e0e0e0; padding: 8px; display: flex; flex-direction: column; gap: 8px; }
.PDFViewer_thumbnail { position: relative; cursor: pointer; border: 2px solid transparent; border-radius: 4px; overflow: hidden; transition: border-color 150ms, box-shadow 150ms; }
.PDFViewer_thumbnail:hover { border-color: #007bff; box-shadow: 0 2px 4px rgba(0,123,255,0.2); }
.PDFViewer_thumbnail.PDFViewer_active { border-color: #007bff; box-shadow: 0 2px 8px rgba(0,123,255,0.4); }
.PDFViewer_thumbnail canvas { width: 100%; height: auto; display: block; }
.PDFViewer_pageNumber { position: absolute; bottom: 4px; right: 4px; font-size: 11px; background: rgba(0,0,0,0.7); color: #fff; padding: 2px 4px; border-radius: 2px; }

/* Loading & error */
.PDFViewer_loading, .PDFViewer_error { display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 8px; }
.PDFViewer_loading p, .PDFViewer_error p { font-size: 16px; color: #666; }
.PDFViewer_error p { color: #dc3545; }

/* Responsive tweaks */
@media (max-width: 768px) {
  .PDFViewer_controls { gap: 6px; padding: 8px 12px; }
  .PDFViewer_controls button { padding: 4px 8px; font-size: 12px; }
  .PDFViewer_pageInput { width: 50px; }
  .PDFViewer_thumbnails { width: 80px; }
  .PDFViewer_searchInput { padding: 4px 8px; font-size: 12px; }
}
`;

let stylesInjected = false;

/**
 * Injects PDF viewer styles into the document head.
 * This is called automatically when the PDFViewer component mounts.
 * Styles are only injected once, even if called multiple times.
 */
export function injectPDFViewerStyles(): void {
  if (typeof document === 'undefined') return;
  if (stylesInjected) return;

  const styleId = 'page-speed-pdf-viewer-styles';
  
  // Check if styles are already in the document (e.g., from SSR or previous injection)
  if (document.getElementById(styleId)) {
    stylesInjected = true;
    return;
  }

  const styleElement = document.createElement('style');
  styleElement.id = styleId;
  styleElement.textContent = PDF_VIEWER_STYLES;
  document.head.appendChild(styleElement);
  stylesInjected = true;
}

/**
 * CSS class names for PDFViewer components.
 * These match the injected styles.
 */
export const pdfViewerStyles = {
  viewer: 'PDFViewer_viewer',
  controls: 'PDFViewer_controls',
  pageInput: 'PDFViewer_pageInput',
  pageTotal: 'PDFViewer_pageTotal',
  zoomLevel: 'PDFViewer_zoomLevel',
  searchInput: 'PDFViewer_searchInput',
  searchResults: 'PDFViewer_searchResults',
  button: 'PDFViewer_button',
  content: 'PDFViewer_content',
  canvas: 'PDFViewer_canvas',
  thumbnails: 'PDFViewer_thumbnails',
  thumbnail: 'PDFViewer_thumbnail',
  active: 'PDFViewer_active',
  pageNumber: 'PDFViewer_pageNumber',
  loading: 'PDFViewer_loading',
  error: 'PDFViewer_error',
};
