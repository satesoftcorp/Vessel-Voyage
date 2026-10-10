import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AuthPage } from './components/AuthPage';
import { VesselsRegisterTable } from './components/VesselsRegisterTable';
import { CrewRegisterTable } from './components/CrewRegisterTable';
import { VesselsMaintenanceTable } from './components/VesselsMaintenanceTable';
import { WaterBodyPortsManager } from './components/WaterBodyPortsManager';
import { StaffManager } from './components/StaffManager';
import { StaffProfileView } from './components/StaffProfileView';
import { MyProfileView } from './components/MyProfileView';
import { UserManagement } from './components/UserManagement';
import { VoyageRegisterTable } from './components/VoyageRegisterTable';
import { VoyageLandingTable } from './components/VoyageLandingTable';
import { IncidentsTable } from './components/IncidentsTable';
import { CalendarView } from './components/CalendarView';
import { ManifestManager } from './components/ManifestManager';
import { PassengerManifestView } from './components/PassengerManifestView';
import { CargoManifestView } from './components/CargoManifestView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { LookupsManager } from './components/LookupsManager';
import { ChatView } from './components/ChatView';
import { EmailInboxView } from './components/EmailInboxView';
import { SupportTicketsView } from './components/SupportTicketsView';
import { CommandPalette } from './components/CommandPalette';
import { MaritimeOperationsDashboard } from './components/dashboard/MaritimeOperationsDashboard';
import { AnalyticsTimeframe } from './components/AnalyticsBarChart';
import { UgandaWaterBodiesMap } from './components/UgandaWaterBodiesMap';
import {
  initialAnalyticsKPI,
  analytics30DaysData,
  analyticsMonthWeeksData,
  analytics12MonthsData,
  analytics7DaysData,
  analytics24HoursData,
  topChannelsData,
  topPagesData,
  initialActiveUsersPoints,
} from './data/analyticsData';
import {
  initialVesselsData,
  initialCrewData,
  initialMaintenanceData,
  initialWaterBodiesData,
  initialPortsData,
  initialStaffData,
  initialVoyageData,
  initialLandingData,
  initialIncidentsData,
  initialUsersData,
  initialRolesData,
  initialPermissionsMatrix,
  initialPassengersData,
  initialCargoData,
  initialNotificationSettings,
  initialSmtpConfig,
  initialSmsApiConfig,
} from './data/voyageData';
import {
  initialLookupCategories,
  initialLookupsData,
} from './data/lookupsData';
import {
  TrafficChannel,
  TopPageItem,
  Vessel,
  CrewMember,
  VesselMaintenanceTask,
  WaterBody,
  PortRecord,
  StaffMember,
  VoyageRecord,
  LandingRecord,
  IncidentRecord,
  SystemUser,
  SystemRole,
  PermissionItem,
  PassengerManifestRecord,
  CargoManifestRecord,
  SystemNotificationSettings,
  SmtpConnectionConfig,
  SmsApiConnectionConfig,
  LookupCategory,
  LookupItem,
} from './types';
import {
  CheckCircle2,
  ArrowLeft,
  LayoutGrid,
  Ship,
  Users,
  Wrench,
  Waves,
  Anchor,
  Users2,
  Compass,
  FileSpreadsheet,
  Sliders,
  PieChart,
  Sun,
  Moon,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function App() {
  // Theme state: default is Light Mode as requested in the screenshot
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');

  // Analytics Dashboard State
  const [kpis, setKpis] = useState(initialAnalyticsKPI);
  const [timeframe, setTimeframe] = useState<AnalyticsTimeframe>('30 days');
  const [channels] = useState<TrafficChannel[]>(topChannelsData);
  const [pages] = useState<TopPageItem[]>(topPagesData);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [liveSimulation, setLiveSimulation] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fleet, Crew, Staff & Marine Routing State
  const [vessels, setVessels] = useState<Vessel[]>(initialVesselsData);
  const [crewList, setCrewList] = useState<CrewMember[]>(initialCrewData);
  const [staffList, setStaffList] = useState<StaffMember[]>(initialStaffData);
  const [voyages, setVoyages] = useState<VoyageRecord[]>(initialVoyageData);
  const [landings, setLandings] = useState<LandingRecord[]>(initialLandingData);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(initialIncidentsData);
  const [maintenanceTasks, setMaintenanceTasks] = useState<VesselMaintenanceTask[]>(initialMaintenanceData);
  const [maintenanceVesselFilter, setMaintenanceVesselFilter] = useState<string>('All');
  const [waterBodies, setWaterBodies] = useState<WaterBody[]>(initialWaterBodiesData);
  const [ports, setPorts] = useState<PortRecord[]>(initialPortsData);
  const [usersList, setUsersList] = useState<SystemUser[]>(initialUsersData);
  const [rolesList, setRolesList] = useState<SystemRole[]>(initialRolesData);
  const [permissionsMatrix, setPermissionsMatrix] = useState<PermissionItem[]>(initialPermissionsMatrix);
  const [passengersList, setPassengersList] = useState<PassengerManifestRecord[]>(initialPassengersData);
  const [cargoList, setCargoList] = useState<CargoManifestRecord[]>(initialCargoData);
  const [notificationSettings, setNotificationSettings] = useState<SystemNotificationSettings>(initialNotificationSettings);
  const [smtpConfig, setSmtpConfig] = useState<SmtpConnectionConfig>(initialSmtpConfig);
  const [smsConfig, setSmsConfig] = useState<SmsApiConnectionConfig>(initialSmsApiConfig);
  const [lookupCategories, setLookupCategories] = useState<LookupCategory[]>(initialLookupCategories);
  const [lookupItems, setLookupItems] = useState<LookupItem[]>(initialLookupsData);

  // Active Authenticated User & Session State
  const [currentUser, setCurrentUser] = useState<SystemUser>(initialUsersData[0]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const handleLoginSuccess = (user: SystemUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveNav('dashboard');
    showToast(`Welcome back, ${user.fullName}! Authenticated as ${user.role}.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveNav('auth');
    showToast('You have been logged out of the terminal.');
  };

  // Sync Dark Mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [darkMode]);

  // Keyboard shortcut ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Get active chart data depending on timeframe
  const getChartData = () => {
    switch (timeframe) {
      case '12 months':
        return analytics12MonthsData;
      case 'month-weeks':
        return analyticsMonthWeeksData;
      case '7 days':
        return analytics7DaysData;
      case '24 hours':
        return analytics24HoursData;
      case '30 days':
      default:
        return analytics30DaysData;
    }
  };

  const handleChannelClick = (channel: TrafficChannel) => {
    showToast(`Channel: ${channel.source} • ${channel.visitors} visitors (${channel.trend})`);
  };

  const handlePageClick = (page: TopPageItem) => {
    showToast(`Page: ${page.source} • ${page.pageviews} views (Bounce: ${page.bounceRate})`);
  };

  const handleKpiClick = (metric: string) => {
    showToast(`Viewing detailed breakdown for ${metric}`);
  };

  const handleAddVessel = (newVessel: Vessel) => {
    setVessels((prev) => [newVessel, ...prev]);
    showToast(`Vessel "${newVessel.name}" registered successfully`);
  };

  const handleAddCrew = (newCrew: CrewMember) => {
    setCrewList((prev) => [newCrew, ...prev]);
    showToast(`Crew member "${newCrew.fullName}" added to registry`);
  };

  const handleUpdateCrew = (updatedCrew: CrewMember) => {
    setCrewList((prev) => prev.map((c) => (c.id === updatedCrew.id ? updatedCrew : c)));
    showToast(`Crew member "${updatedCrew.fullName}" profile updated`);
  };

  const handleDeleteCrew = (crewId: string) => {
    setCrewList((prev) => prev.filter((c) => c.id !== crewId));
    showToast('Crew member removed from registry');
  };

  const handleAddMaintenanceTask = (newTask: VesselMaintenanceTask) => {
    setMaintenanceTasks((prev) => [newTask, ...prev]);
    showToast(`Maintenance task "${newTask.taskCode}" logged successfully`);
  };

  const handleUpdateMaintenanceStatus = (taskId: string, newStatus: VesselMaintenanceTask['status']) => {
    setMaintenanceTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    showToast(`Maintenance task status updated to "${newStatus.replace('-', ' ')}"`);
  };

  const handleNavigateToMaintenance = (vesselName: string) => {
    setMaintenanceVesselFilter(vesselName);
    setActiveNav('vessels-maintenance');
    showToast(`Filtered maintenance technical records for "${vesselName}"`);
  };

  // Water Body & Ports Handlers
  const handleAddWaterBody = (newWaterBody: WaterBody) => {
    setWaterBodies((prev) => [newWaterBody, ...prev]);
    showToast(`Water Body "${newWaterBody.name}" (${newWaterBody.code}) added successfully`);
  };

  const handleUpdateWaterBody = (updated: WaterBody) => {
    setWaterBodies((prev) => prev.map((wb) => (wb.id === updated.id ? updated : wb)));
    // Also update any port references if the name changed
    setPorts((prev) =>
      prev.map((p) => (p.waterBodyId === updated.id ? { ...p, waterBodyName: updated.name } : p))
    );
    showToast(`Water Body "${updated.name}" updated`);
  };

  const handleDeleteWaterBody = (id: string) => {
    const target = waterBodies.find((wb) => wb.id === id);
    setWaterBodies((prev) => prev.filter((wb) => wb.id !== id));
    showToast(`Water Body "${target?.name || id}" removed from registry`);
  };

  const handleAddPort = (newPort: PortRecord) => {
    setPorts((prev) => [newPort, ...prev]);
    showToast(`Port "${newPort.name}" (${newPort.code}) registered under ${newPort.waterBodyName}`);
  };

  const handleUpdatePort = (updated: PortRecord) => {
    setPorts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Port "${updated.name}" (${updated.code}) updated`);
  };

  const handleDeletePort = (id: string) => {
    const target = ports.find((p) => p.id === id);
    setPorts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Port "${target?.name || id}" removed`);
  };

  // Staff Management Handlers (Crew & Admin)
  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
    showToast(`Staff member "${newStaff.fullName}" (${newStaff.staffType} - ${newStaff.role}) registered`);
  };

  const handleUpdateStaff = (updatedStaff: StaffMember) => {
    setStaffList((prev) => prev.map((s) => (s.id === updatedStaff.id ? updatedStaff : s)));
    showToast(`Updated staff record for "${updatedStaff.fullName}"`);
  };

  const handleDeleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    showToast(`Staff member "${target?.fullName || id}" removed from directory`);
  };

  // Voyage Management & Captain Device Alert Handlers
  const handleAddVoyage = (newVoyage: VoyageRecord) => {
    setVoyages((prev) => [newVoyage, ...prev]);
    showToast(`Voyage "${newVoyage.voyageNumber}" created successfully (${newVoyage.departurePort} → ${newVoyage.arrivalPort})`);
  };

  const handleUpdateVoyage = (updatedVoyage: VoyageRecord) => {
    setVoyages((prev) => prev.map((v) => (v.id === updatedVoyage.id ? updatedVoyage : v)));
    showToast(`Voyage "${updatedVoyage.voyageNumber}" updated`);
  };

  const handleDeleteVoyage = (id: string) => {
    const target = voyages.find((v) => v.id === id);
    setVoyages((prev) => prev.filter((v) => v.id !== id));
    showToast(`Voyage "${target?.voyageNumber || id}" removed from register`);
  };

  const handleCaptainSetOff = (voyageId: string) => {
    setVoyages((prev) =>
      prev.map((v) => {
        if (v.id === voyageId) {
          const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
          return {
            ...v,
            status: 'Set Off',
            captainDeviceStatus: 'Set Off Triggered',
            captainSetOffTime: nowStr,
            crewAlertSent: true,
            crewAlertSentAt: nowStr,
          };
        }
        return v;
      })
    );
    const target = voyages.find((v) => v.id === voyageId);
    showToast(
      `Captain Set Off triggered for ${target?.voyageNumber || voyageId}! Check-in alerts broadcasted to all ${target?.crewCount || 0} crew accounts.`
    );
  };

  const handleConfirmCrewMember = (voyageId: string, confirmationId: string) => {
    setVoyages((prev) =>
      prev.map((v) => {
        if (v.id === voyageId) {
          const updatedConfirmations = (v.crewConfirmations || []).map((c) => {
            if (c.id === confirmationId) {
              return {
                ...c,
                confirmed: true,
                confirmedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (Acknowledged)',
                deviceType: (c.deviceType === 'Pending Ack' ? 'Mobile App (iOS)' : c.deviceType) as any,
              };
            }
            return c;
          });
          const confirmedCount = updatedConfirmations.filter((c) => c.confirmed).length;
          return {
            ...v,
            crewConfirmations: updatedConfirmations,
            crewConfirmedCount: confirmedCount,
          };
        }
        return v;
      })
    );
    showToast(`Crew member onboard presence confirmed.`);
  };

  // Voyage Landing Handlers
  const handleAddLanding = (newLanding: LandingRecord) => {
    setLandings((prev) => [newLanding, ...prev]);
    showToast(`Vessel landing recorded for ${newLanding.voyageNumber} at ${newLanding.arrivalPort}`);
  };

  const handleUpdateLanding = (updatedLanding: LandingRecord) => {
    setLandings((prev) =>
      prev.map((l) => (l.id === updatedLanding.id ? updatedLanding : l))
    );
    showToast(`Landing record updated for ${updatedLanding.voyageNumber}`);
  };

  const handleDeleteLanding = (id: string) => {
    setLandings((prev) => prev.filter((l) => l.id !== id));
    showToast(`Landing record removed.`);
  };

  // Incidents & Safety Management Handlers
  const handleAddIncident = (newIncident: IncidentRecord) => {
    setIncidents((prev) => [newIncident, ...prev]);
    showToast(`Incident "${newIncident.incidentCode}" reported successfully (${newIncident.type})`);
  };

  const handleUpdateIncident = (updatedIncident: IncidentRecord) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === updatedIncident.id ? updatedIncident : inc))
    );
    showToast(`Incident "${updatedIncident.incidentCode}" updated`);
  };

  const handleDeleteIncident = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    showToast(`Incident record deleted from safety register.`);
  };

  const handleCreateCrewFromStaff = (
    staff: StaffMember,
    vesselId: string,
    vesselName: string,
    rank: string,
    _assignedRole?: string
  ) => {
    const newCrewId = `CRW-${Date.now().toString().slice(-4)}`;
    const newCrew: CrewMember = {
      id: newCrewId,
      employeeId: staff.staffId || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      staffId: staff.id,
      fullName: staff.fullName,
      rank: (rank || staff.role || 'Able Seaman') as CrewMember['rank'],
      assignedVesselId: vesselId,
      assignedVesselName: vesselName,
      nationality: staff.nationality || 'Singaporean',
      nationalityCode: staff.nationalityCode || 'SG',
      seamanBookNo: staff.seamanBookNo || `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      passportNo: staff.passportNo || `P${Math.floor(10000000 + Math.random() * 90000000)}`,
      certExpiry: staff.certExpiry || '2028-12-31',
      medicalCertExpiry: staff.medicalCertExpiry || '2027-06-30',
      status: 'On Board',
      embarkDate: new Date().toISOString().split('T')[0],
      disembarkDate: '2027-02-28',
      email: staff.email,
      phone: staff.phone,
      avatarUrl: staff.avatarUrl,
    };

    setCrewList((prev) => [newCrew, ...prev]);

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staff.id
          ? {
              ...s,
              isPartOfCrew: true,
              assignedVesselName: vesselName,
              status: 'On Board',
            }
          : s
      )
    );

    showToast(`Enrolled ${staff.fullName} as ${rank || staff.role} on board ${vesselName}`);
  };

  const handleAddUser = (newUser: Omit<SystemUser, 'id' | 'createdAt'>) => {
    const user: SystemUser = {
      ...newUser,
      id: `USR-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Just now',
    };
    setUsersList((prev) => [user, ...prev]);
    showToast(`Created system user "${user.fullName}"`);
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setUsersList((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast(`Updated user details for "${updatedUser.fullName}"`);
  };

  const handleDeleteUser = (id: string) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    showToast(`User account deleted.`);
  };

  const handleAddRole = (newRole: SystemRole) => {
    setRolesList((prev) => [newRole, ...prev]);
    showToast(`Created new role "${newRole.name}" for ${newRole.userType}`);
  };

  const handleUpdateRole = (updatedRole: SystemRole) => {
    setRolesList((prev) => prev.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    showToast(`Role "${updatedRole.name}" configuration updated`);
  };

  const handleDeleteRole = (roleId: string) => {
    setRolesList((prev) => prev.filter((r) => r.id !== roleId));
    showToast(`Role removed from system`);
  };

  const handleUpdatePermissionItem = (
    updatedItemOrId: PermissionItem | string,
    roleCode?: string,
    granted?: boolean
  ) => {
    if (typeof updatedItemOrId === 'object' && updatedItemOrId !== null) {
      setPermissionsMatrix((prev) =>
        prev.map((perm) => (perm.id === updatedItemOrId.id ? updatedItemOrId : perm))
      );
    } else if (typeof updatedItemOrId === 'string' && roleCode) {
      setPermissionsMatrix((prev) =>
        prev.map((perm) => {
          if (perm.id === updatedItemOrId) {
            return {
              ...perm,
              [roleCode]: granted !== undefined ? granted : !perm[roleCode as keyof PermissionItem],
            };
          }
          return perm;
        })
      );
    }
  };

  const handleResetPermissionsToDefault = () => {
    setPermissionsMatrix(initialPermissionsMatrix);
    showToast('Permission matrix restored to system defaults.');
  };

  // Manifest Handlers (Passengers & Cargo)
  const handleAddPassenger = (newPassenger: PassengerManifestRecord) => {
    setPassengersList((prev) => [newPassenger, ...prev]);
    showToast(`Passenger "${newPassenger.fullName}" added to manifest (${newPassenger.ticketNumber})`);
  };

  const handleUpdatePassenger = (updatedPassenger: PassengerManifestRecord) => {
    setPassengersList((prev) =>
      prev.map((p) => (p.id === updatedPassenger.id ? updatedPassenger : p))
    );
    showToast(`Passenger details updated for "${updatedPassenger.fullName}"`);
  };

  const handleDeletePassenger = (id: string) => {
    const target = passengersList.find((p) => p.id === id);
    setPassengersList((prev) => prev.filter((p) => p.id !== id));
    showToast(`Passenger "${target?.fullName || id}" removed from manifest.`);
  };

  const handleAddCargo = (newCargo: CargoManifestRecord) => {
    setCargoList((prev) => [newCargo, ...prev]);
    showToast(`Cargo consignment "${newCargo.billOfLadingNumber}" (${newCargo.cargoDescription}) added`);
  };

  const handleUpdateCargo = (updatedCargo: CargoManifestRecord) => {
    setCargoList((prev) =>
      prev.map((c) => (c.id === updatedCargo.id ? updatedCargo : c))
    );
    showToast(`Cargo manifest updated for "${updatedCargo.billOfLadingNumber}"`);
  };

  const handleDeleteCargo = (id: string) => {
    const target = cargoList.find((c) => c.id === id);
    setCargoList((prev) => prev.filter((c) => c.id !== id));
    showToast(`Cargo item "${target?.billOfLadingNumber || id}" removed from manifest.`);
  };

  // System Settings Handlers
  const handleUpdateNotifications = (settings: SystemNotificationSettings) => {
    setNotificationSettings(settings);
    showToast('Notification rules and broadcast settings updated.');
  };

  const handleUpdateSmtp = (config: SmtpConnectionConfig) => {
    setSmtpConfig(config);
    showToast('SMTP mail server configuration saved.');
  };

  const handleUpdateSms = (config: SmsApiConnectionConfig) => {
    setSmsConfig(config);
    showToast('SMS Gateway API credentials saved.');
  };

  // Dynamic Lookups Handlers
  const handleAddLookupCategory = (newCat: LookupCategory) => {
    setLookupCategories((prev) => [...prev, newCat]);
    showToast(`Lookup category "${newCat.name}" added successfully.`);
  };

  const handleAddLookupItem = (newItem: LookupItem) => {
    setLookupItems((prev) => [newItem, ...prev]);
    showToast(`Lookup option "${newItem.label}" added to ${newItem.category || newItem.categoryCode || 'lookups'}.`);
  };

  const handleUpdateLookupItem = (updatedItem: LookupItem) => {
    setLookupItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    showToast(`Lookup option "${updatedItem.label}" updated.`);
  };

  const handleDeleteLookupItem = (itemId: string) => {
    const target = lookupItems.find((i) => i.id === itemId);
    setLookupItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast(`Lookup option "${target?.label || itemId}" removed.`);
  };

  const handleResetLookupsToDefault = () => {
    setLookupCategories(initialLookupCategories);
    setLookupItems(initialLookupsData);
    showToast('Lookups reset to standard IMO/MARPOL system defaults.');
  };

  // If user is not authenticated (e.g. after clicking Log Out), show full-screen Auth Page
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#101827] text-gray-900 dark:text-white flex flex-col justify-between transition-colors duration-150">
        {/* Top Minimal Bar on Auth Page */}
        <div className="w-full flex items-center justify-between p-4 md:px-8 border-b border-gray-100 dark:border-[#2E3A47] bg-white/80 dark:bg-[#1C2434]/80 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-md shadow-[#465FFF]/30">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Voyage IS</h1>
              <p className="text-[10px] text-gray-400">Integrated Marine Portal & Manifest Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
            </button>
            <button
              onClick={() => handleLoginSuccess(initialUsersData[0])}
              className="flex items-center gap-1.5 rounded-xl bg-[#465FFF]/10 dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] border border-[#465FFF]/30 px-3 py-1.5 text-xs font-bold hover:bg-[#465FFF] hover:text-white transition-all cursor-pointer shadow-2xs"
            >
              <span>Explore Demo as Super Admin</span>
            </button>
          </div>
        </div>

        {/* Centered Authentication Form */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-6">
          <AuthPage
            usersList={usersList}
            onLoginSuccess={handleLoginSuccess}
            initialMode="login"
            initialUserType="Superadmin"
            darkMode={darkMode}
          />
        </div>

        {/* Auth Footer */}
        <div className="py-4 text-center text-xs text-gray-400 border-t border-gray-100 dark:border-[#2E3A47] bg-white/40 dark:bg-[#1C2434]/40">
          Voyage Information Systems • IMO FAL Convention & Port Authority Security Gateway • 2026
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#101827] text-gray-900 dark:text-white transition-colors duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-4 py-3 text-xs font-semibold text-gray-900 dark:text-white shadow-xl animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-[#465FFF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Icon Rail / Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        activeNav={activeNav}
        setActiveNav={(nav) => {
          if (nav === 'vessels-maintenance' && activeNav !== 'vessels-maintenance') {
            setMaintenanceVesselFilter('All');
          }
          setActiveNav(nav);
        }}
      />

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0 min-h-screen">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          liveSimulation={liveSimulation}
          setLiveSimulation={setLiveSimulation}
          onOpenSearch={() => setIsSearchOpen(true)}
          currentUser={currentUser}
          usersList={usersList}
          onLogout={handleLogout}
          onNavigateToAuth={() => setActiveNav('auth')}
          onNavigateToProfile={() => setActiveNav('my-profile')}
          onNavigateToSettings={() => setActiveNav('settings')}
          onNavigateToSupport={() => setActiveNav('support')}
          onSwitchUser={(user) => {
            setCurrentUser(user);
            showToast(`Switched active terminal session to ${user.fullName} (${user.role}).`);
          }}
        />

        {/* Dynamic Main View Router - Responsive Content Area with optimized slim horizontal spacing */}
        <main className="px-1.5 sm:px-3 md:px-4 lg:px-5 py-2.5 sm:py-3.5 space-y-4 sm:space-y-5 w-full mx-auto flex-1 min-w-0 max-w-none transition-all">
          {/* View 00: In-App Authentication & User Tier Provisioning View */}
          {(activeNav === 'auth' || activeNav === 'login') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/70 dark:bg-blue-950/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#465FFF] text-white shadow-md shadow-[#465FFF]/30">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Authentication &amp; User Tier Provisioning Gateway
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                      Active Session: <strong className="text-gray-900 dark:text-white">{currentUser.fullName}</strong> ({currentUser.userType} • {currentUser.role})
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveNav('dashboard')}
                    className="flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] px-3.5 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-[#465FFF] transition-colors shadow-2xs cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              <AuthPage
                usersList={usersList}
                onLoginSuccess={handleLoginSuccess}
                onCancel={() => setActiveNav('dashboard')}
                initialMode="login"
                initialUserType={currentUser.userType || 'Superadmin'}
                darkMode={darkMode}
              />
            </div>
          )}
          {/* View 0A: Voyage Departure & Manifest Management */}
          {(activeNav === 'voyage-departure' || activeNav === 'voyage') && (
            <VoyageRegisterTable
              voyages={voyages}
              vessels={vessels}
              waterBodies={waterBodies}
              ports={ports}
              staffList={staffList}
              onAddVoyage={handleAddVoyage}
              onUpdateVoyage={handleUpdateVoyage}
              onDeleteVoyage={handleDeleteVoyage}
              onCaptainSetOff={handleCaptainSetOff}
              onConfirmCrewMember={handleConfirmCrewMember}
            />
          )}

          {/* View 0B: Voyage Landing & Discharge Manifest Management */}
          {activeNav === 'voyage-landing' && (
            <VoyageLandingTable
              landings={landings}
              voyages={voyages}
              vessels={vessels}
              ports={ports}
              waterBodies={waterBodies}
              onAddLanding={handleAddLanding}
              onUpdateLanding={handleUpdateLanding}
              onDeleteLanding={handleDeleteLanding}
            />
          )}

          {/* View 1: Vessels Register Table */}
          {(activeNav === 'vessels-register' || activeNav === 'vessels-management') && (
            <VesselsRegisterTable
              vessels={vessels}
              onAddVessel={handleAddVessel}
              onSelectVessel={(vessel) => {
                showToast(`Viewing details for ${vessel.name}`);
              }}
              onNavigateToMaintenance={handleNavigateToMaintenance}
            />
          )}

          {/* View 2: Crew Register Table & Full Page Profile */}
          {activeNav === 'crew' && (
            <CrewRegisterTable
              crewList={crewList}
              staffList={staffList}
              vessels={vessels}
              voyages={voyages}
              onAddCrew={handleAddCrew}
              onUpdateCrew={handleUpdateCrew}
              onDeleteCrew={handleDeleteCrew}
              onSelectCrew={(crew) => {
                showToast(`Viewing seafarer profile: ${crew.fullName} (${crew.rank})`);
              }}
              onNavigateToMaintenance={handleNavigateToMaintenance}
              onShowToast={showToast}
            />
          )}

          {/* View 3: Vessels Maintenance Table */}
          {activeNav === 'vessels-maintenance' && (
            <VesselsMaintenanceTable
              tasks={maintenanceTasks}
              vessels={vessels}
              initialVesselFilter={maintenanceVesselFilter}
              onAddTask={handleAddMaintenanceTask}
              onUpdateStatus={handleUpdateMaintenanceStatus}
              onSelectTask={(task) => {
                showToast(`Inspecting task ${task.taskCode}: ${task.title}`);
              }}
            />
          )}

          {/* View 4: Water Body & Ports Management (Settings module) */}
          {activeNav === 'water-body-ports' && (
            <WaterBodyPortsManager
              waterBodies={waterBodies}
              ports={ports}
              vessels={vessels}
              onAddWaterBody={handleAddWaterBody}
              onUpdateWaterBody={handleUpdateWaterBody}
              onDeleteWaterBody={handleDeleteWaterBody}
              onAddPort={handleAddPort}
              onUpdatePort={handleUpdatePort}
              onDeletePort={handleDeletePort}
              onNavigateToFleet={() => setActiveNav('vessels-register')}
            />
          )}

          {/* View 5: Staff Management (Crew & Admin Persona Directory) */}
          {activeNav === 'staff' && (
            <StaffManager
              staffList={staffList}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {/* View 5B: Incidents & Safety Register (Voyage & Non voyage) */}
          {(activeNav === 'incidents' || activeNav === 'ecommerce') && (
            <IncidentsTable
              incidents={incidents}
              vessels={vessels}
              voyages={voyages}
              staffList={staffList}
              waterBodies={waterBodies}
              ports={ports}
              onAddIncident={handleAddIncident}
              onUpdateIncident={handleUpdateIncident}
              onDeleteIncident={handleDeleteIncident}
              onShowToast={showToast}
              onNavigateHome={() => setActiveNav('dashboard')}
            />
          )}

          {/* View 5C: Fleet Voyage & Safety Calendar */}
          {activeNav === 'calendar' && (
            <CalendarView
              voyages={voyages}
              incidents={incidents}
              vessels={vessels}
              onNavigateToVoyages={() => setActiveNav('voyage-departure')}
              onNavigateToIncidents={() => setActiveNav('incidents')}
              onSelectVoyage={(voyage) => {
                showToast(`Viewing voyage ${voyage.voyageNumber} details (${voyage.vesselName})`);
              }}
              onSelectIncident={(incident) => {
                showToast(`Inspecting safety incident ${incident.incidentCode}: ${incident.title}`);
              }}
            />
          )}

          {/* View 5D-1: Logged In User Profile with Detailed Info & Maritime Credentials */}
          {(activeNav === 'my-profile' || activeNav === 'profile' || activeNav === 'user-profile') && (
            <MyProfileView
              currentUser={currentUser}
              onUpdateCurrentUser={(updatedUser) => {
                setCurrentUser(updatedUser);
                handleUpdateUser(updatedUser);
              }}
              usersList={usersList}
              onSwitchUser={(u) => {
                setCurrentUser(u);
                showToast(`Switched active user to ${u.fullName} (${u.role}).`);
              }}
              staffList={staffList}
              vessels={vessels}
              onNavigateToSettings={() => setActiveNav('settings')}
              onNavigateToUserManagement={() => setActiveNav('user-management')}
              onShowToast={showToast}
            />
          )}

          {/* View 5D-2: Staff Profile Directory (All staff, Crew creation from staff profile) */}
          {(activeNav === 'staff-profile' || activeNav === 'staff-directory') && (
            <StaffProfileView
              staffList={staffList}
              crewList={crewList}
              vessels={vessels}
              onAddStaff={handleAddStaff}
              onUpdateStaff={handleUpdateStaff}
              onDeleteStaff={handleDeleteStaff}
              onCreateCrewFromStaff={handleCreateCrewFromStaff}
              onNavigateToCrewRegister={() => setActiveNav('crew')}
            />
          )}

          {/* View 5E: User Management (Users, Roles, Permissions Matrix) */}
          {(activeNav === 'user-management' ||
            activeNav.startsWith('user-management-') ||
            activeNav === 'users' ||
            activeNav === 'roles' ||
            activeNav === 'permissions') && (
            <UserManagement
              users={usersList}
              roles={rolesList}
              permissions={permissionsMatrix}
              staffList={staffList}
              initialTab={
                activeNav === 'user-management-roles' || activeNav === 'roles'
                  ? 'roles'
                  : activeNav === 'user-management-permissions' || activeNav === 'permissions'
                  ? 'permissions'
                  : 'users'
              }
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onAddRole={handleAddRole}
              onUpdateRole={handleUpdateRole}
              onDeleteRole={handleDeleteRole}
              onUpdatePermissionItem={handleUpdatePermissionItem}
              onResetPermissionsToDefault={handleResetPermissionsToDefault}
              onNavigateToStaffProfile={() => setActiveNav('staff-profile')}
            />
          )}

          {/* View 5F-1: Passenger Manifest Management (IMO FAL Form 6) */}
          {(activeNav === 'manifest-passengers' || activeNav === 'manifest' || activeNav === 'documents') && (
            <PassengerManifestView
              passengersList={passengersList}
              voyagesList={voyages}
              vesselsList={vessels}
              portsList={ports}
              lookupItems={lookupItems}
              cargoList={cargoList}
              onAddPassenger={handleAddPassenger}
              onUpdatePassenger={handleUpdatePassenger}
              onDeletePassenger={handleDeletePassenger}
              onAddCargo={handleAddCargo}
              onShowToast={showToast}
            />
          )}

          {/* View 5F-2: Cargo Manifest Management (IMO FAL Form 2) */}
          {activeNav === 'manifest-cargo' && (
            <CargoManifestView
              cargoList={cargoList}
              voyagesList={voyages}
              vesselsList={vessels}
              portsList={ports}
              lookupItems={lookupItems}
              onAddCargo={handleAddCargo}
              onUpdateCargo={handleUpdateCargo}
              onDeleteCargo={handleDeleteCargo}
              onShowToast={showToast}
            />
          )}

          {/* View 5G: System Settings (Notification, SMTP Connection, SMS API) */}
          {activeNav === 'settings' && (
            <SystemSettingsView
              notificationSettings={notificationSettings}
              smtpConfig={smtpConfig}
              smsConfig={smsConfig}
              onUpdateNotifications={handleUpdateNotifications}
              onUpdateSmtp={handleUpdateSmtp}
              onUpdateSms={handleUpdateSms}
              onShowToast={showToast}
            />
          )}

          {/* View 5H: Lookups & Dynamic Configuration Settings */}
          {(activeNav === 'lookups' || activeNav === 'charts') && (
            <LookupsManager
              categories={lookupCategories}
              items={lookupItems}
              onAddCategory={handleAddLookupCategory}
              onAddItem={handleAddLookupItem}
              onUpdateItem={handleUpdateLookupItem}
              onDeleteItem={handleDeleteLookupItem}
              onResetToDefault={handleResetLookupsToDefault}
              onShowToast={showToast}
            />
          )}

          {/* View 5I: Chat & Messages Center (as shown in design) */}
          {(activeNav === 'chat' || activeNav === 'messages') && (
            <ChatView
              onShowToast={showToast}
              onNavigateHome={() => setActiveNav('dashboard')}
            />
          )}

          {/* View 5J: Email Inbox & Detail View (Matches Screenshots) */}
          {(activeNav === 'mail' || activeNav === 'inbox' || activeNav === 'email') && (
            <EmailInboxView
              onShowToast={showToast}
              onNavigateHome={() => setActiveNav('dashboard')}
            />
          )}

          {/* View 5K: Support & Help / Support Tickets & Ticket Reply (Matches Screenshots) */}
          {(activeNav === 'support' || activeNav === 'tickets' || activeNav === 'help') && (
            <SupportTicketsView
              onShowToast={showToast}
              onNavigateHome={() => setActiveNav('dashboard')}
            />
          )}

          {/* View 6: Primary Maritime Operations & System Analytics Dashboard */}
          {(activeNav === 'dashboard' || activeNav === 'analytics') && (
            <MaritimeOperationsDashboard
              vessels={vessels}
              voyages={voyages}
              landings={landings}
              incidents={incidents}
              maintenanceTasks={maintenanceTasks}
              waterBodies={waterBodies}
              ports={ports}
              staffList={staffList}
              cargoList={cargoList}
              passengersList={passengersList}
              kpis={kpis}
              chartData={getChartData()}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              channels={channels}
              pages={pages}
              initialActiveUsersPoints={initialActiveUsersPoints}
              liveSimulation={liveSimulation}
              darkMode={darkMode}
              onNavigate={(nav) => setActiveNav(nav)}
              onChannelClick={handleChannelClick}
              onPageClick={handlePageClick}
              onKpiClick={handleKpiClick}
            />
          )}

          {/* View 7: Water Map (Uganda Hydrographic & Maritime System) */}
          {(activeNav === 'uganda-map' || activeNav === 'map') && (
            <UgandaWaterBodiesMap
              darkMode={darkMode}
              onNavigate={(nav) => setActiveNav(nav)}
              systemPorts={ports}
              systemWaterBodies={waterBodies}
              systemVoyages={voyages}
            />
          )}

          {/* Fallback for other navigation items */}
          {activeNav !== 'dashboard' &&
            activeNav !== 'analytics' &&
            activeNav !== 'auth' &&
            activeNav !== 'login' &&
            activeNav !== 'uganda-map' &&
            activeNav !== 'map' &&
            activeNav !== 'voyage' &&
            activeNav !== 'voyage-departure' &&
            activeNav !== 'voyage-landing' &&
            activeNav !== 'vessels-register' &&
            activeNav !== 'vessels-management' &&
            activeNav !== 'vessels-maintenance' &&
            activeNav !== 'crew' &&
            activeNav !== 'water-body-ports' &&
            activeNav !== 'staff' &&
            activeNav !== 'my-profile' &&
            activeNav !== 'user-profile' &&
            activeNav !== 'profile' &&
            activeNav !== 'staff-profile' &&
            activeNav !== 'staff-directory' &&
            !activeNav.startsWith('manifest') &&
            activeNav !== 'documents' &&
            activeNav !== 'settings' &&
            activeNav !== 'lookups' &&
            activeNav !== 'charts' &&
            !activeNav.startsWith('user-management') &&
            activeNav !== 'users' &&
            activeNav !== 'roles' &&
            activeNav !== 'permissions' &&
            activeNav !== 'incidents' &&
            activeNav !== 'ecommerce' &&
            activeNav !== 'calendar' &&
            activeNav !== 'chat' &&
            activeNav !== 'messages' &&
            activeNav !== 'mail' &&
            activeNav !== 'inbox' &&
            activeNav !== 'email' &&
            activeNav !== 'support' &&
            activeNav !== 'tickets' &&
            activeNav !== 'help' && (
              <div className="flex flex-col items-center justify-center min-h-[420px] rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-10 text-center shadow-xs">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] mb-4">
                  <Ship className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {activeNav.replace('-', ' ')}
                </h3>
                <p className="mt-1 max-w-md text-xs text-gray-500 dark:text-[#8A99AD]">
                  This section is connected to the Voyage IS platform modules. You can switch to
                  the Dashboard, Voyage manifest, Vessels register, Water body & ports, or Crew management below.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveNav('dashboard')}
                    className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('voyage')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
                  >
                    <Compass className="h-4 w-4 text-[#465FFF]" />
                    <span>Voyages</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('water-body-ports')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
                  >
                    <Waves className="h-4 w-4 text-[#465FFF]" />
                    <span>Water Body & Ports</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('vessels-register')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
                  >
                    <Ship className="h-4 w-4 text-[#465FFF]" />
                    <span>Vessels Register</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('vessels-maintenance')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
                  >
                    <Wrench className="h-4 w-4 text-[#465FFF]" />
                    <span>Vessels Maintenance</span>
                  </button>
                  <button
                    onClick={() => setActiveNav('crew')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-4 w-4 text-[#465FFF]" />
                    <span>Crew Management</span>
                  </button>
                </div>
              </div>
            )}
        </main>
      </div>

      {/* Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        channels={channels}
        pages={pages}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setTimeframe={setTimeframe}
        setActiveNav={setActiveNav}
      />
    </div>
  );
}

