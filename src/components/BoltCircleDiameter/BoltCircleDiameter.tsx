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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Card: Input Method & Controls */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>🔍 Measurement Technique</h3>
          </div>

          {/* Method Selector Tabs */}
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
              onClick={() => setMethod('caliper')}
              style={{
                padding: '12px 10px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: method === 'caliper' ? 'var(--accent-cyan)' : 'transparent',
                color: method === 'caliper' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📏 Caliper (Across Holes)
            </button>
            <button
              onClick={() => setMethod('adjacent')}
              style={{
                padding: '12px 10px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: method === 'adjacent' ? 'var(--accent-cyan)' : 'transparent',
                color: method === 'adjacent' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⭕ Center-to-Center
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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
            <span style={{ fontSize: '0.78rem', color: count % 2 === 0 ? '#38bdf8' : '#f59e0b', marginTop: '6px', display: 'block', fontWeight: 600 }}>
              {count % 2 === 0 ? `✓ Even pattern (${count} holes): Caliper directly spans diametrically opposite holes.` : `⚠️ Odd pattern (${count} holes): Caliper spans widest non-opposite chord; algorithm applies geometric correction.`}
            </span>
          </div>

          {method === 'caliper' ? (
            <div className="animate-fade-in">
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Caliper Placement Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCaliperMode('outer')}
                    style={{
                      padding: '10px',
                      background: caliperMode === 'outer' ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${caliperMode === 'outer' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: caliperMode === 'outer' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Outer Edges (Max Distance)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaliperMode('inner')}
                    style={{
                      padding: '10px',
                      background: caliperMode === 'inner' ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${caliperMode === 'inner' ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      color: caliperMode === 'inner' ? 'var(--accent-cyan)' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Inner Edges (Min Distance)
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Adjacent Hole Center-to-Center Distance ({unitStr})
                </label>
                <input
                  type="number"
                  value={adjacentDist}
                  step={unit === 'imperial' ? '0.001' : '0.01'}
                  onChange={(e) => setAdjacentDist(e.target.value)}
                  className="input-precision"
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
                  Measure exact center-to-center distance between any two neighboring holes using gauge pins or CMM.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Card (Ordered Left): Result Output & Verification */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.6) 100%)', order: -1 }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              REVERSE-ENGINEERED RESULT
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
              Calculated Pitch Circle
            </h3>
          </div>

          {/* Main BCD Box */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '30px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)',
            position: 'relative'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '10px', fontWeight: 600 }}>
              EXACT BOLT CIRCLE DIAMETER (BCD)
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '3rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              {bcd > 0 ? bcd.toFixed(decPlaces) : '---'}
            </div>
            <span style={{ fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {unitStr}
            </span>
          </div>

          {/* Verification Metrics */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Pattern Verification & Checks
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Radius from Center:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {bcd > 0 ? (bcd / 2).toFixed(decPlaces) : '---'} {unitStr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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

          {/* Formula Explanation Alert */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#7dd3fc',
            lineHeight: 1.5
          }}>
            <strong>📐 Geometry Note:</strong> {explanation}
          </div>
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
