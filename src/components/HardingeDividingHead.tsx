import React, { useState, useMemo } from 'react';

interface Plate {
  id: string;
  name: string;
  type: 'Standard' | 'Custom';
  holes: number[];
  desc: string;
  defaultChecked: boolean;
}

interface ExactMatch {
  plateName: string;
  plateType: 'Standard' | 'Custom';
  circleHoles: number;
  fullTurns: number;
  remainingHoles: number;
  totalHoles: number;
  score: number;
}

interface ApproxMatch {
  plateName: string;
  circleHoles: number;
  fullTurns: number;
  remainingHoles: number;
  achievedDiv: number;
  achievedDeg: number;
  errorSec: number;
}

const HARDINGE_PLATES: Plate[] = [
  { id: 'plate_0', name: 'Plate 0', type: 'Standard', holes: [20, 21, 23], desc: 'Standard Direct & Basic Indexing Plate', defaultChecked: true },
  { id: 'plate_1', name: 'Plate 1', type: 'Standard', holes: [15, 16, 17, 18, 19, 40], desc: 'Standard Hardinge High-Versatility Plate 1', defaultChecked: true },
  { id: 'plate_2', name: 'Plate 2', type: 'Standard', holes: [21, 23, 27, 29, 31, 33], desc: 'Standard Hardinge Intermediate Circle Plate 2', defaultChecked: true },
  { id: 'plate_3', name: 'Plate 3', type: 'Standard', holes: [37, 39, 41, 43, 47, 49], desc: 'Standard Hardinge Prime & Fine Division Plate 3', defaultChecked: true },
  { id: 'plate_4', name: 'Plate 4', type: 'Standard', holes: [48, 66, 70, 75, 80], desc: 'Standard Hardinge High-Count Plate 4', defaultChecked: true },
  { id: 'dream', name: 'Dream Plate', type: 'Custom', holes: [32, 50, 60], desc: 'Custom Shop / Wished-for High Division Plate', defaultChecked: false },
];

const QUICK_PICKS = [10, 12, 15, 16, 18, 20, 22, 24, 25, 30, 36, 40, 48, 50, 60, 72, 100, 120, 127];

export const HardingeDividingHead: React.FC = () => {
  const [divisionsStr, setDivisionsStr] = useState<string>('24');
  const [ratio, setRatio] = useState<number>(4);
  const [checkedPlates, setCheckedPlates] = useState<string[]>(
    HARDINGE_PLATES.filter((p) => p.defaultChecked).map((p) => p.id)
  );

  const D = useMemo(() => {
    const val = parseInt(divisionsStr, 10);
    return isNaN(val) || val < 1 ? 24 : val;
  }, [divisionsStr]);

  const handlePlateToggle = (id: string) => {
    setCheckedPlates((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setCheckedPlates(HARDINGE_PLATES.map((p) => p.id));
    } else {
      setCheckedPlates([]);
    }
  };

  const handleSelectStandardOnly = () => {
    setCheckedPlates(
      HARDINGE_PLATES.filter((p) => p.type === 'Standard').map((p) => p.id)
    );
  };

  const stepDivisions = (delta: number) => {
    const nextVal = Math.max(1, Math.min(3600, D + delta));
    setDivisionsStr(nextVal.toString());
  };

  const formatDMS = (degFloat: number): string => {
    const d = Math.floor(degFloat);
    const mFloat = (degFloat - d) * 60;
    const m = Math.floor(mFloat);
    const s = ((mFloat - m) * 60).toFixed(1);
    return `${d}° ${m.toString().padStart(2, '0')}' ${s.padStart(4, '0')}"`;
  };

  const { stepDeg, spindleTurn, exactMatches, approxMatches } = useMemo(() => {
    const sDeg = 360 / D;
    const sTurn = 1 / D;
    const exacts: ExactMatch[] = [];
    const approxs: ApproxMatch[] = [];

    HARDINGE_PLATES.forEach((plate) => {
      if (!checkedPlates.includes(plate.id)) return;

      plate.holes.forEach((H) => {
        const TExact = (ratio * H) / D;
        const TRound = Math.round(TExact);
        const isExact = Math.abs(TExact - TRound) < 1e-9;

        if (isExact) {
          const fullTurns = Math.floor(TRound / H);
          const remainingHoles = TRound % H;

          exacts.push({
            plateName: plate.name,
            plateType: plate.type,
            circleHoles: H,
            fullTurns,
            remainingHoles,
            totalHoles: TRound,
            score: (plate.type === 'Standard' ? 0 : 1000) + H + (remainingHoles === 0 ? -50 : 0),
          });
        } else {
          const actualRatioAchieved = TRound / H;
          const actualDivAchieved = ratio / actualRatioAchieved;
          const achievedDeg = 360 / actualDivAchieved;
          const errorDeg = Math.abs(achievedDeg - sDeg);
          const errorSec = errorDeg * 3600;

          const fullTurns = Math.floor(TRound / H);
          const remainingHoles = TRound % H;

          approxs.push({
            plateName: plate.name,
            circleHoles: H,
            fullTurns,
            remainingHoles,
            achievedDiv: actualDivAchieved,
            achievedDeg,
            errorSec,
          });
        }
      });
    });

    exacts.sort((a, b) => a.score - b.score);
    approxs.sort((a, b) => a.errorSec - b.errorSec);

    return {
      stepDeg: sDeg,
      spindleTurn: sTurn,
      exactMatches: exacts,
      approxMatches: approxs,
    };
  }, [D, ratio, checkedPlates]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 0' }} className="animate-fade-in">
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'rgba(0, 240, 255, 0.1)', 
          color: 'var(--accent-cyan)', 
          padding: '4px 14px', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontWeight: 700, 
          letterSpacing: '1.5px', 
          textTransform: 'uppercase', 
          border: '1px solid rgba(0, 240, 255, 0.3)',
          marginBottom: '10px'
        }}>
          Precision Indexing Lab
        </div>
        <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#fff', letterSpacing: '0.5px' }}>
          HARDINGE <span style={{ color: 'var(--accent-cyan)', fontWeight: 300 }}>// DIVIDING HEAD</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '700px', margin: '10px auto 0 auto' }}>
          Instant lookup and calculation engine for Hardinge dividing head index plates, hole circles, and crank handle turns required for cutting metric spur gears and precise angular divisions.
        </p>
      </div>

      {/* Control Panel Glass Card */}
      <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
          {/* Target Divisions */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                TARGET DIVISIONS NEEDED (D)
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gear teeth or index cuts</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => stepDivisions(-1)}
                className="btn-secondary"
                style={{ padding: '14px', fontSize: '1.2rem', width: '50px', justifyContent: 'center', fontWeight: 800 }}
                title="Decrease by 1"
              >
                −
              </button>
              <input
                type="number"
                value={divisionsStr}
                min="1"
                max="3600"
                step="1"
                onChange={(e) => setDivisionsStr(e.target.value)}
                className="input-precision"
                style={{ textAlign: 'center', fontSize: '1.4rem', fontWeight: 700 }}
              />
              <button
                onClick={() => stepDivisions(1)}
                className="btn-secondary"
                style={{ padding: '14px', fontSize: '1.2rem', width: '50px', justifyContent: 'center', fontWeight: 800 }}
                title="Increase by 1"
              >
                +
              </button>
            </div>

            {/* Quick Picks */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px', fontWeight: 600 }}>
                Quick Pick Standard Gear Counts
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_PICKS.map((val) => {
                  const isActive = D === val;
                  return (
                    <button
                      key={val}
                      onClick={() => setDivisionsStr(val.toString())}
                      style={{
                        background: isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${isActive ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                        color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                        padding: '5px 10px',
                        borderRadius: '16px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dividing Head Ratio Selector */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                DIVIDING HEAD WORM RATIO
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Worm reduction</span>
            </div>

            <select
              value={ratio}
              onChange={(e) => setRatio(parseFloat(e.target.value))}
              className="input-precision"
              style={{ width: '100%', fontSize: '1.1rem', cursor: 'pointer', background: 'var(--bg-secondary)', fontWeight: 600 }}
            >
              <option value={4}>4:1 — Hardinge Standard Index Fixture / TM/UM (Default)</option>
              <option value={40}>40:1 — Standard Universal Shop Dividing Head</option>
              <option value={60}>60:1 — Rotary Table / Optical Indexer</option>
              <option value={90}>90:1 — Precision Rotary Table</option>
              <option value={5}>5:1 — Compact Indexing Head</option>
            </select>

            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(0,0,0,0.25)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '6px' }}>
                ℹ️ Hardinge 4:1 vs Standard 40:1
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                Hardinge index fixtures and TM/UM dividing heads uniquely operate on a 4:1 ratio (4 crank turns = 1 spindle turn). Select 40:1 for conventional Brown & Sharpe or Cincinnati dividing heads.
              </p>
            </div>
          </div>
        </div>

        {/* Plate Filter Section */}
        <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              AVAILABLE SHOP PLATES & CIRCLES
            </span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleSelectAll(true)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Select All
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Deselect All
              </button>
              <button
                onClick={handleSelectStandardOnly}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Standard Hardinge Only
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '10px' }}>
            {HARDINGE_PLATES.map((plate) => {
              const isChecked = checkedPlates.includes(plate.id);
              const isCustom = plate.type === 'Custom';
              return (
                <label
                  key={plate.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: isChecked ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isChecked ? (isCustom ? 'var(--accent-gold)' : 'var(--accent-cyan)') : 'rgba(255, 255, 255, 0.08)'}`,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    color: isChecked ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handlePlateToggle(plate.id)}
                    style={{
                      appearance: 'none',
                      width: '18px',
                      height: '18px',
                      border: `2px solid ${isChecked ? (isCustom ? 'var(--accent-gold)' : 'var(--accent-cyan)') : 'var(--text-muted)'}`,
                      borderRadius: '4px',
                      background: isChecked ? (isCustom ? 'var(--accent-gold)' : 'var(--accent-cyan)') : 'transparent',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  />
                  <span>
                    {plate.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({plate.holes.length} circles)</span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Step Angle (Decimal)</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{stepDeg.toFixed(4)}°</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{spindleTurn.toFixed(4)} Spindle Turns</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Step Angle (DMS)</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{formatDMS(stepDeg)}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Degrees, Minutes, Seconds</span>
        </div>
        <div className="glass-panel" style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Exact Plate Matches</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 700, color: exactMatches.length > 0 ? '#00ff80' : 'var(--text-error)', fontFamily: 'var(--font-mono)' }}>
            {exactMatches.length} Match{exactMatches.length === 1 ? '' : 'es'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {exactMatches.length > 0 ? `Best: ${exactMatches[0].circleHoles}H (${exactMatches[0].plateName})` : 'See approximations below'}
          </span>
        </div>
      </div>

      {/* Results Display */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            🎯 Recommended Indexing Plates
          </h3>
          <span style={{
            background: exactMatches.length > 0 ? 'rgba(0, 255, 128, 0.15)' : 'rgba(255, 77, 77, 0.15)',
            color: exactMatches.length > 0 ? '#00ff80' : 'var(--text-error)',
            border: `1px solid ${exactMatches.length > 0 ? 'rgba(0, 255, 128, 0.4)' : 'rgba(255, 77, 77, 0.4)'}`,
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            {exactMatches.length} Exact Match{exactMatches.length === 1 ? '' : 'es'}
          </span>
        </div>

        {exactMatches.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {exactMatches.map((match, idx) => {
              const isRec = idx === 0;
              const moveText = match.fullTurns > 0 ?
                `${match.fullTurns} Turn${match.fullTurns > 1 ? 's' : ''} + ${match.remainingHoles} Hole${match.remainingHoles !== 1 ? 's' : ''}` :
                `${match.remainingHoles} Hole${match.remainingHoles !== 1 ? 's' : ''}`;

              return (
                <div
                  key={`${match.plateName}-${match.circleHoles}`}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    borderColor: isRec ? 'var(--accent-gold)' : undefined,
                    background: isRec ? 'linear-gradient(135deg, rgba(255, 170, 0, 0.08), rgba(25, 32, 48, 0.9))' : undefined,
                  }}
                >
                  {isRec && (
                    <div style={{
                      position: 'absolute',
                      top: 0, right: 0,
                      background: 'var(--accent-gold)',
                      color: '#000',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '4px 12px',
                      borderBottomLeftRadius: '10px',
                      letterSpacing: '0.5px'
                    }}>
                      🌟 RECOMMENDED BEST MATCH
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{match.plateName}</span>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        background: 'rgba(0, 128, 255, 0.2)',
                        color: '#66b3ff',
                        border: '1px solid rgba(0, 128, 255, 0.4)',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700
                      }}>
                        {match.circleHoles}-Hole Circle
                      </span>
                    </div>

                    <div style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: 'var(--radius-md)',
                      padding: '16px',
                      margin: '15px 0',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                        Crank Handle Indexing Move
                      </div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                        {moveText}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Total index pin movement: <strong style={{ color: '#fff' }}>{match.totalHoles} hole spaces</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: '#00ff80', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      <span style={{ width: '8px', height: '8px', background: '#00ff80', borderRadius: '50%', boxShadow: '0 0 8px #00ff80' }} />
                      Exact Integer Match
                    </span>
                    <span>Ratio: {ratio}:1</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{
              background: 'rgba(255, 77, 77, 0.08)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              borderRadius: 'var(--radius-lg)',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '30px'
            }}>
              <div style={{ color: 'var(--text-error)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '10px' }}>
                ⚠️ No Exact Integer Match Found on Selected Plates
              </div>
              <div style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 20px auto', fontSize: '0.95rem' }}>
                For <strong style={{ color: '#fff' }}>{D}</strong> divisions with a <strong style={{ color: '#fff' }}>{ratio}:1</strong> head, none of your checked plate circles divide with zero remainder. Below are the closest high-precision approximations available.
              </div>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                🔍 Closest Approximations (Top 5 Circle Options)
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '14px 18px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Plate / Circle</th>
                      <th style={{ padding: '14px 18px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Crank Movement</th>
                      <th style={{ padding: '14px 18px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Achieved Divisions</th>
                      <th style={{ padding: '14px 18px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Step Angle Achieved</th>
                      <th style={{ padding: '14px 18px', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Arcsecond Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approxMatches.slice(0, 5).map((app, i) => {
                      const moveText = app.fullTurns > 0 ?
                        `${app.fullTurns} Turn${app.fullTurns > 1 ? 's' : ''} + ${app.remainingHoles} Holes` :
                        `${app.remainingHoles} Holes`;

                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'var(--font-mono)' }}>
                          <td style={{ padding: '14px 18px', fontSize: '0.95rem' }}>
                            <strong style={{ color: '#fff' }}>{app.plateName}</strong> — {app.circleHoles}-Hole Circle
                          </td>
                          <td style={{ padding: '14px 18px', color: 'var(--accent-cyan)', fontWeight: 700 }}>{moveText}</td>
                          <td style={{ padding: '14px 18px' }}>~{app.achievedDiv.toFixed(4)} divs</td>
                          <td style={{ padding: '14px 18px' }}>{formatDMS(app.achievedDeg)}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ background: 'rgba(255, 170, 0, 0.15)', color: 'var(--accent-gold)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              ±{app.errorSec.toFixed(2)}" arcsec
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reference Chart Section */}
      <div className="glass-panel" style={{ padding: '30px', marginTop: '50px' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          📖 Hardinge Index Plate Reference Chart
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px', lineHeight: '1.6' }}>
          Standard Hardinge dividing heads and index fixtures utilize modular plates with precision-drilled hole circles. The chart below lists the complete hole counts for each standard plate specification from the metrology archives.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {HARDINGE_PLATES.map((plate) => (
            <div
              key={plate.id}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '18px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{plate.name}</span>
                {plate.type === 'Custom' && (
                  <span style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 700 }}>CUSTOM</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                {plate.desc}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {plate.holes.map((h) => (
                  <span
                    key={h}
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#fff'
                    }}
                  >
                    {h}-Hole
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
