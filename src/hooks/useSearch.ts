import { useState, useCallback } from 'react';
import { SearchResult } from '../types';

export function useSearch(pdfDoc: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const search = useCallback(
    async (searchText: string) => {
      if (!pdfDoc || !searchText.trim()) {
        setResults([]);
        setQuery('');
        return;
      }

      setSearching(true);
      setQuery(searchText);
      const foundResults: SearchResult[] = [];

      try {
        for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
          const page = await pdfDoc.getPage(pageNum);
          const textContent = await page.getTextContent();

          for (const item of textContent.items) {
            if ('str' in item && item.str.includes(searchText)) {
              foundResults.push({
                pageNumber: pageNum,
                text: item.str,
                position: {
                  x: item.transform[4],
                  y: item.transform[5],
                },
              });
            }
          }
        }

        setResults(foundResults);
        setCurrentResultIndex(0);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    },
    [pdfDoc]
  );

  const nextResult = useCallback(() => {
    setCurrentResultIndex((prev) => (prev + 1) % results.length);
  }, [results.length]);

  const prevResult = useCallback(() => {
    setCurrentResultIndex((prev) => (prev - 1 + results.length) % results.length);
  }, [results.length]);

  return {
    query,
    results,
    currentResult: results[currentResultIndex],
    searching,
    search,
    nextResult,
    prevResult,
  };
}

