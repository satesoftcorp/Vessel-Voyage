import React, { useState, useMemo } from 'react';
import {
  LandingRecord,
  VoyageRecord,
  Vessel,
  PortRecord,
  WaterBody,
} from '../types';
import {
  Anchor,
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
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Eye,
  Edit2,
  Trash2,
  X,
  MapPin,
  Calendar,
  Layers,
  Fuel,
  FileCheck,
  Check,
  Info,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface VoyageLandingTableProps {
  landings: LandingRecord[];
  voyages: VoyageRecord[];
  vessels: Vessel[];
  ports: PortRecord[];
  waterBodies: WaterBody[];
  onAddLanding: (newLanding: LandingRecord) => void;
  onUpdateLanding: (updatedLanding: LandingRecord) => void;
  onDeleteLanding: (id: string) => void;
}

// Helper to auto-increment voyage number from existing list
export function getNextLandingVoyageNumber(
  voyagesList: { voyageNumber: string }[],
  landingsList: { voyageNumber: string }[]
): string {
  const combined = [...voyagesList, ...landingsList];
  if (combined.length === 0) return 'VY-9046';

  let maxNum = 0;
  let prefix = 'VY-';

  combined.forEach((item) => {
    if (!item.voyageNumber) return;
    const match = item.voyageNumber.match(/^(.*?)(\d+)$/);
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
  return `VY-${combined.length + 9046}`;
}

export const VoyageLandingTable: React.FC<VoyageLandingTableProps> = ({
  landings = [],
  voyages = [],
  vessels = [],
  ports = [],
  waterBodies = [],
  onAddLanding,
  onUpdateLanding,
  onDeleteLanding,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [portFilter, setPortFilter] = useState<string>('All');
  const [vesselFilter, setVesselFilter] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [selectedLandingForManifest, setSelectedLandingForManifest] = useState<LandingRecord | null>(null);
  const [selectedLandingForClearance, setSelectedLandingForClearance] = useState<LandingRecord | null>(null);
  const [editingLanding, setEditingLanding] = useState<LandingRecord | null>(null);

  // Form State for Record Landing
  const [formData, setFormData] = useState<{
    voyageNumber: string;
    vesselId: string;
    vesselName: string;
    departurePort: string;
    arrivalPort: string;
    landingBerth: string;
    waterBody: string;
    landingDate: string;
    landingTime: string;
    scheduledArrivalDate: string;
    scheduledArrivalTime: string;
    status: LandingRecord['status'];
    captainName: string;
    harborPilotName: string;
    pilotageStatus: LandingRecord['pilotageStatus'];
    portAuthorityClearance: LandingRecord['portAuthorityClearance'];
    fuelRemainingMT: number;
    transitHours: number;
    disembarkedPassengers: number;
    dischargedTrucks: number;
    dischargedWagons: number;
    dischargedCars: number;
    dischargedPickups: number;
    dischargedMotorcycles: number;
    dischargedCargoTonnage: number;
    dischargedBicycles: number;
    dischargedBuses: number;
    dischargeCondition: string;
    crewRollcallOnArrival: number;
    crewTotal: number;
    remarks: string;
  }>({
    voyageNumber: 'VY-9046',
    vesselId: vessels[0]?.id || 'VES-001',
    vesselName: vessels[0]?.name || 'VOYAGER TITAN',
    departurePort: ports[0]?.name || 'Port of Rotterdam',
    arrivalPort: ports[1]?.name || 'Port of Singapore',
    landingBerth: 'Berth #4 Container Quay',
    waterBody: waterBodies[0]?.name || 'North Sea',
    landingDate: new Date().toISOString().split('T')[0],
    landingTime: '14:30',
    scheduledArrivalDate: new Date().toISOString().split('T')[0],
    scheduledArrivalTime: '14:00',
    status: 'Berthed / Landed',
    captainName: 'Capt. Henrik Lindqvist',
    harborPilotName: 'Pilot Jan van Dijk',
    pilotageStatus: 'Pilot Onboard & Docked',
    portAuthorityClearance: 'Cleared & Granted Pratique',
    fuelRemainingMT: 350,
    transitHours: 24,
    disembarkedPassengers: 110,
    dischargedTrucks: 22,
    dischargedWagons: 8,
    dischargedCars: 140,
    dischargedPickups: 18,
    dischargedMotorcycles: 25,
    dischargedCargoTonnage: 7800,
    dischargedBicycles: 35,
    dischargedBuses: 5,
    dischargeCondition: 'Normal - All Cleared',
    crewRollcallOnArrival: 16,
    crewTotal: 16,
    remarks: 'Disembarkation and cargo discharge proceeding on schedule.',
  });

  // Filtered landings
  const filteredLandings = useMemo(() => {
    return landings.filter((item) => {
      const matchSearch =
        item.voyageNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.departurePort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.arrivalPort.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.landingBerth.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.captainName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchPort = portFilter === 'All' || item.arrivalPort === portFilter;
      const matchVessel = vesselFilter === 'All' || item.vesselName === vesselFilter;

      return matchSearch && matchStatus && matchPort && matchVessel;
    });
  }, [landings, searchTerm, statusFilter, portFilter, vesselFilter]);

  // Aggregate Landing Metrics
  const metrics = useMemo(() => {
    const totalLandings = landings.length;
    const berthedOrDischarging = landings.filter(
      (l) => l.status === 'Berthed / Landed' || l.status === 'Discharging'
    ).length;
    const totalDisembarkedPassengers = landings.reduce((sum, l) => sum + (l.disembarkedPassengers || 0), 0);
    const totalDischargedCargoTonnage = landings.reduce((sum, l) => sum + (l.dischargedCargoTonnage || 0), 0);
    const totalDischargedVehicles = landings.reduce(
      (sum, l) =>
        sum +
        (l.dischargedTrucks || 0) +
        (l.dischargedWagons || 0) +
        (l.dischargedCars || 0) +
        (l.dischargedPickups || 0) +
        (l.dischargedMotorcycles || 0) +
        (l.dischargedBicycles || 0) +
        (l.dischargedBuses || 0),
      0
    );
    const clearedCount = landings.filter(
      (l) =>
        l.portAuthorityClearance === 'Cleared & Granted Pratique' ||
        l.portAuthorityClearance === 'Customs & Border Cleared'
    ).length;
    const clearanceRate = totalLandings > 0 ? Math.round((clearedCount / totalLandings) * 100) : 100;

    return {
      totalLandings,
      berthedOrDischarging,
      totalDisembarkedPassengers,
      totalDischargedCargoTonnage,
      totalDischargedVehicles,
      clearanceRate,
    };
  }, [landings]);

  // Validate current step before advancing
  const validateLandingStep = (stepToValidate: number): boolean => {
    setStepError(null);
    if (stepToValidate === 1) {
      if (!formData.voyageNumber.trim()) {
        setStepError('Please provide a Voyage Number.');
        return false;
      }
      if (!formData.captainName.trim()) {
        setStepError('Please provide the Master / Captain name.');
        return false;
      }
      if (!formData.landingBerth.trim()) {
        setStepError('Please provide the Landing Berth / Pier / Slip.');
        return false;
      }
      if (!formData.landingDate) {
        setStepError('Please select the Actual Landing Date.');
        return false;
      }
      if (!formData.landingTime) {
        setStepError('Please select the Berthing Time.');
        return false;
      }
    }
    return true;
  };

  // Open Create Landing Form with Auto-incremented editable voyage number
  const handleOpenCreate = () => {
    setEditingLanding(null);
    setCurrentStep(1);
    setStepError(null);
    const autoNumber = getNextLandingVoyageNumber(voyages, landings);
    setFormData({
      voyageNumber: autoNumber,
      vesselId: vessels[0]?.id || 'VES-001',
      vesselName: vessels[0]?.name || 'VOYAGER TITAN',
      departurePort: ports[0]?.name || 'Port of Rotterdam',
      arrivalPort: ports[1]?.name || 'Port of Singapore',
      landingBerth: 'Berth #4 Container Quay',
      waterBody: waterBodies[0]?.name || 'North Sea',
      landingDate: new Date().toISOString().split('T')[0],
      landingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      scheduledArrivalDate: new Date().toISOString().split('T')[0],
      scheduledArrivalTime: '14:00',
      status: 'Berthed / Landed',
      captainName: 'Capt. Henrik Lindqvist',
      harborPilotName: 'Pilot Jan van Dijk',
      pilotageStatus: 'Pilot Onboard & Docked',
      portAuthorityClearance: 'Cleared & Granted Pratique',
      fuelRemainingMT: 350,
      transitHours: 24,
      disembarkedPassengers: 110,
      dischargedTrucks: 22,
      dischargedWagons: 8,
      dischargedCars: 140,
      dischargedPickups: 18,
      dischargedMotorcycles: 25,
      dischargedCargoTonnage: 7800,
      dischargedBicycles: 35,
      dischargedBuses: 5,
      dischargeCondition: 'Normal - All Cleared',
      crewRollcallOnArrival: vessels[0]?.crewCount || 16,
      crewTotal: vessels[0]?.crewCount || 16,
      remarks: 'Disembarkation and cargo discharge proceeding on schedule.',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (landing: LandingRecord) => {
    setEditingLanding(landing);
    setCurrentStep(1);
    setStepError(null);
    setFormData({
      voyageNumber: landing.voyageNumber,
      vesselId: landing.vesselId,
      vesselName: landing.vesselName,
      departurePort: landing.departurePort,
      arrivalPort: landing.arrivalPort,
      landingBerth: landing.landingBerth,
      waterBody: landing.waterBody || 'North Sea',
      landingDate: landing.landingDate,
      landingTime: landing.landingTime,
      scheduledArrivalDate: landing.scheduledArrivalDate || landing.landingDate,
      scheduledArrivalTime: landing.scheduledArrivalTime || '14:00',
      status: landing.status,
      captainName: landing.captainName,
      harborPilotName: landing.harborPilotName || '',
      pilotageStatus: landing.pilotageStatus,
      portAuthorityClearance: landing.portAuthorityClearance,
      fuelRemainingMT: landing.fuelRemainingMT || 0,
      transitHours: landing.transitHours || 0,
      disembarkedPassengers: landing.disembarkedPassengers,
      dischargedTrucks: landing.dischargedTrucks,
      dischargedWagons: landing.dischargedWagons,
      dischargedCars: landing.dischargedCars,
      dischargedPickups: landing.dischargedPickups,
      dischargedMotorcycles: landing.dischargedMotorcycles,
      dischargedCargoTonnage: landing.dischargedCargoTonnage,
      dischargedBicycles: landing.dischargedBicycles,
      dischargedBuses: landing.dischargedBuses,
      dischargeCondition: landing.dischargeCondition || 'Normal - All Cleared',
      crewRollcallOnArrival: landing.crewRollcallOnArrival,
      crewTotal: landing.crewTotal,
      remarks: landing.remarks || '',
    });
    setIsAddModalOpen(true);
  };

  // Autofill from existing voyage departure if selected
  const handleSelectLinkedVoyage = (voyageNum: string) => {
    const match = voyages.find((v) => v.voyageNumber === voyageNum);
    if (match) {
      setFormData((prev) => ({
        ...prev,
        voyageNumber: match.voyageNumber,
        vesselId: match.vesselId,
        vesselName: match.vesselName,
        departurePort: match.departurePort,
        arrivalPort: match.arrivalPort,
        waterBody: match.waterBody,
        captainName: match.captainName,
        disembarkedPassengers: match.passengers,
        dischargedTrucks: match.trucks,
        dischargedWagons: match.wagons,
        dischargedCars: match.cars,
        dischargedPickups: match.pickups,
        dischargedMotorcycles: match.motorcycles,
        dischargedCargoTonnage: match.cargoTonnage,
        dischargedBicycles: match.bicycles,
        dischargedBuses: match.buses,
        crewTotal: match.crewCount,
        crewRollcallOnArrival: match.crewCount,
      }));
    }
  };

  // Submit Add or Edit
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingLanding) {
      const updated: LandingRecord = {
        ...editingLanding,
        voyageNumber: formData.voyageNumber,
        vesselId: formData.vesselId,
        vesselName: formData.vesselName,
        departurePort: formData.departurePort,
        arrivalPort: formData.arrivalPort,
        landingBerth: formData.landingBerth,
        waterBody: formData.waterBody,
        landingDate: formData.landingDate,
        landingTime: formData.landingTime,
        scheduledArrivalDate: formData.scheduledArrivalDate,
        scheduledArrivalTime: formData.scheduledArrivalTime,
        status: formData.status,
        captainName: formData.captainName,
        harborPilotName: formData.harborPilotName,
        pilotageStatus: formData.pilotageStatus,
        portAuthorityClearance: formData.portAuthorityClearance,
        fuelRemainingMT: Number(formData.fuelRemainingMT),
        transitHours: Number(formData.transitHours),
        disembarkedPassengers: Number(formData.disembarkedPassengers),
        dischargedTrucks: Number(formData.dischargedTrucks),
        dischargedWagons: Number(formData.dischargedWagons),
        dischargedCars: Number(formData.dischargedCars),
        dischargedPickups: Number(formData.dischargedPickups),
        dischargedMotorcycles: Number(formData.dischargedMotorcycles),
        dischargedCargoTonnage: Number(formData.dischargedCargoTonnage),
        dischargedBicycles: Number(formData.dischargedBicycles),
        dischargedBuses: Number(formData.dischargedBuses),
        dischargeCondition: formData.dischargeCondition as any,
        crewRollcallOnArrival: Number(formData.crewRollcallOnArrival),
        crewTotal: Number(formData.crewTotal),
        remarks: formData.remarks,
      };
      onUpdateLanding(updated);
    } else {
      const newLanding: LandingRecord = {
        id: `LDG-${Date.now()}`,
        voyageNumber: formData.voyageNumber,
        vesselId: formData.vesselId,
        vesselName: formData.vesselName,
        departurePort: formData.departurePort,
        arrivalPort: formData.arrivalPort,
        landingBerth: formData.landingBerth,
        waterBody: formData.waterBody,
        landingDate: formData.landingDate,
        landingTime: formData.landingTime,
        scheduledArrivalDate: formData.scheduledArrivalDate,
        scheduledArrivalTime: formData.scheduledArrivalTime,
        status: formData.status,
        captainName: formData.captainName,
        harborPilotName: formData.harborPilotName,
        pilotageStatus: formData.pilotageStatus,
        portAuthorityClearance: formData.portAuthorityClearance,
        fuelRemainingMT: Number(formData.fuelRemainingMT),
        transitHours: Number(formData.transitHours),
        disembarkedPassengers: Number(formData.disembarkedPassengers),
        dischargedTrucks: Number(formData.dischargedTrucks),
        dischargedWagons: Number(formData.dischargedWagons),
        dischargedCars: Number(formData.dischargedCars),
        dischargedPickups: Number(formData.dischargedPickups),
        dischargedMotorcycles: Number(formData.dischargedMotorcycles),
        dischargedCargoTonnage: Number(formData.dischargedCargoTonnage),
        dischargedBicycles: Number(formData.dischargedBicycles),
        dischargedBuses: Number(formData.dischargedBuses),
        dischargeCondition: formData.dischargeCondition as any,
        crewRollcallOnArrival: Number(formData.crewRollcallOnArrival),
        crewTotal: Number(formData.crewTotal),
        remarks: formData.remarks,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddLanding(newLanding);
    }

    setIsAddModalOpen(false);
    setEditingLanding(null);
  };

  // Export Landings data as CSV
  const handleExportCSV = () => {
    const headers = [
      'Landing ID',
      'Voyage No',
      'Vessel Name',
      'Origin Port',
      'Landing Port',
      'Berth / Pier',
      'Landing Date',
      'Landing Time',
      'Status',
      'Captain',
      'Pilot Name',
      'Customs Clearance',
      'Disembarked Passengers',
      'Discharged Trucks',
      'Discharged Wagons',
      'Discharged Cars',
      'Discharged Pickups',
      'Discharged Motorcycles',
      'Discharged Cargo MT',
      'Discharged Bicycles',
      'Discharged Buses',
      'Crew Arrival Rollcall',
      'Discharge Condition',
    ];

    const rows = landings.map((l) => [
      l.id,
      l.voyageNumber,
      `"${l.vesselName}"`,
      `"${l.departurePort}"`,
      `"${l.arrivalPort}"`,
      `"${l.landingBerth}"`,
      l.landingDate,
      l.landingTime,
      l.status,
      `"${l.captainName}"`,
      `"${l.harborPilotName || 'N/A'}"`,
      `"${l.portAuthorityClearance}"`,
      l.disembarkedPassengers,
      l.dischargedTrucks,
      l.dischargedWagons,
      l.dischargedCars,
      l.dischargedPickups,
      l.dischargedMotorcycles,
      l.dischargedCargoTonnage,
      l.dischargedBicycles,
      l.dischargedBuses,
      `${l.crewRollcallOnArrival}/${l.crewTotal}`,
      `"${l.dischargeCondition || 'Normal'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voyage_landing_manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20 dark:text-blue-400 shadow-inner">
              <Anchor className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Voyage Landing & Discharge
                </h1>
                <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Port Arrival & Clearance Active
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Log vessel berthing, port authority clearances, disembarkation counts, vehicle discharge, and cargo tonnage audits.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-export-landing-csv"
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2E3A47] transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export Manifest</span>
            </button>

            <button
              id="btn-record-landing"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 rounded-xl bg-[#465FFF] hover:bg-[#3b51db] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Record Vessel Landing</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* Total Landings */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Landings</span>
            <Anchor className="h-4 w-4 text-[#465FFF]" />
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {metrics.totalLandings}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {metrics.berthedOrDischarging} berthed / discharging
          </div>
        </div>

        {/* Disembarked Passengers */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Passengers Landed</span>
            <Users className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.totalDisembarkedPassengers.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            All ashore & accounted
          </div>
        </div>

        {/* Discharged Vehicles */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Vehicles Unloaded</span>
            <Car className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {metrics.totalDischargedVehicles.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Ro-Ro & car deck units
          </div>
        </div>

        {/* Discharged Cargo */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cargo Discharged</span>
            <PackageCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {(metrics.totalDischargedCargoTonnage / 1000).toFixed(1)}k <span className="text-xs font-semibold">MT</span>
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Bulk, container & liquid
          </div>
        </div>

        {/* Trucks & Wagons */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Heavy Freight</span>
            <Truck className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {landings.reduce((sum, l) => sum + (l.dischargedTrucks || 0) + (l.dischargedWagons || 0), 0)}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Trucks + rail wagons
          </div>
        </div>

        {/* Port Clearance Rate */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clearance Rate</span>
            <ShieldCheck className="h-4 w-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">
            {metrics.clearanceRate}%
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Customs & Pratique
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xs overflow-hidden">
        {/* Table Filters & Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-[#2E3A47]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search landing by voyage #, vessel, port, berth, or captain..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#465FFF] focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filter Selects */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Berthed / Landed">Berthed / Landed</option>
                  <option value="Discharging">Discharging</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Anchorage Waiting">Anchorage Waiting</option>
                  <option value="Delayed">Delayed</option>
                </select>
              </div>

              {/* Port Filter */}
              <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Landing Port:</span>
                <select
                  value={portFilter}
                  onChange={(e) => setPortFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Ports</option>
                  {ports.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vessel Filter */}
              <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5">
                <Ship className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Vessel:</span>
                <select
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

        {/* Landing Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-3.5 px-4">Voyage Code & Vessel</th>
                <th className="py-3.5 px-4">Landing Port & Berth</th>
                <th className="py-3.5 px-4">Berthing Timestamp</th>
                <th className="py-3.5 px-4">Discharge & Payload Manifest</th>
                <th className="py-3.5 px-4">Harbor Pilot & Clearance</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredLandings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Anchor className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="font-medium">No vessel landing records found</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Try modifying search filters or record a new vessel landing.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLandings.map((landing) => {
                  return (
                    <tr
                      key={landing.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors"
                    >
                      {/* 1. Voyage Code & Vessel */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                            <Anchor className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                              <span>{landing.voyageNumber}</span>
                              <span className="text-[10px] font-normal text-gray-400">({landing.id})</span>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                              {landing.vesselName}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              Master: {landing.captainName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Route & Landing Berth */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                            <span className="text-gray-500 text-[11px]">{landing.departurePort}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <span className="text-[#465FFF] dark:text-blue-400 font-bold">{landing.arrivalPort}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                            <MapPin className="h-3 w-3 text-rose-500 shrink-0" />
                            <span>{landing.landingBerth}</span>
                          </div>
                        </div>
                      </td>

                      {/* 3. Berthing Timestamp & Transit */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-white">
                            <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{landing.landingDate} {landing.landingTime}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <span>Transit: {landing.transitHours || 12}h</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Fuel className="h-3 w-3 text-amber-500" />
                              {landing.fuelRemainingMT || 280} MT fuel
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Disembarkation & Discharge Manifest */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                              <Users className="h-3 w-3" />
                              {landing.disembarkedPassengers} Pax
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[11px] font-bold text-blue-700 dark:text-blue-400">
                              <PackageCheck className="h-3 w-3" />
                              {landing.dischargedCargoTonnage.toLocaleString()} MT
                            </span>
                          </div>
                          <button
                            id={`btn-view-landing-manifest-${landing.id}`}
                            onClick={() => setSelectedLandingForManifest(landing)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#465FFF] dark:text-blue-400 hover:underline"
                          >
                            <Car className="h-3 w-3" />
                            <span>
                              {landing.dischargedTrucks +
                                landing.dischargedWagons +
                                landing.dischargedCars +
                                landing.dischargedPickups +
                                landing.dischargedMotorcycles +
                                landing.dischargedBicycles +
                                landing.dischargedBuses}{' '}
                              Vehicles Discharged (View Details)
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* 5. Harbor Pilot & Clearance */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{landing.portAuthorityClearance}</span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            {landing.harborPilotName || 'Pilotage Complete'} • {landing.pilotageStatus}
                          </div>
                        </div>
                      </td>

                      {/* 6. Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            landing.status === 'Berthed / Landed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : landing.status === 'Discharging'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 animate-pulse'
                              : landing.status === 'Cleared'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                              : landing.status === 'Anchorage Waiting'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                          }`}
                        >
                          {landing.status}
                        </span>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`btn-view-landing-clearance-${landing.id}`}
                            onClick={() => setSelectedLandingForClearance(landing)}
                            title="View Port Clearance Certificate"
                            className="p-1.5 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          >
                            <FileCheck className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-edit-landing-${landing.id}`}
                            onClick={() => handleOpenEdit(landing)}
                            title="Edit Landing Record"
                            className="p-1.5 text-gray-400 hover:text-[#465FFF] dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            id={`btn-delete-landing-${landing.id}`}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove landing record "${landing.voyageNumber}"?`)) {
                                onDeleteLanding(landing.id);
                              }
                            }}
                            title="Delete Landing Record"
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

      {/* MODAL 1: Record Vessel Landing / Edit Landing */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Anchor className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingLanding ? `Edit Landing: ${editingLanding.voyageNumber}` : 'Record Vessel Landing & Discharge'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Log berthing timestamp, harbor pilot, customs clearance, and discharge manifest.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingLanding(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="px-6 py-3.5 border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#1E293B]/60">
              <div className="flex items-center justify-between">
                {[
                  {
                    step: 1,
                    title: '1. Identification & Berthing',
                    subtitle: 'Vessel, Route & Berthing Time',
                    icon: Ship,
                  },
                  {
                    step: 2,
                    title: '2. Pilot & Port Clearances',
                    subtitle: 'Harbor Pilot, Customs & Bunker',
                    icon: ShieldCheck,
                  },
                  {
                    step: 3,
                    title: '3. Discharge Manifest & Remarks',
                    subtitle: 'Cargo, Vehicles & Log Notes',
                    icon: PackageCheck,
                  },
                ].map((s, idx, arr) => {
                  const isCurrent = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  const Icon = s.icon;
                  return (
                    <React.Fragment key={s.step}>
                      <button
                        type="button"
                        onClick={() => {
                          if (s.step < currentStep || validateLandingStep(currentStep)) {
                            setCurrentStep(s.step);
                          }
                        }}
                        className={`flex items-center gap-2.5 text-left transition-all ${
                          isCurrent
                            ? 'opacity-100'
                            : isCompleted
                            ? 'opacity-90 hover:opacity-100'
                            : 'opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs transition-all ${
                            isCurrent
                              ? 'bg-emerald-600 text-white shadow-xs ring-4 ring-emerald-100 dark:ring-emerald-950/60'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-gray-200 text-gray-600 dark:bg-[#24303F] dark:text-gray-400'
                          }`}
                        >
                          {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : <Icon className="h-4 w-4" />}
                        </div>
                        <div className="hidden sm:block">
                          <div className="text-[11px] font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            <span>Step {s.step}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">
                            {s.title.split('. ')[1]}
                          </div>
                        </div>
                      </button>
                      {idx < arr.length - 1 && (
                        <div className="flex-1 max-w-[30px] sm:max-w-[60px] md:max-w-[80px] mx-2 h-0.5 bg-gray-200 dark:bg-[#2E3A47] relative">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: isCompleted ? '100%' : '0%' }}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {stepError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
                  <span>{stepError}</span>
                  <button
                    type="button"
                    onClick={() => setStepError(null)}
                    className="text-rose-400 hover:text-rose-600 font-bold"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* STEP 1: Voyage Identification, Vessel & Berthing Schedule */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Optional Quick Link from Departure Voyage */}
                  {!editingLanding && voyages.length > 0 && (
                    <div className="rounded-xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/60 dark:bg-[#1B273A] p-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 text-blue-500" />
                          Optional: Autofill from En-Route Voyage Departure
                        </span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) handleSelectLinkedVoyage(e.target.value);
                          }}
                          defaultValue=""
                          className="rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-[#24303F] px-2.5 py-1 text-xs text-gray-800 dark:text-gray-200 focus:outline-none"
                        >
                          <option value="">-- Select Departure Voyage to Link --</option>
                          {voyages.map((v) => (
                            <option key={v.id} value={v.voyageNumber}>
                              {v.voyageNumber} ({v.vesselName} - {v.departurePort} → {v.arrivalPort})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                      <Ship className="h-4 w-4" />
                      1. Voyage Identification, Vessel & Berthing Schedule
                    </h4>
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                            Voyage Number *
                          </label>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded font-semibold">
                            Auto # (Editable)
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.voyageNumber}
                          onChange={(e) => setFormData({ ...formData, voyageNumber: e.target.value })}
                          placeholder="e.g. VY-9046"
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-semibold focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Vessel Landed *
                        </label>
                        <select
                          value={formData.vesselName}
                          onChange={(e) => {
                            const selectedV = vessels.find((v) => v.name === e.target.value);
                            setFormData({
                              ...formData,
                              vesselName: e.target.value,
                              vesselId: selectedV?.id || 'VES-001',
                            });
                          }}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
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
                        <input
                          type="text"
                          required
                          value={formData.captainName}
                          onChange={(e) => setFormData({ ...formData, captainName: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Port of Origin (Departure) *
                        </label>
                        <select
                          value={formData.departurePort}
                          onChange={(e) => setFormData({ ...formData, departurePort: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        >
                          {ports.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({p.country})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Landing Port (Arrival) *
                        </label>
                        <select
                          value={formData.arrivalPort}
                          onChange={(e) => setFormData({ ...formData, arrivalPort: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold"
                        >
                          {ports.map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name} ({p.country})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Landing Berth / Pier / Slip *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Berth #4 Container Quay"
                          value={formData.landingBerth}
                          onChange={(e) => setFormData({ ...formData, landingBerth: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Actual Landing Date *
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.landingDate}
                          onChange={(e) => setFormData({ ...formData, landingDate: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Actual Berthing Time *
                        </label>
                        <input
                          type="time"
                          required
                          value={formData.landingTime}
                          onChange={(e) => setFormData({ ...formData, landingTime: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Transit Duration (Hours)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.transitHours}
                          onChange={(e) => setFormData({ ...formData, transitHours: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Harbor Pilot & Port Clearances */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" />
                      2. Harbor Pilot & Port Clearances
                    </h4>
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Harbor Pilot Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Pilot Jan van Dijk"
                          value={formData.harborPilotName}
                          onChange={(e) => setFormData({ ...formData, harborPilotName: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Pilotage Status
                        </label>
                        <select
                          value={formData.pilotageStatus}
                          onChange={(e) => setFormData({ ...formData, pilotageStatus: e.target.value as any })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Pilot Onboard & Docked">Pilot Onboard & Docked</option>
                          <option value="Direct Berthing">Direct Berthing</option>
                          <option value="Tug Escorted">Tug Escorted</option>
                          <option value="Pending Pilot">Pending Pilot</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Port Authority / Customs Clearance
                        </label>
                        <select
                          value={formData.portAuthorityClearance}
                          onChange={(e) => setFormData({ ...formData, portAuthorityClearance: e.target.value as any })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none font-semibold text-teal-600 dark:text-teal-400"
                        >
                          <option value="Cleared & Granted Pratique">Cleared & Granted Pratique</option>
                          <option value="Customs & Border Cleared">Customs & Border Cleared</option>
                          <option value="Under Inspection">Under Inspection</option>
                          <option value="Quarantine Clearance">Quarantine Clearance</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Landing Status *
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold"
                        >
                          <option value="Berthed / Landed">Berthed / Landed</option>
                          <option value="Discharging">Discharging</option>
                          <option value="Cleared">Cleared</option>
                          <option value="Anchorage Waiting">Anchorage Waiting</option>
                          <option value="Delayed">Delayed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Remaining Fuel on Arrival (MT)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.fuelRemainingMT}
                          onChange={(e) => setFormData({ ...formData, fuelRemainingMT: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Crew Arrival Rollcall (Present / Total)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={formData.crewRollcallOnArrival}
                            onChange={(e) => setFormData({ ...formData, crewRollcallOnArrival: Number(e.target.value) })}
                            className="w-1/2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                          />
                          <span className="text-gray-400 font-bold">/</span>
                          <input
                            type="number"
                            value={formData.crewTotal}
                            onChange={(e) => setFormData({ ...formData, crewTotal: Number(e.target.value) })}
                            className="w-1/2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Disembarkation & Discharged Cargo / Vehicle Manifest & Remarks */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-4 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <PackageCheck className="h-4 w-4" />
                      3. Disembarkation & Discharged Cargo / Vehicle Manifest
                    </h4>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {/* Passengers */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Disembarked Passengers
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.disembarkedPassengers}
                          onChange={(e) => setFormData({ ...formData, disembarkedPassengers: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold text-emerald-600"
                        />
                      </div>

                      {/* Cargo Tonnage */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Cargo Discharged (MT)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={formData.dischargedCargoTonnage}
                          onChange={(e) => setFormData({ ...formData, dischargedCargoTonnage: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none font-bold text-purple-600"
                        />
                      </div>

                      {/* Trucks */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Trucks
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedTrucks}
                          onChange={(e) => setFormData({ ...formData, dischargedTrucks: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Wagons */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Wagons
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedWagons}
                          onChange={(e) => setFormData({ ...formData, dischargedWagons: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Cars */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Cars
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedCars}
                          onChange={(e) => setFormData({ ...formData, dischargedCars: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Pickups */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Pick-ups
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedPickups}
                          onChange={(e) => setFormData({ ...formData, dischargedPickups: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Motorcycles */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Motorcycles
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedMotorcycles}
                          onChange={(e) => setFormData({ ...formData, dischargedMotorcycles: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Bicycles */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Bicycles
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedBicycles}
                          onChange={(e) => setFormData({ ...formData, dischargedBicycles: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Buses */}
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Discharged Buses
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.dischargedBuses}
                          onChange={(e) => setFormData({ ...formData, dischargedBuses: Number(e.target.value) })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      {/* Discharge Condition */}
                      <div className="sm:col-span-2 md:col-span-3">
                        <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Cargo & Vehicle Discharge Condition
                        </label>
                        <select
                          value={formData.dischargeCondition}
                          onChange={(e) => setFormData({ ...formData, dischargeCondition: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                        >
                          <option value="Normal - All Cleared">Normal - All Cleared</option>
                          <option value="Discharge Complete No Damage">Discharge Complete No Damage</option>
                          <option value="Minor Cargo Shift Reported">Minor Cargo Shift Reported</option>
                          <option value="Customs Hold on Wagon #4">Customs Hold on Specific Unit</option>
                        </select>
                      </div>
                    </div>

                    {/* Landing Remarks / Log Notes */}
                    <div className="pt-2 border-t border-gray-200/60 dark:border-[#2E3A47]">
                      <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Landing Remarks / Log Notes
                      </label>
                      <textarea
                        rows={2}
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        placeholder="Enter harbor master notes, ramp status, or berthing observations..."
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Action Buttons: Cancel, Back, Next, Submit */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingLanding(null);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2.5">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setStepError(null);
                        setCurrentStep((prev) => Math.max(1, prev - 1));
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  )}

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (validateLandingStep(currentStep)) {
                          setCurrentStep((prev) => Math.min(3, prev + 1));
                        }
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                    >
                      <span>
                        {currentStep === 1
                          ? 'Next: Harbor Pilot & Clearances'
                          : 'Next: Disembarkation & Manifest'}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{editingLanding ? 'Update Landing Record' : 'Save Landing & Discharge Record'}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Disembarkation & Discharge Manifest Details */}
      {selectedLandingForManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <PackageCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Landing Discharge Manifest: {selectedLandingForManifest.voyageNumber}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedLandingForManifest.vesselName} landed at {selectedLandingForManifest.arrivalPort} ({selectedLandingForManifest.landingBerth})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLandingForManifest(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Manifest Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Users className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Passengers Landed</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.disembarkedPassengers}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <PackageCheck className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Discharged Tonnage</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                    {selectedLandingForManifest.dischargedCargoTonnage.toLocaleString()} MT
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Truck className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Trucks Unloaded</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedTrucks}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Layers className="h-5 w-5 mx-auto text-indigo-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Rail Wagons</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedWagons}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Car className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Cars Discharged</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedCars}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Truck className="h-5 w-5 mx-auto text-cyan-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Pick-ups</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedPickups}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Bike className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Motorcycles</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedMotorcycles}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Bike className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Bicycles</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedBicycles}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 p-3.5 text-center">
                  <Bus className="h-5 w-5 mx-auto text-red-500 mb-1" />
                  <div className="text-xs text-gray-500 dark:text-gray-400">Coaches / Buses</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLandingForManifest.dischargedBuses}
                  </div>
                </div>
              </div>

              {/* Condition Note */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs text-gray-700 dark:text-gray-300">
                <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Inspection Status: {selectedLandingForManifest.dischargeCondition || 'Normal - All Cleared'}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  {selectedLandingForManifest.remarks || 'No cargo damages or vehicle incidents noted during disembarkation.'}
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-[#2E3A47] px-6 py-3 bg-gray-50/50 dark:bg-[#24303F]/30 text-right">
              <button
                onClick={() => setSelectedLandingForManifest(null)}
                className="rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b51db]"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Port Authority & Pilotage Certificate */}
      {selectedLandingForClearance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Port Authority & Customs Certificate
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedLandingForClearance.arrivalPort} • {selectedLandingForClearance.landingBerth}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLandingForClearance(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 text-xs text-gray-700 dark:text-gray-300">
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Voyage Reference:</span>
                <span className="font-bold text-gray-900 dark:text-white">{selectedLandingForClearance.voyageNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Vessel & Master:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedLandingForClearance.vesselName} ({selectedLandingForClearance.captainName})
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Actual Berthing Date/Time:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedLandingForClearance.landingDate} at {selectedLandingForClearance.landingTime}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Harbor Pilot Assigned:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedLandingForClearance.harborPilotName || 'VTS Monitored'} ({selectedLandingForClearance.pilotageStatus})
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Port Authority Clearance:</span>
                <span className="font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded">
                  {selectedLandingForClearance.portAuthorityClearance}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Crew Rollcall on Landing:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedLandingForClearance.crewRollcallOnArrival} / {selectedLandingForClearance.crewTotal} Present
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#2E3A47]">
                <span className="font-semibold text-gray-500">Remaining Bunkers / Fuel:</span>
                <span className="font-bold text-amber-600">
                  {selectedLandingForClearance.fuelRemainingMT || 250} MT
                </span>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-[#2E3A47] px-6 py-3 bg-gray-50/50 dark:bg-[#24303F]/30 text-right">
              <button
                onClick={() => setSelectedLandingForClearance(null)}
                className="rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b51db]"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
