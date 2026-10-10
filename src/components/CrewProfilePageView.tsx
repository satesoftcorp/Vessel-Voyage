import React, { useState } from 'react';
import { CrewMember, StaffMember, Vessel, VoyageRecord } from '../types';
import { ProfileImageUploader } from './ProfileImageUploader';
import {
  ArrowLeft,
  Ship,
  Anchor,
  Compass,
  Award,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  ShieldCheck,
  Globe,
  HeartPulse,
  FileCheck,
  Edit3,
  Save,
  X,
  Printer,
  Download,
  Wrench,
  Sparkles,
  ExternalLink,
  Briefcase,
  Layers,
  Activity,
  Check,
  AlertCircle,
  FileSpreadsheet,
  Navigation,
} from 'lucide-react';

export interface CrewProfilePageViewProps {
  crew: CrewMember;
  allCrew?: CrewMember[];
  staffList?: StaffMember[];
  vessels?: Vessel[];
  voyages?: VoyageRecord[];
  onBack: () => void;
  onUpdateCrew?: (updatedCrew: CrewMember) => void;
  onDeleteCrew?: (crewId: string) => void;
  onSelectOtherCrew?: (crew: CrewMember) => void;
  onNavigateToMaintenance?: (vesselName: string) => void;
  onShowToast?: (msg: string) => void;
}

export const CrewProfilePageView: React.FC<CrewProfilePageViewProps> = ({
  crew,
  allCrew = [],
  staffList = [],
  vessels = [],
  voyages = [],
  onBack,
  onUpdateCrew,
  onDeleteCrew,
  onSelectOtherCrew,
  onNavigateToMaintenance,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sea-service' | 'stcw-certs' | 'medical' | 'appraisals'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CrewMember>({ ...crew });
  const [isExporting, setIsExporting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync state if prop updates
  React.useEffect(() => {
    setEditForm({ ...crew });
  }, [crew]);

  // Find linked vessel if available
  const currentVessel = vessels.find(
    (v) => v.name.toLowerCase() === crew.assignedVesselName.toLowerCase() || v.id === crew.assignedVesselId
  );

  // Find linked staff profile if available
  const linkedStaff = staffList.find(
    (s) => s.staffId === crew.employeeId || s.id === crew.staffId || s.fullName.toLowerCase() === crew.fullName.toLowerCase()
  );

  // Filter voyages involving this vessel or crew
  const crewVoyages = voyages.filter(
    (v) =>
      v.vesselName?.toLowerCase() === crew.assignedVesselName?.toLowerCase() ||
      v.crewMembers?.some((c) => c.fullName?.toLowerCase() === crew.fullName?.toLowerCase() || c.staffId === crew.employeeId)
  );

  // Calculate days on board / duration
  const calculateDaysOnBoard = () => {
    try {
      const embark = new Date(crew.embarkDate);
      const now = new Date();
      if (isNaN(embark.getTime())) return 120;
      const diffTime = Math.abs(now.getTime() - embark.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 120;
    }
  };

  const daysOnBoard = calculateDaysOnBoard();

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateCrew) {
      onUpdateCrew(editForm);
    }
    setIsEditing(false);
    showNotice('Crew seafarer profile updated successfully.');
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    if (onShowToast) onShowToast(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handlePrintDossier = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      showNotice(`STCW IMO-FAL Crew Dossier generated for ${crew.fullName}`);
    }, 500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'On Board':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>On Board</span>
          </span>
        );
      case 'On Leave':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>On Leave</span>
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>In Transit</span>
          </span>
        );
      case 'Standby':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Standby Pool</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16" id="crew-profile-page-view">
      {/* Top Header & Breadcrumbs & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
            <button
              id="crew-profile-breadcrumb-roster"
              onClick={onBack}
              className="hover:text-[#465FFF] dark:hover:text-[#80CAEE] transition-colors flex items-center gap-1"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Crew Management &amp; Roster</span>
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              Seafarer Dossier: {crew.fullName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="crew-profile-back-btn"
              onClick={onBack}
              className="p-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors shadow-2xs group"
              title="Return to Crew Register"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2.5">
                <span>{crew.fullName}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#465FFF] dark:text-[#80CAEE] border border-blue-200 dark:border-blue-800">
                  {crew.rank}
                </span>
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Official Maritime Identification &bull; STCW &bull; CDC Seaman's Record &bull; Continuous Sea Service
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToMaintenance && crew.assignedVesselName && crew.assignedVesselName !== 'Unassigned' && (
            <button
              id="crew-profile-btn-maintenance"
              onClick={() => onNavigateToMaintenance(crew.assignedVesselName)}
              className="flex items-center gap-1.5 rounded-xl border border-[#465FFF]/30 bg-[#EBEFFF] dark:bg-[#465FFF]/20 px-3.5 py-2 text-xs font-semibold text-[#465FFF] dark:text-blue-400 hover:bg-[#465FFF]/15 transition-colors shadow-2xs"
            >
              <Wrench className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Vessel Maintenance:</span>
              <span>{crew.assignedVesselName}</span>
            </button>
          )}

          <button
            id="crew-profile-btn-print"
            onClick={handlePrintDossier}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors shadow-2xs"
          >
            <Printer className="h-3.5 w-3.5 text-gray-500" />
            <span>Print Dossier</span>
          </button>

          <button
            id="crew-profile-btn-export"
            onClick={() => {
              const dossierText = `
MARITIME SEAFARER OFFICIAL DOSSIER
======================================
Full Name: ${crew.fullName}
Employee / Seafarer ID: ${crew.employeeId}
STCW Rank / Position: ${crew.rank}
Assigned Vessel: ${crew.assignedVesselName}
Current Status: ${crew.status}
Nationality: ${crew.nationality} (${crew.nationalityCode})
Seaman's Book (CDC): ${crew.seamanBookNo}
Passport Number: ${crew.passportNo}
STCW Certificate Expiry: ${crew.certExpiry}
ENG1 Medical Fitness Expiry: ${crew.medicalCertExpiry}
Embarkation Date: ${crew.embarkDate}
Scheduled Disembarkation: ${crew.disembarkDate}
Emergency Phone: ${crew.phone}
Official Email: ${crew.email}
Generated on: ${new Date().toISOString()}
              `.trim();
              const blob = new Blob([dossierText], { type: 'text/plain;charset=utf-8' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `STCW_Crew_Dossier_${crew.employeeId}_${crew.fullName.replace(/\s+/g, '_')}.txt`;
              link.click();
              URL.revokeObjectURL(url);
              showNotice(`Dossier file exported for ${crew.fullName}`);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-gray-500" />
            <span>Export Text</span>
          </button>

          <button
            id="crew-profile-btn-toggle-edit"
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-colors ${
              isEditing
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-[#465FFF] hover:bg-[#3b52f5] text-white'
            }`}
          >
            {isEditing ? (
              <>
                <X className="h-3.5 w-3.5" />
                <span>Cancel Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Seafarer</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Action Toast Notification */}
      {actionNotice && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* In-Place Editing Form Mode */}
      {isEditing ? (
        <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-[#465FFF]" />
                <span>Edit Seafarer Identification &amp; Deployment</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Update STCW certifications, rank credentials, vessel assignment, and contact details.
              </p>
            </div>
            <span className="text-xs font-mono text-gray-400">{editForm.employeeId}</span>
          </div>

          <form onSubmit={handleSaveEdit} className="space-y-6">
            {/* Avatar Photo Editor */}
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
              <ProfileImageUploader
                currentImageUrl={editForm.avatarUrl}
                name={editForm.fullName}
                roleOrDepartment={editForm.rank}
                onImageChange={(img) => setEditForm((prev) => ({ ...prev, avatarUrl: img }))}
                label="Seafarer Portrait & Maritime Identification Photo"
                idPrefix="crew-edit-avatar"
                compact={false}
                allowPresets={true}
                helperText="Upload official mariner photograph or select high-res maritime avatar"
              />
            </div>

            {/* Core Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  STCW Rank / Position *
                </label>
                <select
                  value={editForm.rank}
                  onChange={(e) => setEditForm({ ...editForm, rank: e.target.value as CrewMember['rank'] })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden font-medium"
                >
                  <option value="Master (Captain)">Master (Captain)</option>
                  <option value="Chief Engineer">Chief Engineer</option>
                  <option value="Chief Officer">Chief Officer</option>
                  <option value="2nd Officer">2nd Officer</option>
                  <option value="3rd Officer">3rd Officer</option>
                  <option value="2nd Engineer">2nd Engineer</option>
                  <option value="3rd Engineer">3rd Engineer</option>
                  <option value="Electro-Technical Officer (ETO)">Electro-Technical Officer (ETO)</option>
                  <option value="Bosun">Bosun</option>
                  <option value="Able Seaman">Able Seaman</option>
                  <option value="Motorman">Motorman</option>
                  <option value="Cook">Cook</option>
                  <option value="Deck Cadet">Deck Cadet</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Vessel *
                </label>
                <select
                  value={editForm.assignedVesselName}
                  onChange={(e) => {
                    const vName = e.target.value;
                    const matchVessel = vessels.find((v) => v.name === vName);
                    setEditForm({
                      ...editForm,
                      assignedVesselName: vName,
                      assignedVesselId: matchVessel ? matchVessel.id : editForm.assignedVesselId,
                    });
                  }}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden font-medium"
                >
                  <option value="VOYAGER TITAN">VOYAGER TITAN</option>
                  <option value="PACIFIC HORIZON">PACIFIC HORIZON</option>
                  <option value="ATLANTIC PHOENIX">ATLANTIC PHOENIX</option>
                  <option value="MV VICTORIA STAR">MV VICTORIA STAR</option>
                  <option value="MV SERENA PRIDE">MV SERENA PRIDE</option>
                  <option value="LAKE QUEEN EXPRESS">LAKE QUEEN EXPRESS</option>
                  <option value="NILE CRANE CARGO">NILE CRANE CARGO</option>
                  <option value="Unassigned">Unassigned / Standby Pool</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Status *
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as CrewMember['status'] })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="On Board">On Board (Active Sea Duty)</option>
                  <option value="On Leave">On Leave (Rest / Shore Vacation)</option>
                  <option value="In Transit">In Transit (Joining / Repatriation)</option>
                  <option value="Standby">Standby (Ready for Mobilization)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Nationality &amp; Flag Endorsement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={editForm.nationality}
                    onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                    className="col-span-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    placeholder="e.g. Sweden"
                  />
                  <input
                    type="text"
                    value={editForm.nationalityCode}
                    onChange={(e) => setEditForm({ ...editForm, nationalityCode: e.target.value.toUpperCase() })}
                    className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-2 py-2 text-xs text-gray-900 dark:text-white font-mono uppercase text-center focus:border-[#465FFF] focus:outline-hidden"
                    placeholder="SE"
                    maxLength={3}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Seaman's Book (CDC) Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.seamanBookNo}
                  onChange={(e) => setEditForm({ ...editForm, seamanBookNo: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  placeholder="SB-XX-123456"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Passport Number *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.passportNo}
                  onChange={(e) => setEditForm({ ...editForm, passportNo: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
                  placeholder="PAS-XX-9900"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  STCW Certificate Expiry
                </label>
                <input
                  type="date"
                  value={editForm.certExpiry}
                  onChange={(e) => setEditForm({ ...editForm, certExpiry: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Medical Fitness (ENG1) Expiry
                </label>
                <input
                  type="date"
                  value={editForm.medicalCertExpiry}
                  onChange={(e) => setEditForm({ ...editForm, medicalCertExpiry: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Embarkation Date
                </label>
                <input
                  type="date"
                  value={editForm.embarkDate}
                  onChange={(e) => setEditForm({ ...editForm, embarkDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Scheduled Disembarkation Date
                </label>
                <input
                  type="date"
                  value={editForm.disembarkDate}
                  onChange={(e) => setEditForm({ ...editForm, disembarkDate: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Contact Phone &amp; Emergency Mobile
                </label>
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  placeholder="+1 555-0192"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Official Maritime Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  placeholder="seafarer@marinevessel.com"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#465FFF] hover:bg-[#3b52f5] text-xs font-semibold text-white shadow-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Main Seafarer Hero Banner Card */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-sm">
        {/* Background decorative maritime bar */}
        <div className="h-32 bg-gradient-to-r from-slate-900 via-[#1E293B] to-[#0F172A] relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#465FFF_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute top-4 right-5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-black/40 text-blue-200 backdrop-blur-xs border border-white/10">
              <ShieldCheck className="h-3 w-3 text-emerald-400" />
              <span>STCW MLC 2006 Verified</span>
            </span>
          </div>
        </div>

        {/* Profile Card Main Body */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 -mt-14 mb-6">
            {/* Left: Avatar and Identity */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
              <div className="relative group">
                <div className="h-28 w-28 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#1C2434] shadow-lg bg-gray-100 dark:bg-[#24303F]">
                  <img
                    src={crew.avatarUrl}
                    alt={crew.fullName}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2">
                  {getStatusBadge(crew.status)}
                </div>
              </div>

              <div className="text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crew.fullName}
                  </h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-[#465FFF]/10 text-[#465FFF] dark:text-[#80CAEE] border border-[#465FFF]/20">
                    {crew.rank}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-mono">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span>{crew.employeeId}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-gray-400" />
                    <span>{crew.nationality}</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-gray-100 dark:bg-[#24303F]">
                      {crew.nationalityCode}
                    </span>
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-gray-200">
                    <Ship className="h-3.5 w-3.5 text-[#465FFF]" />
                    <span>{crew.assignedVesselName}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Quick contact icons */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href={`mailto:${crew.email}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-200 dark:border-[#2E3A47] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A374A] transition-colors"
                title={`Email ${crew.fullName}`}
              >
                <Mail className="h-3.5 w-3.5 text-[#465FFF]" />
                <span>{crew.email}</span>
              </a>
              <a
                href={`tel:${crew.phone}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-200 dark:border-[#2E3A47] text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A374A] transition-colors"
                title={`Call ${crew.fullName}`}
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" />
                <span>{crew.phone}</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47]">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                <span>Days On Current Board</span>
              </span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {daysOnBoard} <span className="text-xs font-normal text-gray-500">days</span>
              </p>
              <p className="text-[10px] text-gray-500">Since {crew.embarkDate}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-emerald-500" />
                <span>Scheduled Disembark</span>
              </span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {crew.disembarkDate}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Standard 6-mo rotation</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 flex items-center gap-1">
                <FileCheck className="h-3 w-3 text-[#465FFF]" />
                <span>STCW Cert Expiry</span>
              </span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {crew.certExpiry}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Active &amp; Endorsed</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 flex items-center gap-1">
                <HeartPulse className="h-3 w-3 text-rose-500" />
                <span>Medical ENG1 Expiry</span>
              </span>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {crew.medicalCertExpiry}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Fit for Sea Duty</p>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation Bar */}
        <div className="flex items-center gap-1 px-6 border-t border-gray-100 dark:border-[#2E3A47] overflow-x-auto bg-gray-50/40 dark:bg-[#24303F]/20">
          <button
            id="crew-profile-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Overview &amp; Identification</span>
          </button>

          <button
            id="crew-profile-tab-sea-service"
            onClick={() => setActiveTab('sea-service')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sea-service'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Ship className="h-3.5 w-3.5" />
            <span>Vessel Assignment &amp; Voyages ({crewVoyages.length})</span>
          </button>

          <button
            id="crew-profile-tab-stcw-certs"
            onClick={() => setActiveTab('stcw-certs')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'stcw-certs'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>STCW Certifications &amp; Endorsements</span>
          </button>

          <button
            id="crew-profile-tab-medical"
            onClick={() => setActiveTab('medical')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'medical'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <HeartPulse className="h-3.5 w-3.5" />
            <span>Medical Fitness &amp; Safety</span>
          </button>

          <button
            id="crew-profile-tab-appraisals"
            onClick={() => setActiveTab('appraisals')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'appraisals'
                ? 'border-[#465FFF] text-[#465FFF] dark:text-[#80CAEE]'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Appraisals &amp; Compliance</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Overview & Identification */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Detailed Identifiers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Marine Document Details */}
            <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#465FFF]" />
                <span>Continuous Discharge Certificate (CDC) &amp; Travel Documents</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1">
                  <span className="text-gray-400 text-[11px] font-semibold uppercase">Seaman's Book / CDC No</span>
                  <p className="text-base font-bold font-mono text-gray-900 dark:text-white">{crew.seamanBookNo}</p>
                  <p className="text-[11px] text-gray-500">Issuing Authority: Maritime Admin ({crew.nationality})</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1">
                  <span className="text-gray-400 text-[11px] font-semibold uppercase">International Passport No</span>
                  <p className="text-base font-bold font-mono text-gray-900 dark:text-white">{crew.passportNo}</p>
                  <p className="text-[11px] text-gray-500">Citizen: {crew.nationality} ({crew.nationalityCode})</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1">
                  <span className="text-gray-400 text-[11px] font-semibold uppercase">STCW Certificate of Competency</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white">CoC Master Mariner / Chief Officer</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Valid until {crew.certExpiry}</p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1">
                  <span className="text-gray-400 text-[11px] font-semibold uppercase">MLC 2006 Employment Contract</span>
                  <p className="text-base font-bold text-gray-900 dark:text-white">Standard 6-Month Maritime Agreement</p>
                  <p className="text-[11px] text-gray-500">Expires upon disembarkation ({crew.disembarkDate})</p>
                </div>
              </div>
            </div>

            {/* Emergency & Next of Kin Information */}
            <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Next of Kin &amp; Emergency Response Contacts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1.5">
                  <span className="text-gray-400 text-[11px] font-semibold uppercase">Primary Next of Kin</span>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {linkedStaff?.emergencyContact || `Maria ${crew.fullName.split(' ').slice(1).join(' ')}`}
                  </p>
                  <p className="text-[11px] text-gray-500">Relationship: Spouse / Designated Family Member</p>
                  <div className="pt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="h-3.5 w-3.5 text-[#465FFF]" />
                    <span className="font-mono">{crew.phone}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1.5">
                  <span className="text-gray-400 text-[11px] font-semibold uppercase">Company Marine HR &amp; DPA Officer</span>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Capt. David Mukasa (DPA)</p>
                  <p className="text-[11px] text-gray-500">Designated Person Ashore (24/7 Maritime Desk)</p>
                  <div className="pt-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="font-mono">+256 700 882 119</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1 Col: Vessel Specs & Other Crew in Same Vessel */}
          <div className="space-y-6">
            {/* Assigned Vessel Highlight */}
            <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Ship className="h-4 w-4 text-[#465FFF]" />
                <span>Current Vessel Deployment</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {crew.assignedVesselName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-[#465FFF] dark:text-blue-300 font-bold">
                      {currentVessel?.type || 'Container / Cargo'}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-gray-600 dark:text-gray-300 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-400">IMO Number:</span>
                      <span className="font-mono font-medium text-gray-900 dark:text-white">{currentVessel?.imoNumber || 'IMO 9841234'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Operating Area:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{currentVessel?.waterBody || 'Lake Victoria / Great Lakes'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Status:</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentVessel?.status || 'Underway'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Speed / Heading:</span>
                      <span className="font-mono text-gray-900 dark:text-white">{currentVessel?.speedKnots || 14.2} kts / {currentVessel?.heading || 185}&deg;</span>
                    </div>
                  </div>
                </div>

                {onNavigateToMaintenance && (
                  <button
                    onClick={() => onNavigateToMaintenance(crew.assignedVesselName)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 dark:bg-[#24303F] border border-gray-200 dark:border-[#2E3A47] text-xs font-semibold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A374A] transition-colors"
                  >
                    <Wrench className="h-3.5 w-3.5 text-[#465FFF]" />
                    <span>View Vessel Maintenance Log</span>
                  </button>
                )}
              </div>
            </div>

            {/* Crew Members on the Same Vessel */}
            <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#465FFF]" />
                <span>Shipboard Team ({crew.assignedVesselName})</span>
              </h3>

              <div className="space-y-2.5">
                {allCrew
                  .filter((c) => c.assignedVesselName === crew.assignedVesselName && c.id !== crew.id)
                  .slice(0, 5)
                  .map((shipmate) => (
                    <div
                      key={shipmate.id}
                      onClick={() => onSelectOtherCrew && onSelectOtherCrew(shipmate)}
                      className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#24303F] cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-[#2E3A47]"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={shipmate.avatarUrl}
                          alt={shipmate.fullName}
                          className="h-8 w-8 rounded-xl object-cover ring-1 ring-gray-200 dark:ring-[#2E3A47]"
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{shipmate.fullName}</p>
                          <p className="text-[10px] text-[#465FFF] dark:text-[#80CAEE] font-medium">{shipmate.rank}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400">{shipmate.employeeId}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sea Service & Voyage History */}
      {activeTab === 'sea-service' && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Ship className="h-4 w-4 text-[#465FFF]" />
                  <span>Sea Service Records &amp; Voyage History</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Continuous marine navigation logs, passage logs, and vessel deployments for STCW sea-time accreditation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-[#465FFF] dark:text-[#80CAEE] border border-blue-100 dark:border-blue-800">
                  Total Logged Voyages: {crewVoyages.length > 0 ? crewVoyages.length : 12}
                </span>
              </div>
            </div>

            {crewVoyages.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                  <thead className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/60 dark:bg-[#24303F]/40 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-[#8A99AD]">
                    <tr>
                      <th className="px-4 py-3">Voyage No</th>
                      <th className="px-4 py-3">Vessel</th>
                      <th className="px-4 py-3">Departure Port</th>
                      <th className="px-4 py-3">Arrival Port</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Capacity</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
                    {crewVoyages.map((voyage) => (
                      <tr key={voyage.id} className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">
                          {voyage.voyageNumber}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {voyage.vesselName}
                        </td>
                        <td className="px-4 py-3">{voyage.departurePort}</td>
                        <td className="px-4 py-3">{voyage.arrivalPort}</td>
                        <td className="px-4 py-3 text-gray-500">{voyage.departureDate}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-[#465FFF] text-[10px] font-semibold">
                            {crew.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#465FFF]">
                      <Navigation className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs">
                        Voyage VYG-2026-081 &bull; {crew.assignedVesselName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Port Bell (Kampala) &rarr; Kisumu Port (Kenya) &bull; Sea Distance: 142 NM
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active Passage</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-[#1C2434] text-gray-500">
                      <Anchor className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-xs">
                        Voyage VYG-2026-074 &bull; {crew.assignedVesselName}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Mwanza South Port &rarr; Jinja Pier &bull; Sea Distance: 198 NM
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Logged (July 2026)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: STCW Certifications & Maritime Endorsements */}
      {activeTab === 'stcw-certs' && (
        <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-[#465FFF]" />
              <span>STCW 2010 Manila Amendments &amp; IMO Certifications</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verified certifications, radar navigation endorsements, GMDSS, and safety proficiency badges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  STCW Reg II/2 Master Mariner (Unlimited)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Valid
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Certificate No: STCW-COC-881920-SE</p>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200/50 dark:border-[#2E3A47]">
                <span>Expires: {crew.certExpiry}</span>
                <span className="text-emerald-600 font-semibold">100% Compliant</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  GMDSS General Operator Certificate (GOC)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Valid
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Certificate No: GMDSS-GOC-994112</p>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200/50 dark:border-[#2E3A47]">
                <span>Expires: 2028-11-15</span>
                <span className="text-emerald-600 font-semibold">Verified</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  ECDIS &amp; ARPA Radar Simulator Endorsement
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Valid
                </span>
              </div>
              <p className="text-[11px] text-gray-500">STCW Reg I/12 Type Specific Furuno / JRC</p>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200/50 dark:border-[#2E3A47]">
                <span>Expires: 2029-01-20</span>
                <span className="text-emerald-600 font-semibold">Permanent</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Advanced Fire Fighting &amp; Fast Rescue Craft (PSCRB)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                  Valid
                </span>
              </div>
              <p className="text-[11px] text-gray-500">STCW Reg VI/2 &amp; VI/3 Safety at Sea</p>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 pt-1 border-t border-gray-200/50 dark:border-[#2E3A47]">
                <span>Expires: {crew.certExpiry}</span>
                <span className="text-emerald-600 font-semibold">Refreshed</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Medical Fitness & Safety */}
      {activeTab === 'medical' && (
        <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              <span>Maritime Medical Fitness &amp; ENG1 Assessment</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              ILO / WHO / MLC 2006 Standard Medical Fitness evaluation and seafarer health clearance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-1">
              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-[11px] uppercase">Medical Status</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">Fit for Worldwide Sea Duty</p>
              <p className="text-[11px] text-emerald-600">Category A - No Restrictions</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1">
              <span className="text-gray-400 font-bold text-[11px] uppercase">ENG1 Certificate Expiry</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">{crew.medicalCertExpiry}</p>
              <p className="text-[11px] text-gray-500">Approved Maritime Physician</p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-1">
              <span className="text-gray-400 font-bold text-[11px] uppercase">Drug &amp; Alcohol Screening</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">Negative / Cleared</p>
              <p className="text-[11px] text-gray-500">Tested upon embarkation ({crew.embarkDate})</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Appraisals & Compliance */}
      {activeTab === 'appraisals' && (
        <div className="rounded-3xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#465FFF]" />
              <span>Annual Performance Appraisals &amp; Safety Compliance</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              MLC 2006 Hours of Work and Rest compliance audit, Master's appraisal, and safety records.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  Annual Sea-Duty Evaluation Score
                </span>
                <span className="text-sm font-bold text-[#465FFF]">4.9 / 5.0 (Exceptional)</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Demonstrated exemplary leadership, bridge resource management (BRM), and adherence to ISM Safety Management System during lake operations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 dark:text-white">
                  MLC 2006 Hours of Rest Compliance
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">100% Compliant</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Logged minimum 10 hours rest in any 24-hour period, with no safety violations or fatigue exceedances recorded.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
