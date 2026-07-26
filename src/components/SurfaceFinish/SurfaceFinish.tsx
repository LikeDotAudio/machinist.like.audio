import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Surface Finish Conversion Calculator
// Converts between Ra (µm / µin), RMS (µin), CLA (µin), Rz (µm) and ISO 1302
// N grades using standard industry approximations:
//   Ra µin = Ra µm × 39.37   ·   RMS ≈ 1.11 × Ra   ·   CLA = Ra (µin)
//   Rz ≈ 4 × Ra (real-world range ~3–7× depending on process)
// ---------------------------------------------------------------------------

type InputUnit = 'ra_um' | 'ra_uin' | 'rms_uin' | 'rz_um' | 'n';

interface NGrade {
  grade: string;
  raUm: number;
}

// ISO 1302 roughness grade numbers (Ra in µm)
const N_GRADES: NGrade[] = [
  { grade: 'N1', raUm: 0.025 },
  { grade: 'N2', raUm: 0.05 },
  { grade: 'N3', raUm: 0.1 },
  { grade: 'N4', raUm: 0.2 },
  { grade: 'N5', raUm: 0.4 },
  { grade: 'N6', raUm: 0.8 },
  { grade: 'N7', raUm: 1.6 },
  { grade: 'N8', raUm: 3.2 },
  { grade: 'N9', raUm: 6.3 },
  { grade: 'N10', raUm: 12.5 },
  { grade: 'N11', raUm: 25 },
  { grade: 'N12', raUm: 50 },
];

// Standard finish ladder (µin Ra) with typical producing process
const FINISH_LADDER: { uin: number; process: string }[] = [
  { uin: 2, process: 'Lapping / superfinish' },
  { uin: 4, process: 'Honing' },
  { uin: 8, process: 'Grinding / honing' },
  { uin: 16, process: 'Fine grinding / hard turning' },
  { uin: 32, process: 'Finish machining' },
  { uin: 63, process: 'General machining' },
  { uin: 125, process: 'Rough machining' },
  { uin: 250, process: 'Heavy rough' },
  { uin: 500, process: 'Sawn / as-cast' },
];

// Process capability: achievable Ra range in µin
const PROCESS_CAPABILITY: { process: string; min: number; max: number }[] = [
  { process: 'Lapping', min: 1, max: 8 },
  { process: 'Honing', min: 2, max: 16 },
  { process: 'Grinding', min: 4, max: 32 },
  { process: 'Hard turning', min: 8, max: 32 },
  { process: 'Reaming', min: 16, max: 63 },
  { process: 'Finish milling / turning', min: 16, max: 125 },
  { process: 'Drilling', min: 63, max: 250 },
  { process: 'Sawing', min: 250, max: 1000 },
];

const UM_TO_UIN = 39.37;
const RMS_FACTOR = 1.11;
const RZ_FACTOR = 4; // nominal; real range ~3–7×

const UNIT_CHIPS: { id: InputUnit; label: string }[] = [
  { id: 'ra_uin', label: 'Ra µin' },
  { id: 'ra_um', label: 'Ra µm' },
  { id: 'rms_uin', label: 'RMS µin' },
  { id: 'rz_um', label: 'Rz µm' },
  { id: 'n', label: 'N grade' },
];

// Adaptive decimal formatting for roughness values
const fmt = (v: number): string => {
  if (!isFinite(v)) return '—';
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  return v.toFixed(3);
};

// Deterministic pseudo-random in [-1, 1] (stable jagged profile)
const jitter = (i: number, seed: number): number => {
  const s = Math.sin((i + seed) * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
};

// Log-scale amplitude mapping: 1 µin → ~3px, 1000 µin → ~34px
const ampPxFor = (raUin: number): number => {
  const clamped = Math.min(1000, Math.max(1, raUin));
  return 3 + (31 * Math.log10(clamped)) / 3;
};

const profilePoints = (amp: number, seed: number, y0: number, x0: number, x1: number): string => {
  const steps = 96;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = x0 + (i * (x1 - x0)) / steps;
    const y = y0 + jitter(i, seed) * amp;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
};

export const SurfaceFinish: React.FC = () => {
  const { unit } = useUnit();
  const [inputUnit, setInputUnit] = useState<InputUnit>(unit === 'metric' ? 'ra_um' : 'ra_uin');
  const [inputValue, setInputValue] = useState<string>(unit === 'metric' ? '0.8' : '32');
  const [selectedN, setSelectedN] = useState<string>('N6');

  // --- Normalize input to Ra in µm ---
  const raUm = useMemo(() => {
    if (inputUnit === 'n') {
      const g = N_GRADES.find(x => x.grade === selectedN);
      return g ? g.raUm : 0.8;
    }
    const v = parseFloat(inputValue);
    if (!isFinite(v) || v <= 0) return 0;
    switch (inputUnit) {
      case 'ra_um': return v;
      case 'ra_uin': return v / UM_TO_UIN;
      case 'rms_uin': return v / RMS_FACTOR / UM_TO_UIN;
      case 'rz_um': return v / RZ_FACTOR;
      default: return v;
    }
  }, [inputUnit, inputValue, selectedN]);

  const valid = raUm > 0;
  const raUin = raUm * UM_TO_UIN;
  const rmsUin = raUin * RMS_FACTOR;
  const claUin = raUin;
  const rzUm = raUm * RZ_FACTOR;
  const rzLoUm = raUm * 3;
  const rzHiUm = raUm * 7;

  // Nearest ISO N grade (log distance)
  const nearestN = useMemo(() => {
    if (!valid) return N_GRADES[5];
    return N_GRADES.reduce((best, g) =>
      Math.abs(Math.log10(g.raUm) - Math.log10(raUm)) < Math.abs(Math.log10(best.raUm) - Math.log10(raUm)) ? g : best
    );
  }, [raUm, valid]);

  // Equivalent value of the current Ra expressed in a given input unit
  const equivalentIn = (u: InputUnit): number => {
    switch (u) {
      case 'ra_um': return raUm;
      case 'ra_uin': return raUin;
      case 'rms_uin': return rmsUin;
      case 'rz_um': return rzUm;
      default: return raUm;
    }
  };

  const switchUnit = (u: InputUnit) => {
    if (u === inputUnit) return;
    if (u === 'n') {
      setSelectedN(nearestN.grade);
    } else if (valid) {
      setInputValue(fmt(equivalentIn(u)));
    }
    setInputUnit(u);
  };

  const loadLadder = (uin: number) => {
    setInputUnit('ra_uin');
    setInputValue(String(uin));
  };

  // --- SVG comparative roughness profile ---
  const svg = useMemo(() => {
    const W = 560, H = 210, x0 = 42, x1 = 545;
    const mainY = 72, refY = 168;
    const amp = ampPxFor(valid ? raUin : 32);
    const refAmp = ampPxFor(32);
    return {
      W, H, x0, x1, mainY, refY, amp, refAmp,
      mainPts: profilePoints(amp, 7, mainY, x0, x1),
      refPts: profilePoints(refAmp, 7, refY, x0, x1),
      clampedLow: valid && raUin < 1,
      clampedHigh: valid && raUin > 1000,
    };
  }, [raUin, valid]);

  const unitSuffix = inputUnit === 'ra_um' || inputUnit === 'rz_um' ? 'µm' : 'µin';

  const resultRow = (label: string, value: string, sub: string | null, accent?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
        <strong style={{ color: accent ?? '#fff', fontSize: '0.95rem' }}>{value}</strong>
        {sub && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{sub}</span>}
      </span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          ✨ Surface Finish <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Ra · RMS · Rz · N Grade Conversion</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(244, 144, 44, 0.12)', border: '1px solid rgba(244, 144, 44, 0.35)', fontSize: '0.78rem', color: '#f4902c', fontFamily: 'var(--font-mono)' }}>
            Ra <strong>{valid ? fmt(raUin) : '—'}</strong> µin
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.35)', fontSize: '0.78rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            ≈ <strong>{valid ? nearestN.grade : '—'}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Left Card: Input */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>🎛️ Roughness Input</h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Enter any one callout — all equivalents update live</span>
          </div>

          {/* Unit selector chips */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '2px' }}>
            {UNIT_CHIPS.map(c => {
              const active = inputUnit === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => switchUnit(c.id)}
                  style={{
                    padding: '8px 13px',
                    border: 'none',
                    borderRadius: '6px',
                    background: active ? 'var(--accent-cyan)' : 'transparent',
                    color: active ? '#000' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {c.label}
                </button>
              );
            })}
          </div>

          {inputUnit === 'n' ? (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                ISO 1302 Roughness Grade
              </label>
              <select
                value={selectedN}
                onChange={(e) => setSelectedN(e.target.value)}
                className="input-precision"
                style={{ width: '100%', cursor: 'pointer' }}
              >
                {N_GRADES.map(g => (
                  <option key={g.grade} value={g.grade}>
                    {g.grade} — Ra {g.raUm} µm ({fmt(g.raUm * UM_TO_UIN)} µin)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {UNIT_CHIPS.find(c => c.id === inputUnit)?.label} Value
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={inputValue}
                  min="0"
                  step={unitSuffix === 'µm' ? '0.1' : '1'}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="input-precision"
                  style={{ width: '100%' }}
                />
                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {unitSuffix}
                </span>
              </div>
            </div>
          )}

          {/* Standard finish ladder */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              Standard Finish Ladder — Ra µin
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {FINISH_LADDER.map(step => {
                const active = valid && Math.abs(raUin - step.uin) / step.uin < 0.06;
                return (
                  <button
                    key={step.uin}
                    onClick={() => loadLadder(step.uin)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: active ? 'rgba(244, 144, 44, 0.5)' : 'var(--border-color)',
                      background: active ? 'rgba(244, 144, 44, 0.12)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem', color: active ? '#f4902c' : '#fff', minWidth: '48px' }}>
                      {step.uin}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {step.process}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Card: Results & Profile Visual */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Equivalent Callouts
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.4)', marginTop: '2px' }}>
              {valid ? fmt(raUin) : '—'} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>µin Ra</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '12px' }}>= {valid ? fmt(raUm) : '—'} µm</span>
            </div>
          </div>

          {/* Comparative roughness profile SVG */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '10px 6px 4px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Comparative Roughness Profile
            </div>
            {(svg.clampedLow || svg.clampedHigh) && (
              <div style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>
                AMPLITUDE CLAMPED
              </div>
            )}
            <svg viewBox={`0 0 ${svg.W} ${svg.H}`} style={{ width: '100%', height: 'auto', marginTop: '14px' }}>
              {/* Current profile strip */}
              <rect x={svg.x0 - 4} y={svg.mainY - 42} width={svg.x1 - svg.x0 + 8} height={84} fill="rgba(0,0,0,0.45)" rx="3" />
              {/* Ra band shading */}
              <rect x={svg.x0} y={svg.mainY - svg.amp} width={svg.x1 - svg.x0} height={2 * svg.amp} fill="rgba(244, 144, 44, 0.14)" />
              <line x1={svg.x0} y1={svg.mainY - svg.amp} x2={svg.x1} y2={svg.mainY - svg.amp} stroke="rgba(244,144,44,0.45)" strokeWidth="0.7" strokeDasharray="4 3" />
              <line x1={svg.x0} y1={svg.mainY + svg.amp} x2={svg.x1} y2={svg.mainY + svg.amp} stroke="rgba(244,144,44,0.45)" strokeWidth="0.7" strokeDasharray="4 3" />
              {/* Mean line */}
              <line x1={svg.x0} y1={svg.mainY} x2={svg.x1} y2={svg.mainY} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeDasharray="12 4 3 4" />
              {/* Jagged profile */}
              <polyline points={svg.mainPts} fill="none" stroke="#f4902c" strokeWidth="1.4" strokeLinejoin="round" />
              <text x={svg.x0} y={svg.mainY - 46} fill="#f4902c" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                CURRENT — Ra {valid ? fmt(raUin) : '—'} µin ({valid ? fmt(raUm) : '—'} µm)
              </text>
              {/* Reference profile strip at 32 µin */}
              <rect x={svg.x0 - 4} y={svg.refY - 26} width={svg.x1 - svg.x0 + 8} height={52} fill="rgba(0,0,0,0.45)" rx="3" />
              <line x1={svg.x0} y1={svg.refY} x2={svg.x1} y2={svg.refY} stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeDasharray="12 4 3 4" />
              <polyline points={svg.refPts} fill="none" stroke="#38bdf8" strokeWidth="1.1" strokeLinejoin="round" opacity="0.85" />
              <text x={svg.x0} y={svg.refY - 30} fill="#38bdf8" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                REFERENCE — Ra 32 µin (0.8 µm · N6 · finish machining)
              </text>
            </svg>
          </div>

          {/* Equivalents table */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
            {resultRow('Ra — Arithmetic Avg', valid ? `${fmt(raUm)} µm` : '—', valid ? `${fmt(raUin)} µin` : null, '#f4902c')}
            {resultRow('RMS ≈ 1.11 × Ra', valid ? `${fmt(rmsUin)} µin` : '—', valid ? `${fmt(rmsUin / UM_TO_UIN)} µm` : null, '#00ff80')}
            {resultRow('CLA (= Ra)', valid ? `${fmt(claUin)} µin` : '—', valid ? `${fmt(raUm)} µm` : null, '#38bdf8')}
            {resultRow('Rz ≈ 4 × Ra', valid ? `≈ ${fmt(rzUm)} µm` : '—', valid ? `range ${fmt(rzLoUm)}–${fmt(rzHiUm)} µm (3–7×)` : null, '#c084fc')}
            {resultRow('Nearest ISO Grade', valid ? nearestN.grade : '—', valid ? `Ra ${nearestN.raUm} µm nominal` : null, '#f59e0b')}
          </div>

          {/* N grade ladder with nearest highlighted */}
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              ISO 1302 N Grades (Ra µm)
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {N_GRADES.map(g => {
                const active = valid && g.grade === nearestN.grade;
                return (
                  <button
                    key={g.grade}
                    onClick={() => { setInputUnit('n'); setSelectedN(g.grade); }}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: active ? 'rgba(245, 158, 11, 0.6)' : 'var(--border-color)',
                      background: active ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'center',
                    }}
                  >
                    <span style={{ display: 'block', fontWeight: 800, fontSize: '0.76rem', color: active ? '#f59e0b' : '#fff' }}>{g.grade}</span>
                    <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-muted)' }}>{g.raUm}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Process capability table */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '20px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Process Capability — Achievable Ra (µin) · rows highlight when they can produce the current finish
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '8px' }}>
          {PROCESS_CAPABILITY.map(p => {
            const covers = valid && raUin >= p.min && raUin <= p.max;
            return (
              <div
                key={p.process}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: covers ? 'rgba(0, 255, 128, 0.4)' : 'var(--border-color)',
                  background: covers ? 'rgba(0, 255, 128, 0.08)' : 'var(--bg-primary)',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: covers ? '#00ff80' : 'var(--text-secondary)' }}>
                  {covers ? '✓ ' : ''}{p.process}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: covers ? '#fff' : 'var(--text-muted)' }}>
                  {p.min}–{p.max}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          SURFACE FINISH CONVERSION // Ra · RMS · CLA · Rz · ISO N GRADES (ASME B46.1 / ISO 1302)
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          <strong style={{ color: '#f4902c' }}>Ra</strong> (arithmetic average roughness) is the mean absolute deviation of the
          profile from its centerline — the standard callout on modern drawings (ASME B46.1 / ISO 1302).{' '}
          <strong style={{ color: '#00ff80' }}>RMS</strong> is the root-mean-square deviation, common on older US drawings;
          for a typical machined profile RMS ≈ 1.11 × Ra. <strong style={{ color: '#38bdf8' }}>CLA</strong> (center line
          average, the older British term) is numerically identical to Ra, quoted in µin.{' '}
          <strong style={{ color: '#c084fc' }}>Rz</strong> (mean peak-to-valley height, ISO) is measured differently and has
          no exact conversion — Rz ≈ 4 × Ra is a planning approximation only, with real ratios ranging roughly 3–7× depending
          on the process. Ra µin = Ra µm × 39.37. ISO N grades N1–N12 are shorthand for preferred Ra steps from 0.025 to
          50 µm. Use the conversions for process planning and interpreting legacy drawings — inspection callouts should be
          measured with the parameter actually specified.
        </p>
      </div>
    </div>
  );
};

export default SurfaceFinish;
