import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Taper Angle Calculator — dimensions ⇄ taper-per-foot / ratio ⇄ angle
// For lathe compound / taper-attachment setup and inspecting conical features.
// ---------------------------------------------------------------------------

type CalcMode = 'dimensions' | 'tpf' | 'angle';

interface TaperRef {
  name: string;
  /** Taper per foot, in/ft */
  tpf: number;
  note?: string;
}

const DEG = Math.PI / 180;

// R8 is specified by its included angle (16.51°) — derive its equivalent TPF
const R8_TPF = 24 * Math.tan((16.51 / 2) * DEG);

const STANDARD_TAPERS: TaperRef[] = [
  { name: 'Morse MT0', tpf: 0.6246 },
  { name: 'Morse MT1', tpf: 0.5986 },
  { name: 'Morse MT2', tpf: 0.5994 },
  { name: 'Morse MT3', tpf: 0.6024 },
  { name: 'Morse MT4', tpf: 0.6233 },
  { name: 'Morse MT5', tpf: 0.6315 },
  { name: 'Morse MT6', tpf: 0.6257 },
  { name: 'Jarno (all)', tpf: 0.6 },
  { name: 'Brown & Sharpe', tpf: 0.502, note: 'most sizes ≈' },
  { name: 'Jacobs JT2', tpf: 0.9786 },
  { name: 'Jacobs JT6', tpf: 0.6241 },
  { name: 'Jacobs JT33', tpf: 0.7635 },
  { name: 'NMTB / CAT / BT', tpf: 3.5, note: '7:24 steep' },
  { name: 'R8 (Bridgeport)', tpf: R8_TPF, note: '16.51° incl.' },
];

const MODE_LABELS: Record<CalcMode, string> = {
  dimensions: '📐 From Dimensions',
  tpf: '📏 From TPF / Ratio',
  angle: '🎯 From Angle',
};

const toDMS = (deg: number): string => {
  const neg = deg < 0;
  const a = Math.abs(deg);
  const d = Math.floor(a);
  const mRem = (a - d) * 60;
  const m = Math.floor(mRem);
  const s = (mRem - m) * 60;
  return `${neg ? '−' : ''}${d}° ${m}' ${s.toFixed(1)}"`;
};

export const TaperAngle: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [mode, setMode] = useState<CalcMode>('dimensions');

  // Mode 1: dimensions (dimensional — converted on unit toggle)
  const [largeDia, setLargeDia] = useState<string>('1.0000');
  const [smallDia, setSmallDia] = useState<string>('0.7500');
  const [taperLen, setTaperLen] = useState<string>('3.0000');

  // Mode 2: taper per foot (imperial) / ratio denominator k for 1:k (metric)
  const [tpfInput, setTpfInput] = useState<string>('0.6024');
  const [ratioK, setRatioK] = useState<string>('20.000');

  // Mode 3: angle
  const [angleInput, setAngleInput] = useState<string>('5.0000');
  const [angleType, setAngleType] = useState<'included' | 'half'>('included');

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const dVal = parseFloat(largeDia) || 0;
    const sVal = parseFloat(smallDia) || 0;
    const lVal = parseFloat(taperLen) || 0;
    const tpfVal = parseFloat(tpfInput) || 0;
    const kVal = parseFloat(ratioK) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setLargeDia((dVal * 25.4).toFixed(3));
      setSmallDia((sVal * 25.4).toFixed(3));
      setTaperLen((lVal * 25.4).toFixed(3));
      // TPF → equivalent metric ratio 1:k, k = 12/TPF
      if (tpfVal > 0) setRatioK((12 / tpfVal).toFixed(3));
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setLargeDia((dVal / 25.4).toFixed(4));
      setSmallDia((sVal / 25.4).toFixed(4));
      setTaperLen((lVal / 25.4).toFixed(4));
      // Ratio 1:k → equivalent TPF = 12/k
      if (kVal > 0) setTpfInput((12 / kVal).toFixed(4));
    }
  }, [unit, largeDia, smallDia, taperLen, tpfInput, ratioK]);

  const unitStr = unit === 'imperial' ? 'in' : 'mm';
  const decPlaces = unit === 'imperial' ? 4 : 3;

  const D = parseFloat(largeDia) || 0;
  const d = parseFloat(smallDia) || 0;
  const L = parseFloat(taperLen) || 0;

  // --- Included angle (decimal degrees) from the active mode ---
  let includedDeg = 0;
  if (mode === 'dimensions') {
    includedDeg = L > 0 ? 2 * Math.atan((D - d) / (2 * L)) / DEG : 0;
  } else if (mode === 'tpf') {
    if (unit === 'imperial') {
      const tpf = parseFloat(tpfInput) || 0;
      includedDeg = 2 * Math.atan(tpf / 24) / DEG;
    } else {
      const k = parseFloat(ratioK) || 0;
      includedDeg = k > 0 ? 2 * Math.atan(1 / (2 * k)) / DEG : 0;
    }
  } else {
    const a = parseFloat(angleInput) || 0;
    includedDeg = angleType === 'included' ? a : 2 * a;
  }

  // --- Derived taper metrics ---
  const halfDeg = includedDeg / 2;
  const taperPerUnit = 2 * Math.tan(halfDeg * DEG); // (D−d)/L, per in or per mm
  const tpfOut = 12 * taperPerUnit;                 // in/ft
  const ratioDen = Math.abs(taperPerUnit) > 1e-9 ? 1 / taperPerUnit : 0;
  const offset = (D - d) / 2;

  const loadRefTaper = (t: TaperRef) => {
    setMode('tpf');
    setTpfInput(t.tpf.toFixed(4));
    setRatioK((12 / t.tpf).toFixed(3));
  };

  // --- SVG diagram geometry (visually clamped) ---
  const cy = 95;
  const xL = 60;
  const xR = 350;
  const hs = 16; // small-end half height (px)
  const visHalf = Math.max(1.5, Math.min(13, Math.abs(halfDeg) || 1.5));
  const visRad = visHalf * DEG;
  const hl = hs + (xR - xL) * Math.tan(visRad); // large-end half height (px)
  const arcR = 70;

  const resRow = (label: string, value: string, opts: { accent?: string; sub?: string } = {}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
        <strong style={{ color: opts.accent ?? '#fff', fontSize: '0.92rem' }}>{value}</strong>
        {opts.sub && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{opts.sub}</span>
        )}
      </span>
    </div>
  );

  const inputLabel = (text: string) => (
    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
      {text}
    </label>
  );

  const suffixStyle: React.CSSProperties = {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--accent-cyan)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
  };

  const dimText = { fontFamily: 'var(--font-mono)', fontWeight: 700 } as const;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          📏 Taper Angle <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Dimensions ⇄ TPF ⇄ Angle</span>
        </h2>
        <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          Compound set to <strong style={{ color: '#f4902c', fontFamily: 'var(--font-mono)' }}>{halfDeg.toFixed(4)}°</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Card 1: Inputs & Mode */}
        <div className="glass-panel" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>⚙️ Taper Input</h3>
          </div>

          {/* Mode Chips */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '22px', flexWrap: 'wrap' }}>
            {(['dimensions', 'tpf', 'angle'] as CalcMode[]).map(mo => {
              const active = mode === mo;
              return (
                <button
                  key={mo}
                  onClick={() => setMode(mo)}
                  style={{
                    flex: 1,
                    padding: '9px 10px',
                    border: 'none',
                    borderRadius: '6px',
                    background: active ? 'var(--accent-cyan)' : 'transparent',
                    color: active ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {MODE_LABELS[mo]}
                </button>
              );
            })}
          </div>

          {mode === 'dimensions' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '18px' }}>
                {inputLabel('Large Diameter (D)')}
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={largeDia}
                    step={unit === 'imperial' ? '0.0001' : '0.001'}
                    onChange={(e) => setLargeDia(e.target.value)}
                    className="input-precision"
                  />
                  <span style={suffixStyle}>{unitStr}</span>
                </div>
              </div>
              <div style={{ marginBottom: '18px' }}>
                {inputLabel('Small Diameter (d)')}
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={smallDia}
                    step={unit === 'imperial' ? '0.0001' : '0.001'}
                    onChange={(e) => setSmallDia(e.target.value)}
                    className="input-precision"
                  />
                  <span style={suffixStyle}>{unitStr}</span>
                </div>
              </div>
              <div>
                {inputLabel('Taper Length (L)')}
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={taperLen}
                    step={unit === 'imperial' ? '0.0001' : '0.001'}
                    onChange={(e) => setTaperLen(e.target.value)}
                    className="input-precision"
                  />
                  <span style={suffixStyle}>{unitStr}</span>
                </div>
              </div>
              {D < d && (
                <p style={{ fontSize: '0.78rem', color: '#f59e0b', margin: '12px 0 0', lineHeight: 1.5 }}>
                  ⚠ Large diameter is smaller than small diameter — angle shown as negative.
                </p>
              )}
              {L <= 0 && (
                <p style={{ fontSize: '0.78rem', color: '#ef4444', margin: '12px 0 0', lineHeight: 1.5 }}>
                  ⚠ Taper length must be greater than zero.
                </p>
              )}
            </div>
          )}

          {mode === 'tpf' && (
            <div className="animate-fade-in">
              {unit === 'imperial' ? (
                <div>
                  {inputLabel('Taper Per Foot (TPF)')}
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      value={tpfInput}
                      step="0.0001"
                      onChange={(e) => setTpfInput(e.target.value)}
                      className="input-precision"
                    />
                    <span style={suffixStyle}>in/ft</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.5 }}>
                    Included angle = 2·atan(TPF / 24). Load a standard taper from the reference table.
                  </p>
                </div>
              ) : (
                <div>
                  {inputLabel('Taper Ratio Denominator (k)')}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>1 :</span>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="number"
                        value={ratioK}
                        step="0.001"
                        onChange={(e) => setRatioK(e.target.value)}
                        className="input-precision"
                      />
                      <span style={suffixStyle}>k</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.5 }}>
                    Metric tapers are specified as ratios (e.g. 1:20 — diameter changes 1 mm over 20 mm of length).
                    Included angle = 2·atan(1 / 2k).
                  </p>
                </div>
              )}
            </div>
          )}

          {mode === 'angle' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Taper Angle
                </label>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
                  <label style={{ cursor: 'pointer', color: angleType === 'included' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    <input type="radio" checked={angleType === 'included'} onChange={() => setAngleType('included')} style={{ marginRight: '4px' }} /> Included
                  </label>
                  <label style={{ cursor: 'pointer', color: angleType === 'half' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    <input type="radio" checked={angleType === 'half'} onChange={() => setAngleType('half')} style={{ marginRight: '4px' }} /> Half (per side)
                  </label>
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={angleInput}
                  step="0.01"
                  min="0"
                  max={angleType === 'included' ? '179.99' : '89.99'}
                  onChange={(e) => setAngleInput(e.target.value)}
                  className="input-precision"
                />
                <span style={{ ...suffixStyle, color: 'var(--text-muted)' }}>°</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.5 }}>
                {angleType === 'included'
                  ? 'The full cone angle between opposite flanks. The compound is set to half of this.'
                  : 'The angle from the centerline to one flank — the value dialed on the compound.'}
              </p>
            </div>
          )}
        </div>

        {/* Card 2: Results & Diagram */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TAPER SETUP RESULT
            </span>
          </div>

          {/* Main Display: half angle for the compound */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              SET COMPOUND TO (HALF ANGLE)
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              {halfDeg.toFixed(4)}°
            </div>
            <span style={{ fontSize: '1.02rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {toDMS(halfDeg)}
            </span>
          </div>

          {/* Live SVG Taper Diagram */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '14px 10px 6px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TAPER — SIDE VIEW
            </div>
            <svg viewBox="0 0 460 205" style={{ width: '100%', height: 'auto', marginTop: '10px' }}>
              <defs>
                <linearGradient id="taperBodyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b6b7f" />
                  <stop offset="45%" stopColor="#2c3a4e" />
                  <stop offset="55%" stopColor="#2c3a4e" />
                  <stop offset="100%" stopColor="#5b6b7f" />
                </linearGradient>
              </defs>

              {/* Taper body */}
              <polygon
                points={`${xL},${cy - hl} ${xR},${cy - hs} ${xR},${cy + hs} ${xL},${cy + hl}`}
                fill="url(#taperBodyGrad)"
                stroke="#f4902c"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

              {/* Centerline (dash-dot) */}
              <line x1={xL - 25} y1={cy} x2={xR + 55} y2={cy} stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="14 4 3 4" />

              {/* Half-angle reference: axis-parallel dashed line from top-left corner */}
              <line x1={xL} y1={cy - hl} x2={xL + 130} y2={cy - hl} stroke="#00ff80" strokeWidth="0.8" strokeDasharray="5 4" opacity="0.7" />
              {/* Half-angle arc from reference line down to the flank */}
              <path
                d={`M ${xL + arcR} ${cy - hl} A ${arcR} ${arcR} 0 0 1 ${xL + arcR * Math.cos(visRad)} ${cy - hl + arcR * Math.sin(visRad)}`}
                fill="none"
                stroke="#00ff80"
                strokeWidth="1.5"
                strokeDasharray="3 2"
              />
              <text x={xL + arcR + 10} y={cy - hl - 6} fill="#00ff80" fontSize="11" style={dimText}>
                θ/2 = {halfDeg.toFixed(2)}°
              </text>

              {/* Included angle label */}
              <text x={xR + 55} y={cy - hs - 10} fill="#38bdf8" fontSize="10" textAnchor="end" style={dimText}>
                INCLUDED {includedDeg.toFixed(2)}°
              </text>

              {/* D dimension (large end, left) */}
              <line x1={xL - 14} y1={cy - hl} x2={xL - 14} y2={cy + hl} stroke="#fff" strokeWidth="0.8" />
              <line x1={xL - 18} y1={cy - hl} x2={xL + 4} y2={cy - hl} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              <line x1={xL - 18} y1={cy + hl} x2={xL + 4} y2={cy + hl} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              <text x={xL - 20} y={cy} fill="#fff" fontSize="10" textAnchor="middle" transform={`rotate(-90 ${xL - 20} ${cy})`} style={dimText}>
                D{mode === 'dimensions' ? ` = ${D.toFixed(decPlaces)} ${unitStr}` : ''}
              </text>

              {/* d dimension (small end, right) */}
              <line x1={xR + 14} y1={cy - hs} x2={xR + 14} y2={cy + hs} stroke="#c084fc" strokeWidth="0.8" />
              <line x1={xR - 4} y1={cy - hs} x2={xR + 18} y2={cy - hs} stroke="rgba(192,132,252,0.4)" strokeWidth="0.6" />
              <line x1={xR - 4} y1={cy + hs} x2={xR + 18} y2={cy + hs} stroke="rgba(192,132,252,0.4)" strokeWidth="0.6" />
              <text x={xR + 26} y={cy + 3} fill="#c084fc" fontSize="10" style={dimText}>
                d{mode === 'dimensions' ? ` = ${d.toFixed(decPlaces)}` : ''}
              </text>

              {/* L dimension (below) */}
              <line x1={xL} y1={cy + hl + 8} x2={xL} y2={190} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              <line x1={xR} y1={cy + hs + 8} x2={xR} y2={190} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              <line x1={xL} y1={186} x2={xR} y2={186} stroke="#fff" strokeWidth="0.8" />
              <text x={(xL + xR) / 2} y={180} fill="#fff" fontSize="10" textAnchor="middle" style={dimText}>
                L{mode === 'dimensions' ? ` = ${L.toFixed(decPlaces)} ${unitStr}` : ''}
              </text>
            </svg>
          </div>

          {/* Full results table */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              TAPER CONVERSIONS
            </div>
            {resRow('Included Angle', `${includedDeg.toFixed(4)}°`, { accent: '#38bdf8', sub: toDMS(includedDeg) })}
            {resRow('Half Angle (per side)', `${halfDeg.toFixed(4)}°`, { accent: '#f4902c', sub: toDMS(halfDeg) })}
            {resRow(`Taper per ${unit === 'imperial' ? 'Inch' : 'mm'}`, `${taperPerUnit.toFixed(5)} ${unitStr}/${unitStr}`)}
            {unit === 'imperial' && resRow('Taper per Foot (TPF)', `${tpfOut.toFixed(4)} in/ft`, { accent: '#00ff80' })}
            {resRow('Taper Ratio', ratioDen !== 0 ? `1 : ${Math.abs(ratioDen).toFixed(3)}` : '—', { accent: '#c084fc' })}
            {mode === 'dimensions' && resRow('Radial Offset (D−d)/2', `${offset.toFixed(decPlaces)} ${unitStr}`, { accent: '#f59e0b' })}
          </div>
        </div>

        {/* Card 3: Standard Tapers Reference */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📚 Standard Tapers</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click a row to load its TPF into the calculator</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-primary)', padding: '8px', maxHeight: '560px', overflowY: 'auto' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '8px', padding: '6px 12px', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              <span>Taper</span>
              <span style={{ textAlign: 'right' }}>TPF (in/ft)</span>
              <span style={{ textAlign: 'right' }}>Included ∠</span>
            </div>
            {STANDARD_TAPERS.map(t => {
              const inc = 2 * Math.atan(t.tpf / 24) / DEG;
              const active = mode === 'tpf' && Math.abs((parseFloat(tpfInput) || 0) - t.tpf) < 0.0001;
              return (
                <div
                  key={t.name}
                  onClick={() => loadRefTaper(t)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 1fr 1fr',
                    gap: '8px',
                    alignItems: 'baseline',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: active ? 'rgba(244, 144, 44, 0.4)' : 'transparent',
                    background: active ? 'linear-gradient(90deg, rgba(244, 144, 44, 0.12), transparent)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: active ? '#f4902c' : '#fff' }}>
                    {t.name}
                    {t.note && (
                      <span style={{ display: 'block', fontSize: '0.66rem', fontWeight: 400, color: 'var(--text-muted)' }}>{t.note}</span>
                    )}
                  </span>
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: active ? '#f4902c' : 'var(--text-secondary)' }}>
                    {t.tpf.toFixed(4)}
                  </span>
                  <span style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#38bdf8' }}>
                    {inc.toFixed(3)}°
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          TAPER ANGLE CALCULATOR // DIMENSIONS, TAPER-PER-FOOT, RATIOS & COMPOUND SETUP
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Converts between taper dimensions, taper rates, and angles for lathe compound / taper-attachment setup and
          inspecting conical features. Included angle = 2·atan((D−d)/2L); taper per foot TPF = 12·(D−d)/L;
          taper per inch (or mm) = (D−d)/L. The lathe compound is always set to the{' '}
          <strong style={{ color: '#f4902c' }}>half angle</strong> — the angle between one flank and the centerline —
          not the included angle. Metric tapers are usually specified as ratios (e.g. 1:20), where the diameter changes
          1 unit over k units of length. The reference table lists common machine tapers (Morse, Jarno, Brown &amp; Sharpe,
          Jacobs, steep 7:24 NMTB/CAT/BT, and R8) — click any row to load it.
        </p>
      </div>
    </div>
  );
};

export default TaperAngle;
