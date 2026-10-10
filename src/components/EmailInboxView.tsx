import React, { useState } from 'react';
import {
  Pencil,
  Inbox as InboxIcon,
  Send as SendIcon,
  FileText,
  AlertOctagon,
  Trash2,
  Archive,
  Star,
  Bookmark,
  Search,
  RotateCw,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Info,
  Mail,
  Paperclip,
  CornerUpLeft,
  CornerUpRight,
  ReplyAll,
  Download,
  X,
  FileCode,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Eye,
  Check,
} from 'lucide-react';
import {
  EmailItem,
  EmailFolder,
  EmailFilterType,
  EmailLabelType,
  EmailAttachment,
} from '../types';
import { initialEmails } from '../data/emailData';

interface EmailInboxViewProps {
  onShowToast?: (message: string) => void;
  onNavigateHome?: () => void;
}

export const EmailInboxView: React.FC<EmailInboxViewProps> = ({
  onShowToast,
  onNavigateHome,
}) => {
  const [emails, setEmails] = useState<EmailItem[]>(initialEmails);
  const [selectedFolder, setSelectedFolder] = useState<EmailFolder>('inbox');
  const [selectedFilter, setSelectedFilter] = useState<EmailFilterType | null>(null);
  const [selectedLabel, setSelectedLabel] = useState<EmailLabelType | null>(null);
  const [activeEmailId, setActiveEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEmailIds, setSelectedEmailIds] = useState<string[]>([]);
  const [showSelectDropdown, setShowSelectDropdown] = useState<boolean>(false);
  const [showMoreActionsMenu, setShowMoreActionsMenu] = useState<boolean>(false);
  const [isComposeOpen, setIsComposeOpen] = useState<boolean>(false);
  const [replyMode, setReplyMode] = useState<'reply' | 'replyAll' | 'forward' | null>(null);

  // Compose / Reply Form State
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 13;

  // Filter emails based on folder, filter, label, and search
  const filteredEmails = emails.filter((mail) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        mail.sender.toLowerCase().includes(q) ||
        mail.senderEmail.toLowerCase().includes(q) ||
        mail.subject.toLowerCase().includes(q) ||
        mail.snippet.toLowerCase().includes(q);
      if (!matchSearch) return false;
    }

    // Label filter
    if (selectedLabel) {
      return mail.label === selectedLabel;
    }

    // Special Filter type (Starred, Important)
    if (selectedFilter === 'starred') {
      return mail.isStarred;
    }
    if (selectedFilter === 'important') {
      return mail.isImportant;
    }

    // Standard folder filter
    return mail.folder === selectedFolder;
  });

  // Calculate counts for folders
  const inboxUnreadCount = emails.filter(
    (e) => e.folder === 'inbox' && !e.isRead
  ).length;
  const spamCount = emails.filter((e) => e.folder === 'spam').length;

  // Pagination slicing
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage) || 1;
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Active opened email (for detail view)
  const activeEmail = emails.find((e) => e.id === activeEmailId) || null;
  const activeEmailIndexInFiltered = activeEmail
    ? filteredEmails.findIndex((e) => e.id === activeEmail.id)
    : -1;

  // Handle open email
  const handleOpenEmail = (mail: EmailItem) => {
    setActiveEmailId(mail.id);
    // Mark as read
    if (!mail.isRead) {
      setEmails((prev) =>
        prev.map((e) => (e.id === mail.id ? { ...e, isRead: true } : e))
      );
    }
  };

  // Toggle star
  const handleToggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStarred = !m.isStarred;
          if (onShowToast) {
            onShowToast(newStarred ? 'Email starred' : 'Email unstarred');
          }
          return { ...m, isStarred: newStarred };
        }
        return m;
      })
    );
  };

  // Toggle single selection checkbox
  const handleToggleSelect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedEmailIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all / none / read / unread
  const handleSelectOption = (option: 'all' | 'none' | 'read' | 'unread') => {
    setShowSelectDropdown(false);
    if (option === 'all') {
      setSelectedEmailIds(paginatedEmails.map((e) => e.id));
    } else if (option === 'none') {
      setSelectedEmailIds([]);
    } else if (option === 'read') {
      setSelectedEmailIds(
        paginatedEmails.filter((e) => e.isRead).map((e) => e.id)
      );
    } else if (option === 'unread') {
      setSelectedEmailIds(
        paginatedEmails.filter((e) => !e.isRead).map((e) => e.id)
      );
    }
  };

  // Delete selected emails or current email
  const handleDeleteSelected = () => {
    if (activeEmailId) {
      setEmails((prev) =>
        prev.map((e) =>
          e.id === activeEmailId ? { ...e, folder: 'trash' } : e
        )
      );
      setActiveEmailId(null);
      if (onShowToast) onShowToast('Email moved to Trash');
      return;
    }

    if (selectedEmailIds.length === 0) {
      if (onShowToast) onShowToast('No emails selected to delete');
      return;
    }

    setEmails((prev) =>
      prev.map((e) =>
        selectedEmailIds.includes(e.id) ? { ...e, folder: 'trash' } : e
      )
    );
    if (onShowToast) {
      onShowToast(`${selectedEmailIds.length} email(s) moved to Trash`);
    }
    setSelectedEmailIds([]);
  };

  // Archive selected emails or current email
  const handleArchiveSelected = () => {
    if (activeEmailId) {
      setEmails((prev) =>
        prev.map((e) =>
          e.id === activeEmailId ? { ...e, folder: 'archive' } : e
        )
      );
      setActiveEmailId(null);
      if (onShowToast) onShowToast('Email moved to Archive');
      return;
    }

    if (selectedEmailIds.length === 0) {
      if (onShowToast) onShowToast('No emails selected to archive');
      return;
    }

    setEmails((prev) =>
      prev.map((e) =>
        selectedEmailIds.includes(e.id) ? { ...e, folder: 'archive' } : e
      )
    );
    if (onShowToast) {
      onShowToast(`${selectedEmailIds.length} email(s) archived`);
    }
    setSelectedEmailIds([]);
  };

  // Mark selected or active as unread
  const handleMarkAsUnread = () => {
    if (activeEmailId) {
      setEmails((prev) =>
        prev.map((e) =>
          e.id === activeEmailId ? { ...e, isRead: false } : e
        )
      );
      setActiveEmailId(null);
      if (onShowToast) onShowToast('Marked as unread');
      return;
    }

    if (selectedEmailIds.length > 0) {
      setEmails((prev) =>
        prev.map((e) =>
          selectedEmailIds.includes(e.id) ? { ...e, isRead: false } : e
        )
      );
      if (onShowToast) {
        onShowToast(`${selectedEmailIds.length} email(s) marked as unread`);
      }
      setSelectedEmailIds([]);
    }
  };

  // Next / Previous email in detail view
  const handleNavigateDetail = (direction: 'prev' | 'next') => {
    if (activeEmailIndexInFiltered === -1) return;
    if (direction === 'prev' && activeEmailIndexInFiltered > 0) {
      const prevMail = filteredEmails[activeEmailIndexInFiltered - 1];
      setActiveEmailId(prevMail.id);
      if (!prevMail.isRead) {
        setEmails((prev) =>
          prev.map((e) => (e.id === prevMail.id ? { ...e, isRead: true } : e))
        );
      }
    } else if (
      direction === 'next' &&
      activeEmailIndexInFiltered < filteredEmails.length - 1
    ) {
      const nextMail = filteredEmails[activeEmailIndexInFiltered + 1];
      setActiveEmailId(nextMail.id);
      if (!nextMail.isRead) {
        setEmails((prev) =>
          prev.map((e) => (e.id === nextMail.id ? { ...e, isRead: true } : e))
        );
      }
    }
  };

  // Start Reply / Forward
  const handleStartReply = (mode: 'reply' | 'replyAll' | 'forward') => {
    if (!activeEmail) return;
    setReplyMode(mode);
    setComposeTo(activeEmail.senderEmail);
    setComposeSubject(
      mode === 'forward'
        ? `Fwd: ${activeEmail.subject}`
        : `Re: ${activeEmail.subject}`
    );
    setComposeBody(
      `\n\n--- Original Message from ${activeEmail.sender} (${activeEmail.senderEmail}) ---\n${activeEmail.body.join(
        '\n'
      )}`
    );
    setIsComposeOpen(true);
  };

  // Send Compose / Reply Email
  const handleSendCompose = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim()) {
      if (onShowToast) onShowToast('Please specify recipient and subject.');
      return;
    }

    const newSentEmail: EmailItem = {
      id: `mail-sent-${Date.now()}`,
      sender: 'Me (Alexander)',
      senderEmail: 'alexander@voyageis.com',
      recipient: composeTo,
      recipientEmail: composeTo,
      subject: composeSubject,
      snippet: composeBody.slice(0, 100) || 'Message body sent...',
      body: composeBody.split('\n').filter((l) => l.trim().length > 0),
      date: 'Just now',
      isRead: true,
      isStarred: false,
      isImportant: false,
      folder: 'sent',
    };

    setEmails((prev) => [newSentEmail, ...prev]);
    setIsComposeOpen(false);
    setReplyMode(null);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');

    if (onShowToast) {
      onShowToast(`Message sent successfully to ${composeTo}!`);
    }
  };

  // Helper for badge color pills
  const renderBadge = (badge?: EmailItem['badge']) => {
    if (!badge) return null;
    let colorClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    if (badge.variant === 'important') {
      colorClass = 'bg-[#FFF0ED] text-[#E05638] dark:bg-[#E05638]/15 dark:text-[#FFA18C]';
    } else if (badge.variant === 'social') {
      colorClass = 'bg-[#EBFBF2] text-[#22AD5C] dark:bg-[#22AD5C]/15 dark:text-[#57D98D]';
    } else if (badge.variant === 'promotional') {
      colorClass = 'bg-[#EBF1FF] text-[#3758F9] dark:bg-[#3758F9]/15 dark:text-[#809FFF]';
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-none whitespace-nowrap ${colorClass}`}
      >
        {badge.text}
      </span>
    );
  };

  // Helper for label dot colors
  const getLabelColor = (labelName: EmailLabelType) => {
    switch (labelName) {
      case 'Personal':
        return 'bg-[#22AD5C]';
      case 'Work':
        return 'bg-[#E05638]';
      case 'Payments':
        return 'bg-[#F2994A]';
      case 'Invoices':
        return 'bg-[#2F80ED]';
      case 'Blank':
        return 'bg-[#5B6B79]';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Breadcrumb bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Inbox
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
            Inbox
          </span>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* Left Sidebar: Compose, Mailboxes, Filters, Labels */}
        <div className="lg:col-span-3 xl:col-span-3 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 sm:p-5 flex flex-col gap-6 shadow-xs h-fit">
          {/* Blue Compose Button */}
          <button
            onClick={() => {
              setReplyMode(null);
              setComposeTo('');
              setComposeSubject('');
              setComposeBody('');
              setIsComposeOpen(true);
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#465FFF] hover:bg-[#3b52db] text-white py-2.5 px-4 text-xs sm:text-sm font-medium shadow-md transition-all active:scale-[0.99]"
          >
            <Pencil className="h-4 w-4" />
            <span>Compose</span>
          </button>

          {/* Section 1: MAILBOX */}
          <div className="space-y-1">
            <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-[#8A99AD] uppercase px-2 mb-2">
              Mailbox
            </h3>

            {/* Inbox */}
            <button
              onClick={() => {
                setSelectedFolder('inbox');
                setSelectedFilter(null);
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFolder === 'inbox' && !selectedFilter && !selectedLabel
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <InboxIcon className="h-4 w-4" />
                <span>Inbox</span>
              </div>
              {inboxUnreadCount > 0 && (
                <span className="text-xs font-semibold text-[#465FFF] dark:text-[#809FFF]">
                  {inboxUnreadCount}
                </span>
              )}
            </button>

            {/* Sent */}
            <button
              onClick={() => {
                setSelectedFolder('sent');
                setSelectedFilter(null);
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFolder === 'sent' && !selectedFilter && !selectedLabel
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <SendIcon className="h-4 w-4" />
                <span>Sent</span>
              </div>
            </button>

            {/* Drafts */}
            <button
              onClick={() => {
                setSelectedFolder('drafts');
                setSelectedFilter(null);
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFolder === 'drafts' && !selectedFilter && !selectedLabel
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span>Drafts</span>
              </div>
            </button>

            {/* Spam */}
            <button
              onClick={() => {
                setSelectedFolder('spam');
                setSelectedFilter(null);
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFolder === 'spam' && !selectedFilter && !selectedLabel
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertOctagon className="h-4 w-4" />
                <span>Spam</span>
              </div>
              {spamCount > 0 && (
                <span className="text-xs font-semibold text-gray-500 dark:text-[#8A99AD]">
                  {spamCount}
                </span>
              )}
            </button>

            {/* Trash */}
            <button
              onClick={() => {
                setSelectedFolder('trash');
                setSelectedFilter(null);
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFolder === 'trash' && !selectedFilter && !selectedLabel
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-4 w-4" />
                <span>Trash</span>
              </div>
            </button>

            {/* Archive */}
            <button
              onClick={() => {
                setSelectedFolder('archive');
                setSelectedFilter(null);
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFolder === 'archive' && !selectedFilter && !selectedLabel
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="h-4 w-4" />
                <span>Archive</span>
              </div>
            </button>
          </div>

          {/* Section 2: FILTER */}
          <div className="space-y-1">
            <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-[#8A99AD] uppercase px-2 mb-2">
              Filter
            </h3>

            {/* Starred */}
            <button
              onClick={() => {
                setSelectedFilter('starred');
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFilter === 'starred'
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <Star className="h-4 w-4" />
              <span>Starred</span>
            </button>

            {/* Important */}
            <button
              onClick={() => {
                setSelectedFilter('important');
                setSelectedLabel(null);
                setActiveEmailId(null);
                setCurrentPage(1);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                selectedFilter === 'important'
                  ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                  : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Important</span>
            </button>
          </div>

          {/* Section 3: LABEL */}
          <div className="space-y-1">
            <h3 className="text-[11px] font-semibold tracking-wider text-gray-400 dark:text-[#8A99AD] uppercase px-2 mb-2">
              Label
            </h3>

            {(['Personal', 'Work', 'Payments', 'Invoices', 'Blank'] as EmailLabelType[]).map(
              (lbl) => (
                <button
                  key={lbl}
                  onClick={() => {
                    setSelectedLabel(lbl);
                    setSelectedFilter(null);
                    setActiveEmailId(null);
                    setCurrentPage(1);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm transition-all ${
                    selectedLabel === lbl
                      ? 'bg-[#EBF1FF] dark:bg-[#465FFF]/20 text-[#465FFF] dark:text-white font-semibold'
                      : 'text-gray-700 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]'
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-[3px] ${getLabelColor(lbl)}`}
                  />
                  <span>{lbl}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Main Panel: Either Email List OR Email Detail View */}
        <div className="lg:col-span-9 xl:col-span-9 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs flex flex-col overflow-hidden">
          {activeEmail ? (
            /* ========================================================== */
            /* VIEW 2: SINGLE EMAIL DETAIL VIEW (Matches Screenshot 2)   */
            /* ========================================================== */
            <div className="flex flex-col flex-1">
              {/* Detail Toolbar */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-[#2E3A47]">
                {/* Left Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => setActiveEmailId(null)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Back to inbox"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (onShowToast) onShowToast('Message flagged as spam');
                      setEmails((prev) =>
                        prev.map((e) =>
                          e.id === activeEmail.id ? { ...e, folder: 'spam' } : e
                        )
                      );
                      setActiveEmailId(null);
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Report spam"
                  >
                    <Info className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleArchiveSelected}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Archive"
                  >
                    <Archive className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleMarkAsUnread}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Mark as unread"
                  >
                    <Mail className="h-4 w-4" />
                  </button>
                </div>

                {/* Right Pagination Indicator & Chevrons */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 dark:text-[#8A99AD]">
                    {activeEmailIndexInFiltered + 1} of {filteredEmails.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleNavigateDetail('prev')}
                      disabled={activeEmailIndexInFiltered <= 0}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Previous email"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleNavigateDetail('next')}
                      disabled={
                        activeEmailIndexInFiltered >= filteredEmails.length - 1
                      }
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Next email"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
                {/* Sender Header */}
                <div className="flex items-start gap-4">
                  <img
                    src={
                      activeEmail.senderAvatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={activeEmail.sender}
                    className="h-12 w-12 rounded-full object-cover border border-gray-100 dark:border-[#2E3A47]"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      {activeEmail.subject}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {activeEmail.sender}
                      </span>{' '}
                      {activeEmail.senderEmail}
                    </p>
                  </div>
                </div>

                {/* Body Paragraphs */}
                <div className="space-y-4 text-xs sm:text-sm text-gray-600 dark:text-[#8A99AD] leading-relaxed max-w-4xl">
                  {activeEmail.body.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Attachments Section */}
                {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                  <div className="mt-8 rounded-2xl bg-gray-50/70 dark:bg-[#24303F]/60 p-5 border border-gray-100 dark:border-[#2E3A47]/60 space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      <Paperclip className="h-4 w-4 text-gray-400" />
                      <span>{activeEmail.attachments.length} Attachments</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {activeEmail.attachments.map((att) => (
                        <div
                          key={att.id}
                          onClick={() => {
                            if (onShowToast) {
                              onShowToast(`Downloading "${att.name}"...`);
                            }
                          }}
                          className="group flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] hover:border-[#465FFF] cursor-pointer transition-all hover:shadow-xs"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 font-bold text-[10px] uppercase">
                            {att.type === 'pdf' ? (
                              <span className="rounded bg-red-500 text-white px-1 py-0.5 text-[9px] font-bold">
                                PDF
                              </span>
                            ) : (
                              <div className="h-6 w-6 flex items-center justify-center text-amber-500">
                                <Archive className="h-5 w-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-[#465FFF]">
                              {att.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 dark:text-[#8A99AD]">
                              {att.downloadLabel || `${att.size || '1.2 MB'} • Download`}
                            </p>
                          </div>
                          <Download className="h-4 w-4 text-gray-400 group-hover:text-[#465FFF]" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Reply Action Buttons */}
                <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-gray-100 dark:border-[#2E3A47]">
                  <button
                    onClick={() => handleStartReply('reply')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1C2434] transition-colors"
                  >
                    <CornerUpLeft className="h-4 w-4" />
                    <span>Reply</span>
                  </button>

                  <button
                    onClick={() => handleStartReply('replyAll')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1C2434] transition-colors"
                  >
                    <ReplyAll className="h-4 w-4" />
                    <span>Reply all</span>
                  </button>

                  <button
                    onClick={() => handleStartReply('forward')}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1C2434] transition-colors"
                  >
                    <CornerUpRight className="h-4 w-4" />
                    <span>Forward</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================== */
            /* VIEW 1: EMAIL LIST VIEW (Matches Screenshot 1)             */
            /* ========================================================== */
            <div className="flex flex-col flex-1">
              {/* Top Action Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-[#2E3A47] gap-3">
                {/* Left Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Select Checkbox with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSelectDropdown(!showSelectDropdown)}
                      className="flex items-center gap-1 p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                      title="Select options"
                    >
                      {selectedEmailIds.length === 0 ? (
                        <Square className="h-4 w-4 text-gray-400" />
                      ) : selectedEmailIds.length === paginatedEmails.length ? (
                        <CheckSquare className="h-4 w-4 text-[#465FFF]" />
                      ) : (
                        <Square className="h-4 w-4 text-[#465FFF] fill-[#465FFF]/20" />
                      )}
                      <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    </button>

                    {showSelectDropdown && (
                      <div className="absolute left-0 top-11 z-20 w-36 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-1.5 shadow-xl">
                        <button
                          onClick={() => handleSelectOption('all')}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                        >
                          All
                        </button>
                        <button
                          onClick={() => handleSelectOption('none')}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                        >
                          None
                        </button>
                        <button
                          onClick={() => handleSelectOption('read')}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                        >
                          Read
                        </button>
                        <button
                          onClick={() => handleSelectOption('unread')}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                        >
                          Unread
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={() => {
                      if (onShowToast) onShowToast('Inbox refreshed');
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Refresh"
                  >
                    <RotateCw className="h-4 w-4" />
                  </button>

                  {/* Trash */}
                  <button
                    onClick={handleDeleteSelected}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Delete selected"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {/* Archive */}
                  <button
                    onClick={handleArchiveSelected}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                    title="Archive selected"
                  >
                    <Archive className="h-4 w-4" />
                  </button>

                  {/* More options (3 dots) */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreActionsMenu(!showMoreActionsMenu)}
                      className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                      title="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {showMoreActionsMenu && (
                      <div className="absolute left-0 top-11 z-20 w-44 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-1.5 shadow-xl">
                        <button
                          onClick={() => {
                            setEmails((prev) =>
                              prev.map((e) => ({ ...e, isRead: true }))
                            );
                            setShowMoreActionsMenu(false);
                            if (onShowToast) onShowToast('All marked as read');
                          }}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={() => {
                            handleMarkAsUnread();
                            setShowMoreActionsMenu(false);
                          }}
                          className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg"
                        >
                          Mark selected unread
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Search Input Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-transparent pl-9 pr-3.5 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#465FFF] focus:outline-none transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Email List Table Rows */}
              <div className="divide-y divide-gray-100 dark:divide-[#2E3A47]/60 flex-1 overflow-y-auto">
                {paginatedEmails.map((mail) => {
                  const isSelected = selectedEmailIds.includes(mail.id);
                  return (
                    <div
                      key={mail.id}
                      onClick={() => handleOpenEmail(mail)}
                      className={`group flex items-center justify-between px-4 sm:px-6 py-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EBF1FF]/60 dark:bg-[#465FFF]/15'
                          : !mail.isRead
                          ? 'bg-white dark:bg-[#1C2434] font-semibold'
                          : 'bg-gray-50/40 dark:bg-[#1C2434]/40 hover:bg-gray-50 dark:hover:bg-[#24303F]/60'
                      }`}
                    >
                      {/* Left: Checkbox + Star + Sender + Snippet */}
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 pr-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(e as any, mail.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-[#465FFF] focus:ring-0 cursor-pointer"
                        />

                        {/* Star Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(e, mail.id)}
                          className={`transition-transform hover:scale-110 ${
                            mail.isStarred
                              ? 'text-amber-400'
                              : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
                          }`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              mail.isStarred ? 'fill-amber-400' : ''
                            }`}
                          />
                        </button>

                        {/* Sender Name */}
                        <div className="w-28 sm:w-36 shrink-0 truncate">
                          <span
                            className={`text-xs sm:text-sm ${
                              !mail.isRead
                                ? 'font-bold text-gray-900 dark:text-white'
                                : 'font-normal text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {mail.sender}
                          </span>
                        </div>

                        {/* Snippet / Subject preview */}
                        <div className="min-w-0 flex-1 truncate text-xs text-gray-500 dark:text-[#8A99AD]">
                          <span>{mail.snippet}</span>
                        </div>
                      </div>

                      {/* Right: Badge (Important/Social/Promotional) + Date/Timestamp */}
                      <div className="flex items-center gap-3 shrink-0">
                        {mail.badge && renderBadge(mail.badge)}
                        <span className="text-xs text-gray-400 dark:text-[#8A99AD] min-w-[55px] text-right">
                          {mail.date}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {paginatedEmails.length === 0 && (
                  <div className="py-20 text-center text-xs text-gray-400 dark:text-gray-500">
                    No emails found in this folder.
                  </div>
                )}
              </div>

              {/* Bottom Pagination Footer */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <span className="text-xs text-gray-500 dark:text-[#8A99AD]">
                  Showing {paginatedEmails.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} of{' '}
                  {filteredEmails.length > 0 ? filteredEmails.length : 159}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Compose / Reply Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F]">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {replyMode === 'forward'
                  ? 'Forward Email'
                  : replyMode
                  ? 'Reply Message'
                  : 'New Message'}
              </h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendCompose} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  To:
                </label>
                <input
                  type="email"
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-transparent px-3.5 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Subject:
                </label>
                <input
                  type="text"
                  placeholder="Subject line..."
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-transparent px-3.5 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Message:
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your email here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-transparent p-3.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-none"
                />
              </div>

              {/* Modal footer actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-[#2E3A47]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onShowToast) onShowToast('File attached.');
                    }}
                    className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-[#24303F]"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposeOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#465FFF] text-white text-xs font-semibold hover:bg-[#3b52db] shadow-xs"
                  >
                    <SendIcon className="h-3.5 w-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
