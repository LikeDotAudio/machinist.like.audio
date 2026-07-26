import React, { useState, useMemo } from 'react';

// ---------------------------------------------------------------------------
// Screw Head, Drive & Fastener Type SVG Library
// Schematic renderings of common drive recesses (top view), head shapes
// (side profile) and full fastener types, plus socket-cap hex key sizes.
// ---------------------------------------------------------------------------

type Group = 'drive' | 'head' | 'screw' | 'nut';

interface FastenerItem {
  id: string;
  name: string;
  group: Group;
  description: string;
  render: (large?: boolean) => React.ReactElement;
}

const STEEL = '#93a3ba';
const STEEL_DK = '#5d6b80';
const RECESS = '#10151f';
const OUTLINE = '#c3cede';

// --- Geometry helpers -------------------------------------------------------

const polyPoints = (cx: number, cy: number, n: number, r: number, rotDeg = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rotDeg + (i * 360) / n) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

const starPoints = (cx: number, cy: number, lobes: number, rOuter: number, rInner: number, rotDeg = -90) =>
  Array.from({ length: lobes * 2 }, (_, i) => {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = ((rotDeg + (i * 360) / (lobes * 2)) * Math.PI) / 180;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');

// Drive glyph wrapper: steel screw head circle + dark recess children
const Drive = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    <circle cx="50" cy="50" r="45" fill={STEEL} stroke={OUTLINE} strokeWidth="2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke={STEEL_DK} strokeWidth="1.5" opacity="0.6" />
    <g fill={RECESS} stroke={RECESS}>{children}</g>
  </svg>
);

// Threaded shank for side-profile glyphs (viewBox 120 × 200)
const Shank = ({ topY, botY = 190, w = 22, taper = false, point = 'blunt', pitch = 11 }: {
  topY: number; botY?: number; w?: number; taper?: boolean; point?: 'blunt' | 'gimlet' | 'drill'; pitch?: number;
}) => {
  const cx = 60;
  const half = w / 2;
  const tipLen = point === 'gimlet' ? 26 : point === 'drill' ? 22 : 0;
  const bodyBot = botY - tipLen;
  const halfAt = (y: number) => taper ? half * Math.max(0.25, 1 - (0.55 * (y - topY)) / (botY - topY)) : half;
  const threads: React.ReactElement[] = [];
  for (let y = topY + 8; y < bodyBot - 2; y += pitch) {
    const h = halfAt(y);
    threads.push(<line key={y} x1={cx - h - 3} y1={y + 4} x2={cx + h + 3} y2={y - 4} stroke={STEEL_DK} strokeWidth="2.5" />);
  }
  const hb = halfAt(bodyBot);
  const tip = point === 'gimlet'
    ? `L ${cx + hb} ${bodyBot} L ${cx} ${botY} L ${cx - hb} ${bodyBot}`
    : point === 'drill'
      ? `L ${cx + hb} ${bodyBot} L ${cx + hb * 0.4} ${botY} L ${cx - hb * 0.9} ${bodyBot - 6} L ${cx - hb} ${bodyBot}`
      : `L ${cx + hb} ${bodyBot} L ${cx - hb} ${bodyBot}`;
  return (
    <g>
      <path
        d={`M ${cx - half} ${topY} L ${cx + half} ${topY} ${taper || tipLen ? `L ${cx + hb} ${bodyBot} ${tip}` : `L ${cx + half} ${bodyBot} L ${cx - half} ${bodyBot}`} Z`}
        fill={STEEL} stroke={OUTLINE} strokeWidth="1.5"
      />
      {threads}
    </g>
  );
};

// Side-profile wrapper for heads/screws
const Side = ({ children, tall = false }: { children: React.ReactNode; tall?: boolean }) => (
  <svg viewBox={tall ? '0 0 120 200' : '0 0 120 120'} style={{ width: '100%', height: '100%' }}>
    {children}
  </svg>
);

// Hex nut body, side view (facet lines imply the hexagon)
const NutBody = ({ y, h, w = 84, facets = true }: { y: number; h: number; w?: number; facets?: boolean }) => {
  const x = (120 - w) / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="3" />
      {facets && (
        <>
          <line x1={x + w * 0.32} y1={y} x2={x + w * 0.32} y2={y + h} stroke={STEEL_DK} strokeWidth="2" />
          <line x1={x + w * 0.68} y1={y} x2={x + w * 0.68} y2={y + h} stroke={STEEL_DK} strokeWidth="2" />
        </>
      )}
    </g>
  );
};

const slotTop = (y: number, x0 = 52, x1 = 68) => (
  <rect x={x0} y={y} width={x1 - x0} height={5} fill={RECESS} rx={1} />
);

// Head profile paths (head sits at top, shank stub below to y=115)
const HeadGlyph = ({ head, stub = true, slotY }: { head: React.ReactNode; stub?: boolean; slotY?: number }) => (
  <Side>
    {stub && <Shank topY={52} botY={115} w={20} pitch={10} />}
    {head}
    {slotY !== undefined && slotTop(slotY)}
  </Side>
);

// --- Library ---------------------------------------------------------------

export const FASTENER_LIBRARY: FastenerItem[] = [
  // ============ DRIVE TYPES (top view) ============
  {
    id: 'drive-slotted', name: 'Slotted', group: 'drive',
    description: 'Single straight slot. The oldest drive — flat blade driver, prone to cam-out and slip.',
    render: () => <Drive><rect x="12" y="45" width="76" height="10" rx="2" /></Drive>,
  },
  {
    id: 'drive-phillips', name: 'Phillips', group: 'drive',
    description: 'Self-centering tapered cross recess (ANSI Type I). Designed to cam out at high torque.',
    render: () => <Drive><polygon points="50,10 56,42 88,48 88,52 56,58 50,90 44,58 12,52 12,48 44,42" /></Drive>,
  },
  {
    id: 'drive-phillips-slot', name: 'Phillips / Slot', group: 'drive',
    description: 'Combination recess driven by either Phillips or flat blade. Common on electrical terminals.',
    render: () => <Drive><polygon points="50,12 55,45 50,88 45,45" /><rect x="12" y="45" width="76" height="10" rx="2" /></Drive>,
  },
  {
    id: 'drive-pozidriv', name: 'Pozidriv', group: 'drive',
    description: 'Phillips-style cross with four extra 45° ribs for less cam-out. Marked by tick lines on the head.',
    render: () => (
      <Drive>
        <polygon points="50,10 56,42 88,48 88,52 56,58 50,90 44,58 12,52 12,48 44,42" />
        <g transform="rotate(45 50 50)">
          <rect x="47.5" y="14" width="5" height="16" /><rect x="47.5" y="70" width="5" height="16" />
          <rect x="14" y="47.5" width="16" height="5" /><rect x="70" y="47.5" width="16" height="5" />
        </g>
      </Drive>
    ),
  },
  {
    id: 'drive-square', name: 'Square (Robertson)', group: 'drive',
    description: 'Square recess with slight taper — excellent stick-fit and high torque. Sizes #0–#3.',
    render: () => <Drive><rect x="36" y="36" width="28" height="28" rx="2" /></Drive>,
  },
  {
    id: 'drive-square-slot', name: 'Square / Slot', group: 'drive',
    description: 'Combination square recess plus slot, driven by Robertson or flat blade.',
    render: () => <Drive><rect x="38" y="38" width="24" height="24" rx="2" /><rect x="12" y="46" width="76" height="8" rx="2" /></Drive>,
  },
  {
    id: 'drive-torx', name: 'Torx (6-Lobe)', group: 'drive',
    description: '6-lobe star recess (ISO 10664). Near-zero cam-out, full torque transfer. Sizes T1–T100.',
    render: () => <Drive><polygon points={starPoints(50, 50, 6, 28, 15)} strokeWidth="9" strokeLinejoin="round" /></Drive>,
  },
  {
    id: 'drive-torx-tamper', name: 'Torx Tamper (Pin)', group: 'drive',
    description: 'Security 6-lobe with center pin — requires a hollow-tip driver bit.',
    render: () => (
      <Drive>
        <polygon points={starPoints(50, 50, 6, 28, 15)} strokeWidth="9" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="7" fill={STEEL} stroke={STEEL} />
      </Drive>
    ),
  },
  {
    id: 'drive-torx-slot', name: '6-Lobe / Slot', group: 'drive',
    description: 'Combination star and slot recess.',
    render: () => <Drive><polygon points={starPoints(50, 50, 6, 26, 14)} strokeWidth="8" strokeLinejoin="round" /><rect x="12" y="46" width="76" height="8" rx="2" /></Drive>,
  },
  {
    id: 'drive-hex', name: 'Internal Hex (Allen)', group: 'drive',
    description: 'Hex socket driven by an Allen key. Standard on socket head cap screws — see key chart below.',
    render: () => <Drive><polygon points={polyPoints(50, 50, 6, 26)} strokeWidth="4" strokeLinejoin="round" /></Drive>,
  },
  {
    id: 'drive-triangle', name: 'Triangle (TA)', group: 'drive',
    description: 'Security triangular recess found on appliances and toys.',
    render: () => <Drive><polygon points={polyPoints(50, 52, 3, 24)} strokeWidth="8" strokeLinejoin="round" /></Drive>,
  },
  {
    id: 'drive-pentagon', name: '5-Point Pentagon', group: 'drive',
    description: 'Security pentagon socket — cannot be driven by standard hex keys.',
    render: () => <Drive><polygon points={polyPoints(50, 50, 5, 25)} strokeWidth="6" strokeLinejoin="round" /></Drive>,
  },
  {
    id: 'drive-y', name: 'Y-Type (Tri-Point)', group: 'drive',
    description: 'Three slots at 120° — common in consumer electronics (e.g., Y00, Y0).',
    render: () => (
      <Drive>
        {[0, 120, 240].map(a => (
          <g key={a} transform={`rotate(${a} 50 50)`}><rect x="46.5" y="16" width="7" height="38" rx="2" /></g>
        ))}
      </Drive>
    ),
  },
  {
    id: 'drive-triwing', name: 'Tri-Wing', group: 'drive',
    description: 'Three tapered offset wings — aerospace and security use.',
    render: () => (
      <Drive>
        <circle cx="50" cy="50" r="8" />
        {[0, 120, 240].map(a => (
          <g key={a} transform={`rotate(${a} 50 50)`}><polygon points="46,50 58,50 66,18 52,20" /></g>
        ))}
      </Drive>
    ),
  },
  {
    id: 'drive-8point', name: '8-Point (Double Square)', group: 'drive',
    description: 'Two overlaid square recesses at 45° — accepts a Robertson driver in eight positions.',
    render: () => <Drive><rect x="37" y="37" width="26" height="26" /><g transform="rotate(45 50 50)"><rect x="37" y="37" width="26" height="26" /></g></Drive>,
  },
  {
    id: 'drive-spline', name: 'Spline (12-Tooth)', group: 'drive',
    description: '12-spline aerospace drive for very high torque in small diameters.',
    render: () => <Drive><polygon points={starPoints(50, 50, 12, 26, 18)} strokeWidth="4" strokeLinejoin="round" /></Drive>,
  },
  {
    id: 'drive-spanner', name: 'Spanner (Snake-Eye)', group: 'drive',
    description: 'Two round holes driven by a pronged security bit.',
    render: () => <Drive><circle cx="33" cy="50" r="8" /><circle cx="67" cy="50" r="8" /></Drive>,
  },
  {
    id: 'drive-clutch', name: 'Clutch (Type A)', group: 'drive',
    description: 'Bow-tie recess used on older GM vehicles and mobile homes.',
    render: () => <Drive><circle cx="50" cy="50" r="9" /><polygon points="16,36 46,48 46,52 16,64" /><polygon points="84,36 54,48 54,52 84,64" /></Drive>,
  },
  {
    id: 'drive-phillips-square', name: 'Phillips / Square', group: 'drive',
    description: 'Quadrex / combo recess taking either Phillips or Robertson drivers.',
    render: () => <Drive><polygon points="50,12 55,44 50,88 45,44" /><polygon points="12,50 44,45 88,50 44,55" /><rect x="41" y="41" width="18" height="18" /></Drive>,
  },
  // ============ HEAD SHAPES (side profile) ============
  {
    id: 'head-flat82', name: '82° Countersunk (Flat)', group: 'head',
    description: 'Standard flat head — sits flush in an 82° countersink. Overall length includes the head.',
    render: () => <HeadGlyph slotY={20} head={<path d="M 18 20 L 102 20 L 70 52 L 50 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-flat100', name: '100° Flat', group: 'head',
    description: 'Wider, shallower countersunk head for thin sheet material (100° included angle).',
    render: () => <HeadGlyph slotY={26} head={<path d="M 12 26 L 108 26 L 70 50 L 50 50 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-oval', name: 'Oval (Raised CSK)', group: 'head',
    description: 'Countersunk with a decorative rounded top. Length measured to the largest diameter point.',
    render: () => <HeadGlyph slotY={16} head={<path d="M 18 28 Q 60 6 102 28 L 70 54 L 50 54 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-pan', name: 'Pan', group: 'head',
    description: 'General-purpose head: flat bearing surface, rounded sides, slightly domed top.',
    render: () => <HeadGlyph slotY={20} head={<path d="M 28 52 L 28 30 Q 28 18 44 18 L 76 18 Q 92 18 92 30 L 92 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-round', name: 'Round (Dome)', group: 'head',
    description: 'Traditional half-dome head, largely superseded by pan head.',
    render: () => <HeadGlyph slotY={18} head={<path d="M 26 52 A 34 30 0 0 1 94 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-truss', name: 'Truss', group: 'head',
    description: 'Extra-wide, low dome spreads clamping load — good for thin sheet and slotted holes.',
    render: () => <HeadGlyph slotY={30} head={<path d="M 12 52 A 48 26 0 0 1 108 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-fillister', name: 'Fillister', group: 'head',
    description: 'Tall, narrow cylindrical head with domed top — fits counterbored holes.',
    render: () => <HeadGlyph slotY={16} head={<path d="M 36 52 L 36 22 Q 36 12 46 12 L 74 12 Q 84 12 84 22 L 84 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-cheese', name: 'Cheese', group: 'head',
    description: 'Straight-sided cylindrical head with flat top (DIN 84 style).',
    render: () => <HeadGlyph slotY={22} head={<rect x="36" y="20" width="48" height="32" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />} />,
  },
  {
    id: 'head-binding', name: 'Binding (Undercut)', group: 'head',
    description: 'Slightly domed head with an undercut below — grips wire and terminal lugs.',
    render: () => <HeadGlyph slotY={22} head={<path d="M 30 52 L 34 46 L 34 28 Q 34 20 44 20 L 76 20 Q 86 20 86 28 L 86 46 L 90 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-bugle', name: 'Bugle', group: 'head',
    description: 'Concave-flared countersunk head (drywall screws) — seats without tearing paper.',
    render: () => <HeadGlyph slotY={20} head={<path d="M 20 20 L 100 20 C 84 24 74 34 70 52 L 50 52 C 46 34 36 24 20 20 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-hex', name: 'Hex', group: 'head',
    description: 'External hexagon driven by wrench or socket — the standard bolt head.',
    render: () => (
      <HeadGlyph head={
        <g>
          <rect x="26" y="22" width="68" height="30" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
          <line x1="46" y1="22" x2="46" y2="52" stroke={STEEL_DK} strokeWidth="2" />
          <line x1="74" y1="22" x2="74" y2="52" stroke={STEEL_DK} strokeWidth="2" />
        </g>
      } />
    ),
  },
  {
    id: 'head-hexwasher', name: 'Hex Washer', group: 'head',
    description: 'Hex head with integral washer flange — spreads load, common on TEK screws.',
    render: () => (
      <HeadGlyph head={
        <g>
          <rect x="34" y="18" width="52" height="26" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
          <line x1="50" y1="18" x2="50" y2="44" stroke={STEEL_DK} strokeWidth="2" />
          <line x1="70" y1="18" x2="70" y2="44" stroke={STEEL_DK} strokeWidth="2" />
          <rect x="20" y="44" width="80" height="9" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
        </g>
      } />
    ),
  },
  {
    id: 'head-socket', name: 'Socket Cap', group: 'head',
    description: 'Tall cylindrical head with internal hex, often knurled — fits counterbores. See key chart below.',
    render: () => (
      <HeadGlyph head={
        <g>
          <rect x="34" y="12" width="52" height="40" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="3" />
          {[42, 50, 58, 66, 74].map(x => <line key={x} x1={x} y1="14" x2={x} y2="24" stroke={STEEL_DK} strokeWidth="1.5" />)}
          <rect x="50" y="12" width="20" height="8" fill={RECESS} rx="1" />
        </g>
      } />
    ),
  },
  {
    id: 'head-button', name: 'Button', group: 'head',
    description: 'Low-profile dome with internal hex — decorative socket screw head.',
    render: () => (
      <HeadGlyph head={
        <g>
          <path d="M 26 52 A 36 22 0 0 1 94 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
          <rect x="52" y="30" width="16" height="6" fill={RECESS} rx="1" />
        </g>
      } />
    ),
  },
  {
    id: 'head-trim', name: 'Trim', group: 'head',
    description: 'Narrow countersunk head with steep sides — smaller footprint than a standard flat.',
    render: () => <HeadGlyph slotY={18} head={<path d="M 34 18 L 86 18 L 68 52 L 52 52 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-wafer', name: 'Wafer', group: 'head',
    description: 'Very wide, thin, low-profile head — clamps thin sheet without a large dome.',
    render: () => <HeadGlyph slotY={32} head={<path d="M 12 32 L 108 32 L 82 50 L 38 50 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />} />,
  },
  {
    id: 'head-carriage', name: 'Carriage (Dome + Square)', group: 'head',
    description: 'Smooth dome with a square neck that locks into wood or square holes — no drive recess.',
    render: () => (
      <HeadGlyph head={
        <g>
          <path d="M 22 40 A 38 26 0 0 1 98 40 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
          <rect x="46" y="40" width="28" height="14" fill={STEEL_DK} stroke={OUTLINE} strokeWidth="1.5" />
        </g>
      } />
    ),
  },
  {
    id: 'head-set', name: 'Set (Headless)', group: 'head',
    description: 'No head at all — fully threaded grub screw with hex or slot drive in the end.',
    render: () => (
      <Side>
        <Shank topY={18} botY={112} w={30} pitch={12} />
        <rect x="50" y="18" width="20" height="8" fill={RECESS} rx="1" />
      </Side>
    ),
  },
  // ============ SCREW & BOLT TYPES (full body) ============
  {
    id: 'screw-wood', name: 'Wood Screw', group: 'screw',
    description: 'Tapered body, coarse deep threads, unthreaded shank near the head, gimlet point.',
    render: () => (
      <Side tall>
        <Shank topY={48} botY={192} w={26} taper point="gimlet" pitch={16} />
        <path d="M 18 16 L 102 16 L 74 48 L 46 48 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <polygon points="60,8 64,32 60,44 56,32" fill={RECESS} transform="translate(0 4)" />
      </Side>
    ),
  },
  {
    id: 'screw-sheetmetal', name: 'Sheet Metal (Tapping)', group: 'screw',
    description: 'Straight body, sharp widely-spaced threads to the head, sharp point — forms its own thread in sheet.',
    render: () => (
      <Side tall>
        <Shank topY={44} botY={192} w={24} point="gimlet" pitch={14} />
        <path d="M 30 44 L 30 26 Q 30 14 46 14 L 74 14 Q 90 14 90 26 L 90 44 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <polygon points="60,18 65,29 60,40 55,29" fill={RECESS} />
        <polygon points="44,29 60,25 76,29 60,33" fill={RECESS} />
      </Side>
    ),
  },
  {
    id: 'screw-selfdrill', name: 'Self-Drilling (TEK)', group: 'screw',
    description: 'Sheet metal screw with a drill-bit point — drills and taps steel in one operation.',
    render: () => (
      <Side tall>
        <Shank topY={46} botY={192} w={24} point="drill" pitch={13} />
        <rect x="34" y="20" width="52" height="18" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
        <line x1="50" y1="20" x2="50" y2="38" stroke={STEEL_DK} strokeWidth="2" />
        <line x1="70" y1="20" x2="70" y2="38" stroke={STEEL_DK} strokeWidth="2" />
        <rect x="24" y="38" width="72" height="8" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
      </Side>
    ),
  },
  {
    id: 'screw-drywall', name: 'Drywall Screw', group: 'screw',
    description: 'Bugle head, thin hardened body, sharp point, coarse (wood stud) or fine (steel stud) thread.',
    render: () => (
      <Side tall>
        <Shank topY={40} botY={192} w={18} point="gimlet" pitch={11} />
        <path d="M 26 14 L 94 14 C 82 18 72 26 68 40 L 52 40 C 48 26 38 18 26 14 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <polygon points="60,10 64,27 60,38 56,27" fill={RECESS} />
        <polygon points="46,24 60,21 74,24 60,29" fill={RECESS} />
      </Side>
    ),
  },
  {
    id: 'screw-machine', name: 'Machine Screw', group: 'screw',
    description: 'Uniform diameter with fine, even threads and a blunt end — mates with tapped holes or nuts.',
    render: () => (
      <Side tall>
        <Shank topY={44} botY={186} w={24} point="blunt" pitch={9} />
        <path d="M 30 44 L 30 26 Q 30 14 46 14 L 74 14 Q 90 14 90 26 L 90 44 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        {slotTop(22, 46, 74)}
      </Side>
    ),
  },
  {
    id: 'screw-hexbolt', name: 'Hex Cap Bolt', group: 'screw',
    description: 'Hex head, partially threaded shank with plain grip length, blunt chamfered end.',
    render: () => (
      <Side tall>
        <rect x="49" y="46" width="22" height="60" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <Shank topY={104} botY={186} w={22} point="blunt" pitch={9} />
        <rect x="28" y="16" width="64" height="30" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
        <line x1="48" y1="16" x2="48" y2="46" stroke={STEEL_DK} strokeWidth="2" />
        <line x1="72" y1="16" x2="72" y2="46" stroke={STEEL_DK} strokeWidth="2" />
      </Side>
    ),
  },
  {
    id: 'screw-sockethead', name: 'Socket Head Cap', group: 'screw',
    description: 'Internal-hex cylindrical head, high-strength alloy — the machinist\'s workhorse. Key sizes below.',
    render: () => (
      <Side tall>
        <Shank topY={54} botY={186} w={22} point="blunt" pitch={9} />
        <rect x="36" y="12" width="48" height="42" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="3" />
        {[44, 52, 60, 68, 76].map(x => <line key={x} x1={x} y1="14" x2={x} y2="26" stroke={STEEL_DK} strokeWidth="1.5" />)}
        <rect x="51" y="12" width="18" height="9" fill={RECESS} rx="1" />
      </Side>
    ),
  },
  {
    id: 'screw-carriage', name: 'Carriage Bolt', group: 'screw',
    description: 'Smooth dome head and square neck lock the bolt against turning while the nut is tightened.',
    render: () => (
      <Side tall>
        <rect x="50" y="52" width="20" height="50" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <Shank topY={100} botY={186} w={20} point="blunt" pitch={9} />
        <path d="M 24 38 A 36 26 0 0 1 96 38 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x="47" y="38" width="26" height="14" fill={STEEL_DK} stroke={OUTLINE} strokeWidth="1.5" />
      </Side>
    ),
  },
  {
    id: 'screw-set', name: 'Set Screw (Grub)', group: 'screw',
    description: 'Headless, fully threaded, hex-socket drive — locks pulleys and collars onto shafts.',
    render: () => (
      <Side tall>
        <Shank topY={30} botY={180} w={34} point="blunt" pitch={13} />
        <rect x="49" y="30" width="22" height="10" fill={RECESS} rx="1" />
      </Side>
    ),
  },
  {
    id: 'screw-eyebolt', name: 'Eye Bolt', group: 'screw',
    description: 'Circular loop head for attaching rope, cable or rigging hardware.',
    render: () => (
      <Side tall>
        <circle cx="60" cy="42" r="28" fill="none" stroke={STEEL} strokeWidth="13" />
        <circle cx="60" cy="42" r="28" fill="none" stroke={OUTLINE} strokeWidth="1.5" />
        <circle cx="60" cy="42" r="15" fill="none" stroke={OUTLINE} strokeWidth="1.5" />
        <Shank topY={72} botY={186} w={20} point="blunt" pitch={9} />
      </Side>
    ),
  },
  {
    id: 'screw-lag', name: 'Lag Screw', group: 'screw',
    description: 'Heavy hex-head wood screw — coarse deep thread and gimlet point for structural timber.',
    render: () => (
      <Side tall>
        <Shank topY={46} botY={192} w={26} taper point="gimlet" pitch={15} />
        <rect x="30" y="18" width="60" height="28" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
        <line x1="48" y1="18" x2="48" y2="46" stroke={STEEL_DK} strokeWidth="2" />
        <line x1="72" y1="18" x2="72" y2="46" stroke={STEEL_DK} strokeWidth="2" />
      </Side>
    ),
  },
  {
    id: 'screw-masonry', name: 'Masonry Screw', group: 'screw',
    description: 'Hardened screw with high-low dual-lead thread — taps into drilled concrete or brick.',
    render: () => (
      <Side tall>
        <Shank topY={44} botY={188} w={22} point="blunt" pitch={8} />
        <rect x="34" y="18" width="52" height="18" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
        <line x1="52" y1="18" x2="52" y2="36" stroke={STEEL_DK} strokeWidth="2" />
        <line x1="68" y1="18" x2="68" y2="36" stroke={STEEL_DK} strokeWidth="2" />
        <rect x="26" y="36" width="68" height="8" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" rx="2" />
      </Side>
    ),
  },
  {
    id: 'screw-doubleend', name: 'Double-End (Hanger)', group: 'screw',
    description: 'Wood thread on one end, machine thread on the other — no head at all.',
    render: () => (
      <Side tall>
        <Shank topY={14} botY={96} w={20} point="blunt" pitch={8} />
        <rect x="52" y="96" width="16" height="14" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <Shank topY={110} botY={196} w={20} taper point="gimlet" pitch={13} />
      </Side>
    ),
  },
  {
    id: 'screw-decking', name: 'Decking Screw', group: 'screw',
    description: 'Corrosion-resistant bugle-head screw, often with a cutting nib and reverse top thread.',
    render: () => (
      <Side tall>
        <Shank topY={40} botY={192} w={20} point="gimlet" pitch={12} />
        <path d="M 28 14 L 92 14 C 82 18 72 26 68 40 L 52 40 C 48 26 38 18 28 14 Z" fill={STEEL} stroke={OUTLINE} strokeWidth="1.5" />
        <polygon points={starPoints(60, 26, 6, 11, 6)} fill={RECESS} />
      </Side>
    ),
  },
];

// Socket head cap screw hex key sizes (metric)
export const SOCKET_HEX_KEYS: { size: string; keyMm: number }[] = [
  { size: 'M3', keyMm: 2.5 }, { size: 'M4', keyMm: 3 }, { size: 'M5', keyMm: 4 },
  { size: 'M6', keyMm: 5 }, { size: 'M8', keyMm: 6 }, { size: 'M10', keyMm: 8 },
  { size: 'M12', keyMm: 10 }, { size: 'M14', keyMm: 12 }, { size: 'M16', keyMm: 14 },
];

const GROUP_META: Record<Group, { label: string; color: string; bg: string; border: string }> = {
  drive: { label: 'Drive Type', color: 'var(--accent-cyan)', bg: 'rgba(244, 144, 44, 0.12)', border: 'rgba(244, 144, 44, 0.4)' },
  head: { label: 'Head Shape', color: '#00ff80', bg: 'rgba(0, 255, 128, 0.1)', border: 'rgba(0, 255, 128, 0.35)' },
  screw: { label: 'Screw / Bolt Type', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
};

type GroupFilter = 'all' | Group;

export const ScrewHeadIndex: React.FC = () => {
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('screw-sockethead');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FASTENER_LIBRARY.filter(f =>
      (groupFilter === 'all' || f.group === groupFilter) &&
      (!q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q))
    );
  }, [groupFilter, searchQuery]);

  const sel = useMemo(() => FASTENER_LIBRARY.find(f => f.id === selectedId) || FASTENER_LIBRARY[0], [selectedId]);
  const selMeta = GROUP_META[sel.group];
  const showKeys = sel.id === 'screw-sockethead' || sel.id === 'head-socket' || sel.id === 'drive-hex' || sel.id === 'head-button' || sel.id === 'screw-set';

  const counts = useMemo(() => ({
    drive: FASTENER_LIBRARY.filter(f => f.group === 'drive').length,
    head: FASTENER_LIBRARY.filter(f => f.group === 'head').length,
    screw: FASTENER_LIBRARY.filter(f => f.group === 'screw').length,
  }), []);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🪛 Screw Head & Drive Index <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// SVG Fastener Library</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(Object.keys(GROUP_META) as Group[]).map(gp => (
            <div key={gp} style={{ padding: '4px 12px', borderRadius: '8px', background: GROUP_META[gp].bg, border: `1px solid ${GROUP_META[gp].border}`, fontSize: '0.78rem', color: GROUP_META[gp].color }}>
              <strong>{counts[gp]}</strong> {GROUP_META[gp].label.toLowerCase()}s
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 380px) 1fr', gap: '25px', alignItems: 'start' }}>

        {/* Left: Selected Fastener Detail */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>{sel.name}</h3>
            <span style={{ padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: selMeta.color, background: selMeta.bg, border: `1px solid ${selMeta.border}`, whiteSpace: 'nowrap' }}>
              {GROUP_META[sel.group].label.toUpperCase()}
            </span>
          </div>

          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: `2px solid ${selMeta.border}`, padding: '20px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: sel.group === 'drive' ? '180px' : '150px', height: sel.group === 'screw' ? '260px' : '180px' }}>
              {sel.render(true)}
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
            {sel.description}
          </p>

          {/* Socket cap hex key sizes */}
          {showKeys && (
            <div style={{ background: 'rgba(244, 144, 44, 0.06)', border: '1px solid rgba(244, 144, 44, 0.25)', padding: '12px 14px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>
                SOCKET CAP — HEX KEY SIZES
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {SOCKET_HEX_KEYS.map(k => (
                  <span key={k.size} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '4px 8px' }}>
                    <strong style={{ color: '#fff' }}>{k.size}</strong>
                    <span style={{ color: 'var(--accent-cyan)' }}> → {k.keyMm} mm</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Library Grid */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              {(['all', 'drive', 'head', 'screw'] as GroupFilter[]).map(gp => {
                const active = groupFilter === gp;
                const color = gp === 'all' ? '#fff' : GROUP_META[gp].color;
                return (
                  <button
                    key={gp}
                    onClick={() => setGroupFilter(gp)}
                    style={{
                      padding: '7px 14px', border: 'none', borderRadius: '6px',
                      background: active ? (gp === 'all' ? 'rgba(255,255,255,0.15)' : GROUP_META[gp].bg) : 'transparent',
                      color: active ? color : 'var(--text-secondary)',
                      fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: active && gp !== 'all' ? `inset 0 0 0 1px ${GROUP_META[gp].border}` : 'none'
                    }}
                  >
                    {gp === 'all' ? 'All' : gp === 'drive' ? 'Drive Types' : gp === 'head' ? 'Head Shapes' : 'Screw Types'}
                  </button>
                );
              })}
            </div>
            <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
              <input
                type="text"
                placeholder="Search fasteners (e.g., torx, countersunk, carriage)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-precision"
                style={{ width: '100%', paddingLeft: '34px' }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'var(--text-muted)' }}>🔍</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))', gap: '10px' }}>
            {filtered.map(f => {
              const meta = GROUP_META[f.group];
              const isSel = f.id === selectedId;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(f.id)}
                  style={{
                    background: isSel ? meta.bg : 'var(--bg-primary)',
                    border: '1px solid',
                    borderColor: isSel ? meta.color : 'var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 8px 8px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.borderColor = meta.border; }}
                  onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                >
                  <div style={{ width: f.group === 'drive' ? '58px' : '52px', height: f.group === 'screw' ? '84px' : '58px' }}>
                    {f.render()}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isSel ? meta.color : 'var(--text-primary)', lineHeight: 1.25 }}>
                    {f.name}
                  </span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: '1 / -1', padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No fasteners match the current filter.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: tool description (kept out of the header per site convention) */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          FASTENER IDENTIFICATION REFERENCE // SVG LIBRARY
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Schematic SVG library of <strong style={{ color: GROUP_META.drive.color }}>drive recesses</strong> (top view),{' '}
          <strong style={{ color: GROUP_META.head.color }}>head shapes</strong> (side profile) and{' '}
          <strong style={{ color: GROUP_META.screw.color }}>screw &amp; bolt types</strong> (full body) for identifying
          fasteners on the bench. Select any glyph for an enlarged rendering and usage notes; socket-drive items include
          the metric hex key size chart (M3 → 2.5 mm through M16 → 14 mm).
        </p>
      </div>
    </div>
  );
};

export default ScrewHeadIndex;
