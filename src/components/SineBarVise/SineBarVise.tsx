import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface SineBarViseProps {
  onNavigateToStack?: (height: number) => void;
}

export const SineBarVise: React.FC<SineBarViseProps> = ({ onNavigateToStack }) => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);
  const [calcMode, setCalcMode] = useState<'findHeight' | 'findAngle'>('findHeight');
  const [barLength, setBarLength] = useState<string>('5.0000'); // standard 5" or 100mm
  
  // Angle input (Decimal degrees or DMS)
  const [targetAngleDeg, setTargetAngleDeg] = useState<string>('15.0000');
  const [degPart, setDegPart] = useState<number>(15);
  const [minPart, setMinPart] = useState<number>(0);
  const [secPart, setSecPart] = useState<number>(0);
  const [angleInputType, setAngleInputType] = useState<'decimal' | 'dms'>('decimal');

  // Height input (for findAngle mode)
  const [blockHeight, setBlockHeight] = useState<string>('1.2941');

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const lenVal = parseFloat(barLength) || 0;
    const hVal = parseFloat(blockHeight) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setBarLength(lenVal === 5 ? '100.000' : lenVal === 10 ? '200.000' : (lenVal * 25.4).toFixed(3));
      setBlockHeight((hVal * 25.4).toFixed(3));
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setBarLength(lenVal === 100 ? '5.0000' : lenVal === 200 ? '10.0000' : (lenVal / 25.4).toFixed(4));
      setBlockHeight((hVal / 25.4).toFixed(4));
    }
  }, [unit]);

  const len = parseFloat(barLength) || 0.0001;
  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';

  // Compute active angle in decimal degrees
  let activeAngleDeg = 0;
  if (calcMode === 'findHeight') {
    if (angleInputType === 'decimal') {
      activeAngleDeg = parseFloat(targetAngleDeg) || 0;
    } else {
      activeAngleDeg = degPart + (minPart / 60) + (secPart / 3600);
    }
  } else {
    const h = parseFloat(blockHeight) || 0;
    const sinVal = Math.min(1, Math.max(-1, h / len));
    activeAngleDeg = Math.asin(sinVal) * (180 / Math.PI);
  }

  // Compute calculated values
  let calculatedHeight = 0;
  if (calcMode === 'findHeight') {
    const rad = (activeAngleDeg * Math.PI) / 180;
    calculatedHeight = len * Math.sin(rad);
  } else {
    calculatedHeight = parseFloat(blockHeight) || 0;
  }

  // Convert activeAngleDeg to DMS for display
  const dInt = Math.floor(activeAngleDeg);
  const mRem = (activeAngleDeg - dInt) * 60;
  const mInt = Math.floor(mRem);
  const sVal = (mRem - mInt) * 60;

  // Taper metrics
  const tanVal = Math.tan((activeAngleDeg * Math.PI) / 180);
  const taperPerInchOrMm = tanVal; // taper per unit length
  const taperPerFoot = tanVal * 12; // TPF (only relevant in imperial, but good to know)

  // Quick bar length presets
  const imperialBarPresets = ['3.0000', '5.0000', '10.0000'];
  const metricBarPresets = ['50.000', '100.000', '200.000'];

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          📐 Sine Bar & Sine Vise Calculator <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Machinist Calculator #4</span>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Card: Input & Mode */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>📐 Sine Tool Parameters</h3>
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
              onClick={() => setCalcMode('findHeight')}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: calcMode === 'findHeight' ? 'var(--accent-cyan)' : 'transparent',
                color: calcMode === 'findHeight' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🎯 Find Block Height (H)
            </button>
            <button
              onClick={() => setCalcMode('findAngle')}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: calcMode === 'findAngle' ? 'var(--accent-cyan)' : 'transparent',
                color: calcMode === 'findAngle' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📐 Find Angle (θ)
            </button>
          </div>

          {/* Sine Bar Length / Center Distance */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Sine Bar Center Distance (L)
            </label>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <input
                type="number"
                value={barLength}
                step={unit === 'imperial' ? '1' : '10'}
                onChange={(e) => setBarLength(e.target.value)}
                className="input-precision"
              />
              <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {unitStr}
              </span>
            </div>
            
            {/* Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Standard Sizes:</span>
              {(unit === 'imperial' ? imperialBarPresets : metricBarPresets).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setBarLength(p)}
                  style={{
                    background: barLength === p ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${barLength === p ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    color: barLength === p ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                >
                  {parseFloat(p)} {unitStr}
                </button>
              ))}
            </div>
          </div>

          {calcMode === 'findHeight' ? (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Target Angle (θ)
                </label>
                <div style={{ display: 'flex', gap: '10px', fontSize: '0.8rem' }}>
                  <label style={{ cursor: 'pointer', color: angleInputType === 'decimal' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    <input type="radio" checked={angleInputType === 'decimal'} onChange={() => setAngleInputType('decimal')} style={{ marginRight: '4px' }} /> Decimal °
                  </label>
                  <label style={{ cursor: 'pointer', color: angleInputType === 'dms' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    <input type="radio" checked={angleInputType === 'dms'} onChange={() => setAngleInputType('dms')} style={{ marginRight: '4px' }} /> D-M-S
                  </label>
                </div>
              </div>

              {angleInputType === 'decimal' ? (
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={targetAngleDeg}
                    step="0.01"
                    min="0"
                    max="89.99"
                    onChange={(e) => setTargetAngleDeg(e.target.value)}
                    className="input-precision"
                  />
                  <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 700 }}>°</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Degrees (°)</span>
                    <input type="number" value={degPart} min="0" max="89" onChange={(e) => setDegPart(parseInt(e.target.value) || 0)} className="input-precision" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Minutes (')</span>
                    <input type="number" value={minPart} min="0" max="59" onChange={(e) => setMinPart(parseInt(e.target.value) || 0)} className="input-precision" />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Seconds (")</span>
                    <input type="number" value={secPart} min="0" max="59" step="0.1" onChange={(e) => setSecPart(parseFloat(e.target.value) || 0)} className="input-precision" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-fade-in">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Existing Gage Block Stack Height (H)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={blockHeight}
                  step={unit === 'imperial' ? '0.0001' : '0.001'}
                  onChange={(e) => setBlockHeight(e.target.value)}
                  className="input-precision"
                />
                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {unitStr}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Card (Ordered Left): Result Output & Visual Diagram */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)', order: -1 }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              PRECISION SETTING RESULT
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              {calcMode === 'findHeight' ? 'Required Gauge Block Height' : 'Resulting Sine Bar Angle'}
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
              {calcMode === 'findHeight' ? 'GAGE BLOCK STACK HEIGHT (H)' : 'INCLINATION ANGLE (θ)'}
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              {calcMode === 'findHeight' ? calculatedHeight.toFixed(decPlaces) : activeAngleDeg.toFixed(4) + '°'}
            </div>
            <span style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
              {calcMode === 'findHeight' ? unitStr : `${dInt}° ${mInt}' ${sVal.toFixed(1)}"`}
            </span>
            {calcMode === 'findHeight' && (
              <button
                onClick={() => onNavigateToStack && onNavigateToStack(parseFloat(calculatedHeight.toFixed(decPlaces)))}
                className="btn-precision"
                style={{
                  marginTop: '15px',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: 'linear-gradient(90deg, rgba(244, 144, 44, 0.2), rgba(0, 128, 255, 0.2))',
                  border: '1px solid var(--accent-cyan)',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '12px',
                  borderRadius: '6px'
                }}
              >
                = take me to the stack calculator ➔
              </button>
            )}
          </div>

          {/* Visual Interactive SVG Diagram (Top-Left Priority) */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            order: -1
          }}>
            <svg viewBox="0 0 320 140" style={{ width: '100%', maxWidth: '300px', height: 'auto', overflow: 'visible' }}>
              {/* Surface Plate Base */}
              <rect x="10" y="110" width="300" height="16" fill="url(#graniteGrad)" stroke="#64748b" strokeWidth="1" rx="2" />
              <defs>
                <linearGradient id="graniteGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>
              <text x="160" y="122" fill="#cbd5e1" fontSize="9" fontWeight="700" textAnchor="middle" letterSpacing="1">
                GRANITE SURFACE PLATE (REF 0.000)
              </text>

              {/* Fixed Roller (Left) */}
              <circle cx="50" cy="98" r="12" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
              <circle cx="50" cy="98" r="3" fill="#1e293b" />

              {/* Calculate dynamic tilt for diagram (clamped between 3 deg and 35 deg for visual clarity) */}
              {(() => {
                const visAngle = Math.max(3, Math.min(32, activeAngleDeg));
                const rad = (visAngle * Math.PI) / 180;
                const dist = 180; // visual distance between roller centers
                const rightX = 50 + dist * Math.cos(rad);
                const rightY = 98 - dist * Math.sin(rad);
                const blockTopY = rightY + 12; // bottom of right roller

                return (
                  <g>
                    {/* Gauge Block Stack under Right Roller */}
                    <rect
                      x={rightX - 16}
                      y={blockTopY}
                      width="32"
                      height={Math.max(2, 110 - blockTopY)}
                      fill="url(#blockGrad)"
                      stroke="#f4902c"
                      strokeWidth="1.5"
                      rx="1"
                    />
                    <defs>
                      <linearGradient id="blockGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#0369a1" />
                      </linearGradient>
                    </defs>
                    <text x={rightX + 24} y={(blockTopY + 110) / 2 + 4} fill="#f4902c" fontSize="11" fontWeight="700" fontFamily="var(--font-mono)">
                      H={calculatedHeight.toFixed(decPlaces)}
                    </text>

                    {/* Right Roller */}
                    <circle cx={rightX} cy={rightY} r="12" fill="#94a3b8" stroke="#cbd5e1" strokeWidth="2" />
                    <circle cx={rightX} cy={rightY} r="3" fill="#1e293b" />

                    {/* Sine Bar Body linking the two rollers */}
                    <line x1="50" y1="98" x2={rightX} y2={rightY} stroke="#f8fafc" strokeWidth="16" strokeLinecap="round" />
                    <line x1="50" y1="98" x2={rightX} y2={rightY} stroke="#475569" strokeWidth="8" strokeLinecap="round" />
                    
                    {/* Angle Arc symbol */}
                    <path d={`M 85 98 A 35 35 0 0 0 ${50 + 35 * Math.cos(rad)} ${98 - 35 * Math.sin(rad)}`} fill="none" stroke="#00ff80" strokeWidth="1.5" strokeDasharray="3,2" />
                    <text x="96" y="92" fill="#00ff80" fontSize="10" fontWeight="700" fontFamily="var(--font-mono)">
                      {activeAngleDeg.toFixed(1)}°
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* Taper & Verification Breakdown */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Taper & Gradient Conversion
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Taper per {unit === 'imperial' ? 'Inch (TPI)' : 'mm'}:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {taperPerInchOrMm.toFixed(5)} {unitStr}/{unitStr}
                </span>
              </div>

              {unit === 'imperial' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Taper per Foot (TPF):</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#00ff80' }}>
                    {taperPerFoot.toFixed(4)} in/ft
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>D-M-S Breakdown:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                  {dInt}° {mInt}' {sVal.toFixed(2)}"
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '14px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Machinist Calculator #4 // Tool Guidance
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          Calculate precision gauge block stack heights for setting exact angles on sine plates, bars, and grinding vises.
        </p>
      </div>
    </div>
  );
};
