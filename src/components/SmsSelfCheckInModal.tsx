import React, { useState, useEffect, useRef } from 'react';
import {
  PassengerManifestRecord,
  CargoManifestRecord,
  VoyageRecord,
  Vessel,
  LookupItem,
} from '../types';
import {
  MessageSquare,
  Send,
  Smartphone,
  CheckCircle2,
  Car,
  Users,
  Package,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
  Truck,
  Bus,
  Search,
  UserCheck,
  UserPlus,
  Info,
  Check,
  X,
  Phone,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface SmsSelfCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  passengersList: PassengerManifestRecord[];
  voyagesList: VoyageRecord[];
  vesselsList?: Vessel[];
  lookupItems?: LookupItem[];
  onAddPassenger: (passenger: PassengerManifestRecord) => void;
  onAddCargo?: (cargo: CargoManifestRecord) => void;
  onShowToast?: (msg: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  time: string;
  options?: { label: string; value: string; icon?: React.ReactNode }[];
}

type CheckInStep =
  | 'INIT_VESSEL'
  | 'CHOOSE_SELF_OR_OTHER'
  | 'OTHER_SELECT_METHOD'
  | 'OTHER_ENTER_ID_OR_PHONE'
  | 'OTHER_ENTER_NAME'
  | 'ASK_IS_DRIVER'
  | 'ENTER_VEHICLE_PLATE'
  | 'SELECT_VEHICLE_TYPE'
  | 'COMPLETED';

export const SmsSelfCheckInModal: React.FC<SmsSelfCheckInModalProps> = ({
  isOpen,
  onClose,
  passengersList = [],
  voyagesList = [],
  vesselsList = [],
  lookupItems = [],
  onAddPassenger,
  onAddCargo,
  onShowToast,
}) => {
  // Preset sender profiles
  const senderPresets = [
    { name: 'Ronald Mugisha', phone: '+256 772 890123', idNumber: 'NIN-UG-77289012', nationality: 'Uganda', code: 'UG' },
    { name: 'Amina Nakato', phone: '+256 752 443322', idNumber: 'NIN-UG-91823719', nationality: 'Uganda', code: 'UG' },
    { name: 'David Okello', phone: '+256 782 119988', idNumber: 'NIN-UG-66231099', nationality: 'Uganda', code: 'UG' },
    { name: 'Erik Lindholm', phone: '+46 70 812 3456', idNumber: 'PAS-SE-882109', nationality: 'Sweden', code: 'SE' },
  ];

  const [senderName, setSenderName] = useState('Ronald Mugisha');
  const [senderPhone, setSenderPhone] = useState('+256 772 890123');
  const [senderIdNumber, setSenderIdNumber] = useState('NIN-UG-77289012');
  const [senderNationality, setSenderNationality] = useState('Uganda');
  const [senderNationalityCode, setSenderNationalityCode] = useState('UG');

  // Active step in dialog state machine
  const [currentStep, setCurrentStep] = useState<CheckInStep>('INIT_VESSEL');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check-In Working State
  const [selectedVoyage, setSelectedVoyage] = useState<VoyageRecord | null>(null);
  const [travelerType, setTravelerType] = useState<'self' | 'other'>('self');
  const [lookupMethod, setLookupMethod] = useState<'id_number' | 'phone_number'>('id_number');
  
  // Traveler details
  const [travelerName, setTravelerName] = useState('');
  const [travelerPhone, setTravelerPhone] = useState('');
  const [travelerIdNumber, setTravelerIdNumber] = useState('');
  const [travelerIdType, setTravelerIdType] = useState('National Identity Card');
  const [travelerNationality, setTravelerNationality] = useState('Uganda');
  const [travelerNationalityCode, setTravelerNationalityCode] = useState('UG');
  const [travelerGender, setTravelerGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [travelerAgeCategory, setTravelerAgeCategory] = useState<'Adult' | 'Child' | 'Infant' | 'Senior'>('Adult');

  // Driver & Vehicle State
  const [isDriver, setIsDriver] = useState(false);
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleType, setVehicleType] = useState<'Bus' | 'Wagon' | 'Lorry' | 'Pickup / Van' | 'Saloon Car / SUV'>('Bus');

  // Created Records preview
  const [createdPassenger, setCreatedPassenger] = useState<PassengerManifestRecord | null>(null);
  const [createdCargo, setCreatedCargo] = useState<CargoManifestRecord | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Available vessels from voyage list
  const activeVoyages = voyagesList.length > 0 ? voyagesList : [
    {
      id: 'VOY-101',
      voyageNumber: 'VY-9045',
      vesselName: 'VOYAGER TITAN',
      vesselId: 'VSL-001',
      departurePort: 'Port of Singapore (PSA)',
      arrivalPort: 'Port of Rotterdam',
      departureTime: '2026-08-28 08:00',
      arrivalTime: '2026-09-02 18:00',
      status: 'Scheduled',
    } as VoyageRecord,
  ];

  // Initialize SMS Gateway Chat
  const initChat = () => {
    setCurrentStep('INIT_VESSEL');
    setSelectedVoyage(null);
    setTravelerType('self');
    setTravelerName('');
    setTravelerPhone('');
    setTravelerIdNumber('');
    setIsDriver(false);
    setVehiclePlate('');
    setVehicleType('Bus');
    setCreatedPassenger(null);
    setCreatedCargo(null);
    setUserInput('');

    const initialOptions = activeVoyages.slice(0, 4).map((v) => ({
      label: `${v.vesselName.replace('VOYAGER ', '').replace('PACIFIC ', '').replace('BALTIC ', '')} (${v.voyageNumber})`,
      value: v.vesselName.split(' ')[0],
    }));

    setMessages([
      {
        id: 'msg-0',
        sender: 'system',
        text: `📱 MARITIME EXPRESS SMS SELF CHECK-IN GATEWAY (SHORTCODE: 8199)\n\nWelcome! To begin passenger self check-in, please text your Vessel Name or Voyage Number (e.g. TITAN, HORIZON, or ${activeVoyages[0]?.voyageNumber || 'VY-9045'}).`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        options: initialOptions,
      },
    ]);
  };

  useEffect(() => {
    if (isOpen) {
      initChat();
    }
  }, [isOpen]);

  const addMessage = (sender: 'user' | 'system', text: string, options?: ChatMessage['options']) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      options,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  // Switch Sender Profile
  const handleSelectPreset = (preset: typeof senderPresets[0]) => {
    setSenderName(preset.name);
    setSenderPhone(preset.phone);
    setSenderIdNumber(preset.idNumber);
    setSenderNationality(preset.nationality);
    setSenderNationalityCode(preset.code);
    if (onShowToast) {
      onShowToast(`Switched active SIM sender to ${preset.name} (${preset.phone})`);
    }
  };

  // Helper to lookup passenger by ID or Phone
  const findExistingPassenger = (query: string, by: 'id' | 'phone') => {
    const clean = query.trim().toLowerCase();
    if (!clean) return null;
    return passengersList.find((p) => {
      if (by === 'id') {
        return p.idPassportNumber?.toLowerCase() === clean;
      } else {
        return p.contactPhone?.replace(/\s+/g, '').includes(clean.replace(/\s+/g, ''));
      }
    });
  };

  // Step Machine Logic Handler
  const handleUserReply = (replyText: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    // Echo user message
    addMessage('user', trimmed);
    setUserInput('');

    setTimeout(() => {
      processStepResponse(trimmed);
    }, 400);
  };

  const processStepResponse = (reply: string) => {
    const upperReply = reply.toUpperCase();

    // ----------------------------------------------------
    // STEP 1: Process Vessel ID / Voyage Number
    // ----------------------------------------------------
    if (currentStep === 'INIT_VESSEL') {
      // Find matching voyage or vessel
      const matchedVoyage =
        activeVoyages.find(
          (v) =>
            v.vesselName.toUpperCase().includes(upperReply) ||
            v.voyageNumber.toUpperCase().includes(upperReply) ||
            v.vesselId?.toUpperCase().includes(upperReply)
        ) || activeVoyages[0];

      setSelectedVoyage(matchedVoyage);
      setCurrentStep('CHOOSE_SELF_OR_OTHER');

      addMessage(
        'system',
        `🚢 Found scheduled voyage: ${matchedVoyage.vesselName} (${matchedVoyage.voyageNumber})\nRoute: ${matchedVoyage.departurePort.split(' (')[0]} → ${matchedVoyage.arrivalPort.split(' (')[0]}\n\nWho is travelling today?\nReply:\n1. For Self (${senderName})\n2. For Other (Someone Else)`,
        [
          { label: `1. For Self (${senderName})`, value: '1' },
          { label: '2. For Other (Someone Else)', value: '2' },
        ]
      );
      return;
    }

    // ----------------------------------------------------
    // STEP 2: Process Self vs Other
    // ----------------------------------------------------
    if (currentStep === 'CHOOSE_SELF_OR_OTHER') {
      if (reply === '1' || upperReply.includes('SELF') || upperReply.includes('ME')) {
        // FOR SELF
        setTravelerType('self');
        setTravelerName(senderName);
        setTravelerPhone(senderPhone);
        setTravelerIdNumber(senderIdNumber);
        setTravelerNationality(senderNationality);
        setTravelerNationalityCode(senderNationalityCode);
        setTravelerIdType('National Identity Card');

        setCurrentStep('ASK_IS_DRIVER');
        addMessage(
          'system',
          `✅ Self Check-In confirmed for ${senderName} (${senderPhone}).\n\nAre you travelling as a DRIVER with a vehicle onto the vessel Ro-Pax vehicle deck?\n\nReply:\n1. Yes (Driver with Vehicle)\n2. No (Foot Passenger)`,
          [
            { label: '1. Yes (Driver with Vehicle)', value: '1', icon: <Car className="h-3.5 w-3.5" /> },
            { label: '2. No (Foot Passenger)', value: '2', icon: <Users className="h-3.5 w-3.5" /> },
          ]
        );
      } else {
        // FOR OTHER
        setTravelerType('other');
        setCurrentStep('OTHER_SELECT_METHOD');
        addMessage(
          'system',
          `👥 Checking in on behalf of another passenger.\nHow would you like to identify the traveler?\n\nReply:\n1. By National ID / Passport Number\n2. By Mobile Phone Number`,
          [
            { label: '1. National ID / Passport', value: '1' },
            { label: '2. Mobile Phone Number', value: '2' },
          ]
        );
      }
      return;
    }

    // ----------------------------------------------------
    // STEP 3: Other - Select Lookup Method
    // ----------------------------------------------------
    if (currentStep === 'OTHER_SELECT_METHOD') {
      if (reply === '1' || upperReply.includes('ID') || upperReply.includes('PASSPORT')) {
        setLookupMethod('id_number');
        setCurrentStep('OTHER_ENTER_ID_OR_PHONE');
        
        // Find sample IDs in system
        const sampleIds = passengersList.slice(0, 3).map((p) => ({
          label: `${p.fullName} (${p.idPassportNumber})`,
          value: p.idPassportNumber,
        }));

        addMessage(
          'system',
          `Please enter the traveler's National ID or Passport Number (e.g. NIN-CM-91823719 or PAS-ES-339102):`,
          sampleIds.length > 0 ? sampleIds : undefined
        );
      } else {
        setLookupMethod('phone_number');
        setCurrentStep('OTHER_ENTER_ID_OR_PHONE');

        const samplePhones = passengersList
          .filter((p) => p.contactPhone)
          .slice(0, 3)
          .map((p) => ({
            label: `${p.fullName} (${p.contactPhone})`,
            value: p.contactPhone,
          }));

        addMessage(
          'system',
          `Please enter the traveler's Mobile Phone Number (e.g. +256 701 554433):`,
          samplePhones.length > 0 ? samplePhones : undefined
        );
      }
      return;
    }

    // ----------------------------------------------------
    // STEP 4: Other - Enter ID / Phone & Query Directory
    // ----------------------------------------------------
    if (currentStep === 'OTHER_ENTER_ID_OR_PHONE') {
      if (lookupMethod === 'id_number') {
        const found = findExistingPassenger(reply, 'id');
        setTravelerIdNumber(reply);
        if (found) {
          setTravelerName(found.fullName);
          setTravelerPhone(found.contactPhone || '+256 700 000000');
          setTravelerNationality(found.nationality || 'Uganda');
          setTravelerNationalityCode(found.nationalityCode || 'UG');
          setTravelerGender(found.gender || 'Male');
          setTravelerAgeCategory(found.ageCategory || 'Adult');
          setTravelerIdType(found.idType || 'National Identity Card');

          setCurrentStep('ASK_IS_DRIVER');
          addMessage(
            'system',
            `✅ Found Traveler: ${found.fullName} (${found.nationality}, ${found.contactPhone || 'No Phone'})\nMetadata Attached: Assisted by ${senderName} (${senderPhone})\n\nIs ${found.fullName} travelling as a DRIVER with a vehicle onto the Ro-Pax deck?\n\nReply:\n1. Yes (Driver with Vehicle)\n2. No (Foot Passenger)`,
            [
              { label: '1. Yes (Driver with Vehicle)', value: '1', icon: <Car className="h-3.5 w-3.5" /> },
              { label: '2. No (Foot Passenger)', value: '2', icon: <Users className="h-3.5 w-3.5" /> },
            ]
          );
        } else {
          // New traveler, ask for name
          setCurrentStep('OTHER_ENTER_NAME');
          addMessage(
            'system',
            `ID "${reply}" not found in past records. Please enter the traveler's Full Name:`
          );
        }
      } else {
        // Phone number lookup
        const found = findExistingPassenger(reply, 'phone');
        setTravelerPhone(reply);
        if (found) {
          setTravelerName(found.fullName);
          setTravelerIdNumber(found.idPassportNumber);
          setTravelerNationality(found.nationality || 'Uganda');
          setTravelerNationalityCode(found.nationalityCode || 'UG');
          setTravelerGender(found.gender || 'Male');
          setTravelerAgeCategory(found.ageCategory || 'Adult');

          setCurrentStep('ASK_IS_DRIVER');
          addMessage(
            'system',
            `✅ Found Traveler: ${found.fullName} (${found.nationality}, ID: ${found.idPassportNumber})\nMetadata Attached: Assisted by ${senderName} (${senderPhone})\n\nIs ${found.fullName} travelling as a DRIVER with a vehicle onto the Ro-Pax deck?\n\nReply:\n1. Yes (Driver with Vehicle)\n2. No (Foot Passenger)`,
            [
              { label: '1. Yes (Driver with Vehicle)', value: '1', icon: <Car className="h-3.5 w-3.5" /> },
              { label: '2. No (Foot Passenger)', value: '2', icon: <Users className="h-3.5 w-3.5" /> },
            ]
          );
        } else {
          setCurrentStep('OTHER_ENTER_NAME');
          addMessage(
            'system',
            `Phone "${reply}" is new. Please enter the traveler's Full Name:`
          );
        }
      }
      return;
    }

    // ----------------------------------------------------
    // STEP 4B: Other - Enter Name (if new traveler)
    // ----------------------------------------------------
    if (currentStep === 'OTHER_ENTER_NAME') {
      const name = reply;
      setTravelerName(name);
      if (!travelerIdNumber) {
        setTravelerIdNumber(`NIN-UG-${Math.floor(10000000 + Math.random() * 90000000)}`);
      }
      if (!travelerPhone) {
        setTravelerPhone(`+256 70${Math.floor(1000000 + Math.random() * 9000000)}`);
      }

      setCurrentStep('ASK_IS_DRIVER');
      addMessage(
        'system',
        `✅ Registered traveler "${name}".\nMetadata Attached: Assisted by ${senderName} (${senderPhone})\n\nIs ${name} travelling as a DRIVER with a vehicle onto the vessel Ro-Pax deck?\n\nReply:\n1. Yes (Driver with Vehicle)\n2. No (Foot Passenger)`,
        [
          { label: '1. Yes (Driver with Vehicle)', value: '1', icon: <Car className="h-3.5 w-3.5" /> },
          { label: '2. No (Foot Passenger)', value: '2', icon: <Users className="h-3.5 w-3.5" /> },
        ]
      );
      return;
    }

    // ----------------------------------------------------
    // STEP 5: Ask if Driver
    // ----------------------------------------------------
    if (currentStep === 'ASK_IS_DRIVER') {
      if (reply === '1' || upperReply.includes('YES') || upperReply.includes('DRIVER')) {
        setIsDriver(true);
        setCurrentStep('ENTER_VEHICLE_PLATE');
        addMessage(
          'system',
          `🚗 Driver status confirmed.\nPlease enter the Vehicle Registration / License Plate Number (e.g. UBJ 452K or UBA 882X):`,
          [
            { label: 'UBJ 452K', value: 'UBJ 452K' },
            { label: 'UBA 882X', value: 'UBA 882X' },
            { label: 'KCF 910M', value: 'KCF 910M' },
          ]
        );
      } else {
        setIsDriver(false);
        setVehiclePlate('');
        finalizeCheckIn(false, '', 'Saloon Car / SUV');
      }
      return;
    }

    // ----------------------------------------------------
    // STEP 6: Enter Vehicle Number Plate
    // ----------------------------------------------------
    if (currentStep === 'ENTER_VEHICLE_PLATE') {
      const plate = reply.toUpperCase();
      setVehiclePlate(plate);
      setCurrentStep('SELECT_VEHICLE_TYPE');
      addMessage(
        'system',
        `Plate noted: ${plate}.\nPlease select the Vehicle Type as listed in the port Ro-Pax cargo system:\n\nReply:\n1. Bus\n2. Wagon\n3. Lorry\n4. Pickup / Van\n5. Saloon Car / SUV`,
        [
          { label: '1. Bus', value: 'Bus', icon: <Bus className="h-3.5 w-3.5 text-blue-500" /> },
          { label: '2. Wagon', value: 'Wagon', icon: <Car className="h-3.5 w-3.5 text-amber-500" /> },
          { label: '3. Lorry', value: 'Lorry', icon: <Truck className="h-3.5 w-3.5 text-purple-500" /> },
          { label: '4. Pickup / Van', value: 'Pickup / Van' },
          { label: '5. Saloon Car / SUV', value: 'Saloon Car / SUV' },
        ]
      );
      return;
    }

    // ----------------------------------------------------
    // STEP 7: Select Vehicle Type & Finalize Check-In
    // ----------------------------------------------------
    if (currentStep === 'SELECT_VEHICLE_TYPE') {
      let selectedType: 'Bus' | 'Wagon' | 'Lorry' | 'Pickup / Van' | 'Saloon Car / SUV' = 'Bus';
      if (reply === '1' || upperReply.includes('BUS')) selectedType = 'Bus';
      else if (reply === '2' || upperReply.includes('WAGON')) selectedType = 'Wagon';
      else if (reply === '3' || upperReply.includes('LORRY')) selectedType = 'Lorry';
      else if (reply === '4' || upperReply.includes('PICKUP') || upperReply.includes('VAN')) selectedType = 'Pickup / Van';
      else if (reply === '5' || upperReply.includes('CAR') || upperReply.includes('SUV') || upperReply.includes('SALOON')) selectedType = 'Saloon Car / SUV';
      else selectedType = 'Bus';

      setVehicleType(selectedType);
      finalizeCheckIn(true, vehiclePlate, selectedType);
      return;
    }
  };

  // Finalize Check-In: Build Passenger & Cargo Records
  const finalizeCheckIn = (
    withVehicle: boolean,
    plateNum: string,
    vType: string
  ) => {
    setCurrentStep('COMPLETED');

    const voyage = selectedVoyage || activeVoyages[0];
    const ticketNo = `TKT-${Math.floor(900000 + Math.random() * 99999)}`;
    const bookingRef = `BKG-SMS-${Date.now().toString().slice(-5)}`;
    const finalPassengerName = travelerName || senderName;
    const finalPassengerPhone = travelerPhone || senderPhone;
    const finalPassengerId = travelerIdNumber || senderIdNumber;
    const isProxy = travelerType === 'other';

    // Generate unique consignment ID for vehicle if applicable
    const vehicleConsignmentId = withVehicle
      ? `BL-ROPAX-${plateNum.replace(/\s+/g, '') || Math.floor(1000 + Math.random() * 9000)}`
      : undefined;

    // 1. Create Passenger Manifest Record
    const newPassenger: PassengerManifestRecord = {
      id: `PAS-SMS-${Date.now().toString().slice(-5)}`,
      bookingRef,
      ticketNumber: ticketNo,
      voyageNumber: voyage.voyageNumber,
      voyageId: voyage.id,
      vesselName: voyage.vesselName,
      fullName: finalPassengerName,
      gender: travelerGender,
      ageCategory: travelerAgeCategory,
      nationality: travelerNationality,
      nationalityCode: travelerNationalityCode,
      idType: travelerIdType,
      idPassportNumber: finalPassengerId,
      cabinDeck: 'Deck 2 Seating / Row B',
      departurePort: voyage.departurePort,
      arrivalPort: voyage.arrivalPort,
      baggageCount: 1,
      baggageWeightKg: withVehicle ? 30.0 : 15.0,
      vehiclePlate: withVehicle ? plateNum : undefined,
      vehicleType: withVehicle ? vType : undefined,
      isDriver: withVehicle,
      driverVehiclePlate: withVehicle ? plateNum : undefined,
      driverVehicleType: withVehicle ? vType : undefined,
      isSelfCheckIn: true,
      checkInChannel: 'SMS',
      checkInType: isProxy ? 'other' : 'self',
      assistedBy: isProxy ? `Assisted by ${senderName} (${senderPhone})` : undefined,
      assistedByName: isProxy ? senderName : undefined,
      assistedByPhone: isProxy ? senderPhone : undefined,
      assistedByLookupMethod: isProxy ? lookupMethod : undefined,
      linkedCargoConsignmentId: vehicleConsignmentId,
      status: 'Boarded / Embarked',
      contactPhone: finalPassengerPhone,
      emergencyContact: isProxy ? `${senderName} (${senderPhone})` : 'Port Agent Safety Desk',
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 2. Create Cargo Manifest Record for the vehicle if driver
    let newCargoRecord: CargoManifestRecord | null = null;
    if (withVehicle && plateNum) {
      // Calculate realistic weights for Bus / Wagon / Lorry
      let grossWeight = 3.5;
      let netWeight = 3.0;
      if (vType === 'Bus') {
        grossWeight = 8.5;
        netWeight = 7.8;
      } else if (vType === 'Wagon') {
        grossWeight = 5.2;
        netWeight = 4.8;
      } else if (vType === 'Lorry') {
        grossWeight = 12.5;
        netWeight = 11.2;
      } else if (vType === 'Pickup / Van') {
        grossWeight = 2.8;
        netWeight = 2.5;
      } else {
        grossWeight = 1.8;
        netWeight = 1.5;
      }

      newCargoRecord = {
        id: `CRG-ROPAX-${Date.now().toString().slice(-4)}`,
        billOfLadingNumber: vehicleConsignmentId || `BL-VEH-${plateNum}`,
        containerOrConsignmentId: plateNum,
        voyageNumber: voyage.voyageNumber,
        voyageId: voyage.id,
        vesselName: voyage.vesselName,
        cargoDescription: `Ro-Pax Accompanying Vehicle: ${vType} (Plate: ${plateNum}) | Driver: ${finalPassengerName}`,
        cargoCategory: 'RoRo Vehicles & Rolling Stock',
        hazardClass: 'Non-Hazardous',
        grossWeightMT: grossWeight,
        netWeightMT: netWeight,
        teuUnits: 1,
        packageCount: 1,
        packageType: vType,
        shipperName: `${finalPassengerName} (Driver)`,
        shipperOrigin: voyage.departurePort.split(' (')[0],
        consigneeName: `${finalPassengerName} (Driver)`,
        consigneeDestination: voyage.arrivalPort.split(' (')[0],
        loadingPort: voyage.departurePort,
        dischargePort: voyage.arrivalPort,
        stowagePosition: `Ro-Pax Lower Deck 1 (Bay V-0${Math.floor(1 + Math.random() * 8)})`,
        customsStatus: 'Cleared & Released',
        status: 'Loaded & Manifested',
        driverPassengerId: newPassenger.id,
        driverPassengerName: finalPassengerName,
        driverPhone: finalPassengerPhone,
        driverVehiclePlate: plateNum,
        driverVehicleType: vType,
        isPassengerAccompanyingVehicle: true,
        createdAt: new Date().toISOString().split('T')[0],
      };
    }

    // Save to App State
    onAddPassenger(newPassenger);
    setCreatedPassenger(newPassenger);

    if (newCargoRecord && onAddCargo) {
      onAddCargo(newCargoRecord);
      setCreatedCargo(newCargoRecord);
    }

    if (onShowToast) {
      onShowToast(
        `Self Check-In completed for ${finalPassengerName}! Passenger manifest & ${withVehicle ? 'cargo deck ' : ''}updated.`
      );
    }

    // Output Final SMS Confirmation text
    const vehicleLine = withVehicle
      ? `\n🚗 Vehicle: ${vType} [${plateNum}] (Ro-Pax Cargo Deck: Manifested Bay V-03)`
      : '';
    const assistedLine = isProxy
      ? `\nℹ️ Note: Assisted Entry by ${senderName} (${senderPhone})`
      : '';

    addMessage(
      'system',
      `🚢 PORT MARITIME EXPRESS CHECK-IN CONFIRMED!\n\n🎫 Ticket No: ${ticketNo}\n📑 Ref: ${bookingRef}\n👤 Passenger: ${finalPassengerName}\n🚢 Vessel: ${voyage.vesselName} (${voyage.voyageNumber})\n📍 Route: ${voyage.departurePort.split(' (')[0]} → ${voyage.arrivalPort.split(' (')[0]}\n💺 Deck: Deck 2 Seating / Row B${vehicleLine}${assistedLine}\n✅ Status: Boarded / Embarked (Self Check-In via SMS 8199)\n\nPlease present this confirmation SMS at the terminal boarding gantry. Have a safe journey!`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white dark:bg-[#1C2434] shadow-2xl border border-gray-100 dark:border-[#2E3A47] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#2E3A47] px-6 py-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-transparent dark:from-[#24303F] dark:to-[#1C2434]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#465FFF] text-white shadow-md shadow-blue-500/20">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  SMS / USSD Passenger Self Check-In Gateway
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Shortcode: 8199 Active
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Simulate text message self check-in, proxy support for other travelers, and Ro-Pax vehicle freight declaration.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={initChat}
              title="Reset Simulation"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#24303F] px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#2E3A47] transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-[#24303F] hover:text-gray-700 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Sender Profile Bar (SIM Configuration) */}
        <div className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/60 dark:bg-[#24303F]/40 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#465FFF]" />
              <span>Active Sender (SIM / Phone Owner):</span>
            </span>
            <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white bg-white dark:bg-[#1C2434] px-2.5 py-1 rounded-lg border border-gray-200 dark:border-[#2E3A47]">
              <span className="font-bold text-[#465FFF]">{senderName}</span>
              <span className="text-gray-400 font-mono">({senderPhone})</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-400">Quick SIM Presets:</span>
            {senderPresets.map((p) => (
              <button
                key={p.phone}
                onClick={() => handleSelectPreset(p)}
                className={`rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  senderPhone === p.phone
                    ? 'bg-[#465FFF] text-white'
                    : 'bg-white dark:bg-[#1C2434] border border-gray-200 dark:border-[#2E3A47] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#24303F]'
                }`}
              >
                {p.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Main Grid: Phone Mockup Chat on Left + Live Manifest Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left: Smartphone SMS Terminal */}
          <div className="lg:col-span-7 border-r border-gray-100 dark:border-[#2E3A47] flex flex-col bg-gray-50/30 dark:bg-[#18202F]/50 p-4 sm:p-6 overflow-hidden">
            {/* Phone Screen Mockup Container */}
            <div className="mx-auto w-full max-w-md flex-1 rounded-3xl border-4 border-gray-800 dark:border-gray-700 bg-white dark:bg-[#1C2434] shadow-xl flex flex-col overflow-hidden">
              {/* Phone Status Bar */}
              <div className="bg-gray-800 dark:bg-gray-900 px-4 py-2 text-white flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1">
                  <span className="font-semibold">09:41</span>
                  <span>•</span>
                  <span className="text-gray-300">MTN / Airtel 5G</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-blue-600/60 px-1.5 py-0.2 rounded">SIM 1</span>
                  <div className="h-2.5 w-4 rounded-xs border border-white/60 p-0.5">
                    <div className="h-full w-full bg-white rounded-2xs" />
                  </div>
                </div>
              </div>

              {/* SMS Header (Shortcode 8199) */}
              <div className="border-b border-gray-100 dark:border-[#2E3A47] bg-gray-50/80 dark:bg-[#24303F]/60 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#465FFF] text-white text-xs font-bold">
                    8199
                  </div>
                  <div>
                    <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>Maritime Shortcode 8199</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 fill-blue-500 text-white" />
                    </div>
                    <div className="text-[10px] text-gray-400">Verified Port Authority SMS Gateway</div>
                  </div>
                </div>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Online
                </span>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[300px] max-h-[440px]">
                <div className="text-center">
                  <span className="rounded-full bg-gray-100 dark:bg-[#24303F] px-2.5 py-1 text-[10px] text-gray-500 dark:text-gray-400">
                    Today • Shortcode 8199
                  </span>
                </div>

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#465FFF] text-white rounded-br-xs'
                          : 'bg-gray-100 dark:bg-[#24303F] text-gray-900 dark:text-gray-100 rounded-bl-xs border border-gray-200/60 dark:border-[#2E3A47]'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Quick Response Action Buttons inside SMS */}
                    {msg.options && msg.options.length > 0 && currentStep !== 'COMPLETED' && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[95%]">
                        {msg.options.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleUserReply(opt.value)}
                            className="flex items-center gap-1.5 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1.5 text-[11px] font-semibold text-[#465FFF] dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all shadow-2xs"
                          >
                            {opt.icon}
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="mt-1 text-[9px] text-gray-400 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* SMS Input Bar */}
              <div className="border-t border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] p-3">
                {currentStep === 'COMPLETED' ? (
                  <div className="flex items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs">
                    <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Check-In Recorded to Manifest!</span>
                    </span>
                    <button
                      onClick={initChat}
                      className="rounded-lg bg-[#465FFF] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#3b51e6]"
                    >
                      Start Next
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUserReply(userInput);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        currentStep === 'INIT_VESSEL'
                          ? 'Type Vessel ID (e.g. TITAN) or reply 1...'
                          : currentStep === 'ENTER_VEHICLE_PLATE'
                          ? 'Type vehicle plate (e.g. UBJ 452K)...'
                          : 'Type reply or click a button above...'
                      }
                      className="flex-1 rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F] px-3.5 py-2 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:border-[#465FFF] focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      disabled={!userInput.trim()}
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#465FFF] text-white disabled:opacity-40 hover:bg-[#3b51e6] transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Right: Live Manifest Inspector & Real-time Integration Preview */}
          <div className="lg:col-span-5 flex flex-col p-6 space-y-4 overflow-y-auto max-h-[580px]">
            <div>
              <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#465FFF]" />
                <span>Live Manifest Synchronization</span>
              </h4>
              <p className="text-xs text-gray-500 dark:text-[#8A99AD] mt-0.5">
                Real-time preview of records being dispatched directly into the Passenger Manifest and Cargo Deck registry.
              </p>
            </div>

            {/* Check-In Progress Flowcard */}
            <div className="rounded-2xl border border-gray-100 dark:border-[#2E3A47] bg-white dark:bg-[#24303F]/40 p-4 space-y-3 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Session Status</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    currentStep === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {currentStep === 'COMPLETED' ? '✓ Registered & Embarked' : `Step: ${currentStep}`}
                </span>
              </div>

              {/* Progress Steps Indicators */}
              <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center font-medium">
                <div
                  className={`rounded-lg p-1.5 border ${
                    selectedVoyage
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-[#1C2434] dark:border-[#2E3A47]'
                  }`}
                >
                  1. Vessel ID
                </div>
                <div
                  className={`rounded-lg p-1.5 border ${
                    travelerName || currentStep !== 'INIT_VESSEL'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-[#1C2434] dark:border-[#2E3A47]'
                  }`}
                >
                  2. Self / Other
                </div>
                <div
                  className={`rounded-lg p-1.5 border ${
                    currentStep === 'ENTER_VEHICLE_PLATE' || currentStep === 'SELECT_VEHICLE_TYPE' || currentStep === 'COMPLETED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-[#1C2434] dark:border-[#2E3A47]'
                  }`}
                >
                  3. Driver Check
                </div>
                <div
                  className={`rounded-lg p-1.5 border ${
                    currentStep === 'COMPLETED'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                      : 'bg-gray-50 border-gray-200 text-gray-400 dark:bg-[#1C2434] dark:border-[#2E3A47]'
                  }`}
                >
                  4. Embark
                </div>
              </div>
            </div>

            {/* Generated Passenger Card Preview */}
            <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-[#24303F] dark:to-[#1C2434] p-4.5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#465FFF] text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                      Passenger Manifest Entry
                    </h5>
                    <span className="text-[10px] text-gray-400">IMO FAL Form 6 Record</span>
                  </div>
                </div>
                {createdPassenger && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Manifested
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Passenger Name:</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {travelerName || (travelerType === 'self' ? senderName : 'Awaiting input...')}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Contact Phone:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {travelerPhone || (travelerType === 'self' ? senderPhone : '—')}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">ID / Passport:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {travelerIdNumber || (travelerType === 'self' ? senderIdNumber : '—')}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                  <span className="text-gray-500 dark:text-gray-400">Assigned Voyage:</span>
                  <span className="font-semibold text-[#465FFF] dark:text-[#80CAEE]">
                    {selectedVoyage ? `${selectedVoyage.vesselName} (${selectedVoyage.voyageNumber})` : '—'}
                  </span>
                </div>

                {/* PROXY METADATA BADGE IF CHECK-IN FOR OTHER */}
                {travelerType === 'other' && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-2.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Proxy Booking Metadata:</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-tight">
                      <strong>Assisted By:</strong> {senderName} ({senderPhone})
                    </p>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400">
                      Lookup Method: {lookupMethod === 'id_number' ? 'National ID / Passport Query' : 'Phone Number Query'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Cargo Ro-Pax Entry Card (If Driver) */}
            {isDriver && (
              <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/60 via-white to-pink-50/30 dark:from-[#24303F] dark:to-[#1C2434] p-4.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                        Cargo &amp; Ro-Pax Manifest Entry
                      </h5>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                        IMO FAL Form 2 • Rolling Stock
                      </span>
                    </div>
                  </div>
                  {createdCargo && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Dispatched to Cargo
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">Vehicle Type:</span>
                    <span className="font-bold text-purple-700 dark:text-purple-300">
                      {vehicleType || 'Bus'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">License Plate:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {vehiclePlate || 'Awaiting plate...'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-gray-100 dark:border-[#2E3A47] pb-1.5">
                    <span className="text-gray-500 dark:text-gray-400">Stowage Location:</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Ro-Pax Lower Deck 1 (Bay V-04)
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Linked Driver:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {travelerName || senderName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-gray-100 dark:border-[#2E3A47] bg-gray-50/70 dark:bg-[#24303F]/60 px-6 py-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Info className="h-4 w-4 text-[#465FFF]" />
            <span>
              Self check-in messages are processed securely via the Port Maritime Shortcode 8199 gateway API.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-[#2E3A47] bg-white dark:bg-[#1C2434] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#24303F] transition-colors"
            >
              Done &amp; Return to Manifest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
