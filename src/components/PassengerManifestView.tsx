import React, { useState } from 'react';
import {
  PassengerManifestRecord,
  CargoManifestRecord,
  VoyageRecord,
  Vessel,
  PortRecord,
  LookupItem,
} from '../types';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  CheckCircle2,
  Car,
  Luggage,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  Check,
  X,
  Anchor,
  FileText,
  Ship,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Copy,
  MessageSquare,
  UserCheck,
  Truck,
  Bus,
  Phone,
} from 'lucide-react';
import { SmsSelfCheckInModal } from './SmsSelfCheckInModal';

interface PassengerManifestViewProps {
  passengersList: PassengerManifestRecord[];
  voyagesList?: VoyageRecord[];
  voyages?: VoyageRecord[];
  vesselsList?: Vessel[];
  vessels?: Vessel[];
  portsList?: PortRecord[];
  ports?: PortRecord[];
  lookupItems?: LookupItem[];
  lookups?: LookupItem[];
  cargoList?: CargoManifestRecord[];
  onAddPassenger: (passenger: PassengerManifestRecord) => void;
  onUpdatePassenger: (passenger: PassengerManifestRecord) => void;
  onDeletePassenger: (passengerId: string) => void;
  onAddCargo?: (cargo: CargoManifestRecord) => void;
  onShowToast?: (msg: string) => void;
}

export const PassengerManifestView: React.FC<PassengerManifestViewProps> = ({
  passengersList = [],
  voyagesList,
  voyages,
  vesselsList,
  vessels,
  portsList,
  ports,
  lookupItems,
  lookups,
  cargoList = [],
  onAddPassenger,
  onUpdatePassenger,
  onDeletePassenger,
  onAddCargo,
  onShowToast,
}) => {
  const actualVoyages = voyagesList || voyages || [];
  const actualVessels = vesselsList || vessels || [];
  const allLookups = lookupItems || lookups || [];

  // Lookups helper
  const getLookups = (code: string) => {
    return allLookups.filter(
      (l) => (l.category === code || l.categoryCode === code) && (l.status === 'Active' || l.isActive !== false)
    );
  };

  const statusLookups = getLookups('passenger_status');
  const genderLookups = getLookups('passenger_gender');
  const categoryLookups = getLookups('passenger_age_category');
  const idTypeLookups = getLookups('id_type');

  // Fallback ID types list
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

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [voyageFilter, setVoyageFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // UI / Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [editingPassenger, setEditingPassenger] = useState<PassengerManifestRecord | null>(null);
  const [viewingPassenger, setViewingPassenger] = useState<PassengerManifestRecord | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-populate / Travel history state
  const [historyMatchInfo, setHistoryMatchInfo] = useState<{
    found: boolean;
    name: string;
    travelCount: number;
    lastVoyage: string;
    lastRoute?: string;
  } | null>(null);
  const [idSearchQuery, setIdSearchQuery] = useState('');
  const [showIdSuggestions, setShowIdSuggestions] = useState(false);

  // Defaults
  const defaultVoyage = actualVoyages[0]?.voyageNumber || 'VY-9045';
  const defaultVessel = actualVoyages[0]?.vesselName || 'VOYAGER TITAN';
  const defaultDepPort = actualVoyages[0]?.departurePort || 'Port of Singapore (PSA)';
  const defaultArrPort = actualVoyages[0]?.arrivalPort || 'Port of Rotterdam';

  // Form Initial state (Section 1: Profile & ID, Section 2: Contact, Section 3: Baggage/Cabin, Section 4: Voyage)
  const getBlankForm = (): Partial<PassengerManifestRecord> => ({
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
    voyageNumber: defaultVoyage,
    vesselName: defaultVessel,
    departurePort: defaultDepPort,
    arrivalPort: defaultArrPort,
    status: 'Boarded / Embarked',
  });

  const [formData, setFormData] = useState<Partial<PassengerManifestRecord>>(getBlankForm());

  // Handle ID number change and auto-populate if person has ever travelled
  const handleIdNumberChange = (enteredId: string) => {
    setFormData((prev) => ({ ...prev, idPassportNumber: enteredId }));
    setIdSearchQuery(enteredId);

    const cleanId = enteredId.trim().toLowerCase();
    if (!cleanId) {
      setHistoryMatchInfo(null);
      return;
    }

    // Search travel history in passengers list
    const pastRecords = passengersList.filter(
      (p) => p.idPassportNumber?.trim().toLowerCase() === cleanId
    );

    if (pastRecords.length > 0) {
      const latest = pastRecords[pastRecords.length - 1];
      const guessedIdType =
        latest.idType ||
        (cleanId.startsWith('pas') ? 'International Passport' : 'National Identity Card');

      setFormData((prev) => ({
        ...prev,
        idPassportNumber: enteredId,
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

      setHistoryMatchInfo({
        found: true,
        name: latest.fullName,
        travelCount: pastRecords.length,
        lastVoyage: latest.voyageNumber,
        lastRoute: `${latest.departurePort.split(' (')[0]} → ${latest.arrivalPort.split(' (')[0]}`,
      });

      if (onShowToast) {
        onShowToast(`Travel history found for ${latest.fullName} (${pastRecords.length} previous voyage${pastRecords.length > 1 ? 's' : ''}). Profile auto-populated.`);
      }
    } else {
      setHistoryMatchInfo(null);
    }
  };

  // Select an existing traveller from autocomplete suggestion
  const handleSelectExistingTraveller = (p: PassengerManifestRecord) => {
    const allMatching = passengersList.filter(
      (item) => item.idPassportNumber?.trim().toLowerCase() === p.idPassportNumber?.trim().toLowerCase()
    );
    const guessedIdType =
      p.idType ||
      (p.idPassportNumber.toLowerCase().startsWith('pas') ? 'International Passport' : 'National Identity Card');

    setFormData((prev) => ({
      ...prev,
      idPassportNumber: p.idPassportNumber,
      idType: guessedIdType,
      fullName: p.fullName,
      gender: p.gender,
      ageCategory: p.ageCategory,
      nationality: p.nationality,
      nationalityCode: p.nationalityCode,
      contactPhone: p.contactPhone,
      contactEmail: p.contactEmail || '',
      emergencyContact: p.emergencyContact || '',
      specialAssistance: p.specialAssistance || '',
      vehiclePlate: p.vehiclePlate || '',
      vehicleType: p.vehicleType || '',
    }));

    setHistoryMatchInfo({
      found: true,
      name: p.fullName,
      travelCount: allMatching.length,
      lastVoyage: p.voyageNumber,
      lastRoute: `${p.departurePort.split(' (')[0]} → ${p.arrivalPort.split(' (')[0]}`,
    });

    setShowIdSuggestions(false);
    if (onShowToast) {
      onShowToast(`Loaded profile for ${p.fullName} (${allMatching.length} recorded voyage${allMatching.length > 1 ? 's' : ''}).`);
    }
  };

  // Handle Voyage Selection change in Form
  const handleVoyageChange = (voyageNo: string, isEditing = false) => {
    const v = actualVoyages.find((item) => item.voyageNumber === voyageNo);
    if (!v) return;

    if (isEditing && editingPassenger) {
      setEditingPassenger({
        ...editingPassenger,
        voyageNumber: v.voyageNumber,
        vesselName: v.vesselName,
        departurePort: v.departurePort,
        arrivalPort: v.arrivalPort,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        voyageNumber: v.voyageNumber,
        vesselName: v.vesselName,
        departurePort: v.departurePort,
        arrivalPort: v.arrivalPort,
      }));
    }
  };

  // Sample quick auto-fill
  const handleQuickAutofill = () => {
    const samples = [
      { idType: 'National Identity Card', name: 'Mugisha Ronald', nat: 'Uganda', code: 'UG', pass: 'NIN-CM-91823719', cabin: 'Deck 2 / Seat 42', veh: 'UBJ 892K', vType: 'Pickup / Isuzu D-Max', phone: '+256 772 123456', em: 'Sarah Mugisha (+256 701 987654)' },
      { idType: 'International Passport', name: 'Elena Rostova', nat: 'Sweden', code: 'SE', pass: 'PAS-SE-882910', cabin: 'Deck 4 / Cabin 412', veh: 'SE-SWE-982', vType: 'SUV / Crossover', phone: '+46 70 812 3456', em: 'Ingrid Rostova (+46 70 812 9988)' },
      { idType: 'International Passport', name: 'Dr. Marcus Vance', nat: 'United Kingdom', code: 'GB', pass: 'PAS-GB-102948', cabin: 'Deck 3 / Cabin 305', veh: '', vType: '', phone: '+44 7911 123456', em: 'Emma Vance (+44 7911 654321)' },
      { idType: 'National Identity Card', name: 'Nakato Fatuma', nat: 'Uganda', code: 'UG', pass: 'NIN-CF-88219034', cabin: 'Deck 2 / VIP Seat 12', veh: 'UAL 234G', vType: 'Saloon / Toyota Premio', phone: '+256 752 443322', em: 'Hussein Kato (+256 774 556677)' },
      { idType: 'Seaman’s Book / CDC', name: 'Amira Al-Mansoor', nat: 'Singapore', code: 'SG', pass: 'CDC-SG-441029', cabin: 'Deck 3 / Cabin 318', veh: 'SG-SK-4820', vType: 'Hatchback', phone: '+65 9123 4567', em: 'Family Contact (+65 6123 0000)' },
    ];
    const item = samples[Math.floor(Math.random() * samples.length)];
    setFormData((prev) => ({
      ...prev,
      idType: item.idType,
      idPassportNumber: item.pass,
      fullName: item.name,
      nationality: item.nat,
      nationalityCode: item.code,
      cabinDeck: item.cabin,
      vehiclePlate: item.veh,
      vehicleType: item.vType,
      gender: Math.random() > 0.5 ? 'Female' : 'Male',
      ageCategory: 'Adult',
      baggageCount: 2,
      baggageWeightKg: 22.5,
      contactPhone: item.phone,
      contactEmail: `${item.name.toLowerCase().replace(/[^a-z]/g, '')}@maritime-travel.com`,
      emergencyContact: item.em,
      status: 'Boarded / Embarked',
    }));
    setHistoryMatchInfo(null);
  };

  // Open add modal and reset states
  const handleOpenAddModal = () => {
    setFormData(getBlankForm());
    setHistoryMatchInfo(null);
    setShowIdSuggestions(false);
    setIsAddModalOpen(true);
  };

  // Submit new passenger
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName?.trim() || !formData.idPassportNumber?.trim()) {
      alert('Please fill in ID Number and Passenger Full Name.');
      return;
    }

    const newPassenger: PassengerManifestRecord = {
      id: `PAS-${Date.now().toString().slice(-4)}`,
      bookingRef: `BKG-${Math.floor(10000 + Math.random() * 90000)}`,
      ticketNumber: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      idType: formData.idType || 'National Identity Card',
      idPassportNumber: formData.idPassportNumber.trim(),
      fullName: formData.fullName.trim(),
      gender: formData.gender || 'Male',
      ageCategory: formData.ageCategory || 'Adult',
      nationality: formData.nationality?.trim() || 'Uganda',
      nationalityCode: formData.nationalityCode?.trim() || 'UG',
      contactPhone: formData.contactPhone?.trim() || '+256 700 123456',
      contactEmail: formData.contactEmail?.trim() || undefined,
      emergencyContact: formData.emergencyContact?.trim() || 'Next of Kin / Contact',
      specialAssistance: formData.specialAssistance?.trim() || undefined,
      cabinDeck: formData.cabinDeck?.trim() || 'Deck 2 Seating',
      departurePort: formData.departurePort || defaultDepPort,
      arrivalPort: formData.arrivalPort || defaultArrPort,
      baggageCount: Number(formData.baggageCount) || 1,
      baggageWeightKg: Number(formData.baggageWeightKg) || 15,
      vehiclePlate: formData.vehiclePlate?.trim() || undefined,
      vehicleType: formData.vehicleType?.trim() || undefined,
      voyageNumber: formData.voyageNumber || defaultVoyage,
      vesselName: formData.vesselName || defaultVessel,
      status: (formData.status || 'Boarded / Embarked') as PassengerManifestRecord['status'],
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddPassenger(newPassenger);
    setFormData(getBlankForm());
    setHistoryMatchInfo(null);
    setIsAddModalOpen(false);
    if (onShowToast) onShowToast(`Passenger ${newPassenger.fullName} registered to Voyage ${newPassenger.voyageNumber}.`);
  };

  // Submit edit passenger
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPassenger) return;
    onUpdatePassenger(editingPassenger);
    setEditingPassenger(null);
    if (onShowToast) onShowToast(`Passenger ${editingPassenger.fullName} manifest record updated.`);
  };

  // Copy text helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
    if (onShowToast) onShowToast(`Copied ${label} to clipboard.`);
  };

  // Filtered passengers list
  const filtered = passengersList.filter((p) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      !term ||
      p.fullName.toLowerCase().includes(term) ||
      p.idPassportNumber.toLowerCase().includes(term) ||
      p.ticketNumber.toLowerCase().includes(term) ||
      p.bookingRef.toLowerCase().includes(term) ||
      p.voyageNumber.toLowerCase().includes(term) ||
      (p.vehiclePlate && p.vehiclePlate.toLowerCase().includes(term)) ||
      (p.cabinDeck && p.cabinDeck.toLowerCase().includes(term)) ||
      (p.contactPhone && p.contactPhone.toLowerCase().includes(term));

    const matchesVoyage = voyageFilter === 'ALL' || p.voyageNumber === voyageFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || p.ageCategory === categoryFilter;

    return matchesSearch && matchesVoyage && matchesStatus && matchesCategory;
  });

  // KPI Calculations
  const totalCount = passengersList.length;
  const embarkedCount = passengersList.filter(
    (p) => p.status === 'Boarded / Embarked' || p.status === 'In Transit'
  ).length;
  const boardingRate = totalCount ? Math.round((embarkedCount / totalCount) * 100) : 0;
  const vehicleCount = passengersList.filter((p) => Boolean(p.vehiclePlate)).length;
  const totalBaggageKg = passengersList.reduce((acc, p) => acc + (p.baggageWeightKg || 0), 0);
  const totalBaggagePcs = passengersList.reduce((acc, p) => acc + (p.baggageCount || 0), 0);
  const specialAssistanceCount = passengersList.filter((p) => Boolean(p.specialAssistance)).length;
  const adultCount = passengersList.filter((p) => p.ageCategory === 'Adult' || p.ageCategory === 'Senior').length;
  const childInfantCount = passengersList.filter((p) => p.ageCategory === 'Child' || p.ageCategory === 'Infant').length;

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Ticket Number',
      'Booking Ref',
      'Voyage Number',
      'Vessel Name',
      'Passenger Full Name',
      'Gender',
      'Age Category',
      'Nationality',
      'Passport/ID No',
      'Cabin/Deck',
      'Departure Port',
      'Arrival Port',
      'Baggage Pieces',
      'Baggage Weight (kg)',
      'Vehicle License Plate',
      'Vehicle Type',
      'Boarding Status',
      'Contact Phone',
      'Emergency Contact',
      'Special Assistance',
    ];

    const rows = filtered.map((p) => [
      p.ticketNumber,
      p.bookingRef,
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
      p.vehicleType || 'N/A',
      p.status,
      `"${p.contactPhone || ''}"`,
      `"${p.emergencyContact || ''}"`,
      `"${p.specialAssistance || 'None'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IMO_FAL6_Passenger_Manifest_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Passenger Manifest (IMO FAL Form 6) exported.');
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-[#465FFF] dark:text-[#80CAEE]">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Passenger Manifest (IMO FAL Form 6)
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
            Manage passenger embarkation, cabin allocations, Ro-Pax accompanying vehicles, and border authority declarations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="open-sms-self-checkin-btn"
            type="button"
            onClick={() => setIsSmsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/90 dark:bg-blue-950/50 px-3.5 py-2 text-xs font-bold text-[#465FFF] dark:text-[#80CAEE] hover:bg-blue-100 dark:hover:bg-blue-900/60 shadow-2xs transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>SMS Self Check-In (8199)</span>
          </button>

          <button
            id="export-passenger-fal6-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
          >
            <Download className="h-4 w-4 text-gray-500 dark:text-[#8A99AD]" />
            <span>Export FAL 6 (CSV)</span>
          </button>

          <button
            id="open-register-passenger-modal-btn"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Register Passenger</span>
          </button>
        </div>
      </div>

      {/* 1. TOP SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Booked */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8A99AD]">
              Total Manifested Passengers
            </span>
            <span className="rounded-xl bg-blue-50 dark:bg-blue-900/30 p-2 text-[#465FFF] dark:text-blue-400">
              <Users className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {totalCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Booked</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{adultCount} Adults</span>
            <span>•</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">{childInfantCount} Child/Infant</span>
          </div>
        </div>

        {/* Card 2: Embarked / Boarded */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8A99AD]">
              Embarked / Onboard
            </span>
            <span className="rounded-xl bg-emerald-50 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
              <Anchor className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {embarkedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              ({boardingRate}%)
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-[#2E3A47]">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${boardingRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Accompanying Vehicles */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8A99AD]">
              Accompanying Vehicles
            </span>
            <span className="rounded-xl bg-purple-50 dark:bg-purple-900/30 p-2 text-purple-600 dark:text-purple-400">
              <Car className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {vehicleCount}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Units</span>
          </div>
          <div className="mt-2 text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ro-Pax Garage Deck Allocated</span>
          </div>
        </div>

        {/* Card 4: Checked Baggage */}
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-[#8A99AD]">
              Checked Baggage
            </span>
            <span className="rounded-xl bg-amber-50 dark:bg-amber-900/30 p-2 text-amber-600 dark:text-amber-400">
              <Luggage className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {totalBaggageKg.toFixed(1)} <span className="text-sm font-semibold">kg</span>
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({totalBaggagePcs} pcs)</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
            Avg {(totalCount ? totalBaggageKg / totalCount : 0).toFixed(1)} kg / passenger
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. SEARCH & FILTERS BAR                              */}
      {/* ==================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="search-passengers-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search passenger name, passport number, booking ref, ticket, cabin, or vehicle plate..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] py-2 pl-9 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Voyage filter */}
          <select
            id="filter-passenger-voyage-select"
            value={voyageFilter}
            onChange={(e) => setVoyageFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Voyages ({passengersList.length})</option>
            {Array.from(new Set(passengersList.map((p) => p.voyageNumber))).map((voyageNo) => (
              <option key={voyageNo} value={voyageNo}>
                {voyageNo} - {passengersList.find((p) => p.voyageNumber === voyageNo)?.vesselName}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            id="filter-passenger-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Boarded / Embarked">Boarded / Embarked</option>
            <option value="In Transit">In Transit</option>
            <option value="Booked">Booked</option>
            <option value="Disembarked">Disembarked</option>
            <option value="No Show">No Show</option>
          </select>

          {/* Export CSV button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2E3A47] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export FAL 6 CSV</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. PASSENGER DATA TABLE                              */}
      {/* ==================================================== */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/60 text-gray-500 dark:text-[#8A99AD] font-semibold">
                <th className="py-3.5 pl-4 pr-3">Ticket / Ref</th>
                <th className="px-3 py-3.5">Passenger Name</th>
                <th className="px-3 py-3.5">Nationality &amp; ID/Passport</th>
                <th className="px-3 py-3.5">Voyage &amp; Vessel</th>
                <th className="px-3 py-3.5">Cabin / Seat</th>
                <th className="px-3 py-3.5">Baggage &amp; Vehicle</th>
                <th className="px-3 py-3.5">Boarding Status</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="font-semibold">No passengers found matching filter criteria</p>
                    <p className="text-[11px] text-gray-400 mt-1">Try clearing filters or adding a new passenger.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((passenger) => (
                  <tr
                    key={passenger.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors"
                  >
                    {/* Ticket & Booking Ref */}
                    <td className="py-3.5 pl-4 pr-3 font-mono font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#465FFF] dark:text-[#80CAEE]">
                            {passenger.ticketNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(passenger.ticketNumber, 'Ticket Number')}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            title="Copy Ticket Number"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-[10px] text-gray-400 font-normal">
                          Ref: {passenger.bookingRef}
                        </span>
                      </div>
                    </td>

                    {/* Passenger Name & Category */}
                    <td className="px-3 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        <span>{passenger.fullName}</span>
                        {passenger.ageCategory !== 'Adult' && (
                          <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                            {passenger.ageCategory}
                          </span>
                        )}
                        {passenger.isSelfCheckIn && (
                          <span className="rounded bg-blue-50 dark:bg-blue-900/40 px-1.5 py-0.2 text-[9px] font-bold text-[#465FFF] dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40">
                            SMS 8199
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1">
                        <span>{passenger.gender}</span>
                        {passenger.contactPhone && (
                          <>
                            <span>•</span>
                            <span>{passenger.contactPhone}</span>
                          </>
                        )}
                      </div>
                      {/* PROXY ASSISTED-BY METADATA */}
                      {passenger.assistedBy && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-medium bg-amber-50/90 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/40 w-fit">
                          <UserCheck className="h-3 w-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="truncate max-w-[210px]">{passenger.assistedBy}</span>
                        </div>
                      )}
                    </td>

                    {/* Nationality & ID */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {passenger.nationality}
                        </span>
                        <span className="rounded bg-gray-100 dark:bg-[#2E3A47] px-1 py-0.2 text-[10px] font-mono text-gray-600 dark:text-gray-300">
                          {passenger.nationalityCode}
                        </span>
                      </div>
                      <div className="font-mono text-[11px] text-gray-400">
                        {passenger.idPassportNumber}
                      </div>
                    </td>

                    {/* Voyage & Vessel */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                        <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
                        <span>{passenger.vesselName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                        <span className="font-mono font-semibold text-[#465FFF] dark:text-[#80CAEE]">
                          {passenger.voyageNumber}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-[120px]">{passenger.departurePort.split(' (')[0]} → {passenger.arrivalPort.split(' (')[0]}</span>
                      </div>
                    </td>

                    {/* Cabin / Deck */}
                    <td className="px-3 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      {passenger.cabinDeck || 'Deck 2 Seating'}
                    </td>

                    {/* Baggage & Vehicle */}
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <Luggage className="h-3.5 w-3.5 text-gray-400" />
                        <span>{passenger.baggageCount} pcs ({passenger.baggageWeightKg} kg)</span>
                      </div>
                      {passenger.vehiclePlate || passenger.driverVehiclePlate ? (
                        <div className="mt-1 flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-[11px] font-bold text-purple-600 dark:text-purple-400">
                            <Car className="h-3 w-3 shrink-0" />
                            <span className="font-mono">{passenger.vehiclePlate || passenger.driverVehiclePlate}</span>
                            <span className="text-[10px] text-gray-500 font-normal">
                              ({passenger.driverVehicleType || passenger.vehicleType || 'Vehicle'})
                            </span>
                          </div>
                          {passenger.isDriver && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-1.5 py-0.2 rounded border border-purple-200/60 dark:border-purple-800/40 w-fit">
                              <span>Driver</span> • <span>📦 Ro-Pax Cargo Manifested</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-gray-400">No Vehicle</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          passenger.status === 'Boarded / Embarked'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : passenger.status === 'In Transit'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : passenger.status === 'Booked'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-gray-100 text-gray-700 dark:bg-[#2E3A47] dark:text-gray-300'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {passenger.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-passenger-${passenger.id}`}
                          onClick={() => setViewingPassenger(passenger)}
                          title="View Boarding Pass & Details"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`edit-passenger-${passenger.id}`}
                          onClick={() => setEditingPassenger(passenger)}
                          title="Edit Passenger Record"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`toggle-embark-passenger-${passenger.id}`}
                          onClick={() => {
                            const newStatus: PassengerManifestRecord['status'] =
                              passenger.status === 'Boarded / Embarked' ? 'Disembarked' : 'Boarded / Embarked';
                            onUpdatePassenger({ ...passenger, status: newStatus });
                            if (onShowToast) onShowToast(`Passenger ${passenger.fullName} marked as ${newStatus}.`);
                          }}
                          title={
                            passenger.status === 'Boarded / Embarked'
                              ? 'Mark as Disembarked'
                              : 'Confirm Boarding / Embarkation'
                          }
                          className={`rounded-lg p-1.5 transition-colors ${
                            passenger.status === 'Boarded / Embarked'
                              ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          id={`delete-passenger-${passenger.id}`}
                          onClick={() => {
                            if (confirm(`Remove passenger ${passenger.fullName} from manifest?`)) {
                              onDeletePassenger(passenger.id);
                              if (onShowToast) onShowToast(`Passenger ${passenger.fullName} removed.`);
                            }
                          }}
                          title="Remove Passenger"
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

      {/* ==================================================== */}
      {/* 5. VIEW PASSENGER BOARDING PASS MODAL                */}
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
                    Passenger Boarding Manifest (IMO FAL 6)
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

            <div className="mt-4 space-y-3 text-xs">
              <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-gray-400">Full Name</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {viewingPassenger.fullName} ({viewingPassenger.ageCategory})
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
                      {viewingPassenger.vehiclePlate} ({viewingPassenger.driverVehicleType || viewingPassenger.vehicleType})
                      {viewingPassenger.isDriver && ' • Driver Ro-Pax Cargo'}
                    </span>
                  </div>
                )}
                {viewingPassenger.isSelfCheckIn && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Check-In Channel</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      SMS Gateway (Shortcode 8199)
                    </span>
                  </div>
                )}
                {viewingPassenger.assistedBy && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2 border border-amber-200 dark:border-amber-800/50 text-[11px]">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                      <UserCheck className="h-3.5 w-3.5" /> Proxy Booking Support Metadata:
                    </span>
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      {viewingPassenger.assistedBy}
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

            <div className="mt-5 flex justify-end gap-2">
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
      {/* 6. EDIT PASSENGER MODAL                              */}
      {/* ==================================================== */}
      {editingPassenger && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Edit Passenger Record
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    {editingPassenger.ticketNumber} • {editingPassenger.bookingRef}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingPassenger(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              {/* Section 1: Passenger Profile & Identification (ID Type First) */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  1. Passenger Profile &amp; Identification
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Identity Document (ID) Type *
                    </label>
                    <select
                      value={editingPassenger.idType || 'National Identity Card'}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, idType: e.target.value })
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
                      value={editingPassenger.idPassportNumber}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, idPassportNumber: e.target.value })
                      }
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
                      value={editingPassenger.fullName}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, fullName: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={editingPassenger.gender}
                      onChange={(e) =>
                        setEditingPassenger({
                          ...editingPassenger,
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
                      value={editingPassenger.ageCategory}
                      onChange={(e) =>
                        setEditingPassenger({
                          ...editingPassenger,
                          ageCategory: e.target.value as PassengerManifestRecord['ageCategory'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                      <option value="Senior">Senior</option>
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
                      value={editingPassenger.nationality}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, nationality: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Country Code
                    </label>
                    <input
                      type="text"
                      value={editingPassenger.nationalityCode}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, nationalityCode: e.target.value.toUpperCase() })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono uppercase focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Information */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  2. Contact Information
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editingPassenger.contactPhone || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, contactPhone: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email Address
                    </label>
                    <input
                      type="email"
                      value={editingPassenger.contactEmail || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, contactEmail: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Emergency Contact (Name &amp; Tel)
                    </label>
                    <input
                      type="text"
                      value={editingPassenger.emergencyContact || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, emergencyContact: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Special Assistance / Medical Alert
                    </label>
                    <input
                      type="text"
                      value={editingPassenger.specialAssistance || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, specialAssistance: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Baggage, Accommodation & Vehicle */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  3. Accommodation, Baggage &amp; Vehicle (Ro-Pax)
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cabin / Deck Assignment
                    </label>
                    <input
                      type="text"
                      value={editingPassenger.cabinDeck || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, cabinDeck: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Baggage Pieces
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingPassenger.baggageCount ?? 1}
                      onChange={(e) =>
                        setEditingPassenger({
                          ...editingPassenger,
                          baggageCount: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Total Baggage Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editingPassenger.baggageWeightKg ?? 0}
                      onChange={(e) =>
                        setEditingPassenger({
                          ...editingPassenger,
                          baggageWeightKg: Number(e.target.value),
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle License Plate (Ro-Pax)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional (e.g. UBL 201K)"
                      value={editingPassenger.vehiclePlate || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, vehiclePlate: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type / Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SUV, Pickup, Sedan"
                      value={editingPassenger.vehicleType || ''}
                      onChange={(e) =>
                        setEditingPassenger({ ...editingPassenger, vehicleType: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Voyage & Travel Route (LAST) */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  4. Voyage &amp; Travel Route
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Assigned Voyage &amp; Vessel
                    </label>
                    <select
                      value={editingPassenger.voyageNumber}
                      onChange={(e) => handleVoyageChange(e.target.value, true)}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
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
                      Boarding Status
                    </label>
                    <select
                      value={editingPassenger.status}
                      onChange={(e) =>
                        setEditingPassenger({
                          ...editingPassenger,
                          status: e.target.value as PassengerManifestRecord['status'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      <option value="Boarded / Embarked">Boarded / Embarked</option>
                      <option value="Booked">Booked</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Disembarked">Disembarked</option>
                      <option value="No Show">No Show</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingPassenger(null)}
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

      {/* ==================================================== */}
      {/* 7. REGISTER PASSENGER MODAL (IMO FAL FORM 6)        */}
      {/* ==================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-xs">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Register Passenger (IMO FAL Form 6)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Passenger Profile &amp; ID Verification, Contact Information, Baggage, and Voyage Allocation.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickAutofill}
                  className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/60 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-semibold text-[#465FFF] dark:text-[#80CAEE] hover:bg-blue-100/60 transition-colors shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#465FFF] dark:text-[#80CAEE]" />
                  <span>Fill Sample Data</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(getBlankForm());
                    setHistoryMatchInfo(null);
                  }}
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* SECTION 1: PASSENGER PROFILE & IDENTIFICATION (START WITH THIS AS NUMBER 1, ID TYPE FIRST) */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#465FFF] text-white text-[11px]">1</span>
                    <span>Passenger Profile &amp; Identification</span>
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    ID lookup auto-populates previous travellers
                  </span>
                </div>

                {/* ID Type (First Input) & ID Number (Second Input with auto-lookup) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Identity Document (ID) Type *
                    </label>
                    <select
                      id="passenger-id-type-select"
                      value={formData.idType || 'National Identity Card'}
                      onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
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

                  <div className="relative">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      ID / Passport Number *
                    </label>
                    <div className="relative">
                      <input
                        id="passenger-id-number-input"
                        type="text"
                        required
                        placeholder="e.g. NIN-CM-91823719 or PAS-SE-882910"
                        value={formData.idPassportNumber}
                        onChange={(e) => handleIdNumberChange(e.target.value)}
                        onFocus={() => setShowIdSuggestions(true)}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                      />
                      {historyMatchInfo && (
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-[10px] font-bold">Found</span>
                        </div>
                      )}
                    </div>

                    {/* Autocomplete suggestions dropdown when typing ID */}
                    {showIdSuggestions && formData.idPassportNumber && formData.idPassportNumber.length >= 2 && (
                      <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xl text-xs">
                        <div className="p-2 border-b border-gray-100 dark:border-[#2E3A47] text-[10px] font-semibold text-gray-400">
                          Previous Travellers Matching &quot;{formData.idPassportNumber}&quot;
                        </div>
                        {Array.from(
                          new Map(
                            passengersList
                              .filter(
                                (p) =>
                                  p.idPassportNumber?.toLowerCase().includes(formData.idPassportNumber?.toLowerCase() || '') ||
                                  p.fullName?.toLowerCase().includes(formData.idPassportNumber?.toLowerCase() || '')
                              )
                              .map((p) => [p.idPassportNumber, p])
                          ).values()
                        ).map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectExistingTraveller(p)}
                            className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-[#24303F] border-b border-gray-50 dark:border-[#2E3A47]/40 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {p.fullName}
                              </div>
                              <div className="text-[11px] font-mono text-gray-500 dark:text-gray-400">
                                {p.idPassportNumber} • {p.nationality}
                              </div>
                            </div>
                            <span className="rounded bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-semibold text-[#465FFF] dark:text-[#80CAEE]">
                              Auto-populate
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* History Match Alert Banner */}
                {historyMatchInfo && (
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 p-3 flex items-start gap-2.5 text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-bold">
                        Previous Traveller Record Found: {historyMatchInfo.name}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Completed {historyMatchInfo.travelCount} previous voyage{historyMatchInfo.travelCount > 1 ? 's' : ''} (Last on {historyMatchInfo.lastVoyage} — {historyMatchInfo.lastRoute}). Personal profile, nationality, and contact details have been auto-populated.
                      </div>
                    </div>
                  </div>
                )}

                {/* Passenger Name, Nationality & Country Code */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Passenger Full Name *
                    </label>
                    <input
                      id="passenger-fullname-input"
                      type="text"
                      required
                      placeholder="e.g. Ronald Mugisha"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Nationality
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Uganda"
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Country Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. UG"
                      value={formData.nationalityCode}
                      onChange={(e) => setFormData({ ...formData, nationalityCode: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono uppercase focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Gender & Age Category */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value as PassengerManifestRecord['gender'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {genderLookups.length > 0 ? (
                        genderLookups.map((item) => (
                          <option key={item.id} value={item.label}>
                            {item.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Age Category
                    </label>
                    <select
                      value={formData.ageCategory}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ageCategory: e.target.value as PassengerManifestRecord['ageCategory'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {categoryLookups.length > 0 ? (
                        categoryLookups.map((item) => (
                          <option key={item.id} value={item.label}>
                            {item.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Adult">Adult (18+)</option>
                          <option value="Child">Child (2-12 yrs)</option>
                          <option value="Infant">Infant (&lt;2 yrs)</option>
                          <option value="Senior">Senior (65+)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CONTACT INFORMATION (SECOND AFTER PASSENGER PROFILE) */}
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
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Contact Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. passenger@email.com"
                      value={formData.contactEmail || ''}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Emergency Contact (Name &amp; Phone / Kin)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Mugisha (+256 701 987654)"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Special Assistance / Medical Alert (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Wheelchair assistance, Medical companion, Dietary alert"
                      value={formData.specialAssistance || ''}
                      onChange={(e) => setFormData({ ...formData, specialAssistance: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: BAGGAGE & RO-PAX VEHICLE */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#465FFF] text-white text-[11px]">3</span>
                  <span>Baggage &amp; Accompanying Vehicle (Ro-Pax)</span>
                </h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Cabin / Deck / Seat Assignment
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Deck 2 / Seat 42 or Cabin 302"
                      value={formData.cabinDeck}
                      onChange={(e) => setFormData({ ...formData, cabinDeck: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Baggage Pieces
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={formData.baggageCount}
                      onChange={(e) => setFormData({ ...formData, baggageCount: Number(e.target.value) })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Total Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={formData.baggageWeightKg}
                      onChange={(e) => setFormData({ ...formData, baggageWeightKg: Number(e.target.value) })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle License Plate (Ro-Pax)
                    </label>
                    <input
                      type="text"
                      placeholder="Optional (e.g. UBJ 892K or SGA-8891-A)"
                      value={formData.vehiclePlate || ''}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type / Model
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Pickup / Isuzu D-Max, SUV, Sedan"
                      value={formData.vehicleType || ''}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: VOYAGE & TRAVEL ROUTE (VOYAGE IS LAST) */}
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
                      id="passenger-voyage-select"
                      value={formData.voyageNumber}
                      onChange={(e) => handleVoyageChange(e.target.value)}
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
                      Initial Boarding Status
                    </label>
                    <select
                      id="passenger-status-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as PassengerManifestRecord['status'],
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    >
                      {statusLookups.length > 0 ? (
                        statusLookups.map((item) => (
                          <option key={item.id} value={item.label}>
                            {item.label}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Boarded / Embarked">Boarded / Embarked</option>
                          <option value="Booked">Booked</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Disembarked">Disembarked</option>
                          <option value="No Show">No Show</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Route Summary */}
                <div className="rounded-lg bg-blue-50/70 dark:bg-blue-900/20 p-2.5 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-[#465FFF] dark:text-[#80CAEE]" />
                    <span className="font-semibold">{formData.vesselName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>{formData.departurePort}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#465FFF] dark:text-[#80CAEE]" />
                    <span>{formData.arrivalPort}</span>
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
                  id="submit-register-passenger-btn"
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
                >
                  Save Passenger to Manifest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ==================================================== */}
      {/* 8. SMS SELF CHECK-IN SIMULATOR MODAL                 */}
      {/* ==================================================== */}
      <SmsSelfCheckInModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        passengersList={passengersList}
        voyagesList={actualVoyages}
        vesselsList={actualVessels}
        lookupItems={allLookups}
        onAddPassenger={onAddPassenger}
        onAddCargo={onAddCargo}
        onShowToast={onShowToast}
      />
    </div>
  );
};
