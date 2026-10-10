import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Compass,
  Waves,
  Anchor,
  Ship,
  MapPin,
  Search,
  Filter,
  Layers,
  Info,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Droplets,
  Activity,
  Globe,
  Map as MapIcon,
  Navigation2,
  SlidersHorizontal,
  X,
  CheckCircle2,
  Share2,
  Download,
  Building2,
  Route,
  Move,
} from 'lucide-react';
import {
  UgandaWaterBody,
  UgandaMaritimePoint,
  UgandaFerryRoute,
  UgandaMajorTown,
  ugandaWaterBodies,
  ugandaMaritimePoints,
  ugandaFerryRoutes,
  ugandaMajorTowns,
} from '../data/ugandaWaterBodiesData';
import { ugandaRiverSegments, RiverSegment } from '../data/ugandaMapRiversData';
import { UgandaHydrographicVectorMap } from './UgandaHydrographicVectorMap';
import { PortRecord, WaterBody, VoyageRecord } from '../types';

interface UgandaWaterBodiesMapProps {
  darkMode: boolean;
  onNavigate?: (view: string) => void;
  systemPorts?: PortRecord[];
  systemWaterBodies?: WaterBody[];
  systemVoyages?: VoyageRecord[];
}

export const UgandaWaterBodiesMap: React.FC<UgandaWaterBodiesMapProps> = ({
  darkMode,
  onNavigate,
  systemPorts = [],
  systemWaterBodies = [],
  systemVoyages = [],
}) => {
  // Map View Mode: Vector SVG Map or Leaflet OpenStreetMap
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileQuickSheet, setShowMobileQuickSheet] = useState(true);

  // Selected Entities for Inspector
  const [selectedWaterBody, setSelectedWaterBody] = useState<UgandaWaterBody | null>(ugandaWaterBodies[0]);
  const [selectedTown, setSelectedTown] = useState<UgandaMajorTown | null>(null);
  const [selectedRiver, setSelectedRiver] = useState<RiverSegment | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<UgandaMaritimePoint | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<UgandaFerryRoute | null>(null);

  // Layer Toggles
  const [showTowns, setShowTowns] = useState(true);
  const [showRivers, setShowRivers] = useState(true);
  const [showLakes, setShowLakes] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showFerries, setShowFerries] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  // SVG Pan & Zoom State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Touch tracking refs for mobile pinch-to-zoom
  const touchStartDistRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);
  const touchStartPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstanceRef = useRef<any>(null);

  // Filtered Towns
  const filteredTowns = useMemo(() => {
    return ugandaMajorTowns.filter((town) => {
      const matchSearch =
        town.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        town.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        town.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [searchQuery]);

  // Filtered Rivers
  const filteredRivers = useMemo(() => {
    return ugandaRiverSegments.filter((riv) => {
      const matchSearch = riv.name.toLowerCase().includes(searchQuery.toLowerCase()) || riv.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [searchQuery]);

  // Filtered Water Bodies
  const filteredWaterBodies = useMemo(() => {
    return ugandaWaterBodies.filter((wb) => {
      const matchesSearch =
        wb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wb.indigenousName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wb.districts.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'All' ||
        (selectedCategory === 'Great Lakes' && wb.type === 'Great Lake') ||
        (selectedCategory === 'Inland Lakes' && (wb.type === 'Lake' || wb.type === 'Crater Lake')) ||
        (selectedCategory === 'Rivers & Channels' && (wb.type === 'River System' || wb.type === 'Channel / Strait')) ||
        (selectedCategory === 'Wetlands' && wb.type === 'Wetland / Basin');

      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  // Handle Zoom
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.6));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Mouse Dragging handlers for SVG Map
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch Handlers for mobile gestures (Pan and Pinch-to-Zoom)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: touch.clientX - panOffset.x, y: touch.clientY - panOffset.y });
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      touchStartDistRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
      touchStartPanRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      setPanOffset({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDistRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const scale = currentDist / touchStartDistRef.current;
      const newZoom = Math.min(Math.max(touchStartZoomRef.current * scale, 0.6), 3.5);
      setZoomLevel(newZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDistRef.current = null;
  };

  // Wheel zoom with passive: false for desktop & trackpads
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
      setZoomLevel((prev) => {
        const next = prev * zoomFactor;
        return Math.min(Math.max(next, 0.6), 3.5);
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Initialize or update Leaflet Map when switching to Satellite/OSM mode
  useEffect(() => {
    if (mapMode === 'satellite' && leafletContainerRef.current) {
      import('leaflet').then((L) => {
        if (!leafletMapInstanceRef.current && leafletContainerRef.current) {
          const map = L.map(leafletContainerRef.current).setView([1.3733, 32.2903], 7);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors | Uganda Marine Hydrography',
            maxZoom: 18,
          }).addTo(map);

          // Add markers for major water bodies
          ugandaWaterBodies.forEach((wb) => {
            const marker = L.circleMarker([wb.coordinates.lat, wb.coordinates.lng], {
              radius: 9,
              fillColor: wb.color,
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.85,
            }).addTo(map);

            marker.bindPopup(`
              <div style="font-family:sans-serif; min-width: 180px;">
                <h4 style="margin:0 0 4px; color:#0284c7; font-weight:700;">${wb.name}</h4>
                <p style="margin:0 0 4px; font-size:12px; color:#64748b;">${wb.indigenousName}</p>
                <div style="font-size:11px; margin-top:6px;">
                  <b>Surface Area:</b> ${wb.ugandaPortionAreaSqKm.toLocaleString()} km² (UGA)<br/>
                  <b>Max Depth:</b> ${wb.maxDepthMeters}m
                </div>
              </div>
            `);

            marker.on('click', () => {
              setSelectedWaterBody(wb);
              setSelectedTown(null);
              setSelectedRiver(null);
            });
          });

          // Add markers for Major Towns
          ugandaMajorTowns.forEach((twn) => {
            const townMarker = L.circleMarker([twn.coordinates.lat, twn.coordinates.lng], {
              radius: 5,
              fillColor: '#0f172a',
              color: '#ffffff',
              weight: 1.5,
              opacity: 1,
              fillOpacity: 0.9,
            }).addTo(map);

            townMarker.bindPopup(`
              <div style="font-family:sans-serif;">
                <b>${twn.name}</b> (${twn.district} District)<br/>
                <span style="font-size:11px; color:#64748b;">${twn.economicRole}</span>
              </div>
            `);

            townMarker.on('click', () => {
              setSelectedTown(twn);
              setSelectedWaterBody(null);
              setSelectedRiver(null);
            });
          });

          leafletMapInstanceRef.current = map;
        }
      });
    }

    return () => {
      if (leafletMapInstanceRef.current && mapMode !== 'satellite') {
        leafletMapInstanceRef.current.remove();
        leafletMapInstanceRef.current = null;
      }
    };
  }, [mapMode]);

  // Determine active selected item for quick mobile banner
  const activeSelectedSummary = useMemo(() => {
    if (selectedTown) {
      return {
        type: 'Major Town',
        title: selectedTown.name,
        subtitle: `${selectedTown.district} District • ${selectedTown.region} Region`,
        stat: `Pop. ${selectedTown.populationEstimate.toLocaleString()} • Elev. ${selectedTown.elevationMeters}m`,
        color: '#2563EB',
      };
    }
    if (selectedRiver) {
      return {
        type: 'River Network',
        title: selectedRiver.name,
        subtitle: `${selectedRiver.category} Basin`,
        stat: `Length: ${selectedRiver.lengthKm} km • Flow: ${selectedRiver.flowDirection}`,
        color: '#0284C7',
      };
    }
    if (selectedPoint) {
      return {
        type: 'Maritime Port / Pier',
        title: selectedPoint.name,
        subtitle: `${selectedPoint.district} District • ${selectedPoint.waterBodyName}`,
        stat: `${selectedPoint.pointType} • Max Draft: ${selectedPoint.maxDraftMeters}m`,
        color: '#7C3AED',
      };
    }
    if (selectedWaterBody) {
      return {
        type: 'Lake / Water Body',
        title: selectedWaterBody.name,
        subtitle: `${selectedWaterBody.indigenousName} (${selectedWaterBody.type})`,
        stat: `UGA Area: ${selectedWaterBody.ugandaPortionAreaSqKm.toLocaleString()} km² • Max Depth: ${selectedWaterBody.maxDepthMeters}m`,
        color: selectedWaterBody.color,
      };
    }
    return null;
  }, [selectedTown, selectedRiver, selectedPoint, selectedWaterBody]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 rounded-xl border border-sky-100 dark:border-sky-800/60 shrink-0">
            <Compass className="w-5 h-5 sm:w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Water Map
              </h1>
              <span className="px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full">
                Vector GIS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interactive Uganda hydrography with 34 major towns, 50+ rivers, Great Lakes, and MoWT ferry fleet
            </p>
          </div>
        </div>

        {/* View Mode Toggle & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Map Mode Buttons */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => setMapMode('vector')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mapMode === 'vector'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Vector Map
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mapMode === 'satellite'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Satellite / OSM
            </button>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('ports')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              <Anchor className="w-3.5 h-3.5" />
              Ports Directory
            </button>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-3">
        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">
            <span>Water Coverage</span>
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">44,000 km²</p>
          <span className="text-[10px] text-sky-600 dark:text-sky-400 font-medium">18.2% of Uganda</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">
            <span>Towns Mapped</span>
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{ugandaMajorTowns.length} Towns</p>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">4 Key Regions</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">
            <span>River Tributaries</span>
            <Waves className="w-3.5 h-3.5 text-cyan-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{ugandaRiverSegments.length}+ Rivers</p>
          <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Nile & Rift Basin</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">
            <span>Principal Lakes</span>
            <Layers className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{ugandaWaterBodies.length} Lakes</p>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">Victoria, Albert, Kyoga</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">
            <span>MoWT Ferry Fleet</span>
            <Ship className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{ugandaFerryRoutes.length} Routes</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">100% Operational</span>
        </div>

        <div className="p-3 sm:p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-0.5 sm:mb-1">
            <span>Safety Status</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">Normal</p>
          <span className="text-[10px] text-slate-500">LVBC / Marine Police</span>
        </div>
      </div>

      {/* 3. Main Workspace: Map Canvas + Side Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Left / Center: Interactive Vector Map View (8 Cols on Desktop, Full on Mobile) */}
        <div className="lg:col-span-8 space-y-4 w-full">
          <div
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
              isFullscreen
                ? 'fixed inset-0 z-50 rounded-none h-screen w-screen p-2 sm:p-4 bg-slate-950/95 backdrop-blur-md'
                : 'w-full'
            }`}
          >
            {/* Map Controls Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-slate-800/30">
              {/* Layer Toggles (Horizontally scrollable on mobile) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap w-full sm:w-auto -mx-1 px-1">
                <button
                  onClick={() => setShowTowns(!showTowns)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    showTowns
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  • Towns
                </button>
                <button
                  onClick={() => setShowRivers(!showRivers)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    showRivers
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  — Rivers
                </button>
                <button
                  onClick={() => setShowLakes(!showLakes)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    showLakes
                      ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ■ Lakes
                </button>
                <button
                  onClick={() => setShowPorts(!showPorts)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    showPorts
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  ⚓ Ports
                </button>
                <button
                  onClick={() => setShowFerries(!showFerries)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    showFerries
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  🚢 Ferries
                </button>
                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all shrink-0 ${
                    showGrid
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  Grid
                </button>
              </div>

              {/* Zoom & Controls Toolbar */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono font-semibold px-1.5 text-slate-500 dark:text-slate-400 min-w-[40px] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={handleResetZoom}
                    title="Reset Map View"
                    className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

                {/* Fullscreen Toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 text-sky-500" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Map Canvas Container (Dynamically Responsive Height) */}
            <div
              ref={mapContainerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`relative w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden transition-all duration-300 ${
                isFullscreen
                  ? 'flex-1 h-full min-h-[500px]'
                  : 'h-[50vh] sm:h-[58vh] md:h-[64vh] lg:h-[calc(100vh-270px)] min-h-[380px] sm:min-h-[460px] md:min-h-[540px] lg:min-h-[640px] xl:min-h-[720px] max-h-[880px]'
              }`}
            >
              {mapMode === 'vector' ? (
                <UgandaHydrographicVectorMap
                  darkMode={darkMode}
                  selectedWaterBody={selectedWaterBody}
                  selectedTown={selectedTown}
                  selectedRiver={selectedRiver}
                  selectedPoint={selectedPoint}
                  selectedRoute={selectedRoute}
                  onSelectWaterBody={(wb) => {
                    setSelectedWaterBody(wb);
                    setSelectedTown(null);
                    setSelectedRiver(null);
                    setSelectedPoint(null);
                    setShowMobileQuickSheet(true);
                  }}
                  onSelectTown={(twn) => {
                    setSelectedTown(twn);
                    setSelectedWaterBody(null);
                    setSelectedRiver(null);
                    setSelectedPoint(null);
                    setShowMobileQuickSheet(true);
                  }}
                  onSelectRiver={(riv) => {
                    setSelectedRiver(riv);
                    setSelectedTown(null);
                    setSelectedWaterBody(null);
                    setSelectedPoint(null);
                    setShowMobileQuickSheet(true);
                  }}
                  onSelectPoint={(pt) => {
                    setSelectedPoint(pt);
                    setSelectedTown(null);
                    setSelectedRiver(null);
                    setShowMobileQuickSheet(true);
                  }}
                  showTowns={showTowns}
                  showRivers={showRivers}
                  showLakes={showLakes}
                  showPorts={showPorts}
                  showFerries={showFerries}
                  showGrid={showGrid}
                  showLabels={showLabels}
                  zoomLevel={zoomLevel}
                  panOffset={panOffset}
                  systemPorts={ugandaMaritimePoints}
                  systemFerryRoutes={ugandaFerryRoutes}
                />
              ) : (
                <div ref={leafletContainerRef} className="w-full h-full min-h-full" />
              )}

              {/* Mobile Quick Preview Card (Floating overlay on screens < lg) */}
              {activeSelectedSummary && showMobileQuickSheet && (
                <div className="lg:hidden absolute bottom-3 left-3 right-3 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: activeSelectedSummary.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {activeSelectedSummary.type}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {activeSelectedSummary.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {activeSelectedSummary.subtitle}
                        </p>
                        <p className="text-[11px] font-medium text-sky-600 dark:text-sky-400 mt-0.5 truncate">
                          {activeSelectedSummary.stat}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowMobileQuickSheet(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href="#map-inspector-section"
                      className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                    >
                      View Full Technical Dossier <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-[10px] text-slate-400">Pinch to Zoom • Drag to Pan</span>
                  </div>
                </div>
              )}
            </div>

            {/* Map Footer Help */}
            <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span className="truncate">
                Interactive Vector Map: Click or touch any town dot, river line, lake polygon, or port to inspect.
              </span>
              <span className="font-mono text-[10px] text-slate-400 shrink-0">CRS: WGS84 / EPSG:4326</span>
            </div>
          </div>

          {/* Quick Select Quick-Chips for Towns & Rivers */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                Quick Focus Major Towns ({ugandaMajorTowns.length})
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Tap to center</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 sm:max-h-32 overflow-y-auto pr-1 scrollbar-thin">
              {ugandaMajorTowns.map((town) => (
                <button
                  key={town.id}
                  onClick={() => {
                    setSelectedTown(town);
                    setSelectedWaterBody(null);
                    setSelectedRiver(null);
                    setSelectedPoint(null);
                    setShowMobileQuickSheet(true);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedTown?.id === town.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {town.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right / Bottom: Hydrographic & Regional Inspector (4 Cols on Desktop, Full on Mobile) */}
        <div id="map-inspector-section" className="lg:col-span-4 space-y-4 w-full">
          {/* Search Box */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search lakes, towns, rivers, ports, districts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {['All', 'Great Lakes', 'Inland Lakes', 'Rivers & Channels', 'Wetlands'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 1. Town Details Card (If town is selected) */}
          {selectedTown && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 uppercase">
                      {selectedTown.region} Region
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {selectedTown.coordinates.lat.toFixed(3)}°N, {selectedTown.coordinates.lng.toFixed(3)}°E
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    {selectedTown.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedTown.district} District</p>
                </div>
                <button
                  onClick={() => setSelectedTown(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Economic Role & Details */}
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300">
                <b className="text-blue-900 dark:text-blue-200 block mb-1">Economic & Hydrographic Hub:</b>
                {selectedTown.economicRole}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Population Est.</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedTown.populationEstimate.toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Elevation (MSL)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedTown.elevationMeters} meters
                  </span>
                </div>
              </div>

              {selectedTown.nearestWaterBody && (
                <div className="p-2.5 bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-xl text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-sky-600" />
                    <span>Adjacent: {selectedTown.nearestWaterBody}</span>
                  </div>
                  <button
                    onClick={() => {
                      const wb = ugandaWaterBodies.find((w) => w.name.includes(selectedTown.nearestWaterBody || ''));
                      if (wb) {
                        setSelectedWaterBody(wb);
                        setSelectedTown(null);
                      }
                    }}
                    className="text-[11px] text-sky-600 hover:underline font-semibold"
                  >
                    View Lake →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. River Details Card (If river is selected) */}
          {selectedRiver && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-cyan-200 dark:border-cyan-900 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950/70 dark:text-cyan-300 uppercase">
                      {selectedRiver.category} Basin
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Waves className="w-4 h-4 text-cyan-600" />
                    {selectedRiver.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Length: ~{selectedRiver.lengthKm} km</p>
                </div>
                <button
                  onClick={() => setSelectedRiver(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/30 rounded-xl border border-cyan-100 dark:border-cyan-900/40 text-xs text-slate-700 dark:text-slate-300">
                <b className="text-cyan-900 dark:text-cyan-200 block mb-1">Hydrological Overview:</b>
                {selectedRiver.description}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Flow Direction</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRiver.flowDirection}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Discharges Into</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedRiver.mouth}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. Maritime Port / Pier Details Card */}
          {selectedPoint && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-sm space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 uppercase">
                      {selectedPoint.pointType}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Anchor className="w-4 h-4 text-indigo-600" />
                    {selectedPoint.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedPoint.district} District • {selectedPoint.waterBodyName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPoint(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Managing Operator</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPoint.operator}</span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Max Berthing Draft</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedPoint.maxDraftMeters}m</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <b className="text-slate-800 dark:text-slate-200 block mb-1">Terminal Facilities:</b>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedPoint.facilities.map((fac, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300"
                    >
                      {fac}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. Selected Water Body Full Technical Dossier */}
          {selectedWaterBody && (
            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: selectedWaterBody.color }}
                    />
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {selectedWaterBody.type}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {selectedWaterBody.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                    "{selectedWaterBody.indigenousName}"
                  </p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 text-xs font-bold bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 rounded-lg">
                    {selectedWaterBody.elevationMeters}m MSL
                  </span>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">UGA Water Surface</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedWaterBody.ugandaPortionAreaSqKm.toLocaleString()} km²
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {Math.round((selectedWaterBody.ugandaPortionAreaSqKm / selectedWaterBody.surfaceAreaSqKm) * 100)}% of total lake
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Max / Avg Depth</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedWaterBody.maxDepthMeters}m / {selectedWaterBody.meanDepthMeters}m
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Hydrological profile</span>
                </div>
              </div>

              {/* Description */}
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedWaterBody.description}
              </div>

              {/* Economic Activities */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-500" />
                  Primary Maritime & Economic Activities
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedWaterBody.economicActivities.map((act, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active MoWT Vessels */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-emerald-500" />
                  Active MoWT Vessels & Routes
                </h4>
                <div className="space-y-1.5">
                  {selectedWaterBody.activeFerries.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-xs font-medium text-emerald-900 dark:text-emerald-200 flex items-center gap-2"
                    >
                      <Route className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Water Bodies List for quick inspection */}
          <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Lakes & Waterways Registry</span>
              <span className="text-slate-400 font-normal text-[11px]">{ugandaWaterBodies.length} Registered</span>
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {ugandaWaterBodies.map((wb) => (
                <button
                  key={wb.id}
                  onClick={() => {
                    setSelectedWaterBody(wb);
                    setSelectedTown(null);
                    setSelectedRiver(null);
                    setSelectedPoint(null);
                    setShowMobileQuickSheet(true);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    selectedWaterBody?.id === wb.id && !selectedTown && !selectedRiver && !selectedPoint
                      ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-200 shadow-sm'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: wb.color }} />
                    <span className="font-semibold truncate">{wb.name}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono shrink-0 ml-2">
                    {wb.ugandaPortionAreaSqKm.toLocaleString()} km²
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

