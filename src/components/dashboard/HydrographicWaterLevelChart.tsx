import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ComposedChart,
} from 'recharts';
import {
  Waves,
  Compass,
  Wind,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Gauge,
  Navigation,
} from 'lucide-react';
import { WaterBody, PortRecord, VoyageRecord } from '../../types';

interface HydrographicWaterLevelChartProps {
  waterBodies: WaterBody[];
  ports: PortRecord[];
  voyages: VoyageRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

export const HydrographicWaterLevelChart: React.FC<HydrographicWaterLevelChartProps> = ({
  waterBodies,
  ports,
  voyages,
  darkMode,
  onNavigate,
}) => {
  const [selectedWaterBody, setSelectedWaterBody] = useState<string>('Lake Victoria');

  // Seasonal hydrographic soundings and water gauge telemetry (m above Chart Datum)
  const lakeVictoriaHydroData = [
    { month: 'Jan', depthMeters: 12.8, windKnots: 11, waveHeightM: 0.8, status: 'Safe' },
    { month: 'Feb', depthMeters: 12.9, windKnots: 13, waveHeightM: 0.9, status: 'Safe' },
    { month: 'Mar', depthMeters: 13.2, windKnots: 15, waveHeightM: 1.1, status: 'Safe' },
    { month: 'Apr (Rainy)', depthMeters: 13.7, windKnots: 18, waveHeightM: 1.5, status: 'Advisory' },
    { month: 'May (Peak)', depthMeters: 14.1, windKnots: 19, waveHeightM: 1.6, status: 'Advisory' },
    { month: 'Jun', depthMeters: 13.8, windKnots: 14, waveHeightM: 1.2, status: 'Safe' },
    { month: 'Jul', depthMeters: 13.4, windKnots: 12, waveHeightM: 0.9, status: 'Safe' },
    { month: 'Aug (Live)', depthMeters: 13.3, windKnots: 14, waveHeightM: 1.0, status: 'Safe' },
  ];

  const lakeAlbertHydroData = [
    { month: 'Jan', depthMeters: 24.2, windKnots: 14, waveHeightM: 1.1, status: 'Safe' },
    { month: 'Feb', depthMeters: 24.4, windKnots: 15, waveHeightM: 1.2, status: 'Safe' },
    { month: 'Mar', depthMeters: 24.8, windKnots: 17, waveHeightM: 1.4, status: 'Safe' },
    { month: 'Apr (Rainy)', depthMeters: 25.4, windKnots: 21, waveHeightM: 1.8, status: 'Advisory' },
    { month: 'May (Peak)', depthMeters: 25.9, windKnots: 22, waveHeightM: 2.1, status: 'Warning' },
    { month: 'Jun', depthMeters: 25.3, windKnots: 16, waveHeightM: 1.5, status: 'Safe' },
    { month: 'Jul', depthMeters: 24.9, windKnots: 13, waveHeightM: 1.0, status: 'Safe' },
    { month: 'Aug (Live)', depthMeters: 24.7, windKnots: 15, waveHeightM: 1.2, status: 'Safe' },
  ];

  const lakeKyogaHydroData = [
    { month: 'Jan', depthMeters: 4.8, windKnots: 9, waveHeightM: 0.5, status: 'Safe' },
    { month: 'Feb', depthMeters: 4.9, windKnots: 10, waveHeightM: 0.6, status: 'Safe' },
    { month: 'Mar', depthMeters: 5.2, windKnots: 12, waveHeightM: 0.7, status: 'Safe' },
    { month: 'Apr (Rainy)', depthMeters: 5.8, windKnots: 14, waveHeightM: 0.9, status: 'Safe' },
    { month: 'May (Peak)', depthMeters: 6.2, windKnots: 16, waveHeightM: 1.1, status: 'Advisory' },
    { month: 'Jun', depthMeters: 5.9, windKnots: 11, waveHeightM: 0.8, status: 'Safe' },
    { month: 'Jul', depthMeters: 5.4, windKnots: 10, waveHeightM: 0.6, status: 'Safe' },
    { month: 'Aug (Live)', depthMeters: 5.3, windKnots: 11, waveHeightM: 0.7, status: 'Safe' },
  ];

  const chartData =
    selectedWaterBody === 'Lake Albert'
      ? lakeAlbertHydroData
      : selectedWaterBody === 'Lake Kyoga'
      ? lakeKyogaHydroData
      : lakeVictoriaHydroData;

  const currentLevel = chartData[chartData.length - 1].depthMeters;
  const currentWind = chartData[chartData.length - 1].windKnots;
  const currentWave = chartData[chartData.length - 1].waveHeightM;

  return (
    <div
      id="hydrographic-water-level-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">
              <Waves className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Hydrographic Soundings &amp; Water Levels
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Bathymetric water levels above chart datum, wind velocity (knots), and wave swell index
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('uganda-map')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Interactive Map</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Water Body Selector */}
        <div className="mt-4 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          {['Lake Victoria', 'Lake Albert', 'Lake Kyoga'].map((wb) => (
            <button
              key={wb}
              onClick={() => setSelectedWaterBody(wb)}
              className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                selectedWaterBody === wb
                  ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {wb}
            </button>
          ))}
        </div>

        {/* Current Soundings Cards */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/40 p-2.5">
            <span className="text-[11px] font-medium text-cyan-700 dark:text-cyan-400">Current Gauge Depth</span>
            <p className="text-sm sm:text-base font-bold text-cyan-700 dark:text-cyan-300 mt-0.5">
              {currentLevel} Meters
            </p>
          </div>
          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-2.5">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Wind Velocity</span>
            <p className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300 mt-0.5">
              {currentWind} Knots (Moderate)
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-2.5">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Wave Swell Height</span>
            <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {currentWave}m (Safe Passage)
            </p>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-5 h-[230px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D2D3" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00D2D3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}m`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 30]}
                tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}kts`}
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
                  if (name === 'depthMeters') return [`${val} Meters`, 'Water Depth'];
                  if (name === 'windKnots') return [`${val} Knots`, 'Wind Speed'];
                  if (name === 'waveHeightM') return [`${val} Meters`, 'Wave Height'];
                  return [val, name];
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                formatter={(val) => (val === 'depthMeters' ? 'Gauge Depth (Meters)' : 'Wind Speed (Knots)')}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="depthMeters"
                stroke="#00D2D3"
                strokeWidth={2.5}
                fill="url(#depthGrad)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="windKnots"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3B82F6' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div className="flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-cyan-500" />
          <span>Uganda National Hydrographic Office (UNHO) Telemetry Feed</span>
        </div>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">UKHO ENC Admiralty Charts Synced</span>
      </div>
    </div>
  );
};
