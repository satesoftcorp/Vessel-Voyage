import React, { useState } from 'react';
import { CrewMember, StaffMember, Vessel, VoyageRecord } from '../types';
import { ProfileImageUploader } from './ProfileImageUploader';
import { CrewProfilePageView } from './CrewProfilePageView';
import {
  Users,
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
  X,
  FileCheck,
  ShieldCheck,
  Globe,
  Wrench,
  User,
  CheckCircle2,
} from 'lucide-react';

interface CrewRegisterTableProps {
  crewList: CrewMember[];
  staffList?: StaffMember[];
  vessels?: Vessel[];
  voyages?: VoyageRecord[];
  onAddCrew?: (crew: CrewMember) => void;
  onUpdateCrew?: (crew: CrewMember) => void;
  onDeleteCrew?: (crewId: string) => void;
  onSelectCrew?: (crew: CrewMember) => void;
  onNavigateToMaintenance?: (vesselName: string) => void;
  onShowToast?: (msg: string) => void;
}

export const CrewRegisterTable: React.FC<CrewRegisterTableProps> = ({
  crewList = [],
  staffList = [],
  vessels = [],
  voyages = [],
  onAddCrew,
  onUpdateCrew,
  onDeleteCrew,
  onSelectCrew,
  onNavigateToMaintenance,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rankFilter, setRankFilter] = useState('ALL');
  const [vesselFilter, setVesselFilter] = useState('ALL');
  const [selectedCrewForDetail, setSelectedCrewForDetail] = useState<CrewMember | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Selected staff ID for adding crew
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // New crew member form state
  const [newCrew, setNewCrew] = useState<Partial<CrewMember>>({
    fullName: '',
    employeeId: '',
    rank: 'Master (Captain)',
    assignedVesselName: 'VOYAGER TITAN',
    nationality: 'United Kingdom',
    nationalityCode: 'GB',
    seamanBookNo: '',
    passportNo: '',
    certExpiry: '2028-06-30',
    medicalCertExpiry: '2027-04-15',
    status: 'On Board',
    embarkDate: '2026-08-01',
    disembarkDate: '2027-02-01',
    email: '',
    phone: '',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  });

  // Extract unique vessels for dropdown filter
  const uniqueVessels = Array.from(new Set(crewList.map((c) => c.assignedVesselName)));

  const filteredCrew = crewList.filter((c) => {
    const matchesSearch =
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedVesselName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.seamanBookNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesRank = rankFilter === 'ALL' || c.rank === rankFilter;
    const matchesVessel = vesselFilter === 'ALL' || c.assignedVesselName === vesselFilter;

    return matchesSearch && matchesStatus && matchesRank && matchesVessel;
  });

  // Metrics
  const totalCrewCount = crewList.length;
  const onBoardCount = crewList.filter((c) => c.status === 'On Board').length;
  const onLeaveCount = crewList.filter((c) => c.status === 'On Leave').length;
  const standbyCount = crewList.filter((c) => c.status === 'Standby' || c.status === 'In Transit').length;

  const handleExportCSV = () => {
    const headers = ['Employee ID', 'Full Name', 'Rank', 'Assigned Vessel', 'Nationality', 'Status', 'CDC/Seaman Book', 'Cert Expiry', 'Email', 'Phone'];
    const rows = filteredCrew.map((c) => [
      `"${c.employeeId}"`,
      `"${c.fullName}"`,
      `"${c.rank}"`,
      `"${c.assignedVesselName}"`,
      `"${c.nationality}"`,
      `"${c.status}"`,
      `"${c.seamanBookNo}"`,
      `"${c.certExpiry}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voyage_is_crew_roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: CrewMember['status']) => {
    switch (status) {
      case 'On Board':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            On Board
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="h-3 w-3 text-slate-500" />
            On Leave
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20">
            <Globe className="h-3 w-3" />
            In Transit
          </span>
        );
      case 'Standby':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200/60 dark:border-violet-500/20">
            <UserCheck className="h-3 w-3" />
            Standby
          </span>
        );
      default:
        return <span className="text-xs">{status}</span>;
    }
  };

  // Handle staff selection in Add Crew Modal
  const handleSelectStaffForCrew = (staffId: string) => {
    setSelectedStaffId(staffId);
    const staff = staffList.find((s) => s.id === staffId);
    if (staff) {
      setNewCrew((prev) => ({
        ...prev,
        fullName: staff.fullName,
        employeeId: staff.staffId,
        rank: (staff.role as CrewMember['rank']) || prev.rank || 'Master (Captain)',
        nationality: staff.nationality,
        nationalityCode: staff.nationalityCode,
        seamanBookNo: staff.seamanBookNo || prev.seamanBookNo || `SB-${Math.floor(100000 + Math.random() * 900000)}`,
        passportNo: staff.passportNo || prev.passportNo || `PAS-${Math.floor(10000 + Math.random() * 90000)}`,
        certExpiry: staff.certExpiry || prev.certExpiry || '2028-12-31',
        medicalCertExpiry: staff.medicalCertExpiry || prev.medicalCertExpiry || '2027-06-30',
        email: staff.email,
        phone: staff.phone,
        avatarUrl: staff.avatarUrl,
      }));
    }
  };

  const handleOpenAddCrewModal = () => {
    // If we have staff of type 'Crew', default select the first one not already onboard or first available
    const defaultStaff = staffList.find((s) => s.staffType === 'Crew') || staffList[0];
    if (defaultStaff) {
      handleSelectStaffForCrew(defaultStaff.id);
    }
    setIsAddModalOpen(true);
  };

  const handleCreateCrew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrew.fullName || !newCrew.rank) return;

    const crewToAdd: CrewMember = {
      id: `CRW-${Date.now().toString().slice(-4)}`,
      employeeId: newCrew.employeeId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: newCrew.fullName,
      rank: (newCrew.rank as CrewMember['rank']) || 'Able Seaman',
      assignedVesselId: 'VES-001',
      assignedVesselName: newCrew.assignedVesselName || 'VOYAGER TITAN',
      nationality: newCrew.nationality || 'United Kingdom',
      nationalityCode: newCrew.nationalityCode || 'GB',
      seamanBookNo: newCrew.seamanBookNo || `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      passportNo: newCrew.passportNo || `PAS-${Math.floor(10000 + Math.random() * 90000)}`,
      certExpiry: newCrew.certExpiry || '2028-12-31',
      medicalCertExpiry: newCrew.medicalCertExpiry || '2027-06-30',
      status: (newCrew.status as CrewMember['status']) || 'On Board',
      embarkDate: newCrew.embarkDate || '2026-08-01',
      disembarkDate: newCrew.disembarkDate || '2027-02-01',
      email: newCrew.email || `${newCrew.fullName.toLowerCase().replace(/\s+/g, '.')}@voyageis.com`,
      phone: newCrew.phone || '+44 7700 900077',
      avatarUrl:
        newCrew.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    };

    if (onAddCrew) {
      onAddCrew(crewToAdd);
    }
    setIsAddModalOpen(false);
  };

  // If a crew member is selected, open their profile on its own full dedicated page view (not a modal)
  if (selectedCrewForDetail) {
    return (
      <CrewProfilePageView
        crew={selectedCrewForDetail}
        allCrew={crewList}
        staffList={staffList}
        vessels={vessels}
        voyages={voyages}
        onBack={() => setSelectedCrewForDetail(null)}
        onUpdateCrew={(updated) => {
          if (onUpdateCrew) onUpdateCrew(updated);
          setSelectedCrewForDetail(updated);
        }}
        onDeleteCrew={(id) => {
          if (onDeleteCrew) onDeleteCrew(id);
          setSelectedCrewForDetail(null);
        }}
        onSelectOtherCrew={(otherCrew) => {
          setSelectedCrewForDetail(otherCrew);
          if (onSelectCrew) onSelectCrew(otherCrew);
        }}
        onNavigateToMaintenance={onNavigateToMaintenance}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Crew Management & Roster
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Seafarer assignments, certificate validation, embarkation schedules, and ranks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="export-crew-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Roster</span>
          </button>

          <button
            id="add-crew-btn"
            onClick={handleOpenAddCrewModal}
            className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Crew Member</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>Total Crew</span>
            <Users className="h-4 w-4 text-[#465FFF]" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{totalCrewCount}</p>
          <span className="text-[11px] text-gray-400 dark:text-gray-500 font-normal">Active registered mariners</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>On Board</span>
            <Ship className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{onBoardCount}</p>
          <span className="text-[11px] text-emerald-600/80 font-medium">Currently on active voyage</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>On Leave / Shore</span>
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-600 dark:text-slate-300">{onLeaveCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Rest & recreation period</span>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8A99AD] font-medium">
            <span>Standby / Transit</span>
            <UserCheck className="h-4 w-4 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-violet-600 dark:text-violet-400">{standbyCount}</p>
          <span className="text-[11px] text-violet-600/80 font-medium">Ready for vessel assignment</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col gap-3 p-4 border-b border-gray-100 dark:border-[#2E3A47] sm:flex-row sm:items-center sm:justify-between bg-gray-50/40 dark:bg-[#24303F]/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              id="crew-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, ID, rank, vessel, or CDC number..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] pl-9 pr-4 py-2 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
              <span className="hidden sm:inline font-medium">Status:</span>
              <select
                id="crew-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
              >
                <option value="ALL">All Statuses</option>
                <option value="On Board">On Board</option>
                <option value="On Leave">On Leave</option>
                <option value="In Transit">In Transit</option>
                <option value="Standby">Standby</option>
              </select>
            </div>

            {/* Rank Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
              <span className="hidden sm:inline font-medium">Rank:</span>
              <select
                id="crew-rank-filter"
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
              >
                <option value="ALL">All Ranks</option>
                <option value="Master (Captain)">Master (Captain)</option>
                <option value="Chief Engineer">Chief Engineer</option>
                <option value="Chief Officer">Chief Officer</option>
                <option value="2nd Officer">2nd Officer</option>
                <option value="2nd Engineer">2nd Engineer</option>
                <option value="Bosun">Bosun</option>
                <option value="Able Seaman">Able Seaman</option>
                <option value="Cook">Cook</option>
              </select>
            </div>

            {/* Vessel Filter */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
              <span className="hidden sm:inline font-medium">Vessel:</span>
              <select
                id="crew-vessel-filter"
                value={vesselFilter}
                onChange={(e) => setVesselFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
              >
                <option value="ALL">All Vessels</option>
                {uniqueVessels.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* The Crew Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
            <thead className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/50 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8A99AD]">
              <tr>
                <th className="px-5 py-3.5">Seafarer Profile</th>
                <th className="px-4 py-3.5">Rank / Role</th>
                <th className="px-4 py-3.5">Assigned Vessel</th>
                <th className="px-4 py-3.5">Nationality</th>
                <th className="px-4 py-3.5">CDC / Passports</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Cert Expiry</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredCrew.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    <Users className="mx-auto h-8 w-8 opacity-30 mb-2" />
                    <p className="font-semibold">No crew members found</p>
                    <p className="text-[11px] mt-0.5">Try clearing filters or search terms</p>
                  </td>
                </tr>
              ) : (
                filteredCrew.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedCrewForDetail(member);
                      if (onSelectCrew) onSelectCrew(member);
                    }}
                  >
                    {/* Seafarer Profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatarUrl}
                          alt={member.fullName}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-[#2E3A47]"
                        />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white group-hover:text-[#465FFF] transition-colors">
                            {member.fullName}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-[#8A99AD] font-mono mt-0.5">
                            {member.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Rank */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center rounded-lg bg-blue-50 px-2 py-0.8 text-xs font-semibold text-[#465FFF] dark:bg-blue-500/10 dark:text-blue-400">
                        {member.rank}
                      </span>
                    </td>

                    {/* Assigned Vessel */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                        <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
                        <span>{member.assignedVesselName}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                        Embark: {member.embarkDate}
                      </div>
                    </td>

                    {/* Nationality */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                        <span className="inline-block rounded px-1 py-0.2 bg-gray-100 dark:bg-[#2E3A47] font-mono text-[10px]">
                          {member.nationalityCode}
                        </span>
                        <span>{member.nationality}</span>
                      </div>
                    </td>

                    {/* CDC / Passports */}
                    <td className="px-4 py-3.5">
                      <div className="font-mono text-[11px] text-gray-900 dark:text-white font-medium">
                        {member.seamanBookNo}
                      </div>
                      <div className="font-mono text-[10px] text-gray-400 dark:text-[#8A99AD] mt-0.5">
                        {member.passportNo}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getStatusBadge(member.status)}
                    </td>

                    {/* Cert Expiry */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 font-medium text-gray-900 dark:text-white">
                        <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{member.certExpiry}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                        Med: {member.medicalCertExpiry}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`view-profile-btn-${member.id}`}
                        onClick={() => {
                          setSelectedCrewForDetail(member);
                          if (onSelectCrew) onSelectCrew(member);
                        }}
                        className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-[#465FFF] transition-colors shadow-2xs"
                        title="Open full crew dossier page"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-[#465FFF]" />
                        <span>Profile</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-[#2E3A47] text-xs text-gray-500 dark:text-[#8A99AD] bg-gray-50/40 dark:bg-[#24303F]/20">
          <span>Showing <strong>{filteredCrew.length}</strong> of <strong>{totalCrewCount}</strong> seafarers</span>
          <span>STCW & MLC 2006 Compliant Database</span>
        </div>
      </div>

      {/* Add Crew Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            id="register-crew-form-modal"
            className="w-full max-w-xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-2.5">
                <Users className="h-5 w-5 text-[#465FFF]" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Add New Crew Member
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCrew} className="p-6 space-y-4 text-xs text-gray-700 dark:text-gray-300 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Select Staff Member (Dropdown) */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Select Staff Member / Crew Persona *
                  </label>
                  <select
                    required
                    value={selectedStaffId}
                    onChange={(e) => handleSelectStaffForCrew(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="" disabled>
                      -- Select Staff Member from Directory --
                    </option>
                    {staffList.filter((s) => s.staffType === 'Crew').length > 0 && (
                      <optgroup label="Seafarers & Crew Personnel">
                        {staffList
                          .filter((s) => s.staffType === 'Crew')
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.staffId}) — {s.role} • {s.nationality}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {staffList.filter((s) => s.staffType === 'Admin').length > 0 && (
                      <optgroup label="Other Registered Staff Personnel">
                        {staffList
                          .filter((s) => s.staffType === 'Admin')
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.staffId}) — {s.role} (Admin) • {s.nationality}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                {/* Profile Photo Uploader for Crew */}
                <div className="sm:col-span-2">
                  <ProfileImageUploader
                    currentImageUrl={newCrew.avatarUrl}
                    name={newCrew.fullName || 'Crew Seafarer'}
                    roleOrDepartment={newCrew.rank || 'Deck'}
                    onImageChange={(img) => setNewCrew((prev) => ({ ...prev, avatarUrl: img }))}
                    label="Crew Member Photo / Badge Avatar"
                    idPrefix="crew-modal-avatar"
                    compact={true}
                    allowPresets={true}
                    helperText="Upload official mariner badge photo or select preset (PNG, JPG, WEBP, GIF)"
                  />
                </div>

                {/* Auto-populated Staff Profile Card (Nationality & Certs from Profile) */}
                {newCrew.fullName && (
                  <div className="sm:col-span-2 p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <img
                        src={newCrew.avatarUrl}
                        alt={newCrew.fullName}
                        className="h-10 w-10 rounded-xl object-cover ring-1 ring-[#465FFF]/30"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white text-xs truncate">
                            {newCrew.fullName}
                          </span>
                          <span className="font-mono text-[10px] text-gray-500 dark:text-[#8A99AD]">
                            {newCrew.employeeId}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600 dark:text-gray-300 mt-1">
                          <span className="flex items-center gap-1 font-medium text-[#465FFF] dark:text-blue-400">
                            <Globe className="h-3 w-3" />
                            Nationality: <strong>{newCrew.nationality} ({newCrew.nationalityCode})</strong>
                          </span>
                          {newCrew.passportNo && (
                            <span className="text-gray-500 dark:text-[#8A99AD] font-mono">
                              Passport: {newCrew.passportNo}
                            </span>
                          )}
                          {newCrew.seamanBookNo && (
                            <span className="text-gray-500 dark:text-[#8A99AD] font-mono">
                              CDC: {newCrew.seamanBookNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Assigned Vessel */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Vessel *
                  </label>
                  <select
                    value={newCrew.assignedVesselName}
                    onChange={(e) => setNewCrew({ ...newCrew, assignedVesselName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    {uniqueVessels.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rank / Role */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Shipboard Rank / Position *
                  </label>
                  <select
                    value={newCrew.rank}
                    onChange={(e) => setNewCrew({ ...newCrew, rank: e.target.value as CrewMember['rank'] })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="Master (Captain)">Master (Captain)</option>
                    <option value="Chief Engineer">Chief Engineer</option>
                    <option value="Chief Officer">Chief Officer</option>
                    <option value="2nd Officer">2nd Officer</option>
                    <option value="3rd Officer">3rd Officer</option>
                    <option value="2nd Engineer">2nd Engineer</option>
                    <option value="Bosun">Bosun</option>
                    <option value="Able Seaman">Able Seaman</option>
                    <option value="Cook">Cook</option>
                    <option value="Motorman">Motorman</option>
                  </select>
                </div>

                {/* Initial Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Deployment Status *
                  </label>
                  <select
                    value={newCrew.status}
                    onChange={(e) => setNewCrew({ ...newCrew, status: e.target.value as CrewMember['status'] })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  >
                    <option value="On Board">On Board</option>
                    <option value="On Leave">On Leave</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Standby">Standby</option>
                  </select>
                </div>

                {/* Embarkation Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Embarkation Date
                  </label>
                  <input
                    type="date"
                    value={newCrew.embarkDate || '2026-08-01'}
                    onChange={(e) => setNewCrew({ ...newCrew, embarkDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-medium text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newCrew.fullName}
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5] disabled:opacity-50 transition-colors"
                >
                  Save Crew Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
