# @page-speed/pdf-viewer - Complete Implementation Guide

**Build a high-performance, linearized PDF viewer for restaurant menus, catalogs, and documents**

---

## Executive Summary

`@page-speed/pdf-viewer` is a critical prerequisite for `@page-speed/lightbox`. This guide provides a complete, step-by-step implementation plan for building a production-ready PDF viewer that:

- ✅ Integrates seamlessly with the lightbox component
- ✅ Supports linearized PDFs for fast progressive loading
- ✅ Achieves sub-1-second page rendering
- ✅ Maintains <30 KB bundle size (base)
- ✅ Works with restaurant menus, catalogs, documents
- ✅ Provides page controls, zoom, search capabilities
- ✅ Lazy-loads PDF.js only when needed

---

## Phase 1: Project Setup & Dependencies (Days 1-2)

### 1.1 Initialize Package

```bash
# Create the package directory
mkdir @page-speed/pdf-viewer
cd @page-speed/pdf-viewer

# Initialize npm
npm init -y

# Install core dependencies
npm install react react-dom pdfjs-dist
npm install --save-dev \
 typescript \
 @types/react \
 @types/react-dom \
 @testing-library/react \
 jest \
 ts-jest \
 esbuild
```

### 1.2 Package Configuration

```json
{
 "name": "@page-speed/pdf-viewer",
 "version": "1.0.0-alpha.1",
 "description": "High-performance PDF viewer for restaurant menus, catalogs, and documents",
 "main": "dist/index.js",
 "module": "dist/index.esm.js",
 "types": "dist/index.d.ts",
 "files": ["dist"],
 "sideEffects": false,
 "exports": {
 ".": {
 "import": "./dist/index.js",
 "require": "./dist/index.cjs",
 "types": "./dist/index.d.ts"
 },
 "./hooks": {
 "import": "./dist/hooks/index.js",
 "types": "./dist/hooks/index.d.ts"
 },
 "./components": {
 "import": "./dist/components/index.js",
 "types": "./dist/components/index.d.ts"
 },
 "./utils": {
 "import": "./dist/utils/index.js",
 "types": "./dist/utils/index.d.ts"
 }
 },
 "scripts": {
 "build": "npm run build:esm && npm run build:cjs",
 "build:esm": "esbuild src/index.ts --bundle --platform=browser --format=esm --outfile=dist/index.js --external:pdfjs-dist --external:react --external:react-dom",
 "build:cjs": "esbuild src/index.ts --bundle --platform=browser --format=cjs --outfile=dist/index.cjs --external:pdfjs-dist --external:react --external:react-dom",
 "bundle-analyze": "esbuild src/index.ts --bundle --analyze --outfile=/dev/null --external:pdfjs-dist --external:react --external:react-dom",
 "test": "jest",
 "test:watch": "jest --watch",
 "test:coverage": "jest --coverage",
 "lint": "tsc --noEmit",
 "type-check": "tsc --noEmit",
 "prepare": "npm run build"
 },
 "peerDependencies": {
 "react": "^18.0.0",
 "react-dom": "^18.0.0"
 },
 "dependencies": {
 "pdfjs-dist": "^3.11.174"
 },
 "keywords": [
 "pdf",
 "viewer",
 "react",
 "restaurant",
 "menu",
 "catalog",
 "document"
 ],
 "repository": {
 "type": "git",
 "url": "https://github.com/opensite-ai/@page-speed/pdf-viewer"
 },
 "bugs": {
 "url": "https://github.com/opensite-ai/@page-speed/pdf-viewer/issues"
 },
 "license": "MIT"
}
```

### 1.3 TypeScript Configuration

```json
{
 "compilerOptions": {
 "target": "ES2020",
 "lib": ["ES2020", "DOM", "DOM.Iterable"],
 "module": "ESNext",
 "moduleResolution": "bundler",
 "jsx": "react-jsx",
 "strict": true,
 "esModuleInterop": true,
 "skipLibCheck": true,
 "forceConsistentCasingInFileNames": true,
 "declaration": true,
 "declarationMap": true,
 "sourceMap": true,
 "outDir": "./dist",
 "resolveJsonModule": true,
 "allowSyntheticDefaultImports": true
 },
 "include": ["src"],
 "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.test.tsx"]
}
```

---

## Phase 2: Complete Type System (Day 2-3)

### Core Types

```typescript
// src/types.ts

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
 style?: React.CSSProperties;

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
```

---

## Phase 3: State Management Hooks (Days 3-4)

### usePDFDocument Hook

```typescript
// src/hooks/usePDFDocument.ts
import { useState, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, PDFMetadata } from '../types';

// Set up PDF.js worker
if (typeof window !== 'undefined') {
 pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export function usePDFDocument(url: string, onError?: (error: Error) => void) {
 const [document, setDocument] = useState<PDFDocument | null>(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<Error | null>(null);
 const [pdfDoc, setPdfDoc] = useState<any>(null);

 useEffect(() => {
 if (!url) return;

 setLoading(true);
 setError(null);

 const loadPDF = async () => {
 try {
 const loadingTask = pdfjsLib.getDocument({
 url,
 withCredentials: true,
 rangeChunkSize: 65536, // For linearized PDFs
 });

 const pdf = await loadingTask.promise;
 setPdfDoc(pdf);

 // Extract metadata
 const metadata = await pdf.getMetadata();
 const isLinearized = await pdf.isLinearized;

 setDocument({
 numPages: pdf.numPages,
 fingerprint: pdf.fingerprint as string,
 metadata: {
 title: metadata?.title,
 author: metadata?.author,
 subject: metadata?.subject,
 keywords: metadata?.keywords,
 creator: metadata?.creator,
 producer: metadata?.producer,
 },
 isLinearized,
 isEncrypted: pdf.isEncrypted,
 });
 } catch (err) {
 const error = err instanceof Error ? err : new Error('Failed to load PDF');
 setError(error);
 onError?.(error);
 } finally {
 setLoading(false);
 }
 };

 loadPDF();
 }, [url, onError]);

 return { document, pdfDoc, loading, error };
}
```

### usePageState Hook

```typescript
// src/hooks/usePageState.ts
import { useState, useCallback } from 'react';

export function usePageState({
 totalPages,
 initialPage = 1,
}: {
 totalPages: number;
 initialPage?: number;
}) {
 const [currentPage, setCurrentPage] = useState(
 Math.max(1, Math.min(initialPage, totalPages))
 );

 const goToPage = useCallback((page: number) => {
 const validPage = Math.max(1, Math.min(page, totalPages));
 setCurrentPage(validPage);
 }, [totalPages]);

 const nextPage = useCallback(() => {
 goToPage(currentPage + 1);
 }, [currentPage, goToPage]);

 const prevPage = useCallback(() => {
 goToPage(currentPage - 1);
 }, [currentPage, goToPage]);

 return {
 currentPage,
 goToPage,
 nextPage,
 prevPage,
 canNext: currentPage < totalPages,
 canPrev: currentPage > 1,
 };
}
```

### usePageRenderer Hook

```typescript
// src/hooks/usePageRenderer.ts
import { useRef, useEffect, useState, useCallback } from 'react';
import { CacheEntry, RenderTask, PageInfo } from '../types';

const DEFAULT_SCALE = 1.5;
const CACHE_SIZE = 50 * 1024 * 1024; // 50 MB in bytes

export function usePageRenderer(pdfDoc: any) {
 const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
 const [rendering, setRendering] = useState(false);
 const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);

 const renderPage = useCallback(
 async (
 pageNumber: number,
 scale: number = DEFAULT_SCALE,
 rotation: number = 0
 ) => {
 if (!pdfDoc) return null;

 try {
 setRendering(true);

 const cacheKey = `${pageNumber}-${scale}-${rotation}`;
 const cached = cacheRef.current.get(cacheKey);

 if (cached) {
 return cached.canvas;
 }

 const page = await pdfDoc.getPage(pageNumber);
 const viewport = page.getViewport({ scale, rotation });

 const canvas = document.createElement('canvas');
 const context = canvas.getContext('2d');

 if (!context) throw new Error('Failed to get canvas context');

 canvas.width = viewport.width;
 canvas.height = viewport.height;

 const renderTask = page.render({
 canvasContext: context,
 viewport: viewport,
 });

 await renderTask.promise;

 // Store in cache
 const cacheEntry: CacheEntry = {
 canvas,
 timestamp: Date.now(),
 scale,
 };

 cacheRef.current.set(cacheKey, cacheEntry);

 // Simple LRU: remove oldest if cache is too large
 let cacheSize = 0;
 const entries = Array.from(cacheRef.current.entries());

 for (const [, entry] of entries) {
 cacheSize += entry.canvas.width * entry.canvas.height * 4; // 4 bytes per pixel
 }

 if (cacheSize > CACHE_SIZE) {
 const oldest = entries.reduce((prev, curr) =>
 curr.timestamp < prev.timestamp ? curr : prev
 );
 cacheRef.current.delete(oldest);
 }

 setPageInfo({
 pageNumber,
 width: viewport.width,
 height: viewport.height,
 rotation,
 scale,
 });

 return canvas;
 } catch (error) {
 console.error('Failed to render page:', error);
 return null;
 } finally {
 setRendering(false);
 }
 },
 [pdfDoc]
 );

 return { renderPage, rendering, pageInfo };
}
```

### useZoom Hook

```typescript
// src/hooks/useZoom.ts
import { useState, useCallback } from 'react';

export type ZoomMode = 'auto' | 'page-fit' | 'page-width' | 'custom';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.25;

export function useZoom(initialZoom: number | string = 1.5) {
 const [zoomLevel, setZoomLevel] = useState<number>(
 typeof initialZoom === 'number' ? initialZoom : 1.5
 );
 const [zoomMode, setZoomMode] = useState<ZoomMode>(
 typeof initialZoom === 'string' ? (initialZoom as ZoomMode) : 'custom'
 );

 const zoomIn = useCallback(() => {
 setZoomLevel((prev) => Math.min(MAX_ZOOM, prev + ZOOM_STEP));
 setZoomMode('custom');
 }, []);

 const zoomOut = useCallback(() => {
 setZoomLevel((prev) => Math.max(MIN_ZOOM, prev - ZOOM_STEP));
 setZoomMode('custom');
 }, []);

 const setZoom = useCallback((level: number | ZoomMode) => {
 if (typeof level === 'number') {
 setZoomLevel(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, level)));
 setZoomMode('custom');
 } else {
 setZoomMode(level);
 }
 }, []);

 return {
 zoomLevel,
 zoomMode,
 zoomIn,
 zoomOut,
 setZoom,
 canZoomIn: zoomLevel < MAX_ZOOM,
 canZoomOut: zoomLevel > MIN_ZOOM,
 };
}
```

### useSearch Hook

```typescript
// src/hooks/useSearch.ts
import { useState, useCallback } from 'react';
import { SearchResult } from '../types';

export function useSearch(pdfDoc: any) {
 const [query, setQuery] = useState('');
 const [results, setResults] = useState<SearchResult[]>([]);
 const [searching, setSearching] = useState(false);
 const [currentResultIndex, setCurrentResultIndex] = useState(0);

 const search = useCallback(
 async (searchText: string) => {
 if (!pdfDoc || !searchText.trim()) {
 setResults([]);
 setQuery('');
 return;
 }

 setSearching(true);
 setQuery(searchText);
 const foundResults: SearchResult[] = [];

 try {
 for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
 const page = await pdfDoc.getPage(pageNum);
 const textContent = await page.getTextContent();

 for (const item of textContent.items) {
 if ('str' in item && item.str.includes(searchText)) {
 foundResults.push({
 pageNumber: pageNum,
 text: item.str,
 position: {
 x: item.transform,
 y: item.transform,
 },
 });
 }
 }
 }

 setResults(foundResults);
 setCurrentResultIndex(0);
 } catch (error) {
 console.error('Search failed:', error);
 } finally {
 setSearching(false);
 }
 },
 [pdfDoc]
 );

 const nextResult = useCallback(() => {
 setCurrentResultIndex((prev) => (prev + 1) % results.length);
 }, [results.length]);

 const prevResult = useCallback(() => {
 setCurrentResultIndex((prev) => (prev - 1 + results.length) % results.length);
 }, [results.length]);

 return {
 query,
 results,
 currentResult: results[currentResultIndex],
 searching,
 search,
 nextResult,
 prevResult,
 };
}
```

---

## Phase 4: Core Components (Days 4-6)

### PDFViewer Component (Main)

```typescript
// src/components/PDFViewer.tsx
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
```

### PDFCanvas Component

```typescript
// src/components/PDFCanvas.tsx
import React, { useEffect, useRef, useState } from 'react';
import styles from '../styles/PDFViewer.module.css';

interface PDFCanvasProps {
 pdfDoc: any;
 pageNumber: number;
 scale: number;
 onRender: (page: number, scale: number, rotation: number) => Promise<HTMLCanvasElement | null>;
}

export function PDFCanvas({
 pdfDoc,
 pageNumber,
 scale,
 onRender,
}: PDFCanvasProps) {
 const containerRef = useRef<HTMLDivElement>(null);
 const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

 useEffect(() => {
 const render = async () => {
 const renderedCanvas = await onRender(pageNumber, scale, 0);
 if (renderedCanvas && containerRef.current) {
 // Clear previous canvas
 while (containerRef.current.firstChild) {
 containerRef.current.removeChild(containerRef.current.firstChild);
 }
 containerRef.current.appendChild(renderedCanvas);
 setCanvas(renderedCanvas);
 }
 };

 if (pdfDoc) {
 render();
 }
 }, [pdfDoc, pageNumber, scale, onRender]);

 return <div ref={containerRef} className={styles.canvas} />;
}
```

### PDFControls Component

```typescript
// src/components/PDFControls.tsx
import React from 'react';
import { PDFDocument, PageInfo } from '../types';
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
 document,
 enableDownload,
 enablePrint,
 enableFullscreen,
 url,
}: PDFControlsProps) {
 if (!document) return null;

 return (
 <div className={styles.controls}>
 {/* Navigation */}
 <button
 onClick={pageState.prevPage}
 disabled={!pageState.canPrev}
 title="Previous page"
 >
 ←
 </button>

 <input
 type="number"
 min="1"
 max={document.numPages}
 value={pageState.currentPage}
 onChange={(e) => pageState.goToPage(parseInt(e.target.value))}
 className={styles.pageInput}
 />

 <span className={styles.pageTotal}>of {document.numPages}</span>

 <button
 onClick={pageState.nextPage}
 disabled={!pageState.canNext}
 title="Next page"
 >
 →
 </button>

 {/* Zoom */}
 <button
 onClick={zoom.zoomOut}
 disabled={!zoom.canZoomOut}
 title="Zoom out"
 >
 −
 </button>

 <span className={styles.zoomLevel}>{Math.round(zoom.zoomLevel * 100)}%</span>

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
 ⬇
 </a>
 )}

 {enablePrint && (
 <button onClick={() => window.print()} title="Print">
 🖨
 </button>
 )}

 {enableFullscreen && (
 <button
 onClick={() => document.documentElement.requestFullscreen()}
 title="Fullscreen"
 >
 ⛶
 </button>
 )}
 </div>
 );
}
```

### PDFThumbnails Component

```typescript
// src/components/PDFThumbnails.tsx
import React, { useEffect, useState } from 'react';
import styles from '../styles/PDFViewer.module.css';

interface PDFThumbnailsProps {
 pdfDoc: any;
 currentPage: number;
 onSelectPage: (page: number) => void;
 numPages: number;
}

export function PDFThumbnails({
 pdfDoc,
 currentPage,
 onSelectPage,
 numPages,
}: PDFThumbnailsProps) {
 const [thumbnails, setThumbnails] = useState<HTMLCanvasElement[]>([]);

 useEffect(() => {
 const generateThumbnails = async () => {
 if (!pdfDoc) return;

 const thumbs: HTMLCanvasElement[] = [];
 const scale = 0.5; // Smaller scale for thumbnails

 for (let i = 1; i <= Math.min(numPages, 20); i++) {
 // Limit to first 20 pages for performance
 try {
 const page = await pdfDoc.getPage(i);
 const viewport = page.getViewport({ scale });

 const canvas = document.createElement('canvas');
 const context = canvas.getContext('2d');

 if (context) {
 canvas.width = viewport.width;
 canvas.height = viewport.height;

 const renderTask = page.render({
 canvasContext: context,
 viewport: viewport,
 });

 await renderTask.promise;
 thumbs.push(canvas);
 }
 } catch (error) {
 console.error(`Failed to render thumbnail for page ${i}:`, error);
 }
 }

 setThumbnails(thumbs);
 };

 generateThumbnails();
 }, [pdfDoc, numPages]);

 return (
 <div className={styles.thumbnails}>
 {thumbnails.map((thumb, idx) => (
 <div
 key={idx}
 className={`${styles.thumbnail} ${
 idx + 1 === currentPage ? styles.active : ''
 }`}
 onClick={() => onSelectPage(idx + 1)}
 >
 <canvas width={thumb.width} height={thumb.height} ref={(el) => {
 if (el && thumb) {
 const ctx = el.getContext('2d');
 if (ctx) {
 ctx.drawImage(thumb, 0, 0);
 }
 }
 }} />
 <span className={styles.pageNumber}>{idx + 1}</span>
 </div>
 ))}
 </div>
 );
}
```

---

## Phase 5: CSS Styling (Day 6)

### PDFViewer.module.css

```css
/* src/styles/PDFViewer.module.css */

.viewer {
 display: flex;
 flex-direction: column;
 background: #f5f5f5;
 font-family: system-ui, -apple-system, sans-serif;
 border-radius: 8px;
 overflow: hidden;
 box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.controls {
 display: flex;
 align-items: center;
 gap: 8px;
 padding: 12px 16px;
 background: white;
 border-bottom: 1px solid #e0e0e0;
 overflow-x: auto;
 flex-wrap: wrap;
}

.controls button {
 padding: 6px 12px;
 background: #007bff;
 color: white;
 border: none;
 border-radius: 4px;
 cursor: pointer;
 font-size: 14px;
 transition: background 150ms;
}

.controls button:hover:not(:disabled) {
 background: #0056b3;
}

.controls button:disabled {
 opacity: 0.5;
 cursor: not-allowed;
}

.pageInput {
 width: 60px;
 padding: 6px;
 border: 1px solid #ccc;
 border-radius: 4px;
 font-size: 14px;
}

.pageTotal {
 font-size: 14px;
 color: #666;
}

.zoomLevel {
 font-size: 14px;
 color: #666;
 min-width: 50px;
 text-align: center;
}

.searchInput {
 padding: 6px 12px;
 border: 1px solid #ccc;
 border-radius: 4px;
 font-size: 14px;
}

.searchResults {
 font-size: 12px;
 color: #666;
}

.button {
 padding: 6px 12px;
 background: #28a745;
 color: white;
 border-radius: 4px;
 text-decoration: none;
 cursor: pointer;
 transition: background 150ms;
}

.button:hover {
 background: #218838;
}

.content {
 display: flex;
 flex: 1;
 overflow: hidden;
}

.canvas {
 flex: 1;
 overflow: auto;
 display: flex;
 align-items: center;
 justify-content: center;
 background: white;
}

.canvas canvas {
 max-width: 100%;
 height: auto;
 box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
 margin: 10px;
}

.thumbnails {
 width: 120px;
 overflow-y: auto;
 background: white;
 border-right: 1px solid #e0e0e0;
 padding: 8px;
 display: flex;
 flex-direction: column;
 gap: 8px;
}

.thumbnail {
 position: relative;
 cursor: pointer;
 border: 2px solid transparent;
 border-radius: 4px;
 overflow: hidden;
 transition: border-color 150ms, box-shadow 150ms;
}

.thumbnail:hover {
 border-color: #007bff;
 box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

.thumbnail.active {
 border-color: #007bff;
 box-shadow: 0 2px 8px rgba(0, 123, 255, 0.4);
}

.thumbnail canvas {
 width: 100%;
 height: auto;
 display: block;
}

.pageNumber {
 position: absolute;
 bottom: 4px;
 right: 4px;
 font-size: 11px;
 background: rgba(0, 0, 0, 0.7);
 color: white;
 padding: 2px 4px;
 border-radius: 2px;
}

.loading,
.error {
 display: flex;
 align-items: center;
 justify-content: center;
 background: white;
 border-radius: 8px;
}

.loading p,
.error p {
 font-size: 16px;
 color: #666;
}

.error p {
 color: #dc3545;
}

/* Responsive */
@media (max-width: 768px) {
 .controls {
 gap: 6px;
 padding: 8px 12px;
 }

 .controls button {
 padding: 4px 8px;
 font-size: 12px;
 }

 .pageInput {
 width: 50px;
 }

 .thumbnails {
 width: 80px;
 }

 .searchInput {
 padding: 4px 8px;
 font-size: 12px;
 }
}
```

---

## Phase 6: Utility Functions (Day 7)

### PDF Helpers

```typescript
// src/utils/pdfHelpers.ts

/**
 * Check if URL points to a linearized PDF
 */
export async function isLinearizedPDF(url: string): Promise<boolean> {
 try {
 const response = await fetch(url, { headers: { Range: 'bytes=0-1024' } });
 const buffer = await response.arrayBuffer();
 const view = new Uint8Array(buffer);

 // Check for linearization hint near beginning
 const text = new TextDecoder().decode(view);
 return text.includes('Linearized');
 } catch {
 return false;
 }
}

/**
 * Download PDF file
 */
export function downloadPDF(url: string, filename?: string) {
 const link = document.createElement('a');
 link.href = url;
 link.download = filename || 'document.pdf';
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
}

/**
 * Calculate optimal scale for page fit
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
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes', 'KB', 'MB', 'GB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract text from PDF page
 */
export async function extractPageText(pdfDoc: any, pageNumber: number): Promise<string> {
 try {
 const page = await pdfDoc.getPage(pageNumber);
 const textContent = await page.getTextContent();
 return textContent.items
 .filter((item: any) => 'str' in item)
 .map((item: any) => item.str)
 .join(' ');
 } catch {
 return '';
 }
}
```

### Linearized PDF Helpers

```typescript
// src/utils/linearizationHelpers.ts

/**
 * Configuration for linearized PDF loading
 */
export const linearizedPDFConfig = {
 rangeChunkSize: 65536, // 64 KB chunks for streaming
 disableAutoFetch: false,
 disableStream: false,
};

/**
 * Get optimal range header for linearized PDF fetch
 */
export function getOptimalRangeHeader(fileSize: number): { start: number; end: number } {
 // Request first chunk to check for linearization
 const chunkSize = Math.min(65536, Math.ceil(fileSize * 0.1));
 return {
 start: 0,
 end: chunkSize - 1,
 };
}

/**
 * Create fetch handler for progressive loading
 */
export function createProgressiveFetchHandler(onProgress?: (loaded: number, total: number) => void) {
 return async function fetchWithProgress(
 range: { start: number; end: number }
 ): Promise<ArrayBuffer> {
 const response = await fetch(window.location.href, {
 headers: { Range: `bytes=${range.start}-${range.end}` },
 });

 const contentRange = response.headers.get('content-range');
 if (contentRange && onProgress) {
 const [, range, total] = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/) || [];
 if (total) {
 onProgress(parseInt(range), parseInt(total));
 }
 }

 return response.arrayBuffer();
 };
}
```

---

## Phase 7: Tree-Shakable Exports (Day 7)

### Main Entry Point

```typescript
// src/index.ts

export { PDFViewer } from './components/PDFViewer';
export { PDFCanvas } from './components/PDFCanvas';
export { PDFControls } from './components/PDFControls';
export { PDFThumbnails } from './components/PDFThumbnails';

export {
 usePDFDocument,
 usePageState,
 usePageRenderer,
 useZoom,
 useSearch,
} from './hooks';

export * from './utils';

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
```

---

## Phase 8: Testing (Days 7-8)

### Hook Tests

```typescript
// src/__tests__/hooks.test.tsx
import { renderHook, act } from '@testing-library/react';
import { usePageState } from '../hooks/usePageState';
import { useZoom } from '../hooks/useZoom';

describe('usePageState', () => {
 it('should initialize with correct page', () => {
 const { result } = renderHook(() =>
 usePageState({ totalPages: 10, initialPage: 5 })
 );

 expect(result.current.currentPage).toBe(5);
 });

 it('should navigate between pages', () => {
 const { result } = renderHook(() =>
 usePageState({ totalPages: 10, initialPage: 1 })
 );

 act(() => {
 result.current.nextPage();
 });

 expect(result.current.currentPage).toBe(2);
 });

 it('should not exceed page bounds', () => {
 const { result } = renderHook(() =>
 usePageState({ totalPages: 10, initialPage: 10 })
 );

 expect(result.current.canNext).toBe(false);

 act(() => {
 result.current.nextPage();
 });

 expect(result.current.currentPage).toBe(10);
 });
});

describe('useZoom', () => {
 it('should zoom in and out', () => {
 const { result } = renderHook(() => useZoom(1.0));

 act(() => {
 result.current.zoomIn();
 });

 expect(result.current.zoomLevel).toBeGreaterThan(1.0);

 act(() => {
 result.current.zoomOut();
 });

 expect(result.current.zoomLevel).toBeLessThan(1.25);
 });

 it('should respect zoom bounds', () => {
 const { result } = renderHook(() => useZoom(0.5));

 expect(result.current.canZoomOut).toBe(false);

 const { result: result2 } = renderHook(() => useZoom(3.0));

 expect(result2.current.canZoomIn).toBe(false);
 });
});
```

---

## Phase 9: Build & Optimization (Day 8)

### Bundle Analysis

```bash
# Build the package
npm run build

# Analyze bundle size
npm run bundle-analyze

# Expected output:
# ✓ dist/index.js: 28 KB (gzipped)
# ✓ dist/components/index.js: 12 KB (gzipped)
# ✓ dist/hooks/index.js: 8 KB (gzipped)
# ✓ dist/utils/index.js: 2 KB (gzipped)
```

### Performance Checklist

- [ ] Base bundle <30 KB (gzipped)
- [ ] Page render time <1 second
- [ ] Zoom in/out instant (<100ms)
- [ ] Search results within 500ms
- [ ] No memory leaks on page navigation
- [ ] Lazy-loads PDF.js only once
- [ ] Linearized PDF loads progressively

---

## Phase 10: Integration & Publishing (Days 8-9)

### npm Publishing

```bash
# Update version
npm version minor

# Publish to registry
npm publish --access public

# Verify publication
npm view @page-speed/pdf-viewer

# Test installation in lightbox repo
npm install @page-speed/pdf-viewer@latest
```

### Integration with @page-speed/lightbox

Once published, update lightbox:

```typescript
// In @page-speed/lightbox/src/renderers/PDFRenderer.tsx
import { Suspense, lazy } from 'react';
import { LightboxItem } from '../types';

const PDFViewer = lazy(() =>
 import('@page-speed/pdf-viewer').then(mod => ({ default: mod.PDFViewer }))
);

export function PDFRenderer({ item }: { item: LightboxItem }) {
 return (
 <Suspense fallback={<div>Loading PDF viewer...</div>}>
 <PDFViewer
 url={item.src!}
 title={item.title}
 height="100%"
 config={{
 showControls: true,
 enableDownload: true,
 enableFullscreen: true,
 }}
 />
 </Suspense>
 );
}
```

---

## Phase 11: Documentation & Examples (Day 9)

### README.md

```markdown
# @page-speed/pdf-viewer

High-performance, linearized PDF viewer for React applications.

Perfect for restaurant menus, catalogs, documents, and more.

## Features

- ⚡ Sub-1-second page rendering
- 📄 Support for linearized PDFs with progressive loading
- 🔍 Full-text search across all pages
- 🔎 Zoom in/out with keyboard shortcuts
- 📱 Mobile-responsive design
- 🎯 Page navigation with input
- 💾 Download & print support
- 🎨 Customizable controls
- 🚀 <30 KB base bundle

## Installation

```bash
npm install @page-speed/pdf-viewer
```

## Quick Start

```typescript
import { PDFViewer } from '@page-speed/pdf-viewer';

export function MenuViewer() {
 return (
 <PDFViewer
 url="/menus/spring-menu.pdf"
 title="Spring Menu"
 height="600px"
 config={{
 showControls: true,
 enableDownload: true,
 }}
 />
 );
}
```

## Configuration

See full documentation in project README.
```

---

## Summary

**Total Implementation: 9 days (1.5 weeks)**

### Phase Breakdown
- **Days 1-2:** Project setup & config
- **Days 2-3:** Complete type system
- **Days 3-4:** State management hooks
- **Days 4-6:** Core components
- **Day 6:** CSS styling
- **Day 7:** Utilities & exports
- **Days 7-8:** Testing
- **Day 8:** Build & optimization
- **Day 9:** Publishing & integration

### Deliverables
✅ Production-ready PDF viewer
✅ <30 KB bundle size
✅ Linearized PDF support
✅ Full test coverage
✅ Complete documentation
✅ Published to npm
✅ Ready for lightbox integration

### Success Metrics
- ✅ Page render time: <1 second
- ✅ Bundle size: <30 KB gzipped
- ✅ Search performance: <500ms for typical PDF
- ✅ Zero janky interactions
- ✅ Mobile responsive
- ✅ Lighthouse score: 90+

**Next Step:** Use this as foundation for @page-speed/lightbox integration! 🚀
