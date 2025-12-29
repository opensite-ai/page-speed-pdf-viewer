import { useState, useCallback } from 'react';

export function usePageState({
  totalPages,
  initialPage = 1,
}: {
  totalPages: number;
  initialPage?: number;
}) {
  const [currentPage, setCurrentPage] = useState(
    Math.max(1, Math.min(initialPage, totalPages))
  );

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    canNext: currentPage < totalPages,
    canPrev: currentPage > 1,
  };
}

