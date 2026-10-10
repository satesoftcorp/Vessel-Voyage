import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DayAnalytics } from '../types';
import {
  Users,
  User,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  Layers,
  Activity,
  Download,
  Calendar,
  Clock,
  Ship,
  Sparkles,
} from 'lucide-react';

export type AnalyticsTimeframe = '24 hours' | '7 days' | 'month-weeks' | '30 days' | '12 months';

interface AnalyticsBarChartProps {
  data: DayAnalytics[];
  timeframe: AnalyticsTimeframe;
  setTimeframe: (tf: AnalyticsTimeframe) => void;
  darkMode: boolean;
  onExportReport?: () => void;
}

export const AnalyticsBarChart: React.FC<AnalyticsBarChartProps> = ({
  data,
  timeframe,
  setTimeframe,
  darkMode,
  onExportReport,
}) => {
  const [chartType, setChartType] = useState<'stacked' | 'grouped' | 'area'>('stacked');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  const timeframes: { id: AnalyticsTimeframe; label: string; sub: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: '24 hours', label: '24 Hours', sub: 'Per Day (Hourly)', icon: Clock },
    { id: '7 days', label: '7 Days', sub: 'Per Week (Daily)', icon: Calendar },
    { id: 'month-weeks', label: 'Month per Week', sub: 'Weekly in Month', icon: Layers },
    { id: '30 days', label: '30 Days', sub: 'Full Month (Daily)', icon: Calendar },
    { id: '12 months', label: '12 Months', sub: 'Per Year (Monthly)', icon: Activity },
  ];

  // Aggregated totals for the active timeframe dataset
  const totals = useMemo(() => {
    const totalPassengers = data.reduce((acc, curr) => acc + (curr.total || curr.male + curr.female || curr.visitors || 0), 0);
    const totalMale = data.reduce((acc, curr) => acc + (curr.male || Math.round((curr.visitors || 0) * 0.54)), 0);
    const totalFemale = data.reduce((acc, curr) => acc + (curr.female || Math.round((curr.visitors || 0) * 0.46)), 0);
    const maleRatio = totalPassengers > 0 ? ((totalMale / totalPassengers) * 100).toFixed(1) : '50.0';
    const femaleRatio = totalPassengers > 0 ? ((totalFemale / totalPassengers) * 100).toFixed(1) : '50.0';

    // Find peak slot
    let peakSlot = data[0];
    for (const item of data) {
      const itemTotal = item.total || item.male + item.female;
      const peakTotal = peakSlot ? (peakSlot.total || peakSlot.male + peakSlot.female) : 0;
      if (itemTotal > peakTotal) {
        peakSlot = item;
      }
    }

    const avgPerSlot = data.length > 0 ? Math.round(totalPassengers / data.length) : 0;

    return {
      totalPassengers,
      totalMale,
      totalFemale,
      maleRatio,
      femaleRatio,
      peakSlot,
      avgPerSlot,
    };
  }, [data]);

  // Max value calculation for clean Y-axis scale
  const maxY = useMemo(() => {
    if (!data.length) return 100;
    const maxVal = Math.max(
      ...data.map((d) => {
        if (chartType === 'stacked') {
          return d.total || (d.male + d.female) || d.visitors;
        }
        return Math.max(d.male || 0, d.female || 0);
      })
    );
    // Round up nicely
    const magnitude = Math.pow(10, Math.floor(Math.log10(maxVal || 1)));
    return Math.ceil((maxVal * 1.15) / magnitude) * magnitude;
  }, [data, chartType]);

  const getTimeframeDescription = () => {
    switch (timeframe) {
      case '24 hours':
        return 'Hourly passenger transit volume across maritime ferry routes (24-hour cycle)';
      case '7 days':
        return 'Daily passenger transport volume and gender demographics over the last 7 days (Weekly)';
      case 'month-weeks':
        return 'Monthly passenger transport grouped per week (Weeks 1 to 5 of the current month)';
      case '30 days':
        return 'Day-by-day passenger transport volume and gender demographics for the past 30 days';
      case '12 months':
        return 'Annual month-by-month passenger transport volume and gender distribution (Yearly)';
      default:
        return 'Passenger transport volume and gender demographics';
    }
  };

  const getTimeframeUnit = () => {
    switch (timeframe) {
      case '24 hours':
        return 'Time Slot';
      case '7 days':
        return 'Day';
      case 'month-weeks':
        return 'Week Period';
      case '30 days':
        return 'Day of Month';
      case '12 months':
        return 'Month';
      default:
        return 'Period';
    }
  };

  // Color constants
  const MALE_COLOR = '#3B82F6'; // Crisp Blue
  const FEMALE_COLOR = '#10B981'; // Crisp Emerald
  const TOTAL_COLOR = '#8B5CF6'; // Purple

  return (
    <div
      id="passenger-transport-analytics-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 md:p-6 shadow-xs space-y-6"
    >
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#465FFF]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>People Transported Analytics</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                  Male &amp; Female Breakdown
                </span>
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                {getTimeframeDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-gray-100/90 dark:bg-[#24303F] p-1.5">
          {timeframes.map((tf) => {
            const Icon = tf.icon;
            const isActive = timeframe === tf.id;
            return (
              <button
                key={tf.id}
                id={`timeframe-btn-${tf.id.replace(' ', '-')}`}
                onClick={() => setTimeframe(tf.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-white shadow-xs'
                    : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
                }`}
                title={tf.sub}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">{tf.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Summary Strip for Selected Timeframe */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50/80 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
        {/* Total People */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span>Total Transported</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {totals.totalPassengers.toLocaleString()} <span className="text-xs font-normal text-gray-400">pax</span>
          </p>
          <span className="text-[11px] text-gray-400 dark:text-[#8A99AD]">
            Avg: {totals.avgPerSlot.toLocaleString()} /{getTimeframeUnit().toLowerCase()}
          </span>
        </div>

        {/* Male Passengers */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
            <User className="h-3.5 w-3.5" />
            <span>Male Transported</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
            {totals.totalMale.toLocaleString()} <span className="text-xs font-normal text-blue-400/80">({totals.maleRatio}%)</span>
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${totals.maleRatio}%` }} />
          </div>
        </div>

        {/* Female Passengers */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Female Transported</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {totals.totalFemale.toLocaleString()} <span className="text-xs font-normal text-emerald-400/80">({totals.femaleRatio}%)</span>
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${totals.femaleRatio}%` }} />
          </div>
        </div>

        {/* Peak Slot */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Peak Volume Slot</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            {totals.peakSlot ? `${totals.peakSlot.label}` : 'N/A'}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {totals.peakSlot ? `${(totals.peakSlot.total || totals.peakSlot.male + totals.peakSlot.female).toLocaleString()} pax transported` : ''}
          </span>
        </div>
      </div>

      {/* Chart Configuration Controls (Chart Style & Gender Filter) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
        {/* Gender Filter Buttons */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-500 dark:text-[#8A99AD]">Display:</span>
          <div className="flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1">
            <button
              onClick={() => setGenderFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                genderFilter === 'all'
                  ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900'
              }`}
            >
              All (Male &amp; Female)
            </button>
            <button
              onClick={() => setGenderFilter('male')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                genderFilter === 'male'
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-blue-600'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Male Only</span>
            </button>
            <button
              onClick={() => setGenderFilter('female')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                genderFilter === 'female'
                  ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-emerald-600'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Female Only</span>
            </button>
          </div>
        </div>

        {/* Chart Style Toggle (Stacked vs Grouped vs Area) */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-500 dark:text-[#8A99AD]">Chart View:</span>
          <div className="flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-1">
            <button
              onClick={() => setChartType('stacked')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartType === 'stacked'
                  ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900'
              }`}
              title="Stacked Bars (Total Height = Combined Male + Female)"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Stacked</span>
            </button>
            <button
              onClick={() => setChartType('grouped')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartType === 'grouped'
                  ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900'
              }`}
              title="Grouped Bars (Male and Female side-by-side)"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartType === 'area'
                  ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-white shadow-2xs font-semibold'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900'
              }`}
              title="Area Curve Trend"
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Trend Area</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Container */}
      <div className="h-[320px] sm:h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="maleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={MALE_COLOR} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={MALE_COLOR} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="femaleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={FEMALE_COLOR} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={FEMALE_COLOR} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke={darkMode ? '#2E3A47' : '#F1F5F9'}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, maxY]}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip
                cursor={{ stroke: darkMode ? '#2E3A47' : '#CBD5E1', strokeWidth: 1 }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DayAnalytics;
                    const maleVal = item.male || 0;
                    const femaleVal = item.female || 0;
                    const totalVal = item.total || (maleVal + femaleVal) || item.visitors;
                    const malePct = totalVal > 0 ? ((maleVal / totalVal) * 100).toFixed(1) : '50.0';
                    const femalePct = totalVal > 0 ? ((femaleVal / totalVal) * 100).toFixed(1) : '50.0';

                    return (
                      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xl text-xs space-y-2.5 min-w-[220px]">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {timeframe === '24 hours' ? `Hour: ${label}` : timeframe === '30 days' ? `Day ${label}` : label}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {getTimeframeUnit()}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-[#8A99AD]">
                              <Users className="h-3.5 w-3.5 text-[#465FFF]" /> Total People:
                            </span>
                            <span className="text-sm text-[#465FFF]">{totalVal.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              Male:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {maleVal.toLocaleString()} <span className="text-gray-400 text-[10px]">({malePct}%)</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Female:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {femaleVal.toLocaleString()} <span className="text-gray-400 text-[10px]">({femalePct}%)</span>
                            </span>
                          </div>

                          {item.trips && (
                            <div className="pt-2 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-gray-500 dark:text-[#8A99AD] text-[11px]">
                              <span>Ferry Trips: {item.trips}</span>
                              <span>Load Factor: {item.capacityUtil}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(genderFilter === 'all' || genderFilter === 'male') && (
                <Area
                  type="monotone"
                  dataKey="male"
                  name="Male Passengers"
                  stroke={MALE_COLOR}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#maleGradient)"
                />
              )}
              {(genderFilter === 'all' || genderFilter === 'female') && (
                <Area
                  type="monotone"
                  dataKey="female"
                  name="Female Passengers"
                  stroke={FEMALE_COLOR}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#femaleGradient)"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
              barCategoryGap={timeframe === '30 days' ? '12%' : '20%'}
              barGap={2}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke={darkMode ? '#2E3A47' : '#F1F5F9'}
              />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                domain={[0, maxY]}
                tick={{ fill: darkMode ? '#8A99AD' : '#64748B', fontSize: 11 }}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <Tooltip
                cursor={{ fill: darkMode ? '#24303F60' : '#F8FAFC' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DayAnalytics;
                    const maleVal = item.male || 0;
                    const femaleVal = item.female || 0;
                    const totalVal = item.total || (maleVal + femaleVal) || item.visitors;
                    const malePct = totalVal > 0 ? ((maleVal / totalVal) * 100).toFixed(1) : '50.0';
                    const femalePct = totalVal > 0 ? ((femaleVal / totalVal) * 100).toFixed(1) : '50.0';

                    return (
                      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xl text-xs space-y-2.5 min-w-[220px]">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-2">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {timeframe === '24 hours' ? `Hour: ${label}` : timeframe === '30 days' ? `Day ${label}` : label}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            {getTimeframeUnit()}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white">
                            <span className="flex items-center gap-1 text-gray-500 dark:text-[#8A99AD]">
                              <Users className="h-3.5 w-3.5 text-[#465FFF]" /> Total People:
                            </span>
                            <span className="text-sm text-[#465FFF]">{totalVal.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                              <span className="h-2 w-2 rounded-full bg-blue-500" />
                              Male:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {maleVal.toLocaleString()} <span className="text-gray-400 text-[10px]">({malePct}%)</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-500" />
                              Female:
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {femaleVal.toLocaleString()} <span className="text-gray-400 text-[10px]">({femalePct}%)</span>
                            </span>
                          </div>

                          {item.trips && (
                            <div className="pt-2 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-gray-500 dark:text-[#8A99AD] text-[11px]">
                              <span>Ferry Trips: {item.trips}</span>
                              <span>Load Factor: {item.capacityUtil}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {(genderFilter === 'all' || genderFilter === 'male') && (
                <Bar
                  dataKey="male"
                  name="Male"
                  stackId={chartType === 'stacked' ? 'gender' : undefined}
                  fill={MALE_COLOR}
                  radius={chartType === 'stacked' && genderFilter === 'all' ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  animationDuration={800}
                />
              )}
              {(genderFilter === 'all' || genderFilter === 'female') && (
                <Bar
                  dataKey="female"
                  name="Female"
                  stackId={chartType === 'stacked' ? 'gender' : undefined}
                  fill={FEMALE_COLOR}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Waterway Corridor Demographics Summary Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47] text-xs">
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#3B82F6]" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Male Passengers ({totals.maleRatio}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#10B981]" />
            <span className="font-medium text-gray-700 dark:text-gray-300">Female Passengers ({totals.femaleRatio}%)</span>
          </div>
        </div>

        {/* Action button: Export demographic digest */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onExportReport) {
                onExportReport();
              } else {
                alert(`Exporting passenger demographic breakdown for ${timeframe} (CSV/PDF)`);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-[#465FFF]" />
            <span>Export Passenger Manifest Telemetry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
