import React, { useState, useEffect, useRef } from 'react';

interface DividingHeadVisualizerProps {
  plateName: string;
  allCircleHoles: number[];      // e.g. [15, 16, 17, 18, 19, 40]
  selectedCircleHoles: number;   // e.g. 18
  fullTurns: number;             // e.g. 1
  remainingHoles: number;        // e.g. 3
  totalHoles: number;            // e.g. 21
  ratio: number;                 // e.g. 4
  divisions: number;             // e.g. 24 — full cycle animates every division
}

export const DividingHeadVisualizer: React.FC<DividingHeadVisualizerProps> = ({
  plateName,
  allCircleHoles,
  selectedCircleHoles,
  fullTurns,
  remainingHoles,
  totalHoles,
  ratio,
  divisions
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [animProgress, setAnimProgress] = useState<number>(1); // 0 to 1 across the FULL cycle (all divisions)
  const [animSpeed, setAnimSpeed] = useState<number>(1); // 0.5, 1, 2
  const [showSectors, setShowSectors] = useState<boolean>(true);
  const [manualMode, setManualMode] = useState<boolean>(false);

  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Rotation angle for ONE indexing step in degrees
  const sectorAngleDeg = (360 * remainingHoles) / selectedCircleHoles;
  const stepRotationDeg = fullTurns * 360 + sectorAngleDeg;

  // Full cycle = one indexing step per division (crank ends at ratio × 360°, work back at 0°)
  const D = Math.max(1, divisions);
  const stepFloat = Math.min(animProgress, 1) * D;
  const stepIndex = Math.min(D - 1, Math.floor(stepFloat + 1e-9));
  const stepFrac = animProgress >= 1 ? 1 : stepFloat - stepIndex;
  // Within each step: ease-out cubic into the hole, then a short dwell while the pin is engaged
  const DWELL = 0.22;
  const moveFrac = stepFrac >= 1 - DWELL ? 1 : 1 - Math.pow(1 - stepFrac / (1 - DWELL), 3);
  const pinEngaged = stepFrac >= 1 - DWELL || animProgress >= 1;

  // Crank angle accumulated across completed steps + current step (starting at -90 deg / 12 o'clock)
  const currentRotationDeg = (stepIndex + moveFrac) * stepRotationDeg;
  const stepLocalRotationDeg = moveFrac * stepRotationDeg;
  const handleAngleDeg = -90 + currentRotationDeg;
  const handleAngleRad = (handleAngleDeg * Math.PI) / 180;
  // Work spindle angle (crank reduced through the worm)
  const spindleAngleDeg = currentRotationDeg / ratio;

  // Full turns / holes progress within the CURRENT step
  const currentTurnCount = Math.floor(stepLocalRotationDeg / 360 + 1e-5);
  const currentHoleCount = Math.round(((stepLocalRotationDeg % 360) / 360) * selectedCircleHoles);

  // Sector arms advance with each completed index step
  const armBaseAngleDeg = (stepIndex * sectorAngleDeg) % 360;

  // Restart animation when plate or match selection changes
  useEffect(() => {
    setIsPlaying(false);
    setAnimProgress(1);
    setManualMode(false);
  }, [plateName, selectedCircleHoles, fullTurns, remainingHoles, divisions]);

  // Animation loop — runs the full cycle through all divisions
  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    // Per-step duration ≈ 1000ms per full turn + 700ms sector + dwell; full cycle capped at ~36s at 1x
    const perStep = Math.max(1100, fullTurns * 1000 + (remainingHoles > 0 ? 700 : 0));
    const duration = Math.min(perStep * D, 36000) / animSpeed;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        // Resume from a paused position instead of restarting
        startTimeRef.current = timestamp - animProgress * duration;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);

      setAnimProgress(progress);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        startTimeRef.current = null;
      }
    };

    startTimeRef.current = null;
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, animSpeed, fullTurns, remainingHoles, D]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (animProgress >= 1) {
        setAnimProgress(0);
      }
      setManualMode(false);
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAnimProgress(0);
    setManualMode(false);
  };

  const handleManualSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setManualMode(true);
    setAnimProgress(parseFloat(e.target.value));
  };

  // Sort circle hole counts so smallest circle is innermost
  const sortedCircles = [...allCircleHoles].sort((a, b) => a - b);

  // Map circle hole count to SVG radius between 60px and 200px
  const getRadiusForCircle = (holes: number) => {
    if (sortedCircles.length === 1) return 140;
    const idx = sortedCircles.indexOf(holes);
    const minR = 65;
    const maxR = 195;
    return minR + (idx / (sortedCircles.length - 1)) * (maxR - minR);
  };

  const selectedRadius = getRadiusForCircle(selectedCircleHoles);
  const handleX = selectedRadius * Math.cos(handleAngleRad);
  const handleY = selectedRadius * Math.sin(handleAngleRad);

  // Calculate SVG arc path for the Sector Arms ("Septers") span
  const getSectorArcPath = () => {
    if (remainingHoles === 0 || !showSectors) return null;
    const startRad = -Math.PI / 2; // -90 deg
    const endAngleDeg = -90 + sectorAngleDeg;
    const endRad = (endAngleDeg * Math.PI) / 180;
    const r = 210; // extend slightly beyond outer circle

    const startX = r * Math.cos(startRad);
    const startY = r * Math.sin(startRad);
    const endX = r * Math.cos(endRad);
    const endY = r * Math.sin(endRad);

    const largeArcFlag = sectorAngleDeg > 180 ? 1 : 0;

    return `M 0 0 L ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };

  return (
    <div className="glass-panel" style={{ padding: '25px', marginTop: '30px', borderTop: '3px solid var(--accent-cyan)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
            ⚡ Real-Time Kinematic Simulation
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>
            Index Plate & Sector Arm ("Septer") Visualizer
          </h3>
        </div>

        {/* Animation Control Bar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handlePlayPause}
            className="btn-precision"
            style={{ 
              padding: '8px 18px', 
              fontSize: '0.85rem',
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              background: isPlaying ? 'linear-gradient(135deg, #ff4d4d, #c0392b)' : undefined
            }}
          >
            <span>{isPlaying ? '⏸ Pause' : animProgress >= 1 ? `🔄 Replay All ${D} Divisions` : '▶ Animate Indexing'}</span>
          </button>

          <button
            onClick={handleReset}
            className="btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            ⏹ Reset (0°)
          </button>

          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setAnimSpeed(spd)}
                style={{
                  background: animSpeed === spd ? 'var(--accent-cyan)' : 'transparent',
                  color: animSpeed === spd ? '#000' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '6px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <input
              type="checkbox"
              checked={showSectors}
              onChange={(e) => setShowSectors(e.target.checked)}
              style={{ accentColor: 'var(--accent-gold)' }}
            />
            Show Septers (Sector Arms)
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'center' }}>
        
        {/* SVG Index Plate Canvas */}
        <div style={{ 
          background: 'radial-gradient(circle, rgba(30, 41, 59, 0.8) 0%, rgba(10, 13, 20, 0.95) 70%)', 
          borderRadius: 'var(--radius-lg)', 
          border: '1px solid var(--border-color)', 
          padding: '20px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'relative',
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)'
        }}>
          {/* Live Status Overlay Badge in Canvas */}
          <div style={{ 
            position: 'absolute', 
            top: '15px', 
            left: '15px', 
            background: 'rgba(0,0,0,0.6)', 
            backdropFilter: 'blur(6px)', 
            padding: '8px 14px', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>ACTIVE PLATE</div>
            <div style={{ color: '#fff', fontWeight: 700 }}>{plateName} // {selectedCircleHoles}-Hole Circle</div>
            {remainingHoles > 0 && showSectors && (
              <div style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.75rem', marginTop: '2px' }}>
                Septer Span: {remainingHoles} Holes ({sectorAngleDeg.toFixed(1)}°)
              </div>
            )}
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.75rem', marginTop: '2px' }}>
              Division {Math.min(stepIndex + 1, D)} / {D}
            </div>
          </div>

          <svg viewBox="-240 -240 480 480" style={{ width: '100%', maxWidth: '420px', height: 'auto', overflow: 'visible' }}>
            <defs>
              <radialGradient id="metallicPlate" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
              <linearGradient id="brassSector" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Outer Metallic Plate Body */}
            <circle cx="0" cy="0" r="225" fill="url(#metallicPlate)" stroke="#475569" strokeWidth="4" />
            <circle cx="0" cy="0" r="220" fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="6 3" opacity="0.4" />

            {/* Shaded Septers (Sector Arms Span) — advances with each completed division */}
            {getSectorArcPath() && (
              <g transform={`rotate(${armBaseAngleDeg})`}>
                <path
                  d={getSectorArcPath()!}
                  fill="url(#brassSector)"
                  stroke="var(--accent-gold)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              </g>
            )}

            {/* Concentric Hole Circles */}
            {sortedCircles.map((circleHoleCount) => {
              const r = getRadiusForCircle(circleHoleCount);
              const isSelected = circleHoleCount === selectedCircleHoles;
              const holes: React.JSX.Element[] = [];

              for (let i = 0; i < circleHoleCount; i++) {
                const angleRad = -Math.PI / 2 + (i * 2 * Math.PI) / circleHoleCount;
                const hx = r * Math.cos(angleRad);
                const hy = r * Math.sin(angleRad);

                // Start/target holes advance around the circle as divisions complete
                const startHoleIdx = (stepIndex * remainingHoles) % circleHoleCount;
                const targetHoleIdx = ((stepIndex + 1) * remainingHoles) % circleHoleCount;
                // Is this specific hole the target hole at the end of the sector arm?
                const isTargetHole = isSelected && remainingHoles > 0 && i === targetHoleIdx;
                // Is this specific hole the current start hole?
                const isStartHole = isSelected && i === startHoleIdx;

                holes.push(
                  <circle
                    key={i}
                    cx={hx}
                    cy={hy}
                    r={isSelected ? (isTargetHole || isStartHole ? 5.5 : 4) : 2.5}
                    fill={
                      isTargetHole ? '#00ff80' :
                      isStartHole ? '#ffaa00' :
                      isSelected ? '#f4902c' : '#475569'
                    }
                    stroke={isTargetHole ? '#fff' : isSelected ? '#00a8ff' : 'none'}
                    strokeWidth={isTargetHole ? 2 : 1}
                    filter={isTargetHole ? 'url(#glowCyan)' : undefined}
                  />
                );
              }

              return (
                <g key={circleHoleCount}>
                  {/* Guide ring for circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r={r}
                    fill="none"
                    stroke={isSelected ? 'var(--accent-cyan)' : '#334155'}
                    strokeWidth={isSelected ? 2 : 1}
                    strokeDasharray={isSelected ? undefined : '2 4'}
                    opacity={isSelected ? 0.7 : 0.4}
                    filter={isSelected ? 'url(#glowCyan)' : undefined}
                  />
                  {holes}
                  {/* Label circle count at bottom of ring */}
                  <text
                    x="0"
                    y={r + 14}
                    textAnchor="middle"
                    fill={isSelected ? 'var(--accent-cyan)' : '#64748b'}
                    fontSize={isSelected ? '11px' : '9px'}
                    fontWeight={isSelected ? '800' : '500'}
                    fontFamily="var(--font-mono)"
                  >
                    {circleHoleCount}
                  </text>
                </g>
              );
            })}

            {/* Brass Sector Arm A (Start Arm — follows completed divisions) */}
            {showSectors && remainingHoles > 0 && (
              <g transform={`rotate(${armBaseAngleDeg})`}>
                <line x1="0" y1="0" x2="0" y2="-215" stroke="var(--accent-gold)" strokeWidth="4" strokeLinecap="round" />
                <polygon points="-6,-180 6,-180 0,-215" fill="var(--accent-gold)" />
                <circle cx="0" cy="-215" r="5" fill="#fff" stroke="var(--accent-gold)" strokeWidth="2" />
                <text x="12" y="-195" fill="var(--accent-gold)" fontSize="10px" fontWeight="700" fontFamily="var(--font-mono)">
                  Arm A
                </text>
              </g>
            )}

            {/* Brass Sector Arm B (Target Angle / End Arm) */}
            {showSectors && remainingHoles > 0 && (
              <g transform={`rotate(${armBaseAngleDeg + sectorAngleDeg})`}>
                <line x1="0" y1="0" x2="0" y2="-215" stroke="var(--accent-gold)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 2" />
                <polygon points="-6,-180 6,-180 0,-215" fill="var(--accent-gold)" />
                <circle cx="0" cy="-215" r="6" fill="#00ff80" stroke="#fff" strokeWidth="2" filter="url(#glowCyan)" />
                <text x="-12" y="-195" textAnchor="end" fill="#00ff80" fontSize="10px" fontWeight="700" fontFamily="var(--font-mono)">
                  Arm B (+{remainingHoles})
                </text>
              </g>
            )}

            {/* Work Spindle Rotation Marker (crank ÷ worm ratio) */}
            <g transform={`rotate(${spindleAngleDeg})`}>
              <line x1="0" y1="-8" x2="0" y2="-30" stroke="#00ff80" strokeWidth="3" strokeLinecap="round" />
            </g>

            {/* Rotating Crank Handle & Plunger Pin Assembly */}
            <g>
              {/* Crank Handle Arm */}
              <line
                x1="0"
                y1="0"
                x2={handleX}
                y2={handleY}
                stroke="#e2e8f0"
                strokeWidth="8"
                strokeLinecap="round"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
              />
              <line
                x1="0"
                y1="0"
                x2={handleX}
                y2={handleY}
                stroke="var(--accent-cyan)"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Plunger Pin at tip */}
              <circle
                cx={handleX}
                cy={handleY}
                r="10"
                fill="#0f172a"
                stroke="#fff"
                strokeWidth="3"
              />
              <circle
                cx={handleX}
                cy={handleY}
                r="6"
                fill={pinEngaged ? '#00ff80' : 'var(--accent-cyan)'}
                filter="url(#glowCyan)"
              />
            </g>

            {/* Center Spindle Bore & Lock Nut */}
            <circle cx="0" cy="0" r="32" fill="#0f172a" stroke="#64748b" strokeWidth="4" />
            <circle cx="0" cy="0" r="18" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="0" cy="0" r="8" fill="#000" />
            <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="10px" fontWeight="800" fontFamily="var(--font-mono)">
              SPINDLE
            </text>
          </svg>
        </div>

        {/* Telemetry & Manual Override Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 700 }}>
              Kinematic Indexing Telemetry
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontFamily: 'var(--font-mono)' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Division:</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{Math.min(stepIndex + 1, D)} / {D}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Work Rotation:</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00ff80' }}>{spindleAngleDeg.toFixed(1)}°</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Crank Turns (this step):</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>{currentTurnCount} / {fullTurns}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Hole on Circle:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#00ff80' }}>
                  {currentHoleCount} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {remainingHoles}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Crank Angle:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>{currentRotationDeg.toFixed(1)}°</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Plunger Status:</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: pinEngaged ? '#00ff80' : '#ffaa00' }}>
                  {pinEngaged ? '🟢 ENGAGED' : '🟡 ROTATING...'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Pin Travel:</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{totalHoles} hole spaces</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Worm Gear Ratio:</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{ratio}:1 Reduction</div>
              </div>
            </div>
          </div>

          {/* Manual Progress Slider */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                🎚️ Manual Crank Override
              </span>
              <span style={{ fontSize: '0.75rem', color: manualMode ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: 600 }}>
                {manualMode ? 'MANUAL MODE ACTIVE' : 'DRAG TO SCRUB'}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.002"
              value={animProgress}
              onChange={handleManualSlider}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: 'var(--accent-cyan)'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
              <span>Start (Division 1)</span>
              <span>Full Cycle ({D} × [{fullTurns}T + {remainingHoles}H])</span>
            </div>
          </div>

          {/* Machinist Handbook Pro Tip */}
          <div style={{ background: 'rgba(255, 170, 0, 0.08)', border: '1px solid rgba(255, 170, 0, 0.3)', padding: '15px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              💡 How to Use Septers (Sector Arms)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
              Set **Arm A** against the pin at your starting hole (Hole 0). Count exactly **{remainingHoles} hole spaces** (do not count the hole the pin is in) and lock **Arm B** against the {remainingHoles}th hole. After completing **{fullTurns} full turn{fullTurns !== 1 ? 's' : ''}**, rotate the handle until the pin drops into the hole at **Arm B**.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
