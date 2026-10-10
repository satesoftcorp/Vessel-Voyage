import React, { useState } from 'react';
import { StaffMember, StaffType } from '../types';
import { ProfileImageUploader } from './ProfileImageUploader';
import {
  Users2,
  Search,
  Plus,
  Camera,
  Download,
  ShieldCheck,
  Ship,
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  Mail,
  Phone,
  Eye,
  Edit2,
  Trash2,
  X,
  FileCheck,
  Globe,
  Building2,
  Award,
  IdCard,
} from 'lucide-react';

interface StaffManagerProps {
  staffList: StaffMember[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onAssignToVessel?: (staff: StaffMember) => void;
}

const CREW_ROLES = [
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

const ADMIN_ROLES = [
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

const DEPARTMENTS = [
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

export const StaffManager: React.FC<StaffManagerProps> = ({
  staffList = [],
  onAddStaff,
  onUpdateStaff,
  onDeleteStaff,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | StaffType>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedStaffForDetail, setSelectedStaffForDetail] = useState<StaffMember | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  // Form state
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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  });

  // Filtered staff list
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.passportNo && s.passportNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.seamanBookNo && s.seamanBookNo.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || s.staffType === typeFilter;
    const matchesDept = departmentFilter === 'ALL' || s.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;

    return matchesSearch && matchesType && matchesDept && matchesStatus;
  });

  // Metrics
  const totalCount = staffList.length;
  const crewCount = staffList.filter((s) => s.staffType === 'Crew').length;
  const adminCount = staffList.filter((s) => s.staffType === 'Admin').length;
  const activeCount = staffList.filter((s) => s.status === 'Active' || s.status === 'On Board').length;

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
      passportNo: '',
      seamanBookNo: '',
      certExpiry: '2029-06-30',
      medicalCertExpiry: '2027-12-15',
      status: 'Active',
      dateOfBirth: '1988-01-01',
      joiningDate: '2024-01-15',
      emergencyContact: '',
      notes: '',
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

  const handleStaffTypeChange = (newType: StaffType) => {
    setFormData((prev) => ({
      ...prev,
      staffType: newType,
      role: newType === 'Crew' ? 'Master (Captain)' : 'Fleet Operations Director',
      department: newType === 'Crew' ? 'Deck Department' : 'Fleet Operations',
      staffId: prev.staffId || `${newType === 'Crew' ? 'EMP' : 'ADM'}-${Math.floor(1000 + Math.random() * 9000)}`,
    }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.role) return;

    if (editingStaffId) {
      // Update existing
      const updated: StaffMember = {
        ...(formData as StaffMember),
        id: editingStaffId,
      };
      onUpdateStaff(updated);
    } else {
      // Create new
      const newStaff: StaffMember = {
        id: `STF-${Date.now().toString().slice(-4)}`,
        staffId: formData.staffId || `${formData.staffType === 'Crew' ? 'EMP' : 'ADM'}-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: formData.fullName,
        staffType: formData.staffType || 'Crew',
        role: formData.role,
        department: formData.department || (formData.staffType === 'Crew' ? 'Deck Department' : 'Fleet Operations'),
        nationality: formData.nationality || 'United Kingdom',
        nationalityCode: formData.nationalityCode || (formData.nationality?.slice(0, 2).toUpperCase() || 'GB'),
        email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@voyageis.com`,
        phone: formData.phone || '+44 7700 900000',
        passportNo: formData.passportNo || `PAS-${Math.floor(10000 + Math.random() * 90000)}`,
        seamanBookNo: formData.seamanBookNo || (formData.staffType === 'Crew' ? `SB-${Math.floor(100000 + Math.random() * 900000)}` : undefined),
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

  const handleExportCSV = () => {
    const headers = [
      'Staff ID',
      'Full Name',
      'Staff Type',
      'Role / Position',
      'Department',
      'Nationality',
      'Email',
      'Phone',
      'Passport No.',
      'Seaman Book No.',
      'Cert Expiry',
      'Medical Expiry',
      'Status',
    ];

    const rows = filteredStaff.map((s) => [
      `"${s.staffId}"`,
      `"${s.fullName}"`,
      `"${s.staffType}"`,
      `"${s.role}"`,
      `"${s.department}"`,
      `"${s.nationality}"`,
      `"${s.email}"`,
      `"${s.phone}"`,
      `"${s.passportNo || ''}"`,
      `"${s.seamanBookNo || ''}"`,
      `"${s.certExpiry || ''}"`,
      `"${s.medicalCertExpiry || ''}"`,
      `"${s.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voyage_is_staff_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: StaffMember['status']) => {
    switch (status) {
      case 'Active':
      case 'On Board':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {status}
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
            <Clock className="h-3 w-3" />
            On Leave
          </span>
        );
      case 'Standby':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/20">
            <UserCheck className="h-3 w-3" />
            Standby
          </span>
        );
      case 'Inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
            Inactive
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Staff Management
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Manage maritime personnel, shipboard crew ranks, and shore-based administration roles
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="export-staff-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Staff Directory</span>
          </button>

          <button
            id="add-staff-btn"
            onClick={() => handleOpenAddModal('Crew')}
            className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b52f5] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards (Matching Vessels Register standard) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-gray-400 dark:text-[#8A99AD] uppercase tracking-wider">
            Total Staff
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            {totalCount} <span className="text-xs font-normal text-gray-400">Personnel</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-[#465FFF] dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Ship className="h-3 w-3" /> Seafarer Crew
          </div>
          <div className="text-xl font-bold text-[#465FFF] dark:text-blue-400 mt-1">
            {crewCount} <span className="text-xs font-normal text-gray-400">Mariners</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="h-3 w-3" /> Shore-Based Admin
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {adminCount} <span className="text-xs font-normal text-gray-400">Officers</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" /> Active / On Duty
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount} <span className="text-xs font-normal text-gray-400">Active</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xs overflow-hidden">
        {/* Search and Filters Header */}
        <div className="flex flex-col gap-3 p-4 border-b border-gray-100 dark:border-[#2E3A47] sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-[#1C2434]">
          {/* Left: Type Toggle Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-[#24303F] border border-gray-200/50 dark:border-[#2E3A47] shrink-0">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'ALL'
                  ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-2xs'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              All Types ({staffList.length})
            </button>
            <button
              onClick={() => setTypeFilter('Crew')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'Crew'
                  ? 'bg-[#465FFF] text-white shadow-2xs'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Ship className="h-3 w-3" />
              <span>Crew ({crewCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter('Admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                typeFilter === 'Admin'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="h-3 w-3" />
              <span>Admin ({adminCount})</span>
            </button>
          </div>

          {/* Right: Search & Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, role, or country..."
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] pl-9 pr-3.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
              />
            </div>

            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Board">On Board</option>
              <option value="On Leave">On Leave</option>
              <option value="Standby">Standby</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 dark:text-[#8A99AD]">
            <thead className="bg-gray-50/75 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-[#8A99AD] border-b border-gray-100 dark:border-[#2E3A47]">
              <tr>
                <th className="px-5 py-3.5">Staff Persona & ID</th>
                <th className="px-4 py-3.5">Type & Role</th>
                <th className="px-4 py-3.5">Department</th>
                <th className="px-4 py-3.5">Nationality</th>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Certificates & ID</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users2 className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2 stroke-1" />
                      <p className="font-semibold text-gray-700 dark:text-gray-300">No staff members found</p>
                      <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                      <button
                        onClick={() => handleOpenAddModal('Crew')}
                        className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-1.5 text-xs font-semibold text-white"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add New Staff Member
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-gray-50/60 dark:hover:bg-[#24303F]/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedStaffForDetail(staff)}
                  >
                    {/* Staff Persona & ID */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.avatarUrl}
                          alt={staff.fullName}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-[#2E3A47]"
                        />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-[#465FFF] transition-colors flex items-center gap-2">
                            <span>{staff.fullName}</span>
                            <span
                              className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                staff.staffType === 'Crew'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                  : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                              }`}
                            >
                              {staff.staffType}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-[#8A99AD] font-mono mt-0.5">
                            {staff.staffId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type & Role */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                        {staff.staffType === 'Crew' ? (
                          <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
                        ) : (
                          <Briefcase className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        )}
                        <span>{staff.role}</span>
                      </div>
                      {staff.assignedVesselName && (
                        <div className="text-[10px] text-gray-400 dark:text-[#8A99AD] mt-0.5">
                          Assigned: {staff.assignedVesselName}
                        </div>
                      )}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span>{staff.department}</span>
                      </span>
                    </td>

                    {/* Nationality */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                        <span className="inline-block rounded px-1 py-0.2 bg-gray-100 dark:bg-[#2E3A47] font-mono text-[10px]">
                          {staff.nationalityCode}
                        </span>
                        <span>{staff.nationality}</span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-[11px] text-gray-900 dark:text-white">
                        <Mail className="h-3 w-3 text-[#465FFF]" />
                        <span className="truncate max-w-[150px]">{staff.email}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-[#8A99AD] mt-0.5 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{staff.phone}</span>
                      </div>
                    </td>

                    {/* Certificates & ID */}
                    <td className="px-4 py-3.5">
                      <div className="text-[11px] font-mono text-gray-900 dark:text-white">
                        Pass: {staff.passportNo || 'N/A'}
                      </div>
                      {staff.seamanBookNo && (
                        <div className="text-[10px] font-mono text-gray-400 dark:text-[#8A99AD] mt-0.5">
                          CDC: {staff.seamanBookNo}
                        </div>
                      )}
                      {staff.certExpiry && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          <span>Exp: {staff.certExpiry}</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">{getStatusBadge(staff.status)}</td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedStaffForDetail(staff)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-[#465FFF] hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          title="View Profile Dossier"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(staff)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          title="Edit Staff Persona"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${staff.fullName}" from the staff directory?`)) {
                              onDeleteStaff(staff.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                          title="Delete Staff Record"
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

        {/* Table Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-[#2E3A47] text-xs text-gray-500 dark:text-[#8A99AD] bg-gray-50/40 dark:bg-[#24303F]/20">
          <span>
            Showing <strong>{filteredStaff.length}</strong> of <strong>{totalCount}</strong> staff personnel
          </span>
          <span>STCW, MLC 2006 & Shore-Based Admin Operations</span>
        </div>
      </div>

      {/* Staff Persona Form Modal (Add / Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            id="staff-form-modal"
            className="w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF]">
                  <IdCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingStaffId ? 'Edit Staff Persona' : 'Add New Staff Member'}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                    Register profile persona for seafarer crew or administrative staff
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs text-gray-700 dark:text-gray-300 max-h-[75vh] overflow-y-auto">
              {/* Profile Image Uploader */}
              <ProfileImageUploader
                currentImageUrl={formData.avatarUrl}
                name={formData.fullName}
                roleOrDepartment={formData.role || formData.department}
                onImageChange={(img) => setFormData((prev) => ({ ...prev, avatarUrl: img }))}
                label="Profile Picture & Persona Avatar"
                idPrefix="staff-mgr-modal-avatar"
                compact={false}
                allowPresets={true}
                helperText="Upload official maritime portrait photo or identity avatar (PNG, JPG, WEBP, GIF)"
              />

              {/* Type Selection (Crew vs Admin) */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  Staff Classification Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStaffTypeChange('Crew')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      formData.staffType === 'Crew'
                        ? 'border-[#465FFF] bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20'
                        : 'border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Ship className="h-4 w-4" />
                    <span>Crew (Shipboard Seafarer)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStaffTypeChange('Admin')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      formData.staffType === 'Admin'
                        ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                        : 'border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Briefcase className="h-4 w-4" />
                    <span>Admin (Shore-Based Office)</span>
                  </button>
                </div>
              </div>

              {/* Grid 1: Full Name (Whole width) & Core Persona */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name (Whole Width) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Capt. Jonathan Vance, Elena Rostova"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Staff ID / Employee ID */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Staff ID / Employee Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-9081, ADM-101"
                    value={formData.staffId || ''}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Role / Rank */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Role / Position *
                  </label>
                  <select
                    value={formData.role || ''}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    {(formData.staffType === 'Crew' ? CREW_ROLES : ADMIN_ROLES).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Department *
                  </label>
                  <select
                    value={formData.department || ''}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nationality */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Nationality & Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. United Kingdom, Singapore, Philippines"
                    value={formData.nationality || ''}
                    onChange={(e) => {
                      const nat = e.target.value;
                      setFormData({
                        ...formData,
                        nationality: nat,
                        nationalityCode: nat.slice(0, 2).toUpperCase() || 'GB',
                      });
                    }}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. j.vance@voyageis.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Phone / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +44 7700 900142"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Passport Number */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Passport Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PAS-GB-99201"
                    value={formData.passportNo || ''}
                    onChange={(e) => setFormData({ ...formData, passportNo: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Seaman Book (CDC) - Recommended for Crew */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Seaman Book (CDC No.) {formData.staffType === 'Crew' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={formData.staffType === 'Crew' ? 'e.g. SB-UK-882910' : 'N/A (Shore Staff)'}
                    value={formData.seamanBookNo || ''}
                    onChange={(e) => setFormData({ ...formData, seamanBookNo: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* STCW / Professional Cert Expiry */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    STCW / Competency Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.certExpiry || ''}
                    onChange={(e) => setFormData({ ...formData, certExpiry: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Medical Fitness Expiry */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Medical Fitness Certificate Expiry
                  </label>
                  <input
                    type="date"
                    value={formData.medicalCertExpiry || ''}
                    onChange={(e) => setFormData({ ...formData, medicalCertExpiry: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Employment Status *
                  </label>
                  <select
                    value={formData.status || 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StaffMember['status'] })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Active">Active</option>
                    <option value="On Board">On Board (Vessel)</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Standby">Standby</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Emergency Contact Name & Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Jane Vance (+44 7700 900888)"
                    value={formData.emergencyContact || ''}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                {/* Notes & Special Endorsements */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Endorsements, Qualifications & Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Master Mariner Unlimited, GMDSS GOC, ECDIS, Polar Code, Dangerous Cargo Endorsement (DCE)..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b52f5] transition-colors"
                >
                  {editingStaffId ? 'Save Changes' : 'Register Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Profile Dossier Modal */}
      {selectedStaffForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            id="staff-profile-modal"
            className="w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStaffForDetail.avatarUrl}
                  alt={selectedStaffForDetail.fullName}
                  className="h-12 w-12 rounded-2xl object-cover ring-2 ring-[#465FFF]/30"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedStaffForDetail.fullName}
                    </h3>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        selectedStaffForDetail.staffType === 'Crew'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                      }`}
                    >
                      {selectedStaffForDetail.staffType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                    <span className="font-semibold text-[#465FFF]">{selectedStaffForDetail.role}</span>
                    <span>•</span>
                    <span className="font-mono">{selectedStaffForDetail.staffId}</span>
                    <span>•</span>
                    <span>{selectedStaffForDetail.department}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffForDetail(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-700 dark:hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 text-xs text-gray-700 dark:text-gray-300 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">Current Status:</span>
                  {getStatusBadge(selectedStaffForDetail.status)}
                </div>
                {selectedStaffForDetail.assignedVesselName ? (
                  <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                    <Ship className="h-4 w-4 text-[#465FFF]" />
                    <span>{selectedStaffForDetail.assignedVesselName}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 font-semibold text-gray-500">
                    <Building2 className="h-4 w-4" />
                    <span>Shore Office Headquarters</span>
                  </div>
                )}
              </div>

              {/* Grid Persona Information */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                    Nationality
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedStaffForDetail.nationality} ({selectedStaffForDetail.nationalityCode})
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                    Passport Number
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm font-mono">
                    {selectedStaffForDetail.passportNo || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                    Seaman Book (CDC)
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm font-mono">
                    {selectedStaffForDetail.seamanBookNo || 'N/A (Shore)'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                    STCW / Competency Expiry
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedStaffForDetail.certExpiry || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                    Medical Fitness Expiry
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedStaffForDetail.medicalCertExpiry || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-gray-400 dark:text-[#8A99AD] text-[11px] uppercase font-bold tracking-wider">
                    Joining Date
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {selectedStaffForDetail.joiningDate || '2022-01-01'}
                  </p>
                </div>
              </div>

              {/* Direct Contact & Emergency */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider">
                  Contact & Communication
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
                    <Mail className="h-4 w-4 text-[#465FFF]" />
                    <span className="font-medium text-gray-900 dark:text-white">{selectedStaffForDetail.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
                    <Phone className="h-4 w-4 text-[#465FFF]" />
                    <span className="font-medium text-gray-900 dark:text-white">{selectedStaffForDetail.phone}</span>
                  </div>
                </div>
                {selectedStaffForDetail.emergencyContact && (
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">
                      Emergency Next of Kin
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white mt-0.5 block">
                      {selectedStaffForDetail.emergencyContact}
                    </span>
                  </div>
                )}
              </div>

              {/* Qualifications / Remarks */}
              {selectedStaffForDetail.notes && (
                <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4 space-y-2">
                  <h4 className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    <span>Qualifications & Endorsements</span>
                  </h4>
                  <p className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] text-gray-800 dark:text-gray-200">
                    {selectedStaffForDetail.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30">
              <button
                onClick={() => {
                  const staffToEdit = selectedStaffForDetail;
                  setSelectedStaffForDetail(null);
                  handleOpenEditModal(staffToEdit);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100"
              >
                <Edit2 className="h-3.5 w-3.5 text-[#465FFF]" />
                <span>Edit Profile</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedStaffForDetail(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert(`Exporting staff persona dossier for ${selectedStaffForDetail.fullName}`);
                    setSelectedStaffForDetail(null);
                  }}
                  className="rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5] transition-colors shadow-xs"
                >
                  Download Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
