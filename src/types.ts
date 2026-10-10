export interface AnalyticsKPI {
  uniqueVisitors: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  totalPageviews: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  bounceRate: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  visitDuration: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  totalTransported?: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  malePassengers?: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  femalePassengers?: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
  peakDailyVolume?: {
    value: string;
    change: string;
    isPositive: boolean;
    period: string;
  };
}

export interface DayAnalytics {
  day: number;
  label: string;
  male: number;
  female: number;
  total: number;
  trips?: number;
  capacityUtil?: number;
  visitors: number;
  pageviews?: number;
  bounceRate?: number;
}

export interface TrafficChannel {
  id: string;
  source: string;
  visitors: string;
  visitorCount: number;
  percentage: number;
  trend: string;
  color?: string;
}

export interface TopPageItem {
  id: string;
  source: string;
  pageviews: string;
  pageviewCount: number;
  uniqueViews: string;
  bounceRate: string;
}

export interface ActiveUserPoint {
  time: string;
  users: number;
}

export interface VesselEngine {
  engineNumber: string; // Serial / Engine Number
  modelOrType?: string; // Model or Manufacturer (e.g. MAN B&W 8S90ME-C10.5)
  powerOutput?: string; // Power rating (e.g. 36,400 kW)
  role?: 'Main Engine' | 'Auxiliary Generator' | 'Emergency Generator' | 'Thruster Engine';
}

export interface Vessel {
  id: string;
  name: string;
  imoNumber: string;
  callSign: string;
  mmsi: string;
  type: string | string[];
  types?: string[];
  flag: string;
  flagCode: string;
  yearBuilt: number;
  grossTonnage: string;
  deadweight: string;
  status: 'Underway' | 'In Port' | 'At Anchor' | 'Moored' | 'Dry Dock';
  speedKnots: number;
  topSpeedKnots?: number;
  heading: number;
  currentLocation: string;
  waterBody: string;
  operationPorts?: string[];
  destination: string;
  eta: string;
  masterName?: string;
  crewCount: number;
  imageUrl?: string;
  remarks?: string;

  // Step 2 Technical & Manufacturer Specs:
  manufacturer?: string;
  yearOfManufacture?: number;
  placeOfManufacture?: string;
  fuelType?: string;
  numberOfEngines?: number;
  engines?: VesselEngine[];
}

export interface VesselMaintenanceTask {
  id: string;
  vesselId: string;
  vesselName: string;
  taskCode: string;
  title: string;
  systemCategory:
    | 'Main Engine & Propulsion'
    | 'Auxiliary & Power Gen'
    | 'Hull & Deck Equipment'
    | 'Navigation & Safety'
    | 'Ballast & Piping'
    | 'HVAC & Refrigeration';
  maintenanceType:
    | 'Planned (PMS)'
    | 'Corrective / Repair'
    | 'Dry Docking'
    | 'Class Survey'
    | 'Condition Based';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Scheduled' | 'Overdue' | 'Completed';
  assignedEngineer: string;
  serviceProvider: string;
  location: string;
  scheduledDate: string;
  dueDate: string;
  completedDate?: string;
  estimatedHours: number;
  actualHours?: number;
  estimatedCost: string;
  partsRequired: string;
  notes: string;
}

export type StaffType = 'Crew' | 'Admin' | 'Shore Staff';

export interface StaffMember {
  id: string;
  staffId: string; // e.g. EMP-9081, ADM-101
  fullName: string;
  staffType: StaffType;
  role: string; // Role for Crew (Master, Chief Engineer, etc.) or Admin/Shore (Fleet Operations Director, Superintendent, etc.)
  department: string; // Deck, Engine, Catering, Operations, Marine HR, Technical Superintendent, DPA / Safety, Management
  nationality: string;
  nationalityCode: string;
  email: string;
  phone: string;
  passportNo: string;
  seamanBookNo?: string; // CDC/Seaman Book (standard for Crew)
  certExpiry?: string; // STCW / Professional Cert Expiry
  medicalCertExpiry?: string;
  status: 'Active' | 'On Board' | 'On Leave' | 'Standby' | 'Inactive';
  assignedVesselName?: string;
  isPartOfCrew?: boolean; // Indicates if this staff profile currently forms part of an active vessel crew
  avatarUrl: string;
  dateOfBirth?: string;
  joiningDate?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt?: string;
}

export interface CrewMember {
  id: string;
  employeeId: string;
  staffId?: string; // Link to parent StaffMember profile
  fullName: string;
  rank: 'Master (Captain)' | 'Chief Engineer' | 'Chief Officer' | '2nd Officer' | '3rd Officer' | '2nd Engineer' | '3rd Engineer' | 'Bosun' | 'Able Seaman' | 'Cook' | 'Motorman' | 'Motorman / Oiler' | 'Electro-Technical Officer (ETO)' | 'Deck Cadet';
  assignedVesselId: string;
  assignedVesselName: string;
  nationality: string;
  nationalityCode: string;
  seamanBookNo: string;
  passportNo: string;
  certExpiry: string;
  medicalCertExpiry: string;
  status: 'On Board' | 'On Leave' | 'In Transit' | 'Standby';
  embarkDate: string;
  disembarkDate: string;
  email: string;
  phone: string;
  avatarUrl: string;
}

// User Management & SaaS Multitenancy Interfaces
export type UserType = 'Superadmin' | 'Port users' | 'Stakeholders';
export type RoleCategory = UserType;

export type SystemRoleType =
  | 'Super Admin'
  | 'System Security & Compliance Director'
  | 'Tenant Super Administrator'
  | 'Staff User'
  | 'Port Logistics & Terminal Agent'
  | 'Harbor Master & Pilotage Officer'
  | 'Port Operations Officer'
  | 'Fleet Operations Manager'
  | 'Vessel Captain'
  | 'Marine Safety Officer'
  | 'Chief Marine Engineer'
  | 'Marine HR & Crewing Officer'
  | 'Stevedore & Terminal Supervisor'
  | 'Port & Maritime Authority Officer'
  | 'Cargo Owner / Shipper Representative'
  | 'Vessel Charterer & Broker'
  | 'Customs & Border Protection Inspector'
  | 'Marine Insurance Surveyor & P&I Auditor'
  | 'Maritime Environmental Regulator';

export interface SystemUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userType: UserType;
  role: SystemRoleType | string;
  roleId: string;
  roleCategory?: UserType;
  staffId?: string; // Link to associated Staff Profile
  organization?: string; // Company / Port Authority / Shipper entity
  department: string;
  status: 'Active' | 'Suspended' | 'Pending Activation';
  isSuperAdmin: boolean;
  mfaEnabled: boolean;
  lastLogin: string;
  assignedVessel?: string;
  avatarUrl: string;
  createdAt: string;
}

export interface SystemRole {
  id: string;
  name: string;
  code: string;
  userType: UserType;
  category: UserType;
  description: string;
  userCount: number;
  isSystemDefault: boolean;
  tier:
    | 'Tier 1 - Full Governance'
    | 'Tier 2 - Operational Admin'
    | 'Tier 3 - Vessel & Terminal Command'
    | 'Tier 4 - Standard Port Staff'
    | 'Tier 5 - External Stakeholder';
  permissionsCount: number;
  assignedPermissions?: string[]; // Array of PermissionItem IDs
}

export type PermissionModule =
  | 'Voyage Operations'
  | 'Fleet & Vessels'
  | 'Incidents & Safety'
  | 'Staff & Crew'
  | 'Waterways & Ports'
  | 'User Management & Security'
  | 'Reports & Analytics';

export interface PermissionItem {
  id: string;
  module: PermissionModule;
  code: string;
  name: string;
  description: string;
  // Superadmin Roles
  superAdmin: boolean; // Root Super Admin
  securityAuditor: boolean; // System Security & Compliance Director
  tenantAdmin?: boolean; // Tenant Administrator
  // Port Users Roles
  portLogistics: boolean; // Port Logistics & Terminal Agent
  harborMaster?: boolean; // Harbor Master & Pilotage Officer
  portOps?: boolean; // Port Operations Officer
  staffUser: boolean; // Staff User (General Operational)
  fleetManager: boolean; // Fleet Operations Manager
  vesselCaptain: boolean; // Vessel Captain / Master
  safetyOfficer: boolean; // Marine Safety Officer (DPA)
  chiefEngineer: boolean; // Chief Marine Engineer
  crewingOfficer: boolean; // Marine HR & Crewing Officer
  // Stakeholders Roles
  portAuthority: boolean; // Port & Maritime Authority Officer
  cargoOwner: boolean; // Cargo Owner / Shipper Representative
  charterer: boolean; // Vessel Charterer & Broker
  customsInspector: boolean; // Customs & Border Protection Inspector
  insuranceSurveyor: boolean; // Marine Insurance Surveyor & P&I Auditor
  environmentalRegulator?: boolean; // Maritime Environmental Regulator
  // Dynamic role support
  [key: string]: boolean | string | undefined;
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changeAmount: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: string;
  marketCap: string;
  peRatio: number;
  dividendYield: number;
  week52High: number;
  week52Low: number;
  sharesOwned: number;
  avgBuyPrice: number;
  logo: string;
  color: string;
  sparkline: number[];
  historical: {
    '1D': { time: string; price: number; volume: number }[];
    '1W': { time: string; price: number; volume: number }[];
    '1M': { time: string; price: number; volume: number }[];
    '6M': { time: string; price: number; volume: number }[];
    '1Y': { time: string; price: number; volume: number }[];
    'ALL': { time: string; price: number; volume: number }[];
  };
  description: string;
  ceo: string;
  founded: number;
  headquarters: string;
  analystRating: {
    buy: number;
    hold: number;
    sell: number;
    targetPrice: number;
  };
}

export interface Transaction {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT';
  shares: number;
  price: number;
  total: number;
  date: string;
  time: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

export interface DividendPayout {
  id: string;
  symbol: string;
  name: string;
  exDate: string;
  payDate: string;
  amountPerShare: number;
  shares: number;
  totalPayout: number;
  status: 'Upcoming' | 'Paid';
}

export interface SectorAllocation {
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface UserPortfolio {
  cashBalance: number;
  investedValue: number;
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  dailyProfitLoss: number;
  dailyProfitLossPercentage: number;
  annualDividend: number;
  dividendYieldAvg: number;
}

export interface WaterBody {
  id: string;
  code: string;
  name: string;
  category: 'Ocean' | 'Sea' | 'Marginal Sea' | 'Strait' | 'Gulf' | 'Canal / Chokepoint' | 'Bay' | 'Inland Waterway';
  country?: string;
  region: string;
  environmentalStatus: 'IMO SECA (0.1% Sulfur)' | 'IMO NECA (NOx Tier III)' | 'Standard MARPOL' | 'Polar Code Area' | 'PSSA Special Area';
  securityLevel: 'Normal Navigation (Level 1)' | 'Heightened Watch (Level 2)' | 'High Risk Area (HRA - BMP5)' | 'Restricted Transit';
  maxDraftMeters?: number;
  weatherProfile?: string;
  status: 'Active' | 'Restricted' | 'Seasonal Warning';
  remarks?: string;
  createdAt?: string;
}

export interface PortRecord {
  id: string;
  code: string; // UN/LOCODE e.g. SGSIN, NLRTM
  name: string;
  waterBodyId: string;
  waterBodyName: string;
  country: string;
  countryCode: string;
  terminalType: 'Container Transshipment' | 'Crude Oil & Bunkering' | 'Dry Bulk & Ore' | 'LNG & Chemical' | 'General Cargo & RoRo' | 'Multi-Purpose Mega Hub';
  maxDraftMeters: number;
  berthsCount?: number;
  capacity?: string;
  pilotageRequirement: 'Compulsory 24/7' | 'Compulsory for >500GT' | 'Advisory Only' | 'VTS Monitored';
  latitude?: string;
  longitude?: string;
  status: 'Operational' | 'Congested' | 'Maintenance / Dredging' | 'Weather Delay';
  remarks?: string;
  createdAt?: string;
}

export interface VoyageCrewConfirmation {
  id: string;
  crewId: string;
  staffId?: string;
  fullName: string;
  rank: string;
  email: string;
  phone?: string;
  confirmed: boolean;
  confirmedAt?: string;
  deviceType?: 'Mobile App (iOS)' | 'Mobile App (Android)' | 'Crew Terminal' | 'Bridge Tablet' | 'Pending Ack';
  avatarUrl: string;
}

export interface VoyageRecord {
  id: string;
  voyageNumber: string; // e.g. VY-9045, Auto-incremented & editable
  vesselId: string;
  vesselName: string;
  departurePort: string;
  arrivalPort: string;
  waterBody: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  status: 'Scheduled' | 'Boarding' | 'Set Off' | 'En Route' | 'Completed' | 'Delayed';
  captainName: string;
  captainDeviceStatus?: 'Standby' | 'Set Off Triggered' | 'Underway Confirmed';
  captainSetOffTime?: string;

  // Crew and Onboard Confirmation Status
  crewCount: number;
  crewConfirmedCount: number;
  crewAlertSent: boolean;
  crewAlertSentAt?: string;
  crewConfirmations: VoyageCrewConfirmation[];

  // Mandatory user-requested transport, cargo & manifest fields for Departure:
  passengers: number;
  trucks: number;
  wagons: number;
  cars: number;
  pickups: number;
  motorcycles: number;
  cargoTonnage: number; // Metric Tons (MT)
  bicycles: number;
  buses: number;

  remarks?: string;
  createdAt?: string;
}

export interface LandingRecord {
  id: string;
  voyageNumber: string; // Auto-incremented e.g. VY-9045, editable
  voyageId?: string; // Optional reference to linked voyage
  vesselId: string;
  vesselName: string;
  departurePort: string; // Port of Origin
  arrivalPort: string; // Landing Port
  landingBerth: string; // e.g. Berth #4 Ro-Pax Terminal
  waterBody: string;
  landingDate: string; // YYYY-MM-DD
  landingTime: string; // HH:mm
  scheduledArrivalDate?: string;
  scheduledArrivalTime?: string;
  status: 'Berthed / Landed' | 'Discharging' | 'Cleared' | 'Anchorage Waiting' | 'Delayed';
  captainName: string;
  harborPilotName?: string;
  pilotageStatus: 'Pilot Onboard & Docked' | 'Direct Berthing' | 'Tug Escorted' | 'Pending Pilot';
  portAuthorityClearance: 'Cleared & Granted Pratique' | 'Customs & Border Cleared' | 'Under Inspection' | 'Quarantine Clearance';
  fuelRemainingMT?: number;
  transitHours?: number;

  // Disembarkation & Discharge Manifest (Landing metrics)
  disembarkedPassengers: number;
  dischargedTrucks: number;
  dischargedWagons: number;
  dischargedCars: number;
  dischargedPickups: number;
  dischargedMotorcycles: number;
  dischargedCargoTonnage: number; // Metric Tons (MT)
  dischargedBicycles: number;
  dischargedBuses: number;

  dischargeCondition?: 'Normal - All Cleared' | 'Minor Cargo Shift Reported' | 'Discharge Complete No Damage' | 'Customs Hold on Wagon #4';
  crewRollcallOnArrival: number;
  crewTotal: number;
  remarks?: string;
  createdAt?: string;
}

export type IncidentType = 'Voyage' | 'Non voyage';
export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'Reported' | 'Under Investigation' | 'Corrective Action' | 'Resolved' | 'Closed';

export type IncidentCategory =
  | 'Machinery & Technical Failure'
  | 'Navigation & Collision Risk'
  | 'Cargo Damage & Shifting'
  | 'Occupational Health & Safety'
  | 'Environmental & Pollution'
  | 'Port & Mooring Infrastructure'
  | 'Fire & Smoke Alarm'
  | 'Security & Access Breach'
  | 'Electrical & Power Outage'
  | 'Medical Emergency'
  | 'Weather & Heavy Sea Impact'
  | 'Other / Operational';

export interface IncidentMessage {
  id: string;
  senderName: string;
  senderRole?: string;
  senderEmail?: string;
  senderAvatar?: string;
  timestamp: string;
  isInvestigator?: boolean;
  content: string[];
  attachments?: string[];
}

export interface IncidentRecord {
  id: string;
  incidentCode: string; // e.g. INC-2026-001 (Auto-incremented & editable)
  type: IncidentType; // 'Voyage' or 'Non voyage'
  title: string;
  category: IncidentCategory | string;
  description: string; // Detailed description of incident
  severity: IncidentSeverity;
  status: IncidentStatus;
  reportedDate: string; // YYYY-MM-DD
  reportedTime: string; // HH:mm
  reporterType?: 'Staff' | 'Non-staff'; // Staff member vs Non-staff external reporter
  reportedBy: string; // Reporter Name
  reporterPhone?: string; // Phone number of reporter
  reporterRole: string; // e.g. Chief Officer, Safety Superintendent, Terminal Supervisor, Port Agent
  reporterEmail?: string;
  reporterAvatar?: string;
  immediateActionsTaken?: string;
  rootCause?: string;
  correctiveMeasures?: string;

  // Voyage-Specific Fields (when type === 'Voyage'):
  voyageNumber?: string;
  vesselId?: string;
  vesselName?: string;
  waterBody?: string;
  departurePort?: string;
  arrivalPort?: string;
  locationCoordinates?: string;
  seaCondition?: string;

  // Non-Voyage-Specific Fields (when type === 'Non voyage'):
  facilityLocation?: string; // e.g. Terminal Quay 4, Shore Workshop Bay B, Logistics Warehouse #2
  department?: string; // e.g. Port Terminal Operations, Shore Maintenance, Safety & Compliance
  equipmentInvolved?: string; // e.g. Quayside Gantry Crane #2, Reach Stacker RS-04, Bunkering Manifold

  injuriesCount: number;
  pollutionInvolved: boolean;
  estimatedCostUSD?: string;
  attachmentsCount?: number;
  attachmentsList?: string[];
  messages?: IncidentMessage[];
  lastUpdated?: string;
  createdAt?: string;
}

// ----------------------------------------------------
// Manifest Domain Interfaces (Passengers & Cargo)
// ----------------------------------------------------
export interface PassengerManifestRecord {
  id: string;
  bookingRef: string;
  ticketNumber: string;
  voyageNumber: string;
  voyageId?: string;
  vesselName: string;
  vesselId?: string;
  fullName: string;
  gender: 'Male' | 'Female' | 'Other';
  ageCategory: 'Adult' | 'Child' | 'Infant' | 'Senior';
  nationality: string;
  nationalityCode: string;
  idType?: string;
  idPassportNumber: string;
  cabinDeck?: string;
  departurePort: string;
  arrivalPort: string;
  baggageCount: number;
  baggageWeightKg: number;
  vehiclePlate?: string;
  vehicleType?: string;
  isDriver?: boolean;
  driverVehiclePlate?: string;
  driverVehicleType?: 'Bus' | 'Wagon' | 'Lorry' | 'Pickup / Van' | 'Saloon Car / SUV' | string;
  isSelfCheckIn?: boolean;
  checkInChannel?: 'SMS' | 'USSD' | 'Counter' | 'Web Terminal' | 'Mobile App';
  checkInType?: 'self' | 'other';
  assistedBy?: string;
  assistedByName?: string;
  assistedByPhone?: string;
  assistedByLookupMethod?: 'id_number' | 'phone_number';
  linkedCargoConsignmentId?: string;
  status: 'Booked' | 'Boarded / Embarked' | 'In Transit' | 'Disembarked' | 'No Show';
  contactPhone: string;
  contactEmail?: string;
  emergencyContact: string;
  specialAssistance?: string;
  checkInTime?: string;
  createdAt?: string;
}

export interface CargoManifestRecord {
  id: string;
  billOfLadingNumber: string;
  containerOrConsignmentId: string;
  voyageNumber: string;
  voyageId?: string;
  vesselName: string;
  vesselId?: string;
  cargoDescription: string;
  cargoCategory:
    | 'Containerized (FCL/LCL)'
    | 'Dry Bulk'
    | 'Liquid Bulk'
    | 'Breakbulk Heavy Lift'
    | 'RoRo Vehicles & Rolling Stock'
    | 'Refrigerated Reefer';
  hazardClass:
    | 'Non-Hazardous'
    | 'IMDG Class 1 (Explosives)'
    | 'IMDG Class 2 (Gases)'
    | 'IMDG Class 3 (Flammable Liquid)'
    | 'IMDG Class 4 (Flammable Solids)'
    | 'IMDG Class 5 (Oxidizers)'
    | 'IMDG Class 6 (Toxics)'
    | 'IMDG Class 7 (Radioactive)'
    | 'IMDG Class 8 (Corrosive)'
    | 'IMDG Class 9 (Miscellaneous)';
  unNumber?: string;
  grossWeightMT: number;
  netWeightMT: number;
  teuUnits: number;
  packageCount: number;
  packageType: string;
  shipperName: string;
  shipperOrigin: string;
  consigneeName: string;
  consigneeDestination: string;
  loadingPort: string;
  dischargePort: string;
  stowagePosition?: string;
  customsStatus:
    | 'Cleared & Released'
    | 'Under Customs Inspection'
    | 'In Bond / Transit'
    | 'Customs Hold / Quarantine';
  customsDeclarationRef?: string;
  temperatureSetpointC?: number;
  status: 'Loaded & Manifested' | 'In Transit' | 'Discharged' | 'Pending Gate-In';
  driverPassengerId?: string;
  driverPassengerName?: string;
  driverPhone?: string;
  driverVehiclePlate?: string;
  driverVehicleType?: string;
  isPassengerAccompanyingVehicle?: boolean;
  createdAt?: string;
}

// ----------------------------------------------------
// System Settings Interfaces (Notifications, SMTP, SMS API)
// ----------------------------------------------------
export interface SystemNotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  webhookEnabled: boolean;
  inAppToastsEnabled: boolean;
  events: {
    voyageDeparture: boolean;
    voyageLanding: boolean;
    captainSetOffAlert: boolean;
    criticalIncidents: boolean;
    maintenanceDueAlerts: boolean;
    stcwMedicalCertExpiry: boolean;
    portCongestionAlerts: boolean;
    dailyFleetDigest: boolean;
  };
  emergencyRecipients: string[];
  digestSchedule: '08:00 UTC' | '12:00 UTC' | '18:00 UTC';
  customWebhookUrl?: string;
}

export interface SmtpConnectionConfig {
  host: string;
  port: number;
  encryption: 'TLS' | 'SSL' | 'STARTTLS' | 'None';
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
  replyTo: string;
  timeoutSeconds: number;
  status: 'Connected' | 'Error' | 'Untested';
  lastTestedAt?: string;
}

export interface SmsApiConnectionConfig {
  provider: 'Twilio' | 'Infobip' | 'AWS SNS' | 'Vonage (Nexmo)' | 'Sinch' | 'Generic Webhook';
  accountSidOrApiKey: string;
  authTokenOrSecret: string;
  senderId: string;
  defaultCountryCode: string;
  webhookCallbackUrl: string;
  status: 'Active & Verified' | 'Authentication Error' | 'Low Balance' | 'Untested';
  smsCreditsRemaining: number;
  accountBalanceUSD: number;
  lastTestedAt?: string;
}

// ----------------------------------------------------
// Lookups & Dynamic Dropdown Configuration Interfaces
// ----------------------------------------------------
export interface LookupCategory {
  id: string;
  name: string;
  code: string;
  module:
    | 'Manifest & Cargo'
    | 'Vessels & Fleet'
    | 'Voyages & Ports'
    | 'Crew & Staff'
    | 'Safety & Incidents'
    | 'SaaS & Users'
    | 'General & System';
  description: string;
  itemCount?: number;
}

export interface LookupItem {
  id: string;
  category: string; // matches LookupCategory.code, e.g. 'passenger_status', 'cargo_category', 'vessel_type'
  categoryCode?: string; // alias for category
  categoryName?: string;
  code: string; // unique value code
  label: string; // display name
  description?: string;
  color?: string; // badge color e.g. 'blue', 'emerald', 'rose', 'amber', 'purple', 'indigo', 'gray'
  sortOrder: number;
  isActive: boolean;
  status?: 'Active' | 'Inactive'; // alias for isActive
  isSystemDefault: boolean;
  createdAt?: string;
}

// ----------------------------------------------------
// Chat & Messages Interfaces
// ----------------------------------------------------
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  texts?: string[]; // for consecutive bubbles like in the screenshot
  imageUrl?: string;
  imageCaption?: string;
  timestamp: string; // e.g. "Lindsey, 2 hours ago" or "2 hours ago"
  isOutgoing: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  isOnline: boolean;
  lastActiveTime: string; // e.g. "15 mins", "30 mins", "45 mins", "2 days"
  unreadCount?: number;
  messages: ChatMessage[];
  phoneNumber?: string;
  email?: string;
}

// ----------------------------------------------------
// Support Tickets & Ticket Details Interfaces
// ----------------------------------------------------
export type TicketStatus = 'Solved' | 'Pending' | 'In-Progress' | 'On-Hold';
export type TicketCategory = 'General Support' | 'Billing' | 'Technical' | 'Feature Request' | 'Account Access';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderEmail?: string;
  senderRole?: string;
  senderAvatar?: string;
  timestamp: string;
  isSupportAgent?: boolean;
  content: string[];
}

export interface SupportTicketItem {
  id: string; // e.g. '#323534'
  requestedBy: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  createDate: string;
  status: TicketStatus;
  category: TicketCategory;
  lastUpdated?: string;
  messages: TicketMessage[];
}

export interface EmailAttachment {
  id: string;
  name: string;
  size?: string;
  type: 'pdf' | 'media' | 'doc' | 'image' | 'zip';
  downloadLabel?: string;
  url?: string;
}

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash' | 'archive';
export type EmailFilterType = 'starred' | 'important';
export type EmailLabelType = 'Personal' | 'Work' | 'Payments' | 'Invoices' | 'Blank';

export interface EmailItem {
  id: string;
  sender: string;
  senderEmail: string;
  senderAvatar?: string;
  recipient?: string;
  recipientEmail?: string;
  subject: string;
  snippet: string;
  body: string[];
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folder: EmailFolder;
  badge?: {
    text: string;
    variant: 'important' | 'social' | 'promotional' | 'work' | 'personal';
  };
  label?: EmailLabelType;
  attachments?: EmailAttachment[];
}



