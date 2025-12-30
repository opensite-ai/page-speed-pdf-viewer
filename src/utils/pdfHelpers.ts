/**
 * Check if URL points to a linearized PDF
 */
export async function isLinearizedPDF(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { headers: { Range: 'bytes=0-1024' } });
    const buffer = await response.arrayBuffer();
    const view = new Uint8Array(buffer);

    // Check for linearization hint near beginning
    const text = new TextDecoder().decode(view);
    return text.includes('Linearized');
  } catch {
    return false;
  }
}

/**
 * Extract filename from URL, ensuring it has a .pdf extension
 */
export function extractPDFFilename(url: string, fallbackName?: string): string {
  try {
    const urlObj = new URL(url, window.location.origin);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1] || '';
    
    // If the URL has a filename with extension
    if (lastSegment && lastSegment.includes('.')) {
      // If it already ends with .pdf, use it as-is
      if (lastSegment.toLowerCase().endsWith('.pdf')) {
        return lastSegment;
      }
      // Otherwise, replace the extension with .pdf
      const nameWithoutExt = lastSegment.substring(0, lastSegment.lastIndexOf('.'));
      return `${nameWithoutExt}.pdf`;
    }
    
    // If no extension in URL, use the last segment or fallback with .pdf
    if (lastSegment) {
      return `${lastSegment}.pdf`;
    }
  } catch {
    // URL parsing failed, use fallback
  }
  
  // Use fallback name, ensuring .pdf extension
  const name = fallbackName || 'document';
  return name.toLowerCase().endsWith('.pdf') ? name : `${name}.pdf`;
}

/**
 * Download PDF file
 */
export function downloadPDF(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || extractPDFFilename(url);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Calculate optimal scale for page fit
 */
export function calculateScaleForPageFit(
  pageWidth: number,
  pageHeight: number,
  containerWidth: number,
  containerHeight: number
): number {
  const widthRatio = containerWidth / pageWidth;
  const heightRatio = containerHeight / pageHeight;
  return Math.min(widthRatio, heightRatio);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract text from PDF page
 */
export async function extractPageText(pdfDoc: any, pageNumber: number): Promise<string> {
  try {
    const page = await pdfDoc.getPage(pageNumber);
    const textContent = await page.getTextContent();
    return textContent.items
      .filter((item: any) => 'str' in item)
      .map((item: any) => item.str)
      .join(' ');
  } catch {
    return '';
  }
}

