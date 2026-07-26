import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface MaterialPreset {
  name: string;
  sfm: number;      // Surface Feet per Minute (Carbide average)
  vc: number;       // Cutting speed m/min
  ipt: number;      // Inches per tooth / rev
  fz: number;       // mm per tooth / rev
  hardness: string;
  category: 'aluminum' | 'steel' | 'stainless' | 'exotic' | 'plastic';
  kFactor: number;  // Unit Power (HP/in³/min)
}

const MATERIALS: MaterialPreset[] = [
  { name: 'Aluminum 6061 / 7075', sfm: 1000, vc: 300, ipt: 0.005, fz: 0.12, hardness: '95 HB', category: 'aluminum', kFactor: 0.25 },
  { name: 'Mild Steel (1018 / A36 / 1045)', sfm: 350, vc: 105, ipt: 0.003, fz: 0.08, hardness: '130 HB', category: 'steel', kFactor: 0.70 },
  { name: 'Alloy Steel (4140 / 4340 PH)', sfm: 250, vc: 75, ipt: 0.0025, fz: 0.06, hardness: '28-32 HRC', category: 'steel', kFactor: 0.90 },
  { name: 'Tool Steel (D2 / H13 / A2)', sfm: 150, vc: 45, ipt: 0.0018, fz: 0.045, hardness: '20-25 HRC', category: 'steel', kFactor: 1.20 },
  { name: 'Stainless Steel (304 / 316L)', sfm: 220, vc: 65, ipt: 0.002, fz: 0.05, hardness: '180 HB', category: 'stainless', kFactor: 0.85 },
  { name: '17-4 PH Stainless', sfm: 180, vc: 55, ipt: 0.0018, fz: 0.045, hardness: '33 HRC', category: 'stainless', kFactor: 0.95 },
  { name: 'Brass / Bronze (Free Cutting)', sfm: 500, vc: 150, ipt: 0.004, fz: 0.10, hardness: '110 HB', category: 'aluminum', kFactor: 0.30 },
  { name: 'Cast Iron (Grey G2500 / G3000)', sfm: 300, vc: 90, ipt: 0.003, fz: 0.08, hardness: '200 HB', category: 'steel', kFactor: 0.60 },
  { name: 'Titanium (Ti-6Al-4V Grade 5)', sfm: 140, vc: 42, ipt: 0.0015, fz: 0.035, hardness: '36 HRC', category: 'exotic', kFactor: 1.10 },
  { name: 'Inconel 718 / Superalloys', sfm: 80, vc: 24, ipt: 0.001, fz: 0.025, hardness: '38-42 HRC', category: 'exotic', kFactor: 1.40 },
  { name: 'Engineering Plastics (Delrin / Nylon / PEEK)', sfm: 800, vc: 240, ipt: 0.008, fz: 0.20, hardness: '80 Shore D', category: 'plastic', kFactor: 0.15 },
];

export const SpeedsFeeds: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);
  const [activeTab, setActiveTab] = useState<'speeds_feeds' | 'chip_thinning' | 'formulas'>('speeds_feeds');
  const [selectedMat, setSelectedMat] = useState<number>(0);

  // Core Inputs
  const [toolDia, setToolDia] = useState<string>('0.500');
  const [flutes, setFlutes] = useState<number>(4);
  const [customSpeed, setCustomSpeed] = useState<string>('1000'); // SFM or m/min
  const [customFeed, setCustomFeed] = useState<string>('0.005');  // IPT or fz
  const [widthOfCut, setWidthOfCut] = useState<string>('0.125');  // Radial Stepover (Ae)
  const [depthOfCut, setDepthOfCut] = useState<string>('0.500');  // Axial Depth (Ap)
  const [cutLength, setCutLength] = useState<string>('10.0');     // Pass length for time estimate
  const [cornerRad, setCornerRad] = useState<string>('0.031');    // Tool Corner/Nose radius for Ra finish
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Chip Thinning specific inputs
  const [targetCpt, setTargetCpt] = useState<string>('0.005');

  // SVG Animation state
  const [rotation, setRotation] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const animRef = useRef<number | null>(null);

  // Animation Loop for Endmill Rotation
  useEffect(() => {
    if (!isAnimating) return;
    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;
      // Rotate based on RPM (scaled for smooth visualization)
      setRotation(r => (r + (dt * 0.3)) % 360);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isAnimating]);

  const handleMaterialChange = (idx: number) => {
    setSelectedMat(idx);
    setIsCustom(false);
    const mat = MATERIALS[idx];
    if (unit === 'imperial') {
      setCustomSpeed(mat.sfm.toString());
      setCustomFeed(mat.ipt.toString());
      setTargetCpt(mat.ipt.toString());
    } else {
      setCustomSpeed(mat.vc.toString());
      setCustomFeed(mat.fz.toString());
      setTargetCpt(mat.fz.toString());
    }
  };

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const diaVal = parseFloat(toolDia) || 0;
    const wocVal = parseFloat(widthOfCut) || 0;
    const docVal = parseFloat(depthOfCut) || 0;
    const lenVal = parseFloat(cutLength) || 0;
    const radVal = parseFloat(cornerRad) || 0;
    const cptVal = parseFloat(targetCpt) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setToolDia((diaVal * 25.4).toFixed(2));
      setWidthOfCut((wocVal * 25.4).toFixed(2));
      setDepthOfCut((docVal * 25.4).toFixed(2));
      setCutLength((lenVal * 25.4).toFixed(1));
      setCornerRad((radVal * 25.4).toFixed(2));
      setTargetCpt((cptVal * 25.4).toFixed(3));
      const mat = MATERIALS[selectedMat];
      setCustomSpeed(mat.vc.toString());
      setCustomFeed(mat.fz.toString());
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setToolDia((diaVal / 25.4).toFixed(3));
      setWidthOfCut((wocVal / 25.4).toFixed(3));
      setDepthOfCut((docVal / 25.4).toFixed(3));
      setCutLength((lenVal / 25.4).toFixed(2));
      setCornerRad((radVal / 25.4).toFixed(4));
      setTargetCpt((cptVal / 25.4).toFixed(4));
      const mat = MATERIALS[selectedMat];
      setCustomSpeed(mat.sfm.toString());
      setCustomFeed(mat.ipt.toString());
    }
    setIsCustom(false);
  }, [unit]);

  // Basic Calculations
  const dia = Math.max(0.001, parseFloat(toolDia) || 0.001);
  const speedVal = parseFloat(customSpeed) || 0;
  const feedVal = parseFloat(customFeed) || 0;
  const woc = Math.min(dia, Math.max(0.0001, parseFloat(widthOfCut) || 0.001));
  const doc = Math.max(0.0001, parseFloat(depthOfCut) || 0.001);
  const length = Math.max(0.001, parseFloat(cutLength) || 1.0);
  const radius = Math.max(0.0001, parseFloat(cornerRad) || 0.031);
  const tCpt = Math.max(0.0001, parseFloat(targetCpt) || feedVal);

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

  // Machining Time (Minutes & Seconds)
  const totalMinutes = ipmOrMmMin > 0 ? length / ipmOrMmMin : 0;
  const cutMinutes = Math.floor(totalMinutes);
  const cutSeconds = Math.round((totalMinutes - cutMinutes) * 60);

  // Chip Thinning (High Efficiency Machining / Dynamic Milling) Calculations (Inspired by Garr Tool)
  // Engagement Factor (Ef) & Radial Stepover %
  const radialStepoverPercent = Math.min(100, Math.max(0.1, (woc / dia) * 100));
  const isChipThinningActive = radialStepoverPercent < 50.0;
  
  let chipThinningMultiplier = 1.0;
  let revisedCpt = tCpt;
  let revisedFeedRate = rpm * flutes * tCpt;

  if (isChipThinningActive && woc < (dia * 0.5)) {
    // Garr Tool Chip Thinning Formula:
    // Revised Programmed CPT = Target CPT * [ (0.5 * (Dia / WOC)) / sqrt((Dia / WOC) - 1) ]
    const ratio = dia / woc;
    const num = 0.5 * ratio;
    const den = Math.sqrt(Math.max(0.0001, ratio - 1));
    chipThinningMultiplier = den > 0 ? num / den : 1.0;
    revisedCpt = tCpt * chipThinningMultiplier;
    revisedFeedRate = rpm * flutes * revisedCpt;
  }

  // Spindle Power (HP / kW) & Torque Calculations (Kennametal & Industrial standard)
  const spindleEfficiency = 0.80; // Assuming 80% motor-to-spindle efficiency
  const matPreset = MATERIALS[selectedMat] || MATERIALS[0];
  const effectiveMrr = activeTab === 'chip_thinning' ? (woc * doc * revisedFeedRate) : (unit === 'imperial' ? mrr : (woc * doc * ipmOrMmMin) / 1000);
  
  let horsepower = 0;
  let kilowatts = 0;
  let torqueInLb = 0;
  let torqueNm = 0;

  if (unit === 'imperial') {
    horsepower = (effectiveMrr * matPreset.kFactor) / spindleEfficiency;
    kilowatts = horsepower * 0.7457;
    torqueInLb = rpm > 0 ? (horsepower * 63025) / rpm : 0;
    torqueNm = torqueInLb * 0.112985;
  } else {
    // In metric, convert cm³/min MRR to in³/min for K-factor multiplication (1 cm³ = 0.0610237 in³)
    const effectiveMrrIn3 = effectiveMrr * 0.0610237;
    horsepower = (effectiveMrrIn3 * matPreset.kFactor) / spindleEfficiency;
    kilowatts = horsepower * 0.7457;
    torqueNm = rpm > 0 ? (kilowatts * 9549) / rpm : 0;
    torqueInLb = torqueNm / 0.112985;
  }

  // Theoretical Surface Roughness (Ra) Prediction based on Feed per Tooth & Corner Radius
  // Ra (µin) = (fz² / (32 * R)) * 1,000,000 (where fz and R are in inches)
  const effectiveFz = activeTab === 'chip_thinning' ? revisedCpt : feedVal;
  let raMicroInches = 0;
  let raMicrons = 0;
  if (unit === 'imperial') {
    raMicroInches = (Math.pow(effectiveFz, 2) / (32 * radius)) * 1000000;
    raMicrons = raMicroInches * 0.0254;
  } else {
    // fz and R in mm -> Ra in µm = (fz² / (32 * R)) * 1000
    raMicrons = (Math.pow(effectiveFz, 2) / (32 * radius)) * 1000;
    raMicroInches = raMicrons / 0.0254;
  }

  let finishQuality = 'Commercial Finish';
  if (raMicroInches < 16) finishQuality = 'Mirror / Precision Ground Quality';
  else if (raMicroInches < 32) finishQuality = 'Fine Precision Milled Finish';
  else if (raMicroInches < 63) finishQuality = 'Standard Commercial Finish';
  else finishQuality = 'Roughing Pass / Semi-Finish';

  // SVG Visualizer Dimensions & Geometry
  const svgSize = 340;
  const center = svgSize / 2;
  const maxRadiusPx = 110; // Pixels representing tool radius
  const scale = (maxRadiusPx * 2) / dia;
  const wocPx = woc * scale;

  // Workpiece box boundary coordinates
  const blockRightX = center + maxRadiusPx;
  const blockLeftX = blockRightX - wocPx;
  const blockTopY = 30;
  const blockHeight = svgSize - 60;

  // Calculate arc intersection angle for visualization
  const cosVal = Math.max(-1, Math.min(1, (maxRadiusPx - wocPx) / maxRadiusPx));
  const contactAngleRad = Math.acos(cosVal);
  const contactAngleDeg = contactAngleRad * (180 / Math.PI);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 0' }}>
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 240, 255, 0.1)',
          color: 'var(--accent-cyan)',
          padding: '5px 16px',
          borderRadius: '20px',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '12px',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}>
          <span>⚡ High-Velocity Toolroom Suite</span>
          <span style={{ color: '#fff', opacity: 0.6 }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>HEM & Dynamic Milling Enabled</span>
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Speeds & Feeds & Chip Thinning Suite
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Calculate optimal spindle RPM, table feed rates, High Efficiency Machining (HEM) chip thinning compensation, and live cutter engagement telemetry.
        </p>
      </div>

      {/* Navigation Tabs & Unit Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        
        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '10px', background: 'var(--bg-primary)', padding: '5px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('speeds_feeds')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'speeds_feeds' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'speeds_feeds' ? '#000' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚙️ Standard Speeds & Feeds</span>
          </button>

          <button
            onClick={() => setActiveTab('chip_thinning')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'chip_thinning' ? 'linear-gradient(135deg, #a855f7, #3b82f6)' : 'transparent',
              color: activeTab === 'chip_thinning' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'chip_thinning' ? '0 4px 15px rgba(168, 85, 247, 0.3)' : 'none'
            }}
          >
            <span>🌀 HEM Chip Thinning</span>
            {isChipThinningActive && (
              <span style={{ background: '#22c55e', color: '#000', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 800 }}>ACTIVE</span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('formulas')}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'formulas' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              color: activeTab === 'formulas' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>📐 Formulas Reference</span>
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      {activeTab !== 'formulas' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', alignItems: 'start' }}>
          
          {/* Left Column: Tool & Cut Parameters */}
          <div className="glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🛠️ Cutter & Workpiece Parameters</span>
              </h3>
              {isCustom && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', padding: '3px 8px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.4)', fontWeight: 600 }}>
                  Custom Overrides Active
                </span>
              )}
            </div>

            {/* Workpiece Material Selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Workpiece Material Preset (Carbide Tooling Baseline)
              </label>
              <select
                value={selectedMat}
                onChange={(e) => handleMaterialChange(parseInt(e.target.value))}
                className="input-precision"
                style={{ cursor: 'pointer', background: 'var(--bg-tertiary)', fontWeight: 600, fontSize: '0.95rem' }}
              >
                {MATERIALS.map((m, idx) => (
                  <option key={m.name} value={idx}>
                    {m.name} — [{m.hardness}] ({unit === 'imperial' ? `${m.sfm} SFM` : `${m.vc} M/Min`})
                  </option>
                ))}
              </select>
            </div>

            {/* Cutter Geometry Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Cutter Diameter ({unit === 'imperial' ? 'in' : 'mm'})
                </label>
                <input
                  type="number"
                  value={toolDia}
                  step={unit === 'imperial' ? '0.0625' : '1'}
                  onChange={(e) => setToolDia(e.target.value)}
                  className="input-precision"
                  style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent-cyan)' }}
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
                  style={{ fontWeight: 700, fontSize: '1.05rem' }}
                />
              </div>
            </div>

            {/* Cutting Speed & Feed Per Tooth */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Surface Velocity ({unit === 'imperial' ? 'SFM' : 'M/Min'})
                </label>
                <input
                  type="number"
                  value={customSpeed}
                  onChange={(e) => { setCustomSpeed(e.target.value); setIsCustom(true); }}
                  className="input-precision"
                  style={{ borderColor: isCustom ? 'var(--accent-cyan)' : 'var(--border-color)', fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {activeTab === 'chip_thinning' ? `Target Chip Load (${unit === 'imperial' ? 'IPT' : 'fz'})` : `Feed / Tooth (${unit === 'imperial' ? 'IPT' : 'fz'})`}
                </label>
                <input
                  type="number"
                  value={activeTab === 'chip_thinning' ? targetCpt : customFeed}
                  step={unit === 'imperial' ? '0.0005' : '0.01'}
                  onChange={(e) => {
                    if (activeTab === 'chip_thinning') {
                      setTargetCpt(e.target.value);
                    } else {
                      setCustomFeed(e.target.value);
                    }
                    setIsCustom(true);
                  }}
                  className="input-precision"
                  style={{ borderColor: isCustom ? '#a855f7' : 'var(--border-color)', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Radial Stepover (WOC) & Axial Depth (DOC) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: activeTab === 'chip_thinning' ? 'rgba(168, 85, 247, 0.08)' : 'transparent', padding: activeTab === 'chip_thinning' ? '12px' : '0', borderRadius: 'var(--radius-sm)', border: activeTab === 'chip_thinning' ? '1px solid rgba(168, 85, 247, 0.3)' : 'none', transition: 'all 0.3s ease' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: activeTab === 'chip_thinning' ? '#c084fc' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Radial Stepover (Ae / WOC)
                </label>
                <input
                  type="number"
                  value={widthOfCut}
                  step={unit === 'imperial' ? '0.05' : '1'}
                  onChange={(e) => setWidthOfCut(e.target.value)}
                  className="input-precision"
                  style={{ borderColor: activeTab === 'chip_thinning' ? '#c084fc' : 'var(--border-color)', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {radialStepoverPercent.toFixed(1)}% of Cutter Diameter
                </span>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Axial Depth (Ap / DOC)
                </label>
                <input
                  type="number"
                  value={depthOfCut}
                  step={unit === 'imperial' ? '0.05' : '1'}
                  onChange={(e) => setDepthOfCut(e.target.value)}
                  className="input-precision"
                  style={{ fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                  {(doc / dia).toFixed(2)}x Dia Depth Ratio
                </span>
              </div>
            </div>

            {/* Cut Length & Tool Corner Radius */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Cut Length ({unit === 'imperial' ? 'in' : 'mm'}) — Time Est.
                </label>
                <input
                  type="number"
                  value={cutLength}
                  step={unit === 'imperial' ? '1.0' : '25'}
                  onChange={(e) => setCutLength(e.target.value)}
                  className="input-precision"
                  style={{ fontWeight: 700 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Corner Radius ({unit === 'imperial' ? 'in' : 'mm'}) — Ra Finish
                </label>
                <input
                  type="number"
                  value={cornerRad}
                  step={unit === 'imperial' ? '0.015' : '0.4'}
                  onChange={(e) => setCornerRad(e.target.value)}
                  className="input-precision"
                  style={{ fontWeight: 700, color: '#f59e0b' }}
                />
              </div>
            </div>

          </div>

          {/* Right Column (Ordered Left): Dynamic Results Dashboard & SVG Visualizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', order: -1 }}>
            
            {/* RESULTS DASHBOARD */}
            <div className="glass-panel" style={{ padding: '30px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)', borderTop: activeTab === 'chip_thinning' ? '3px solid #a855f7' : '3px solid var(--accent-cyan)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    {activeTab === 'chip_thinning' ? 'HEM CHIP THINNING DASHBOARD' : 'OPTIMAL MACHINING PARAMETERS'}
                  </span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: activeTab === 'chip_thinning' ? '#c084fc' : 'var(--accent-cyan)', marginTop: '4px' }}>
                    {MATERIALS[selectedMat].name}
                  </h3>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>ESTIMATED CUT TIME</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                    {cutMinutes}m {cutSeconds}s
                  </span>
                </div>
              </div>

              {/* Primary Gauge Cards (4-Grid: RPM, Feed, Power, Torque) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                
                {/* Spindle RPM */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '18px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px -5px rgba(0, 240, 255, 0.1)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                    SPINDLE SPEED (RPM)
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 700, color: '#00f0ff', textShadow: '0 0 15px rgba(0, 240, 255, 0.4)' }}>
                    {Math.round(rpm).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    Rev / Minute
                  </span>
                </div>

                {/* Table Feed Rate (Programmed vs Revised) */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '18px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: activeTab === 'chip_thinning' && isChipThinningActive ? '1px solid rgba(168, 85, 247, 0.5)' : '1px solid rgba(0, 255, 128, 0.3)',
                  textAlign: 'center',
                  boxShadow: activeTab === 'chip_thinning' && isChipThinningActive ? '0 10px 25px -5px rgba(168, 85, 247, 0.2)' : '0 10px 25px -5px rgba(0, 255, 128, 0.1)',
                  position: 'relative'
                }}>
                  {activeTab === 'chip_thinning' && isChipThinningActive && (
                    <span style={{ position: 'absolute', top: '6px', right: '6px', background: '#a855f7', color: '#fff', fontSize: '0.6rem', padding: '2px 5px', borderRadius: '4px', fontWeight: 800 }}>
                      +{Math.round((chipThinningMultiplier - 1) * 100)}% HEM
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                    {activeTab === 'chip_thinning' && isChipThinningActive ? 'REVISED FEED' : 'TABLE FEED RATE'}
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 700, color: activeTab === 'chip_thinning' && isChipThinningActive ? '#c084fc' : '#00ff80', textShadow: activeTab === 'chip_thinning' && isChipThinningActive ? '0 0 15px rgba(168, 85, 247, 0.4)' : '0 0 15px rgba(0, 255, 128, 0.4)' }}>
                    {(activeTab === 'chip_thinning' ? revisedFeedRate : ipmOrMmMin).toFixed(unit === 'imperial' ? 1 : 0)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    {unit === 'imperial' ? 'Inches/min (IPM)' : 'mm/min'}
                  </span>
                </div>

                {/* Spindle Power Requirement */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '18px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                    SPINDLE POWER (EST.)
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 700, color: '#f59e0b', textShadow: '0 0 15px rgba(245, 158, 11, 0.3)' }}>
                    {unit === 'imperial' ? horsepower.toFixed(1) : kilowatts.toFixed(1)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    {unit === 'imperial' ? `Horsepower (HP) [${kilowatts.toFixed(1)} kW]` : `Kilowatts (kW) [${horsepower.toFixed(1)} HP]`}
                  </span>
                </div>

                {/* Spindle Torque */}
                <div style={{
                  background: 'var(--bg-primary)',
                  padding: '18px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  textAlign: 'center',
                  boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.1)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: 700 }}>
                    SPINDLE TORQUE
                  </span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.1rem', fontWeight: 700, color: '#ec4899', textShadow: '0 0 15px rgba(236, 72, 153, 0.3)' }}>
                    {unit === 'imperial' ? torqueInLb.toFixed(1) : torqueNm.toFixed(1)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                    {unit === 'imperial' ? 'in-lbf (Inch-Pounds)' : 'N·m (Newton-Meters)'}
                  </span>
                </div>

              </div>

              {/* Chip Thinning Highlight Panel (When Active) */}
              {activeTab === 'chip_thinning' && (
                <div style={{
                  background: isChipThinningActive ? 'rgba(168, 85, 247, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                  border: isChipThinningActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: isChipThinningActive ? '#e9d5ff' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🌀 Radial Chip Thinning Analysis</span>
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isChipThinningActive ? '#4ade80' : '#94a3b8' }}>
                      {isChipThinningActive ? 'Thinning Compensation Required' : 'Standard Full Immersion Cutting'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Target Chip Load</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '1.05rem' }}>
                        {tCpt.toFixed(unit === 'imperial' ? 4 : 3)} {unit === 'imperial' ? 'in' : 'mm'}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px', border: isChipThinningActive ? '1px solid rgba(168, 85, 247, 0.5)' : 'none' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Programmed CPT (Fz)</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isChipThinningActive ? '#c084fc' : '#fff', fontSize: '1.05rem' }}>
                        {revisedCpt.toFixed(unit === 'imperial' ? 4 : 3)} {unit === 'imperial' ? 'in' : 'mm'}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Feed Rate Boost</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: isChipThinningActive ? '#4ade80' : 'var(--text-secondary)', fontSize: '1.05rem' }}>
                        {chipThinningMultiplier.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Secondary Details Table */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', padding: '20px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700, letterSpacing: '0.5px' }}>
                  Efficiency & Machining Metrics
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Material Removal Rate (MRR):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {(activeTab === 'chip_thinning' ? (woc * doc * revisedFeedRate) / (unit === 'imperial' ? 1 : 1000) : mrr).toFixed(3)} {unit === 'imperial' ? 'in³/min' : 'cm³/min'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Radial Immersion Angle (θ):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                      {contactAngleDeg.toFixed(1)}° ({radialStepoverPercent.toFixed(1)}% stepover)
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Surface Velocity (Vc / SFM):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {speedVal} {unit === 'imperial' ? 'SFM' : 'M/Min'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Predicted Finish Roughness (Ra):</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f59e0b' }}>
                      {Math.round(raMicroInches)} µin / {raMicrons.toFixed(2)} µm ({finishQuality})
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total Volume Removed:</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {(woc * doc * length).toFixed(3)} {unit === 'imperial' ? 'in³' : 'cm³'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div style={{
                background: activeTab === 'chip_thinning' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderLeft: activeTab === 'chip_thinning' ? '4px solid #a855f7' : '4px solid #3b82f6',
                padding: '12px 16px',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                fontSize: '0.85rem',
                color: activeTab === 'chip_thinning' ? '#e9d5ff' : '#93c5fd',
                lineHeight: 1.5,
                marginTop: '5px'
              }}>
                {activeTab === 'chip_thinning' ? (
                  <><strong>💡 HEM Pro-Tip:</strong> In Trochoidal or Dynamic milling with small radial stepovers (under 30%), increasing feed per tooth is essential to prevent chip rubbing, heat buildup, and work hardening.</>
                ) : (
                  <><strong>💡 Tooling Pro-Tip:</strong> When full-slotting (100% radial immersion), reduce recommended table feed rate by 20% to prevent flute packing and excessive tool deflection.</>
                )}
              </div>

            </div>

            {/* LIVE KINEMATIC CUTTER ENGAGEMENT VISUALIZER (TOP-LEFT PRIORITY) */}
            <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)', border: '1px solid rgba(0, 240, 255, 0.2)', order: -1 }}>
              
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                    TOP-DOWN CUTTER TELEMETRY
                  </span>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                    Live Radial Engagement Simulation
                  </h4>
                </div>

                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  style={{
                    background: isAnimating ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                    color: isAnimating ? '#f87171' : '#4ade80',
                    border: `1px solid ${isAnimating ? 'rgba(239, 68, 68, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{isAnimating ? '⏸ Pause Spindle' : '▶ Spin Spindle'}</span>
                </button>
              </div>

              {/* SVG Canvas */}
              <div style={{ position: 'relative', width: `${svgSize}px`, height: `${svgSize}px`, background: '#090d16', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }}>
                
                {/* Background Grid */}
                <svg width={svgSize} height={svgSize} style={{ position: 'absolute', top: 0, left: 0 }}>
                  <defs>
                    <pattern id="cutterGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
                    </pattern>
                    <radialGradient id="cutterGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(0, 240, 255, 0.2)" />
                      <stop offset="100%" stopColor="rgba(0, 240, 255, 0)" />
                    </radialGradient>
                    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#334155" />
                      <stop offset="100%" stopColor="#475569" />
                    </linearGradient>
                  </defs>
                  
                  <rect width={svgSize} height={svgSize} fill="url(#cutterGrid)" />

                  {/* WORKPIECE BLOCK */}
                  <rect
                    x={blockLeftX}
                    y={blockTopY}
                    width={svgSize - blockLeftX}
                    height={blockHeight}
                    fill="url(#metalGrad)"
                    stroke="#64748b"
                    strokeWidth="2"
                  />
                  
                  {/* Machined channel (cutout where tool passed) */}
                  <path
                    d={`M ${blockLeftX} ${blockTopY} L ${blockRightX} ${blockTopY} L ${blockRightX} ${center} A ${maxRadiusPx} ${maxRadiusPx} 0 0 0 ${blockLeftX} ${center - Math.sin(contactAngleRad) * maxRadiusPx} Z`}
                    fill="#090d16"
                    opacity="0.85"
                  />

                  {/* Engagement Arc Highlight (The actual chip formation zone!) */}
                  <path
                    d={`M ${center} ${center} L ${blockRightX} ${center} A ${maxRadiusPx} ${maxRadiusPx} 0 0 0 ${blockLeftX} ${center - Math.sin(contactAngleRad) * maxRadiusPx} Z`}
                    fill="rgba(249, 115, 22, 0.25)"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />

                  {/* Cutter Glow & Outer Diameter Circle */}
                  <circle cx={center} cy={center} r={maxRadiusPx + 10} fill="url(#cutterGlow)" />
                  <circle cx={center} cy={center} r={maxRadiusPx} fill="rgba(15, 23, 42, 0.8)" stroke="#00f0ff" strokeWidth="2.5" />
                  <circle cx={center} cy={center} r={maxRadiusPx * 0.4} fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
                  <circle cx={center} cy={center} r={5} fill="#00f0ff" />

                  {/* Rotating Flutes */}
                  <g transform={`rotate(${rotation}, ${center}, ${center})`}>
                    {Array.from({ length: flutes }).map((_, i) => {
                      const angleDeg = (360 / flutes) * i;
                      const angleRad = (angleDeg * Math.PI) / 180;
                      const x2 = center + Math.cos(angleRad) * maxRadiusPx;
                      const y2 = center + Math.sin(angleRad) * maxRadiusPx;
                      const xInner = center + Math.cos(angleRad) * (maxRadiusPx * 0.4);
                      const yInner = center + Math.sin(angleRad) * (maxRadiusPx * 0.4);

                      // Flute cutting tip arc
                      const tipRad = ((angleDeg + 15) * Math.PI) / 180;
                      const xTip = center + Math.cos(tipRad) * (maxRadiusPx * 0.85);
                      const yTip = center + Math.sin(tipRad) * (maxRadiusPx * 0.85);

                      return (
                        <g key={i}>
                          <path
                            d={`M ${xInner} ${yInner} L ${x2} ${y2} Q ${xTip} ${yTip} ${xInner} ${yInner}`}
                            fill="rgba(0, 240, 255, 0.3)"
                            stroke="#00f0ff"
                            strokeWidth="1.5"
                          />
                          <circle cx={x2} cy={y2} r="3" fill="#fff" />
                        </g>
                      );
                    })}
                  </g>

                  {/* Dimension Lines / Telemetry Overlays on Canvas */}
                  {/* WOC Arrow */}
                  <line x1={blockLeftX} y1={blockTopY - 12} x2={blockRightX} y2={blockTopY - 12} stroke="#38bdf8" strokeWidth="1.5" markerEnd="url(#arrow)" />
                  <text x={(blockLeftX + blockRightX) / 2} y={blockTopY - 18} fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
                    Ae: {widthOfCut} {unit === 'imperial' ? 'in' : 'mm'}
                  </text>
                </svg>

                {/* Telemetry Badges overlaid on corners */}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  <span>Spindle: </span><strong style={{ color: '#00f0ff' }}>{Math.round(rpm)} RPM</strong>
                </div>

                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', color: '#cbd5e1', fontFamily: 'var(--font-mono)' }}>
                  <span>Immersion: </span><strong style={{ color: isChipThinningActive ? '#c084fc' : '#4ade80' }}>{radialStepoverPercent.toFixed(0)}% ({contactAngleDeg.toFixed(0)}°)</strong>
                </div>

              </div>

              {/* Visualizer Legend */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '15px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00f0ff', display: 'inline-block' }}></span>
                  <span>Cutter Flutes ({flutes})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#475569', display: 'inline-block' }}></span>
                  <span>Workpiece Stock</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(249, 115, 22, 0.6)', display: 'inline-block' }}></span>
                  <span>Chip Formation Arc</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      ) : (
        /* FORMULAS REFERENCE TAB (Inspired by Garr Tool's Formulas Page) */
        <div className="glass-panel" style={{ padding: '40px', background: 'var(--bg-primary)' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '10px', borderBottom: '2px solid rgba(0, 240, 255, 0.3)', paddingBottom: '12px' }}>
              📐 Essential Machining & Metrology Formulas
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '1.05rem', lineHeight: 1.6 }}>
              Quick reference equations used by precision CNC milling, turning, and toolroom machinists worldwide.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px' }}>
              
              {/* Box 1: RPM & Cutting Speed */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#00f0ff', marginBottom: '12px', fontWeight: 700 }}>
                  ⚡ Spindle Speed & Surface Velocity
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#fff', marginBottom: '12px', lineHeight: 1.8 }}>
                  <div><strong>Imperial (RPM):</strong> (SFM × 3.82) ÷ Diameter</div>
                  <div><strong>Metric (RPM):</strong> (Vc × 1000) ÷ (π × Diameter)</div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '6px', paddingTop: '6px' }}><strong>SFM:</strong> 0.262 × Diameter × RPM</div>
                  <div><strong>Vc (M/Min):</strong> (π × Diameter × RPM) ÷ 1000</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Where Diameter is cutter diameter (milling) or workpiece diameter (turning).
                </p>
              </div>

              {/* Box 2: Table Feed & Chip Load */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#00ff80', marginBottom: '12px', fontWeight: 700 }}>
                  🟢 Table Feed Rate & Chip Load (IPT / Fz)
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#fff', marginBottom: '12px', lineHeight: 1.8 }}>
                  <div><strong>Feed (IPM / mm/min):</strong> RPM × Flutes × Feed per Tooth</div>
                  <div><strong>Chip Load (IPT / Fz):</strong> Feed Rate ÷ (RPM × Flutes)</div>
                  <div><strong>Rev Feed (IPR / mm/rev):</strong> Feed per Tooth × Flutes</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Maintain recommended chip load to prevent work hardening and flute packing.
                </p>
              </div>

              {/* Box 3: Radial Chip Thinning (HEM) */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#c084fc', marginBottom: '12px', fontWeight: 700 }}>
                  🌀 Trochoidal Chip Thinning Compensation
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '0.85rem', color: '#fff', marginBottom: '12px', lineHeight: 1.8 }}>
                  <div><strong>Required when:</strong> Radial Stepover (Ae) &lt; 50% Dia</div>
                  <div><strong>Engagement Multiplier:</strong></div>
                  <div style={{ color: '#e9d5ff', paddingLeft: '10px' }}>[0.5 × (Dia ÷ Ae)] ÷ √[(Dia ÷ Ae) - 1]</div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '6px', paddingTop: '6px' }}><strong>Revised Programmed IPT:</strong> Target IPT × Multiplier</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Compensates for reduced average chip thickness in high-speed dynamic milling passes.
                </p>
              </div>

              {/* Box 4: MRR & Cutting Time */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#38bdf8', marginBottom: '12px', fontWeight: 700 }}>
                  ⏱️ Metal Removal Rate (MRR) & Machining Time
                </h3>
                <div style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#fff', marginBottom: '12px', lineHeight: 1.8 }}>
                  <div><strong>Milling MRR (in³/min):</strong> WOC × DOC × IPM</div>
                  <div><strong>Metric MRR (cm³/min):</strong> (WOC × DOC × mm/min) ÷ 1000</div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '6px', paddingTop: '6px' }}><strong>Milling Time (Minutes):</strong> Cut Length ÷ Table Feed Rate</div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Used for estimating spindle power requirements and job quoting.
                </p>
              </div>

              {/* Box 5: Spindle Power, Torque & Surface Roughness */}
              <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(245, 158, 11, 0.4)', gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1.15rem', color: '#f59e0b', marginBottom: '12px', fontWeight: 700 }}>
                  ⚡ Spindle Horsepower, Torque & Surface Finish (Ra) Prediction
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', fontFamily: 'var(--font-mono)', background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '6px', fontSize: '0.9rem', color: '#fff', marginBottom: '12px', lineHeight: 1.8 }}>
                  <div>
                    <div style={{ color: '#00f0ff', fontWeight: 700, marginBottom: '4px' }}>Spindle Power (HP & kW):</div>
                    <div><strong>HP:</strong> (MRR [in³/min] × K-Factor) ÷ Efficiency (0.80)</div>
                    <div><strong>kW:</strong> HP × 0.7457</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>*K-Factor is unit power constant (e.g. 0.25 for Al, 0.70 for Steel, 1.10 for Ti).</div>
                  </div>

                  <div>
                    <div style={{ color: '#ec4899', fontWeight: 700, marginBottom: '4px' }}>Spindle Torque:</div>
                    <div><strong>Torque (in-lbf):</strong> (HP × 63,025) ÷ RPM</div>
                    <div><strong>Torque (N·m):</strong> (kW × 9,549) ÷ RPM</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>*Critical for low-RPM roughing and large diameter drill/tap torque limits.</div>
                  </div>

                  <div>
                    <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: '4px' }}>Surface Roughness (Ra):</div>
                    <div><strong>Ra (µin):</strong> (fz² ÷ (32 × Radius)) × 1,000,000</div>
                    <div><strong>Ra (µm):</strong> (fz² ÷ (32 × Radius)) × 1,000</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>*Where fz is feed per tooth and Radius is tool corner/nose radius.</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Inspired by industrial tooling references (Kennametal & Garr Tool) to ensure safe machine spindle loads and precision finish tolerances.
                </p>
              </div>

            </div>

            <div style={{ textAlign: 'center', marginTop: '35px' }}>
              <button
                onClick={() => setActiveTab('speeds_feeds')}
                style={{
                  padding: '12px 28px',
                  background: 'var(--accent-cyan)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Return to Interactive Calculator
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
