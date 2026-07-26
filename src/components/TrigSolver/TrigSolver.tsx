import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Right Triangle / Trigonometry Solver
// Convention: right angle at C. Side a = opposite leg (rise), side b =
// adjacent leg (run), side c = hypotenuse. Angle A opposite side a, angle B
// opposite side b, A + B = 90°. Give any two independent values → solve all.
// ---------------------------------------------------------------------------

type FieldKey = 'a' | 'b' | 'c' | 'A';
type PairId = 'ab' | 'ac' | 'bc' | 'aA' | 'bA' | 'cA';

interface PairDef {
  id: PairId;
  label: string;
  fields: [FieldKey, FieldKey];
}

const PAIRS: PairDef[] = [
  { id: 'ab', label: 'a & b', fields: ['a', 'b'] },
  { id: 'ac', label: 'a & c', fields: ['a', 'c'] },
  { id: 'bc', label: 'b & c', fields: ['b', 'c'] },
  { id: 'aA', label: 'a & ∠A', fields: ['a', 'A'] },
  { id: 'bA', label: 'b & ∠A', fields: ['b', 'A'] },
  { id: 'cA', label: 'c & ∠A', fields: ['c', 'A'] },
];

const FIELD_META: Record<FieldKey, { label: string; color: string }> = {
  a: { label: 'Side a — Opposite Leg (Rise)', color: '#38bdf8' },
  b: { label: 'Side b — Adjacent Leg (Run)', color: '#00ff80' },
  c: { label: 'Side c — Hypotenuse', color: '#f4902c' },
  A: { label: 'Angle A (Decimal Degrees)', color: '#f59e0b' },
};

interface Solved {
  a: number;
  b: number;
  c: number;
  A: number; // decimal degrees
}

type SolveResult = { ok: true; r: Solved } | { ok: false; msg: string };

const DEG = 180 / Math.PI;

const solveTriangle = (pair: PairId, a: number, b: number, c: number, A: number): SolveResult => {
  const needsAngle = pair === 'aA' || pair === 'bA' || pair === 'cA';
  const sides: Partial<Record<FieldKey, number>> = { a, b, c };
  const def = PAIRS.find(p => p.id === pair)!;
  for (const f of def.fields) {
    const v = f === 'A' ? A : sides[f]!;
    if (!isFinite(v) || (f !== 'A' && v <= 0)) {
      return { ok: false, msg: `Enter a positive value for ${f === 'A' ? 'angle A' : `side ${f}`}.` };
    }
  }
  if (needsAngle && (A <= 0 || A >= 90)) {
    return { ok: false, msg: 'Angle A must be between 0° and 90° (exclusive) — the right angle is already at C.' };
  }

  switch (pair) {
    case 'ab':
      return { ok: true, r: { a, b, c: Math.hypot(a, b), A: Math.atan(a / b) * DEG } };
    case 'ac':
      if (a >= c) return { ok: false, msg: 'Invalid triangle: leg a must be shorter than hypotenuse c.' };
      return { ok: true, r: { a, b: Math.sqrt(c * c - a * a), c, A: Math.asin(a / c) * DEG } };
    case 'bc':
      if (b >= c) return { ok: false, msg: 'Invalid triangle: leg b must be shorter than hypotenuse c.' };
      return { ok: true, r: { a: Math.sqrt(c * c - b * b), b, c, A: Math.acos(b / c) * DEG } };
    case 'aA': {
      const rad = A / DEG;
      return { ok: true, r: { a, b: a / Math.tan(rad), c: a / Math.sin(rad), A } };
    }
    case 'bA': {
      const rad = A / DEG;
      return { ok: true, r: { a: b * Math.tan(rad), b, c: b / Math.cos(rad), A } };
    }
    case 'cA': {
      const rad = A / DEG;
      return { ok: true, r: { a: c * Math.sin(rad), b: c * Math.cos(rad), c, A } };
    }
  }
};

const toDMS = (deg: number): string => {
  const d = Math.floor(deg);
  const mF = (deg - d) * 60;
  const m = Math.floor(mF);
  const s = (mF - m) * 60;
  return `${d}° ${m}' ${s.toFixed(1)}"`;
};

export const TrigSolver: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);

  const [pair, setPair] = useState<PairId>('ab');
  const [sideA, setSideA] = useState<string>('3.0000');
  const [sideB, setSideB] = useState<string>('4.0000');
  const [sideC, setSideC] = useState<string>('5.0000');
  const [angleA, setAngleA] = useState<string>('30.0000');

  // Convert side-length inputs when the global unit toggles
  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const conv = (s: string): string => {
      const v = parseFloat(s) || 0;
      return unit === 'metric' && oldUnit === 'imperial'
        ? (v * 25.4).toFixed(3)
        : (v / 25.4).toFixed(4);
    };
    setSideA(prev => conv(prev));
    setSideB(prev => conv(prev));
    setSideC(prev => conv(prev));
  }, [unit]);

  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';

  const solved = solveTriangle(
    pair,
    parseFloat(sideA),
    parseFloat(sideB),
    parseFloat(sideC),
    parseFloat(angleA)
  );

  const r = solved.ok ? solved.r : null;
  const angleB = r ? 90 - r.A : 0;
  const area = r ? (r.a * r.b) / 2 : 0;
  const perimeter = r ? r.a + r.b + r.c : 0;

  const activePair = PAIRS.find(p => p.id === pair)!;

  const fieldState: Record<FieldKey, [string, (v: string) => void]> = {
    a: [sideA, setSideA],
    b: [sideB, setSideB],
    c: [sideC, setSideC],
    A: [angleA, setAngleA],
  };

  // --- SVG geometry: right triangle at the live aspect ratio, clamped ---
  const svg = (() => {
    const W = 470, H = 300;
    const maxW = 280, maxH = 185;
    const baseY = 250;
    const ratioRaw = r ? r.a / r.b : 3 / 4;
    const ratio = Math.min(3, Math.max(0.3, isFinite(ratioRaw) ? ratioRaw : 0.75));
    let w = maxW;
    let h = w * ratio;
    if (h > maxH) {
      h = maxH;
      w = h / ratio;
    }
    const ax = (W - w) / 2 - 20; // vertex A (bottom-left)
    const ay = baseY;
    const cx = ax + w; // vertex C (bottom-right, right angle)
    const bx = cx; // vertex B (top-right)
    const by = ay - h;
    const hyp = Math.hypot(w, h);
    const theta = Math.atan(h / w); // drawn angle A in radians

    // Angle A arc (from horizontal edge up to hypotenuse)
    const rA = Math.min(34, w * 0.45, hyp * 0.45);
    const arcA = `M ${ax + rA} ${ay} A ${rA} ${rA} 0 0 0 ${(ax + rA * Math.cos(theta)).toFixed(2)} ${(ay - rA * Math.sin(theta)).toFixed(2)}`;
    const labA = {
      x: ax + (rA + 22) * Math.cos(theta / 2),
      y: ay - (rA + 22) * Math.sin(theta / 2) + 4,
    };

    // Angle B arc (from vertical edge down toward hypotenuse)
    const rB = Math.min(30, h * 0.45, hyp * 0.45);
    const dirHx = -w / hyp, dirHy = h / hyp; // unit vector B → A
    const arcB = `M ${bx} ${by + rB} A ${rB} ${rB} 0 0 1 ${(bx + rB * dirHx).toFixed(2)} ${(by + rB * dirHy).toFixed(2)}`;
    // Bisector between straight-down (0,1) and B→A direction
    let bisX = dirHx + 0, bisY = dirHy + 1;
    const bisLen = Math.hypot(bisX, bisY) || 1;
    bisX /= bisLen; bisY /= bisLen;
    const labB = { x: bx + (rB + 24) * bisX, y: by + (rB + 24) * bisY + 4 };

    // Hypotenuse label offset (perpendicular, up-left of the midpoint)
    const midX = (ax + bx) / 2, midY = (ay + by) / 2;
    const labC = { x: midX - 16 * (h / hyp), y: midY - 16 * (w / hyp) };

    const sq = Math.min(13, w * 0.35, h * 0.35); // right-angle square size
    return { W, H, ax, ay, bx, by, cx, w, h, arcA, arcB, labA, labB, labC, sq };
  })();

  const fmtSide = (v: number) => `${v.toFixed(decPlaces)}`;

  const resultRow = (label: string, value: string, sub: string | null, color: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
        <strong style={{ color, fontSize: '1.02rem' }}>{value}</strong>
        {sub && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{sub}</span>}
      </span>
    </div>
  );

  const monoLabel = { fontFamily: 'var(--font-mono)', fontWeight: 700 } as const;

  const uses = [
    { title: 'CHAMFER DEPTH', formula: 'depth = width × tan(angle)', note: 'Known chamfer width at a set tool angle → depth of cut.' },
    { title: 'EDGE BREAK @ 45°', formula: 'leg = 0.7071 × face width', note: 'At 45° both legs are equal; hypotenuse face = leg × 1.4142.' },
    { title: 'DOVETAIL PINS', formula: 'M = D + P·(1 + cot(½θ))', note: 'Measure over precision pins P at dovetail half-angle ½θ.' },
  ];

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          📐 Trig Solver <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Right Triangle Calculator</span>
        </h2>
        <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          A + B = 90° · right angle at C
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '25px', alignItems: 'start' }}>

        {/* Inputs Card */}
        <div className="glass-panel" style={{ padding: '25px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>🎯 Known Values</h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>pick any two</span>
          </div>

          {/* Known-pair chip selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '25px' }}>
            {PAIRS.map(p => {
              const active = p.id === pair;
              return (
                <button
                  key={p.id}
                  onClick={() => setPair(p.id)}
                  style={{
                    padding: '10px 8px',
                    border: '1px solid',
                    borderColor: active ? 'var(--accent-cyan)' : 'var(--border-color)',
                    borderRadius: '8px',
                    background: active ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-primary)',
                    color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Exactly two inputs for the selected pair */}
          {activePair.fields.map(f => {
            const [value, setValue] = fieldState[f];
            const meta = FIELD_META[f];
            const isAngle = f === 'A';
            return (
              <div key={f} style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  <span style={{ color: meta.color, marginRight: '6px' }}>■</span>{meta.label}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    value={value}
                    min="0"
                    max={isAngle ? '89.9999' : undefined}
                    step={isAngle ? '0.01' : unit === 'imperial' ? '0.0001' : '0.001'}
                    onChange={(e) => setValue(e.target.value)}
                    className="input-precision"
                  />
                  <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    {isAngle ? '°' : unitStr}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Machinist uses strip */}
          <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Everyday shop uses
            </div>
            {uses.map(u => (
              <div key={u.title} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--accent-cyan)' }}>{u.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#00ff80' }}>{u.formula}</span>
                </div>
                <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: 1.5 }}>{u.note}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Results Card */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '18px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.6) 100%)' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              SOLVED TRIANGLE
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '4px 0 0' }}>
              All Sides & Angles
            </h3>
          </div>

          {!solved.ok ? (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.5)', borderRadius: '8px', padding: '14px 18px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1.5px', color: '#ef4444', textTransform: 'uppercase', marginBottom: '4px' }}>
                ⚠ Invalid Input
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{solved.msg}</p>
            </div>
          ) : (
            <>
              {/* Interactive SVG triangle */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '12px 8px 4px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  LIVE PROPORTION — RIGHT ANGLE AT C
                </div>
                <svg viewBox={`0 0 ${svg.W} ${svg.H}`} style={{ width: '100%', height: 'auto', marginTop: '10px' }}>
                  <defs>
                    <linearGradient id="trigFill" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="rgba(56, 189, 248, 0.10)" />
                      <stop offset="100%" stopColor="rgba(244, 144, 44, 0.10)" />
                    </linearGradient>
                  </defs>

                  {/* Triangle body */}
                  <polygon
                    points={`${svg.ax},${svg.ay} ${svg.cx},${svg.ay} ${svg.bx},${svg.by}`}
                    fill="url(#trigFill)"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="1"
                  />
                  {/* Side b (run, bottom) */}
                  <line x1={svg.ax} y1={svg.ay} x2={svg.cx} y2={svg.ay} stroke="#00ff80" strokeWidth="2" />
                  {/* Side a (rise, right) */}
                  <line x1={svg.cx} y1={svg.ay} x2={svg.bx} y2={svg.by} stroke="#38bdf8" strokeWidth="2" />
                  {/* Hypotenuse c — highlighted */}
                  <line x1={svg.ax} y1={svg.ay} x2={svg.bx} y2={svg.by} stroke="#f4902c" strokeWidth="3" strokeLinecap="round" />

                  {/* Right-angle square at C */}
                  <path
                    d={`M ${svg.cx - svg.sq} ${svg.ay} L ${svg.cx - svg.sq} ${svg.ay - svg.sq} L ${svg.cx} ${svg.ay - svg.sq}`}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.2"
                    opacity="0.8"
                  />

                  {/* Angle arcs */}
                  <path d={svg.arcA} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,2" />
                  <path d={svg.arcB} fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3,2" />

                  {/* Vertex labels */}
                  <text x={svg.ax - 14} y={svg.ay + 5} fill="#f59e0b" fontSize="13" style={monoLabel}>A</text>
                  <text x={svg.bx + 8} y={svg.by - 6} fill="#c084fc" fontSize="13" style={monoLabel}>B</text>
                  <text x={svg.cx + 8} y={svg.ay + 14} fill="#fff" fontSize="13" style={monoLabel}>C</text>

                  {/* Angle values */}
                  <text x={svg.labA.x} y={svg.labA.y} fill="#f59e0b" fontSize="10" style={monoLabel}>
                    {r!.A.toFixed(2)}°
                  </text>
                  <text x={svg.labB.x} y={svg.labB.y} fill="#c084fc" fontSize="10" textAnchor="end" style={monoLabel}>
                    {angleB.toFixed(2)}°
                  </text>

                  {/* Side labels with computed values */}
                  <text x={(svg.ax + svg.cx) / 2} y={svg.ay + 20} fill="#00ff80" fontSize="10" textAnchor="middle" style={monoLabel}>
                    b = {fmtSide(r!.b)} {unitStr}
                  </text>
                  <text x={svg.cx + 10} y={svg.ay - svg.h / 2 + 4} fill="#38bdf8" fontSize="10" style={monoLabel}>
                    a = {fmtSide(r!.a)} {unitStr}
                  </text>
                  <text x={svg.labC.x} y={svg.labC.y} fill="#f4902c" fontSize="10" textAnchor="end" style={monoLabel}>
                    c = {fmtSide(r!.c)} {unitStr}
                  </text>
                </svg>
              </div>

              {/* Result table */}
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
                {resultRow('Side a (rise)', `${fmtSide(r!.a)} ${unitStr}`, null, '#38bdf8')}
                {resultRow('Side b (run)', `${fmtSide(r!.b)} ${unitStr}`, null, '#00ff80')}
                {resultRow('Side c (hypotenuse)', `${fmtSide(r!.c)} ${unitStr}`, null, '#f4902c')}
                {resultRow('Angle A', `${r!.A.toFixed(4)}°`, toDMS(r!.A), '#f59e0b')}
                {resultRow('Angle B', `${angleB.toFixed(4)}°`, toDMS(angleB), '#c084fc')}
                {resultRow('Area (a·b / 2)', `${area.toFixed(decPlaces)} ${unitStr}²`, null, '#fff')}
                {resultRow('Perimeter (a+b+c)', `${perimeter.toFixed(decPlaces)} ${unitStr}`, null, '#fff')}
              </div>

              {/* Big headline result: hypotenuse */}
              <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: 'var(--radius-md)', border: '2px solid var(--accent-cyan)', textAlign: 'center', boxShadow: '0 15px 35px -10px rgba(244, 144, 44, 0.2)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                  HYPOTENUSE c
                </span>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 800, color: '#f4902c', textShadow: '0 0 20px rgba(244, 144, 44, 0.5)' }}>
                  {fmtSide(r!.c)}
                </div>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>{unitStr}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          RIGHT TRIANGLE TRIG SOLVER // SOH-CAH-TOA & PYTHAGORAS
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          The classic machinist trig solver: pick any two independent values of a right triangle and everything else is
          solved — chamfer depths, edge breaks, dovetail pin measurements, hole offsets, and taper setups. Convention:
          the right angle sits at <strong style={{ color: '#fff' }}>C</strong>, side <strong style={{ color: '#38bdf8' }}>a</strong> is
          the opposite leg (rise), side <strong style={{ color: '#00ff80' }}>b</strong> the adjacent leg (run), and
          side <strong style={{ color: '#f4902c' }}>c</strong> the hypotenuse, with A + B = 90°. SOH-CAH-TOA:
          sin&nbsp;A = a/c (Opposite over Hypotenuse), cos&nbsp;A = b/c (Adjacent over Hypotenuse),
          tan&nbsp;A = a/b (Opposite over Adjacent); Pythagoras closes the loop with a² + b² = c². Angles are reported in
          decimal degrees and D°M'S" for sine-bar and rotary-table work.
        </p>
      </div>
    </div>
  );
};

export default TrigSolver;
