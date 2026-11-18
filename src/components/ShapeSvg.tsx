import React from 'react';
import { getShapeById } from '../data/christmasShapes';
import { ShapeId } from '../types/christmasGeometry';

interface ShapeSvgProps {
  shapeId: ShapeId;
  size?: number;
  className?: string;
  fillOverride?: string;
  strokeOverride?: string;
  rotationDeg?: number;
  showVertices?: boolean;
  showRightAngles?: boolean;
  showSymmetry?: boolean;
  ornamentMode?: boolean;
}

function getRegularPolygonPoints(
  sides: number,
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg = -90
): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((startAngleDeg + (360 / sides) * i) * Math.PI) / 180;
    pts.push([
      Number((cx + radius * Math.cos(angle)).toFixed(2)),
      Number((cy + radius * Math.sin(angle)).toFixed(2))
    ]);
  }
  return pts;
}

function getStarPoints(cx: number, cy: number, outerR: number, innerR: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = ((-90 + i * 36) * Math.PI) / 180;
    pts.push([
      Number((cx + r * Math.cos(angle)).toFixed(2)),
      Number((cy + r * Math.sin(angle)).toFixed(2))
    ]);
  }
  return pts;
}

function pointsToStr(pts: Array<[number, number]>): string {
  return pts.map(([x, y]) => `${x},${y}`).join(' ');
}

export const ShapeSvg: React.FC<ShapeSvgProps> = ({
  shapeId,
  size = 120,
  className = '',
  fillOverride,
  strokeOverride,
  rotationDeg = 0,
  showVertices = false,
  showRightAngles = false,
  showSymmetry = false,
  ornamentMode = true
}) => {
  const def = getShapeById(shapeId);
  const fill = fillOverride ?? def.fillHex;
  const stroke = strokeOverride ?? def.strokeHex;

  const cx = 80;
  const cy = 80;

  let polygonPts: Array<[number, number]> | null = null;
  let symmetryLines: Array<[number, number, number, number]> = [];
  let rightAngleBoxes: Array<{ x: number; y: number; dx: number; dy: number }> = [];

  if (shapeId === 'triangolo') {
    polygonPts = [
      [80, 22],
      [136, 126],
      [24, 126]
    ];
    symmetryLines = [[80, 14, 80, 138]];
  } else if (shapeId === 'quadrato') {
    polygonPts = [
      [34, 34],
      [126, 34],
      [126, 126],
      [34, 126]
    ];
    symmetryLines = [
      [80, 20, 80, 140],
      [20, 80, 140, 80],
      [24, 24, 136, 136],
      [136, 24, 24, 136]
    ];
    rightAngleBoxes = [
      { x: 34, y: 34, dx: 12, dy: 12 },
      { x: 126, y: 34, dx: -12, dy: 12 },
      { x: 126, y: 126, dx: -12, dy: -12 },
      { x: 34, y: 126, dx: 12, dy: -12 }
    ];
  } else if (shapeId === 'rettangolo') {
    polygonPts = [
      [22, 46],
      [138, 46],
      [138, 114],
      [22, 114]
    ];
    symmetryLines = [
      [80, 32, 80, 128],
      [12, 80, 148, 80]
    ];
    rightAngleBoxes = [
      { x: 22, y: 46, dx: 12, dy: 12 },
      { x: 138, y: 46, dx: -12, dy: 12 },
      { x: 138, y: 114, dx: -12, dy: -12 },
      { x: 22, y: 114, dx: 12, dy: -12 }
    ];
  } else if (shapeId === 'stella') {
    polygonPts = getStarPoints(80, 82, 56, 24);
    symmetryLines = [[80, 16, 80, 142]];
  } else if (shapeId === 'rombo') {
    polygonPts = [
      [80, 20],
      [130, 80],
      [80, 140],
      [30, 80]
    ];
    symmetryLines = [
      [80, 14, 80, 146],
      [20, 80, 140, 80]
    ];
  } else if (shapeId === 'trapezio') {
    polygonPts = [
      [48, 44],
      [112, 44],
      [138, 116],
      [22, 116]
    ];
    symmetryLines = [[80, 30, 80, 130]];
  } else if (shapeId === 'pentagono') {
    polygonPts = getRegularPolygonPoints(5, 80, 84, 54, -90);
    symmetryLines = [[80, 20, 80, 142]];
  } else if (shapeId === 'esagono') {
    polygonPts = getRegularPolygonPoints(6, 80, 80, 54, -90);
    symmetryLines = [
      [80, 18, 80, 142],
      [24, 80, 136, 80]
    ];
  } else if (shapeId === 'ottagono') {
    polygonPts = getRegularPolygonPoints(8, 80, 80, 54, -67.5);
    symmetryLines = [
      [80, 18, 80, 142],
      [18, 80, 142, 80]
    ];
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      aria-label={def.name}
      role="img"
    >
      <g transform={`rotate(${rotationDeg} 80 80)`}>
        {/* Hanger cap for hanging ornaments */}
        {ornamentMode &&
          (shapeId === 'cerchio' ||
            shapeId === 'sfera' ||
            shapeId === 'esagono' ||
            shapeId === 'rombo' ||
            shapeId === 'ottagono') && (
            <g>
              <rect
                x="70"
                y="13"
                width="20"
                height="9"
                rx="3"
                fill="#F59E0B"
                stroke="#92400E"
                strokeWidth="2.5"
              />
              <circle cx="80" cy="9" r="4.5" fill="none" stroke="#92400E" strokeWidth="2.5" />
            </g>
          )}

        {/* 2D Circle -> Christmas Bauble */}
        {shapeId === 'cerchio' && (
          <>
            <circle cx={cx} cy={cy} r={52} fill={fill} stroke={stroke} strokeWidth="4.5" />
            {ornamentMode && (
              <g opacity="0.9">
                <path
                  d="M 32 72 Q 56 88 80 72 Q 104 56 128 72"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 36 96 Q 80 114 124 96"
                  fill="none"
                  stroke="#FDE68A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="60" cy="54" r="4" fill="#FEF08A" />
                <circle cx="100" cy="54" r="4" fill="#FEF08A" />
                <circle cx="80" cy="108" r="4" fill="#FEF08A" />
              </g>
            )}
            {showSymmetry && (
              <>
                <line x1="80" y1="18" x2="80" y2="142" stroke="#0F172A" strokeWidth="2.5" strokeDasharray="5 4" />
                <line x1="18" y1="80" x2="142" y2="80" stroke="#0F172A" strokeWidth="2.5" strokeDasharray="5 4" />
              </>
            )}
          </>
        )}

        {/* 2D Polygons + tailored Christmas decorations */}
        {polygonPts && (
          <>
            <polygon
              points={pointsToStr(polygonPts)}
              fill={fill}
              stroke={stroke}
              strokeWidth="4.5"
              strokeLinejoin="round"
            />

            {/* Quadrato & Rettangolo -> Gift Wrap Ribbon & Top Bow */}
            {ornamentMode && (shapeId === 'quadrato' || shapeId === 'rettangolo') && (
              <g>
                <line
                  x1="80"
                  y1={shapeId === 'quadrato' ? 36 : 48}
                  x2="80"
                  y2={shapeId === 'quadrato' ? 124 : 112}
                  stroke="#FEF3C7"
                  strokeWidth="7"
                />
                <line
                  x1={shapeId === 'quadrato' ? 36 : 24}
                  y1="80"
                  x2={shapeId === 'quadrato' ? 124 : 136}
                  y2="80"
                  stroke="#FEF3C7"
                  strokeWidth="7"
                />
                {/* Top bow */}
                <path
                  d={`M 80 ${shapeId === 'quadrato' ? 34 : 46} C 64 ${shapeId === 'quadrato' ? 18 : 30}, 56 ${shapeId === 'quadrato' ? 32 : 44}, 80 ${shapeId === 'quadrato' ? 34 : 46} C 104 ${shapeId === 'quadrato' ? 18 : 30}, 96 ${shapeId === 'quadrato' ? 32 : 44}, 80 ${shapeId === 'quadrato' ? 34 : 46}`}
                  fill="#DC2626"
                  stroke="#7F1D1D"
                  strokeWidth="2.2"
                />
                <circle cx="80" cy={shapeId === 'quadrato' ? 34 : 46} r="4.5" fill="#FACC15" stroke="#7F1D1D" strokeWidth="1.5" />
              </g>
            )}

            {/* Triangolo -> Christmas Tree Garlands & Ornaments */}
            {ornamentMode && shapeId === 'triangolo' && (
              <g>
                <path
                  d="M 56 72 Q 80 84 104 72"
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 40 104 Q 80 118 120 104"
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <circle cx="80" cy="56" r="5" fill="#EF4444" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="62" cy="92" r="5" fill="#38BDF8" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="98" cy="92" r="5" fill="#FACC15" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="80" cy="116" r="5" fill="#EF4444" stroke="#FEF3C7" strokeWidth="1.5" />
              </g>
            )}

            {/* Stella -> Radiant Inner Star */}
            {ornamentMode && shapeId === 'stella' && (
              <g>
                <polygon
                  points={pointsToStr(getStarPoints(80, 82, 34, 15))}
                  fill="#FEF08A"
                  opacity="0.75"
                />
                <circle cx="80" cy="82" r="7" fill="#FFFFFF" opacity="0.85" />
              </g>
            )}

            {/* Rombo -> Ice Crystal Diamond */}
            {ornamentMode && shapeId === 'rombo' && (
              <g stroke="#E0F2FE" strokeWidth="3" strokeLinecap="round" opacity="0.9">
                <line x1="80" y1="36" x2="80" y2="124" />
                <line x1="46" y1="80" x2="114" y2="80" />
                <line x1="64" y1="54" x2="96" y2="106" strokeWidth="2" />
                <line x1="96" y1="54" x2="64" y2="106" strokeWidth="2" />
                <circle cx="80" cy="80" r="6" fill="#FFFFFF" stroke="none" />
              </g>
            )}

            {/* Trapezio -> Panettone di Natale with Sugar Glaze & Candied Fruit */}
            {ornamentMode && shapeId === 'trapezio' && (
              <g>
                <path
                  d="M 46 46 Q 80 34 114 46 L 118 62 Q 102 72 90 62 Q 80 72 70 62 Q 58 72 42 62 Z"
                  fill="#FEF3C7"
                  stroke="#92400E"
                  strokeWidth="2"
                />
                <circle cx="66" cy="86" r="4.5" fill="#DC2626" />
                <circle cx="94" cy="86" r="4.5" fill="#16A34A" />
                <circle cx="80" cy="100" r="4.5" fill="#FACC15" />
                <circle cx="54" cy="104" r="4" fill="#F97316" />
                <circle cx="106" cy="104" r="4" fill="#DC2626" />
              </g>
            )}

            {/* Pentagono -> Gingerbread Icing House */}
            {ornamentMode && shapeId === 'pentagono' && (
              <g>
                <path
                  d="M 42 74 Q 80 44 118 74"
                  fill="none"
                  stroke="#FEF3C7"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
                <rect x="67" y="92" width="26" height="32" rx="4" fill="#FEF3C7" stroke="#78350F" strokeWidth="2" />
                <circle cx="80" cy="72" r="6" fill="#F8FAFC" stroke="#78350F" strokeWidth="2" />
              </g>
            )}

            {/* Esagono -> 6-Point Snowflake Ornament */}
            {ornamentMode && shapeId === 'esagono' && (
              <g stroke="#CCFBF1" strokeWidth="3" strokeLinecap="round">
                <line x1="80" y1="38" x2="80" y2="122" />
                <line x1="44" y1="59" x2="116" y2="101" />
                <line x1="116" y1="59" x2="44" y2="101" />
                <circle cx="80" cy="80" r="8" fill="#FFFFFF" stroke="none" />
              </g>
            )}

            {/* Ottagono -> Festive Medallion Wreath */}
            {ornamentMode && shapeId === 'ottagono' && (
              <g>
                <circle cx="80" cy="80" r="30" fill="none" stroke="#FDE68A" strokeWidth="3.5" strokeDasharray="6 4" />
                <circle cx="80" cy="44" r="5" fill="#EF4444" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="116" cy="80" r="5" fill="#EF4444" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="80" cy="116" r="5" fill="#EF4444" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="44" cy="80" r="5" fill="#EF4444" stroke="#FEF3C7" strokeWidth="1.5" />
                <circle cx="80" cy="80" r="7" fill="#FACC15" />
              </g>
            )}

            {showRightAngles &&
              rightAngleBoxes.map((box, idx) => (
                <path
                  key={idx}
                  d={`M ${box.x + box.dx} ${box.y} L ${box.x + box.dx} ${box.y + box.dy} L ${box.x} ${box.y + box.dy}`}
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="2.5"
                />
              ))}
            {showSymmetry &&
              symmetryLines.map(([x1, y1, x2, y2], idx) => (
                <line
                  key={idx}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#0F172A"
                  strokeWidth="2.5"
                  strokeDasharray="5 4"
                />
              ))}
            {showVertices &&
              polygonPts.map(([vx, vy], idx) => (
                <g key={idx}>
                  <circle cx={vx} cy={vy} r="9.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
                  <text
                    x={vx}
                    y={vy + 3.5}
                    textAnchor="middle"
                    fontSize="10.5"
                    fontWeight="700"
                    fill="#0F172A"
                    fontFamily="IBM Plex Mono, monospace"
                  >
                    {idx + 1}
                  </text>
                </g>
              ))}
          </>
        )}

        {/* 3D Solid: Cubo -> 3D Wrapped Christmas Gift Box */}
        {shapeId === 'cubo' && (
          <g>
            <polygon points="34,58 98,58 98,126 34,126" fill={fill} stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="34,58 62,32 126,32 98,58" fill="#F87171" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="98,58 126,32 126,100 98,126" fill="#B91C1C" stroke={stroke} strokeWidth="3.5" strokeLinejoin="round" />
            {ornamentMode && (
              <g>
                <line x1="66" y1="58" x2="66" y2="126" stroke="#FEF3C7" strokeWidth="6" />
                <line x1="66" y1="58" x2="94" y2="32" stroke="#FEF3C7" strokeWidth="6" />
                <line x1="34" y1="92" x2="98" y2="92" stroke="#FEF3C7" strokeWidth="6" />
                <line x1="98" y1="92" x2="126" y2="66" stroke="#FEF3C7" strokeWidth="5" />
                <circle cx="80" cy="45" r="6" fill="#FACC15" stroke="#92400E" strokeWidth="2" />
              </g>
            )}
            {showVertices &&
              [
                [34, 58],
                [98, 58],
                [98, 126],
                [34, 126],
                [62, 32],
                [126, 32],
                [126, 100]
              ].map(([vx, vy], idx) => (
                <circle key={idx} cx={vx} cy={vy} r="5.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="2" />
              ))}
          </g>
        )}

        {/* 3D Solid: Sfera -> Glass Christmas Ornament */}
        {shapeId === 'sfera' && (
          <g>
            <defs>
              <radialGradient id="sphereGrad" cx="35%" cy="32%" r="68%">
                <stop offset="0%" stopColor="#7DD3FC" />
                <stop offset="55%" stopColor={fill} />
                <stop offset="100%" stopColor={stroke} />
              </radialGradient>
            </defs>
            <circle cx="80" cy="82" r="50" fill="url(#sphereGrad)" stroke={stroke} strokeWidth="3.5" />
            {ornamentMode ? (
              <g>
                <path d="M 32 76 Q 80 96 128 76" fill="none" stroke="#FEF3C7" strokeWidth="4" opacity="0.9" />
                <circle cx="62" cy="60" r="4.5" fill="#FEF08A" />
                <circle cx="98" cy="102" r="4" fill="#FEF08A" />
              </g>
            ) : (
              <ellipse
                cx="80"
                cy="82"
                rx="50"
                ry="15"
                fill="none"
                stroke="#E0F2FE"
                strokeWidth="2"
                strokeDasharray="5 4"
                opacity="0.85"
              />
            )}
          </g>
        )}

        {/* 3D Solid: Cono -> Festive Elf/Tree Cone with Pom-pom & Garland */}
        {shapeId === 'cono' && (
          <g>
            <path
              d="M 80 22 L 128 118 A 48 16 0 0 1 32 118 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <ellipse
              cx="80"
              cy="118"
              rx="48"
              ry="16"
              fill="#22C55E"
              stroke={stroke}
              strokeWidth="3.5"
            />
            {ornamentMode && (
              <g>
                <path d="M 55 72 Q 80 84 105 72" fill="none" stroke="#FEF08A" strokeWidth="3" strokeLinecap="round" />
                <circle cx="80" cy="22" r="8" fill="#F8FAFC" stroke={stroke} strokeWidth="2.2" />
                <circle cx="66" cy="96" r="4.5" fill="#EF4444" />
                <circle cx="94" cy="94" r="4.5" fill="#FACC15" />
              </g>
            )}
            {showVertices && <circle cx="80" cy="22" r="6" fill="#FEF08A" stroke="#0F172A" strokeWidth="2" />}
          </g>
        )}

        {/* 3D Solid: Cilindro -> Glowing Christmas Candle */}
        {shapeId === 'cilindro' && (
          <g>
            <path
              d="M 38 48 L 38 116 A 42 14 0 0 0 122 116 L 122 48 Z"
              fill={fill}
              stroke={stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <ellipse cx="80" cy="48" rx="42" ry="14" fill="#FBBF24" stroke={stroke} strokeWidth="3.5" />
            <path d="M 38 116 A 42 14 0 0 0 122 116" fill="none" stroke={stroke} strokeWidth="3.5" />
            {ornamentMode && (
              <g>
                {/* Candle flame */}
                <path d="M 80 18 Q 90 32 80 42 Q 70 32 80 18 Z" fill="#FDE047" stroke="#DC2626" strokeWidth="2" />
                {/* Holly ribbon around cylinder */}
                <path d="M 38 88 Q 80 100 122 88" fill="none" stroke="#DC2626" strokeWidth="6" />
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  );
};
