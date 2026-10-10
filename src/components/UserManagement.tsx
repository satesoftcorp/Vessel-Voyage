import React, { useState, useMemo } from 'react';
import { SystemUser, SystemRole, PermissionItem, StaffMember, UserType, RoleCategory } from '../types';
import { ProfileImageUploader } from './ProfileImageUploader';
import {
  Users,
  ShieldCheck,
  KeyRound,
  UserCheck,
  Lock,
  Search,
  Filter,
  Plus,
  Camera,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  ChevronDown,
  Layers,
  Sparkles,
  UserPlus,
  RefreshCw,
  Download,
  Check,
  X,
  Sliders,
  Eye,
  Info,
  BadgeCheck,
  Globe,
  Radio,
  Link as LinkIcon,
  ExternalLink,
  Shield,
  Clock,
  Mail,
  UserX,
  Power,
  ChevronRight,
  Sparkle,
  Fingerprint,
  Anchor,
  Building,
  Briefcase,
  Wrench,
  Compass,
  FileCheck,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Copy,
} from 'lucide-react';

interface UserManagementProps {
  initialSubTab?: 'users' | 'roles' | 'permissions';
  initialTab?: 'users' | 'roles' | 'permissions';
  usersList?: SystemUser[];
  users?: SystemUser[];
  rolesList?: SystemRole[];
  roles?: SystemRole[];
  permissionsMatrix?: PermissionItem[];
  permissions?: PermissionItem[];
  staffList?: StaffMember[];
  onAddUser?: (user: SystemUser) => void;
  onUpdateUser?: (user: SystemUser) => void;
  onDeleteUser?: (userId: string) => void;
  onAddRole?: (role: SystemRole) => void;
  onUpdateRole?: (role: SystemRole) => void;
  onDeleteRole?: (roleId: string) => void;
  onUpdatePermissionItem?: (
    updatedItemOrId: PermissionItem | string,
    roleCode?: keyof PermissionItem | string,
    granted?: boolean
  ) => void;
  onResetPermissionsToDefault?: () => void;
  onNavigateToStaffProfile?: () => void;
  onShowToast?: (msg: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  initialSubTab,
  initialTab,
  usersList,
  users,
  rolesList,
  roles,
  permissionsMatrix,
  permissions,
  staffList = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onUpdatePermissionItem,
  onResetPermissionsToDefault,
  onNavigateToStaffProfile,
  onShowToast,
}) => {
  // Normalize incoming props
  const currentUsers = useMemo(() => usersList || users || [], [usersList, users]);
  const currentRoles = useMemo(() => rolesList || roles || [], [rolesList, roles]);
  const currentPermissions = useMemo(
    () => permissionsMatrix || permissions || [],
    [permissionsMatrix, permissions]
  );

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>(
    initialTab || initialSubTab || 'users'
  );

  // Sync tab when prop changes
  React.useEffect(() => {
    const target = initialTab || initialSubTab;
    if (target) {
      setActiveTab(target);
    }
  }, [initialTab, initialSubTab]);

  // Tab 1: Users State & Filters
  const [userSearch, setUserSearch] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'ALL' | UserType>('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [userMfaFilter, setUserMfaFilter] = useState('ALL');
  const [userDeptFilter, setUserDeptFilter] = useState('ALL');
  const [userStaffLinkFilter, setUserStaffLinkFilter] = useState('ALL');

  // Tab 2: Roles State & Filters
  const [rolesUserTypeTab, setRolesUserTypeTab] = useState<'ALL' | UserType>('ALL');
  const [roleSearch, setRoleSearch] = useState('');

  // Tab 3: Permissions Matrix State & User Type Tabs
  const [matrixUserTypeTab, setMatrixUserTypeTab] = useState<UserType | 'ALL'>('Superadmin');
  const [permModuleFilter, setPermModuleFilter] = useState('ALL');
  const [permSearch, setPermSearch] = useState('');
  const [matrixSaveToast, setMatrixSaveToast] = useState(false);

  // Modals & Drawers
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [inspectingUser, setInspectingUser] = useState<SystemUser | null>(null);
  const [linkingUser, setLinkingUser] = useState<SystemUser | null>(null);
  const [selectedStaffToLink, setSelectedStaffToLink] = useState('');

  // Role Creation / Edit Modal
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleFormData, setRoleFormData] = useState<{
    name: string;
    code: string;
    userType: UserType;
    tier: SystemRole['tier'];
    description: string;
    baseRoleToCopy: string;
    selectedPermIds: string[];
  }>({
    name: '',
    code: '',
    userType: 'Port users',
    tier: 'Tier 3 - Vessel & Terminal Command',
    description: '',
    baseRoleToCopy: '',
    selectedPermIds: [],
  });

  // Add/Edit User Form State
  const [userFormData, setUserFormData] = useState<Partial<SystemUser>>({
    username: '',
    fullName: '',
    email: '',
    userType: 'Port users',
    role: 'Staff User',
    roleId: 'ROL-002',
    organization: '',
    department: 'Deck Department',
    status: 'Active',
    isSuperAdmin: false,
    mfaEnabled: true,
    staffId: '',
    assignedVessel: '',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  });

  // Unique departments for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    currentUsers.forEach((u) => {
      if (u.department) set.add(u.department);
    });
    return Array.from(set);
  }, [currentUsers]);

  // Summary Metrics calculations
  const totalUsersCount = currentUsers.length;
  const superAdminCount = currentUsers.filter(
    (u) => u.userType === 'Superadmin' || u.isSuperAdmin || u.role === 'Super Admin'
  ).length;
  const portUsersCount = currentUsers.filter(
    (u) => u.userType === 'Port users' || (!u.userType && !u.isSuperAdmin && u.role !== 'Port & Maritime Authority Officer' && u.role !== 'Cargo Owner / Shipper Representative' && u.role !== 'Customs & Border Protection Inspector' && u.role !== 'Marine Insurance Surveyor & P&I Auditor')
  ).length;
  const stakeholdersCount = currentUsers.filter(
    (u) => u.userType === 'Stakeholders' || u.roleCategory === 'Stakeholders' || u.role.includes('Authority') || u.role.includes('Cargo') || u.role.includes('Customs') || u.role.includes('Insurance') || u.role.includes('Charterer')
  ).length;

  const activeUsersCount = currentUsers.filter((u) => u.status === 'Active').length;
  const mfaEnforcedCount = currentUsers.filter((u) => u.mfaEnabled).length;
  const mfaEnforcedPercent = totalUsersCount > 0 ? Math.round((mfaEnforcedCount / totalUsersCount) * 100) : 0;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return currentUsers.filter((u) => {
      const q = userSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q) ||
        (u.organization && u.organization.toLowerCase().includes(q)) ||
        (u.assignedVessel && u.assignedVessel.toLowerCase().includes(q)) ||
        (u.staffId && u.staffId.toLowerCase().includes(q));

      const matchesUserType =
        userTypeFilter === 'ALL' ||
        u.userType === userTypeFilter ||
        (userTypeFilter === 'Superadmin' && (u.isSuperAdmin || u.role === 'Super Admin')) ||
        (userTypeFilter === 'Stakeholders' && u.roleCategory === 'Stakeholders');

      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
      const matchesMfa =
        userMfaFilter === 'ALL' ||
        (userMfaFilter === 'MFA_ENABLED' && u.mfaEnabled) ||
        (userMfaFilter === 'MFA_DISABLED' && !u.mfaEnabled);
      const matchesDept = userDeptFilter === 'ALL' || u.department === userDeptFilter;

      const isLinked = !!u.staffId && staffList.some((s) => s.id === u.staffId || s.staffId === u.staffId);
      const matchesStaffLink =
        userStaffLinkFilter === 'ALL' ||
        (userStaffLinkFilter === 'LINKED' && isLinked) ||
        (userStaffLinkFilter === 'UNLINKED' && !isLinked);

      return matchesSearch && matchesUserType && matchesRole && matchesStatus && matchesMfa && matchesDept && matchesStaffLink;
    });
  }, [currentUsers, userSearch, userTypeFilter, userRoleFilter, userStatusFilter, userMfaFilter, userDeptFilter, userStaffLinkFilter, staffList]);

  // Roles filtered by user type
  const filteredRoles = useMemo(() => {
    return currentRoles.filter((r) => {
      const matchesType = rolesUserTypeTab === 'ALL' || r.userType === rolesUserTypeTab || r.category === rolesUserTypeTab;
      const q = roleSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [currentRoles, rolesUserTypeTab, roleSearch]);

  // Unique modules in Permission Matrix
  const permModules = useMemo(() => {
    return Array.from(new Set(currentPermissions.map((p) => p.module)));
  }, [currentPermissions]);

  // Filtered Permissions Matrix
  const filteredPermissions = useMemo(() => {
    return currentPermissions.filter((p) => {
      const matchesModule = permModuleFilter === 'ALL' || p.module === permModuleFilter;
      const q = permSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q);

      return matchesModule && matchesSearch;
    });
  }, [currentPermissions, permModuleFilter, permSearch]);

  // Helper to map role code or name to permission property key
  const getRolePermKey = (role: SystemRole): string => {
    const code = role.code.toUpperCase();
    if (code === 'SUPER_ADMIN') return 'superAdmin';
    if (code === 'SEC_COMPLIANCE_DIR' || code.includes('SECURITY')) return 'securityAuditor';
    if (code === 'TENANT_ADMIN') return 'tenantAdmin';
    if (code === 'STAFF_USER') return 'staffUser';
    if (code === 'FLEET_MGR') return 'fleetManager';
    if (code === 'CAPTAIN') return 'vesselCaptain';
    if (code === 'SAFETY_OFFICER') return 'safetyOfficer';
    if (code === 'PORT_LOGISTICS') return 'portLogistics';
    if (code === 'HARBOR_MASTER') return 'harborMaster';
    if (code === 'CHIEF_ENGINEER') return 'chiefEngineer';
    if (code === 'CREWING_OFFICER') return 'crewingOfficer';
    if (code === 'PORT_AUTHORITY') return 'portAuthority';
    if (code === 'CARGO_OWNER') return 'cargoOwner';
    if (code === 'CHARTERER_BROKER') return 'charterer';
    if (code === 'CUSTOMS_INSPECTOR') return 'customsInspector';
    if (code === 'INSURANCE_SURVEYOR') return 'insuranceSurveyor';
    if (code === 'ENV_REGULATOR') return 'environmentalRegulator';
    return role.code.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  // Roles partitioned by User Type for the matrix
  const superadminRolesInMatrix = useMemo(() => {
    return currentRoles.filter((r) => r.userType === 'Superadmin' || r.category === 'Superadmin' || r.code === 'SUPER_ADMIN' || r.code === 'SEC_COMPLIANCE_DIR' || r.code === 'TENANT_ADMIN');
  }, [currentRoles]);

  const portUserRolesInMatrix = useMemo(() => {
    return currentRoles.filter((r) => r.userType === 'Port users' || r.category === 'Port users' || (!r.userType && r.category === 'Staff'));
  }, [currentRoles]);

  const stakeholderRolesInMatrix = useMemo(() => {
    return currentRoles.filter((r) => r.userType === 'Stakeholders' || r.category === 'Stakeholders');
  }, [currentRoles]);

  // Selected roles to display in Matrix table based on matrixUserTypeTab
  const activeMatrixRoles = useMemo(() => {
    if (matrixUserTypeTab === 'Superadmin') return superadminRolesInMatrix;
    if (matrixUserTypeTab === 'Port users') return portUserRolesInMatrix;
    if (matrixUserTypeTab === 'Stakeholders') return stakeholderRolesInMatrix;
    return currentRoles;
  }, [matrixUserTypeTab, superadminRolesInMatrix, portUserRolesInMatrix, stakeholderRolesInMatrix, currentRoles]);

  // Handle open add user modal
  const handleOpenAddUser = (defaultUserType: UserType = 'Port users') => {
    setEditingUserId(null);
    const availableRolesForType = currentRoles.filter(
      (r) => r.userType === defaultUserType || r.category === defaultUserType
    );
    const defaultRole = availableRolesForType[0]?.name || 'Staff User';
    const defaultRoleId = availableRolesForType[0]?.id || 'ROL-002';

    setUserFormData({
      username: '',
      fullName: '',
      email: '',
      userType: defaultUserType,
      role: defaultRole,
      roleId: defaultRoleId,
      organization: defaultUserType === 'Stakeholders' ? 'Maritime Partners Entity' : defaultUserType === 'Superadmin' ? 'Voyage IS Global HQ' : 'Port Operations Hub',
      department: defaultUserType === 'Stakeholders' ? 'Regulatory Affairs' : defaultUserType === 'Superadmin' ? 'Executive Management' : 'Deck Department',
      status: 'Active',
      isSuperAdmin: defaultUserType === 'Superadmin',
      mfaEnabled: true,
      staffId: '',
      assignedVessel: '',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    });
    setIsAddUserModalOpen(true);
  };

  // Handle open edit user modal
  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUserId(user.id);
    setUserFormData({ ...user });
    setIsAddUserModalOpen(true);
  };

  // Handle User Form UserType Change
  const handleUserTypeChangeInForm = (newUserType: UserType) => {
    const availableRolesForType = currentRoles.filter(
      (r) => r.userType === newUserType || r.category === newUserType
    );
    const defaultRole = availableRolesForType[0]?.name || (newUserType === 'Superadmin' ? 'Super Admin' : newUserType === 'Stakeholders' ? 'Port & Maritime Authority Officer' : 'Staff User');
    const defaultRoleId = availableRolesForType[0]?.id || 'ROL-002';

    setUserFormData((prev) => ({
      ...prev,
      userType: newUserType,
      role: defaultRole,
      roleId: defaultRoleId,
      isSuperAdmin: newUserType === 'Superadmin',
      organization: prev.organization || (newUserType === 'Stakeholders' ? 'External Authority' : 'Voyage IS Fleet'),
    }));
  };

  // Handle link staff selection
  const handleSelectStaffLink = (staffId: string) => {
    const stf = staffList.find((s) => s.id === staffId || s.staffId === staffId);
    if (stf) {
      setUserFormData((prev) => ({
        ...prev,
        staffId: stf.id,
        fullName: prev.fullName || stf.fullName,
        email: prev.email || stf.email,
        department: stf.department || prev.department,
        assignedVessel: stf.assignedVessel || prev.assignedVessel,
        avatarUrl: stf.avatarUrl || prev.avatarUrl,
      }));
    } else {
      setUserFormData((prev) => ({ ...prev, staffId: '' }));
    }
  };

  // Handle submit user
  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.fullName || !userFormData.username || !userFormData.email) {
      if (onShowToast) onShowToast('Please fill in required fields');
      return;
    }

    const assignedRoleObj = currentRoles.find((r) => r.name === userFormData.role);
    const finalRoleCategory = assignedRoleObj?.userType || userFormData.userType || 'Port users';
    const isSuper = userFormData.userType === 'Superadmin' || userFormData.role === 'Super Admin';

    if (editingUserId) {
      const updated: SystemUser = {
        ...(userFormData as SystemUser),
        id: editingUserId,
        userType: userFormData.userType || 'Port users',
        roleCategory: finalRoleCategory,
        isSuperAdmin: isSuper,
      };
      if (onUpdateUser) onUpdateUser(updated);
    } else {
      const newUser: SystemUser = {
        id: `USR-${String(currentUsers.length + 1).padStart(3, '0')}`,
        username: userFormData.username || '',
        email: userFormData.email || '',
        fullName: userFormData.fullName || '',
        userType: userFormData.userType || 'Port users',
        role: userFormData.role || 'Staff User',
        roleId: userFormData.roleId || 'ROL-002',
        roleCategory: finalRoleCategory,
        organization: userFormData.organization || 'Voyage IS Platform',
        department: userFormData.department || 'Operations',
        status: userFormData.status || 'Active',
        isSuperAdmin: isSuper,
        mfaEnabled: userFormData.mfaEnabled ?? true,
        lastLogin: 'Never',
        staffId: userFormData.staffId || undefined,
        assignedVessel: userFormData.assignedVessel || undefined,
        avatarUrl:
          userFormData.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString().split('T')[0],
      };
      if (onAddUser) onAddUser(newUser);
    }

    setIsAddUserModalOpen(false);
  };

  // Handle Quick link modal confirm
  const handleConfirmLinkStaff = () => {
    if (!linkingUser || !selectedStaffToLink) return;
    const stf = staffList.find((s) => s.id === selectedStaffToLink || s.staffId === selectedStaffToLink);
    if (!stf) return;

    const updatedUser: SystemUser = {
      ...linkingUser,
      staffId: stf.id,
      department: stf.department || linkingUser.department,
      assignedVessel: stf.assignedVessel || linkingUser.assignedVessel,
    };

    if (onUpdateUser) onUpdateUser(updatedUser);
    setLinkingUser(null);
    setSelectedStaffToLink('');
    if (onShowToast) onShowToast(`Linked user ${linkingUser.fullName} to staff record ${stf.fullName}`);
  };

  // Handle unlink staff
  const handleUnlinkStaff = (user: SystemUser) => {
    const updated: SystemUser = { ...user, staffId: undefined };
    if (onUpdateUser) onUpdateUser(updated);
    if (onShowToast) onShowToast(`Unlinked ${user.fullName} from staff directory`);
  };

  // Handle Open Create Role Modal based on User Type
  const handleOpenCreateRole = (defaultUserType: UserType = 'Port users') => {
    setEditingRoleId(null);
    let defaultTier: SystemRole['tier'] = 'Tier 3 - Vessel & Terminal Command';
    if (defaultUserType === 'Superadmin') defaultTier = 'Tier 1 - Full Governance';
    if (defaultUserType === 'Stakeholders') defaultTier = 'Tier 5 - External Stakeholder';

    setRoleFormData({
      name: '',
      code: '',
      userType: defaultUserType,
      tier: defaultTier,
      description: '',
      baseRoleToCopy: '',
      selectedPermIds: [],
    });
    setIsCreateRoleModalOpen(true);
  };

  // Handle Copy Permissions Template from Existing Role
  const handleApplyRoleTemplate = (templateRoleName: string) => {
    if (!templateRoleName) return;
    const roleObj = currentRoles.find((r) => r.name === templateRoleName);
    if (!roleObj) return;

    const permKey = getRolePermKey(roleObj);
    const activePermIds = currentPermissions
      .filter((p) => {
        if (roleObj.code === 'SUPER_ADMIN') return true;
        return !!p[permKey];
      })
      .map((p) => p.id);

    setRoleFormData((prev) => ({
      ...prev,
      baseRoleToCopy: templateRoleName,
      selectedPermIds: activePermIds,
      tier: roleObj.tier,
    }));
  };

  // Handle Submit Create / Edit Role
  const handleSubmitRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleFormData.name || !roleFormData.code) {
      if (onShowToast) onShowToast('Please provide a Role Name and Code');
      return;
    }

    const formattedCode = roleFormData.code.toUpperCase().replace(/\s+/g, '_');
    const permKey = formattedCode.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (editingRoleId) {
      const existing = currentRoles.find((r) => r.id === editingRoleId);
      if (existing && onUpdateRole) {
        const updatedRole: SystemRole = {
          ...existing,
          name: roleFormData.name,
          code: formattedCode,
          userType: roleFormData.userType,
          category: roleFormData.userType,
          tier: roleFormData.tier,
          description: roleFormData.description,
          permissionsCount: roleFormData.selectedPermIds.length,
        };
        onUpdateRole(updatedRole);
      }
    } else {
      const newRole: SystemRole = {
        id: `ROL-${String(currentRoles.length + 1).padStart(3, '0')}`,
        name: roleFormData.name,
        code: formattedCode,
        userType: roleFormData.userType,
        category: roleFormData.userType,
        tier: roleFormData.tier,
        description: roleFormData.description || `Custom ${roleFormData.userType} role.`,
        userCount: 0,
        isSystemDefault: false,
        permissionsCount: roleFormData.selectedPermIds.length,
      };

      if (onAddRole) {
        onAddRole(newRole);
      }

      // Update permissions matrix with the new role's selected permissions
      if (onUpdatePermissionItem) {
        currentPermissions.forEach((perm) => {
          const isGranted = roleFormData.selectedPermIds.includes(perm.id);
          onUpdatePermissionItem(perm.id, permKey, isGranted);
        });
      }
    }

    setIsCreateRoleModalOpen(false);
  };

  // Handle Toggle Permission in Matrix
  const handleTogglePermission = (
    permId: string,
    roleKey: keyof PermissionItem | string
  ) => {
    if (roleKey === 'superAdmin') {
      if (onShowToast) onShowToast('Super Admin permissions are immutable root policies');
      return;
    }

    const perm = currentPermissions.find((p) => p.id === permId);
    if (!perm) return;

    const currentVal = !!perm[roleKey];
    const newVal = !currentVal;

    if (onUpdatePermissionItem) {
      onUpdatePermissionItem(permId, roleKey, newVal);
    }

    setMatrixSaveToast(true);
    setTimeout(() => setMatrixSaveToast(false), 2000);
  };

  // Batch Grant/Revoke All in Current Matrix Tab
  const handleBatchToggleMatrix = (grant: boolean) => {
    if (!onUpdatePermissionItem) return;
    activeMatrixRoles.forEach((role) => {
      const permKey = getRolePermKey(role);
      if (permKey === 'superAdmin') return; // Do not touch locked root
      filteredPermissions.forEach((perm) => {
        onUpdatePermissionItem(perm.id, permKey, grant);
      });
    });
    if (onShowToast) {
      onShowToast(
        grant
          ? `Granted all permissions for ${matrixUserTypeTab} roles`
          : `Restricted all permissions for ${matrixUserTypeTab} roles`
      );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* HEADER: SaaS Multi-Tenancy Identity & 3 User Types Hero */}
      <div className="rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#465FFF] text-white shadow-sm shadow-[#465FFF]/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    SaaS User &amp; Access Governance
                  </h1>
                  <span className="rounded-full bg-[#465FFF]/10 dark:bg-[#465FFF]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#465FFF] border border-[#465FFF]/20 uppercase tracking-wider">
                    3 User Types Architecture
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                  Multi-tenant role-based access control (RBAC) organized across Superadmin, Port users, and Stakeholders.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="create-role-btn"
              onClick={() => handleOpenCreateRole('Port users')}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2E3A47] transition-all shadow-2xs"
            >
              <KeyRound className="h-4 w-4 text-[#465FFF]" />
              <span>Create Role by User Type</span>
            </button>

            <button
              id="invite-user-btn"
              onClick={() => handleOpenAddUser('Port users')}
              className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5] transition-all shadow-xs shadow-[#465FFF]/30"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite &amp; Provision User</span>
            </button>
          </div>
        </div>

        {/* 3 USER TYPES ARCHITECTURE METRIC CARDS */}
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {/* Card 1: Superadmin */}
          <div
            onClick={() => {
              setUserTypeFilter('Superadmin');
              setRolesUserTypeTab('Superadmin');
              setMatrixUserTypeTab('Superadmin');
            }}
            className="group cursor-pointer rounded-2xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/40 dark:bg-purple-950/20 p-4 transition-all hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300">
                    Superadmin
                  </span>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400">
                    Root Governance &amp; Security
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold text-purple-900 dark:text-white">
                {superAdminCount}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-purple-800 dark:text-purple-300/80 pt-2.5 border-t border-purple-200/60 dark:border-purple-900/40">
              <span>{superadminRolesInMatrix.length} Defined Roles</span>
              <span className="font-semibold group-hover:underline">View Roles &amp; Matrix →</span>
            </div>
          </div>

          {/* Card 2: Port users */}
          <div
            onClick={() => {
              setUserTypeFilter('Port users');
              setRolesUserTypeTab('Port users');
              setMatrixUserTypeTab('Port users');
            }}
            className="group cursor-pointer rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                  <Anchor className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                    Port Users
                  </span>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">
                    Fleet, Logistics &amp; Bridge Command
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold text-blue-900 dark:text-white">
                {portUsersCount}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-blue-800 dark:text-blue-300/80 pt-2.5 border-t border-blue-200/60 dark:border-blue-900/40">
              <span>{portUserRolesInMatrix.length} Operational Roles</span>
              <span className="font-semibold group-hover:underline">View Roles &amp; Matrix →</span>
            </div>
          </div>

          {/* Card 3: Stakeholders */}
          <div
            onClick={() => {
              setUserTypeFilter('Stakeholders');
              setRolesUserTypeTab('Stakeholders');
              setMatrixUserTypeTab('Stakeholders');
            }}
            className="group cursor-pointer rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                    Stakeholders
                  </span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Authorities, Shippers &amp; Underwriters
                  </p>
                </div>
              </div>
              <span className="text-xl font-bold text-emerald-900 dark:text-white">
                {stakeholdersCount}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-emerald-800 dark:text-emerald-300/80 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-900/40">
              <span>{stakeholderRolesInMatrix.length} Partner Roles</span>
              <span className="font-semibold group-hover:underline">View Roles &amp; Matrix →</span>
            </div>
          </div>
        </div>

        {/* PRIMARY SUB-NAVIGATION TABS */}
        <div className="mt-6 flex border-b border-gray-100 dark:border-[#2E3A47]">
          <button
            id="tab-users-directory"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold transition-colors border-b-2 -mb-px mr-6 ${
              activeTab === 'users'
                ? 'border-[#465FFF] text-[#465FFF]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>User Directory ({currentUsers.length})</span>
          </button>

          <button
            id="tab-roles-management"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold transition-colors border-b-2 -mb-px mr-6 ${
              activeTab === 'roles'
                ? 'border-[#465FFF] text-[#465FFF]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Roles by User Type ({currentRoles.length})</span>
          </button>

          <button
            id="tab-permissions-matrix"
            onClick={() => setActiveTab('permissions')}
            className={`flex items-center gap-2 pb-3 text-xs font-bold transition-colors border-b-2 -mb-px ${
              activeTab === 'permissions'
                ? 'border-[#465FFF] text-[#465FFF]'
                : 'border-transparent text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Permission Matrix (User Types Tabs)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS DIRECTORY                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* User Types Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-400 mr-2">User Type:</span>
              <button
                onClick={() => setUserTypeFilter('ALL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  userTypeFilter === 'ALL'
                    ? 'bg-[#465FFF] text-white shadow-2xs'
                    : 'bg-gray-50 dark:bg-[#24303F] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2E3A47]'
                }`}
              >
                All User Types ({currentUsers.length})
              </button>

              <button
                onClick={() => setUserTypeFilter('Superadmin')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  userTypeFilter === 'Superadmin'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                }`}
              >
                <Shield className="h-3 w-3" />
                <span>Superadmin ({superAdminCount})</span>
              </button>

              <button
                onClick={() => setUserTypeFilter('Port users')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  userTypeFilter === 'Port users'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <Anchor className="h-3 w-3" />
                <span>Port Users ({portUsersCount})</span>
              </button>

              <button
                onClick={() => setUserTypeFilter('Stakeholders')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  userTypeFilter === 'Stakeholders'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Building className="h-3 w-3" />
                <span>Stakeholders ({stakeholdersCount})</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending Activation">Pending Activation</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Search & Secondary Filters */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="search-users-input"
                type="text"
                placeholder="Search by name, username, email, organization, vessel..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] py-2 pl-9.5 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                {currentRoles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.userType})
                  </option>
                ))}
              </select>

              <select
                value={userMfaFilter}
                onChange={(e) => setUserMfaFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-none"
              >
                <option value="ALL">All 2FA</option>
                <option value="MFA_ENABLED">2FA Enforced</option>
                <option value="MFA_DISABLED">2FA Disabled</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500 dark:text-[#8A99AD]">
                <thead className="bg-gray-50/80 dark:bg-[#24303F]/60 text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-[#2E3A47]">
                  <tr>
                    <th className="px-4 py-3.5">User Identity</th>
                    <th className="px-4 py-3.5">SaaS User Type</th>
                    <th className="px-4 py-3.5">Assigned Role</th>
                    <th className="px-4 py-3.5">Organization &amp; Dept</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">2FA / Security</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        <Users className="mx-auto h-8 w-8 mb-2 opacity-40" />
                        <p className="text-xs font-semibold">No users found matching your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const userType =
                        u.userType ||
                        (u.isSuperAdmin || u.role === 'Super Admin'
                          ? 'Superadmin'
                          : u.roleCategory === 'Stakeholders'
                          ? 'Stakeholders'
                          : 'Port users');

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-gray-50/60 dark:hover:bg-[#24303F]/30 transition-colors"
                        >
                          {/* User Avatar & Info */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={u.avatarUrl}
                                alt={u.fullName}
                                className="h-9 w-9 rounded-full object-cover border border-gray-200 dark:border-[#2E3A47]"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.fullName}</span>
                                </div>
                                <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
                                  <span>@{u.username}</span>
                                  <span>•</span>
                                  <span>{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* SaaS User Type Badge */}
                          <td className="px-4 py-3.5">
                            {userType === 'Superadmin' && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                                <Shield className="h-3 w-3" />
                                Superadmin
                              </span>
                            )}
                            {userType === 'Port users' && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                                <Anchor className="h-3 w-3" />
                                Port Users
                              </span>
                            )}
                            {userType === 'Stakeholders' && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                <Building className="h-3 w-3" />
                                Stakeholders
                              </span>
                            )}
                          </td>

                          {/* Role */}
                          <td className="px-4 py-3.5">
                            <div>
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {u.role}
                              </span>
                              {u.assignedVessel && (
                                <div className="text-[10px] text-gray-400 mt-0.5">
                                  Vessel: {u.assignedVessel}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Organization & Dept */}
                          <td className="px-4 py-3.5">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                {u.organization || 'Voyage IS Platform'}
                              </span>
                              <div className="text-[10px] text-gray-400">
                                {u.department || 'Operations'}
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                u.status === 'Active'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                                  : u.status === 'Pending Activation'
                                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                                  : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  u.status === 'Active'
                                    ? 'bg-emerald-500'
                                    : u.status === 'Pending Activation'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                              />
                              {u.status}
                            </span>
                          </td>

                          {/* 2FA */}
                          <td className="px-4 py-3.5">
                            {u.mfaEnabled ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                2FA Enforced
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
                                <XCircle className="h-3.5 w-3.5" />
                                Disabled
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setInspectingUser(u)}
                                title="Inspect User Account & Access"
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit User"
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-[#465FFF] dark:hover:bg-[#24303F]"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {onDeleteUser && !u.isSuperAdmin && (
                                <button
                                  onClick={() => onDeleteUser(u.id)}
                                  title="Delete User"
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/30"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
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
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLES BY USER TYPE                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* User Type Tabs for Roles */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3.5 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-gray-400 mr-2">Filter Roles by User Type:</span>
              <button
                onClick={() => setRolesUserTypeTab('ALL')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  rolesUserTypeTab === 'ALL'
                    ? 'bg-[#465FFF] text-white shadow-2xs'
                    : 'bg-gray-50 dark:bg-[#24303F] text-gray-600 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                All Roles ({currentRoles.length})
              </button>

              <button
                onClick={() => setRolesUserTypeTab('Superadmin')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  rolesUserTypeTab === 'Superadmin'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                }`}
              >
                <Shield className="h-3 w-3" />
                <span>Superadmin Roles ({superadminRolesInMatrix.length})</span>
              </button>

              <button
                onClick={() => setRolesUserTypeTab('Port users')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  rolesUserTypeTab === 'Port users'
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                }`}
              >
                <Anchor className="h-3 w-3" />
                <span>Port User Roles ({portUserRolesInMatrix.length})</span>
              </button>

              <button
                onClick={() => setRolesUserTypeTab('Stakeholders')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                  rolesUserTypeTab === 'Stakeholders'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Building className="h-3 w-3" />
                <span>Stakeholder Roles ({stakeholderRolesInMatrix.length})</span>
              </button>
            </div>

            <button
              onClick={() => handleOpenCreateRole(rolesUserTypeTab === 'ALL' ? 'Port users' : rolesUserTypeTab)}
              className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#3b52f5] shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>
                Create Role for {rolesUserTypeTab === 'ALL' ? 'Selected User Type' : rolesUserTypeTab}
              </span>
            </button>
          </div>

          {/* Roles Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRoles.map((role) => {
              const assignedUsersCount = currentUsers.filter(
                (u) => u.role === role.name || (role.code === 'SUPER_ADMIN' && u.isSuperAdmin)
              ).length;

              const roleUserType = role.userType || role.category || 'Port users';

              return (
                <div
                  key={role.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs hover:border-[#465FFF]/50 transition-all group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            roleUserType === 'Superadmin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                              : roleUserType === 'Port users'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          }`}
                        >
                          {roleUserType === 'Superadmin' ? (
                            <Shield className="h-5 w-5" />
                          ) : roleUserType === 'Port users' ? (
                            <Anchor className="h-5 w-5" />
                          ) : (
                            <Building className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                            {role.name}
                          </h3>
                          <span className="text-[10px] font-mono text-gray-400">{role.code}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          roleUserType === 'Superadmin'
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
                            : roleUserType === 'Port users'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}
                      >
                        {roleUserType}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-[#24303F] text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                        {role.tier}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {role.permissionsCount || 12} Capabilities
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {role.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        <strong className="text-gray-900 dark:text-white">
                          {assignedUsersCount}
                        </strong>{' '}
                        Assigned
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setMatrixUserTypeTab(roleUserType);
                        setActiveTab('permissions');
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#465FFF] hover:underline"
                    >
                      <span>Configure in Matrix</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERMISSION MATRIX WITH USER TYPES TABS                             */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="space-y-5">
          {/* Toast Notice */}
          {matrixSaveToast && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-4 py-2.5 text-xs font-semibold shadow-xl animate-in slide-in-from-bottom">
              <Check className="h-4 w-4" />
              <span>Permission Matrix policy updated live</span>
            </div>
          )}

          {/* USER TYPE TABS IN PERMISSION MATRIX */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
                  Select User Type Permission Matrix:
                </span>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Tab 1: Superadmin */}
                  <button
                    id="matrix-tab-superadmin"
                    onClick={() => setMatrixUserTypeTab('Superadmin')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      matrixUserTypeTab === 'Superadmin'
                        ? 'bg-purple-600 text-white shadow-xs shadow-purple-600/30'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
                    }`}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Superadmin Matrix ({superadminRolesInMatrix.length} Roles)</span>
                  </button>

                  {/* Tab 2: Port users */}
                  <button
                    id="matrix-tab-port-users"
                    onClick={() => setMatrixUserTypeTab('Port users')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      matrixUserTypeTab === 'Port users'
                        ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                        : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
                    }`}
                  >
                    <Anchor className="h-4 w-4" />
                    <span>Port Users Matrix ({portUserRolesInMatrix.length} Roles)</span>
                  </button>

                  {/* Tab 3: Stakeholders */}
                  <button
                    id="matrix-tab-stakeholders"
                    onClick={() => setMatrixUserTypeTab('Stakeholders')}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      matrixUserTypeTab === 'Stakeholders'
                        ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <Building className="h-4 w-4" />
                    <span>Stakeholders Matrix ({stakeholderRolesInMatrix.length} Roles)</span>
                  </button>

                  {/* Tab 4: Unified */}
                  <button
                    id="matrix-tab-unified"
                    onClick={() => setMatrixUserTypeTab('ALL')}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      matrixUserTypeTab === 'ALL'
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-xs'
                        : 'bg-gray-100 dark:bg-[#24303F] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Unified All Matrix</span>
                  </button>
                </div>
              </div>

              {/* Quick Action: Create Role for this user type */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleOpenCreateRole(
                      matrixUserTypeTab === 'ALL' ? 'Port users' : matrixUserTypeTab
                    )
                  }
                  className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5] shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>
                    Create{' '}
                    {matrixUserTypeTab === 'ALL'
                      ? 'New Role'
                      : `${matrixUserTypeTab} Role`}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Context Banner */}
          <div
            className={`rounded-2xl border p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs ${
              matrixUserTypeTab === 'Superadmin'
                ? 'border-purple-200 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20'
                : matrixUserTypeTab === 'Port users'
                ? 'border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20'
                : matrixUserTypeTab === 'Stakeholders'
                ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20'
                : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#24303F]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white ${
                  matrixUserTypeTab === 'Superadmin'
                    ? 'bg-purple-600'
                    : matrixUserTypeTab === 'Port users'
                    ? 'bg-blue-600'
                    : matrixUserTypeTab === 'Stakeholders'
                    ? 'bg-emerald-600'
                    : 'bg-gray-800'
                }`}
              >
                {matrixUserTypeTab === 'Superadmin' ? (
                  <Shield className="h-4 w-4" />
                ) : matrixUserTypeTab === 'Port users' ? (
                  <Anchor className="h-4 w-4" />
                ) : matrixUserTypeTab === 'Stakeholders' ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
              </div>
              <div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {matrixUserTypeTab === 'Superadmin'
                    ? 'Superadmin Access Control Matrix:'
                    : matrixUserTypeTab === 'Port users'
                    ? 'Port Users Access Control Matrix:'
                    : matrixUserTypeTab === 'Stakeholders'
                    ? 'Stakeholders Access Control Matrix:'
                    : 'Unified Cross-Tenant Access Matrix:'}
                </span>{' '}
                <span className="text-gray-600 dark:text-gray-300">
                  {matrixUserTypeTab === 'Superadmin'
                    ? 'Super Admin has master immutable permissions. Security & Compliance Director and Tenant Admins can be fine-tuned.'
                    : matrixUserTypeTab === 'Port users'
                    ? 'Operational roles governing fleet voyages, crew watchkeeping, vessel maintenance, and harbor logistics.'
                    : matrixUserTypeTab === 'Stakeholders'
                    ? 'External partners (Port authorities, cargo owners, brokers, customs inspectors, P&I surveyors) with targeted visibility.'
                    : 'Global matrix displaying all active SaaS security tiers.'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleBatchToggleMatrix(true)}
                className="rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Grant All in Tab
              </button>
              <button
                onClick={() => handleBatchToggleMatrix(false)}
                className="rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-2.5 py-1 text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
              >
                Restrict All
              </button>
              {onResetPermissionsToDefault && (
                <button
                  id="reset-permissions-btn"
                  onClick={onResetPermissionsToDefault}
                  className="flex items-center gap-1 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-white dark:bg-[#1C2434] px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Defaults</span>
                </button>
              )}
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="permission-search-input"
                type="text"
                placeholder={`Search permissions in ${matrixUserTypeTab} matrix...`}
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] py-2 pl-9.5 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Filter Module:</span>
              <select
                id="filter-permission-module"
                value={permModuleFilter}
                onChange={(e) => setPermModuleFilter(e.target.value)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-none"
              >
                <option value="ALL">All Modules ({currentPermissions.length})</option>
                {permModules.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* THE DYNAMIC PERMISSION MATRIX TABLE */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-500 dark:text-[#8A99AD]">
                <thead className="bg-gray-50/90 dark:bg-[#24303F]/60 text-[11px] font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-[#2E3A47]">
                  <tr>
                    <th className="px-4 py-3.5 min-w-[280px]">
                      Permission Capability &amp; Module
                    </th>
                    {activeMatrixRoles.map((role) => {
                      const isSuper = role.code === 'SUPER_ADMIN';
                      return (
                        <th
                          key={role.id}
                          className={`px-3 py-3.5 text-center min-w-[130px] ${
                            isSuper
                              ? 'bg-purple-50/60 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-bold truncate max-w-[120px] text-gray-900 dark:text-white" title={role.name}>
                              {role.name}
                            </span>
                            <span className="text-[9px] font-normal opacity-75 truncate max-w-[120px]">
                              {role.userType || role.category}
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
                  {filteredPermissions.map((perm) => (
                    <tr
                      key={perm.id}
                      className="hover:bg-gray-50/60 dark:hover:bg-[#24303F]/30 transition-colors"
                    >
                      {/* Permission Description */}
                      <td className="px-4 py-3.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {perm.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-gray-100 dark:bg-[#2E3A47] text-gray-500">
                              {perm.module}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-500 dark:text-[#8A99AD] leading-normal">
                            {perm.description}
                          </p>
                        </div>
                      </td>

                      {/* Dynamic Role Permission Cells */}
                      {activeMatrixRoles.map((role) => {
                        const permKey = getRolePermKey(role);
                        const isSuper = role.code === 'SUPER_ADMIN';
                        const isGranted = isSuper || !!perm[permKey];

                        if (isSuper) {
                          return (
                            <td
                              key={role.id}
                              className="px-3 py-3.5 text-center bg-purple-50/20 dark:bg-purple-950/10"
                            >
                              <div className="flex items-center justify-center">
                                <span
                                  title="Super Admin has immutable master permissions"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white shadow-2xs"
                                >
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                </span>
                              </div>
                            </td>
                          );
                        }

                        return (
                          <td key={role.id} className="px-3 py-3.5 text-center">
                            <div className="flex items-center justify-center">
                              <button
                                id={`perm-toggle-${role.id}-${perm.id}`}
                                onClick={() => handleTogglePermission(perm.id, permKey)}
                                title={`Toggle ${perm.name} for ${role.name}`}
                                className={`flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                                  isGranted
                                    ? role.userType === 'Superadmin'
                                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                                      : role.userType === 'Stakeholders'
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                                      : 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-300 dark:text-gray-600 border-gray-200 dark:border-[#2E3A47]'
                                }`}
                              >
                                {isGranted ? (
                                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                                ) : (
                                  <X className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE ROLE BASED ON USER TYPE                                   */}
      {/* ========================================================================= */}
      {isCreateRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#465FFF]/10 text-[#465FFF]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Create Role Based on User Type
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Assign role under Superadmin, Port users, or Stakeholders.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateRoleModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRole} className="mt-4 space-y-4 text-xs">
              {/* STEP 1: USER TYPE SELECTION */}
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-2">
                  1. Select SaaS User Type *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <div
                    onClick={() =>
                      setRoleFormData((prev) => ({
                        ...prev,
                        userType: 'Superadmin',
                        tier: 'Tier 1 - Full Governance',
                      }))
                    }
                    className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                      roleFormData.userType === 'Superadmin'
                        ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/20'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:border-gray-300'
                    }`}
                  >
                    <Shield className="mx-auto h-4 w-4 mb-1 text-purple-600" />
                    <span className="font-bold block">Superadmin</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Platform Owner</span>
                  </div>

                  <div
                    onClick={() =>
                      setRoleFormData((prev) => ({
                        ...prev,
                        userType: 'Port users',
                        tier: 'Tier 3 - Vessel & Terminal Command',
                      }))
                    }
                    className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                      roleFormData.userType === 'Port users'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-600/20'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:border-gray-300'
                    }`}
                  >
                    <Anchor className="mx-auto h-4 w-4 mb-1 text-blue-600" />
                    <span className="font-bold block">Port Users</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Operations &amp; Bridge</span>
                  </div>

                  <div
                    onClick={() =>
                      setRoleFormData((prev) => ({
                        ...prev,
                        userType: 'Stakeholders',
                        tier: 'Tier 5 - External Stakeholder',
                      }))
                    }
                    className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                      roleFormData.userType === 'Stakeholders'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-600/20'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:border-gray-300'
                    }`}
                  >
                    <Building className="mx-auto h-4 w-4 mb-1 text-emerald-600" />
                    <span className="font-bold block">Stakeholders</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">Authorities &amp; Shippers</span>
                  </div>
                </div>
              </div>

              {/* STEP 2: ROLE NAME & CODE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Role Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Berth Operations Lead"
                    value={roleFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const code = name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
                      setRoleFormData((prev) => ({ ...prev, name, code: prev.code ? prev.code : code }));
                    }}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Role Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BERTH_OPS_LEAD"
                    value={roleFormData.code}
                    onChange={(e) => setRoleFormData({ ...roleFormData, code: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* STEP 3: AUTHORITY TIER & TEMPLATE COPY */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Authority Tier
                  </label>
                  <select
                    value={roleFormData.tier}
                    onChange={(e) =>
                      setRoleFormData({
                        ...roleFormData,
                        tier: e.target.value as SystemRole['tier'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Tier 1 - Full Governance">Tier 1 - Full Governance</option>
                    <option value="Tier 2 - Operational Admin">Tier 2 - Operational Admin</option>
                    <option value="Tier 3 - Vessel & Terminal Command">
                      Tier 3 - Vessel &amp; Terminal Command
                    </option>
                    <option value="Tier 4 - Standard Port Staff">
                      Tier 4 - Standard Port Staff
                    </option>
                    <option value="Tier 5 - External Stakeholder">
                      Tier 5 - External Stakeholder
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Copy Template from {roleFormData.userType} Role
                  </label>
                  <select
                    value={roleFormData.baseRoleToCopy}
                    onChange={(e) => handleApplyRoleTemplate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="">-- Custom Permissions --</option>
                    {currentRoles
                      .filter(
                        (r) =>
                          r.userType === roleFormData.userType ||
                          r.category === roleFormData.userType
                      )
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Role Scope &amp; Responsibilities Description
                </label>
                <textarea
                  rows={2}
                  placeholder={`Describes what this ${roleFormData.userType} role governs...`}
                  value={roleFormData.description}
                  onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              {/* STEP 4: GRANULAR PERMISSION CAPABILITIES SELECTION */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-gray-900 dark:text-white">
                    Initial Capabilities ({roleFormData.selectedPermIds.length} Selected)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRoleFormData((prev) => ({
                          ...prev,
                          selectedPermIds: currentPermissions.map((p) => p.id),
                        }))
                      }
                      className="text-[11px] text-[#465FFF] hover:underline"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setRoleFormData((prev) => ({ ...prev, selectedPermIds: [] }))
                      }
                      className="text-[11px] text-gray-400 hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] p-2 bg-gray-50/50 dark:bg-[#24303F]/50">
                  {currentPermissions.map((perm) => {
                    const isSelected = roleFormData.selectedPermIds.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#1C2434] border border-gray-100 dark:border-[#2E3A47] cursor-pointer hover:border-[#465FFF]/50"
                      >
                        <div className="flex items-center gap-2 mr-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRoleFormData((prev) => ({
                                  ...prev,
                                  selectedPermIds: [...prev.selectedPermIds, perm.id],
                                }));
                              } else {
                                setRoleFormData((prev) => ({
                                  ...prev,
                                  selectedPermIds: prev.selectedPermIds.filter(
                                    (id) => id !== perm.id
                                  ),
                                }));
                              }
                            }}
                            className="h-3.5 w-3.5 rounded border-gray-300 text-[#465FFF] focus:ring-[#465FFF]"
                          />
                          <div>
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block text-[11px]">
                              {perm.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {perm.module} • {perm.code}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                          }`}
                        >
                          {isSelected ? 'Granted' : 'Off'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsCreateRoleModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5]"
                >
                  Save &amp; Create {roleFormData.userType} Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INVITE & PROVISION USER                                          */}
      {/* ========================================================================= */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF]">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingUserId ? 'Edit User Account' : 'Invite & Provision User Account'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    Configures SaaS user type, role access tier, and maritime link.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUser} className="mt-4 space-y-4 text-xs">
              {/* User Profile Image Uploader */}
              <ProfileImageUploader
                currentImageUrl={userFormData.avatarUrl}
                name={userFormData.fullName}
                roleOrDepartment={userFormData.role || userFormData.department}
                onImageChange={(img) => setUserFormData((prev) => ({ ...prev, avatarUrl: img }))}
                label="User Account Photo & Avatar"
                idPrefix="user-mgmt-modal-avatar"
                compact={false}
                allowPresets={true}
                helperText="Upload official user account photo or identity avatar (PNG, JPG, WEBP, GIF)"
              />

              {/* SaaS User Type Selector */}
              <div>
                <label className="block font-bold text-gray-900 dark:text-white mb-1.5">
                  SaaS User Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div
                    onClick={() => handleUserTypeChangeInForm('Superadmin')}
                    className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all ${
                      userFormData.userType === 'Superadmin'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold ring-2 ring-purple-600/20'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:border-gray-300'
                    }`}
                  >
                    <Shield className="mx-auto h-3.5 w-3.5 mb-1 text-purple-600" />
                    <span>Superadmin</span>
                  </div>

                  <div
                    onClick={() => handleUserTypeChangeInForm('Port users')}
                    className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all ${
                      userFormData.userType === 'Port users'
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold ring-2 ring-blue-600/20'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:border-gray-300'
                    }`}
                  >
                    <Anchor className="mx-auto h-3.5 w-3.5 mb-1 text-blue-600" />
                    <span>Port Users</span>
                  </div>

                  <div
                    onClick={() => handleUserTypeChangeInForm('Stakeholders')}
                    className={`cursor-pointer rounded-xl border p-2.5 text-center transition-all ${
                      userFormData.userType === 'Stakeholders'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold ring-2 ring-emerald-600/20'
                        : 'border-gray-200 dark:border-[#2E3A47] hover:border-gray-300'
                    }`}
                  >
                    <Building className="mx-auto h-3.5 w-3.5 mb-1 text-emerald-600" />
                    <span>Stakeholders</span>
                  </div>
                </div>
              </div>

              {/* Optional Link with Staff Profile (Port Users) */}
              {userFormData.userType === 'Port users' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Link with Existing Staff Profile (Optional)
                  </label>
                  <select
                    value={userFormData.staffId || ''}
                    onChange={(e) => handleSelectStaffLink(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="">None / Standalone User Account</option>
                    {staffList.map((stf) => (
                      <option key={stf.id} value={stf.id}>
                        {stf.fullName} ({stf.staffId}) - {stf.role}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Full Name & Username */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    placeholder="e.g. Henrik Lindqvist"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                    placeholder="e.g. henrik.captain"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="name@organization.com"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              {/* Role (Filtered by selected User Type!) & Organization */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Role ({userFormData.userType}) *
                  </label>
                  <select
                    value={userFormData.role}
                    onChange={(e) => {
                      const selectedRoleName = e.target.value;
                      const roleObj = currentRoles.find((r) => r.name === selectedRoleName);
                      setUserFormData({
                        ...userFormData,
                        role: selectedRoleName,
                        roleId: roleObj?.id || 'ROL-002',
                      });
                    }}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    {currentRoles
                      .filter(
                        (r) =>
                          r.userType === userFormData.userType ||
                          r.category === userFormData.userType ||
                          (!r.userType && userFormData.userType === 'Port users' && r.category === 'Staff')
                      )
                      .map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Organization / Entity
                  </label>
                  <input
                    type="text"
                    value={userFormData.organization || ''}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, organization: e.target.value })
                    }
                    placeholder="e.g. Port of Rotterdam / Shipper"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={userFormData.department}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, department: e.target.value })
                    }
                    placeholder="Deck Department"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={userFormData.status}
                    onChange={(e) =>
                      setUserFormData({
                        ...userFormData,
                        status: e.target.value as SystemUser['status'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Activation">Pending Activation</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* 2FA Enforce */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer rounded-xl border border-gray-200 dark:border-[#2E3A47] p-3 bg-gray-50/50 dark:bg-[#24303F]">
                  <input
                    type="checkbox"
                    checked={userFormData.mfaEnabled}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, mfaEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#465FFF] focus:ring-[#465FFF]"
                  />
                  <div>
                    <span className="font-semibold text-gray-900 dark:text-white block">
                      Enforce Multi-Factor Authentication (2FA)
                    </span>
                    <span className="text-[11px] text-gray-400 block">
                      Requires TOTP Authenticator code upon signing into Voyage IS.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#3b52f5]"
                >
                  {editingUserId ? 'Update User Account' : 'Save & Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: USER INSPECTION DRAWER                                           */}
      {/* ========================================================================= */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingUser.avatarUrl}
                  alt={inspectingUser.fullName}
                  className="h-12 w-12 rounded-full object-cover border-2 border-[#465FFF] shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{inspectingUser.fullName}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        inspectingUser.userType === 'Superadmin' || inspectingUser.isSuperAdmin
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                          : inspectingUser.userType === 'Stakeholders'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}
                    >
                      {inspectingUser.userType || 'Port Users'}
                    </span>
                  </h3>
                  <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
                    <span>@{inspectingUser.username}</span>
                    <span>•</span>
                    <span>{inspectingUser.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs">
              {/* Core Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 p-3">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Role</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 block">
                    {inspectingUser.role}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 p-3">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Organization</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 block truncate">
                    {inspectingUser.organization || 'Voyage IS Platform'}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 p-3">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">2FA Status</span>
                  <span
                    className={`text-xs font-bold mt-0.5 block ${
                      inspectingUser.mfaEnabled ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {inspectingUser.mfaEnabled ? 'Enforced' : 'Disabled'}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 p-3">
                  <span className="text-[10px] font-semibold text-gray-400 block uppercase">Status</span>
                  <span className="text-xs font-bold mt-0.5 block text-emerald-600">
                    {inspectingUser.status}
                  </span>
                </div>
              </div>

              {/* Linked Staff Member Section */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-4 bg-white dark:bg-[#1C2434]">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs flex items-center justify-between">
                  <span>Linked Maritime Staff Directory Identity</span>
                  {inspectingUser.staffId && onNavigateToStaffProfile && (
                    <button
                      onClick={() => {
                        setInspectingUser(null);
                        onNavigateToStaffProfile();
                      }}
                      className="text-[11px] font-semibold text-[#465FFF] hover:underline flex items-center gap-1"
                    >
                      <span>Open in Staff Directory</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </h4>

                {inspectingUser.staffId ? (
                  (() => {
                    const stf = staffList.find(
                      (s) => s.id === inspectingUser.staffId || s.staffId === inspectingUser.staffId
                    );
                    if (!stf) {
                      return (
                        <p className="mt-2 text-gray-400 text-xs">
                          Staff ID: <code className="text-gray-700 dark:text-gray-300">{inspectingUser.staffId}</code>
                        </p>
                      );
                    }
                    return (
                      <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#24303F]">
                        <div className="flex items-center gap-3">
                          <img
                            src={stf.avatarUrl}
                            alt={stf.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">
                              {stf.fullName} ({stf.staffId})
                            </div>
                            <div className="text-gray-500 dark:text-gray-400 text-[11px]">
                              {stf.rank || stf.role} • {stf.department} • Assigned Vessel: {stf.assignedVessel || 'Shore Logistics'}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            handleUnlinkStaff(inspectingUser);
                            setInspectingUser((prev) => (prev ? { ...prev, staffId: undefined } : null));
                          }}
                          className="text-[11px] text-rose-600 hover:underline"
                        >
                          Unlink Profile
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  <div className="mt-3 flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#24303F]">
                    <span className="text-gray-400">This user is currently a standalone system login.</span>
                    <button
                      onClick={() => {
                        setLinkingUser(inspectingUser);
                        setInspectingUser(null);
                      }}
                      className="rounded-lg bg-[#465FFF] px-3 py-1 text-white font-semibold text-[11px] hover:bg-[#3b52f5]"
                    >
                      Link to Staff Member
                    </button>
                  </div>
                )}
              </div>

              {/* Effective Access Privileges Snapshot */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-4 bg-white dark:bg-[#1C2434]">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs mb-2">
                  Effective Module Permissions ({inspectingUser.role} • {inspectingUser.userType || 'Port Users'})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {currentPermissions.slice(0, 8).map((perm) => {
                    const matchedRole = currentRoles.find((r) => r.name === inspectingUser.role);
                    const permKey = matchedRole ? getRolePermKey(matchedRole) : 'staffUser';
                    const isGranted =
                      inspectingUser.isSuperAdmin ||
                      inspectingUser.role === 'Super Admin' ||
                      !!perm[permKey];

                    return (
                      <div
                        key={perm.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50/75 dark:bg-[#24303F]/60"
                      >
                        <div className="truncate mr-2">
                          <span className="font-medium text-gray-800 dark:text-gray-200 block truncate">
                            {perm.name}
                          </span>
                          <span className="text-[10px] text-gray-400">{perm.module}</span>
                        </div>
                        {isGranted ? (
                          <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold text-[10px]">
                            <Check className="h-3 w-3" />
                            Granted
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-gray-400 font-medium text-[10px]">
                            <X className="h-3 w-3" />
                            Restricted
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity & Timeline Footer */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-4 border-t border-gray-100 dark:border-[#2E3A47] text-gray-400 text-[11px]">
                <div>
                  <span>Account Created: <strong>{inspectingUser.createdAt || '2026-01-10'}</strong></span>
                  <span className="mx-2">•</span>
                  <span>Last Activity: <strong>{inspectingUser.lastLogin || 'Never'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const target = inspectingUser;
                      setInspectingUser(null);
                      handleOpenEditUser(target);
                    }}
                    className="rounded-xl bg-[#465FFF] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#3b52f5]"
                  >
                    Edit Account
                  </button>
                  <button
                    onClick={() => setInspectingUser(null)}
                    className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-3.5 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: QUICK LINK USER TO STAFF PROFILE                                 */}
      {/* ========================================================================= */}
      {linkingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2E3A47]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF]">
                  <LinkIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Link Staff Profile
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                    Associate user <span className="font-semibold text-gray-900 dark:text-white">{linkingUser.fullName}</span> with Crew Directory.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkingUser(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <label className="block font-semibold text-gray-700 dark:text-gray-300">
                Select Staff Directory Member:
              </label>
              <select
                value={selectedStaffToLink}
                onChange={(e) => setSelectedStaffToLink(e.target.value)}
                className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
              >
                <option value="">-- Choose a Staff Profile --</option>
                {staffList.map((stf) => (
                  <option key={stf.id} value={stf.id}>
                    {stf.fullName} ({stf.staffId}) • {stf.role} • {stf.department}
                  </option>
                ))}
              </select>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Linking ties all crew certifications, vessel endorsements, and watchkeeping records to this system login.
              </p>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setLinkingUser(null)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLinkStaff}
                  disabled={!selectedStaffToLink}
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white hover:bg-[#3b52f5] disabled:opacity-50"
                >
                  Confirm Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
