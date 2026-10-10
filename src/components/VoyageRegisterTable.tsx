import React, { useState, useMemo } from 'react';
import {
  VoyageRecord,
  VoyageCrewConfirmation,
  Vessel,
  StaffMember,
  PortRecord,
  WaterBody,
} from '../types';
import {
  Compass,
  Ship,
  Users,
  Car,
  Truck,
  Bus,
  Bike,
  PackageCheck,
  Plus,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Radio,
  Send,
  BellRing,
  ArrowRight,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Smartphone,
  Tablet,
  Check,
  Info,
  Calendar,
  MapPin,
  Anchor,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface VoyageRegisterTableProps {
  voyages: VoyageRecord[];
  vessels: Vessel[];
  staffList: StaffMember[];
  ports: PortRecord[];
  waterBodies: WaterBody[];
  onAddVoyage: (newVoyage: VoyageRecord) => void;
  onUpdateVoyage: (updatedVoyage: VoyageRecord) => void;
  onDeleteVoyage: (id: string) => void;
  onCaptainSetOff: (voyageId: string) => void;
  onConfirmCrewMember: (voyageId: string, confirmationId: string) => void;
}

// Helper to calculate sequential auto-incrementing voyage number
export function getNextVoyageNumber(voyagesList: { voyageNumber: string }[]): string {
  if (!voyagesList || voyagesList.length === 0) return 'VY-9046';

  let maxNum = 0;
  let prefix = 'VY-';

  voyagesList.forEach((v) => {
    if (!v.voyageNumber) return;
    const match = v.voyageNumber.match(/^(.*?)(\d+)$/);
    if (match) {
      if (match[1]) prefix = match[1];
      const num = parseInt(match[2], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  if (maxNum > 0) {
    return `${prefix}${maxNum + 1}`;
  }
  return `VY-${voyagesList.length + 9046}`;
}

export const VoyageRegisterTable: React.FC<VoyageRegisterTableProps> = ({
  voyages = [],
  vessels = [],
  staffList = [],
  ports = [],
  waterBodies = [],
  onAddVoyage,
  onUpdateVoyage,
  onDeleteVoyage,
  onCaptainSetOff,
  onConfirmCrewMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [vesselFilter, setVesselFilter] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVoyageForManifest, setSelectedVoyageForManifest] = useState<VoyageRecord | null>(null);
  const [selectedVoyageForCrewAlert, setSelectedVoyageForCrewAlert] = useState<VoyageRecord | null>(null);
  const [editingVoyage, setEditingVoyage] = useState<VoyageRecord | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepError, setStepError] = useState<string | null>(null);

  // Validate step before proceeding
  const validateDepartureStep = (stepToValidate: number): boolean => {
    setStepError(null);
    if (stepToValidate === 1) {
      if (!formData.voyageNumber.trim()) {
        setStepError('Please provide a Voyage Number.');
        return false;
      }
      if (!formData.captainName.trim()) {
        setStepError('Please select the Master / Captain.');
        return false;
      }
      if (!formData.departureDate || !formData.departureTime) {
        setStepError('Please provide Departure Date and Time.');
        return false;
      }
      if (!formData.arrivalDate || !formData.arrivalTime) {
        setStepError('Please provide Arrival Date and Time.');
        return false;
      }
    } else if (stepToValidate === 2) {
      if (formData.cargoTonnage < 0) {
        setStepError('Cargo tonnage cannot be negative.');
        return false;
      }
    }
    return true;
  };

  // Form State for Record New Voyage
  const [formData, setFormData] = useState<{
    voyageNumber: string;
    vesselId: string;
    vesselName: string;
    departurePort: string;
    arrivalPort: string;
    waterBody: string;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    status: VoyageRecord['status'];
    captainName: string;
    crewCount: number;
    passengers: number;
    trucks: number;
    wagons: number;
    cars: number;
    pickups: number;
    motorcycles: number;
    cargoTonnage: number;
    bicycles: number;
    buses: number;
    remarks: string;
  }>({
    voyageNumber: `VY-${Math.floor(1000 + Math.random() * 9000)}`,
    vesselId: vessels[0]?.id || 'VES-001',
    vesselName: vessels[0]?.name || 'VOYAGER TITAN',
    departurePort: ports[0]?.name || 'Port of Rotterdam',
    arrivalPort: ports[1]?.name || 'Port of Singapore',
    waterBody: waterBodies[0]?.name || 'North Sea',
    departureDate: new Date().toISOString().split('T')[0],
    departureTime: '08:00',
    arrivalDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    arrivalTime: '18:00',
    status: 'Scheduled',
    captainName: 'Capt. Henrik Lindqvist',
    crewCount: 16,
    passengers: 120,
    trucks: 24,
    wagons: 10,
    cars: 150,
    pickups: 20,
    motorcycles: 30,
    cargoTonnage: 8500,
    bicycles: 45,
    buses: 6,
    remarks: '',
  });

  // Filtered voyages
  const filteredVoyages = useMemo(() => {
    return voyages.filter((voyage) => {
      const matchSearch =
        voyage.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.departurePort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.arrivalPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voyage.captainName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || voyage.status === statusFilter;
      const matchVessel = vesselFilter === 'All' || voyage.vesselName === vesselFilter;

      return matchSearch && matchStatus && matchVessel;
    });
  }, [voyages, searchTerm, statusFilter, vesselFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalVoyages = voyages.length;
    const activeVoyages = voyages.filter(
      (v) => v.status === 'Boarding' || v.status === 'Set Off' || v.status === 'En Route'
    ).length;
    const totalPassengers = voyages.reduce((sum, v) => sum + (v.passengers || 0), 0);
    const totalCargoTonnage = voyages.reduce((sum, v) => sum + (v.cargoTonnage || 0), 0);
    const totalVehicles = voyages.reduce(
      (sum, v) =>
        sum +
        (v.trucks || 0) +
        (v.wagons || 0) +
        (v.cars || 0) +
        (v.pickups || 0) +
        (v.motorcycles || 0) +
        (v.bicycles || 0) +
        (v.buses || 0),
      0
    );
    const totalCrewExpected = voyages.reduce((sum, v) => sum + (v.crewCount || 0), 0);
    const totalCrewConfirmed = voyages.reduce((sum, v) => sum + (v.crewConfirmedCount || 0), 0);
    const crewConfirmationRate =
      totalCrewExpected > 0 ? Math.round((totalCrewConfirmed / totalCrewExpected) * 100) : 100;

    return {
      totalVoyages,
      activeVoyages,
      totalPassengers,
      totalCargoTonnage,
      totalVehicles,
      crewConfirmationRate,
    };
  }, [voyages]);

  // Open Edit Form
  const handleOpenEdit = (voyage: VoyageRecord) => {
    setCurrentStep(1);
    setStepError(null);
    setEditingVoyage(voyage);
    setFormData({
      voyageNumber: voyage.voyageNumber,
      vesselId: voyage.vesselId,
      vesselName: voyage.vesselName,
      departurePort: voyage.departurePort,
      arrivalPort: voyage.arrivalPort,
      waterBody: voyage.waterBody || 'North Sea',
      departureDate: voyage.departureDate,
      departureTime: voyage.departureTime,
      arrivalDate: voyage.arrivalDate,
      arrivalTime: voyage.arrivalTime,
      status: voyage.status,
      captainName: voyage.captainName,
      crewCount: voyage.crewCount,
      passengers: voyage.passengers,
      trucks: voyage.trucks,
      wagons: voyage.wagons,
      cars: voyage.cars,
      pickups: voyage.pickups,
      motorcycles: voyage.motorcycles,
      cargoTonnage: voyage.cargoTonnage,
      bicycles: voyage.bicycles,
      buses: voyage.buses,
      remarks: voyage.remarks || '',
    });
    setIsAddModalOpen(true);
  };

  // Submit Add or Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingVoyage) {
      const updated: VoyageRecord = {
        ...editingVoyage,
        ...formData,
      };
      onUpdateVoyage(updated);
    } else {
      // Generate initial crew confirmations from available staff
      const assignedVesselStaff = staffList
        .filter((s) => s.staffType === 'Crew')
        .slice(0, Math.min(formData.crewCount, 6));

      const newConfirmations: VoyageCrewConfirmation[] = assignedVesselStaff.map((st, idx) => ({
        id: `CONF-${Date.now()}-${idx}`,
        crewId: `CRW-${idx + 10}`,
        staffId: st.staffId,
        fullName: st.fullName,
        rank: st.role,
        email: st.email,
        phone: st.phone,
        confirmed: false,
        avatarUrl: st.avatarUrl,
        deviceType: 'Pending Ack',
      }));

      const newRecord: VoyageRecord = {
        id: `VOY-${Date.now().toString().slice(-6)}`,
        ...formData,
        crewConfirmedCount: 0,
        crewAlertSent: false,
        crewConfirmations: newConfirmations,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddVoyage(newRecord);
    }

    setIsAddModalOpen(false);
    setEditingVoyage(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Voyage No',
      'Vessel Name',
      'Departure Port',
      'Arrival Port',
      'Water Body',
      'Departure Date',
      'Arrival Date',
      'Status',
      'Captain Name',
      'Crew Count',
      'Crew Confirmed',
      'Passengers',
      'Trucks',
      'Wagons',
      'Cars',
      'Pickups',
      'Motorcycles',
      'Cargo Tonnage (MT)',
      'Bicycles',
      'Buses',
    ];

    const rows = filteredVoyages.map((v) => [
      `"${v.voyageNumber}"`,
      `"${v.vesselName}"`,
      `"${v.departurePort}"`,
      `"${v.arrivalPort}"`,
      `"${v.waterBody || ''}"`,
      `"${v.departureDate} ${v.departureTime}"`,
      `"${v.arrivalDate} ${v.arrivalTime}"`,
      `"${v.status}"`,
      `"${v.captainName}"`,
      v.crewCount,
      v.crewConfirmedCount,
      v.passengers,
      v.trucks,
      v.wagons,
      v.cars,
      v.pickups,
      v.motorcycles,
      v.cargoTonnage,
      v.bicycles,
      v.buses,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Voyage_Information_Register_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20 dark:text-blue-400">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Voyage Departure & Manifest</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Log, manage, and dispatch maritime departures with real-time Captain Set-Off device alerts and transport manifests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-export-voyages-csv"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-all"
          >
            <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            Export Log
          </button>

          <button
            id="btn-record-new-voyage"
            onClick={() => {
              setEditingVoyage(null);
              setCurrentStep(1);
              setStepError(null);
              const nextNumber = getNextVoyageNumber(voyages);
              setFormData({
                voyageNumber: nextNumber,
                vesselId: vessels[0]?.id || 'VES-001',
                vesselName: vessels[0]?.name || 'VOYAGER TITAN',
                departurePort: ports[0]?.name || 'Port of Rotterdam',
                arrivalPort: ports[1]?.name || 'Port of Singapore',
                waterBody: waterBodies[0]?.name || 'North Sea',
                departureDate: new Date().toISOString().split('T')[0],
                departureTime: '08:00',
                arrivalDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                arrivalTime: '18:00',
                status: 'Scheduled',
                captainName: 'Capt. Henrik Lindqvist',
                crewCount: 16,
                passengers: 120,
                trucks: 24,
                wagons: 10,
                cars: 150,
                pickups: 20,
                motorcycles: 30,
                cargoTonnage: 8500,
                bicycles: 45,
                buses: 6,
                remarks: '',
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51db] transition-all"
          >
            <Plus className="h-4 w-4" />
            Record Departure
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Voyages */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Recorded Voyages</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.totalVoyages}</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {metrics.activeVoyages} active en-route
            </span>
          </div>
        </div>

        {/* Card 2: Passengers & Vehicles */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Passengers / Vehicles</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
              <Car className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.totalPassengers.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              / {metrics.totalVehicles.toLocaleString()} vehicles
            </span>
          </div>
        </div>

        {/* Card 3: Cargo Tonnage */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Cargo Tonnage</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <PackageCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.totalCargoTonnage.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Metric Tons</span>
          </div>
        </div>

        {/* Card 4: Crew Onboard Confirmation */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Crew Alert Confirmation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <BellRing className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.crewConfirmationRate}%</span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Captain device sync ready
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xs overflow-hidden">
        {/* Search & Filter Header */}
        <div className="border-b border-gray-100 dark:border-[#2E3A47] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="search-voyages-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search voyage code, vessel, port, or captain..."
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none transition-all"
              />
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#24303F] border border-gray-200 dark:border-[#2E3A47] rounded-xl px-2.5 py-1">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <select
                  id="filter-voyage-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Boarding">Boarding</option>
                  <option value="Set Off">Set Off</option>
                  <option value="En Route">En Route</option>
                  <option value="Completed">Completed</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Vessel Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-[#24303F] border border-gray-200 dark:border-[#2E3A47] rounded-xl px-2.5 py-1">
                <Ship className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">Vessel:</span>
                <select
                  id="filter-voyage-vessel"
                  value={vesselFilter}
                  onChange={(e) => setVesselFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Vessels</option>
                  {vessels.map((v) => (
                    <option key={v.id} value={v.name}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Voyage Information Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-3.5 px-4">Voyage Code & Vessel</th>
                <th className="py-3.5 px-4">Route & Schedule</th>
                <th className="py-3.5 px-4">Crew & Onboard Alerts</th>
                <th className="py-3.5 px-4">Transport & Payload Manifest</th>
                <th className="py-3.5 px-4">Captain & Device Action</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredVoyages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Compass className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="font-medium">No voyage records found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Try modifying search parameters or record a new voyage.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVoyages.map((voyage) => {
                  const isAllConfirmed =
                    voyage.crewConfirmedCount >= voyage.crewCount && voyage.crewCount > 0;
                  const isSetOff = voyage.status === 'Set Off' || voyage.status === 'En Route';

                  return (
                    <tr
                      key={voyage.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors"
                    >
                      {/* 1. Voyage Code & Vessel */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#465FFF]/10 dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-blue-400 font-bold">
                            <Ship className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{voyage.voyageNumber}</span>
                              <span className="text-[10px] font-normal text-gray-400">({voyage.id})</span>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                              {voyage.vesselName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Route & Schedule */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                            <span>{voyage.departurePort}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span>{voyage.arrivalPort}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {voyage.departureDate} {voyage.departureTime}
                            </span>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              ETA: {voyage.arrivalDate}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Number of Crew & Onboard Alerts */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-[#465FFF]" />
                              {voyage.crewCount} Crew Members
                            </span>
                            <button
                              onClick={() => setSelectedVoyageForCrewAlert(voyage)}
                              title="View crew confirmation details & device alerts"
                              className="text-[10px] font-semibold text-[#465FFF] dark:text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              <Smartphone className="h-2.5 w-2.5" />
                              Alerts
                            </button>
                          </div>

                          {/* Crew Confirmation Progress Bar */}
                          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-300 ${
                                isAllConfirmed
                                  ? 'bg-emerald-500'
                                  : voyage.crewAlertSent
                                  ? 'bg-amber-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                              style={{
                                width: `${
                                  voyage.crewCount > 0
                                    ? Math.min(100, (voyage.crewConfirmedCount / voyage.crewCount) * 100)
                                    : 0
                                }%`,
                              }}
                            />
                          </div>

                          <div className="flex items-center gap-1 text-[10px]">
                            {isAllConfirmed ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="h-3 w-3" />
                                {voyage.crewConfirmedCount}/{voyage.crewCount} Confirmed Onboard
                              </span>
                            ) : voyage.crewAlertSent ? (
                              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                                <BellRing className="h-3 w-3 animate-pulse" />
                                {voyage.crewConfirmedCount}/{voyage.crewCount} Checked In (Alert Sent)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-400">
                                <Clock className="h-3 w-3" />
                                Standby for Captain Set-Off
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 4. Transport & Payload Manifest (Passengers, Vehicles, Cargo) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {/* Passengers */}
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                              <Users className="h-2.5 w-2.5" />
                              {voyage.passengers} Pax
                            </span>
                            {/* Cars */}
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                              <Car className="h-2.5 w-2.5" />
                              {voyage.cars} Cars
                            </span>
                            {/* Trucks */}
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                              <Truck className="h-2.5 w-2.5" />
                              {voyage.trucks} Trucks
                            </span>
                            {/* Cargo */}
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              <PackageCheck className="h-2.5 w-2.5" />
                              {voyage.cargoTonnage.toLocaleString()} MT
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                            <span>
                              {voyage.wagons} Wagons • {voyage.pickups} Pick-ups • {voyage.buses} Buses •{' '}
                              {voyage.motorcycles} Moto • {voyage.bicycles} Bikes
                            </span>
                            <button
                              onClick={() => setSelectedVoyageForManifest(voyage)}
                              className="text-[#465FFF] dark:text-blue-400 font-semibold hover:underline shrink-0 ml-2"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 5. Captain & Device Action (Set Off Alert Trigger) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold text-gray-900 dark:text-white">
                            {voyage.captainName}
                          </div>

                          {isSetOff ? (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
                              Set Off Confirmed
                            </div>
                          ) : (
                            <button
                              id={`btn-captain-setoff-${voyage.id}`}
                              onClick={() => onCaptainSetOff(voyage.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#465FFF] hover:bg-[#3b51db] text-white px-2.5 py-1 text-[11px] font-semibold shadow-2xs transition-all active:scale-95"
                              title="Captain triggers Set Off on device to notify all crew accounts for onboard check-in"
                            >
                              <Send className="h-3 w-3" />
                              Captain Set Off
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 6. Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            voyage.status === 'Set Off' || voyage.status === 'En Route'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                              : voyage.status === 'Boarding'
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                              : voyage.status === 'Completed'
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              : voyage.status === 'Delayed'
                              ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {voyage.status}
                        </span>
                      </td>

                      {/* 7. Action Icons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-manifest-${voyage.id}`}
                            onClick={() => setSelectedVoyageForManifest(voyage)}
                            title="View Voyage Dossier & Manifest"
                            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-edit-voyage-${voyage.id}`}
                            onClick={() => handleOpenEdit(voyage)}
                            title="Edit Voyage Record"
                            className="p-1.5 text-gray-400 hover:text-[#465FFF] dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-delete-voyage-${voyage.id}`}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove voyage "${voyage.voyageNumber}"?`)) {
                                onDeleteVoyage(voyage.id);
                              }
                            }}
                            title="Delete Voyage"
                            className="p-1.5 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Record New Voyage / Edit Voyage */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingVoyage ? `Edit Voyage: ${editingVoyage.voyageNumber}` : 'Record New Voyage Information'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter voyage routing, captain & crew roster, and complete transport & cargo manifest.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingVoyage(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Stepper Header */}
            <div className="bg-gray-50/70 dark:bg-[#24303F]/40 border-b border-gray-100 dark:border-[#2E3A47] px-6 py-3">
              <div className="flex items-center justify-between">
                {[
                  { step: 1, label: 'Route & Vessel Assignment' },
                  { step: 2, label: 'Payload & Cargo Manifest' },
                  { step: 3, label: 'Crew & Dispatch Remarks' },
                ].map((s, idx) => (
                  <React.Fragment key={s.step}>
                    <button
                      type="button"
                      onClick={() => {
                        if (s.step === currentStep) return;
                        if (s.step < currentStep) {
                          setStepError(null);
                          setCurrentStep(s.step);
                        } else {
                          // Validate forward jumps
                          let canJump = true;
                          for (let i = currentStep; i < s.step; i++) {
                            if (!validateDepartureStep(i)) {
                              canJump = false;
                              break;
                            }
                          }
                          if (canJump) {
                            setStepError(null);
                            setCurrentStep(s.step);
                          }
                        }
                      }}
                      className="flex items-center gap-2 group cursor-pointer focus:outline-none"
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-all ${
                          currentStep === s.step
                            ? 'bg-[#465FFF] text-white shadow-xs ring-2 ring-[#465FFF]/30'
                            : currentStep > s.step
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-[#2E3A47] text-gray-500 dark:text-gray-400 group-hover:bg-gray-300'
                        }`}
                      >
                        {currentStep > s.step ? <Check className="h-3.5 w-3.5" /> : s.step}
                      </div>
                      <span
                        className={`text-xs font-semibold hidden sm:inline transition-colors ${
                          currentStep === s.step
                            ? 'text-[#465FFF] dark:text-blue-400 font-bold'
                            : currentStep > s.step
                            ? 'text-gray-700 dark:text-gray-200'
                            : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                    {idx < 2 && (
                      <div
                        className={`flex-1 h-0.5 mx-3 rounded transition-all ${
                          currentStep > s.step ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-[#2E3A47]'
                        }`}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Error Notification */}
            {stepError && (
              <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 p-3 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{stepError}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
              {/* STEP 1: Route & Vessel Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#465FFF] dark:text-blue-400 mb-3 flex items-center gap-1.5">
                      <Ship className="h-4 w-4" />
                      1. Voyage & Vessel Assignment
                    </h4>
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Voyage Number *
                          </label>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.2 rounded font-semibold">
                            Auto # (Editable)
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.voyageNumber}
                          onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value })}
                          placeholder="e.g. VY-9046"
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:border-[#465FFF] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Vessel Assigned *
                        </label>
                        <select
                          value={formData.vesselName}
                          onChange={(e) => {
                            const selectedV = vessels.find((v) => v.name === e.target.value);
                            setFormData({
                              ...formData,
                              vesselName: e.target.value,
                              vesselId: selectedV?.id || 'VES-001',
                              crewCount: selectedV?.crewCount || formData.crewCount,
                            });
                          }}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        >
                          {vessels.map((v) => (
                            <option key={v.id} value={v.name}>
                              {v.name} ({v.grossTonnage})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Master / Captain *
                        </label>
                        <select
                          value={formData.captainName}
                          onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        >
                          {staffList
                            .filter((s) => s.role.includes('Master') || s.role.includes('Captain') || s.staffType === 'Crew')
                            .map((s) => (
                              <option key={s.id} value={`Capt. ${s.fullName}`}>
                                Capt. {s.fullName} ({s.nationality})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Route, Ports & Timing */}
                  <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#465FFF] dark:text-blue-400 mb-3 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      Route, Ports & Timing
                    </h4>
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Departure Port *
                        </label>
                        <select
                          value={formData.departurePort}
                          onChange={(e) => setFormData({ ...formData, departurePort: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        >
                          {ports.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({p.countryCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Arrival Port (Destination) *
                        </label>
                        <select
                          value={formData.arrivalPort}
                          onChange={(e) => setFormData({ ...formData, arrivalPort: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        >
                          {ports.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({p.countryCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Water Body / Channel *
                        </label>
                        <select
                          value={formData.waterBody}
                          onChange={(e) => setFormData({ ...formData, waterBody: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        >
                          {waterBodies.map((wb) => (
                            <option key={wb.id} value={wb.name}>
                              {wb.name} ({wb.category})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Departure Date & Time *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            value={formData.departureDate}
                            onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                          />
                          <input
                            type="time"
                            required
                            value={formData.departureTime}
                            onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          ETA Arrival Date & Time *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            required
                            value={formData.arrivalDate}
                            onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                          />
                          <input
                            type="time"
                            required
                            value={formData.arrivalTime}
                            onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Initial Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) =>
                            setFormData({ ...formData, status: e.target.value as VoyageRecord['status'] })
                          }
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Boarding">Boarding</option>
                          <option value="Set Off">Set Off</option>
                          <option value="En Route">En Route</option>
                          <option value="Delayed">Delayed</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Transport & Cargo Payload Manifest */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#465FFF] dark:text-blue-400 flex items-center gap-1.5">
                      <Car className="h-4 w-4" />
                      2. Transport, Passengers & Cargo Payload Manifest
                    </h4>
                    <span className="text-[11px] text-gray-400">All fields required for Ro-Pax & Cargo clearance</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-3">
                    {/* 1. Passengers */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Users className="h-3.5 w-3.5 text-blue-500" />
                        Passengers
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.passengers}
                        onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 2. Cars */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Car className="h-3.5 w-3.5 text-indigo-500" />
                        Cars
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.cars}
                        onChange={(e) => setFormData({ ...formData, cars: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 3. Trucks */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Truck className="h-3.5 w-3.5 text-emerald-500" />
                        Trucks
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.trucks}
                        onChange={(e) => setFormData({ ...formData, trucks: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 4. Wagons */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Layers className="h-3.5 w-3.5 text-amber-500" />
                        Wagons
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.wagons}
                        onChange={(e) => setFormData({ ...formData, wagons: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 5. Pick-ups */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Truck className="h-3.5 w-3.5 text-teal-500" />
                        Pick-ups
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.pickups}
                        onChange={(e) => setFormData({ ...formData, pickups: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 6. Buses */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Bus className="h-3.5 w-3.5 text-violet-500" />
                        Buses
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.buses}
                        onChange={(e) => setFormData({ ...formData, buses: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 7. Motorcycles */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Bike className="h-3.5 w-3.5 text-rose-500" />
                        Motorcycles
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.motorcycles}
                        onChange={(e) => setFormData({ ...formData, motorcycles: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 8. Bicycles */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]/30">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-800 dark:text-gray-200 mb-1">
                        <Bike className="h-3.5 w-3.5 text-cyan-500" />
                        Bicycles
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.bicycles}
                        onChange={(e) => setFormData({ ...formData, bicycles: Number(e.target.value) })}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        placeholder="0"
                      />
                    </div>

                    {/* 9. Cargo Tonnage (MT) */}
                    <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-emerald-50/50 dark:bg-emerald-950/20">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                        <PackageCheck className="h-3.5 w-3.5 text-emerald-600" />
                        Cargo Tonnage (MT) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min={0}
                        required
                        value={formData.cargoTonnage}
                        onChange={(e) => setFormData({ ...formData, cargoTonnage: Number(e.target.value) })}
                        className="w-full rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-bold text-emerald-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        placeholder="0.0 MT"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Crew Compliment & Remarks */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#465FFF] dark:text-blue-400 mb-3 flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    3. Crew Compliment & Captain Device Alerts
                  </h4>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Number of Assigned Crew *
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={formData.crewCount}
                        onChange={(e) => setFormData({ ...formData, crewCount: Number(e.target.value) })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        Every crew member will receive a mobile check-in alert when the captain sets off.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Voyage Notes & Special Cargo Remarks
                      </label>
                      <textarea
                        rows={3}
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="e.g. Hazardous Ro-Ro cars loaded on lower deck, SECA compliance active."
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Summary Preview Box */}
                  <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 text-xs text-blue-900 dark:text-blue-200">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Voyage Departure Summary
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                      Voyage <span className="font-bold">{formData.voyageNumber}</span> with vessel <span className="font-bold">{formData.vesselName}</span> departing <span className="font-bold">{formData.departurePort}</span> on {formData.departureDate} at {formData.departureTime} with {formData.passengers} passengers, {formData.cargoTonnage} MT cargo, and {formData.crewCount} assigned crew.
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation & Submit Buttons */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingVoyage(null);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStepError(null);
                        setCurrentStep((prev) => prev - 1);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-all"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      id={`btn-departure-step-${currentStep}-next`}
                      onClick={() => {
                        if (validateDepartureStep(currentStep)) {
                          setCurrentStep((prev) => prev + 1);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#465FFF] hover:bg-[#3b51db] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                    >
                      <span>
                        {currentStep === 1
                          ? 'Next: Cargo & Payload Manifest'
                          : 'Next: Crew & Dispatch Remarks'}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      id="btn-departure-step-3-submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#465FFF] hover:bg-[#3b51db] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      {editingVoyage ? 'Save Voyage Changes' : 'Record & Publish Departure'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Captain Device & Crew Onboard Alert Confirmation Center */}
      {selectedVoyageForCrewAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4 bg-[#465FFF]/5 dark:bg-[#465FFF]/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#465FFF] text-white">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Crew Onboard Alert & Verification Center</span>
                    <span className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 text-[10px] text-blue-700 dark:text-blue-300 font-bold">
                      {selectedVoyageForCrewAlert.voyageNumber}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Vessel: {selectedVoyageForCrewAlert.vesselName} • Captain: {selectedVoyageForCrewAlert.captainName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoyageForCrewAlert(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              {/* Captain Trigger Banner */}
              <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-r from-indigo-50/70 to-blue-50/70 dark:from-indigo-950/20 dark:to-blue-950/20 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 font-bold text-indigo-950 dark:text-indigo-200 text-xs">
                      <Radio className="h-4 w-4 text-[#465FFF] animate-pulse" />
                      Captain Bridge Device Status:
                      <span className="text-[#465FFF] dark:text-blue-400 font-extrabold">
                        {selectedVoyageForCrewAlert.captainDeviceStatus || 'Standby for Departure'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-0.5">
                      When the Captain triggers "Set Off" on their bridge device, an urgent push alert is dispatched to all {selectedVoyageForCrewAlert.crewCount} crew members' accounts to confirm their presence onboard.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onCaptainSetOff(selectedVoyageForCrewAlert.id);
                      // Update local selected state
                      setSelectedVoyageForCrewAlert({
                        ...selectedVoyageForCrewAlert,
                        status: 'Set Off',
                        captainDeviceStatus: 'Set Off Triggered',
                        crewAlertSent: true,
                        crewAlertSentAt: new Date().toISOString(),
                      });
                    }}
                    disabled={selectedVoyageForCrewAlert.status === 'Set Off' || selectedVoyageForCrewAlert.status === 'En Route'}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                      selectedVoyageForCrewAlert.status === 'Set Off' || selectedVoyageForCrewAlert.status === 'En Route'
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-[#465FFF] hover:bg-[#3b51db] text-white active:scale-95'
                    }`}
                  >
                    {selectedVoyageForCrewAlert.status === 'Set Off' || selectedVoyageForCrewAlert.status === 'En Route' ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Set Off Dispatched
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Trigger Captain Set-Off
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Crew Roster & Check-In List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#465FFF]" />
                    Assigned Crew Members ({selectedVoyageForCrewAlert.crewConfirmations.length} Active Roster Entries)
                  </h4>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedVoyageForCrewAlert.crewConfirmedCount} / {selectedVoyageForCrewAlert.crewCount} Confirmed Onboard
                  </span>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedVoyageForCrewAlert.crewConfirmations.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-500">
                      No individual crew check-in records linked. {selectedVoyageForCrewAlert.crewCount} crew compliment assigned.
                    </div>
                  ) : (
                    selectedVoyageForCrewAlert.crewConfirmations.map((conf) => (
                      <div
                        key={conf.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={conf.avatarUrl}
                            alt={conf.fullName}
                            className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                          <div>
                            <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{conf.fullName}</span>
                              <span className="text-[10px] font-medium text-gray-400">({conf.rank})</span>
                            </div>
                            <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>Device: {conf.deviceType || 'Mobile Terminal'}</span>
                              {conf.confirmedAt && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  • Ack: {conf.confirmedAt}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          {conf.confirmed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirmed Onboard
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                onConfirmCrewMember(selectedVoyageForCrewAlert.id, conf.id);
                                // Update modal state
                                setSelectedVoyageForCrewAlert({
                                  ...selectedVoyageForCrewAlert,
                                  crewConfirmedCount: selectedVoyageForCrewAlert.crewConfirmedCount + 1,
                                  crewConfirmations: selectedVoyageForCrewAlert.crewConfirmations.map((c) =>
                                    c.id === conf.id
                                      ? {
                                          ...c,
                                          confirmed: true,
                                          confirmedAt: new Date().toLocaleTimeString(),
                                          deviceType: 'Mobile App (iOS)',
                                        }
                                      : c
                                  ),
                                });
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#465FFF] hover:text-white bg-[#465FFF]/10 hover:bg-[#465FFF] px-2.5 py-1 rounded-lg transition-all"
                            >
                              <Check className="h-3 w-3" />
                              Simulate Crew Check-In
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedVoyageForCrewAlert(null)}
                  className="rounded-xl bg-gray-100 dark:bg-[#24303F] hover:bg-gray-200 dark:hover:bg-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  Close Alert Center
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Comprehensive Voyage Transport & Cargo Dossier */}
      {selectedVoyageForManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Voyage Manifest & Payload Dossier
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedVoyageForManifest.voyageNumber} • {selectedVoyageForManifest.vesselName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedVoyageForManifest(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Manifest Grid for all 9 User-Requested Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Users className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Passengers</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.passengers.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Car className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Cars</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.cars.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Truck className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Trucks</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.trucks.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Layers className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Wagons</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.wagons.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Truck className="h-5 w-5 text-teal-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Pick-ups</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.pickups.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Bus className="h-5 w-5 text-violet-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Buses</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.buses.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Bike className="h-5 w-5 text-rose-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Motorcycles</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.motorcycles.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 text-center">
                  <Bike className="h-5 w-5 text-cyan-500 mx-auto mb-1" />
                  <span className="text-[10px] text-gray-400 block uppercase font-bold">Bicycles</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedVoyageForManifest.bicycles.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/60 dark:bg-emerald-950/20 text-center">
                  <PackageCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 block uppercase font-bold">
                    Cargo Tonnage
                  </span>
                  <span className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                    {selectedVoyageForManifest.cargoTonnage.toLocaleString()} MT
                  </span>
                </div>
              </div>

              {/* Remarks */}
              {selectedVoyageForManifest.remarks && (
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47] text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-bold block mb-0.5 text-gray-900 dark:text-white">Special Remarks:</span>
                  {selectedVoyageForManifest.remarks}
                </div>
              )}

              {/* Close Button */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedVoyageForManifest(null)}
                  className="rounded-xl bg-gray-100 dark:bg-[#24303F] hover:bg-gray-200 dark:hover:bg-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
