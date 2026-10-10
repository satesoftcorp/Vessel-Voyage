import React, { useState } from 'react';
import {
  LayoutGrid,
  Map as MapIcon,
  Ship,
  Users,
  ShoppingCart,
  Calendar,
  User,
  FileText,
  ListChecks,
  Table2,
  Layers,
  Kanban,
  MessageSquare,
  Headphones,
  Mail,
  PieChart,
  Sliders,
  ArrowLeftToLine,
  PanelLeftOpen,
  ChevronDown,
  ChevronRight,
  Anchor,
  Compass,
  Wrench,
  Waves,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  KeyRound,
  IdCard,
  UserCog,
  FileSpreadsheet,
  Package,
  Lock,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setIsOpen,
  isCollapsed,
  setIsCollapsed,
  activeNav,
  setActiveNav,
}) => {
  const [vesselsSubmenuOpen, setVesselsSubmenuOpen] = useState(false);
  const [voyageSubmenuOpen, setVoyageSubmenuOpen] = useState(false);
  const [manifestSubmenuOpen, setManifestSubmenuOpen] = useState(
    activeNav.startsWith('manifest') || activeNav === 'documents'
  );
  const [userManagementSubmenuOpen, setUserManagementSubmenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 left-0 z-50 flex h-screen flex-col overflow-y-hidden border-r border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-gray-700 dark:text-[#DEE4EE] transition-all duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-64'}`}
      >
        {/* Top Brand Logo */}
        <div
          className={`flex items-center border-b border-gray-100 dark:border-[#2E3A47] py-4 ${
            isCollapsed
              ? 'justify-center px-2'
              : 'justify-between px-5'
          }`}
        >
          <a
            id="brand-logo"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveNav('dashboard');
            }}
            className="flex items-center gap-3 overflow-hidden group"
            title="Voyage IS Dashboard"
          >
            {/* App Logo with 3 vertical bars */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-sm transition-transform group-hover:scale-105">
              <div className="flex items-end gap-1 h-4">
                <span className="w-1 h-2.5 bg-white rounded-xs" />
                <span className="w-1 h-4 bg-white rounded-xs" />
                <span className="w-1 h-3 bg-white rounded-xs" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex items-center overflow-hidden whitespace-nowrap">
                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                  Voyage IS
                </span>
              </div>
            )}
          </a>

          {/* Close button for mobile */}
          <button
            id="sidebar-close-btn"
            onClick={() => setIsOpen(false)}
            className="block text-gray-400 hover:text-gray-900 dark:hover:text-white lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-[#2E3A47]"
            title="Close mobile menu"
          >
            <ArrowLeftToLine className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="no-scrollbar flex flex-col flex-1 overflow-y-auto duration-200 ease-linear px-3 py-3">
          <nav className="space-y-4">
            {/* Group 1: Main Section */}
            <div>
              {isCollapsed ? (
                <div className="my-1.5 text-center text-gray-300 dark:text-gray-600 font-bold tracking-widest text-[11px] select-none">
                  •••
                </div>
              ) : (
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A99AF]">
                  MENU
                </div>
              )}

              <ul className="space-y-1">
                {/* 1. Dashboard (Renamed from Analytics) */}
                <li>
                  <button
                    id="nav-item-dashboard"
                    onClick={() => setActiveNav('dashboard')}
                    title="Dashboard"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed
                        ? 'justify-center px-0'
                        : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'dashboard' || activeNav === 'analytics'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'dashboard' || activeNav === 'analytics'
                          ? 'text-[#465FFF] dark:text-blue-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && <span>Dashboard</span>}
                  </button>
                </li>

                {/* 2. Water Map */}
                <li>
                  <button
                    id="nav-item-uganda-map"
                    onClick={() => setActiveNav('uganda-map')}
                    title="Water Map"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed
                        ? 'justify-center px-0'
                        : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'uganda-map' || activeNav === 'map'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <MapIcon
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'uganda-map' || activeNav === 'map'
                          ? 'text-[#465FFF] dark:text-blue-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && <span>Water Map</span>}
                  </button>
                </li>

                {/* 3. Voyage with submenus for Departure and Landing */}
                <li>
                  {isCollapsed ? (
                    <button
                      id="nav-item-voyage-collapsed"
                      onClick={() => setActiveNav('voyage-departure')}
                      title="Voyage (Departure & Landing)"
                      className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 justify-center px-0 ${
                        activeNav === 'voyage' ||
                        activeNav === 'voyage-departure' ||
                        activeNav === 'voyage-landing'
                          ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                          : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Compass
                        className={`h-5 w-5 shrink-0 ${
                          activeNav === 'voyage' ||
                          activeNav === 'voyage-departure' ||
                          activeNav === 'voyage-landing'
                            ? 'text-[#465FFF] dark:text-blue-400'
                            : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                        }`}
                      />
                    </button>
                  ) : (
                    <div>
                      <button
                        id="nav-item-voyage-management"
                        onClick={() => {
                          setVoyageSubmenuOpen(!voyageSubmenuOpen);
                          if (
                            activeNav !== 'voyage-departure' &&
                            activeNav !== 'voyage-landing' &&
                            activeNav !== 'voyage'
                          ) {
                            setActiveNav('voyage-departure');
                          }
                        }}
                        title="Voyage"
                        className={`group relative flex w-full items-center justify-between rounded-xl py-2.5 text-xs font-medium transition-all duration-150 px-3.5 ${
                          activeNav === 'voyage' ||
                          activeNav === 'voyage-departure' ||
                          activeNav === 'voyage-landing'
                            ? 'bg-[#EBEFFF]/70 dark:bg-[#465FFF]/15 text-[#465FFF] dark:text-[#80CAEE] font-semibold'
                            : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Compass
                            className={`h-5 w-5 shrink-0 ${
                              activeNav === 'voyage' ||
                              activeNav === 'voyage-departure' ||
                              activeNav === 'voyage-landing'
                                ? 'text-[#465FFF] dark:text-blue-400'
                                : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                            }`}
                          />
                          <span>Voyage</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setVoyageSubmenuOpen(!voyageSubmenuOpen);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-[#2E3A47]"
                        >
                          {voyageSubmenuOpen ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Submenu for Departure and Landing */}
                      {voyageSubmenuOpen && (
                        <ul className="mt-1 pl-9 pr-1 space-y-1">
                          <li>
                            <button
                              id="nav-subitem-voyage-departure"
                              onClick={() => setActiveNav('voyage-departure')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'voyage-departure' || activeNav === 'voyage'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <span>Departure</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'voyage-departure' || activeNav === 'voyage'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                4
                              </span>
                            </button>
                          </li>
                          <li>
                            <button
                              id="nav-subitem-voyage-landing"
                              onClick={() => setActiveNav('voyage-landing')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'voyage-landing'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <span>Landing</span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'voyage-landing'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                4
                              </span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </li>

                {/* 3. Vessels management with submenus for Vessels register and Vessels maintenance */}
                <li>
                  {isCollapsed ? (
                    <button
                      id="nav-item-vessels-collapsed"
                      onClick={() => setActiveNav('vessels-register')}
                      title="Vessels management"
                      className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 justify-center px-0 ${
                        activeNav === 'vessels-register' ||
                        activeNav === 'vessels-maintenance' ||
                        activeNav === 'vessels-management'
                          ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                          : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Ship
                        className={`h-5 w-5 shrink-0 ${
                          activeNav === 'vessels-register' ||
                          activeNav === 'vessels-maintenance' ||
                          activeNav === 'vessels-management'
                            ? 'text-[#465FFF] dark:text-blue-400'
                            : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                        }`}
                      />
                    </button>
                  ) : (
                    <div>
                      <button
                        id="nav-item-vessels-management"
                        onClick={() => {
                          setVesselsSubmenuOpen(!vesselsSubmenuOpen);
                          if (
                            activeNav !== 'vessels-register' &&
                            activeNav !== 'vessels-maintenance'
                          ) {
                            setActiveNav('vessels-register');
                          }
                        }}
                        title="Vessels management"
                        className={`group relative flex w-full items-center justify-between rounded-xl py-2.5 text-xs font-medium transition-all duration-150 px-3.5 ${
                          activeNav === 'vessels-register' ||
                          activeNav === 'vessels-maintenance' ||
                          activeNav === 'vessels-management'
                            ? 'bg-[#EBEFFF]/70 dark:bg-[#465FFF]/15 text-[#465FFF] dark:text-[#80CAEE] font-semibold'
                            : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Ship
                            className={`h-5 w-5 shrink-0 ${
                              activeNav === 'vessels-register' ||
                              activeNav === 'vessels-maintenance' ||
                              activeNav === 'vessels-management'
                                ? 'text-[#465FFF] dark:text-blue-400'
                                : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                            }`}
                          />
                          <span>Vessels management</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setVesselsSubmenuOpen(!vesselsSubmenuOpen);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-[#2E3A47]"
                        >
                          {vesselsSubmenuOpen ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Submenu for Vessels register and Vessels maintenance */}
                      {vesselsSubmenuOpen && (
                        <ul className="mt-1 pl-9 pr-1 space-y-1">
                          <li>
                            <button
                              id="nav-subitem-vessels-register"
                              onClick={() => setActiveNav('vessels-register')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'vessels-register'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'vessels-register' ? 'bg-white' : 'bg-gray-400'
                                  }`}
                                />
                                <span>Vessels register</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'vessels-register'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                7
                              </span>
                            </button>
                          </li>

                          {/* New Submenu Item: Vessels maintenance */}
                          <li>
                            <button
                              id="nav-subitem-vessels-maintenance"
                              onClick={() => setActiveNav('vessels-maintenance')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'vessels-maintenance'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'vessels-maintenance' ? 'bg-white' : 'bg-gray-400'
                                  }`}
                                />
                                <span>Vessels maintenance</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'vessels-maintenance'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                8
                              </span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </li>

                {/* 3. Crew Menu item with its own table */}
                <li>
                  <button
                    id="nav-item-crew"
                    onClick={() => setActiveNav('crew')}
                    title="Crew"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed
                        ? 'justify-center px-0'
                        : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'crew'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Users
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'crew'
                          ? 'text-[#465FFF] dark:text-blue-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Crew</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'crew'
                              ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-white/20 dark:text-white'
                              : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          10
                        </span>
                      </div>
                    )}
                  </button>
                </li>

                {/* 4. Incidents & Safety Management (Renamed from eCommerce) */}
                <li>
                  <button
                    id="nav-item-incidents"
                    onClick={() => setActiveNav('incidents')}
                    title="Incidents"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'incidents' || activeNav === 'ecommerce'
                        ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldAlert
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'incidents' || activeNav === 'ecommerce'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Incidents</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'incidents' || activeNav === 'ecommerce'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                          }`}
                        >
                          6
                        </span>
                      </div>
                    )}
                  </button>
                </li>

                <li>
                  <button
                    id="nav-item-calendar"
                    onClick={() => setActiveNav('calendar')}
                    title="Calendar"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'calendar'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'calendar'
                          ? 'text-[#465FFF] dark:text-blue-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Calendar</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'calendar'
                              ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-white/20 dark:text-white'
                              : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          Live
                        </span>
                      </div>
                    )}
                  </button>
                </li>

                <li>
                  <button
                    id="nav-item-staff-profile"
                    onClick={() => setActiveNav('staff-profile')}
                    title="Staff Directory"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'staff-profile'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <IdCard className="h-5 w-5 shrink-0 text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Staff Directory</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'staff-profile'
                              ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-white/20 dark:text-white'
                              : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          Directory
                        </span>
                      </div>
                    )}
                  </button>
                </li>

                {/* Manifest Menu Item with Passengers and Cargo Submenus */}
                <li>
                  {isCollapsed ? (
                    <button
                      id="nav-item-manifest-collapsed"
                      type="button"
                      onClick={() => {
                        setIsCollapsed(false);
                        setManifestSubmenuOpen(true);
                      }}
                      title="Manifest (Passengers & Cargo)"
                      className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 justify-center px-0 ${
                        activeNav.startsWith('manifest') || activeNav === 'documents'
                          ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                          : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <FileSpreadsheet
                        className={`h-5 w-5 shrink-0 ${
                          activeNav.startsWith('manifest') || activeNav === 'documents'
                            ? 'text-[#465FFF] dark:text-blue-400'
                            : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                        }`}
                      />
                    </button>
                  ) : (
                    <div>
                      <button
                        id="nav-item-manifest"
                        type="button"
                        onClick={() => {
                          setManifestSubmenuOpen(!manifestSubmenuOpen);
                        }}
                        title="Manifest"
                        className={`group relative flex w-full items-center justify-between rounded-xl py-2.5 text-xs font-medium transition-all duration-150 px-3.5 ${
                          activeNav.startsWith('manifest') || activeNav === 'documents'
                            ? 'bg-[#EBEFFF]/70 dark:bg-[#465FFF]/15 text-[#465FFF] dark:text-[#80CAEE] font-semibold'
                            : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet
                            className={`h-5 w-5 shrink-0 ${
                              activeNav.startsWith('manifest') || activeNav === 'documents'
                                ? 'text-[#465FFF] dark:text-blue-400'
                                : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                            }`}
                          />
                          <span>Manifest</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setManifestSubmenuOpen(!manifestSubmenuOpen);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-[#2E3A47]"
                        >
                          {manifestSubmenuOpen ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Submenu for Passengers and Cargo Manifest */}
                      {manifestSubmenuOpen && (
                        <ul className="mt-1 pl-9 pr-1 space-y-1">
                          <li>
                            <button
                              id="nav-subitem-manifest-passengers"
                              onClick={() => setActiveNav('manifest-passengers')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'manifest-passengers' || activeNav === 'manifest' || activeNav === 'documents'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'manifest-passengers' || activeNav === 'manifest' || activeNav === 'documents'
                                      ? 'bg-white'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                <span>Passengers</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'manifest-passengers' || activeNav === 'manifest' || activeNav === 'documents'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                8
                              </span>
                            </button>
                          </li>

                          <li>
                            <button
                              id="nav-subitem-manifest-cargo"
                              onClick={() => setActiveNav('manifest-cargo')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'manifest-cargo'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'manifest-cargo' ? 'bg-white' : 'bg-gray-400'
                                  }`}
                                />
                                <span>Cargo</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'manifest-cargo'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                7
                              </span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </li>

                {/* My Profile Menu Item (Placed directly below Manifest) */}
                <li>
                  <button
                    id="nav-item-my-profile"
                    onClick={() => setActiveNav('my-profile')}
                    title="My profile"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'my-profile' || activeNav === 'profile'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'my-profile' || activeNav === 'profile'
                          ? 'text-[#465FFF] dark:text-blue-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>My profile</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'my-profile' || activeNav === 'profile'
                              ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-white/20 dark:text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          User
                        </span>
                      </div>
                    )}
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 2: Communications Section */}
            <div>
              {isCollapsed ? (
                <div className="my-1.5 text-center text-gray-300 dark:text-gray-600 font-bold tracking-widest text-[11px] select-none">
                  •••
                </div>
              ) : (
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A99AF]">
                  COMMUNICATION
                </div>
              )}

              <ul className="space-y-1">
                <li>
                  <button
                    id="nav-item-chat"
                    onClick={() => setActiveNav('chat')}
                    title="Messages"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'chat'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 shrink-0 text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white" />
                    {!isCollapsed && <span>Messages</span>}
                  </button>
                </li>

                {/* Email Inbox (Switched above Support & Help as requested) */}
                <li>
                  <button
                    id="nav-item-mail"
                    onClick={() => setActiveNav('mail')}
                    title="Email Inbox"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'mail'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Mail className="h-5 w-5 shrink-0 text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white" />
                    {!isCollapsed && <span>Email Inbox</span>}
                  </button>
                </li>

                {/* Support & Help */}
                <li>
                  <button
                    id="nav-item-support"
                    onClick={() => setActiveNav('support')}
                    title="Support & Help"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'support'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Headphones className="h-5 w-5 shrink-0 text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white" />
                    {!isCollapsed && <span>Support & Help</span>}
                  </button>
                </li>
              </ul>
            </div>

            {/* Group 3: Settings & Reports */}
            <div>
              {isCollapsed ? (
                <div className="my-1.5 text-center text-gray-300 dark:text-gray-600 font-bold tracking-widest text-[11px] select-none">
                  •••
                </div>
              ) : (
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-[#8A99AF]">
                  SETTINGS
                </div>
              )}

              <ul className="space-y-1">
                {/* 1. Water body & ports (Under Settings section as requested) */}
                <li>
                  <button
                    id="nav-item-water-body-ports"
                    onClick={() => setActiveNav('water-body-ports')}
                    title="Water body & ports"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'water-body-ports'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Waves
                      className={`h-5 w-5 shrink-0 ${
                        activeNav === 'water-body-ports'
                          ? 'text-[#465FFF] dark:text-blue-400'
                          : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Water body & ports</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'water-body-ports'
                              ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-white/20 dark:text-white'
                              : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          7
                        </span>
                      </div>
                    )}
                  </button>
                </li>

                {/* 2. User Management with Submenus (Users, Roles, Permissions) */}
                <li>
                  {isCollapsed ? (
                    <button
                      id="nav-item-user-management-collapsed"
                      onClick={() => setActiveNav('user-management-users')}
                      title="User management"
                      className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 justify-center px-0 ${
                        activeNav.startsWith('user-management') || activeNav === 'users' || activeNav === 'roles' || activeNav === 'permissions'
                          ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                          : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <UserCog
                        className={`h-5 w-5 shrink-0 ${
                          activeNav.startsWith('user-management') || activeNav === 'users' || activeNav === 'roles' || activeNav === 'permissions'
                            ? 'text-[#465FFF] dark:text-blue-400'
                            : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                        }`}
                      />
                    </button>
                  ) : (
                    <div>
                      <button
                        id="nav-item-user-management"
                        onClick={() => {
                          setUserManagementSubmenuOpen(!userManagementSubmenuOpen);
                          if (
                            !activeNav.startsWith('user-management') &&
                            activeNav !== 'users' &&
                            activeNav !== 'roles' &&
                            activeNav !== 'permissions'
                          ) {
                            setActiveNav('user-management-users');
                          }
                        }}
                        title="User management"
                        className={`group relative flex w-full items-center justify-between rounded-xl py-2.5 text-xs font-medium transition-all duration-150 px-3.5 ${
                          activeNav.startsWith('user-management') || activeNav === 'users' || activeNav === 'roles' || activeNav === 'permissions'
                            ? 'bg-[#EBEFFF]/70 dark:bg-[#465FFF]/15 text-[#465FFF] dark:text-[#80CAEE] font-semibold'
                            : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <UserCog
                            className={`h-5 w-5 shrink-0 ${
                              activeNav.startsWith('user-management') || activeNav === 'users' || activeNav === 'roles' || activeNav === 'permissions'
                                ? 'text-[#465FFF] dark:text-blue-400'
                                : 'text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white'
                            }`}
                          />
                          <span>User management</span>
                        </div>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserManagementSubmenuOpen(!userManagementSubmenuOpen);
                          }}
                          className="p-0.5 rounded hover:bg-gray-200/50 dark:hover:bg-[#2E3A47]"
                        >
                          {userManagementSubmenuOpen ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Submenu for Users, Roles, Permissions */}
                      {userManagementSubmenuOpen && (
                        <ul className="mt-1 pl-9 pr-1 space-y-1">
                          <li>
                            <button
                              id="nav-subitem-users"
                              onClick={() => setActiveNav('user-management-users')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'user-management-users' || activeNav === 'users'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'user-management-users' || activeNav === 'users'
                                      ? 'bg-white'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                <span>Users</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'user-management-users' || activeNav === 'users'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                9
                              </span>
                            </button>
                          </li>

                          <li>
                            <button
                              id="nav-subitem-roles"
                              onClick={() => setActiveNav('user-management-roles')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'user-management-roles' || activeNav === 'roles'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'user-management-roles' || activeNav === 'roles'
                                      ? 'bg-white'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                <span>Roles</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'user-management-roles' || activeNav === 'roles'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                6
                              </span>
                            </button>
                          </li>

                          <li>
                            <button
                              id="nav-subitem-permissions"
                              onClick={() => setActiveNav('user-management-permissions')}
                              className={`flex w-full items-center justify-between rounded-lg py-2 px-3 text-xs transition-colors ${
                                activeNav === 'user-management-permissions' || activeNav === 'permissions'
                                  ? 'bg-[#465FFF] text-white font-semibold shadow-2xs'
                                  : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    activeNav === 'user-management-permissions' || activeNav === 'permissions'
                                      ? 'bg-white'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                <span>Permissions</span>
                              </div>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                                  activeNav === 'user-management-permissions' || activeNav === 'permissions'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 dark:bg-[#24303F] text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                24
                              </span>
                            </button>
                          </li>
                        </ul>
                      )}
                    </div>
                  )}
                </li>

                <li>
                  <button
                    id="nav-item-lookups"
                    onClick={() => setActiveNav('lookups')}
                    title="Lookups & Dropdown Configuration"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'lookups' || activeNav === 'charts'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="h-5 w-5 shrink-0 text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white" />
                    {!isCollapsed && (
                      <div className="flex items-center justify-between w-full">
                        <span>Lookups</span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                            activeNav === 'lookups' || activeNav === 'charts'
                              ? 'bg-[#465FFF]/10 text-[#465FFF] dark:bg-white/20 dark:text-white'
                              : 'bg-blue-50 dark:bg-blue-950/40 text-[#465FFF] dark:text-blue-400'
                          }`}
                        >
                          Dynamic
                        </span>
                      </div>
                    )}
                  </button>
                </li>

                <li>
                  <button
                    id="nav-item-settings"
                    onClick={() => setActiveNav('settings')}
                    title="System Settings"
                    className={`group relative flex w-full items-center rounded-xl py-2.5 text-xs font-medium transition-all duration-150 ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3.5'
                    } ${
                      activeNav === 'settings'
                        ? 'bg-[#EBEFFF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-[#80CAEE] font-semibold shadow-2xs'
                        : 'text-gray-500 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Sliders className="h-5 w-5 shrink-0 text-gray-400 dark:text-[#8A99AD] group-hover:text-gray-700 dark:group-hover:text-white" />
                    {!isCollapsed && <span>System Settings</span>}
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Bottom expand button if collapsed on desktop */}
          {isCollapsed && (
            <div className="mt-auto pt-2 flex justify-center">
              <button
                id="sidebar-desktop-expand-btn"
                onClick={() => setIsCollapsed(false)}
                className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                title="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

