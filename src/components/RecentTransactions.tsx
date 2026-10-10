import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Transaction } from '../types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onExport: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  onExport,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  return (
    <div
      id="recent-transactions-card"
      className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] shadow-sm"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-[#2E3A47]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1C2434] dark:text-white">
              Recent Transactions & Execution Log
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD] mt-0.5">
              Settled market orders, portfolio rebalances, and dividend credits
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Filter Tabs */}
            <div className="flex items-center rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-[#F8FAFC] dark:bg-[#1C2434] p-0.5 text-xs">
              {['ALL', 'BUY', 'SELL', 'DIVIDEND'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`rounded-xs px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                    filterType === type
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-[#64748B] dark:text-[#8A99AD] hover:text-[#1C2434] dark:hover:text-white'
                  }`}
                >
                  {type === 'ALL' ? 'All Records' : type}
                </button>
              ))}
            </div>

            {/* Export button */}
            <button
              id="export-transactions-btn"
              onClick={onExport}
              className="flex items-center gap-1 rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-2.5 py-1 text-xs font-semibold text-[#64748B] dark:text-[#8A99AD] hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-[11px]">Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] dark:bg-[#1C2434]/80 text-[#64748B] dark:text-[#8A99AD] uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-[#2E3A47] text-[10px]">
            <tr>
              <th className="py-2.5 px-4">Transaction ID</th>
              <th className="py-2.5 px-3">Asset</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Quantity</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">Total Amount</th>
              <th className="py-2.5 px-3 hidden md:table-cell">Timestamp</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
            {filtered.map((tx) => {
              const isBuy = tx.type === 'BUY';
              const isSell = tx.type === 'SELL';
              const isDividend = tx.type === 'DIVIDEND';

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50 dark:hover:bg-[#2E3A47]/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-[#64748B] dark:text-[#8A99AD] text-[11px]">
                    {tx.id}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#1C2434] dark:text-white text-xs">
                    {tx.name} <span className="text-[#8A99AD] font-normal">({tx.symbol})</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-bold text-[10px] ${
                        isBuy
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : isSell
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      }`}
                    >
                      {isBuy && <ArrowDownLeft className="h-3 w-3" />}
                      {isSell && <ArrowUpRight className="h-3 w-3" />}
                      {isDividend && <DollarSign className="h-3 w-3" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#1C2434] dark:text-white text-xs">
                    {tx.shares} {tx.type !== 'DEPOSIT' ? 'sh' : ''}
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B] dark:text-[#8A99AD] text-xs">
                    ${tx.price.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#1C2434] dark:text-white text-xs">
                    ${tx.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 hidden md:table-cell text-[#64748B] dark:text-[#8A99AD] text-[11px]">
                    {tx.date} <span className="text-[10px]">{tx.time}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className="inline-flex items-center gap-0.5 text-emerald-500 font-semibold text-[11px]">
                      <CheckCircle2 className="h-3 w-3" />
                      {tx.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
