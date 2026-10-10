import React, { useState } from 'react';
import {
  SystemNotificationSettings,
  SmtpConnectionConfig,
  SmsApiConnectionConfig,
} from '../types';
import {
  Bell,
  Mail,
  MessageSquare,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  Server,
  Lock,
  Key,
  ShieldCheck,
  Check,
  X,
  Radio,
  Globe,
  Clock,
  Phone,
  Database,
  Smartphone,
  Info,
  Terminal,
  Zap,
  Volume2,
} from 'lucide-react';

interface SystemSettingsViewProps {
  initialTab?: 'notifications' | 'smtp' | 'sms' | 'general';
  notificationSettings: SystemNotificationSettings;
  smtpConfig: SmtpConnectionConfig;
  smsConfig: SmsApiConnectionConfig;
  onUpdateNotifications: (settings: SystemNotificationSettings) => void;
  onUpdateSmtp: (config: SmtpConnectionConfig) => void;
  onUpdateSms: (config: SmsApiConnectionConfig) => void;
  onShowToast: (msg: string) => void;
}

export const SystemSettingsView: React.FC<SystemSettingsViewProps> = ({
  initialTab = 'notifications',
  notificationSettings,
  smtpConfig,
  smsConfig,
  onUpdateNotifications,
  onUpdateSmtp,
  onUpdateSms,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'smtp' | 'sms' | 'general'>(initialTab);

  // Form states
  const [notifications, setNotifications] = useState<SystemNotificationSettings>(notificationSettings);
  const [smtp, setSmtp] = useState<SmtpConnectionConfig>(smtpConfig);
  const [sms, setSms] = useState<SmsApiConnectionConfig>(smsConfig);

  // Testing states
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  const [isTestingSms, setIsTestingSms] = useState(false);
  const [smsTestPhoneNumber, setSmsTestPhoneNumber] = useState('+65 9123 4567');
  const [smsTestResult, setSmsTestResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
    sid?: string;
  } | null>(null);

  // New recipient input
  const [newEmergencyRecipient, setNewEmergencyRecipient] = useState('');

  // General Settings state
  const [fleetTimezone, setFleetTimezone] = useState('UTC (Coordinated Universal Time)');
  const [speedUnits, setSpeedUnits] = useState<'knots' | 'kmh'>('knots');
  const [cargoUnits, setCargoUnits] = useState<'Metric Tons (MT)' | 'Short Tons (ST)'>('Metric Tons (MT)');
  const [marpolLogRetentionDays, setMarpolLogRetentionDays] = useState(1095); // 3 years

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNotifications(notifications);
    onShowToast('System notification rules & event triggers saved successfully.');
  };

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSmtp(smtp);
    onShowToast('SMTP mail server configuration saved.');
  };

  const handleSaveSms = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSms(sms);
    onShowToast('SMS Gateway API credentials and sender ID saved.');
  };

  // Test SMTP connection simulation
  const handleTestSmtpConnection = () => {
    setIsTestingSmtp(true);
    setSmtpTestResult(null);

    setTimeout(() => {
      setIsTestingSmtp(false);
      const isConfigured = smtp.host && smtp.port && smtp.fromEmail;
      if (isConfigured) {
        const result = {
          success: true,
          message: `250 OK: Connected to ${smtp.host}:${smtp.port} via ${smtp.encryption} encryption. Test handshake succeeded with 18ms latency.`,
          timestamp: new Date().toLocaleTimeString(),
        };
        setSmtpTestResult(result);
        const updatedSmtp: SmtpConnectionConfig = {
          ...smtp,
          status: 'Connected',
          lastTestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        };
        setSmtp(updatedSmtp);
        onUpdateSmtp(updatedSmtp);
        onShowToast('SMTP server test passed: Mail server connection verified.');
      } else {
        setSmtpTestResult({
          success: false,
          message: 'Connection failed: Host, port, or sender email address is missing or invalid.',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }, 1200);
  };

  // Test SMS Gateway API simulation
  const handleTestSmsApi = () => {
    if (!smsTestPhoneNumber) {
      alert('Please specify a target mobile number with country code for the test SMS.');
      return;
    }

    setIsTestingSms(true);
    setSmsTestResult(null);

    setTimeout(() => {
      setIsTestingSms(false);
      const isConfigured = sms.accountSidOrApiKey && sms.senderId;
      if (isConfigured) {
        const result = {
          success: true,
          message: `SMS dispatched via ${sms.provider} (Sender: ${sms.senderId}) to ${smsTestPhoneNumber}. Delivery status: "Delivered to carrier".`,
          timestamp: new Date().toLocaleTimeString(),
          sid: `SM_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        };
        setSmsTestResult(result);
        const updatedSms: SmsApiConnectionConfig = {
          ...sms,
          status: 'Active & Verified',
          smsCreditsRemaining: Math.max(0, sms.smsCreditsRemaining - 1),
          accountBalanceUSD: Number(Math.max(0, sms.accountBalanceUSD - 0.045).toFixed(2)),
          lastTestedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        };
        setSms(updatedSms);
        onUpdateSms(updatedSms);
        onShowToast(`Test SMS successfully delivered to ${smsTestPhoneNumber}`);
      } else {
        setSmsTestResult({
          success: false,
          message: 'Authentication failed: Invalid API Key / Account SID or Missing Auth Token.',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }, 1400);
  };

  const handleAddEmergencyRecipient = () => {
    if (!newEmergencyRecipient.trim()) return;
    if (notifications.emergencyRecipients.includes(newEmergencyRecipient.trim())) return;

    setNotifications({
      ...notifications,
      emergencyRecipients: [...notifications.emergencyRecipients, newEmergencyRecipient.trim()],
    });
    setNewEmergencyRecipient('');
  };

  const handleRemoveEmergencyRecipient = (indexToRemove: number) => {
    setNotifications({
      ...notifications,
      emergencyRecipients: notifications.emergencyRecipients.filter((_, idx) => idx !== indexToRemove),
    });
  };

  return (
    <div id="system-settings-manager" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                System &amp; Integration Settings
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Manage notification distribution channels, SMTP mail server connectivity, and SMS communication gateway APIs.
              </p>
            </div>
          </div>
        </div>

        {/* Global status pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-2xs">
            <span
              className={`h-2 w-2 rounded-full ${
                smtp.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>SMTP: {smtp.status}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 shadow-2xs">
            <span
              className={`h-2 w-2 rounded-full ${
                sms.status === 'Active & Verified' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span>SMS API: {sms.status}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-[#2E3A47] pb-px">
        <button
          id="tab-settings-notifications"
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'notifications'
              ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notification Settings</span>
          {notifications.emailEnabled && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          id="tab-settings-smtp"
          onClick={() => setActiveTab('smtp')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'smtp'
              ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>SMTP Connection</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              smtp.status === 'Connected'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {smtp.status}
          </span>
        </button>

        <button
          id="tab-settings-sms"
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'sms'
              ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>API Connection (SMS)</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
              sms.status === 'Active & Verified'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {sms.provider}
          </span>
        </button>

        <button
          id="tab-settings-general"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 border-b-2 py-3 px-5 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'general'
              ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-[#8A99AD] dark:hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          <span>Fleet Standards &amp; Localization</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 1. NOTIFICATION SETTINGS TAB                         */}
      {/* ==================================================== */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveNotifications} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Master Distribution Channels */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Active Dispatch Channels
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-4">
                  Enable or suspend transmission protocols across the fleet management network.
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Email Channel */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3.5 bg-gray-50/50 dark:bg-[#24303F]/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/50 text-[#465FFF] dark:text-blue-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          Email Dispatch
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                          Via configured SMTP server
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.emailEnabled}
                        onChange={(e) =>
                          setNotifications({ ...notifications, emailEnabled: e.target.checked })
                        }
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-[#465FFF] dark:bg-gray-700 peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {/* SMS Gateway */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3.5 bg-gray-50/50 dark:bg-[#24303F]/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          SMS Emergency Alerts
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                          High-priority mobile SMS
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.smsEnabled}
                        onChange={(e) =>
                          setNotifications({ ...notifications, smsEnabled: e.target.checked })
                        }
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-[#465FFF] dark:bg-gray-700 peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {/* Webhook Dispatch */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3.5 bg-gray-50/50 dark:bg-[#24303F]/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          Webhook Stream
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                          Real-time JSON push to API
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.webhookEnabled}
                        onChange={(e) =>
                          setNotifications({ ...notifications, webhookEnabled: e.target.checked })
                        }
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-[#465FFF] dark:bg-gray-700 peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                    </label>
                  </div>

                  {/* In-App Toasts */}
                  <div className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3.5 bg-gray-50/50 dark:bg-[#24303F]/50">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                        <Volume2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 dark:text-white">
                          In-App Visual Banners
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                          Live dashboard alerts
                        </div>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={notifications.inAppToastsEnabled}
                        onChange={(e) =>
                          setNotifications({ ...notifications, inAppToastsEnabled: e.target.checked })
                        }
                        className="peer sr-only"
                      />
                      <div className="h-5 w-9 rounded-full bg-gray-300 peer-checked:bg-[#465FFF] dark:bg-gray-700 peer-focus:outline-hidden after:absolute after:top-[2px] after:left-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Event Triggers & Subscriptions */}
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Automated Event Notification Triggers
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-4">
                  Select which operational maritime events automatically broadcast alerts to duty officers and emergency rosters.
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.events.voyageDeparture}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          events: { ...notifications.events, voyageDeparture: e.target.checked },
                        })
                      }
                      className="rounded text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        Voyage Departure Confirmed
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Triggered when vessel pilot disembarks and ATD is logged.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.events.voyageLanding}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          events: { ...notifications.events, voyageLanding: e.target.checked },
                        })
                      }
                      className="rounded text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        Voyage Landing &amp; Berthing
                      </span>
                      <span className="text-[10px] text-gray-400">
                        First line ashore and port clearance completed.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.events.captainSetOffAlert}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          events: { ...notifications.events, captainSetOffAlert: e.target.checked },
                        })
                      }
                      className="rounded text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        Captain Set-Off / Waypoint Changes
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Route deviation or severe weather course corrections.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.events.criticalIncidents}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          events: { ...notifications.events, criticalIncidents: e.target.checked },
                        })
                      }
                      className="rounded text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <div>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 block">
                        Critical Safety &amp; Spill Incidents
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Immediate SMS broadcast to DPA &amp; Coast Guard liaisons.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.events.maintenanceDueAlerts}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          events: { ...notifications.events, maintenanceDueAlerts: e.target.checked },
                        })
                      }
                      className="rounded text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        Vessel Class Survey / Overdue Maintenance
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Notify Chief Engineer 14 days before deadline.
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.events.stcwMedicalCertExpiry}
                      onChange={(e) =>
                        setNotifications({
                          ...notifications,
                          events: { ...notifications.events, stcwMedicalCertExpiry: e.target.checked },
                        })
                      }
                      className="rounded text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <div>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 block">
                        STCW / Medical Certificate Expirations
                      </span>
                      <span className="text-[10px] text-gray-400">
                        Flag crewing managers 30 days prior to seafarer expiry.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Emergency Contact Distribution List */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Emergency Recipient Roster
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-3">
                  Duty dispatch emails and SMS phone numbers receiving urgent broadcasts.
                </p>

                <div className="space-y-2 mb-4">
                  {notifications.emergencyRecipients.map((recipient, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs font-mono text-gray-800 dark:text-gray-200"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {recipient.includes('@') ? (
                          <Mail className="h-3.5 w-3.5 text-[#465FFF] shrink-0" />
                        ) : (
                          <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        )}
                        <span className="truncate">{recipient}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEmergencyRecipient(idx)}
                        className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEmergencyRecipient}
                    onChange={(e) => setNewEmergencyRecipient(e.target.value)}
                    placeholder="email@domain.com or +65..."
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddEmergencyRecipient}
                    className="rounded-xl bg-gray-100 dark:bg-[#2E3A47] px-3 py-2 text-xs font-semibold text-gray-700 dark:text-white hover:bg-gray-200"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Daily Digest Schedule */}
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                  Daily Fleet Operations Digest
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-3">
                  Summary email of active voyages, fuel consumption, and cargo totals.
                </p>

                <select
                  value={notifications.digestSchedule}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      digestSchedule: e.target.value as SystemNotificationSettings['digestSchedule'],
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="08:00 UTC">Every morning at 08:00 UTC</option>
                  <option value="12:00 UTC">Midday at 12:00 UTC</option>
                  <option value="18:00 UTC">Evening at 18:00 UTC</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end border-t border-gray-100 dark:border-[#2E3A47] pt-4">
            <button
              id="save-notifications-btn"
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-[#465FFF] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
            >
              <Check className="h-4 w-4" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* ==================================================== */}
      {/* 2. SMTP CONNECTION SETTINGS TAB                      */}
      {/* ==================================================== */}
      {activeTab === 'smtp' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSmtp} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Server Connection Credentials */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      SMTP Mail Server Configuration
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                      Configure outgoing email server (e.g. Mailgun, SendGrid, Amazon SES, or custom corporate Exchange server).
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                      smtp.status === 'Connected'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {smtp.status}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Host & Port */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Host Server *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. smtp.mailgun.org or smtp.office365.com"
                        value={smtp.host}
                        onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Port *
                      </label>
                      <input
                        type="number"
                        required
                        value={smtp.port}
                        onChange={(e) => setSmtp({ ...smtp, port: Number(e.target.value) })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Encryption & Timeout */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Transport Encryption
                      </label>
                      <select
                        value={smtp.encryption}
                        onChange={(e) =>
                          setSmtp({
                            ...smtp,
                            encryption: e.target.value as SmtpConnectionConfig['encryption'],
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      >
                        <option value="TLS">TLS (Recommended - Port 587)</option>
                        <option value="SSL">SSL (Port 465)</option>
                        <option value="STARTTLS">STARTTLS</option>
                        <option value="None">None (Unencrypted)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Socket Timeout (Seconds)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={smtp.timeoutSeconds}
                        onChange={(e) => setSmtp({ ...smtp, timeoutSeconds: Number(e.target.value) })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Username & Password */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Username / API User
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. postmaster@mg.voyageis.com"
                        value={smtp.username}
                        onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Password / API Key Secret
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={smtp.password}
                        onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Sender Profile */}
                  <div className="border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                      Sender Identity &amp; From Headers
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          From Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="dispatch@voyageis.com"
                          value={smtp.fromEmail}
                          onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          From Display Name
                        </label>
                        <input
                          type="text"
                          placeholder="Voyage IS Maritime Fleet Control"
                          value={smtp.fromName}
                          onChange={(e) => setSmtp({ ...smtp, fromName: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                  <div className="text-[11px] text-gray-400">
                    Last tested: {smtp.lastTestedAt || 'Never'}
                  </div>
                  <button
                    id="save-smtp-config-btn"
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save SMTP Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Connection Test Box */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Server className="h-4 w-4 text-[#465FFF]" />
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Diagnostic Connection Handshake
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-4">
                  Send a probe ping to verify TLS certificate validation, DNS resolution, and credentials.
                </p>

                <button
                  id="test-smtp-connection-btn"
                  type="button"
                  disabled={isTestingSmtp}
                  onClick={handleTestSmtpConnection}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 dark:bg-[#24303F] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isTestingSmtp ? 'animate-spin' : ''}`} />
                  <span>{isTestingSmtp ? 'Testing Handshake...' : 'Test SMTP Connection'}</span>
                </button>

                {smtpTestResult && (
                  <div
                    className={`mt-4 rounded-xl p-3.5 text-xs ${
                      smtpTestResult.success
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {smtpTestResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                      )}
                      <span>
                        {smtpTestResult.success ? 'SMTP Connection Valid' : 'SMTP Error'}
                      </span>
                    </div>
                    <p className="font-mono text-[11px] leading-relaxed">{smtpTestResult.message}</p>
                    <div className="mt-1 text-[10px] opacity-75">
                      Checked at {smtpTestResult.timestamp}
                    </div>
                  </div>
                )}
              </div>

              {/* Recommended Ports Info Card */}
              <div className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 p-4 text-xs text-blue-900 dark:text-blue-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="h-4 w-4 text-[#465FFF]" />
                  <span>Maritime SMTP Port Reference</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                  • <strong>Port 587 (TLS/STARTTLS)</strong>: Standard submission for cloud relays (Mailgun, SendGrid).
                  <br />
                  • <strong>Port 465 (SSL)</strong>: Encrypted standard for legacy satellite VSAT link routers.
                  <br />
                  • <strong>Port 25</strong>: Often blocked by cellular &amp; in-port marine WiFi ISPs.
                </p>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. API CONNECTION FOR SMS COMMUNICATION TAB          */}
      {/* ==================================================== */}
      {activeTab === 'sms' && (
        <div className="space-y-6">
          <form onSubmit={handleSaveSms} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: SMS Gateway Credentials */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-3 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      SMS Gateway API Integration
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                      Direct cellular API connectivity for vessel distress alerts, crew muster callouts, and passenger ticket SMS.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 text-[11px] font-mono font-bold text-[#465FFF] dark:text-blue-300">
                      Balance: ${sms.accountBalanceUSD.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Provider Selection */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        SMS Service Provider *
                      </label>
                      <select
                        value={sms.provider}
                        onChange={(e) =>
                          setSms({
                            ...sms,
                            provider: e.target.value as SmsApiConnectionConfig['provider'],
                          })
                        }
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      >
                        <option value="Twilio">Twilio Programmable SMS</option>
                        <option value="Infobip">Infobip Enterprise Gateway</option>
                        <option value="AWS SNS">Amazon SNS (Simple Notification Service)</option>
                        <option value="Vonage (Nexmo)">Vonage (Nexmo) SMS API</option>
                        <option value="Sinch">Sinch Global SMS Network</option>
                        <option value="Generic Webhook">Generic Custom SMS HTTP Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Alphanumeric Sender ID (Mask)
                      </label>
                      <input
                        type="text"
                        maxLength={11}
                        placeholder="e.g. VOYAGE_IS"
                        value={sms.senderId}
                        onChange={(e) => setSms({ ...sms, senderId: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono font-bold text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* API Credentials */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Account SID / API Key *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. AC98f01b782c449190ab77102e3a884f"
                        value={sms.accountSidOrApiKey}
                        onChange={(e) => setSms({ ...sms, accountSidOrApiKey: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Auth Token / API Secret Key *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••••••••••••••••••••••"
                        value={sms.authTokenOrSecret}
                        onChange={(e) => setSms({ ...sms, authTokenOrSecret: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Default Country Code & Webhook Callback */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Default Country Prefix
                      </label>
                      <input
                        type="text"
                        placeholder="+65"
                        value={sms.defaultCountryCode}
                        onChange={(e) => setSms({ ...sms, defaultCountryCode: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Delivery Status Webhook Callback URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://api.voyageis.com/v1/sms/callback"
                        value={sms.webhookCallbackUrl}
                        onChange={(e) => setSms({ ...sms, webhookCallbackUrl: e.target.value })}
                        className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] pt-4">
                  <div className="text-[11px] text-gray-400">
                    Remaining pool: <span className="font-bold text-gray-700 dark:text-gray-200">{sms.smsCreditsRemaining.toLocaleString()} credits</span>
                  </div>
                  <button
                    id="save-sms-config-btn"
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save SMS API Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Test SMS Dispatch Box */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-[#465FFF]" />
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    Dispatch Real-Time Test SMS
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-3">
                  Validate token authorization and carrier routing by sending a simulated or live alert.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Recipient Mobile Number (E.164 format)
                    </label>
                    <input
                      type="tel"
                      value={smsTestPhoneNumber}
                      onChange={(e) => setSmsTestPhoneNumber(e.target.value)}
                      placeholder="+65 9123 4567"
                      className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    />
                  </div>

                  <button
                    id="send-test-sms-btn"
                    type="button"
                    disabled={isTestingSms}
                    onClick={handleTestSmsApi}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#465FFF] py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors disabled:opacity-50"
                  >
                    <Send className={`h-3.5 w-3.5 ${isTestingSms ? 'animate-bounce' : ''}`} />
                    <span>{isTestingSms ? 'Dispatching SMS...' : 'Send Test SMS Message'}</span>
                  </button>
                </div>

                {smsTestResult && (
                  <div
                    className={`mt-4 rounded-xl p-3.5 text-xs ${
                      smsTestResult.success
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {smsTestResult.success ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                      )}
                      <span>{smsTestResult.success ? 'SMS Delivered' : 'Delivery Failure'}</span>
                    </div>
                    <p className="font-mono text-[11px] leading-relaxed">{smsTestResult.message}</p>
                    {smsTestResult.sid && (
                      <div className="mt-1 font-mono text-[10px] opacity-75">
                        Message SID: {smsTestResult.sid}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SMS Cost & Rate Card */}
              <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold text-gray-700 dark:text-gray-300">
                  <span>Standard In-Port SMS:</span>
                  <span className="font-mono text-[#465FFF]">$0.025 / msg</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-700 dark:text-gray-300">
                  <span>High-Seas Satellite Relay:</span>
                  <span className="font-mono text-[#465FFF]">$0.085 / msg</span>
                </div>
                <div className="text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-[#2E3A47]">
                  Automatic fallback to Iridium/Inmarsat satellite terminals when outside terrestrial 4G/5G port coverage.
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. FLEET STANDARDS & LOCALIZATION TAB                */}
      {/* ==================================================== */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Global Maritime Operational Standards
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#8A99AD] mb-4">
              Set standard navigational units, IMO reporting formats, and environmental compliance log retentions.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Fleet Operational Timezone
                </label>
                <select
                  value={fleetTimezone}
                  onChange={(e) => setFleetTimezone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="UTC (Coordinated Universal Time)">UTC (Coordinated Universal Time - Standard)</option>
                  <option value="GMT (Greenwich Mean Time)">GMT (Greenwich Mean Time)</option>
                  <option value="SGT (Singapore Time UTC+8)">SGT (Singapore Time UTC+8)</option>
                  <option value="CET (Central European Time UTC+1)">CET (Central European Time UTC+1)</option>
                  <option value="PST (Pacific Standard Time UTC-8)">PST (Pacific Standard Time UTC-8)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Speed &amp; Distance Units
                </label>
                <select
                  value={speedUnits}
                  onChange={(e) => setSpeedUnits(e.target.value as 'knots' | 'kmh')}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="knots">Knots &amp; Nautical Miles (NM) - IMO Standard</option>
                  <option value="kmh">Kilometers per hour &amp; KM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Cargo &amp; Fuel Displacement Unit
                </label>
                <select
                  value={cargoUnits}
                  onChange={(e) => setCargoUnits(e.target.value as 'Metric Tons (MT)' | 'Short Tons (ST)')}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="Metric Tons (MT)">Metric Tons (MT - 1,000 kg)</option>
                  <option value="Short Tons (ST)">Short Tons (ST - 2,000 lbs)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  MARPOL &amp; Audit Log Retention (Days)
                </label>
                <input
                  type="number"
                  value={marpolLogRetentionDays}
                  onChange={(e) => setMarpolLogRetentionDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-gray-100 dark:border-[#2E3A47] pt-4">
              <button
                type="button"
                onClick={() => onShowToast('Fleet operational standards updated.')}
                className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
              >
                Save General Standards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
