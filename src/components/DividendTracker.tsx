import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DollarSign, Calendar, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { upcomingDividends } from '../data/mockStocks';

interface DividendTrackerProps {
  darkMode: boolean;
}

export const DividendTracker: React.FC<DividendTrackerProps> = ({ darkMode }) => {
  const [dripEnabled, setDripEnabled] = useState(true);

  const monthlyDividendData = [
    { month: 'Jan', amount: 240 },
    { month: 'Feb', amount: 180 },
    { month: 'Mar', amount: 410 },
    { month: 'Apr', amount: 220 },
    { month: 'May', amount: 310 },
    { month: 'Jun', amount: 520 },
    { month: 'Jul', amount: 290 },
    { month: 'Aug', amount: 340 },
    { month: 'Sep', amount: 480 },
    { month: 'Oct', amount: 210 },
    { month: 'Nov', amount: 390 },
    { month: 'Dec', amount: 650 },
  ];

  return (
    <div
      id="dividend-tracker-card"
      className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 dark:border-[#2E3A47]">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C2434] dark:text-white">
              Dividend Calendar & Income
            </h3>
          </div>
          <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD] mt-0.5">
            Quarterly distributions & automated DRIP reinvestment
          </p>
        </div>

        {/* DRIP Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#64748B] dark:text-[#8A99AD]">
            Auto-DRIP Reinvest:
          </span>
          <button
            id="drip-toggle-btn"
            onClick={() => setDripEnabled(!dripEnabled)}
            className={`relative inline-flex h-4.5 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
              dripEnabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                dripEnabled ? 'translate-x-3.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Grid: Bar Chart + Upcoming Schedule */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pt-3">
        {/* Left: Monthly Dividend Yield Chart (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#8A99AD]">
                2024 Projected Yield
              </span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                $3,842.10
              </span>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyDividendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#2E3A47' : '#E2E8F0'} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 9 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 9 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                      borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                      borderRadius: '0.25rem',
                      fontSize: '11px',
                    }}
                    formatter={(v: any) => [`$${v}.00`, 'Estimated Dividend']}
                  />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Dividend Payouts List (7 cols) */}
        <div className="lg:col-span-7">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#8A99AD] mb-1.5">
            Upcoming Ex-Dividend Schedules
          </h4>
          <div className="divide-y divide-gray-100 dark:divide-[#2E3A47] border border-gray-200 dark:border-[#2E3A47] rounded-sm overflow-hidden bg-[#F8FAFC] dark:bg-[#1C2434]">
            {upcomingDividends.map((div) => (
              <div key={div.id} className="flex items-center justify-between p-2.5 text-xs hover:bg-slate-50 dark:hover:bg-[#24303F] transition-colors">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-blue-500/10 font-bold text-blue-600 text-xs">
                    {div.symbol}
                  </div>
                  <div>
                    <h5 className="font-bold text-[#1C2434] dark:text-white leading-tight text-xs">
                      {div.name}
                    </h5>
                    <p className="text-[10px] text-[#64748B] dark:text-[#8A99AD]">
                      Ex-Date: {div.exDate} • Pay: {div.payDate}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    +${div.totalPayout.toFixed(2)}
                  </span>
                  <p className="text-[10px] text-[#64748B] dark:text-[#8A99AD]">
                    ${div.amountPerShare}/sh ({div.shares} sh)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
