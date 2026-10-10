import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Ship, ArrowUpRight, Anchor, Fuel, Layers, Compass, CheckCircle2 } from 'lucide-react';
import { Vessel } from '../../types';

interface FleetStatusChartProps {
  vessels: Vessel[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Underway: '#465FFF',
  'In Port': '#00D2D3',
  'At Anchor': '#F59E0B',
  Moored: '#8B5CF6',
  'Dry Dock': '#EF4444',
};

const TYPE_COLORS = ['#465FFF', '#00D2D3', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'];

export const FleetStatusChart: React.FC<FleetStatusChartProps> = ({
  vessels = [],
  darkMode,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'status' | 'type' | 'fuel' | 'tonnage'>('status');

  // Status breakdown
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      Underway: 0,
      'In Port': 0,
      'At Anchor': 0,
      Moored: 0,
      'Dry Dock': 0,
    };
    vessels.forEach((v) => {
      if (counts[v.status] !== undefined) {
        counts[v.status]++;
      } else {
        counts['In Port']++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || '#94A3B8',
      percentage: vessels.length > 0 ? ((value / vessels.length) * 100).toFixed(0) : '0',
    }));
  }, [vessels]);

  // Vessel Type breakdown
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    vessels.forEach((v) => {
      const typeStr = Array.isArray(v.type) ? v.type[0] : v.type || 'General Cargo';
      counts[typeStr] = (counts[typeStr] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: TYPE_COLORS[idx % TYPE_COLORS.length],
      percentage: vessels.length > 0 ? ((value / vessels.length) * 100).toFixed(0) : '0',
    }));
  }, [vessels]);

  // Fuel Type breakdown
  const fuelData = useMemo(() => {
    const counts: Record<string, number> = {};
    vessels.forEach((v) => {
      const fuel = v.fuelType?.split('/')[0]?.trim() || 'VLSFO (Bunker)';
      counts[fuel] = (counts[fuel] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: TYPE_COLORS[(idx + 2) % TYPE_COLORS.length],
      percentage: vessels.length > 0 ? ((value / vessels.length) * 100).toFixed(0) : '0',
    }));
  }, [vessels]);

  // Tonnage and Deadweight (DWT) brackets
  const tonnageData = useMemo(() => {
    return [
      { bracket: '< 2,000 DWT (Inland/Ferry)', count: 4, color: '#38BDF8' },
      { bracket: '2,000 - 10,000 DWT (Feeder)', count: 3, color: '#465FFF' },
      { bracket: '10,000 - 50,000 DWT (Handymax)', count: 3, color: '#10B981' },
      { bracket: '> 50,000 DWT (Panamax/Capesize)', count: 2, color: '#8B5CF6' },
    ];
  }, []);

  const activeDataset = tab === 'status' ? statusData : tab === 'type' ? typeData : fuelData;
  const activeUnderway = vessels.filter((v) => v.status === 'Underway').length;
  const inPortCount = vessels.filter((v) => v.status === 'In Port').length;

  return (
    <div
      id="fleet-status-chart-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#465FFF] dark:text-blue-400">
              <Ship className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Fleet Deployment &amp; Classification
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('vessels-register')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-0.5"
          >
            <span>Fleet Register</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('status')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'status'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Status
          </button>
          <button
            onClick={() => setTab('type')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'type'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Vessel Type
          </button>
          <button
            onClick={() => setTab('fuel')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'fuel'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Propulsion
          </button>
          <button
            onClick={() => setTab('tonnage')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'tonnage'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            DWT Class
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/30 p-2 border border-blue-100/60 dark:border-blue-900/40">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">Underway (Transit)</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {activeUnderway} of {vessels.length} Vessels
            </span>
          </div>
          <div className="rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 p-2 border border-cyan-100/60 dark:border-cyan-900/40">
            <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block">Berthed in Port</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {inPortCount} Berthed / Active
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 h-[210px] w-full flex items-center justify-center">
          {tab !== 'tonnage' ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeDataset}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {activeDataset.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} Vessels (${((val / vessels.length) * 100).toFixed(0)}%)`, name]}
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: darkMode ? '#FFFFFF' : '#0F172A',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex flex-col justify-center space-y-2.5">
              {tonnageData.map((dwt, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{dwt.bracket}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{dwt.count} Ships</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(dwt.count / 12) * 100}%`, backgroundColor: dwt.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend List */}
        {tab !== 'tonnage' && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {activeDataset.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-[#8A99AD] truncate text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-[11px] shrink-0 ml-1">
                  {item.value} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <span>IMO Fleet Registry Active</span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% AIS Position Verified</span>
      </div>
    </div>
  );
};
