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
} from 'recharts';
import {
  Anchor,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { PortRecord, WaterBody, VoyageRecord, LandingRecord } from '../../types';

interface PortTurnaroundBerthChartProps {
  ports: PortRecord[];
  waterBodies: WaterBody[];
  voyages: VoyageRecord[];
  landings: LandingRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

export const PortTurnaroundBerthChart: React.FC<PortTurnaroundBerthChartProps> = ({
  ports,
  waterBodies,
  voyages,
  landings,
  darkMode,
  onNavigate,
}) => {
  const [filterType, setFilterType] = useState<'uganda' | 'international' | 'berth-utilization'>('uganda');

  // Uganda inland ports turnaround and berth data
  const ugandaPortData = useMemo(() => {
    return [
      { name: 'Port Bell', turnaroundHrs: 4.8, waitingHrs: 1.1, berthOccupancy: 82, waterBody: 'Lake Victoria', berths: 6 },
      { name: 'Jinja Pier', turnaroundHrs: 3.6, waitingHrs: 0.8, berthOccupancy: 74, waterBody: 'Lake Victoria', berths: 4 },
      { name: 'Bukasa Port', turnaroundHrs: 5.2, waitingHrs: 1.4, berthOccupancy: 68, waterBody: 'Lake Victoria', berths: 8 },
      { name: 'Entebbe Pier', turnaroundHrs: 2.9, waitingHrs: 0.5, berthOccupancy: 62, waterBody: 'Lake Victoria', berths: 3 },
      { name: 'Kalangala Pier', turnaroundHrs: 2.2, waitingHrs: 0.4, berthOccupancy: 58, waterBody: 'Lake Victoria', berths: 2 },
      { name: 'Butiaba Pier', turnaroundHrs: 3.4, waitingHrs: 0.9, berthOccupancy: 48, waterBody: 'Lake Albert', berths: 3 },
      { name: 'Kasenyi Port', turnaroundHrs: 2.6, waitingHrs: 0.6, berthOccupancy: 52, waterBody: 'Lake Victoria', berths: 2 },
    ];
  }, []);

  // International maritime hubs turnaround
  const internationalPortData = useMemo(() => {
    return [
      { name: 'Rotterdam (NLRTM)', turnaroundHrs: 18.4, waitingHrs: 3.2, berthOccupancy: 89, waterBody: 'North Sea', berths: 48 },
      { name: 'Singapore (SGSIN)', turnaroundHrs: 16.2, waitingHrs: 2.8, berthOccupancy: 94, waterBody: 'Malacca Strait', berths: 64 },
      { name: 'Shanghai (CNSHA)', turnaroundHrs: 21.0, waitingHrs: 4.1, berthOccupancy: 92, waterBody: 'East China Sea', berths: 82 },
      { name: 'Mombasa (KEMBA)', turnaroundHrs: 24.5, waitingHrs: 5.4, berthOccupancy: 86, waterBody: 'Indian Ocean', berths: 16 },
      { name: 'Dar es Salaam (TZDAR)', turnaroundHrs: 26.8, waitingHrs: 6.2, berthOccupancy: 84, waterBody: 'Indian Ocean', berths: 12 },
    ];
  }, []);

  const activeData = filterType === 'uganda' ? ugandaPortData : filterType === 'international' ? internationalPortData : ugandaPortData;

  const avgTurnaround = (ugandaPortData.reduce((a, b) => a + b.turnaroundHrs, 0) / ugandaPortData.length).toFixed(1);
  const avgOccupancy = Math.round(ugandaPortData.reduce((a, b) => a + b.berthOccupancy, 0) / ugandaPortData.length);

  return (
    <div
      id="port-turnaround-berth-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#465FFF] dark:text-blue-400">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Port Turnaround &amp; Berth Occupancy
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Vessel discharge turnaround duration (hours) and real-time berth utilization
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('water-body-ports')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Port Facilities</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="mt-4 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setFilterType('uganda')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              filterType === 'uganda'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Uganda Inland Ports
          </button>
          <button
            onClick={() => setFilterType('international')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              filterType === 'international'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Coastal &amp; Regional Hubs
          </button>
          <button
            onClick={() => setFilterType('berth-utilization')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              filterType === 'berth-utilization'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Berth Utilization %
          </button>
        </div>

        {/* Highlight Summary Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-2.5">
            <span className="text-[11px] font-medium text-gray-500 dark:text-[#8A99AD]">Avg Inland Turnaround</span>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-0.5">
              {avgTurnaround} Hours
            </p>
          </div>
          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-2.5">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400">Mean Berth Occupancy</span>
            <p className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300 mt-0.5">
              {avgOccupancy}% In-Use
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-2.5">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">On-Berth Clearance</span>
            <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              98.2% Direct Berthing
            </p>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-5 h-[230px] w-full">
          {filterType !== 'berth-utilization' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={(val) => (val.length > 12 ? val.substring(0, 10) + '..' : val)}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}h`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(val: any, name: string) => [
                    `${val} Hours`,
                    name === 'turnaroundHrs' ? 'Turnaround Duration' : 'Pre-Berth Waiting Time',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'turnaroundHrs' ? 'Turnaround Time (Hrs)' : 'Anchorage Waiting (Hrs)')}
                />
                <Bar dataKey="turnaroundHrs" fill="#465FFF" radius={[6, 6, 0, 0]} maxBarSize={28} />
                <Bar dataKey="waitingHrs" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col justify-between space-y-2 py-1">
              {ugandaPortData.map((port, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{port.name}</span>
                    <span className="text-[10px] text-gray-400">({port.berths} Berths)</span>
                  </div>
                  <div className="flex-1 mx-3 h-2.5 rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        port.berthOccupancy > 80
                          ? 'bg-amber-500'
                          : port.berthOccupancy > 60
                          ? 'bg-[#465FFF]'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${port.berthOccupancy}%` }}
                    />
                  </div>
                  <div className="text-right min-w-[50px]">
                    <span className="font-bold text-gray-900 dark:text-white">{port.berthOccupancy}%</span>
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
          <Anchor className="h-3.5 w-3.5 text-blue-500" />
          <span>Automated Pilotage &amp; Mooring Log Active</span>
        </div>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Port Operations SOP V4</span>
      </div>
    </div>
  );
};
