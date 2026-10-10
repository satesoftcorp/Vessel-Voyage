import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, ArrowRight, X, LayoutGrid, BarChart2, Globe, FileText, Users, Activity, Wrench, Waves, Compass, Anchor, ShieldAlert, FileSpreadsheet, IdCard, UserCog, Sliders, MessageSquare, Mail, Headphones, User } from 'lucide-react';
import { TrafficChannel, TopPageItem } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  channels: TrafficChannel[];
  pages: TopPageItem[];
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  setTimeframe: (tf: '12 months' | '30 days' | '7 days' | '24 hours') => void;
  setActiveNav: (nav: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  channels = [],
  pages = [],
  darkMode,
  setDarkMode,
  setTimeframe,
  setActiveNav,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredChannels = channels.filter((c) =>
    c.source.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPages = pages.filter((p) =>
    p.source.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 p-4 backdrop-blur-xs animate-in fade-in duration-100">
      <div
        id="command-palette-modal"
        className="w-full max-w-lg rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden transition-all"
      >
        {/* Search Input */}
        <div className="flex items-center px-4 border-b border-gray-100 dark:border-[#2E3A47]">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a page, channel, or command (e.g. Google, pricing, theme)..."
            className="w-full bg-transparent px-3 py-3.5 text-xs font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 text-xs space-y-3">
          {/* Channels */}
          {filteredChannels.length > 0 && (
            <div>
              <div className="px-3 py-1 font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-[#8A99AD]">
                Traffic Channels
              </div>
              {filteredChannels.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 text-[#465FFF]" />
                    <span className="font-semibold">{c.source}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{c.visitors}</span>
                    <span className="text-[11px] text-emerald-600 font-medium">{c.trend}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Top Pages */}
          {filteredPages.length > 0 && (
            <div>
              <div className="px-3 py-1 font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-[#8A99AD]">
                Top Pages
              </div>
              {filteredPages.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[280px]">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-medium truncate">{p.source}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white shrink-0">{p.pageviews}</span>
                </button>
              ))}
            </div>
          )}

            {/* Quick Navigation */}
            <div className="mb-2">
              <div className="px-3 py-1 font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-[#8A99AD]">
                Navigation
              </div>
              <button
                onClick={() => {
                  setActiveNav('dashboard');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Dashboard</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('uganda-map');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Waves className="h-4 w-4 text-sky-500" />
                  <span className="font-medium">Go to Water Map</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('voyage-departure');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Voyage Departure & Manifest</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('voyage-landing');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Anchor className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">Go to Voyage Landing & Discharge</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('water-body-ports');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Waves className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Water body & ports (Settings)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('vessels-register');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Vessels Register</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('vessels-maintenance');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Vessels Maintenance</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('crew');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Crew Management</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('staff');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Staff Management (Crew & Admin)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('manifest-passengers');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Passenger Manifest (IMO FAL 6)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('manifest-cargo');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">Go to Cargo Manifest (IMO FAL 2)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('my-profile');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to My profile (Logged in User)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('staff-profile');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <IdCard className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Staff Directory</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('auth');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <UserCog className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Go to Authentication / Sign In &amp; User Tiers</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('user-management-users');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <UserCog className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to User Management &amp; Permissions</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('lookups');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Lookups &amp; Dropdown Configuration</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('settings');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to System Settings (Notifications, SMTP, SMS)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('chat');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Messages &amp; Chat</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('mail');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Email Inbox</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setActiveNav('support');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Headphones className="h-4 w-4 text-[#465FFF]" />
                  <span className="font-medium">Go to Support &amp; Help (Tickets &amp; Replies)</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>

            {/* Quick Actions */}
            <div>
              <div className="px-3 py-1 font-bold uppercase tracking-wider text-[10px] text-gray-400 dark:text-[#8A99AD]">
                Quick Actions
              </div>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-gray-600" />}
                  <span>Switch to {darkMode ? 'Light' : 'Dark'} Mode</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setTimeframe('30 days');
                  onClose();
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="h-4 w-4 text-[#465FFF]" />
                  <span>View Last 30 Days Analytics</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-gray-50/80 dark:bg-[#24303F]/60 px-4 py-2.5 border-t border-gray-100 dark:border-[#2E3A47] text-[11px] text-gray-500 dark:text-[#8A99AD]">
          <span>Use <strong>↑</strong> <strong>↓</strong> to navigate</span>
          <span><strong>ESC</strong> to close</span>
        </div>
      </div>
    </div>
  );
};
