import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

export const BoltCircleDiameter: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);
  const [method, setMethod] = useState<'adjacent' | 'caliper'>('caliper');
  const [holesCount, setHolesCount] = useState<number>(5);
  
  // Method A (Adjacent center-to-center)
  const [adjacentDist, setAdjacentDist] = useState<string>('2.3511');

  // Method B (Caliper over/under holes)
  const [caliperMode, setCaliperMode] = useState<'outer' | 'inner'>('outer');
  const [caliperMeas, setCaliperMeas] = useState<string>('4.5000');
  const [holeDia, setHoleDia] = useState<string>('0.5000');

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const adjVal = parseFloat(adjacentDist) || 0;
    const measVal = parseFloat(caliperMeas) || 0;
    const diaVal = parseFloat(holeDia) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setAdjacentDist((adjVal * 25.4).toFixed(3));
      setCaliperMeas((measVal * 25.4).toFixed(3));
      setHoleDia((diaVal * 25.4).toFixed(3));
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setAdjacentDist((adjVal / 25.4).toFixed(4));
      setCaliperMeas((measVal / 25.4).toFixed(4));
      setHoleDia((diaVal / 25.4).toFixed(4));
    }
  }, [unit]);

  const count = Math.max(3, Math.min(50, holesCount));
  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';

  // Calculation logic
  let bcd = 0;
  let explanation = '';

  if (method === 'adjacent') {
    const c = parseFloat(adjacentDist) || 0;
    const angleRad = ((180 / count) * Math.PI) / 180;
    bcd = angleRad > 0 ? c / Math.sin(angleRad) : 0;
    explanation = `Calculated using formula: BCD = Adjacent Distance / sin(180° / ${count})`;
  } else {
    const m = parseFloat(caliperMeas) || 0;
    const d = parseFloat(holeDia) || 0;
    const isEven = count % 2 === 0;

    if (caliperMode === 'outer') {
      const centerToCenterMeas = m - d;
      if (isEven) {
        bcd = centerToCenterMeas;
        explanation = `Even hole pattern (${count} holes): Directly opposite holes. BCD = Outer Measurement (${m}) - Hole Dia (${d})`;
      } else {
        const angleRad = ((90 / count) * Math.PI) / 180;
        bcd = angleRad > 0 ? centerToCenterMeas / Math.cos(angleRad) : 0;
        explanation = `Odd hole pattern (${count} holes): Adjusted for non-diametric alignment across widest holes using cos(90° / ${count}).`;
      }
    } else {
      // Inner edge measurement
      const centerToCenterMeas = m + d;
      if (isEven) {
        bcd = centerToCenterMeas;
        explanation = `Even hole pattern (${count} holes): Directly opposite holes. BCD = Inner Measurement (${m}) + Hole Dia (${d})`;
      } else {
        const angleRad = ((90 / count) * Math.PI) / 180;
        bcd = angleRad > 0 ? centerToCenterMeas / Math.cos(angleRad) : 0;
        explanation = `Odd hole pattern (${count} holes): Adjusted for non-diametric alignment across widest holes using cos(90° / ${count}).`;
      }
    }
  }

  // Calculate equivalent chordal (adjacent) distance for verification
  const verifChordal = bcd > 0 ? bcd * Math.sin(((180 / count) * Math.PI) / 180) : 0;

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', padding: '0' }}>
      {/* TOP SECTION: 1. VISUAL & 2. VARIABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '12px', marginBottom: '12px', alignItems: 'start' }}>
        
        {/* 1. VISUAL: Interactive Measurement Diagram (First in DOM order) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              🟢 VISUAL // Reverse-Engineer Diagram
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {count} Holes // {method === 'caliper' ? 'Caliper Span' : 'Chord Distance'}
            </span>
          </div>

          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            padding: '15px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '260px'
          }}>
            <svg viewBox="-140 -140 280 280" style={{ width: '100%', maxWidth: '260px', height: 'auto', overflow: 'visible' }}>
              {/* Axes / Crosshairs */}
              <line x1="-130" y1="0" x2="130" y2="0" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="0" y1="-130" x2="0" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              
              {/* Pitch Circle */}
              <circle cx="0" cy="0" r="85" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7" />
              <circle cx="0" cy="0" r="3" fill="#64748b" />

              {/* Holes */}
              {Array.from({ length: Math.min(count, 24) }).map((_, idx) => {
                const rad = (idx * (360 / count) * Math.PI) / 180;
                const svgX = 85 * Math.cos(rad);
                const svgY = -85 * Math.sin(rad);
                const isTarget = idx === 0 || (method === 'adjacent' ? idx === 1 : idx === Math.floor(count / 2));

                return (
                  <g key={idx}>
                    <line x1="0" y1="0" x2={svgX} y2={svgY} stroke="#1e293b" strokeWidth="1" />
                    <circle cx={svgX} cy={svgY} r={isTarget ? "10" : "7"} fill="#0f172a" stroke={isTarget ? "#f4902c" : "#00ff80"} strokeWidth={isTarget ? "2.5" : "1.5"} />
                    <text x={svgX * 1.25} y={svgY * 1.25} fill="#f8fafc" fontSize="10" fontWeight="700" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)">
                      #{idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Measurement Span Line */}
              {(() => {
                const rad0 = 0;
                const rad1 = method === 'adjacent' ? ((360 / count) * Math.PI) / 180 : ((Math.floor(count / 2) * (360 / count)) * Math.PI) / 180;
                const x0 = 85 * Math.cos(rad0);
                const y0 = -85 * Math.sin(rad0);
                const x1 = 85 * Math.cos(rad1);
                const y1 = -85 * Math.sin(rad1);
                return (
                  <g>
                    <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#f4902c" strokeWidth="2.5" strokeDasharray="3,3" />
                    <circle cx={(x0 + x1) / 2} cy={(y0 + y1) / 2} r="14" fill="#0f172a" stroke="#f4902c" strokeWidth="1.5" />
                    <text x={(x0 + x1) / 2} y={(y0 + y1) / 2} fill="#f4902c" fontSize="11" fontWeight="800" textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)">
                      {method === 'adjacent' ? 'C' : 'M'}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Estimated BCD
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {bcd > 0 ? bcd.toFixed(decPlaces) : '---'} <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{unitStr}</span>
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Hole Angle
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#00ff80' }}>
                {(360 / count).toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        {/* 2. VARIABLES: Measurement Technique & Inputs (Second in DOM order) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              ⚙️ VARIABLES // Measurement Technique
            </h3>
          </div>

          {/* Method Selector Tabs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            background: 'var(--bg-primary)', 
            padding: '4px', 
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => setMethod('caliper')}
              style={{
                padding: '10px 8px',
                border: 'none',
                background: method === 'caliper' ? 'var(--accent-cyan)' : 'transparent',
                color: method === 'caliper' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📏 Caliper (Across Holes)
            </button>
            <button
              onClick={() => setMethod('adjacent')}
              style={{
                padding: '10px 8px',
                border: 'none',
                background: method === 'adjacent' ? 'var(--accent-cyan)' : 'transparent',
                color: method === 'adjacent' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⭕ Center-to-Center
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Total Number of Holes in Pattern
            </label>
            <input
              type="number"
              value={holesCount}
              min={3}
              max={50}
              onChange={(e) => setHolesCount(parseInt(e.target.value) || 3)}
              className="input-precision"
            />
            <span style={{ fontSize: '0.75rem', color: count % 2 === 0 ? '#38bdf8' : '#f59e0b', marginTop: '4px', display: 'block', fontWeight: 600 }}>
              {count % 2 === 0 ? `✓ Even pattern (${count} holes): Directly spans opposite holes.` : `⚠️ Odd pattern (${count} holes): Spans widest chord; algorithm applies geometric correction.`}
            </span>
          </div>

          {method === 'caliper' ? (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Caliper Placement Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setCaliperMode('outer')}
                    style={{
                      padding: '8px',
                      background: caliperMode === 'outer' ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${caliperMode === 'outer' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: caliperMode === 'outer' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    Outer Edges (Max)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaliperMode('inner')}
                    style={{
                      padding: '8px',
                      background: caliperMode === 'inner' ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${caliperMode === 'inner' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: caliperMode === 'inner' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    Inner Edges (Min)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Caliper Reading ({unitStr})
                  </label>
                  <input
                    type="number"
                    value={caliperMeas}
                    step={unit === 'imperial' ? '0.001' : '0.01'}
                    onChange={(e) => setCaliperMeas(e.target.value)}
                    className="input-precision"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Hole Diameter ({unitStr})
                  </label>
                  <input
                    type="number"
                    value={holeDia}
                    step={unit === 'imperial' ? '0.001' : '0.01'}
                    onChange={(e) => setHoleDia(e.target.value)}
                    className="input-precision"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Adjacent Hole Center-to-Center Distance ({unitStr})
                </label>
                <input
                  type="number"
                  value={adjacentDist}
                  step={unit === 'imperial' ? '0.001' : '0.01'}
                  onChange={(e) => setAdjacentDist(e.target.value)}
                  className="input-precision"
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Measure exact center-to-center distance between neighboring holes using gauge pins or CMM.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: 3. EXPLANATION & RESULTS */}
      <div className="glass-panel">
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            📐 EXPLANATION // Reverse-Engineered Result & Verification
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', alignItems: 'center' }}>
          {/* Main BCD Box */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px',
            border: '1px solid var(--accent-cyan)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              EXACT BOLT CIRCLE DIAMETER (BCD)
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: '#f4902c' }}>
              {bcd > 0 ? bcd.toFixed(decPlaces) : '---'}
            </div>
            <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {unitStr}
            </span>
          </div>

          {/* Verification Metrics */}
          <div style={{ background: 'var(--bg-primary)', padding: '16px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 600 }}>
              Pattern Verification & Checks
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Radius from Center:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {bcd > 0 ? (bcd / 2).toFixed(decPlaces) : '---'} {unitStr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Adjacent Hole Distance (Chord):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#00ff80' }}>
                  {verifChordal > 0 ? verifChordal.toFixed(decPlaces) : '---'} {unitStr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Angle Between Adjacent Holes:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                  {(360 / count).toFixed(2)}°
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formula Explanation Alert */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '12px',
          marginTop: '15px',
          fontSize: '0.82rem',
          color: '#7dd3fc',
          lineHeight: 1.5
        }}>
          <strong>📐 Geometry Note:</strong> {explanation}
        </div>
      </div>

      {/* Footer: tool description (kept out of the header per site convention) */}
      <div className="glass-panel" style={{ marginTop: '30px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Machinist Calculator #3
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>
          Reverse-engineer the exact Bolt Circle Diameter (PCD) of existing parts using standard calipers or center distances.
        </p>
      </div>
    </div>
  );
};
