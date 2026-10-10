import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { TopPageItem } from '../types';

interface TopPagesCardProps {
  pages: TopPageItem[];
  onPageClick?: (page: TopPageItem) => void;
}

export const TopPagesCard: React.FC<TopPagesCardProps> = ({
  pages,
  onPageClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      id="top-pages-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs flex flex-col justify-between"
    >
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            Top Pages
          </h3>

          <div className="relative">
            <button
              id="top-pages-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-700 dark:hover:text-white transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-1 shadow-lg text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Page Breakdown
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-2 pt-1 text-xs text-gray-400 dark:text-[#8A99AD] font-medium">
          <span>Source</span>
          <span>Pageview</span>
        </div>

        {/* Page Rows */}
        <div className="divide-y divide-gray-50 dark:divide-[#2E3A47]/40">
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => onPageClick?.(page)}
              className="flex items-center justify-between py-2.5 text-xs text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50/70 dark:hover:bg-[#24303F]/40 px-1 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-medium text-gray-900 dark:text-white truncate max-w-[180px] sm:max-w-[200px]" title={page.source}>
                {page.source}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white shrink-0">
                {page.pageviews}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
