import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface ThreadSpec {
  name: string;
  type: 'UNC' | 'UNF' | 'Metric Coarse' | 'Metric Fine';
  majorDia: number; // in inches for imperial, mm for metric
  pitch: number;    // TPI for imperial, mm pitch for metric
  standardDrill: string; // standard recommended tap drill
  isMetric: boolean;
}

const THREAD_DATABASE: ThreadSpec[] = [
  // Imperial Coarse (UNC)
  { name: '4-40 UNC', type: 'UNC', majorDia: 0.1120, pitch: 40, standardDrill: '#43 (0.0890")', isMetric: false },
  { name: '6-32 UNC', type: 'UNC', majorDia: 0.1380, pitch: 32, standardDrill: '#36 (0.1065")', isMetric: false },
  { name: '8-32 UNC', type: 'UNC', majorDia: 0.1640, pitch: 32, standardDrill: '#29 (0.1360")', isMetric: false },
  { name: '10-24 UNC', type: 'UNC', majorDia: 0.1900, pitch: 24, standardDrill: '#25 (0.1495")', isMetric: false },
  { name: '1/4-20 UNC', type: 'UNC', majorDia: 0.2500, pitch: 20, standardDrill: '#7 (0.2010")', isMetric: false },
  { name: '5/16-18 UNC', type: 'UNC', majorDia: 0.3125, pitch: 18, standardDrill: 'F (0.2570")', isMetric: false },
  { name: '3/8-16 UNC', type: 'UNC', majorDia: 0.3750, pitch: 16, standardDrill: '5/16" (0.3125")', isMetric: false },
  { name: '1/2-13 UNC', type: 'UNC', majorDia: 0.5000, pitch: 13, standardDrill: '27/64" (0.4219")', isMetric: false },
  { name: '5/8-11 UNC', type: 'UNC', majorDia: 0.6250, pitch: 11, standardDrill: '17/32" (0.5312")', isMetric: false },
  { name: '3/4-10 UNC', type: 'UNC', majorDia: 0.7500, pitch: 10, standardDrill: '21/32" (0.6562")', isMetric: false },
  { name: '1"-8 UNC', type: 'UNC', majorDia: 1.0000, pitch: 8, standardDrill: '7/8" (0.8750")', isMetric: false },

  // Imperial Fine (UNF)
  { name: '10-32 UNF', type: 'UNF', majorDia: 0.1900, pitch: 32, standardDrill: '#21 (0.1590")', isMetric: false },
  { name: '1/4-28 UNF', type: 'UNF', majorDia: 0.2500, pitch: 28, standardDrill: '#3 (0.2130")', isMetric: false },
  { name: '5/16-24 UNF', type: 'UNF', majorDia: 0.3125, pitch: 24, standardDrill: 'I (0.2720")', isMetric: false },
  { name: '3/8-24 UNF', type: 'UNF', majorDia: 0.3750, pitch: 24, standardDrill: 'Q (0.3320")', isMetric: false },
  { name: '1/2-20 UNF', type: 'UNF', majorDia: 0.5000, pitch: 20, standardDrill: '29/64" (0.4531")', isMetric: false },

  // Metric Coarse & Fine
  { name: 'M3 x 0.5', type: 'Metric Coarse', majorDia: 3.0, pitch: 0.5, standardDrill: '2.5 mm', isMetric: true },
  { name: 'M4 x 0.7', type: 'Metric Coarse', majorDia: 4.0, pitch: 0.7, standardDrill: '3.3 mm', isMetric: true },
  { name: 'M5 x 0.8', type: 'Metric Coarse', majorDia: 5.0, pitch: 0.8, standardDrill: '4.2 mm', isMetric: true },
  { name: 'M6 x 1.0', type: 'Metric Coarse', majorDia: 6.0, pitch: 1.0, standardDrill: '5.0 mm', isMetric: true },
  { name: 'M8 x 1.25', type: 'Metric Coarse', majorDia: 8.0, pitch: 1.25, standardDrill: '6.8 mm', isMetric: true },
  { name: 'M8 x 1.0 (Fine)', type: 'Metric Fine', majorDia: 8.0, pitch: 1.0, standardDrill: '7.0 mm', isMetric: true },
  { name: 'M10 x 1.5', type: 'Metric Coarse', majorDia: 10.0, pitch: 1.5, standardDrill: '8.5 mm', isMetric: true },
  { name: 'M10 x 1.25 (Fine)', type: 'Metric Fine', majorDia: 10.0, pitch: 1.25, standardDrill: '8.8 mm', isMetric: true },
  { name: 'M12 x 1.75', type: 'Metric Coarse', majorDia: 12.0, pitch: 1.75, standardDrill: '10.2 mm', isMetric: true },
  { name: 'M12 x 1.25 (Fine)', type: 'Metric Fine', majorDia: 12.0, pitch: 1.25, standardDrill: '10.8 mm', isMetric: true },
  { name: 'M16 x 2.0', type: 'Metric Coarse', majorDia: 16.0, pitch: 2.0, standardDrill: '14.0 mm', isMetric: true },
  { name: 'M20 x 2.5', type: 'Metric Coarse', majorDia: 20.0, pitch: 2.5, standardDrill: '17.5 mm', isMetric: true },
];

export const TapDrillDie: React.FC = () => {
  const { unit: globalUnit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(globalUnit);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedIdx, setSelectedIdx] = useState<number>(4); // default 1/4-20 UNC
  const [targetEngagement, setTargetEngagement] = useState<number>(75); // % thread engagement
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Custom thread inputs
  const [customUnit, setCustomUnit] = useState<'imperial' | 'metric'>(globalUnit);
  const [customMajor, setCustomMajor] = useState<string>('0.2500');
  const [customPitch, setCustomPitch] = useState<string>('20'); // TPI or mm pitch

  useEffect(() => {
    if (prevUnitRef.current === globalUnit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = globalUnit;

    if (isCustom) {
      const maj = parseFloat(customMajor) || 0;
      if (globalUnit === 'metric' && oldUnit === 'imperial') {
        setCustomMajor((maj * 25.4).toFixed(3));
        setCustomUnit('metric');
      } else if (globalUnit === 'imperial' && oldUnit === 'metric') {
        setCustomMajor((maj / 25.4).toFixed(4));
        setCustomUnit('imperial');
      }
    } else {
      const currentTh = THREAD_DATABASE[selectedIdx];
      if (globalUnit === 'metric' && !currentTh?.isMetric) {
        setSelectedIdx(37); // M6 x 1.0
      } else if (globalUnit === 'imperial' && currentTh?.isMetric) {
        setSelectedIdx(4); // 1/4-20 UNC
      }
    }
  }, [globalUnit, isCustom, customMajor, selectedIdx]);

  const handleSelectThread = (idx: number) => {
    setSelectedIdx(idx);
    setIsCustom(false);
    const th = THREAD_DATABASE[idx];
    setCustomUnit(th.isMetric ? 'metric' : 'imperial');
    setCustomMajor(th.majorDia.toString());
    setCustomPitch(th.pitch.toString());
  };

  const filteredThreads = THREAD_DATABASE.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeThread = isCustom ? null : THREAD_DATABASE[selectedIdx];
  const isMet = isCustom ? customUnit === 'metric' : activeThread?.isMetric || false;
  const major = isCustom ? parseFloat(customMajor) || 0 : activeThread?.majorDia || 0;
  const pitchVal = isCustom ? parseFloat(customPitch) || 0 : activeThread?.pitch || 0;

  // Calculation of Theoretical Tap Drill for target engagement
  // Formula:
  // For Imperial: Drill Dia = Major Dia - (0.01299 * Engagement%) / TPI
  // For Metric: Drill Dia = Major Dia - (0.01299 * Engagement% * Pitch_mm) / 100 ? Wait! Let's check exact UN/ISO 60 degree thread formula:
  // Thread depth H = 0.866025 * P. Basic thread height = 0.64952 * P.
  // Double thread depth (100% engagement) = 1.299038 * P (where P is pitch in mm, or 1/TPI in inches).
  // Thus, Drill Dia = Major Dia - (1.299038 * P * Engagement% / 100)
  
  const p = isMet ? pitchVal : (pitchVal > 0 ? 1 / pitchVal : 0);
  const doubleThreadHeight = 1.299038 * p;
  const theoreticalDrillDia = Math.max(0.001, major - doubleThreadHeight * (targetEngagement / 100));

  // Die threading rod preparation (external thread cutting)
  // Standard recommendation: Major diameter minus 1% of major diameter (or minus 0.1 * pitch) to prevent tearing and die binding
  const dieBlankMax = major - 0.05 * doubleThreadHeight;
  const dieBlankMin = major - 0.15 * doubleThreadHeight;
  const unitStr = isMet ? 'mm' : 'in';
  const decPlaces = isMet ? 3 : 4;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 0' }}>
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
          Machinist Calculator #5
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Tap, Drill & Die Threading Guidance
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Find exact tap drill sizes for custom thread engagements, standard drill bit matches, and rod blank preparation for die threading.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Card: Database Search & Selection */}
        <div className="glass-panel" style={{ padding: '30px', maxHeight: '650px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>📚 Thread Specification</h3>
            <button
              onClick={() => setIsCustom(!isCustom)}
              className="btn-secondary"
              style={{ fontSize: '0.78rem', padding: '4px 10px' }}
            >
              {isCustom ? '📋 Standard Database' : '✏️ Custom Thread'}
            </button>
          </div>

          {isCustom ? (
            <div className="animate-fade-in" style={{ flex: 1 }}>
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '20px' }}>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Major Diameter ({customUnit === 'imperial' ? 'in' : 'mm'})
                    </label>
                    <input
                      type="number"
                      value={customMajor}
                      step={customUnit === 'imperial' ? '0.001' : '0.1'}
                      onChange={(e) => setCustomMajor(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {customUnit === 'imperial' ? 'Threads Per Inch (TPI)' : 'Pitch (mm)'}
                    </label>
                    <input
                      type="number"
                      value={customPitch}
                      step={customUnit === 'imperial' ? '1' : '0.25'}
                      onChange={(e) => setCustomPitch(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Filter Input */}
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  placeholder="🔍 Search threads (e.g. 1/4-20, M8, UNF)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-precision"
                  style={{ background: 'var(--bg-tertiary)' }}
                />
              </div>

              {/* Thread List Table */}
              <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-primary)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 1, backdropFilter: 'blur(4px)' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Thread Size</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Type</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>Standard Drill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredThreads.map((t) => {
                      const idx = THREAD_DATABASE.indexOf(t);
                      const isSel = idx === selectedIdx && !isCustom;
                      return (
                        <tr
                          key={t.name}
                          onClick={() => handleSelectThread(idx)}
                          style={{
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                            background: isSel ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <td style={{ padding: '10px 14px', fontWeight: 700, color: isSel ? 'var(--accent-cyan)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                            {t.name}
                          </td>
                          <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {t.type}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#00ff80', fontWeight: 600 }}>
                            {t.standardDrill}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Engagement Slider Control */}
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Target Thread Engagement (%)
              </label>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {targetEngagement}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="90"
              step="1"
              value={targetEngagement}
              onChange={(e) => setTargetEngagement(parseInt(e.target.value) || 75)}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>50% (Hard Metals / Stainless)</span>
              <span>75% (Standard Steel)</span>
              <span>85% (Aluminum / Brass)</span>
            </div>
          </div>
        </div>

        {/* Right Card (Ordered Left): Results & Die Threading Guidance */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)', order: -1 }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              RECOMMENDED TOOLING SETUP
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {isCustom ? `Custom Thread (${major} ${unitStr})` : activeThread?.name}
            </h3>
          </div>

          {/* Main Drill Box */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '25px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid rgba(0, 255, 128, 0.4)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(0, 255, 128, 0.15)'
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              THEORETICAL TAP DRILL DIAMETER ({targetEngagement}% ENGAGEMENT)
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.8rem', fontWeight: 800, color: '#00ff80', textShadow: '0 0 20px rgba(0, 255, 128, 0.5)' }}>
              {theoreticalDrillDia.toFixed(decPlaces)} <span style={{ fontSize: '1.2rem' }}>{unitStr}</span>
            </div>
            {!isCustom && activeThread && (
              <span style={{ display: 'inline-block', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--accent-cyan)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, marginTop: '10px' }}>
                Standard Toolroom Tap Drill: {activeThread.standardDrill}
              </span>
            )}
          </div>

          {/* Die Threading Section (External Threading) */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.95rem', color: '#f59e0b', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔩 Die Threading Rod Preparation</span>
            </h4>
            
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '15px', lineHeight: 1.5 }}>
              When cutting external threads with a round die, the blank rod must never be full major diameter. Turn or grind the rod slightly undersize to prevent excessive torque, thread galling, and die breakage.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Nominal Major Diameter:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {major.toFixed(decPlaces)} {unitStr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Recommended Rod Blank Diameter:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>
                  {dieBlankMin.toFixed(decPlaces)} - {dieBlankMax.toFixed(decPlaces)} {unitStr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>45° Chamfer Recommended on End:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#38bdf8' }}>
                  {(doubleThreadHeight * 0.7).toFixed(decPlaces)} {unitStr} deep
                </span>
              </div>
            </div>
          </div>

          {/* Tapping Lubrication Guide */}
          <div style={{
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#7dd3fc',
            lineHeight: 1.5
          }}>
            <strong>🛢️ Tapping Fluid Tip:</strong> Always use sulfurized cutting oil for steel/stainless, kerosene/WD-40 for aluminum, and tap cast iron dry or with compressed air blowback.
          </div>
        </div>

      </div>
    </div>
  );
};
