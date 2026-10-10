import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Search,
  Plus,
  Filter,
  Ship,
  Building2,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Compass,
  Wrench,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Trash2,
  Edit,
  ExternalLink,
  ChevronDown,
  Eye,
  SlidersHorizontal,
  Flame,
  Droplets,
  HeartPulse,
  Radio,
  Sparkles,
  Download,
  Check,
} from 'lucide-react';
import {
  IncidentRecord,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  IncidentCategory,
  Vessel,
  VoyageRecord,
  StaffMember,
  WaterBody,
  PortRecord,
} from '../types';
import { IncidentDetailView } from './IncidentDetailView';

interface IncidentsTableProps {
  incidents: IncidentRecord[];
  vessels: Vessel[];
  voyages: VoyageRecord[];
  staffList: StaffMember[];
  waterBodies: WaterBody[];
  ports: PortRecord[];
  initialIncidentId?: string | null;
  onAddIncident: (incident: IncidentRecord) => void;
  onUpdateIncident: (incident: IncidentRecord) => void;
  onDeleteIncident: (id: string) => void;
  onShowToast?: (message: string) => void;
  onNavigateHome?: () => void;
}

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'Machinery & Technical Failure',
  'Navigation & Collision Risk',
  'Cargo Damage & Shifting',
  'Occupational Health & Safety',
  'Environmental & Pollution',
  'Port & Mooring Infrastructure',
  'Fire & Smoke Alarm',
  'Security & Access Breach',
  'Electrical & Power Outage',
  'Medical Emergency',
  'Weather & Heavy Sea Impact',
  'Other / Operational',
];

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  incidents = [],
  vessels = [],
  voyages = [],
  staffList = [],
  waterBodies = [],
  ports = [],
  initialIncidentId,
  onAddIncident,
  onUpdateIncident,
  onDeleteIncident,
  onShowToast,
  onNavigateHome,
}) => {
  // Page-based Navigation State (Incident Reply & Case Investigation view)
  const [activeIncidentId, setActiveIncidentId] = useState<string | null>(initialIncidentId || null);

  useEffect(() => {
    if (initialIncidentId) {
      setActiveIncidentId(initialIncidentId);
    }
  }, [initialIncidentId]);

  // Filter & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Voyage' | 'Non voyage'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'severity' | 'code'>('date-desc');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<IncidentRecord | null>(null);
  const [viewingIncident, setViewingIncident] = useState<IncidentRecord | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const generateNextIncidentCode = () => {
    const numbers = incidents
      .map((inc) => {
        const match = inc.incidentCode.match(/INC-\d{4}-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
    return `INC-2026-${String(nextNum).padStart(3, '0')}`;
  };

  const [formData, setFormData] = useState<{
    incidentCode: string;
    type: IncidentType;
    title: string;
    category: IncidentCategory | string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    reportedDate: string;
    reportedTime: string;
    reporterType: 'Staff' | 'Non-staff';
    reportedBy: string;
    reporterPhone: string;
    reporterRole: string;
    reporterEmail: string;
    immediateActionsTaken: string;
    rootCause: string;
    correctiveMeasures: string;
    voyageNumber: string;
    vesselId: string;
    vesselName: string;
    waterBody: string;
    departurePort: string;
    arrivalPort: string;
    locationCoordinates: string;
    seaCondition: string;
    facilityLocation: string;
    department: string;
    equipmentInvolved: string;
    injuriesCount: number;
    pollutionInvolved: boolean;
    estimatedCostUSD: string;
  }>({
    incidentCode: generateNextIncidentCode(),
    type: 'Voyage',
    title: '',
    category: 'Machinery & Technical Failure',
    description: '',
    severity: 'Medium',
    status: 'Reported',
    reportedDate: new Date().toISOString().split('T')[0],
    reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    reporterType: 'Staff',
    reportedBy: staffList[0]?.fullName || '',
    reporterPhone: staffList[0]?.phone || '',
    reporterRole: staffList[0]?.role || 'Safety Officer',
    reporterEmail: staffList[0]?.email || '',
    immediateActionsTaken: '',
    rootCause: '',
    correctiveMeasures: '',
    voyageNumber: voyages[0]?.voyageNumber || '',
    vesselId: voyages[0]?.vesselId || vessels[0]?.id || '',
    vesselName: voyages[0]?.vesselName || vessels[0]?.name || '',
    waterBody: voyages[0]?.waterBody || waterBodies[0]?.name || '',
    departurePort: voyages[0]?.departurePort || ports[0]?.name || '',
    arrivalPort: voyages[0]?.arrivalPort || ports[1]?.name || '',
    locationCoordinates: '',
    seaCondition: 'Moderate (Beaufort 3-4)',
    facilityLocation: 'Port of Rotterdam - RoRo Terminal Berth 4',
    department: 'Port Terminal Operations',
    equipmentInvolved: '',
    injuriesCount: 0,
    pollutionInvolved: false,
    estimatedCostUSD: '$0',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const resetForm = () => {
    const defaultStaff = staffList[0];
    const defaultVessel = vessels[0];
    const defaultVoyage = voyages.find(
      (voy) => voy.vesselId === defaultVessel?.id || voy.vesselName.toLowerCase() === defaultVessel?.name.toLowerCase()
    ) || voyages[0];

    setFormData({
      incidentCode: generateNextIncidentCode(),
      type: 'Voyage',
      title: '',
      category: 'Machinery & Technical Failure',
      description: '',
      severity: 'Medium',
      status: 'Reported',
      reportedDate: new Date().toISOString().split('T')[0],
      reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      reporterType: 'Staff',
      reportedBy: defaultStaff?.fullName || '',
      reporterPhone: defaultStaff?.phone || '',
      reporterRole: defaultStaff?.role || 'Safety Officer',
      reporterEmail: defaultStaff?.email || '',
      immediateActionsTaken: '',
      rootCause: '',
      correctiveMeasures: '',
      voyageNumber: defaultVoyage?.voyageNumber || '',
      vesselId: defaultVessel?.id || '',
      vesselName: defaultVessel?.name || '',
      waterBody: defaultVoyage?.waterBody || defaultVessel?.waterBody || waterBodies[0]?.name || '',
      departurePort: defaultVoyage?.departurePort || ports[0]?.name || '',
      arrivalPort: defaultVoyage?.arrivalPort || ports[1]?.name || '',
      locationCoordinates: defaultVessel?.currentLocation || '',
      seaCondition: 'Moderate (Beaufort 3-4)',
      facilityLocation: 'Port of Rotterdam - RoRo Terminal Berth 4',
      department: 'Port Terminal Operations',
      equipmentInvolved: '',
      injuriesCount: 0,
      pollutionInvolved: false,
      estimatedCostUSD: '$0',
    });
    setEditingIncident(null);
    setFormErrors({});
  };

  const handleOpenAddModal = (defaultType?: IncidentType) => {
    resetForm();
    if (defaultType) {
      setFormData((prev) => ({
        ...prev,
        type: defaultType,
        incidentCode: generateNextIncidentCode(),
      }));
    }
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (incident: IncidentRecord) => {
    setEditingIncident(incident);
    const isKnownStaff = staffList.some((s) => s.fullName === incident.reportedBy);
    setFormData({
      incidentCode: incident.incidentCode,
      type: incident.type,
      title: incident.title,
      category: incident.category,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      reportedDate: incident.reportedDate,
      reportedTime: incident.reportedTime,
      reporterType: incident.reporterType || (isKnownStaff ? 'Staff' : 'Non-staff'),
      reportedBy: incident.reportedBy,
      reporterPhone: incident.reporterPhone || (isKnownStaff ? staffList.find(s => s.fullName === incident.reportedBy)?.phone || '' : ''),
      reporterRole: incident.reporterRole,
      reporterEmail: incident.reporterEmail || '',
      immediateActionsTaken: incident.immediateActionsTaken || '',
      rootCause: incident.rootCause || '',
      correctiveMeasures: incident.correctiveMeasures || '',
      voyageNumber: incident.voyageNumber || '',
      vesselId: incident.vesselId || '',
      vesselName: incident.vesselName || '',
      waterBody: incident.waterBody || '',
      departurePort: incident.departurePort || '',
      arrivalPort: incident.arrivalPort || '',
      locationCoordinates: incident.locationCoordinates || '',
      seaCondition: incident.seaCondition || 'Moderate (Beaufort 3-4)',
      facilityLocation: incident.facilityLocation || '',
      department: incident.department || '',
      equipmentInvolved: incident.equipmentInvolved || '',
      injuriesCount: incident.injuriesCount || 0,
      pollutionInvolved: incident.pollutionInvolved || false,
      estimatedCostUSD: incident.estimatedCostUSD || '$0',
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.incidentCode.trim()) errors.incidentCode = 'Incident Code is required';
    if (!formData.title.trim()) errors.title = 'Incident title / headline is required';
    if (!formData.description.trim()) errors.description = 'Incident description is required';
    if (!formData.reportedBy.trim()) errors.reportedBy = 'Reporter name is required';
    if (!formData.reportedDate) errors.reportedDate = 'Date is required';

    if (formData.reporterType === 'Non-staff') {
      if (!formData.reporterPhone.trim()) {
        errors.reporterPhone = 'Phone number is required for non-staff reporters';
      }
    }

    if (formData.type === 'Voyage') {
      if (!formData.vesselName.trim()) errors.vesselName = 'Vessel name is required for Voyage incidents';
    } else {
      if (!formData.facilityLocation.trim()) errors.facilityLocation = 'Facility / Shore location is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingIncident) {
      const updated: IncidentRecord = {
        ...editingIncident,
        incidentCode: formData.incidentCode.trim(),
        type: formData.type,
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        severity: formData.severity,
        status: formData.status,
        reportedDate: formData.reportedDate,
        reportedTime: formData.reportedTime,
        reporterType: formData.reporterType,
        reportedBy: formData.reportedBy.trim(),
        reporterPhone: formData.reporterPhone.trim(),
        reporterRole: formData.reporterRole.trim(),
        reporterEmail: formData.reporterEmail.trim(),
        immediateActionsTaken: formData.immediateActionsTaken.trim(),
        rootCause: editingIncident.rootCause || formData.rootCause?.trim() || '',
        correctiveMeasures: editingIncident.correctiveMeasures || formData.correctiveMeasures?.trim() || '',
        voyageNumber: formData.type === 'Voyage' ? formData.voyageNumber : undefined,
        vesselId: formData.type === 'Voyage' ? formData.vesselId : undefined,
        vesselName: formData.type === 'Voyage' ? formData.vesselName : undefined,
        waterBody: formData.type === 'Voyage' ? formData.waterBody : undefined,
        departurePort: formData.type === 'Voyage' ? formData.departurePort : undefined,
        arrivalPort: formData.type === 'Voyage' ? formData.arrivalPort : undefined,
        locationCoordinates: formData.type === 'Voyage' ? formData.locationCoordinates : undefined,
        seaCondition: formData.type === 'Voyage' ? formData.seaCondition : undefined,
        facilityLocation: formData.type === 'Non voyage' ? formData.facilityLocation : undefined,
        department: formData.type === 'Non voyage' ? formData.department : undefined,
        equipmentInvolved: formData.type === 'Non voyage' ? formData.equipmentInvolved : undefined,
        injuriesCount: Number(formData.injuriesCount) || 0,
        pollutionInvolved: Boolean(formData.pollutionInvolved),
        estimatedCostUSD: formData.estimatedCostUSD.trim() || '$0',
      };
      onUpdateIncident(updated);
    } else {
      const newIncident: IncidentRecord = {
        id: `INC-${Date.now()}`,
        incidentCode: formData.incidentCode.trim(),
        type: formData.type,
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        severity: formData.severity,
        status: formData.status,
        reportedDate: formData.reportedDate,
        reportedTime: formData.reportedTime,
        reporterType: formData.reporterType,
        reportedBy: formData.reportedBy.trim(),
        reporterPhone: formData.reporterPhone.trim(),
        reporterRole: formData.reporterRole.trim(),
        reporterEmail: formData.reporterEmail.trim(),
        immediateActionsTaken: formData.immediateActionsTaken.trim(),
        rootCause: '',
        correctiveMeasures: '',
        voyageNumber: formData.type === 'Voyage' ? formData.voyageNumber : undefined,
        vesselId: formData.type === 'Voyage' ? formData.vesselId : undefined,
        vesselName: formData.type === 'Voyage' ? formData.vesselName : undefined,
        waterBody: formData.type === 'Voyage' ? formData.waterBody : undefined,
        departurePort: formData.type === 'Voyage' ? formData.departurePort : undefined,
        arrivalPort: formData.type === 'Voyage' ? formData.arrivalPort : undefined,
        locationCoordinates: formData.type === 'Voyage' ? formData.locationCoordinates : undefined,
        seaCondition: formData.type === 'Voyage' ? formData.seaCondition : undefined,
        facilityLocation: formData.type === 'Non voyage' ? formData.facilityLocation : undefined,
        department: formData.type === 'Non voyage' ? formData.department : undefined,
        equipmentInvolved: formData.type === 'Non voyage' ? formData.equipmentInvolved : undefined,
        injuriesCount: Number(formData.injuriesCount) || 0,
        pollutionInvolved: Boolean(formData.pollutionInvolved),
        estimatedCostUSD: formData.estimatedCostUSD.trim() || '$0',
        attachmentsCount: 1,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddIncident(newIncident);
    }

    setIsFormOpen(false);
    resetForm();
  };

  // Helper when selecting a vessel name: auto-links the active voyage and routing metadata
  const handleSelectVessel = (selectedVesselName: string) => {
    const vObj = vessels.find((v) => v.name === selectedVesselName || v.id === selectedVesselName);
    if (!vObj) {
      setFormData((prev) => ({
        ...prev,
        vesselName: selectedVesselName,
        vesselId: '',
        voyageNumber: '',
        waterBody: '',
        departurePort: '',
        arrivalPort: '',
      }));
      return;
    }

    // Auto-link active or scheduled voyage for this vessel from voyage database
    const matchedVoyage = voyages.find(
      (voy) => voy.vesselId === vObj.id || voy.vesselName.toLowerCase() === vObj.name.toLowerCase()
    );

    setFormData((prev) => ({
      ...prev,
      vesselName: vObj.name,
      vesselId: vObj.id,
      voyageNumber: matchedVoyage?.voyageNumber || '',
      waterBody: matchedVoyage?.waterBody || vObj.waterBody || prev.waterBody || 'Strait of Malacca & Singapore Strait',
      departurePort: matchedVoyage?.departurePort || (vObj.operationPorts && vObj.operationPorts[0]) || 'Port of Singapore',
      arrivalPort: matchedVoyage?.arrivalPort || vObj.destination || 'Port of Rotterdam',
      locationCoordinates: matchedVoyage?.currentCoordinates || vObj.currentLocation || '',
      seaCondition: matchedVoyage?.seaCondition || prev.seaCondition || 'Moderate (Beaufort 3-4)',
    }));
  };

  // Helper when selecting reporter from staff list
  const handleSelectStaffReporter = (staffIdOrName: string) => {
    const matched = staffList.find(
      (s) => s.fullName === staffIdOrName || s.staffId === staffIdOrName || s.id === staffIdOrName
    );
    if (matched) {
      setFormData((prev) => ({
        ...prev,
        reporterType: 'Staff',
        reportedBy: matched.fullName,
        reporterPhone: matched.phone || '',
        reporterRole: matched.role,
        reporterEmail: matched.email,
        department: matched.department || prev.department,
      }));
    } else {
      setFormData((prev) => ({ ...prev, reportedBy: staffIdOrName }));
    }
  };

  // Filtered & Sorted Incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Type Filter
      if (typeFilter !== 'All' && inc.type !== typeFilter) return false;
      // Category Filter
      if (categoryFilter !== 'All' && inc.category !== categoryFilter) return false;
      // Severity Filter
      if (severityFilter !== 'All' && inc.severity !== severityFilter) return false;
      // Status Filter
      if (statusFilter !== 'All' && inc.status !== statusFilter) return false;
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const codeMatch = inc.incidentCode.toLowerCase().includes(q);
        const titleMatch = inc.title.toLowerCase().includes(q);
        const descMatch = inc.description.toLowerCase().includes(q);
        const reporterMatch = inc.reportedBy.toLowerCase().includes(q);
        const vesselMatch = inc.vesselName?.toLowerCase().includes(q);
        const facilityMatch = inc.facilityLocation?.toLowerCase().includes(q);
        const categoryMatch = inc.category.toLowerCase().includes(q);
        return (
          codeMatch ||
          titleMatch ||
          descMatch ||
          reporterMatch ||
          vesselMatch ||
          facilityMatch ||
          categoryMatch
        );
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        return (b.reportedDate + b.reportedTime).localeCompare(a.reportedDate + a.reportedTime);
      }
      if (sortBy === 'date-asc') {
        return (a.reportedDate + a.reportedTime).localeCompare(b.reportedDate + b.reportedTime);
      }
      if (sortBy === 'code') {
        return b.incidentCode.localeCompare(a.incidentCode);
      }
      if (sortBy === 'severity') {
        const severityRank = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0);
      }
      return 0;
    });
  }, [incidents, typeFilter, categoryFilter, severityFilter, statusFilter, searchTerm, sortBy]);

  // KPI Metrics
  const totalIncidents = incidents.length;
  const voyageCount = incidents.filter((i) => i.type === 'Voyage').length;
  const nonVoyageCount = incidents.filter((i) => i.type === 'Non voyage').length;
  const criticalHighCount = incidents.filter(
    (i) => i.severity === 'Critical' || i.severity === 'High'
  ).length;
  const activeOpenCount = incidents.filter(
    (i) => i.status === 'Reported' || i.status === 'Under Investigation' || i.status === 'Corrective Action'
  ).length;

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50';
      case 'Low':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Reported':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40';
      case 'Under Investigation':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40';
      case 'Corrective Action':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40';
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40';
      case 'Closed':
        return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Active selected incident for dedicated Reply & Case page view
  const activeIncident = useMemo(() => {
    if (!activeIncidentId) return null;
    return incidents.find((i) => i.id === activeIncidentId) || null;
  }, [incidents, activeIncidentId]);

  return (
    <div id="incidents-management-view" className="space-y-6">
      {activeIncident ? (
        <IncidentDetailView
          incident={activeIncident}
          allIncidents={incidents}
          onBack={() => setActiveIncidentId(null)}
          onNavigateHome={onNavigateHome}
          onUpdateIncident={onUpdateIncident}
          onOpenEditModal={(inc) => handleOpenEditModal(inc)}
          onShowToast={onShowToast}
          onSelectIncidentById={(id) => setActiveIncidentId(id)}
        />
      ) : (
        <>
          {/* Top Header & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Incidents & Safety Register
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Report and track Voyage (at-sea / route) and Non voyage (port / terminal / shore facility) safety and technical incidents.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Filter Buttons */}
          <div className="flex rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-1 shadow-2xs">
            <button
              onClick={() => setTypeFilter('All')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === 'All'
                  ? 'bg-[#465FFF] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All ({incidents.length})
            </button>
            <button
              onClick={() => setTypeFilter('Voyage')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === 'Voyage'
                  ? 'bg-[#465FFF] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Ship className="h-3.5 w-3.5" />
              <span>Voyage ({voyageCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter('Non voyage')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === 'Non voyage'
                  ? 'bg-[#465FFF] text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Non voyage ({nonVoyageCount})</span>
            </button>
          </div>

          {/* Report Incident Main Button */}
          <button
            id="report-incident-btn"
            onClick={() => handleOpenAddModal()}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition-colors focus:ring-2 focus:ring-red-500/30"
          >
            <Plus className="h-4 w-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Total Incidents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-[#24303F] text-gray-700 dark:text-gray-300">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{totalIncidents}</div>
          <span className="mt-1 block text-[11px] text-gray-400">Total logged records</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Voyage Incidents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Ship className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{voyageCount}</div>
          <span className="mt-1 block text-[11px] text-blue-600/80 dark:text-blue-400/80">At sea / vessel transit</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Non Voyage Incidents</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{nonVoyageCount}</div>
          <span className="mt-1 block text-[11px] text-emerald-600/80 dark:text-emerald-400/80">Port, shore & terminal</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Critical & High</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{criticalHighCount}</div>
          <span className="mt-1 block text-[11px] text-red-600/80 dark:text-red-400/80">High priority alerts</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Active Investigation</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{activeOpenCount}</div>
          <span className="mt-1 block text-[11px] text-amber-600/80 dark:text-amber-400/80">Under action / open</span>
        </div>
      </div>

      {/* Main Table Card & Filters */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-[#2E3A47] p-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by code, title, description, vessel, location, reporter..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 pl-9.5 pr-4 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
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

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="All">All Categories ({INCIDENT_CATEGORIES.length})</option>
              {INCIDENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Corrective Action">Corrective Action</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="severity">Highest Severity</option>
              <option value="code">Incident Code</option>
            </select>

            {(searchTerm || typeFilter !== 'All' || categoryFilter !== 'All' || severityFilter !== 'All' || statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('All');
                  setCategoryFilter('All');
                  setSeverityFilter('All');
                  setStatusFilter('All');
                }}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F] px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#8A99AD]">
                <th className="py-3 px-4">Incident Code</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 min-w-[220px]">Title & Description</th>
                <th className="py-3 px-4">Location / Vessel</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47] text-xs">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 dark:bg-[#24303F] text-gray-400 mb-3">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">No incidents found</h4>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-1 max-w-sm mx-auto">
                      No incident reports match the current filters. Try changing your filters or report a new incident.
                    </p>
                    <button
                      onClick={() => handleOpenAddModal()}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Report New Incident</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  return (
                    <tr
                      key={incident.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-[#24303F]/40 transition-colors group cursor-pointer"
                      onClick={() => setActiveIncidentId(incident.id)}
                    >
                      {/* Incident Code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-[#465FFF] dark:text-blue-400 whitespace-nowrap">
                        {incident.incidentCode}
                      </td>

                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                            incident.type === 'Voyage'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                          }`}
                        >
                          {incident.type === 'Voyage' ? (
                            <Ship className="h-3 w-3" />
                          ) : (
                            <Building2 className="h-3 w-3" />
                          )}
                          <span>{incident.type}</span>
                        </span>
                      </td>

                      {/* Incident Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {incident.category}
                        </span>
                      </td>

                      {/* Title & Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 dark:text-white line-clamp-1">
                          {incident.title}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] line-clamp-1 mt-0.5">
                          {incident.description}
                        </p>
                      </td>

                      {/* Location / Vessel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {incident.type === 'Voyage' ? (
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                              <Compass className="h-3 w-3 text-blue-500" />
                              <span>{incident.vesselName || 'Unassigned Vessel'}</span>
                            </div>
                            {incident.voyageNumber && (
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                Voyage: {incident.voyageNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-emerald-500" />
                              <span className="truncate max-w-[140px]">{incident.facilityLocation || 'Shore Facility'}</span>
                            </div>
                            {incident.department && (
                              <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                {incident.department}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${getSeverityBadge(
                            incident.severity
                          )}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              incident.severity === 'Critical'
                                ? 'bg-red-600 animate-pulse'
                                : incident.severity === 'High'
                                ? 'bg-amber-600'
                                : incident.severity === 'Medium'
                                ? 'bg-blue-600'
                                : 'bg-gray-500'
                            }`}
                          />
                          <span>{incident.severity}</span>
                        </span>
                      </td>

                      {/* Reported By */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {incident.reportedBy}
                          </span>
                          <span
                            className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              incident.reporterType === 'Staff'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                            }`}
                          >
                            {incident.reporterType || 'Staff'}
                          </span>
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <span>{incident.reporterRole}</span>
                          {incident.reporterPhone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
                                <Phone className="h-2.5 w-2.5" />
                                {incident.reporterPhone}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">{incident.reportedDate}</div>
                        <div className="text-[11px] text-gray-400">{incident.reportedTime}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={incident.status}
                          onChange={(e) => {
                            onUpdateIncident({
                              ...incident,
                              status: e.target.value as IncidentStatus,
                            });
                          }}
                          className={`rounded-lg px-2 py-1 text-[11px] font-bold border focus:outline-none cursor-pointer ${getStatusBadge(
                            incident.status
                          )}`}
                        >
                          <option value="Reported">Reported</option>
                          <option value="Under Investigation">Under Investigation</option>
                          <option value="Corrective Action">Corrective Action</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveIncidentId(incident.id)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
                            title="Open Incident Case & Reply"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(incident)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-[#465FFF] dark:hover:bg-[#24303F] dark:hover:text-blue-400"
                            title="Edit Incident Details"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(incident.id)}
                            className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            title="Delete Incident"
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

        {/* Footer Summary */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] px-4 py-3 text-xs text-gray-500 dark:text-[#8A99AD]">
          <span>
            Showing <strong className="text-gray-900 dark:text-white">{filteredIncidents.length}</strong> of{' '}
            <strong className="text-gray-900 dark:text-white">{incidents.length}</strong> recorded incidents
          </span>
          <span className="text-[11px] text-gray-400">
            Voyage IS Incident & Safety Auditing Subsystem
          </span>
        </div>
      </div>
    </>
  )}

      {/* ========================================================================= */}
      {/* INCIDENT REPORT & EDIT MODAL FORM                                         */}
      {/* ========================================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4 bg-gray-50/50 dark:bg-[#24303F]/50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white shadow-xs">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingIncident ? 'Edit Incident Report' : 'Report New Incident'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Select whether this incident occurred during a Voyage or at a Non-voyage shore facility.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsFormOpen(false);
                  resetForm();
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSubmitForm} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Incident Type Selector (2 Cards) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Incident Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: 'Voyage' }))}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      formData.type === 'Voyage'
                        ? 'border-[#465FFF] bg-[#465FFF]/5 ring-2 ring-[#465FFF]/20 dark:bg-[#465FFF]/15'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F]'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        formData.type === 'Voyage'
                          ? 'bg-[#465FFF] text-white'
                          : 'bg-gray-100 dark:bg-[#24303F] text-gray-500'
                      }`}
                    >
                      <Ship className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 dark:text-white">
                        <span>Voyage Incident</span>
                        {formData.type === 'Voyage' && (
                          <Check className="h-3.5 w-3.5 text-[#465FFF]" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                        Occurred underway, at anchor, sea-lane transit, or shipboard machinery.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: 'Non voyage' }))}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                      formData.type === 'Non voyage'
                        ? 'border-emerald-600 bg-emerald-500/5 ring-2 ring-emerald-500/20 dark:bg-emerald-500/15'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F]'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        formData.type === 'Non voyage'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-[#24303F] text-gray-500'
                      }`}
                    >
                      <Building2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 dark:text-white">
                        <span>Non voyage Incident</span>
                        {formData.type === 'Non voyage' && (
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                        Port terminal, quayside crane, shore workshop, logistics warehouse, or office.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section: Basic Incident Info */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/40 dark:bg-[#24303F]/30 p-4 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Incident Classification & Reference
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Incident Reference Code */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Incident Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.incidentCode}
                      onChange={(e) => setFormData({ ...formData, incidentCode: e.target.value })}
                      placeholder="e.g. INC-2026-007"
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-mono font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    />
                    {formErrors.incidentCode && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.incidentCode}</p>
                    )}
                  </div>

                  {/* Incident Category */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Incident Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    >
                      {INCIDENT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Severity Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as IncidentSeverity })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    >
                      <option value="Critical">🔴 Critical (Immediate Danger / Halt)</option>
                      <option value="High">🟠 High (Significant Impact)</option>
                      <option value="Medium">🔵 Medium (Operational Deviation)</option>
                      <option value="Low">⚪ Low (Minor Observation / Hazard)</option>
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Incident Title / Summary Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Auxiliary Diesel Generator #2 High Exhaust Temperature in Malacca Strait"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                  {formErrors.title && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.title}</p>
                  )}
                </div>

                {/* Incident Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Incident Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide detailed description of what occurred, observations, affected systems, readings, and timeline..."
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
                  />
                  {formErrors.description && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Immediate Actions Taken */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Immediate Actions & Containment Measures Taken
                  </label>
                  <textarea
                    rows={2}
                    value={formData.immediateActionsTaken}
                    onChange={(e) => setFormData({ ...formData, immediateActionsTaken: e.target.value })}
                    placeholder="e.g. Electrical bus load transferred to ADG-1; spill kit deployed immediately; engine speed reduced to safe maneuvering speed..."
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Conditional Section: Voyage vs Non-voyage Specific Details */}
              {formData.type === 'Voyage' ? (
                <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Ship className="h-4 w-4" />
                      <span>Vessel Selection & Linked Voyage</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                      <Sparkles className="h-3 w-3" /> Auto-linked
                    </span>
                  </div>

                  {/* Vessel Name Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Vessel Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="incidentFormVesselSelect"
                      value={formData.vesselName}
                      onChange={(e) => handleSelectVessel(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    >
                      <option value="">-- Select Vessel --</option>
                      {vessels.map((v) => (
                        <option key={v.id} value={v.name}>
                          {v.name} ({v.imoNumber} • {v.type} • Flag: {v.flag})
                        </option>
                      ))}
                    </select>
                    {formErrors.vesselName && (
                      <p className="text-[11px] text-red-500 mt-1">{formErrors.vesselName}</p>
                    )}
                  </div>

                  {/* Auto-Linked Voyage Information Summary */}
                  {formData.vesselName && (
                    <div className="rounded-lg border border-blue-200/60 dark:border-blue-800/40 bg-white/80 dark:bg-[#1C2434]/80 p-3 text-xs space-y-2">
                      <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-1.5">
                        <span>Linked Voyage Details</span>
                        <span className="text-[10px] text-blue-500 font-normal">Derived automatically from vessel roster</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Voyage Number</span>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {formData.voyageNumber || 'Active Voyage Assigned'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Route (Origin → Dest)</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                            {formData.departurePort || 'Port of Singapore'} → {formData.arrivalPort || 'Rotterdam'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Sea Area / Water Body</span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                            {formData.waterBody || 'Strait of Malacca'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Live Position</span>
                          <span className="font-mono text-[11px] text-gray-800 dark:text-gray-200 truncate block">
                            {formData.locationCoordinates || '01°16.4\'N, 103°38.2\'E'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <Building2 className="h-4 w-4" />
                    <span>Non-Voyage Shore & Facility Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Facility Location */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Facility / Port Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.facilityLocation}
                        onChange={(e) => setFormData({ ...formData, facilityLocation: e.target.value })}
                        placeholder="e.g. Rotterdam RoRo Quay 4 / Jurong Pier 9"
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      />
                      {formErrors.facilityLocation && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.facilityLocation}</p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Shore Department / Unit
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      >
                        <option value="Port Terminal Operations">Port Terminal Operations</option>
                        <option value="Shore Engineering & Maintenance">Shore Engineering & Maintenance</option>
                        <option value="Cargo Logistics & Warehousing">Cargo Logistics & Warehousing</option>
                        <option value="Health, Safety & Environment (HSE)">Health, Safety & Environment (HSE)</option>
                        <option value="Port Security & Access Control">Port Security & Access Control</option>
                        <option value="Fleet Headquarters & Admin">Fleet Headquarters & Admin</option>
                      </select>
                    </div>

                    {/* Equipment Involved */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Equipment / Asset Involved
                      </label>
                      <input
                        type="text"
                        value={formData.equipmentInvolved}
                        onChange={(e) => setFormData({ ...formData, equipmentInvolved: e.target.value })}
                        placeholder="e.g. Quayside Crane #3, Heavy Forklift FL-08"
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Section: Reporter Details & Classification */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/40 dark:bg-[#24303F]/30 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Reporter Identification
                  </div>

                  {/* Staff vs Non-staff Toggle Switch */}
                  <div className="flex items-center bg-gray-200/80 dark:bg-[#1C2434] p-0.5 rounded-lg text-xs">
                    <button
                      type="button"
                      id="reporterTypeStaffBtn"
                      onClick={() => {
                        const defaultStaff = staffList[0];
                        setFormData((prev) => ({
                          ...prev,
                          reporterType: 'Staff',
                          reportedBy: defaultStaff?.fullName || '',
                          reporterPhone: defaultStaff?.phone || '',
                          reporterRole: defaultStaff?.role || 'Safety Officer',
                          reporterEmail: defaultStaff?.email || '',
                        }));
                      }}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        formData.reporterType === 'Staff'
                          ? 'bg-white dark:bg-[#465FFF] text-[#465FFF] dark:text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Staff Member
                    </button>
                    <button
                      type="button"
                      id="reporterTypeNonStaffBtn"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          reporterType: 'Non-staff',
                          reportedBy: prev.reporterType === 'Staff' ? '' : prev.reportedBy,
                          reporterPhone: prev.reporterType === 'Staff' ? '' : prev.reporterPhone,
                          reporterRole: prev.reporterType === 'Staff' ? 'Third-Party Contractor' : prev.reporterRole,
                          reporterEmail: prev.reporterType === 'Staff' ? '' : prev.reporterEmail,
                        }));
                      }}
                      className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                        formData.reporterType === 'Non-staff'
                          ? 'bg-white dark:bg-[#465FFF] text-[#465FFF] dark:text-white shadow-xs'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Non-staff (Third-Party / Public)
                    </button>
                  </div>
                </div>

                {/* Conditional Reporter Input Fields */}
                {formData.reporterType === 'Staff' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Select Staff Member Name <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="incidentStaffSelect"
                        value={formData.reportedBy}
                        onChange={(e) => handleSelectStaffReporter(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      >
                        <option value="">-- Select Staff Member --</option>
                        {staffList.map((s) => (
                          <option key={s.id} value={s.fullName}>
                            {s.fullName} ({s.role} • {s.department || s.staffType})
                          </option>
                        ))}
                      </select>
                      {formErrors.reportedBy && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.reportedBy}</p>
                      )}
                    </div>

                    {/* Staff Profile Auto-Linked Summary */}
                    {formData.reportedBy && (
                      <div className="rounded-lg border border-gray-200/70 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3 text-xs flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-[#465FFF]/10 text-[#465FFF] font-bold text-xs flex items-center justify-center">
                            {formData.reportedBy.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">{formData.reportedBy}</span>
                            <span className="text-[11px] text-gray-400 block">{formData.reporterRole}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
                          {formData.reporterPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-blue-500" />
                              {formData.reporterPhone}
                            </span>
                          )}
                          {formData.reporterEmail && (
                            <span className="text-gray-400">{formData.reporterEmail}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Non-staff Name */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Reporter Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          id="incidentNonStaffName"
                          value={formData.reportedBy}
                          onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
                          placeholder="e.g. Johnathan Doe"
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        />
                      </div>
                      {formErrors.reportedBy && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.reportedBy}</p>
                      )}
                    </div>

                    {/* Non-staff Phone Number */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                          type="tel"
                          id="incidentNonStaffPhone"
                          value={formData.reporterPhone}
                          onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                          placeholder="e.g. +31 10 555 0192"
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                        />
                      </div>
                      {formErrors.reporterPhone && (
                        <p className="text-[11px] text-red-500 mt-1">{formErrors.reporterPhone}</p>
                      )}
                    </div>

                    {/* Non-staff Organization / Role */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Organization / Affiliation
                      </label>
                      <input
                        type="text"
                        id="incidentNonStaffRole"
                        value={formData.reporterRole}
                        onChange={(e) => setFormData({ ...formData, reporterRole: e.target.value })}
                        placeholder="e.g. Stevedore Contractor / Pilot"
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      />
                    </div>

                    {/* Non-staff Email */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        id="incidentNonStaffEmail"
                        value={formData.reporterEmail}
                        onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                        placeholder="e.g. j.doe@contractor.com"
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Occurrence Date, Time, Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-200/50 dark:border-[#2E3A47]/50">
                  {/* Occurrence Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Occurrence Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.reportedDate}
                      onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    />
                  </div>

                  {/* Occurrence Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Occurrence Time
                    </label>
                    <input
                      type="time"
                      value={formData.reportedTime}
                      onChange={(e) => setFormData({ ...formData, reportedTime: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    />
                  </div>

                  {/* Investigation Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Initial Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as IncidentStatus })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    >
                      <option value="Reported">Reported</option>
                      <option value="Under Investigation">Under Investigation</option>
                      <option value="Corrective Action">Corrective Action</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Checkbox Flags & Numeric Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200/50 dark:border-[#2E3A47]/50">
                  {/* Injuries Count */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Injuries Reported (Count)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.injuriesCount}
                      onChange={(e) => setFormData({ ...formData, injuriesCount: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    />
                  </div>

                  {/* Pollution Involved Toggle */}
                  <div className="flex items-center gap-3 pt-4">
                    <input
                      type="checkbox"
                      id="pollutionInvolvedCheckbox"
                      checked={formData.pollutionInvolved}
                      onChange={(e) => setFormData({ ...formData, pollutionInvolved: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <label htmlFor="pollutionInvolvedCheckbox" className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Environmental / Oil Spill Involved
                    </label>
                  </div>

                  {/* Estimated Cost */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Cost / Damage (USD)
                    </label>
                    <input
                      type="text"
                      value={formData.estimatedCostUSD}
                      onChange={(e) => setFormData({ ...formData, estimatedCostUSD: e.target.value })}
                      placeholder="e.g. $2,500 or Minor"
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700 transition-colors"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>{editingIncident ? 'Update Incident Record' : 'Save & Submit Incident Report'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INCIDENT DETAILS VIEW MODAL (Investigation & Audit Layout)                */}
      {/* ========================================================================= */}
      {viewingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4 bg-gray-50/50 dark:bg-[#24303F]/50">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-xs ${
                    viewingIncident.type === 'Voyage' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  {viewingIncident.type === 'Voyage' ? <Ship className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#465FFF] dark:text-blue-400">
                      {viewingIncident.incidentCode}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${getSeverityBadge(
                        viewingIncident.severity
                      )}`}
                    >
                      {viewingIncident.severity}
                    </span>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${getStatusBadge(
                        viewingIncident.status
                      )}`}
                    >
                      {viewingIncident.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                    {viewingIncident.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = viewingIncident;
                    setViewingIncident(null);
                    handleOpenEditModal(target);
                  }}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-2.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setViewingIncident(null)}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Type & Category Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Incident Type</span>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{viewingIncident.type}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Incident Category</span>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{viewingIncident.category}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Occurrence Date & Time</span>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {viewingIncident.reportedDate} at {viewingIncident.reportedTime}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400">Est. Damage Cost</span>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">
                    {viewingIncident.estimatedCostUSD || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">
                  Detailed Incident Description
                </h4>
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                  {viewingIncident.description}
                </div>
              </div>

              {/* Location & Context */}
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px] mb-1.5">
                  {viewingIncident.type === 'Voyage' ? 'Voyage & Nautical Context' : 'Shore Facility & Asset Location'}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]">
                  {viewingIncident.type === 'Voyage' ? (
                    <>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Vessel</span>
                        <div className="font-bold text-gray-900 dark:text-white">{viewingIncident.vesselName || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Voyage Code</span>
                        <div className="font-bold text-[#465FFF]">{viewingIncident.voyageNumber || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Water Body / Sea Area</span>
                        <div className="font-bold text-gray-900 dark:text-white">{viewingIncident.waterBody || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Route</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {viewingIncident.departurePort || '—'} → {viewingIncident.arrivalPort || '—'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">GPS Coordinates</span>
                        <div className="font-mono text-gray-700 dark:text-gray-300">{viewingIncident.locationCoordinates || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Sea State</span>
                        <div className="text-gray-700 dark:text-gray-300">{viewingIncident.seaCondition || 'N/A'}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Shore Facility Location</span>
                        <div className="font-bold text-gray-900 dark:text-white">{viewingIncident.facilityLocation || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Department</span>
                        <div className="font-bold text-gray-900 dark:text-white">{viewingIncident.department || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] uppercase">Equipment / Asset</span>
                        <div className="font-bold text-gray-900 dark:text-white">{viewingIncident.equipmentInvolved || 'N/A'}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Actions & Root Cause */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Immediate Actions Taken
                  </span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {viewingIncident.immediateActionsTaken || 'No immediate containment remarks recorded.'}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Root Cause & Preventative Measures
                  </span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {viewingIncident.rootCause ? `Root Cause: ${viewingIncident.rootCause}` : ''}
                    {viewingIncident.correctiveMeasures ? `\n\nCorrective Action: ${viewingIncident.correctiveMeasures}` : ''}
                    {!viewingIncident.rootCause && !viewingIncident.correctiveMeasures && 'Investigation underway.'}
                  </p>
                </div>
              </div>

              {/* Reporter Info */}
              <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#465FFF]/10 text-[#465FFF] font-bold text-xs">
                    {viewingIncident.reportedBy.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{viewingIncident.reportedBy}</span>
                      <span
                        className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          viewingIncident.reporterType === 'Staff'
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                        }`}
                      >
                        {viewingIncident.reporterType || 'Staff'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span>{viewingIncident.reporterRole}</span>
                      {viewingIncident.reporterPhone && (
                        <span className="flex items-center gap-0.5 text-gray-500 dark:text-gray-400">
                          <Phone className="h-3 w-3 text-blue-500" />
                          {viewingIncident.reporterPhone}
                        </span>
                      )}
                      {viewingIncident.reporterEmail && (
                        <span>• {viewingIncident.reporterEmail}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-gray-400">Logged on {viewingIncident.createdAt || viewingIncident.reportedDate}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-[#2E3A47] px-6 py-3.5 bg-gray-50/50 dark:bg-[#24303F]/50">
              <button
                onClick={() => setViewingIncident(null)}
                className="rounded-xl bg-gray-200 dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/50">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Delete Incident Record?</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-5">
              Are you sure you want to delete this incident report from the safety register? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteIncident(deleteConfirmId);
                  setDeleteConfirmId(null);
                  if (viewingIncident?.id === deleteConfirmId) {
                    setViewingIncident(null);
                  }
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
