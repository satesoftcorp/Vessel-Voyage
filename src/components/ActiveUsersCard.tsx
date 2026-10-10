import React, { useState, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ActiveUserPoint } from '../types';

interface ActiveUsersCardProps {
  initialUsers?: number;
  initialPoints?: ActiveUserPoint[];
  liveSimulation: boolean;
  darkMode: boolean;
}

export const ActiveUsersCard: React.FC<ActiveUsersCardProps> = ({
  initialUsers = 197,
  initialPoints = [
    { time: '12:00', users: 155 },
    { time: '12:05', users: 168 },
    { time: '12:10', users: 185 },
    { time: '12:15', users: 172 },
    { time: '12:20', users: 188 },
    { time: '12:25', users: 194 },
    { time: '12:30', users: 182 },
    { time: '12:35', users: 197 },
  ],
  liveSimulation,
  darkMode,
}) => {
  const [activeUsers, setActiveUsers] = useState(initialUsers);
  const [points, setPoints] = useState<ActiveUserPoint[]>(initialPoints);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!liveSimulation) return;

    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 9) - 4; // -4 to +4
      setActiveUsers((prev) => {
        const next = Math.max(160, Math.min(240, prev + delta));
        setPoints((prevPoints) => {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
            .getMinutes()
            .toString()
            .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const updated = [...prevPoints.slice(1), { time: timeStr, users: next }];
          return updated;
        });
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [liveSimulation]);

  return (
    <div
      id="active-users-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            Active Users
          </h3>

          <div className="relative">
            <button
              id="active-users-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-700 dark:hover:text-white transition-colors"
              title="Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-40 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-1 shadow-lg text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Realtime Stream
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Geographic Map
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Visitor Count */}
        <div className="mt-1 flex items-center gap-3">
          <div className="relative flex h-3.5 w-3.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {activeUsers}
            </span>
            <span className="text-xs font-medium text-gray-500 dark:text-[#8A99AD]">
              Live visitors
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Wave Spline Chart */}
      <div className="mt-4 h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="liveUserGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#465FFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#465FFF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-gray-900 px-2.5 py-1 text-xs text-white shadow-md">
                      <span>{payload[0].value} online</span>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="users"
              stroke="#465FFF"
              strokeWidth={2.5}
              fill="url(#liveUserGradient)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Live Metrics */}
      <div className="mt-2 grid grid-cols-2 gap-2 border-t border-gray-100 dark:border-[#2E3A47] pt-2.5 text-[11px] text-gray-500 dark:text-[#8A99AD]">
        <div>
          <span>Mobile: </span>
          <strong className="text-gray-900 dark:text-white">64%</strong>
        </div>
        <div className="text-right">
          <span>Desktop: </span>
          <strong className="text-gray-900 dark:text-white">36%</strong>
        </div>
      </div>
    </div>
  );
};
