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

