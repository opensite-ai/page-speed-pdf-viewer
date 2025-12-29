import { useRef, useState, useCallback } from 'react';
import { CacheEntry, PageInfo } from '../types';

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
            curr[1].timestamp < prev[1].timestamp ? curr : prev
          );
          cacheRef.current.delete(oldest[0]);
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

