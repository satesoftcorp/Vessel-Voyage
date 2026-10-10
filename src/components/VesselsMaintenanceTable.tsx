import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Download,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Ship,
  Sparkles,
  RefreshCw,
  Zap,
  Check,
} from 'lucide-react';
import { VesselMaintenanceTask, Vessel } from '../types';

interface VesselsMaintenanceTableProps {
  tasks?: VesselMaintenanceTask[];
  maintenanceTasks?: VesselMaintenanceTask[];
  vessels: Vessel[];
  onAddTask: (task: VesselMaintenanceTask) => void;
  onUpdateStatus?: (taskId: string, newStatus: VesselMaintenanceTask['status']) => void;
  onSelectTask?: (task: VesselMaintenanceTask) => void;
  initialVesselFilter?: string;
}

export const VesselsMaintenanceTable: React.FC<VesselsMaintenanceTableProps> = ({
  tasks,
  maintenanceTasks: propTasks,
  vessels = [],
  onAddTask,
  onUpdateStatus,
  onSelectTask,
  initialVesselFilter = 'All',
}) => {
  const maintenanceTasks = tasks || propTasks || [];

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVessel, setSelectedVessel] = useState<string>(initialVesselFilter || 'All');

  // Sync initialVesselFilter if prop changes
  React.useEffect(() => {
    if (initialVesselFilter && initialVesselFilter !== 'All') {
      setSelectedVessel(initialVesselFilter);
    }
  }, [initialVesselFilter]);

  // Sorting
  const [sortField, setSortField] = useState<keyof VesselMaintenanceTask>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal / Drawer state
  const [selectedTask, setSelectedTask] = useState<VesselMaintenanceTask | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New task form state
  const [formData, setFormData] = useState<Partial<VesselMaintenanceTask>>({
    vesselId: vessels[0]?.id || 'VES-001',
    vesselName: vessels[0]?.name || 'VOYAGER TITAN',
    taskCode: 'PMS-ENG-' + Math.floor(100 + Math.random() * 900),
    title: '',
    systemCategory: 'Main Engine & Propulsion',
    maintenanceType: 'Planned (PMS)',
    priority: 'High',
    status: 'Scheduled',
    assignedEngineer: 'Chief Eng. Marco Rossi',
    serviceProvider: 'Shipboard Crew',
    location: 'At Sea / Voyage Transit',
    scheduledDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 16,
    estimatedCost: '$12,000',
    partsRequired: 'Standard Gasket Set, Seal Kits, Replacement Filters',
    notes: 'Routine scheduled maintenance as per vessel technical manual.',
  });

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return maintenanceTasks
      .filter((task) => {
        const matchesSearch =
          task.taskCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assignedEngineer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.partsRequired.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All' || task.systemCategory === selectedCategory;
        const matchesType = selectedType === 'All' || task.maintenanceType === selectedType;
        const matchesPriority =
          selectedPriority === 'All' || task.priority === selectedPriority;
        const matchesStatus = selectedStatus === 'All' || task.status === selectedStatus;
        const matchesVessel = selectedVessel === 'All' || task.vesselName === selectedVessel;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesType &&
          matchesPriority &&
          matchesStatus &&
          matchesVessel
        );
      })
      .sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [
    maintenanceTasks,
    searchTerm,
    selectedCategory,
    selectedType,
    selectedPriority,
    selectedStatus,
    selectedVessel,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: keyof VesselMaintenanceTask) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.vesselName) return;

    const newTask: VesselMaintenanceTask = {
      id: `MNT-${Math.floor(210 + Math.random() * 800)}`,
      vesselId: formData.vesselId || 'VES-001',
      vesselName: formData.vesselName || 'VOYAGER TITAN',
      taskCode: formData.taskCode || `PMS-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title,
      systemCategory: formData.systemCategory || 'Main Engine & Propulsion',
      maintenanceType: formData.maintenanceType || 'Planned (PMS)',
      priority: formData.priority || 'Medium',
      status: formData.status || 'Scheduled',
      assignedEngineer: formData.assignedEngineer || 'Chief Engineer',
      serviceProvider: formData.serviceProvider || 'Shipboard Crew',
      location: formData.location || 'Current Berth / Anchorage',
      scheduledDate: formData.scheduledDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || new Date().toISOString().split('T')[0],
      estimatedHours: Number(formData.estimatedHours) || 12,
      estimatedCost: formData.estimatedCost?.startsWith('$')
        ? formData.estimatedCost
        : `$${formData.estimatedCost || '0'}`,
      partsRequired: formData.partsRequired || 'None required',
      notes: formData.notes || '',
    };

    onAddTask(newTask);
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'Task Code',
      'Title',
      'Vessel',
      'Category',
      'Type',
      'Priority',
      'Status',
      'Assigned Engineer',
      'Location',
      'Scheduled Date',
      'Due Date',
      'Estimated Hours',
      'Estimated Cost',
    ];
    const rows = filteredTasks.map((t) => [
      t.taskCode,
      `"${t.title.replace(/"/g, '""')}"`,
      t.vesselName,
      t.systemCategory,
      t.maintenanceType,
      t.priority,
      t.status,
      t.assignedEngineer,
      `"${t.location}"`,
      t.scheduledDate,
      t.dueDate,
      t.estimatedHours,
      t.estimatedCost,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vessel_maintenance_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Summary Metrics
  const totalTasks = maintenanceTasks.length;
  const inProgressCount = maintenanceTasks.filter((t) => t.status === 'In Progress').length;
  const scheduledCount = maintenanceTasks.filter((t) => t.status === 'Scheduled').length;
  const overdueCount = maintenanceTasks.filter((t) => t.status === 'Overdue').length;
  const completedCount = maintenanceTasks.filter((t) => t.status === 'Completed').length;
  const criticalCount = maintenanceTasks.filter((t) => t.priority === 'Critical').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner / Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white dark:bg-[#1C2434] p-5 shadow-xs border border-gray-100 dark:border-[#2E3A47]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20 dark:text-blue-400">
              <Wrench className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Vessels Maintenance & Technical Registry
            </h1>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-[#8A99AD]">
            Planned maintenance system (PMS), class surveys, dry dock planning, and emergency repair logs across all active vessels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] shadow-2xs hover:bg-gray-50 dark:hover:bg-[#2E3A47] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#3b51e6] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Maintenance Task</span>
          </button>
        </div>
      </div>

      {/* Metric Quick-Pills Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div
          onClick={() => setSelectedStatus('All')}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
            selectedStatus === 'All'
              ? 'border-[#465FFF] bg-[#465FFF]/5 dark:bg-[#465FFF]/10'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-[#8A99AD]">Total Tasks</span>
            <Layers className="h-4 w-4 text-gray-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">{totalTasks}</div>
          <div className="mt-0.5 text-[10px] text-gray-400">All registered items</div>
        </div>

        <div
          onClick={() => setSelectedStatus('In Progress')}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
            selectedStatus === 'In Progress'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">In Progress</span>
            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin-slow" />
          </div>
          <div className="mt-2 text-xl font-bold text-blue-600 dark:text-blue-400">{inProgressCount}</div>
          <div className="mt-0.5 text-[10px] text-gray-400">Currently active</div>
        </div>

        <div
          onClick={() => setSelectedStatus('Overdue')}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
            selectedStatus === 'Overdue'
              ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-500/10'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Overdue</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600 dark:text-rose-400">{overdueCount}</div>
          <div className="mt-0.5 text-[10px] text-rose-500 font-medium">Requires immediate action</div>
        </div>

        <div
          onClick={() => setSelectedStatus('Scheduled')}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
            selectedStatus === 'Scheduled'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Scheduled</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-amber-600 dark:text-amber-400">{scheduledCount}</div>
          <div className="mt-0.5 text-[10px] text-gray-400">Upcoming planned</div>
        </div>

        <div
          onClick={() => setSelectedPriority('Critical')}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
            selectedPriority === 'Critical'
              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-500/10'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">Critical Priority</span>
            <Zap className="h-4 w-4 text-purple-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-purple-600 dark:text-purple-400">{criticalCount}</div>
          <div className="mt-0.5 text-[10px] text-gray-400">High impact items</div>
        </div>

        <div
          onClick={() => setSelectedStatus('Completed')}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all shadow-xs ${
            selectedStatus === 'Completed'
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10'
              : 'border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</div>
          <div className="mt-0.5 text-[10px] text-gray-400">Signed-off & closed</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white dark:bg-[#1C2434] p-4 shadow-xs border border-gray-100 dark:border-[#2E3A47] space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by task code, vessel, system, engineer, or required parts..."
              className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F] pl-9 pr-8 py-2 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-[#465FFF] focus:outline-none focus:ring-1 focus:ring-[#465FFF]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dropdown Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vessel Filter */}
            <select
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-[#DEE4EE] focus:border-[#465FFF] focus:outline-none"
            >
              <option value="All">All Vessels ({vessels.length})</option>
              {vessels.map((v) => (
                <option key={v.id} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-[#DEE4EE] focus:border-[#465FFF] focus:outline-none"
            >
              <option value="All">All Systems</option>
              <option value="Main Engine & Propulsion">Main Engine & Propulsion</option>
              <option value="Auxiliary & Power Gen">Auxiliary & Power Gen</option>
              <option value="Hull & Deck Equipment">Hull & Deck Equipment</option>
              <option value="Navigation & Safety">Navigation & Safety</option>
              <option value="Ballast & Piping">Ballast & Piping</option>
              <option value="HVAC & Refrigeration">HVAC & Refrigeration</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-[#DEE4EE] focus:border-[#465FFF] focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-700 dark:text-[#DEE4EE] focus:border-[#465FFF] focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Overdue">Overdue</option>
              <option value="Completed">Completed</option>
            </select>

            {(selectedCategory !== 'All' ||
              selectedType !== 'All' ||
              selectedPriority !== 'All' ||
              selectedStatus !== 'All' ||
              selectedVessel !== 'All' ||
              searchTerm !== '') && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setSelectedPriority('All');
                  setSelectedStatus('All');
                  setSelectedVessel('All');
                  setSearchTerm('');
                }}
                className="rounded-xl px-2.5 py-2 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-medium transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-2xl bg-white dark:bg-[#1C2434] shadow-xs border border-gray-100 dark:border-[#2E3A47]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/50 dark:bg-[#24303F]/50 text-[11px] font-semibold text-gray-500 dark:text-[#8A99AD] uppercase tracking-wider">
                <th
                  onClick={() => handleSort('taskCode')}
                  className="cursor-pointer py-3.5 px-4 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Task Code / Title</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('vesselName')}
                  className="cursor-pointer py-3.5 px-4 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Vessel</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">System / Category</th>
                <th
                  onClick={() => handleSort('priority')}
                  className="cursor-pointer py-3.5 px-4 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Priority</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="cursor-pointer py-3.5 px-4 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Assigned / Provider</th>
                <th
                  onClick={() => handleSort('dueDate')}
                  className="cursor-pointer py-3.5 px-4 hover:text-gray-900 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Due Date & Cost</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-[#2E3A47] text-xs">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-[#8A99AD]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm font-medium">No maintenance tasks match your filter.</p>
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedPriority('All');
                          setSelectedStatus('All');
                          setSelectedVessel('All');
                          setSearchTerm('');
                        }}
                        className="text-xs text-[#465FFF] underline hover:text-[#3b51e6]"
                      >
                        Clear filters to see all tasks
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = task.status === 'Overdue';
                  const isInProgress = task.status === 'In Progress';
                  const isCompleted = task.status === 'Completed';

                  return (
                    <tr
                      key={task.id}
                      onClick={() => {
                        setSelectedTask(task);
                        if (onSelectTask) onSelectTask(task);
                      }}
                      className="group cursor-pointer hover:bg-gray-50/70 dark:hover:bg-[#24303F]/60 transition-colors"
                    >
                      {/* Task Code & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-[280px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#465FFF] dark:text-blue-400">
                              {task.taskCode}
                            </span>
                            <span className="rounded bg-gray-100 dark:bg-[#2E3A47] px-1.5 py-0.5 text-[9px] font-semibold text-gray-600 dark:text-gray-300">
                              {task.maintenanceType}
                            </span>
                          </div>
                          <span className="mt-1 font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-[#465FFF] transition-colors">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate mt-0.5">
                            {task.location}
                          </span>
                        </div>
                      </td>

                      {/* Vessel */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[#465FFF]">
                            <Ship className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {task.vesselName}
                            </span>
                            <div className="text-[10px] text-gray-400">{task.vesselId}</div>
                          </div>
                        </div>
                      </td>

                      {/* System Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-[#24303F] px-2.5 py-1 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                          {task.systemCategory}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            task.priority === 'Critical'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                              : task.priority === 'High'
                              ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                              : task.priority === 'Medium'
                              ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {task.priority === 'Critical' && <Zap className="h-3 w-3" />}
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isInProgress
                              ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'
                              : isOverdue
                              ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 animate-pulse'
                              : isCompleted
                              ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isInProgress
                                ? 'bg-blue-500'
                                : isOverdue
                                ? 'bg-rose-500'
                                : isCompleted
                                ? 'bg-emerald-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {task.status}
                        </span>
                      </td>

                      {/* Assigned & Provider */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col max-w-[200px]">
                          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">
                            {task.assignedEngineer}
                          </span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {task.serviceProvider}
                          </span>
                        </div>
                      </td>

                      {/* Due Date & Cost */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span
                            className={`font-semibold ${
                              isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {task.dueDate}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>{task.estimatedCost}</span>
                            <span>•</span>
                            <span>{task.estimatedHours}h est.</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-end gap-1.5"
                        >
                          {onUpdateStatus && task.status !== 'Completed' && (
                            <button
                              onClick={() => onUpdateStatus(task.id, 'Completed')}
                              title="Mark task completed"
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/20 transition-colors"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedTask(task)}
                            className="flex items-center gap-1 rounded-lg border border-gray-200 dark:border-[#2E3A47] px-2 py-1 text-[11px] font-medium text-gray-600 dark:text-[#DEE4EE] hover:bg-gray-100 dark:hover:bg-[#2E3A47] transition-colors"
                          >
                            <span>Details</span>
                            <ChevronRight className="h-3 w-3" />
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

        {/* Table Footer / Counter */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] px-4 py-3 text-xs text-gray-500 dark:text-[#8A99AD]">
          <span>
            Showing <strong className="text-gray-900 dark:text-white">{filteredTasks.length}</strong> of{' '}
            <strong className="text-gray-900 dark:text-white">{maintenanceTasks.length}</strong> registered maintenance items
          </span>
          <div className="mt-2 sm:mt-0 flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>In Progress: {inProgressCount}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Overdue: {overdueCount}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Scheduled: {scheduledCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Task Details Modal / Drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#1C2434] shadow-2xl border border-gray-200 dark:border-[#2E3A47] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4 bg-gray-50/50 dark:bg-[#24303F]/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF] dark:bg-[#465FFF]/20">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#465FFF]">
                      {selectedTask.taskCode}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                        selectedTask.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : selectedTask.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {selectedTask.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedTask.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6 space-y-5 text-xs">
              {/* Top Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 bg-gray-50/40 dark:bg-[#24303F]/40">
                  <span className="text-[10px] text-gray-400 font-medium">Assigned Vessel</span>
                  <div className="mt-1 font-bold text-gray-900 dark:text-white">
                    {selectedTask.vesselName}
                  </div>
                  <div className="text-[10px] text-gray-400">{selectedTask.vesselId}</div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 bg-gray-50/40 dark:bg-[#24303F]/40">
                  <span className="text-[10px] text-gray-400 font-medium">Current Status</span>
                  <div className="mt-1 font-bold text-gray-900 dark:text-white">
                    {selectedTask.status}
                  </div>
                  <div className="text-[10px] text-gray-400">Due {selectedTask.dueDate}</div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 bg-gray-50/40 dark:bg-[#24303F]/40">
                  <span className="text-[10px] text-gray-400 font-medium">Est. Cost / Hours</span>
                  <div className="mt-1 font-bold text-gray-900 dark:text-white">
                    {selectedTask.estimatedCost}
                  </div>
                  <div className="text-[10px] text-gray-400">{selectedTask.estimatedHours} Hours Required</div>
                </div>

                <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-3 bg-gray-50/40 dark:bg-[#24303F]/40">
                  <span className="text-[10px] text-gray-400 font-medium">System Category</span>
                  <div className="mt-1 font-bold text-gray-900 dark:text-white truncate">
                    {selectedTask.systemCategory}
                  </div>
                  <div className="text-[10px] text-gray-400">{selectedTask.maintenanceType}</div>
                </div>
              </div>

              {/* Engineering & Provider Details */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-4 space-y-2.5">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Wrench className="h-4 w-4 text-[#465FFF]" />
                  <span>Execution & Location Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700 dark:text-gray-300">
                  <div>
                    <span className="text-gray-400 text-[10px]">Lead Engineer:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTask.assignedEngineer}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Service Contractor:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTask.serviceProvider}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Port / Yard / Location:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTask.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px]">Scheduled Start Date:</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedTask.scheduledDate}</p>
                  </div>
                </div>
              </div>

              {/* Spare Parts Required */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-4 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-amber-500" />
                  <span>Required Spare Parts & Consumables</span>
                </h4>
                <p className="text-gray-700 dark:text-[#DEE4EE] bg-amber-50/50 dark:bg-amber-500/10 p-3 rounded-lg border border-amber-100 dark:border-amber-500/20">
                  {selectedTask.partsRequired}
                </p>
              </div>

              {/* Technical Notes */}
              <div className="rounded-xl border border-gray-100 dark:border-[#2E3A47] p-4 space-y-2">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span>Technical Notes & PMS Guidance</span>
                </h4>
                <p className="text-gray-600 dark:text-[#8A99AD] leading-relaxed">
                  {selectedTask.notes || 'No additional technical remarks recorded.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47] px-6 py-3.5 bg-gray-50/50 dark:bg-[#24303F]/50">
              <div className="flex items-center gap-2">
                {onUpdateStatus && selectedTask.status !== 'Completed' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedTask.id, 'Completed');
                      setSelectedTask({ ...selectedTask, status: 'Completed' });
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark as Completed</span>
                  </button>
                )}
                {onUpdateStatus && selectedTask.status !== 'In Progress' && (
                  <button
                    onClick={() => {
                      onUpdateStatus(selectedTask.id, 'In Progress');
                      setSelectedTask({ ...selectedTask, status: 'In Progress' });
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Set In Progress</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Maintenance Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-[#1C2434] shadow-2xl border border-gray-200 dark:border-[#2E3A47] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4 bg-gray-50/50 dark:bg-[#24303F]/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#465FFF]/10 text-[#465FFF]">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Log New Vessel Maintenance Task
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Schedule planned maintenance or log corrective shipyard work
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateTask} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vessel Select */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Select Vessel *
                  </label>
                  <select
                    value={formData.vesselName}
                    onChange={(e) => {
                      const v = vessels.find((item) => item.name === e.target.value);
                      setFormData({
                        ...formData,
                        vesselName: e.target.value,
                        vesselId: v?.id || 'VES-001',
                      });
                    }}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    {vessels.map((v) => (
                      <option key={v.id} value={v.name}>
                        {v.name} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Task Code / PMS Identifier *
                  </label>
                  <input
                    type="text"
                    value={formData.taskCode}
                    onChange={(e) => setFormData({ ...formData, taskCode: e.target.value })}
                    required
                    placeholder="e.g. PMS-ME-09K"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none font-mono"
                  />
                </div>

                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Task Title / Work Scope *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="e.g. Auxiliary Engine #1 Turbocharger Rotor Inspection & Bearing Renewal"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none font-medium"
                  />
                </div>

                {/* System Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    System Category *
                  </label>
                  <select
                    value={formData.systemCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemCategory: e.target.value as VesselMaintenanceTask['systemCategory'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Main Engine & Propulsion">Main Engine & Propulsion</option>
                    <option value="Auxiliary & Power Gen">Auxiliary & Power Gen</option>
                    <option value="Hull & Deck Equipment">Hull & Deck Equipment</option>
                    <option value="Navigation & Safety">Navigation & Safety</option>
                    <option value="Ballast & Piping">Ballast & Piping</option>
                    <option value="HVAC & Refrigeration">HVAC & Refrigeration</option>
                  </select>
                </div>

                {/* Maintenance Type */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Maintenance Type *
                  </label>
                  <select
                    value={formData.maintenanceType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maintenanceType: e.target.value as VesselMaintenanceTask['maintenanceType'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Planned (PMS)">Planned (PMS)</option>
                    <option value="Corrective / Repair">Corrective / Repair</option>
                    <option value="Dry Docking">Dry Docking</option>
                    <option value="Class Survey">Class Survey</option>
                    <option value="Condition Based">Condition Based</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Priority Level *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as VesselMaintenanceTask['priority'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Initial Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as VesselMaintenanceTask['status'],
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Assigned Engineer */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Assigned Lead Engineer
                  </label>
                  <input
                    type="text"
                    value={formData.assignedEngineer}
                    onChange={(e) => setFormData({ ...formData, assignedEngineer: e.target.value })}
                    placeholder="e.g. Chief Eng. Marco Rossi"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Service Provider */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Service Contractor / Maker
                  </label>
                  <input
                    type="text"
                    value={formData.serviceProvider}
                    onChange={(e) => setFormData({ ...formData, serviceProvider: e.target.value })}
                    placeholder="e.g. MAN Energy Solutions / Shipboard Crew"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Scheduled Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    required
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Port / Yard / Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Keppel Shipyard, Singapore"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Cost */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="text"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                    placeholder="$15,000"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Parts Required */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Required Spares & Parts
                  </label>
                  <input
                    type="text"
                    value={formData.partsRequired}
                    onChange={(e) => setFormData({ ...formData, partsRequired: e.target.value })}
                    placeholder="e.g. 6x Injector Nozzles, 2x Gasket Sets, Seal Kits"
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Technical Remarks & PMS Guidance
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Specific torque values, surveyor attendance, safety permits required..."
                    className="w-full rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-2 text-xs text-gray-900 dark:text-white focus:border-[#465FFF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100 dark:border-[#2E3A47]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#465FFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3b51e6] transition-colors shadow-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Register Maintenance Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
