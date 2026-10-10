import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ComposedChart,
  Line,
} from 'recharts';
import {
  Anchor,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Compass,
  Ship,
} from 'lucide-react';
import { PortRecord, WaterBody, VoyageRecord, LandingRecord } from '../../types';

interface PortTrafficDensityChartProps {
  ports: PortRecord[];
  waterBodies: WaterBody[];
  voyages: VoyageRecord[];
  landings: LandingRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const PORT_COLORS = ['#465FFF', '#00D2D3', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'];

export const PortTrafficDensityChart: React.FC<PortTrafficDensityChartProps> = ({
  ports = [],
  waterBodies = [],
  voyages = [],
  landings = [],
  darkMode,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'uganda-calls' | 'cargo-tonnage' | 'regional-hub'>('uganda-calls');

  // Uganda Port Calls & Landings
  const ugandaPortTraffic = useMemo(() => {
    return [
      { name: 'Port Bell', calls: 38, landings: 36, cargoMT: 142000, waterBody: 'Lake Victoria', berths: 6 },
      { name: 'Jinja Pier', calls: 28, landings: 27, cargoMT: 98000, waterBody: 'Lake Victoria', berths: 4 },
      { name: 'Bukasa Port', calls: 24, landings: 22, cargoMT: 84000, waterBody: 'Lake Victoria', berths: 8 },
      { name: 'Entebbe Pier', calls: 19, landings: 19, cargoMT: 45000, waterBody: 'Lake Victoria', berths: 3 },
      { name: 'Kalangala Pier', calls: 16, landings: 16, cargoMT: 28000, waterBody: 'Lake Victoria', berths: 2 },
      { name: 'Butiaba Pier', calls: 14, landings: 13, cargoMT: 36000, waterBody: 'Lake Albert', berths: 3 },
      { name: 'Kasenyi Port', calls: 12, landings: 11, cargoMT: 18000, waterBody: 'Lake Victoria', berths: 2 },
    ];
  }, []);

  // Regional & Coastal Maritime Gateways
  const regionalHubTraffic = useMemo(() => {
    return [
      { name: 'Mombasa (KEMBA)', calls: 142, cargoMT: 920000, country: 'Kenya' },
      { name: 'Dar es Salaam (TZDAR)', calls: 118, cargoMT: 780000, country: 'Tanzania' },
      { name: 'Rotterdam (NLRTM)', calls: 64, cargoMT: 1850000, country: 'Netherlands' },
      { name: 'Singapore (SGSIN)', calls: 58, cargoMT: 1620000, country: 'Singapore' },
      { name: 'Kisumu Port (KEKIS)', calls: 46, cargoMT: 240000, country: 'Kenya / L.Vic' },
      { name: 'Mwanza Port (TZMWZ)', calls: 42, cargoMT: 210000, country: 'Tanzania / L.Vic' },
    ];
  }, []);

  const totalInlandCalls = ugandaPortTraffic.reduce((a, b) => a + b.calls, 0);
  const totalInlandCargoMT = ugandaPortTraffic.reduce((a, b) => a + b.cargoMT, 0);

  return (
    <div
      id="port-traffic-density-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#465FFF] dark:text-blue-400">
              <Anchor className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Port Traffic Density &amp; Waterway Berthing
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('water-body-ports')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-0.5"
          >
            <span>Port Directory</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('uganda-calls')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'uganda-calls'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Uganda Port Calls
          </button>
          <button
            onClick={() => setTab('cargo-tonnage')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'cargo-tonnage'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Cargo MT per Port
          </button>
          <button
            onClick={() => setTab('regional-hub')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'regional-hub'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Regional Gateways
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/30 p-2 border border-blue-100/60 dark:border-blue-900/40">
            <span className="text-[10px] uppercase font-bold text-[#465FFF] dark:text-blue-400 block">Total Inland Port Calls</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {totalInlandCalls} Vessel Calls
            </span>
          </div>
          <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-2 border border-emerald-100/60 dark:border-emerald-900/40">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Inland Cargo Volume</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {(totalInlandCargoMT / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k MT
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 h-[210px] w-full">
          {tab === 'uganda-calls' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ugandaPortTraffic} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(val) => (val.length > 10 ? val.substring(0, 8) + '..' : val)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: darkMode ? '#FFFFFF' : '#0F172A',
                  }}
                  formatter={(val: number, name: string) => [
                    `${val} ${name === 'calls' ? 'Departures / Calls' : 'Landings / Discharges'}`,
                    name === 'calls' ? 'Vessel Calls' : 'Berthings',
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="calls" name="Vessel Calls" fill="#465FFF" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="landings" name="Landings" fill="#00D2D3" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 'cargo-tonnage' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ugandaPortTraffic} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(val) => (val.length > 10 ? val.substring(0, 8) + '..' : val)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: darkMode ? '#FFFFFF' : '#0F172A',
                  }}
                  formatter={(val: number) => [`${val.toLocaleString()} Metric Tonnes`, 'Cargo Throughput']}
                />
                <Bar dataKey="cargoMT" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={24}>
                  {ugandaPortTraffic.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PORT_COLORS[index % PORT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 'regional-hub' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalHubTraffic} layout="vertical" margin={{ top: 5, right: 15, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                  tickFormatter={(val) => val.split('(')[0].trim()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: darkMode ? '#FFFFFF' : '#0F172A',
                  }}
                  formatter={(val: any, name: string) => [
                    `${val} ${name === 'calls' ? 'Voyage Calls' : 'MT'}`,
                    name === 'calls' ? 'Port Calls' : 'Cargo Handled',
                  ]}
                />
                <Bar dataKey="calls" fill="#465FFF" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {regionalHubTraffic.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PORT_COLORS[(index + 1) % PORT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 text-blue-500" />
          <span>Lake Victoria Inland Waterway Corridor Synced</span>
        </div>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero Berth Congestion</span>
      </div>
    </div>
  );
};
