import React, { useState, useRef } from 'react';
import { SystemUser, StaffMember, Vessel, UserType } from '../types';
import { ProfileImageUploader } from './ProfileImageUploader';
import {
  User,
  Camera,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  Clock,
  Key,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FileBadge,
  Award,
  IdCard,
  Ship,
  Globe,
  Radio,
  FileText,
  Sliders,
  Edit2,
  Download,
  QrCode,
  Sparkles,
  ExternalLink,
  Laptop,
  Check,
  X,
  Eye,
  EyeOff,
  UserCheck,
  ChevronRight,
  Fingerprint,
} from 'lucide-react';

interface MyProfileViewProps {
  currentUser: SystemUser;
  onUpdateCurrentUser: (updatedUser: SystemUser) => void;
  usersList?: SystemUser[];
  onSwitchUser?: (user: SystemUser) => void;
  staffList?: StaffMember[];
  vessels?: Vessel[];
  onNavigateToSettings?: () => void;
  onNavigateToUserManagement?: () => void;
  onShowToast?: (msg: string) => void;
}

type ProfileTab = 'overview' | 'permissions' | 'credentials' | 'security' | 'activity';

export const MyProfileView: React.FC<MyProfileViewProps> = ({
  currentUser,
  onUpdateCurrentUser,
  usersList = [],
  onSwitchUser,
  staffList = [],
  vessels = [],
  onNavigateToSettings,
  onNavigateToUserManagement,
  onShowToast = (_msg: string) => {},
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    fullName: currentUser.fullName || '',
    username: currentUser.username || '',
    email: currentUser.email || '',
    phone: '+256 700 819900',
    organization: currentUser.organization || 'Voyage Information Systems Global HQ',
    department: currentUser.department || 'Executive Management',
    role: currentUser.role || 'Super Admin',
    assignedVessel: currentUser.assignedVessel || 'All Fleet Vessels',
    location: 'Port of Jinja / Lake Victoria Marine Command & Mombasa Regional Office',
    timezone: 'Africa/Kampala (UTC+03:00)',
    language: 'English (IMO Standard Marine Vocabulary)',
    bio: 'Senior Marine Operations & Port Governance Executive with oversight across East African Inland Waterways, Lake Victoria ferry corridors, and IMO FAL manifest dispatch networks.',
    avatarUrl: currentUser.avatarUrl || '',
    emergencyContact: 'Marine Operations Command Desk (+256 414 123456)',
  });

  // Password Modal Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
  });

  // MFA local toggle
  const [mfaActive, setMfaActive] = useState<boolean>(currentUser.mfaEnabled ?? true);

  // Synchronize editForm when currentUser changes
  React.useEffect(() => {
    setEditForm((prev) => ({
      ...prev,
      fullName: currentUser.fullName || '',
      username: currentUser.username || '',
      email: currentUser.email || '',
      organization: currentUser.organization || 'Voyage Information Systems Global HQ',
      department: currentUser.department || 'Fleet Operations',
      role: currentUser.role || 'System User',
      assignedVessel: currentUser.assignedVessel || 'All Fleet Vessels',
      avatarUrl: currentUser.avatarUrl || '',
    }));
    setMfaActive(currentUser.mfaEnabled ?? true);
  }, [currentUser]);

  // Find linked staff record if available
  const linkedStaff = staffList.find(
    (s) => s.id === currentUser.staffId || s.staffId === currentUser.staffId || s.email === currentUser.email
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName.trim()) {
      onShowToast('Full name is required.');
      return;
    }
    const updated: SystemUser = {
      ...currentUser,
      fullName: editForm.fullName,
      email: editForm.email,
      organization: editForm.organization,
      department: editForm.department,
      assignedVessel: editForm.assignedVessel,
      avatarUrl: editForm.avatarUrl || currentUser.avatarUrl,
    };
    onUpdateCurrentUser(updated);
    setIsEditModalOpen(false);
    onShowToast('Profile information successfully updated.');
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      onShowToast('Please enter your current password.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      onShowToast('New password must be at least 8 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      onShowToast('New passwords do not match.');
      return;
    }
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      showCurrent: false,
      showNew: false,
    });
    setIsPasswordModalOpen(false);
    onShowToast('Your security credentials and password have been updated.');
  };

  const handleToggleMfa = () => {
    const nextState = !mfaActive;
    setMfaActive(nextState);
    const updated: SystemUser = {
      ...currentUser,
      mfaEnabled: nextState,
    };
    onUpdateCurrentUser(updated);
    onShowToast(nextState ? 'Two-Factor Authentication enabled.' : 'Two-Factor Authentication disabled.');
  };

  // User Type visual badges
  const getUserTypeBadge = (type: UserType) => {
    switch (type) {
      case 'Superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-3 py-1 text-xs font-bold text-purple-700 dark:text-purple-300">
            <span>👑</span>
            <span>Superadmin Tier</span>
          </span>
        );
      case 'Port users':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-3 py-1 text-xs font-bold text-blue-700 dark:text-[#80CAEE]">
            <span>⚓</span>
            <span>Port &amp; Terminal Staff</span>
          </span>
        );
      case 'Stakeholders':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>🏢</span>
            <span>Stakeholder &amp; Regulator</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div id="my-profile-view" className="space-y-6">
      {/* 1. Header Navigation Breadcrumbs & Quick Persona Switcher */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#8A99AD] mb-1">
            <span>Settings</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-semibold text-[#465FFF] dark:text-[#80CAEE]">My Profile</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            Logged In User Profile
          </h2>
          <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
            Comprehensive account credentials, maritime authorizations, STCW certifications, and security governance.
          </p>
        </div>

        {/* Action Controls & Persona Switch */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Persona Switcher */}
          {usersList.length > 0 && onSwitchUser && (
            <div className="relative">
              <button
                id="switch-persona-btn"
                onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-[#465FFF] transition-colors shadow-2xs"
                title="Switch active user to preview different profiles"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#465FFF]" />
                <span>Switch User Persona</span>
              </button>

              {showSwitchDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-2 shadow-xl z-50 text-xs animate-in fade-in">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Select Active Persona
                  </div>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {usersList.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowSwitchDropdown(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-[#465FFF]/10 text-[#465FFF] font-bold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className="h-6 w-6 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-white bg-[#465FFF]">
                                {u.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-semibold truncate leading-tight">{u.fullName}</p>
                            <p className="text-[10px] text-gray-400 truncate leading-tight">{u.role}</p>
                          </div>
                        </div>
                        <span className="text-[10px] shrink-0 font-mono">
                          {u.userType === 'Superadmin' ? '👑' : u.userType === 'Port users' ? '⚓' : '🏢'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            id="open-id-card-btn"
            onClick={() => setIsIdCardModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:border-[#465FFF] transition-colors shadow-2xs cursor-pointer"
          >
            <IdCard className="h-3.5 w-3.5 text-blue-500" />
            <span>Digital Port ID</span>
          </button>

          <button
            id="edit-profile-btn"
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3b51e0] transition-colors shadow-md shadow-[#465FFF]/20 cursor-pointer"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* 2. Top Profile Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs">
        {/* Nautical Hydrographic Banner Top Pattern */}
        <div className="h-32 w-full bg-gradient-to-r from-[#1A237E] via-[#0D47A1] to-[#01579B] relative flex items-center justify-end px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 flex items-center gap-2 text-white/80 text-xs font-mono">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>IMO FAL NETWORK ONLINE</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>TERMINAL NODE: #2026-UG-MSA</span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div className="relative px-6 pb-6 pt-0">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-12">
            {/* Avatar & Identifiers */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative group">
                <div className="h-24 w-24 rounded-2xl border-4 border-white dark:border-[#1C2434] overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-white uppercase">
                      {currentUser.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <button
                  id="my-profile-hero-camera-btn"
                  type="button"
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity backdrop-blur-2xs cursor-pointer"
                  title="Update Profile Photo"
                >
                  <Camera className="h-5 w-5" />
                  <span className="text-[10px] font-bold mt-0.5">Edit Photo</span>
                </button>
                <span
                  className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white dark:border-[#1C2434] bg-emerald-500 z-10"
                  title="Active Session"
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentUser.fullName}
                  </h3>
                  {getUserTypeBadge(currentUser.userType)}
                  <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-[#24303F] px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300 font-mono">
                    @{currentUser.username}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-[#8A99AD]">
                  <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300">
                    <Briefcase className="h-3.5 w-3.5 text-[#465FFF]" />
                    <span>{currentUser.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    <span>{currentUser.organization || 'Voyage IS Global HQ'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{currentUser.department || 'Fleet Operations'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Badges on Right */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs">
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F] px-3 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">User ID</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">{currentUser.id}</span>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F] px-3 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Staff Ref</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {currentUser.staffId || 'STF-2001'}
                </span>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F] px-3 py-2 text-center">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {currentUser.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex overflow-x-auto border-t border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#1C2434] px-4">
          <button
            id="tab-profile-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Detailed Information &amp; Bio</span>
          </button>

          <button
            id="tab-profile-permissions"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'permissions'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Role Governance &amp; Permissions</span>
          </button>

          <button
            id="tab-profile-credentials"
            onClick={() => setActiveTab('credentials')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'credentials'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
            }`}
          >
            <FileBadge className="h-4 w-4" />
            <span>Maritime Qualifications &amp; ID</span>
          </button>

          <button
            id="tab-profile-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'security'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Security, MFA &amp; Sessions</span>
          </button>

          <button
            id="tab-profile-activity"
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 border-b-2 py-3 px-4 text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'activity'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Activity Log &amp; Audit Trail</span>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* TAB 1: DETAILED INFORMATION & BIO                   */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Main Info Fields */}
          <div className="space-y-6 lg:col-span-2">
            {/* Account & Operational Identity */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-[#2E3A47] pb-3">
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[#465FFF]" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Account &amp; Maritime Identity Details
                  </h3>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="text-xs font-semibold text-[#465FFF] dark:text-[#80CAEE] hover:underline flex items-center gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Update Details</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Official Full Name
                  </span>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{currentUser.fullName}</p>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    System Username
                  </span>
                  <p className="font-mono font-bold text-gray-900 dark:text-white text-sm">
                    {currentUser.username}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Primary Corporate Email
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{currentUser.email}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Port Contact / Mobile (SMS 8199 Gateway)
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{editForm.phone}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Organization / Entity
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    <Building2 className="h-3.5 w-3.5 text-gray-400" />
                    <span>{currentUser.organization || 'Voyage IS Global HQ'}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Assigned Department
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    <span>{currentUser.department || 'Executive Management'}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Assigned Vessel / Station
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    <Ship className="h-3.5 w-3.5 text-blue-500" />
                    <span>{currentUser.assignedVessel || 'All Fleet Vessels (Global Clearance)'}</span>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 dark:bg-[#24303F] p-3 border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-0.5">
                    Timezone &amp; Regional Standard
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-900 dark:text-white font-medium">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    <span>{editForm.timezone}</span>
                  </div>
                </div>
              </div>

              {/* Bio / Scope of Authority */}
              <div className="mt-4 rounded-xl bg-gray-50 dark:bg-[#24303F] p-3.5 border border-gray-100 dark:border-[#2E3A47]/60">
                <span className="text-gray-400 uppercase font-semibold text-[10px] block mb-1">
                  Professional Bio &amp; Operational Responsibilities
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-200 leading-relaxed">
                  {editForm.bio}
                </p>
              </div>
            </div>

            {/* Terminal Berth Location & Emergency Dispatch */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-3">
                <MapPin className="h-4 w-4 text-[#465FFF]" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Port Command Base &amp; Emergency Dispatch Channel
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase">
                    Primary Berth / Station Office
                  </span>
                  <p className="text-gray-900 dark:text-white font-medium">{editForm.location}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-gray-400 font-semibold text-[10px] uppercase">
                    Emergency Contact Line
                  </span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {editForm.emergencyContact}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Quick Status & Governance Highlights */}
          <div className="space-y-6">
            {/* System Governance Level */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Governance Tier</h3>
                <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 text-[10px]">
                  {currentUser.userType === 'Superadmin'
                    ? 'Tier 1 - Full Governance'
                    : currentUser.userType === 'Port users'
                    ? 'Tier 2 - Operational Admin'
                    : 'Tier 4 - External Authority'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Role Category</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{currentUser.userType}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Account Created</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{currentUser.createdAt}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Last Active Login</span>
                  <span className="font-mono text-gray-900 dark:text-white">{currentUser.lastLogin}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-gray-500 dark:text-[#8A99AD]">2-Factor Security</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {mfaActive ? 'Enforced & Verified' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-[#24303F] py-2 px-3 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#2E3A47] transition-colors cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Change Password</span>
                </button>
              </div>
            </div>

            {/* Quick Linked Crew / Seafarer Record (if linked) */}
            {linkedStaff && (
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-blue-700 dark:text-[#80CAEE]">
                  <Ship className="h-4 w-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Linked Staff / Seafarer Profile
                  </h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  This user account is linked to marine employee record{' '}
                  <strong className="text-gray-900 dark:text-white font-mono">{linkedStaff.staffId}</strong> (
                  {linkedStaff.role} • {linkedStaff.department}).
                </p>
                <div className="pt-1 text-[11px] text-gray-500 dark:text-[#8A99AD] space-y-1">
                  <div>CDC / Seaman Book: <strong className="text-gray-900 dark:text-white">{linkedStaff.seamanBookNo || 'SB-UG-99201'}</strong></div>
                  <div>Cert Expiry: <strong className="text-emerald-600 dark:text-emerald-400">{linkedStaff.certExpiry || '2028-12-31'}</strong></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: ROLE GOVERNANCE & PERMISSIONS MATRIX         */}
      {/* ==================================================== */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-[#2E3A47]">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Active Authorization &amp; Maritime Governance Scope
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                  Assigned permissions dictate clearance across IMO manifest generation, voyage clearance, safety logging, and user provisioning.
                </p>
              </div>

              {currentUser.isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 px-3 py-1.5 text-xs font-bold text-purple-700 dark:text-purple-300">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Unrestricted System Super Admin Scope</span>
                </span>
              )}
            </div>

            {/* Permission Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Module 1: Voyage Operations & Manifests */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ship className="h-4 w-4 text-[#465FFF]" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Voyage &amp; Manifests
                    </h4>
                  </div>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    Authorized
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Create &amp; Dispatch Voyage Schedules</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>IMO FAL 1-7 Manifest Exports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>SMS 8199 Passenger Self Check-in Access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Landing &amp; Departure Approvals</span>
                  </li>
                </ul>
              </div>

              {/* Module 2: Fleet & Planned Maintenance */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-blue-500" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Fleet &amp; Maintenance
                    </h4>
                  </div>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    Authorized
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Vessel Register &amp; Engine Telemetry</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Planned Maintenance System (PMS)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Dry Dock &amp; Class Survey Logs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Fuel &amp; Bunkering Verification</span>
                  </li>
                </ul>
              </div>

              {/* Module 3: Incidents, Safety & ISPS */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Safety &amp; Incidents
                    </h4>
                  </div>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    Authorized
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Log &amp; Investigate Maritime Incidents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>QHSE &amp; ISPS Security Level Updates</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Emergency SMS Broadcast Dispatch</span>
                  </li>
                </ul>
              </div>

              {/* Module 4: Hydrographic Map & Waterways */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-teal-500" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      Hydrographic &amp; AIS
                    </h4>
                  </div>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    Authorized
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Uganda Maritime &amp; Inland Lake Charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Real-time AIS Telemetry &amp; Speed Tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Port Berths &amp; Navigation Buoy Overlays</span>
                  </li>
                </ul>
              </div>

              {/* Module 5: User & Role Provisioning */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-500" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      User Governance
                    </h4>
                  </div>
                  <span
                    className={`rounded text-[10px] font-bold px-2 py-0.5 ${
                      currentUser.isSuperAdmin
                        ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                        : 'bg-gray-100 dark:bg-[#24303F] text-gray-500'
                    }`}
                  >
                    {currentUser.isSuperAdmin ? 'Full Admin' : 'View Only'}
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>User Account &amp; Role Management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Permission Matrix Customization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Security Audit Trail &amp; MFA Enforcements</span>
                  </li>
                </ul>
              </div>

              {/* Module 6: System Settings & Integrations */}
              <div className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]/60 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-indigo-500" />
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                      System &amp; Settings
                    </h4>
                  </div>
                  <span className="rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                    Authorized
                  </span>
                </div>
                <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>SMTP &amp; SMS Gateway Gateway Setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Dynamic Lookups &amp; IMO Dropdowns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>Fleet Notification Rules</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: MARITIME QUALIFICATIONS & ID BADGES           */}
      {/* ==================================================== */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Maritime Licenses & Endorsements */}
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#465FFF]" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Maritime Licensure &amp; STCW Endorsements
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  All Licenses Valid
                </span>
              </div>

              <div className="space-y-3">
                {/* Cert 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#465FFF] dark:text-[#80CAEE]">
                      <FileBadge className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        STCW Master Mariner Class 1 (Unlimited)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                        Reg II/2 • IMO STCW Convention Endorsed
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        License: MM-UNL-889102-UG • Issuing Authority: Maritime Admin
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:shrink-0 text-xs">
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                      Valid until 2028-10-15
                    </span>
                  </div>
                </div>

                {/* Cert 2 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                      <Radio className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        GMDSS General Operator Certificate (GOC)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                        Reg IV/2 • Global Maritime Distress &amp; Safety System
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        License: GOC-GMDSS-54129 • High Frequency &amp; VHF Radar
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:shrink-0 text-xs">
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                      Valid until 2027-08-30
                    </span>
                  </div>
                </div>

                {/* Cert 3 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        ISPS Ship &amp; Port Facility Security Officer (PFSO)
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                        International Ship and Port Facility Security Code
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                        License: ISPS-PFSO-00412 • Level 3 Terminal Security
                      </p>
                    </div>
                  </div>
                  <div className="text-right sm:shrink-0 text-xs">
                    <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                      Valid until 2029-01-20
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Fitness & Passport */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Seafarer Travel, Passport &amp; Medical Clearance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Seaman Book (CDC)</span>
                  <p className="font-mono font-bold text-gray-900 dark:text-white mt-0.5">SB-UG-998210</p>
                  <span className="text-[10px] text-emerald-500">Active</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">National Passport</span>
                  <p className="font-mono font-bold text-gray-900 dark:text-white mt-0.5">PAS-UG-881290</p>
                  <span className="text-[10px] text-gray-400">Exp: 2031-04-12</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">ENG1 Medical Fitness</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Fit for Duty</p>
                  <span className="text-[10px] text-gray-400">Exp: 2027-06-18</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Digital Port Pass Preview Card */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-gradient-to-b from-[#1C2434] to-[#101827] text-white p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#465FFF]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Ship className="h-4 w-4 text-[#80CAEE]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Port Security Pass
                  </span>
                </div>
                <span className="rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5">
                  ISPS Level 3
                </span>
              </div>

              <div className="py-4 flex items-center gap-3.5">
                <div className="h-16 w-16 rounded-xl border-2 border-white/20 overflow-hidden bg-[#465FFF] shrink-0">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-xl">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight text-white">{currentUser.fullName}</h4>
                  <p className="text-[11px] text-gray-300">{currentUser.role}</p>
                  <p className="text-[10px] text-[#80CAEE] font-mono mt-0.5">{currentUser.organization}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] py-2 border-t border-b border-white/10 text-gray-300">
                <div>
                  <span className="text-gray-500 block uppercase">Pass ID</span>
                  <span className="font-mono text-white font-semibold">PASS-UG-2026-081</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase">Berth Clearance</span>
                  <span className="text-white font-semibold">Unrestricted</span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                  <QrCode className="h-6 w-6 text-white" />
                  <span>SCAN FOR IMO VERIFICATION</span>
                </div>
                <button
                  onClick={() => setIsIdCardModalOpen(true)}
                  className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors"
                >
                  Expand Pass
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsIdCardModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-2.5 px-3 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-[#465FFF] transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-[#465FFF]" />
              <span>Download Digital ID PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 4: SECURITY, MFA & ACTIVE SESSIONS              */}
      {/* ==================================================== */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left 2 Cols: Password & 2FA */}
          <div className="space-y-6 lg:col-span-2">
            {/* Password Credentials */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Password &amp; Access Authentication
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                    Manage your cryptographic access passkey and terminal authentication credentials.
                  </p>
                </div>
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#3b51e0] transition-colors shadow-2xs cursor-pointer"
                >
                  <Key className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Password Status</span>
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Strong &amp; Verified</p>
                  <span className="text-[10px] text-gray-400">Last changed 2 weeks ago</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">TLS Encryption</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">TLS 1.3 End-to-End</p>
                  <span className="text-[10px] text-gray-400">Port Authority Validated</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <span className="text-gray-400 text-[10px] uppercase font-bold block">Session Timeout</span>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">8 Hours Inactive</p>
                  <span className="text-[10px] text-gray-400">Auto terminal lock</span>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication (2FA) */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:text-[#80CAEE]">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Two-Factor Authentication (2FA / MFA)
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                      Enforce one-time security codes dispatch via Port SMS Shortcode 8199 or Authenticator App.
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-mfa-btn"
                  onClick={handleToggleMfa}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    mfaActive ? 'bg-[#465FFF]' : 'bg-gray-200 dark:bg-[#2E3A47]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      mfaActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>SMS 8199 Port Dispatch Backup Channel is configured for {editForm.phone}.</span>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-[11px]">Active</span>
              </div>
            </div>

            {/* Active Terminal Sessions */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-2">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Active Logged In Sessions
                </h3>
                <button
                  onClick={() => onShowToast('All remote terminal sessions except current were terminated.')}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
                >
                  Sign Out Other Devices
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {/* Current Session */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Chrome on macOS (Current Terminal)
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-[#8A99AD] font-mono">
                        IP: 197.239.4.18 (Kampala / Lake Victoria Command Gateway) • Active Now
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 text-[10px]">
                    Current Session
                  </span>
                </div>

                {/* Secondary Bridge Terminal */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <div className="flex items-center gap-3">
                    <Ship className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">
                        Vessel Bridge Master ECDIS Terminal
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-[#8A99AD] font-mono">
                        IP: 41.220.12.88 (VOYAGER TITAN Satellite Node) • 4 hours ago
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">Standby</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Personal API Token */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-[#465FFF]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                  Bridge API Token
                </h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Personal token for AIS telemetry synchronization and automated IMO manifest exports.
              </p>
              <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#24303F] font-mono text-[11px] text-gray-800 dark:text-gray-200 break-all select-all">
                voy_live_8910a7b489c0012f9e...
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText('voy_live_8910a7b489c0012f9e449210');
                  onShowToast('Personal API token copied to clipboard.');
                }}
                className="w-full rounded-xl bg-gray-100 dark:bg-[#24303F] py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition-colors"
              >
                Copy API Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 5: ACTIVITY LOG & OPERATIONAL AUDIT TRAIL       */}
      {/* ==================================================== */}
      {activeTab === 'activity' && (
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Recent Audit Trail &amp; Manifest Actions
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Detailed timeline of transactions, manifest approvals, and configuration changes executed by {currentUser.fullName}.
              </p>
            </div>
            <span className="text-xs text-gray-400 font-mono">Last 7 Days</span>
          </div>

          <div className="space-y-3">
            {[
              {
                action: 'Approved Voyage Departure Manifest',
                ref: 'VOY-2026-0819 (MV KAWA - Jinja to Kisumu)',
                time: 'Today at 08:45 AM',
                icon: Ship,
                color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
              },
              {
                action: 'Exported IMO FAL Form 6 (Passenger Manifest)',
                ref: '142 Verified Passengers with SMS 8199 Tokens',
                time: 'Yesterday at 16:30 PM',
                icon: FileText,
                color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
              },
              {
                action: 'Updated Vessel Planned Maintenance Schedule',
                ref: 'VOYAGER TITAN - Main Engine Cylinder Overhaul',
                time: '2026-08-26 11:15 AM',
                icon: Sliders,
                color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
              },
              {
                action: 'Port Security Terminal Sign In',
                ref: 'Lake Victoria Port Gateway (MFA Verified)',
                time: '2026-08-25 09:14 AM',
                icon: ShieldCheck,
                color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60"
              >
                <div className={`p-2 rounded-lg ${item.color} shrink-0`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {item.action}
                    </h4>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] font-mono mt-0.5 truncate">
                    {item.ref}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: EDIT PROFILE MODAL                          */}
      {/* ==================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="h-5 w-5 text-[#465FFF]" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Edit User Profile Information
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              {/* Profile Image Uploader */}
              <div className="pt-1">
                <ProfileImageUploader
                  currentImageUrl={editForm.avatarUrl}
                  name={editForm.fullName}
                  roleOrDepartment={editForm.role || editForm.department}
                  onImageChange={(img) => setEditForm((prev) => ({ ...prev, avatarUrl: img }))}
                  label="Profile Picture & Identification Avatar"
                  idPrefix="my-profile-modal-avatar"
                  compact={false}
                  allowPresets={true}
                  helperText="Upload official staff photo or identity avatar (PNG, JPG, WEBP, GIF up to 8MB)"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Official Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    disabled
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-100 dark:bg-[#1A222C] px-3.5 py-2 text-xs text-gray-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Mobile Phone (SMS 8199 Gateway)
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Organization / Entity
                  </label>
                  <input
                    type="text"
                    value={editForm.organization}
                    onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                    Assigned Vessel / Station
                  </label>
                  <input
                    type="text"
                    value={editForm.assignedVessel}
                    onChange={(e) => setEditForm({ ...editForm, assignedVessel: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Port Command Base Location
                </label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Professional Bio &amp; Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-3 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-bold text-white hover:bg-[#3b51e0] transition-colors shadow-md shadow-[#465FFF]/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: CHANGE PASSWORD MODAL                       */}
      {/* ==================================================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#465FFF]" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Change Password
                </h3>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={passwordForm.showCurrent ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 pr-9 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordForm({ ...passwordForm, showCurrent: !passwordForm.showCurrent })
                    }
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {passwordForm.showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  New Security Password *
                </label>
                <div className="relative">
                  <input
                    type={passwordForm.showNew ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="At least 8 characters"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 pr-9 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPasswordForm({ ...passwordForm, showNew: !passwordForm.showNew })
                    }
                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {passwordForm.showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  placeholder="Re-type new password"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-[11px] text-blue-700 dark:text-[#80CAEE]">
                Password must contain at least 8 characters with numbers, upper &amp; lower case letters.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-bold text-white hover:bg-[#3b51e0] transition-colors"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: DIGITAL PORT PASS / IMO ID EXPANDED MODAL   */}
      {/* ==================================================== */}
      {isIdCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3">
              <div className="flex items-center gap-2">
                <IdCard className="h-5 w-5 text-[#465FFF]" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Official Maritime Digital Port Pass
                </h3>
              </div>
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Printable ID Card Design */}
            <div className="rounded-2xl border border-blue-900 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white p-6 shadow-2xl relative overflow-hidden text-center space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-2 text-[10px] uppercase tracking-widest text-gray-300">
                <span>Voyage IS Maritime Authority</span>
                <span className="font-bold text-[#80CAEE]">ISPS Compliant</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-2xl border-2 border-[#80CAEE] overflow-hidden bg-[#465FFF] shadow-md mb-3">
                  {currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-2xl">
                      {currentUser.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-bold text-white">{currentUser.fullName}</h4>
                <p className="text-xs text-[#80CAEE] font-semibold">{currentUser.role}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{currentUser.organization}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-[10px] bg-white/5 p-3 rounded-xl border border-white/10 font-mono">
                <div>
                  <span className="text-gray-400 block uppercase">User ID:</span>
                  <span className="text-white font-bold">{currentUser.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase">Staff Ref:</span>
                  <span className="text-white font-bold">{currentUser.staffId || 'STF-2001'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase">Access Level:</span>
                  <span className="text-emerald-400 font-bold">Unrestricted Port Area</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase">Validity:</span>
                  <span className="text-white font-bold">2028-12-31</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <QrCode className="h-10 w-10 text-white" />
                <div className="text-[9px] text-left text-gray-400 font-mono">
                  <div>DIGITAL SIGNATURE HASH:</div>
                  <div className="text-white">0x8A79B01F4E9281A</div>
                  <div>IMO FAL CONVENTION 2026</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsIdCardModalOpen(false)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onShowToast('Digital Port Pass downloaded.');
                  setIsIdCardModalOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-bold text-white hover:bg-[#3b51e0] transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save ID Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
