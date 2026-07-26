import React, { useMemo, useState } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Hardness Conversion — ASTM E140 / SAE J417 correlation for non-austenitic
// steel. Rockwell C (HRC), Rockwell B (HRB), Brinell 3000 kgf 10 mm ball (HB),
// Vickers (HV) and approximate tensile strength.
//
// Notes on validity, per the published tables:
//  - HB (3000 kgf standard ball) is not defined above ~HRC 58 (ball indenter
//    flattens against the work) — shown as "—" there.
//  - Tensile correlation is only tabulated below ~HRC 55 — "—" above.
//  - HRB rows (100 → 60) use HV ≈ HB in the soft range, per the standard table.
// ---------------------------------------------------------------------------

export interface HardnessRow {
  hrc?: number;
  hrb?: number;
  /** Brinell, 3000 kgf, 10 mm standard ball */
  hb?: number;
  /** Vickers (backbone column — defined on every row) */
  hv: number;
  /** Approximate tensile strength, ksi */
  tensileKsi?: number;
}

const c = (hrc: number, hv: number, hb?: number, tensileKsi?: number): HardnessRow =>
  ({ hrc, hv, hb, tensileKsi });
const b = (hrb: number, hbhv: number, tensileKsi: number): HardnessRow =>
  ({ hrb, hb: hbhv, hv: hbhv, tensileKsi });

export const HARDNESS_TABLE: HardnessRow[] = [
  // --- Rockwell C range (HRC 68 → 20, 1-point steps) ---
  c(68, 940), c(67, 900), c(66, 865), c(65, 832), c(64, 800),
  c(63, 772), c(62, 746), c(61, 720), c(60, 697), c(59, 674),
  c(58, 653, 615), c(57, 633, 595), c(56, 613, 577),
  c(55, 595, 560, 298), c(54, 577, 543, 288), c(53, 560, 525, 279),
  c(52, 544, 512, 269), c(51, 528, 496, 258), c(50, 513, 481, 247),
  c(49, 498, 469, 238), c(48, 484, 455, 229), c(47, 471, 443, 221),
  c(46, 458, 432, 214), c(45, 446, 421, 207), c(44, 434, 409, 200),
  c(43, 423, 400, 194), c(42, 412, 390, 188), c(41, 402, 381, 185),
  c(40, 392, 371, 182), c(39, 382, 362, 177), c(38, 372, 353, 173),
  c(37, 363, 344, 168), c(36, 354, 336, 163), c(35, 345, 327, 159),
  c(34, 336, 319, 154), c(33, 327, 311, 150), c(32, 318, 301, 146),
  c(31, 310, 294, 142), c(30, 302, 286, 138), c(29, 294, 279, 135),
  c(28, 286, 271, 132), c(27, 279, 264, 129), c(26, 272, 258, 126),
  c(25, 266, 253, 123), c(24, 260, 247, 120), c(23, 254, 243, 117),
  c(22, 248, 237, 115), c(21, 243, 231, 112), c(20, 238, 226, 110),
  // --- Rockwell B range (HRB 100 → 60, whole-point steps) ---
  b(100, 240, 116), b(99, 234, 113), b(98, 228, 110), b(97, 222, 107),
  b(96, 216, 105), b(95, 210, 102), b(94, 205, 99), b(93, 200, 97),
  b(92, 195, 94), b(91, 190, 92), b(90, 185, 90), b(89, 180, 87),
  b(88, 176, 85), b(87, 172, 83), b(86, 169, 82), b(85, 165, 80),
  b(84, 162, 78), b(83, 159, 77), b(82, 156, 76), b(81, 153, 74),
  b(80, 150, 73), b(79, 147, 71), b(78, 144, 70), b(77, 141, 68),
  b(76, 139, 67), b(75, 137, 66), b(74, 135, 65), b(73, 132, 64),
  b(72, 130, 63), b(71, 127, 61), b(70, 125, 60), b(69, 123, 60),
  b(68, 121, 59), b(67, 119, 58), b(66, 117, 57), b(65, 116, 56),
  b(64, 114, 55), b(63, 112, 54), b(62, 110, 53), b(61, 108, 52),
  b(60, 107, 52),
];

type ScaleKey = 'hrc' | 'hrb' | 'hb' | 'hv';

const SCALES: { key: ScaleKey; label: string; name: string; decimals: number; step: string }[] = [
  { key: 'hrc', label: 'HRC', name: 'Rockwell C · 150 kgf brale', decimals: 1, step: '0.5' },
  { key: 'hrb', label: 'HRB', name: 'Rockwell B · 100 kgf 1/16" ball', decimals: 1, step: '0.5' },
  { key: 'hb', label: 'HB', name: 'Brinell · 3000 kgf 10 mm ball', decimals: 0, step: '1' },
  { key: 'hv', label: 'HV', name: 'Vickers · diamond pyramid', decimals: 0, step: '1' },
];

interface Converted {
  inRange: boolean;
  min: number;
  max: number;
  hrc?: number;
  hrb?: number;
  hb?: number;
  hv?: number;
  tensileKsi?: number;
}

/**
 * Locate the input value in the correlation table on its own column and
 * linearly interpolate between the two bracketing rows; every output column
 * is read with the same interpolation factor.
 */
const convertHardness = (scale: ScaleKey, v: number): Converted => {
  const rows = HARDNESS_TABLE.filter(r => r[scale] !== undefined);
  const vals = rows.map(r => r[scale] as number);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  if (!isFinite(v) || v < min || v > max) return { inRange: false, min, max };

  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i][scale] as number;
    const bv = rows[i + 1][scale] as number;
    if ((v - a) * (v - bv) <= 0) {
      const t = a === bv ? 0 : (v - a) / (bv - a);
      const pick = (k: keyof HardnessRow): number | undefined => {
        const ka = rows[i][k];
        const kb = rows[i + 1][k];
        if (ka !== undefined && kb !== undefined) return ka + t * (kb - ka);
        if (t <= 0.0005 && ka !== undefined) return ka;
        if (t >= 0.9995 && kb !== undefined) return kb;
        return undefined;
      };
      return {
        inRange: true, min, max,
        hrc: pick('hrc'), hrb: pick('hrb'), hb: pick('hb'),
        hv: pick('hv'), tensileKsi: pick('tensileKsi'),
      };
    }
  }
  return { inRange: false, min, max };
};

// Spectrum position: HRB 60–100 occupies the left 35%, HRC 20–68 the right 65%
const spectrumPos = (hrcV?: number, hrbV?: number): number | undefined => {
  if (hrcV !== undefined) return 0.35 + Math.min(1, Math.max(0, (hrcV - 20) / 48)) * 0.65;
  if (hrbV !== undefined) return Math.min(1, Math.max(0, (hrbV - 60) / 40)) * 0.35;
  return undefined;
};

const ANCHORS: { label: string; sub: string; pos: number }[] = [
  { label: 'Mild steel', sub: 'HRB 70', pos: spectrumPos(undefined, 70)! },
  { label: '4140 HT', sub: 'HRC 30', pos: spectrumPos(30)! },
  { label: 'Tool steel', sub: 'HRC 60', pos: spectrumPos(60)! },
  { label: 'File', sub: 'HRC 65', pos: spectrumPos(65)! },
];

const TICKS: { pos: number; label: string }[] = [
  { pos: 0, label: 'HRB 60' },
  { pos: 0.175, label: 'HRB 80' },
  { pos: 0.35, label: 'HRC 20' },
  { pos: spectrumPos(30)!, label: 'HRC 30' },
  { pos: spectrumPos(40)!, label: 'HRC 40' },
  { pos: spectrumPos(50)!, label: 'HRC 50' },
  { pos: spectrumPos(60)!, label: 'HRC 60' },
  { pos: 1, label: 'HRC 68' },
];

const PRESETS: { label: string; scale: ScaleKey; value: string }[] = [
  { label: 'Annealed 1018 · HRB 71', scale: 'hrb', value: '71' },
  { label: '4140 Q&T · HRC 30', scale: 'hrc', value: '30' },
  { label: 'Die block D2 · HRC 58', scale: 'hrc', value: '58' },
  { label: 'HSS tool · HRC 64', scale: 'hrc', value: '64' },
];

export const HardnessConversion: React.FC = () => {
  const { unit } = useUnit();
  const [scale, setScale] = useState<ScaleKey>('hrc');
  const [value, setValue] = useState<string>('45');

  const scaleDef = SCALES.find(s => s.key === scale)!;
  const numValue = parseFloat(value);

  const conv = useMemo(() => convertHardness(scale, numValue), [scale, numValue]);

  // Switching scales carries the current reading over in the new scale
  const applyScale = (k: ScaleKey) => {
    if (k !== scale) {
      const cur = conv[k];
      if (cur !== undefined) {
        const def = SCALES.find(s => s.key === k)!;
        setValue(cur.toFixed(def.decimals));
      }
      setScale(k);
    }
  };

  const applyPreset = (p: { scale: ScaleKey; value: string }) => {
    setScale(p.scale);
    setValue(p.value);
  };

  const ksi = conv.tensileKsi;
  const mpa = ksi !== undefined ? ksi * 6.895 : undefined;
  const pos = spectrumPos(conv.hrc, conv.hrb);

  const fmtRange = (n: number) => (Number.isInteger(n) ? n.toFixed(0) : n.toFixed(1));

  const tile = (
    label: string, sub: string, val: number | undefined, decimals: number,
    isInput: boolean, note: string,
  ) => (
    <div
      key={label}
      title={val === undefined ? note : undefined}
      style={{
        background: 'var(--bg-primary)',
        border: `1px solid ${isInput ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
        borderRadius: '8px',
        padding: '12px 14px',
        position: 'relative',
      }}
    >
      {isInput && (
        <span style={{ position: 'absolute', top: '8px', right: '10px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--accent-cyan)' }}>
          INPUT
        </span>
      )}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 800, color: val === undefined ? 'var(--text-muted)' : '#f4902c', lineHeight: 1.25 }}>
        {val === undefined ? '—' : val.toFixed(decimals)}
      </div>
      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {val === undefined ? note : sub}
      </div>
    </div>
  );

  const tensileBlock = (v: number, unitLabel: string, primary: boolean) => (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: primary ? '2rem' : '1.35rem',
        fontWeight: 800,
        color: primary ? '#f4902c' : 'var(--text-primary)',
        textShadow: primary ? '0 0 18px rgba(244, 144, 44, 0.35)' : 'none',
      }}>
        {Math.round(v)}
      </div>
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
        {unitLabel}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          💎 Hardness Conversion <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// HRC · HRB · Brinell · Vickers · Tensile</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            ASTM <strong style={{ color: '#fff' }}>E140</strong> steel
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.35)', fontSize: '0.78rem', color: '#38bdf8' }}>
            <strong>{HARDNESS_TABLE.length}</strong> table rows
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Left Card: Input */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              🧪 Hardness Reading
            </h3>
          </div>

          {/* Scale selector chips */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Test Scale
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {SCALES.map(s => {
                const active = scale === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => applyScale(s.key)}
                    style={{
                      padding: '10px 6px',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      background: active ? 'var(--accent-cyan)' : 'transparent',
                      color: active ? '#000' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              {scaleDef.name}
            </div>
          </div>

          {/* Value input */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Measured Value
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={value}
                step={scaleDef.step}
                onChange={(e) => setValue(e.target.value)}
                className="input-precision"
              />
              <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {scaleDef.label}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              Table span: {fmtRange(conv.min)} – {fmtRange(conv.max)} {scaleDef.label}
            </div>
          </div>

          {/* Out-of-range warning */}
          {!conv.inRange && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '12px 16px' }}>
              <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
                ⚠ Out of correlation range
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {isFinite(numValue)
                  ? <>The steel correlation table covers <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)' }}>{fmtRange(conv.min)} – {fmtRange(conv.max)} {scaleDef.label}</strong>. Enter a value inside that span, or switch scales.</>
                  : <>Enter a numeric hardness value to convert.</>}
              </p>
            </div>
          )}

          {/* Quick-reference presets */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Quick Reference
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESETS.map(p => {
                const active = scale === p.scale && value === p.value;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    style={{
                      background: active ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: active ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Card: Equivalents */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ASTM E140 EQUIVALENTS — NON-AUSTENITIC STEEL
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>
              {conv.inRange && isFinite(numValue)
                ? `${scaleDef.label} ${numValue} Converts To`
                : 'Awaiting Valid Reading'}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {tile('Rockwell C', 'HRC · 150 kgf brale', conv.hrc, 1, scale === 'hrc', 'Outside the HRC 20–68 span')}
            {tile('Rockwell B', 'HRB · 100 kgf 1/16" ball', conv.hrb, 1, scale === 'hrb', 'Outside the HRB 60–100 span')}
            {tile('Brinell', 'HB · 3000 kgf 10 mm ball', conv.hb, 0, scale === 'hb', 'Ball indenter limit above ~HRC 58')}
            {tile('Vickers', 'HV · diamond pyramid', conv.hv, 0, scale === 'hv', 'Outside the correlation table')}
          </div>

          {/* Tensile strength */}
          <div style={{ background: 'rgba(244, 144, 44, 0.06)', border: '1px solid rgba(244, 144, 44, 0.25)', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>
              Approx. Tensile Strength
            </div>
            {ksi !== undefined && mpa !== undefined ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {unit === 'metric' ? tensileBlock(mpa, 'MPa', true) : tensileBlock(ksi, 'ksi', true)}
                <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.1)' }} />
                {unit === 'metric' ? tensileBlock(ksi, 'ksi', false) : tensileBlock(mpa, 'MPa', false)}
              </div>
            ) : (
              <div title="Tensile correlation is not published above ~HRC 55" style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-muted)' }}>—</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {conv.inRange ? 'Not correlated above ~HRC 55' : 'No valid reading'}
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>
              MPa = ksi × 6.895. Empirical correlation for carbon &amp; alloy steel only — verify by test where strength matters.
            </p>
          </div>
        </div>
      </div>

      {/* Hardness Spectrum Bar */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '18px 24px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Hardness Spectrum — Soft → Hard
          </span>
          <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 700 }}>
            {pos !== undefined
              ? (conv.hrc !== undefined ? `● HRC ${conv.hrc.toFixed(1)}` : `● HRB ${conv.hrb!.toFixed(1)}`) + (conv.hv !== undefined ? ` · HV ${conv.hv.toFixed(0)}` : '')
              : '● No valid reading'}
          </span>
        </div>

        <div style={{ position: 'relative', margin: '52px 24px 34px' }}>
          {/* Gradient bar */}
          <div style={{
            height: '14px',
            borderRadius: '7px',
            background: 'linear-gradient(90deg, #00ff80 0%, #f59e0b 40%, #f4902c 70%, #ef4444 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.35)',
          }} />

          {/* Material anchor markers (above) */}
          {ANCHORS.map(a => (
            <div key={a.label} style={{ position: 'absolute', left: `${a.pos * 100}%`, bottom: '100%', transform: 'translateX(-50%)', textAlign: 'center', marginBottom: '3px' }}>
              <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>{a.label}</div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{a.sub}</div>
              <div style={{ width: '1px', height: '8px', background: 'rgba(255, 255, 255, 0.4)', margin: '2px auto 0' }} />
            </div>
          ))}

          {/* Scale ticks (below) */}
          {TICKS.map(t => (
            <div key={t.label} style={{ position: 'absolute', left: `${t.pos * 100}%`, top: '100%', transform: 'translateX(-50%)', textAlign: 'center' }}>
              <div style={{ width: '1px', height: '6px', background: 'rgba(255, 255, 255, 0.25)', margin: '0 auto 2px' }} />
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{t.label}</div>
            </div>
          ))}

          {/* Live position indicator */}
          {pos !== undefined && (
            <div style={{
              position: 'absolute',
              left: `${pos * 100}%`,
              top: '-7px',
              bottom: '-7px',
              width: '3px',
              transform: 'translateX(-50%)',
              background: '#fff',
              borderRadius: '2px',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.85), 0 0 22px rgba(244, 144, 44, 0.6)',
              transition: 'left 0.25s ease',
            }} />
          )}
        </div>
      </div>

      {/* Footer: tool description (kept out of the header per site convention) */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          HARDNESS CONVERSION // ROCKWELL C & B · BRINELL 3000 KGF · VICKERS · APPROX. TENSILE (ASTM E140)
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Converts a hardness reading between HRC, HRB, Brinell (3000 kgf, 10 mm ball) and Vickers by interpolating the
          standard ASTM E140 correlation table for non-austenitic steel. These conversions are <strong style={{ color: '#f59e0b' }}>empirical</strong>,
          not exact math — different tables apply to aluminum, copper alloys, and austenitic stainless, so do not use this
          chart for those materials. Brinell values end near <span style={{ fontFamily: 'var(--font-mono)', color: '#c084fc' }}>HRC 58</span> because
          the 3000 kgf ball indentation is no longer valid on harder work, and the tensile-strength column is an
          approximation tabulated only below about <span style={{ fontFamily: 'var(--font-mono)', color: '#c084fc' }}>HRC 55</span> —
          treat it as an estimate for steel, never as a substitute for a pull test.
        </p>
      </div>
    </div>
  );
};

export default HardnessConversion;
