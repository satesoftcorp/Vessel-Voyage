import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Line,
} from 'recharts';
import {
  TrendingUp,
  Maximize2,
  Calendar,
  Layers,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Stock } from '../types';
import { portfolioAggregateHistory } from '../data/mockStocks';

interface PortfolioPerformanceChartProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock | null) => void;
  darkMode: boolean;
}

type Timeframe = '1D' | '1W' | '1M' | '6M' | '1Y' | 'ALL';

export const PortfolioPerformanceChart: React.FC<PortfolioPerformanceChartProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  darkMode,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartType, setChartType] = useState<'area' | 'volume'>('area');
  const [showBenchmark, setShowBenchmark] = useState(false);

  // Determine current chart data
  const data = selectedStock
    ? selectedStock.historical[timeframe]
    : portfolioAggregateHistory[timeframe];

  const isPositive = selectedStock ? selectedStock.change >= 0 : true;
  const primaryColor = isPositive ? '#3C50E0' : '#FB5454';
  const secondaryColor = '#80CAEE';

  const timeframes: Timeframe[] = ['1D', '1W', '1M', '6M', '1Y', 'ALL'];

  return (
    <div
      id="portfolio-performance-chart-card"
      className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm"
    >
      {/* Header with Title, Stock Selector & Filter Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between pb-3 border-b border-gray-200 dark:border-[#2E3A47]">
        {/* Left: Ticker Title & Selector */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-[#1C2434] dark:text-white">
              {selectedStock ? `${selectedStock.name} (${selectedStock.symbol})` : 'Portfolio Performance'}
            </h3>
            {selectedStock && (
              <button
                onClick={() => onSelectStock(null)}
                className="rounded-full bg-slate-100 dark:bg-[#1C2434] px-2 py-0.5 text-[10px] font-semibold text-[#64748B] dark:text-[#8A99AD] hover:text-blue-600"
              >
                ✕ Reset to Portfolio
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD] mt-0.5">
            {selectedStock
              ? `${selectedStock.sector} • P/E: ${selectedStock.peRatio} • Div: ${selectedStock.dividendYield}%`
              : 'Aggregated equity value across all 8 portfolio assets'}
          </p>
        </div>

        {/* Right: Stock Quick Selector Pills & Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick ticker pills */}
          <div className="hidden sm:flex items-center rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] p-0.5">
            <button
              onClick={() => onSelectStock(null)}
              className={`rounded-xs px-2 py-0.5 text-[10px] font-bold transition-colors ${
                !selectedStock
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#8A99AD] hover:text-[#1C2434] dark:hover:text-white'
              }`}
            >
              Portfolio
            </button>
            {stocks.slice(0, 4).map((s) => {
              const active = selectedStock?.symbol === s.symbol;
              return (
                <button
                  key={s.symbol}
                  onClick={() => onSelectStock(s)}
                  className={`rounded-xs px-2 py-0.5 text-[10px] font-bold transition-colors ${
                    active
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#8A99AD] hover:text-[#1C2434] dark:hover:text-white'
                  }`}
                >
                  {s.symbol}
                </button>
              );
            })}
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] p-0.5">
            {timeframes.map((tf) => (
              <button
                key={tf}
                id={`timeframe-btn-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`rounded-xs px-2 py-0.5 text-[10px] font-bold transition-colors ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-[#64748B] dark:text-[#8A99AD] hover:text-[#1C2434] dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type toggle */}
          <div className="flex items-center rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] p-0.5">
            <button
              onClick={() => setChartType('area')}
              className={`rounded-xs p-1 text-xs transition-colors ${
                chartType === 'area'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#64748B] dark:text-[#8A99AD]'
              }`}
              title="Price Trend Area"
            >
              <TrendingUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setChartType('volume')}
              className={`rounded-xs p-1 text-xs transition-colors ${
                chartType === 'volume'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#64748B] dark:text-[#8A99AD]'
              }`}
              title="Volume Distribution"
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Ticker Metrics Bar */}
      <div className="grid grid-cols-2 gap-2 py-2.5 sm:grid-cols-4 lg:grid-cols-6 border-b border-gray-200 dark:border-[#2E3A47] text-[11px]">
        <div>
          <span className="text-[#8A99AD] text-[10px]">Current Value</span>
          <p className="text-sm font-bold text-[#1C2434] dark:text-white">
            {selectedStock
              ? `$${selectedStock.price.toFixed(2)}`
              : `$142,850.40`}
          </p>
        </div>
        <div>
          <span className="text-[#8A99AD] text-[10px]">Change ({timeframe})</span>
          <p
            className={`text-sm font-bold flex items-center gap-0.5 ${
              isPositive ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {selectedStock
              ? `${selectedStock.change > 0 ? '+' : ''}${selectedStock.change.toFixed(2)}%`
              : '+12.45%'}
          </p>
        </div>
        <div>
          <span className="text-[#8A99AD] text-[10px]">High / Low</span>
          <p className="font-bold text-[#1C2434] dark:text-white">
            {selectedStock
              ? `$${selectedStock.high.toFixed(2)} / $${selectedStock.low.toFixed(2)}`
              : '$143.2k / $128.4k'}
          </p>
        </div>
        <div>
          <span className="text-[#8A99AD] text-[10px]">24h Volume</span>
          <p className="font-bold text-[#1C2434] dark:text-white">
            {selectedStock ? selectedStock.volume : '18.4M shs'}
          </p>
        </div>
        <div>
          <span className="text-[#8A99AD] text-[10px]">Market Cap</span>
          <p className="font-bold text-[#1C2434] dark:text-white">
            {selectedStock ? selectedStock.marketCap : '$11.8T Index'}
          </p>
        </div>
        <div>
          <span className="text-[#8A99AD] text-[10px]">52-Week Range</span>
          <p className="font-bold text-[#1C2434] dark:text-white">
            {selectedStock
              ? `$${selectedStock.week52Low} - $${selectedStock.week52High}`
              : '$85K - $145K'}
          </p>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="h-72 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={darkMode ? '#2E3A47' : '#E2E8F0'}
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 10 }}
              />
              <YAxis
                domain={['auto', 'auto']}
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 10 }}
                tickFormatter={(val) =>
                  val > 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                  borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: darkMode ? '#FFFFFF' : '#1C2434',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [
                  `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                  selectedStock ? selectedStock.symbol : 'Portfolio Value',
                ]}
                labelStyle={{ color: '#8A99AD', fontWeight: 600, fontSize: 11 }}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={primaryColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={darkMode ? '#2E3A47' : '#E2E8F0'}
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 10 }}
              />
              <YAxis
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 10 }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                  borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                  borderRadius: '0.375rem',
                  color: darkMode ? '#FFFFFF' : '#1C2434',
                  fontSize: '11px',
                }}
                formatter={(value: any) => [
                  `${Number(value).toLocaleString()} shares`,
                  'Volume Traded',
                ]}
              />
              <Bar dataKey="volume" fill={primaryColor} radius={[2, 2, 0, 0]} opacity={0.85} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
