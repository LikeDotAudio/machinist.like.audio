import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface KnurlPitchPreset {
  name: string;
  tpi: number; // TPI for imperial, equivalent TPI for metric calculation
  pitchMm: number;
  isMetric: boolean;
}

const KNURL_PRESETS: KnurlPitchPreset[] = [
  { name: 'Coarse (14 TPI - 0.0714" pitch)', tpi: 14, pitchMm: 1.814, isMetric: false },
  { name: 'Medium (21 TPI - 0.0476" pitch)', tpi: 21, pitchMm: 1.209, isMetric: false },
  { name: 'Fine (33 TPI - 0.0303" pitch)', tpi: 33, pitchMm: 0.770, isMetric: false },
  { name: 'Metric Coarse (1.6 mm pitch)', tpi: 15.875, pitchMm: 1.600, isMetric: true },
  { name: 'Metric Medium (1.0 mm pitch)', tpi: 25.400, pitchMm: 1.000, isMetric: true },
  { name: 'Metric Fine (0.6 mm pitch)', tpi: 42.333, pitchMm: 0.600, isMetric: true },
];

interface OptimalDiameter {
  teeth: number;
  diameter: number;
  diffFromTarget: number;
  isBest: boolean;
}

export const Knurling: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // Medium 21 TPI
  const [targetDiameter, setTargetDiameter] = useState<string>('1.0000');
  const [customPitch, setCustomPitch] = useState<string>('21'); // TPI or mm
  const [isCustom, setIsCustom] = useState<boolean>(false);

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const diaVal = parseFloat(targetDiameter) || 0;
    if (unit === 'metric' && oldUnit === 'imperial') {
      setTargetDiameter((diaVal * 25.4).toFixed(3));
      setSelectedPreset(4); // Metric Medium 1.0mm
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setTargetDiameter((diaVal / 25.4).toFixed(4));
      setSelectedPreset(1); // Imperial Medium 21 TPI
    }
    setIsCustom(false);
  }, [unit]);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setIsCustom(false);
    const p = KNURL_PRESETS[idx];
    if (unit === 'imperial') {
      setCustomPitch(p.tpi.toString());
    } else {
      setCustomPitch(p.pitchMm.toString());
    }
  };

  const dia = parseFloat(targetDiameter) || 0.001;
  const activePreset = KNURL_PRESETS[selectedPreset];
  
  // Calculate circular pitch p (in active units)
  let pitchVal = 0;
  if (isCustom) {
    const val = parseFloat(customPitch) || 1;
    pitchVal = unit === 'imperial' ? 1 / val : val;
  } else {
    pitchVal = unit === 'imperial' ? 1 / activePreset.tpi : activePreset.pitchMm;
  }

  // Calculate approximate teeth count N on the blank circumference
  // N = (pi * D) / p
  const approxTeeth = (Math.PI * dia) / pitchVal;
  const closestInt = Math.round(approxTeeth);

  // Generate 5 candidate tooth counts around closestInt
  const candidates: OptimalDiameter[] = [];
  for (let t = closestInt - 2; t <= closestInt + 2; t++) {
    if (t <= 0) continue;
    const optDia = (t * pitchVal) / Math.PI;
    const diff = optDia - dia;
    candidates.push({
      teeth: t,
      diameter: optDia,
      diffFromTarget: diff,
      isBest: t === closestInt
    });
  }

  const bestCandidate = candidates.find(c => c.isBest) || candidates[0];
  const trackingErrorPercent = Math.abs((approxTeeth - closestInt) / 0.5) * 100;
  
  let trackingStatus = '🟢 Excellent Tracking (Minimal Risk)';
  let trackingColor = '#00ff80';
  if (trackingErrorPercent > 60) {
    trackingStatus = '🔴 Severe Double-Cut Risk (Adjust Blank!)';
    trackingColor = '#ff4d4f';
  } else if (trackingErrorPercent > 30) {
    trackingStatus = '🟡 Moderate Tracking Risk (Use Chamfer & Heavy Feed)';
    trackingColor = '#f59e0b';
  }

  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
      {/* TOP SECTION: 1. VISUAL & 2. VARIABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '12px', marginBottom: '12px', alignItems: 'start' }}>
        
        {/* 1. VISUAL: Interactive Knurl & Blank Diagram (First in DOM order) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              🟢 VISUAL // Knurl Tracking Diagram
            </h3>
            <span style={{ fontSize: '0.8rem', color: trackingColor, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {bestCandidate ? `${bestCandidate.teeth} Teeth` : '---'}
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
              
              {/* Workpiece Blank Circle */}
              <circle cx="0" cy="20" r="80" fill="#1e293b" stroke="var(--accent-cyan)" strokeWidth="2" opacity="0.8" />
              <circle cx="0" cy="20" r="3" fill="#64748b" />

              {/* Workpiece Teeth Ticks around circumference */}
              {bestCandidate && Array.from({ length: Math.min(bestCandidate.teeth, 48) }).map((_, idx) => {
                const total = Math.min(bestCandidate.teeth, 48);
                const rad = (idx * (360 / total) * Math.PI) / 180;
                const x1 = 73 * Math.cos(rad);
                const y1 = 20 - 73 * Math.sin(rad);
                const x2 = 80 * Math.cos(rad);
                const y2 = 20 - 80 * Math.sin(rad);
                return (
                  <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="2" />
                );
              })}

              {/* Knurl Wheel pressing at top (0, -60) */}
              <g transform="translate(0, -95)">
                <circle cx="0" cy="0" r="35" fill="#0f172a" stroke="#f4902c" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="8" fill="#334155" stroke="#f4902c" strokeWidth="1" />
                {Array.from({ length: 16 }).map((_, idx) => {
                  const rad = (idx * (360 / 16) * Math.PI) / 180;
                  const x1 = 28 * Math.cos(rad);
                  const y1 = 28 * Math.sin(rad);
                  const x2 = 35 * Math.cos(rad);
                  const y2 = 35 * Math.sin(rad);
                  return (
                    <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f4902c" strokeWidth="2" />
                  );
                })}
              </g>

              {/* Contact point highlight */}
              <circle cx="0" cy="-60" r="6" fill="#00ff80" stroke="#fff" strokeWidth="1.5" />
            </svg>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', padding: '12px 14px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Theoretical Tooth Count
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {approxTeeth.toFixed(2)} teeth
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Circular Pitch (p)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {pitchVal.toFixed(4)} {unitStr}
              </span>
            </div>
          </div>
        </div>

        {/* 2. VARIABLES: Tool & Workpiece Specs (Second in DOM order) */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              ⚙️ VARIABLES // Tool & Workpiece Specs
            </h3>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Target Finished / Blank Diameter
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={targetDiameter}
                step={unit === 'imperial' ? '0.01' : '0.5'}
                onChange={(e) => setTargetDiameter(e.target.value)}
                className="input-precision"
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {unitStr}
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Enter desired shaft diameter before knurling.
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Knurl Wheel Tooth Pitch
              </label>
              <button
                type="button"
                onClick={() => setIsCustom(!isCustom)}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '2px 8px' }}
              >
                {isCustom ? 'Standard Wheels' : 'Custom Pitch'}
              </button>
            </div>

            {isCustom ? (
              <div>
                <input
                  type="number"
                  value={customPitch}
                  step={unit === 'imperial' ? '1' : '0.1'}
                  onChange={(e) => setCustomPitch(e.target.value)}
                  className="input-precision"
                  placeholder={unit === 'imperial' ? 'e.g. 21 (TPI)' : 'e.g. 1.0 (mm)'}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  {unit === 'imperial' ? 'Enter exact Teeth Per Inch (TPI) of knurl wheel.' : 'Enter circular pitch in mm.'}
                </span>
              </div>
            ) : (
              <select
                value={selectedPreset}
                onChange={(e) => handleSelectPreset(parseInt(e.target.value))}
                className="input-precision"
                style={{ background: 'var(--bg-tertiary)', cursor: 'pointer' }}
              >
                {KNURL_PRESETS.map((p, idx) => (
                  <option key={p.name} value={idx}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: 3. EXPLANATION & RESULTS */}
      <div className="glass-panel">
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: trackingColor, margin: 0 }}>
            📐 EXPLANATION // {trackingStatus}
          </h3>
        </div>

        {/* Main Recommended Blank Diameter Box */}
        {bestCandidate && (
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px',
            border: '1px solid var(--accent-cyan)',
            textAlign: 'center',
            marginBottom: '15px'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              OPTIMAL BLANK DIAMETER ({bestCandidate.teeth} EXACT TEETH)
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 800, color: '#f4902c' }}>
              {bestCandidate.diameter.toFixed(decPlaces)} <span style={{ fontSize: '1.1rem' }}>{unitStr}</span>
            </div>
            <span style={{ display: 'inline-block', background: 'rgba(244, 144, 44, 0.15)', color: 'var(--accent-cyan)', padding: '4px 12px', fontSize: '0.82rem', fontWeight: 600, marginTop: '8px' }}>
              {bestCandidate.diffFromTarget >= 0 ? `+${bestCandidate.diffFromTarget.toFixed(decPlaces)}` : bestCandidate.diffFromTarget.toFixed(decPlaces)} {unitStr} from entered target
            </span>
          </div>
        )}

        {/* Table of Candidate Diameters */}
        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '15px' }}>
          <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Recommended Blank Diameter Options
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '8px 12px' }}>Teeth Count</th>
                <th style={{ padding: '8px 12px' }}>Turned Blank Dia</th>
                <th style={{ padding: '8px 12px', textAlign: 'right' }}>Offset from Target</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr
                  key={c.teeth}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: c.isBest ? 'rgba(0, 255, 128, 0.12)' : 'transparent',
                    fontWeight: c.isBest ? 700 : 400
                  }}
                >
                  <td style={{ padding: '8px 12px', color: c.isBest ? '#00ff80' : 'var(--text-primary)' }}>
                    {c.isBest && '⭐ '} {c.teeth} teeth
                  </td>
                  <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: c.isBest ? '#00ff80' : 'var(--accent-cyan)' }}>
                    {c.diameter.toFixed(decPlaces)} {unitStr}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: c.diffFromTarget === 0 ? '#00ff80' : 'var(--text-secondary)' }}>
                    {c.diffFromTarget >= 0 ? `+${c.diffFromTarget.toFixed(decPlaces)}` : c.diffFromTarget.toFixed(decPlaces)} {unitStr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pro-Tip Alert */}
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '12px',
          fontSize: '0.82rem',
          color: '#fcd34d',
          lineHeight: 1.5
        }}>
          <strong>⚙️ Lathe Pro-Tip:</strong> Always turn a slight 45° bevel on the workpiece edge and engage the knurl with firm, positive pressure immediately. Hesitation or light contact causes double-tracking!
        </div>
      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '14px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Machinist Calculator #6 // Tool Guidance
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          Eliminate double-tracking and ruined knurl patterns by calculating the exact turned blank diameters that synchronize with your knurl wheel pitch.
        </p>
      </div>
    </div>
  );
};
