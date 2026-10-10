import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import {
  Smartphone,
  Users,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';
import { PassengerManifestRecord, VoyageRecord } from '../../types';

interface SmsCheckinPassengerFlowChartProps {
  passengersList: PassengerManifestRecord[];
  voyages: VoyageRecord[];
  darkMode: boolean;
  onNavigate: (view: string) => void;
}

export const SmsCheckinPassengerFlowChart: React.FC<SmsCheckinPassengerFlowChartProps> = ({
  passengersList,
  voyages,
  darkMode,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'hourly-flow' | 'channel-split' | 'gateway-health'>('hourly-flow');

  // Hourly passenger check-in arrival curve (Peak departures morning & evening)
  const hourlyData = useMemo(() => {
    return [
      { time: '05:00', smsCheckins: 42, counterCheckins: 18, total: 60, latencyMs: 240 },
      { time: '06:00', smsCheckins: 88, counterCheckins: 32, total: 120, latencyMs: 280 },
      { time: '07:00', smsCheckins: 145, counterCheckins: 48, total: 193, latencyMs: 310 },
      { time: '08:00 (Peak)', smsCheckins: 210, counterCheckins: 62, total: 272, latencyMs: 340 },
      { time: '09:00', smsCheckins: 130, counterCheckins: 38, total: 168, latencyMs: 260 },
      { time: '11:00', smsCheckins: 75, counterCheckins: 24, total: 99, latencyMs: 220 },
      { time: '13:00', smsCheckins: 92, counterCheckins: 28, total: 120, latencyMs: 230 },
      { time: '15:00', smsCheckins: 160, counterCheckins: 45, total: 205, latencyMs: 290 },
      { time: '17:00 (Peak)', smsCheckins: 240, counterCheckins: 55, total: 295, latencyMs: 350 },
      { time: '19:00', smsCheckins: 110, counterCheckins: 30, total: 140, latencyMs: 250 },
    ];
  }, []);

  // Check-In Channel Split
  const channelSplit = useMemo(() => {
    return [
      { name: 'SMS Shortcode 8199 (Self-Service)', percentage: 72, count: 1840, color: '#465FFF' },
      { name: 'Port Counter Terminal (Agent Entry)', percentage: 19, count: 485, color: '#00D2D3' },
      { name: 'Mobile Passenger App / QR Pass', percentage: 9, count: 230, color: '#10B981' },
    ];
  }, []);

  const totalTodayCheckins = hourlyData.reduce((a, b) => a + b.total, 0);
  const smsSelfServiceRate = '72.4%';

  return (
    <div
      id="sms-checkin-passenger-flow-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#465FFF] dark:text-blue-400">
              <Smartphone className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                SMS 8199 Self Check-In &amp; Passenger Flow
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Real-time passenger manifest check-in volume, SMS 8199 shortcode telemetry, and peak flows
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('manifest-passengers')}
            className="text-xs font-semibold text-[#465FFF] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Passenger Manifest</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Switcher */}
        <div className="mt-4 flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('hourly-flow')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'hourly-flow'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Hourly Boarding Flow
          </button>
          <button
            onClick={() => setTab('channel-split')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'channel-split'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Channel Breakdown
          </button>
          <button
            onClick={() => setTab('gateway-health')}
            className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
              tab === 'gateway-health'
                ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Gateway SLA &amp; Speed
          </button>
        </div>

        {/* Highlight Stats Badges */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-2.5">
            <span className="text-[11px] font-medium text-gray-500 dark:text-[#8A99AD]">Today Check-ins</span>
            <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white mt-0.5">
              {totalTodayCheckins.toLocaleString()} Pax
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 p-2.5">
            <span className="text-[11px] font-medium text-[#465FFF] dark:text-blue-400">SMS 8199 Adoption</span>
            <p className="text-sm sm:text-base font-bold text-[#465FFF] dark:text-blue-300 mt-0.5">
              {smsSelfServiceRate}
            </p>
          </div>
          <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 p-2.5">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">SMS Gateway Uptime</span>
            <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
              99.98% SLA
            </p>
          </div>
        </div>

        {/* Chart View */}
        <div className="mt-5 h-[230px] w-full">
          {tab === 'hourly-flow' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#2E3A47' : '#F1F5F9'} vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: darkMode ? '#8A99AD' : '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
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
                    `${val} Passengers`,
                    name === 'smsCheckins' ? 'SMS Shortcode 8199' : 'Counter / Agent Entry',
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  formatter={(val) => (val === 'smsCheckins' ? 'SMS 8199 Self-Service' : 'Port Counter Desk')}
                />
                <Bar dataKey="smsCheckins" fill="#465FFF" stackId="a" radius={[0, 0, 0, 0]} maxBarSize={28} />
                <Bar dataKey="counterCheckins" fill="#00D2D3" stackId="a" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {tab === 'channel-split' && (
            <div className="h-full flex flex-col justify-center space-y-4">
              {channelSplit.map((channel, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{channel.name}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {channel.percentage}% ({channel.count.toLocaleString()} Pax)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-[#24303F] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${channel.percentage}%`, backgroundColor: channel.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'gateway-health' && (
            <div className="h-full flex flex-col justify-between space-y-2 py-1">
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-[#8A99AD]">SMS Gateway Average Latency</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">265 ms (Optimal)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-[#8A99AD]">SMS Dispatch Delivery Rate</span>
                  <span className="font-bold text-gray-900 dark:text-white">99.84% Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-600 dark:text-[#8A99AD]">Auto-Assigned Boarding QR Codes</span>
                  <span className="font-bold text-[#465FFF] dark:text-blue-400">100% Attached</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 p-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                <span>Uganda Telecom Aggregator (MTN / Airtel 8199) active with failover routing.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
          <span>FAL Form 6 Electronic Manifest Compliant</span>
        </div>
        <span className="font-semibold text-gray-700 dark:text-gray-300">Shortcode: 8199</span>
      </div>
    </div>
  );
};
