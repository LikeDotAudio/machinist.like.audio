import React, { useState } from 'react';

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
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [selectedPreset, setSelectedPreset] = useState<number>(1); // Medium 21 TPI
  const [targetDiameter, setTargetDiameter] = useState<string>('1.0000');
  const [customPitch, setCustomPitch] = useState<string>('21'); // TPI or mm
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const handleUnitToggle = (newUnit: 'imperial' | 'metric') => {
    const diaVal = parseFloat(targetDiameter) || 0;
    if (newUnit === 'metric' && unit === 'imperial') {
      setTargetDiameter((diaVal * 25.4).toFixed(3));
      setSelectedPreset(4); // Metric Medium 1.0mm
    } else if (newUnit === 'imperial' && unit === 'metric') {
      setTargetDiameter((diaVal / 25.4).toFixed(4));
      setSelectedPreset(1); // Imperial Medium 21 TPI
    }
    setUnit(newUnit);
    setIsCustom(false);
  };

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0, 240, 255, 0.1)',
          color: 'var(--accent-cyan)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}>
          Machinist Calculator #6
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Knurling Workpiece Blank Calculator
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Eliminate double-tracking and ruined knurl patterns by calculating the exact turned blank diameters that synchronize with your knurl wheel pitch.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Card: Input Parameters */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>⚙️ Tool & Workpiece Specs</h3>
            
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => handleUnitToggle('imperial')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: unit === 'imperial' ? 'var(--accent-cyan)' : 'transparent',
                  color: unit === 'imperial' ? '#000' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Imperial (in)
              </button>
              <button
                onClick={() => handleUnitToggle('metric')}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  background: unit === 'metric' ? 'var(--accent-cyan)' : 'transparent',
                  color: unit === 'metric' ? '#000' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Metric (mm)
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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
              <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {unitStr}
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px', display: 'block' }}>
              Enter the desired diameter of the shaft before knurling.
            </span>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
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

          {/* Theoretical Breakdown Box */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Theoretical Tooth Count
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {approxTeeth.toFixed(2)} teeth
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Circular Pitch (p)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {pitchVal.toFixed(4)} {unitStr}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Optimal Diameters & Tracking Verification */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TRACKING QUALITY ANALYSIS
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: trackingColor, marginTop: '4px' }}>
              {trackingStatus}
            </h3>
          </div>

          {/* Main Recommended Blank Diameter Box */}
          {bestCandidate && (
            <div style={{
              background: 'var(--bg-primary)',
              padding: '25px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--accent-cyan)',
              textAlign: 'center',
              boxShadow: '0 15px 35px -10px rgba(0, 240, 255, 0.2)'
            }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                OPTIMAL BLANK DIAMETER ({bestCandidate.teeth} EXACT TEETH)
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', fontWeight: 800, color: '#00f0ff', textShadow: '0 0 20px rgba(0, 240, 255, 0.5)' }}>
                {bestCandidate.diameter.toFixed(decPlaces)} <span style={{ fontSize: '1.2rem' }}>{unitStr}</span>
              </div>
              <span style={{ display: 'inline-block', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>
                {bestCandidate.diffFromTarget >= 0 ? `+${bestCandidate.diffFromTarget.toFixed(decPlaces)}` : bestCandidate.diffFromTarget.toFixed(decPlaces)} {unitStr} from your entered target
              </span>
            </div>
          )}

          {/* Table of Candidate Diameters */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Recommended Blank Diameter Options
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <th style={{ padding: '8px 14px' }}>Teeth Count</th>
                  <th style={{ padding: '8px 14px' }}>Turned Blank Dia</th>
                  <th style={{ padding: '8px 14px', textAlign: 'right' }}>Offset from Target</th>
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
                    <td style={{ padding: '10px 14px', color: c.isBest ? '#00ff80' : 'var(--text-primary)' }}>
                      {c.isBest && '⭐ '} {c.teeth} teeth
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: c.isBest ? '#00ff80' : 'var(--accent-cyan)' }}>
                      {c.diameter.toFixed(decPlaces)} {unitStr}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: c.diffFromTarget === 0 ? '#00ff80' : 'var(--text-secondary)' }}>
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
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#fcd34d',
            lineHeight: 1.5
          }}>
            <strong>⚙️ Lathe Pro-Tip:</strong> Always turn a slight 45° bevel on the workpiece edge and engage the knurl with firm, positive pressure immediately. Hesitation or light contact causes double-tracking!
          </div>
        </div>

      </div>
    </div>
  );
};
