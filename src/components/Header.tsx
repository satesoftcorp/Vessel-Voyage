import React, { useState } from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  HelpCircle,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  ShieldCheck,
  Building,
  Anchor,
  Sparkles,
} from 'lucide-react';
import { SystemUser } from '../types';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  liveSimulation: boolean;
  setLiveSimulation: (sim: boolean) => void;
  onOpenSearch: () => void;
  currentUser?: SystemUser | null;
  usersList?: SystemUser[];
  onLogout?: () => void;
  onNavigateToAuth?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSupport?: () => void;
  onSwitchUser?: (user: SystemUser) => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  darkMode,
  setDarkMode,
  liveSimulation,
  setLiveSimulation,
  onOpenSearch,
  currentUser,
  usersList = [],
  onLogout,
  onNavigateToAuth,
  onNavigateToProfile,
  onNavigateToSettings,
  onNavigateToSupport,
  onSwitchUser,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifications = [
    { id: '1', title: 'Traffic Spike Detected', desc: '+34% visitors on /pricing page', time: '5m ago', unread: true },
    { id: '2', title: 'Weekly Report Ready', desc: 'Summary report generated for download', time: '1h ago', unread: true },
    { id: '3', title: 'Goal Completed', desc: 'Monthly visitor target achieved (24.7K)', time: '3h ago', unread: false },
  ];

  // Default active user fallback
  const activeUser = currentUser || {
    id: 'USR-001',
    username: 'musharof.admin',
    fullName: 'Musharof Chowdhury',
    email: 'musharof@voyageis.com',
    role: 'Super Admin',
    userType: 'Superadmin' as const,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    organization: 'Voyage IS Global HQ',
  };

  return (
    <header className="sticky top-0 z-30 flex w-full bg-white dark:bg-[#1C2434] border-b border-gray-100 dark:border-[#2E3A47] shadow-2xs transition-colors duration-150">
      <div className="flex grow items-center justify-between px-4 py-3 md:px-6">
        {/* Left Side: Sidebar Toggle & Search Input */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Hamburger toggle button (for mobile or desktop collapse) */}
          <button
            id="sidebar-toggle-btn"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(!sidebarOpen);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            className="flex items-center justify-center rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-2 text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#2E3A47] hover:text-gray-900 dark:hover:text-white shadow-2xs transition-colors"
            title="Toggle sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* Quick Search Input */}
          <div className="relative hidden sm:block">
            <button
              id="header-search-bar"
              onClick={onOpenSearch}
              className="flex w-72 md:w-84 items-center gap-2.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-left text-sm text-gray-400 dark:text-[#8A99AD] shadow-2xs hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            >
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="flex-1 text-xs text-gray-400">Search or type command...</span>
              <kbd className="inline-flex items-center rounded-md border border-gray-200 dark:border-[#313D4A] bg-gray-50 dark:bg-[#1C2434] px-1.5 py-0.5 text-[10px] font-mono text-gray-500 dark:text-[#8A99AD]">
                ⌘ K
              </kbd>
            </button>
          </div>
        </div>

        {/* Right Side: Dark mode switch, Notifications, User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Simulator Status Pill */}
          <button
            onClick={() => setLiveSimulation(!liveSimulation)}
            className="hidden md:flex items-center gap-1.5 rounded-full bg-gray-50 dark:bg-[#24303F] px-3 py-1 text-xs font-medium text-gray-600 dark:text-[#DEE4EE] hover:bg-gray-100 transition-colors"
            title={liveSimulation ? 'Click to pause simulation' : 'Click to start real-time updates'}
          >
            <span className={`h-2 w-2 rounded-full ${liveSimulation ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
            <span className="text-[11px] font-medium">{liveSimulation ? 'Live Analytics' : 'Paused'}</span>
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#2E3A47] hover:text-gray-900 dark:hover:text-white transition-colors shadow-2xs"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#2E3A47] hover:text-gray-900 dark:hover:text-white transition-colors shadow-2xs"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#1C2434]" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-xl z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2E3A47]">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Notifications
                  </h4>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#465FFF] dark:bg-[#465FFF]/20 dark:text-blue-400">
                    2 New
                  </span>
                </div>

                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-start gap-2.5 rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors cursor-pointer"
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-[#24303F] text-[#465FFF] dark:text-blue-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] mt-0.5">
                          {notif.desc}
                        </p>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar & Menu */}
          <div className="relative ml-1">
            <button
              id="user-profile-menu-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-full p-0.5 hover:opacity-90 transition-opacity"
            >
              {/* User avatar photo */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden border border-gray-200 dark:border-[#2E3A47] bg-gradient-to-tr from-blue-600 to-indigo-500 shrink-0">
                {activeUser.avatarUrl ? (
                  <img
                    src={activeUser.avatarUrl}
                    alt={activeUser.fullName}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-bold text-white uppercase">
                    {activeUser.fullName?.charAt(0) || 'U'}
                  </span>
                )}
              </div>

              <div className="hidden text-left md:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                    {activeUser.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-[10px] text-gray-400 dark:text-[#8A99AD] truncate max-w-[130px] leading-tight">
                  {activeUser.role}
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {dropdownOpen && (
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-2.5 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95"
              >
                {/* Active user details card */}
                <div className="px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-100 dark:border-[#2E3A47]/60">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 dark:text-white truncate">
                      {activeUser.fullName}
                    </p>
                    <span className="rounded px-1.5 py-0.2 text-[9px] font-bold bg-[#465FFF]/10 text-[#465FFF] dark:text-[#80CAEE]">
                      {activeUser.userType || 'User'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] truncate mt-0.5">
                    {activeUser.email}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">
                    🏢 {activeUser.organization || 'Maritime Terminal'}
                  </p>
                </div>

                {/* Switch User Quick Presets */}
                {usersList.length > 0 && onSwitchUser && (
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#2E3A47]">
                    <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-1">
                      <Sparkles className="h-3 w-3 text-[#465FFF]" />
                      <span>Switch Active User</span>
                    </span>
                    <div className="space-y-0.5 max-h-28 overflow-y-auto pr-1">
                      {usersList.slice(0, 4).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setDropdownOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                            u.id === activeUser.id
                              ? 'bg-[#465FFF]/10 text-[#465FFF] font-bold'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                          }`}
                        >
                          <div className="truncate max-w-[150px]">
                            <p className="text-[11px] leading-tight truncate">{u.fullName}</p>
                            <p className="text-[9px] text-gray-400 leading-tight truncate">{u.role}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 font-mono">
                            {u.userType === 'Superadmin' ? '👑' : u.userType === 'Port users' ? '⚓' : '🏢'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#2E3A47] space-y-0.5">
                  <button
                    id="header-my-profile-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onNavigateToProfile) onNavigateToProfile();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                  >
                    <User className="h-4 w-4 text-gray-400" />
                    <span>My profile</span>
                  </button>
                  <button
                    id="header-settings-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onNavigateToSettings) onNavigateToSettings();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                  >
                    <Settings className="h-4 w-4 text-gray-400" />
                    <span>System Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onNavigateToSupport) onNavigateToSupport();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                  >
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                    <span>Support & Docs</span>
                  </button>
                </div>

                <div className="mt-1 border-t border-gray-100 dark:border-[#2E3A47] pt-1">
                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onLogout) {
                        onLogout();
                      } else if (onNavigateToAuth) {
                        onNavigateToAuth();
                      }
                    }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-bold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
