import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';

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
    <div 
      className={cn(
        "w-32 flex-shrink-0",
        "overflow-y-auto",
        "bg-muted/50 border-r border-border",
        "p-2 space-y-2"
      )}
      data-pdf-viewer="thumbnails"
    >
      {thumbnails.map((thumb, idx) => (
        <div
          key={idx}
          className={cn(
            "cursor-pointer rounded-md overflow-hidden",
            "border-2 transition-colors duration-150",
            idx + 1 === currentPage 
              ? "border-primary ring-2 ring-primary/20" 
              : "border-transparent hover:border-muted-foreground/30"
          )}
          onClick={() => onSelectPage(idx + 1)}
          data-pdf-viewer="thumbnail"
          data-active={idx + 1 === currentPage}
        >
          <canvas
            width={thumb.width}
            height={thumb.height}
            ref={(el) => {
              if (el && thumb) {
                const ctx = el.getContext('2d');
                if (ctx) {
                  ctx.drawImage(thumb, 0, 0);
                }
              }
            }}
            className="w-full h-auto"
          />
          <span className={cn(
            "block text-center text-xs py-1",
            "text-muted-foreground",
            idx + 1 === currentPage && "text-primary font-medium"
          )}>
            {idx + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

