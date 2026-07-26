import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// ISO 286 Fits & Tolerances — hole-basis system, formula method.
// All internal math is done in mm (dimensions) and µm (deviations).
// ---------------------------------------------------------------------------

type ShaftLetter = 'c' | 'd' | 'f' | 'g' | 'h' | 'k' | 'n' | 'p' | 's' | 'u';
type FitFamily = 'clearance' | 'transition' | 'interference';

interface FitDef {
  code: string;
  name: string;
  holeGrade: number;
  shaftLetter: ShaftLetter;
  shaftGrade: number;
  family: FitFamily;
}

const FITS: FitDef[] = [
  { code: 'H11/c11', name: 'Loose Running', holeGrade: 11, shaftLetter: 'c', shaftGrade: 11, family: 'clearance' },
  { code: 'H9/d9', name: 'Free Running', holeGrade: 9, shaftLetter: 'd', shaftGrade: 9, family: 'clearance' },
  { code: 'H8/f7', name: 'Close Running', holeGrade: 8, shaftLetter: 'f', shaftGrade: 7, family: 'clearance' },
  { code: 'H7/g6', name: 'Sliding', holeGrade: 7, shaftLetter: 'g', shaftGrade: 6, family: 'clearance' },
  { code: 'H7/h6', name: 'Locational Clearance', holeGrade: 7, shaftLetter: 'h', shaftGrade: 6, family: 'clearance' },
  { code: 'H7/k6', name: 'Locational Transition', holeGrade: 7, shaftLetter: 'k', shaftGrade: 6, family: 'transition' },
  { code: 'H7/n6', name: 'Transition (Keying)', holeGrade: 7, shaftLetter: 'n', shaftGrade: 6, family: 'transition' },
  { code: 'H7/p6', name: 'Locational Interference', holeGrade: 7, shaftLetter: 'p', shaftGrade: 6, family: 'interference' },
  { code: 'H7/s6', name: 'Medium Drive', holeGrade: 7, shaftLetter: 's', shaftGrade: 6, family: 'interference' },
  { code: 'H7/u6', name: 'Force / Shrink', holeGrade: 7, shaftLetter: 'u', shaftGrade: 6, family: 'interference' },
];

const FAMILY_COLORS: Record<FitFamily, { fg: string; bg: string; border: string }> = {
  clearance: { fg: '#00ff80', bg: 'rgba(0, 255, 128, 0.1)', border: 'rgba(0, 255, 128, 0.35)' },
  transition: { fg: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.4)' },
  interference: { fg: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)' },
};

// ISO 286 standard diameter steps (mm)
const STEPS: [number, number][] = [
  [1, 3], [3, 6], [6, 10], [10, 18], [18, 30], [30, 50], [50, 80],
  [80, 120], [120, 180], [180, 250], [250, 315], [315, 400], [400, 500],
];

/** Geometric mean D of the diameter step containing the nominal size. */
const geoMeanD = (nominal: number): number => {
  const step = STEPS.find(([lo, hi]) => nominal > lo && nominal <= hi) ?? STEPS[0];
  return Math.sqrt(step[0] * step[1]);
};

const IT_FACTORS: Record<number, number> = { 5: 7, 6: 10, 7: 16, 8: 25, 9: 40, 10: 64, 11: 100 };

/** IT tolerance in µm for a grade, from the standard tolerance unit i. */
const itUm = (grade: number, D: number): number => {
  const i = 0.45 * Math.cbrt(D) + 0.001 * D; // µm
  return Math.round(IT_FACTORS[grade] * i);
};

/** Fundamental deviation of the shaft in µm (signed). c/d/f/g/h return es; k/n/p/s/u return ei. */
const fundamentalDeviation = (letter: ShaftLetter, D: number): number => {
  switch (letter) {
    case 'c': return -Math.round(D <= 40 ? 52 * Math.pow(D, 0.2) : 95 + 0.8 * D);
    case 'd': return -Math.round(16 * Math.pow(D, 0.44));
    case 'f': return -Math.round(5.5 * Math.pow(D, 0.41));
    case 'g': return -Math.round(2.5 * Math.pow(D, 0.34));
    case 'h': return 0;
    case 'k': return Math.round(0.6 * Math.cbrt(D));
    case 'n': return Math.round(5 * Math.pow(D, 0.34));
    case 'p': return Math.round(5.6 * Math.pow(D, 0.41));
    case 's': return Math.round(D <= 50 ? itUm(8, D) + 1 + 3 * (D / 50) : itUm(7, D) + 0.4 * D);
    case 'u': return Math.round(itUm(7, D) + D);
  }
};

const IS_UPPER_DEV: Record<ShaftLetter, boolean> = {
  c: true, d: true, f: true, g: true, h: true, k: false, n: false, p: false, s: false, u: false,
};

interface FitResult {
  D: number;
  itHole: number;
  itShaft: number;
  ES: number; EI: number;       // hole deviations, µm
  es: number; ei: number;       // shaft deviations, µm
  holeMax: number; holeMin: number;   // mm
  shaftMax: number; shaftMin: number; // mm
  maxClearUm: number; minClearUm: number; // µm (negative = interference)
  kind: FitFamily;
}

const computeFit = (nominalMm: number, fit: FitDef): FitResult => {
  const D = geoMeanD(nominalMm);
  const itHole = itUm(fit.holeGrade, D);
  const itShaft = itUm(fit.shaftGrade, D);
  const ES = itHole, EI = 0;
  const fd = fundamentalDeviation(fit.shaftLetter, D);
  const es = IS_UPPER_DEV[fit.shaftLetter] ? fd : fd + itShaft;
  const ei = IS_UPPER_DEV[fit.shaftLetter] ? fd - itShaft : fd;
  const holeMax = nominalMm + ES / 1000;
  const holeMin = nominalMm + EI / 1000;
  const shaftMax = nominalMm + es / 1000;
  const shaftMin = nominalMm + ei / 1000;
  const maxClearUm = ES - ei; // holeMax − shaftMin
  const minClearUm = EI - es; // holeMin − shaftMax
  const kind: FitFamily = minClearUm >= 0 ? 'clearance' : maxClearUm <= 0 ? 'interference' : 'transition';
  return { D, itHole, itShaft, ES, EI, es, ei, holeMax, holeMin, shaftMax, shaftMin, maxClearUm, minClearUm, kind };
};

export const FitsTolerances: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);
  const [nominalStr, setNominalStr] = useState<string>(() => (unit === 'imperial' ? '1.0000' : '25.000'));
  const [fitCode, setFitCode] = useState<string>('H7/g6');

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;
    const val = parseFloat(nominalStr) || 0;
    if (unit === 'metric' && oldUnit === 'imperial') {
      setNominalStr((val * 25.4).toFixed(3));
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setNominalStr((val / 25.4).toFixed(4));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const fit = FITS.find(f => f.code === fitCode) ?? FITS[3];
  const inputVal = parseFloat(nominalStr);
  const nominalMm = unit === 'imperial' ? inputVal * 25.4 : inputVal;
  const valid = Number.isFinite(nominalMm) && nominalMm >= 1 && nominalMm <= 500;
  const res = useMemo<FitResult | null>(
    () => (valid ? computeFit(nominalMm, fit) : null),
    [valid, nominalMm, fit]
  );

  const unitStr = unit === 'imperial' ? 'in' : 'mm';

  // --- Formatting helpers ---
  const um = (v: number) => `${v > 0 ? '+' : ''}${v} µm`;
  const dim = (mm: number) => (unit === 'metric' ? `${mm.toFixed(3)} mm` : `${(mm / 25.4).toFixed(5)}"`);
  const dimSub = (mm: number) => (unit === 'metric' ? '' : `${mm.toFixed(3)} mm`);
  const clr = (umVal: number) => {
    const mm = umVal / 1000;
    return unit === 'metric' ? `${mm.toFixed(3)} mm` : `${(mm / 25.4).toFixed(5)}"`;
  };

  const limitRow = (label: string, mm: number, accent: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
        <strong style={{ color: accent, fontSize: '0.95rem' }}>{dim(mm)}</strong>
        {dimSub(mm) && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{dimSub(mm)}</span>}
      </span>
    </div>
  );

  const devRow = (label: string, umVal: number) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{um(umVal)}</span>
    </div>
  );

  // --- SVG tolerance-zone diagram geometry ---
  const diag = useMemo(() => {
    if (!res) return null;
    const W = 560, H = 300;
    const left = 78, top = 40, bottom = H - 34;
    const devs = [res.ES, res.EI, res.es, res.ei, 0];
    const maxDev = Math.max(...devs);
    const minDev = Math.min(...devs);
    const range = Math.max(maxDev - minDev, 1);
    const scale = (bottom - top) / range;
    const y = (d: number) => top + (maxDev - d) * scale;
    const stepOpts = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500];
    const tickStep = stepOpts.find(s => range / s <= 7) ?? 500;
    const ticks: number[] = [];
    for (let t = Math.ceil(minDev / tickStep) * tickStep; t <= maxDev + 1e-9; t += tickStep) ticks.push(t);
    const holeX = left + 42, holeW = 128;
    const shaftX = holeX + holeW + 62, shaftW = 128;
    return { W, H, left, y, ticks, zeroY: y(0), holeX, holeW, shaftX, shaftW };
  }, [res]);

  const familyColor = FAMILY_COLORS[fit.family];
  const kindColor = res ? FAMILY_COLORS[res.kind] : familyColor;
  const dimText = { fontFamily: 'var(--font-mono)', fontWeight: 700 } as const;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🔧 Fits &amp; Tolerances <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// ISO 286 Hole-Basis</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#fff' }}>{fit.code}</strong> {fit.name}
          </div>
          {res && (
            <div style={{ padding: '4px 12px', borderRadius: '8px', background: kindColor.bg, border: `1px solid ${kindColor.border}`, fontSize: '0.78rem', color: kindColor.fg, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {res.kind} fit
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Input Card */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>⚙️ Nominal Size &amp; Fit</h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Nominal Diameter
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={nominalStr}
                step={unit === 'imperial' ? '0.0625' : '1'}
                min="0"
                onChange={(e) => setNominalStr(e.target.value)}
                className="input-precision"
              />
              <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {unitStr}
              </span>
            </div>
            {!valid && (
              <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '6px', padding: '8px 12px' }}>
                ⚠ Nominal size must be between 1 and 500 mm{unit === 'imperial' ? ' (0.0394" – 19.685")' : ''}.
              </p>
            )}
            {valid && unit === 'imperial' && res && (
              <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                = {nominalMm.toFixed(3)} mm (ISO 286 works in mm)
              </p>
            )}
          </div>

          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Standard Hole-Basis Fit
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
            {FITS.map(f => {
              const active = f.code === fit.code;
              const fc = FAMILY_COLORS[f.family];
              return (
                <button
                  key={f.code}
                  onClick={() => setFitCode(f.code)}
                  style={{
                    padding: '9px 10px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: active ? fc.border : 'var(--border-color)',
                    background: active ? fc.bg : 'var(--bg-primary)',
                    color: active ? fc.fg : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem', color: active ? fc.fg : '#fff' }}>
                    {f.code}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.7rem', letterSpacing: '0.3px' }}>{f.name}</span>
                </button>
              );
            })}
          </div>

          {res && (
            <div style={{ marginTop: '18px', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
                ISO 286 Formula Method
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Step Geometric Mean D</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>{res.D.toFixed(2)} mm</span>
              </div>
              {devRow(`Hole IT${fit.holeGrade}`, res.itHole)}
              {devRow(`Shaft IT${fit.shaftGrade}`, res.itShaft)}
            </div>
          )}
        </div>

        {/* Tolerance Zone Diagram Card */}
        <div className="glass-panel" style={{ padding: '22px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📊 Tolerance Zones</h3>
          </div>
          {res && diag ? (
            <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: `2px solid ${kindColor.border}`, padding: '10px 6px 4px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                DEVIATIONS FROM NOMINAL (µm)
              </div>
              <div style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '0.7rem', color: kindColor.fg, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>
                {fit.code} @ {nominalMm.toFixed(1)} mm
              </div>
              <svg viewBox={`0 0 ${diag.W} ${diag.H}`} style={{ width: '100%', height: 'auto', marginTop: '14px' }}>
                {/* µm scale */}
                {diag.ticks.map(t => (
                  <g key={t}>
                    <line x1={diag.left - 6} y1={diag.y(t)} x2={diag.W - 14} y2={diag.y(t)} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                    <text x={diag.left - 10} y={diag.y(t) + 3} fill="var(--text-muted, #94a3b8)" fontSize="9" textAnchor="end" style={dimText}>
                      {t > 0 ? `+${t}` : t}
                    </text>
                  </g>
                ))}
                {/* Zero line = nominal */}
                <line x1={diag.left - 6} y1={diag.zeroY} x2={diag.W - 14} y2={diag.zeroY} stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" strokeDasharray="10 4 3 4" />
                <text x={diag.W - 14} y={diag.zeroY - 5} fill="#fff" fontSize="9" textAnchor="end" style={dimText}>
                  ZERO LINE = Ø{nominalMm.toFixed(3)}
                </text>

                {/* Hole tolerance zone (blue) */}
                <rect
                  x={diag.holeX} y={diag.y(res.ES)}
                  width={diag.holeW} height={Math.max(diag.y(res.EI) - diag.y(res.ES), 2)}
                  fill="rgba(56, 189, 248, 0.28)" stroke="#38bdf8" strokeWidth="1.5"
                />
                <text x={diag.holeX + diag.holeW / 2} y={diag.y(res.ES) - 7} fill="#38bdf8" fontSize="10" textAnchor="middle" style={dimText}>
                  HOLE H{fit.holeGrade}
                </text>
                <text x={diag.holeX + diag.holeW + 5} y={diag.y(res.ES) + 4} fill="#38bdf8" fontSize="9" style={dimText}>
                  ES {um(res.ES)}
                </text>
                <text x={diag.holeX + diag.holeW + 5} y={diag.y(res.EI) + 12} fill="#38bdf8" fontSize="9" style={dimText}>
                  EI {um(res.EI)}
                </text>

                {/* Shaft tolerance zone (orange) */}
                <rect
                  x={diag.shaftX} y={diag.y(res.es)}
                  width={diag.shaftW} height={Math.max(diag.y(res.ei) - diag.y(res.es), 2)}
                  fill="rgba(244, 144, 44, 0.28)" stroke="#f4902c" strokeWidth="1.5"
                />
                <text x={diag.shaftX + diag.shaftW / 2} y={diag.y(res.es) - 7} fill="#f4902c" fontSize="10" textAnchor="middle" style={dimText}>
                  SHAFT {fit.shaftLetter}{fit.shaftGrade}
                </text>
                <text x={diag.shaftX + diag.shaftW + 5} y={diag.y(res.es) + 4} fill="#f4902c" fontSize="9" style={dimText}>
                  es {um(res.es)}
                </text>
                <text x={diag.shaftX + diag.shaftW + 5} y={diag.y(res.ei) + 12} fill="#f4902c" fontSize="9" style={dimText}>
                  ei {um(res.ei)}
                </text>
              </svg>
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Enter a valid nominal size (1 – 500 mm) to draw the tolerance zones.
            </div>
          )}

          {/* Fit Result */}
          {res && (
            <div style={{ marginTop: '16px', background: 'var(--bg-primary)', padding: '18px', borderRadius: 'var(--radius-md)', border: `2px solid ${kindColor.border}`, textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                Resulting Fit — <span style={{ color: kindColor.fg }}>{res.kind.toUpperCase()} FIT</span>
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {([
                  { label: res.maxClearUm >= 0 ? 'Max Clearance' : 'Max Interference', v: res.maxClearUm },
                  { label: res.minClearUm >= 0 ? 'Min Clearance' : 'Max Interference (tight)', v: res.minClearUm },
                ] as { label: string; v: number }[]).map(({ label, v }, idx) => (
                  <div key={idx}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>{label}</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: v >= 0 ? '#00ff80' : '#ef4444' }}>
                      {um(v)}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {clr(v)}{unit === 'imperial' ? ` · ${(v / 1000).toFixed(3)} mm` : ''}
                    </span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>
                Clearance = hole − shaft. Negative values indicate interference (press).
              </p>
            </div>
          )}
        </div>

        {/* Hole Limits Card */}
        {res && (
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>⭕ Hole H{fit.holeGrade}</h3>
              <span style={{ padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.4)' }}>
                BASIC HOLE
              </span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(56, 189, 248, 0.4)', textAlign: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Hole Dimension</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 800, color: '#f4902c' }}>
                {dim(res.holeMin)} <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>/</span> {dim(res.holeMax)}
              </div>
              {unit === 'imperial' && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {res.holeMin.toFixed(3)} / {res.holeMax.toFixed(3)} mm
                </span>
              )}
            </div>
            {devRow('Upper Deviation ES', res.ES)}
            {devRow('Lower Deviation EI', res.EI)}
            {limitRow('Max Hole Ø', res.holeMax, '#38bdf8')}
            {limitRow('Min Hole Ø', res.holeMin, '#38bdf8')}
          </div>
        )}

        {/* Shaft Limits Card */}
        {res && (
          <div className="glass-panel" style={{ padding: '22px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>🔩 Shaft {fit.shaftLetter}{fit.shaftGrade}</h3>
              <span style={{ padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: familyColor.fg, background: familyColor.bg, border: `1px solid ${familyColor.border}` }}>
                {fit.family.toUpperCase()}
              </span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(244, 144, 44, 0.4)', textAlign: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Shaft Dimension</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.7rem', fontWeight: 800, color: '#f4902c' }}>
                {dim(res.shaftMin)} <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>/</span> {dim(res.shaftMax)}
              </div>
              {unit === 'imperial' && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {res.shaftMin.toFixed(3)} / {res.shaftMax.toFixed(3)} mm
                </span>
              )}
            </div>
            {devRow('Upper Deviation es', res.es)}
            {devRow('Lower Deviation ei', res.ei)}
            {limitRow('Max Shaft Ø', res.shaftMax, '#f4902c')}
            {limitRow('Min Shaft Ø', res.shaftMin, '#f4902c')}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          ISO 286 FITS &amp; TOLERANCES // HOLE-BASIS LIMIT DIMENSIONS &amp; CLEARANCE / INTERFERENCE
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Hole-basis system: the hole always carries the H tolerance (lower deviation EI = 0, so min hole = nominal) and
          the character of the fit is set entirely by the shaft letter and grade — one reamer or boring cycle covers every
          fit at a given size. Values are computed with the ISO 286-1 formula method (standard tolerance unit
          i = 0.45·∛D + 0.001·D on the geometric mean of the diameter step, IT grades and fundamental deviations from the
          standard formulas, rounded to whole µm) and may differ by 1–2 µm from published table roundings.{' '}
          <strong style={{ color: FAMILY_COLORS.clearance.fg }}>Clearance</strong> fits run free: H11/c11 for very loose
          commercial parts, H9/d9 for high-speed bearings and large clearances, H8/f7 for accurate running spindles and
          slide bearings, H7/g6 for precision sliding parts that must move without shake, H7/h6 for accurate location of
          stationary parts that can be freely assembled.{' '}
          <strong style={{ color: FAMILY_COLORS.transition.fg }}>Transition</strong> fits locate precisely: H7/k6 for keyed
          couplings and pulleys assembled with light taps, H7/n6 for rigid location that should not move in service.{' '}
          <strong style={{ color: FAMILY_COLORS.interference.fg }}>Interference</strong> fits transmit load through the
          joint itself: H7/p6 for press-located bushings, H7/s6 for permanent medium-drive assemblies, H7/u6 for force and
          shrink fits such as bearing races and wheel hubs.
        </p>
      </div>
    </div>
  );
};

export default FitsTolerances;
