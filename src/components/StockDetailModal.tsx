import React from 'react';
import {
  X,
  TrendingUp,
  Building2,
  Calendar,
  MapPin,
  UserCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { Stock } from '../types';

interface StockDetailModalProps {
  stock: Stock | null;
  onClose: () => void;
  onTradeStock: (stock: Stock) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  onTradeStock,
}) => {
  if (!stock) return null;

  const isPositive = stock.change >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="stock-detail-modal"
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xl transition-all text-[#1C2434] dark:text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-gray-200 dark:border-[#2E3A47]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-slate-100 dark:bg-[#24303F] text-xl border border-gray-200 dark:border-[#2E3A47]">
              {stock.logo}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold">{stock.symbol}</h3>
                <span className="rounded bg-blue-500/10 px-1.5 py-0.2 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  {stock.sector}
                </span>
              </div>
              <h4 className="text-xs text-[#64748B] dark:text-[#8A99AD] font-medium">
                {stock.name}
              </h4>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-sm p-1 text-[#8A99AD] hover:bg-slate-100 dark:hover:bg-[#24303F] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price & Change Banner */}
        <div className="my-3.5 flex flex-wrap items-center justify-between rounded-sm bg-[#F8FAFC] dark:bg-[#24303F] p-3 border border-gray-200 dark:border-[#2E3A47]">
          <div>
            <span className="text-[10px] text-[#8A99AD] uppercase font-bold tracking-wider">Live Market Quote</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-bold">${stock.price.toFixed(2)}</span>
              <span
                className={`flex items-center text-xs font-bold ${
                  isPositive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                {isPositive ? '+' : ''}
                {stock.change.toFixed(2)}% (${stock.changeAmount.toFixed(2)})
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onTradeStock(stock);
            }}
            className="mt-2 sm:mt-0 rounded-sm bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            Trade {stock.symbol}
          </button>
        </div>

        {/* Company Description */}
        <div className="mb-3.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A99AD] mb-1">
            About Company
          </h5>
          <p className="text-xs leading-relaxed text-[#64748B] dark:text-[#DEE4EE]">
            {stock.description}
          </p>
        </div>

        {/* Key Fundamental Stats */}
        <div className="mb-3.5">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8A99AD] mb-1.5">
            Key Financial Statistics
          </h5>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
            <div className="rounded-sm border border-gray-200 dark:border-[#2E3A47] p-2 bg-[#F8FAFC] dark:bg-[#1C2434]">
              <span className="text-[#8A99AD] text-[10px] uppercase font-semibold">Market Cap</span>
              <p className="mt-0.5 font-bold text-[#1C2434] dark:text-white text-xs">{stock.marketCap}</p>
            </div>
            <div className="rounded-sm border border-gray-200 dark:border-[#2E3A47] p-2 bg-[#F8FAFC] dark:bg-[#1C2434]">
              <span className="text-[#8A99AD] text-[10px] uppercase font-semibold">P/E Ratio</span>
              <p className="mt-0.5 font-bold text-[#1C2434] dark:text-white text-xs">{stock.peRatio}</p>
            </div>
            <div className="rounded-sm border border-gray-200 dark:border-[#2E3A47] p-2 bg-[#F8FAFC] dark:bg-[#1C2434]">
              <span className="text-[#8A99AD] text-[10px] uppercase font-semibold">Dividend Yield</span>
              <p className="mt-0.5 font-bold text-emerald-500 text-xs">{stock.dividendYield}%</p>
            </div>
            <div className="rounded-sm border border-gray-200 dark:border-[#2E3A47] p-2 bg-[#F8FAFC] dark:bg-[#1C2434]">
              <span className="text-[#8A99AD] text-[10px] uppercase font-semibold">52-Week Range</span>
              <p className="mt-0.5 font-bold text-[#1C2434] dark:text-white text-xs">
                ${stock.week52Low} - ${stock.week52High}
              </p>
            </div>
          </div>
        </div>

        {/* Wall Street Analyst Consensus */}
        <div className="mb-3.5 rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#24303F] p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-blue-600" />
              <h5 className="text-xs font-bold text-[#1C2434] dark:text-white">
                Wall Street Analyst Consensus
              </h5>
            </div>
            <span className="text-xs font-bold text-emerald-500">
              12M Target: ${stock.analystRating.targetPrice.toFixed(2)}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-500 font-semibold">Buy ({stock.analystRating.buy}%)</span>
              <span className="text-amber-500 font-semibold">Hold ({stock.analystRating.hold}%)</span>
              <span className="text-rose-500 font-semibold">Sell ({stock.analystRating.sell}%)</span>
            </div>
            {/* Visual consensus bar */}
            <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-[#1C2434]">
              <div style={{ width: `${stock.analystRating.buy}%` }} className="bg-emerald-500" />
              <div style={{ width: `${stock.analystRating.hold}%` }} className="bg-amber-500" />
              <div style={{ width: `${stock.analystRating.sell}%` }} className="bg-rose-500" />
            </div>
          </div>
        </div>

        {/* Corporate Profile Details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B] dark:text-[#8A99AD] border-t border-gray-200 dark:border-[#2E3A47] pt-3">
          <div className="flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>
              CEO: <strong className="text-[#1C2434] dark:text-white">{stock.ceo}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-blue-600" />
            <span>
              HQ: <strong className="text-[#1C2434] dark:text-white">{stock.headquarters}</strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
