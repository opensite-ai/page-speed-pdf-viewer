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

