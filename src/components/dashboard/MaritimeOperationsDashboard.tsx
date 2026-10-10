import React, { useState, useMemo } from 'react';
import {
  Compass,
  Ship,
  AlertTriangle,
  Wrench,
  Anchor,
  Box,
  Users,
  Activity,
  Layers,
  BarChart3,
  Calendar,
  Globe,
  SlidersHorizontal,
  Fuel,
  Clock,
  Waves,
  Smartphone,
  UserCheck,
  Download,
  Printer,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react';
import {
  Vessel,
  VoyageRecord,
  LandingRecord,
  IncidentRecord,
  VesselMaintenanceTask,
  WaterBody,
  PortRecord,
  StaffMember,
  CargoManifestRecord,
  PassengerManifestRecord,
  AnalyticsKPI,
  DayAnalytics,
  TrafficChannel,
  TopPageItem,
  ActiveUserPoint,
} from '../../types';
import { OperationalKpiStrip } from './OperationalKpiStrip';
import { VoyageCargoThroughputChart } from './VoyageCargoThroughputChart';
import { FleetStatusChart } from './FleetStatusChart';
import { IncidentSafetyRiskChart } from './IncidentSafetyRiskChart';
import { MaintenanceSystemHealthChart } from './MaintenanceSystemHealthChart';
import { PortTrafficDensityChart } from './PortTrafficDensityChart';
import { ManifestCargoPassengerChart } from './ManifestCargoPassengerChart';
import { FleetFuelEfficiencyChart } from './FleetFuelEfficiencyChart';
import { PortTurnaroundBerthChart } from './PortTurnaroundBerthChart';
import { CrewManningCertificationChart } from './CrewManningCertificationChart';
import { SmsCheckinPassengerFlowChart } from './SmsCheckinPassengerFlowChart';
import { HydrographicWaterLevelChart } from './HydrographicWaterLevelChart';
import { AnalyticsKpiCards } from '../AnalyticsKpiCards';
import { AnalyticsBarChart, AnalyticsTimeframe } from '../AnalyticsBarChart';

interface MaritimeOperationsDashboardProps {
  vessels: Vessel[];
  voyages: VoyageRecord[];
  landings: LandingRecord[];
  incidents: IncidentRecord[];
  maintenanceTasks: VesselMaintenanceTask[];
  waterBodies: WaterBody[];
  ports: PortRecord[];
  staffList: StaffMember[];
  cargoList: CargoManifestRecord[];
  passengersList: PassengerManifestRecord[];
  kpis: AnalyticsKPI;
  chartData: DayAnalytics[];
  timeframe: AnalyticsTimeframe;
  setTimeframe: (tf: AnalyticsTimeframe) => void;
  channels: TrafficChannel[];
  pages: TopPageItem[];
  initialActiveUsersPoints: ActiveUserPoint[];
  liveSimulation: boolean;
  darkMode: boolean;
  onNavigate: (view: string) => void;
  onChannelClick: (channel: TrafficChannel) => void;
  onPageClick: (page: TopPageItem) => void;
  onKpiClick: (metric: string) => void;
}

type DashboardTab = 'all' | 'operations' | 'safety-tech' | 'ports-manifests' | 'web-analytics';

export const MaritimeOperationsDashboard: React.FC<MaritimeOperationsDashboardProps> = ({
  vessels = [],
  voyages = [],
  landings = [],
  incidents = [],
  maintenanceTasks = [],
  waterBodies = [],
  ports = [],
  staffList = [],
  cargoList = [],
  passengersList = [],
  kpis,
  chartData = [],
  timeframe,
  setTimeframe,
  channels = [],
  pages = [],
  initialActiveUsersPoints = [],
  liveSimulation,
  darkMode,
  onNavigate,
  onChannelClick,
  onPageClick,
  onKpiClick,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedWaterBodyFilter, setSelectedWaterBodyFilter] = useState<string>('all');
  const [showReportModal, setShowReportModal] = useState(false);

  const tabs: { id: DashboardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All Operations Overview', icon: Layers },
    { id: 'operations', label: 'Fleet & Fuel Intelligence', icon: Compass },
    { id: 'safety-tech', label: 'Safety, Maintenance & Crew', icon: AlertTriangle },
    { id: 'ports-manifests', label: 'Ports, Manifests & Hydrography', icon: Anchor },
    { id: 'web-analytics', label: 'Passenger Transport Analytics', icon: Users },
  ];

  // Filtered vessels based on water body / search
  const filteredVessels = useMemo(() => {
    return vessels.filter((v) => {
      const matchSearch =
        searchFilter === '' ||
        v.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        v.imoNumber?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        v.mmsi?.toLowerCase().includes(searchFilter.toLowerCase());
      return matchSearch;
    });
  }, [vessels, searchFilter]);

  // Overall system counts
  const totalFleetCount = vessels.length;
  const activeUnderwayCount = vessels.filter((v) => v.status === 'Underway').length;
  const inPortCount = vessels.filter((v) => v.status === 'In Port').length;

  return (
    <div id="maritime-operations-dashboard" className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col gap-4 border-b border-gray-200/80 dark:border-[#2E3A47] pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Maritime Operations &amp; System Analytics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-[#8A99AD] mt-1">
              Integrated hydrographic telemetry, voyage throughput, PMS maintenance, IMO CII carbon efficiency, and SMS 8199 manifests
            </p>
          </div>

          {/* Quick Action Tools */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-[#465FFF]" />
              <span>Executive Report</span>
            </button>
            <button
              onClick={() => onNavigate('uganda-map')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#465FFF] text-white text-xs font-semibold hover:bg-[#3b51e0] transition-colors shadow-xs"
            >
              <Waves className="h-3.5 w-3.5" />
              <span>Hydrographic Map</span>
            </button>
          </div>
        </div>

        {/* Filter bar & Navigation Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Dashboard View Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-gray-100 dark:bg-[#24303F] p-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`dash-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-white shadow-xs'
                      : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter vessels, IMO, ports..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#465FFF]"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Live System Operational KPI Strip */}
      <OperationalKpiStrip
        vessels={filteredVessels}
        voyages={voyages}
        landings={landings}
        incidents={incidents}
        maintenanceTasks={maintenanceTasks}
        cargoList={cargoList}
        passengersList={passengersList}
        staffList={staffList}
        onNavigate={onNavigate}
      />

      {/* 2. Main Visualizations based on Selected Tab */}

      {/* SECTION A: Primary Operational Flow (Fleet, Voyages, Fuel) */}
      {(activeTab === 'all' || activeTab === 'operations') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Multi-Metric Voyage & Cargo Throughput Bar/Area Chart (2 Cols) */}
            <div className="lg:col-span-2">
              <VoyageCargoThroughputChart
                voyages={voyages}
                landings={landings}
                cargoList={cargoList}
                passengersList={passengersList}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>

            {/* Fleet Status Donut Chart (1 Col) */}
            <div className="lg:col-span-1">
              <FleetStatusChart
                vessels={filteredVessels}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          {/* Fleet Fuel Efficiency & IMO CII Carbon Intensity (Full Width or Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FleetFuelEfficiencyChart
              vessels={vessels}
              voyages={voyages}
              darkMode={darkMode}
              onNavigate={onNavigate}
            />

            <PortTurnaroundBerthChart
              ports={ports}
              waterBodies={waterBodies}
              voyages={voyages}
              landings={landings}
              darkMode={darkMode}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}

      {/* SECTION B: Safety Risk Register & Technical PMS & Crew */}
      {(activeTab === 'all' || activeTab === 'safety-tech') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Safety & Incident Risk Matrix (1 Col) */}
            <div className="lg:col-span-1">
              <IncidentSafetyRiskChart
                incidents={incidents}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>

            {/* PMS Technical Maintenance Health (1 Col) */}
            <div className="lg:col-span-1">
              <MaintenanceSystemHealthChart
                maintenanceList={maintenanceTasks as any}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>

            {/* Crew Manning & STCW Certification (1 Col) */}
            <div className="lg:col-span-1">
              <CrewManningCertificationChart
                staffList={staffList}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION C: Ports, Manifests, SMS 8199 & Hydrography */}
      {(activeTab === 'all' || activeTab === 'ports-manifests') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Global Port Traffic & Waterways (1 Col) */}
            <div className="lg:col-span-1">
              <PortTrafficDensityChart
                ports={ports}
                waterBodies={waterBodies}
                voyages={voyages}
                landings={landings}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>

            {/* Manifest Cargo & Passenger Breakdown (1 Col) */}
            <div className="lg:col-span-1">
              <ManifestCargoPassengerChart
                cargoList={cargoList}
                passengersList={passengersList}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>

            {/* SMS 8199 Self Check-In & Flow (1 Col) */}
            <div className="lg:col-span-1">
              <SmsCheckinPassengerFlowChart
                passengersList={passengersList}
                voyages={voyages}
                darkMode={darkMode}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          {/* Hydrographic Water Levels Chart */}
          <div className="grid grid-cols-1 gap-6">
            <HydrographicWaterLevelChart
              waterBodies={waterBodies}
              ports={ports}
              voyages={voyages}
              darkMode={darkMode}
              onNavigate={onNavigate}
            />
          </div>
        </div>
      )}

      {/* SECTION D: Passenger Transport & Demographic Telemetry */}
      {(activeTab === 'all' || activeTab === 'web-analytics') && (
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between border-t border-gray-200/80 dark:border-[#2E3A47] pt-6">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Passenger Transport &amp; Demographic Analytics
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Number of people transported per day (24 hours), month per week, and year categorized by male and female
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              Live Passenger Manifest Sync Active
            </span>
          </div>

          {/* Passenger KPI Cards */}
          <AnalyticsKpiCards kpis={kpis} onCardClick={onKpiClick} />

          {/* Passenger Transport & Gender Demographics Bar Chart */}
          <AnalyticsBarChart
            data={chartData}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            darkMode={darkMode}
            onExportReport={() => setShowReportModal(true)}
          />
        </div>
      )}

      {/* Executive Report Summary Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#465FFF]/10 text-[#465FFF]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Executive Maritime Operations Summary Report
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Generated from live Uganda Maritime Administration &amp; Fleet Operations Registry
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#24303F]">
                <div>
                  <span className="text-gray-400 block font-medium">Registered Fleet</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white block mt-0.5">
                    {vessels.length} Vessels
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">100% AIS Synced</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Active Voyages</span>
                  <span className="text-base font-bold text-gray-900 dark:text-white block mt-0.5">
                    {voyages.length} Transits
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">96.8% On-Time</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">QHSE Safety Score</span>
                  <span className="text-base font-bold text-emerald-600 block mt-0.5">
                    98.4 / 100
                  </span>
                  <span className="text-[10px] text-gray-500">Zero Critical LTI</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">SMS 8199 Adoption</span>
                  <span className="text-base font-bold text-[#465FFF] block mt-0.5">
                    72.4% Self-Service
                  </span>
                  <span className="text-[10px] text-gray-500">2,750+ Manifested</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 dark:border-[#2E3A47] space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Operational Highlights</h4>
                <ul className="list-disc list-inside space-y-1.5 text-gray-600 dark:text-[#8A99AD]">
                  <li>
                    <strong className="text-gray-800 dark:text-gray-200">Decarbonization (IMO CII):</strong> Fleet average rating Grade A (2.9 gCO₂/dwt·nm) with 23% biofuel &amp; dual-fuel transition.
                  </li>
                  <li>
                    <strong className="text-gray-800 dark:text-gray-200">Port Efficiency:</strong> Port Bell &amp; Jinja Pier achieved 4.8h and 3.6h average turnarounds with zero anchorage bottlenecks.
                  </li>
                  <li>
                    <strong className="text-gray-800 dark:text-gray-200">Machinery Reliability:</strong> PMS planned maintenance compliance stands at 96.4% across 12 vessels.
                  </li>
                  <li>
                    <strong className="text-gray-800 dark:text-gray-200">Hydrographic Safety:</strong> Lake Victoria depth datum measured at 13.3m with calm wave height 1.0m suitable for deep-draft barges.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
              <button
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Report</span>
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#465FFF] text-white text-xs font-semibold hover:bg-[#3b51e0] transition-colors"
              >
                <span>Close Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
