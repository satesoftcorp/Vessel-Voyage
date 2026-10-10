import React, { useState } from 'react';
import { ugandaRiverSegments, RiverSegment } from '../data/ugandaMapRiversData';
import { ugandaMajorTowns, ugandaWaterBodies, UgandaMajorTown, UgandaWaterBody, UgandaMaritimePoint, UgandaFerryRoute } from '../data/ugandaWaterBodiesData';

interface UgandaHydrographicVectorMapProps {
  darkMode: boolean;
  selectedWaterBody?: UgandaWaterBody | null;
  selectedTown?: UgandaMajorTown | null;
  selectedRiver?: RiverSegment | null;
  selectedPoint?: UgandaMaritimePoint | null;
  selectedRoute?: UgandaFerryRoute | null;
  onSelectWaterBody?: (wb: UgandaWaterBody) => void;
  onSelectTown?: (town: UgandaMajorTown) => void;
  onSelectRiver?: (river: RiverSegment) => void;
  onSelectPoint?: (point: UgandaMaritimePoint) => void;
  showTowns?: boolean;
  showRivers?: boolean;
  showLakes?: boolean;
  showPorts?: boolean;
  showFerries?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  zoomLevel?: number;
  panOffset?: { x: number; y: number };
  systemPorts?: UgandaMaritimePoint[];
  systemFerryRoutes?: UgandaFerryRoute[];
}

export const UgandaHydrographicVectorMap: React.FC<UgandaHydrographicVectorMapProps> = ({
  darkMode,
  selectedWaterBody,
  selectedTown,
  selectedRiver,
  selectedPoint,
  selectedRoute,
  onSelectWaterBody,
  onSelectTown,
  onSelectRiver,
  onSelectPoint,
  showTowns = true,
  showRivers = true,
  showLakes = true,
  showPorts = true,
  showFerries = true,
  showGrid = true,
  showLabels = true,
  zoomLevel = 1,
  panOffset = { x: 0, y: 0 },
  systemPorts = [],
  systemFerryRoutes = [],
}) => {
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  // Modern cartographic styling for standalone vectorized Uganda
  const bgLand = darkMode ? '#1E293B' : '#FFFFFF';
  const borderUganda = darkMode ? '#38BDF8' : '#0284C7';
  const riverColor = darkMode ? '#38BDF8' : '#0284C7';
  const lakeFill = darkMode ? '#0369A1' : '#BAE6FD';
  const lakeStroke = darkMode ? '#38BDF8' : '#0284C7';
  const townText = darkMode ? '#F8FAFC' : '#0F172A';
  const gridLine = darkMode ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.1)';

  // High-Precision Traced Uganda National Border Path from Reference Outline
  const UGANDA_BORDER_PATH = `
    M 308 138
    C 318 116, 342 94, 372 90
    C 402 88, 424 104, 438 112
    C 446 118, 452 134, 458 138
    C 464 140, 474 126, 488 118
    C 502 108, 526 96, 552 92
    C 578 88, 604 90, 628 94
    C 648 98, 668 96, 682 92
    C 692 88, 706 76, 716 68
    C 724 64, 736 84, 746 92
    C 756 96, 776 94, 800 94
    C 818 94, 836 78, 852 62
    L 878 24
    L 884 44
    C 885 50, 882 56, 885 62
    C 888 66, 896 68, 896 76
    C 896 84, 890 88, 894 98
    C 900 104, 912 110, 916 122
    C 920 134, 912 146, 912 158
    C 910 172, 918 184, 924 200
    C 930 215, 940 234, 946 250
    C 950 262, 948 274, 956 288
    C 960 295, 958 304, 962 314
    C 966 326, 968 348, 968 368
    C 968 388, 960 408, 954 426
    C 948 442, 944 456, 945 470
    C 947 485, 956 498, 954 512
    C 952 522, 940 530, 934 538
    C 928 545, 932 555, 928 562
    C 922 572, 904 584, 892 594
    C 882 602, 878 614, 872 626
    C 866 638, 858 650, 850 662
    C 836 685, 818 710, 800 738
    L 768 760
    L 768 855
    L 265 855
    C 252 865, 240 880, 230 892
    C 220 904, 210 916, 198 928
    C 186 940, 172 950, 160 948
    C 150 945, 142 935, 134 928
    C 126 922, 118 930, 110 935
    C 102 938, 95 932, 95 922
    C 95 908, 100 890, 102 868
    C 104 848, 108 828, 112 812
    C 116 792, 115 770, 120 750
    C 126 726, 132 706, 138 688
    C 144 668, 150 648, 158 628
    C 166 608, 172 590, 175 574
    C 178 558, 188 548, 194 542
    C 202 534, 206 524, 210 518
    C 214 512, 222 508, 228 502
    C 234 494, 244 482, 260 460
    C 276 438, 296 414, 318 388
    C 338 362, 358 340, 378 316
    C 382 310, 378 302, 368 306
    C 356 310, 344 322, 334 334
    C 326 340, 318 335, 314 330
    C 308 322, 302 310, 302 300
    C 302 290, 308 275, 314 260
    C 320 245, 324 230, 322 214
    C 320 196, 314 182, 308 168
    C 302 154, 298 144, 308 138
    Z
  `;

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-transparent flex items-center justify-center touch-none">
      <svg
        viewBox="15 65 905 885"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-h-full object-contain transition-transform duration-75 cursor-grab active:cursor-grabbing will-change-transform"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          {/* Lake Victoria Gradient */}
          <linearGradient id="lakeVicGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={darkMode ? '#0284C7' : '#BAE6FD'} />
            <stop offset="100%" stopColor={darkMode ? '#0369A1' : '#7DD3FC'} />
          </linearGradient>

          {/* Clean elevation drop shadow for Uganda mainland */}
          <filter id="ugandaElevationGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="10"
              floodColor={darkMode ? '#000000' : '#0284c7'}
              floodOpacity={darkMode ? '0.45' : '0.12'}
            />
          </filter>

          {/* Graticule grid pattern */}
          <pattern id="gridPattern" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke={gridLine} strokeWidth="1" strokeDasharray="3 3" />
          </pattern>

          {/* High-Precision Vector Clip Path matching exact Uganda contours */}
          <clipPath id="ugandaClip">
            <path d={UGANDA_BORDER_PATH} />
          </clipPath>
        </defs>

        {/* 1. Uganda Exact Landmass Vector Polygon with High-Precision Borderline & Elevation Glow */}
        <g id="uganda-mainland" filter="url(#ugandaElevationGlow)">
          <path
            id="uganda-border-poly"
            d={UGANDA_BORDER_PATH}
            fill={bgLand}
            stroke={borderUganda}
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
        </g>

        {/* 2. Coordinate Graticule Grid clipped to Uganda (if enabled) */}
        {showGrid && (
          <g id="map-graticule" clipPath="url(#ugandaClip)">
            <rect x="0" y="0" width="1000" height="1000" fill="url(#gridPattern)" />
            {/* Longitude 30°0'0"E line */}
            <line x1="140" y1="0" x2="140" y2="1000" stroke={gridLine} strokeWidth="1.2" strokeDasharray="4 4" />
            {/* Longitude 32°0'0"E line */}
            <line x1="456" y1="0" x2="456" y2="1000" stroke={gridLine} strokeWidth="1.2" strokeDasharray="4 4" />
            {/* Longitude 34°0'0"E line */}
            <line x1="772" y1="0" x2="772" y2="1000" stroke={gridLine} strokeWidth="1.2" strokeDasharray="4 4" />
            {/* Equator 0°0'0" line */}
            <line x1="0" y1="710" x2="1000" y2="710" stroke={gridLine} strokeWidth="1.5" strokeDasharray="4 4" />
          </g>
        )}

        {/* 2b. Internal District Boundaries from Reference Map */}
        <g
          id="internal-district-boundaries"
          clipPath="url(#ugandaClip)"
          stroke={darkMode ? 'rgba(148, 163, 184, 0.45)' : 'rgba(100, 116, 139, 0.35)'}
          strokeWidth="0.85"
          strokeDasharray="2 3"
          fill="none"
        >
          {/* West Nile boundaries */}
          <path d="M 276 220 Q 310 230 350 230" />
          <path d="M 335 165 Q 330 200 350 230" />
          <path d="M 258 250 Q 290 270 340 280" />
          <path d="M 272 325 Q 310 320 350 330" />

          {/* Acholi & Lango boundaries */}
          <path d="M 452 165 Q 460 220 480 270" />
          <path d="M 510 175 Q 520 220 530 280" />
          <path d="M 605 140 Q 610 200 620 270" />
          <path d="M 480 270 Q 550 280 620 270" />
          <path d="M 480 270 Q 480 340 500 380" />
          <path d="M 530 280 Q 560 330 570 370" />
          <path d="M 620 270 Q 640 330 650 380" />

          {/* Karamoja boundaries */}
          <path d="M 700 115 Q 720 180 730 230" />
          <path d="M 788 135 Q 770 190 770 240" />
          <path d="M 730 230 Q 780 240 820 240" />
          <path d="M 730 230 Q 720 300 730 350" />
          <path d="M 730 350 Q 800 360 885 360" />
          <path d="M 730 350 Q 740 430 750 490" />
          <path d="M 750 490 Q 800 480 848 495" />

          {/* Teso & Eastern boundaries */}
          <path d="M 650 380 Q 700 400 730 430" />
          <path d="M 670 475 Q 710 470 750 490" />
          <path d="M 750 490 Q 760 550 780 600" />
          <path d="M 780 600 Q 820 590 848 590" />
          <path d="M 780 600 Q 770 650 768 700" />
          <path d="M 660 675 Q 710 650 768 640" />
          <path d="M 600 660 Q 640 610 670 560" />

          {/* Buganda & Central boundaries */}
          <path d="M 500 380 Q 480 440 470 500" />
          <path d="M 470 500 Q 520 520 560 540" />
          <path d="M 560 540 Q 580 600 600 660" />
          <path d="M 470 500 Q 440 560 420 610" />
          <path d="M 420 610 Q 480 620 530 630" />
          <path d="M 530 630 Q 540 680 530 690" />
          <path d="M 420 610 Q 400 680 410 740" />
          <path d="M 410 740 Q 450 750 480 760" />
          <path d="M 410 740 Q 380 790 390 855" />

          {/* Western, Bunyoro, Ankole & Kigezi boundaries */}
          <path d="M 335 350 Q 380 370 420 410" />
          <path d="M 420 410 Q 450 450 470 500" />
          <path d="M 295 385 Q 340 430 380 490" />
          <path d="M 380 490 Q 400 550 420 610" />
          <path d="M 195 510 Q 230 550 280 580" />
          <path d="M 280 580 Q 350 590 420 610" />
          <path d="M 280 580 Q 260 640 250 700" />
          <path d="M 130 580 Q 180 620 250 700" />
          <path d="M 80 690 Q 150 700 250 700" />
          <path d="M 250 700 Q 280 760 300 820" />
          <path d="M 300 820 Q 340 835 390 855" />
          <path d="M 300 820 Q 240 840 200 855" />
          <path d="M 200 855 Q 170 880 140 915" />
          <path d="M 36 765 Q 90 780 140 820" />
          <path d="M 140 820 Q 150 870 140 915" />
          <path d="M 140 820 Q 100 850 85 895" />
        </g>

        {/* 3. Central UGANDA National Title Watermark */}
        <text
          x="510"
          y="405"
          textAnchor="middle"
          fill={townText}
          fontSize="24"
          fontWeight="900"
          letterSpacing="4"
          opacity="0.85"
        >
          UGANDA
        </text>

        {/* 4. Detailed Lakes Layer */}
        {showLakes && (
          <g id="lakes-layer">
            {/* Lake Victoria (Uganda Portion + Extension with Islands & Bays) */}
            <path
              id="lake-victoria"
              d={`
                M 415 855
                L 415 765
                Q 425 750 445 745
                T 465 725
                Q 490 705 510 690
                T 530 660
                Q 545 650 565 655
                T 600 660
                Q 625 645 640 655
                T 665 675
                Q 685 680 705 690
                T 735 690
                Q 755 670 765 660
                L 768 700
                L 768 855
                L 415 855
                Z
              `}
              fill="url(#lakeVicGrad)"
              stroke={lakeStroke}
              strokeWidth="2"
              className="cursor-pointer hover:brightness-105 transition-all"
              onClick={() => onSelectWaterBody && onSelectWaterBody(ugandaWaterBodies[0])}
            />

            {/* Lake Victoria Islands (Ssese Archipelago, Buvuma, Sigulu) */}
            <g id="lake-victoria-islands">
              {/* Buggala / Kalangala Island */}
              <path
                d="M 480 760 C 495 750 520 755 515 775 C 510 790 485 795 475 780 Z"
                fill={bgLand}
                stroke={borderUganda}
                strokeWidth="1.2"
              />
              {/* Buvuma Island */}
              <path
                d="M 640 695 C 655 690 665 705 660 720 C 650 725 635 715 640 695 Z"
                fill={bgLand}
                stroke={borderUganda}
                strokeWidth="1.2"
              />
              {/* Sigulu Island */}
              <path
                d="M 715 725 C 725 720 735 725 730 735 C 725 740 715 735 715 725 Z"
                fill={bgLand}
                stroke={borderUganda}
                strokeWidth="1"
              />
              {/* Koome & Damba Islands */}
              <circle cx="560" cy="710" r="5" fill={bgLand} stroke={borderUganda} strokeWidth="1" />
              <circle cx="580" cy="715" r="4" fill={bgLand} stroke={borderUganda} strokeWidth="1" />
            </g>

            {/* Lake Albert (Rift Valley Lake) */}
            <path
              id="lake-albert"
              d={`
                M 348 375
                Q 330 400 310 435
                T 275 480
                Q 250 520 225 545
                L 205 540
                Q 230 500 260 450
                T 310 395
                Q 335 370 348 375
                Z
              `}
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="2"
              className="cursor-pointer hover:brightness-105"
            />

            {/* Lake Kyoga & Lake Kwania */}
            <path
              id="lake-kyoga"
              d={`
                M 490 475
                Q 515 460 540 450
                T 580 460
                Q 610 450 635 440
                T 665 445
                Q 685 455 695 465
                T 670 475
                Q 640 470 615 480
                T 580 495
                Q 550 490 520 495
                T 490 475
                Z
              `}
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.8"
              className="cursor-pointer hover:brightness-105"
            />

            {/* Lake Kyoga Branches / Arms */}
            <path
              d="M 540 450 Q 560 425 575 410 Q 585 415 570 435 Z"
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.2"
            />
            <path
              d="M 610 450 Q 625 430 645 425 Q 645 435 630 450 Z"
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.2"
            />

            {/* Lake Nakuwa (East of Lake Kyoga) */}
            <ellipse
              cx="675"
              cy="535"
              rx="18"
              ry="10"
              transform="rotate(-20 675 535)"
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.5"
            />

            {/* Lake Bisina (Lake Salisbury) & Lake Opeta */}
            <path
              id="lake-bisina"
              d="M 720 465 Q 745 460 765 470 Q 755 480 730 475 Z"
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.5"
            />

            {/* Lake Edward */}
            <path
              id="lake-edward"
              d="M 35 770 Q 60 750 85 750 T 115 765 Q 90 790 60 805 L 35 805 Z"
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.8"
            />

            {/* Lake George */}
            <ellipse cx="165" cy="710" rx="14" ry="10" fill={lakeFill} stroke={lakeStroke} strokeWidth="1.5" />

            {/* Kazinga Channel connecting Edward & George */}
            <path
              d="M 115 765 Q 140 735 155 715"
              fill="none"
              stroke={riverColor}
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Lake Wamala */}
            <ellipse cx="440" cy="645" rx="15" ry="9" fill={lakeFill} stroke={lakeStroke} strokeWidth="1.4" />

            {/* Lake Bunyonyi */}
            <path
              id="lake-bunyonyi"
              d="M 115 885 Q 130 895 140 880 Q 145 895 125 905 Z"
              fill={lakeFill}
              stroke={lakeStroke}
              strokeWidth="1.4"
            />

            {/* Lake Nabugabo */}
            <ellipse cx="445" cy="755" rx="8" ry="6" fill={lakeFill} stroke={lakeStroke} strokeWidth="1.2" />

            {/* Lake Kachera & Lake Kijanebalola (Koki Lakes) */}
            <path
              d="M 285 810 Q 300 812 315 805"
              fill="none"
              stroke={lakeStroke}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 265 825 Q 280 828 295 820"
              fill="none"
              stroke={lakeStroke}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 5. Complete Vector River Network */}
        {showRivers && (
          <g id="rivers-network">
            {ugandaRiverSegments.map((river) => {
              const isSelected = selectedRiver?.id === river.id;
              const isHovered = hoveredEntity === river.id;

              return (
                <g
                  key={river.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectRiver && onSelectRiver(river)}
                  onMouseEnter={() => setHoveredEntity(river.id)}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {/* Invisible expanded hit target for touch screens */}
                  <path
                    d={river.d}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Outer glow stroke for selection / hover */}
                  {(isSelected || isHovered) && (
                    <path
                      d={river.d}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth={(river.width || 1.2) + 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.8"
                    />
                  )}

                  {/* Main River Stroke */}
                  <path
                    d={river.d}
                    fill="none"
                    stroke={isSelected ? '#D97706' : riverColor}
                    strokeWidth={river.width || 1.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* River Label */}
                  {showLabels && river.labelPoint && (
                    <text
                      x={river.labelPoint.x}
                      y={river.labelPoint.y}
                      transform={`rotate(${river.labelAngle || 0} ${river.labelPoint.x} ${river.labelPoint.y})`}
                      textAnchor="middle"
                      fill={darkMode ? '#7DD3FC' : '#0284C7'}
                      fontSize="9.5"
                      fontStyle="italic"
                      fontFamily="sans-serif"
                      className="pointer-events-none drop-shadow-sm font-medium"
                    >
                      {river.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 6. Lake Names Labels */}
        {showLakes && showLabels && (
          <g id="lake-labels" className="font-sans font-semibold italic text-sky-700 pointer-events-none">
            <text x="560" y="820" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="16">
              Lake Victoria
            </text>
            <text x="280" y="455" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="13">
              Lake Albert
            </text>
            <text x="565" y="485" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="12">
              Lake Kyoga
            </text>
            <text x="675" y="525" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="10.5">
              Lake Nakuwa
            </text>
            <text x="735" y="468" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="11">
              Lake Bisina
            </text>
            <text x="55" y="760" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="11">
              Lake Edward
            </text>
            <text x="410" y="655" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="10.5">
              Lake Wamala
            </text>
            <text x="110" y="905" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="10">
              Lake Bunyonyi
            </text>
            <text x="430" y="760" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="10">
              Lake Nabugabo
            </text>
            <text x="270" y="795" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="9.5">
              Lake Kachera
            </text>
            <text x="275" y="825" textAnchor="middle" fill={darkMode ? '#BAE6FD' : '#0369A1'} fontSize="9.5">
              Lake Kijanebalola
            </text>
          </g>
        )}

        {/* 7. MoWT Active Ferry Crossing Routes (if enabled) */}
        {showFerries && (
          <g id="ferry-routes-layer">
            {systemFerryRoutes.map((route) => {
              const isSelected = selectedRoute?.id === route.id;
              return (
                <g key={route.id} className="cursor-pointer">
                  {/* Glowing line for active ferry route */}
                  <line
                    x1={route.svgFrom.x}
                    y1={route.svgFrom.y}
                    x2={route.svgTo.x}
                    y2={route.svgTo.y}
                    stroke={isSelected ? '#F59E0B' : '#EF4444'}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    strokeDasharray="4 3"
                    className="animate-pulse"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 8. Major Maritime Ports & Landing Sites (if enabled) */}
        {showPorts && (
          <g id="maritime-ports-layer">
            {systemPorts.map((pt) => {
              const isSelected = selectedPoint?.id === pt.id;
              return (
                <g
                  key={pt.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectPoint && onSelectPoint(pt)}
                >
                  {/* Invisible enlarged touch target */}
                  <circle cx={pt.svgCoords.x} cy={pt.svgCoords.y} r="14" fill="transparent" />
                  <circle
                    cx={pt.svgCoords.x}
                    cy={pt.svgCoords.y}
                    r={isSelected ? 6 : 4.5}
                    fill={isSelected ? '#EF4444' : '#2563EB'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    className="transition-transform group-hover:scale-125"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* 9. Major Towns Layer */}
        {showTowns && (
          <g id="major-towns-layer">
            {ugandaMajorTowns.map((town) => {
              const isSelected = selectedTown?.id === town.id;
              const isHovered = hoveredEntity === town.id;

              return (
                <g
                  key={town.id}
                  className="cursor-pointer group"
                  onClick={() => onSelectTown && onSelectTown(town)}
                  onMouseEnter={() => setHoveredEntity(town.id)}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {/* Invisible enlarged touch target */}
                  <circle cx={town.svgCoords.x} cy={town.svgCoords.y} r="14" fill="transparent" />

                  {/* Selected / Hover ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      cx={town.svgCoords.x}
                      cy={town.svgCoords.y}
                      r="7"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2"
                      className="animate-ping"
                    />
                  )}

                  {/* Town Marker Dot */}
                  <circle
                    cx={town.svgCoords.x}
                    cy={town.svgCoords.y}
                    r="3.5"
                    fill={isSelected ? '#2563EB' : townText}
                    stroke={bgLand}
                    strokeWidth="1"
                  />

                  {/* Town Name Label */}
                  {showLabels && (
                    <text
                      x={town.svgCoords.x + 5}
                      y={town.svgCoords.y - 4}
                      fill={isSelected ? '#2563EB' : townText}
                      fontSize="11.5"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                      className="transition-colors group-hover:fill-blue-600"
                    >
                      {town.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* 10. Cartographic Scale Bar (Upper Left) */}
        <g id="map-scale-bar" transform="translate(45, 110)">
          {/* km scale bar */}
          <line x1="0" y1="20" x2="160" y2="20" stroke={townText} strokeWidth="2" />
          <line x1="0" y1="14" x2="0" y2="26" stroke={townText} strokeWidth="2" />
          <line x1="80" y1="14" x2="80" y2="26" stroke={townText} strokeWidth="2" />
          <line x1="160" y1="14" x2="160" y2="26" stroke={townText} strokeWidth="2" />

          {/* Scale Labels */}
          <text x="0" y="8" textAnchor="middle" fill={townText} fontSize="10.5" fontWeight="600">
            0
          </text>
          <text x="80" y="8" textAnchor="middle" fill={townText} fontSize="10.5" fontWeight="600">
            75
          </text>
          <text x="160" y="8" textAnchor="middle" fill={townText} fontSize="10.5" fontWeight="600">
            150 km
          </text>
        </g>

        {/* 11. Compass / True North Arrow (Upper Right) */}
        <g id="compass-north-arrow" transform="translate(865, 130)">
          {/* Faceted North Arrow */}
          <polygon points="0,-32 8,0 0,-8 -8,0" fill={townText} />
          <polygon points="0,-32 0,-8 -8,0" fill={darkMode ? '#94A3B8' : '#64748B'} />
          <text x="0" y="14" textAnchor="middle" fill={townText} fontSize="13" fontWeight="bold">
            N
          </text>
        </g>

        {/* 12. Floating Vector Map Legend Box (Lower Left Corner) */}
        <g id="map-legend-box" transform="translate(45, 800)">
          <rect
            x="0"
            y="0"
            width="170"
            height="135"
            fill={darkMode ? '#0F172A' : '#FFFFFF'}
            stroke={borderUganda}
            strokeWidth="1.2"
            rx="8"
            opacity="0.95"
            filter="url(#ugandaElevationGlow)"
          />
          {/* Legend Title */}
          <text x="16" y="24" fill={townText} fontSize="14" fontWeight="bold" fontFamily="sans-serif">
            Map Legend
          </text>

          {/* Major Towns Entry */}
          <circle cx="24" cy="48" r="3.5" fill={townText} />
          <text x="42" y="52" fill={townText} fontSize="11.5" fontWeight="500">
            Major Towns (34)
          </text>

          {/* Major Rivers Entry */}
          <line x1="16" y1="76" x2="32" y2="76" stroke={riverColor} strokeWidth="2.5" />
          <text x="42" y="80" fill={townText} fontSize="11.5" fontWeight="500">
            River Networks
          </text>

          {/* Lakes Entry */}
          <rect x="16" y="98" width="16" height="16" fill={lakeFill} stroke={lakeStroke} strokeWidth="1" rx="2" />
          <text x="42" y="111" fill={townText} fontSize="11.5" fontWeight="500">
            Lakes & Waterways
          </text>
        </g>
      </svg>
    </div>
  );
};
