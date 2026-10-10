import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Paperclip,
  X,
  Printer,
  Edit,
  ShieldAlert,
  Ship,
  Building2,
  MapPin,
  Compass,
  User,
  Phone,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Check,
  AlertCircle,
  Eye,
  FileText,
} from 'lucide-react';
import {
  IncidentRecord,
  IncidentMessage,
  IncidentStatus,
  IncidentSeverity,
} from '../types';

interface IncidentDetailViewProps {
  incident: IncidentRecord;
  allIncidents: IncidentRecord[];
  onBack: () => void;
  onNavigateHome?: () => void;
  onUpdateIncident: (incident: IncidentRecord) => void;
  onOpenEditModal: (incident: IncidentRecord) => void;
  onShowToast?: (message: string) => void;
  onSelectIncidentById: (id: string) => void;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  allIncidents,
  onBack,
  onNavigateHome,
  onUpdateIncident,
  onOpenEditModal,
  onShowToast,
  onSelectIncidentById,
}) => {
  const [replyText, setReplyText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  // Find index for previous / next pagination
  const currentIndex = allIncidents.findIndex((i) => i.id === incident.id);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (currentIndex === -1) return;
    const newIdx = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIdx >= 0 && newIdx < allIncidents.length) {
      onSelectIncidentById(allIncidents[newIdx].id);
      setReplyText('');
      setAttachedFiles([]);
    }
  };

  // Submit Investigation / Safety Reply
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachedFiles.length === 0) return;

    const newMsg: IncidentMessage = {
      id: `msg-rep-${Date.now()}`,
      senderName: 'Safety Superintendent',
      senderRole: 'Voyage IS Safety & Compliance Desk',
      senderEmail: 'safety.audit@voyageis.com',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      timestamp: 'Just now',
      isInvestigator: true,
      content: replyText.split('\n').filter((l) => l.trim().length > 0),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
    };

    // Construct base message list if none existed
    const existingMessages: IncidentMessage[] =
      incident.messages && incident.messages.length > 0
        ? incident.messages
        : [
            {
              id: `msg-orig-${incident.id}`,
              senderName: incident.reportedBy,
              senderRole: `${incident.reporterRole} • ${
                incident.type === 'Voyage' ? incident.vesselName || 'At-Sea Unit' : incident.facilityLocation || 'Shore Facility'
              }`,
              senderEmail: incident.reporterEmail || 'reporter@voyageis.com',
              senderAvatar:
                incident.reporterAvatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
              timestamp: `${incident.reportedDate} (${incident.reportedTime} UTC)`,
              isInvestigator: false,
              content: [
                incident.description,
                incident.immediateActionsTaken
                  ? `Immediate containment action: ${incident.immediateActionsTaken}`
                  : '',
              ].filter(Boolean),
              attachments: incident.attachmentsList,
            },
          ];

    const updatedIncident: IncidentRecord = {
      ...incident,
      messages: [...existingMessages, newMsg],
      lastUpdated: 'Just now',
      attachmentsCount: (incident.attachmentsCount || 0) + attachedFiles.length,
    };

    onUpdateIncident(updatedIncident);
    setReplyText('');
    setAttachedFiles([]);
    if (onShowToast) {
      onShowToast(`Investigation reply posted to ${incident.incidentCode}`);
    }
  };

  // Add sample technical diagram or log attachment
  const handleAddAttachment = () => {
    const sampleAttachments = [
      'VDR-Bridge-Audio-Extract.wav',
      'Technical-Damage-Photo.jpg',
      'Surveyor-Inspection-Report.pdf',
      'Engine-Diagnostic-Telemetry.csv',
      'Environmental-Spill-Signoff.pdf',
      'ECDIS-Track-Playback.log',
    ];
    const randomFile = sampleAttachments[Math.floor(Math.random() * sampleAttachments.length)];
    const fileName = `${randomFile.split('.')[0]}-${Date.now().toString().slice(-4)}.${randomFile.split('.')[1]}`;
    setAttachedFiles((prev) => [...prev, fileName]);
    if (onShowToast) {
      onShowToast(`Attached ${fileName}`);
    }
  };

  // Update Status
  const handleUpdateStatus = (newStatus: IncidentStatus) => {
    onUpdateIncident({
      ...incident,
      status: newStatus,
      lastUpdated: 'Just now',
    });
    if (onShowToast) {
      onShowToast(`Incident ${incident.incidentCode} status updated to "${newStatus}"`);
    }
  };

  // Print Report
  const handlePrint = () => {
    if (onShowToast) {
      onShowToast(`Preparing incident case file ${incident.incidentCode} for printing/export...`);
    }
    window.print();
  };

  // Prepare message list for rendering
  const displayMessages: IncidentMessage[] =
    incident.messages && incident.messages.length > 0
      ? incident.messages
      : [
          {
            id: `msg-orig-${incident.id}`,
            senderName: incident.reportedBy,
            senderRole: `${incident.reporterRole} • ${
              incident.type === 'Voyage' ? incident.vesselName || 'Fleet Unit' : incident.facilityLocation || 'Shore Facility'
            }`,
            senderEmail: incident.reporterEmail || 'reporter@voyageis.com',
            senderAvatar:
              incident.reporterAvatar ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            timestamp: `${incident.reportedDate} (${incident.reportedTime} UTC)`,
            isInvestigator: false,
            content: [
              incident.description,
              incident.immediateActionsTaken
                ? `Immediate Containment: ${incident.immediateActionsTaken}`
                : '',
            ].filter(Boolean),
            attachments: incident.attachmentsList,
          },
        ];

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50';
      case 'Low':
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Reported':
        return 'text-purple-600 dark:text-purple-400 font-semibold';
      case 'Under Investigation':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'Corrective Action':
        return 'text-cyan-600 dark:text-cyan-400 font-semibold';
      case 'Resolved':
        return 'text-[#22AD5C] dark:text-[#57D98D] font-semibold';
      case 'Closed':
        return 'text-gray-500 dark:text-gray-400 font-semibold';
      default:
        return 'text-gray-500 font-semibold';
    }
  };

  return (
    <div id="incident-detail-page-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] hover:bg-gray-100 dark:hover:bg-[#24303F] text-gray-600 dark:text-gray-300 transition-colors"
            title="Back to Incidents & Safety Register"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Incident Case Reply
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20 dark:text-blue-400 border border-[#465FFF]/20">
              {incident.incidentCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
          <button
            onClick={onNavigateHome || onBack}
            className="hover:text-[#465FFF] transition-colors"
          >
            Home
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <button
            onClick={onBack}
            className="hover:text-[#465FFF] transition-colors"
          >
            Incidents & Safety
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Incident Reply
          </span>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Incident Header + Message Thread + Reply Box */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-7 shadow-xs space-y-6">
          {/* Incident Subject Header + Pagination Controls */}
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-[#2E3A47] pb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold border ${getSeverityBadge(
                    incident.severity
                  )}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      incident.severity === 'Critical'
                        ? 'bg-red-600 animate-pulse'
                        : incident.severity === 'High'
                        ? 'bg-amber-600'
                        : incident.severity === 'Medium'
                        ? 'bg-blue-600'
                        : 'bg-gray-500'
                    }`}
                  />
                  <span>{incident.severity} Severity</span>
                </span>

                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    incident.type === 'Voyage'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                  }`}
                >
                  {incident.type === 'Voyage' ? (
                    <Ship className="h-3 w-3" />
                  ) : (
                    <Building2 className="h-3 w-3" />
                  )}
                  <span>{incident.type}</span>
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Incident #{incident.incidentCode} - {incident.title}
              </h2>
              <p className="text-xs text-gray-400 dark:text-[#8A99AD] mt-1">
                {incident.lastUpdated || `Reported on ${incident.reportedDate} at ${incident.reportedTime} UTC`}
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-500 dark:text-[#8A99AD]">
                {currentIndex + 1} of {allIncidents.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNavigate('prev')}
                  disabled={currentIndex <= 0}
                  className="p-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                  title="Previous incident"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleNavigate('next')}
                  disabled={currentIndex >= allIncidents.length - 1}
                  className="p-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
                  title="Next incident"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Context Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-gray-50/80 dark:bg-[#24303F]/40 border border-gray-100 dark:border-[#2E3A47] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Category</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block mt-0.5">
                {incident.category}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">
                {incident.type === 'Voyage' ? 'Vessel / Voyage' : 'Facility Location'}
              </span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block mt-0.5">
                {incident.type === 'Voyage'
                  ? `${incident.vesselName || 'Vessel'} (${incident.voyageNumber || 'At-Sea'})`
                  : incident.facilityLocation || incident.department || 'Shore Facility'}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Injuries / Health</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block mt-0.5">
                {incident.injuriesCount > 0 ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">{incident.injuriesCount} Injury Reported</span>
                ) : (
                  'Zero Injuries'
                )}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Est. Cost</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 block mt-0.5">
                {incident.estimatedCostUSD || '$0.00'}
              </span>
            </div>
          </div>

          {/* Messages & Investigation Thread */}
          <div className="space-y-6 divide-y divide-gray-100 dark:divide-[#2E3A47]/60">
            {displayMessages.map((msg, idx) => (
              <div key={msg.id} className={idx === 0 ? 'space-y-3' : 'pt-6 space-y-3'}>
                {/* Message Sender Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        msg.senderAvatar ||
                        (msg.isInvestigator
                          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                          : incident.reporterAvatar ||
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')
                      }
                      alt={msg.senderName}
                      className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-[#2E3A47]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                          {msg.senderName}
                        </h4>
                        {msg.isInvestigator && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-[#465FFF] dark:text-blue-400 border border-indigo-200 dark:border-indigo-800/40">
                            Investigator
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-[#8A99AD]">
                        {msg.senderRole || msg.senderEmail}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-gray-400 dark:text-[#8A99AD]">
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Content */}
                <div className="pl-13 space-y-2 text-xs sm:text-sm text-gray-600 dark:text-[#8A99AD] leading-relaxed">
                  {msg.content.map((paragraph, pIdx) => (
                    <p key={pIdx}>{paragraph}</p>
                  ))}

                  {/* Message Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {msg.attachments.map((att, aIdx) => (
                        <span
                          key={aIdx}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#24303F] text-gray-700 dark:text-gray-300 text-[11px] border border-gray-200/60 dark:border-gray-700"
                        >
                          <Paperclip className="h-3 w-3 text-gray-400" />
                          <span>{att}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Reply Input Form */}
          <form onSubmit={handleSendReply} className="pt-4 space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 focus-within:border-[#465FFF] focus-within:ring-1 focus-within:ring-[#465FFF] transition-all">
              <textarea
                rows={4}
                placeholder="Type your investigation update, corrective action reply, or safety finding..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full resize-none bg-transparent text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />

              {/* Attachment chips if any */}
              {attachedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-[#2E3A47]">
                  {attachedFiles.map((file, fIdx) => (
                    <span
                      key={fIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-[#24303F] text-gray-700 dark:text-gray-300 text-[11px]"
                    >
                      <Paperclip className="h-3 w-3 text-gray-400" />
                      <span>{file}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setAttachedFiles((prev) =>
                            prev.filter((_, i) => i !== fIdx)
                          )
                        }
                        className="hover:text-red-500 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Textarea Bottom Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-[#2E3A47] mt-2">
                <button
                  type="button"
                  onClick={handleAddAttachment}
                  className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD] hover:text-[#465FFF] dark:hover:text-[#465FFF] font-medium transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>Attach Technical File / Log</span>
                </button>

                <button
                  type="submit"
                  disabled={!replyText.trim() && attachedFiles.length === 0}
                  className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] hover:bg-[#3b52db] text-white px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  <span>Post Incident Reply</span>
                </button>
              </div>
            </div>

            {/* Status Radio Buttons (Matches Screenshot 2 design) */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Incident Status:
              </span>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="incidentStatus"
                  value="Under Investigation"
                  checked={incident.status === 'Under Investigation'}
                  onChange={() => handleUpdateStatus('Under Investigation')}
                  className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                />
                <span>Under Investigation</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="incidentStatus"
                  value="Corrective Action"
                  checked={incident.status === 'Corrective Action'}
                  onChange={() => handleUpdateStatus('Corrective Action')}
                  className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                />
                <span>Corrective Action</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="incidentStatus"
                  value="Resolved"
                  checked={incident.status === 'Resolved'}
                  onChange={() => handleUpdateStatus('Resolved')}
                  className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                />
                <span>Resolved</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="incidentStatus"
                  value="Closed"
                  checked={incident.status === 'Closed'}
                  onChange={() => handleUpdateStatus('Closed')}
                  className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                />
                <span>Closed</span>
              </label>
            </div>
          </form>
        </div>

        {/* Right Column (4 cols): Incident Details Card & Actions (Matches Screenshot 2) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#2E3A47] pb-3.5">
              Incident Details
            </h3>

            <div className="space-y-4 text-xs">
              {/* Reporter */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Reported By</span>
                <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                  <img
                    src={
                      incident.reporterAvatar ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={incident.reportedBy}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span>{incident.reportedBy}</span>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Designation</span>
                <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[170px]">
                  {incident.reporterRole}
                </span>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Email</span>
                <span className="font-semibold text-[#465FFF] dark:text-[#809FFF] truncate max-w-[170px]">
                  {incident.reporterEmail || 'a.chen@voyageis.com'}
                </span>
              </div>

              {/* Phone */}
              {incident.reporterPhone && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Phone</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {incident.reporterPhone}
                  </span>
                </div>
              )}

              {/* Incident ID */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Incident ID</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {incident.incidentCode}
                </span>
              </div>

              {/* Type */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Type</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {incident.type}
                </span>
              </div>

              {/* Category */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Category</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[170px]">
                  {incident.category}
                </span>
              </div>

              {/* Vessel / Location */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">
                  {incident.type === 'Voyage' ? 'Vessel / Route' : 'Facility Location'}
                </span>
                <span className="font-semibold text-gray-900 dark:text-white text-right max-w-[170px]">
                  {incident.type === 'Voyage'
                    ? incident.vesselName || 'Voyage Unit'
                    : incident.facilityLocation || incident.department || 'Shore Base'}
                </span>
              </div>

              {/* Date */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Reported Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {incident.reportedDate} ({incident.reportedTime})
                </span>
              </div>

              {/* Severity */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Severity</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${getSeverityBadge(
                    incident.severity
                  )}`}
                >
                  {incident.severity}
                </span>
              </div>

              {/* Pollution Flag */}
              <div className="flex items-center justify-between py-1">
                <span className="text-gray-500 dark:text-[#8A99AD]">Pollution Involved</span>
                <span
                  className={`font-semibold ${
                    incident.pollutionInvolved
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {incident.pollutionInvolved ? 'Yes (Spill Kit Deployed)' : 'No'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-1 border-t border-gray-100 dark:border-[#2E3A47] pt-3">
                <span className="text-gray-500 dark:text-[#8A99AD]">Case Status</span>
                <span className={getStatusBadge(incident.status)}>
                  {incident.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Investigation Actions
            </h4>

            <div className="space-y-2">
              {incident.status !== 'Resolved' && incident.status !== 'Closed' ? (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark Case as Resolved</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('Under Investigation')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 text-xs font-semibold shadow-xs transition-colors"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Reopen Investigation Case</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenEditModal(incident)}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-700 dark:text-gray-200 py-2.5 px-4 text-xs font-semibold transition-colors"
              >
                <Edit className="h-4 w-4 text-gray-500" />
                <span>Edit Incident Record</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-700 dark:text-gray-200 py-2.5 px-4 text-xs font-semibold transition-colors"
              >
                <Printer className="h-4 w-4 text-gray-500" />
                <span>Print / Export Safety Audit File</span>
              </button>

              <button
                type="button"
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-[#24303F] hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2.5 px-4 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-gray-500" />
                <span>Return to Safety Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
