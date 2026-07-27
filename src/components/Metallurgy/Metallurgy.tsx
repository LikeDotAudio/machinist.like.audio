import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

export interface MetalThermalData {
  id: string;
  name: string;
  category: 'ferrous' | 'aluminum' | 'copper_brass' | 'specialty';
  densityLbIn3: number;
  densityGCm3: number;
  thermalExpansionF: number; // per °F (x 10^-6)
  forgingMinF: number;
  forgingMaxF: number;
  annealingMinF: number;
  annealingMaxF: number;
  solidusF: number;
  liquidusF: number;
  castingMinF: number;
  castingMaxF: number;
  notes: string;
}

export const METAL_DATABASE: MetalThermalData[] = [
  // Ferrous Metals
  { id: '1018_steel', name: '1018 Mild Steel', category: 'ferrous', densityLbIn3: 0.284, densityGCm3: 7.87, thermalExpansionF: 6.5, forgingMinF: 1600, forgingMaxF: 2200, annealingMinF: 1550, annealingMaxF: 1650, solidusF: 2640, liquidusF: 2780, castingMinF: 2900, castingMaxF: 3020, notes: 'Standard structural mild steel; excellent ductility and weldability.' },
  { id: '1045_steel', name: '1045 Medium Carbon Steel', category: 'ferrous', densityLbIn3: 0.284, densityGCm3: 7.85, thermalExpansionF: 6.3, forgingMinF: 1550, forgingMaxF: 2100, annealingMinF: 1450, annealingMaxF: 1600, solidusF: 2570, liquidusF: 2720, castingMinF: 2850, castingMaxF: 2970, notes: 'Machinery steel for axles and gears; heat-treatable.' },
  { id: '1095_steel', name: '1095 High Carbon Steel', category: 'ferrous', densityLbIn3: 0.283, densityGCm3: 7.83, thermalExpansionF: 6.1, forgingMinF: 1450, forgingMaxF: 1950, annealingMinF: 1400, annealingMaxF: 1500, solidusF: 2400, liquidusF: 2650, castingMinF: 2780, castingMaxF: 2900, notes: 'Tool & spring steel; narrow forging window; easily burned if overheated.' },
  { id: '4130_chromoly', name: '4130 Chromoly Steel', category: 'ferrous', densityLbIn3: 0.283, densityGCm3: 7.85, thermalExpansionF: 6.2, forgingMinF: 1600, forgingMaxF: 2150, annealingMinF: 1525, annealingMaxF: 1575, solidusF: 2600, liquidusF: 2750, castingMinF: 2880, castingMaxF: 3000, notes: 'Aircraft and roll cage alloy; deep hardening and high fatigue strength.' },
  { id: '304_stainless', name: '304 Stainless Steel', category: 'ferrous', densityLbIn3: 0.290, densityGCm3: 8.00, thermalExpansionF: 9.6, forgingMinF: 1700, forgingMaxF: 2250, annealingMinF: 1850, annealingMaxF: 2050, solidusF: 2550, liquidusF: 2650, castingMinF: 2800, castingMaxF: 2950, notes: 'Austenitic non-magnetic stainless; sluggish liquid fluidity requires high superheat.' },
  { id: '316_stainless', name: '316 Marine Stainless Steel', category: 'ferrous', densityLbIn3: 0.290, densityGCm3: 8.00, thermalExpansionF: 8.9, forgingMinF: 1700, forgingMaxF: 2250, annealingMinF: 1850, annealingMaxF: 2050, solidusF: 2500, liquidusF: 2550, castingMinF: 2750, castingMaxF: 2900, notes: 'Molybdenum alloyed for superior chloride corrosion resistance.' },
  { id: 'wrought_iron', name: 'Wrought Iron', category: 'ferrous', densityLbIn3: 0.281, densityGCm3: 7.78, thermalExpansionF: 6.7, forgingMinF: 1900, forgingMaxF: 2400, annealingMinF: 1300, annealingMaxF: 1400, solidusF: 2700, liquidusF: 2750, castingMinF: 2880, castingMaxF: 3000, notes: 'Contains fibrous iron silicate slag; must be forged very hot near white heat.' },
  { id: 'gray_cast_iron', name: 'Gray Cast Iron (Class 30)', category: 'ferrous', densityLbIn3: 0.260, densityGCm3: 7.20, thermalExpansionF: 6.0, forgingMinF: 0, forgingMaxF: 0, annealingMinF: 1300, annealingMaxF: 1400, solidusF: 2060, liquidusF: 2200, castingMinF: 2400, castingMaxF: 2600, notes: 'Brittle (do not forge); outstanding vibration damping and low casting shrinkage (~1%).' },

  // Aluminum Alloys
  { id: 'pure_al', name: 'Pure Aluminum (99.9%)', category: 'aluminum', densityLbIn3: 0.098, densityGCm3: 2.70, thermalExpansionF: 13.1, forgingMinF: 550, forgingMaxF: 950, annealingMinF: 650, annealingMaxF: 750, solidusF: 1220, liquidusF: 1220, castingMinF: 1320, castingMaxF: 1420, notes: 'Soft and ductile; forms high-melting oxide skin (3700°F); always skim dross.' },
  { id: '5052_al', name: '5052 Aluminum Sheet Alloy', category: 'aluminum', densityLbIn3: 0.097, densityGCm3: 2.68, thermalExpansionF: 13.2, forgingMinF: 500, forgingMaxF: 900, annealingMinF: 650, annealingMaxF: 775, solidusF: 1100, liquidusF: 1200, castingMinF: 1300, castingMaxF: 1420, notes: 'Marine grade alloy with Magnesium; supreme workability and fatigue strength.' },
  { id: '6061_al', name: '6061-T6 Structural Aluminum', category: 'aluminum', densityLbIn3: 0.098, densityGCm3: 2.70, thermalExpansionF: 13.0, forgingMinF: 500, forgingMaxF: 900, annealingMinF: 775, annealingMaxF: 800, solidusF: 1080, liquidusF: 1205, castingMinF: 1320, castingMaxF: 1450, notes: 'Versatile extruded/machined alloy; solution heat treated and artificially aged.' },
  { id: '7075_al', name: '7075 Aircraft Aluminum', category: 'aluminum', densityLbIn3: 0.102, densityGCm3: 2.81, thermalExpansionF: 13.1, forgingMinF: 700, forgingMaxF: 850, annealingMinF: 775, annealingMaxF: 800, solidusF: 890, liquidusF: 1175, castingMinF: 0, castingMaxF: 0, notes: 'Ultra-high strength Zinc alloy; NOT recommended for casting due to hot tearing.' },
  { id: 'a356_al', name: 'A356 Foundry Casting Aluminum', category: 'aluminum', densityLbIn3: 0.097, densityGCm3: 2.68, thermalExpansionF: 11.9, forgingMinF: 0, forgingMaxF: 0, annealingMinF: 1000, annealingMaxF: 1000, solidusF: 1035, liquidusF: 1135, castingMinF: 1250, castingMaxF: 1380, notes: 'Premier foundry casting alloy with 7% Silicon for incredible fluidity and pressure tightness.' },

  // Copper, Brass & Bronze
  { id: 'pure_cu', name: 'Pure Copper (C110 ETP)', category: 'copper_brass', densityLbIn3: 0.322, densityGCm3: 8.89, thermalExpansionF: 9.4, forgingMinF: 1400, forgingMaxF: 1650, annealingMinF: 700, annealingMaxF: 1200, solidusF: 1984, liquidusF: 1984, castingMinF: 2100, castingMaxF: 2250, notes: 'Highest thermal and electrical conductivity; requires deoxidation before pouring.' },
  { id: 'c360_brass', name: 'C360 Free-Cutting Brass', category: 'copper_brass', densityLbIn3: 0.308, densityGCm3: 8.50, thermalExpansionF: 11.4, forgingMinF: 1300, forgingMaxF: 1450, annealingMinF: 800, annealingMaxF: 1100, solidusF: 1630, liquidusF: 1650, castingMinF: 1800, castingMaxF: 1950, notes: 'Alloyed with 3% Lead for unmatched chip-breaking machinability; zinc boils at 1665°F.' },
  { id: 'c260_brass', name: 'C260 Cartridge Brass (70/30)', category: 'copper_brass', densityLbIn3: 0.308, densityGCm3: 8.53, thermalExpansionF: 11.1, forgingMinF: 1350, forgingMaxF: 1550, annealingMinF: 800, annealingMaxF: 1400, solidusF: 1680, liquidusF: 1750, castingMinF: 1880, castingMaxF: 2020, notes: 'Supreme cold-working ductility for deep drawing and stamping.' },
  { id: 'c655_bronze', name: 'C655 Silicon Bronze', category: 'copper_brass', densityLbIn3: 0.308, densityGCm3: 8.53, thermalExpansionF: 10.0, forgingMinF: 1300, forgingMaxF: 1600, annealingMinF: 900, annealingMaxF: 1300, solidusF: 1780, liquidusF: 1880, castingMinF: 1980, castingMaxF: 2150, notes: 'Architectural and marine bronze; superb casting fluidity and TIG weldability.' },
  { id: 'c954_bronze', name: 'C954 Aluminum Bronze', category: 'copper_brass', densityLbIn3: 0.269, densityGCm3: 7.45, thermalExpansionF: 9.0, forgingMinF: 1450, forgingMaxF: 1700, annealingMinF: 1150, annealingMaxF: 1250, solidusF: 1900, liquidusF: 1930, castingMinF: 2080, castingMaxF: 2220, notes: 'High-strength bearing bronze; resistant to shock and wear.' },

  // Specialty & Precious Metals
  { id: 'titanium_gr2', name: 'Titanium Grade 2', category: 'specialty', densityLbIn3: 0.163, densityGCm3: 4.51, thermalExpansionF: 4.8, forgingMinF: 1300, forgingMaxF: 1700, annealingMinF: 1100, annealingMaxF: 1350, solidusF: 3034, liquidusF: 3034, castingMinF: 3180, castingMaxF: 3350, notes: 'High strength-to-weight; highly reactive; MUST be melted in vacuum or argon.' },
  { id: 'zamak3', name: 'Zamak 3 Zinc Die-Cast', category: 'specialty', densityLbIn3: 0.240, densityGCm3: 6.60, thermalExpansionF: 15.2, forgingMinF: 400, forgingMaxF: 550, annealingMinF: 300, annealingMaxF: 400, solidusF: 728, liquidusF: 728, castingMinF: 780, castingMaxF: 850, notes: '96% Zinc / 4% Aluminum; industry standard die-casting and mold alloy.' },
  { id: 'pure_lead', name: 'Pure Lead (Pb)', category: 'specialty', densityLbIn3: 0.409, densityGCm3: 11.34, thermalExpansionF: 16.1, forgingMinF: 60, forgingMaxF: 200, annealingMinF: 60, annealingMaxF: 100, solidusF: 621, liquidusF: 621, castingMinF: 680, castingMaxF: 780, notes: 'High density for ballast weights and soft hammer jaws; toxic fumes—use exhaust!' }
];

export const Metallurgy: React.FC = () => {
  const { unit: globalUnit } = useUnit();
  const unit: 'in' | 'mm' = globalUnit === 'imperial' ? 'in' : 'mm';

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'thermal_explorer' | 'stock_weight' | 'shrink_fitting'>('thermal_explorer');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'ferrous' | 'aluminum' | 'copper_brass' | 'specialty'>('all');
  const [selectedMetalId, setSelectedMetalId] = useState<string>('1018_steel');

  // Stock Weight Calculator State
  const [stockShape, setStockShape] = useState<'round' | 'square' | 'hex' | 'tubing' | 'taper'>('round');
  const [dimLength, setDimLength] = useState<string>('12.0');
  const [dimOD, setDimOD] = useState<string>('2.0');
  const [dimID, setDimID] = useState<string>('1.5');
  const [dimWidth, setDimWidth] = useState<string>('2.0');
  const [dimThickness, setDimThickness] = useState<string>('0.5');
  const [dimWidth2, setDimWidth2] = useState<string>('0.5'); // taper tip width
  const [dimThickness2, setDimThickness2] = useState<string>('0.125'); // taper tip thickness

  // Shrink Fitting State
  const [shrinkLength, setShrinkLength] = useState<string>('10.0');
  const [shrinkStartTemp, setShrinkStartTemp] = useState<string>('70');
  const [shrinkTargetTemp, setShrinkTargetTemp] = useState<string>('500');

  // Filtered metal list
  const filteredMetals = useMemo(() => {
    if (selectedCategory === 'all') return METAL_DATABASE;
    return METAL_DATABASE.filter(m => m.category === selectedCategory);
  }, [selectedCategory]);

  const activeMetal = useMemo(() => {
    return METAL_DATABASE.find(m => m.id === selectedMetalId) || METAL_DATABASE[0];
  }, [selectedMetalId]);

  // Helper to convert °F to °C
  const toC = (f: number) => Math.round((f - 32) * 5 / 9);
  const formatTemp = (f: number) => {
    if (f === 0) return 'N/A';
    return unit === 'in' ? `${f.toLocaleString()}°F` : `${toC(f).toLocaleString()}°C`;
  };

  // Stock Volume & Weight Calculations
  const stockCalc = useMemo(() => {
    const L = parseFloat(dimLength) || 0;
    const OD = parseFloat(dimOD) || 0;
    const ID = parseFloat(dimID) || 0;
    const W = parseFloat(dimWidth) || 0;
    const T = parseFloat(dimThickness) || 0;
    const W2 = parseFloat(dimWidth2) || 0;
    const T2 = parseFloat(dimThickness2) || 0;

    let volumeIn3 = 0;
    if (unit === 'in') {
      if (stockShape === 'round') {
        volumeIn3 = Math.PI * Math.pow(OD / 2, 2) * L;
      } else if (stockShape === 'square') {
        volumeIn3 = W * T * L;
      } else if (stockShape === 'hex') {
        // Hex area Across Flats (AF = W): Area = (sqrt(3)/2) * W^2 = 0.866025 * W^2
        volumeIn3 = 0.866025 * Math.pow(W, 2) * L;
      } else if (stockShape === 'tubing') {
        const areaOut = Math.PI * Math.pow(OD / 2, 2);
        const areaIn = Math.PI * Math.pow(ID / 2, 2);
        volumeIn3 = Math.max(0, (areaOut - areaIn) * L);
      } else if (stockShape === 'taper') {
        const areaBase = W * T;
        const areaTip = W2 * T2;
        volumeIn3 = (L / 3) * (areaBase + areaTip + Math.sqrt(areaBase * areaTip));
      }
    } else {
      // Metric inputs in mm -> convert to cm^3
      let volMm3 = 0;
      if (stockShape === 'round') {
        volMm3 = Math.PI * Math.pow(OD / 2, 2) * L;
      } else if (stockShape === 'square') {
        volMm3 = W * T * L;
      } else if (stockShape === 'hex') {
        volMm3 = 0.866025 * Math.pow(W, 2) * L;
      } else if (stockShape === 'tubing') {
        volMm3 = Math.max(0, (Math.PI * Math.pow(OD / 2, 2) - Math.PI * Math.pow(ID / 2, 2)) * L);
      } else if (stockShape === 'taper') {
        const a1 = W * T;
        const a2 = W2 * T2;
        volMm3 = (L / 3) * (a1 + a2 + Math.sqrt(a1 * a2));
      }
      // 1 cm^3 = 1000 mm^3; 1 in^3 = 16.387 cm^3
      const volCm3 = volMm3 / 1000;
      volumeIn3 = volCm3 / 16.387064;
    }

    const weightLb = volumeIn3 * activeMetal.densityLbIn3;
    const weightKg = weightLb * 0.45359237;
    const volDisplay = unit === 'in' ? volumeIn3 : volumeIn3 * 16.387064; // cm3 for metric
    const volUnit = unit === 'in' ? 'in³' : 'cm³';
    const weightDisplay = unit === 'in' ? weightLb : weightKg;
    const weightUnit = unit === 'in' ? 'lbs' : 'kg';

    return { volume: volDisplay, volUnit, weight: weightDisplay, weightUnit };
  }, [stockShape, dimLength, dimOD, dimID, dimWidth, dimThickness, dimWidth2, dimThickness2, activeMetal, unit]);

  // Shrink Fitting Calculations
  const shrinkCalc = useMemo(() => {
    const L0 = parseFloat(shrinkLength) || 0;
    const T_start = parseFloat(shrinkStartTemp) || 0;
    const T_target = parseFloat(shrinkTargetTemp) || 0;

    // Thermal expansion coeff alpha (per °F) x 10^-6
    const alphaF = activeMetal.thermalExpansionF * 1e-6;

    let deltaT_F = 0;
    if (unit === 'in') {
      deltaT_F = T_target - T_start;
    } else {
      // Metric °C diff -> 1 °C = 1.8 °F
      deltaT_F = (T_target - T_start) * 1.8;
    }

    const expansion = L0 * alphaF * deltaT_F;
    const finalLength = L0 + expansion;

    return {
      expansion,
      finalLength,
      unitLabel: unit === 'in' ? 'in' : 'mm',
      tempUnitLabel: unit === 'in' ? '°F' : '°C'
    };
  }, [shrinkLength, shrinkStartTemp, shrinkTargetTemp, activeMetal, unit]);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', paddingBottom: '50px', color: 'var(--text-primary)' }}>
      {/* Header Badge */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(244, 144, 44, 0.1)',
          color: 'var(--accent-cyan)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '10px',
          border: '1px solid rgba(244, 144, 44, 0.3)'
        }}>
          Industrial Metrology & Foundry Science // Phase Transitions
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(90deg, #fff, var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Metallurgy & Thermal Properties Suite
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', margin: '0 auto', fontSize: '0.98rem', lineHeight: 1.5 }}>
          Explore heating, forging, melting (solidus/liquidus), and casting superheat temperatures for industrial alloys. Compute raw stock weights and thermal shrink-fit expansion tolerances.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setActiveTab('thermal_explorer')}
          style={{
            background: activeTab === 'thermal_explorer' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            color: activeTab === 'thermal_explorer' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔥</span> Thermal Phase & Casting Explorer
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stock_weight')}
          style={{
            background: activeTab === 'stock_weight' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            color: activeTab === 'stock_weight' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>⚖️</span> Stock Volume & Weight Calculator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shrink_fitting')}
          style={{
            background: activeTab === 'shrink_fitting' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            color: activeTab === 'shrink_fitting' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🔧</span> Thermal Expansion & Shrink-Fitting
        </button>
      </div>

      {/* TAB 1: THERMAL PHASE & CASTING EXPLORER */}
      {activeTab === 'thermal_explorer' && (
        <div>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '🌟 All Alloys (21)' },
              { id: 'ferrous', label: '🔩 Ferrous Metals & Steels' },
              { id: 'aluminum', label: '✈️ Aluminum & Light Alloys' },
              { id: 'copper_brass', label: '🎺 Copper, Brass & Bronze' },
              { id: 'specialty', label: '💎 Specialty & Precious' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                style={{
                  background: selectedCategory === cat.id ? 'rgba(244, 144, 44, 0.2)' : 'var(--bg-primary)',
                  color: selectedCategory === cat.id ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCategory === cat.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '25px' }}>
            {/* LEFT: METAL SELECTOR LIST */}
            <div className="glass-panel" style={{ padding: '20px', maxHeight: '650px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '15px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                🗂️ Select Industrial Alloy ({filteredMetals.length} Available)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredMetals.map(mat => (
                  <div
                    key={mat.id}
                    onClick={() => setSelectedMetalId(mat.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: selectedMetalId === mat.id ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-primary)',
                      border: `1px solid ${selectedMetalId === mat.id ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: selectedMetalId === mat.id ? 'var(--accent-cyan)' : 'var(--text-primary)', fontSize: '0.95rem' }}>
                        {mat.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Density: {unit === 'in' ? `${mat.densityLbIn3} lb/in³` : `${mat.densityGCm3} g/cm³`} | Melt: {formatTemp(mat.liquidusF)}
                      </div>
                    </div>
                    <span style={{ fontSize: '1.2rem' }}>
                      {mat.category === 'ferrous' ? '🔩' : mat.category === 'aluminum' ? '✈️' : mat.category === 'copper_brass' ? '🎺' : '💎'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: THERMAL DASHBOARD & THERMOMETER VISUALIZER */}
            <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid var(--accent-cyan)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1px' }}>
                      Selected Material Specification
                    </span>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                      {activeMetal.name}
                    </h2>
                  </div>
                  <div style={{ background: 'rgba(0, 255, 128, 0.15)', color: '#00ff80', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {unit === 'in' ? `${activeMetal.densityLbIn3} lb/in³` : `${activeMetal.densityGCm3} g/cm³`}
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '25px', lineHeight: 1.5 }}>
                  ℹ️ <strong>Metallurgical Profile:</strong> {activeMetal.notes}
                </p>

                {/* THERMAL PHASE CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '30px' }}>
                  {/* Card 1: Forging Range */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      🔨 Hot Working / Forging Range
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {activeMetal.forgingMinF > 0 ? `${formatTemp(activeMetal.forgingMinF)} – ${formatTemp(activeMetal.forgingMaxF)}` : 'Not Recommended / Non-Forgeable'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {activeMetal.forgingMinF > 0 ? 'Optimal plasticity window; stop forging below min temp.' : 'Brittle cast structure or hot tearing risk.'}
                    </div>
                  </div>

                  {/* Card 2: Annealing Range */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      🔥 Normalizing / Annealing
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {activeMetal.annealingMinF > 0 ? `${formatTemp(activeMetal.annealingMinF)} – ${formatTemp(activeMetal.annealingMaxF)}` : 'N/A'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Relieves internal stresses and recrystallizes grain structure.
                    </div>
                  </div>

                  {/* Card 3: Solidus & Liquidus */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      🌋 Melting Points (Solidus / Liquidus)
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      Sol: {formatTemp(activeMetal.solidusF)} | Liq: {formatTemp(activeMetal.liquidusF)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Solidus: Melting begins. Liquidus: 100% molten fluid slurry.
                    </div>
                  </div>

                  {/* Card 4: Casting Superheat */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(0, 255, 128, 0.12), rgba(15, 23, 42, 0.6))', border: '1px solid rgba(0, 255, 128, 0.4)', borderRadius: '8px', padding: '15px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#00ff80', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                      🫗 Recommended Casting Pouring Temp
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                      {activeMetal.castingMinF > 0 ? `${formatTemp(activeMetal.castingMinF)} – ${formatTemp(activeMetal.castingMaxF)}` : 'Not Typically Cast'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      Includes 100°–300°F Superheat (ΔT_sh) to prevent mold freeze-off.
                    </div>
                  </div>
                </div>

                {/* THERMOMETER VISUALIZER BAR */}
                <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🌡️</span> Thermal Spectrum Visualizer (0°F to 3,500°F Scale)
                  </h4>

                  {/* SVG Spectrum */}
                  <svg viewBox="0 0 700 80" style={{ width: '100%', height: 'auto', background: '#0a0e17', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {/* Background track */}
                    <rect x="20" y="30" width="660" height="20" rx="4" fill="rgba(255,255,255,0.05)" />

                    {/* Scale markers (every 500°F) */}
                    {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500].map(t => {
                      const x = 20 + (t / 3500) * 660;
                      return (
                        <g key={t}>
                          <line x1={x} y1="50" x2={x} y2="58" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                          <text x={x} y="70" fill="rgba(255,255,255,0.5)" fontSize="9" textAnchor="middle" fontFamily="monospace">
                            {unit === 'in' ? `${t}°` : `${toC(t)}°`}
                          </text>
                        </g>
                      );
                    })}

                    {/* Forging Range Bar (Orange/Yellow) */}
                    {activeMetal.forgingMinF > 0 && (
                      <rect
                        x={20 + (activeMetal.forgingMinF / 3500) * 660}
                        y="30"
                        width={((activeMetal.forgingMaxF - activeMetal.forgingMinF) / 3500) * 660}
                        height="20"
                        fill="#f59e0b"
                        opacity="0.8"
                        rx="2"
                      />
                    )}

                    {/* Annealing Range Bar (Blue) */}
                    {activeMetal.annealingMinF > 0 && (
                      <rect
                        x={20 + (activeMetal.annealingMinF / 3500) * 660}
                        y="35"
                        width={((activeMetal.annealingMaxF - activeMetal.annealingMinF) / 3500) * 660}
                        height="10"
                        fill="#38bdf8"
                        opacity="0.9"
                        rx="2"
                      />
                    )}

                    {/* Mushy Zone / Melting Bar (Red) */}
                    <rect
                      x={20 + (activeMetal.solidusF / 3500) * 660}
                      y="30"
                      width={Math.max(4, ((activeMetal.liquidusF - activeMetal.solidusF) / 3500) * 660)}
                      height="20"
                      fill="#ef4444"
                      rx="2"
                    />

                    {/* Casting Superheat Pouring Zone (Green) */}
                    {activeMetal.castingMinF > 0 && (
                      <rect
                        x={20 + (activeMetal.castingMinF / 3500) * 660}
                        y="30"
                        width={((activeMetal.castingMaxF - activeMetal.castingMinF) / 3500) * 660}
                        height="20"
                        fill="#00ff80"
                        opacity="0.85"
                        rx="2"
                      />
                    )}

                    {/* Legend */}
                    <text x="25" y="20" fill="#f59e0b" fontSize="10" fontWeight="bold">■ Forging</text>
                    <text x="90" y="20" fill="#38bdf8" fontSize="10" fontWeight="bold">■ Annealing</text>
                    <text x="165" y="20" fill="#ef4444" fontSize="10" fontWeight="bold">■ Melting (Sol-Liq)</text>
                    <text x="285" y="20" fill="#00ff80" fontSize="10" fontWeight="bold">■ Casting Superheat Pouring Zone</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STOCK VOLUME & WEIGHT CALCULATOR */}
      {activeTab === 'stock_weight' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid var(--accent-cyan)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            ⚖️ Raw Stock Volume & Weight Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Select starting stock cross-section and dimensions. Weight is calculated instantly using the density of <strong>{activeMetal.name}</strong> ({unit === 'in' ? `${activeMetal.densityLbIn3} lb/in³` : `${activeMetal.densityGCm3} g/cm³`}).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px' }}>
            {/* INPUTS */}
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Stock Cross-Sectional Shape
                </label>
                <select
                  value={stockShape}
                  onChange={(e) => setStockShape(e.target.value as any)}
                  style={{ width: '100%', background: 'var(--bg-secondary)', color: '#fff', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  <option value="round">⚪ Round Bar / Cylinder</option>
                  <option value="square">🔲 Rectangular / Flat / Square Bar</option>
                  <option value="hex">🛑 Hexagonal Bar (Across Flats)</option>
                  <option value="tubing">⭕ Round Tubing / Pipe</option>
                  <option value="taper">📐 Tapered Frustum (Blacksmithing Taper)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Total Length ({unit === 'in' ? 'in' : 'mm'})
                  </label>
                  <input
                    type="number"
                    step={unit === 'in' ? '0.5' : '10'}
                    value={dimLength}
                    onChange={(e) => setDimLength(e.target.value)}
                    className="input-precision"
                  />
                </div>

                {stockShape === 'round' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Diameter ({unit === 'in' ? 'in' : 'mm'})
                    </label>
                    <input
                      type="number"
                      step={unit === 'in' ? '0.125' : '1'}
                      value={dimOD}
                      onChange={(e) => setDimOD(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                )}

                {(stockShape === 'square' || stockShape === 'hex') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      {stockShape === 'hex' ? 'Width Across Flats (AF)' : 'Width'} ({unit === 'in' ? 'in' : 'mm'})
                    </label>
                    <input
                      type="number"
                      step={unit === 'in' ? '0.125' : '1'}
                      value={dimWidth}
                      onChange={(e) => setDimWidth(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                )}

                {stockShape === 'square' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Thickness ({unit === 'in' ? 'in' : 'mm'})
                    </label>
                    <input
                      type="number"
                      step={unit === 'in' ? '0.125' : '1'}
                      value={dimThickness}
                      onChange={(e) => setDimThickness(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                )}

                {stockShape === 'tubing' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Outer Diameter (OD) ({unit === 'in' ? 'in' : 'mm'})
                      </label>
                      <input
                        type="number"
                        step={unit === 'in' ? '0.125' : '1'}
                        value={dimOD}
                        onChange={(e) => setDimOD(e.target.value)}
                        className="input-precision"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Inner Diameter (ID) ({unit === 'in' ? 'in' : 'mm'})
                      </label>
                      <input
                        type="number"
                        step={unit === 'in' ? '0.125' : '1'}
                        value={dimID}
                        onChange={(e) => setDimID(e.target.value)}
                        className="input-precision"
                      />
                    </div>
                  </>
                )}

                {stockShape === 'taper' && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Base Width ({unit === 'in' ? 'in' : 'mm'})
                      </label>
                      <input
                        type="number"
                        step="0.125"
                        value={dimWidth}
                        onChange={(e) => setDimWidth(e.target.value)}
                        className="input-precision"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Base Thickness ({unit === 'in' ? 'in' : 'mm'})
                      </label>
                      <input
                        type="number"
                        step="0.125"
                        value={dimThickness}
                        onChange={(e) => setDimThickness(e.target.value)}
                        className="input-precision"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Tip Width ({unit === 'in' ? 'in' : 'mm'})
                      </label>
                      <input
                        type="number"
                        step="0.125"
                        value={dimWidth2}
                        onChange={(e) => setDimWidth2(e.target.value)}
                        className="input-precision"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Tip Thickness ({unit === 'in' ? 'in' : 'mm'})
                      </label>
                      <input
                        type="number"
                        step="0.125"
                        value={dimThickness2}
                        onChange={(e) => setDimThickness2(e.target.value)}
                        className="input-precision"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RESULTS */}
            <div style={{ background: 'linear-gradient(135deg, rgba(0, 255, 128, 0.1), rgba(15, 23, 42, 0.6))', border: '2px solid rgba(0, 255, 128, 0.4)', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#00ff80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Estimated Stock Weight ({activeMetal.name})
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {stockCalc.weight.toFixed(2)} <span style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>{stockCalc.weightUnit}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-around', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <div>
                  <span>Total Volume: </span>
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{stockCalc.volume.toFixed(2)} {stockCalc.volUnit}</strong>
                </div>
                <div>
                  <span>Density Factor: </span>
                  <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{unit === 'in' ? `${activeMetal.densityLbIn3} lb/in³` : `${activeMetal.densityGCm3} g/cm³`}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THERMAL EXPANSION & SHRINK FITTING */}
      {activeTab === 'shrink_fitting' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid var(--accent-cyan)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            🔧 Thermal Expansion Calculator (Shrink-Fitting & Wagon Tires)
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Determine exact linear expansion (ΔL = α × L₀ × ΔT) for shrink-fitting bearing collars, sleeves, shafts, or wagon tires. Uses thermal expansion coefficient of <strong>{activeMetal.name}</strong> (α = {activeMetal.thermalExpansionF} × 10⁻⁶ /°F).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px' }}>
            {/* INPUTS */}
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Initial Room Temp Length / Diameter ({shrinkCalc.unitLabel})
                  </label>
                  <input
                    type="number"
                    step={unit === 'in' ? '0.125' : '1'}
                    value={shrinkLength}
                    onChange={(e) => setShrinkLength(e.target.value)}
                    className="input-precision"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Start Temp ({shrinkCalc.tempUnitLabel})
                    </label>
                    <input
                      type="number"
                      step="10"
                      value={shrinkStartTemp}
                      onChange={(e) => setShrinkStartTemp(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Target Heated Temp ({shrinkCalc.tempUnitLabel})
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={shrinkTargetTemp}
                      onChange={(e) => setShrinkTargetTemp(e.target.value)}
                      className="input-precision"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RESULTS */}
            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.6))', border: '2px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Linear Thermal Growth (ΔL)
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                +{shrinkCalc.expansion.toFixed(4)} <span style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>{shrinkCalc.unitLabel}</span>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '20px 0' }} />

              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                Final Hot Dimension: <strong style={{ color: '#00ff80', fontFamily: 'var(--font-mono)', fontSize: '1.3rem' }}>{shrinkCalc.finalLength.toFixed(4)} {shrinkCalc.unitLabel}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
