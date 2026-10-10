import React, { useState } from 'react';
import {
  CargoManifestRecord,
  VoyageRecord,
  Vessel,
  PortRecord,
  LookupItem,
} from '../types';
import {
  Package,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ThermometerSnowflake,
  Layers,
  FileCheck,
  Eye,
  Edit2,
  Trash2,
  X,
  Ship,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  Check,
  FileSpreadsheet,
  Car,
  Truck,
  Bus,
} from 'lucide-react';

interface CargoManifestViewProps {
  cargoList: CargoManifestRecord[];
  voyagesList?: VoyageRecord[];
  voyages?: VoyageRecord[];
  vesselsList?: Vessel[];
  vessels?: Vessel[];
  portsList?: PortRecord[];
  ports?: PortRecord[];
  lookupItems?: LookupItem[];
  lookups?: LookupItem[];
  onAddCargo: (cargo: CargoManifestRecord) => void;
  onUpdateCargo: (cargo: CargoManifestRecord) => void;
  onDeleteCargo: (cargoId: string) => void;
  onShowToast?: (msg: string) => void;
}

export const CargoManifestView: React.FC<CargoManifestViewProps> = ({
  cargoList = [],
  voyagesList,
  voyages,
  vesselsList,
  vessels,
  portsList,
  ports,
  lookupItems,
  lookups,
  onAddCargo,
  onUpdateCargo,
  onDeleteCargo,
  onShowToast,
}) => {
  // Normalize lists
  const actualVoyages = voyagesList || voyages || [];
  const actualVessels = vesselsList || vessels || [];
  const actualPorts = portsList || ports || [];
  const allLookups = lookupItems || lookups || [];

  // Filter States
  const [cargoSearch, setCargoSearch] = useState('');
  const [cargoVoyageFilter, setCargoVoyageFilter] = useState('ALL');
  const [cargoCategoryFilter, setCargoCategoryFilter] = useState('ALL');
  const [cargoCustomsFilter, setCargoCustomsFilter] = useState('ALL');
  const [cargoHazmatFilter, setCargoHazmatFilter] = useState('ALL');

  // Form & Modals States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingCargo, setViewingCargo] = useState<CargoManifestRecord | null>(null);
  const [editingCargo, setEditingCargo] = useState<CargoManifestRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Cargo Form Data
  const defaultCargoForm: Omit<CargoManifestRecord, 'id'> = {
    billOfLadingNumber: '',
    voyageNumber: actualVoyages[0]?.voyageNumber || 'VOY-2026-081',
    vesselName: actualVoyages[0]?.vesselName || actualVessels[0]?.name || 'Baltic Horizon',
    containerOrConsignmentId: '',
    cargoDescription: '',
    cargoCategory: 'Containerized (FCL/LCL)',
    packageType: '20ft Standard Dry Container (20GP)',
    packageCount: 1,
    hazardClass: 'Non-Hazardous',
    unNumber: '',
    grossWeightMT: 18.5,
    netWeightMT: 16.2,
    teuUnits: 1,
    loadingPort: actualVoyages[0]?.departurePort || 'Port of Stockholm (SESTO)',
    dischargePort: actualVoyages[0]?.arrivalPort || 'Port of Helsinki (FIHEL)',
    shipperName: '',
    shipperOrigin: 'Stockholm, Sweden',
    consigneeName: '',
    consigneeDestination: 'Helsinki, Finland',
    stowagePosition: 'Bay 04, Row 02, Tier 82',
    temperatureSetpointC: undefined,
    customsStatus: 'Cleared & Released',
    customsDeclarationRef: `CUS-DECL-${Math.floor(100000 + Math.random() * 900000)}`,
    status: 'Loaded & Manifested',
  };

  const [cargoFormData, setCargoFormData] = useState<Omit<CargoManifestRecord, 'id'>>(defaultCargoForm);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (onShowToast) onShowToast(`Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sample Autofill helper
  const handleFillSampleCargo = () => {
    const sampleVoyage = actualVoyages[0] || {
      voyageNumber: 'VOY-2026-081',
      vesselName: 'Baltic Horizon',
      departurePort: 'Port of Stockholm (SESTO)',
      arrivalPort: 'Port of Helsinki (FIHEL)',
    };

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setCargoFormData({
      billOfLadingNumber: `BL-SGSIN-${randomNum}`,
      voyageNumber: sampleVoyage.voyageNumber,
      vesselName: sampleVoyage.vesselName,
      containerOrConsignmentId: `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
      cargoDescription: 'Precision Industrial Robotics & Controller Units',
      cargoCategory: 'Containerized (FCL/LCL)',
      packageType: '40ft High Cube Container (40HC)',
      packageCount: 48,
      hazardClass: 'IMDG Class 9 (Miscellaneous)',
      unNumber: 'UN 3481',
      grossWeightMT: 22.4,
      netWeightMT: 19.8,
      teuUnits: 2,
      loadingPort: sampleVoyage.departurePort,
      dischargePort: sampleVoyage.arrivalPort,
      shipperName: 'Nordic Automation Technologies AB',
      shipperOrigin: 'Stockholm Logistics Hub, Sweden',
      consigneeName: 'Helsinki Advanced Dynamics Oy',
      consigneeDestination: 'Vuosaari Terminal, Helsinki, Finland',
      stowagePosition: 'Bay 08, Row 04, Tier 86 (Under Deck)',
      temperatureSetpointC: undefined,
      customsStatus: 'Cleared & Released',
      customsDeclarationRef: `CUS-DECL-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'Loaded & Manifested',
    });
    if (onShowToast) onShowToast('Sample cargo data populated');
  };

  const handleCargoVoyageChange = (voyageNo: string) => {
    const matchedVoyage = actualVoyages.find((v) => v.voyageNumber === voyageNo);
    setCargoFormData((prev) => ({
      ...prev,
      voyageNumber: voyageNo,
      vesselName: matchedVoyage?.vesselName || prev.vesselName,
      loadingPort: matchedVoyage?.departurePort || prev.loadingPort,
      dischargePort: matchedVoyage?.arrivalPort || prev.dischargePort,
    }));
  };

  const handleCargoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoFormData.billOfLadingNumber.trim()) {
      if (onShowToast) onShowToast('Please specify a valid Bill of Lading (B/L) number');
      return;
    }
    if (!cargoFormData.containerOrConsignmentId.trim()) {
      if (onShowToast) onShowToast('Please specify container or consignment unit ID');
      return;
    }

    const newCargo: CargoManifestRecord = {
      ...cargoFormData,
      id: `CRG-${Date.now()}`,
    };

    onAddCargo(newCargo);
    setCargoFormData(defaultCargoForm);
    setIsAddModalOpen(false);
    if (onShowToast) onShowToast(`Consignment "${newCargo.billOfLadingNumber}" manifested successfully`);
  };

  const handleEditCargoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCargo) return;
    onUpdateCargo(editingCargo);
    setEditingCargo(null);
    if (onShowToast) onShowToast(`Consignment "${editingCargo.billOfLadingNumber}" updated`);
  };

  // KPI Calculations
  const totalCargoTonnageMT = cargoList.reduce((acc, c) => acc + (c.grossWeightMT || 0), 0);
  const totalTeuCount = cargoList.reduce((acc, c) => acc + (c.teuUnits || 0), 0);
  const hazmatCargoCount = cargoList.filter((c) => c.hazardClass !== 'Non-Hazardous').length;
  const customsClearedCount = cargoList.filter((c) => c.customsStatus === 'Cleared & Released').length;
  const customsClearedPercent = cargoList.length
    ? Math.round((customsClearedCount / cargoList.length) * 100)
    : 100;

  // Filtered Cargo
  const filteredCargo = cargoList.filter((cargo) => {
    const matchesSearch =
      cargo.billOfLadingNumber.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.containerOrConsignmentId.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.cargoDescription.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.shipperName.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      cargo.consigneeName.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      (cargo.unNumber && cargo.unNumber.toLowerCase().includes(cargoSearch.toLowerCase())) ||
      cargo.vesselName.toLowerCase().includes(cargoSearch.toLowerCase());

    const matchesVoyage = cargoVoyageFilter === 'ALL' || cargo.voyageNumber === cargoVoyageFilter;
    const matchesCategory = cargoCategoryFilter === 'ALL' || cargo.cargoCategory === cargoCategoryFilter;
    const matchesCustoms = cargoCustomsFilter === 'ALL' || cargo.customsStatus === cargoCustomsFilter;
    const matchesHazmat =
      cargoHazmatFilter === 'ALL' ||
      (cargoHazmatFilter === 'HAZMAT' && cargo.hazardClass !== 'Non-Hazardous') ||
      (cargoHazmatFilter === 'NON_HAZMAT' && cargo.hazardClass === 'Non-Hazardous');

    return matchesSearch && matchesVoyage && matchesCategory && matchesCustoms && matchesHazmat;
  });

  // Export FAL 2 CSV
  const handleExportFAL2CSV = () => {
    const headers = [
      'B/L Number',
      'Container / Unit ID',
      'Voyage Number',
      'Vessel Name',
      'Cargo Description',
      'Category',
      'Hazard Class',
      'UN Number',
      'Gross Weight (MT)',
      'Net Weight (MT)',
      'TEU Units',
      'Loading Port',
      'Discharge Port',
      'Shipper',
      'Consignee',
      'Stowage Position',
      'Customs Status',
      'Customs Declaration Ref',
    ];

    const rows = filteredCargo.map((c) => [
      `"${c.billOfLadingNumber}"`,
      `"${c.containerOrConsignmentId}"`,
      `"${c.voyageNumber}"`,
      `"${c.vesselName}"`,
      `"${c.cargoDescription.replace(/"/g, '""')}"`,
      `"${c.cargoCategory}"`,
      `"${c.hazardClass}"`,
      `"${c.unNumber || ''}"`,
      c.grossWeightMT,
      c.netWeightMT,
      c.teuUnits,
      `"${c.loadingPort}"`,
      `"${c.dischargePort}"`,
      `"${c.shipperName.replace(/"/g, '""')}"`,
      `"${c.consigneeName.replace(/"/g, '""')}"`,
      `"${c.stowagePosition}"`,
      `"${c.customsStatus}"`,
      `"${c.customsDeclarationRef}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IMO_FAL2_Cargo_Manifest_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) onShowToast('IMO FAL 2 Cargo Manifest exported to CSV');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Package className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Cargo Manifest (IMO FAL Form 2)
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
            Manage freight declaration, containerized &amp; bulk consignments, Dangerous Goods (IMDG), and customs release.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-cargo-fal2-btn"
            onClick={handleExportFAL2CSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
          >
            <Download className="h-4 w-4 text-gray-500 dark:text-[#8A99AD]" />
            <span>Export FAL 2 (CSV)</span>
          </button>

          <button
            id="open-register-cargo-modal-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Cargo Consignment</span>
          </button>
        </div>
      </div>

      {/* Cargo KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Total Cargo Weight</span>
            <span className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2 text-[#465FFF] dark:text-blue-400">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {totalCargoTonnageMT.toFixed(1)} MT
          </div>
          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Across {cargoList.length} consignments
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Container Units (TEU)</span>
            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{totalTeuCount} TEU</div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Stowed in vessel cell guides</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Dangerous Goods (IMDG)</span>
            <span className="rounded-lg bg-rose-50 dark:bg-rose-900/30 p-2 text-rose-600 dark:text-rose-400">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{hazmatCargoCount} Units</div>
          <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            IMDG Segregated &amp; Declared
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Customs Clearance</span>
            <span className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-2 text-purple-600 dark:text-purple-400">
              <FileCheck className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{customsClearedPercent}%</div>
          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            {customsClearedCount} Cleared of {cargoList.length} total
          </div>
        </div>
      </div>

      {/* Cargo Filters Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="search-cargo-input"
            type="text"
            value={cargoSearch}
            onChange={(e) => setCargoSearch(e.target.value)}
            placeholder="Search B/L number, container ID, cargo description, shipper, consignee, or UN code..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] py-2 pl-9 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span>Filter:</span>
          </div>

          <select
            id="filter-cargo-voyage-select"
            value={cargoVoyageFilter}
            onChange={(e) => setCargoVoyageFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Voyages ({cargoList.length})</option>
            {Array.from(new Set(cargoList.map((c) => c.voyageNumber))).map((voyageNo) => (
              <option key={voyageNo} value={voyageNo}>
                {voyageNo} - {cargoList.find((c) => c.voyageNumber === voyageNo)?.vesselName}
              </option>
            ))}
          </select>

          <select
            id="filter-cargo-category-select"
            value={cargoCategoryFilter}
            onChange={(e) => setCargoCategoryFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="Containerized (FCL/LCL)">Containerized</option>
            <option value="Dry Bulk">Dry Bulk</option>
            <option value="Liquid Bulk">Liquid Bulk</option>
            <option value="Breakbulk Heavy Lift">Breakbulk Heavy Lift</option>
            <option value="RoRo Vehicles & Rolling Stock">RoRo Vehicles</option>
            <option value="Refrigerated Reefer">Reefer (Cold Chain)</option>
          </select>

          <select
            id="filter-cargo-customs-select"
            value={cargoCustomsFilter}
            onChange={(e) => setCargoCustomsFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Customs</option>
            <option value="Cleared & Released">Cleared & Released</option>
            <option value="Under Customs Inspection">Under Inspection</option>
            <option value="In Bond / Transit">In Bond / Transit</option>
            <option value="Customs Hold / Quarantine">Customs Hold</option>
          </select>

          <select
            id="filter-cargo-hazmat-select"
            value={cargoHazmatFilter}
            onChange={(e) => setCargoHazmatFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Hazmat Types</option>
            <option value="HAZMAT">Dangerous Goods (IMDG)</option>
            <option value="NON_HAZMAT">Non-Hazardous</option>
          </select>
        </div>
      </div>

      {/* Cargo Data Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/60 text-gray-500 dark:text-[#8A99AD] font-semibold">
                <th className="py-3.5 pl-4 pr-3">Bill of Lading / Unit</th>
                <th className="px-3 py-3.5">Cargo Description &amp; Hazmat</th>
                <th className="px-3 py-3.5">Voyage &amp; Vessel</th>
                <th className="px-3 py-3.5">Weight (MT) &amp; TEU</th>
                <th className="px-3 py-3.5">Shipper &amp; Consignee</th>
                <th className="px-3 py-3.5">Stowage Location</th>
                <th className="px-3 py-3.5">Customs Status</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredCargo.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Package className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="font-semibold">No cargo consignments found matching filter criteria</p>
                  </td>
                </tr>
              ) : (
                filteredCargo.map((cargo) => (
                  <tr
                    key={cargo.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors"
                  >
                    {/* B/L & Container ID */}
                    <td className="py-3.5 pl-4 pr-3 font-mono font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#465FFF] dark:text-[#80CAEE]">
                            {cargo.billOfLadingNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(cargo.billOfLadingNumber, `bl-${cargo.id}`)}
                            title="Copy B/L Number"
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            {copiedId === `bl-${cargo.id}` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                          {cargo.containerOrConsignmentId}
                        </span>
                      </div>
                    </td>

                    {/* Description & Hazmat */}
                    <td className="px-3 py-3.5 max-w-[240px]">
                      <div className="font-semibold text-gray-900 dark:text-white truncate" title={cargo.cargoDescription}>
                        {cargo.cargoDescription}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="rounded bg-gray-100 dark:bg-[#2E3A47] px-1.5 py-0.2 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                          {cargo.cargoCategory}
                        </span>
                        {cargo.driverPassengerName && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-purple-100 dark:bg-purple-950/40 px-1.5 py-0.2 text-[9px] font-bold text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
                            <Car className="h-2.5 w-2.5" />
                            Driver: {cargo.driverPassengerName}
                          </span>
                        )}
                        {cargo.hazardClass !== 'Non-Hazardous' && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-rose-100 px-1.5 py-0.2 text-[9px] font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                            <Flame className="h-2.5 w-2.5" />
                            {cargo.hazardClass.split(' ')[1] || 'HAZ'}
                          </span>
                        )}
                        {cargo.temperatureSetpointC !== undefined && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            <ThermometerSnowflake className="h-2.5 w-2.5" />
                            {cargo.temperatureSetpointC}°C
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Voyage & Vessel */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                        <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
                        <span>{cargo.vesselName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="font-mono font-semibold text-[#465FFF] dark:text-[#80CAEE]">
                          {cargo.voyageNumber}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{cargo.loadingPort.split(' (')[0]} → {cargo.dischargePort.split(' (')[0]}</span>
                      </div>
                    </td>

                    {/* Weight & TEU */}
                    <td className="px-3 py-3.5 font-mono text-gray-800 dark:text-gray-200">
                      <div className="font-bold">{cargo.grossWeightMT.toFixed(1)} MT Gross</div>
                      <div className="text-[11px] text-gray-400">
                        {cargo.teuUnits > 0 ? `${cargo.teuUnits} TEU (${cargo.packageType})` : cargo.packageType}
                      </div>
                    </td>

                    {/* Shipper & Consignee */}
                    <td className="px-3 py-3.5 text-[11px]">
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]" title={cargo.shipperName}>
                        <span className="text-gray-400">From:</span> {cargo.shipperName}
                      </div>
                      <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[150px]" title={cargo.consigneeName}>
                        <span className="text-gray-400">To:</span> {cargo.consigneeName}
                      </div>
                    </td>

                    {/* Stowage Location */}
                    <td className="px-3 py-3.5 font-mono text-[11px] text-gray-600 dark:text-gray-300">
                      {cargo.stowagePosition || 'Hold #1'}
                    </td>

                    {/* Customs Status */}
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          cargo.customsStatus === 'Cleared & Released'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : cargo.customsStatus === 'Under Customs Inspection'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : cargo.customsStatus === 'In Bond / Transit'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {cargo.customsStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-cargo-${cargo.id}`}
                          onClick={() => setViewingCargo(cargo)}
                          title="Inspect Bill of Lading & Waybill"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`edit-cargo-${cargo.id}`}
                          onClick={() => setEditingCargo(cargo)}
                          title="Edit Consignment"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#465FFF] dark:hover:bg-[#24303F] dark:hover:text-[#80CAEE] transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`delete-cargo-${cargo.id}`}
                          onClick={() => {
                            if (confirm(`Remove consignment ${cargo.billOfLadingNumber} from manifest?`)) {
                              onDeleteCargo(cargo.id);
                            }
                          }}
                          title="Delete Consignment"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Bill of Lading Modal */}
      {viewingCargo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Bill of Lading Inspection (IMO FAL 2)
                  </h3>
                  <p className="text-xs font-mono text-gray-500 dark:text-[#8A99AD]">
                    {viewingCargo.billOfLadingNumber} • {viewingCargo.containerOrConsignmentId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingCargo(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Description</span>
                  <span className="font-bold text-gray-900 dark:text-white text-right max-w-[260px]">
                    {viewingCargo.cargoDescription}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Category &amp; Packaging</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingCargo.cargoCategory} ({viewingCargo.packageType})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Hazmat Classification</span>
                  <span
                    className={`font-semibold ${
                      viewingCargo.hazardClass !== 'Non-Hazardous'
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {viewingCargo.hazardClass} {viewingCargo.unNumber ? `(${viewingCargo.unNumber})` : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Gross / Net Weight</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    {viewingCargo.grossWeightMT} MT Gross / {viewingCargo.netWeightMT} MT Net
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Shipper (Origin)</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[260px]">
                    {viewingCargo.shipperName} ({viewingCargo.loadingPort})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Consignee (Destination)</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[260px]">
                    {viewingCargo.consigneeName} ({viewingCargo.dischargePort})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Stowage Location</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {viewingCargo.stowagePosition}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Customs Declaration</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {viewingCargo.customsStatus} ({viewingCargo.customsDeclarationRef})
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingCargo(null)}
                className="rounded-xl bg-gray-100 dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Consignment Modal */}
      {editingCargo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Edit Cargo Consignment ({editingCargo.billOfLadingNumber})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Update Bill of Lading, stowage location, or customs clearance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingCargo(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditCargoSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Bill of Lading *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCargo.billOfLadingNumber}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, billOfLadingNumber: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Container / Consignment Unit ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCargo.containerOrConsignmentId}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, containerOrConsignmentId: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cargo Description *
                </label>
                <input
                  type="text"
                  required
                  value={editingCargo.cargoDescription}
                  onChange={(e) =>
                    setEditingCargo({ ...editingCargo, cargoDescription: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Gross Weight (MT)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={editingCargo.grossWeightMT}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, grossWeightMT: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    TEU Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingCargo.teuUnits}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, teuUnits: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Stowage Location
                  </label>
                  <input
                    type="text"
                    value={editingCargo.stowagePosition}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, stowagePosition: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Shipper
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCargo.shipperName}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, shipperName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Consignee
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCargo.consigneeName}
                    onChange={(e) =>
                      setEditingCargo({ ...editingCargo, consigneeName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Customs Status
                  </label>
                  <select
                    value={editingCargo.customsStatus}
                    onChange={(e) =>
                      setEditingCargo({
                        ...editingCargo,
                        customsStatus: e.target.value as CargoManifestRecord['customsStatus'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Cleared & Released">Cleared & Released</option>
                    <option value="Under Customs Inspection">Under Customs Inspection</option>
                    <option value="In Bond / Transit">In Bond / Transit</option>
                    <option value="Customs Hold / Quarantine">Customs Hold / Quarantine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Customs Declaration Ref
                  </label>
                  <input
                    type="text"
                    value={editingCargo.customsDeclarationRef}
                    onChange={(e) =>
                      setEditingCargo({
                        ...editingCargo,
                        customsDeclarationRef: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCargo(null)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Register Cargo Consignment Modal (IMO FAL Form 2) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-xs">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Register Cargo Consignment (IMO FAL Form 2)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Complete freight declaration, hazardous material classification (IMDG), and customs status.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFillSampleCargo}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-[#465FFF] dark:text-[#80CAEE] hover:bg-blue-100/60 transition-colors shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#465FFF] dark:text-[#80CAEE]" />
                  <span>Fill Sample Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCargoFormData(defaultCargoForm)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2E3A47] transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCargoSubmit} className="space-y-4">
              {/* Section 1: Voyage & Identification */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  1. Voyage &amp; Bill of Lading Identification
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Assigned Voyage &amp; Vessel *
                    </label>
                    <select
                      value={cargoFormData.voyageNumber}
                      onChange={(e) => handleCargoVoyageChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {actualVoyages.map((v) => (
                        <option key={v.voyageNumber} value={v.voyageNumber}>
                          {v.voyageNumber} — {v.vesselName} ({v.departurePort?.split(' (')[0]} → {v.arrivalPort?.split(' (')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Bill of Lading (B/L) Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BL-SGSIN-90812"
                      value={cargoFormData.billOfLadingNumber}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, billOfLadingNumber: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Container / Consignment Unit ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MSKU-882104-9 or BULK-BAY-02"
                      value={cargoFormData.containerOrConsignmentId}
                      onChange={(e) =>
                        setCargoFormData({ ...cargoFormData, containerOrConsignmentId: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Consignment Details */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  2. Cargo Specification &amp; Packaging
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cargo Description &amp; Goods Specification *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Precision Industrial Robotics & Controller Units"
                      value={cargoFormData.cargoDescription}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, cargoDescription: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cargo Category
                    </label>
                    <select
                      value={cargoFormData.cargoCategory}
                      onChange={(e) =>
                        setCargoFormData({
                          ...cargoFormData,
                          cargoCategory: e.target.value as CargoManifestRecord['cargoCategory'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Containerized (FCL/LCL)">Containerized (FCL/LCL)</option>
                      <option value="Dry Bulk">Dry Bulk</option>
                      <option value="Liquid Bulk">Liquid Bulk</option>
                      <option value="Breakbulk Heavy Lift">Breakbulk Heavy Lift</option>
                      <option value="RoRo Vehicles & Rolling Stock">RoRo Vehicles &amp; Stock</option>
                      <option value="Refrigerated Reefer">Refrigerated Reefer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Package Type
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 40ft High Cube Container"
                      value={cargoFormData.packageType}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, packageType: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Hazmat, Weight & Stowage */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  3. Dangerous Goods (IMDG), Weight &amp; Stowage
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Dangerous Goods (IMDG)
                    </label>
                    <select
                      value={cargoFormData.hazardClass}
                      onChange={(e) =>
                        setCargoFormData({
                          ...cargoFormData,
                          hazardClass: e.target.value as CargoManifestRecord['hazardClass'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Non-Hazardous">Non-Hazardous (Standard)</option>
                      <option value="IMDG Class 3 (Flammable Liquid)">IMDG Class 3 (Flammable Liquid)</option>
                      <option value="IMDG Class 8 (Corrosive)">IMDG Class 8 (Corrosive)</option>
                      <option value="IMDG Class 9 (Miscellaneous)">IMDG Class 9 (Misc / Batteries)</option>
                      <option value="IMDG Class 2 (Gases)">IMDG Class 2 (Gases)</option>
                      <option value="IMDG Class 6 (Toxics)">IMDG Class 6 (Toxics)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      UN Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UN 3481 or UN 1202"
                      value={cargoFormData.unNumber || ''}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, unNumber: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gross / Net Weight (MT) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        placeholder="Gross"
                        value={cargoFormData.grossWeightMT}
                        onChange={(e) =>
                          setCargoFormData({ ...cargoFormData, grossWeightMT: Number(e.target.value) })
                        }
                        className="w-1/2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                      />
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Net"
                        value={cargoFormData.netWeightMT}
                        onChange={(e) =>
                          setCargoFormData({ ...cargoFormData, netWeightMT: Number(e.target.value) })
                        }
                        className="w-1/2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      TEU &amp; Stowage Position
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="TEU"
                        value={cargoFormData.teuUnits}
                        onChange={(e) => setCargoFormData({ ...cargoFormData, teuUnits: Number(e.target.value) })}
                        className="w-16 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-2.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                      <input
                        type="text"
                        placeholder="e.g. Bay 08, Row 04"
                        value={cargoFormData.stowagePosition}
                        onChange={(e) => setCargoFormData({ ...cargoFormData, stowagePosition: e.target.value })}
                        className="flex-1 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Supply Chain & Customs */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  4. Supply Chain Parties &amp; Customs Release
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Shipper / Consignor Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nordic Automation Technologies AB"
                      value={cargoFormData.shipperName}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, shipperName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Consignee / Destination Receiver *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Helsinki Advanced Dynamics Oy"
                      value={cargoFormData.consigneeName}
                      onChange={(e) => setCargoFormData({ ...cargoFormData, consigneeName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Customs Status
                    </label>
                    <select
                      value={cargoFormData.customsStatus}
                      onChange={(e) =>
                        setCargoFormData({
                          ...cargoFormData,
                          customsStatus: e.target.value as CargoManifestRecord['customsStatus'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Cleared & Released">Cleared & Released</option>
                      <option value="Under Customs Inspection">Under Customs Inspection</option>
                      <option value="In Bond / Transit">In Bond / Transit</option>
                      <option value="Customs Hold / Quarantine">Customs Hold / Quarantine</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Customs Declaration Ref
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CUS-DECL-908123"
                      value={cargoFormData.customsDeclarationRef}
                      onChange={(e) =>
                        setCargoFormData({ ...cargoFormData, customsDeclarationRef: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
                >
                  Save Consignment to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
