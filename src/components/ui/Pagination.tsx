'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 px-1 text-xs text-muted-foreground ${className}`}
    >
      {/* Item Range Info */}
      <div className="text-center sm:text-left font-medium">
        Showing <span className="font-bold text-foreground">{startItem}</span> to{' '}
        <span className="font-bold text-foreground">{endItem}</span> of{' '}
        <span className="font-bold text-foreground">{totalItems}</span> results
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous Page"
          className="h-8.5 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground font-semibold flex items-center gap-1 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs active:scale-95"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs">Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8.5 flex items-center justify-center text-muted-foreground text-xs"
                >
                  …
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-8 h-8.5 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer shadow-xs active:scale-95 ${
                  isActive
                    ? 'bg-gabay-green text-white shadow-xs pointer-events-none'
                    : 'bg-card hover:bg-muted border border-border text-foreground'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next Page"
          className="h-8.5 px-2.5 rounded-lg bg-card hover:bg-muted border border-border text-foreground font-semibold flex items-center gap-1 transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs active:scale-95"
        >
          <span className="hidden sm:inline text-xs">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
