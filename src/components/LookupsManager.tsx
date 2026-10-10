import React, { useState, useMemo } from 'react';
import { LookupCategory, LookupItem } from '../types';
import {
  Sliders,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Tag,
  FolderTree,
  FileSpreadsheet,
  Ship,
  Compass,
  Users,
  ShieldAlert,
  UserCog,
  Layers,
  ArrowUpDown,
  Check,
  X,
  Info,
  Sparkles,
} from 'lucide-react';

interface LookupsManagerProps {
  categories?: LookupCategory[];
  items?: LookupItem[];
  lookupItems?: LookupItem[];
  onAddItem?: (item: LookupItem) => void;
  onAddLookupItem?: (item: LookupItem) => void;
  onUpdateItem?: (item: LookupItem) => void;
  onUpdateLookupItem?: (item: LookupItem) => void;
  onDeleteItem?: (itemId: string) => void;
  onDeleteLookupItem?: (itemId: string) => void;
  onAddCategory?: (category: LookupCategory) => void;
  onResetToDefault?: () => void;
  onResetDefaults?: () => void;
  onShowToast?: (msg: string) => void;
}

export const LookupsManager: React.FC<LookupsManagerProps> = ({
  categories: rawCategories = [],
  items,
  lookupItems: rawLookupItems,
  onAddItem,
  onAddLookupItem,
  onUpdateItem,
  onUpdateLookupItem,
  onDeleteItem,
  onDeleteLookupItem,
  onAddCategory,
  onResetToDefault,
  onResetDefaults,
  onShowToast = (_msg: string) => {},
}) => {
  const categories = rawCategories || [];
  const lookupItems = items || rawLookupItems || [];

  const handleAddItem = (item: LookupItem) => {
    if (onAddItem) onAddItem(item);
    else if (onAddLookupItem) onAddLookupItem(item);
  };

  const handleUpdateItem = (item: LookupItem) => {
    if (onUpdateItem) onUpdateItem(item);
    else if (onUpdateLookupItem) onUpdateLookupItem(item);
  };

  const handleDeleteItem = (itemId: string) => {
    if (onDeleteItem) onDeleteItem(itemId);
    else if (onDeleteLookupItem) onDeleteLookupItem(itemId);
  };

  const handleReset = () => {
    if (onResetToDefault) onResetToDefault();
    else if (onResetDefaults) onResetDefaults();
  };

  // Navigation & Filtering
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);

  // New Item Form
  const [formData, setFormData] = useState<Partial<LookupItem>>({
    category: categories[0]?.code || 'passenger_status',
    code: '',
    label: '',
    description: '',
    color: 'blue',
    sortOrder: 1,
    isActive: true,
  });

  // New Category Form
  const [categoryFormData, setCategoryFormData] = useState<Partial<LookupCategory>>({
    code: '',
    name: '',
    module: 'Manifest & Cargo',
    description: '',
  });

  // Available Modules
  const modulesList = useMemo(() => {
    const mods = new Set(categories.map((c) => c.module));
    return ['ALL', ...Array.from(mods)];
  }, [categories]);

  // Categories filtered by module
  const filteredCategories = useMemo(() => {
    if (selectedModule === 'ALL') return categories;
    return categories.filter((c) => c.module === selectedModule);
  }, [categories, selectedModule]);

  // Lookup items filtered
  const filteredItems = useMemo(() => {
    return lookupItems.filter((item) => {
      // Module check
      if (selectedModule !== 'ALL') {
        const cat = categories.find((c) => c.code === item.category);
        if (!cat || cat.module !== selectedModule) return false;
      }

      // Category check
      if (selectedCategoryCode !== 'ALL' && item.category !== selectedCategoryCode) {
        return false;
      }

      // Status check
      if (statusFilter === 'ACTIVE' && !item.isActive) return false;
      if (statusFilter === 'INACTIVE' && item.isActive) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesLabel = item.label.toLowerCase().includes(q);
        const matchesCode = item.code.toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesCat = (item.categoryName || item.category).toLowerCase().includes(q);
        return matchesLabel || matchesCode || matchesDesc || matchesCat;
      }

      return true;
    });
  }, [lookupItems, categories, selectedModule, selectedCategoryCode, statusFilter, searchQuery]);

  // Color options
  const colorOptions = [
    { value: 'blue', label: 'Marine Blue', bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300', bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800' },
    { value: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300', bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' },
    { value: 'amber', label: 'Amber Yellow', bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300', bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800' },
    { value: 'rose', label: 'Crimson Rose', bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300', bgLight: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800' },
    { value: 'purple', label: 'Purple / Violet', bg: 'bg-purple-500', text: 'text-purple-700 dark:text-purple-300', bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800' },
    { value: 'indigo', label: 'Deep Indigo', bg: 'bg-indigo-500', text: 'text-indigo-700 dark:text-indigo-300', bgLight: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800' },
    { value: 'gray', label: 'Slate Neutral', bg: 'bg-gray-500', text: 'text-gray-700 dark:text-gray-300', bgLight: 'bg-gray-100 dark:bg-[#2E3A47] border-gray-200 dark:border-gray-700' },
  ];

  const getColorClasses = (colorName?: string) => {
    const found = colorOptions.find((c) => c.value === colorName);
    return found ? `${found.bgLight} ${found.text} border` : 'bg-gray-100 dark:bg-[#2E3A47] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
  };

  const getModuleIcon = (moduleName: string) => {
    switch (moduleName) {
      case 'Manifest & Cargo':
        return <FileSpreadsheet className="h-4 w-4 text-[#465FFF]" />;
      case 'Vessels & Fleet':
        return <Ship className="h-4 w-4 text-[#465FFF]" />;
      case 'Voyages & Ports':
        return <Compass className="h-4 w-4 text-[#465FFF]" />;
      case 'Crew & Staff':
        return <Users className="h-4 w-4 text-[#465FFF]" />;
      case 'Safety & Incidents':
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      case 'SaaS & Users':
        return <UserCog className="h-4 w-4 text-indigo-500" />;
      default:
        return <Sliders className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle Add Item Submit
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.label || !formData.category) {
      alert('Please fill in Code, Label, and Category.');
      return;
    }

    const cat = categories.find((c) => c.code === formData.category);
    const newItem: LookupItem = {
      id: `LKP-${Date.now().toString().slice(-5)}`,
      category: formData.category,
      categoryName: cat?.name || formData.category,
      code: formData.code.toUpperCase().replace(/\s+/g, '_'),
      label: formData.label,
      description: formData.description || '',
      color: formData.color || 'blue',
      sortOrder: Number(formData.sortOrder) || lookupItems.filter((i) => i.category === formData.category).length + 1,
      isActive: formData.isActive !== false,
      isSystemDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    handleAddItem(newItem);
    setIsAddItemModalOpen(false);
    setFormData({
      category: formData.category,
      code: '',
      label: '',
      description: '',
      color: 'blue',
      sortOrder: 1,
      isActive: true,
    });
    onShowToast(`Lookup item "${newItem.label}" added to ${cat?.name || 'category'}.`);
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    handleUpdateItem(editingItem);
    setEditingItem(null);
    onShowToast(`Lookup item "${editingItem.label}" updated successfully.`);
  };

  // Handle Add Category Submit
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.code || !categoryFormData.name) {
      alert('Please specify Category Name and unique Code.');
      return;
    }

    const newCat: LookupCategory = {
      id: `CAT-${Date.now().toString().slice(-4)}`,
      code: categoryFormData.code.toLowerCase().replace(/\s+/g, '_'),
      name: categoryFormData.name,
      module: categoryFormData.module || 'Manifest & Cargo',
      description: categoryFormData.description || 'Custom dropdown lookup options.',
    };

    if (onAddCategory) {
      onAddCategory(newCat);
      onShowToast(`Lookup Category "${newCat.name}" created.`);
    }
    setIsAddCategoryModalOpen(false);
    setCategoryFormData({
      code: '',
      name: '',
      module: 'Manifest & Cargo',
      description: '',
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category Code', 'Category Name', 'Item Code', 'Item Label', 'Color', 'Sort Order', 'Status', 'Type', 'Description'];
    const rows = filteredItems.map((item) => {
      const cat = categories.find((c) => c.code === item.category);
      return [
        item.category,
        `"${cat?.name || item.categoryName || ''}"`,
        item.code,
        `"${item.label}"`,
        item.color || 'blue',
        item.sortOrder,
        item.isActive ? 'Active' : 'Inactive',
        item.isSystemDefault ? 'System Default' : 'Custom',
        `"${item.description || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VoyageIS_System_Lookups_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Exported system lookups table to CSV.');
  };

  return (
    <div id="lookups-manager-view" className="space-y-6">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white shadow-xs">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                System Lookups &amp; Dropdown Configuration
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD]">
                Dynamic configuration center for all hardcoded statuses, dropdown options, and categorizations across the SaaS suite.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(onResetDefaults || onResetToDefault) && (
            <button
              id="reset-lookups-btn"
              onClick={() => {
                if (confirm('Reset all lookup categories and options to factory defaults?')) {
                  handleReset();
                  onShowToast('Lookup options restored to system defaults.');
                }
              }}
              title="Restore Factory Defaults"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Reset Defaults</span>
            </button>
          )}

          <button
            id="export-lookups-csv-btn"
            onClick={handleExportCSV}
            title="Download CSV"
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#24303F] shadow-2xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {onAddCategory && (
            <button
              id="add-category-btn"
              onClick={() => setIsAddCategoryModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30 px-3.5 py-2 text-xs font-semibold text-[#465FFF] dark:text-blue-300 shadow-2xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <FolderTree className="h-3.5 w-3.5" />
              <span>New Category</span>
            </button>
          )}

          <button
            id="add-lookup-item-btn"
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Lookup Item</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Total Categories</span>
            <span className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-2 text-[#465FFF] dark:text-blue-400">
              <FolderTree className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{categories.length}</div>
          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Across {new Set(categories.map((c) => c.module)).size} operational modules
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Active Lookup Options</span>
            <span className="rounded-lg bg-emerald-50 dark:bg-emerald-900/30 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {lookupItems.filter((i) => i.isActive).length}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>{Math.round((lookupItems.filter((i) => i.isActive).length / (lookupItems.length || 1)) * 100)}% available in dropdowns</span>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">Custom Configured</span>
            <span className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-2 text-purple-600 dark:text-purple-400">
              <Tag className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {lookupItems.filter((i) => !i.isSystemDefault).length}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Custom user-defined values</div>
        </div>

        <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">System Standards (IMO/IACS)</span>
            <span className="rounded-lg bg-indigo-50 dark:bg-indigo-900/30 p-2 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {lookupItems.filter((i) => i.isSystemDefault).length}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">Locked factory baselines</div>
        </div>
      </div>

      {/* Module Tabs Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {modulesList.map((mod) => (
          <button
            key={mod}
            id={`module-tab-${mod.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => {
              setSelectedModule(mod);
              setSelectedCategoryCode('ALL');
            }}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              selectedModule === mod
                ? 'bg-[#465FFF] text-white shadow-xs'
                : 'border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] text-gray-600 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {mod !== 'ALL' && getModuleIcon(mod)}
            <span>{mod === 'ALL' ? 'All Modules' : mod}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                selectedModule === mod
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-[#2E3A47] text-gray-600 dark:text-gray-300'
              }`}
            >
              {mod === 'ALL'
                ? lookupItems.length
                : lookupItems.filter((i) => {
                    const cat = categories.find((c) => c.code === i.category);
                    return cat?.module === mod;
                  }).length}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-4 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            id="search-lookups-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lookup label, code identifier, category, or description..."
            className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] py-2 pl-9 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span>Category:</span>
          </div>

          <select
            id="filter-category-select"
            value={selectedCategoryCode}
            onChange={(e) => setSelectedCategoryCode(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden max-w-[220px]"
          >
            <option value="ALL">All Categories ({filteredCategories.length})</option>
            {filteredCategories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.name} ({lookupItems.filter((i) => i.category === cat.code).length})
              </option>
            ))}
          </select>

          <select
            id="filter-lookup-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200 focus:border-[#465FFF] focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="INACTIVE">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Main Lookups Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/75 dark:bg-[#24303F]/60 text-gray-500 dark:text-[#8A99AD] font-semibold">
                <th className="py-3.5 pl-4 pr-2 w-12 text-center">Order</th>
                <th className="px-3 py-3.5">Category</th>
                <th className="px-3 py-3.5">Display Label &amp; Badge Preview</th>
                <th className="px-3 py-3.5">Code Identifier</th>
                <th className="px-3 py-3.5">Description &amp; Context</th>
                <th className="px-3 py-3.5 text-center">Active Status</th>
                <th className="px-3 py-3.5">Type</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47]">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    <Sliders className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">No lookup items match your search criteria</p>
                    <p className="text-xs text-gray-400 mt-1">Try resetting your module or category filters</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const cat = categories.find((c) => c.code === item.category);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#24303F]/40 transition-colors"
                    >
                      {/* Sort Order */}
                      <td className="py-3.5 pl-4 pr-2 text-center font-mono font-medium text-gray-400">
                        {item.sortOrder}
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {cat && getModuleIcon(cat.module)}
                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {cat?.name || item.categoryName || item.category}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">{item.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Label & Badge Preview */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getColorClasses(
                              item.color
                            )}`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {item.label}
                          </span>
                        </div>
                      </td>

                      {/* Code Identifier */}
                      <td className="px-3 py-3.5 font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300">
                        <span className="rounded bg-gray-100 dark:bg-[#24303F] px-2 py-0.5 border border-gray-200 dark:border-[#2E3A47]">
                          {item.code}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-3 py-3.5 text-gray-500 dark:text-[#8A99AD] max-w-xs">
                        <span className="truncate block" title={item.description}>
                          {item.description || 'Standard dropdown lookup item.'}
                        </span>
                      </td>

                      {/* Active Status Switch */}
                      <td className="px-3 py-3.5 text-center">
                        <button
                          id={`toggle-status-${item.id}`}
                          onClick={() => {
                            handleUpdateItem({ ...item, isActive: !item.isActive });
                            onShowToast(
                              `"${item.label}" is now ${!item.isActive ? 'Active (Visible in dropdowns)' : 'Inactive'}`
                            );
                          }}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-colors ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-gray-100 text-gray-500 dark:bg-[#2E3A47] dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          {item.isActive ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          <span>{item.isActive ? 'Active' : 'Disabled'}</span>
                        </button>
                      </td>

                      {/* System vs Custom */}
                      <td className="px-3 py-3.5">
                        {item.isSystemDefault ? (
                          <span className="rounded bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                            Standard
                          </span>
                        ) : (
                          <span className="rounded bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            Custom
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 pl-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            id={`edit-lookup-${item.id}`}
                            onClick={() => setEditingItem(item)}
                            title="Edit Lookup Option"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#24303F] dark:hover:text-white transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            id={`delete-lookup-${item.id}`}
                            onClick={() => {
                              if (item.isSystemDefault) {
                                if (
                                  confirm(
                                    `"${item.label}" is a system baseline lookup. Are you sure you want to remove it?`
                                  )
                                ) {
                                  handleDeleteItem(item.id);
                                  onShowToast(`Removed lookup "${item.label}".`);
                                }
                              } else {
                                if (confirm(`Delete custom lookup option "${item.label}"?`)) {
                                  handleDeleteItem(item.id);
                                  onShowToast(`Deleted custom lookup "${item.label}".`);
                                }
                              }
                            }}
                            title="Delete Lookup Option"
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MODAL: ADD LOOKUP ITEM                               */}
      {/* ==================================================== */}
      {isAddItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1C2434] p-6 shadow-2xl border border-gray-100 dark:border-[#2E3A47]">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF]/10 text-[#465FFF]">
                  <Plus className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Add Dropdown Lookup Option
                </h2>
              </div>
              <button
                onClick={() => setIsAddItemModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddItemSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      [{c.module}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Display Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({
                        ...formData,
                        label: val,
                        code: formData.code ? formData.code : val.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
                      });
                    }}
                    placeholder="e.g. Cleared Green Lane"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Code Identifier <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CLEARED_GREEN"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Badge Color Theme
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: col.value })}
                      className={`flex items-center gap-1.5 rounded-xl border p-2 text-left text-xs transition-all ${
                        formData.color === col.value
                          ? 'border-[#465FFF] bg-blue-50/50 dark:bg-blue-900/20 font-bold'
                          : 'border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F]'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${col.bg}`} />
                      <span className="text-[11px] truncate text-gray-700 dark:text-gray-300">{col.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Enable in Dropdowns immediately
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description / Operational Meaning
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Explain when and where this dropdown status is applied..."
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsAddItemModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-600 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                >
                  Save Lookup Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT LOOKUP ITEM                              */}
      {/* ==================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1C2434] p-6 shadow-2xl border border-gray-100 dark:border-[#2E3A47]">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF]/10 text-[#465FFF]">
                  <Edit2 className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Edit Lookup Option
                </h2>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={editingItem.category}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      [{c.module}] {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Display Label <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingItem.label}
                    onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Code Identifier
                  </label>
                  <input
                    type="text"
                    value={editingItem.code}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Badge Color
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {colorOptions.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, color: col.value })}
                      className={`flex items-center gap-1.5 rounded-xl border p-2 text-left text-xs transition-all ${
                        editingItem.color === col.value
                          ? 'border-[#465FFF] bg-blue-50/50 dark:bg-blue-900/20 font-bold'
                          : 'border-gray-200 dark:border-[#2E3A47] hover:bg-gray-50 dark:hover:bg-[#24303F]'
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${col.bg}`} />
                      <span className="text-[11px] truncate text-gray-700 dark:text-gray-300">{col.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={editingItem.sortOrder}
                    onChange={(e) => setEditingItem({ ...editingItem, sortOrder: Number(e.target.value) })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer pt-3">
                    <input
                      type="checkbox"
                      checked={editingItem.isActive}
                      onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-[#465FFF] focus:ring-[#465FFF]"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      Active (Visible in dropdowns)
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-600 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                >
                  Update Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD NEW CATEGORY                              */}
      {/* ==================================================== */}
      {isAddCategoryModalOpen && onAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1C2434] p-6 shadow-2xl border border-gray-100 dark:border-[#2E3A47]">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-[#465FFF]">
                  <FolderTree className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Create Lookup Category
                </h2>
              </div>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategorySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Module Group <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryFormData.module}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, module: e.target.value as any })}
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                >
                  <option value="Manifest & Cargo">Manifest & Cargo</option>
                  <option value="Vessels & Fleet">Vessels & Fleet</option>
                  <option value="Voyages & Ports">Voyages & Ports</option>
                  <option value="Crew & Staff">Crew & Staff</option>
                  <option value="Safety & Incidents">Safety & Incidents</option>
                  <option value="SaaS & Users">SaaS & Users</option>
                  <option value="General & System">General & System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategoryFormData({
                      ...categoryFormData,
                      name: val,
                      code: categoryFormData.code ? categoryFormData.code : val.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                    });
                  }}
                  placeholder="e.g. Fuel Grade Types"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Code Identifier <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryFormData.code}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value.toLowerCase() })}
                  placeholder="e.g. fuel_grade_types"
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-mono text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                  placeholder="Describe what dropdown fields use this category..."
                  className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] px-4 py-2 text-xs font-semibold text-gray-600 dark:text-[#8A99AD] hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#465FFF] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6]"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
