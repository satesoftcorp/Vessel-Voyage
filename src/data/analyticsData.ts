import { AnalyticsKPI, DayAnalytics, TrafficChannel, TopPageItem, ActiveUserPoint } from '../types';

export const initialAnalyticsKPI: AnalyticsKPI = {
  totalTransported: {
    value: '248,650',
    change: '+18.4%',
    isPositive: true,
    period: 'Vs previous period',
  },
  malePassengers: {
    value: '134,220',
    change: '+16.2%',
    isPositive: true,
    period: '54.0% demographic ratio',
  },
  femalePassengers: {
    value: '114,430',
    change: '+21.1%',
    isPositive: true,
    period: '46.0% demographic ratio',
  },
  peakDailyVolume: {
    value: '3,840 pax',
    change: '+12.5%',
    isPositive: true,
    period: 'Peak: Entebbe-Kalangala',
  },
  // Backwards compatibility legacy aliases
  uniqueVisitors: {
    value: '248.6K',
    change: '+18.4%',
    isPositive: true,
    period: 'Total Transported',
  },
  totalPageviews: {
    value: '134.2K',
    change: '+16.2%',
    isPositive: true,
    period: 'Male Passengers (54%)',
  },
  bounceRate: {
    value: '114.4K',
    change: '+21.1%',
    isPositive: true,
    period: 'Female Passengers (46%)',
  },
  visitDuration: {
    value: '3,840/day',
    change: '+12.5%',
    isPositive: true,
    period: 'Peak Route Throughput',
  },
};

// 1. Per Day (24 Hours) - Hourly Transport Breakdown
export const analytics24HoursData: DayAnalytics[] = [
  { day: 0, label: '00:00', male: 28, female: 17, total: 45, trips: 1, capacityUtil: 30, visitors: 45, pageviews: 45, bounceRate: 38 },
  { day: 2, label: '02:00', male: 18, female: 12, total: 30, trips: 1, capacityUtil: 20, visitors: 30, pageviews: 30, bounceRate: 40 },
  { day: 4, label: '04:00', male: 42, female: 28, total: 70, trips: 2, capacityUtil: 47, visitors: 70, pageviews: 70, bounceRate: 40 },
  { day: 6, label: '06:00', male: 145, female: 115, total: 260, trips: 4, capacityUtil: 87, visitors: 260, pageviews: 260, bounceRate: 44 },
  { day: 8, label: '08:00', male: 240, female: 190, total: 430, trips: 6, capacityUtil: 96, visitors: 430, pageviews: 430, bounceRate: 44 },
  { day: 10, label: '10:00', male: 195, female: 165, total: 360, trips: 5, capacityUtil: 90, visitors: 360, pageviews: 360, bounceRate: 46 },
  { day: 12, label: '12:00', male: 210, female: 180, total: 390, trips: 5, capacityUtil: 92, visitors: 390, pageviews: 390, bounceRate: 46 },
  { day: 14, label: '14:00', male: 230, female: 195, total: 425, trips: 6, capacityUtil: 94, visitors: 425, pageviews: 425, bounceRate: 46 },
  { day: 16, label: '16:00', male: 265, female: 215, total: 480, trips: 6, capacityUtil: 98, visitors: 480, pageviews: 480, bounceRate: 45 },
  { day: 18, label: '18:00', male: 220, female: 180, total: 400, trips: 5, capacityUtil: 91, visitors: 400, pageviews: 400, bounceRate: 45 },
  { day: 20, label: '20:00', male: 120, female: 95, total: 215, trips: 3, capacityUtil: 72, visitors: 215, pageviews: 215, bounceRate: 44 },
  { day: 22, label: '22:00', male: 65, female: 45, total: 110, trips: 2, capacityUtil: 55, visitors: 110, pageviews: 110, bounceRate: 41 },
];

// 2. Per Week (7 Days) - Daily Transport Breakdown
export const analytics7DaysData: DayAnalytics[] = [
  { day: 1, label: 'Mon', male: 1450, female: 1210, total: 2660, trips: 28, capacityUtil: 89, visitors: 266, pageviews: 650, bounceRate: 45 },
  { day: 2, label: 'Tue', male: 1520, female: 1290, total: 2810, trips: 30, capacityUtil: 91, visitors: 281, pageviews: 710, bounceRate: 46 },
  { day: 3, label: 'Wed', male: 1490, female: 1240, total: 2730, trips: 29, capacityUtil: 88, visitors: 273, pageviews: 690, bounceRate: 45 },
  { day: 4, label: 'Thu', male: 1680, female: 1390, total: 3070, trips: 32, capacityUtil: 93, visitors: 307, pageviews: 780, bounceRate: 45 },
  { day: 5, label: 'Fri', male: 2150, female: 1780, total: 3930, trips: 38, capacityUtil: 97, visitors: 393, pageviews: 950, bounceRate: 45 },
  { day: 6, label: 'Sat', male: 2380, female: 1980, total: 4360, trips: 42, capacityUtil: 99, visitors: 436, pageviews: 990, bounceRate: 45 },
  { day: 7, label: 'Sun', male: 1920, female: 1650, total: 3570, trips: 36, capacityUtil: 94, visitors: 357, pageviews: 860, bounceRate: 46 },
];

// 3. Month per Week (4 Weeks of the Month)
export const analyticsMonthWeeksData: DayAnalytics[] = [
  { day: 1, label: 'Week 1 (1-7)', male: 11450, female: 9720, total: 21170, trips: 210, capacityUtil: 91, visitors: 211, pageviews: 520, bounceRate: 46 },
  { day: 2, label: 'Week 2 (8-14)', male: 12180, female: 10450, total: 22630, trips: 224, capacityUtil: 93, visitors: 226, pageviews: 560, bounceRate: 46 },
  { day: 3, label: 'Week 3 (15-21)', male: 11920, female: 10180, total: 22100, trips: 218, capacityUtil: 90, visitors: 221, pageviews: 540, bounceRate: 46 },
  { day: 4, label: 'Week 4 (22-28)', male: 13450, female: 11620, total: 25070, trips: 242, capacityUtil: 96, visitors: 250, pageviews: 610, bounceRate: 46 },
  { day: 5, label: 'Week 5 (29-30)', male: 4120, female: 3480, total: 7600, trips: 72, capacityUtil: 92, visitors: 76, pageviews: 190, bounceRate: 46 },
];

// 4. Month (30 Days Daily)
export const analytics30DaysData: DayAnalytics[] = [
  { day: 1, label: '1', male: 1450, female: 1210, total: 2660, trips: 28, capacityUtil: 88, visitors: 266, pageviews: 650, bounceRate: 45 },
  { day: 2, label: '2', male: 1520, female: 1290, total: 2810, trips: 30, capacityUtil: 90, visitors: 281, pageviews: 710, bounceRate: 46 },
  { day: 3, label: '3', male: 1480, female: 1230, total: 2710, trips: 29, capacityUtil: 87, visitors: 271, pageviews: 680, bounceRate: 45 },
  { day: 4, label: '4', male: 1680, female: 1390, total: 3070, trips: 32, capacityUtil: 92, visitors: 307, pageviews: 780, bounceRate: 45 },
  { day: 5, label: '5', male: 2150, female: 1780, total: 3930, trips: 38, capacityUtil: 97, visitors: 393, pageviews: 950, bounceRate: 45 },
  { day: 6, label: '6', male: 2380, female: 1980, total: 4360, trips: 42, capacityUtil: 99, visitors: 436, pageviews: 990, bounceRate: 45 },
  { day: 7, label: '7', male: 1920, female: 1650, total: 3570, trips: 36, capacityUtil: 94, visitors: 357, pageviews: 860, bounceRate: 46 },
  { day: 8, label: '8', male: 1410, female: 1190, total: 2600, trips: 28, capacityUtil: 86, visitors: 260, pageviews: 640, bounceRate: 46 },
  { day: 9, label: '9', male: 1540, female: 1310, total: 2850, trips: 30, capacityUtil: 91, visitors: 285, pageviews: 720, bounceRate: 46 },
  { day: 10, label: '10', male: 1620, female: 1370, total: 2990, trips: 31, capacityUtil: 92, visitors: 299, pageviews: 740, bounceRate: 46 },
  { day: 11, label: '11', male: 1690, female: 1420, total: 3110, trips: 32, capacityUtil: 93, visitors: 311, pageviews: 790, bounceRate: 46 },
  { day: 12, label: '12', male: 2200, female: 1840, total: 4040, trips: 39, capacityUtil: 98, visitors: 404, pageviews: 960, bounceRate: 45 },
  { day: 13, label: '13', male: 2420, female: 2010, total: 4430, trips: 43, capacityUtil: 99, visitors: 443, pageviews: 990, bounceRate: 45 },
  { day: 14, label: '14', male: 1980, female: 1690, total: 3670, trips: 37, capacityUtil: 95, visitors: 367, pageviews: 880, bounceRate: 46 },
  { day: 15, label: '15', male: 1430, female: 1200, total: 2630, trips: 28, capacityUtil: 87, visitors: 263, pageviews: 650, bounceRate: 46 },
  { day: 16, label: '16', male: 1510, female: 1280, total: 2790, trips: 30, capacityUtil: 90, visitors: 279, pageviews: 700, bounceRate: 46 },
  { day: 17, label: '17', male: 1590, female: 1340, total: 2930, trips: 31, capacityUtil: 91, visitors: 293, pageviews: 730, bounceRate: 46 },
  { day: 18, label: '18', male: 1670, female: 1400, total: 3070, trips: 32, capacityUtil: 92, visitors: 307, pageviews: 770, bounceRate: 46 },
  { day: 19, label: '19', male: 2180, female: 1820, total: 4000, trips: 38, capacityUtil: 97, visitors: 400, pageviews: 950, bounceRate: 45 },
  { day: 20, label: '20', male: 2390, female: 1990, total: 4380, trips: 42, capacityUtil: 99, visitors: 438, pageviews: 990, bounceRate: 45 },
  { day: 21, label: '21', male: 1950, female: 1660, total: 3610, trips: 36, capacityUtil: 94, visitors: 361, pageviews: 870, bounceRate: 46 },
  { day: 22, label: '22', male: 1460, female: 1220, total: 2680, trips: 28, capacityUtil: 88, visitors: 268, pageviews: 660, bounceRate: 46 },
  { day: 23, label: '23', male: 1550, female: 1320, total: 2870, trips: 30, capacityUtil: 91, visitors: 287, pageviews: 720, bounceRate: 46 },
  { day: 24, label: '24', male: 1640, female: 1380, total: 3020, trips: 31, capacityUtil: 92, visitors: 302, pageviews: 750, bounceRate: 46 },
  { day: 25, label: '25', male: 1720, female: 1440, total: 3160, trips: 33, capacityUtil: 93, visitors: 316, pageviews: 800, bounceRate: 46 },
  { day: 26, label: '26', male: 2250, female: 1880, total: 4130, trips: 40, capacityUtil: 98, visitors: 413, pageviews: 970, bounceRate: 45 },
  { day: 27, label: '27', male: 2450, female: 2040, total: 4490, trips: 43, capacityUtil: 99, visitors: 449, pageviews: 990, bounceRate: 45 },
  { day: 28, label: '28', male: 2020, female: 1710, total: 3730, trips: 37, capacityUtil: 95, visitors: 373, pageviews: 890, bounceRate: 46 },
  { day: 29, label: '29', male: 1980, female: 1680, total: 3660, trips: 36, capacityUtil: 93, visitors: 366, pageviews: 880, bounceRate: 46 },
  { day: 30, label: '30', male: 2140, female: 1800, total: 3940, trips: 36, capacityUtil: 95, visitors: 394, pageviews: 920, bounceRate: 46 },
];

// 5. Per Year (12 Months) - Monthly Transport Breakdown
export const analytics12MonthsData: DayAnalytics[] = [
  { day: 1, label: 'Jan', male: 18200, female: 15400, total: 33600, trips: 360, capacityUtil: 90, visitors: 336, pageviews: 820, bounceRate: 46 },
  { day: 2, label: 'Feb', male: 17400, female: 14800, total: 32200, trips: 345, capacityUtil: 89, visitors: 322, pageviews: 790, bounceRate: 46 },
  { day: 3, label: 'Mar', male: 19100, female: 16200, total: 35300, trips: 375, capacityUtil: 91, visitors: 353, pageviews: 860, bounceRate: 46 },
  { day: 4, label: 'Apr', male: 21500, female: 18900, total: 40400, trips: 410, capacityUtil: 96, visitors: 404, pageviews: 950, bounceRate: 47 },
  { day: 5, label: 'May', male: 18900, female: 16100, total: 35000, trips: 370, capacityUtil: 91, visitors: 350, pageviews: 850, bounceRate: 46 },
  { day: 6, label: 'Jun', male: 20200, female: 17300, total: 37500, trips: 390, capacityUtil: 93, visitors: 375, pageviews: 900, bounceRate: 46 },
  { day: 7, label: 'Jul', male: 21800, female: 18600, total: 40400, trips: 415, capacityUtil: 95, visitors: 404, pageviews: 960, bounceRate: 46 },
  { day: 8, label: 'Aug', male: 22600, female: 19400, total: 42000, trips: 430, capacityUtil: 97, visitors: 420, pageviews: 990, bounceRate: 46 },
  { day: 9, label: 'Sep', male: 19800, female: 16900, total: 36700, trips: 385, capacityUtil: 92, visitors: 367, pageviews: 880, bounceRate: 46 },
  { day: 10, label: 'Oct', male: 20500, female: 17600, total: 38100, trips: 395, capacityUtil: 93, visitors: 381, pageviews: 910, bounceRate: 46 },
  { day: 11, label: 'Nov', male: 21100, female: 18200, total: 39300, trips: 405, capacityUtil: 94, visitors: 393, pageviews: 930, bounceRate: 46 },
  { day: 12, label: 'Dec', male: 25800, female: 22400, total: 48200, trips: 480, capacityUtil: 99, visitors: 482, pageviews: 999, bounceRate: 46 },
];

export const topChannelsData: TrafficChannel[] = [
  { id: '1', source: 'Lake Victoria Ferry Express', visitors: '142.4K', visitorCount: 142400, percentage: 57, trend: '+14.2%', color: '#465FFF' },
  { id: '2', source: 'Lake Albert Waterway Line', visitors: '58.6K', visitorCount: 58600, percentage: 24, trend: '+8.7%', color: '#10B981' },
  { id: '3', source: 'Lake Kyoga Island Commuter', visitors: '31.2K', visitorCount: 31200, percentage: 13, trend: '+5.1%', color: '#F59E0B' },
  { id: '4', source: 'River Nile Crossing Barges', visitors: '16.4K', visitorCount: 16400, percentage: 6, trend: '+2.8%', color: '#8B5CF6' },
];

export const topPagesData: TopPageItem[] = [
  { id: '1', source: 'Entebbe (Nakiwogo) ⇄ Kalangala (Lutoboka)', pageviews: '94.2K', pageviewCount: 94200, uniqueViews: '51.8K', bounceRate: '96% Occ' },
  { id: '2', source: 'Wanseko ⇄ Panyimur (Lake Albert)', pageviews: '48.5K', pageviewCount: 48500, uniqueViews: '26.4K', bounceRate: '92% Occ' },
  { id: '3', source: 'Kiyindi ⇄ Buvuma Island (Lake Victoria)', pageviews: '38.1K', pageviewCount: 38100, uniqueViews: '20.5K', bounceRate: '94% Occ' },
  { id: '4', source: 'Masindi Port ⇄ Kungu (Lake Kyoga)', pageviews: '28.9K', pageviewCount: 28900, uniqueViews: '15.6K', bounceRate: '88% Occ' },
  { id: '5', source: 'Port Bell (Luzira) ⇄ Mwanza Commercial Transit', pageviews: '22.4K', pageviewCount: 22400, uniqueViews: '12.1K', bounceRate: '95% Occ' },
  { id: '6', source: 'Bukakata ⇄ Luku (Bugoma Island Route)', pageviews: '16.5K', pageviewCount: 16500, uniqueViews: '8.9K', bounceRate: '90% Occ' },
];

export const initialActiveUsersPoints: ActiveUserPoint[] = [
  { time: '12:00', users: 342 },
  { time: '12:05', users: 358 },
  { time: '12:10', users: 375 },
  { time: '12:15', users: 368 },
  { time: '12:20', users: 384 },
  { time: '12:25', users: 392 },
  { time: '12:30', users: 380 },
  { time: '12:35', users: 397 },
];
