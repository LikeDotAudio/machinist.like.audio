import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Drill Point Length Calculator
// P = (D/2) / tan(θ/2) — the extra depth added by the conical drill point.
// Through-hole mode:  Z = T + P + C  (material thickness + point + clearance)
// Blind-hole mode:    Z = F + P      (full-diameter depth + point)
// ---------------------------------------------------------------------------

type HoleMode = 'through' | 'blind';

interface AnglePreset {
  deg: number;
  label: string;
  note: string;
}

const ANGLE_PRESETS: AnglePreset[] = [
  { deg: 118, label: '118°', note: 'Standard' },
  { deg: 135, label: '135°', note: 'Split Point' },
  { deg: 90, label: '90°', note: 'Spot/Chamfer' },
  { deg: 140, label: '140°', note: '' },
  { deg: 60, label: '60°', note: '' },
];

export const DrillPointLength: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [mode, setMode] = useState<HoleMode>('through');
  const [diameter, setDiameter] = useState<string>('0.2500');
  const [angleDeg, setAngleDeg] = useState<string>('118');
  const [thickness, setThickness] = useState<string>('0.5000');
  const [clearance, setClearance] = useState<string>('0.0100');
  const [fullDepth, setFullDepth] = useState<string>('0.7500');

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const dVal = parseFloat(diameter) || 0;
    const tVal = parseFloat(thickness) || 0;
    const cVal = parseFloat(clearance) || 0;
    const fVal = parseFloat(fullDepth) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setDiameter((dVal * 25.4).toFixed(3));
      setThickness((tVal * 25.4).toFixed(3));
      setClearance(cVal === 0.01 ? '0.250' : (cVal * 25.4).toFixed(3));
      setFullDepth((fVal * 25.4).toFixed(3));
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setDiameter((dVal / 25.4).toFixed(4));
      setThickness((tVal / 25.4).toFixed(4));
      setClearance(cVal === 0.25 ? '0.0100' : (cVal / 25.4).toFixed(4));
      setFullDepth((fVal / 25.4).toFixed(4));
    }
  }, [unit, diameter, thickness, clearance, fullDepth]);

  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';
  const stepStr = unit === 'imperial' ? '0.0001' : '0.001';

  const D = Math.max(parseFloat(diameter) || 0, 0);
  const thetaRaw = parseFloat(angleDeg) || 0;
  const theta = Math.min(179, Math.max(1, thetaRaw));
  const T = Math.max(parseFloat(thickness) || 0, 0);
  const C = Math.max(parseFloat(clearance) || 0, 0);
  const F = Math.max(parseFloat(fullDepth) || 0, 0);

  // Core geometry: P = (D/2) / tan(θ/2), ratio = P/D = 1 / (2·tan(θ/2))
  const halfTan = Math.tan((theta / 2) * (Math.PI / 180));
  const pointLength = halfTan > 0 ? (D / 2) / halfTan : 0;
  const ratio = halfTan > 0 ? 1 / (2 * halfTan) : 0;
  const travelZ = mode === 'through' ? T + pointLength + C : F + pointLength;

  const fmt = (v: number) => v.toFixed(decPlaces);
  const activePreset = ANGLE_PRESETS.find(p => Math.abs(p.deg - thetaRaw) < 0.001);

  // --- SVG side-view geometry (fixed pixel layout, angle-accurate tip) ---
  const visTheta = Math.min(165, Math.max(50, theta));
  const R = 26; // drill radius, px
  const tipPx = R / Math.tan((visTheta / 2) * (Math.PI / 180));
  const cx = 132;
  const topY = 92; // workpiece top surface
  const platePx = 84; // rendered T (through) px
  const fullPx = 92; // rendered F (blind) px
  const clearPx = 15; // rendered C px
  const fullDiaY = mode === 'through' ? topY + platePx + clearPx - tipPx : topY + fullPx;
  const apexY = fullDiaY + tipPx;
  const bodyTopY = 22;
  const svgH = 292;

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 600,
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  } as const;

  const suffixStyle = {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--accent-cyan)',
    fontFamily: 'var(--font-mono)',
    fontWeight: 700,
  } as const;

  const dimText = { fontFamily: 'var(--font-mono)', fontWeight: 700 } as const;

  const resultRow = (label: string, value: string, accent: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: accent, fontSize: '0.95rem' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🔻 Drill Point Length <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Through & Blind Hole Depth</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            θ = <strong style={{ color: '#fff' }}>{theta.toFixed(theta % 1 === 0 ? 0 : 1)}°</strong>{activePreset && activePreset.note ? ` ${activePreset.note}` : ''}
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(244, 144, 44, 0.12)', border: '1px solid rgba(244, 144, 44, 0.35)', fontSize: '0.78rem', color: '#f4902c' }}>
            P ≈ <strong>{ratio.toFixed(3)}</strong> × D
          </div>
        </div>
      </div>

      <div>
        {/* TOP SECTION: 1. VISUAL & 2. VARIABLES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '12px', marginBottom: '12px', alignItems: 'start' }}>

          {/* 1. VISUAL: Interactive SVG Diagram (First in DOM order) */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)', border: '1px solid rgba(244, 144, 44, 0.2)' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                {mode === 'through' ? 'THROUGH HOLE — SIDE VIEW' : 'BLIND HOLE — SIDE VIEW'}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#f4902c', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                θ = {theta.toFixed(0)}° LIVE
              </span>
            </div>
            <svg viewBox={`0 0 460 ${svgH}`} style={{ width: '100%', height: 'auto', marginTop: '4px' }}>
              <defs>
                <linearGradient id="dplDrillGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#5b6b7f" />
                  <stop offset="45%" stopColor="#2c3a4e" />
                  <stop offset="55%" stopColor="#2c3a4e" />
                  <stop offset="100%" stopColor="#5b6b7f" />
                </linearGradient>
                <linearGradient id="dplStockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>

              {/* Workpiece */}
              {mode === 'through' ? (
                <g>
                  <rect x="24" y={topY} width={cx - R - 26} height={platePx} fill="url(#dplStockGrad)" stroke="#64748b" strokeWidth="1" />
                  <rect x={cx + R + 2} y={topY} width={300 - cx - R - 2} height={platePx} fill="url(#dplStockGrad)" stroke="#64748b" strokeWidth="1" />
                  <text x="30" y={topY + platePx / 2 + 4} fill="#cbd5e1" fontSize="9" fontWeight="700" letterSpacing="1">STOCK</text>
                </g>
              ) : (
                <g>
                  {/* Solid block with drilled cavity */}
                  <path
                    d={`M 24 ${topY} L ${cx - R} ${topY} L ${cx - R} ${fullDiaY} L ${cx} ${apexY} L ${cx + R} ${fullDiaY} L ${cx + R} ${topY} L 302 ${topY} L 302 ${svgH - 26} L 24 ${svgH - 26} Z`}
                    fill="url(#dplStockGrad)"
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  <text x="30" y={svgH - 36} fill="#cbd5e1" fontSize="9" fontWeight="700" letterSpacing="1">STOCK</text>
                </g>
              )}

              {/* Drill body */}
              <rect x={cx - R} y={bodyTopY} width={2 * R} height={fullDiaY - bodyTopY} fill="url(#dplDrillGrad)" stroke="#94a3b8" strokeWidth="1" />
              {/* Flute hint lines */}
              <line x1={cx - R + 8} y1={bodyTopY + 8} x2={cx + R - 8} y2={fullDiaY - 12} stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" />
              <line x1={cx - R + 8} y1={(bodyTopY + fullDiaY) / 2 - 20} x2={cx + R - 8} y2={fullDiaY + (fullDiaY - bodyTopY) / 2 - 20} stroke="rgba(148,163,184,0.2)" strokeWidth="1.5" />
              {/* Conical tip */}
              <path
                d={`M ${cx - R} ${fullDiaY} L ${cx} ${apexY} L ${cx + R} ${fullDiaY} Z`}
                fill="url(#dplDrillGrad)"
                stroke="#f4902c"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {/* Centerline */}
              <line x1={cx} y1={bodyTopY - 10} x2={cx} y2={apexY + 14} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="12 4 3 4" />

              {/* Included angle callout */}
              <line x1={cx} y1={apexY} x2={cx - R - 26} y2={fullDiaY - 22} stroke="#38bdf8" strokeWidth="0.7" opacity="0.7" />
              <line x1={cx} y1={apexY} x2={cx + R + 26} y2={fullDiaY - 22} stroke="#38bdf8" strokeWidth="0.7" opacity="0.7" />
              <text x={cx} y={fullDiaY - 26} fill="#38bdf8" fontSize="10" textAnchor="middle" style={dimText}>θ = {theta.toFixed(0)}°</text>

              {/* Top surface reference */}
              <line x1="12" y1={topY} x2="310" y2={topY} stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" strokeDasharray="4 4" />
              <text x="14" y={topY - 6} fill="#94a3b8" fontSize="9" style={dimText}>TOP SURFACE Z0</text>

              {/* P dimension (left of drill) */}
              <line x1={cx - R - 44} y1={fullDiaY} x2={cx - R - 44} y2={apexY} stroke="#00ff80" strokeWidth="1" />
              <line x1={cx - R - 48} y1={fullDiaY} x2={cx - R + 2} y2={fullDiaY} stroke="rgba(0,255,128,0.4)" strokeWidth="0.6" />
              <line x1={cx - R - 48} y1={apexY} x2={cx - 2} y2={apexY} stroke="rgba(0,255,128,0.4)" strokeWidth="0.6" />
              <text x={cx - R - 50} y={(fullDiaY + apexY) / 2 + 3} fill="#00ff80" fontSize="10" textAnchor="end" style={dimText}>
                P = {fmt(pointLength)}
              </text>

              {/* T or F dimension */}
              <line x1="330" y1={topY} x2="330" y2={mode === 'through' ? topY + platePx : fullDiaY} stroke="#38bdf8" strokeWidth="1" />
              <line x1="304" y1={mode === 'through' ? topY + platePx : fullDiaY} x2="334" y2={mode === 'through' ? topY + platePx : fullDiaY} stroke="rgba(56,189,248,0.4)" strokeWidth="0.6" />
              <text x="338" y={(topY + (mode === 'through' ? topY + platePx : fullDiaY)) / 2 + 3} fill="#38bdf8" fontSize="10" style={dimText}>
                {mode === 'through' ? `T = ${fmt(T)}` : `F = ${fmt(F)}`}
              </text>

              {/* Z dimension */}
              <line x1="396" y1={topY} x2="396" y2={apexY} stroke="#f4902c" strokeWidth="1.2" />
              <line x1={cx + 2} y1={apexY} x2="400" y2={apexY} stroke="rgba(244,144,44,0.4)" strokeWidth="0.6" />
              <line x1="392" y1={topY} x2="400" y2={topY} stroke="rgba(244,144,44,0.6)" strokeWidth="0.8" />
              <text x="402" y={(topY + apexY) / 2 + 3} fill="#f4902c" fontSize="10" style={dimText}>
                Z = {fmt(travelZ)}
              </text>

              {/* Mode-specific annotation */}
              {mode === 'through' ? (
                <text x="24" y={apexY + 24} fill="#94a3b8" fontSize="9" style={dimText}>
                  TIP BREAKS THROUGH · CLEARANCE C = {fmt(C)} {unitStr}
                </text>
              ) : (
                <g>
                  <line x1={cx - R - 8} y1={fullDiaY} x2={cx + R + 8} y2={fullDiaY} stroke="rgba(56,189,248,0.5)" strokeWidth="0.7" strokeDasharray="4 3" />
                  <text x="24" y={svgH - 8} fill="#94a3b8" fontSize="9" style={dimText}>
                    FULL Ø STOPS AT F · TIP DRILLS P DEEPER
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* 2. VARIABLES: Drill & Hole Parameters (Second in DOM order) */}
          <div className="glass-panel" style={{ padding: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>⚙️ VARIABLES // Drill & Hole Parameters</h3>
            </div>

          {/* Mode Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-primary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '25px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setMode('through')}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'through' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'through' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⬇ Through Hole
            </button>
            <button
              onClick={() => setMode('blind')}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'blind' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'blind' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⏹ Blind Hole
            </button>
          </div>

          {/* Drill Diameter */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Drill Diameter (D)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={diameter}
                min="0"
                step={stepStr}
                onChange={(e) => setDiameter(e.target.value)}
                className="input-precision"
              />
              <span style={suffixStyle}>{unitStr}</span>
            </div>
          </div>

          {/* Point Included Angle */}
          <div style={{ marginBottom: '25px' }}>
            <label style={labelStyle}>Point Included Angle (θ)</label>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="number"
                value={angleDeg}
                min="1"
                max="179"
                step="1"
                onChange={(e) => setAngleDeg(e.target.value)}
                className="input-precision"
              />
              <span style={{ ...suffixStyle, color: 'var(--text-muted)' }}>°</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Presets:</span>
              {ANGLE_PRESETS.map((p) => {
                const active = Math.abs(p.deg - thetaRaw) < 0.001;
                return (
                  <button
                    key={p.deg}
                    type="button"
                    onClick={() => setAngleDeg(String(p.deg))}
                    title={p.note || undefined}
                    style={{
                      background: active ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${active ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: active ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}{p.note ? ` ${p.note}` : ''}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === 'through' ? (
            <div className="animate-fade-in">
              {/* Material Thickness */}
              <div style={{ marginBottom: '25px' }}>
                <label style={labelStyle}>Material Thickness (T)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={thickness}
                    min="0"
                    step={stepStr}
                    onChange={(e) => setThickness(e.target.value)}
                    className="input-precision"
                  />
                  <span style={suffixStyle}>{unitStr}</span>
                </div>
              </div>

              {/* Breakthrough Clearance */}
              <div>
                <label style={labelStyle}>Breakthrough Clearance (C)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={clearance}
                    min="0"
                    step={stepStr}
                    onChange={(e) => setClearance(e.target.value)}
                    className="input-precision"
                  />
                  <span style={suffixStyle}>{unitStr}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
                  Extra travel past the far face so the full diameter clears the burr — {unit === 'imperial' ? '0.010"' : '0.25 mm'} is the usual habit.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Full-Diameter Depth */}
              <div>
                <label style={labelStyle}>Required Full-Diameter Depth (F)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={fullDepth}
                    min="0"
                    step={stepStr}
                    onChange={(e) => setFullDepth(e.target.value)}
                    className="input-precision"
                  />
                  <span style={suffixStyle}>{unitStr}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
                  Depth to which the hole must be at FULL diameter (e.g. tap thread depth, dowel seat). The conical tip drills deeper than this.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: 3. EXPLANATION & RESULTS */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              📐 EXPLANATION // {mode === 'through' ? 'Required Drill Travel & Clearance' : 'Programmed Drill Depth & Point Compensation'}
            </h3>
          </div>

          {/* Main Display Box */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '25px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px', fontWeight: 600 }}>
              {mode === 'through' ? 'DRILL TRAVEL Z = T + P + C' : 'DRILL DEPTH Z = F + P'}
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              {fmt(travelZ)}
            </div>
            <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              {unitStr} (tip of drill from top surface)
            </span>
          </div>

          {/* Breakdown */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600, marginTop: 0 }}>
              Point Geometry Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resultRow('Point Length P = (D/2) / tan(θ/2):', `${fmt(pointLength)} ${unitStr}`, '#00ff80')}
              {resultRow('Point Multiplier (P / D):', `${ratio.toFixed(4)} × D`, '#38bdf8')}
              {mode === 'through'
                ? resultRow('Z = T + P + C:', `${fmt(T)} + ${fmt(pointLength)} + ${fmt(C)}`, 'var(--text-primary)')
                : resultRow('Z = F + P:', `${fmt(F)} + ${fmt(pointLength)}`, 'var(--text-primary)')}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Depth to Tip (Z):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f4902c', fontSize: '0.95rem' }}>{fmt(travelZ)} {unitStr}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          DRILL POINT LENGTH // THROUGH-HOLE TRAVEL & BLIND-HOLE PROGRAMMED DEPTH
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          A twist drill's conical tip adds extra depth beyond the full-diameter portion of the hole:{' '}
          <strong style={{ color: '#00ff80' }}>P = (D/2) / tan(θ/2)</strong>, where θ is the point included angle.
          At the standard <strong style={{ color: '#f4902c' }}>118°</strong> point P ≈ 0.300 × D; the flatter{' '}
          <strong style={{ color: '#f4902c' }}>135°</strong> split point (common on cobalt and jobber drills for harder
          materials, and self-centering) gives a shorter P ≈ 0.207 × D, while a 90° spot or chamfer drill gives
          P = 0.500 × D. For a <strong style={{ color: '#38bdf8' }}>through hole</strong>, drill travel must be
          Z = T + P + C — thickness plus the point plus a small breakthrough clearance (the usual habit is 0.010" / 0.25 mm,
          more for burr-prone or interrupted exits) so the full diameter, not just the tip, clears the far face. For a{' '}
          <strong style={{ color: '#38bdf8' }}>blind hole</strong>, program Z = F + P so the full diameter reaches the
          required depth F (tap threads, dowels, and counterbores only count full-diameter hole) — the cone drills P deeper
          than F, so verify remaining wall thickness before committing.
        </p>
      </div>
    </div>
  );
};

export default DrillPointLength;
