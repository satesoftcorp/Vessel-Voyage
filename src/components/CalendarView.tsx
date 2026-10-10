import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Ship,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  User,
  Phone,
  Filter,
  Layers,
  Search,
  Eye,
  ArrowRight,
  Boxes,
  Users,
  Anchor,
  Sparkles,
  CalendarDays,
  List,
  Grid,
  X,
  Activity,
  Building2,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  VoyageRecord,
  IncidentRecord,
  Vessel,
  IncidentSeverity,
  IncidentStatus,
} from '../types';

export interface VesselDayAggregate {
  vesselName: string;
  vesselId?: string;
  vessel?: Vessel;
  voyages: VoyageRecord[];
  stage: 'Departing' | 'En Route' | 'Arriving' | 'Scheduled';
  totalPassengers: number;
  totalCargoMT: number;
  totalVehicles: number;
}

export interface DayCalendarAggregate {
  voyagesByVessel: Record<string, VesselDayAggregate>;
  incidents: IncidentRecord[];
  criticalIncidentCount: number;
  highIncidentCount: number;
  mediumIncidentCount: number;
  lowIncidentCount: number;
}

interface CalendarViewProps {
  voyages: VoyageRecord[];
  incidents: IncidentRecord[];
  vessels: Vessel[];
  onNavigateToVoyages?: () => void;
  onNavigateToIncidents?: () => void;
  onSelectVoyage?: (voyage: VoyageRecord) => void;
  onSelectIncident?: (incident: IncidentRecord) => void;
}

// Helper to format YYYY-MM-DD
const formatDateStr = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Check if two dates are the same day
const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  voyages = [],
  incidents = [],
  vessels = [],
  onNavigateToVoyages,
  onNavigateToIncidents,
  onSelectVoyage,
  onSelectIncident,
}) => {
  // Default calendar month is August 2026
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-08-23T00:00:00'));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-08-22');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [vesselFilter, setVesselFilter] = useState<string>('ALL');
  const [layerFilter, setLayerFilter] = useState<'ALL' | 'VOYAGES' | 'INCIDENTS'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(true);

  // Selected Day Object for the drawer
  const selectedDate = useMemo(() => {
    return new Date(selectedDateStr + 'T00:00:00');
  }, [selectedDateStr]);

  // Navigate Months
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date('2026-08-23T00:00:00');
    setCurrentDate(today);
    setSelectedDateStr('2026-08-23');
  };

  // Compute month days grid (42 cells)
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    const totalDaysInMonth = lastDay.getDate();

    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, dateStr: formatDateStr(d), isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, dateStr: formatDateStr(d), isCurrentMonth: true });
    }

    // Next month filler days to complete grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, dateStr: formatDateStr(d), isCurrentMonth: false });
    }

    return { days, year, month, totalDaysInMonth };
  }, [currentDate]);

  // Aggregate voyages and incidents by Date
  const calendarAggregates = useMemo<Record<string, DayCalendarAggregate>>(() => {
    const map: Record<string, DayCalendarAggregate> = {};

    const ensureDate = (dStr: string): DayCalendarAggregate => {
      if (!map[dStr]) {
        map[dStr] = {
          voyagesByVessel: {},
          incidents: [],
          criticalIncidentCount: 0,
          highIncidentCount: 0,
          mediumIncidentCount: 0,
          lowIncidentCount: 0,
        };
      }
      return map[dStr];
    };

    // 1. Process Voyages Aggregated for each Vessel for each day
    voyages.forEach((voy) => {
      if (vesselFilter !== 'ALL') {
        const vMatch = voy.vesselName.toLowerCase() === vesselFilter.toLowerCase() || voy.vesselId === vesselFilter;
        if (!vMatch) return;
      }

      const depStr = voy.departureDate;
      const arrStr = voy.arrivalDate || voy.departureDate;

      const depDate = new Date(depStr + 'T00:00:00');
      const arrDate = new Date(arrStr + 'T00:00:00');

      const cur = new Date(depDate);
      let safetyCounter = 0;
      while (cur <= arrDate && safetyCounter < 60) {
        safetyCounter++;
        const dStr = formatDateStr(cur);
        const dayRecord = ensureDate(dStr);

        const vName = voy.vesselName;
        const vObj = vessels.find((v) => v.name.toLowerCase() === vName.toLowerCase() || v.id === voy.vesselId);

        let stage: 'Departing' | 'En Route' | 'Arriving' | 'Scheduled' = 'En Route';
        if (dStr === depStr && voy.status === 'Scheduled') {
          stage = 'Scheduled';
        } else if (dStr === depStr) {
          stage = 'Departing';
        } else if (dStr === arrStr) {
          stage = 'Arriving';
        } else {
          stage = 'En Route';
        }

        if (!dayRecord.voyagesByVessel[vName]) {
          dayRecord.voyagesByVessel[vName] = {
            vesselName: vName,
            vesselId: voy.vesselId,
            vessel: vObj,
            voyages: [],
            stage,
            totalPassengers: 0,
            totalCargoMT: 0,
            totalVehicles: 0,
          };
        }

        const vesselGroup = dayRecord.voyagesByVessel[vName];
        if (!vesselGroup.voyages.some((v) => v.id === voy.id)) {
          vesselGroup.voyages.push(voy);
          vesselGroup.totalPassengers += voy.passengers || 0;
          vesselGroup.totalCargoMT += voy.cargoTonnage || 0;
          vesselGroup.totalVehicles +=
            (voy.cars || 0) +
            (voy.trucks || 0) +
            (voy.pickups || 0) +
            (voy.wagons || 0) +
            (voy.motorcycles || 0) +
            (voy.buses || 0);

          if (dStr === depStr) vesselGroup.stage = stage;
          else if (dStr === arrStr) vesselGroup.stage = 'Arriving';
        }

        cur.setDate(cur.getDate() + 1);
      }
    });

    // 2. Process Incidents Aggregated for each Date for the days reported
    incidents.forEach((inc) => {
      if (vesselFilter !== 'ALL' && inc.type === 'Voyage') {
        const vMatch = inc.vesselName?.toLowerCase() === vesselFilter.toLowerCase() || inc.vesselId === vesselFilter;
        if (!vMatch) return;
      }
      if (severityFilter !== 'ALL' && inc.severity !== severityFilter) {
        return;
      }

      const repDate = inc.reportedDate;
      if (!repDate) return;

      const dayRecord = ensureDate(repDate);
      dayRecord.incidents.push(inc);

      if (inc.severity === 'Critical') dayRecord.criticalIncidentCount++;
      else if (inc.severity === 'High') dayRecord.highIncidentCount++;
      else if (inc.severity === 'Medium') dayRecord.mediumIncidentCount++;
      else if (inc.severity === 'Low') dayRecord.lowIncidentCount++;
    });

    return map;
  }, [voyages, incidents, vessels, vesselFilter, severityFilter]);

  // Monthly Overview KPI statistics
  const monthlyMetrics = useMemo(() => {
    const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const monthVoyages = voyages.filter(
      (v) => (v.departureDate && v.departureDate.startsWith(currentMonthStr)) || (v.arrivalDate && v.arrivalDate.startsWith(currentMonthStr))
    );

    const monthIncidents = incidents.filter(
      (inc) => inc.reportedDate && inc.reportedDate.startsWith(currentMonthStr)
    );

    const activeVesselsSet = new Set<string>();
    let totalPassengers = 0;
    let totalCargoMT = 0;
    let totalVehicles = 0;

    monthVoyages.forEach((v) => {
      activeVesselsSet.add(v.vesselName);
      totalPassengers += v.passengers || 0;
      totalCargoMT += v.cargoTonnage || 0;
      totalVehicles += (v.cars || 0) + (v.trucks || 0) + (v.pickups || 0) + (v.wagons || 0) + (v.motorcycles || 0) + (v.buses || 0);
    });

    const criticalCount = monthIncidents.filter((i) => i.severity === 'Critical').length;
    const highCount = monthIncidents.filter((i) => i.severity === 'High').length;
    const medCount = monthIncidents.filter((i) => i.severity === 'Medium').length;
    const lowCount = monthIncidents.filter((i) => i.severity === 'Low').length;

    const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const daysWithIncidentsSet = new Set(monthIncidents.map((i) => i.reportedDate));
    const incidentFreeDays = Math.max(0, totalDaysInMonth - daysWithIncidentsSet.size);

    return {
      totalVoyages: monthVoyages.length,
      activeVesselsCount: activeVesselsSet.size,
      totalIncidents: monthIncidents.length,
      criticalCount,
      highCount,
      medCount,
      lowCount,
      totalPassengers,
      totalCargoMT,
      totalVehicles,
      incidentFreeDays,
      incidentFreePercent: Math.round((incidentFreeDays / totalDaysInMonth) * 100),
    };
  }, [voyages, incidents, currentDate]);

  // Selected Day Aggregated Data for the drawer / detail panel
  const selectedDayAggregate: DayCalendarAggregate = useMemo(() => {
    return (
      calendarAggregates[selectedDateStr] || {
        voyagesByVessel: {},
        incidents: [],
        criticalIncidentCount: 0,
        highIncidentCount: 0,
        mediumIncidentCount: 0,
        lowIncidentCount: 0,
      }
    );
  }, [calendarAggregates, selectedDateStr]);

  const selectedDayVesselEntries: VesselDayAggregate[] = useMemo(() => {
    return Object.values(selectedDayAggregate.voyagesByVessel);
  }, [selectedDayAggregate]);

  // Search filtered agenda list
  const agendaDatesList = useMemo(() => {
    const keys = Object.keys(calendarAggregates).sort();
    return keys.filter((dStr) => {
      const data = calendarAggregates[dStr];
      const hasVoyages = Object.keys(data.voyagesByVessel).length > 0;
      const hasIncidents = data.incidents.length > 0;

      if (layerFilter === 'VOYAGES' && !hasVoyages) return false;
      if (layerFilter === 'INCIDENTS' && !hasIncidents) return false;
      if (!hasVoyages && !hasIncidents) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesVessel = Object.keys(data.voyagesByVessel).some((vName) => vName.toLowerCase().includes(q));
        const matchesIncident = data.incidents.some(
          (inc) =>
            inc.title.toLowerCase().includes(q) ||
            inc.incidentCode.toLowerCase().includes(q) ||
            inc.category.toLowerCase().includes(q)
        );
        const matchesDate = dStr.includes(q);
        return matchesVessel || matchesIncident || matchesDate;
      }

      return true;
    });
  }, [calendarAggregates, layerFilter, searchQuery]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-5 animate-in fade-in duration-200" id="voyage-calendar-module">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20 dark:text-blue-400">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Fleet Voyage & Safety Calendar
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Daily aggregated voyage movements by vessel and chronological safety incident reports
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Month Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-1 shadow-2xs">
            <button
              id="calendarViewMonthBtn"
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'month'
                  ? 'bg-[#465FFF] text-white shadow-xs'
                  : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Month Grid</span>
            </button>
            <button
              id="calendarViewAgendaBtn"
              onClick={() => setViewMode('agenda')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-[#465FFF] text-white shadow-xs'
                  : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Agenda Timeline</span>
            </button>
          </div>

          {/* Quick Month Navigator */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] rounded-xl p-1 shadow-2xs">
            <button
              id="calendarPrevMonthBtn"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47] transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2.5 text-xs font-bold text-gray-900 dark:text-white whitespace-nowrap min-w-[130px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <button
              id="calendarNextMonthBtn"
              onClick={handleNextMonth}
              title="Next Month"
              className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47] transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Today Button */}
          <button
            id="calendarTodayBtn"
            onClick={handleToday}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#465FFF]" />
            <span>Today (Aug 23)</span>
          </button>
        </div>
      </div>

      {/* Month Analytics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Active Voyages in Month */}
        <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Voyages This Month
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {monthlyMetrics.totalVoyages}
            </span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              across {monthlyMetrics.activeVesselsCount} vessels
            </span>
          </div>
        </div>

        {/* KPI 2: Incidents Reported */}
        <div className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Reported Incidents
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-red-600 dark:text-red-400">
              {monthlyMetrics.totalIncidents}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="text-red-500 font-bold">{monthlyMetrics.highCount + monthlyMetrics.criticalCount} High</span>
              <span>•</span>
              <span className="text-amber-500">{monthlyMetrics.medCount} Med</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Incident Free Days */}
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Safety Score
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {monthlyMetrics.incidentFreePercent}%
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {monthlyMetrics.incidentFreeDays} incident-free days
            </span>
          </div>
        </div>

        {/* KPI 4: Cargo Tonnage */}
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Cargo Tonnage
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <Boxes className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {(monthlyMetrics.totalCargoMT / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
              Metric Tons
            </span>
          </div>
        </div>

        {/* KPI 5: Passengers & Vehicles */}
        <div className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Passengers & Units
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {monthlyMetrics.totalPassengers}
            </span>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              pax • {monthlyMetrics.totalVehicles} vehicles
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-[#1C2434] p-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Layer Filter (Voyages / Incidents / All) */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 font-semibold pl-1">Layer:</span>
            <div className="flex items-center rounded-xl bg-gray-100 dark:bg-[#24303F] p-0.5">
              <button
                onClick={() => setLayerFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  layerFilter === 'ALL'
                    ? 'bg-white dark:bg-[#465FFF] text-[#465FFF] dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                All Data
              </button>
              <button
                onClick={() => setLayerFilter('VOYAGES')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  layerFilter === 'VOYAGES'
                    ? 'bg-white dark:bg-[#465FFF] text-[#465FFF] dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <Ship className="h-3 w-3" />
                <span>Voyages</span>
              </button>
              <button
                onClick={() => setLayerFilter('INCIDENTS')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  layerFilter === 'INCIDENTS'
                    ? 'bg-white dark:bg-red-600 text-red-600 dark:text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <ShieldAlert className="h-3 w-3" />
                <span>Incidents</span>
              </button>
            </div>
          </div>

          {/* Vessel Filter Selector */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400 font-semibold pl-2">Vessel:</span>
            <select
              id="calendarVesselFilter"
              value={vesselFilter}
              onChange={(e) => setVesselFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
            >
              <option value="ALL">All Fleet Vessels</option>
              {vessels.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          {layerFilter !== 'VOYAGES' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-400 font-semibold pl-2">Severity:</span>
              <select
                id="calendarSeverityFilter"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
              >
                <option value="ALL">All Severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          )}
        </div>

        {/* Search Query */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            id="calendarSearchInput"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voyage, vessel or incident..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F] pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Content Layout: Calendar Grid + Day Details Side Drawer */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* Left Column: Month Grid View or Agenda View */}
        <div className={isDetailDrawerOpen ? 'xl:col-span-8' : 'xl:col-span-12'}>
          {viewMode === 'month' ? (
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs overflow-hidden">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                {weekdayNames.map((dName, idx) => (
                  <div
                    key={dName}
                    className={`py-2 text-[11px] font-bold uppercase tracking-wider ${
                      idx === 0 || idx === 6
                        ? 'text-gray-400 dark:text-gray-500'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {dName}
                  </div>
                ))}
              </div>

              {/* 6-Week Calendar Grid (42 Cells) */}
              <div className="grid grid-cols-7 gap-1.5">
                {monthData.days.map(({ date, dateStr, isCurrentMonth }) => {
                  const dayData: DayCalendarAggregate | undefined = calendarAggregates[dateStr];
                  const hasVoyages = dayData && Object.keys(dayData.voyagesByVessel).length > 0;
                  const hasIncidents = dayData && dayData.incidents.length > 0;
                  const isSelected = selectedDateStr === dateStr;
                  const isTodayDate = isSameDay(date, new Date('2026-08-23T00:00:00'));

                  const showVoyages = layerFilter !== 'INCIDENTS' && hasVoyages;
                  const showIncidents = layerFilter !== 'VOYAGES' && hasIncidents;

                  const vesselEntries: VesselDayAggregate[] =
                    showVoyages && dayData ? Object.values(dayData.voyagesByVessel) : [];

                  return (
                    <div
                      key={dateStr}
                      id={`calendar-day-${dateStr}`}
                      onClick={() => {
                        setSelectedDateStr(dateStr);
                        setIsDetailDrawerOpen(true);
                      }}
                      className={`group relative min-h-[115px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#465FFF] bg-blue-50/40 dark:bg-[#465FFF]/10 ring-2 ring-[#465FFF]/30 shadow-xs'
                          : isTodayDate
                          ? 'border-[#465FFF]/60 bg-blue-50/20 dark:bg-blue-950/20'
                          : isCurrentMonth
                          ? 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/60 dark:hover:bg-[#24303F]/40'
                          : 'border-gray-50 dark:border-gray-800/40 bg-gray-50/40 dark:bg-[#151D2A]/60 opacity-60'
                      }`}
                    >
                      {/* Top Day Header in Cell */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                            isTodayDate
                              ? 'bg-[#465FFF] text-white shadow-xs'
                              : isSelected
                              ? 'bg-[#465FFF]/20 text-[#465FFF] dark:text-blue-300 font-extrabold'
                              : isCurrentMonth
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400 dark:text-gray-600'
                          }`}
                        >
                          {date.getDate()}
                        </span>

                        {/* Top corner summary badges (Incidents / Total vessels) */}
                        <div className="flex items-center gap-1">
                          {showIncidents && dayData && (
                            <span
                              title={`${dayData.incidents.length} incident(s) reported on ${dateStr}`}
                              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                                dayData.criticalIncidentCount > 0 || dayData.highIncidentCount > 0
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : dayData.mediumIncidentCount > 0
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-blue-500 text-white'
                              }`}
                            >
                              <ShieldAlert className="h-2.5 w-2.5" />
                              <span>{dayData.incidents.length}</span>
                            </span>
                          )}
                          {showVoyages && vesselEntries.length > 0 && (
                            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/60 dark:bg-blue-900/40 px-1 py-0.2 rounded">
                              {vesselEntries.length} {vesselEntries.length === 1 ? 'vsl' : 'vsls'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle Body: Vessels Aggregated Pills & Incident Badges */}
                      <div className="my-1.5 space-y-1 overflow-hidden">
                        {/* Vessel Voyages Aggregates */}
                        {showVoyages &&
                          vesselEntries.slice(0, 2).map((vEntry: VesselDayAggregate) => {
                            const firstVoy = vEntry.voyages[0];
                            return (
                              <div
                                key={vEntry.vesselName}
                                title={`${vEntry.vesselName}: ${firstVoy?.voyageNumber || 'Active Voyage'} (${vEntry.stage}) • ${firstVoy?.departurePort} → ${firstVoy?.arrivalPort}`}
                                className="truncate rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 px-1.5 py-0.5 text-[10px] font-medium text-blue-900 dark:text-blue-200 flex items-center justify-between gap-1"
                              >
                                <span className="flex items-center gap-1 truncate font-semibold">
                                  <Ship className="h-2.5 w-2.5 shrink-0 text-blue-600 dark:text-blue-400" />
                                  <span className="truncate">{vEntry.vesselName}</span>
                                </span>
                                <span
                                  className={`shrink-0 text-[8px] font-bold px-1 rounded ${
                                    vEntry.stage === 'Departing'
                                      ? 'bg-indigo-600 text-white'
                                      : vEntry.stage === 'Arriving'
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-100'
                                  }`}
                                >
                                  {vEntry.stage === 'Departing' ? 'DEP' : vEntry.stage === 'Arriving' ? 'ARR' : 'EN ROUTE'}
                                </span>
                              </div>
                            );
                          })}

                        {/* +N More Vessels Indicator if exceeding 2 */}
                        {showVoyages && vesselEntries.length > 2 && (
                          <div className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 pl-1">
                            +{vesselEntries.length - 2} more vessels
                          </div>
                        )}

                        {/* Incidents Indicator in Cell */}
                        {showIncidents &&
                          dayData &&
                          dayData.incidents.slice(0, 1).map((inc) => (
                            <div
                              key={inc.id}
                              title={`${inc.incidentCode}: ${inc.title} (${inc.severity})`}
                              className={`truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-1 border ${
                                inc.severity === 'Critical' || inc.severity === 'High'
                                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300'
                                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300'
                              }`}
                            >
                              <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                              <span className="truncate font-semibold">{inc.incidentCode}</span>
                              <span className="truncate opacity-80 text-[9px]">
                                {inc.type === 'Voyage' ? inc.vesselName : 'Shore Facility'}
                              </span>
                            </div>
                          ))}
                      </div>

                      {/* Bottom Footer Details */}
                      <div className="flex items-center justify-between text-[9px] text-gray-400 pt-0.5 border-t border-gray-100/60 dark:border-gray-800/60">
                        <span>
                          {showVoyages && vesselEntries.length > 0
                            ? `${vesselEntries.reduce((acc, v) => acc + v.voyages.length, 0)} voy`
                            : ''}
                        </span>
                        <span>{showIncidents && dayData ? `${dayData.incidents.length} alert` : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda Timeline View */
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Chronological Daily Operations & Incident Log ({agendaDatesList.length} Active Dates)
                </h3>
                <span className="text-xs text-gray-400">Click any date to inspect details</span>
              </div>

              {agendaDatesList.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No matching voyage movements or incident reports found with current filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {agendaDatesList.map((dStr) => {
                    const dayData = calendarAggregates[dStr];
                    const vEntries: VesselDayAggregate[] = Object.values(dayData.voyagesByVessel);
                    const incs = dayData.incidents;
                    const dateObj = new Date(dStr + 'T00:00:00');
                    const isSelected = selectedDateStr === dStr;

                    return (
                      <div
                        key={dStr}
                        onClick={() => {
                          setSelectedDateStr(dStr);
                          setIsDetailDrawerOpen(true);
                        }}
                        className={`rounded-xl border p-4 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#465FFF] bg-blue-50/40 dark:bg-[#465FFF]/10 ring-1 ring-[#465FFF]'
                            : 'border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] hover:bg-gray-50 dark:hover:bg-[#24303F]'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white font-bold text-xs">
                              {dateObj.getDate()}
                            </div>
                            <div>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {dateObj.toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <div className="text-[11px] text-gray-400">
                                {vEntries.length} Active Vessel(s) • {incs.length} Reported Incident(s)
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {incs.length > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2.5 py-0.5 text-xs font-bold">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                {incs.length} Incident(s)
                              </span>
                            )}
                            <button className="text-xs font-semibold text-[#465FFF] dark:text-blue-400 flex items-center gap-1 hover:underline">
                              <span>Inspect Details</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Vessel Operations Sub-grid */}
                        {vEntries.length > 0 && (
                          <div className="space-y-2 mb-3">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              Vessel Deployments & Manifests
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {vEntries.map((v: VesselDayAggregate) => (
                                <div
                                  key={v.vesselName}
                                  className="rounded-lg border border-blue-100 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/20 p-2.5 text-xs flex items-start justify-between gap-2"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-white">
                                      <Ship className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                      <span>{v.vesselName}</span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                      {v.voyages.map((voy) => `${voy.voyageNumber} (${voy.departurePort} → ${voy.arrivalPort})`).join(', ')}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <span className="inline-block rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 text-[10px] font-bold">
                                      {v.stage}
                                    </span>
                                    <div className="text-[10px] text-gray-400 mt-1">
                                      {v.totalPassengers} pax • {v.totalCargoMT.toLocaleString()} MT
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reported Incidents Sub-grid */}
                        {incs.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                              Incidents Reported on this Date
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {incs.map((inc) => (
                                <div
                                  key={inc.id}
                                  className="rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/20 p-2.5 text-xs flex items-start justify-between gap-2"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 font-bold text-red-700 dark:text-red-300">
                                      <ShieldAlert className="h-3.5 w-3.5" />
                                      <span>{inc.incidentCode}</span>
                                      <span className="font-normal text-gray-800 dark:text-gray-200">
                                        • {inc.title}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                      {inc.category} • Rep by: {inc.reportedBy} ({inc.reporterType || 'Staff'})
                                    </div>
                                  </div>
                                  <span
                                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                      inc.severity === 'Critical' || inc.severity === 'High'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-amber-500 text-white'
                                    }`}
                                  >
                                    {inc.severity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Day Aggregated Drilldown Inspector Drawer */}
        {isDetailDrawerOpen && (
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-sm space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white font-bold text-sm">
                    {selectedDate.getDate()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </h2>
                    <span className="text-[11px] text-gray-400">
                      Daily Fleet & Safety Aggregate
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsDetailDrawerOpen(false)}
                    title="Collapse day panel"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#24303F]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day Scoreboard */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50/70 dark:bg-[#24303F]/50 p-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Vessels Active</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedDayVesselEntries.length} Vessel(s)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Incidents Reported</span>
                  <span
                    className={`text-base font-bold ${
                      selectedDayAggregate.incidents.length > 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {selectedDayAggregate.incidents.length > 0
                      ? `${selectedDayAggregate.incidents.length} Event(s)`
                      : '0 (All Clear)'}
                  </span>
                </div>
              </div>

              {/* Section 1: Voyage Information Aggregated for Each Vessel on this Day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <Ship className="h-4 w-4" />
                    <span>Vessel Deployments ({selectedDayVesselEntries.length})</span>
                  </div>
                  {onNavigateToVoyages && (
                    <button
                      onClick={onNavigateToVoyages}
                      className="text-[11px] font-semibold text-[#465FFF] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Voyage Register</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {selectedDayVesselEntries.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-800 p-4 text-center text-xs text-gray-400">
                    No vessels scheduled, departing, or underway on this date.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {selectedDayVesselEntries.map((vEntry: VesselDayAggregate) => (
                      <div
                        key={vEntry.vesselName}
                        className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/20 p-3.5 space-y-2.5 transition-shadow hover:shadow-xs"
                      >
                        {/* Vessel Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs shadow-xs">
                              <Ship className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-gray-900 dark:text-white">
                                {vEntry.vesselName}
                              </div>
                              <span className="text-[10px] text-gray-400">
                                {vEntry.vessel?.imoNumber ? `IMO: ${vEntry.vessel.imoNumber}` : 'Commercial RORO / Cargo'}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              vEntry.stage === 'Departing'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                : vEntry.stage === 'Arriving'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            }`}
                          >
                            {vEntry.stage}
                          </span>
                        </div>

                        {/* Individual Voyages under this Vessel */}
                        {vEntry.voyages.map((voy) => (
                          <div
                            key={voy.id}
                            onClick={() => onSelectVoyage && onSelectVoyage(voy)}
                            className="rounded-lg border border-gray-200/80 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-2.5 text-xs space-y-1.5 cursor-pointer hover:border-[#465FFF]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1 text-[11px]">
                                <Compass className="h-3 w-3 text-blue-500" />
                                {voy.voyageNumber}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.2 rounded">
                                {voy.status}
                              </span>
                            </div>

                            {/* Routing */}
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                              <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="truncate font-medium">{voy.departurePort}</span>
                              <ArrowRight className="h-3 w-3 text-gray-400 shrink-0" />
                              <span className="truncate font-medium">{voy.arrivalPort}</span>
                            </div>

                            {/* Voyage Manifest Metrics */}
                            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-500 dark:text-gray-400">
                              <div>
                                <span className="text-gray-400 block">Pax / Crew</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {voy.passengers || 0} / {voy.crewCount || 0}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Vehicles</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {(voy.cars || 0) + (voy.trucks || 0) + (voy.pickups || 0) + (voy.wagons || 0)} units
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400 block">Cargo (MT)</span>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">
                                  {voy.cargoTonnage?.toLocaleString() || '0'} MT
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 2: Incidents Reported as Aggregate for this Date */}
              <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    <ShieldAlert className="h-4 w-4" />
                    <span>Reported Incidents ({selectedDayAggregate.incidents.length})</span>
                  </div>
                  {onNavigateToIncidents && (
                    <button
                      onClick={onNavigateToIncidents}
                      className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Safety Register</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {selectedDayAggregate.incidents.length === 0 ? (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 text-center text-xs text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>No safety or operational incidents reported on this day.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                    {selectedDayAggregate.incidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => onSelectIncident && onSelectIncident(inc)}
                        className="rounded-xl border border-red-200/80 dark:border-red-900/40 bg-red-50/20 dark:bg-red-950/20 p-3.5 space-y-2 transition-shadow hover:shadow-xs cursor-pointer hover:border-red-400"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-red-600 dark:text-red-400">
                                {inc.incidentCode}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  inc.type === 'Voyage'
                                    ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                                    : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {inc.type}
                              </span>
                            </div>
                            <h4 className="font-semibold text-xs text-gray-900 dark:text-white mt-1">
                              {inc.title}
                            </h4>
                          </div>

                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                              inc.severity === 'Critical' || inc.severity === 'High'
                                ? 'bg-red-500 text-white'
                                : inc.severity === 'Medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>

                        {/* Location details */}
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          {inc.type === 'Voyage' ? (
                            <>
                              <Ship className="h-3 w-3 text-blue-500" />
                              <span>Vessel: {inc.vesselName} ({inc.voyageNumber || 'Active'})</span>
                            </>
                          ) : (
                            <>
                              <Building2 className="h-3 w-3 text-emerald-500" />
                              <span className="truncate">{inc.facilityLocation || inc.department}</span>
                            </>
                          )}
                        </div>

                        {/* Reporter details with Staff / Non-staff tag */}
                        <div className="rounded-lg bg-white dark:bg-[#1C2434] p-2 text-[11px] flex items-center justify-between border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {inc.reportedBy}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1 rounded ${
                                inc.reporterType === 'Staff'
                                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                                  : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              }`}
                            >
                              {inc.reporterType || 'Staff'}
                            </span>
                          </div>
                          {inc.reporterPhone && (
                            <span className="flex items-center gap-0.5 text-gray-500 text-[10px]">
                              <Phone className="h-2.5 w-2.5 text-blue-500" />
                              {inc.reporterPhone}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 italic">
                          "{inc.description}"
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
