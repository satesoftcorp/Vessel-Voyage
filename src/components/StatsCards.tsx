import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, Percent, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { UserPortfolio } from '../types';

interface StatsCardsProps {
  portfolio: UserPortfolio;
  onDepositClick: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ portfolio, onDepositClick }) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
      {/* 1. Total Portfolio Balance */}
      <div
        id="card-total-balance"
        className="relative overflow-hidden rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm transition-all hover:shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF2F7] text-blue-600 dark:bg-[#1C2434] dark:text-blue-400">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            +12.45%
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-xl md:text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight">
              ${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#8A99AD]">
              Total Portfolio Balance
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-2 text-[11px]">
          <span className="text-[#64748B] dark:text-[#8A99AD]">Cash Available:</span>
          <span className="font-semibold text-[#1C2434] dark:text-white">
            ${portfolio.cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* 2. Total Invested */}
      <div
        id="card-total-invested"
        className="relative overflow-hidden rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm transition-all hover:shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EFF2F7] text-blue-600 dark:bg-[#1C2434] dark:text-blue-400">
            <DollarSign className="h-4 w-4" />
          </div>
          <button
            onClick={onDepositClick}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            + Add Funds
          </button>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-xl md:text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight">
              ${portfolio.investedValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#8A99AD]">
              Total Invested Value
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-2 text-[11px]">
          <span className="text-[#64748B] dark:text-[#8A99AD]">Holdings:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            8 Equities & ETFs
          </span>
        </div>
      </div>

      {/* 3. Total Return / P&L */}
      <div
        id="card-profit-loss"
        className="relative overflow-hidden rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm transition-all hover:shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3 w-3" />
            +{portfolio.totalProfitLossPercentage.toFixed(2)}%
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-xl md:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              +${portfolio.totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#8A99AD]">
              Total All-Time Returns
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-2 text-[11px]">
          <span className="text-[#64748B] dark:text-[#8A99AD]">Today's Return:</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            +${portfolio.dailyProfitLoss.toFixed(2)} (+{portfolio.dailyProfitLossPercentage.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* 4. Dividend Earnings */}
      <div
        id="card-dividend-yield"
        className="relative overflow-hidden rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm transition-all hover:shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <Percent className="h-4 w-4" />
          </div>
          <span className="inline-flex items-center rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400">
            {portfolio.dividendYieldAvg}% Yield
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <h4 className="text-xl md:text-2xl font-bold text-[#1C2434] dark:text-white tracking-tight">
              ${portfolio.annualDividend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h4>
            <p className="mt-0.5 text-xs font-medium text-[#64748B] dark:text-[#8A99AD]">
              Annual Dividend Payouts
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-2 text-[11px]">
          <span className="text-[#64748B] dark:text-[#8A99AD]">Next Pay Date:</span>
          <span className="font-semibold text-[#1C2434] dark:text-white">
            Sep 12 ($45.00)
          </span>
        </div>
      </div>
    </div>
  );
};
