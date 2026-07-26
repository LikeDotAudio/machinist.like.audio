import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

type ThreadSide = 'internal' | 'external';

export const ThreadMilling: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [side, setSide] = useState<ThreadSide>('internal');
  // Dimensional inputs (strings, converted on unit toggle)
  const [majorDia, setMajorDia] = useState<string>('0.5000');   // thread major Dm
  const [pitchInput, setPitchInput] = useState<string>('13');   // TPI (imperial) or pitch mm (metric)
  const [cutterDia, setCutterDia] = useState<string>('0.3125'); // thread mill Dc
  const [flutes, setFlutes] = useState<string>('3');
  const [surfSpeed, setSurfSpeed] = useState<string>('300');    // SFM or m/min
  const [chipLoad, setChipLoad] = useState<string>('0.0010');   // fz per tooth
  const [threadDepth, setThreadDepth] = useState<string>('0.7500'); // Z depth for G-code

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const dm = parseFloat(majorDia) || 0;
    const dc = parseFloat(cutterDia) || 0;
    const fz = parseFloat(chipLoad) || 0;
    const vs = parseFloat(surfSpeed) || 0;
    const dep = parseFloat(threadDepth) || 0;
    const p = parseFloat(pitchInput) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setMajorDia((dm * 25.4).toFixed(3));
      setCutterDia((dc * 25.4).toFixed(3));
      setChipLoad((fz * 25.4).toFixed(3));
      setSurfSpeed((vs * 0.3048).toFixed(0));
      setThreadDepth((dep * 25.4).toFixed(3));
      setPitchInput(p > 0 ? (25.4 / p).toFixed(3) : '0'); // TPI -> pitch mm
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setMajorDia((dm / 25.4).toFixed(4));
      setCutterDia((dc / 25.4).toFixed(4));
      setChipLoad((fz / 25.4).toFixed(4));
      setSurfSpeed((vs / 0.3048).toFixed(0));
      setThreadDepth((dep / 25.4).toFixed(4));
      setPitchInput(p > 0 ? (25.4 / p).toFixed(1) : '0'); // pitch mm -> TPI
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit]);

  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';
  const feedUnit = unit === 'imperial' ? 'IPM' : 'mm/min';
  const speedUnit = unit === 'imperial' ? 'SFM' : 'm/min';
  const fmt = (v: number) => v.toFixed(decPlaces);

  // ------------------------------------------------------------------
  // Core math
  // ------------------------------------------------------------------
  const dm = parseFloat(majorDia) || 0;
  const dc = parseFloat(cutterDia) || 0;
  const zN = Math.max(1, parseInt(flutes, 10) || 1);
  const fz = parseFloat(chipLoad) || 0;
  const vs = parseFloat(surfSpeed) || 0;
  const depth = parseFloat(threadDepth) || 0;
  const pRaw = parseFloat(pitchInput) || 0;

  // Pitch in native length units (in or mm). Imperial input is TPI.
  const pitch = unit === 'imperial' ? (pRaw > 0 ? 1 / pRaw : 0) : pRaw;

  // RPM from surface speed
  const rpm = dc > 0
    ? (unit === 'imperial' ? (vs * 12) / (Math.PI * dc) : (vs * 1000) / (Math.PI * dc))
    : 0;

  // Straight-line feed at the cutting edge (thread surface)
  const fLin = rpm * zN * fz;

  const internal = side === 'internal';
  // Interpolation (tool centerline) diameter
  const di = internal ? dm - dc : dm + dc;
  // Programmed centerline feed: F_lin x (Dm -/+ Dc)/Dm
  const fProg = dm > 0 ? fLin * (di / dm) : 0;

  // Internal thread minor diameter (ISO 60 deg form): D1 = D - 1.0825 P
  const minorDia = dm - 1.0825 * pitch;

  // Validation
  let errorMsg: string | null = null;
  let warnMsg: string | null = null;
  if (internal && dm > 0 && dc > 0) {
    if (dc >= dm) {
      errorMsg = `Cutter Ø ${fmt(dc)} ${unitStr} is at or above the thread major Ø ${fmt(dm)} ${unitStr} — the tool cannot fit inside the hole and the interpolation diameter goes to zero or negative.`;
    } else if (pitch > 0 && dc >= minorDia) {
      errorMsg = `Cutter Ø ${fmt(dc)} ${unitStr} meets or exceeds the thread minor Ø ≈ ${fmt(minorDia)} ${unitStr}. An internal thread mill must pass through the pre-drilled minor hole — choose a smaller cutter.`;
    } else if (dc > 0.9 * dm) {
      warnMsg = `Cutter Ø is over 90% of the thread major — clearance inside the minor bore is marginal.`;
    } else if (dc > 0.7 * dm) {
      warnMsg = `Cutter Ø is ${((dc / dm) * 100).toFixed(0)}% of the thread major. Keep Dc ≤ ~70% of major Ø for internal threads to avoid thread-profile distortion from the large arc-to-cutter ratio.`;
    }
  }

  const inputsValid = dm > 0 && dc > 0 && pitch > 0 && rpm > 0 && fz > 0 && di > 0;
  const gcodeValid = inputsValid && !errorMsg && depth > pitch;

  // ------------------------------------------------------------------
  // G-code generation (single bottom-up helical pass, climb)
  // ------------------------------------------------------------------
  const gcode = useMemo(() => {
    if (!gcodeValid) {
      return '(ENTER VALID INPUTS TO GENERATE G-CODE)\n(THREAD DEPTH MUST EXCEED ONE PITCH)';
    }
    const r = di / 2;
    const safeZ = unit === 'imperial' ? 0.1 : 2.0;
    const c = (v: number) => v.toFixed(decPlaces);
    const f1 = (v: number) => v.toFixed(1);
    const label = unit === 'imperial'
      ? `${c(dm)}-${pRaw} TPI`
      : `M${dm.toFixed(1)} x ${pitch.toFixed(2)}`;
    const lines: string[] = [];
    if (internal) {
      lines.push(
        `(INTERNAL THREAD MILL: ${label})`,
        `(CLIMB MILLING: G3, BOTTOM-UP, ONE PITCH PER REV)`,
        `S${Math.round(rpm)} M3`,
        `G0 X0 Y0        (CENTER OF HOLE)`,
        `G0 Z${c(safeZ)}     (SAFE PLANE)`,
        `G1 Z-${c(depth)} F${f1(fLin)}   (PLUNGE TO BOTTOM)`,
        `G1 X${c(r)} F${f1(fProg / 2)}   (LEAD-IN TO WALL)`,
        `G3 X${c(r)} Y0 I-${c(r)} J0 Z-${c(depth - pitch)} F${f1(fProg)}  (ONE FULL HELICAL PASS, CLIMB)`,
        `G1 X0 Y0 F${f1(fLin)}   (RETRACT TO CENTER)`,
        `G0 Z${c(safeZ)}`,
      );
    } else {
      const clearX = r + dc; // one cutter diameter clear of the thread
      lines.push(
        `(EXTERNAL THREAD MILL: ${label})`,
        `(CLIMB MILLING: G2, BOTTOM-UP, ONE PITCH PER REV)`,
        `S${Math.round(rpm)} M3`,
        `G0 X${c(clearX)} Y0   (CLEAR OF PART)`,
        `G0 Z${c(safeZ)}     (SAFE PLANE)`,
        `G1 Z-${c(depth)} F${f1(fLin)}   (PLUNGE TO BOTTOM)`,
        `G1 X${c(r)} F${f1(fProg / 2)}   (LEAD-IN TO THREAD)`,
        `G2 X${c(r)} Y0 I-${c(r)} J0 Z-${c(depth - pitch)} F${f1(fProg)}  (ONE FULL HELICAL PASS, CLIMB)`,
        `G1 X${c(clearX)} F${f1(fLin)}   (RETRACT CLEAR)`,
        `G0 Z${c(safeZ)}`,
      );
    }
    return lines.join('\n');
  }, [gcodeValid, di, unit, decPlaces, dm, pRaw, pitch, internal, rpm, depth, fLin, fProg, dc]);

  // ------------------------------------------------------------------
  // Top-view SVG geometry (machine coords, Y flipped for screen)
  // ------------------------------------------------------------------
  const svg = useMemo(() => {
    if (dm <= 0 || dc <= 0) return null;
    const C = 150;
    const rMaxUnits = internal ? dm / 2 : dm / 2 + dc + Math.abs(di) * 0.02;
    const scale = 112 / rMaxUnits;
    const holeR = (dm / 2) * scale;
    const cutR = (dc / 2) * scale;
    const pathR = (Math.abs(di) / 2) * scale;
    const cutCx = C + (di / 2) * scale; // cutter tangent at +X wall

    // Direction arrow on the interpolation circle. Machine coords -> screen: y flipped.
    const pt = (deg: number, r: number): [number, number] => {
      const a = (deg * Math.PI) / 180;
      return [C + r * Math.cos(a), C - r * Math.sin(a)];
    };
    const ccw = internal; // internal climb = G3 (CCW), external climb = G2 (CW)
    const a0 = ccw ? 105 : 165;
    const a1 = ccw ? 165 : 105;
    const [ax0, ay0] = pt(a0, pathR);
    const [ax1, ay1] = pt(a1, pathR);
    // CCW on screen (y-flipped) = SVG sweep flag 0
    const sweep = ccw ? 0 : 1;
    const arcPath = `M ${ax0.toFixed(1)} ${ay0.toFixed(1)} A ${pathR.toFixed(1)} ${pathR.toFixed(1)} 0 0 ${sweep} ${ax1.toFixed(1)} ${ay1.toFixed(1)}`;
    // Arrowhead: tangent at a1 (machine coords), CCW tangent = (-sin, cos), CW = (sin, -cos)
    const aRad = (a1 * Math.PI) / 180;
    const dir = ccw ? 1 : -1;
    const tx = -Math.sin(aRad) * dir;
    const ty = Math.cos(aRad) * dir;
    const nx = -ty;
    const ny = tx;
    // screen coords (flip y of machine vectors)
    const sTx = tx, sTy = -ty, sNx = nx, sNy = -ny;
    const ah = 11, aw = 4.5;
    const tip = `${(ax1 + sTx * ah).toFixed(1)},${(ay1 + sTy * ah).toFixed(1)}`;
    const b1 = `${(ax1 + sNx * aw).toFixed(1)},${(ay1 + sNy * aw).toFixed(1)}`;
    const b2 = `${(ax1 - sNx * aw).toFixed(1)},${(ay1 - sNy * aw).toFixed(1)}`;
    return { C, holeR, cutR, pathR, cutCx, arcPath, arrow: `${tip} ${b1} ${b2}` };
  }, [dm, dc, di, internal]);

  const resultRow = (label: string, value: string, accent?: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: accent ?? 'var(--text-primary)' }}>{value}</span>
    </div>
  );

  const numInput = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    suffix: string,
    step: string,
  ) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type="number"
          value={value}
          step={step}
          min="0"
          onChange={(e) => onChange(e.target.value)}
          className="input-precision"
        />
        <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.82rem' }}>
          {suffix}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🌀 Thread Milling <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Helical Interpolation Feeds & G-Code</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            <strong style={{ color: '#fff' }}>{inputsValid ? Math.round(rpm) : '—'}</strong> RPM
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(244, 144, 44, 0.12)', border: '1px solid rgba(244, 144, 44, 0.35)', fontSize: '0.78rem', color: '#f4902c', fontFamily: 'var(--font-mono)' }}>
            <strong>{inputsValid ? fProg.toFixed(1) : '—'}</strong> {feedUnit} prog.
          </div>
        </div>
      </div>

      {/* Validation banners */}
      {errorMsg && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.45)', color: '#ef4444', fontSize: '0.85rem', lineHeight: 1.5 }}>
          <strong style={{ letterSpacing: '1px' }}>⛔ ERROR — </strong>{errorMsg}
        </div>
      )}
      {!errorMsg && warnMsg && (
        <div style={{ marginBottom: '16px', padding: '12px 16px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.45)', color: '#f59e0b', fontSize: '0.85rem', lineHeight: 1.5 }}>
          <strong style={{ letterSpacing: '1px' }}>⚠ WARNING — </strong>{warnMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Inputs Card */}
        <div className="glass-panel" style={{ padding: '25px' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🛠️ Thread & Cutter Parameters</h3>
          </div>

          {/* Internal / External toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg-primary)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
            {(['internal', 'external'] as ThreadSide[]).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                style={{
                  padding: '11px',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  background: side === s ? 'var(--accent-cyan)' : 'transparent',
                  color: side === s ? '#000' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {s === 'internal' ? '⊙ Internal (Bore)' : '◎ External (Boss)'}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '0 0 20px', lineHeight: 1.5 }}>
            Climb milling, right-hand thread: <strong style={{ color: '#38bdf8' }}>internal = G3 bottom-up</strong> ·{' '}
            <strong style={{ color: '#38bdf8' }}>external = G2 bottom-up</strong>. Z rises one pitch per 360° pass.
          </p>

          {numInput('Thread Major Ø (Dm)', majorDia, setMajorDia, unitStr, unit === 'imperial' ? '0.0625' : '1')}
          {numInput(
            unit === 'imperial' ? 'Threads Per Inch (TPI)' : 'Thread Pitch (P)',
            pitchInput, setPitchInput,
            unit === 'imperial' ? 'TPI' : 'mm',
            unit === 'imperial' ? '1' : '0.25',
          )}
          {numInput('Thread Mill Cutter Ø (Dc)', cutterDia, setCutterDia, unitStr, unit === 'imperial' ? '0.0625' : '0.5')}
          {numInput('Number of Flutes (z)', flutes, setFlutes, 'teeth', '1')}
          {numInput(`Surface Speed (${speedUnit})`, surfSpeed, setSurfSpeed, speedUnit, unit === 'imperial' ? '10' : '5')}
          {numInput('Chip Load per Tooth (fz)', chipLoad, setChipLoad, unitStr, unit === 'imperial' ? '0.0005' : '0.005')}
          {numInput('Thread Depth (for G-code)', threadDepth, setThreadDepth, unitStr, unit === 'imperial' ? '0.05' : '1')}
        </div>

        {/* Results Card */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {internal ? 'INTERNAL' : 'EXTERNAL'} THREAD MILLING RESULT
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>Speeds, Feeds & Interpolation</h3>
          </div>

          {/* Big programmed feed */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--accent-cyan)',
            textAlign: 'center',
            boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)',
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              PROGRAMMED CENTERLINE FEED (F_prog) — USE THIS IN THE PROGRAM
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.6rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
              {inputsValid ? fProg.toFixed(unit === 'imperial' ? 2 : 1) : '—'}
            </div>
            <span style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>{feedUnit}</span>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              F_prog = F_lin × (Dm {internal ? '−' : '+'} Dc) / Dm {internal ? '(reduced — smaller centerline circle)' : '(increased — larger centerline circle)'}
            </div>
          </div>

          {/* Top-view SVG diagram */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '14px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '10px', left: '14px', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              TOP VIEW — HELICAL INTERPOLATION PATH
            </div>
            {svg ? (
              <svg viewBox="0 0 300 300" style={{ width: '100%', maxWidth: '320px', height: 'auto', display: 'block', margin: '0 auto' }}>
                {/* Stock / hole */}
                {internal ? (
                  <>
                    <rect x="8" y="8" width="284" height="284" rx="6" fill="rgba(71, 85, 105, 0.35)" stroke="#475569" strokeWidth="1" />
                    <circle cx={svg.C} cy={svg.C} r={svg.holeR} fill="#0b1220" stroke="#94a3b8" strokeWidth="1.5" />
                  </>
                ) : (
                  <circle cx={svg.C} cy={svg.C} r={svg.holeR} fill="rgba(71, 85, 105, 0.45)" stroke="#94a3b8" strokeWidth="1.5" />
                )}
                {/* Interpolation (centerline) circle */}
                <circle cx={svg.C} cy={svg.C} r={svg.pathR} fill="none" stroke="#f4902c" strokeWidth="1.4" strokeDasharray="6 4" />
                {/* Direction arc + arrowhead */}
                <path d={svg.arcPath} fill="none" stroke="#00ff80" strokeWidth="2" />
                <polygon points={svg.arrow} fill="#00ff80" />
                {/* Cutter */}
                <circle cx={svg.cutCx} cy={svg.C} r={svg.cutR} fill="rgba(56, 189, 248, 0.18)" stroke="#38bdf8" strokeWidth="1.6" />
                <circle cx={svg.cutCx} cy={svg.C} r="2.4" fill="#38bdf8" />
                {/* Center crosshair */}
                <line x1={svg.C - 8} y1={svg.C} x2={svg.C + 8} y2={svg.C} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
                <line x1={svg.C} y1={svg.C - 8} x2={svg.C} y2={svg.C + 8} stroke="rgba(255,255,255,0.45)" strokeWidth="0.8" />
                {/* Labels */}
                <text x={svg.C} y={svg.C - svg.holeR - 6} fill="#94a3b8" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                  Dm {fmt(dm)}
                </text>
                <text x={svg.C - svg.pathR - 4} y={svg.C + 14} fill="#f4902c" fontSize="10" fontWeight="700" textAnchor="end" fontFamily="var(--font-mono)">
                  Di {fmt(di)}
                </text>
                <text x={svg.cutCx} y={svg.C + svg.cutR + 13} fill="#38bdf8" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                  Dc {fmt(dc)}
                </text>
                <text x="150" y="292" fill="#00ff80" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                  {internal ? 'G3 (CCW) CLIMB' : 'G2 (CW) CLIMB'} · Z +{pitch > 0 ? fmt(pitch) : '—'} {unitStr}/REV
                </text>
              </svg>
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Enter thread and cutter diameters to draw the path.
              </div>
            )}
          </div>

          {/* Numeric results */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
            {resultRow('Spindle Speed (RPM)', inputsValid ? `${Math.round(rpm)} RPM` : '—')}
            {resultRow(`Linear Feed at Thread (F_lin)`, inputsValid ? `${fLin.toFixed(unit === 'imperial' ? 2 : 1)} ${feedUnit}` : '—', '#38bdf8')}
            {resultRow('Programmed Feed (F_prog)', inputsValid ? `${fProg.toFixed(unit === 'imperial' ? 2 : 1)} ${feedUnit}` : '—', '#f4902c')}
            {resultRow(`Interpolation Ø (Di = Dm ${internal ? '−' : '+'} Dc)`, inputsValid ? `${fmt(di)} ${unitStr}` : '—')}
            {resultRow('Arc Radius (Di / 2)', inputsValid ? `${fmt(di / 2)} ${unitStr}` : '—')}
            {resultRow('Z Advance per Rev (= Pitch)', pitch > 0 ? `${fmt(pitch)} ${unitStr}` : '—', '#00ff80')}
            {internal && pitch > 0 && dm > 0 && resultRow('Thread Minor Ø (≈ Dm − 1.0825·P)', `${fmt(minorDia)} ${unitStr}`, '#c084fc')}
          </div>
        </div>

        {/* G-code Card */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>📟 G-Code Snippet</h3>
            <span style={{ fontSize: '0.7rem', color: '#00ff80', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' }}>
              {internal ? 'G3 · CLIMB · BOTTOM-UP' : 'G2 · CLIMB · BOTTOM-UP'}
            </span>
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
            lineHeight: 1.7,
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 18px',
            color: 'var(--text-primary)',
            margin: 0,
            overflowX: 'auto',
            whiteSpace: 'pre',
            userSelect: 'text',
          }}>
            {gcode}
          </pre>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
            Single finishing pass, XY = hole/boss center at X0 Y0. The full 360° arc carries Z upward exactly one pitch
            ({pitch > 0 ? `${fmt(pitch)} ${unitStr}` : '—'}) so the thread lead is generated by the helix itself.
            Lead-in runs at half the programmed feed. For deeper threads, repeat the helical pass with Z shifted up one
            pitch per revolution or use a multi-tooth full-form thread mill.
          </p>
        </div>
      </div>

      {/* Footer description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          THREAD MILLING // HELICAL INTERPOLATION FEED CORRECTION & G-CODE GENERATOR
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Thread mills cut on an arc, so the feed rate a CNC executes at the tool <em>centerline</em> is not the feed the
          cutting edge sees at the thread surface. Speeds are conventional — RPM = (SFM × 12)/(π × Dc) imperial or
          (m/min × 1000)/(π × Dc) metric, and straight-line feed F_lin = RPM × z × fz — but because an internal cutter's
          centerline travels a smaller circle of diameter Di = Dm − Dc than the thread it produces, the programmed feed must
          be <strong style={{ color: '#f4902c' }}>reduced</strong> by the ratio (Dm − Dc)/Dm; externally the centerline
          circle Di = Dm + Dc is larger, so feed is <strong style={{ color: '#f4902c' }}>increased</strong> by
          (Dm + Dc)/Dm. Programming F_lin directly on an internal thread overfeeds the cutting edge and typically breaks
          the tool. The helix follows the one-pitch-per-rev rule: each full 360° circular move advances Z by exactly one
          thread pitch, so the arc command carries a Z word of one pitch. Climb milling a right-hand thread means G3
          bottom-up for internal threads and G2 bottom-up for external. Internal cutters must pass through the minor
          bore (Dc &lt; minor Ø) and are best kept at or below ~70% of the thread major diameter to limit thread-profile
          distortion from arc curvature.
        </p>
      </div>
    </div>
  );
};

export default ThreadMilling;
