import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface GearCombination {
  type: 'simple' | 'compound';
  gearA: number; // Spindle / Driver 1
  gearB: number; // Stud Driven / Driven 1
  gearC?: number; // Stud Driver 2
  gearD?: number; // Lead Screw / Driven 2
  actualPitchVal: number; // in target unit system
  errorPercent: number;
}

const DEFAULT_GEARS = [20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 72, 80, 100, 127];

export const ThreadingChangeGears: React.FC = () => {
  const { unit: globalUnit } = useUnit();
  const targetUnit: 'tpi' | 'mm' = globalUnit === 'imperial' ? 'tpi' : 'mm';
  const prevUnitRef = useRef<'tpi' | 'mm'>(targetUnit);

  const [leadScrewUnit, setLeadScrewUnit] = useState<'tpi' | 'mm'>('tpi');
  const [leadScrewVal, setLeadScrewVal] = useState<string>('8'); // 8 TPI lead screw standard
  const [targetVal, setTargetVal] = useState<string>('1.5'); // M10x1.5 metric pitch on imperial lead screw!
  const [maxResults, setMaxResults] = useState<number>(10);

  useEffect(() => {
    if (prevUnitRef.current === targetUnit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = targetUnit;

    const val = parseFloat(targetVal) || 0;
    if (targetUnit === 'mm' && oldUnit === 'tpi' && val > 0) {
      setTargetVal((25.4 / val).toFixed(3));
    } else if (targetUnit === 'tpi' && oldUnit === 'mm' && val > 0) {
      setTargetVal(Math.max(1, Math.round(25.4 / val)).toString());
    }
  }, [targetUnit]);

  // Allow user to toggle available gears in their shop
  const [availableGears, setAvailableGears] = useState<number[]>(DEFAULT_GEARS);
  const [newGearInput, setNewGearInput] = useState<string>('');

  const handleToggleGear = (gear: number) => {
    if (availableGears.includes(gear)) {
      setAvailableGears(availableGears.filter(g => g !== gear));
    } else {
      setAvailableGears([...availableGears, gear].sort((a, b) => a - b));
    }
  };

  const handleAddGear = (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseInt(newGearInput);
    if (!isNaN(g) && g > 10 && g < 300 && !availableGears.includes(g)) {
      setAvailableGears([...availableGears, g].sort((a, b) => a - b));
      setNewGearInput('');
    }
  };

  // Compute required ratio
  // Ratio = Target Lead / Lead Screw Lead
  const results: GearCombination[] = useMemo(() => {
    const lsVal = parseFloat(leadScrewVal) || 1;
    const tgVal = parseFloat(targetVal) || 1;

    // Convert Lead Screw to linear lead in inches
    const lsLeadInches = leadScrewUnit === 'tpi' ? 1 / lsVal : lsVal / 25.4;
    // Convert Target to linear lead in inches
    const tgLeadInches = targetUnit === 'tpi' ? 1 / tgVal : tgVal / 25.4;

    if (lsLeadInches <= 0 || tgLeadInches <= 0 || availableGears.length < 2) return [];

    const targetRatio = tgLeadInches / lsLeadInches;
    const combos: GearCombination[] = [];
    const gears = availableGears;

    // 1. Test Simple Trains (2 Gears: A / B)
    for (let i = 0; i < gears.length; i++) {
      for (let j = 0; j < gears.length; j++) {
        if (i === j) continue;
        const A = gears[i];
        const B = gears[j];
        const actualRatio = A / B;
        const actualLeadInches = actualRatio * lsLeadInches;
        const actualPitchVal = targetUnit === 'tpi' ? 1 / actualLeadInches : actualLeadInches * 25.4;
        const errorPercent = Math.abs((actualRatio - targetRatio) / targetRatio) * 100;

        if (errorPercent < 5) {
          combos.push({
            type: 'simple',
            gearA: A,
            gearB: B,
            actualPitchVal,
            errorPercent
          });
        }
      }
    }

    // 2. Test Compound Trains (4 Gears: (A * C) / (B * D)) - limit search for speed
    // Only search if we need higher precision or if simple didn't give exact match
    if (gears.length <= 20) {
      for (let i = 0; i < gears.length; i++) {
        for (let j = 0; j < gears.length; j++) {
          if (i === j) continue;
          for (let k = 0; k < gears.length; k++) {
            if (k === i || k === j) continue;
            for (let l = 0; l < gears.length; l++) {
              if (l === i || l === j || l === k) continue;
              const A = gears[i];
              const B = gears[j];
              const C = gears[k];
              const D = gears[l];
              const actualRatio = (A * C) / (B * D);
              const actualLeadInches = actualRatio * lsLeadInches;
              const actualPitchVal = targetUnit === 'tpi' ? 1 / actualLeadInches : actualLeadInches * 25.4;
              const errorPercent = Math.abs((actualRatio - targetRatio) / targetRatio) * 100;

              if (errorPercent < 0.5) { // strict tolerance for compound
                combos.push({
                  type: 'compound',
                  gearA: A,
                  gearB: B,
                  gearC: C,
                  gearD: D,
                  actualPitchVal,
                  errorPercent
                });
              }
            }
          }
        }
      }
    }

    // Sort by error percent ascending, deduplicate similar tooth ratios
    combos.sort((a, b) => a.errorPercent - b.errorPercent);
    
    // Return top unique results
    const unique: GearCombination[] = [];
    const seen = new Set<string>();
    for (const c of combos) {
      const key = c.type === 'simple' ? `${c.gearA}/${c.gearB}` : `${Math.min(c.gearA, c.gearC || 0)}-${Math.max(c.gearA, c.gearC || 0)}/${Math.min(c.gearB, c.gearD || 0)}-${Math.max(c.gearB, c.gearD || 0)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(c);
      }
      if (unique.length >= maxResults) break;
    }

    return unique;
  }, [leadScrewUnit, leadScrewVal, targetUnit, targetVal, availableGears, maxResults]);

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
          Machinist Calculator #7
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Lathe Change Gear & Threading Calculator
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Calculate simple and compound gear train setups to cut metric threads on imperial lathes or custom thread pitches without a quick-change gearbox.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Card: Input Specs & Available Gear Inventory */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            ⚙️ Lathe & Thread Specification
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
            {/* Lead Screw */}
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Lathe Lead Screw Pitch
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <button
                  type="button"
                  onClick={() => setLeadScrewUnit('tpi')}
                  style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: leadScrewUnit === 'tpi' ? 'var(--accent-cyan)' : 'var(--bg-tertiary)', color: leadScrewUnit === 'tpi' ? '#000' : 'var(--text-primary)', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  TPI
                </button>
                <button
                  type="button"
                  onClick={() => setLeadScrewUnit('mm')}
                  style={{ flex: 1, padding: '4px', fontSize: '0.75rem', background: leadScrewUnit === 'mm' ? 'var(--accent-cyan)' : 'var(--bg-tertiary)', color: leadScrewUnit === 'mm' ? '#000' : 'var(--text-primary)', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                >
                  mm Lead
                </button>
              </div>
              <input
                type="number"
                value={leadScrewVal}
                onChange={(e) => setLeadScrewVal(e.target.value)}
                className="input-precision"
                placeholder={leadScrewUnit === 'tpi' ? 'e.g. 8 (TPI)' : 'e.g. 3.0 (mm)'}
              />
            </div>

            {/* Target Thread */}
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(0, 240, 255, 0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Target Thread Pitch
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(parseInt(e.target.value) || 10)}
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-cyan)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.72rem', padding: '2px 6px', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                >
                  <option value={5}>Top 5 Results</option>
                  <option value={10}>Top 10 Results</option>
                  <option value={20}>Top 20 Results</option>
                  <option value={50}>Top 50 Results</option>
                </select>
              </div>
              <input
                type="number"
                value={targetVal}
                step={targetUnit === 'tpi' ? '1' : '0.25'}
                onChange={(e) => setTargetVal(e.target.value)}
                className="input-precision"
                placeholder={targetUnit === 'tpi' ? 'e.g. 19 (TPI)' : 'e.g. 1.5 (mm)'}
              />
            </div>
          </div>

          {/* Available Change Gear Inventory */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Available Change Gears ({availableGears.length} gears)
              </label>
              <button
                type="button"
                onClick={() => setAvailableGears(DEFAULT_GEARS)}
                className="btn-secondary"
                style={{ fontSize: '0.7rem', padding: '2px 8px' }}
              >
                Reset Standard Set
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', background: 'var(--bg-primary)', padding: '15px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '15px', maxHeight: '180px', overflowY: 'auto' }}>
              {availableGears.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleToggleGear(g)}
                  title="Click to remove gear"
                  style={{
                    background: g === 127 ? 'rgba(0, 255, 128, 0.2)' : 'rgba(0, 240, 255, 0.15)',
                    border: `1px solid ${g === 127 ? '#00ff80' : 'var(--accent-cyan)'}`,
                    color: g === 127 ? '#00ff80' : 'var(--accent-cyan)',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {g}T {g === 127 ? '⭐' : '×'}
                </button>
              ))}
            </div>

            {/* Add Custom Gear Input */}
            <form onSubmit={handleAddGear} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                value={newGearInput}
                onChange={(e) => setNewGearInput(e.target.value)}
                placeholder="Add custom gear (e.g. 30)..."
                className="input-precision"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                + Add Gear
              </button>
            </form>
          </div>
        </div>

        {/* Right Card (Ordered Left): Ranked Gear Train Results */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)', order: -1 }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                GEAR TRAIN COMBINATIONS
              </span>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                Top Matches ({results.length} found)
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Target: {targetVal} {targetUnit === 'tpi' ? 'TPI' : 'mm'}
            </span>
          </div>

          {results.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '10px' }}>⚙️</span>
              No valid gear combinations found within tolerance. Try adding gears or checking your lead screw specification!
            </div>
          ) : (
            <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden', maxHeight: '480px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 1, backdropFilter: 'blur(4px)' }}>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Train Type</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>Gear Setup (Driver → Driven)</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>Generated Pitch</th>
                    <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', textAlign: 'right' }}>Error %</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: r.errorPercent === 0 ? 'rgba(0, 255, 128, 0.12)' : r.errorPercent < 0.1 ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                        fontWeight: r.errorPercent === 0 ? 700 : 400
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: r.type === 'simple' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                          color: r.type === 'simple' ? '#60a5fa' : '#c084fc',
                          border: `1px solid ${r.type === 'simple' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(168, 85, 247, 0.4)'}`
                        }}>
                          {r.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>
                        {r.type === 'simple' ? (
                          <span>Spindle <strong style={{ color: 'var(--accent-cyan)' }}>{r.gearA}T</strong> ➔ Lead Screw <strong style={{ color: '#00ff80' }}>{r.gearB}T</strong></span>
                        ) : (
                          <span>Spindle <strong style={{ color: 'var(--accent-cyan)' }}>{r.gearA}T</strong> ➔ Stud <strong style={{ color: '#f59e0b' }}>{r.gearB}T</strong> / <strong style={{ color: '#f59e0b' }}>{r.gearC}T</strong> ➔ LS <strong style={{ color: '#00ff80' }}>{r.gearD}T</strong></span>
                        )}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: r.errorPercent === 0 ? '#00ff80' : 'var(--text-primary)' }}>
                        {r.actualPitchVal.toFixed(4)} {targetUnit === 'tpi' ? 'TPI' : 'mm'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: r.errorPercent === 0 ? '#00ff80' : r.errorPercent < 0.5 ? 'var(--accent-cyan)' : '#f59e0b' }}>
                        {r.errorPercent === 0 ? 'EXACT 0.00%' : `${r.errorPercent.toFixed(3)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 127-Tooth Metric Transposing Gear Note */}
          <div style={{
            background: 'rgba(0, 255, 128, 0.08)',
            border: '1px solid rgba(0, 255, 128, 0.3)',
            padding: '14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: '#86efac',
            lineHeight: 1.5
          }}>
            <strong>⭐ Metric Transposing Secret:</strong> Because $25.4 \times 5 = 127$, any lathe equipped with a 127-tooth gear in the compound train can cut mathematically exact metric threads on an imperial lead screw with 0.0000% error!
          </div>
        </div>

      </div>
    </div>
  );
};
