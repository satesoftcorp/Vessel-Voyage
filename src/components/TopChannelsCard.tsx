import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { TrafficChannel } from '../types';

interface TopChannelsCardProps {
  channels: TrafficChannel[];
  onChannelClick?: (channel: TrafficChannel) => void;
}

export const TopChannelsCard: React.FC<TopChannelsCardProps> = ({
  channels,
  onChannelClick,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      id="top-channels-card"
      className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-5 shadow-xs flex flex-col justify-between"
    >
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
            Top Channels
          </h3>

          <div className="relative">
            <button
              id="top-channels-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 dark:hover:bg-[#24303F] hover:text-gray-700 dark:hover:text-white transition-colors"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-7 z-20 w-36 rounded-xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] py-1 shadow-lg text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F]"
                >
                  Detailed Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Column Headers */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-2 pt-1 text-xs text-gray-400 dark:text-[#8A99AD] font-medium">
          <span>Source</span>
          <span>Visitors</span>
        </div>

        {/* Channel Rows */}
        <div className="divide-y divide-gray-50 dark:divide-[#2E3A47]/40">
          {channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => onChannelClick?.(channel)}
              className="flex items-center justify-between py-2.5 text-xs text-gray-700 dark:text-[#DEE4EE] hover:bg-gray-50/70 dark:hover:bg-[#24303F]/40 px-1 rounded-md transition-colors cursor-pointer"
            >
              <span className="font-medium text-gray-900 dark:text-white">
                {channel.source}
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {channel.visitors}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
