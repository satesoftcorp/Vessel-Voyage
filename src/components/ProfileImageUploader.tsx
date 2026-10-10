import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Link, Sparkles, Check, AlertCircle } from 'lucide-react';

export interface ProfileImageUploaderProps {
  currentImageUrl?: string;
  name?: string;
  roleOrDepartment?: string;
  onImageChange: (imageUrl: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
  allowPresets?: boolean;
  helperText?: string;
  idPrefix?: string;
}

// Curated high-resolution profile portrait presets for maritime and corporate profiles
const AVATAR_PRESETS = [
  {
    id: 'preset-captain-1',
    label: 'Capt. Henrik (Master)',
    category: 'Deck / Command',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-officer-1',
    label: 'Elena (Chief Officer)',
    category: 'Deck Command',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-engineer-1',
    label: 'Mateo (Chief Engineer)',
    category: 'Engine Dept',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-admin-1',
    label: 'Amina (Port Director)',
    category: 'Port Authority',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-executive-1',
    label: 'Jonathan (Superintendent)',
    category: 'Fleet Ops',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-officer-2',
    label: 'Marcus (Harbor Master)',
    category: 'Navigation',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-logistics-1',
    label: 'Sophie (Terminal Agent)',
    category: 'Logistics',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80',
  },
  {
    id: 'preset-crew-1',
    label: 'Tariq (Bosun)',
    category: 'Deck Crew',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
  },
];

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  currentImageUrl = '',
  name = 'Person',
  roleOrDepartment = '',
  onImageChange,
  label = 'Profile Photo',
  size = 'md',
  compact = false,
  allowPresets = true,
  helperText = 'Supports PNG, JPG, WEBP or GIF (Max 8MB)',
  idPrefix = 'profile-upload',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // Generate initials fallback
  const getInitials = (n: string) => {
    if (!n) return 'P';
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const handleFile = (file: File) => {
    setUploadError(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP, GIF).');
      return;
    }

    // Validate size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image file exceeds the 8MB size limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onImageChange(result);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 2500);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset file input value so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    onImageChange(customUrlInput.trim());
    setIsUrlModalOpen(false);
    setCustomUrlInput('');
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2500);
  };

  const handleRemoveImage = () => {
    onImageChange('');
    setUploadError(null);
  };

  // Dimensions based on size prop
  const avatarSizeClasses = {
    sm: 'h-14 w-14 text-sm',
    md: 'h-20 w-20 text-base',
    lg: 'h-24 w-24 text-xl',
  }[size];

  return (
    <div className="w-full space-y-2" id={`${idPrefix}-container`}>
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          {allowPresets && (
            <button
              id={`${idPrefix}-btn-presets`}
              type="button"
              onClick={() => {
                setIsPresetsOpen(!isPresetsOpen);
                setIsUrlModalOpen(false);
              }}
              className="text-[11px] font-semibold text-[#465FFF] dark:text-[#80CAEE] hover:underline flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>{isPresetsOpen ? 'Close Presets' : 'Avatar Presets'}</span>
            </button>
          )}
          <button
            id={`${idPrefix}-btn-url`}
            type="button"
            onClick={() => {
              setIsUrlModalOpen(!isUrlModalOpen);
              setIsPresetsOpen(false);
            }}
            className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center gap-1"
          >
            <Link className="h-3 w-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        id={`${idPrefix}-file-input`}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Main Upload Box */}
      {compact ? (
        /* Compact Inline Style (Great for dense modals) */
        <div
          id={`${idPrefix}-dropzone`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all ${
            isDragging
              ? 'border-[#465FFF] bg-[#465FFF]/10 ring-2 ring-[#465FFF]/20'
              : 'border-gray-200 dark:border-[#2E3A47] bg-gray-50/60 dark:bg-[#24303F]/50'
          }`}
        >
          {/* Avatar circle with click to upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-[#1C2434] shadow-sm ${avatarSizeClasses} bg-gradient-to-tr from-[#465FFF] to-cyan-500 flex items-center justify-center text-white font-bold`}
          >
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{getInitials(name)}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
              <Camera className="h-4 w-4" />
              <span className="text-[9px] font-medium mt-0.5">Upload</span>
            </div>
          </div>

          {/* Info and Buttons */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                {name || 'Profile Persona'}
              </span>
              {roleOrDepartment && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-[#1C2434] text-gray-600 dark:text-gray-300 font-medium truncate">
                  {roleOrDepartment}
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
              {helperText}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                id={`${idPrefix}-btn-browse`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] text-[11px] font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2A374A] flex items-center gap-1 shadow-2xs"
              >
                <Upload className="h-3 w-3 text-[#465FFF]" />
                <span>Upload Photo</span>
              </button>
              {currentImageUrl && (
                <button
                  id={`${idPrefix}-btn-remove`}
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-2 py-1 rounded-lg text-[11px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Full Drag & Drop Box Style */
        <div
          id={`${idPrefix}-dropzone`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border-2 border-dashed transition-all ${
            isDragging
              ? 'border-[#465FFF] bg-[#465FFF]/10 scale-[0.99]'
              : 'border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/40 hover:bg-gray-50 dark:hover:bg-[#24303F]/60'
          }`}
        >
          {/* Avatar Preview */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative group cursor-pointer rounded-full overflow-hidden shrink-0 border-2 border-white dark:border-[#1C2434] shadow-md ${avatarSizeClasses} bg-gradient-to-tr from-[#465FFF] to-cyan-500 flex items-center justify-center text-white font-bold`}
          >
            {currentImageUrl ? (
              <img
                src={currentImageUrl}
                alt={name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span>{getInitials(name)}</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-medium mt-0.5">Change</span>
            </div>
          </div>

          {/* Upload Text & Controls */}
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-bold text-gray-900 dark:text-white">
              Drag &amp; drop profile picture here, or{' '}
              <button
                id={`${idPrefix}-link-browse`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#465FFF] dark:text-[#80CAEE] hover:underline font-bold"
              >
                browse files
              </button>
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              {helperText}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
              <button
                id={`${idPrefix}-btn-select`}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-[#465FFF] text-white text-xs font-semibold hover:bg-[#3b52f5] flex items-center gap-1.5 shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload From Device</span>
              </button>
              {currentImageUrl && (
                <button
                  id={`${idPrefix}-btn-remove-full`}
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {uploadSuccess && (
        <div
          id={`${idPrefix}-success-alert`}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 animate-in fade-in"
        >
          <Check className="h-3.5 w-3.5 text-emerald-600" />
          <span>Profile photo updated successfully!</span>
        </div>
      )}

      {/* Error Alert */}
      {uploadError && (
        <div
          id={`${idPrefix}-error-alert`}
          className="flex items-center gap-1.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-800 dark:text-rose-300 animate-in fade-in"
        >
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* URL Input Modal / Popover */}
      {isUrlModalOpen && (
        <div
          id={`${idPrefix}-url-popover`}
          className="p-3 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-md space-y-2 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
              Provide Profile Image URL
            </span>
            <button
              type="button"
              onClick={() => setIsUrlModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Cancel
            </button>
          </div>
          <form onSubmit={handleApplyUrl} className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] bg-gray-50 dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-900 dark:text-white font-mono focus:border-[#465FFF] focus:outline-hidden"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#465FFF] text-white text-xs font-semibold hover:bg-[#3b52f5] shrink-0"
            >
              Apply
            </button>
          </form>
        </div>
      )}

      {/* Quick Curated Avatar Presets Panel */}
      {isPresetsOpen && allowPresets && (
        <div
          id={`${idPrefix}-presets-panel`}
          className="p-3 rounded-2xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-md space-y-2 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#465FFF]" />
              <span>Choose a Persona Avatar Preset</span>
            </span>
            <span className="text-[10px] text-gray-400">Click any avatar to apply</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = currentImageUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  id={`${idPrefix}-preset-${preset.id}`}
                  type="button"
                  onClick={() => {
                    onImageChange(preset.url);
                    setIsPresetsOpen(false);
                    setUploadSuccess(true);
                    setTimeout(() => setUploadSuccess(false), 2500);
                  }}
                  className={`group relative flex flex-col items-center rounded-xl p-1 transition-all ${
                    isSelected
                      ? 'ring-2 ring-[#465FFF] bg-blue-50/50 dark:bg-[#465FFF]/10'
                      : 'hover:bg-gray-100 dark:hover:bg-[#24303F]'
                  }`}
                  title={`${preset.label} (${preset.category})`}
                >
                  <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gray-200 dark:border-[#2E3A47] shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#465FFF]/40 flex items-center justify-center text-white">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300 truncate w-full text-center mt-1">
                    {preset.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
