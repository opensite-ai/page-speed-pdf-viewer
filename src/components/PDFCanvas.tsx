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

