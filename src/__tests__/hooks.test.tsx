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

