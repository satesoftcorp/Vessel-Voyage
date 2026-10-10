import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Area,
} from 'recharts';
import {
  Fuel,
  Leaf,
  Gauge,
  TrendingDown,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { Vessel, VoyageRecord } from '../../types';

interface FleetFuelEfficiencyChartProps {
  vessels: Vessel[];
  voyages: VoyageRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

export const FleetFuelEfficiencyChart: React.FC<FleetFuelEfficiencyChartProps> = ({
  vessels,
  voyages,
  darkMode,
  onNavigate,
}) => {
  const [metricTab, setMetricTab] = useState<'consumption' | 'cii-rating' | 'fuel-type'>('consumption');

  // Realistic monthly fuel consumption and CII index data
  const monthlyFuelData = useMemo(() => {
    return [
      {
        month: 'Mar 2026',
        vlsfoMT: 1420,
        mgoMT: 380,
        lngMT: 220,
        biofuelMT: 60,
        totalMT: 2080,
        ciiScore: 3.8,
        ciiGrade: 'B',
        avgSpeedKnots: 14.2,
      },
      {
        month: 'Apr 2026',
        vlsfoMT: 1560,
        mgoMT: 410,
        lngMT: 260,
        biofuelMT: 90,
        totalMT: 2320,
        ciiScore: 3.6,
        ciiGrade: 'B',
        avgSpeedKnots: 14.5,
      },
      {
        month: 'May 2026',
        vlsfoMT: 1710,
        mgoMT: 440,
        lngMT: 310,
        biofuelMT: 140,
        totalMT: 2600,
        ciiScore: 3.4,
        ciiGrade: 'A',
        avgSpeedKnots: 14.1,
      },
      {
        month: 'Jun 2026',
        vlsfoMT: 1850,
        mgoMT: 490,
        lngMT: 380,
        biofuelMT: 190,
        totalMT: 2910,
        ciiScore: 3.2,
        ciiGrade: 'A',
        avgSpeedKnots: 13.8,
      },
      {
        month: 'Jul 2026',
        vlsfoMT: 1980,
        mgoMT: 520,
        lngMT: 430,
        biofuelMT: 240,
        totalMT: 3170,
        ciiScore: 3.1,
        ciiGrade: 'A',
        avgSpeedKnots: 13.9,
      },
      {
        month: 'Aug 2026 (Live)',
        vlsfoMT: 2100,
        mgoMT: 560,
        lngMT: 490,
        biofuelMT: 290,
        totalMT: 3440,
        ciiScore: 2.9,
        ciiGrade: 'A',
        avgSpeedKnots: 13.7,
      },
    ];
  }, []);

  // CII Ratings breakdown across the active fleet
  const ciiFleetData = useMemo(() => {
    return [
      { grade: 'Grade A (Superior)', count: 6, color: '#10B981', target: 'Below 3.2 gCO₂/dwt·nm', desc: 'Exceeds IMO 2030 targets' },
      { grade: 'Grade B (Minor Superior)', count: 4, color: '#3B82F6', target: '3.2 - 3.8 gCO₂/dwt·nm', desc: 'Compliant & optimized' },
      { grade: 'Grade C (Moderate)', count: 2, color: '#F59E0B', target: '3.8 - 4.5 gCO₂/dwt·nm', desc: 'Baseline compliance' },
      { grade: 'Grade D (Action Plan)', count: 0, color: '#F97316', target: '4.5 - 5.2 gCO₂/dwt·nm', desc: 'Corrective plan required' },
      { grade: 'Grade E (Inferior)', count: 0, color: '#EF4444', target: 'Above 5.2 gCO₂/dwt·nm', desc: 'High carbon penalty risk' },
    ];
  }, []);

  // Fuel Type percentage
  const fuelTypeBreakdown = useMemo(() => {
    return [
      { name: 'VLSFO (0.5% Low Sulfur Bunker)', share: 61, mt: 2100, color: '#465FFF' },
      { name: 'MGO / Low Flashpoint Diesel', share: 16, mt: 560, color: '#00D2D3' },
      { name: 'LNG Dual-Fuel Gas', share: 14, mt: 490, color: '#10B981' },
      { name: 'Biofuel & Green Methanol', share: 9, mt: 290, color: '#8B5CF6' },
    ];
  }, []);

  const totalFuelMT = monthlyFuelData.reduce((a, b) => a + b.totalMT, 0);
  const avgCii = (monthlyFuelData.reduce((a, b) => a + b.ciiScore, 0) / monthlyFuelData.length).toFixed(1);

  return (
    <div
      id="fleet-fuel-efficiency-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Fuel className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Fleet Fuel & Carbon Intensity (IMO CII)
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Bunker consumption, biofuel transition, and IMO Carbon Intensity Index ratings
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('vessels-register')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Vessel Specs</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View switcher */}
        <div className="mt-4 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setMetricTab('consumption')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              metricTab === 'consumption'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Monthly Fuel Trend (MT)
          </button>
          <button
            onClick={() => setMetricTab('cii-rating')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              metricTab === 'cii-rating'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            IMO CII Carbon Ratings
          </button>
          <button
            onClick={() => setMetricTab('fuel-type')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              metricTab === 'fuel-type'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Fuel Type Mix
          </button>
        </div>

        {/* Highlight Stats Badges */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-2.5">
            <span className="text-[11px] font-medium text-gray-500 dark:text-[#8A99AD]">Total Bunker (6M)</span>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-0.5">
              {(totalFuelMT).toLocaleString()} MT
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-2.5">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Fleet Avg CII Grade</span>
            <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5 flex items-center gap-1">
              <span>Grade A</span>
              <span className="text-[10px] font-normal">({avgCii} rating)</span>
            </p>
          </div>
          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-2.5">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Bio &amp; LNG Share</span>
            <p className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300 mt-0.5">
              23% Green Mix
            </p>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-5 h-[230px] w-full">
          {metricTab === 'consumption' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyFuelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fuelGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} MT`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[10, 18]}
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val} kts`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(val: any, name: string) => {
                    if (name === 'totalMT') return [`${Number(val).toLocaleString()} Metric Tonnes`, 'Total Fuel'];
                    if (name === 'avgSpeedKnots') return [`${val} Knots`, 'Avg Speed'];
                    return [val, name];
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'totalMT' ? 'Fuel Consumed (MT)' : 'Avg Speed (Knots)')}
                />
                <Bar yAxisId="left" dataKey="totalMT" fill="#465FFF" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgSpeedKnots"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {metricTab === 'cii-rating' && (
            <div className="h-full flex flex-col justify-between space-y-2 py-1">
              {ciiFleetData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.grade}</span>
                  </div>
                  <div className="flex-1 mx-3 h-2.5 rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${vessels.length > 0 ? (item.count / vessels.length) * 100 : item.count * 8}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-right min-w-[70px]">
                    <span className="font-bold text-gray-900 dark:text-white">{item.count} Vessels</span>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>100% of operational fleet conforms to IMO MARPOL Annex VI decarbonization standard.</span>
              </div>
            </div>
          )}

          {metricTab === 'fuel-type' && (
            <div className="h-full flex flex-col justify-center space-y-3">
              {fuelTypeBreakdown.map((fuel, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{fuel.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {fuel.share}% ({fuel.mt} MT)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${fuel.share}%`, backgroundColor: fuel.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div className="flex items-center gap-1.5">
          <Leaf className="h-3.5 w-3.5 text-emerald-500" />
          <span>EEXI Energy Efficiency Index: Compliant</span>
        </div>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">-8.4% Emissions vs 2025</span>
      </div>
    </div>
  );
};
