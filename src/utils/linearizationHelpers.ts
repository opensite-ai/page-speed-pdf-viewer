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
export function createProgressiveFetchHandler(
  onProgress?: (loaded: number, total: number) => void
) {
  return async function fetchWithProgress(
    range: { start: number; end: number }
  ): Promise<ArrayBuffer> {
    const response = await fetch(window.location.href, {
      headers: { Range: `bytes=${range.start}-${range.end}` },
    });

    const contentRange = response.headers.get('content-range');
    if (contentRange && onProgress) {
      const match = contentRange.match(/bytes (\d+)-(\d+)\/(\d+)/);
      if (match) {
        const loaded = parseInt(match[2], 10) + 1; // end is inclusive
        const total = parseInt(match[3], 10);
        onProgress(loaded, total);
      }
    }

    return response.arrayBuffer();
  };
}

