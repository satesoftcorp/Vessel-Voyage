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
  Users,
  IdCard,
  Award,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  UserCheck,
} from 'lucide-react';
import { StaffMember } from '../../types';

interface CrewManningCertificationChartProps {
  staffList: StaffMember[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const RANK_COLORS = ['#465FFF', '#00D2D3', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#38BDF8'];

export const CrewManningCertificationChart: React.FC<CrewManningCertificationChartProps> = ({
  staffList,
  darkMode,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'ranks' | 'stcw-expiry' | 'department'>('ranks');

  // Breakdown by Rank
  const rankData = useMemo(() => {
    const counts: Record<string, number> = {
      'Master / Captain': 6,
      'Chief Officer': 5,
      'Chief Engineer': 5,
      '2nd / 3rd Engineer': 8,
      'Able Seafarer (AB)': 14,
      'Deck / Engine Cadet': 6,
      'Radio / GMDSS Officer': 4,
    };

    staffList.forEach((s) => {
      const role = s.role || 'Able Seafarer (AB)';
      if (counts[role] !== undefined) {
        counts[role]++;
      }
    });

    return Object.entries(counts).map(([name, count], idx) => ({
      name,
      shortName: name.split('/')[0].trim(),
      count,
      color: RANK_COLORS[idx % RANK_COLORS.length],
    }));
  }, [staffList]);

  // STCW Certification Expiration Forecast
  const stcwExpiryData = useMemo(() => {
    return [
      { status: 'Valid (> 180 Days)', count: 38, color: '#10B981', badge: 'Compliant' },
      { status: 'Expiring in 90-180 Days', count: 7, color: '#3B82F6', badge: 'Scheduled' },
      { status: 'Expiring in 30-90 Days', count: 3, color: '#F59E0B', badge: 'Action Required' },
      { status: 'Expiring < 30 Days', count: 1, color: '#EF4444', badge: 'Critical Renewal' },
      { status: 'Overdue / Lapsed', count: 0, color: '#DC2626', badge: 'Zero Lapses' },
    ];
  }, []);

  // Department distribution
  const departmentData = useMemo(() => {
    return [
      { name: 'Deck Operations', count: 24, color: '#465FFF' },
      { name: 'Engine & Propulsion', count: 16, color: '#00D2D3' },
      { name: 'QHSE & Maritime Safety', count: 6, color: '#10B981' },
      { name: 'Catering & Logistics', count: 8, color: '#F59E0B' },
      { name: 'Port & Shore Technical', count: 5, color: '#8B5CF6' },
    ];
  }, []);

  const totalCrew = rankData.reduce((a, b) => a + b.count, 0);
  const stcwComplianceRate = '97.9%';

  return (
    <div
      id="crew-manning-certification-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <UserCheck className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                Crew Manning &amp; STCW Certification
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Watchkeeping officer ranks, deck/engine crew, and maritime qualification validity
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('crew')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Crew Register</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View Switcher */}
        <div className="mt-4 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('ranks')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'ranks'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Crew by Rank
          </button>
          <button
            onClick={() => setTab('stcw-expiry')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'stcw-expiry'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            STCW Expiry Forecast
          </button>
          <button
            onClick={() => setTab('department')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'department'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Departments
          </button>
        </div>

        {/* Highlight Stats Badges */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-2.5">
            <span className="text-[11px] font-medium text-gray-500 dark:text-[#8A99AD]">Total Active Seafarers</span>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-0.5">
              {totalCrew} Personnel
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-2.5">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">STCW Compliance</span>
            <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              {stcwComplianceRate}
            </p>
          </div>
          <div className="rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 p-2.5">
            <span className="text-[11px] font-medium text-purple-700 dark:text-purple-400">Safe Manning Levels</span>
            <p className="text-sm sm:text-base font-bold text-purple-700 dark:text-purple-300 mt-0.5">
              100% Certified
            </p>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-5 h-[230px] w-full">
          {tab === 'ranks' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankData} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 0 }}>
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
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(val: any) => [`${val} Certified Officers / Crew`, 'Active Manning']}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {rankData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 'stcw-expiry' && (
            <div className="h-full flex flex-col justify-between space-y-2 py-1">
              {stcwExpiryData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-[150px]">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{item.status}</span>
                  </div>
                  <div className="flex-1 mx-3 h-2.5 rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.count / 49) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                  <div className="text-right min-w-[70px]">
                    <span className="font-bold text-gray-900 dark:text-white">{item.count} Licensures</span>
                  </div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 p-2 text-[11px] text-blue-800 dark:text-blue-300">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span>Automated 90-day renewal alerts dispatched to seafarer profiles and port agents.</span>
              </div>
            </div>
          )}

          {tab === 'department' && (
            <div className="h-full flex flex-col justify-center space-y-3">
              {departmentData.map((dept, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{dept.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {dept.count} Members ({Math.round((dept.count / 59) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(dept.count / 59) * 100}%`, backgroundColor: dept.color }}
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
          <Award className="h-3.5 w-3.5 text-purple-500" />
          <span>STCW 2010 Manila Amendments Audited</span>
        </div>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero Uncertified Watchkeepers</span>
      </div>
    </div>
  );
};
