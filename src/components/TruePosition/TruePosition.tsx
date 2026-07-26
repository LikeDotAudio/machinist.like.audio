import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

type EntryMode = 'deviations' | 'nominalActual';
type FeatureType = 'hole' | 'pin';

export const TruePosition: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [entryMode, setEntryMode] = useState<EntryMode>('deviations');

  // Direct deviation entry
  const [devX, setDevX] = useState<string>('0.0020');
  const [devY, setDevY] = useState<string>('0.0030');

  // Nominal vs Actual entry
  const [nomX, setNomX] = useState<string>('1.0000');
  const [actX, setActX] = useState<string>('1.0020');
  const [nomY, setNomY] = useState<string>('1.0000');
  const [actY, setActY] = useState<string>('1.0030');

  // Position tolerance (diameter zone)
  const [tolT, setTolT] = useState<string>('0.0100');

  // MMC bonus
  const [mmcOn, setMmcOn] = useState<boolean>(false);
  const [featureType, setFeatureType] = useState<FeatureType>('hole');
  const [mmcSize, setMmcSize] = useState<string>('0.2500');
  const [actualSize, setActualSize] = useState<string>('0.2520');

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const conv = (v: string): string => {
      const n = parseFloat(v) || 0;
      return unit === 'metric' && oldUnit === 'imperial'
        ? (n * 25.4).toFixed(3)
        : (n / 25.4).toFixed(4);
    };
    setDevX(conv(devX));
    setDevY(conv(devY));
    setNomX(conv(nomX));
    setActX(conv(actX));
    setNomY(conv(nomY));
    setActY(conv(actY));
    setTolT(conv(tolT));
    setMmcSize(conv(mmcSize));
    setActualSize(conv(actualSize));
  }, [unit, devX, devY, nomX, actX, nomY, actY, tolT, mmcSize, actualSize]);

  const unitStr = unit === 'imperial' ? 'in' : 'mm';
  const dec = unit === 'imperial' ? 4 : 3;
  const step = unit === 'imperial' ? '0.0001' : '0.001';

  // Resolve deviations
  const dx = entryMode === 'deviations'
    ? (parseFloat(devX) || 0)
    : (parseFloat(actX) || 0) - (parseFloat(nomX) || 0);
  const dy = entryMode === 'deviations'
    ? (parseFloat(devY) || 0)
    : (parseFloat(actY) || 0) - (parseFloat(nomY) || 0);

  const T = parseFloat(tolT) || 0;

  // MMC bonus tolerance
  const mmc = parseFloat(mmcSize) || 0;
  const actSize = parseFloat(actualSize) || 0;
  const bonusRaw = featureType === 'hole' ? actSize - mmc : mmc - actSize;
  const beyondMmc = mmcOn && bonusRaw < 0;
  const bonus = mmcOn ? Math.max(0, bonusRaw) : 0;

  // True position
  const radial = Math.sqrt(dx * dx + dy * dy);
  const tp = 2 * radial;
  const totalAllow = T + bonus;
  const margin = totalAllow - tp;
  const pass = tp <= totalAllow;
  const pctUsed = totalAllow > 0 ? (tp / totalAllow) * 100 : (tp > 0 ? Infinity : 0);

  // ---- SVG diagram geometry (auto-scaled) ----
  const svgW = 480, svgH = 340;
  const cx = svgW / 2, cy = svgH / 2;
  const maxPx = 120; // max radius in px
  const maxReal = Math.max(totalAllow / 2, radial, 1e-9);
  const pxScale = maxPx / maxReal;
  const zoneR = Math.max((T / 2) * pxScale, 1);
  const bonusR = Math.max((totalAllow / 2) * pxScale, 1);
  const dotX = cx + dx * pxScale;
  const dotY = cy - dy * pxScale; // +Y up
  const dotColor = pass ? '#00ff80' : '#ef4444';

  const fmt = (v: number) => v.toFixed(dec);

  const inputWrap = (
    value: string,
    onChange: (v: string) => void,
    suffix: string = unitStr
  ) => (
    <div style={{ position: 'relative' }}>
      <input
        type="number"
        value={value}
        step={step}
        onChange={(e) => onChange(e.target.value)}
        className="input-precision"
        style={{ width: '100%' }}
      />
      <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem' }}>
        {suffix}
      </span>
    </div>
  );

  const fieldLabel = (text: string) => (
    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {text}
    </label>
  );

  const resultRow = (label: string, value: string, color: string = '#fff') => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, fontSize: '0.95rem' }}>{value}</span>
    </div>
  );

  const modeBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 12px',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    background: active ? 'var(--accent-cyan)' : 'transparent',
    color: active ? '#000' : 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.82rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🎯 True Position <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// GD&T Positional Tolerance</span>
        </h2>
        <div style={{
          padding: '4px 12px',
          borderRadius: '8px',
          background: pass ? 'rgba(0, 255, 128, 0.1)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${pass ? 'rgba(0, 255, 128, 0.35)' : 'rgba(239, 68, 68, 0.4)'}`,
          fontSize: '0.78rem',
          color: pass ? '#00ff80' : '#ef4444',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          TP {fmt(tp)} / {fmt(totalAllow)} {unitStr} — {pass ? 'PASS' : 'FAIL'}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Inputs Card */}
        <div className="glass-panel" style={{ padding: '25px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📏 Measured Feature</h3>
          </div>

          {/* Entry mode toggle */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-primary)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <button onClick={() => setEntryMode('deviations')} style={modeBtnStyle(entryMode === 'deviations')}>
              Deviations (ΔX, ΔY)
            </button>
            <button onClick={() => setEntryMode('nominalActual')} style={modeBtnStyle(entryMode === 'nominalActual')}>
              Nominal vs Actual
            </button>
          </div>

          {entryMode === 'deviations' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '22px' }}>
              <div>
                {fieldLabel('Deviation ΔX')}
                {inputWrap(devX, setDevX)}
              </div>
              <div>
                {fieldLabel('Deviation ΔY')}
                {inputWrap(devY, setDevY)}
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
              <div>
                {fieldLabel('Nominal X')}
                {inputWrap(nomX, setNomX)}
              </div>
              <div>
                {fieldLabel('Actual X')}
                {inputWrap(actX, setActX)}
              </div>
              <div>
                {fieldLabel('Nominal Y')}
                {inputWrap(nomY, setNomY)}
              </div>
              <div>
                {fieldLabel('Actual Y')}
                {inputWrap(actY, setActY)}
              </div>
              <div style={{ gridColumn: '1 / -1', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px' }}>
                ΔX = <span style={{ color: '#f4902c', fontWeight: 700 }}>{fmt(dx)}</span> {unitStr} · ΔY = <span style={{ color: '#f4902c', fontWeight: 700 }}>{fmt(dy)}</span> {unitStr}
              </div>
            </div>
          )}

          {/* Tolerance callout */}
          <div style={{ marginBottom: '22px' }}>
            {fieldLabel(`Position Tolerance ⌀ Zone (T)`)}
            {inputWrap(tolT, setTolT)}
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '6px 0 0', lineHeight: 1.5 }}>
              The diameter of the cylindrical tolerance zone from the feature control frame, e.g. ⌀{unit === 'imperial' ? '0.010' : '0.25'}.
            </p>
          </div>

          {/* MMC section */}
          <div style={{
            background: mmcOn ? 'rgba(56, 189, 248, 0.06)' : 'var(--bg-primary)',
            border: `1px solid ${mmcOn ? 'rgba(56, 189, 248, 0.35)' : 'var(--border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            transition: 'all 0.2s ease'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', color: mmcOn ? '#38bdf8' : 'var(--text-secondary)' }}>
              <input type="checkbox" checked={mmcOn} onChange={(e) => setMmcOn(e.target.checked)} />
              Apply MMC Bonus Ⓜ
            </label>

            {mmcOn && (
              <div style={{ marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', fontSize: '0.84rem' }}>
                  <label style={{ cursor: 'pointer', color: featureType === 'hole' ? '#38bdf8' : 'var(--text-muted)', fontWeight: 600 }}>
                    <input type="radio" checked={featureType === 'hole'} onChange={() => setFeatureType('hole')} style={{ marginRight: '6px' }} />
                    Hole (internal)
                  </label>
                  <label style={{ cursor: 'pointer', color: featureType === 'pin' ? '#38bdf8' : 'var(--text-muted)', fontWeight: 600 }}>
                    <input type="radio" checked={featureType === 'pin'} onChange={() => setFeatureType('pin')} style={{ marginRight: '6px' }} />
                    Pin (external)
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    {fieldLabel(`MMC Size ${featureType === 'hole' ? '(smallest hole)' : '(largest pin)'}`)}
                    {inputWrap(mmcSize, setMmcSize)}
                  </div>
                  <div>
                    {fieldLabel('Actual Feature Size')}
                    {inputWrap(actualSize, setActualSize)}
                  </div>
                </div>

                <div style={{ marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '8px 12px', borderRadius: '6px' }}>
                  Bonus = {featureType === 'hole' ? 'actual − MMC' : 'MMC − actual'} ={' '}
                  <span style={{ color: bonusRaw < 0 ? '#ef4444' : '#38bdf8', fontWeight: 700 }}>{fmt(bonusRaw)}</span> {unitStr}
                  {bonusRaw < 0 && <span style={{ color: '#ef4444' }}> → clamped to 0</span>}
                </div>

                {beyondMmc && (
                  <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.5 }}>
                    ⚠ Feature size is beyond MMC — the {featureType} violates its size limit. No bonus is available and the part is nonconforming on size regardless of position.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              POSITIONAL DEVIATION RESULT
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>
              Actual True Position
            </h3>
          </div>

          {/* Big TP value */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              TP = 2 × √(ΔX² + ΔY²)
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              ⌀{fmt(tp)}
            </div>
            <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{unitStr}</span>
          </div>

          {/* PASS / FAIL banner */}
          <div style={{
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            background: pass ? 'rgba(0, 255, 128, 0.12)' : 'rgba(239, 68, 68, 0.15)',
            border: `2px solid ${pass ? 'rgba(0, 255, 128, 0.5)' : 'rgba(239, 68, 68, 0.6)'}`
          }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '3px', color: pass ? '#00ff80' : '#ef4444', fontFamily: 'var(--font-mono)' }}>
              {pass ? '✓ PASS' : '✗ FAIL'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {pass
                ? `Within the ⌀${fmt(totalAllow)} ${unitStr} allowable zone — ${isFinite(pctUsed) ? pctUsed.toFixed(1) : '—'}% of tolerance used`
                : `Exceeds the ⌀${fmt(totalAllow)} ${unitStr} allowable zone by ${fmt(tp - totalAllow)} ${unitStr}`}
            </div>
          </div>

          {/* Breakdown rows */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
            {resultRow('Radial Deviation √(ΔX²+ΔY²)', `${fmt(radial)} ${unitStr}`)}
            {resultRow('Stated Tolerance ⌀ (T)', `${fmt(T)} ${unitStr}`, '#f59e0b')}
            {resultRow('MMC Bonus Tolerance', mmcOn ? `+${fmt(bonus)} ${unitStr}` : '— (off)', mmcOn ? '#38bdf8' : 'var(--text-muted)')}
            {resultRow('Total Allowable ⌀', `${fmt(totalAllow)} ${unitStr}`, '#f4902c')}
            {resultRow('Remaining Margin', `${fmt(margin)} ${unitStr}`, margin >= 0 ? '#00ff80' : '#ef4444')}
            {resultRow('% of Tolerance Used', isFinite(pctUsed) ? `${pctUsed.toFixed(1)} %` : '∞', pctUsed <= 100 ? '#00ff80' : '#ef4444')}
          </div>

          {/* SVG tolerance zone diagram */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '12px 8px 6px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', left: '14px', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TOLERANCE ZONE — TOP VIEW
            </div>
            <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', marginTop: '10px' }}>
              {/* Nominal crosshair */}
              <line x1={cx - 140} y1={cy} x2={cx + 140} y2={cy} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="10 4 2 4" />
              <line x1={cx} y1={cy - 140} x2={cx} y2={cy + 140} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="10 4 2 4" />

              {/* Bonus (total allowable) zone when MMC on */}
              {mmcOn && bonus > 0 && (
                <>
                  <circle cx={cx} cy={cy} r={bonusR} fill="rgba(56, 189, 248, 0.05)" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="6 5" />
                  <text x={cx + bonusR * 0.72} y={cy - bonusR * 0.72 - 6} fill="#38bdf8" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                    ⌀{fmt(totalAllow)} (T+bonus)
                  </text>
                </>
              )}

              {/* Stated tolerance zone */}
              <circle cx={cx} cy={cy} r={zoneR} fill="rgba(244, 144, 44, 0.08)" stroke="#f4902c" strokeWidth="1.5" />
              <text x={cx + zoneR * 0.72 + 4} y={cy + zoneR * 0.72 + 14} fill="#f4902c" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                ⌀{fmt(T)} zone
              </text>

              {/* Deviation vector */}
              {radial > 0 && (
                <line x1={cx} y1={cy} x2={dotX} y2={dotY} stroke={dotColor} strokeWidth="1.2" strokeDasharray="4 3" opacity="0.7" />
              )}

              {/* Actual position dot */}
              <circle cx={dotX} cy={dotY} r="6" fill={dotColor} stroke="#fff" strokeWidth="1.5" />
              <text x={dotX + 10} y={dotY - 8} fill={dotColor} fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                ACTUAL ({fmt(dx)}, {fmt(dy)})
              </text>

              {/* Nominal label */}
              <text x={cx + 6} y={cy + 152} fill="var(--text-muted, #94a3b8)" fontSize="9" fontFamily="var(--font-mono)">
                NOMINAL (0, 0)
              </text>
            </svg>
          </div>
        </div>
      </div>

      {/* Footer description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          TRUE POSITION (GD&T) // POSITIONAL DEVIATION, MMC BONUS & PASS/FAIL VERDICT
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Computes the actual positional deviation of a hole or pin from its measured X/Y deviations using{' '}
          <strong style={{ color: '#f4902c' }}>TP = 2 × √(ΔX² + ΔY²)</strong> — the radial error is doubled because a
          position callout defines a cylindrical <em>diameter</em> zone centered on true (nominal) position, per ASME Y14.5.
          When the feature control frame carries the <strong style={{ color: '#38bdf8' }}>Ⓜ (MMC) modifier</strong>, bonus
          tolerance becomes available as the feature departs from its Maximum Material Condition: a hole at MMC is its
          smallest (bonus = actual − MMC), a pin at MMC is its largest (bonus = MMC − actual). The total allowable zone is
          the stated tolerance plus any bonus; the feature passes when its true position diameter fits inside that zone.
          A feature measuring beyond MMC gets no bonus — it is nonconforming on size before position is even considered.
        </p>
      </div>
    </div>
  );
};

export default TruePosition;
