import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

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
        
        // Apply contain-like styling to the canvas so it fits within the container
        // without being cropped. This ensures the full page is visible.
        renderedCanvas.style.maxWidth = '100%';
        renderedCanvas.style.maxHeight = '100%';
        renderedCanvas.style.width = 'auto';
        renderedCanvas.style.height = 'auto';
        renderedCanvas.style.objectFit = 'contain';
        
        containerRef.current.appendChild(renderedCanvas);
        setCanvas(renderedCanvas);
      }
    };

    if (pdfDoc) {
      render();
    }
  }, [pdfDoc, pageNumber, scale, onRender]);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "flex-1 overflow-auto",
        "flex items-center justify-center",
        "p-4 min-h-0"
      )}
      data-pdf-viewer="canvas"
    />
  );
}

