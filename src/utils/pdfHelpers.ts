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
 * Download PDF file
 */
export function downloadPDF(url: string, filename?: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || 'document.pdf';
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

