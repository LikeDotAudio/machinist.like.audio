import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Material Weight Calculator — estimate weight, volume & cost of raw stock
// (round/square/hex/rect bar, plate, sheet, tube) from nominal densities.
// ---------------------------------------------------------------------------

type ShapeId = 'round' | 'square' | 'rect' | 'hex' | 'tube' | 'sheet';

interface ShapeDef {
  id: ShapeId;
  label: string;
  icon: string;
}

const SHAPES: ShapeDef[] = [
  { id: 'round', label: 'Round Bar', icon: '⬤' },
  { id: 'square', label: 'Square Bar', icon: '■' },
  { id: 'rect', label: 'Rect Bar / Plate', icon: '▬' },
  { id: 'hex', label: 'Hex Bar', icon: '⬢' },
  { id: 'tube', label: 'Round Tube / Pipe', icon: '◎' },
  { id: 'sheet', label: 'Sheet', icon: '▭' },
];

interface Material {
  name: string;
  lbIn3: number;
  gCm3: number;
}

const MATERIALS: Material[] = [
  { name: 'Aluminum 6061', lbIn3: 0.0975, gCm3: 2.70 },
  { name: 'Aluminum 7075', lbIn3: 0.1016, gCm3: 2.81 },
  { name: 'Steel 1018 / A36', lbIn3: 0.2836, gCm3: 7.85 },
  { name: 'Steel 4140', lbIn3: 0.2836, gCm3: 7.85 },
  { name: 'Stainless 303 / 304', lbIn3: 0.289, gCm3: 8.00 },
  { name: 'Stainless 316', lbIn3: 0.289, gCm3: 8.00 },
  { name: 'Tool Steel O1 / A2 / D2', lbIn3: 0.2818, gCm3: 7.80 },
  { name: 'Cast Iron', lbIn3: 0.260, gCm3: 7.20 },
  { name: 'Brass 360', lbIn3: 0.307, gCm3: 8.50 },
  { name: 'Bronze 932', lbIn3: 0.320, gCm3: 8.86 },
  { name: 'Copper 110', lbIn3: 0.323, gCm3: 8.94 },
  { name: 'Titanium 6Al-4V', lbIn3: 0.160, gCm3: 4.43 },
  { name: 'Magnesium AZ31', lbIn3: 0.0639, gCm3: 1.77 },
  { name: 'Zinc', lbIn3: 0.258, gCm3: 7.14 },
  { name: 'Lead', lbIn3: 0.4096, gCm3: 11.34 },
  { name: 'Delrin / Acetal', lbIn3: 0.0513, gCm3: 1.42 },
  { name: 'Nylon 6/6', lbIn3: 0.0412, gCm3: 1.14 },
  { name: 'HDPE', lbIn3: 0.0347, gCm3: 0.96 },
  { name: 'Acrylic', lbIn3: 0.0426, gCm3: 1.18 },
  { name: 'PTFE / Teflon', lbIn3: 0.0781, gCm3: 2.16 },
];

const LB_PER_KG = 2.2046226;
const KG_PER_LB = 0.45359237;
const CM3_PER_IN3 = 16.387064;
const DENSITY_FACTOR = 27.679905; // (lb/in³) × 27.68 = g/cm³

export const MaterialWeight: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [shape, setShape] = useState<ShapeId>('round');
  const [materialKey, setMaterialKey] = useState<string>('2'); // Steel 1018 / A36
  const [customDensity, setCustomDensity] = useState<string>('0.2836');

  // Dimensional inputs (native to current unit system)
  const [dia, setDia] = useState<string>('1.0000');        // D / OD
  const [innerDia, setInnerDia] = useState<string>('0.7500'); // tube ID
  const [width, setWidth] = useState<string>('2.0000');    // W
  const [thick, setThick] = useState<string>('0.2500');    // T
  const [af, setAf] = useState<string>('0.7500');          // hex across flats
  const [length, setLength] = useState<string>('12.0000'); // L

  const [qty, setQty] = useState<string>('1');
  const [price, setPrice] = useState<string>(''); // $ per lb (imperial) or per kg (metric)

  // Convert dimensional inputs, custom density and price when the unit toggles
  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const conv = (s: string, factor: number, decimals: number): string => {
      const v = parseFloat(s);
      return isNaN(v) ? s : (v * factor).toFixed(decimals);
    };

    if (unit === 'metric' && oldUnit === 'imperial') {
      setDia(p => conv(p, 25.4, 2));
      setInnerDia(p => conv(p, 25.4, 2));
      setWidth(p => conv(p, 25.4, 2));
      setThick(p => conv(p, 25.4, 2));
      setAf(p => conv(p, 25.4, 2));
      setLength(p => conv(p, 25.4, 2));
      setCustomDensity(p => conv(p, DENSITY_FACTOR, 3)); // lb/in³ → g/cm³
      setPrice(p => (p.trim() === '' ? p : conv(p, LB_PER_KG, 2))); // $/lb → $/kg
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setDia(p => conv(p, 1 / 25.4, 4));
      setInnerDia(p => conv(p, 1 / 25.4, 4));
      setWidth(p => conv(p, 1 / 25.4, 4));
      setThick(p => conv(p, 1 / 25.4, 4));
      setAf(p => conv(p, 1 / 25.4, 4));
      setLength(p => conv(p, 1 / 25.4, 4));
      setCustomDensity(p => conv(p, 1 / DENSITY_FACTOR, 4)); // g/cm³ → lb/in³
      setPrice(p => (p.trim() === '' ? p : conv(p, KG_PER_LB, 2))); // $/kg → $/lb
    }
  }, [unit]);

  const isMetric = unit === 'metric';
  const unitStr = isMetric ? 'mm' : 'in';

  // Parse an input string as inches regardless of active unit system
  const toIn = (s: string): number => {
    const v = parseFloat(s) || 0;
    return isMetric ? v / 25.4 : v;
  };

  const D = toIn(dia);
  const ID = toIn(innerDia);
  const W = toIn(width);
  const T = toIn(thick);
  const AF = toIn(af);
  const L = toIn(length);

  let volumeIn3 = 0;
  let dimError: string | null = null;
  switch (shape) {
    case 'round':
      volumeIn3 = Math.PI * (D / 2) * (D / 2) * L;
      break;
    case 'square':
      volumeIn3 = W * W * L;
      break;
    case 'rect':
    case 'sheet':
      volumeIn3 = W * T * L;
      break;
    case 'hex':
      volumeIn3 = (Math.sqrt(3) / 2) * AF * AF * L;
      break;
    case 'tube':
      if (D > 0 && ID >= D) {
        dimError = 'Inner diameter must be smaller than outer diameter.';
      } else {
        volumeIn3 = (Math.PI / 4) * (D * D - ID * ID) * L;
      }
      break;
  }

  const selMaterial: Material | null = materialKey === 'custom' ? null : MATERIALS[parseInt(materialKey, 10)] ?? MATERIALS[0];
  const customVal = parseFloat(customDensity) || 0;
  const densityLbIn3 = selMaterial ? selMaterial.lbIn3 : (isMetric ? customVal / DENSITY_FACTOR : customVal);
  const densityGCm3 = selMaterial ? selMaterial.gCm3 : densityLbIn3 * DENSITY_FACTOR;
  const materialName = selMaterial ? selMaterial.name : 'Custom Density';

  const qtyN = Math.max(1, Math.floor(parseFloat(qty) || 1));
  const weightLb = volumeIn3 * densityLbIn3;
  const weightKg = weightLb * KG_PER_LB;
  const totalLb = weightLb * qtyN;
  const totalKg = weightKg * qtyN;
  const volumeCm3 = volumeIn3 * CM3_PER_IN3;

  const priceVal = parseFloat(price);
  const hasPrice = !isNaN(priceVal) && priceVal > 0;
  const costPerPiece = hasPrice ? (isMetric ? weightKg : weightLb) * priceVal : 0;
  const costTotal = costPerPiece * qtyN;

  // Handling hint — thresholds: 50 lb ≈ 23 kg, 150 lb ≈ 68 kg (per piece)
  const handling = weightLb < 50
    ? { color: '#00ff80', bg: 'rgba(0, 255, 128, 0.1)', border: 'rgba(0, 255, 128, 0.35)', label: 'ONE-PERSON LIFT', range: isMetric ? '< 23 kg' : '< 50 lb' }
    : weightLb <= 150
      ? { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.35)', label: 'TWO-PERSON / CART', range: isMetric ? '23 – 68 kg' : '50 – 150 lb' }
      : { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.35)', label: 'HOIST / FORKLIFT', range: isMetric ? '> 68 kg' : '> 150 lb' };

  // --- Formatting helpers ---
  const fmtLb = (lb: number): string => lb < 1 ? `${(lb * 16).toFixed(2)} oz` : `${lb.toFixed(lb < 100 ? 2 : 1)} lb`;
  const fmtKg = (kg: number): string => kg < 1 ? `${(kg * 1000).toFixed(1)} g` : `${kg.toFixed(kg < 100 ? 3 : 1)} kg`;
  const fmtPrimary = (lb: number, kg: number) => (isMetric ? fmtKg(kg) : fmtLb(lb));
  const fmtSecondary = (lb: number, kg: number) => (isMetric ? fmtLb(lb) : fmtKg(kg));
  const fmtDim = (s: string): string => {
    const v = parseFloat(s) || 0;
    return isMetric ? `${Number(v.toFixed(2))} mm` : `${Number(v.toFixed(4))}"`;
  };

  // --- UI helpers ---
  const suffixStyle: React.CSSProperties = {
    position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)',
    color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem'
  };

  const dimInput = (label: string, value: string, setter: (v: string) => void, suffix?: string) => (
    <div>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          value={value}
          min="0"
          step={isMetric ? '1' : '0.125'}
          onChange={(e) => setter(e.target.value)}
          className="input-precision"
          style={{ width: '100%' }}
        />
        <span style={suffixStyle}>{suffix ?? unitStr}</span>
      </div>
    </div>
  );

  const resultRow = (label: string, value: string, sub?: string, accent?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
        <strong style={{ color: accent ?? '#fff', fontSize: '0.92rem' }}>{value}</strong>
        {sub && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{sub}</span>}
      </span>
    </div>
  );

  const dimText = { fontFamily: 'var(--font-mono)', fontWeight: 700 } as const;

  // ------------------------------------------------------------------
  // SVG shape preview (simple isometric-ish outlines, dark style)
  // ------------------------------------------------------------------
  const renderPreview = () => {
    const lengthDim = (x0: number, x1: number, y: number) => (
      <g>
        <line x1={x0} y1={y - 5} x2={x0} y2={y + 5} stroke="#94a3b8" strokeWidth="0.8" />
        <line x1={x1} y1={y - 5} x2={x1} y2={y + 5} stroke="#94a3b8" strokeWidth="0.8" />
        <line x1={x0} y1={y} x2={x1} y2={y} stroke="#94a3b8" strokeWidth="0.8" />
        <text x={(x0 + x1) / 2} y={y - 6} fill="#f4902c" fontSize="10" textAnchor="middle" style={dimText}>
          L = {fmtDim(length)}
        </text>
      </g>
    );

    if (shape === 'round' || shape === 'tube') {
      const ratio = Math.min(0.92, Math.max(0.1, (parseFloat(innerDia) || 0) / (parseFloat(dia) || 1)));
      return (
        <svg viewBox="0 0 340 200" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="mwCylGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5b6b7f" />
              <stop offset="50%" stopColor="#2c3a4e" />
              <stop offset="100%" stopColor="#5b6b7f" />
            </linearGradient>
          </defs>
          <path d="M 70 53 L 270 53 L 270 137 L 70 137 A 16 42 0 0 1 70 53 Z" fill="url(#mwCylGrad)" stroke="#94a3b8" strokeWidth="1.2" />
          <ellipse cx="270" cy="95" rx="16" ry="42" fill="#3b4859" stroke="#cbd5e1" strokeWidth="1.2" />
          {shape === 'tube' && (
            <ellipse cx="270" cy="95" rx={16 * ratio} ry={42 * ratio} fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
          )}
          {/* OD dimension */}
          <line x1="300" y1="53" x2="300" y2="137" stroke="#f4902c" strokeWidth="0.8" />
          <line x1="272" y1="53" x2="304" y2="53" stroke="rgba(244,144,44,0.4)" strokeWidth="0.6" />
          <line x1="272" y1="137" x2="304" y2="137" stroke="rgba(244,144,44,0.4)" strokeWidth="0.6" />
          <text x="306" y="88" fill="#f4902c" fontSize="10" style={dimText}>{shape === 'tube' ? 'OD' : 'Ø D'}</text>
          <text x="306" y="100" fill="#f4902c" fontSize="9" style={dimText}>{fmtDim(dia)}</text>
          {shape === 'tube' && (
            <g>
              <line x1={270} y1={95 - 42 * ratio} x2={296} y2={30} stroke="#38bdf8" strokeWidth="0.7" />
              <text x="230" y="24" fill="#38bdf8" fontSize="10" style={dimText}>ID {fmtDim(innerDia)}</text>
            </g>
          )}
          {lengthDim(70, 270, 168)}
        </svg>
      );
    }

    if (shape === 'hex') {
      // Extruded hexagon, across-flats vertical (53 → 137)
      return (
        <svg viewBox="0 0 340 200" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <linearGradient id="mwHexGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#55657a" />
              <stop offset="34%" stopColor="#2c3a4e" />
              <stop offset="66%" stopColor="#2c3a4e" />
              <stop offset="100%" stopColor="#55657a" />
            </linearGradient>
          </defs>
          <path d="M 70 53 L 261.5 53 L 253 95 L 261.5 137 L 70 137 Z" fill="url(#mwHexGrad)" stroke="#94a3b8" strokeWidth="1.2" />
          <polygon points="287,95 278.5,137 261.5,137 253,95 261.5,53 278.5,53" fill="#3b4859" stroke="#cbd5e1" strokeWidth="1.2" />
          <line x1="70" y1="95" x2="253" y2="95" stroke="rgba(148,163,184,0.45)" strokeWidth="0.8" />
          {/* Across-flats dimension */}
          <line x1="305" y1="53" x2="305" y2="137" stroke="#f4902c" strokeWidth="0.8" />
          <line x1="280" y1="53" x2="309" y2="53" stroke="rgba(244,144,44,0.4)" strokeWidth="0.6" />
          <line x1="280" y1="137" x2="309" y2="137" stroke="rgba(244,144,44,0.4)" strokeWidth="0.6" />
          <text x="311" y="88" fill="#f4902c" fontSize="10" style={dimText}>AF</text>
          <text x="311" y="100" fill="#f4902c" fontSize="9" style={dimText}>{fmtDim(af)}</text>
          {lengthDim(70, 270, 168)}
        </svg>
      );
    }

    // Box shapes: square bar, rect bar / plate, sheet
    const wVal = parseFloat(width) || 1;
    const tVal = parseFloat(thick) || 0;
    const fh = shape === 'square'
      ? 56
      : Math.min(shape === 'sheet' ? 26 : 80, Math.max(shape === 'sheet' ? 5 : 10, (56 * tVal) / wVal));
    const yb = 140;
    const yt = yb - fh;
    return (
      <svg viewBox="0 0 340 200" style={{ width: '100%', height: 'auto' }}>
        {/* top face */}
        <polygon points={`60,${yt} 240,${yt} 270,${yt - 20} 90,${yt - 20}`} fill="#46586e" stroke="#94a3b8" strokeWidth="1.2" />
        {/* front face */}
        <rect x="60" y={yt} width="180" height={fh} fill="#2c3a4e" stroke="#94a3b8" strokeWidth="1.2" />
        {/* side face */}
        <polygon points={`240,${yt} 270,${yt - 20} 270,${yt - 20 + fh} 240,${yb}`} fill="#22303f" stroke="#94a3b8" strokeWidth="1.2" />
        {/* W (depth) dimension along receding edge */}
        <line x1="245" y1={yt + 6} x2="275" y2={yt - 14} stroke="#f4902c" strokeWidth="0.8" />
        <text x="280" y={yt - 12} fill="#f4902c" fontSize="10" style={dimText}>W {fmtDim(width)}</text>
        {/* height dimension: W for square, T for rect/plate/sheet */}
        <line x1="288" y1={yt - 20 + fh} x2="288" y2={yb + 14} stroke="#38bdf8" strokeWidth="0.8" opacity="0" />
        <line x1="50" y1={yt} x2="50" y2={yb} stroke="#38bdf8" strokeWidth="0.8" />
        <line x1="46" y1={yt} x2="60" y2={yt} stroke="rgba(56,189,248,0.4)" strokeWidth="0.6" />
        <line x1="46" y1={yb} x2="60" y2={yb} stroke="rgba(56,189,248,0.4)" strokeWidth="0.6" />
        <text x="44" y={(yt + yb) / 2 + 3} fill="#38bdf8" fontSize="10" textAnchor="end" style={dimText}>
          {shape === 'square' ? `W ${fmtDim(width)}` : `T ${fmtDim(thick)}`}
        </text>
        {lengthDim(60, 240, 168)}
      </svg>
    );
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          ⚖️ Material Weight <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Stock Weight, Volume & Cost</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#fff' }}>{MATERIALS.length}</strong> materials
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(244, 144, 44, 0.12)', border: '1px solid rgba(244, 144, 44, 0.35)', fontSize: '0.78rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
            ρ = {isMetric ? `${densityGCm3.toFixed(2)} g/cm³` : `${densityLbIn3.toFixed(4)} lb/in³`}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Left Card: Stock Definition */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🧱 Stock Definition</h3>
          </div>

          {/* Shape selector chips */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Stock Shape
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {SHAPES.map(s => {
                const active = shape === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setShape(s.id)}
                    style={{
                      padding: '9px 6px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: active ? 'var(--accent-cyan)' : 'var(--border-color)',
                      background: active ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-primary)',
                      color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>{s.icon}</span>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimension inputs (per shape) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {(shape === 'round' || shape === 'tube') && dimInput(shape === 'tube' ? 'Outer Diameter (OD)' : 'Diameter (D)', dia, setDia)}
            {shape === 'tube' && dimInput('Inner Diameter (ID)', innerDia, setInnerDia)}
            {(shape === 'square' || shape === 'rect' || shape === 'sheet') && dimInput('Width (W)', width, setWidth)}
            {(shape === 'rect' || shape === 'sheet') && dimInput('Thickness (T)', thick, setThick)}
            {shape === 'hex' && dimInput('Across Flats (AF)', af, setAf)}
            {dimInput('Length (L)', length, setLength)}
          </div>

          {dimError && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', fontSize: '0.82rem', fontWeight: 600 }}>
              ⚠ {dimError}
            </div>
          )}

          {/* Material selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Material
            </label>
            <select
              value={materialKey}
              onChange={(e) => setMaterialKey(e.target.value)}
              className="input-precision"
              style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer' }}
            >
              {MATERIALS.map((mat, i) => (
                <option key={mat.name} value={String(i)}>
                  {mat.name} — {mat.lbIn3.toFixed(4)} lb/in³ / {mat.gCm3.toFixed(2)} g/cm³
                </option>
              ))}
              <option value="custom">Custom density…</option>
            </select>
            {materialKey === 'custom' && (
              <div style={{ position: 'relative', marginTop: '10px' }}>
                <input
                  type="number"
                  value={customDensity}
                  min="0"
                  step={isMetric ? '0.01' : '0.001'}
                  onChange={(e) => setCustomDensity(e.target.value)}
                  className="input-precision"
                  style={{ width: '100%' }}
                />
                <span style={suffixStyle}>{isMetric ? 'g/cm³' : 'lb/in³'}</span>
              </div>
            )}
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ρ = <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{densityLbIn3.toFixed(4)} lb/in³</span>
              <span style={{ margin: '0 6px' }}>·</span>
              <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{densityGCm3.toFixed(2)} g/cm³</span>
            </div>
          </div>

          {/* Quantity & price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quantity
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={qty}
                  min="1"
                  step="1"
                  onChange={(e) => setQty(e.target.value)}
                  className="input-precision"
                  style={{ width: '100%' }}
                />
                <span style={suffixStyle}>pcs</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Price per {isMetric ? 'kg' : 'lb'} <span style={{ color: 'var(--text-muted)', textTransform: 'none' }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={price}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  onChange={(e) => setPrice(e.target.value)}
                  className="input-precision"
                  style={{ width: '100%' }}
                />
                <span style={suffixStyle}>$/{isMetric ? 'kg' : 'lb'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Results & Preview */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              STOCK WEIGHT ESTIMATE
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>
              {materialName} — {SHAPES.find(s => s.id === shape)?.label}
            </h3>
          </div>

          {/* SVG shape preview */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '12px 8px 2px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              STOCK PREVIEW
            </div>
            {renderPreview()}
          </div>

          {/* Main weight display */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              WEIGHT PER PIECE
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              {dimError ? '—' : fmtPrimary(weightLb, weightKg)}
            </div>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', display: 'block', marginTop: '4px' }}>
              {dimError ? '' : `= ${fmtSecondary(weightLb, weightKg)}`}
            </span>
          </div>

          {/* Handling hint */}
          {!dimError && weightLb > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderRadius: '8px', background: handling.bg, border: `1px solid ${handling.border}` }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px', color: handling.color }}>
                {weightLb < 50 ? '🟢' : weightLb <= 150 ? '🟡' : '🔴'} {handling.label}
              </span>
              <span style={{ fontSize: '0.74rem', color: handling.color, fontFamily: 'var(--font-mono)' }}>
                {handling.range} / piece
              </span>
            </div>
          )}

          {/* Detail table */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
            {resultRow(
              `Total Weight (× ${qtyN})`,
              dimError ? '—' : fmtPrimary(totalLb, totalKg),
              dimError ? undefined : fmtSecondary(totalLb, totalKg),
              '#f4902c'
            )}
            {resultRow(
              'Volume / Piece',
              dimError ? '—' : (isMetric ? `${volumeCm3.toFixed(2)} cm³` : `${volumeIn3.toFixed(3)} in³`),
              dimError ? undefined : (isMetric ? `${volumeIn3.toFixed(3)} in³` : `${volumeCm3.toFixed(2)} cm³`)
            )}
            {resultRow(
              'Density Used',
              isMetric ? `${densityGCm3.toFixed(2)} g/cm³` : `${densityLbIn3.toFixed(4)} lb/in³`,
              isMetric ? `${densityLbIn3.toFixed(4)} lb/in³` : `${densityGCm3.toFixed(2)} g/cm³`
            )}
            {hasPrice && resultRow(
              'Cost / Piece',
              dimError ? '—' : `$${costPerPiece.toFixed(2)}`,
              `@ $${priceVal.toFixed(2)}/${isMetric ? 'kg' : 'lb'}`,
              '#00ff80'
            )}
            {hasPrice && resultRow(
              `Extended Cost (× ${qtyN})`,
              dimError ? '—' : `$${costTotal.toFixed(2)}`,
              undefined,
              '#00ff80'
            )}
          </div>
        </div>

      </div>

      {/* Footer: tool description (kept out of the header per site convention) */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          MATERIAL WEIGHT CALCULATOR // RAW STOCK WEIGHT, VOLUME & COST ESTIMATOR
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Weight = volume × density. Enter the stock shape and dimensions (round, square, hex or rectangular bar,
          plate, sheet, or tube) and pick a material to estimate per-piece and total weight, with volume shown in
          both in³ and cm³ and an optional price-per-pound / price-per-kilogram extended cost. Densities are nominal
          room-temperature values and vary slightly by alloy, temper, and supplier — treat results as estimates for
          quoting material and shipping, sizing packaging, and checking crane, hoist, and bench limits before the
          stock ever hits the saw. The handling hint flags loads over one-person (≈50 lb / 23 kg) and cart
          (≈150 lb / 68 kg) thresholds.
        </p>
      </div>
    </div>
  );
};

export default MaterialWeight;
