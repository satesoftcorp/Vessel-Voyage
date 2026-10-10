import React, { useState } from 'react';
import { StaffMember, CrewMember, StaffType, LookupItem, Vessel } from '../types';
import { ProfileImageUploader } from './ProfileImageUploader';
import {
  Users2,
  Search,
  Filter,
  Plus,
  Camera,
  Download,
  Ship,
  UserCheck,
  Calendar,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Eye,
  Edit2,
  Trash2,
  X,
  FileCheck,
  ShieldCheck,
  Globe,
  Award,
  IdCard,
  CheckCircle2,
  Anchor,
  UserPlus,
  Briefcase,
  Building2,
  FileBadge,
  Sparkles,
} from 'lucide-react';

interface StaffProfileViewProps {
  staffList: StaffMember[];
  crewList: CrewMember[];
  vessels?: Vessel[];
  lookupItems?: LookupItem[];
  lookups?: LookupItem[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onCreateCrewFromStaff: (crew: CrewMember, updatedStaff?: StaffMember) => void;
  onNavigateToCrewRegister?: () => void;
}

const DEFAULT_DEPARTMENTS = [
  'Deck Department',
  'Engine Department',
  'Catering & Hospitality',
  'Fleet Operations',
  'Marine HR & Crewing',
  'Technical & Maintenance',
  'Safety & Quality (DPA)',
  'Port Logistics',
  'Executive Management',
];

const DEFAULT_CREW_RANKS = [
  'Master (Captain)',
  'Chief Engineer',
  'Chief Officer',
  '2nd Officer',
  '3rd Officer',
  '2nd Engineer',
  '3rd Engineer',
  'Electro-Technical Officer (ETO)',
  'Bosun',
  'Able Seaman',
  'Ordinary Seaman',
  'Cook',
  'Motorman / Oiler',
  'Deck Cadet',
];

const DEFAULT_ADMIN_ROLES = [
  'Fleet Operations Director',
  'DPA & Marine Safety Superintendent',
  'Marine HR & Crewing Director',
  'Technical Superintendent',
  'Port Logistics & Bunkering Manager',
  'Vessel Dispatcher / Agent',
  'Crewing Coordinator',
  'Quality, Health & Safety (QHSE) Lead',
  'Financial Controller',
  'Maritime IT & Telecommunications Admin',
];

const DEFAULT_VESSELS = [
  'VOYAGER TITAN',
  'PACIFIC HORIZON',
  'NORDIC VALIANT',
  'ARCTIC PIONEER',
  'OCEAN EXPLORER II',
  'STELLA MARIS',
  'BALTIC SENTINEL',
];

export const StaffProfileView: React.FC<StaffProfileViewProps> = ({
  staffList = [],
  crewList = [],
  vessels = [],
  lookupItems,
  lookups,
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
  onCreateCrewFromStaff,
  onNavigateToCrewRegister,
}) => {
  const allLookups = lookupItems || lookups || [];

  const dynamicDepartments = allLookups
    .filter((l) => (l.category === 'department' || l.categoryCode === 'department') && l.isActive !== false)
    .map((l) => l.label);
  const departments = dynamicDepartments.length > 0 ? dynamicDepartments : DEFAULT_DEPARTMENTS;

  const dynamicRanks = allLookups
    .filter((l) => (l.category === 'crew_rank' || l.categoryCode === 'crew_rank') && l.isActive !== false)
    .map((l) => l.label);
  const crewRanks = dynamicRanks.length > 0 ? dynamicRanks : DEFAULT_CREW_RANKS;

  const dynamicAdminRoles = allLookups
    .filter((l) => (l.category === 'admin_role' || l.categoryCode === 'admin_role') && l.isActive !== false)
    .map((l) => l.label);
  const adminRoles = dynamicAdminRoles.length > 0 ? dynamicAdminRoles : DEFAULT_ADMIN_ROLES;

  const dynamicCrewStatuses = allLookups
    .filter((l) => (l.category === 'crew_status' || l.categoryCode === 'crew_status' || l.category === 'deployment_status') && l.isActive !== false)
    .map((l) => l.label);
  const crewStatuses = dynamicCrewStatuses.length > 0 ? dynamicCrewStatuses : ['On Board', 'Standby', 'In Transit', 'On Leave'];

  const availableVessels = vessels && vessels.length > 0 ? vessels.map((v) => v.name) : DEFAULT_VESSELS;
  const [searchQuery, setSearchQuery] = useState('');
  const [crewFilter, setCrewFilter] = useState<'ALL' | 'CREW_ONLY' | 'NON_CREW' | 'ON_BOARD' | 'EXPIRING'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals & Details
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffMember | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEnrollCrewModalOpen, setIsEnrollCrewModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [selectedStaffToEnroll, setSelectedStaffToEnroll] = useState<StaffMember | null>(null);

  // Form state for creating / editing staff
  const [formData, setFormData] = useState<Partial<StaffMember>>({
    staffType: 'Crew',
    fullName: '',
    staffId: '',
    role: 'Master (Captain)',
    department: 'Deck Department',
    nationality: 'United Kingdom',
    nationalityCode: 'GB',
    email: '',
    phone: '',
    passportNo: '',
    seamanBookNo: '',
    certExpiry: '2029-06-30',
    medicalCertExpiry: '2027-12-15',
    status: 'Active',
    dateOfBirth: '1988-01-01',
    joiningDate: '2024-01-15',
    emergencyContact: '',
    notes: '',
    assignedVesselName: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  });

  // State for enrolling staff into Crew
  const [enrollCrewData, setEnrollCrewData] = useState<{
    rank: string;
    vesselName: string;
    seamanBookNo: string;
    status: 'On Board' | 'On Leave' | 'In Transit' | 'Standby';
    embarkDate: string;
    disembarkDate: string;
  }>({
    rank: 'Master (Captain)',
    vesselName: 'VOYAGER TITAN',
    seamanBookNo: '',
    status: 'On Board',
    embarkDate: '2026-08-01',
    disembarkDate: '2027-02-01',
  });

  // Helper to check if a staff member currently forms part of active crew
  const isMemberPartOfCrew = (staff: StaffMember): boolean => {
    return crewList.some(
      (c) =>
        c.employeeId === staff.staffId ||
        c.fullName.toLowerCase() === staff.fullName.toLowerCase() ||
        (staff.seamanBookNo && c.seamanBookNo === staff.seamanBookNo)
    );
  };

  // Helper to get linked crew member
  const getLinkedCrewMember = (staff: StaffMember): CrewMember | undefined => {
    return crewList.find(
      (c) =>
        c.employeeId === staff.staffId ||
        c.fullName.toLowerCase() === staff.fullName.toLowerCase() ||
        (staff.seamanBookNo && c.seamanBookNo === staff.seamanBookNo)
    );
  };

  // Helper to check if certs are expiring soon (< 180 days)
  const isCertExpiringSoon = (expiryDateStr?: string) => {
    if (!expiryDateStr) return false;
    const expiry = new Date(expiryDateStr);
    const now = new Date('2026-08-23');
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays < 180;
  };

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const isCrew = isMemberPartOfCrew(s);
    const linkedCrew = getLinkedCrewMember(s);

    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.passportNo && s.passportNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.seamanBookNo && s.seamanBookNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.assignedVesselName && s.assignedVesselName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (linkedCrew && linkedCrew.assignedVesselName.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesCrewFilter = true;
    if (crewFilter === 'CREW_ONLY') {
      matchesCrewFilter = isCrew || s.staffType === 'Crew';
    } else if (crewFilter === 'NON_CREW') {
      matchesCrewFilter = !isCrew && s.staffType !== 'Crew';
    } else if (crewFilter === 'ON_BOARD') {
      matchesCrewFilter = (linkedCrew && linkedCrew.status === 'On Board') || s.status === 'On Board';
    } else if (crewFilter === 'EXPIRING') {
      matchesCrewFilter = isCertExpiringSoon(s.certExpiry) || isCertExpiringSoon(s.medicalCertExpiry);
    }

    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesCrewFilter && matchesDept && matchesStatus;
  });

  // Metrics
  const totalStaffCount = staffList.length;
  const activeCrewCount = staffList.filter((s) => isMemberPartOfCrew(s) || s.status === 'On Board').length;
  const shoreStaffCount = staffList.filter((s) => !isMemberPartOfCrew(s) && s.staffType !== 'Crew').length;
  const expiringCertsCount = staffList.filter(
    (s) => isCertExpiringSoon(s.certExpiry) || isCertExpiringSoon(s.medicalCertExpiry)
  ).length;

  const handleOpenAddModal = (defaultType: StaffType = 'Crew') => {
    setEditingStaffId(null);
    const prefix = defaultType === 'Crew' ? 'EMP' : 'ADM';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      staffType: defaultType,
      fullName: '',
      staffId: `${prefix}-${randNum}`,
      role: defaultType === 'Crew' ? 'Master (Captain)' : 'Fleet Operations Director',
      department: defaultType === 'Crew' ? 'Deck Department' : 'Fleet Operations',
      nationality: 'United Kingdom',
      nationalityCode: 'GB',
      email: '',
      phone: '',
      passportNo: `PAS-GB-${Math.floor(10000 + Math.random() * 90000)}`,
      seamanBookNo: defaultType === 'Crew' ? `SB-UK-${Math.floor(100000 + Math.random() * 900000)}` : '',
      certExpiry: '2029-06-30',
      medicalCertExpiry: '2027-12-15',
      status: 'Active',
      dateOfBirth: '1988-01-01',
      joiningDate: '2024-01-15',
      emergencyContact: '',
      notes: '',
      assignedVesselName: '',
      avatarUrl:
        defaultType === 'Crew'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&auto=format&fit=crop&q=80',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaffId(staff.id);
    setFormData({ ...staff });
    setIsFormModalOpen(true);
  };

  const handleOpenEnrollCrewModal = (staff: StaffMember) => {
    setSelectedStaffToEnroll(staff);
    const linkedCrew = getLinkedCrewMember(staff);
    setEnrollCrewData({
      rank: linkedCrew?.rank || (crewRanks.includes(staff.role) ? staff.role : crewRanks[0] || 'Master (Captain)'),
      vesselName: linkedCrew?.assignedVesselName || staff.assignedVesselName || availableVessels[0] || 'VOYAGER TITAN',
      seamanBookNo: staff.seamanBookNo || linkedCrew?.seamanBookNo || `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      status: linkedCrew?.status || 'On Board',
      embarkDate: linkedCrew?.embarkDate || '2026-08-01',
      disembarkDate: linkedCrew?.disembarkDate || '2027-02-01',
    });
    setIsEnrollCrewModalOpen(true);
  };

  const handleStaffTypeChange = (newType: StaffType) => {
    setFormData((prev) => ({
      ...prev,
      staffType: newType,
      role: newType === 'Crew' ? 'Master (Captain)' : 'Fleet Operations Director',
      department: newType === 'Crew' ? 'Deck Department' : 'Fleet Operations',
      staffId: prev.staffId || `${newType === 'Crew' ? 'EMP' : 'ADM'}-${Math.floor(1000 + Math.random() * 9000)}`,
      seamanBookNo:
        newType === 'Crew' && !prev.seamanBookNo
          ? `SB-UK-${Math.floor(100000 + Math.random() * 900000)}`
          : prev.seamanBookNo,
    }));
  };

  const handleSubmitStaffForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.role) return;

    if (editingStaffId) {
      const updated: StaffMember = {
        ...(formData as StaffMember),
        id: editingStaffId,
      };
      onUpdateStaff(updated);
    } else {
      const newStaff: StaffMember = {
        id: `STF-${Date.now().toString().slice(-4)}`,
        staffId:
          formData.staffId ||
          `${formData.staffType === 'Crew' ? 'EMP' : 'ADM'}-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: formData.fullName,
        staffType: formData.staffType || 'Crew',
        role: formData.role,
        department:
          formData.department ||
          (formData.staffType === 'Crew' ? 'Deck Department' : 'Fleet Operations'),
        nationality: formData.nationality || 'United Kingdom',
        nationalityCode:
          formData.nationalityCode || (formData.nationality?.slice(0, 2).toUpperCase() || 'GB'),
        email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@voyageis.com`,
        phone: formData.phone || '+44 7700 900000',
        passportNo: formData.passportNo || `PAS-${Math.floor(10000 + Math.random() * 90000)}`,
        seamanBookNo:
          formData.seamanBookNo ||
          (formData.staffType === 'Crew' ? `SB-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
        certExpiry: formData.certExpiry || '2029-12-31',
        medicalCertExpiry: formData.medicalCertExpiry || '2027-12-31',
        status: (formData.status as StaffMember['status']) || 'Active',
        assignedVesselName: formData.assignedVesselName,
        dateOfBirth: formData.dateOfBirth,
        joiningDate: formData.joiningDate || new Date().toISOString().slice(0, 10),
        emergencyContact: formData.emergencyContact,
        notes: formData.notes,
        avatarUrl:
          formData.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onAddStaff(newStaff);
    }

    setIsFormModalOpen(false);
  };

  const handleConfirmEnrollCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffToEnroll) return;

    const crewMemberToAdd: CrewMember = {
      id: `CRW-${Date.now().toString().slice(-4)}`,
      employeeId: selectedStaffToEnroll.staffId,
      staffId: selectedStaffToEnroll.id,
      fullName: selectedStaffToEnroll.fullName,
      rank: enrollCrewData.rank as CrewMember['rank'],
      assignedVesselId: 'VES-001',
      assignedVesselName: enrollCrewData.vesselName,
      nationality: selectedStaffToEnroll.nationality,
      nationalityCode: selectedStaffToEnroll.nationalityCode,
      seamanBookNo: enrollCrewData.seamanBookNo || selectedStaffToEnroll.seamanBookNo || `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      passportNo: selectedStaffToEnroll.passportNo,
      certExpiry: selectedStaffToEnroll.certExpiry || '2028-12-31',
      medicalCertExpiry: selectedStaffToEnroll.medicalCertExpiry || '2027-06-30',
      status: enrollCrewData.status,
      embarkDate: enrollCrewData.embarkDate,
      disembarkDate: enrollCrewData.disembarkDate,
      email: selectedStaffToEnroll.email,
      phone: selectedStaffToEnroll.phone,
      avatarUrl: selectedStaffToEnroll.avatarUrl,
    };

    // Update staff profile with crew info
    const updatedStaff: StaffMember = {
      ...selectedStaffToEnroll,
      staffType: 'Crew',
      assignedVesselName: enrollCrewData.vesselName,
      seamanBookNo: enrollCrewData.seamanBookNo,
      role: enrollCrewData.rank,
      status: enrollCrewData.status === 'On Board' ? 'On Board' : enrollCrewData.status === 'On Leave' ? 'On Leave' : 'Standby',
    };

    onCreateCrewFromStaff(crewMemberToAdd, updatedStaff);
    setIsEnrollCrewModalOpen(false);
    setSelectedStaffToEnroll(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'Staff ID',
      'Full Name',
      'Staff Type',
      'Is Part of Crew',
      'Role / Position',
      'Assigned Vessel',
      'Department',
      'Nationality',
      'CDC / Seaman Book',
      'Passport No.',
      'STCW Expiry',
      'Medical Expiry',
      'Email',
      'Phone',
      'Status',
    ];

    const rows = filteredStaff.map((s) => {
      const isCrew = isMemberPartOfCrew(s);
      const linkedCrew = getLinkedCrewMember(s);
      return [
        `"${s.staffId}"`,
        `"${s.fullName}"`,
        `"${s.staffType}"`,
        `"${isCrew ? 'Yes (Active Crew)' : 'No (Shore Staff)'}"`,
        `"${s.role}"`,
        `"${linkedCrew ? linkedCrew.assignedVesselName : s.assignedVesselName || 'Shore Base'}"`,
        `"${s.department}"`,
        `"${s.nationality}"`,
        `"${s.seamanBookNo || linkedCrew?.seamanBookNo || 'N/A'}"`,
        `"${s.passportNo || ''}"`,
        `"${s.certExpiry || ''}"`,
        `"${s.medicalCertExpiry || ''}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        `"${s.status}"`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voyage_is_staff_profiles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: StaffMember['status']) => {
    switch (status) {
      case 'Active':
      case 'On Board':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
            <Clock className="h-3 w-3 text-amber-600" />
            On Leave
          </span>
        );
      case 'Standby':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
            <UserCheck className="h-3 w-3 text-purple-600" />
            Standby
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
              <IdCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Staff Profile & Personnel Directory
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                All crew members are created from staff profiles. All crew are staff, but not all staff form part of the crew.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToCrewRegister && (
            <button
              id="view-crew-roster-btn"
              onClick={onNavigateToCrewRegister}
              className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-xs transition-colors"
            >
              <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
              <span>View Crew Roster</span>
            </button>
          )}

          <button
            id="export-staff-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            id="add-staff-profile-btn"
            onClick={() => handleOpenAddModal('Crew')}
            className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5] transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Staff Profile</span>
          </button>
        </div>
      </div>

      {/* Info Banner on Crew vs Staff relationship */}
      <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/60 dark:bg-[#465FFF]/10 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#465FFF] text-white">
            <Anchor className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-gray-900 dark:text-white">
              Crew Provisioning Workflow:
            </span>{' '}
            <span className="text-gray-600 dark:text-gray-300">
              Vessel crew are assigned and created based on existing staff profiles. Select any staff member below to assign them to a vessel or promote to an active voyage crew role.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            100% Crew Derived from Staff
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setCrewFilter('ALL')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
            crewFilter === 'ALL'
              ? 'border-[#465FFF] bg-blue-50/30 dark:bg-[#465FFF]/10 dark:border-[#465FFF]'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>Total Staff</span>
            <Users2 className="h-4 w-4 text-[#465FFF]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{totalStaffCount}</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">
            Combined Mariners & Shore
          </span>
        </div>

        <div
          onClick={() => setCrewFilter('CREW_ONLY')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
            crewFilter === 'CREW_ONLY'
              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/10 dark:border-emerald-500'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>Part of Crew</span>
            <Ship className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCrewCount}
          </p>
          <span className="text-[11px] text-emerald-600/80 font-medium">
            Assigned to vessel berths
          </span>
        </div>

        <div
          onClick={() => setCrewFilter('NON_CREW')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
            crewFilter === 'NON_CREW'
              ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-500/10 dark:border-indigo-500'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>Shore / Non-Crew</span>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {shoreStaffCount}
          </p>
          <span className="text-[11px] text-indigo-600/80 font-medium">
            Management, DPA, Logistics
          </span>
        </div>

        <div
          onClick={() => setCrewFilter('EXPIRING')}
          className={`cursor-pointer rounded-2xl border p-4 shadow-xs transition-all ${
            crewFilter === 'EXPIRING'
              ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-500/10 dark:border-amber-500'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>Cert Expiries (&lt;180d)</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {expiringCertsCount}
          </p>
          <span className="text-[11px] text-amber-600/80 font-medium">
            STCW / Medical renewals due
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="staff-search-input"
            type="text"
            placeholder="Search by name, Staff ID, CDC/Seaman book, passport, rank, vessel, or nationality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] py-2 pl-9.5 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
          />
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            id="filter-staff-department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            id="filter-staff-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Board">On Board</option>
            <option value="On Leave">On Leave</option>
            <option value="Standby">Standby</option>
            <option value="Inactive">Inactive</option>
          </select>

          <div className="flex rounded-xl border border-gray-200 dark:border-[#2E3A47] p-0.5 bg-gray-50 dark:bg-[#24303F]">
            <button
              onClick={() => setCrewFilter('ALL')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                crewFilter === 'ALL'
                  ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              All ({totalStaffCount})
            </button>
            <button
              onClick={() => setCrewFilter('CREW_ONLY')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                crewFilter === 'CREW_ONLY'
                  ? 'bg-white dark:bg-[#1C2434] text-emerald-600 dark:text-emerald-400 shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Crew Only ({activeCrewCount})
            </button>
            <button
              onClick={() => setCrewFilter('NON_CREW')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                crewFilter === 'NON_CREW'
                  ? 'bg-white dark:bg-[#1C2434] text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Shore Only ({shoreStaffCount})
            </button>
          </div>
        </div>
      </div>

      {/* Staff Profile Table (Based on Crew profile information) */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-500 dark:text-[#8A99AD]">
            <thead className="bg-gray-50/75 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 border-b border-gray-100 dark:border-[#2E3A47]">
              <tr>
                <th className="px-4 py-3.5">Staff &amp; Mariner</th>
                <th className="px-4 py-3.5">Staff Type &amp; Crew Role</th>
                <th className="px-4 py-3.5">Assigned Vessel</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">CDC / Seaman Book</th>
                <th className="px-4 py-3.5">STCW &amp; Medical Certs</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users2 className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        No staff profiles found
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Try adjusting your search criteria or add a new staff profile.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isCrew = isMemberPartOfCrew(staff);
                  const linkedCrew = getLinkedCrewMember(staff);
                  const assignedVessel = linkedCrew?.assignedVesselName || staff.assignedVesselName;

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors group"
                    >
                      {/* Staff & Mariner */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden border border-gray-200 dark:border-[#2E3A47] bg-gray-100 dark:bg-[#24303F]">
                            <img
                              src={staff.avatarUrl}
                              alt={staff.fullName}
                              className="h-full w-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                              {staff.fullName.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 dark:text-white">
                                {staff.fullName}
                              </span>
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-gray-100 dark:bg-[#2E3A47] text-gray-500 dark:text-gray-400">
                                {staff.nationalityCode}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                              <span className="font-mono">{staff.staffId}</span>
                              <span>•</span>
                              <span>{staff.nationality}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Staff Type & Crew Role */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            {isCrew ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                <Ship className="h-2.5 w-2.5" />
                                Active Crew
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                <Building2 className="h-2.5 w-2.5" />
                                Shore Staff
                              </span>
                            )}
                          </div>
                          <p className="mt-1 font-semibold text-gray-800 dark:text-gray-200">
                            {staff.role}
                          </p>
                        </div>
                      </td>

                      {/* Assigned Vessel */}
                      <td className="px-4 py-3">
                        {assignedVessel ? (
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                            <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
                            <span>{assignedVessel}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Shore Base / Unassigned</span>
                        )}
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {staff.department}
                        </span>
                      </td>

                      {/* CDC / Seaman Book */}
                      <td className="px-4 py-3 font-mono">
                        {staff.seamanBookNo || linkedCrew?.seamanBookNo ? (
                          <div className="flex items-center gap-1.5 text-gray-900 dark:text-gray-200 font-semibold">
                            <FileBadge className="h-3.5 w-3.5 text-blue-500" />
                            <span>{staff.seamanBookNo || linkedCrew?.seamanBookNo}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">N/A (Shore)</span>
                        )}
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          Pass: {staff.passportNo || '—'}
                        </div>
                      </td>

                      {/* STCW & Medical Certs */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase text-gray-400">STCW:</span>
                            <span
                              className={`font-mono text-[11px] font-semibold ${
                                isCertExpiringSoon(staff.certExpiry)
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {staff.certExpiry || 'Valid'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase text-gray-400">Med:</span>
                            <span
                              className={`font-mono text-[11px] font-semibold ${
                                isCertExpiringSoon(staff.medicalCertExpiry)
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {staff.medicalCertExpiry || 'Valid'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1 text-[11px] text-gray-700 dark:text-gray-300">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-[140px]">{staff.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{staff.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        {getStatusBadge(staff.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Create/Manage Crew Member from Staff */}
                          <button
                            id={`enroll-crew-btn-${staff.id}`}
                            onClick={() => handleOpenEnrollCrewModal(staff)}
                            title={isCrew ? 'Update Crew Assignment' : 'Create Crew Member from Staff Profile'}
                            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                              isCrew
                                ? 'border border-gray-200 dark:border-[#2E3A47] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                                : 'bg-[#465FFF] text-white hover:bg-[#3b52f5] shadow-2xs'
                            }`}
                          >
                            <Ship className="h-3 w-3" />
                            <span>{isCrew ? 'Vessel Berth' : 'Assign Crew'}</span>
                          </button>

                          <button
                            id={`view-staff-btn-${staff.id}`}
                            onClick={() => setSelectedStaffForDetail(staff)}
                            title="View Full Profile Details"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          <button
                            id={`edit-staff-btn-${staff.id}`}
                            onClick={() => handleOpenEditModal(staff)}
                            title="Edit Staff Profile"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            id={`delete-staff-btn-${staff.id}`}
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove ${staff.fullName} from staff directory?`)) {
                                onDeleteStaff(staff.id);
                              }
                            }}
                            title="Remove Staff Member"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      {/* MODAL 1: Add / Edit Staff Profile */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF]">
                  <IdCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingStaffId ? 'Edit Staff Profile' : 'Create New Staff Profile'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    All crew members are created based on staff profiles.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitStaffForm} className="mt-4 space-y-4">
              {/* Profile Image Uploader */}
              <ProfileImageUploader
                currentImageUrl={formData.avatarUrl}
                name={formData.fullName}
                roleOrDepartment={formData.role || formData.department}
                onImageChange={(img) => setFormData((prev) => ({ ...prev, avatarUrl: img }))}
                label="Staff Member Photo / Persona Avatar"
                idPrefix="staff-profile-modal-avatar"
                compact={false}
                allowPresets={true}
                helperText="Upload official staff photo or choose maritime avatar (PNG, JPG, WEBP, GIF)"
              />

              {/* Staff Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Staff Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStaffTypeChange('Crew')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                      formData.staffType === 'Crew'
                        ? 'border-[#465FFF] bg-blue-50/50 dark:bg-[#465FFF]/10 text-[#465FFF]'
                        : 'border-gray-200 dark:border-[#2E3A47] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Ship className="h-4 w-4" />
                    <span>Seafarer / Mariner Staff (Crew Eligible)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStaffTypeChange('Admin')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
                      formData.staffType === 'Admin' || formData.staffType === 'Shore Staff'
                        ? 'border-[#465FFF] bg-blue-50/50 dark:bg-[#465FFF]/10 text-[#465FFF]'
                        : 'border-gray-200 dark:border-[#2E3A47] text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Shore-based / Admin Staff</span>
                  </button>
                </div>
              </div>

              {/* Basic Details */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Henrik Lindqvist"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Staff ID / Employee Code
                  </label>
                  <input
                    type="text"
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    placeholder="e.g. EMP-9081"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Position / Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    {formData.staffType === 'Crew'
                      ? crewRanks.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))
                      : adminRoles.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nationality & Flag */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nationality: e.target.value,
                        nationalityCode: e.target.value.slice(0, 2).toUpperCase(),
                      })
                    }
                    placeholder="e.g. Sweden, Philippines, Greece"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Vessel (Optional)
                  </label>
                  <select
                    value={formData.assignedVesselName || ''}
                    onChange={(e) => setFormData({ ...formData, assignedVesselName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="">None / Shore Base</option>
                    {availableVessels.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seafarer & Maritime Credentials */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    CDC / Seaman Book No.
                  </label>
                  <input
                    type="text"
                    value={formData.seamanBookNo || ''}
                    onChange={(e) => setFormData({ ...formData, seamanBookNo: e.target.value })}
                    placeholder="e.g. SB-SE-882910"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    value={formData.passportNo || ''}
                    onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                    placeholder="e.g. PAS-SE-99120"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Certificate Expiries */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    STCW / Cert Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.certExpiry || ''}
                    onChange={(e) => setFormData({ ...formData, certExpiry: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Medical Cert Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.medicalCertExpiry || ''}
                    onChange={(e) => setFormData({ ...formData, medicalCertExpiry: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as StaffMember['status'] })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Board">On Board</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Standby">Standby</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@voyageis.com"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+44 7700 900123"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contact & Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Emergency Contact / Next of Kin
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact || ''}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="e.g. Astrid Lindqvist (Spouse) +46 70 987 6543"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5]"
                >
                  {editingStaffId ? 'Save Changes' : 'Create Staff Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Enroll Crew Member from Staff Profile */}
      {isEnrollCrewModalOpen && selectedStaffToEnroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <Ship className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Create Crew from Staff Profile
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Assigning {selectedStaffToEnroll.fullName} ({selectedStaffToEnroll.staffId})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEnrollCrewModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmEnrollCrew} className="mt-4 space-y-4">
              <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 flex items-center gap-3">
                <img
                  src={selectedStaffToEnroll.avatarUrl}
                  alt={selectedStaffToEnroll.fullName}
                  className="h-10 w-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-xs text-gray-900 dark:text-white">
                    {selectedStaffToEnroll.fullName}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {selectedStaffToEnroll.nationality} • Passport: {selectedStaffToEnroll.passportNo}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Crew Rank *
                </label>
                <select
                  value={enrollCrewData.rank}
                  onChange={(e) => setEnrollCrewData({ ...enrollCrewData, rank: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                >
                  {crewRanks.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Vessel *
                </label>
                <select
                  value={enrollCrewData.vesselName}
                  onChange={(e) => setEnrollCrewData({ ...enrollCrewData, vesselName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                >
                  {availableVessels.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  CDC / Seaman Book Number *
                </label>
                <input
                  type="text"
                  required
                  value={enrollCrewData.seamanBookNo}
                  onChange={(e) => setEnrollCrewData({ ...enrollCrewData, seamanBookNo: e.target.value })}
                  placeholder="e.g. SB-UK-663810"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Deployment Status
                  </label>
                  <select
                    value={enrollCrewData.status}
                    onChange={(e) =>
                      setEnrollCrewData({
                        ...enrollCrewData,
                        status: e.target.value as 'On Board' | 'On Leave' | 'In Transit' | 'Standby',
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    {crewStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Embarkation Date
                  </label>
                  <input
                    type="date"
                    value={enrollCrewData.embarkDate}
                    onChange={(e) => setEnrollCrewData({ ...enrollCrewData, embarkDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsEnrollCrewModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Confirm Crew Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL 3: View Full Staff Profile Details */}
      {selectedStaffForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStaffForDetail.avatarUrl}
                  alt={selectedStaffForDetail.fullName}
                  className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-[#2E3A47]"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedStaffForDetail.fullName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    {selectedStaffForDetail.role} • {selectedStaffForDetail.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffForDetail(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Employee / Staff ID</span>
                  <p className="mt-0.5 font-mono font-bold text-gray-900 dark:text-white">
                    {selectedStaffForDetail.staffId}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Crew Enrollment</span>
                  <p className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {isMemberPartOfCrew(selectedStaffForDetail) ? 'Active Vessel Crew' : 'Shore-Based Staff'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">CDC / Seaman Book</span>
                  <p className="mt-0.5 font-mono font-bold text-gray-900 dark:text-white">
                    {selectedStaffForDetail.seamanBookNo || 'N/A (Shore Staff)'}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Passport Number</span>
                  <p className="mt-0.5 font-mono font-bold text-gray-900 dark:text-white">
                    {selectedStaffForDetail.passportNo || '—'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">STCW Certificate Expiry</span>
                  <p className="mt-0.5 font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {selectedStaffForDetail.certExpiry || '—'}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3">
                  <span className="text-[10px] font-bold uppercase text-gray-400">Medical Fit Cert Expiry</span>
                  <p className="mt-0.5 font-mono font-semibold text-gray-800 dark:text-gray-200">
                    {selectedStaffForDetail.medicalCertExpiry || '—'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-gray-400">Contact &amp; Emergency</span>
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">Email:</span> {selectedStaffForDetail.email}
                </p>
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-semibold">Phone:</span> {selectedStaffForDetail.phone}
                </p>
                {selectedStaffForDetail.emergencyContact && (
                  <p className="text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">Emergency:</span> {selectedStaffForDetail.emergencyContact}
                  </p>
                )}
              </div>

              {selectedStaffForDetail.notes && (
                <div className="rounded-xl bg-blue-50/50 dark:bg-[#465FFF]/10 p-3">
                  <span className="text-[10px] font-bold uppercase text-[#465FFF]">Special Endorsements / Notes</span>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">{selectedStaffForDetail.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const staffToEdit = selectedStaffForDetail;
                  setSelectedStaffForDetail(null);
                  handleOpenEditModal(staffToEdit);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2A374A]"
              >
                <Edit2 className="h-3.5 w-3.5 text-[#465FFF]" />
                <span>Edit Profile &amp; Photo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedStaffForDetail(null);
                  handleOpenEnrollCrewModal(selectedStaffForDetail);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5]"
              >
                <Ship className="h-3.5 w-3.5" />
                <span>Assign / Update Crew Status</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedStaffForDetail(null)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
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
