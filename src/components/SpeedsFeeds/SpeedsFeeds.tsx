import React, { useState } from 'react';

interface MaterialPreset {
  name: string;
  sfm: number;      // Surface Feet per Minute (High Speed Steel / Carbide average)
  vc: number;       // Cutting speed m/min
  ipt: number;      // Inches per tooth / rev
  fz: number;       // mm per tooth / rev
  hardness: string;
}

const MATERIALS: MaterialPreset[] = [
  { name: 'Aluminum 6061-T6', sfm: 800, vc: 240, ipt: 0.004, fz: 0.10, hardness: '95 HB' },
  { name: 'Mild Steel (1018 / A36)', sfm: 120, vc: 36, ipt: 0.002, fz: 0.05, hardness: '126 HB' },
  { name: 'Alloy Steel (4140 / 4340)', sfm: 80, vc: 24, ipt: 0.0015, fz: 0.04, hardness: '197 HB' },
  { name: 'Stainless Steel (304 / 316)', sfm: 65, vc: 20, ipt: 0.0015, fz: 0.04, hardness: '170 HB' },
  { name: 'Brass / Bronze (Free Cutting)', sfm: 350, vc: 105, ipt: 0.003, fz: 0.08, hardness: '110 HB' },
  { name: 'Cast Iron (Grey G2500)', sfm: 100, vc: 30, ipt: 0.0025, fz: 0.06, hardness: '180 HB' },
  { name: 'Titanium (Ti-6Al-4V)', sfm: 45, vc: 14, ipt: 0.001, fz: 0.025, hardness: '330 HB' },
  { name: 'Plastics (Delrin / Nylon)', sfm: 600, vc: 180, ipt: 0.006, fz: 0.15, hardness: '65 Shore D' },
];

export const SpeedsFeeds: React.FC = () => {
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
  const [selectedMat, setSelectedMat] = useState<number>(0);
  const [toolDia, setToolDia] = useState<string>('0.500');
  const [flutes, setFlutes] = useState<number>(4);
  const [customSpeed, setCustomSpeed] = useState<string>('800'); // SFM or m/min
  const [customFeed, setCustomFeed] = useState<string>('0.004'); // IPT or fz
  const [widthOfCut, setWidthOfCut] = useState<string>('0.250');
  const [depthOfCut, setDepthOfCut] = useState<string>('0.100');
  const [isCustom, setIsCustom] = useState<boolean>(false);

  const handleMaterialChange = (idx: number) => {
    setSelectedMat(idx);
    setIsCustom(false);
    const mat = MATERIALS[idx];
    if (unit === 'imperial') {
      setCustomSpeed(mat.sfm.toString());
      setCustomFeed(mat.ipt.toString());
    } else {
      setCustomSpeed(mat.vc.toString());
      setCustomFeed(mat.fz.toString());
    }
  };

  const handleUnitToggle = (newUnit: 'imperial' | 'metric') => {
    const diaVal = parseFloat(toolDia) || 0;
    const wocVal = parseFloat(widthOfCut) || 0;
    const docVal = parseFloat(depthOfCut) || 0;

    if (newUnit === 'metric' && unit === 'imperial') {
      setToolDia((diaVal * 25.4).toFixed(2));
      setWidthOfCut((wocVal * 25.4).toFixed(2));
      setDepthOfCut((docVal * 25.4).toFixed(2));
      const mat = MATERIALS[selectedMat];
      setCustomSpeed(mat.vc.toString());
      setCustomFeed(mat.fz.toString());
    } else if (newUnit === 'imperial' && unit === 'metric') {
      setToolDia((diaVal / 25.4).toFixed(3));
      setWidthOfCut((wocVal / 25.4).toFixed(3));
      setDepthOfCut((docVal / 25.4).toFixed(3));
      const mat = MATERIALS[selectedMat];
      setCustomSpeed(mat.sfm.toString());
      setCustomFeed(mat.ipt.toString());
    }
    setUnit(newUnit);
    setIsCustom(false);
  };

  // Calculations
  const dia = parseFloat(toolDia) || 0.001;
  const speedVal = parseFloat(customSpeed) || 0;
  const feedVal = parseFloat(customFeed) || 0;
  const woc = parseFloat(widthOfCut) || 0;
  const doc = parseFloat(depthOfCut) || 0;

  let rpm = 0;
  let ipmOrMmMin = 0;
  let mrr = 0; // cu in/min or cm³/min

  if (unit === 'imperial') {
    // RPM = (SFM * 3.82) / Diameter
    rpm = (speedVal * 3.8197) / dia;
    // Feed rate = RPM * Flutes * IPT
    ipmOrMmMin = rpm * flutes * feedVal;
    // MRR = WOC * DOC * IPM
    mrr = woc * doc * ipmOrMmMin;
  } else {
    // RPM = (Vc * 1000) / (pi * Diameter)
    rpm = (speedVal * 1000) / (Math.PI * dia);
    // Feed rate (mm/min) = RPM * Flutes * fz
    ipmOrMmMin = rpm * flutes * feedVal;
    // MRR (cm³/min) = (WOC_mm * DOC_mm * Feed_mm_min) / 1000
    mrr = (woc * doc * ipmOrMmMin) / 1000;
  }

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
          Machinist Calculator #1
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Speeds & Feeds Calculator
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Find the optimal spindle RPM, table feed rate, and material removal rate (MRR) for milling, drilling, and turning operations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Input Parameters */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>⚙️ Tool & Cut Parameters</h3>
            
            {/* Unit Toggle */}
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

          {/* Workpiece Material Selector */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Workpiece Material Preset
            </label>
            <select
              value={selectedMat}
              onChange={(e) => handleMaterialChange(parseInt(e.target.value))}
              className="input-precision"
              style={{ cursor: 'pointer', background: 'var(--bg-tertiary)' }}
            >
              {MATERIALS.map((m, idx) => (
                <option key={m.name} value={idx}>
                  {m.name} ({m.hardness})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Tool Diameter ({unit === 'imperial' ? 'in' : 'mm'})
              </label>
              <input
                type="number"
                value={toolDia}
                step={unit === 'imperial' ? '0.0625' : '1'}
                onChange={(e) => setToolDia(e.target.value)}
                className="input-precision"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Flutes / Teeth Count
              </label>
              <input
                type="number"
                value={flutes}
                min={1}
                max={20}
                onChange={(e) => setFlutes(parseInt(e.target.value) || 1)}
                className="input-precision"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Cutting Speed ({unit === 'imperial' ? 'SFM' : 'm/min'})
              </label>
              <input
                type="number"
                value={customSpeed}
                onChange={(e) => { setCustomSpeed(e.target.value); setIsCustom(true); }}
                className="input-precision"
                style={{ borderColor: isCustom ? 'var(--accent-cyan)' : 'var(--border-color)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Feed / Tooth ({unit === 'imperial' ? 'IPT' : 'fz mm'})
              </label>
              <input
                type="number"
                value={customFeed}
                step={unit === 'imperial' ? '0.0005' : '0.01'}
                onChange={(e) => { setCustomFeed(e.target.value); setIsCustom(true); }}
                className="input-precision"
                style={{ borderColor: isCustom ? 'var(--accent-cyan)' : 'var(--border-color)' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Width of Cut ({unit === 'imperial' ? 'in' : 'mm'})
              </label>
              <input
                type="number"
                value={widthOfCut}
                step={unit === 'imperial' ? '0.05' : '1'}
                onChange={(e) => setWidthOfCut(e.target.value)}
                className="input-precision"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Depth of Cut ({unit === 'imperial' ? 'in' : 'mm'})
              </label>
              <input
                type="number"
                value={depthOfCut}
                step={unit === 'imperial' ? '0.05' : '1'}
                onChange={(e) => setDepthOfCut(e.target.value)}
                className="input-precision"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Results Gauge & Summary */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              RECOMMENDED MACHINING PARAMETERS
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '4px' }}>
              {MATERIALS[selectedMat].name}
            </h3>
          </div>

          {/* Primary Gauge Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '22px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 240, 255, 0.1)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                SPINDLE SPEED (RPM)
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.3rem', fontWeight: 700, color: '#00f0ff', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
                {Math.round(rpm).toLocaleString()}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                Rev / Minute
              </span>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              padding: '22px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(0, 255, 128, 0.3)',
              textAlign: 'center',
              boxShadow: '0 10px 25px -5px rgba(0, 255, 128, 0.1)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                TABLE FEED RATE
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.3rem', fontWeight: 700, color: '#00ff80', textShadow: '0 0 15px rgba(0, 255, 128, 0.4)' }}>
                {ipmOrMmMin.toFixed(unit === 'imperial' ? 1 : 0)}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px' }}>
                {unit === 'imperial' ? 'Inches / min (IPM)' : 'mm / min'}
              </span>
            </div>
          </div>

          {/* Secondary Details Table */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
              Efficiency & Removal Metrics
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Material Removal Rate (MRR):</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {mrr.toFixed(3)} {unit === 'imperial' ? 'in³/min' : 'cm³/min'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Surface Cutting Velocity:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {speedVal} {unit === 'imperial' ? 'SFM' : 'm/min'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Chip Load / Feed Per Tooth:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {feedVal} {unit === 'imperial' ? 'in/tooth' : 'mm/tooth'}
                </span>
              </div>
            </div>
          </div>

          {/* Machinist Pro-Tip Alert */}
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)',
            borderLeft: '4px solid #3b82f6',
            padding: '12px 16px',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            fontSize: '0.85rem',
            color: '#93c5fd',
            lineHeight: 1.5
          }}>
            <strong>💡 Pro-Tip:</strong> When slotting (100% radial immersion), reduce table feed rate by 20% to prevent excessive chip recutting and flute packing.
          </div>
        </div>

      </div>
    </div>
  );
};
