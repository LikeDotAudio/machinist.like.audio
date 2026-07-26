import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Geometric-style 5/16" Die Head (D, DS, DSA, DJ) Chaser Database
// Source: APK Drill Index — "Geometric die thread sizes" sheet.
// STANDARD = catalog chaser sets (Regular, ~$165/set). SPECIAL = special-order
// grind. METRIC = metric chaser sizes. Limit dimensions (Max/Min) are
// Machinery's Handbook Class 2A external thread limits where recorded.
// ---------------------------------------------------------------------------

export type ChaserType = 'STANDARD' | 'SPECIAL' | 'METRIC';

export interface DieChaser {
  id: string;
  /** Display designation, e.g. "#10-32", "1/4-20", "M 5.00 × 0.8" */
  nominal: string;
  type: ChaserType;
  /** TPI for inch threads, pitch in mm for metric threads */
  tpiOrPitch: number;
  /** Basic major diameter in inches (inch threads) or mm (metric threads) */
  majorBasic: number;
  /** True when the basic major was not on the sheet and was derived from the standard series formula */
  majorCalculated?: boolean;
  suffix?: 'NC' | 'NF';
  partNo?: string;
  /** Number of chaser sets owned (0 = not owned) */
  ownedQty: number;
  // Class 2A limit dimensions (inches) — only present where recorded on the sheet
  majorMax?: number;
  majorMin?: number;
  pdMax?: number;
  pdMin?: number;
  minorMax?: number;
}

const n = (num: number, tpi: number, type: ChaserType, opts: Partial<DieChaser> = {}): DieChaser => ({
  id: `n${num}-${tpi}`,
  nominal: `#${num}-${tpi}`,
  type,
  tpiOrPitch: tpi,
  majorBasic: 0.060 + 0.013 * num,
  ownedQty: 0,
  ...opts,
});

const f = (label: string, dec: number, tpi: number, type: ChaserType, opts: Partial<DieChaser> = {}): DieChaser => ({
  id: `f${label.replace('/', '-')}-${tpi}`,
  nominal: `${label}-${tpi}`,
  type,
  tpiOrPitch: tpi,
  majorBasic: dec,
  ownedQty: 0,
  ...opts,
});

const m = (dia: number, pitch: number, opts: Partial<DieChaser> = {}): DieChaser => ({
  id: `m${dia.toFixed(2)}-${pitch}`,
  nominal: `M ${dia.toFixed(2)} × ${pitch}`,
  type: 'METRIC',
  tpiOrPitch: pitch,
  majorBasic: dia,
  ownedQty: 0,
  ...opts,
});

export const DIE_CHASERS: DieChaser[] = [
  // --- Number sizes ---
  n(0, 80, 'SPECIAL', { ownedQty: 1, majorMax: 0.0595, majorMin: 0.0563, pdMax: 0.0514, pdMin: 0.0496, minorMax: 0.0442 }),
  n(1, 56, 'SPECIAL'),
  n(1, 64, 'SPECIAL', { majorMax: 0.0724, majorMin: 0.0686, pdMax: 0.0623, pdMin: 0.0603, minorMax: 0.0532 }),
  n(1, 72, 'SPECIAL', { majorMax: 0.0724, majorMin: 0.0689, pdMax: 0.0634, pdMin: 0.0615, minorMax: 0.0554 }),
  n(2, 56, 'SPECIAL', { majorMax: 0.0854, majorMin: 0.0813, pdMax: 0.0738, pdMin: 0.0717, minorMax: 0.0635 }),
  n(2, 64, 'SPECIAL', { ownedQty: 1, majorMax: 0.0854, majorMin: 0.0816, pdMax: 0.0753, pdMin: 0.0733, minorMax: 0.0662 }),
  n(3, 48, 'SPECIAL', { majorMax: 0.0983, majorMin: 0.0938, pdMax: 0.0848, pdMin: 0.0825, minorMax: 0.0727 }),
  n(3, 56, 'SPECIAL', { ownedQty: 1, majorMax: 0.0983, majorMin: 0.0942, pdMax: 0.0867, pdMin: 0.0845, minorMax: 0.0764 }),
  n(4, 28, 'SPECIAL', { ownedQty: 1 }),
  n(4, 32, 'SPECIAL'),
  n(4, 36, 'SPECIAL'),
  n(4, 40, 'STANDARD', { suffix: 'NC', ownedQty: 1, majorMax: 0.1112, majorMin: 0.1061, pdMax: 0.095, pdMin: 0.0925, minorMax: 0.0805 }),
  n(4, 48, 'SPECIAL', { majorMax: 0.1113, majorMin: 0.1068, pdMax: 0.0978, pdMin: 0.0954, minorMax: 0.0857 }),
  n(4, 64, 'SPECIAL'),
  n(5, 30, 'SPECIAL'),
  n(5, 32, 'SPECIAL'),
  n(5, 36, 'SPECIAL'),
  n(5, 40, 'STANDARD', { suffix: 'NC', partNo: 'DHC-5-40-5', ownedQty: 3, majorMax: 0.1242, majorMin: 0.1191, pdMax: 0.108, pdMin: 0.1054, minorMax: 0.0935 }),
  n(5, 44, 'STANDARD', { suffix: 'NF', partNo: 'DHC-5-44-5', majorMax: 0.1243, majorMin: 0.1195, pdMax: 0.1095, pdMin: 0.107, minorMax: 0.0964 }),
  n(5, 48, 'SPECIAL', { ownedQty: 1 }),
  n(6, 32, 'STANDARD', { suffix: 'NC', partNo: 'DHC-6-32-5', ownedQty: 2, majorMax: 0.1372, majorMin: 0.1312, pdMax: 0.1169, pdMin: 0.1141, minorMax: 0.0989 }),
  n(6, 36, 'SPECIAL'),
  n(6, 40, 'STANDARD', { suffix: 'NF', partNo: 'DHC-6-40-5', majorMax: 0.1372, majorMin: 0.1321, pdMax: 0.121, pdMin: 0.1184, minorMax: 0.1065 }),
  n(6, 48, 'SPECIAL'),
  n(7, 32, 'SPECIAL', { majorCalculated: true }),
  n(8, 30, 'SPECIAL'),
  n(8, 32, 'STANDARD', { suffix: 'NC', partNo: 'DHC-8-32-5', ownedQty: 1, majorMax: 0.1631, majorMin: 0.1571, pdMax: 0.1428, pdMin: 0.1399, minorMax: 0.1248 }),
  n(8, 36, 'STANDARD', { suffix: 'NF', partNo: 'DHC-8-36-5', ownedQty: 1, majorMax: 0.1632, majorMin: 0.1577, pdMax: 0.1452, pdMin: 0.1424, minorMax: 0.1291 }),
  n(8, 40, 'SPECIAL'),
  n(8, 48, 'SPECIAL'),
  n(10, 24, 'STANDARD', { suffix: 'NC', partNo: 'DHC-10-24-5', ownedQty: 1, majorMax: 0.189, majorMin: 0.1818, pdMax: 0.1619, pdMin: 0.1586, minorMax: 0.1379 }),
  n(10, 32, 'STANDARD', { suffix: 'NF', partNo: 'DHC-10-32-5', ownedQty: 1, majorMax: 0.1891, majorMin: 0.1831, pdMax: 0.1688, pdMin: 0.1658, minorMax: 0.1508 }),
  n(10, 40, 'SPECIAL'),
  n(10, 48, 'SPECIAL'),
  n(10, 56, 'SPECIAL'),
  n(12, 20, 'SPECIAL', { majorCalculated: true }),
  n(12, 24, 'STANDARD', { suffix: 'NC', partNo: 'DHC-12-24-5', majorCalculated: true }),
  n(12, 28, 'STANDARD', { suffix: 'NF', partNo: 'DHC-12-28-5', majorCalculated: true }),
  n(12, 32, 'SPECIAL', { ownedQty: 1, majorCalculated: true }),
  n(12, 36, 'SPECIAL', { majorCalculated: true }),
  n(12, 40, 'SPECIAL', { majorCalculated: true }),
  n(12, 48, 'SPECIAL', { majorCalculated: true }),
  n(14, 24, 'SPECIAL', { majorCalculated: true }),
  n(14, 27, 'SPECIAL', { majorCalculated: true }),
  n(14, 32, 'SPECIAL', { majorCalculated: true }),
  n(14, 36, 'SPECIAL', { majorCalculated: true }),
  n(14, 40, 'SPECIAL', { majorCalculated: true }),
  n(14, 48, 'SPECIAL', { majorCalculated: true }),
  n(14, 56, 'SPECIAL', { majorCalculated: true }),
  // --- Fractional sizes ---
  f('1/4', 0.25, 20, 'STANDARD', { suffix: 'NC', partNo: 'DHC-1/4-20-5', ownedQty: 2, majorMax: 0.2489, majorMin: 0.2408, pdMax: 0.2164, pdMin: 0.2127, minorMax: 0.1876 }),
  f('1/4', 0.25, 24, 'SPECIAL'),
  f('1/4', 0.25, 27, 'SPECIAL'),
  f('1/4', 0.25, 28, 'STANDARD', { suffix: 'NF', partNo: 'DHC-1/4-28-5', ownedQty: 2, majorMax: 0.249, majorMin: 0.2425, pdMax: 0.2258, pdMin: 0.2225, minorMax: 0.2052 }),
  f('1/4', 0.25, 32, 'SPECIAL'),
  f('1/4', 0.25, 36, 'SPECIAL', { ownedQty: 3 }),
  f('1/4', 0.25, 40, 'SPECIAL'),
  f('1/4', 0.25, 48, 'SPECIAL'),
  f('1/4', 0.25, 56, 'SPECIAL'),
  f('5/16', 0.3125, 18, 'STANDARD', { suffix: 'NC', partNo: 'DHC-5/16-18-5', ownedQty: 1, majorMax: 0.3113, majorMin: 0.3026, pdMax: 0.2752, pdMin: 0.2712, minorMax: 0.2431 }),
  f('5/16', 0.3125, 20, 'SPECIAL'),
  f('5/16', 0.3125, 24, 'STANDARD', { suffix: 'NF', partNo: 'DHC-5/16-24-5', ownedQty: 3, majorMax: 0.3114, majorMin: 0.3042, pdMax: 0.2843, pdMin: 0.2806, minorMax: 0.2603 }),
  f('5/16', 0.3125, 27, 'SPECIAL', { ownedQty: 2 }),
  f('5/16', 0.3125, 28, 'SPECIAL'),
  f('5/16', 0.3125, 32, 'SPECIAL'),
  f('5/16', 0.3125, 36, 'SPECIAL'),
  f('5/16', 0.3125, 40, 'SPECIAL'),
  f('5/16', 0.3125, 48, 'SPECIAL'),
  f('3/8', 0.375, 32, 'SPECIAL', { ownedQty: 2 }),
  // --- Metric sizes ---
  m(1.0, 0.25), m(1.1, 0.25), m(1.2, 0.25), m(1.4, 0.3), m(1.6, 0.35), m(1.8, 0.35),
  m(2.0, 0.4), m(2.2, 0.45), m(2.5, 0.45), m(3.0, 0.5), m(3.5, 0.6), m(4.0, 0.7),
  m(4.5, 0.75), m(5.0, 0.8, { ownedQty: 2 }), m(6.0, 1.0), m(7.0, 1.0),
];

type FilterType = 'ALL' | ChaserType;

const TYPE_COLORS: Record<ChaserType, { fg: string; bg: string; border: string }> = {
  STANDARD: { fg: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  SPECIAL: { fg: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
  METRIC: { fg: '#00f0ff', bg: 'rgba(0, 240, 255, 0.12)', border: 'rgba(0, 240, 255, 0.35)' },
};

const fmtIn = (v: number) => v.toFixed(4);
const fmtMm = (v: number) => v.toFixed(3);

export const GeometricDieHead: React.FC = () => {
  const { unit } = useUnit();
  const [typeFilter, setTypeFilter] = useState<FilterType>(unit === 'metric' ? 'METRIC' : 'ALL');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('f1-4-20');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
    return DIE_CHASERS.filter(c => {
      if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
      if (ownedOnly && c.ownedQty === 0) return false;
      if (!q) return true;
      const hay = `${c.nominal}${c.partNo ?? ''}${c.suffix ?? ''}${c.majorBasic}`.toLowerCase().replace(/\s+/g, '');
      return hay.includes(q);
    });
  }, [typeFilter, ownedOnly, searchQuery]);

  const sel = useMemo(() => DIE_CHASERS.find(c => c.id === selectedId) || DIE_CHASERS[0], [selectedId]);

  const ownedCount = DIE_CHASERS.filter(c => c.ownedQty > 0).length;
  const standardCount = DIE_CHASERS.filter(c => c.type === 'STANDARD').length;

  // --- Derived geometry for the selected chaser ---
  const isMetric = sel.type === 'METRIC';
  // Pitch in the thread's native unit (inches for inch threads, mm for metric)
  const pitch = isMetric ? sel.tpiOrPitch : 1 / sel.tpiOrPitch;
  // Basic pitch & minor diameters (60° thread form): d2 = d − 0.6495P, d3 = d − 1.2269P
  const pdBasic = sel.majorBasic - 0.649519 * pitch;
  const minorBasic = sel.majorBasic - 1.226869 * pitch;
  const threadDepth = 0.613435 * pitch;
  // Three-wire measurement: best wire W = 0.57735P, M = E + 3W − 0.86603P
  const bestWire = 0.57735 * pitch;
  const wireConst = 3 * bestWire - 0.866025 * pitch;
  const mowMax = sel.pdMax !== undefined ? sel.pdMax + wireConst : pdBasic + wireConst;
  const mowMin = sel.pdMin !== undefined ? sel.pdMin + wireConst : undefined;
  const hasLimits = sel.majorMax !== undefined;
  // Blank (rod) diameter guidance: within major limits when known, else just under basic
  const blankMax = sel.majorMax ?? sel.majorBasic - 0.05 * pitch;
  const blankMin = sel.majorMin ?? sel.majorBasic - 0.15 * pitch;

  const dual = (native: number, decimals: { in: number; mm: number } = { in: 4, mm: 3 }) => {
    const inches = isMetric ? native / 25.4 : native;
    const mm = isMetric ? native : native * 25.4;
    return unit === 'metric'
      ? `${mm.toFixed(decimals.mm)} mm`
      : `${inches.toFixed(decimals.in)}"`;
  };
  const dualSub = (native: number) => {
    const inches = isMetric ? native / 25.4 : native;
    const mm = isMetric ? native : native * 25.4;
    return unit === 'metric' ? `${fmtIn(inches)}"` : `${fmtMm(mm)} mm`;
  };

  const typeColor = TYPE_COLORS[sel.type];

  const specRow = (label: string, native: number | undefined, opts: { accent?: string; calc?: boolean } = {}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}{opts.calc && <span style={{ color: '#c084fc', marginLeft: '6px', fontSize: '0.7rem' }}>CALC</span>}
      </span>
      {native === undefined ? (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>—</span>
      ) : (
        <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
          <strong style={{ color: opts.accent ?? '#fff', fontSize: '0.95rem' }}>{dual(native)}</strong>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{dualSub(native)}</span>
        </span>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            GEOMETRIC 5/16" DIE HEADS (D, DS, DSA, DJ) // CHASER INDEX & THREAD LIMITS
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Geometric Die Head Chaser Selector
          </h2>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 14px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#fff' }}>{DIE_CHASERS.length}</strong> sizes
          </div>
          <div style={{ padding: '6px 14px', borderRadius: '8px', background: TYPE_COLORS.STANDARD.bg, border: `1px solid ${TYPE_COLORS.STANDARD.border}`, fontSize: '0.82rem', color: TYPE_COLORS.STANDARD.fg }}>
            <strong>{standardCount}</strong> standard
          </div>
          <div style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.35)', fontSize: '0.82rem', color: '#00ff80' }}>
            <strong>{ownedCount}</strong> owned
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>

        {/* Left Card: Detail / Calculator Panel */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)' }}>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SELECTED CHASER SET
              </span>
              <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {sel.nominal}{sel.suffix ? ` (${sel.suffix})` : ''}
              </h3>
              {sel.partNo && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>P/N {sel.partNo}</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <span style={{ padding: '4px 12px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: typeColor.fg, background: typeColor.bg, border: `1px solid ${typeColor.border}` }}>
                {sel.type === 'SPECIAL' ? 'SPECIAL ORDER' : sel.type}
              </span>
              {sel.ownedQty > 0 ? (
                <span style={{ padding: '4px 12px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: '#00ff80', background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.35)' }}>
                  ✓ OWNED{sel.ownedQty > 1 ? ` × ${sel.ownedQty}` : ''}
                </span>
              ) : (
                <span style={{ padding: '4px 12px', borderRadius: '14px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)' }}>
                  NOT OWNED
                </span>
              )}
            </div>
          </div>

          {/* SVG: blank rod → threaded end with callouts */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: `2px solid ${typeColor.border}`, padding: '18px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              BLANK & THREAD — DIE HEAD PASS
            </div>
            <svg viewBox="0 0 340 110" style={{ width: '100%', height: '110px', marginTop: '12px' }}>
              <defs>
                <linearGradient id="dieRodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#64748b" />
                  <stop offset="50%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              {/* Blank rod */}
              <rect x="15" y="38" width="140" height="34" fill="url(#dieRodGrad)" stroke="#475569" strokeWidth="1" rx="2" />
              {/* Threaded section (zigzag crest profile) */}
              <path
                d={`M 155 38 ${Array.from({ length: 11 }, (_, i) => `L ${155 + i * 16 + 8} 42 L ${155 + i * 16 + 16} 38`).join(' ')} L 331 38 L 331 72 ${Array.from({ length: 11 }, (_, i) => `L ${331 - i * 16 - 8} 68 L ${331 - i * 16 - 16} 72`).join(' ')} L 155 72 Z`}
                fill="url(#dieRodGrad)"
                stroke={typeColor.fg}
                strokeWidth="1.5"
              />
              {/* Blank dia callout */}
              <line x1="15" y1="30" x2="155" y2="30" stroke="#00ff80" strokeWidth="1" />
              <text x="85" y="25" fill="#00ff80" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                BLANK Ø {dual(blankMin)} – {dual(blankMax)}
              </text>
              {/* Major dia callout */}
              <line x1="243" y1="84" x2="331" y2="84" stroke={typeColor.fg} strokeWidth="1" />
              <text x="287" y="97" fill={typeColor.fg} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                MAJOR Ø {dual(sel.majorBasic)}
              </text>
              {/* Pitch callout */}
              <text x="199" y="97" fill="var(--text-muted)" fontSize="9" textAnchor="middle" fontFamily="var(--font-mono)">
                {isMetric ? `P = ${pitch} mm` : `${sel.tpiOrPitch} TPI`}
              </text>
            </svg>
          </div>

          {/* Spec Table */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '14px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              {hasLimits ? 'CLASS 2A EXTERNAL THREAD LIMITS' : 'BASIC THREAD GEOMETRY (CALCULATED)'}
            </div>
            {specRow(`Major Ø Basic`, sel.majorBasic, { accent: typeColor.fg, calc: sel.majorCalculated })}
            {hasLimits && specRow('Major Ø Max', sel.majorMax)}
            {hasLimits && specRow('Major Ø Min', sel.majorMin)}
            {specRow('Pitch Ø Max', sel.pdMax ?? (hasLimits ? undefined : pdBasic), { accent: '#00f0ff', calc: sel.pdMax === undefined })}
            {hasLimits ? specRow('Pitch Ø Min', sel.pdMin) : specRow('Minor Ø Basic', minorBasic, { calc: true })}
            {hasLimits && specRow('Minor Ø Max', sel.minorMax)}
            {specRow(isMetric ? 'Pitch (P)' : `Pitch (1/${sel.tpiOrPitch} TPI)`, pitch)}
            {specRow('Thread Depth (0.6134·P)', threadDepth, { calc: true })}
          </div>

          {/* 3-Wire Measurement */}
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '14px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              3-WIRE PITCH Ø CHECK
            </div>
            {specRow('Best Wire Size (0.57735·P)', bestWire, { accent: '#00f0ff' })}
            {specRow('Measure Over Wires Max', mowMax, { calc: sel.pdMax === undefined })}
            {mowMin !== undefined && specRow('Measure Over Wires Min', mowMin)}
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              M = E + 3W − 0.86603·P. Thread cut by the die head is in tolerance when the
              over-wire reading falls {mowMin !== undefined ? 'between Min and Max' : 'at or below Max'}.
            </p>
          </div>

          {/* Blank guidance */}
          <div style={{ background: 'rgba(0, 255, 128, 0.05)', border: '1px solid rgba(0, 255, 128, 0.2)', padding: '14px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#00ff80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              BLANK (ROD) DIAMETER
            </div>
            {specRow('Turn Blank To (Max)', blankMax, { accent: '#00ff80', calc: !hasLimits })}
            {specRow('Turn Blank To (Min)', blankMin, { calc: !hasLimits })}
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {hasLimits
                ? 'Blank must not exceed the major diameter limits — crests form at blank size, so turn the rod inside the Major Ø Max/Min window before running the die head.'
                : 'Limit data not recorded for this size — range approximated at 5–15% of pitch under basic major. Turn a test blank and verify with the 3-wire check above.'}
            </p>
          </div>
        </div>

        {/* Right Card: Search, Filters & Index */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Type Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              {(['ALL', 'STANDARD', 'SPECIAL', 'METRIC'] as FilterType[]).map(t => {
                const active = typeFilter === t;
                const color = t === 'ALL' ? '#fff' : TYPE_COLORS[t as ChaserType].fg;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    style={{
                      padding: '7px 14px',
                      border: 'none',
                      borderRadius: '6px',
                      background: active ? (t === 'ALL' ? 'rgba(255,255,255,0.15)' : TYPE_COLORS[t as ChaserType].bg) : 'transparent',
                      color: active ? color : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: active && t !== 'ALL' ? `inset 0 0 0 1px ${TYPE_COLORS[t as ChaserType].border}` : 'none'
                    }}
                  >
                    {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setOwnedOnly(o => !o)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: ownedOnly ? 'rgba(0, 255, 128, 0.5)' : 'var(--border-color)',
                background: ownedOnly ? 'rgba(0, 255, 128, 0.12)' : 'var(--bg-primary)',
                color: ownedOnly ? '#00ff80' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ✓ Owned Only
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search chaser (e.g., 1/4-28, #10, M 5, DHC-8-32)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-precision"
              style={{ width: '100%', paddingLeft: '38px' }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Chaser List */}
          <div style={{
            maxHeight: '560px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            padding: '8px'
          }}>
            {filtered.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No chasers match the current filters.
              </div>
            )}
            {filtered.map(c => {
              const isSelected = c.id === selectedId;
              const tc = TYPE_COLORS[c.type];
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: isSelected ? `linear-gradient(90deg, ${tc.bg}, transparent)` : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? tc.border : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ fontSize: '1rem', color: isSelected ? tc.fg : '#fff', minWidth: '96px' }}>
                      {c.nominal}
                    </strong>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.5px', color: tc.fg, background: tc.bg, border: `1px solid ${tc.border}` }}>
                      {c.type === 'SPECIAL' ? 'SPECIAL' : c.type}{c.suffix ? ` · ${c.suffix}` : ''}
                    </span>
                    {c.ownedQty > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, color: '#00ff80', background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.35)' }}>
                        ✓{c.ownedQty > 1 ? ` ×${c.ownedQty}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>MAJOR Ø</span>
                    <strong style={{ color: isSelected ? tc.fg : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {c.type === 'METRIC' ? `${c.majorBasic.toFixed(2)} mm` : `${c.majorBasic.toFixed(4)}"`}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            <strong style={{ color: TYPE_COLORS.STANDARD.fg }}>Standard</strong> sets are regular catalog chasers for
            Geometric 5/16" D, DS, DSA & DJ die heads (~$165/set of 4). <strong style={{ color: TYPE_COLORS.SPECIAL.fg }}>Special</strong> sizes
            are special-order grinds. <strong style={{ color: TYPE_COLORS.METRIC.fg }}>Metric</strong> sizes per ISO coarse series.
          </p>
        </div>

      </div>
    </div>
  );
};

export default GeometricDieHead;
