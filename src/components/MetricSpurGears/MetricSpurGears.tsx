import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

// Hardinge Pre-Cut Gear Part Number Rule Generator
// Encapsulates the exact table rules for B-Type and A-Type part numbers across modules 1 to 6
function getHardingePart(mod: number, N: number): { bType: string; aType: string } {
  if (N > 127) {
    return { bType: '--', aType: '--' };
  }

  let bType = `--`;
  let aType = `--`;

  if (mod === 1) {
    if (N <= 59) bType = `M1B${N}`;
    else if (N === 60) { bType = `M1B60`; aType = `M1A60`; }
    else if (N <= 69) bType = `M1B${N}`;
    else if (N === 70) { bType = `M1B70`; aType = `M1A70`; }
    else if (N === 71) bType = `M1B71`;
    else if (N === 72) { bType = `M1B72`; aType = `M1A72`; }
    else if (N === 75 || N === 76 || N === 80 || N === 90 || N === 100) { bType = `M1B${N}`; aType = `M1A${N}`; }
    else if (N === 85 || N === 95 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M1A${N}`; }
  } else if (mod === 1.5) {
    if (N <= 70) bType = `M1.5B${N}`;
    else if (N === 72) { bType = `M1.5B72`; aType = `M1.5A72`; }
    else if (N === 75 || N === 76 || N === 80 || N === 85 || N === 90 || N === 95 || N === 100 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M1.5A${N}`; }
  } else if (mod === 2) {
    if (N <= 70) bType = `M2B${N}`;
    else if (N === 72) { bType = `M2B72`; aType = `M2A72`; }
    else if (N === 75 || N === 76 || N === 80 || N === 85 || N === 90 || N === 95 || N === 100 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M2A${N}`; }
  } else if (mod === 2.5) {
    if (N <= 64) bType = `M2.5B${N}`;
    else if (N === 65 || N === 70) { bType = `M2.5B${N}`; aType = `M2.5A${N}`; }
    else if (N === 67) bType = `M2.5B67`;
    else if (N === 72 || N === 75 || N === 76 || N === 80 || N === 85 || N === 90 || N === 95 || N === 100 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M2.5A${N}`; }
  } else if (mod === 3) {
    if (N <= 47) bType = `M3B${N}`;
    else if (N === 48 || N === 50 || N === 55 || N === 57 || N === 60 || N === 65) { bType = `M3B${N}`; aType = `M3A${N}`; }
    else if (N === 49 || N === 51 || N === 54 || N === 56 || N === 62) bType = `M3B${N}`;
    else if (N === 52 || N === 70 || N === 72 || N === 75 || N === 76 || N === 80 || N === 85 || N === 90 || N === 95 || N === 100 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M3A${N}`; }
  } else if (mod === 4) {
    if (N <= 37) bType = `M4B${N}`;
    else if (N === 38 || N === 40 || N === 45 || N === 48 || N === 50 || N === 60 || N === 65) { bType = `M4B${N}`; aType = `M4A${N}`; }
    else if (N === 39) bType = `M4B39`;
    else if (N === 52 || N === 55 || N === 57 || N === 70 || N === 75 || N === 76 || N === 80 || N === 85 || N === 90 || N === 95 || N === 100 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M4A${N}`; }
  } else if (mod === 5) {
    if (N <= 31) bType = `M5B${N}`;
    else if (N === 32 || N === 38 || N === 40 || N === 55 || N === 60) { bType = `M5B${N}`; aType = `M5A${N}`; }
    else if (N === 33 || N === 34 || N === 36 || N === 37 || N === 42) bType = `M5B${N}`;
    else if (N === 35 || N === 45 || N === 48 || N === 50 || N === 52 || N === 57 || N === 65 || N === 70 || N === 75 || N === 76 || N === 80 || N === 85 || N === 90 || N === 95 || N === 100 || N === 110 || N === 114 || N === 120 || N === 127) { aType = `M5A${N}`; }
  } else if (mod === 6) {
    if (N <= 25) bType = `M6B${N}`;
    else if (N === 26 || N === 28 || N === 30 || N === 32 || N === 35 || N === 40) { bType = `M6B${N}`; aType = `M6A${N}`; }
    else if (N === 45 || N === 50 || N === 60 || N === 72 || N === 80 || N === 90 || N === 100 || N === 120) { aType = `M6A${N}`; }
  }

  return { bType, aType };
}

// Generate the complete catalog dataset from 12 to 360 teeth across standard Hardinge modules
const CATALOG_MODULES = [1, 1.5, 2, 2.5, 3, 4, 5, 6];
const STANDARD_TEETH = Array.from({ length: 360 - 12 + 1 }, (_, i) => i + 12);

export interface CatalogGearRow {
  mod: number;
  teeth: number;
  bType: string;
  aType: string;
  pcdMm: number;
  odMm: number;
}

// Standard diametral pitches for imperial gearing
const STANDARD_DPS = [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];

export const MetricSpurGears: React.FC = () => {
  const { unit } = useUnit();
  const [activeTab, setActiveTab] = useState<'calculator' | 'catalog'>('calculator');

  // Calculator inputs — metric gears are sized by MODULE, imperial gears by DIAMETRAL PITCH
  const [gearSystem, setGearSystem] = useState<'module' | 'dp'>(unit === 'imperial' ? 'dp' : 'module');
  const [modInput, setModInput] = useState<string>('2');
  const [dpInput, setDpInput] = useState<string>('24');
  const [teethInput, setTeethInput] = useState<string>('24');
  const [enableMating, setEnableMating] = useState<boolean>(true);
  const [matingTeethInput, setMatingTeethInput] = useState<string>('36');
  const [copied, setCopied] = useState<string | null>(null);

  // Catalog filter inputs
  const [selectedCatalogMod, setSelectedCatalogMod] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  // Parse numeric values
  const modVal = parseFloat(modInput) || 2;
  const dpVal = parseFloat(dpInput) || 24;
  const teethVal = Math.max(8, parseInt(teethInput) || 24);
  const matingTeethVal = Math.max(8, parseInt(matingTeethInput) || 36);

  const isDP = gearSystem === 'dp';
  // Module and DP are reciprocal tooth-size measures: DP = 25.4 / MOD.
  // In DP mode all geometry derives from the equivalent module 25.4/DP (i.e. PD = N/DP in inches).
  const effModMm = isDP ? 25.4 / dpVal : modVal;
  const equivDp = 25.4 / effModMm;

  // Metrology Calculations (internal mm)
  const pcdMm = teethVal * effModMm;
  const odMm = (teethVal + 2) * effModMm;
  const addendumMm = effModMm;
  // Whole depth: metric DIN — 2.25·MOD (2.4·MOD fine); imperial AGMA 20° — 2.25/DP coarse, 2.2/DP + 0.002" fine (DP ≥ 20)
  const wholeDepthMm = isDP
    ? (dpVal >= 20 ? (2.2 / dpVal + 0.002) * 25.4 : (2.25 / dpVal) * 25.4)
    : (modVal < 1.25 ? 2.4 * modVal : 2.25 * modVal);
  const dedendumMm = wholeDepthMm - addendumMm;
  const rootDiaMm = odMm - 2 * wholeDepthMm;
  const circularPitchMm = Math.PI * effModMm;
  const circularThicknessMm = circularPitchMm / 2;

  // Mating Gear Calculations
  const matingPcdMm = matingTeethVal * effModMm;
  const matingOdMm = (matingTeethVal + 2) * effModMm;
  const centerDistanceMm = (pcdMm + matingPcdMm) / 2;

  // Convert to display unit — DP mode defaults to inches (imperial-native), module mode follows the global unit
  const isImp = isDP || unit === 'imperial';
  const toUnit = (valMm: number) => isImp ? (valMm / 25.4).toFixed(4) : valMm.toFixed(3);
  const unitStr = isImp ? 'in' : 'mm';
  const sizeLabel = isDP ? `DP ${dpVal}` : `MOD ${modVal}`;

  // Generate Catalog Data
  const catalogData = useMemo(() => {
    const rows: CatalogGearRow[] = [];
    for (const m of CATALOG_MODULES) {
      if (selectedCatalogMod !== 'all' && selectedCatalogMod !== m) continue;
      for (const N of STANDARD_TEETH) {
        const pcd = N * m;
        const od = (N + 2) * m;
        const { bType, aType } = getHardingePart(m, N);
        
        // Apply search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matchTeeth = N.toString().includes(q);
          const matchB = bType.toLowerCase().includes(q);
          const matchA = aType.toLowerCase().includes(q);
          const matchMod = m.toString().includes(q);
          if (!matchTeeth && !matchB && !matchA && !matchMod) continue;
        }

        rows.push({ mod: m, teeth: N, bType, aType, pcdMm: pcd, odMm: od });
      }
    }
    return rows;
  }, [selectedCatalogMod, searchQuery]);

  // Handle row click to load into calculator
  const loadGearIntoCalculator = (m: number, t: number) => {
    setModInput(m.toString());
    setTeethInput(t.toString());
    setActiveTab('calculator');
  };

  return (
    <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '10px 0' }}>
      
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          ⚙️ Spur Gears <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Metric Module & Imperial Diametral Pitch</span>
        </h2>
      </div>

      {/* Main Grid: Visualizer Top-Left (order: -1), Settings/Results Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', alignItems: 'start' }}>
        
        {/* TOP-LEFT PRIORITY: Interactive Vector Mesh Visualizer */}
        <div className="glass-panel" style={{ padding: '25px', order: -1, borderTop: '3px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                2D Gear Mesh & Geometry Visualizer
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                {sizeLabel} // {teethVal}T Pinion {enableMating ? `↔ ${matingTeethVal}T Gear` : ''}
              </span>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              UNITS: {unit.toUpperCase()}
            </div>
          </div>

          {/* SVG Canvas */}
          <div style={{ 
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.8) 0%, rgba(5, 8, 15, 0.95) 100%)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)', 
            padding: '20px', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '340px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <svg viewBox="-150 -150 300 300" style={{ width: '100%', height: '320px', overflow: 'visible' }}>
              <defs>
                <radialGradient id="gearGrad1" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#f4902c" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#0080ff" stopOpacity="0.05" />
                </radialGradient>
                <radialGradient id="gearGrad2" cx="30%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.05" />
                </radialGradient>
              </defs>

              {/* Grid axes */}
              <line x1="-140" y1="0" x2="140" y2="0" stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="-140" x2="0" y2="140" stroke="var(--border-color)" strokeDasharray="4 4" strokeWidth="1" />

              {/* Pinion Gear (Left / Center) */}
              <g transform={enableMating ? "translate(-55, 0)" : "translate(0, 0)"}>
                {/* Blank OD Circle */}
                <circle cx="0" cy="0" r={enableMating ? "52" : "85"} fill="url(#gearGrad1)" stroke="var(--accent-cyan)" strokeWidth="2" />
                {/* Pitch Circle Diameter (PCD) */}
                <circle cx="0" cy="0" r={enableMating ? "46" : "75"} fill="none" stroke="#fff" strokeDasharray="5 3" strokeWidth="1.5" strokeOpacity="0.7" />
                {/* Root Circle */}
                <circle cx="0" cy="0" r={enableMating ? "38" : "62"} fill="none" stroke="var(--accent-cyan)" strokeDasharray="2 2" strokeWidth="1" strokeOpacity="0.4" />
                {/* Bore Hub */}
                <circle cx="0" cy="0" r={enableMating ? "12" : "20"} fill="#0a0d14" stroke="var(--accent-cyan)" strokeWidth="2" />
                <circle cx="0" cy="0" r={enableMating ? "4" : "6"} fill="var(--accent-cyan)" />

                {/* Stylized Teeth Representation */}
                {Array.from({ length: Math.min(36, teethVal) }).map((_, i) => {
                  const angleDeg = (i * 360) / Math.min(36, teethVal);
                  const rOut = enableMating ? 52 : 85;
                  const rIn = enableMating ? 40 : 65;
                  return (
                    <line 
                      key={i} 
                      x1="0" 
                      y1="0" 
                      x2={rOut * Math.cos((angleDeg * Math.PI) / 180)} 
                      y2={rOut * Math.sin((angleDeg * Math.PI) / 180)} 
                      stroke="var(--accent-cyan)" 
                      strokeWidth={enableMating ? "3" : "4"} 
                      strokeLinecap="round"
                      strokeDasharray={`${rOut - rIn} ${rIn}`}
                      strokeDashoffset={-rIn}
                    />
                  );
                })}

                <text x="0" y={enableMating ? "-60" : "-95"} fill="var(--accent-cyan)" fontSize="11" fontWeight="700" textAnchor="middle">
                  PINION: {teethVal}T (OD: {toUnit(odMm)} {unitStr})
                </text>
              </g>

              {/* Mating Gear (Right, if enabled) */}
              {enableMating && (
                <g transform="translate(55, 0)">
                  {/* Blank OD Circle */}
                  <circle cx="0" cy="0" r="58" fill="url(#gearGrad2)" stroke="#f59e0b" strokeWidth="2" />
                  {/* Pitch Circle Diameter (PCD) */}
                  <circle cx="0" cy="0" r="50" fill="none" stroke="#fff" strokeDasharray="5 3" strokeWidth="1.5" strokeOpacity="0.7" />
                  {/* Bore Hub */}
                  <circle cx="0" cy="0" r="14" fill="#0a0d14" stroke="#f59e0b" strokeWidth="2" />
                  <circle cx="0" cy="0" r="5" fill="#f59e0b" />

                  {/* Stylized Teeth */}
                  {Array.from({ length: Math.min(36, matingTeethVal) }).map((_, i) => {
                    const angleDeg = ((i + 0.5) * 360) / Math.min(36, matingTeethVal);
                    const rOut = 58;
                    const rIn = 45;
                    return (
                      <line 
                        key={i} 
                        x1="0" 
                        y1="0" 
                        x2={rOut * Math.cos((angleDeg * Math.PI) / 180)} 
                        y2={rOut * Math.sin((angleDeg * Math.PI) / 180)} 
                        stroke="#f59e0b" 
                        strokeWidth="3" 
                        strokeLinecap="round"
                        strokeDasharray={`${rOut - rIn} ${rIn}`}
                        strokeDashoffset={-rIn}
                      />
                    );
                  })}

                  <text x="0" y="75" fill="#f59e0b" fontSize="11" fontWeight="700" textAnchor="middle">
                    GEAR: {matingTeethVal}T (OD: {toUnit(matingOdMm)} {unitStr})
                  </text>
                </g>
              )}

              {/* Meshing Callout / Center Distance Line */}
              {enableMating && (
                <g>
                  <line x1="-55" y1="0" x2="55" y2="0" stroke="#10b981" strokeWidth="2" />
                  <rect x="-40" y="-12" width="80" height="22" rx="4" fill="#0a0d14" stroke="#10b981" strokeWidth="1" />
                  <text x="0" y="3" fill="#10b981" fontSize="10" fontWeight="700" textAnchor="middle">
                    C = {toUnit(centerDistanceMm)} {unitStr}
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* Key Formula Quick Specs Below Diagram */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '15px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Whole Depth (H)</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{toUnit(wholeDepthMm)} {unitStr}</span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Circular Pitch (CP)</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{toUnit(circularPitchMm)} {unitStr}</span>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>Tooth Width (CTT)</span>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{toUnit(circularThicknessMm)} {unitStr}</span>
            </div>
          </div>
        </div>

        {/* RIGHT/BOTTOM PANEL: Tabs and Calculations / Catalog Table */}
        <div className="glass-panel" style={{ padding: '25px' }}>
          
          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <button
              onClick={() => setActiveTab('calculator')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'calculator' ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                color: activeTab === 'calculator' ? '#000' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ⚙️ Gear Calculator & Machining
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                background: activeTab === 'catalog' ? 'var(--accent-cyan)' : 'var(--bg-tertiary)',
                color: activeTab === 'catalog' ? '#000' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📖 Hardinge Pre-Cut Catalog ({catalogData.length})
            </button>
          </div>

          {activeTab === 'calculator' ? (
            /* TAB 1: Calculator Inputs and Machining Outputs */
            <div>
              {/* Gear System Toggle: metric MODULE vs imperial DIAMETRAL PITCH */}
              <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px' }}>
                <button
                  onClick={() => setGearSystem('module')}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                    background: !isDP ? 'var(--accent-cyan)' : 'transparent',
                    color: !isDP ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  📏 Metric — Module (MOD)
                </button>
                <button
                  onClick={() => setGearSystem('dp')}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: '6px',
                    background: isDP ? '#f59e0b' : 'transparent',
                    color: isDP ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  🔧 Imperial — Diametral Pitch (DP)
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                {!isDP ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Module (MOD)
                    </label>
                    <select
                      value={modInput}
                      onChange={(e) => setModInput(e.target.value)}
                      className="input-precision"
                      style={{ width: '100%', padding: '10px', fontWeight: 700 }}
                    >
                      {[1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].map((m) => (
                        <option key={m} value={m.toString()}>MOD {m}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Diametral Pitch (DP)
                    </label>
                    <select
                      value={dpInput}
                      onChange={(e) => setDpInput(e.target.value)}
                      className="input-precision"
                      style={{ width: '100%', padding: '10px', fontWeight: 700 }}
                    >
                      {STANDARD_DPS.map((dp) => (
                        <option key={dp} value={dp.toString()}>{dp} DP</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Number of Teeth (N)
                  </label>
                  <input
                    type="number"
                    min="8"
                    max="360"
                    value={teethInput}
                    onChange={(e) => setTeethInput(e.target.value)}
                    className="input-precision"
                    style={{ width: '100%', padding: '10px', fontWeight: 700 }}
                  />
                </div>
              </div>

              {/* Mating gear toggle */}
              <div style={{ background: 'var(--bg-primary)', padding: '12px 15px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="matingCheck"
                    checked={enableMating}
                    onChange={(e) => setEnableMating(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                  />
                  <label htmlFor="matingCheck" style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                    Include Mating Gear Center Distance (C)
                  </label>
                </div>
                {enableMating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Teeth:</span>
                    <input
                      type="number"
                      min="8"
                      max="360"
                      value={matingTeethInput}
                      onChange={(e) => setMatingTeethInput(e.target.value)}
                      className="input-precision"
                      style={{ width: '70px', padding: '6px', textAlign: 'center', fontWeight: 700 }}
                    />
                  </div>
                )}
              </div>

              {/* Module ↔ DP Equivalence */}
              <div style={{ background: 'rgba(244, 144, 44, 0.06)', border: '1px solid rgba(244, 144, 44, 0.25)', padding: '10px 14px', borderRadius: '6px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>
                  {isDP ? 'Equivalent Module (25.4 / DP)' : 'Equivalent Diametral Pitch (25.4 / MOD)'}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                  {isDP ? `MOD ${(25.4 / dpVal).toFixed(3)} mm` : `${equivDp.toFixed(2)} DP`}
                </span>
              </div>

              {/* Results Table */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Machining Specifications {isDP ? '(20° AGMA, inches)' : '(DIN, metric)'}</span>
                <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem', textTransform: 'none' }}>Click value to copy</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { label: 'Outside Diameter (OD Blank)', form: isDP ? '(N + 2) / DP' : '(N + 2) × MOD', val: toUnit(odMm), copyVal: toUnit(odMm), highlight: true },
                  { label: isDP ? 'Pitch Diameter (PD)' : 'Pitch Circle Diameter (PCD)', form: isDP ? 'N / DP' : 'N × MOD', val: toUnit(pcdMm), copyVal: toUnit(pcdMm) },
                  { label: 'Root Circle Diameter', form: 'OD - 2H', val: toUnit(rootDiaMm), copyVal: toUnit(rootDiaMm) },
                  { label: 'Whole Depth (H)', form: isDP ? (dpVal >= 20 ? '2.2/DP + 0.002"' : '2.25 / DP') : (modVal < 1.25 ? '2.4 × MOD' : '2.25 × MOD'), val: toUnit(wholeDepthMm), copyVal: toUnit(wholeDepthMm), highlight: true },
                  { label: 'Addendum (A)', form: isDP ? '1 / DP' : 'MOD', val: toUnit(addendumMm), copyVal: toUnit(addendumMm) },
                  { label: 'Dedendum (D)', form: 'H - A', val: toUnit(dedendumMm), copyVal: toUnit(dedendumMm) },
                  { label: 'Circular Pitch (CP)', form: isDP ? 'π / DP' : 'π × MOD', val: toUnit(circularPitchMm), copyVal: toUnit(circularPitchMm) },
                  { label: 'Tooth Width (CTT)', form: 'CP / 2', val: toUnit(circularThicknessMm), copyVal: toUnit(circularThicknessMm) },
                  ...(enableMating ? [{ label: 'Center Distance (C)', form: isDP ? '(N + N₂) / (2·DP)' : '(PCD + PCD₂)/2', val: toUnit(centerDistanceMm), copyVal: toUnit(centerDistanceMm), highlight: true }] : [])
                ].map((row, idx) => (
                  <div
                    key={idx}
                    onClick={() => copyToClipboard(`${row.val} ${unitStr}`, row.label)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: row.highlight ? 'rgba(244, 144, 44, 0.08)' : 'var(--bg-primary)',
                      borderRadius: '6px',
                      border: row.highlight ? '1px solid rgba(244, 144, 44, 0.3)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 144, 44, 0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = row.highlight ? 'rgba(244, 144, 44, 0.08)' : 'var(--bg-primary)'}
                  >
                    <div>
                      <span style={{ fontSize: '0.88rem', fontWeight: row.highlight ? 700 : 600, color: 'var(--text-primary)' }}>{row.label}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', fontFamily: 'var(--font-mono)' }}>Formula: {row.form}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 800, color: row.highlight ? 'var(--accent-cyan)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {row.val} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{unitStr}</span>
                      </span>
                      {copied === row.label && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: '#10b981', fontWeight: 700 }}>✓ COPIED</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* TAB 2: Pre-Cut Catalog & Selector */
            <div>
              {/* Filter controls */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Filter by Module:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  <button
                    onClick={() => setSelectedCatalogMod('all')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '4px',
                      border: 'none',
                      background: selectedCatalogMod === 'all' ? '#f59e0b' : 'var(--bg-tertiary)',
                      color: selectedCatalogMod === 'all' ? '#000' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    ALL
                  </button>
                  {CATALOG_MODULES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setSelectedCatalogMod(m)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: selectedCatalogMod === m ? '#f59e0b' : 'var(--bg-tertiary)',
                        color: selectedCatalogMod === m ? '#000' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      MOD {m}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Search by Tooth Count (e.g. 24), Part # (e.g. M1B24)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-precision"
                  style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                />
              </div>

              {/* Scrollable Table */}
              <div style={{ maxHeight: '420px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead style={{ background: 'var(--bg-tertiary)', position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                      <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>Teeth</th>
                      <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>MOD</th>
                      <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>B-Type #</th>
                      <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>A-Type #</th>
                      <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>OD ({unitStr})</th>
                      <th style={{ padding: '10px', color: 'var(--text-secondary)' }}>PCD ({unitStr})</th>
                      <th style={{ padding: '10px', textAlign: 'right', color: 'var(--text-secondary)' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogData.slice(0, 150).map((row, idx) => (
                      <tr 
                        key={idx} 
                        style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'var(--bg-primary)' : 'transparent', transition: 'background 0.15s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'var(--bg-primary)' : 'transparent'}
                      >
                        <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{row.teeth}T</td>
                        <td style={{ padding: '10px', fontWeight: 600, color: '#f59e0b' }}>{row.mod}</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: row.bType !== '--' ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>{row.bType}</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)', color: row.aType !== '--' ? '#10b981' : 'var(--text-muted)' }}>{row.aType}</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{toUnit(row.odMm)}</td>
                        <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{toUnit(row.pcdMm)}</td>
                        <td style={{ padding: '10px', textAlign: 'right' }}>
                          <button
                            onClick={() => loadGearIntoCalculator(row.mod, row.teeth)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              fontWeight: 600
                            }}
                          >
                            Load ➔
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {catalogData.length > 150 && (
                <div style={{ textAlign: 'center', padding: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showing first 150 of {catalogData.length} matching gears. Use search or filter to narrow down results.
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Footer: tool description (kept out of the header per site convention) */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          Hardinge & DIN 13 T1 Metrology // AGMA 20° Diametral Pitch
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.6 }}>
          Calculate exact tooth profiles, blank outside diameters, and center distances in <strong style={{ color: 'var(--accent-cyan)' }}>metric module</strong> (tooth
          size grows with MOD) or <strong style={{ color: '#f59e0b' }}>imperial diametral pitch</strong> (teeth per inch of pitch diameter — tooth size shrinks as DP grows;
          DP = 25.4 / MOD), or browse 2,800+ Hardinge pre-cut gear part numbers (Modules 1 to 6).
        </p>
      </div>
    </div>
  );
};
