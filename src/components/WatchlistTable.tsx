import React, { useState } from 'react';
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Eye,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Stock } from '../types';

interface WatchlistTableProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onTradeStock: (stock: Stock) => void;
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({
  stocks,
  onSelectStock,
  onTradeStock,
  watchlist,
  onToggleWatchlist,
}) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'price' | 'change' | 'symbol' | 'marketCap'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);

  const sectors = ['All', 'Technology', 'Automotive', 'Cloud & E-Commerce', 'FinTech', 'Media'];

  // Filter stocks
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector =
      selectedSector === 'All' ||
      stock.sector.toLowerCase().includes(selectedSector.toLowerCase());
    const matchesWatchlist = !showWatchlistOnly || watchlist.includes(stock.symbol);

    return matchesSearch && matchesSector && matchesWatchlist;
  });

  // Sort stocks
  const sortedStocks = [...filteredStocks].sort((a, b) => {
    let factor = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'price') return (a.price - b.price) * factor;
    if (sortBy === 'change') return (a.change - b.change) * factor;
    if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol) * factor;
    return 0;
  });

  const renderSparkline = (points: number[], isPositive: boolean) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 70;
    const height = 24;

    const pathPoints = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={`M ${pathPoints.join(' L ')}`}
          fill="none"
          stroke={isPositive ? '#10B981' : '#FB5454'}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  return (
    <div
      id="stocks-watchlist-table-card"
      className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] shadow-sm"
    >
      {/* Card Header with Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-[#2E3A47]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1C2434] dark:text-white">
              Watchlist & Market Tickers
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD] mt-0.5">
              Live quotes, price movements, and institutional order books
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search Input */}
            <div className="relative">
              <input
                id="watchlist-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search symbol or name..."
                className="w-44 sm:w-56 rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] py-1.5 pl-7 pr-2.5 text-xs text-[#1C2434] dark:text-white placeholder-[#8A99AD] focus:border-blue-600 focus:outline-hidden"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#8A99AD]" />
            </div>

            {/* Watchlist star filter toggle */}
            <button
              id="watchlist-filter-toggle"
              onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
              className={`flex items-center gap-1 rounded-sm border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                showWatchlistOnly
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                  : 'border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] text-[#64748B] dark:text-[#8A99AD]'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${showWatchlistOnly ? 'fill-amber-500' : ''}`} />
              <span>Starred ({watchlist.length})</span>
            </button>
          </div>
        </div>

        {/* Sector Filter Tabs */}
        <div className="mt-3 flex flex-wrap gap-1 border-t border-gray-100 dark:border-[#2E3A47] pt-2.5">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`rounded-sm px-2.5 py-0.5 text-xs font-semibold transition-colors ${
                selectedSector === sec
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-[#F8FAFC] dark:bg-[#1C2434] text-[#64748B] dark:text-[#8A99AD] hover:text-[#1C2434] dark:hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] dark:bg-[#1C2434]/80 text-[#64748B] dark:text-[#8A99AD] uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-[#2E3A47] text-[10px]">
            <tr>
              <th className="py-2.5 pl-4 pr-1 w-8">★</th>
              <th className="py-2.5 px-3">Company</th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                onClick={() => {
                  setSortBy('price');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1">
                  Price
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-blue-600"
                onClick={() => {
                  setSortBy('change');
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center gap-1">
                  24h Change
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="py-2.5 px-3 hidden md:table-cell">24h High / Low</th>
              <th className="py-2.5 px-3 hidden lg:table-cell">Market Cap</th>
              <th className="py-2.5 px-3 hidden sm:table-cell">7D Trend</th>
              <th className="py-2.5 px-3 text-right pr-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
            {sortedStocks.map((stock) => {
              const isPositive = stock.change >= 0;
              const isStarred = watchlist.includes(stock.symbol);

              return (
                <tr
                  key={stock.symbol}
                  id={`stock-row-${stock.symbol}`}
                  className="hover:bg-slate-50 dark:hover:bg-[#2E3A47]/40 transition-colors"
                >
                  {/* Star */}
                  <td className="py-2 pl-4 pr-1">
                    <button
                      onClick={() => onToggleWatchlist(stock.symbol)}
                      className="text-[#8A99AD] hover:text-amber-500 transition-colors"
                      title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          isStarred ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                  </td>

                  {/* Company info */}
                  <td className="py-2 px-3">
                    <div
                      onClick={() => onSelectStock(stock)}
                      className="flex items-center gap-2 cursor-pointer group"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1C2434] text-sm group-hover:scale-105 transition-transform border border-gray-200 dark:border-[#2E3A47]">
                        {stock.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#1C2434] dark:text-white group-hover:text-blue-600 text-xs">
                            {stock.symbol}
                          </span>
                          <span className="rounded bg-slate-100 dark:bg-[#1C2434] px-1 py-0.2 text-[9px] text-[#64748B] dark:text-[#8A99AD]">
                            {stock.sector.split('/')[0]}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] dark:text-[#8A99AD] truncate max-w-[130px] sm:max-w-xs">
                          {stock.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-2 px-3 font-bold text-xs text-[#1C2434] dark:text-white">
                    ${stock.price.toFixed(2)}
                  </td>

                  {/* 24h Change */}
                  <td className="py-2 px-3">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold text-[10px] ${
                        isPositive
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {isPositive ? '+' : ''}
                      {stock.change.toFixed(2)}%
                    </span>
                  </td>

                  {/* High / Low */}
                  <td className="py-2 px-3 hidden md:table-cell text-[#64748B] dark:text-[#8A99AD] text-[11px]">
                    <span className="text-emerald-500 font-medium">${stock.high.toFixed(2)}</span>
                    <span className="mx-1">/</span>
                    <span className="text-rose-400 font-medium">${stock.low.toFixed(2)}</span>
                  </td>

                  {/* Market Cap */}
                  <td className="py-2 px-3 hidden lg:table-cell font-semibold text-[#1C2434] dark:text-white text-xs">
                    {stock.marketCap}
                  </td>

                  {/* Sparkline */}
                  <td className="py-2 px-3 hidden sm:table-cell">
                    {renderSparkline(stock.sparkline, isPositive)}
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3 text-right pr-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectStock(stock)}
                        className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-1 text-[#64748B] dark:text-[#8A99AD] hover:border-blue-600 hover:text-blue-600 transition-colors"
                        title="View Chart & Analysis"
                      >
                        <Eye className="h-3 w-3" />
                      </button>

                      <button
                        id={`btn-trade-${stock.symbol}`}
                        onClick={() => onTradeStock(stock)}
                        className="flex items-center gap-0.5 rounded-sm bg-blue-600 px-2 py-1 font-semibold text-white text-[11px] hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Trade</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 dark:border-[#2E3A47] text-[11px] text-[#64748B] dark:text-[#8A99AD]">
        <span>Showing {sortedStocks.length} of {stocks.length} assets</span>
        <span className="font-medium text-emerald-500">🟢 Real-Time Ticker Stream Active</span>
      </div>
    </div>
  );
};
