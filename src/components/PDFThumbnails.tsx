import React, { useEffect, useState } from 'react';
import { pdfViewerStyles as styles } from '../styles/injectStyles';

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
          />
          <span className={styles.pageNumber}>{idx + 1}</span>
        </div>
      ))}
    </div>
  );
}

