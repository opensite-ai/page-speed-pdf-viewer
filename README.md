![Page Speed React PDF Viewer](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/286337/h3vwbeyh65fdlkwlsda1lagvadov/github.png&q=90)

# 📑 @page-speed/pdf-viewer

High-performance, linearized PDF viewer for React applications.

## Features

- ⚡ Sub-1-second page rendering
- 📄 Support for linearized PDFs with progressive loading
- 🔍 Full-text search across all pages
- 🔎 Zoom in/out with keyboard shortcuts
- 📱 Mobile-responsive design
- 🎯 Page navigation with input
- 💾 Download & print support
- 🎨 Customizable controls
- 🚀 <30 KB base bundle (target)

![Fastest React PDF Viewer Library](https://cdn.ing/assets/i/r/286340/0sc8eh9dfjvzudvn26e6ca94uhnm/react-page-speed-lightbox-7xs.gif)

## Installation

You can install the package with any Node package manager:

```bash
npm install @page-speed/pdf-viewer
# or
pnpm add @page-speed/pdf-viewer
# or
yarn add @page-speed/pdf-viewer
```

## Quick Start

```tsx
import { PDFViewer } from '@page-speed/pdf-viewer';

export function MenuViewer() {
  return (
    <PDFViewer
      url="/menus/spring-menu.pdf"
      title="Spring Menu"
      height="600px"
      config={{
        showControls: true,
        enableDownload: true,
      }}
    />
  );
}
```

## Configuration

`PDFViewer` accepts the following key props:

- `url: string` – PDF URL or file path (required)
- `title?: string` – optional document title
- `height?: string | number` – container height (default `600px`)
- `width?: string | number` – container width (default `100%`)
- `config?: Partial<PDFViewerConfig>` – viewer configuration options

`PDFViewerConfig` includes:

- `initialPage?: number`
- `initialZoom?: number | 'auto' | 'page-fit' | 'page-width'`
- `textSelection?: boolean`
- `search?: boolean`
- `showControls?: boolean`
- `showThumbnails?: boolean`
- `enableDownload?: boolean`
- `enablePrint?: boolean`
- `enableFullscreen?: boolean`
- `workerUrl?: string`
- `cacheSize?: number`
- `progressiveLoading?: boolean`

## Hooks & Utilities

In addition to the main `PDFViewer` component, this package exposes:

- Hooks
  - `usePDFDocument`
  - `usePageState`
  - `usePageRenderer`
  - `useZoom`
  - `useSearch`
- Components
  - `PDFCanvas`
  - `PDFControls`
  - `PDFThumbnails`
- Utilities
  - `isLinearizedPDF`
  - `downloadPDF`
  - `calculateScaleForPageFit`
  - `formatFileSize`
  - `extractPageText`
  - `linearizedPDFConfig`
  - `getOptimalRangeHeader`
  - `createProgressiveFetchHandler`

## License

MIT

