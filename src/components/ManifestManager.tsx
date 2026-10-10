import React, { useState } from 'react';
import {
  PassengerManifestRecord,
  CargoManifestRecord,
  VoyageRecord,
  Vessel,
  PortRecord,
  LookupItem,
} from '../types';
import { PassengerManifestView } from './PassengerManifestView';
import {
  Users,
  Package,
  Ship,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  Luggage,
  ShieldAlert,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  Compass,
  Anchor,
  FileCheck,
  Info,
  ThermometerSnowflake,
  Flame,
  Radio,
  FileText,
} from 'lucide-react';

interface ManifestManagerProps {
  initialSubTab?: 'passengers' | 'cargo';
  initialTab?: 'passengers' | 'cargo';
  passengersList: PassengerManifestRecord[];
  cargoList: CargoManifestRecord[];
  voyagesList?: VoyageRecord[];
  voyages?: VoyageRecord[];
  vesselsList?: Vessel[];
  vessels?: Vessel[];
  portsList?: PortRecord[];
  ports?: PortRecord[];
  lookupItems?: LookupItem[];
  lookups?: LookupItem[];
  onAddPassenger: (passenger: PassengerManifestRecord) => void;
  onUpdatePassenger: (passenger: PassengerManifestRecord) => void;
  onDeletePassenger: (passengerId: string) => void;
  onAddCargo: (cargo: CargoManifestRecord) => void;
  onUpdateCargo: (cargo: CargoManifestRecord) => void;
  onDeleteCargo: (cargoId: string) => void;
  onNavigateToVoyage?: (voyageNumber: string) => void;
  onShowToast?: (msg: string) => void;
}

export const ManifestManager: React.FC<ManifestManagerProps> = ({
  initialSubTab,
  initialTab,
  passengersList,
  cargoList,
  voyagesList,
  voyages,
  vesselsList,
  vessels,
  portsList,
  ports,
  lookupItems,
  lookups,
  onAddPassenger,
  onUpdatePassenger,
  onDeletePassenger,
  onAddCargo,
  onUpdateCargo,
  onDeleteCargo,
  onNavigateToVoyage,
  onShowToast,
}) => {
  const actualInitialTab = initialTab || initialSubTab || 'passengers';
  const [activeTab, setActiveTab] = useState<'passengers' | 'cargo'>(actualInitialTab);

  const actualVoyages = voyagesList || voyages || [];
  const actualVessels = vesselsList || vessels || [];
  const allLookups = lookupItems || lookups || [];

  // Helper to extract lookups by category code
  const getLookupsForCategory = (catCode: string) => {
    return allLookups.filter((l) => l.categoryCode === catCode && l.status === 'Active');
  };

  const passengerStatusLookups = getLookupsForCategory('passenger_status');
  const passengerGenderLookups = getLookupsForCategory('passenger_gender');
  const passengerAgeCategoryLookups = getLookupsForCategory('passenger_age_category');
  const idTypeLookups = getLookupsForCategory('id_type');
  const cargoCategoryLookups = getLookupsForCategory('cargo_category');
  const hazardClassLookups = getLookupsForCategory('hazard_class');
  const customsStatusLookups = getLookupsForCategory('customs_status');
  const packageTypeLookups = getLookupsForCategory('package_type');

  const defaultIdTypes = [
    'National Identity Card',
    'International Passport',
    'Driver’s License',
    'Seaman’s Book / CDC',
    'Port & Terminal Pass (ISPS / TWIC)',
    'Voter ID Card',
    'Alien / Resident Card',
    'Student ID',
    'Birth Certificate',
    'Other Identification',
  ];

  React.useEffect(() => {
    if (initialTab || initialSubTab) {
      setActiveTab(initialTab || initialSubTab || 'passengers');
    }
  }, [initialTab, initialSubTab]);

  // Passenger Filters & Search
  const [passengerSearch, setPassengerSearch] = useState('');
  const [passengerVoyageFilter, setPassengerVoyageFilter] = useState('ALL');
  const [passengerStatusFilter, setPassengerStatusFilter] = useState('ALL');

  // Cargo Filters & Search
  const [cargoSearch, setCargoSearch] = useState('');
  const [cargoVoyageFilter, setCargoVoyageFilter] = useState('ALL');
  const [cargoCategoryFilter, setCargoCategoryFilter] = useState('ALL');
  const [cargoCustomsFilter, setCargoCustomsFilter] = useState('ALL');

  // Modals state
  const [isAddPassengerModalOpen, setIsAddPassengerModalOpen] = useState(false);
  const [isAddCargoModalOpen, setIsAddCargoModalOpen] = useState(false);
  const [viewingPassenger, setViewingPassenger] = useState<PassengerManifestRecord | null>(null);
  const [viewingCargo, setViewingCargo] = useState<CargoManifestRecord | null>(null);
  const [passengerMatchInfo, setPassengerMatchInfo] = useState<{
    name: string;
    travelCount: number;
    lastVoyage: string;
  } | null>(null);

  // Passenger form state
  const [passengerFormData, setPassengerFormData] = useState<Partial<PassengerManifestRecord>>({
    idType: 'National Identity Card',
    idPassportNumber: '',
    fullName: '',
    gender: 'Male',
    ageCategory: 'Adult',
    nationality: 'Uganda',
    nationalityCode: 'UG',
    contactPhone: '',
    contactEmail: '',
    emergencyContact: '',
    specialAssistance: '',
    cabinDeck: 'Deck 2 Seating',
    baggageCount: 1,
    baggageWeightKg: 15.0,
    vehiclePlate: '',
    vehicleType: '',
    voyageNumber: actualVoyages[0]?.voyageNumber || 'VY-9045',
    vesselName: actualVoyages[0]?.vesselName || 'VOYAGER TITAN',
    departurePort: actualVoyages[0]?.departurePort || 'Port of Singapore (PSA)',
    arrivalPort: actualVoyages[0]?.arrivalPort || 'Port of Rotterdam',
    status: 'Boarded / Embarked',
  });

  // Handle passenger ID Number input change & auto-populate travel history
  const handlePassengerIdChange = (idVal: string) => {
    setPassengerFormData((prev) => ({ ...prev, idPassportNumber: idVal }));
    const cleanId = idVal.trim().toLowerCase();
    if (!cleanId) {
      setPassengerMatchInfo(null);
      return;
    }

    const pastRecords = passengersList.filter(
      (p) => p.idPassportNumber?.trim().toLowerCase() === cleanId
    );

    if (pastRecords.length > 0) {
      const latest = pastRecords[pastRecords.length - 1];
      const guessedIdType =
        latest.idType ||
        (cleanId.startsWith('pas') ? 'International Passport' : 'National Identity Card');

      setPassengerFormData((prev) => ({
        ...prev,
        idPassportNumber: idVal,
        idType: guessedIdType,
        fullName: latest.fullName || prev.fullName,
        gender: latest.gender || prev.gender,
        ageCategory: latest.ageCategory || prev.ageCategory,
        nationality: latest.nationality || prev.nationality,
        nationalityCode: latest.nationalityCode || prev.nationalityCode,
        contactPhone: latest.contactPhone || prev.contactPhone,
        contactEmail: latest.contactEmail !== undefined ? latest.contactEmail : prev.contactEmail,
        emergencyContact: latest.emergencyContact || prev.emergencyContact,
        specialAssistance: latest.specialAssistance !== undefined ? latest.specialAssistance : prev.specialAssistance,
        vehiclePlate: latest.vehiclePlate !== undefined ? latest.vehiclePlate : prev.vehiclePlate,
        vehicleType: latest.vehicleType !== undefined ? latest.vehicleType : prev.vehicleType,
      }));

      setPassengerMatchInfo({
        name: latest.fullName,
        travelCount: pastRecords.length,
        lastVoyage: latest.voyageNumber,
      });

      if (onShowToast) {
        onShowToast(`Travel history found for ${latest.fullName} (${pastRecords.length} voyage${pastRecords.length > 1 ? 's' : ''}). Profile auto-populated.`);
      }
    } else {
      setPassengerMatchInfo(null);
    }
  };

  // Cargo form state
  const [cargoFormData, setCargoFormData] = useState<Partial<CargoManifestRecord>>({
    billOfLadingNumber: `BL-${Date.now().toString().slice(-6)}`,
    containerOrConsignmentId: `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
    voyageNumber: voyagesList[0]?.voyageNumber || 'VY-9045',
    vesselName: voyagesList[0]?.vesselName || 'VOYAGER TITAN',
    cargoDescription: '',
    cargoCategory: 'Containerized (FCL/LCL)',
    hazardClass: 'Non-Hazardous',
    unNumber: '',
    grossWeightMT: 24.0,
    netWeightMT: 21.5,
    teuUnits: 2,
    packageCount: 1,
    packageType: '40ft High Cube Container',
    shipperName: '',
    shipperOrigin: voyagesList[0]?.departurePort || 'Port of Singapore (PSA)',
    consigneeName: '',
    consigneeDestination: voyagesList[0]?.arrivalPort || 'Port of Rotterdam',
    loadingPort: voyagesList[0]?.departurePort || 'Port of Singapore (PSA)',
    dischargePort: voyagesList[0]?.arrivalPort || 'Port of Rotterdam',
    stowagePosition: 'Bay 08, Row 04, Tier 82',
    customsStatus: 'Cleared & Released',
    customsDeclarationRef: `CUST-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'Loaded & Manifested',
  });

  // Filtered Passengers
  const filteredPassengers = passengersList.filter((p) => {
    const matchesSearch =
      p.fullName.toLowerCase().includes(passengerSearch.toLowerCase()) ||
      p.idPassportNumber.toLowerCase().includes(passengerSearch.toLowerCase()) ||
      p.ticketNumber.toLowerCase().includes(passengerSearch.toLowerCase()) ||
      p.bookingRef.toLowerCase().includes(passengerSearch.toLowerCase()) ||
      p.voyageNumber.toLowerCase().includes(passengerSearch.toLowerCase()) ||
      (p.vehiclePlate && p.vehiclePlate.toLowerCase().includes(passengerSearch.toLowerCase()));

    const matchesVoyage = passengerVoyageFilter === 'ALL' || p.voyageNumber === passengerVoyageFilter;
    const matchesStatus = passengerStatusFilter === 'ALL' || p.status === passengerStatusFilter;

    return matchesSearch && matchesVoyage && matchesStatus;
  });

  // Filtered Cargo
  const filteredCargo = cargoList.filter((c) => {
    const matchesSearch =
      c.billOfLadingNumber.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      c.containerOrConsignmentId.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      c.cargoDescription.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      c.shipperName.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      c.consigneeName.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      c.voyageNumber.toLowerCase().includes(cargoSearch.toLowerCase()) ||
      (c.unNumber && c.unNumber.toLowerCase().includes(cargoSearch.toLowerCase()));

    const matchesVoyage = cargoVoyageFilter === 'ALL' || c.voyageNumber === cargoVoyageFilter;
    const matchesCategory = cargoCategoryFilter === 'ALL' || c.cargoCategory === cargoCategoryFilter;
    const matchesCustoms = cargoCustomsFilter === 'ALL' || c.customsStatus === cargoCustomsFilter;

    return matchesSearch && matchesVoyage && matchesCategory && matchesCustoms;
  });

  // KPI calculations
  const totalPassengersCount = passengersList.length;
  const embarkedPassengersCount = passengersList.filter(
    (p) => p.status === 'Boarded / Embarked' || p.status === 'In Transit'
  ).length;
  const vehiclesCount = passengersList.filter((p) => Boolean(p.vehiclePlate)).length;
  const totalBaggageWeightKg = passengersList.reduce((acc, p) => acc + (p.baggageWeightKg || 0), 0);

  const totalCargoTonnageMT = cargoList.reduce((acc, c) => acc + (c.grossWeightMT || 0), 0);
  const totalTeuCount = cargoList.reduce((acc, c) => acc + (c.teuUnits || 0), 0);
  const hazmatCargoCount = cargoList.filter((c) => c.hazardClass !== 'Non-Hazardous').length;
  const customsClearedPercent = cargoList.length
    ? Math.round(
        (cargoList.filter((c) => c.customsStatus === 'Cleared & Released').length / cargoList.length) * 100
      )
    : 100;

  // Export Passenger Manifest CSV
  const handleExportPassengersCSV = () => {
    const headers = [
      'Booking Ref',
      'Ticket Number',
      'Voyage Number',
      'Vessel Name',
      'Passenger Full Name',
      'Gender',
      'Category',
      'Nationality',
      'Passport/ID No',
      'Cabin/Deck',
      'Departure Port',
      'Arrival Port',
      'Baggage Pcs',
      'Baggage (kg)',
      'Vehicle Plate',
      'Status',
      'Emergency Contact',
    ];

    const rows = filteredPassengers.map((p) => [
      p.bookingRef,
      p.ticketNumber,
      p.voyageNumber,
      p.vesselName,
      `"${p.fullName}"`,
      p.gender,
      p.ageCategory,
      p.nationality,
      p.idPassportNumber,
      `"${p.cabinDeck || ''}"`,
      `"${p.departurePort}"`,
      `"${p.arrivalPort}"`,
      p.baggageCount,
      p.baggageWeightKg,
      p.vehiclePlate || 'N/A',
      p.status,
      `"${p.emergencyContact}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VoyageIS_Passenger_Manifest_IMO_FAL6_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Cargo Manifest CSV
  const handleExportCargoCSV = () => {
    const headers = [
      'B/L Number',
      'Container/Consignment ID',
      'Voyage Number',
      'Vessel Name',
      'Cargo Description',
      'Category',
      'Hazmat IMDG Class',
      'UN Number',
      'Gross Weight (MT)',
      'Net Weight (MT)',
      'TEU Units',
      'Package Count',
      'Package Type',
      'Shipper',
      'Consignee',
      'Loading Port',
      'Discharge Port',
      'Stowage Bay',
      'Customs Status',
      'Declaration Ref',
    ];

    const rows = filteredCargo.map((c) => [
      c.billOfLadingNumber,
      c.containerOrConsignmentId,
      c.voyageNumber,
      c.vesselName,
      `"${c.cargoDescription}"`,
      c.cargoCategory,
      `"${c.hazardClass}"`,
      c.unNumber || 'N/A',
      c.grossWeightMT,
      c.netWeightMT,
      c.teuUnits,
      c.packageCount,
      `"${c.packageType}"`,
      `"${c.shipperName}"`,
      `"${c.consigneeName}"`,
      `"${c.loadingPort}"`,
      `"${c.dischargePort}"`,
      `"${c.stowagePosition || ''}"`,
      `"${c.customsStatus}"`,
      `"${c.customsDeclarationRef || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VoyageIS_Cargo_Manifest_IMO_FAL2_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle passenger voyage change in form
  const handlePassengerVoyageChange = (voyageNum: string) => {
    const selectedVoyage = voyagesList.find((v) => v.voyageNumber === voyageNum);
    if (selectedVoyage) {
      setPassengerFormData((prev) => ({
        ...prev,
        voyageNumber: selectedVoyage.voyageNumber,
        vesselName: selectedVoyage.vesselName,
        departurePort: selectedVoyage.departurePort,
        arrivalPort: selectedVoyage.arrivalPort,
      }));
    }
  };

  // Handle cargo voyage change in form
  const handleCargoVoyageChange = (voyageNum: string) => {
    const selectedVoyage = voyagesList.find((v) => v.voyageNumber === voyageNum);
    if (selectedVoyage) {
      setCargoFormData((prev) => ({
        ...prev,
        voyageNumber: selectedVoyage.voyageNumber,
        vesselName: selectedVoyage.vesselName,
        loadingPort: selectedVoyage.departurePort,
        dischargePort: selectedVoyage.arrivalPort,
        shipperOrigin: selectedVoyage.departurePort,
        consigneeDestination: selectedVoyage.arrivalPort,
      }));
    }
  };

  // Submit passenger
  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerFormData.fullName || !passengerFormData.idPassportNumber) {
      alert('Please fill in Passenger Full Name and Passport/ID Number.');
      return;
    }

    const newPassenger: PassengerManifestRecord = {
      id: `PAS-${Date.now().toString().slice(-4)}`,
      bookingRef: `BKG-${Math.floor(10000 + Math.random() * 90000)}`,
      ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      voyageNumber: passengerFormData.voyageNumber || 'VY-9045',
      vesselName: passengerFormData.vesselName || 'VOYAGER TITAN',
      fullName: passengerFormData.fullName,
      gender: passengerFormData.gender || 'Male',
      ageCategory: passengerFormData.ageCategory || 'Adult',
      nationality: passengerFormData.nationality || 'Singapore',
      nationalityCode: passengerFormData.nationalityCode || 'SG',
      idPassportNumber: passengerFormData.idPassportNumber,
      cabinDeck: passengerFormData.cabinDeck || 'General Seating / Deck 2',
      departurePort: passengerFormData.departurePort || 'Port of Singapore (PSA)',
      arrivalPort: passengerFormData.arrivalPort || 'Port of Rotterdam',
      baggageCount: Number(passengerFormData.baggageCount) || 1,
      baggageWeightKg: Number(passengerFormData.baggageWeightKg) || 20,
      vehiclePlate: passengerFormData.vehiclePlate || undefined,
      vehicleType: passengerFormData.vehicleType || undefined,
      status: (passengerFormData.status || 'Boarded / Embarked') as PassengerManifestRecord['status'],
      contactPhone: passengerFormData.contactPhone || '+65 9123 4567',
      contactEmail: passengerFormData.contactEmail,
      emergencyContact: passengerFormData.emergencyContact || 'Family Contact',
      specialAssistance: passengerFormData.specialAssistance,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPassenger(newPassenger);
    setIsAddPassengerModalOpen(false);
  };

  // Submit cargo
  const handleCargoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cargoFormData.cargoDescription || !cargoFormData.shipperName || !cargoFormData.consigneeName) {
      alert('Please fill in Cargo Description, Shipper Name, and Consignee Name.');
      return;
    }

    const newCargo: CargoManifestRecord = {
      id: `CRG-${Date.now().toString().slice(-4)}`,
      billOfLadingNumber: cargoFormData.billOfLadingNumber || `BL-${Date.now().toString().slice(-6)}`,
      containerOrConsignmentId:
        cargoFormData.containerOrConsignmentId ||
        `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
      voyageNumber: cargoFormData.voyageNumber || 'VY-9045',
      vesselName: cargoFormData.vesselName || 'VOYAGER TITAN',
      cargoDescription: cargoFormData.cargoDescription,
      cargoCategory: (cargoFormData.cargoCategory || 'Containerized (FCL/LCL)') as CargoManifestRecord['cargoCategory'],
      hazardClass: (cargoFormData.hazardClass || 'Non-Hazardous') as CargoManifestRecord['hazardClass'],
      unNumber: cargoFormData.unNumber || undefined,
      grossWeightMT: Number(cargoFormData.grossWeightMT) || 20.0,
      netWeightMT: Number(cargoFormData.netWeightMT) || 18.0,
      teuUnits: Number(cargoFormData.teuUnits) || 2,
      packageCount: Number(cargoFormData.packageCount) || 1,
      packageType: cargoFormData.packageType || '40ft High Cube Container',
      shipperName: cargoFormData.shipperName,
      shipperOrigin: cargoFormData.shipperOrigin || cargoFormData.loadingPort || 'Port of Origin',
      consigneeName: cargoFormData.consigneeName,
      consigneeDestination: cargoFormData.consigneeDestination || cargoFormData.dischargePort || 'Port of Destination',
      loadingPort: cargoFormData.loadingPort || 'Port of Singapore (PSA)',
      dischargePort: cargoFormData.dischargePort || 'Port of Rotterdam',
      stowagePosition: cargoFormData.stowagePosition || 'Bay 04, Row 02, Tier 82',
      customsStatus: (cargoFormData.customsStatus || 'Cleared & Released') as CargoManifestRecord['customsStatus'],
      customsDeclarationRef: cargoFormData.customsDeclarationRef || `CUST-${new Date().getFullYear()}-0091`,
      status: (cargoFormData.status || 'Loaded & Manifested') as CargoManifestRecord['status'],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddCargo(newCargo);
    setIsAddCargoModalOpen(false);
  };

  return (
    <div id="manifest-manager-container" className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Fleet Manifest Management
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                IMO standard passenger manifests (FAL Form 6) and cargo consignments (FAL Form 2) linked with active voyages.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-gray-100 dark:bg-[#24303F] p-1">
            <button
              id="tab-passengers-manifest"
              onClick={() => setActiveTab('passengers')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'passengers'
                  ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-[#80CAEE] shadow-xs'
                  : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Passengers Manifest</span>
              <span className="ml-1 rounded-full bg-[#465FFF]/10 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-[#465FFF] dark:text-blue-300">
                {passengersList.length}
              </span>
            </button>

            <button
              id="tab-cargo-manifest"
              onClick={() => setActiveTab('cargo')}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                activeTab === 'cargo'
                  ? 'bg-white dark:bg-[#1C2434] text-[#465FFF] dark:text-[#80CAEE] shadow-xs'
                  : 'text-gray-600 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Cargo Manifest</span>
              <span className="ml-1 rounded-full bg-[#465FFF]/10 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-[#465FFF] dark:text-blue-300">
                {cargoList.length}
              </span>
            </button>
          </div>

          {activeTab === 'passengers' ? (
            <button
              id="export-passengers-manifest-btn"
              onClick={handleExportPassengersCSV}
              title="Download IMO FAL 6 CSV"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export FAL 6</span>
            </button>
          ) : (
            <button
              id="export-cargo-manifest-btn"
              onClick={handleExportCargoCSV}
              title="Download IMO FAL 2 CSV"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export FAL 2</span>
            </button>
          )}

          {activeTab === 'passengers' ? (
            <button
              id="add-passenger-btn"
              onClick={() => setIsAddPassengerModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Passenger</span>
            </button>
          ) : (
            <button
              id="add-cargo-btn"
              onClick={() => setIsAddCargoModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Consignment</span>
            </button>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* PASSENGERS MANIFEST SECTION                          */}
      {/* ==================================================== */}
      {activeTab === 'passengers' && (
        <PassengerManifestView
          passengersList={passengersList}
          voyagesList={actualVoyages}
          vesselsList={actualVessels}
          portsList={portsList || ports}
          lookupItems={allLookups}
          cargoList={cargoList}
          onAddPassenger={onAddPassenger}
          onUpdatePassenger={onUpdatePassenger}
          onDeletePassenger={onDeletePassenger}
          onAddCargo={onAddCargo}
          onShowToast={onShowToast}
        />
      )}

      {/* ==================================================== */}
      {/* CARGO MANIFEST SECTION                               */}
      {/* ==================================================== */}
      {activeTab === 'cargo' && (
        <div className="space-y-5">
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
              <div className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
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
                {cargoList.filter((c) => c.customsStatus === 'Cleared & Released').length} Cleared of {cargoList.length}
              </div>
            </div>
          </div>

          {/* Cargo Filters Bar */}
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
                            <span className="font-bold text-[#465FFF] dark:text-[#80CAEE]">
                              {cargo.billOfLadingNumber}
                            </span>
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
        </div>
      )}

      {/* ==================================================== */}
      {/* ADD PASSENGER MODAL                                  */}
      {/* ==================================================== */}
      {isAddPassengerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Add Passenger to Manifest (IMO FAL 6)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Register passenger booking, travel document, cabin assignment, and vehicle manifest.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddPassengerModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePassengerSubmit} className="mt-4 space-y-4">
              {/* Section 1: Passenger Profile & Identification (ID Type First) */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#465FFF] text-white text-[11px]">1</span>
                    <span>Passenger Profile &amp; Identification</span>
                  </h4>
                  {passengerMatchInfo && (
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      ✓ Profile Auto-Populated ({passengerMatchInfo.travelCount} past trips)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Identity Document (ID) Type *
                    </label>
                    <select
                      value={passengerFormData.idType || 'National Identity Card'}
                      onChange={(e) =>
                        setPassengerFormData({ ...passengerFormData, idType: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {idTypeLookups.length > 0 ? (
                        idTypeLookups.map((item) => (
                          <option key={item.id} value={item.label}>
                            {item.label}
                          </option>
                        ))
                      ) : (
                        defaultIdTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      ID / Passport Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. NIN-CM-91823719 or PAS-SE-882910"
                      value={passengerFormData.idPassportNumber}
                      onChange={(e) => handlePassengerIdChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Passenger Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ronald Mugisha"
                      value={passengerFormData.fullName}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={passengerFormData.gender}
                      onChange={(e) =>
                        setPassengerFormData({
                          ...passengerFormData,
                          gender: e.target.value as PassengerManifestRecord['gender'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Age Category
                    </label>
                    <select
                      value={passengerFormData.ageCategory}
                      onChange={(e) =>
                        setPassengerFormData({
                          ...passengerFormData,
                          ageCategory: e.target.value as PassengerManifestRecord['ageCategory'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child (2-12 yrs)</option>
                      <option value="Infant">Infant (&lt;2 yrs)</option>
                      <option value="Senior">Senior (65+)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Uganda"
                      value={passengerFormData.nationality}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, nationality: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Country Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UG"
                      value={passengerFormData.nationalityCode}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, nationalityCode: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono uppercase focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information (Second After Profile) */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#465FFF] text-white text-[11px]">2</span>
                  <span>Contact Information</span>
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +256 772 123456"
                      value={passengerFormData.contactPhone}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, contactPhone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. passenger@travel.com"
                      value={passengerFormData.contactEmail || ''}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, contactEmail: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Emergency Contact Name &amp; Phone
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Mugisha (+256 701 987654)"
                      value={passengerFormData.emergencyContact}
                      onChange={(e) =>
                        setPassengerFormData({ ...passengerFormData, emergencyContact: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Special Assistance / Medical Alert (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair assistance, Dietary alert"
                      value={passengerFormData.specialAssistance || ''}
                      onChange={(e) =>
                        setPassengerFormData({ ...passengerFormData, specialAssistance: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Baggage, Accommodation & Vehicle */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#465FFF] text-white text-[11px]">3</span>
                  <span>Accommodation, Baggage &amp; Vehicle</span>
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cabin / Deck Assignment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deck 2 / Seat 42"
                      value={passengerFormData.cabinDeck}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, cabinDeck: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Baggage (Pcs / Total kg)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Pcs"
                        value={passengerFormData.baggageCount}
                        onChange={(e) =>
                          setPassengerFormData({ ...passengerFormData, baggageCount: Number(e.target.value) })
                        }
                        className="w-1/2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="kg"
                        value={passengerFormData.baggageWeightKg}
                        onChange={(e) =>
                          setPassengerFormData({ ...passengerFormData, baggageWeightKg: Number(e.target.value) })
                        }
                        className="w-1/2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Accompanying Vehicle Plate
                    </label>
                    <input
                      type="text"
                      placeholder="Optional (e.g. UBJ 892K)"
                      value={passengerFormData.vehiclePlate}
                      onChange={(e) => setPassengerFormData({ ...passengerFormData, vehiclePlate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Voyage & Travel Route (LAST) */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#465FFF] text-white text-[11px]">4</span>
                  <span>Voyage &amp; Travel Route</span>
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Assigned Voyage &amp; Vessel *
                    </label>
                    <select
                      value={passengerFormData.voyageNumber}
                      onChange={(e) => handlePassengerVoyageChange(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {voyagesList.map((v) => (
                        <option key={v.voyageNumber} value={v.voyageNumber}>
                          {v.voyageNumber} — {v.vesselName} ({v.departurePort} → {v.arrivalPort})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={passengerFormData.status}
                      onChange={(e) =>
                        setPassengerFormData({
                          ...passengerFormData,
                          status: e.target.value as PassengerManifestRecord['status'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Boarded / Embarked">Boarded / Embarked</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Booked">Booked (Pending Gate-In)</option>
                      <option value="Disembarked">Disembarked</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddPassengerModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                >
                  Add Passenger to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ADD CARGO CONSIGNMENT MODAL                          */}
      {/* ==================================================== */}
      {isAddCargoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Add Cargo Consignment (IMO FAL 2)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Register Bill of Lading, container/bulk consignment, IMDG dangerous goods class, and customs clearance.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCargoModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCargoSubmit} className="mt-4 space-y-4">
              {/* Linked Voyage Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Voyage &amp; Vessel *
                </label>
                <select
                  value={cargoFormData.voyageNumber}
                  onChange={(e) => handleCargoVoyageChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  {voyagesList.map((v) => (
                    <option key={v.voyageNumber} value={v.voyageNumber}>
                      {v.voyageNumber} — {v.vesselName} ({v.departurePort} → {v.arrivalPort})
                    </option>
                  ))}
                </select>
              </div>

              {/* B/L Number & Container / Consignment ID */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
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
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cargo Description & Category */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Cargo Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Precision Industrial Electronics & Sensors"
                    value={cargoFormData.cargoDescription}
                    onChange={(e) => setCargoFormData({ ...cargoFormData, cargoDescription: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
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
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Containerized (FCL/LCL)">Containerized</option>
                    <option value="Dry Bulk">Dry Bulk</option>
                    <option value="Liquid Bulk">Liquid Bulk</option>
                    <option value="Breakbulk Heavy Lift">Breakbulk Heavy</option>
                    <option value="RoRo Vehicles & Rolling Stock">RoRo Vehicles</option>
                    <option value="Refrigerated Reefer">Reefer</option>
                  </select>
                </div>
              </div>

              {/* Hazmat IMDG Class & UN Number */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    IMDG Dangerous Goods Hazard Class
                  </label>
                  <select
                    value={cargoFormData.hazardClass}
                    onChange={(e) =>
                      setCargoFormData({
                        ...cargoFormData,
                        hazardClass: e.target.value as CargoManifestRecord['hazardClass'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Non-Hazardous">Non-Hazardous (Standard)</option>
                    <option value="IMDG Class 3 (Flammable Liquid)">IMDG Class 3 (Flammable Liquid)</option>
                    <option value="IMDG Class 8 (Corrosive)">IMDG Class 8 (Corrosive)</option>
                    <option value="IMDG Class 9 (Miscellaneous)">IMDG Class 9 (Misc / Lithium Batteries)</option>
                    <option value="IMDG Class 2 (Gases)">IMDG Class 2 (Gases)</option>
                    <option value="IMDG Class 6 (Toxics)">IMDG Class 6 (Toxics)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    UN Number (if Dangerous Goods)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. UN 3480 or UN 1202"
                    value={cargoFormData.unNumber}
                    onChange={(e) => setCargoFormData({ ...cargoFormData, unNumber: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Weight MT, TEU, Stowage */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Gross Weight (Metric Tons) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={cargoFormData.grossWeightMT}
                    onChange={(e) =>
                      setCargoFormData({ ...cargoFormData, grossWeightMT: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    TEU Units
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={cargoFormData.teuUnits}
                    onChange={(e) => setCargoFormData({ ...cargoFormData, teuUnits: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Stowage Position
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bay 08, Row 04, Tier 82"
                    value={cargoFormData.stowagePosition}
                    onChange={(e) => setCargoFormData({ ...cargoFormData, stowagePosition: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Shipper & Consignee */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Shipper / Originator *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Global Tech Logistics Singapore"
                    value={cargoFormData.shipperName}
                    onChange={(e) => setCargoFormData({ ...cargoFormData, shipperName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Consignee / Destination Receiver *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EuroLogistics Hub Rotterdam"
                    value={cargoFormData.consigneeName}
                    onChange={(e) => setCargoFormData({ ...cargoFormData, consigneeName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Customs Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Customs Clearance Status
                </label>
                <select
                  value={cargoFormData.customsStatus}
                  onChange={(e) =>
                    setCargoFormData({
                      ...cargoFormData,
                      customsStatus: e.target.value as CargoManifestRecord['customsStatus'],
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="Cleared & Released">Cleared & Released</option>
                  <option value="Under Customs Inspection">Under Customs Inspection</option>
                  <option value="In Bond / Transit">In Bond / Transit</option>
                  <option value="Customs Hold / Quarantine">Customs Hold / Quarantine</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddCargoModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                >
                  Save Consignment to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW PASSENGER BOARDING PASS MODAL                   */}
      {/* ==================================================== */}
      {viewingPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Passenger Boarding Manifest
                  </h3>
                  <p className="text-xs font-mono text-gray-500 dark:text-[#8A99AD]">
                    {viewingPassenger.ticketNumber} • {viewingPassenger.bookingRef}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingPassenger(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Full Name</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {viewingPassenger.fullName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Passport / ID</span>
                  <span className="font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {viewingPassenger.idPassportNumber} ({viewingPassenger.nationality})
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Voyage / Vessel</span>
                  <span className="font-semibold text-[#465FFF] dark:text-[#80CAEE]">
                    {viewingPassenger.voyageNumber} — {viewingPassenger.vesselName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Route</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingPassenger.departurePort} → {viewingPassenger.arrivalPort}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Cabin / Deck</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {viewingPassenger.cabinDeck}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Checked Baggage</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {viewingPassenger.baggageCount} pcs ({viewingPassenger.baggageWeightKg} kg)
                  </span>
                </div>
                {viewingPassenger.vehiclePlate && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Accompanying Vehicle</span>
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {viewingPassenger.vehiclePlate} ({viewingPassenger.vehicleType})
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Emergency Contact</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {viewingPassenger.emergencyContact}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Boarding Status</span>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 font-bold text-emerald-700 dark:text-emerald-300">
                    {viewingPassenger.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingPassenger(null)}
                className="rounded-xl bg-gray-100 dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* VIEW CARGO B/L MODAL                                 */}
      {/* ==================================================== */}
      {viewingCargo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Bill of Lading Inspection
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
    </div>
  );
};
