import React from 'react';
import {
  Ship,
  Compass,
  AlertTriangle,
  Wrench,
  Users,
  Anchor,
  Box,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  Vessel,
  VoyageRecord,
  LandingRecord,
  IncidentRecord,
  VesselMaintenanceTask,
  CargoManifestRecord,
  PassengerManifestRecord,
  StaffMember,
} from '../../types';

interface OperationalKpiStripProps {
  vessels: Vessel[];
  voyages: VoyageRecord[];
  landings: LandingRecord[];
  incidents: IncidentRecord[];
  maintenanceTasks: VesselMaintenanceTask[];
  cargoList: CargoManifestRecord[];
  passengersList: PassengerManifestRecord[];
  staffList: StaffMember[];
  onNavigate: (view: string) => void;
}

export const OperationalKpiStrip: React.FC<OperationalKpiStripProps> = ({
  vessels = [],
  voyages = [],
  landings = [],
  incidents = [],
  maintenanceTasks = [],
  cargoList = [],
  passengersList = [],
  staffList = [],
  onNavigate,
}) => {
  // Compute live metrics across all system datasets
  const activeUnderwayVessels = vessels.filter((v) => v.status === 'Underway').length;
  const fleetUtilization = vessels.length > 0 ? Math.round((activeUnderwayVessels / vessels.length) * 100) : 0;

  const totalVoyagesActive = voyages.filter((v) => v.status === 'Departed' || v.status === 'Underway').length;

  const totalCargoTonnageMT = cargoList.reduce((acc, c) => acc + (Number(c.grossWeightMT) || 0), 0);

  const activeIncidentsCount = incidents.filter(
    (i) => i.status === 'Reported' || i.status === 'Under Investigation' || i.status === 'Corrective Action'
  ).length;
  const criticalIncidentsCount = incidents.filter((i) => i.severity === 'Critical' || i.severity === 'High').length;

  const pendingMaintenance = maintenanceTasks.filter((t) => t.status !== 'Completed').length;
  const overdueMaintenance = maintenanceTasks.filter((t) => t.status === 'Overdue').length;

  const totalPersonnel = staffList.length + passengersList.length;

  const cards = [
    {
      id: 'fleet-status',
      title: 'Active Fleet in Transit',
      value: `${activeUnderwayVessels} / ${vessels.length}`,
      subtext: `${fleetUtilization}% Fleet Utilization`,
      icon: Ship,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/40',
      badge: `${vessels.filter(v => v.status === 'In Port').length} in port`,
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
      targetNav: 'vessels-register',
    },
    {
      id: 'voyages-cargo',
      title: 'Active Voyages & Cargo',
      value: `${totalVoyagesActive} Voyages`,
      subtext: `${totalCargoTonnageMT.toLocaleString()} MT in Transit`,
      icon: Compass,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/40',
      badge: `${landings.length} Landed`,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300',
      targetNav: 'voyage-departure',
    },
    {
      id: 'safety-incidents',
      title: 'Safety & Risk Register',
      value: `${activeIncidentsCount} Open`,
      subtext: criticalIncidentsCount > 0 ? `${criticalIncidentsCount} High/Critical Priority` : 'Zero High Severity',
      icon: AlertTriangle,
      color: criticalIncidentsCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400',
      bgColor: criticalIncidentsCount > 0 ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/40' : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40',
      badge: criticalIncidentsCount > 0 ? 'Action Required' : 'Optimal',
      badgeColor: criticalIncidentsCount > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
      targetNav: 'incidents',
    },
    {
      id: 'technical-pms',
      title: 'Technical Maintenance (PMS)',
      value: `${pendingMaintenance} Tasks`,
      subtext: overdueMaintenance > 0 ? `${overdueMaintenance} Overdue Tasks` : 'All On-Schedule',
      icon: Wrench,
      color: overdueMaintenance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400',
      bgColor: overdueMaintenance > 0 ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/40' : 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-900/40',
      badge: `${maintenanceTasks.filter(t => t.status === 'Completed').length} Closed`,
      badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
      targetNav: 'vessels-maintenance',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={`system-kpi-${card.id}`}
            onClick={() => onNavigate(card.targetNav)}
            className="group relative rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer hover:border-[#465FFF]/30 dark:hover:border-[#465FFF]/30"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-500 dark:text-[#8A99AD]">
                  {card.title}
                </span>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {card.value}
                </h3>
                <span className="mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {card.subtext}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${card.bgColor} ${card.color} shrink-0`}>
                <IconComponent className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-[#2E3A47]/60 pt-3">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${card.badgeColor}`}>
                {card.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#465FFF] group-hover:translate-x-0.5 transition-transform">
                <span>View System Details</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
