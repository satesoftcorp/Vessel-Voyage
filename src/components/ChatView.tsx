import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Mic,
  Send,
  ChevronRight,
  ArrowLeft,
  X,
  Check,
  CheckCheck,
  Image as ImageIcon,
  PhoneCall,
  VideoOff,
  MicOff,
  Volume2,
  Trash2,
  BellOff,
  UserCheck,
  Download,
} from 'lucide-react';
import { ChatContact, ChatMessage } from '../types';
import { initialChatContacts } from '../data/chatData';

interface ChatViewProps {
  onShowToast?: (message: string) => void;
  onNavigateHome?: () => void;
}

const COMMON_EMOJIS = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '😉', '😌', '😍', '🥰', '😘', '😋', '😜', '😎',
  '🤝', '👍', '👎', '👏', '🙌', '🎉', '🔥', '🚢', '⚓',
  '🌊', '💼', '📊', '✅', '❤️', '💯', '🚀', '⭐', '✨'
];

export const ChatView: React.FC<ChatViewProps> = ({
  onShowToast,
  onNavigateHome,
}) => {
  const [contacts, setContacts] = useState<ChatContact[]>(initialChatContacts);
  const [selectedContactId, setSelectedContactId] = useState<string>('contact-lindsey');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [showContactMenu, setShowContactMenu] = useState<boolean>(false);
  const [showListMenu, setShowListMenu] = useState<boolean>(false);
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [callModal, setCallModal] = useState<{ type: 'audio' | 'video'; active: boolean } | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [mobileShowChatOnly, setMobileShowChatOnly] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedContact =
    contacts.find((c) => c.id === selectedContactId) || contacts[0];

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContact?.messages]);

  // Filter contacts by search query
  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed && !isRecordingVoice) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'Me',
      text: trimmed || '🎤 Voice message (0:08)',
      timestamp: 'Just now',
      isOutgoing: true,
      status: 'sent',
    };

    setContacts((prev) =>
      prev.map((contact) => {
        if (contact.id === selectedContact.id) {
          return {
            ...contact,
            messages: [...contact.messages, newMessage],
          };
        }
        return contact;
      })
    );

    setInputMessage('');
    setShowEmojiPicker(false);
    setIsRecordingVoice(false);

    if (onShowToast) {
      onShowToast(`Message sent to ${selectedContact.name}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newImgMessage: ChatMessage = {
        id: `msg-img-${Date.now()}`,
        senderId: 'me',
        senderName: 'Me',
        imageUrl: dataUrl,
        imageCaption: file.name,
        timestamp: 'Just now',
        isOutgoing: true,
        status: 'sent',
      };

      setContacts((prev) =>
        prev.map((contact) => {
          if (contact.id === selectedContact.id) {
            return {
              ...contact,
              messages: [...contact.messages, newImgMessage],
            };
          }
          return contact;
        })
      );

      if (onShowToast) {
        onShowToast(`Uploaded "${file.name}" to conversation`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  const handleClearCurrentChat = () => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id ? { ...c, messages: [] } : c
      )
    );
    setShowContactMenu(false);
    if (onShowToast) {
      onShowToast(`Chat history with ${selectedContact.name} cleared.`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Breadcrumb bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Chat
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
            Chat
          </span>
        </div>
      </div>

      {/* Main 2-Column Chat Layout Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-210px)] min-h-[640px]">
        {/* Left Column: Chats List (approx 4 of 12 cols on desktop) */}
        <div
          className={`lg:col-span-4 xl:col-span-4 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 sm:p-5 flex flex-col shadow-xs ${
            mobileShowChatOnly ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between pb-3 border-b border-gray-100 dark:border-[#2E3A47]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Chats
            </h2>
            <button
              onClick={() => setShowListMenu(!showListMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
              title="Chat Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* List Menu Dropdown */}
            {showListMenu && (
              <div className="absolute right-0 top-10 z-20 w-48 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-1.5 shadow-xl">
                <button
                  onClick={() => {
                    setShowListMenu(false);
                    if (onShowToast) onShowToast('All messages marked as read');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434]"
                >
                  <CheckCheck className="h-3.5 w-3.5 text-[#465FFF]" />
                  <span>Mark all as read</span>
                </button>
                <button
                  onClick={() => {
                    setShowListMenu(false);
                    if (onShowToast) onShowToast('Notification alerts enabled for all chats');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434]"
                >
                  <BellOff className="h-3.5 w-3.5 text-gray-400" />
                  <span>Notification Settings</span>
                </button>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mt-3 mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] pl-9 pr-3.5 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#465FFF] focus:bg-white dark:focus:bg-[#24303F] focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-1 pr-0.5">
            {filteredContacts.map((contact) => {
              const isSelected = contact.id === selectedContact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => {
                    setSelectedContactId(contact.id);
                    setMobileShowChatOnly(true);
                  }}
                  className={`group relative flex items-center justify-between rounded-xl p-2.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-gray-100/80 dark:bg-[#24303F] shadow-2xs'
                      : 'hover:bg-gray-50 dark:hover:bg-[#24303F]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar with Online Status Indicator */}
                    <div className="relative shrink-0">
                      <img
                        src={contact.avatarUrl}
                        alt={contact.name}
                        referrerPolicy="no-referrer"
                        className="h-11 w-11 rounded-full object-cover border border-gray-100 dark:border-[#2E3A47]"
                      />
                      {contact.isOnline && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C2434]" />
                      )}
                    </div>

                    {/* Name and Role */}
                    <div className="min-w-0">
                      <h4
                        className={`text-xs sm:text-sm font-semibold truncate ${
                          isSelected
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                        }`}
                      >
                        {contact.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-[#8A99AD] truncate mt-0.5">
                        {contact.role}
                      </p>
                    </div>
                  </div>

                  {/* Last Active Timestamp on right */}
                  <div className="shrink-0 text-right pl-2">
                    <span className="text-[11px] text-gray-400 dark:text-[#8A99AD] whitespace-nowrap">
                      {contact.lastActiveTime}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredContacts.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400 dark:text-gray-500">
                No chats found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation (approx 8 of 12 cols on desktop) */}
        <div
          className={`lg:col-span-8 xl:col-span-8 rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] flex flex-col shadow-xs overflow-hidden ${
            !mobileShowChatOnly ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Active Chat Top Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-gray-100 dark:border-[#2E3A47]">
            <div className="flex items-center gap-3">
              {/* Back button on mobile */}
              <button
                onClick={() => setMobileShowChatOnly(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#24303F] lg:hidden mr-1"
                title="Back to contacts list"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <div className="relative shrink-0">
                <img
                  src={selectedContact.avatarUrl}
                  alt={selectedContact.name}
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-full object-cover border border-gray-100 dark:border-[#2E3A47]"
                />
                {selectedContact.isOnline && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C2434]" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                  {selectedContact.name}
                </h3>
                <span className="text-[11px] text-gray-400 dark:text-[#8A99AD] flex items-center gap-1">
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full ${
                      selectedContact.isOnline ? 'bg-emerald-500' : 'bg-gray-400'
                    }`}
                  />
                  {selectedContact.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>

            {/* Top Right Action Icons */}
            <div className="relative flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setCallModal({ type: 'audio', active: true })}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[#465FFF] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                title={`Call ${selectedContact.name}`}
              >
                <Phone className="h-4 w-4" />
              </button>

              <button
                onClick={() => setCallModal({ type: 'video', active: true })}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-[#465FFF] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                title={`Video call with ${selectedContact.name}`}
              >
                <Video className="h-4 w-4" />
              </button>

              <button
                onClick={() => setShowContactMenu(!showContactMenu)}
                className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
                title="More conversation options"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Contact Options Dropdown Menu */}
              {showContactMenu && (
                <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] p-1.5 shadow-xl">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-[#2E3A47] mb-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      {selectedContact.name}
                    </p>
                    <p className="text-[10px] text-gray-400">{selectedContact.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowContactMenu(false);
                      if (onShowToast) onShowToast(`Phone: ${selectedContact.phoneNumber}`);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#1C2434]"
                  >
                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                    <span>{selectedContact.phoneNumber || 'Contact info'}</span>
                  </button>
                  <button
                    onClick={handleClearCurrentChat}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Clear conversation</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages Body Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar">
            {selectedContact.messages.map((message) => {
              if (message.isOutgoing) {
                // Outgoing Message (from me) -> Right-aligned with blue bubble
                return (
                  <div key={message.id} className="flex flex-col items-end space-y-1.5">
                    {message.texts && message.texts.length > 0 ? (
                      // Multi-bubble stacked (e.g. 2 consecutive statements like in the screenshot)
                      <div className="space-y-1.5 max-w-md text-right">
                        {message.texts.map((t, idx) => (
                          <div
                            key={idx}
                            className="inline-block bg-[#465FFF] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed"
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    ) : message.imageUrl ? (
                      <div className="max-w-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-xs">
                        <img
                          src={message.imageUrl}
                          alt="Sent preview"
                          className="w-full object-cover max-h-60"
                        />
                        {message.imageCaption && (
                          <div className="bg-[#465FFF] text-white px-3.5 py-2 text-xs">
                            {message.imageCaption}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-[#465FFF] text-white rounded-2xl rounded-tr-xs px-4 py-2.5 text-xs sm:text-sm max-w-md shadow-2xs leading-relaxed">
                        {message.text}
                      </div>
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-[#8A99AD] mr-1">
                      {message.timestamp}
                    </span>
                  </div>
                );
              }

              // Incoming Message (from contact) -> Left-aligned with avatar & light gray bubble
              return (
                <div key={message.id} className="flex items-start gap-3 max-w-lg">
                  <img
                    src={selectedContact.avatarUrl}
                    alt={selectedContact.name}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover shrink-0 border border-gray-100 dark:border-[#2E3A47] mt-0.5"
                  />
                  <div className="flex flex-col space-y-1.5">
                    {message.imageUrl ? (
                      <div className="space-y-2">
                        {/* Image attachment preview (e.g. blue scenic mountain landscape) */}
                        <div
                          onClick={() => setPreviewImageModal(message.imageUrl || null)}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200/80 dark:border-[#2E3A47] max-w-md w-full shadow-2xs transition-transform hover:scale-[1.01]"
                        >
                          <img
                            src={message.imageUrl}
                            alt="Preview attachment"
                            referrerPolicy="no-referrer"
                            className="w-full max-h-56 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-2xs">
                            <ImageIcon className="h-4 w-4" /> Click to view full image
                          </div>
                        </div>

                        {message.imageCaption && (
                          <div className="inline-block bg-gray-100 dark:bg-[#24303F] text-gray-800 dark:text-gray-100 rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs">
                            {message.imageCaption}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-[#24303F] text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-xs px-4 py-3 text-xs sm:text-sm shadow-2xs leading-relaxed">
                        {message.text}
                      </div>
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-[#8A99AD] ml-1">
                      {message.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="relative mx-4 mb-2 p-3 bg-white dark:bg-[#24303F] rounded-2xl border border-gray-200 dark:border-[#2E3A47] shadow-xl z-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Quick Emojis
                </span>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-9 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
                {COMMON_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSelectEmoji(emoji)}
                    className="h-8 w-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-[#1C2434] rounded-lg transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hidden File Input for Attachment upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
          />

          {/* Bottom Chat Input Form Bar */}
          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-100 dark:border-[#2E3A47] p-3 sm:p-4 flex items-center gap-2 sm:gap-3 bg-white dark:bg-[#1C2434]"
          >
            {/* Emoji Button on left */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2 rounded-xl transition-colors ${
                showEmojiPicker
                  ? 'text-[#465FFF] bg-[#EBEFFF] dark:bg-[#465FFF]/20'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F]'
              }`}
              title="Insert Emoji"
            >
              <Smile className="h-5 w-5" />
            </button>

            {/* Message Input Box */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={isRecordingVoice ? 'Recording voice note...' : 'Type a message'}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isRecordingVoice}
                className="w-full bg-transparent px-2 py-2 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
              />
            </div>

            {/* Paperclip Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F] transition-colors"
              title="Attach File or Image"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Voice Recording Microphone Button */}
            <button
              type="button"
              onClick={() => {
                if (!isRecordingVoice) {
                  setIsRecordingVoice(true);
                  if (onShowToast) onShowToast('Recording audio note... Click send to finish.');
                } else {
                  setIsRecordingVoice(false);
                }
              }}
              className={`p-2 rounded-xl transition-colors ${
                isRecordingVoice
                  ? 'text-red-500 bg-red-50 dark:bg-red-950/40 animate-pulse'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#24303F]'
              }`}
              title={isRecordingVoice ? 'Cancel recording' : 'Record Voice Note'}
            >
              <Mic className="h-5 w-5" />
            </button>

            {/* Blue Round Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() && !isRecordingVoice}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                inputMessage.trim() || isRecordingVoice
                  ? 'bg-[#465FFF] text-white hover:bg-[#3b52db] shadow-md hover:scale-105 active:scale-95'
                  : 'bg-[#465FFF]/60 text-white cursor-not-allowed'
              }`}
              title="Send Message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImageModal && (
        <div
          onClick={() => setPreviewImageModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#1C2434] shadow-2xl border border-gray-700"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#24303F]">
              <span className="text-xs font-semibold text-white">Attachment Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewImageModal}
                  target="_blank"
                  rel="noreferrer"
                  download="chat-image-preview.jpg"
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#1C2434]"
                  title="Open full size"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  onClick={() => setPreviewImageModal(null)}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#1C2434]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center">
              <img
                src={previewImageModal}
                alt="Full preview"
                className="max-h-[75vh] w-auto rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Simulated Call Modal */}
      {callModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-6 text-center shadow-2xl space-y-5">
            <div className="relative mx-auto h-24 w-24">
              <img
                src={selectedContact.avatarUrl}
                alt={selectedContact.name}
                referrerPolicy="no-referrer"
                className="h-24 w-24 rounded-full object-cover border-4 border-[#465FFF]/20 ring-4 ring-[#465FFF] animate-pulse"
              />
              <span className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1C2434]" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedContact.name}
              </h3>
              <p className="text-xs text-[#465FFF] font-medium mt-1 animate-pulse">
                {callModal.type === 'video' ? 'Connecting Video Call...' : 'Calling mobile line...'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">{selectedContact.role}</p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  setCallModal(null);
                  if (onShowToast) onShowToast('Microphone muted');
                }}
                className="p-3 rounded-full bg-gray-100 dark:bg-[#24303F] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                title="Mute"
              >
                <MicOff className="h-5 w-5" />
              </button>

              {callModal.type === 'video' && (
                <button
                  onClick={() => {
                    if (onShowToast) onShowToast('Camera switched');
                  }}
                  className="p-3 rounded-full bg-gray-100 dark:bg-[#24303F] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  title="Toggle Video"
                >
                  <VideoOff className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={() => {
                  setCallModal(null);
                  if (onShowToast) onShowToast(`Call with ${selectedContact.name} ended.`);
                }}
                className="p-3.5 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-transform hover:scale-105 active:scale-95"
                title="End Call"
              >
                <Phone className="h-5 w-5 rotate-[135deg]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
