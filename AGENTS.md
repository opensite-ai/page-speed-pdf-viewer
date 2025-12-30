# AGENTS.md

## Quick Reference

This is a **React + TypeScript NPM package** that provides a high-performance PDF viewer optimized for linearized PDFs.

| Area | Value |
|------|-------|
| Package manager | `pnpm` |
| Build tool | `esbuild` + `tsc` (declarations only) |
| Test runner | `jest` with `jsdom` |
| React version | 18+ (peer dependency) |
| Key dependency | `pdfjs-dist` ^3.11.174 |
| Module format | ESM primary, CJS fallback |

---

## Commands

```bash
# Build entire package (declarations + ESM + CJS + server-stub)
pnpm run build

# Type-check only (fast, no emit)
pnpm run type-check

# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage

# Analyze bundle size
pnpm run bundle-analyze
```

### File-Scoped Commands (Preferred for Speed)

```bash
# Type-check single file
npx tsc --noEmit src/path/to/file.ts

# Run specific test file
npx jest src/__tests__/hooks.test.tsx
```

---

## Architecture Overview

```
src/
├── index.ts              # Main client-side entry ("use client" directive)
├── server-stub.ts        # Server-side stub for SSR/RSC (throws errors)
├── types.ts              # All TypeScript interfaces/types
├── styles.d.ts           # CSS module type declarations
├── components/
│   ├── index.ts          # Component barrel export
│   ├── PDFViewer.tsx     # Main orchestrating component
│   ├── PDFCanvas.tsx     # Renders PDF pages to canvas
│   ├── PDFControls.tsx   # Navigation, zoom, search, actions
│   └── PDFThumbnails.tsx # Sidebar page thumbnails
├── hooks/
│   ├── index.ts          # Hook barrel export
│   ├── usePDFDocument.ts # Loads PDF via pdfjs-dist (dynamic import)
│   ├── usePageState.ts   # Page navigation state machine
│   ├── usePageRenderer.ts # Canvas rendering with LRU cache
│   ├── useZoom.ts        # Zoom level and mode management
│   └── useSearch.ts      # Full-text search across pages
├── utils/
│   ├── index.ts          # Utility barrel export
│   ├── pdfHelpers.ts     # isLinearizedPDF, downloadPDF, extractPageText
│   └── linearizationHelpers.ts # Progressive loading utilities
├── styles/
│   └── PDFViewer.module.css  # Component styles
└── __tests__/
    └── hooks.test.tsx    # Hook unit tests
```

---

## Do

- Use **TypeScript strict mode** - all code must pass `tsc --noEmit`
- Use **functional components** with hooks - never class components
- Use **CSS Modules** for styling - import from `../styles/PDFViewer.module.css`
- Use **pdfjs-dist types** carefully - many are `any` due to incomplete typings
- Use **dynamic imports** for pdfjs-dist in hooks to avoid SSR bundling issues
- Use **barrel exports** (`index.ts`) in each folder - do not add default exports
- Use **descriptive callback names**: `onDocumentLoad`, `onPageChange`, `onError`
- Keep components **small and focused** - PDFCanvas renders, PDFControls handles UI
- Write **unit tests** for new hooks in `src/__tests__/`
- Run `pnpm test` and `pnpm run type-check` before committing
- Use `useCallback` for functions passed to child components or effects
- Use `useRef` for values that persist across renders but don't trigger re-renders

## Don't

- Don't import `pdfjs-dist` at module top-level in client code - use dynamic `import()`
- Don't use inline styles except via the `style` prop pattern in PDFViewerProps
- Don't hard-code colors - use CSS Module classes or design tokens
- Don't use `div` when semantic elements or existing components fit better
- Don't add dependencies without explicit approval - bundle size is critical (<30KB target)
- Don't create new files without updating the barrel `index.ts` in that folder
- Don't modify `server-stub.ts` exports without mirroring them in `index.ts`
- Don't use `require()` - this is an ESM-first package
- Don't skip the `"use client"` directive in files that use React hooks

---

## Critical Patterns

### Server-Side Rendering (SSR) Handling

This package uses **conditional exports** in `package.json` to provide different code for server vs client:

```json
"exports": {
  ".": {
    "react-server": "./dist/server-stub.js",  // RSC/Node gets stubs
    "import": "./dist/index.js"                // Browser gets real code
  }
}
```

**Why this matters:**
- `pdfjs-dist` has an optional `canvas` dependency that breaks server builds
- `server-stub.ts` exports function stubs that throw helpful error messages
- Any new export in `index.ts` MUST have a corresponding stub in `server-stub.ts`

### Dynamic Import Pattern for pdfjs-dist

```typescript
// ✅ Correct - dynamic import avoids bundling canvas on server
const loadPDF = async () => {
  const pdfjsLib = await import('pdfjs-dist');
  // ...use pdfjsLib
};

// ❌ Wrong - static import breaks SSR builds
import * as pdfjsLib from 'pdfjs-dist';
```

### Hook Return Type Pattern

All hooks return an object (not a tuple) for named destructuring:

```typescript
// ✅ Correct
const { document, loading, error } = usePDFDocument(url);

// ❌ Wrong - avoid tuple patterns for complex hooks
const [document, loading, error] = usePDFDocument(url);
```

### Caching Pattern (usePageRenderer)

The page renderer uses an LRU-style cache keyed by `${pageNumber}-${scale}-${rotation}`:

```typescript
const cacheKey = `${pageNumber}-${scale}-${rotation}`;
const cached = cacheRef.current.get(cacheKey);
if (cached) return cached.canvas;
```

When modifying cache logic, ensure:
1. Cache size limits are respected (currently 50MB)
2. Oldest entries are evicted first
3. Canvas memory is properly estimated (width × height × 4 bytes)

---

## Type Definitions Reference

Key interfaces live in `src/types.ts`:

| Interface | Purpose |
|-----------|---------|
| `PDFViewerConfig` | Configuration options for the viewer |
| `PDFViewerProps` | Props for the main PDFViewer component |
| `PDFDocument` | Loaded document metadata |
| `PDFMetadata` | Author, title, creation date, etc. |
| `PageInfo` | Current page rendering state |
| `SearchResult` | Search match with page and position |
| `CacheEntry` | Rendered canvas with timestamp |
| `RenderTask` | Page render queue item |

When adding new features:
1. Add types to `types.ts`
2. Export from `types.ts`
3. Add to `index.ts` type exports
4. Add stub export to `server-stub.ts`

---

## Testing Guidelines

### Running Tests

```bash
# All tests
pnpm test

# Single test file
npx jest src/__tests__/hooks.test.tsx

# Watch mode for development
pnpm run test:watch

# With coverage
pnpm run test:coverage
```

### Test Structure

Tests use **@testing-library/react** with **renderHook** for hooks:

```typescript
import { renderHook, act } from '@testing-library/react';
import { usePageState } from '../hooks/usePageState';

describe('usePageState', () => {
  it('should navigate between pages', () => {
    const { result } = renderHook(() =>
      usePageState({ totalPages: 10, initialPage: 1 })
    );

    act(() => {
      result.current.nextPage();
    });

    expect(result.current.currentPage).toBe(2);
  });
});
```

### Mocking

- CSS modules are mocked via `test/__mocks__/styleMock.js`
- For pdfjs-dist, mock at the import level in test files
- Use `jest.mock()` for dependencies, not inline mocks

### Test Coverage Expectations

- All hooks should have unit tests
- Test edge cases: empty states, boundary conditions, error states
- Don't test implementation details - test behavior

---

## Common Gotchas

### 1. Canvas Context Null Check

Always check for canvas context before rendering:

```typescript
const context = canvas.getContext('2d');
if (!context) throw new Error('Failed to get canvas context');
```

### 2. PDF.js Worker Setup

The worker URL must be set once globally, tracked via a ref:

```typescript
const pdfjsInitialized = useRef(false);
if (!pdfjsInitialized.current) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  pdfjsInitialized.current = true;
}
```

### 3. Page Numbers are 1-indexed

PDF.js uses 1-indexed pages. Always validate:

```typescript
const validPage = Math.max(1, Math.min(page, totalPages));
```

### 4. Viewport and Scale

PDF.js viewports are scaled from the PDF's internal units:

```typescript
const viewport = page.getViewport({ scale: 1.5, rotation: 0 });
// viewport.width and viewport.height are in CSS pixels
```

### 5. Text Content Item Types

When extracting text, check for `str` property:

```typescript
for (const item of textContent.items) {
  if ('str' in item && item.str.includes(searchText)) {
    // Process text item
  }
}
```

---

## Build System Details

### esbuild Configuration

The build uses esbuild for speed with these key settings:

| Setting | Value | Why |
|---------|-------|-----|
| `--platform=browser` | Browser target | Uses browser globals |
| `--format=esm` | ESM output | Modern bundlers prefer ESM |
| `--external:pdfjs-dist` | Not bundled | Consumers provide it |
| `--external:react` | Not bundled | Peer dependency |
| `--bundle` | Single file output | Tree-shakeable |

### TypeScript Configuration

Key `tsconfig.json` settings:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

---

## When Stuck

1. **Ask a clarifying question** before making large speculative changes
2. **Propose a plan** in a short bullet list before implementation
3. **Check existing patterns** - search for similar code in the codebase first
4. **Run type-check often** - `pnpm run type-check` catches issues early
5. **Don't break SSR** - test changes don't break the server-stub contract

---

## Pull Request Checklist

Before committing or opening a PR:

- [ ] `pnpm run type-check` passes
- [ ] `pnpm test` passes
- [ ] New hooks have tests in `src/__tests__/`
- [ ] New exports are added to barrel `index.ts` files
- [ ] New client exports have server-stub equivalents
- [ ] Bundle size hasn't grown significantly (run `pnpm run bundle-analyze`)
- [ ] Diff is small and focused - one feature/fix per PR
- [ ] No console.log statements (except error handlers)

---

## Example Patterns

### Adding a New Hook

1. Create `src/hooks/useNewHook.ts`
2. Export from `src/hooks/index.ts`
3. Add to `src/index.ts` exports
4. Add stub to `src/server-stub.ts`
5. Create tests in `src/__tests__/`

### Adding a New Utility

1. Add to appropriate file in `src/utils/`
2. Export from `src/utils/index.ts`
3. Add to `src/index.ts` via `export * from './utils'`
4. Add stub to `src/server-stub.ts` if it uses browser APIs

### Adding a New Component

1. Create `src/components/NewComponent.tsx`
2. Export from `src/components/index.ts`
3. Add to `src/index.ts` exports
4. Add stub to `src/server-stub.ts`
5. Add styles to `src/styles/PDFViewer.module.css` or create new CSS module

---

## Constants and Magic Numbers

| Constant | Location | Value | Purpose |
|----------|----------|-------|---------|
| `DEFAULT_SCALE` | usePageRenderer.ts | 1.5 | Default zoom level |
| `CACHE_SIZE` | usePageRenderer.ts | 50 * 1024 * 1024 | Max canvas cache (50MB) |
| `MIN_ZOOM` | useZoom.ts | 0.5 | Minimum zoom (50%) |
| `MAX_ZOOM` | useZoom.ts | 3.0 | Maximum zoom (300%) |
| `ZOOM_STEP` | useZoom.ts | 0.25 | Zoom increment (25%) |
| `rangeChunkSize` | linearizationHelpers.ts | 65536 | 64KB chunks for streaming |
| `thumbnailScale` | PDFThumbnails.tsx | 0.5 | Thumbnail render scale |
| `maxThumbnails` | PDFThumbnails.tsx | 20 | Max thumbnails for perf |

---

## Dependencies

### Runtime Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `pdfjs-dist` | ^3.11.174 | PDF parsing and rendering |

### Peer Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.0.0 | UI framework |
| `react-dom` | ^18.0.0 | DOM rendering |

### Dev Dependencies (Don't modify without approval)

| Package | Purpose |
|---------|---------|
| `esbuild` | Fast bundling |
| `typescript` | Type checking |
| `jest` | Test runner |
| `ts-jest` | TypeScript Jest support |
| `jest-environment-jsdom` | DOM simulation |
| `@testing-library/react` | Component/hook testing |

---

## File Purpose Quick Reference

| File | One-line Purpose |
|------|------------------|
| `src/index.ts` | Client entry - exports everything with "use client" |
| `src/server-stub.ts` | SSR entry - safe stubs that throw helpful errors |
| `src/types.ts` | All TypeScript interfaces |
| `src/components/PDFViewer.tsx` | Main component orchestrating all sub-components |
| `src/components/PDFCanvas.tsx` | Renders current page to canvas element |
| `src/components/PDFControls.tsx` | Toolbar with navigation, zoom, search, actions |
| `src/components/PDFThumbnails.tsx` | Sidebar thumbnail strip |
| `src/hooks/usePDFDocument.ts` | Loads PDF, extracts metadata |
| `src/hooks/usePageState.ts` | Current page, navigation methods |
| `src/hooks/usePageRenderer.ts` | Renders pages with caching |
| `src/hooks/useZoom.ts` | Zoom level and mode state |
| `src/hooks/useSearch.ts` | Full-text search across pages |
| `src/utils/pdfHelpers.ts` | Utility functions for PDF operations |
| `src/utils/linearizationHelpers.ts` | Progressive loading config |
| `jest.config.cjs` | Test configuration |
| `tsconfig.json` | TypeScript configuration |
