import React, { useState, useMemo } from 'react';
import {
  Waves,
  Anchor,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Building2,
  Globe,
  Compass,
  Ship,
  CheckCircle2,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
  Eye,
  Info,
  ShieldAlert,
  Leaf,
  Navigation,
  ExternalLink,
  MapPin,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { WaterBody, PortRecord, Vessel } from '../types';

interface WaterBodyPortsManagerProps {
  waterBodies: WaterBody[];
  ports: PortRecord[];
  vessels?: Vessel[];
  onAddWaterBody: (waterBody: WaterBody) => void;
  onUpdateWaterBody: (waterBody: WaterBody) => void;
  onDeleteWaterBody: (id: string) => void;
  onAddPort: (port: PortRecord) => void;
  onUpdatePort: (port: PortRecord) => void;
  onDeletePort: (id: string) => void;
  onNavigateToFleet?: () => void;
}

export const WaterBodyPortsManager: React.FC<WaterBodyPortsManagerProps> = ({
  waterBodies,
  ports,
  vessels = [],
  onAddWaterBody,
  onUpdateWaterBody,
  onDeleteWaterBody,
  onAddPort,
  onUpdatePort,
  onDeletePort,
  onNavigateToFleet,
}) => {
  // Active Tab: 'water-body' | 'ports'
  const [activeTab, setActiveTab] = useState<'water-body' | 'ports'>('water-body');

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState('All');
  const [selectedWaterBodyFilter, setSelectedWaterBodyFilter] = useState('All');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');

  // Modals state
  const [isAddWaterBodyOpen, setIsAddWaterBodyOpen] = useState(false);
  const [isAddPortOpen, setIsAddPortOpen] = useState(false);
  const [editingWaterBody, setEditingWaterBody] = useState<WaterBody | null>(null);
  const [editingPort, setEditingPort] = useState<PortRecord | null>(null);
  const [viewingItem, setViewingItem] = useState<{ type: 'water-body' | 'port'; item: WaterBody | PortRecord } | null>(null);

  // Form State: Water Body
  const [waterBodyForm, setWaterBodyForm] = useState<Partial<WaterBody>>({
    code: '',
    name: '',
    category: 'Marginal Sea',
    country: '',
    region: 'North-West Europe',
    environmentalStatus: 'IMO SECA (0.1% Sulfur)',
    securityLevel: 'Normal Navigation (Level 1)',
    maxDraftMeters: 22.0,
    weatherProfile: '',
    status: 'Active',
    remarks: '',
  });

  // Form State: Port
  const [portForm, setPortForm] = useState<Partial<PortRecord>>({
    code: '',
    name: '',
    waterBodyId: waterBodies[0]?.id || '',
    waterBodyName: waterBodies[0]?.name || '',
    country: '',
    countryCode: '',
    terminalType: 'Container Transshipment',
    maxDraftMeters: 16.5,
    berthsCount: 24,
    capacity: '',
    pilotageRequirement: 'Compulsory 24/7',
    latitude: '',
    longitude: '',
    status: 'Operational',
    remarks: '',
  });

  // Unique list of regions
  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    waterBodies.forEach((wb) => wb.region && regions.add(wb.region));
    return ['All', ...Array.from(regions)];
  }, [waterBodies]);

  // Unique list of water body categories
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    waterBodies.forEach((wb) => wb.category && cats.add(wb.category));
    return ['All', ...Array.from(cats)];
  }, [waterBodies]);

  // Filtered Water Bodies
  const filteredWaterBodies = useMemo(() => {
    return waterBodies.filter((wb) => {
      const matchSearch =
        wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wb.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wb.country && wb.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        wb.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wb.remarks && wb.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRegion = selectedRegionFilter === 'All' || wb.region === selectedRegionFilter;
      const matchCategory = selectedCategoryFilter === 'All' || wb.category === selectedCategoryFilter;

      return matchSearch && matchRegion && matchCategory;
    });
  }, [waterBodies, searchQuery, selectedRegionFilter, selectedCategoryFilter]);

  // Filtered Ports
  const filteredPorts = useMemo(() => {
    return ports.filter((port) => {
      const matchSearch =
        port.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        port.waterBodyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (port.terminalType && port.terminalType.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchWaterBody =
        selectedWaterBodyFilter === 'All' ||
        port.waterBodyId === selectedWaterBodyFilter ||
        port.waterBodyName === selectedWaterBodyFilter;

      return matchSearch && matchWaterBody;
    });
  }, [ports, searchQuery, selectedWaterBodyFilter]);

  // Helper to count ports linked to a water body
  const getPortCountForWaterBody = (wbId: string, wbName: string) => {
    return ports.filter((p) => p.waterBodyId === wbId || p.waterBodyName === wbName).length;
  };

  // Helper to count active vessels operating in a water body
  const getVesselCountForWaterBody = (wbName: string) => {
    return vessels.filter((v) => v.waterBody && v.waterBody.toLowerCase().includes(wbName.toLowerCase())).length;
  };

  // Open Add Water Body Modal
  const handleOpenAddWaterBody = () => {
    const nextNum = (waterBodies.length + 1).toString().padStart(3, '0');
    setWaterBodyForm({
      code: `WB-${nextNum}`,
      name: '',
      category: 'Sea',
      country: '',
      region: 'North-West Europe',
      environmentalStatus: 'IMO SECA (0.1% Sulfur)',
      securityLevel: 'Normal Navigation (Level 1)',
      maxDraftMeters: 20.0,
      weatherProfile: 'Moderate seas, seasonal winter swell',
      status: 'Active',
      remarks: '',
    });
    setEditingWaterBody(null);
    setIsAddWaterBodyOpen(true);
  };

  // Open Edit Water Body
  const handleOpenEditWaterBody = (wb: WaterBody) => {
    setEditingWaterBody(wb);
    setWaterBodyForm({ ...wb });
    setIsAddWaterBodyOpen(true);
  };

  // Submit Water Body Form
  const handleSubmitWaterBody = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waterBodyForm.name || !waterBodyForm.code) return;

    if (editingWaterBody) {
      const updated: WaterBody = {
        ...editingWaterBody,
        ...(waterBodyForm as WaterBody),
      };
      onUpdateWaterBody(updated);
    } else {
      const newWb: WaterBody = {
        id: `WB-${Date.now()}`,
        code: waterBodyForm.code || `WB-${Math.floor(Math.random() * 900 + 100)}`,
        name: waterBodyForm.name || 'Unnamed Water Body',
        category: (waterBodyForm.category as WaterBody['category']) || 'Sea',
        country: waterBodyForm.country || '',
        region: waterBodyForm.region || 'Global High Seas',
        environmentalStatus:
          (waterBodyForm.environmentalStatus as WaterBody['environmentalStatus']) || 'Standard MARPOL',
        securityLevel:
          (waterBodyForm.securityLevel as WaterBody['securityLevel']) || 'Normal Navigation (Level 1)',
        maxDraftMeters: Number(waterBodyForm.maxDraftMeters) || 20.0,
        weatherProfile: waterBodyForm.weatherProfile || 'Standard maritime weather patterns',
        status: (waterBodyForm.status as WaterBody['status']) || 'Active',
        remarks: waterBodyForm.remarks || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddWaterBody(newWb);
    }

    setIsAddWaterBodyOpen(false);
    setEditingWaterBody(null);
  };

  // Open Add Port Modal
  const handleOpenAddPort = () => {
    const defaultWb = waterBodies[0];
    setPortForm({
      code: '',
      name: '',
      waterBodyId: defaultWb ? defaultWb.id : '',
      waterBodyName: defaultWb ? defaultWb.name : '',
      country: '',
      countryCode: '',
      terminalType: 'Container Transshipment',
      maxDraftMeters: 16.0,
      berthsCount: 20,
      capacity: '10.0M TEU / year',
      pilotageRequirement: 'Compulsory 24/7',
      latitude: '',
      longitude: '',
      status: 'Operational',
      remarks: '',
    });
    setEditingPort(null);
    setIsAddPortOpen(true);
  };

  // Open Edit Port
  const handleOpenEditPort = (port: PortRecord) => {
    setEditingPort(port);
    setPortForm({ ...port });
    setIsAddPortOpen(true);
  };

  // Submit Port Form
  const handleSubmitPort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portForm.name || !portForm.code) return;

    // Find selected water body name from ID
    const selectedWb = waterBodies.find((wb) => wb.id === portForm.waterBodyId);
    const resolvedWbName = selectedWb ? selectedWb.name : portForm.waterBodyName || 'Global Waters';

    if (editingPort) {
      const updated: PortRecord = {
        ...editingPort,
        ...(portForm as PortRecord),
        waterBodyId: portForm.waterBodyId || editingPort.waterBodyId,
        waterBodyName: resolvedWbName,
      };
      onUpdatePort(updated);
    } else {
      const newPort: PortRecord = {
        id: `PORT-${Date.now()}`,
        code: portForm.code ? portForm.code.toUpperCase() : `PRT${Math.floor(Math.random() * 900 + 100)}`,
        name: portForm.name || 'Unnamed Port',
        waterBodyId: portForm.waterBodyId || (waterBodies[0]?.id ?? 'WB-001'),
        waterBodyName: resolvedWbName,
        country: portForm.country || 'International Waters',
        countryCode: (portForm.countryCode || 'INT').toUpperCase(),
        terminalType: (portForm.terminalType as PortRecord['terminalType']) || 'Multi-Purpose Mega Hub',
        maxDraftMeters: Number(portForm.maxDraftMeters) || 16.0,
        berthsCount: Number(portForm.berthsCount) || 12,
        capacity: portForm.capacity || 'Multi-berth Terminal',
        pilotageRequirement:
          (portForm.pilotageRequirement as PortRecord['pilotageRequirement']) || 'Compulsory 24/7',
        latitude: portForm.latitude || '',
        longitude: portForm.longitude || '',
        status: (portForm.status as PortRecord['status']) || 'Operational',
        remarks: portForm.remarks || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddPort(newPort);
    }

    setIsAddPortOpen(false);
    setEditingPort(null);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Water Body & Ports Management
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Manage oceanic waterways, navigation straits, EEZ passages, and international maritime seaports
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-add-water-body-top"
            onClick={handleOpenAddWaterBody}
            className="inline-flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5] transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Add Water Body</span>
          </button>
          <button
            id="btn-add-port-top"
            onClick={handleOpenAddPort}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors shadow-2xs"
          >
            <Anchor className="h-4 w-4 text-[#465FFF]" />
            <span>Add Port</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar (Arranged similar to Vessels Register page) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-gray-400 dark:text-[#8A99AD] uppercase tracking-wider">
            Total Water Bodies
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {waterBodies.length} <span className="text-xs font-normal text-gray-400">Zones</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Anchor className="h-3 w-3" /> Registered Seaports
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {ports.length} <span className="text-xs font-normal text-gray-400">Terminals</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Leaf className="h-3 w-3" /> IMO SECA / ECA
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {waterBodies.filter((wb) => wb.environmentalStatus.includes('SECA') || wb.environmentalStatus.includes('NECA')).length} <span className="text-xs font-normal text-gray-400">Zones</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Ship className="h-3 w-3" /> Active Fleet Coverage
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {vessels.length} <span className="text-xs font-normal text-gray-400">Vessels</span>
          </div>
        </div>
      </div>

      {/* Main Records Container */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
        {/* Navigation Tabs Bar & Filters */}
        <div className="p-4 border-b border-gray-100 dark:border-[#2E3A47] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* 2 Primary Tabs: Water Body vs Ports */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-[#24303F] rounded-xl self-start">
              <button
                id="tab-water-body"
                onClick={() => {
                  setActiveTab('water-body');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'water-body'
                    ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] shadow-xs'
                    : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Waves className="h-4 w-4" />
                <span>Water Body</span>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                    activeTab === 'water-body'
                      ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20'
                      : 'bg-gray-200 dark:bg-[#2E3A47] text-gray-600 dark:text-[#8A99AD]'
                  }`}
                >
                  {waterBodies.length}
                </span>
              </button>

              <button
                id="tab-ports"
                onClick={() => {
                  setActiveTab('ports');
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'ports'
                    ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] shadow-xs'
                    : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Anchor className="h-4 w-4" />
                <span>Ports</span>
                <span
                  className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                    activeTab === 'ports'
                      ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20'
                      : 'bg-gray-200 dark:bg-[#2E3A47] text-gray-600 dark:text-[#8A99AD]'
                  }`}
                >
                  {ports.length}
                </span>
              </button>
            </div>

            {/* Right Side Action for active tab */}
            {activeTab === 'water-body' ? (
              <button
                id="btn-add-water-body-table"
                onClick={handleOpenAddWaterBody}
                className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3b51e6] transition-colors shadow-2xs self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Water Body</span>
              </button>
            ) : (
              <button
                id="btn-add-port-table"
                onClick={handleOpenAddPort}
                className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3b51e6] transition-colors shadow-2xs self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Add Port</span>
              </button>
            )}
          </div>

          {/* Search and Secondary Filter Row */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'water-body'
                    ? 'Search water body by name, code, region, or classification...'
                    : 'Search ports by UN/LOCODE, port name, country, or water body...'
                }
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] pl-10 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters based on Tab */}
            {activeTab === 'water-body' ? (
              <div className="flex items-center gap-2">
                <select
                  value={selectedRegionFilter}
                  onChange={(e) => setSelectedRegionFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="All">All Regions</option>
                  {uniqueRegions.filter((r) => r !== 'All').map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="All">All Categories</option>
                  {uniqueCategories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={selectedWaterBodyFilter}
                  onChange={(e) => setSelectedWaterBodyFilter(e.target.value)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden max-w-[220px]"
                >
                  <option value="All">All Water Bodies</option>
                  {waterBodies.map((wb) => (
                    <option key={wb.id} value={wb.id}>
                      {wb.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: WATER BODY TABLE */}
        {activeTab === 'water-body' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-[#8A99AD]">
              <thead className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8A99AF]">
                <tr>
                  <th className="px-4 py-3.5">Code & Water Body</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Region</th>
                  <th className="px-4 py-3.5">ECA / Environmental</th>
                  <th className="px-4 py-3.5">Security Level</th>
                  <th className="px-4 py-3.5">Max Draft</th>
                  <th className="px-4 py-3.5">Linked Ports</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
                {filteredWaterBodies.length > 0 ? (
                  filteredWaterBodies.map((wb) => {
                    const linkedPortsCount = getPortCountForWaterBody(wb.id, wb.name);
                    const activeVesselsCount = getVesselCountForWaterBody(wb.name);

                    return (
                      <tr
                        key={wb.id}
                        className="hover:bg-gray-50/75 dark:hover:bg-[#24303F]/40 transition-colors group"
                      >
                        {/* Code & Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
                              <Waves className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                <span>{wb.name}</span>
                                {activeVesselsCount > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.2 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                    <Ship className="h-2.5 w-2.5" />
                                    {activeVesselsCount}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-gray-400 dark:text-[#8A99AF]">
                                {wb.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-[#2E3A47] px-2 py-0.5 text-[11px] font-medium text-slate-800 dark:text-slate-200">
                            {wb.category}
                          </span>
                        </td>

                        {/* Region & Country */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                            <Globe className="h-3.5 w-3.5 text-gray-400" />
                            <span>{wb.region}</span>
                          </div>
                          {wb.country && (
                            <div className="text-[10px] text-gray-400 dark:text-[#8A99AF] pl-5 max-w-[180px] truncate" title={wb.country}>
                              {wb.country}
                            </div>
                          )}
                        </td>

                        {/* ECA Status */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {wb.environmentalStatus.includes('SECA') || wb.environmentalStatus.includes('NECA') ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                                <Leaf className="h-3 w-3" />
                                {wb.environmentalStatus}
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-600 dark:text-gray-400">
                                {wb.environmentalStatus}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Security Level */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {wb.securityLevel.includes('High Risk') ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                              <ShieldAlert className="h-3 w-3" />
                              {wb.securityLevel}
                            </span>
                          ) : wb.securityLevel.includes('Heightened') ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              <AlertTriangle className="h-3 w-3" />
                              {wb.securityLevel}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 dark:bg-[#2E3A47] px-2 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                              {wb.securityLevel}
                            </span>
                          )}
                        </td>

                        {/* Max Draft */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-medium text-gray-900 dark:text-white">
                          {wb.maxDraftMeters ? `${wb.maxDraftMeters.toFixed(1)} m` : 'Unrestricted'}
                        </td>

                        {/* Linked Ports */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedWaterBodyFilter(wb.id);
                              setActiveTab('ports');
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 dark:bg-[#24303F] hover:bg-[#465FFF]/10 hover:text-[#465FFF] px-2 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                            title="Filter ports for this water body"
                          >
                            <Anchor className="h-3.5 w-3.5 text-[#465FFF]" />
                            <span>{linkedPortsCount} Ports</span>
                            <ChevronRight className="h-3 w-3 opacity-60" />
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              wb.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : wb.status === 'Restricted'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {wb.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingItem({ type: 'water-body', item: wb })}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2E3A47] dark:hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditWaterBody(wb)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#465FFF] dark:hover:bg-[#2E3A47] dark:hover:text-blue-400 transition-colors"
                              title="Edit Water Body"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${wb.name}?`)) {
                                  onDeleteWaterBody(wb.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                              title="Delete Water Body"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Waves className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          No Water Body Records Found
                        </p>
                        <p className="text-xs text-gray-400 max-w-sm mt-1">
                          No water bodies match your current search or filter criteria. Add a new ocean, sea, or strait.
                        </p>
                        <button
                          onClick={handleOpenAddWaterBody}
                          className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add First Water Body</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PORTS TABLE */}
        {activeTab === 'ports' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-[#8A99AD]">
              <thead className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-[#8A99AF]">
                <tr>
                  <th className="px-4 py-3.5">UN/LOCODE & Port Name</th>
                  <th className="px-4 py-3.5">Water Body / Sea</th>
                  <th className="px-4 py-3.5">Country & Location</th>
                  <th className="px-4 py-3.5">Terminal Type</th>
                  <th className="px-4 py-3.5">Max Draft</th>
                  <th className="px-4 py-3.5">Berths & Capacity</th>
                  <th className="px-4 py-3.5">Pilotage</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
                {filteredPorts.length > 0 ? (
                  filteredPorts.map((port) => {
                    return (
                      <tr
                        key={port.id}
                        className="hover:bg-gray-50/75 dark:hover:bg-[#24303F]/40 transition-colors group"
                      >
                        {/* UN/LOCODE & Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                              <Anchor className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {port.name}
                              </div>
                              <span className="inline-flex items-center gap-1 rounded bg-gray-100 dark:bg-[#2E3A47] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#465FFF] dark:text-blue-400">
                                {port.code}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Water Body (Linked directly) */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <Waves className="h-3.5 w-3.5 text-[#465FFF] shrink-0" />
                            <span className="font-semibold text-gray-800 dark:text-gray-200">
                              {port.waterBodyName}
                            </span>
                          </div>
                        </td>

                        {/* Country & Location */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              {port.country} ({port.countryCode})
                            </span>
                          </div>
                          {port.latitude && (
                            <div className="text-[10px] font-mono text-gray-400">
                              {port.latitude}, {port.longitude}
                            </div>
                          )}
                        </td>

                        {/* Terminal Type */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300">
                            {port.terminalType}
                          </span>
                        </td>

                        {/* Max Draft */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono font-bold text-gray-900 dark:text-white">
                          {port.maxDraftMeters ? `${port.maxDraftMeters.toFixed(1)} m` : 'N/A'}
                        </td>

                        {/* Berths & Capacity */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {port.berthsCount ? `${port.berthsCount} Berths` : 'Multi-Berth'}
                          </div>
                          {port.capacity && (
                            <div className="text-[10px] text-gray-400 truncate max-w-[140px]" title={port.capacity}>
                              {port.capacity}
                            </div>
                          )}
                        </td>

                        {/* Pilotage */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-[11px]">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {port.pilotageRequirement}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              port.status === 'Operational'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : port.status === 'Congested'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {port.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewingItem({ type: 'port', item: port })}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2E3A47] dark:hover:text-white transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditPort(port)}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#465FFF] dark:hover:bg-[#2E3A47] dark:hover:text-blue-400 transition-colors"
                              title="Edit Port"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to remove ${port.name} (${port.code})?`)) {
                                  onDeletePort(port.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                              title="Delete Port"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Anchor className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          No Port Records Found
                        </p>
                        <p className="text-xs text-gray-400 max-w-sm mt-1">
                          No ports match your current search or water body filter. Register a new seaport or terminal.
                        </p>
                        <button
                          onClick={handleOpenAddPort}
                          className="mt-4 flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add First Port</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD / EDIT WATER BODY */}
      {/* ========================================================================= */}
      {isAddWaterBodyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            id="modal-add-water-body"
            className="w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
                  <Waves className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {editingWaterBody ? 'Edit Water Body Record' : 'Register New Water Body'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Define ocean zone, sea, strait, or canal navigation parameters
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddWaterBodyOpen(false);
                  setEditingWaterBody(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2E3A47] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitWaterBody} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name (Whole width) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Water Body Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Sea, Strait of Malacca, Persian Gulf"
                    value={waterBodyForm.name || ''}
                    onChange={(e) => setWaterBodyForm({ ...waterBodyForm, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Code (Row 2, Left) */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Water Body Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WB-NSEA-01, WB-MALACCA"
                    value={waterBodyForm.code || ''}
                    onChange={(e) => setWaterBodyForm({ ...waterBodyForm, code: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Category (Row 2, Right) */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={waterBodyForm.category || 'Sea'}
                    onChange={(e) =>
                      setWaterBodyForm({
                        ...waterBodyForm,
                        category: e.target.value as WaterBody['category'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Ocean">Ocean</option>
                    <option value="Sea">Sea</option>
                    <option value="Marginal Sea">Marginal Sea</option>
                    <option value="Strait">Strait / Passage</option>
                    <option value="Gulf">Gulf / Bay</option>
                    <option value="Canal / Chokepoint">Canal / Chokepoint</option>
                    <option value="Inland Waterway">Inland Waterway</option>
                  </select>
                </div>

                {/* Country (Row 3, Left) */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Singapore, Panama, UK / Norway, International"
                    value={waterBodyForm.country || ''}
                    onChange={(e) => setWaterBodyForm({ ...waterBodyForm, country: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Region (Row 3, Right) */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Region *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North-West Europe, Southeast Asia, Middle East"
                    value={waterBodyForm.region || ''}
                    onChange={(e) => setWaterBodyForm({ ...waterBodyForm, region: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Environmental Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Environmental / IMO Status
                  </label>
                  <select
                    value={waterBodyForm.environmentalStatus || 'Standard MARPOL'}
                    onChange={(e) =>
                      setWaterBodyForm({
                        ...waterBodyForm,
                        environmentalStatus: e.target.value as WaterBody['environmentalStatus'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="IMO SECA (0.1% Sulfur)">IMO SECA (0.1% Sulfur Zone)</option>
                    <option value="IMO NECA (NOx Tier III)">IMO NECA (NOx Tier III Zone)</option>
                    <option value="Standard MARPOL">Standard MARPOL Tier II</option>
                    <option value="Polar Code Area">Polar Code Navigational Area</option>
                    <option value="PSSA Special Area">PSSA Particularly Sensitive Sea Area</option>
                  </select>
                </div>

                {/* Security Level */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Security & Piracy Watch Level
                  </label>
                  <select
                    value={waterBodyForm.securityLevel || 'Normal Navigation (Level 1)'}
                    onChange={(e) =>
                      setWaterBodyForm({
                        ...waterBodyForm,
                        securityLevel: e.target.value as WaterBody['securityLevel'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Normal Navigation (Level 1)">Normal Navigation (Level 1)</option>
                    <option value="Heightened Watch (Level 2)">Heightened Watch (Level 2)</option>
                    <option value="High Risk Area (HRA - BMP5)">High Risk Area (HRA - BMP5)</option>
                    <option value="Restricted Transit">Restricted / Escorted Transit</option>
                  </select>
                </div>

                {/* Max Draft */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Max Navigational Draft (Meters)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 24.0"
                    value={waterBodyForm.maxDraftMeters || ''}
                    onChange={(e) =>
                      setWaterBodyForm({ ...waterBodyForm, maxDraftMeters: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Operational Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={waterBodyForm.status || 'Active'}
                    onChange={(e) =>
                      setWaterBodyForm({
                        ...waterBodyForm,
                        status: e.target.value as WaterBody['status'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Active">Active (Open Navigation)</option>
                    <option value="Restricted">Restricted / Canal Slot Required</option>
                    <option value="Seasonal Warning">Seasonal Warning / Ice Protocol</option>
                  </select>
                </div>

                {/* Weather Profile */}
                <div className="col-span-full">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Weather & Sea State Characteristics
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frequent winter gales, monsoon season Jul-Nov, heavy swell"
                    value={waterBodyForm.weatherProfile || ''}
                    onChange={(e) => setWaterBodyForm({ ...waterBodyForm, weatherProfile: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Remarks */}
                <div className="col-span-full">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Navigational Notes & VTS Reporting Rules
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Mandatory VHF reporting lines, pilot boarding stations, TSS rules..."
                    value={waterBodyForm.remarks || ''}
                    onChange={(e) => setWaterBodyForm({ ...waterBodyForm, remarks: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-3 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddWaterBodyOpen(false);
                    setEditingWaterBody(null);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2E3A47]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3b51e6] shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{editingWaterBody ? 'Save Changes' : 'Register Water Body'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT PORT */}
      {/* ========================================================================= */}
      {isAddPortOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div
            id="modal-add-port"
            className="w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden my-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Anchor className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {editingPort ? 'Edit Port Record' : 'Add Port & Terminal Record'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Register deepwater terminal and link to its operating water body
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsAddPortOpen(false);
                  setEditingPort(null);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2E3A47] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitPort} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Port Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Port Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Port of Rotterdam, Port of Singapore"
                    value={portForm.name || ''}
                    onChange={(e) => setPortForm({ ...portForm, name: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* UN/LOCODE */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Port Code (UN/LOCODE) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. NLRTM, SGSIN, CNSHA"
                    value={portForm.code || ''}
                    onChange={(e) => setPortForm({ ...portForm, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono font-bold uppercase text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* CRITICAL REQUIREMENT: Water Body Dropdown based on water body list */}
                <div className="col-span-full bg-[#465FFF]/5 dark:bg-[#465FFF]/10 p-3.5 rounded-xl border border-[#465FFF]/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-[#465FFF] dark:text-blue-400">
                      <Waves className="h-4 w-4" />
                      <span>Select Water Body / Operating Sea *</span>
                    </label>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      {waterBodies.length} Water bodies available in database
                    </span>
                  </div>

                  <select
                    required
                    value={portForm.waterBodyId || (waterBodies[0]?.id ?? '')}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const matched = waterBodies.find((wb) => wb.id === selectedId);
                      setPortForm({
                        ...portForm,
                        waterBodyId: selectedId,
                        waterBodyName: matched ? matched.name : '',
                      });
                    }}
                    className="w-full rounded-xl border border-gray-300 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden shadow-2xs"
                  >
                    {waterBodies.map((wb) => (
                      <option key={wb.id} value={wb.id}>
                        {wb.name} ({wb.code}) — {wb.category} [{wb.region}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-500 dark:text-[#8A99AD] mt-1">
                    This dynamically links the port to oceanic draft, SECA regulations, and navigation routes.
                  </p>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Country Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netherlands, Singapore, China"
                    value={portForm.country || ''}
                    onChange={(e) => setPortForm({ ...portForm, country: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Country Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Country ISO Code (2-Letter)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="e.g. NL, SG, CN, US"
                    value={portForm.countryCode || ''}
                    onChange={(e) => setPortForm({ ...portForm, countryCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono uppercase font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Terminal Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Terminal / Cargo Facet
                  </label>
                  <select
                    value={portForm.terminalType || 'Container Transshipment'}
                    onChange={(e) =>
                      setPortForm({
                        ...portForm,
                        terminalType: e.target.value as PortRecord['terminalType'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Container Transshipment">Container Transshipment Hub</option>
                    <option value="Crude Oil & Bunkering">Crude Oil & Bunkering Terminal</option>
                    <option value="Dry Bulk & Ore">Dry Bulk & Ore Berth</option>
                    <option value="LNG & Chemical">LNG & Chemical Terminal</option>
                    <option value="General Cargo & RoRo">General Cargo & RoRo</option>
                    <option value="Multi-Purpose Mega Hub">Multi-Purpose Mega Hub</option>
                  </select>
                </div>

                {/* Max Draft */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Harbor Max Draft (Meters) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 18.5"
                    value={portForm.maxDraftMeters || ''}
                    onChange={(e) =>
                      setPortForm({ ...portForm, maxDraftMeters: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Number of Berths */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Number of Commercial Berths
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 36"
                    value={portForm.berthsCount || ''}
                    onChange={(e) =>
                      setPortForm({ ...portForm, berthsCount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Annual Capacity / Volume
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 14.5M TEU / 450M Cargo Tons"
                    value={portForm.capacity || ''}
                    onChange={(e) => setPortForm({ ...portForm, capacity: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Pilotage Requirement */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Pilotage & VTS Policy
                  </label>
                  <select
                    value={portForm.pilotageRequirement || 'Compulsory 24/7'}
                    onChange={(e) =>
                      setPortForm({
                        ...portForm,
                        pilotageRequirement: e.target.value as PortRecord['pilotageRequirement'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Compulsory 24/7">Compulsory 24/7 (All Vessels)</option>
                    <option value="Compulsory for >500GT">Compulsory for Vessels &gt; 500 GT</option>
                    <option value="Advisory Only">Advisory Pilotage Only</option>
                    <option value="VTS Monitored">VTS Monitored Channel</option>
                  </select>
                </div>

                {/* Operational Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Port Operational Status
                  </label>
                  <select
                    value={portForm.status || 'Operational'}
                    onChange={(e) =>
                      setPortForm({
                        ...portForm,
                        status: e.target.value as PortRecord['status'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Operational">Operational (Normal Turnaround)</option>
                    <option value="Congested">Congested (Anchorage Delay &gt; 24h)</option>
                    <option value="Maintenance / Dredging">Maintenance / Berth Dredging</option>
                    <option value="Weather Delay">Weather Delay (Port Closure)</option>
                  </select>
                </div>

                {/* Coordinates */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 51.9244° N"
                    value={portForm.latitude || ''}
                    onChange={(e) => setPortForm({ ...portForm, latitude: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4.4777° E"
                    value={portForm.longitude || ''}
                    onChange={(e) => setPortForm({ ...portForm, longitude: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Remarks */}
                <div className="col-span-full">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Bunkering Capabilities & Terminal Guidelines
                  </label>
                  <textarea
                    rows={3}
                    placeholder="LNG/Methanol bunkering, shore power availability, tugboat requirements..."
                    value={portForm.remarks || ''}
                    onChange={(e) => setPortForm({ ...portForm, remarks: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-3 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddPortOpen(false);
                    setEditingPort(null);
                  }}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2E3A47]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3b51e6] shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{editingPort ? 'Save Changes' : 'Register Port'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: DETAIL INSPECT MODAL */}
      {/* ========================================================================= */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
                  {viewingItem.type === 'water-body' ? <Waves className="h-5 w-5" /> : <Anchor className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {viewingItem.type === 'water-body'
                      ? (viewingItem.item as WaterBody).name
                      : (viewingItem.item as PortRecord).name}
                  </h3>
                  <p className="text-[10px] font-mono text-gray-400">
                    {viewingItem.type === 'water-body'
                      ? (viewingItem.item as WaterBody).code
                      : `UN/LOCODE: ${(viewingItem.item as PortRecord).code}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#2E3A47] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {viewingItem.type === 'water-body' ? (
                (() => {
                  const wb = viewingItem.item as WaterBody;
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#24303F]/50">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Category</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{wb.category}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Country</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{wb.country || 'International'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Region</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{wb.region}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Max Draft</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {wb.maxDraftMeters ? `${wb.maxDraftMeters} m` : 'Deep ocean'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[10px] text-gray-400 block">Status</span>
                          <span className="font-semibold text-emerald-600">{wb.status}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase text-gray-400 block mb-1">
                          Environmental & Security
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                            {wb.environmentalStatus}
                          </span>
                          <span className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                            {wb.securityLevel}
                          </span>
                        </div>
                      </div>

                      {wb.weatherProfile && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-gray-400 block mb-0.5">
                            Weather Profile
                          </span>
                          <p className="text-gray-700 dark:text-gray-300">{wb.weatherProfile}</p>
                        </div>
                      )}

                      {wb.remarks && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-gray-400 block mb-0.5">
                            Navigational Remarks
                          </span>
                          <p className="text-gray-700 dark:text-gray-300">{wb.remarks}</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const port = viewingItem.item as PortRecord;
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#24303F]/50">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Water Body</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{port.waterBodyName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Country</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {port.country} ({port.countryCode})
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Terminal Type</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{port.terminalType}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Max Berth Draft</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{port.maxDraftMeters} m</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Pilotage</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {port.pilotageRequirement}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Capacity</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            {port.capacity || `${port.berthsCount} Berths`}
                          </span>
                        </div>
                      </div>

                      {port.remarks && (
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-gray-400 block mb-0.5">
                            Terminal Guidelines
                          </span>
                          <p className="text-gray-700 dark:text-gray-300">{port.remarks}</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}

              <div className="pt-3 border-t border-gray-100 dark:border-[#2E3A47] flex justify-end">
                <button
                  onClick={() => setViewingItem(null)}
                  className="rounded-xl bg-gray-100 dark:bg-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-800 dark:text-white hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
