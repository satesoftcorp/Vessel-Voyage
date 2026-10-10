import React from 'react';
import { ArrowUpRight, ArrowDownRight, Flame, Plus, TrendingUp } from 'lucide-react';
import { Stock } from '../types';

interface TrendingStocksProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onTradeStock: (stock: Stock) => void;
}

export const TrendingStocks: React.FC<TrendingStocksProps> = ({
  stocks,
  onSelectStock,
  onTradeStock,
}) => {
  // Sparkline SVG renderer
  const renderSparkline = (points: number[], isPositive: boolean) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const pathPoints = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 6) - 3;
      return `${x},${y}`;
    });

    const pathData = `M ${pathPoints.join(' L ')}`;
    const strokeColor = isPositive ? '#10B981' : '#FB5454';

    return (
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <Flame className="h-3.5 w-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C2434] dark:text-white">
              Trending Stocks
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD]">
              Most active volume & market movers today
            </p>
          </div>
        </div>

        <span className="text-[11px] font-medium text-[#64748B] dark:text-[#8A99AD]">
          Updated 3s ago
        </span>
      </div>

      {/* Grid of Trending Cards */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stocks.slice(0, 6).map((stock) => {
          const isPositive = stock.change >= 0;
          return (
            <div
              key={stock.id}
              id={`trending-card-${stock.symbol}`}
              onClick={() => onSelectStock(stock)}
              className="group relative cursor-pointer rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] p-3 transition-all hover:border-blue-500 hover:shadow-xs dark:hover:border-blue-500"
            >
              {/* Top Row: Symbol & Sparkline */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-[#24303F] border border-gray-200 dark:border-[#2E3A47] text-xs font-bold">
                    {stock.logo}
                  </span>
                  <div>
                    <h5 className="font-bold text-xs text-[#1C2434] dark:text-white leading-tight">
                      {stock.symbol}
                    </h5>
                    <p className="text-[10px] text-[#64748B] dark:text-[#8A99AD] truncate max-w-[60px]">
                      {stock.name.split(' ')[0]}
                    </p>
                  </div>
                </div>

                <div>{renderSparkline(stock.sparkline, isPositive)}</div>
              </div>

              {/* Price & Change */}
              <div className="mt-2.5 flex items-end justify-between">
                <div>
                  <span className="text-xs font-bold text-[#1C2434] dark:text-white">
                    ${stock.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <span
                      className={`inline-flex items-center text-[10px] font-bold ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
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
                  </div>
                </div>

                <button
                  id={`quick-trade-${stock.symbol}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTradeStock(stock);
                  }}
                  className="rounded bg-blue-500/10 hover:bg-blue-600 text-blue-600 hover:text-white p-1 transition-colors"
                  title="Trade Stock"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
