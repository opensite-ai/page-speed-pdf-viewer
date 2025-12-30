import React from 'react';
import { PDFDocument } from '../types';
import { downloadPDF } from '../utils/pdfHelpers';
import { cn } from '../lib/utils';

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

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const MinusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
    <rect x="6" y="14" width="12" height="8"/>
  </svg>
);

const FullscreenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
  </svg>
);

const IconButton = ({
  onClick,
  disabled,
  title,
  children,
  className,
}: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      "inline-flex items-center justify-center",
      "h-8 w-8 rounded-md",
      "bg-secondary text-secondary-foreground",
      "hover:bg-secondary/80",
      "transition-colors duration-150",
      "disabled:opacity-50 disabled:pointer-events-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
  >
    {children}
  </button>
);

const ActionButton = ({
  onClick,
  title,
  children,
  className,
}: {
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={cn(
      "inline-flex items-center justify-center gap-1.5",
      "h-8 px-3 rounded-md",
      "bg-primary text-primary-foreground",
      "hover:bg-primary/90",
      "text-sm font-medium",
      "transition-colors duration-150",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
  >
    {children}
  </button>
);

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
    <div 
      className={cn(
        "flex items-center gap-2",
        "px-3 py-2",
        "bg-background border-b border-border",
        "overflow-x-auto flex-wrap",
        "flex-shrink-0 z-10"
      )}
      data-pdf-viewer="controls"
    >
      {/* Navigation */}
      <div className="flex items-center gap-1">
        <IconButton
          onClick={pageState.prevPage}
          disabled={!pageState.canPrev}
          title="Previous page"
        >
          <ChevronLeftIcon />
        </IconButton>

        <input
          type="number"
          min="1"
          max={pdfDocument.numPages}
          value={pageState.currentPage}
          onChange={(e) => pageState.goToPage(parseInt(e.target.value, 10) || 1)}
          className={cn(
            "w-14 h-8 px-2",
            "text-center text-sm font-medium",
            "bg-background border border-input rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring"
          )}
        />

        <span className="text-sm text-muted-foreground whitespace-nowrap">
          of {pdfDocument.numPages}
        </span>

        <IconButton
          onClick={pageState.nextPage}
          disabled={!pageState.canNext}
          title="Next page"
        >
          <ChevronRightIcon />
        </IconButton>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Zoom */}
      <div className="flex items-center gap-1">
        <IconButton
          onClick={zoom.zoomOut}
          disabled={!zoom.canZoomOut}
          title="Zoom out"
        >
          <MinusIcon />
        </IconButton>

        <span className="text-sm font-medium text-foreground min-w-[3.5rem] text-center">
          {Math.round(zoom.zoomLevel * 100)}%
        </span>

        <IconButton
          onClick={zoom.zoomIn}
          disabled={!zoom.canZoomIn}
          title="Zoom in"
        >
          <PlusIcon />
        </IconButton>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-border mx-1" />

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={search.query}
            onChange={(e) => search.search(e.target.value)}
            className={cn(
              "h-8 pl-8 pr-3 w-32",
              "text-sm",
              "bg-background border border-input rounded-md",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            <SearchIcon />
          </div>
        </div>

        {search.results.length > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {search.results.length} results
          </span>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {enableDownload && (
          <ActionButton
            onClick={() => downloadPDF(url)}
            title="Download"
          >
            <DownloadIcon />
            <span>Download</span>
          </ActionButton>
        )}

        {enablePrint && (
          <ActionButton
            onClick={() => window.print()}
            title="Print"
          >
            <PrintIcon />
            <span>Print</span>
          </ActionButton>
        )}

        {enableFullscreen && typeof document !== 'undefined' && (
          <IconButton
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement?.requestFullscreen();
              }
            }}
            title="Fullscreen"
          >
            <FullscreenIcon />
          </IconButton>
        )}
      </div>
    </div>
  );
}

