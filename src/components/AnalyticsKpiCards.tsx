import React from 'react';
import { AnalyticsKPI } from '../types';
import { Users, User, HeartHandshake, TrendingUp, Ship } from 'lucide-react';

interface AnalyticsKpiCardsProps {
  kpis: AnalyticsKPI;
  onCardClick?: (metric: string) => void;
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ kpis, onCardClick }) => {
  const cards = [
    {
      id: 'total-transported',
      title: 'Total Transported',
      subtitle: 'All Passenger Corridors',
      value: kpis.totalTransported?.value || kpis.uniqueVisitors.value,
      change: kpis.totalTransported?.change || kpis.uniqueVisitors.change,
      isPositive: kpis.totalTransported?.isPositive ?? kpis.uniqueVisitors.isPositive,
      period: kpis.totalTransported?.period || kpis.uniqueVisitors.period,
      icon: Users,
      iconColor: 'text-[#465FFF]',
      iconBg: 'bg-[#465FFF]/10 dark:bg-[#465FFF]/20',
      badge: '100% Manifested',
    },
    {
      id: 'male-passengers',
      title: 'Male Passengers',
      subtitle: '54.0% Total Share',
      value: kpis.malePassengers?.value || '134,220',
      change: kpis.malePassengers?.change || '+16.2%',
      isPositive: kpis.malePassengers?.isPositive ?? true,
      period: kpis.malePassengers?.period || '54.0% demographic ratio',
      icon: User,
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      badge: 'Male Travelers',
    },
    {
      id: 'female-passengers',
      title: 'Female Passengers',
      subtitle: '46.0% Total Share',
      value: kpis.femalePassengers?.value || '114,430',
      change: kpis.femalePassengers?.change || '+21.1%',
      isPositive: kpis.femalePassengers?.isPositive ?? true,
      period: kpis.femalePassengers?.period || '46.0% demographic ratio',
      icon: HeartHandshake,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
      badge: 'Female Travelers',
    },
    {
      id: 'peak-capacity',
      title: 'Peak Throughput Volume',
      subtitle: '94.2% Capacity Factor',
      value: kpis.peakDailyVolume?.value || '3,840 pax',
      change: kpis.peakDailyVolume?.change || '+12.5%',
      isPositive: kpis.peakDailyVolume?.isPositive ?? true,
      period: kpis.peakDailyVolume?.period || 'Peak: Entebbe-Kalangala',
      icon: Ship,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      badge: 'High Density',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            id={`kpi-card-${card.id}`}
            onClick={() => onCardClick?.(card.title)}
            className="group relative rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    {card.title}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-[#8A99AD]">
                    {card.subtitle}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#24303F] text-gray-600 dark:text-gray-300">
                {card.badge}
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
              <h3 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {card.value}
              </h3>

              <div className="flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    card.isPositive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400'
                  }`}
                >
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  {card.change}
                </span>
              </div>
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-gray-100 dark:border-[#2E3A47] flex items-center justify-between text-[11px] text-gray-400 dark:text-[#8A99AD]">
              <span>{card.period}</span>
              <span className="text-[#465FFF] font-medium group-hover:underline">Details &rarr;</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
