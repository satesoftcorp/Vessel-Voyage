import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, ShieldCheck, HelpCircle } from 'lucide-react';
import { sectorAllocations } from '../data/mockStocks';

interface AssetAllocationProps {
  darkMode: boolean;
}

export const AssetAllocation: React.FC<AssetAllocationProps> = ({ darkMode }) => {
  return (
    <div
      id="asset-allocation-card"
      className="rounded-sm border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-4 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#2E3A47]">
          <div>
            <h3 className="text-sm font-bold text-[#1C2434] dark:text-white">
              Asset Allocation
            </h3>
            <p className="text-[11px] text-[#64748B] dark:text-[#8A99AD]">
              Sector diversification & risk spread
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            Low Risk (98/100)
          </div>
        </div>

        {/* Donut Chart and Center Legend */}
        <div className="relative my-3 flex h-44 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sectorAllocations}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
              >
                {sectorAllocations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={darkMode ? '#1C2434' : '#FFFFFF'} strokeWidth={1.5} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                  borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                  borderRadius: '0.25rem',
                  fontSize: '11px',
                  color: darkMode ? '#FFFFFF' : '#1C2434',
                }}
                formatter={(val: any, name: any, item: any) => [
                  `${val}% ($${item.payload.amount.toLocaleString()})`,
                  item.payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Donut Center Overlay */}
          <div className="absolute flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-[#64748B] dark:text-[#8A99AD]">Total</span>
            <span className="text-base font-bold text-[#1C2434] dark:text-white">
              $142.8k
            </span>
          </div>
        </div>

        {/* Sector Legend List */}
        <div className="space-y-2 pt-1">
          {sectorAllocations.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-[#1C2434] dark:text-white text-[11px]">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px]">
                <span className="font-semibold text-[#1C2434] dark:text-white">
                  ${item.amount.toLocaleString()}
                </span>
                <span className="w-8 text-right font-bold text-[#64748B] dark:text-[#8A99AD]">
                  {item.value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-gray-200 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#8A99AD]">
        <span>Portfolio Health</span>
        <span className="font-semibold text-emerald-500">Optimal Weighting</span>
      </div>
    </div>
  );
};
