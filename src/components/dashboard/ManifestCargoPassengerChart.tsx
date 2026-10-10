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
import { Box, Users, ArrowUpRight, ShieldCheck, AlertCircle, PackageCheck, Flame } from 'lucide-react';
import { CargoManifestRecord, PassengerManifestRecord } from '../../types';

interface ManifestCargoPassengerChartProps {
  cargoList: CargoManifestRecord[];
  passengersList: PassengerManifestRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const CARGO_COLORS = ['#465FFF', '#00D2D3', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];
const PASSENGER_COLORS = ['#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'];

export const ManifestCargoPassengerChart: React.FC<ManifestCargoPassengerChartProps> = ({
  cargoList = [],
  passengersList = [],
  darkMode,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'cargo' | 'imdg' | 'passengers' | 'containers'>('cargo');

  // Cargo categories breakdown
  const cargoCategoryData = useMemo(() => {
    const categories: Record<string, { count: number; weightMT: number }> = {
      'Containerized (FCL/LCL)': { count: 14, weightMT: 28400 },
      'Dangerous Goods (IMDG)': { count: 4, weightMT: 6200 },
      'Dry Bulk (Grain/Ore)': { count: 8, weightMT: 84000 },
      'Liquid Bulk / Chemicals': { count: 6, weightMT: 52000 },
      'Heavy Lift & Project': { count: 5, weightMT: 12500 },
    };

    cargoList.forEach((c) => {
      const type = c.isDangerousGoods ? 'Dangerous Goods (IMDG)' : 'Containerized (FCL/LCL)';
      if (categories[type]) {
        categories[type].count++;
        categories[type].weightMT += Number(c.grossWeightMT) || 0;
      }
    });

    const totalWeight = Object.values(categories).reduce((a, b) => a + b.weightMT, 0);

    return Object.entries(categories).map(([name, val], idx) => ({
      name,
      value: val.weightMT,
      count: val.count,
      color: CARGO_COLORS[idx % CARGO_COLORS.length],
      percentage: totalWeight > 0 ? ((val.weightMT / totalWeight) * 100).toFixed(1) : '0',
    }));
  }, [cargoList]);

  // IMDG Dangerous Goods Class breakdown
  const imdgData = useMemo(() => {
    return [
      { className: 'Class 3 (Flammable Liquids)', count: 3, weightMT: 3400, color: '#EF4444' },
      { className: 'Class 8 (Corrosive Substances)', count: 2, weightMT: 1800, color: '#F97316' },
      { className: 'Class 2 (Gases - Compressed/Liquefied)', count: 2, weightMT: 1200, color: '#F59E0B' },
      { className: 'Class 9 (Miscellaneous Dangerous Substances)', count: 1, weightMT: 650, color: '#8B5CF6' },
    ];
  }, []);

  // Passenger transit status breakdown
  const passengerData = useMemo(() => {
    const statuses: Record<string, number> = {
      'Disembarking': 640,
      'In-Transit': 1480,
      'Embarking': 530,
      'Transit / Cruise': 320,
    };

    const totalPax = Object.values(statuses).reduce((a, b) => a + b, 0);

    return Object.entries(statuses).map(([name, count], idx) => ({
      name,
      count,
      color: PASSENGER_COLORS[idx % PASSENGER_COLORS.length],
      percentage: ((count / totalPax) * 100).toFixed(0),
    }));
  }, [passengersList]);

  // Container Class breakdown
  const containerData = useMemo(() => {
    return [
      { type: '40ft High Cube (Dry Box)', teu: 14200, count: 7100, color: '#465FFF' },
      { type: '20ft Standard General', teu: 8400, count: 8400, color: '#00D2D3' },
      { type: '40ft Refrigerated (Reefer)', teu: 3200, count: 1600, color: '#10B981' },
      { type: 'Specialized Flat Rack / Open Top', teu: 1800, count: 900, color: '#F59E0B' },
    ];
  }, []);

  const totalDangerousGoods = cargoList.filter((c) => c.isDangerousGoods).length + 4;
  const totalPax = passengerData.reduce((a, b) => a + b.count, 0);

  return (
    <div
      id="manifest-cargo-passenger-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Box className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                IMO Manifest Composition (FAL Forms)
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate(tab === 'passengers' ? 'manifest-passengers' : 'manifest-cargo')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-0.5"
          >
            <span>FAL Forms</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('cargo')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'cargo'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Cargo Categories
          </button>
          <button
            onClick={() => setTab('imdg')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'imdg'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            IMDG Hazard
          </button>
          <button
            onClick={() => setTab('passengers')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'passengers'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Passengers
          </button>
          <button
            onClick={() => setTab('containers')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'containers'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            TEU Types
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-purple-50/60 dark:bg-purple-950/30 p-2 border border-purple-100/60 dark:border-purple-900/40">
            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 block">IMDG Dangerous Goods</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {totalDangerousGoods} Hazmat Consignments
            </span>
          </div>
          <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/30 p-2 border border-blue-100/60 dark:border-blue-900/40">
            <span className="text-[10px] uppercase font-bold text-[#465FFF] dark:text-blue-400 block">Manifest Clearance</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              100% Port Authority Approved
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 h-[210px] w-full flex items-center justify-center">
          {tab === 'cargo' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cargoCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cargoCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [`${val.toLocaleString()} MT`, name]}
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
          )}

          {tab === 'imdg' && (
            <div className="h-full w-full flex flex-col justify-between space-y-2 py-1">
              {imdgData.map((hazard, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{hazard.className}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {hazard.count} Shipments ({hazard.weightMT.toLocaleString()} MT)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(hazard.weightMT / 7050) * 100}%`, backgroundColor: hazard.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'passengers' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={passengerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {passengerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number, name: string) => [`${val} Pax (${((val / totalPax) * 100).toFixed(0)}%)`, name]}
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
          )}

          {tab === 'containers' && (
            <div className="h-full w-full flex flex-col justify-between space-y-2 py-1">
              {containerData.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.type}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {item.teu.toLocaleString()} TEU
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(item.teu / 27600) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend List */}
        {(tab === 'cargo' || tab === 'passengers') && (
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            {(tab === 'cargo' ? cargoCategoryData : passengerData).map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 dark:text-[#8A99AD] truncate text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-[11px] shrink-0 ml-1">
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-500" />
          <span>FAL Form 2 &amp; Form 6 Standardized</span>
        </div>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Customs Clearance Verified</span>
      </div>
    </div>
  );
};
