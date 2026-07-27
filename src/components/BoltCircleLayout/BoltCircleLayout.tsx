import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface HoleCoordinate {
  id: number;
  angleDeg: number;
  x: number;
  y: number;
}

export const BoltCircleLayout: React.FC = () => {
  const { unit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(unit);
  const [bcd, setBcd] = useState<string>('4.0000');
  const [holesCount, setHolesCount] = useState<number>(6);
  const [startAngle, setStartAngle] = useState<string>('0'); // degrees from 3 o'clock (positive CCW)
  const [centerX, setCenterX] = useState<string>('0.0000');
  const [centerY, setCenterY] = useState<string>('0.0000');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const bVal = parseFloat(bcd) || 0;
    const cxVal = parseFloat(centerX) || 0;
    const cyVal = parseFloat(centerY) || 0;

    if (unit === 'metric' && oldUnit === 'imperial') {
      setBcd((bVal * 25.4).toFixed(3));
      setCenterX((cxVal * 25.4).toFixed(3));
      setCenterY((cyVal * 25.4).toFixed(3));
    } else if (unit === 'imperial' && oldUnit === 'metric') {
      setBcd((bVal / 25.4).toFixed(4));
      setCenterX((cxVal / 25.4).toFixed(4));
      setCenterY((cyVal / 25.4).toFixed(4));
    }
  }, [unit]);

  const diameter = parseFloat(bcd) || 0;
  const count = Math.max(1, Math.min(100, holesCount));
  const startDeg = parseFloat(startAngle) || 0;
  const cx = parseFloat(centerX) || 0;
  const cy = parseFloat(centerY) || 0;
  const radius = diameter / 2;
  const decPlaces = unit === 'imperial' ? 4 : 3;
  const unitStr = unit === 'imperial' ? 'in' : 'mm';

  // Calculate coordinates
  const holeList: HoleCoordinate[] = [];
  const stepDeg = 360 / count;

  for (let i = 0; i < count; i++) {
    const angle = startDeg + i * stepDeg;
    const angleRad = (angle * Math.PI) / 180;
    const xVal = cx + radius * Math.cos(angleRad);
    const yVal = cy + radius * Math.sin(angleRad);
    holeList.push({
      id: i + 1,
      angleDeg: (angle % 360 + 360) % 360,
      x: xVal,
      y: yVal,
    });
  }

  // Chordal Distance (straight line center-to-center between adjacent holes)
  const chordalDist = count > 1 ? diameter * Math.sin((180 / count) * (Math.PI / 180)) : 0;

  const copyTableToClipboard = () => {
    const header = `Bolt Circle Coordinates (BCD: ${diameter.toFixed(decPlaces)} ${unitStr}, Holes: ${count})\nID\tAngle (°)\tX (${unitStr})\tY (${unitStr})`;
    const rows = holeList.map(h => `${h.id}\t${h.angleDeg.toFixed(2)}°\t${h.x.toFixed(decPlaces)}\t${h.y.toFixed(decPlaces)}`).join('\n');
    navigator.clipboard.writeText(`${header}\n${rows}\nChordal Distance: ${chordalDist.toFixed(decPlaces)} ${unitStr}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Card: Input Parameters */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>📐 Pattern Specification</h3>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Bolt Circle Diameter (BCD)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={bcd}
                step={unit === 'imperial' ? '0.1' : '1'}
                onChange={(e) => setBcd(e.target.value)}
                className="input-precision"
              />
              <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {unitStr}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Number of Holes
              </label>
              <input
                type="number"
                value={holesCount}
                min={1}
                max={48}
                onChange={(e) => setHolesCount(parseInt(e.target.value) || 1)}
                className="input-precision"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Starting Angle (Deg)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  value={startAngle}
                  step="1"
                  onChange={(e) => setStartAngle(e.target.value)}
                  className="input-precision"
                />
                <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  °
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Center X Coordinate
              </label>
              <input
                type="number"
                value={centerX}
                step={unit === 'imperial' ? '0.1' : '1'}
                onChange={(e) => setCenterX(e.target.value)}
                className="input-precision"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Center Y Coordinate
              </label>
              <input
                type="number"
                value={centerY}
                step={unit === 'imperial' ? '0.1' : '1'}
                onChange={(e) => setCenterY(e.target.value)}
                className="input-precision"
              />
            </div>
          </div>

          {/* Quick Summary Box */}
          <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Adjacent Hole Distance (Chordal)
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                {chordalDist.toFixed(decPlaces)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{unitStr}</span>
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Angular Step
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: '#00ff80' }}>
                {stepDeg.toFixed(2)}°
              </span>
            </div>
          </div>
        </div>

        {/* Right Card (Ordered Left): SVG Visualizer & Table */}
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '25px', order: -1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>🟢 Visual Pattern Preview</h3>
            <button
              onClick={copyTableToClipboard}
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              {copied ? '✓ Copied Table!' : '📋 Copy DRO Table'}
            </button>
          </div>

          {/* SVG Diagram */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '280px'
          }}>
            <svg viewBox="-140 -140 280 280" style={{ width: '100%', maxWidth: '280px', height: 'auto', overflow: 'visible' }}>
              {/* Axes / Crosshairs */}
              <line x1="-130" y1="0" x2="130" y2="0" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              <line x1="0" y1="-130" x2="0" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
              
              {/* Bolt Circle Pitch Circle */}
              <circle cx="0" cy="0" r="95" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.7" />
              <circle cx="0" cy="0" r="3" fill="#64748b" />

              {/* Holes */}
              {holeList.map((h) => {
                // Map angle to SVG drawing coordinates (Note: standard SVG y is down, so we flip -sin for standard Cartesian view)
                const rad = (h.angleDeg * Math.PI) / 180;
                const svgX = 95 * Math.cos(rad);
                const svgY = -95 * Math.sin(rad);

                return (
                  <g key={h.id}>
                    <line x1="0" y1="0" x2={svgX} y2={svgY} stroke="#1e293b" strokeWidth="1" />
                    <circle cx={svgX} cy={svgY} r="8" fill="#0f172a" stroke="#00ff80" strokeWidth="2" />
                    <text
                      x={svgX * 1.25}
                      y={svgY * 1.25}
                      fill="#f8fafc"
                      fontSize="11"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontFamily="var(--font-mono)"
                    >
                      #{h.id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Coordinate Table */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', maxHeight: '320px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 1, backdropFilter: 'blur(4px)' }}>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Hole</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Angle</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>X Coord ({unitStr})</th>
                  <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Y Coord ({unitStr})</th>
                </tr>
              </thead>
              <tbody>
                {holeList.map((h) => (
                  <tr key={h.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0, 255, 128, 0.15)', color: '#00ff80', textAlign: 'center', lineHeight: '22px', fontSize: '0.75rem', marginRight: '6px' }}>
                        {h.id}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {h.angleDeg.toFixed(1)}°
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {h.x >= 0 ? `+${h.x.toFixed(decPlaces)}` : h.x.toFixed(decPlaces)}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                      {h.y >= 0 ? `+${h.y.toFixed(decPlaces)}` : h.y.toFixed(decPlaces)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '14px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Machinist Calculator #2 // Tool Guidance
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          Calculate exact X and Y Cartesian coordinates for drilling hole patterns on rotary tables, mills, and CNC machines.
        </p>
      </div>
    </div>
  );
};
