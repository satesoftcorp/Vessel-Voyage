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
  LineChart,
  Line,
  ComposedChart,
} from 'recharts';
import {
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  LifeBuoy,
  Flame,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { IncidentRecord } from '../../types';

interface IncidentSafetyRiskChartProps {
  incidents: IncidentRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#10B981',
};

export const IncidentSafetyRiskChart: React.FC<IncidentSafetyRiskChartProps> = ({
  incidents = [],
  darkMode,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'severity' | 'trend' | 'category' | 'root-cause'>('severity');

  // Severity Breakdown
  const severityData = useMemo(() => {
    const counts: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    incidents.forEach((inc) => {
      if (counts[inc.severity] !== undefined) {
        counts[inc.severity]++;
      } else {
        counts['Medium']++;
      }
    });

    const total = incidents.length || 1;
    return Object.entries(counts).map(([severity, count]) => ({
      severity,
      count,
      color: SEVERITY_COLORS[severity],
      percentage: ((count / total) * 100).toFixed(0),
    }));
  }, [incidents]);

  // Monthly Incident Safety Trend
  const monthlyTrendData = useMemo(() => {
    return [
      { month: 'Mar', reported: 3, resolved: 3, nearMiss: 5 },
      { month: 'Apr', reported: 4, resolved: 4, nearMiss: 7 },
      { month: 'May', reported: 2, resolved: 2, nearMiss: 4 },
      { month: 'Jun', reported: 5, resolved: 4, nearMiss: 6 },
      { month: 'Jul', reported: 3, resolved: 3, nearMiss: 8 },
      { month: 'Aug (Live)', reported: incidents.length > 0 ? incidents.length : 4, resolved: 3, nearMiss: 6 },
    ];
  }, [incidents]);

  // Incident Categories
  const categoryData = useMemo(() => {
    return [
      { name: 'Machinery / Propulsion', count: 4, color: '#F59E0B' },
      { name: 'Navigation & Near-Miss', count: 3, color: '#38BDF8' },
      { name: 'Severe Weather / Swell', count: 2, color: '#8B5CF6' },
      { name: 'Cargo Handling & Lashings', count: 1, color: '#10B981' },
      { name: 'Safety Equipment / PPE', count: 1, color: '#00D2D3' },
    ];
  }, []);

  // Root Cause breakdown
  const rootCauseData = useMemo(() => {
    return [
      { cause: 'Equipment Mechanical Fatigue', share: 42, color: '#F59E0B' },
      { cause: 'Adverse Hydrographic Conditions', share: 28, color: '#38BDF8' },
      { cause: 'Bridge Team Human Factors', share: 18, color: '#8B5CF6' },
      { cause: 'Shore Side Stevedore Handling', share: 12, color: '#10B981' },
    ];
  }, []);

  const openIncidents = incidents.filter((i) => i.status !== 'Closed').length;
  const criticalCount = incidents.filter((i) => i.severity === 'Critical').length;

  return (
    <div
      id="incident-safety-risk-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                QHSE Maritime Safety &amp; Risk Matrix
              </h3>
            </div>
          </div>
          <button
            onClick={() => onNavigate('incidents-voyage')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-0.5"
          >
            <span>QHSE Log</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('severity')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'severity'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Severity
          </button>
          <button
            onClick={() => setTab('trend')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'trend'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Safety Trend
          </button>
          <button
            onClick={() => setTab('category')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'category'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Category
          </button>
          <button
            onClick={() => setTab('root-cause')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'root-cause'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD]'
            }`}
          >
            Root Cause
          </button>
        </div>

        {/* Quick Highlights */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl bg-amber-50/60 dark:bg-amber-950/30 p-2 border border-amber-100/60 dark:border-amber-900/40">
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Open CAPA Actions</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {openIncidents} Under Investigation
            </span>
          </div>
          <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 p-2 border border-emerald-100/60 dark:border-emerald-900/40">
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Critical Incidents</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white block mt-0.5">
              {criticalCount} Critical Active
            </span>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-4 h-[210px] w-full">
          {tab === 'severity' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="severity"
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
                  formatter={(val: number) => [`${val} Incidents`, 'Reported']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {tab === 'trend' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="month"
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
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                <Bar dataKey="reported" fill="#EF4444" name="Incidents" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="resolved" fill="#10B981" name="CAPA Closed" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Line type="monotone" dataKey="nearMiss" fill="#F59E0B" stroke="#F59E0B" name="Near-Misses" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {tab === 'category' && (
            <div className="h-full flex flex-col justify-center space-y-2.5">
              {categoryData.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{cat.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{cat.count} Events</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(cat.count / 10) * 100}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'root-cause' && (
            <div className="h-full flex flex-col justify-center space-y-3">
              {rootCauseData.map((rc, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{rc.cause}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{rc.share}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${rc.share}%`, backgroundColor: rc.color }}
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
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>ISM Code Safety Audit: Compliant</span>
        </div>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">Zero Lost Time Injuries</span>
      </div>
    </div>
  );
};
