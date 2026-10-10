import React, { useState } from 'react';
import {
  Ticket,
  Hourglass,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowLeft,
  Paperclip,
  Trash2,
  Eye,
  X,
  Plus,
  Send,
  Check,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  SupportTicketItem,
  TicketStatus,
  TicketMessage,
  TicketCategory,
} from '../types';
import { initialSupportTickets } from '../data/supportTicketsData';

interface SupportTicketsViewProps {
  onShowToast?: (message: string) => void;
  onNavigateHome?: () => void;
  initialTicketId?: string | null;
}

export const SupportTicketsView: React.FC<SupportTicketsViewProps> = ({
  onShowToast,
  onNavigateHome,
  initialTicketId = null,
}) => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>(initialSupportTickets);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(initialTicketId);
  const [activeTab, setActiveTab] = useState<'All' | 'Solved' | 'Pending'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<'createDate' | 'requestedBy'>('createDate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Pagination for list view
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Detail View Reply State
  const [replyText, setReplyText] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [showAttachInput, setShowAttachInput] = useState<boolean>(false);

  // Category filter dropdown state in list view
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    // Tab filter
    if (activeTab === 'Solved' && ticket.status !== 'Solved') return false;
    if (activeTab === 'Pending' && ticket.status !== 'Pending') return false;

    // Category filter
    if (selectedCategory !== 'All' && ticket.category !== selectedCategory) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        ticket.id.toLowerCase().includes(q) ||
        ticket.requestedBy.name.toLowerCase().includes(q) ||
        ticket.requestedBy.email.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q) ||
        ticket.status.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    return true;
  });

  // Calculate statistics for Top 3 KPI cards
  const totalTicketsCount = 5347; // Matching screenshot aesthetic
  const pendingTicketsCount = 1230; // Matching screenshot aesthetic
  const solvedTicketsCount = 4117; // Matching screenshot aesthetic

  // Pagination calculation
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Active ticket for Detail/Reply view
  const currentTicketIndex = activeTicketId
    ? tickets.findIndex((t) => t.id === activeTicketId)
    : -1;
  const activeTicket = currentTicketIndex !== -1 ? tickets[currentTicketIndex] : null;

  // Handle single ticket checkbox selection
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTicketIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Select All checkbox
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTicketIds(paginatedTickets.map((t) => t.id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  // Handle Delete single ticket
  const handleDeleteTicket = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTickets((prev) => prev.filter((t) => t.id !== id));
    setOpenActionMenuId(null);
    if (activeTicketId === id) {
      setActiveTicketId(null);
    }
    if (onShowToast) {
      onShowToast(`Ticket ${id} has been deleted.`);
    }
  };

  // Switch to next/previous ticket in Detail view
  const handleNavigateTicket = (direction: 'prev' | 'next') => {
    if (currentTicketIndex === -1) return;
    if (direction === 'prev' && currentTicketIndex > 0) {
      setActiveTicketId(tickets[currentTicketIndex - 1].id);
    } else if (direction === 'next' && currentTicketIndex < tickets.length - 1) {
      setActiveTicketId(tickets[currentTicketIndex + 1].id);
    }
  };

  // Update Status in detail view
  const handleUpdateStatus = (newStatus: TicketStatus) => {
    if (!activeTicket) return;
    setTickets((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? { ...t, status: newStatus } : t))
    );
    if (onShowToast) {
      onShowToast(`Ticket status updated to "${newStatus}"`);
    }
  };

  // Submit Reply in detail view
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() && attachedFiles.length === 0) return;
    if (!activeTicket) return;

    const newMsg: TicketMessage = {
      id: `msg-rep-${Date.now()}`,
      senderName: 'Musharof Chowdhury',
      senderRole: 'From - tailadmin support team',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      timestamp: 'Just now',
      isSupportAgent: true,
      content: replyText.split('\n').filter((l) => l.trim().length > 0),
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === activeTicket.id) {
          return {
            ...t,
            messages: [...t.messages, newMsg],
            lastUpdated: 'Just now',
          };
        }
        return t;
      })
    );

    setReplyText('');
    setAttachedFiles([]);
    if (onShowToast) {
      onShowToast('Your reply has been posted successfully.');
    }
  };

  // Add dummy file attachment
  const handleAddAttachment = () => {
    const fileName = `Screenshot-Guide-${Date.now().toString().slice(-4)}.png`;
    setAttachedFiles((prev) => [...prev, fileName]);
    if (onShowToast) {
      onShowToast(`Attached ${fileName}`);
    }
  };

  // Helper for status badge styling
  const renderStatusBadge = (status: TicketStatus) => {
    if (status === 'Solved') {
      return (
        <span className="text-xs font-semibold text-[#22AD5C] dark:text-[#57D98D]">
          Solved
        </span>
      );
    }
    if (status === 'Pending') {
      return (
        <span className="text-xs font-semibold text-[#F2994A] dark:text-[#FFA154]">
          Pending
        </span>
      );
    }
    if (status === 'In-Progress') {
      return (
        <span className="text-xs font-semibold text-[#465FFF] dark:text-[#809FFF]">
          In Progress
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* VIEW 2: TICKET REPLY & DETAILS (Matches Screenshot 2 when ticket is open) */}
      {/* ========================================================================= */}
      {activeTicket ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Top Breadcrumb Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTicketId(null)}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] hover:bg-gray-100 dark:hover:bg-[#24303F] text-gray-600 dark:text-gray-300 transition-colors"
                title="Back to tickets list"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Ticket Reply
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
              <button
                onClick={onNavigateHome}
                className="hover:text-[#465FFF] transition-colors"
              >
                Home
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <button
                onClick={() => setActiveTicketId(null)}
                className="hover:text-[#465FFF] transition-colors"
              >
                Support Tickets
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Ticket Reply
              </span>
            </div>
          </div>

          {/* Main 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Ticket Header + Messages Thread + Reply Box */}
            <div className="lg:col-span-8 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-7 shadow-xs space-y-6">
              {/* Ticket Subject Header + Nav Chevrons */}
              <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-[#2E3A47] pb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    Ticket {activeTicket.id} - {activeTicket.subject}
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-[#8A99AD] mt-1">
                    {activeTicket.lastUpdated || `${activeTicket.createDate} (2 days ago)`}
                  </p>
                </div>

                {/* Index & Pagination Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    {currentTicketIndex + 1} of {tickets.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleNavigateTicket('prev')}
                      disabled={currentTicketIndex <= 0}
                      className="p-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#24303F]"
                      title="Previous ticket"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleNavigateTicket('next')}
                      disabled={currentTicketIndex >= tickets.length - 1}
                      className="p-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#24303F]"
                      title="Next ticket"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Thread */}
              <div className="space-y-6 divide-y divide-gray-100 dark:divide-[#2E3A47]/60">
                {activeTicket.messages.map((msg, idx) => (
                  <div key={msg.id} className={idx === 0 ? 'space-y-3' : 'pt-6 space-y-3'}>
                    {/* Message Sender Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            msg.senderAvatar ||
                            (msg.isSupportAgent
                              ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                              : activeTicket.requestedBy.avatar ||
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80')
                          }
                          alt={msg.senderName}
                          className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-[#2E3A47]"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                            {msg.senderName}
                          </h4>
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
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Reply Input Form */}
              <form onSubmit={handleSendReply} className="pt-4 space-y-4">
                <div className="rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 focus-within:border-[#465FFF] focus-within:ring-1 focus-within:ring-[#465FFF] transition-all">
                  <textarea
                    rows={4}
                    placeholder="Type your reply here..."
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
                      <span>Attach</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!replyText.trim() && attachedFiles.length === 0}
                      className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] hover:bg-[#3b52db] text-white px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                      <span>Reply</span>
                    </button>
                  </div>
                </div>

                {/* Status Radio Buttons (Matches Screenshot 2) */}
                <div className="flex items-center gap-6 pt-1">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Status:
                  </span>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="ticketStatus"
                      value="In-Progress"
                      checked={activeTicket.status === 'In-Progress'}
                      onChange={() => handleUpdateStatus('In-Progress')}
                      className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                    />
                    <span>In-Progress</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="ticketStatus"
                      value="Solved"
                      checked={activeTicket.status === 'Solved'}
                      onChange={() => handleUpdateStatus('Solved')}
                      className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                    />
                    <span>Solved</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="radio"
                      name="ticketStatus"
                      value="On-Hold"
                      checked={activeTicket.status === 'On-Hold'}
                      onChange={() => handleUpdateStatus('On-Hold')}
                      className="h-4 w-4 text-[#465FFF] border-gray-300 focus:ring-[#465FFF]"
                    />
                    <span>On-Hold</span>
                  </label>
                </div>
              </form>
            </div>

            {/* Right Column: Ticket Details Card (Matches Screenshot 2) */}
            <div className="lg:col-span-4 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 sm:p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-[#2E3A47] pb-3.5">
                Ticket Details
              </h3>

              <div className="space-y-4 text-xs">
                {/* Customer */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Customer</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeTicket.requestedBy.name}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Email</span>
                  <span className="font-semibold text-[#465FFF] dark:text-[#809FFF] truncate max-w-[170px]">
                    {activeTicket.requestedBy.email}
                  </span>
                </div>

                {/* Ticket ID */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Ticket ID</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeTicket.id}
                  </span>
                </div>

                {/* Category */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Category</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeTicket.category}
                  </span>
                </div>

                {/* Created */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Created</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {activeTicket.createDate}
                  </span>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-500 dark:text-[#8A99AD]">Status</span>
                  <span className="font-semibold text-[#465FFF] dark:text-[#809FFF]">
                    {activeTicket.status === 'In-Progress' ? 'In Progress' : activeTicket.status}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-[#2E3A47] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(
                      activeTicket.status === 'Solved' ? 'In-Progress' : 'Solved'
                    );
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F] text-gray-700 dark:text-gray-200 py-2.5 px-4 text-xs font-semibold transition-colors"
                >
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>
                    {activeTicket.status === 'Solved'
                      ? 'Reopen Ticket'
                      : 'Mark as Solved'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTicketId(null)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-[#24303F] hover:bg-gray-200 dark:hover:bg-[#2E3A47] text-gray-700 dark:text-gray-300 py-2 px-4 text-xs font-medium transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Return to All Tickets</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW 1: SUPPORT TICKETS LIST & KPIS (Matches Screenshot 1)                */
        /* ========================================================================= */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Breadcrumb Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Support Tickets
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-[#8A99AD]">
              <button
                onClick={onNavigateHome}
                className="hover:text-[#465FFF] transition-colors"
              >
                Home
              </button>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                Support Tickets
              </span>
            </div>
          </div>

          {/* Top 3 KPI Metric Cards (Matches Screenshot 1) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Total tickets */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F2F4FE] dark:bg-[#465FFF]/15 text-[#465FFF]">
                <Ticket className="h-6 w-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {totalTicketsCount.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                  Total tickets
                </p>
              </div>
            </div>

            {/* Card 2: Pending tickets */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6E9] dark:bg-amber-500/15 text-[#F2994A]">
                <Hourglass className="h-6 w-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {pendingTicketsCount.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                  Pending tickets
                </p>
              </div>
            </div>

            {/* Card 3: Solved tickets */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EBFBF2] dark:bg-[#22AD5C]/15 text-[#22AD5C]">
                <CheckCircle2 className="h-6 w-6 stroke-[1.75]" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {solvedTicketsCount.toLocaleString()}
                </h3>
                <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                  Solved tickets
                </p>
              </div>
            </div>
          </div>

          {/* Main Table Card (Matches Screenshot 1) */}
          <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs overflow-hidden">
            {/* Table Card Header: Title, Subtitle, Tab Pills, Search, Filter */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-[#2E3A47] gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                  Support Tickets
                </h2>
                <p className="text-xs text-gray-400 dark:text-[#8A99AD] mt-0.5">
                  Your most recent support tickets list
                </p>
              </div>

              {/* Right Controls: Tabs + Search + Filter */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Segmented Filter Tabs: All, Solved, Pending */}
                <div className="inline-flex items-center rounded-xl bg-gray-50 dark:bg-[#24303F] p-1 border border-gray-100 dark:border-[#2E3A47]">
                  {(['All', 'Solved', 'Pending'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setCurrentPage(1);
                      }}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        activeTab === tab
                          ? 'bg-white dark:bg-[#1C2434] text-gray-900 dark:text-white shadow-2xs'
                          : 'text-gray-500 dark:text-[#8A99AD] hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-48 sm:w-56 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-transparent pl-9 pr-7 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCategoryFilterModal(!showCategoryFilterModal)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedCategory !== 'All'
                        ? 'border-[#465FFF] bg-[#465FFF]/10 text-[#465FFF]'
                        : 'border-gray-200 dark:border-[#2E3A47] text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]'
                    }`}
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span>{selectedCategory !== 'All' ? selectedCategory : 'Filter'}</span>
                  </button>

                  {/* Category Dropdown */}
                  {showCategoryFilterModal && (
                    <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-1.5 shadow-xl">
                      <div className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase">
                        Filter by Category
                      </div>
                      {(
                        [
                          'All',
                          'General Support',
                          'Billing',
                          'Technical',
                          'Feature Request',
                          'Account Access',
                        ] as const
                      ).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowCategoryFilterModal(false);
                            setCurrentPage(1);
                          }}
                          className={`flex w-full items-center justify-between px-3 py-1.5 text-xs rounded-lg ${
                            selectedCategory === cat
                              ? 'bg-[#465FFF]/10 text-[#465FFF] font-semibold'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434]'
                          }`}
                        >
                          <span>{cat}</span>
                          {selectedCategory === cat && <Check className="h-3.5 w-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-[#2E3A47] text-[11px] font-semibold text-gray-400 dark:text-[#8A99AD] uppercase tracking-wider">
                    {/* Checkbox Header */}
                    <th className="py-3.5 pl-6 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedTickets.length > 0 &&
                          selectedTicketIds.length === paginatedTickets.length
                        }
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[#465FFF] focus:ring-0 cursor-pointer"
                      />
                    </th>

                    {/* Ticket ID */}
                    <th className="py-3.5 px-3">Ticket ID</th>

                    {/* Requested By */}
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 dark:hover:text-white">
                        <span>Requested By</span>
                        <span className="text-[10px] text-gray-400">⇅</span>
                      </div>
                    </th>

                    {/* Subject */}
                    <th className="py-3.5 px-4">Subject</th>

                    {/* Create Date */}
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-700 dark:hover:text-white">
                        <span>Create Date</span>
                        <span className="text-[10px] text-gray-400">⇅</span>
                      </div>
                    </th>

                    {/* Status */}
                    <th className="py-3.5 px-4">Status</th>

                    {/* Action */}
                    <th className="py-3.5 pr-6 pl-3 text-right"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]/60 text-xs">
                  {paginatedTickets.map((ticket) => {
                    const isSelected = selectedTicketIds.includes(ticket.id);
                    const isMenuOpen = openActionMenuId === ticket.id;

                    return (
                      <tr
                        key={ticket.id}
                        onClick={() => setActiveTicketId(ticket.id)}
                        className={`group hover:bg-gray-50/70 dark:hover:bg-[#24303F]/60 cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#EBF1FF]/40 dark:bg-[#465FFF]/10' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 pl-6 pr-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => handleToggleSelect(ticket.id, e)}
                            onChange={() => {}}
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[#465FFF] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Ticket ID */}
                        <td className="py-4 px-3 font-semibold text-gray-800 dark:text-gray-200">
                          {ticket.id}
                        </td>

                        {/* Requested By (Name + Email) */}
                        <td className="py-4 px-4">
                          <div className="min-w-[150px]">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {ticket.requestedBy.name}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-[#8A99AD] mt-0.5">
                              {ticket.requestedBy.email}
                            </div>
                          </div>
                        </td>

                        {/* Subject */}
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">
                          {ticket.subject}
                        </td>

                        {/* Create Date */}
                        <td className="py-4 px-4 text-gray-500 dark:text-[#8A99AD] whitespace-nowrap">
                          {ticket.createDate}
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {renderStatusBadge(ticket.status)}
                        </td>

                        {/* 3-Dots Action Menu */}
                        <td className="py-4 pr-6 pl-3 text-right relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(isMenuOpen ? null : ticket.id);
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                              title="Actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>

                            {/* Dropdown Popup: View More / Delete (Matches Screenshot 1) */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-6 top-10 z-30 w-32 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-1.5 shadow-xl text-left"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTicketId(ticket.id);
                                    setOpenActionMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                                >
                                  <Eye className="h-3.5 w-3.5 text-gray-400" />
                                  <span>View More</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteTicket(ticket.id, e)}
                                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {paginatedTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-xs text-gray-400">
                        No support tickets found matching your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer (Matches Screenshot 1) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 border-t border-gray-100 dark:border-[#2E3A47] gap-3">
              <span className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Showing{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {filteredTickets.length > 0
                    ? (currentPage - 1) * itemsPerPage + 1
                    : 0}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {Math.min(currentPage * itemsPerPage, filteredTickets.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {filteredTickets.length}
                </span>
              </span>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2E3A47] text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#24303F]"
                  title="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-7 w-7 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === pageNum
                        ? 'bg-[#465FFF] text-white shadow-xs'
                        : 'text-gray-600 dark:text-[#8A99AD] hover:bg-gray-100 dark:hover:bg-[#24303F]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1.5 rounded-lg border border-gray-200 dark:border-[#2E3A47] text-gray-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-[#24303F]"
                  title="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
