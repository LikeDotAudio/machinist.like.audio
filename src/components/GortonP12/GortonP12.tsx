import React, { useState } from 'react';

// Standard Factory Reduction Table data from Gorton P1-2 Manual (Pages 31-33)
interface TableRow {
  ratio: string;
  lowerInches: number;
  upperInches: number;
  lowerMm: number;
  upperMm: number;
}

const FACTORY_TABLE: TableRow[] = [
  { ratio: '2 to 1', lowerInches: 0.000, upperInches: 0.000, lowerMm: 0.00, upperMm: 0.00 },
  { ratio: '2.1 to 1', lowerInches: 0.477, upperInches: 0.137, lowerMm: 12.12, upperMm: 3.48 },
  { ratio: '2.2 to 1', lowerInches: 0.911, upperInches: 0.265, lowerMm: 23.14, upperMm: 6.74 },
  { ratio: '2.3 to 1', lowerInches: 1.307, upperInches: 0.386, lowerMm: 33.19, upperMm: 9.81 },
  { ratio: '2.4 to 1', lowerInches: 1.670, upperInches: 0.500, lowerMm: 42.42, upperMm: 12.69 },
  { ratio: '2.5 to 1', lowerInches: 2.004, upperInches: 0.607, lowerMm: 50.90, upperMm: 15.41 },
  { ratio: '2.6 to 1', lowerInches: 2.312, upperInches: 0.708, lowerMm: 58.73, upperMm: 17.98 },
  { ratio: '2.7 to 1', lowerInches: 2.598, upperInches: 0.804, lowerMm: 65.98, upperMm: 20.41 },
  { ratio: '2.8 to 1', lowerInches: 2.863, upperInches: 0.894, lowerMm: 72.71, upperMm: 22.72 },
  { ratio: '2.9 to 1', lowerInches: 3.109, upperInches: 0.980, lowerMm: 78.98, upperMm: 24.90 },
  { ratio: '3 to 1', lowerInches: 3.340, upperInches: 1.062, lowerMm: 84.83, upperMm: 26.98 },
  { ratio: '3.5 to 1', lowerInches: 4.294, upperInches: 1.416, lowerMm: 109.07, upperMm: 35.97 },
  { ratio: '4 to 1', lowerInches: 5.010, upperInches: 1.699, lowerMm: 127.25, upperMm: 43.16 },
  { ratio: '4.5 to 1', lowerInches: 5.566, upperInches: 1.931, lowerMm: 141.39, upperMm: 49.05 },
  { ratio: '5 to 1', lowerInches: 6.012, upperInches: 2.124, lowerMm: 152.70, upperMm: 53.95 },
  { ratio: '6 to 1', lowerInches: 6.680, upperInches: 2.428, lowerMm: 169.66, upperMm: 61.66 },
  { ratio: '7 to 1', lowerInches: 7.157, upperInches: 2.655, lowerMm: 181.78, upperMm: 67.44 },
  { ratio: '8 to 1', lowerInches: 7.515, upperInches: 2.832, lowerMm: 190.87, upperMm: 71.94 },
  { ratio: '9 to 1', lowerInches: 7.793, upperInches: 2.974, lowerMm: 197.94, upperMm: 75.53 },
  { ratio: '10 to 1', lowerInches: 8.016, upperInches: 3.090, lowerMm: 203.60, upperMm: 78.48 },
  { ratio: '12 to 1', lowerInches: 8.350, upperInches: 3.268, lowerMm: 212.08, upperMm: 83.01 },
  { ratio: '16 to 1', lowerInches: 8.767, upperInches: 3.499, lowerMm: 222.68, upperMm: 88.86 },
];

export const GortonP12: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'table' | 'guide' | 'roll_sync'>('calculator');
  const [rangeMode, setRangeMode] = useState<'standard' | 'low_ratio'>('standard');
  const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');

  // Calculator inputs
  const [ratioVal, setRatioVal] = useState<string>('5.0');
  const [copyLength, setCopyLength] = useState<string>('10.0');
  const [workLength, setWorkLength] = useState<string>('2.0');
  const [calcTarget, setCalcTarget] = useState<'ratio' | 'work' | 'copy'>('ratio');

  // Stylus & Cutter Synchronizer inputs
  const [cutterDia, setCutterDia] = useState<string>('0.125');
  const [rollerDia, setRollerDia] = useState<string>('0.625');
  const [syncTarget, setSyncTarget] = useState<'roller' | 'cutter'>('roller');

  // Roll Attachment inputs
  const [rollDia, setRollDia] = useState<string>('2.000');
  const [isRollMode, setIsRollMode] = useState<boolean>(false);

  // Parse ratio
  const ratio = Math.max(1.1, parseFloat(ratioVal) || 2.0);

  // Gorton Factory Constants (Page 29 & 30)
  // Standard Range (2:1 to 40:1)
  const A_std = 20.0390;
  const B_std = 12.7450;
  const C_std = 10.0195;
  const D_std = 4.2483;

  // Low Ratio Range (1:1 to 2:1)
  const A_low = 10.0195;
  const B_low = 12.7450;
  const C_low = 6.3725;

  let lowerBarSettingInches = 0;
  let upperBarSettingInches = 0;
  let lowerBarSettingMm = 0;
  let upperBarSettingMm = 0;
  let lowerGraduationLabel = 'Graduation "2" on Lower Slider Bar';
  let upperGraduationLabel = 'Graduation "2" on Upper Slider Bar';

  if (rangeMode === 'standard') {
    // Step 1: A ÷ Required Reduction = E
    const E = A_std / ratio;
    // Step 2: C - E = Setting Distance from Graduation "2" on Lower Bar
    lowerBarSettingInches = Math.max(0, C_std - E);
    lowerBarSettingMm = lowerBarSettingInches * 25.4;

    // Step 3: B ÷ (Required Reduction + 1) = F
    const F = B_std / (ratio + 1);
    // Step 4: D - F = Setting Distance from Graduation "2" on Upper Bar
    upperBarSettingInches = Math.max(0, D_std - F);
    upperBarSettingMm = upperBarSettingInches * 25.4;

    lowerGraduationLabel = 'Graduation "2" on Lower Slider Bar';
    upperGraduationLabel = 'Graduation "2" on Upper Slider Bar';
  } else {
    // Low Ratio Mode (1:1 to 2:1)
    // Step 1: A ÷ Required Reduction = D
    const D = A_low / ratio;
    // Step 2: A - D = Setting Distance from Graduation "1" and "2" on Lower Block
    lowerBarSettingInches = Math.max(0, A_low - D);
    lowerBarSettingMm = lowerBarSettingInches * 25.4;

    // Step 3: B ÷ (Required Reduction + 1) = E
    const E = B_low / (ratio + 1);
    // Step 4: C - E = Setting Distance from Graduation "1" on Upper Bar
    upperBarSettingInches = Math.max(0, C_low - E);
    upperBarSettingMm = upperBarSettingInches * 25.4;

    lowerGraduationLabel = 'Graduation "1" and "2" on Lower Slider Block';
    upperGraduationLabel = 'Graduation "1" on Upper Slider Bar';
  }

  // Handle dimension recalculations
  const handleDimensionChange = (field: 'ratio' | 'copy' | 'work', value: string) => {
    if (field === 'ratio') {
      setRatioVal(value);
      const r = parseFloat(value) || 2.0;
      if (calcTarget === 'work') {
        const c = parseFloat(copyLength) || 10.0;
        setWorkLength((c / r).toFixed(3));
      } else if (calcTarget === 'copy') {
        const w = parseFloat(workLength) || 2.0;
        setCopyLength((w * r).toFixed(3));
      }
    } else if (field === 'copy') {
      setCopyLength(value);
      const c = parseFloat(value) || 10.0;
      if (calcTarget === 'ratio') {
        const w = parseFloat(workLength) || 2.0;
        const newR = w > 0 ? c / w : 2.0;
        setRatioVal(newR.toFixed(2));
      } else if (calcTarget === 'work') {
        const r = parseFloat(ratioVal) || 2.0;
        setWorkLength((c / r).toFixed(3));
      }
    } else if (field === 'work') {
      setWorkLength(value);
      const w = parseFloat(value) || 2.0;
      if (calcTarget === 'ratio') {
        const c = parseFloat(copyLength) || 10.0;
        const newR = w > 0 ? c / w : 2.0;
        setRatioVal(newR.toFixed(2));
      } else if (calcTarget === 'copy') {
        const r = parseFloat(ratioVal) || 2.0;
        setCopyLength((w * r).toFixed(3));
      }
    }
  };

  // Roll Attachment Circumference calculation (Page 27)
  const rollDiameter = parseFloat(rollDia) || 2.0;
  const rollCircumference = rollDiameter * Math.PI;
  const masterRollLength = rollCircumference * ratio;

  // Stylus/Cutter Roller Synchronizer calculation (Page 20)
  const cDia = parseFloat(cutterDia) || 0.125;
  const rDia = parseFloat(rollerDia) || 0.625;
  const calculatedRoller = cDia * ratio;
  const calculatedCutter = rDia / ratio;

  // SVG Visualizer Geometry (Kinematic Pantograph Linkage)
  const svgW = 480;
  const svgH = 340;
  const anchorX = 120; // Pivot on column base
  const anchorY = 70;
  
  // As ratio increases from 2:1 to 40:1, the slider block position moves closer to the pivot anchor
  // We scale the visual linkage length to represent this kinematic transformation clearly
  const visualScale = Math.min(1.0, Math.max(0.15, 2.0 / ratio));
  const armLen = 260;
  const lowerBlockX = anchorX + (armLen * visualScale);
  const lowerBlockY = anchorY + 120;
  const upperBlockX = anchorX + (armLen * visualScale * 0.7);
  const upperBlockY = anchorY + 60;
  
  const stylusX = anchorX + armLen + 20;
  const stylusY = anchorY + 220;
  const spindleX = anchorX + (stylusX - anchorX) * (1 / ratio);
  const spindleY = anchorY + (stylusY - anchorY) * (1 / ratio);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 0' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(245, 158, 11, 0.12)',
          color: '#f59e0b',
          padding: '5px 16px',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 700,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <span>📜 Gorton Manual 2701-A Verified</span>
          <span style={{ color: '#fff', opacity: 0.6 }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>Model P1-2 / P1-2 Heavy Duty</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Gorton P1-2 Pantomill Reduction & Setup Suite
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Precision pantograph bar setting calculator, master-to-workpiece scaling, Model 727 roll attachment circumference math, and style-to-cutter roller synchronizer based on official Gorton factory constants.
        </p>
      </div>

      {/* Mode Navigation & Unit Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-primary)', padding: '5px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('calculator')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'calculator' ? '#f59e0b' : 'transparent',
              color: activeTab === 'calculator' ? '#000' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⚙️ Bar Setting Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('roll_sync')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'roll_sync' ? 'linear-gradient(135deg, #38bdf8, #3b82f6)' : 'transparent',
              color: activeTab === 'roll_sync' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>⭕ Roll Engraving & Stylus Rollers</span>
          </button>

          <button
            onClick={() => setActiveTab('table')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'table' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'table' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span>📊 Factory Reduction Table</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '10px 18px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'guide' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'guide' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <span>📖 Manual & Setup Guide</span>
          </button>
        </div>

        {/* Measurement Unit Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Units:</span>
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setUnit('imperial')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '4px',
                background: unit === 'imperial' ? '#f59e0b' : 'transparent',
                color: unit === 'imperial' ? '#000' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Imperial (Inches)
            </button>
            <button
              onClick={() => setUnit('metric')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: '4px',
                background: unit === 'metric' ? '#f59e0b' : 'transparent',
                color: unit === 'metric' ? '#000' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Metric (mm)
            </button>
          </div>
        </div>

      </div>

      {/* MAIN VIEW 1: BAR SETTING CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          {/* Left Column: Reduction Ratio & Parameters */}
          <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📐 Pantograph Bar Ratio Settings</span>
              </h3>
            </div>

            {/* Range Mode Switcher (Page 29 vs Page 30) */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Reduction Range Standard Formula
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={() => { setRangeMode('standard'); if (ratio < 2.0) setRatioVal('2.0'); }}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: rangeMode === 'standard' ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                    background: rangeMode === 'standard' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-tertiary)',
                    color: rangeMode === 'standard' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Standard (2:1 to 40:1)
                </button>
                <button
                  onClick={() => { setRangeMode('low_ratio'); if (ratio > 2.0) setRatioVal('1.8'); }}
                  style={{
                    padding: '10px',
                    borderRadius: '6px',
                    border: rangeMode === 'low_ratio' ? '2px solid #38bdf8' : '1px solid var(--border-color)',
                    background: rangeMode === 'low_ratio' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-tertiary)',
                    color: rangeMode === 'low_ratio' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  Low Ratio (1:1 to 2:1)
                </button>
              </div>
            </div>

            {/* Target Calculator Selector */}
            <div style={{ marginBottom: '20px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🔄 Select Variable To Calculate:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { id: 'ratio', label: 'Ratio (R)' },
                  { id: 'work', label: 'Work Size' },
                  { id: 'copy', label: 'Master Copy' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setCalcTarget(t.id as any)}
                    style={{
                      padding: '8px',
                      borderRadius: '4px',
                      border: 'none',
                      background: calcTarget === t.id ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                      color: calcTarget === t.id ? '#000' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
              
              {/* Reduction Ratio Input */}
              <div>
                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: calcTarget === 'ratio' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <span>Reduction Ratio (e.g. 5 for 5:1)</span>
                  {calcTarget === 'ratio' && <span style={{ color: '#00f0ff', fontWeight: 800 }}>[ CALCULATED ]</span>}
                </label>
                <input
                  type="number"
                  value={ratioVal}
                  step="0.1"
                  min={rangeMode === 'standard' ? 2.0 : 1.0}
                  max={rangeMode === 'standard' ? 40.0 : 2.0}
                  disabled={calcTarget === 'ratio'}
                  onChange={(e) => handleDimensionChange('ratio', e.target.value)}
                  className="input-precision"
                  style={{ 
                    fontWeight: 700, 
                    fontSize: '1.2rem', 
                    color: calcTarget === 'ratio' ? '#00f0ff' : '#fff',
                    background: calcTarget === 'ratio' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-tertiary)',
                    borderColor: calcTarget === 'ratio' ? '#00f0ff' : 'var(--border-color)'
                  }}
                />
              </div>

              {/* Master Copy Length */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, fontSize: '0.8rem', color: calcTarget === 'copy' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    <span>Master Copy Length</span>
                    {calcTarget === 'copy' && <span style={{ color: '#00f0ff', fontWeight: 800 }}>[ CALC ]</span>}
                  </label>
                  <input
                    type="number"
                    value={copyLength}
                    step="0.1"
                    disabled={calcTarget === 'copy'}
                    onChange={(e) => handleDimensionChange('copy', e.target.value)}
                    className="input-precision"
                    style={{ 
                      fontWeight: 700, 
                      color: calcTarget === 'copy' ? '#00f0ff' : '#fff',
                      background: calcTarget === 'copy' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-tertiary)'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Template / Brass Type Size
                  </span>
                </div>

                {/* Finished Workpiece Length */}
                <div>
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: 600, fontSize: '0.8rem', color: calcTarget === 'work' ? 'var(--accent-cyan)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    <span>Finished Work Size</span>
                    {calcTarget === 'work' && <span style={{ color: '#00f0ff', fontWeight: 800 }}>[ CALC ]</span>}
                  </label>
                  <input
                    type="number"
                    value={workLength}
                    step="0.05"
                    disabled={calcTarget === 'work'}
                    onChange={(e) => handleDimensionChange('work', e.target.value)}
                    className="input-precision"
                    style={{ 
                      fontWeight: 700, 
                      color: calcTarget === 'work' ? '#00f0ff' : '#fff',
                      background: calcTarget === 'work' ? 'rgba(0, 240, 255, 0.08)' : 'var(--bg-tertiary)'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                    Engraved Cut Dimension
                  </span>
                </div>
              </div>

            </div>

            {/* Roll Attachment Checkbox Preview */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                <input
                  type="checkbox"
                  checked={isRollMode}
                  onChange={(e) => setIsRollMode(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#f59e0b' }}
                />
                <span>⭕ Model 727 Roll Attachment Circumference Mode</span>
              </label>
              {isRollMode && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Cylinder / Roll Diameter ({unit === 'imperial' ? 'in' : 'mm'}):
                    </label>
                    <input
                      type="number"
                      value={rollDia}
                      step="0.1"
                      onChange={(e) => setRollDia(e.target.value)}
                      className="input-precision"
                      style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Required Master Length:</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#f59e0b' }}>
                      {masterRollLength.toFixed(3)} {unit === 'imperial' ? 'in' : 'mm'}
                    </strong>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Exact Bar Setting Results & Kinematic Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* EXACT BAR SETTING DASHBOARD */}
            <div className="glass-panel" style={{ padding: '30px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.75) 100%)', borderTop: '3px solid #00f0ff' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '22px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    OFFICIAL GORTON FACTORY CALIBRATION
                  </span>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00f0ff', marginTop: '4px' }}>
                    {ratio.toFixed(2)} : 1 Reduction Ratio Settings
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>SCALE SETTING</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#f59e0b' }}>
                    Figure "{Math.round(ratio)}" Notch
                  </span>
                </div>
              </div>

              {/* Primary Bar Setting Display Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                
                {/* Lower Slider Bar Setting */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  boxShadow: '0 10px 25px -5px rgba(0, 240, 255, 0.15)',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                    LOWER BAR
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                    SETTING DISTANCE
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 700, color: '#00f0ff', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
                    {unit === 'imperial' ? lowerBarSettingInches.toFixed(3) : lowerBarSettingMm.toFixed(2)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                    {unit === 'imperial' ? 'Inches' : 'Millimeters'} from {lowerGraduationLabel}
                  </span>
                </div>

                {/* Upper Slider Bar Setting */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.15)',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                    UPPER BAR
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                    SETTING DISTANCE
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 700, color: '#f59e0b', textShadow: '0 0 15px rgba(245, 158, 11, 0.4)' }}>
                    {unit === 'imperial' ? upperBarSettingInches.toFixed(3) : upperBarSettingMm.toFixed(2)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', lineHeight: 1.4 }}>
                    {unit === 'imperial' ? 'Inches' : 'Millimeters'} from {upperGraduationLabel}
                  </span>
                </div>

              </div>

              {/* Pro Setup Tip from Manual (Page 15) */}
              <div style={{
                background: 'rgba(56, 189, 248, 0.1)',
                borderLeft: '4px solid #38bdf8',
                padding: '12px 16px',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: '0.85rem',
                color: '#7dd3fc',
                lineHeight: 1.5
              }}>
                <strong>💡 Factory Setup Note (Page 15):</strong> For extreme repetitive accuracy, align the index line on the slider blocks with the bar calibrations using a <strong>magnifying glass</strong>. Never strike slider blocks with a hammer; loosen clamping screws fully before sliding.
              </div>

            </div>

            {/* KINEMATIC PANTOGRAPH LINKAGE VISUALIZER */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    TOP-DOWN LINKAGE TELEMETRY
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    Kinematic Ratio Geometry ({ratio.toFixed(1)}:1)
                  </h4>
                </div>
                <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontSize: '0.7rem', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.4)', fontWeight: 700 }}>
                  LIVE CALIBRATED
                </span>
              </div>

              {/* SVG Canvas */}
              <div style={{ position: 'relative', width: `${svgW}px`, height: `${svgH}px`, background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }}>
                <svg width={svgW} height={svgH}>
                  <defs>
                    <pattern id="pantoGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  
                  <rect width={svgW} height={svgH} fill="url(#pantoGrid)" />

                  {/* Copy Table Outline (Right Side) */}
                  <rect x={stylusX - 50} y={stylusY - 40} width="110" height="80" fill="rgba(255,255,255,0.02)" stroke="#475569" strokeDasharray="4 2" rx="4" />
                  <text x={stylusX} y={stylusY + 55} fill="#64748b" fontSize="10" textAnchor="middle" fontWeight="bold">COPY / MASTER TABLE</text>

                  {/* Work Table Outline (Left Side under Spindle) */}
                  <rect x={spindleX - 45} y={spindleY - 35} width="90" height="70" fill="rgba(0, 240, 255, 0.04)" stroke="#00f0ff" strokeDasharray="4 2" rx="4" />
                  <text x={spindleX} y={spindleY + 50} fill="#00f0ff" fontSize="10" textAnchor="middle" fontWeight="bold">WORK TABLE (ENGRAVING)</text>

                  {/* LINKAGE BARS */}
                  {/* 1. Tracer Arm (Long Arm from Pivot to Stylus) */}
                  <line x1={anchorX} y1={anchorY} x2={stylusX} y2={stylusY} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
                  <line x1={anchorX} y1={anchorY} x2={stylusX} y2={stylusY} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />

                  {/* 2. Lower Slider Bar (From Lower Block to Spindle Link) */}
                  <line x1={lowerBlockX} y1={lowerBlockY} x2={spindleX} y2={spindleY} stroke="#00f0ff" strokeWidth="7" strokeLinecap="round" />
                  <line x1={lowerBlockX} y1={lowerBlockY} x2={spindleX} y2={spindleY} stroke="#7dd3fc" strokeWidth="3" strokeLinecap="round" />

                  {/* 3. Upper Slider Bar (Parallel support) */}
                  <line x1={upperBlockX} y1={upperBlockY} x2={spindleX - 20} y2={spindleY - 40} stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />

                  {/* 4. Cutter Head Link (Vertical connecting link) */}
                  <line x1={spindleX - 20} y1={spindleY - 40} x2={spindleX} y2={spindleY} stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />

                  {/* PIVOT JOINTS / BLOCKS */}
                  {/* Anchor Column Base */}
                  <circle cx={anchorX} cy={anchorY} r="10" fill="#1e293b" stroke="#fff" strokeWidth="2" />
                  <circle cx={anchorX} cy={anchorY} r="4" fill="#fff" />
                  <text x={anchorX - 15} y={anchorY - 12} fill="#cbd5e1" fontSize="11" fontWeight="bold">Column Pivot</text>

                  {/* Lower Slider Block (Graduation setting point!) */}
                  <rect x={lowerBlockX - 12} y={lowerBlockY - 12} width="24" height="24" fill="#00f0ff" stroke="#000" strokeWidth="2" rx="4" />
                  <text x={lowerBlockX + 18} y={lowerBlockY + 4} fill="#00f0ff" fontSize="11" fontWeight="bold">Lower Block ("F")</text>

                  {/* Upper Slider Block */}
                  <rect x={upperBlockX - 10} y={upperBlockY - 10} width="20" height="20" fill="#f59e0b" stroke="#000" strokeWidth="2" rx="4" />
                  <text x={upperBlockX + 15} y={upperBlockY + 4} fill="#f59e0b" fontSize="11" fontWeight="bold">Upper Block ("H")</text>

                  {/* Tracer Stylus Point (Right) */}
                  <circle cx={stylusX} cy={stylusY} r="8" fill="#ec4899" stroke="#fff" strokeWidth="2" />
                  <circle cx={stylusX} cy={stylusY} r="3" fill="#fff" />
                  <text x={stylusX} y={stylusY - 14} fill="#ec4899" fontSize="11" textAnchor="middle" fontWeight="bold">Stylus (3253 / 795-1)</text>

                  {/* Cutter Spindle Point (Left over work) */}
                  <circle cx={spindleX} cy={spindleY} r="9" fill="#00ff80" stroke="#fff" strokeWidth="2.5" />
                  <circle cx={spindleX} cy={spindleY} r="3" fill="#000" />
                  <text x={spindleX} y={spindleY - 16} fill="#00ff80" fontSize="11" textAnchor="middle" fontWeight="bold">Cutter Spindle (1/4" / 5/16")</text>
                </svg>

                {/* Telemetry Footer Overlay */}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.9)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  <span>Ratio: </span><strong style={{ color: '#00f0ff' }}>{ratio.toFixed(2)} : 1</strong>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.9)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  <span>Scale Notch: </span><strong style={{ color: '#f59e0b' }}>Fig "{Math.round(ratio)}"</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '25px', marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#00f0ff', borderRadius: '2px', display: 'inline-block' }}></span>
                  <span>Lower Bar ("E" / "F")</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '2px', display: 'inline-block' }}></span>
                  <span>Upper Bar ("G" / "H")</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#00ff80', borderRadius: '50%', display: 'inline-block' }}></span>
                  <span>Cutter Spindle</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MAIN VIEW 2: ROLL ENGRAVING & STYLUS ROLLER SYNCHRONIZER */}
      {activeTab === 'roll_sync' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px' }}>
          
          {/* Card 1: Stylus Roller to Cutter Diameter Synchronizer (Page 20) */}
          <div className="glass-panel" style={{ padding: '35px', borderTop: '3px solid #38bdf8' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⭕ Stylus Roller & Cutter Synchronizer</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: 1.6 }}>
              When engraving raised or non-uniform relief lettering with Style Sets 795-1 / 25-1 (Page 20), cutter diameter must be precisely proportional to stylus roller diameter based on reduction ratio (Roller Dia = Cutter Dia × Ratio).
            </p>

            <div style={{ marginBottom: '20px', background: 'var(--bg-secondary)', padding: '15px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>
                Select Variable To Calculate:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setSyncTarget('roller')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                    background: syncTarget === 'roller' ? '#38bdf8' : 'var(--bg-tertiary)',
                    color: syncTarget === 'roller' ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Calculate Roller Size
                </button>
                <button
                  onClick={() => setSyncTarget('cutter')}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px', border: 'none',
                    background: syncTarget === 'cutter' ? '#38bdf8' : 'var(--bg-tertiary)',
                    color: syncTarget === 'cutter' ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700, cursor: 'pointer'
                  }}
                >
                  Calculate Cutter Size
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Cutter Diameter (in)
                </label>
                <input
                  type="number"
                  value={syncTarget === 'roller' ? cutterDia : calculatedCutter.toFixed(4)}
                  step="0.005"
                  disabled={syncTarget === 'cutter'}
                  onChange={(e) => setCutterDia(e.target.value)}
                  className="input-precision"
                  style={{ fontWeight: 700, color: syncTarget === 'cutter' ? '#00f0ff' : '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Stylus Roller Diameter (in)
                </label>
                <input
                  type="number"
                  value={syncTarget === 'cutter' ? rollerDia : calculatedRoller.toFixed(4)}
                  step="0.01"
                  disabled={syncTarget === 'roller'}
                  onChange={(e) => setRollerDia(e.target.value)}
                  className="input-precision"
                  style={{ fontWeight: 700, color: syncTarget === 'roller' ? '#f59e0b' : '#fff' }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                Proportional Rule at {ratio.toFixed(2)} : 1 Ratio
              </span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                {syncTarget === 'roller' ? `${cutterDia}" Cutter ➔ ${calculatedRoller.toFixed(3)}" Roller` : `${rollerDia}" Roller ➔ ${calculatedCutter.toFixed(3)}" Cutter`}
              </div>
            </div>
          </div>

          {/* Card 2: Model 727 Roll Attachment Specifications & Formulas (Pages 26-27) */}
          <div className="glass-panel" style={{ padding: '35px', borderTop: '3px solid #f59e0b', background: 'var(--bg-primary)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', marginBottom: '12px' }}>
              ⚙️ Model 727 Roll Attachment Guide
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: 1.6 }}>
              The Gorton 727 Roll Attachment replaces the standard slider head to engrave cylindrical workpieces (0.75" to 3.0" dia, up to 7" length) without requiring a curved forming guide.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '25px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #00f0ff' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>1. Master Circumference Scaling Rule:</strong>
                Flat master length = Cylinder Circumference (π × D) × Reduction Ratio (R). Example: 2" cylinder at 2:1 ratio requires 6.2832 × 2 = 12.5664" master template length.
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #f59e0b' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>2. Steel Band & Roll Tensioning:</strong>
                Rotation is synchronized via steel bands running over rollers. Release band tension lever before mounting work; return lever to lock position to automatically re-apply exact factory tension.
              </div>

              <div style={{ background: 'var(--bg-secondary)', padding: '14px', borderRadius: '6px', borderLeft: '4px solid #ef4444' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>3. Caution on Slide Cleaning (Page 27):</strong>
                Never use an air blast to clean chips from roll attachment ball bearing slides! Air pressure forces abrasive chips into precision bearings. Always use a soft brush.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* MAIN VIEW 3: FACTORY REDUCTION TABLE (Pages 31-33) */}
      {activeTab === 'table' && (
        <div className="glass-panel" style={{ padding: '35px', background: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                📊 Factory Reduction Table (Gorton Manual Pages 31-33)
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '4px' }}>
                Standard calibration distances from Graduation "2" for Lower Bar and Upper Bar. Click any row to load settings into calculator!
              </p>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, background: 'rgba(0, 240, 255, 0.1)', padding: '6px 14px', borderRadius: '20px' }}>
              22 Standard Factory Ratios
            </div>
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.92rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '14px', borderBottom: '2px solid var(--border-color)' }}>Reduction Ratio</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid var(--border-color)' }}>Lower Bar (Inches)</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid var(--border-color)' }}>Upper Bar (Inches)</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid var(--border-color)' }}>Lower Bar (mm)</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid var(--border-color)' }}>Upper Bar (mm)</th>
                  <th style={{ padding: '14px', borderBottom: '2px solid var(--border-color)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {FACTORY_TABLE.map((row, idx) => {
                  const numVal = parseFloat(row.ratio.split(' ')[0]);
                  const isCurrent = Math.abs(numVal - ratio) < 0.05;
                  return (
                    <tr 
                      key={row.ratio}
                      style={{ 
                        background: isCurrent ? 'rgba(0, 240, 255, 0.12)' : idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-tertiary)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => { setRatioVal(numVal.toString()); setActiveTab('calculator'); }}
                    >
                      <td style={{ padding: '12px', fontWeight: 700, color: isCurrent ? '#00f0ff' : '#fff' }}>{row.ratio}</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>{row.lowerInches.toFixed(3)}"</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: '#f59e0b' }}>{row.upperInches.toFixed(3)}"</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{row.lowerMm.toFixed(2)} mm</td>
                      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{row.upperMm.toFixed(2)} mm</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: '0.75rem', background: 'var(--accent-cyan)', color: '#000', padding: '3px 10px', borderRadius: '12px', fontWeight: 700 }}>
                          Load Ratio ➔
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN VIEW 4: MANUAL & SETUP GUIDE (Pages 11-25) */}
      {activeTab === 'guide' && (
        <div className="glass-panel" style={{ padding: '40px', background: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: '950px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: '10px', borderBottom: '2px solid rgba(245, 158, 11, 0.3)', paddingBottom: '12px' }}>
              📖 Gorton P1-2 Maintenance & Setup Reference
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Key toolroom procedures extracted directly from Gorton Manual 2701-A for machine leveling, pantograph bar installation, lubrication schedules, and spindle maintenance.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '25px' }}>
              
              {/* Box 1: Installing Pantograph Bars */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#00f0ff', marginBottom: '12px', fontWeight: 700 }}>
                  🛠️ Setting & Installing Pantograph Bars (Page 12)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  1. Remove eye nut on top of slider head and push down forming guide bar to release the hinged cutter head and link.<br/>
                  2. Move slider head to the position indicating on the numbered scale the ratio of reduction to be used, then tighten acorn hex nut.<br/>
                  3. Place slider bar <strong>"E"</strong> in slider block <strong>"F"</strong> with index line to the front.<br/>
                  4. Insert slider bar <strong>"G"</strong> in slider block <strong>"H"</strong> with index line on milled flat to the front.<br/>
                  5. <strong>Caution:</strong> Parts are carefully hand-scraped and fitted; no force or hammering is ever necessary to slip bars into blocks!
                </p>
              </div>

              {/* Box 2: Lubrication Schedule */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#00ff80', marginBottom: '12px', fontWeight: 700 }}>
                  🛢️ Spindle & Machine Lubrication (Page 12-13)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  • <strong>Cutter Spindle:</strong> Apply 2 to 4 drops of spindle oil (Socony Mobil Velocity #10 or Sun Oil Solnus #70) to each marked oil hole twice daily.<br/>
                  • <strong>Feed Screws & Ways:</strong> Maintain a slight film of clean oil (Socony Mobil Vactra #2 or Sun Oil SWL #80) on all bearing surfaces and table/knee screws.<br/>
                  • <strong>Pantograph Bearings:</strong> All linkage pivots and cutter head bearings are permanently double-sealed grease bearings and require <strong>no lubrication</strong>!
                </p>
              </div>

              {/* Box 3: Spindle Bore & Forming Guides */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#f59e0b', marginBottom: '12px', fontWeight: 700 }}>
                  🌀 Spindle Bore & Forming Guides (Page 21-23)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  • <strong>Spindle Bore Adjustment:</strong> Two set screws on housing adjust vertical floating fit. Spindle must move vertically freely without side play. Use a thin paper shim to verify both set screws make even contact.<br/>
                  • <strong>Forming Guide Operation:</strong> For curved engraving, forming guide contour must be exact opposite of workpiece (e.g. convex work requires concave guide). Coat guide with grease so former point slides without friction.
                </p>
              </div>

              {/* Box 4: Heavy-Duty Model & Super-Speed Spindle */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#ec4899', marginBottom: '12px', fontWeight: 700 }}>
                  ⚡ P1-2 Heavy-Duty & 45,000 RPM Spindle (Page 6 & 24)
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                  • <strong>Combination Cutter Head:</strong> The Heavy-Duty P1-2 features a split cutter head. By removing 4 cap screws at the lower end, the standard belt spindle and feed works can be swapped for the 45,000 RPM Super-Speed Electric Spindle in seconds.<br/>
                  • <strong>Formula Compatibility:</strong> All reduction formulas, constants, and tables for the standard P1-2 apply identically to the P1-2 Heavy Duty Model.
                </p>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '35px' }}>
              <button
                onClick={() => setActiveTab('calculator')}
                style={{
                  padding: '12px 28px',
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Return to Bar Setting Calculator
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
