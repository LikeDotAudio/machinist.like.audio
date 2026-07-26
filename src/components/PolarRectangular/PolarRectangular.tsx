import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

type ConvMode = 'p2r' | 'r2p';

const norm360 = (deg: number): number => {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
};

export const PolarRectangular: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [mode, setMode] = useState<ConvMode>('p2r');

  // Polar inputs
  const [radiusStr, setRadiusStr] = useState<string>('2.0000');
  const [thetaStr, setThetaStr] = useState<string>('30.0000');

  // Rectangular inputs
  const [xStr, setXStr] = useState<string>('1.7321');
  const [yStr, setYStr] = useState<string>('1.0000');

  // Work-origin (center) offsets
  const [xcStr, setXcStr] = useState<string>('0.0000');
  const [ycStr, setYcStr] = useState<string>('0.0000');

  // Convert all length inputs when the global unit toggles
  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const conv = (s: string): string => {
      const v = parseFloat(s) || 0;
      return unit === 'metric' && oldUnit === 'imperial'
        ? (v * 25.4).toFixed(3)
        : (v / 25.4).toFixed(4);
    };
    setRadiusStr(conv(radiusStr));
    setXStr(conv(xStr));
    setYStr(conv(yStr));
    setXcStr(conv(xcStr));
    setYcStr(conv(ycStr));
  }, [unit, radiusStr, xStr, yStr, xcStr, ycStr]);

  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';
  const inputStep = unit === 'imperial' ? '0.0001' : '0.001';

  const xc = parseFloat(xcStr) || 0;
  const yc = parseFloat(ycStr) || 0;

  // --- Core conversion ---
  let px = 0; // point X about origin
  let py = 0; // point Y about origin
  if (mode === 'p2r') {
    const r = parseFloat(radiusStr) || 0;
    const th = parseFloat(thetaStr) || 0;
    const rad = (th * Math.PI) / 180;
    px = r * Math.cos(rad);
    py = r * Math.sin(rad);
  } else {
    px = parseFloat(xStr) || 0;
    py = parseFloat(yStr) || 0;
  }

  const resR = Math.hypot(px, py);
  const atOrigin = resR < 1e-12;
  const dispTheta = atOrigin ? 0 : norm360(Math.atan2(py, px) * (180 / Math.PI));

  // D-M-S breakdown
  const dInt = Math.floor(dispTheta);
  const mRem = (dispTheta - dInt) * 60;
  const mInt = Math.floor(mRem);
  const sVal = (mRem - mInt) * 60;
  const dmsStr = `${dInt}° ${mInt}' ${sVal.toFixed(1)}"`;

  // Quadrant indicator
  const EPS = 1e-9;
  let quadrant: string;
  if (atOrigin) quadrant = 'ORIGIN';
  else if (Math.abs(py) < EPS) quadrant = px > 0 ? '+X AXIS' : '−X AXIS';
  else if (Math.abs(px) < EPS) quadrant = py > 0 ? '+Y AXIS' : '−Y AXIS';
  else if (px > 0 && py > 0) quadrant = 'I';
  else if (px < 0 && py > 0) quadrant = 'II';
  else if (px < 0 && py < 0) quadrant = 'III';
  else quadrant = 'IV';

  // Final ABS coordinates about the work origin offset
  const absX = px + xc;
  const absY = py + yc;
  const hasOffset = Math.abs(xc) > EPS || Math.abs(yc) > EPS;

  const fmt = (v: number) => v.toFixed(decPlaces);

  // --- SVG plot geometry (auto-scaled four-quadrant plot) ---
  const W = 440;
  const H = 440;
  const C = 220; // center
  const plotR = 200;
  const scale = (plotR - 22) / (resR > 1e-9 ? resR : 1);
  const sx = C + px * scale;
  const sy = C - py * scale;
  const arcR = 42;
  const thetaRad = (dispTheta * Math.PI) / 180;
  const arcEndX = C + arcR * Math.cos(thetaRad);
  const arcEndY = C - arcR * Math.sin(thetaRad);
  const midRad = thetaRad / 2;
  const labelX = C + (arcR + 22) * Math.cos(midRad);
  const labelY = C - (arcR + 22) * Math.sin(midRad);
  const showArc = !atOrigin && dispTheta > 0.5 && dispTheta < 359.5;

  const modeBtn = (m: ConvMode, label: string) => (
    <button
      onClick={() => setMode(m)}
      style={{
        padding: '12px',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        background: mode === m ? 'var(--accent-cyan)' : 'transparent',
        color: mode === m ? '#000' : 'var(--text-secondary)',
        fontWeight: 600,
        fontSize: '0.88rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  );

  const lengthInput = (label: string, value: string, onChange: (v: string) => void) => (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          value={value}
          step={inputStep}
          onChange={(e) => onChange(e.target.value)}
          className="input-precision"
        />
        <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
          {unitStr}
        </span>
      </div>
    </div>
  );

  const resultRow = (label: string, value: string, color = '#f4902c') => (
    <div style={{ background: 'var(--bg-primary)', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-cyan)', textAlign: 'center', flex: 1, minWidth: '150px' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.9rem', fontWeight: 800, color, textShadow: '0 0 20px rgba(244, 144, 44, 0.35)' }}>
        {value}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🧭 Polar ⇄ Rectangular <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Coordinate Converter</span>
        </h2>
        <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          θ measured <strong style={{ color: '#00ff80' }}>CCW</strong> from <strong style={{ color: '#fff' }}>+X (3 o'clock)</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Inputs Card */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>🧭 Coordinate Input</h3>
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
            {modeBtn('p2r', '⭕ Polar → Rectangular')}
            {modeBtn('r2p', '✛ Rectangular → Polar')}
          </div>

          {mode === 'p2r' ? (
            <div className="animate-fade-in">
              {lengthInput('Radius (R)', radiusStr, setRadiusStr)}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Angle θ (Decimal Degrees, CCW from +X)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={thetaStr}
                    step="0.01"
                    min="-360"
                    max="360"
                    onChange={(e) => setThetaStr(e.target.value)}
                    className="input-precision"
                  />
                  <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>°</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              {lengthInput('X Coordinate', xStr, setXStr)}
              {lengthInput('Y Coordinate', yStr, setYStr)}
            </div>
          )}

          {/* Work-Origin Offset */}
          <div style={{ marginTop: '25px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '12px' }}>
              Work-Origin Offset (Center Point Xc, Yc)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Xc</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={xcStr} step={inputStep} onChange={(e) => setXcStr(e.target.value)} className="input-precision" />
                  <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{unitStr}</span>
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Yc</span>
                <div style={{ position: 'relative' }}>
                  <input type="number" value={ycStr} step={inputStep} onChange={(e) => setYcStr(e.target.value)} className="input-precision" />
                  <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{unitStr}</span>
                </div>
              </div>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>
              Bolt-hole style: the point is computed about the origin, then Xc/Yc are added
              to give the final ABS machine coordinates.
            </p>
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)', order: -1 }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                CONVERSION RESULT
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {mode === 'p2r' ? 'Rectangular Coordinates' : 'Polar Coordinates'}
              </h3>
            </div>
            <span style={{ padding: '4px 14px', borderRadius: '14px', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.35)', fontFamily: 'var(--font-mono)' }}>
              QUADRANT {quadrant}
            </span>
          </div>

          {/* Big Results */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {mode === 'p2r' ? (
              <>
                {resultRow(`X (${unitStr})`, fmt(px))}
                {resultRow(`Y (${unitStr})`, fmt(py))}
              </>
            ) : (
              <>
                {resultRow(`R (${unitStr})`, fmt(resR))}
                {resultRow('θ', `${dispTheta.toFixed(4)}°`)}
              </>
            )}
          </div>

          {/* SVG Four-Quadrant Plot */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '14px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', left: '16px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              LIVE PLOT — AUTO-SCALED
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '440px', height: 'auto', display: 'block', margin: '0 auto' }}>
              {/* Reference circle at R */}
              {!atOrigin && (
                <circle cx={C} cy={C} r={resR * scale} fill="none" stroke="rgba(244,144,44,0.18)" strokeWidth="1" strokeDasharray="4 5" />
              )}

              {/* Axes */}
              <line x1={12} y1={C} x2={W - 12} y2={C} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
              <line x1={C} y1={12} x2={C} y2={H - 12} stroke="rgba(255,255,255,0.28)" strokeWidth="1" />
              {/* Center crosshair */}
              <line x1={C - 7} y1={C} x2={C + 7} y2={C} stroke="#fff" strokeWidth="1.4" />
              <line x1={C} y1={C - 7} x2={C} y2={C + 7} stroke="#fff" strokeWidth="1.4" />

              {/* Axis labels */}
              <text x={W - 16} y={C - 8} fill="#94a3b8" fontSize="12" fontWeight="700" textAnchor="end" fontFamily="var(--font-mono)">X+</text>
              <text x={16} y={C - 8} fill="#94a3b8" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">X−</text>
              <text x={C + 10} y={22} fill="#94a3b8" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">Y+</text>
              <text x={C + 10} y={H - 14} fill="#94a3b8" fontSize="12" fontWeight="700" fontFamily="var(--font-mono)">Y−</text>

              {/* Angle arc from +X axis (CCW) */}
              {showArc && (
                <>
                  <path
                    d={`M ${C + arcR} ${C} A ${arcR} ${arcR} 0 ${dispTheta > 180 ? 1 : 0} 0 ${arcEndX} ${arcEndY}`}
                    fill="none"
                    stroke="#00ff80"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                  />
                  <text x={labelX} y={labelY + 4} fill="#00ff80" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                    {dispTheta.toFixed(1)}°
                  </text>
                </>
              )}

              {/* Dashed X/Y projection lines */}
              {!atOrigin && (
                <>
                  <line x1={sx} y1={sy} x2={sx} y2={C} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 4" />
                  <line x1={sx} y1={sy} x2={C} y2={sy} stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="5 4" />
                  <text x={sx} y={py >= 0 ? C + 16 : C - 8} fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                    X {fmt(px)}
                  </text>
                  <text x={px >= 0 ? C - 6 : C + 6} y={sy + 3} fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor={px >= 0 ? 'end' : 'start'} fontFamily="var(--font-mono)">
                    Y {fmt(py)}
                  </text>
                </>
              )}

              {/* Radius line from origin to point */}
              <line x1={C} y1={C} x2={sx} y2={sy} stroke="#f4902c" strokeWidth="2.5" strokeLinecap="round" />
              {!atOrigin && (
                <text
                  x={(C + sx) / 2 + 10 * Math.cos(thetaRad + Math.PI / 2)}
                  y={(C + sy) / 2 - 10 * Math.sin(thetaRad + Math.PI / 2)}
                  fill="#f4902c"
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  fontFamily="var(--font-mono)"
                >
                  R {fmt(resR)}
                </text>
              )}

              {/* The point */}
              <circle cx={sx} cy={sy} r="6" fill="#f4902c" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Detail rows */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Full Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Radius (R):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#f4902c' }}>{fmt(resR)} {unitStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Angle θ (decimal):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#00ff80' }}>{dispTheta.toFixed(4)}°</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Angle θ (D-M-S):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>{dmsStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>X / Y about origin:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(px)} / {fmt(py)} {unitStr}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>ABS with offset (X+Xc / Y+Yc):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: hasOffset ? '#c084fc' : 'var(--text-primary)' }}>
                  {fmt(absX)} / {fmt(absY)} {unitStr}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Footer description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          POLAR ⇄ RECTANGULAR COORDINATE CONVERTER // MANUAL PROGRAMMING & DRO LAYOUT
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Converts between polar (R, θ) and rectangular (X, Y) machine coordinates using{' '}
          <strong style={{ color: '#f4902c' }}>X = R·cos θ</strong>, <strong style={{ color: '#f4902c' }}>Y = R·sin θ</strong>,{' '}
          <strong style={{ color: '#38bdf8' }}>R = √(X² + Y²)</strong> and <strong style={{ color: '#00ff80' }}>θ = atan2(Y, X)</strong> normalized
          to 0–360°. The angle is measured counter-clockwise from the +X axis (3 o'clock) — the standard machine and DRO convention.
          Add work-origin offsets Xc/Yc for bolt-hole style layout about a center point, and read the final ABS coordinates directly.
          On controls with polar coordinate programming (e.g., G16/G15 on Fanuc-style, G110-series or polar modes on others), these
          same conversions happen internally — this tool gives you the equivalent rectangular moves for manual G-code, DRO positioning,
          and layout inspection work.
        </p>
      </div>
    </div>
  );
};

export default PolarRectangular;
