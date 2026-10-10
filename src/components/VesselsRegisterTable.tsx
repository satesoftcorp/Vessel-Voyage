import React, { useState } from 'react';
import { Vessel, VesselEngine } from '../types';
import {
  Ship,
  Search,
  Plus,
  Download,
  Navigation,
  Anchor,
  Layers,
  AlertCircle,
  Clock,
  X,
  Eye,
  Wrench,
  Globe,
  FileText,
  Check,
  Tag,
  MapPin,
  Upload,
  Image as ImageIcon,
  Trash2,
  PlusCircle,
  Cpu,
  Flame,
  Gauge,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

const AVAILABLE_VESSEL_TYPES = [
  'Container Ship',
  'Bulk Carrier',
  'Oil Tanker',
  'LNG Carrier',
  'General Cargo',
  'Offshore Supply',
  'Tug Boat',
  'Chemical Tanker',
  'Ro-Ro / Vehicle Carrier',
  'Reefer Vessel',
  'Heavy Lift Carrier',
  'Research / Survey Vessel',
];

const PRESET_OPERATION_PORTS = [
  'Rotterdam Port (NLRTM)',
  'Singapore Port (SGSIN)',
  'Shanghai Port (CNSHA)',
  'Houston Port (USHOU)',
  'Antwerp Port (BEANR)',
  'Dubai / Jebel Ali (AEDXB)',
  'Port Hedland (AUPHE)',
  'Ras Laffan (QARLF)',
  'Busan Port (KRPUS)',
  'Yokohama Port (JPYOK)',
  'Hamburg Port (DEHAM)',
  'Stavanger Base (NOSVG)',
  'Qingdao Port (CNTAO)',
  'Port Klang (MYPKG)',
];

const PRESET_FUEL_TYPES = [
  'VLSFO (Very Low Sulfur Fuel Oil)',
  'MGO (Marine Gas Oil)',
  'LNG Dual-Fuel',
  'Methanol / Bio-Methanol',
  'Ammonia Ready / Dual-Fuel',
  'Hybrid Diesel-Electric / Battery ESS',
  'Heavy Fuel Oil (HFO) with Scrubber',
  'Biofuel (B30 / B100)',
];

const PRESET_VESSEL_IMAGES = [
  {
    label: 'Container Vessel',
    url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Bulk Carrier',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Tanker / VLCC',
    url: 'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'LNG Carrier',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Cargo / Heavy Lift',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Offshore Supply / Tug',
    url: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=800&q=80',
  },
];

interface VesselsRegisterTableProps {
  vessels: Vessel[];
  onAddVessel?: (vessel: Vessel) => void;
  onSelectVessel?: (vessel: Vessel) => void;
  onNavigateToMaintenance?: (vesselName: string) => void;
}

export const VesselsRegisterTable: React.FC<VesselsRegisterTableProps> = ({
  vessels = [],
  onAddVessel,
  onSelectVessel,
  onNavigateToMaintenance,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedVesselForDetail, setSelectedVesselForDetail] = useState<Vessel | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Stepper state for 2-step registration wizard
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1 Form state
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['Container Ship']);
  const [customTypeInput, setCustomTypeInput] = useState('');
  const [selectedPorts, setSelectedPorts] = useState<string[]>([
    'Singapore Port (SGSIN)',
    'Rotterdam Port (NLRTM)',
  ]);
  const [customPortInput, setCustomPortInput] = useState('');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  const [newVessel, setNewVessel] = useState<Partial<Vessel>>({
    name: '',
    imoNumber: '',
    callSign: '',
    mmsi: '',
    flag: 'Panama',
    flagCode: 'PA',
    grossTonnage: '120,000 GT',
    deadweight: '140,000 DWT',
    status: 'Underway',
    speedKnots: 15.0,
    heading: 180,
    currentLocation: 'South China Sea',
    waterBody: 'South China Sea / Pacific Ocean',
    destination: 'Singapore Port (SGSIN)',
    eta: '2026-08-27 12:00',
    crewCount: 22,
    remarks: '',
    // Step 2 specifications
    manufacturer: 'Hyundai Heavy Industries (HHI)',
    yearOfManufacture: 2022,
    placeOfManufacture: 'Ulsan, South Korea',
    topSpeedKnots: 22.0,
    fuelType: 'LNG Dual-Fuel',
    numberOfEngines: 2,
  });

  // Dynamic engines list for Step 2
  const [enginesList, setEnginesList] = useState<VesselEngine[]>([
    {
      engineNumber: 'ME-01-MAN-11G95ME',
      modelOrType: 'MAN B&W 11G95ME-C9.5',
      powerOutput: '68,640 kW @ 80 RPM',
      role: 'Main Engine',
    },
    {
      engineNumber: 'AUX-01-HYUNDAI-H32',
      modelOrType: 'Hyundai-Himsen 9H32/40DF',
      powerOutput: '4,500 kW',
      role: 'Auxiliary Generator',
    },
  ]);

  // Handler for multi-type selection
  const toggleTypeSelection = (type: string) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length === 1) return prev; // keep at least one
        return prev.filter((t) => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleAddCustomType = () => {
    if (customTypeInput.trim() && !selectedTypes.includes(customTypeInput.trim())) {
      setSelectedTypes([...selectedTypes, customTypeInput.trim()]);
      setCustomTypeInput('');
    }
  };

  // Handler for multi-port selection
  const togglePortSelection = (port: string) => {
    setSelectedPorts((prev) => {
      if (prev.includes(port)) {
        return prev.filter((p) => p !== port);
      } else {
        return [...prev, port];
      }
    });
  };

  const handleAddCustomPort = () => {
    if (customPortInput.trim() && !selectedPorts.includes(customPortInput.trim())) {
      setSelectedPorts([...selectedPorts, customPortInput.trim()]);
      setCustomPortInput('');
    }
  };

  // Handler for image upload file input & drag-drop
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreviewUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImagePreviewUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler to sync number of engines
  const handleNumberOfEnginesChange = (num: number) => {
    const validNum = Math.max(1, Math.min(12, num));
    setNewVessel((prev) => ({ ...prev, numberOfEngines: validNum }));

    setEnginesList((prev) => {
      if (prev.length === validNum) return prev;
      if (prev.length < validNum) {
        const added: VesselEngine[] = [];
        for (let i = prev.length + 1; i <= validNum; i++) {
          added.push({
            engineNumber: `ENG-0${i}-PROPULSION-SERIAL`,
            modelOrType: i === 1 ? 'MAN B&W Main Diesel' : 'Auxiliary Marine Generator',
            powerOutput: i === 1 ? '32,000 kW' : '3,200 kW',
            role: i === 1 ? 'Main Engine' : 'Auxiliary Generator',
          });
        }
        return [...prev, ...added];
      } else {
        return prev.slice(0, validNum);
      }
    });
  };

  const handleEngineFieldChange = (
    index: number,
    field: keyof VesselEngine,
    val: string
  ) => {
    setEnginesList((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleAddEngineRow = () => {
    const newIdx = enginesList.length + 1;
    const newEng: VesselEngine = {
      engineNumber: `ENG-0${newIdx}-SERIAL`,
      modelOrType: 'Auxiliary Marine Generator',
      powerOutput: '3,500 kW',
      role: 'Auxiliary Generator',
    };
    setEnginesList([...enginesList, newEng]);
    setNewVessel((prev) => ({ ...prev, numberOfEngines: newIdx }));
  };

  const handleRemoveEngineRow = (index: number) => {
    if (enginesList.length <= 1) return;
    const updated = enginesList.filter((_, i) => i !== index);
    setEnginesList(updated);
    setNewVessel((prev) => ({ ...prev, numberOfEngines: updated.length }));
  };

  // Step navigation validator
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVessel.name || !newVessel.imoNumber) {
      alert('Please provide Vessel Name and IMO Number before proceeding.');
      return;
    }
    setCurrentStep(2);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVessel.name || !newVessel.imoNumber) return;

    const vesselTypes = selectedTypes.length > 0 ? selectedTypes : ['Container Ship'];
    const vesselPorts = selectedPorts.length > 0 ? selectedPorts : ['Singapore Port (SGSIN)'];
    const finalYear = Number(newVessel.yearOfManufacture) || Number(newVessel.yearBuilt) || 2022;

    const vesselToAdd: Vessel = {
      id: `VES-${Date.now().toString().slice(-3)}`,
      name: (newVessel.name || '').toUpperCase(),
      imoNumber: newVessel.imoNumber.startsWith('IMO')
        ? newVessel.imoNumber
        : `IMO ${newVessel.imoNumber}`,
      callSign: newVessel.callSign || 'V7AB9',
      mmsi: newVessel.mmsi || '538009999',
      type: vesselTypes[0] as Vessel['type'],
      types: vesselTypes,
      flag: newVessel.flag || 'Panama',
      flagCode: 'PA',
      yearBuilt: finalYear,
      grossTonnage: newVessel.grossTonnage || '110,000 GT',
      deadweight: newVessel.deadweight || '130,000 DWT',
      status: (newVessel.status as Vessel['status']) || 'Underway',
      speedKnots: Number(newVessel.speedKnots) || 14.5,
      topSpeedKnots: Number(newVessel.topSpeedKnots) || 21.0,
      heading: Number(newVessel.heading) || 180,
      currentLocation: newVessel.currentLocation || 'Open Waters',
      waterBody: newVessel.waterBody || 'Open Sea / International Waters',
      operationPorts: vesselPorts,
      destination: vesselPorts[0] || 'Singapore Port (SGSIN)',
      eta: newVessel.eta || '2026-08-30 18:00',
      crewCount: Number(newVessel.crewCount) || 20,
      imageUrl: imagePreviewUrl || PRESET_VESSEL_IMAGES[0].url,
      remarks: newVessel.remarks || '',

      // Step 2 specs
      manufacturer: newVessel.manufacturer || 'Hyundai Heavy Industries (HHI)',
      yearOfManufacture: finalYear,
      placeOfManufacture: newVessel.placeOfManufacture || 'Ulsan, South Korea',
      fuelType: newVessel.fuelType || 'LNG Dual-Fuel',
      numberOfEngines: enginesList.length,
      engines: enginesList,
    };

    if (onAddVessel) {
      onAddVessel(vesselToAdd);
    }
    setIsAddModalOpen(false);
    setCurrentStep(1);

    // Reset form
    setSelectedTypes(['Container Ship']);
    setSelectedPorts(['Singapore Port (SGSIN)', 'Rotterdam Port (NLRTM)']);
    setImagePreviewUrl('');
    setNewVessel({
      name: '',
      imoNumber: '',
      callSign: '',
      mmsi: '',
      flag: 'Panama',
      flagCode: 'PA',
      grossTonnage: '120,000 GT',
      deadweight: '140,000 DWT',
      status: 'Underway',
      speedKnots: 15.0,
      heading: 180,
      currentLocation: 'South China Sea',
      waterBody: 'South China Sea / Pacific Ocean',
      destination: 'Singapore Port (SGSIN)',
      eta: '2026-08-27 12:00',
      crewCount: 22,
      remarks: '',
      manufacturer: 'Hyundai Heavy Industries (HHI)',
      yearOfManufacture: 2022,
      placeOfManufacture: 'Ulsan, South Korea',
      topSpeedKnots: 22.0,
      fuelType: 'LNG Dual-Fuel',
      numberOfEngines: 2,
    });
    setEnginesList([
      {
        engineNumber: 'ME-01-MAN-11G95ME',
        modelOrType: 'MAN B&W 11G95ME-C9.5',
        powerOutput: '68,640 kW @ 80 RPM',
        role: 'Main Engine',
      },
      {
        engineNumber: 'AUX-01-HYUNDAI-H32',
        modelOrType: 'Hyundai-Himsen 9H32/40DF',
        powerOutput: '4,500 kW',
        role: 'Auxiliary Generator',
      },
    ]);
  };

  const filteredVessels = vessels.filter((v) => {
    const vesselTypes = Array.isArray(v.types)
      ? v.types
      : Array.isArray(v.type)
      ? (v.type as string[])
      : [v.type || ''];

    const portsList = v.operationPorts || [];
    const enginesInfo = (v.engines || []).map((e) => `${e.engineNumber} ${e.modelOrType || ''}`).join(' ');

    const matchesSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.imoNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.waterBody && v.waterBody.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.manufacturer && v.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.placeOfManufacture && v.placeOfManufacture.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.fuelType && v.fuelType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.remarks && v.remarks.toLowerCase().includes(searchQuery.toLowerCase())) ||
      portsList.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      enginesInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vesselTypes.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType =
      typeFilter === 'ALL' ||
      vesselTypes.some((t) => t.toLowerCase() === typeFilter.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate metrics
  const totalVessels = vessels.length;
  const underwayCount = vessels.filter((v) => v.status === 'Underway').length;
  const inPortCount = vessels.filter((v) => v.status === 'In Port').length;
  const atAnchorCount = vessels.filter((v) => v.status === 'At Anchor' || v.status === 'Moored').length;

  const handleExportCSV = () => {
    const headers = [
      'Vessel Name',
      'IMO Number',
      'Types',
      'Flag',
      'Operation Status',
      'Water Body',
      'Operation Ports',
      'Manufacturer',
      'Year of Manufacture',
      'Place of Manufacture',
      'Speed (kts)',
      'Top Speed (kts)',
      'Fuel Type',
      'No. of Engines',
      'Engine Numbers',
      'Crew Count',
      'Remarks',
    ];
    const rows = filteredVessels.map((v) => {
      const vTypes = Array.isArray(v.types)
        ? v.types.join('; ')
        : Array.isArray(v.type)
        ? (v.type as string[]).join('; ')
        : v.type;
      const vPorts = (v.operationPorts || []).join('; ');
      const vEngines = (v.engines || [])
        .map((e) => `${e.engineNumber} (${e.modelOrType || ''})`)
        .join(' | ');

      return [
        `"${v.name}"`,
        `"${v.imoNumber}"`,
        `"${vTypes}"`,
        `"${v.flag}"`,
        `"${v.status}"`,
        `"${v.waterBody || ''}"`,
        `"${vPorts}"`,
        `"${v.manufacturer || ''}"`,
        v.yearOfManufacture || v.yearBuilt,
        `"${v.placeOfManufacture || ''}"`,
        v.speedKnots,
        v.topSpeedKnots || '',
        `"${v.fuelType || ''}"`,
        v.numberOfEngines || (v.engines ? v.engines.length : 1),
        `"${vEngines}"`,
        v.crewCount,
        `"${v.remarks || ''}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `voyage_is_vessels_register_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: Vessel['status']) => {
    switch (status) {
      case 'Underway':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Underway
          </span>
        );
      case 'In Port':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20">
            <Anchor className="h-3 w-3" />
            In Port
          </span>
        );
      case 'At Anchor':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
            <Clock className="h-3 w-3" />
            At Anchor
          </span>
        );
      case 'Moored':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20">
            <Layers className="h-3 w-3" />
            Moored
          </span>
        );
      case 'Dry Dock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
            <AlertCircle className="h-3 w-3" />
            Dry Dock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Vessels Register
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Fleet register, machinery specifications, multi-port routes, and builder technical records
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
          >
            <Download className="h-4 w-4 text-gray-500" />
            <span>Export Fleet CSV</span>
          </button>
          <button
            onClick={() => {
              setCurrentStep(1);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5] transition-colors shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Register Vessel</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-gray-400 dark:text-[#8A99AD] uppercase tracking-wider">
            Total Fleet
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {totalVessels} <span className="text-xs font-normal text-gray-400">Vessels</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Underway
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {underwayCount} <span className="text-xs font-normal text-gray-400">active</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Anchor className="h-3 w-3" /> In Port
          </div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {inPortCount} <span className="text-xs font-normal text-gray-400">berther</span>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3 w-3" /> Anchorage / Moored
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {atAnchorCount} <span className="text-xs font-normal text-gray-400">waiting</span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-gray-100 dark:border-[#2E3A47] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="vessels-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vessel, ports, builder, fuel, engines..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-4 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="Underway">Underway</option>
                <option value="In Port">In Port</option>
                <option value="At Anchor">At Anchor</option>
                <option value="Moored">Moored</option>
                <option value="Dry Dock">Dry Dock</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-medium">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
              >
                <option value="ALL">All Vessel Types</option>
                {AVAILABLE_VESSEL_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8A99AD]">
              <tr>
                <th className="px-5 py-3.5">Vessel & Photo</th>
                <th className="px-4 py-3.5">Type(s) & Flag</th>
                <th className="px-4 py-3.5">Water Body & Ports</th>
                <th className="px-4 py-3.5">Operation Status</th>
                <th className="px-4 py-3.5">Speed / HDG</th>
                <th className="px-4 py-3.5">Manufacturer & Specs</th>
                <th className="px-4 py-3.5">DWT / Tonnage</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredVessels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <Ship className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="font-semibold">No vessels match your search criteria</p>
                    <p className="text-[11px] mt-0.5">Try resetting the status, type, or search query</p>
                  </td>
                </tr>
              ) : (
                filteredVessels.map((vessel) => {
                  const vesselTypes = Array.isArray(vessel.types)
                    ? vessel.types
                    : Array.isArray(vessel.type)
                    ? (vessel.type as string[])
                    : [vessel.type || 'Container Ship'];

                  const opPorts = vessel.operationPorts || [vessel.destination];

                  return (
                    <tr
                      key={vessel.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedVesselForDetail(vessel);
                        if (onSelectVessel) onSelectVessel(vessel);
                      }}
                    >
                      {/* Vessel Name & Photo Thumbnail */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {vessel.imageUrl ? (
                            <img
                              src={vessel.imageUrl}
                              alt={vessel.name}
                              referrerPolicy="no-referrer"
                              className="h-10 w-12 rounded-xl object-cover border border-gray-200 dark:border-[#2E3A47] shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#465FFF] dark:bg-blue-500/10 font-bold">
                              <Ship className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white group-hover:text-[#465FFF] transition-colors flex items-center gap-1.5">
                              <span>{vessel.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                              <span className="font-mono">{vessel.imoNumber}</span>
                              <span>•</span>
                              <span>CS: {vessel.callSign}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type(s) & Flag */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-1 max-w-[200px]">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE]">
                            {vesselTypes[0]}
                          </span>
                          {vesselTypes.length > 1 && (
                            <span
                              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 dark:bg-[#2E3A47] text-gray-600 dark:text-gray-300"
                              title={vesselTypes.slice(1).join(', ')}
                            >
                              +{vesselTypes.length - 1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#8A99AD] mt-1">
                          <span className="inline-block rounded px-1 py-0.2 bg-gray-100 dark:bg-[#2E3A47] font-mono text-[10px]">
                            {vessel.flagCode}
                          </span>
                          <span>{vessel.flag}</span>
                          <span>({vessel.yearOfManufacture || vessel.yearBuilt})</span>
                        </div>
                      </td>

                      {/* Water Body & Operation Ports */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                          <Globe className="h-3.5 w-3.5 text-[#465FFF] shrink-0" />
                          <span className="truncate max-w-[170px]">{vessel.waterBody || 'Open Waters'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-[#8A99AD] mt-1">
                          <MapPin className="h-3 w-3 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[170px]">
                            {opPorts.length > 0 ? opPorts[0] : vessel.destination}
                            {opPorts.length > 1 ? ` (+${opPorts.length - 1} ports)` : ''}
                          </span>
                        </div>
                      </td>

                      {/* Operation Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {getStatusBadge(vessel.status)}
                      </td>

                      {/* Speed / Heading */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                          <Navigation
                            className="h-3.5 w-3.5 text-[#465FFF] transform"
                            style={{ transform: `rotate(${vessel.heading}deg)` }}
                          />
                          <span>{vessel.speedKnots} kts</span>
                          {vessel.topSpeedKnots && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              (max {vessel.topSpeedKnots}k)
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                          HDG: {vessel.heading}° • {vessel.fuelType ? vessel.fuelType.split('/')[0].trim() : 'Fuel'}
                        </div>
                      </td>

                      {/* Manufacturer & Engines */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 dark:text-white truncate max-w-[170px]">
                          {vessel.manufacturer || 'Shipyard N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                          <Cpu className="h-3 w-3 text-[#465FFF] shrink-0" />
                          <span>
                            {vessel.numberOfEngines || (vessel.engines ? vessel.engines.length : 1)} engine(s)
                          </span>
                          {vessel.placeOfManufacture && (
                            <span className="truncate max-w-[100px] text-[10px]">
                              • {vessel.placeOfManufacture.split(',')[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DWT / Tonnage */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {vessel.deadweight}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                          {vessel.grossTonnage}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {onNavigateToMaintenance && (
                            <button
                              onClick={() => onNavigateToMaintenance(vessel.name)}
                              className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-xs font-semibold text-[#465FFF] hover:bg-[#EBEFFF] dark:hover:bg-[#465FFF]/20 transition-colors"
                              title={`View Maintenance for ${vessel.name}`}
                            >
                              <Wrench className="h-3.5 w-3.5 mr-1" />
                              <span className="hidden sm:inline">PMS</span>
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedVesselForDetail(vessel)}
                            className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                            title="View details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1 text-gray-500" />
                            <span>Details</span>
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

        {/* Footer info */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-[#2E3A47] text-xs text-gray-500 dark:text-[#8A99AD] bg-gray-50/40 dark:bg-[#24303F]/20">
          <span>
            Showing <strong>{filteredVessels.length}</strong> of <strong>{totalVessels}</strong> vessels
          </span>
          <span>AIS Data synced: Live</span>
        </div>
      </div>

      {/* Details Modal */}
      {selectedVesselForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            id="vessel-detail-modal"
            className="w-full max-w-3xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Image Banner if available */}
            {selectedVesselForDetail.imageUrl && (
              <div className="relative h-44 w-full bg-slate-900 overflow-hidden border-b border-gray-100 dark:border-[#2E3A47]">
                <img
                  src={selectedVesselForDetail.imageUrl}
                  alt={selectedVesselForDetail.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{selectedVesselForDetail.name}</h3>
                    <p className="text-xs text-gray-300 font-mono mt-0.5">
                      {selectedVesselForDetail.imoNumber} • MMSI: {selectedVesselForDetail.mmsi} • CS: {selectedVesselForDetail.callSign}
                    </p>
                  </div>
                  <div className="shrink-0">{getStatusBadge(selectedVesselForDetail.status)}</div>
                </div>
              </div>
            )}

            {/* Modal Header (shown cleanly when no image or as title bar) */}
            {!selectedVesselForDetail.imageUrl && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#465FFF] text-white">
                    <Ship className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedVesselForDetail.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD] font-mono">
                      {selectedVesselForDetail.imoNumber} • MMSI: {selectedVesselForDetail.mmsi} • CS: {selectedVesselForDetail.callSign}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVesselForDetail(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-700 dark:hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-gray-700 dark:text-gray-300 max-h-[75vh] overflow-y-auto">
              {/* Telemetry Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Operation Status:</span>
                  {getStatusBadge(selectedVesselForDetail.status)}
                </div>
                <div className="flex items-center gap-3 font-semibold text-[#465FFF]">
                  <div className="flex items-center gap-1">
                    <Navigation className="h-4 w-4" />
                    <span>{selectedVesselForDetail.speedKnots} kts ({selectedVesselForDetail.heading}°)</span>
                  </div>
                  {selectedVesselForDetail.topSpeedKnots && (
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300 text-[11px]">
                      <Gauge className="h-3.5 w-3.5 text-[#465FFF]" />
                      <span>Top Speed: {selectedVesselForDetail.topSpeedKnots} kts</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Vessel Types Badge Cloud */}
              <div className="space-y-1.5">
                <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                  Vessel Classifications & Types
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(selectedVesselForDetail.types)
                    ? selectedVesselForDetail.types
                    : Array.isArray(selectedVesselForDetail.type)
                    ? (selectedVesselForDetail.type as string[])
                    : [selectedVesselForDetail.type]
                  ).map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] border border-[#465FFF]/20"
                    >
                      <Tag className="h-3 w-3" />
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step 2: Manufacturer & Machinery Specifications */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-4 space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-[#465FFF]" />
                  <span>Shipbuilder, Propulsion & Machinery Specifications</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Shipyard / Manufacturer</span>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedVesselForDetail.manufacturer || 'Hyundai Heavy Industries'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Year of Manufacture</span>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedVesselForDetail.yearOfManufacture || selectedVesselForDetail.yearBuilt}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Place of Manufacture</span>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedVesselForDetail.placeOfManufacture || 'Ulsan, South Korea'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Fuel Type Used</span>
                    <p className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-500 shrink-0" />
                      <span>{selectedVesselForDetail.fuelType || 'LNG Dual-Fuel / VLSFO'}</span>
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Top Speed Rating</span>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedVesselForDetail.topSpeedKnots || 22.0} knots
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">Total Engines</span>
                    <p className="font-bold text-[#465FFF] dark:text-[#80CAEE]">
                      {selectedVesselForDetail.numberOfEngines ||
                        (selectedVesselForDetail.engines ? selectedVesselForDetail.engines.length : 1)}{' '}
                      Engine Units
                    </p>
                  </div>
                </div>

                {/* Individual Engines breakdown with engine numbers */}
                {selectedVesselForDetail.engines && selectedVesselForDetail.engines.length > 0 && (
                  <div className="pt-2 border-t border-gray-200/70 dark:border-[#2E3A47] space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      Engine Units & Serial Numbers:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedVesselForDetail.engines.map((eng, eIdx) => (
                        <div
                          key={eIdx}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47]"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#465FFF]/10 text-[#465FFF] font-mono text-[11px] font-bold shrink-0">
                            #{eIdx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-gray-900 dark:text-white text-[11px]">
                                {eng.engineNumber}
                              </span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#2E3A47] text-gray-600 dark:text-gray-300 font-semibold">
                                {eng.role || 'Main Engine'}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {eng.modelOrType || 'Marine Diesel'}
                            </p>
                            {eng.powerOutput && (
                              <p className="text-[10px] text-[#465FFF] font-semibold mt-0.5">
                                Power: {eng.powerOutput}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Water Body & Multi-Select Operation Ports */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                  Water Body & Operational Ports
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <Globe className="h-3.5 w-3.5 text-[#465FFF]" />
                      <span>Water Body / Operating Sea</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white mt-1 text-sm">
                      {selectedVesselForDetail.waterBody || 'Open Waters'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                      Sector: {selectedVesselForDetail.currentLocation}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                      <MapPin className="h-3.5 w-3.5 text-[#465FFF]" />
                      <span>Operation Ports (Multiple)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(selectedVesselForDetail.operationPorts || [selectedVesselForDetail.destination]).map(
                        (port, pIdx) => (
                          <span
                            key={pIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-[#1C2434] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2E3A47]"
                          >
                            <Anchor className="h-2.5 w-2.5 text-[#465FFF]" />
                            {port}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="space-y-0.5">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[10px] uppercase font-bold">Flag State</span>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedVesselForDetail.flag} ({selectedVesselForDetail.flagCode})
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[10px] uppercase font-bold">Deadweight (DWT)</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedVesselForDetail.deadweight}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[10px] uppercase font-bold">Gross Tonnage</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedVesselForDetail.grossTonnage}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[10px] uppercase font-bold">Crew on Board</span>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedVesselForDetail.crewCount} crew</p>
                </div>
              </div>

              {/* Remarks Section */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#465FFF]" />
                  <span>Remarks & Operational Notes</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedVesselForDetail.remarks ? (
                    <p>{selectedVesselForDetail.remarks}</p>
                  ) : (
                    <p className="text-gray-400 italic">No operational remarks recorded for this vessel.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 border-t border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30">
              {onNavigateToMaintenance && (
                <button
                  onClick={() => {
                    const vName = selectedVesselForDetail.name;
                    setSelectedVesselForDetail(null);
                    onNavigateToMaintenance(vName);
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-[#465FFF]/30 bg-[#EBEFFF] dark:bg-[#465FFF]/20 px-3.5 py-2 text-xs font-semibold text-[#465FFF] dark:text-blue-400 hover:bg-[#465FFF]/15 transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  <span>View PMS Maintenance</span>
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setSelectedVesselForDetail(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2-Step Add Vessel Modal Wizard */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            id="register-vessel-form-modal"
            className="w-full max-w-3xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden"
          >
            {/* Modal Header with Stepper Progress */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-xs">
                    <Ship className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Register New Fleet Vessel
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                      {currentStep === 1
                        ? 'Step 1: General Details, Operating Sea, Ports & Vessel Image'
                        : 'Step 2: Shipbuilder, Top Speed, Fuel Type & Engine Units'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Stepper Wizard Indicator */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                    currentStep === 1
                      ? 'border-[#465FFF] bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE]'
                      : 'border-gray-200 dark:border-[#2E3A47] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      currentStep === 1
                        ? 'bg-[#465FFF] text-white'
                        : 'bg-gray-200 dark:bg-[#2E3A47] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    1
                  </span>
                  <span>Vessel Identification & Ports</span>
                </button>

                <div className="h-0.5 w-4 bg-gray-200 dark:bg-[#2E3A47]" />

                <button
                  type="button"
                  onClick={() => {
                    if (newVessel.name && newVessel.imoNumber) {
                      setCurrentStep(2);
                    } else {
                      alert('Please complete Step 1 (Vessel Name and IMO Number) first.');
                    }
                  }}
                  className={`flex-1 flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-all ${
                    currentStep === 2
                      ? 'border-[#465FFF] bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE]'
                      : 'border-gray-200 dark:border-[#2E3A47] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      currentStep === 2
                        ? 'bg-[#465FFF] text-white'
                        : 'bg-gray-200 dark:bg-[#2E3A47] text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    2
                  </span>
                  <span>Manufacturer & Machinery Specs</span>
                </button>
              </div>
            </div>

            {/* STEP 1: Identification, Types, Water Body, Multi-Ports, Image Upload, Remarks */}
            {currentStep === 1 && (
              <form onSubmit={handleProceedToStep2} className="p-6 space-y-4 text-xs text-gray-700 dark:text-gray-300 max-h-[72vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vessel Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Vessel Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. OCEAN GLORY"
                      value={newVessel.name}
                      onChange={(e) => setNewVessel({ ...newVessel, name: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* IMO Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      IMO Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. IMO 9845123"
                      value={newVessel.imoNumber}
                      onChange={(e) => setNewVessel({ ...newVessel, imoNumber: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Call Sign */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Call Sign
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. V7AB9"
                      value={newVessel.callSign}
                      onChange={(e) => setNewVessel({ ...newVessel, callSign: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* MMSI */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      MMSI Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 538009999"
                      value={newVessel.mmsi}
                      onChange={(e) => setNewVessel({ ...newVessel, mmsi: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Vessel Type - Multiple Select Card (Spans 2 columns) */}
                  <div className="col-span-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        <Tag className="h-3.5 w-3.5 text-[#465FFF]" />
                        <span>Vessel Type (Multiple Select) *</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {selectedTypes.length} selected
                      </span>
                    </div>

                    {/* Selected Types Chips Preview */}
                    <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-lg bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47]">
                      {selectedTypes.map((type) => (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE]"
                        >
                          {type}
                          <button
                            type="button"
                            onClick={() => toggleTypeSelection(type)}
                            className="hover:text-red-500 ml-0.5"
                            title="Remove type"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Quick Pick Pills */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Select / Toggle Vessel Categories:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_VESSEL_TYPES.map((type) => {
                          const isSelected = selectedTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleTypeSelection(type)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                isSelected
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] text-gray-700 dark:text-gray-300 hover:border-[#465FFF]/50 hover:bg-[#EBEFFF]/50 dark:hover:bg-[#465FFF]/10'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              <span>{type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Type input */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add custom vessel type..."
                        value={customTypeInput}
                        onChange={(e) => setCustomTypeInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomType();
                          }
                        }}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomType}
                        disabled={!customTypeInput.trim()}
                        className="rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F] disabled:opacity-50"
                      >
                        Add Type
                      </button>
                    </div>
                  </div>

                  {/* Flag State */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Flag State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Panama, Singapore, Norway"
                      value={newVessel.flag}
                      onChange={(e) => setNewVessel({ ...newVessel, flag: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Deadweight (DWT) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Deadweight (DWT)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 145,000 DWT"
                      value={newVessel.deadweight}
                      onChange={(e) => setNewVessel({ ...newVessel, deadweight: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Operation Status & Water Body on the same row */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Operation status *
                    </label>
                    <select
                      value={newVessel.status}
                      onChange={(e) =>
                        setNewVessel({ ...newVessel, status: e.target.value as Vessel['status'] })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Underway">Underway</option>
                      <option value="In Port">In Port</option>
                      <option value="At Anchor">At Anchor</option>
                      <option value="Moored">Moored</option>
                      <option value="Dry Dock">Dry Dock</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Water Body / Operating Sea *
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#465FFF]" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. North Sea, Pacific Ocean, Persian Gulf"
                        value={newVessel.waterBody || ''}
                        onChange={(e) => setNewVessel({ ...newVessel, waterBody: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-10 pr-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Operation Ports - Placed below Water Body, Multiple Select */}
                  <div className="col-span-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        <MapPin className="h-3.5 w-3.5 text-[#465FFF]" />
                        <span>Operation Ports (Multiple Select) *</span>
                      </label>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {selectedPorts.length} ports chosen
                      </span>
                    </div>

                    {/* Selected Ports Badges Preview */}
                    <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 rounded-lg bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47]">
                      {selectedPorts.length === 0 ? (
                        <span className="text-gray-400 italic text-[11px]">No ports selected yet. Pick from list below or add custom.</span>
                      ) : (
                        selectedPorts.map((port) => (
                          <span
                            key={port}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-500/20"
                          >
                            <Anchor className="h-3 w-3" />
                            {port}
                            <button
                              type="button"
                              onClick={() => togglePortSelection(port)}
                              className="hover:text-red-500 ml-0.5"
                              title="Remove port"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))
                      )}
                    </div>

                    {/* Quick Pick Major Ports */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Quick Select Major Global Hubs:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                        {PRESET_OPERATION_PORTS.map((port) => {
                          const isSelected = selectedPorts.includes(port);
                          return (
                            <button
                              key={port}
                              type="button"
                              onClick={() => togglePortSelection(port)}
                              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                                isSelected
                                  ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                                  : 'bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] text-gray-700 dark:text-gray-300 hover:border-emerald-500/50 hover:bg-emerald-50/40 dark:hover:bg-emerald-500/10'
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3" />}
                              <span>{port}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add Custom Port */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add custom port (e.g. Santos Port (BRSSZ), Mumbai Port)..."
                        value={customPortInput}
                        onChange={(e) => setCustomPortInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomPort();
                          }
                        }}
                        className="flex-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomPort}
                        disabled={!customPortInput.trim()}
                        className="rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F] disabled:opacity-50"
                      >
                        Add Port
                      </button>
                    </div>
                  </div>

                  {/* Vessel Image Upload - Placed Above Remarks */}
                  <div className="col-span-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                        <ImageIcon className="h-3.5 w-3.5 text-[#465FFF]" />
                        <span>Vessel Image Upload</span>
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Drag & drop or browse image file
                      </span>
                    </div>

                    {imagePreviewUrl ? (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-[#2E3A47] bg-slate-900 h-44 flex items-center justify-center group">
                        <img
                          src={imagePreviewUrl}
                          alt="Vessel Preview"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => setImagePreviewUrl('')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold text-xs shadow-md hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Remove Photo</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={handleImageDrop}
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                          isDraggingImage
                            ? 'border-[#465FFF] bg-[#465FFF]/10'
                            : 'border-gray-300 dark:border-[#2E3A47] hover:border-[#465FFF] bg-white dark:bg-[#1C2434]'
                        }`}
                        onClick={() => document.getElementById('vessel-image-file-input')?.click()}
                      >
                        <Upload className="mx-auto h-8 w-8 text-[#465FFF] mb-2" />
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          Click to browse or drag and drop vessel image here
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP, GIF up to 10MB</p>
                        <input
                          id="vessel-image-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Remarks Input Card - Last Input Card spanning full width */}
                  <div className="col-span-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-3.5 space-y-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                      <FileText className="h-3.5 w-3.5 text-[#465FFF]" />
                      <span>Remarks & Operational Notes (Full Width)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter operational constraints, cargo handling procedures, canal transit permits, hull survey notes, or operating guidelines..."
                      value={newVessel.remarks || ''}
                      onChange={(e) => setNewVessel({ ...newVessel, remarks: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden resize-y min-h-[70px]"
                    />
                  </div>
                </div>

                {/* Modal Step 1 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5] transition-colors"
                  >
                    <span>Proceed to Step 2: Machinery & Builder Specs</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Manufacturer, Year of Manufacture, Place of Manufacture, Top Speed, Fuel Type, Number of Engines, Dynamic Engine Numbers */}
            {currentStep === 2 && (
              <form onSubmit={handleFinalSubmit} className="p-6 space-y-5 text-xs text-gray-700 dark:text-gray-300 max-h-[72vh] overflow-y-auto">
                <div className="rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-[#465FFF] shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                      Technical & Machinery Registry: {newVessel.name || 'NEW VESSEL'}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                      Provide shipbuilder credentials, speed capabilities, fuel type, and engine serial numbers.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Manufacturer of the Vessel */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Manufacturer of the Vessel (Shipbuilder) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hyundai Heavy Industries (HHI), Daewoo (DSME), Imabari"
                      value={newVessel.manufacturer || ''}
                      onChange={(e) => setNewVessel({ ...newVessel, manufacturer: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Year of Manufacture */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Year of Manufacture *
                    </label>
                    <input
                      type="number"
                      required
                      min={1970}
                      max={2030}
                      placeholder="e.g. 2022"
                      value={newVessel.yearOfManufacture || 2022}
                      onChange={(e) =>
                        setNewVessel({ ...newVessel, yearOfManufacture: Number(e.target.value) })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Place of Manufacture */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Place of Manufacture (Shipyard Location) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ulsan, South Korea / Nagasaki, Japan / Papenburg, Germany"
                      value={newVessel.placeOfManufacture || ''}
                      onChange={(e) =>
                        setNewVessel({ ...newVessel, placeOfManufacture: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  {/* Top Speed of the Vessel */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Top Speed of the Vessel (Knots) *
                    </label>
                    <div className="relative">
                      <Gauge className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#465FFF]" />
                      <input
                        type="number"
                        required
                        step="0.1"
                        min="1"
                        max="60"
                        placeholder="e.g. 22.5"
                        value={newVessel.topSpeedKnots || ''}
                        onChange={(e) =>
                          setNewVessel({ ...newVessel, topSpeedKnots: Number(e.target.value) })
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-10 pr-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Fuel Type Used */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Fuel Type Used *
                    </label>
                    <select
                      value={newVessel.fuelType || PRESET_FUEL_TYPES[0]}
                      onChange={(e) => setNewVessel({ ...newVessel, fuelType: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {PRESET_FUEL_TYPES.map((fuel) => (
                        <option key={fuel} value={fuel}>
                          {fuel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Number of Engines */}
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Number of Engines *
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleNumberOfEnginesChange((newVessel.numberOfEngines || 2) - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F]"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={newVessel.numberOfEngines || 2}
                        onChange={(e) => handleNumberOfEnginesChange(Number(e.target.value))}
                        className="w-20 text-center rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-2 text-xs font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleNumberOfEnginesChange((newVessel.numberOfEngines || 2) + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F]"
                      >
                        +
                      </button>
                      <span className="text-[11px] text-gray-400">Total propulsion/aux units</span>
                    </div>
                  </div>
                </div>

                {/* Dynamic Engine List with Engine Numbers against each engine */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                      <Cpu className="h-4 w-4 text-[#465FFF]" />
                      <span>Engine Specifications & Individual Engine Numbers ({enginesList.length} Units)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddEngineRow}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#465FFF]/30 bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] text-[11px] font-semibold hover:bg-[#465FFF]/15"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      <span>Add Engine</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {enginesList.map((engine, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 p-3.5 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#465FFF] text-white font-bold text-xs">
                            <Cpu className="h-3.5 w-3.5" />
                            Engine Unit #{idx + 1}
                          </span>
                          {enginesList.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveEngineRow(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Delete this engine"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Engine Number / Serial Number against this engine */}
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                              Engine Number / Serial ID *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. ME-01-HHI-11G95ME-C9"
                              value={engine.engineNumber}
                              onChange={(e) => handleEngineFieldChange(idx, 'engineNumber', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 font-mono text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                            />
                          </div>

                          {/* Engine Model / Make */}
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                              Engine Model / Maker
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. MAN B&W 11G95ME-C9.5-GI"
                              value={engine.modelOrType || ''}
                              onChange={(e) => handleEngineFieldChange(idx, 'modelOrType', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                            />
                          </div>

                          {/* Power Output & Role */}
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">
                              Power Output (kW / BHP)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 68,640 kW @ 80 RPM"
                              value={engine.powerOutput || ''}
                              onChange={(e) => handleEngineFieldChange(idx, 'powerOutput', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Step 2 Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Step 1: Vessel Info</span>
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#465FFF] px-6 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5] transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete Registration & Save Vessel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
