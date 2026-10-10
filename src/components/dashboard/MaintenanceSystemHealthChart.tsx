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
  PieChart,
  Pie,
} from 'recharts';
import {
  Wrench,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Flame,
} from 'lucide-react';
import { VesselMaintenanceTask } from '../../types';

interface MaintenanceSystemHealthChartProps {
  maintenanceList?: VesselMaintenanceTask[];
  maintenanceTasks?: VesselMaintenanceTask[];
  tasks?: any[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10B981',
  'In Progress': '#465FFF',
  Scheduled: '#38BDF8',
  Overdue: '#EF4444',
};

const SYSTEM_COLORS = ['#465FFF', '#00D2D3', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const MaintenanceSystemHealthChart: React.FC<MaintenanceSystemHealthChartProps> = ({
  maintenanceList = [],
  maintenanceTasks = [],
  tasks = [],
  darkMode,
  onNavigate,
}) => {
  const allTasks = maintenanceList.length > 0 ? maintenanceList : maintenanceTasks.length > 0 ? maintenanceTasks : tasks;
  const [tab, setTab] = useState<'status' | 'category' | 'compliance' | 'running-hours'>('status');

  // Status breakdown
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      Completed: 0,
      'In Progress': 0,
      Scheduled: 0,
      Overdue: 0,
    };

    allTasks.forEach((m: any) => {
      if (counts[m.status] !== undefined) {
        counts[m.status]++;
      } else {
        counts['Scheduled']++;
      }
    });

    const total = allTasks.length || 1;
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status],
      percentage: ((count / total) * 100).toFixed(0),
    }));
  }, [allTasks]);

  // System category breakdown
  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {
      'Main Propulsion & Gearbox': 6,
      'Auxiliary Diesel Generators': 5,
      'Navigation, Radar & GMDSS': 4,
      'Hull, Ballast & Piping': 4,
      'Electrical & SCADA Automation': 3,
      'Fire, Safety & Lifeboats': 3,
    };

    return Object.entries(categories).map(([name, count], idx) => ({
      name,
      shortName: name.split('&')[0].trim(),
      count,
      color: SYSTEM_COLORS[idx % SYSTEM_COLORS.length],
    }));
  }, []);

  // Equipment Running Hours vs Service Due
  const runningHoursData = useMemo(() => {
    return [
      { unit: 'Main Engine #1', currentHours: 4280, serviceInterval: 5000, percentage: 85.6, status: 'Normal' },
      { unit: 'Aux Gen 1 (Port)', currentHours: 2150, serviceInterval: 2500, percentage: 86.0, status: 'Normal' },
      { unit: 'Aux Gen 2 (Stbd)', currentHours: 2420, serviceInterval: 2500, percentage: 96.8, status: 'Service Due' },
      { unit: 'Steering Gear Actuator', currentHours: 7800, serviceInterval: 10000, percentage: 78.0, status: 'Normal' },
      { unit: 'Purifier Separator #1', currentHours: 1920, serviceInterval: 2000, percentage: 96.0, status: 'Service Due' },
    ];
  }, []);

  const overdueCount = maintenanceList.filter((m) => m.status === 'Overdue').length;
  const inProgressCount = maintenanceList.filter((m) => m.status === 'In Progress').length;
  const completedCount = maintenanceList.filter((m) => m.status === 'Completed').length;
  const pmsCompliance = '96.4%';

  return (
    <div
      id="maintenance-system-health-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Wrench className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                PMS Technical Maintenance &amp; Machinery Health
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('maintenance-fleet')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-0.5"
          >
            <span>PMS Work Orders</span>
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
            Work Orders
          </button>
          <button
            onClick={() => setTab('category')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'category'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            System Systems
          </button>
          <button
            onClick={() => setTab('compliance')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'compliance'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            PMS Compliance
          </button>
          <button
            onClick={() => setTab('running-hours')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'running-hours'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Running Hours
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-2 border border-emerald-100/60 dark:border-emerald-900/40">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">PMS Compliance</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {pmsCompliance} On-Schedule
            </span>
          </div>
          <div className="rounded-xl bg-blue-50/60 dark:bg-blue-950/30 p-2 border border-blue-100/60 dark:border-blue-900/40">
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block">In Progress Jobs</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {inProgressCount} Active Work Orders
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 h-[210px] w-full">
          {tab === 'status' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="status"
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
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
                  formatter={(val: number) => [`${val} Work Orders`, 'Tasks']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 'category' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 15, left: 15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1C2434' : '#FFFFFF',
                    borderColor: darkMode ? '#2E3A47' : '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: darkMode ? '#FFFFFF' : '#0F172A',
                  }}
                />
                <Bar dataKey="count" fill="#465FFF" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 'compliance' && (
            <div className="h-full flex flex-col justify-between space-y-2 py-1">
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-[#8A99AD]">Class Society (DNV / Lloyd's) Audit Readiness</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Endorsed</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-[#8A99AD]">Mean Time to Repair (MTTR)</span>
                  <span className="font-bold text-gray-900 dark:text-white">4.2 Hours</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-[#8A99AD]">Critical Spares Inventory On-Board</span>
                  <span className="font-bold text-[#465FFF] dark:text-blue-400">98.5% Stocked</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Next major dry dock planned for Q4 2026 (MV Bukasa Ferry).</span>
              </div>
            </div>
          )}

          {tab === 'running-hours' && (
            <div className="h-full flex flex-col justify-between space-y-2 py-0.5">
              {runningHoursData.map((item, idx) => (
                <div key={idx} className="space-y-0.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item.unit}</span>
                    <span className={`font-bold ${item.status === 'Service Due' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {item.currentHours} / {item.serviceInterval} hrs ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.status === 'Service Due' ? 'bg-amber-500' : 'bg-[#465FFF]'}`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div className="flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5 text-blue-500" />
          <span>SCADA Machinery Telemetry Online</span>
        </div>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Zero Critical Engine Faults</span>
      </div>
    </div>
  );
};
