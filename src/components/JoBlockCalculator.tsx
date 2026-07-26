import React, { useState, useEffect } from 'react';

interface BlockItem {
  value: number;
  label: string;
}

export const JoBlockCalculator: React.FC = () => {
  const [mode, setMode] = useState<'imperial' | 'metric'>('imperial');
  const [targetValue, setTargetValue] = useState<string>('2.7342');
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Preset measurements for quick demonstration
  const imperialPresets = ['0.5000', '1.0000', '2.7342', '3.8755'];
  const metricPresets = ['10.000', '25.000', '34.145', '75.500'];

  const handleModeChange = (newMode: 'imperial' | 'metric') => {
    setMode(newMode);
    setError(null);
    if (newMode === 'imperial') {
      setTargetValue('2.7342');
    } else {
      setTargetValue('34.145');
    }
  };

  const calculateStack = (valStr: string, currentMode: 'imperial' | 'metric') => {
    const val = parseFloat(valStr);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid positive measurement.');
      setBlocks([]);
      return;
    }

    setError(null);
    const result: number[] = [];
    let t = 0;
    const decPlaces = currentMode === 'imperial' ? 4 : 3;

    if (currentMode === 'imperial') {
      t = Math.round(val * 10000);

      // Step 1: 4th decimal place (0.1001 - 0.1009)
      const step1 = t % 10;
      if (step1 !== 0) {
        const b = 1000 + step1;
        result.push(b / 10000);
        t -= b;
      }

      // Step 2: 3rd decimal place (0.101 - 0.149 in steps of 0.001)
      if (t > 0 && t % 500 !== 0) {
        const rem = (t % 500) / 10;
        const b = 100 + rem;
        result.push(b / 1000);
        t -= b * 10;
      }

      // Step 3: 2nd decimal place (0.050 - 0.950 in steps of 0.050)
      if (t > 0 && t % 10000 !== 0) {
        const rem = t % 10000;
        const b = rem / 10000;
        result.push(b);
        t -= rem;
      }

      // Step 4: Whole inches (1.0 - 4.0)
      if (t > 0) {
        let b = t / 10000;
        while (b > 0) {
          if (b >= 4) { result.push(4.0); b -= 4.0; }
          else if (b >= 3) { result.push(3.0); b -= 3.0; }
          else if (b >= 2) { result.push(2.0); b -= 2.0; }
          else if (b >= 1) { result.push(1.0); b -= 1.0; }
        }
      }
    } else {
      // Metric (87-pc set)
      t = Math.round(val * 1000);

      // Step 1: 3rd decimal place (1.001 - 1.009)
      const step1 = t % 10;
      if (step1 !== 0) {
        const b = 1000 + step1;
        result.push(b / 1000);
        t -= b;
      }

      // Step 2: 2nd decimal place (1.01 - 1.49 in steps of 0.01)
      if (t > 0 && t % 500 !== 0) {
        const rem = (t % 500) / 10;
        const b = 100 + rem;
        result.push(b / 100);
        t -= b * 10;
      }

      // Step 3: 1st decimal place (0.5 - 9.5 in steps of 0.5 or 10-100)
      if (t > 0 && t % 10000 !== 0) {
        const rem = t % 10000;
        const b = rem / 1000;
        result.push(b);
        t -= rem;
      }

      // Step 4: Tens (10 - 100)
      if (t > 0) {
        let b = t / 1000;
        while (b > 0) {
          if (b >= 100) { result.push(100.0); b -= 100.0; }
          else if (b >= 90) { result.push(90.0); b -= 90.0; }
          else if (b >= 80) { result.push(80.0); b -= 80.0; }
          else if (b >= 70) { result.push(70.0); b -= 70.0; }
          else if (b >= 60) { result.push(60.0); b -= 60.0; }
          else if (b >= 50) { result.push(50.0); b -= 50.0; }
          else if (b >= 40) { result.push(40.0); b -= 40.0; }
          else if (b >= 30) { result.push(30.0); b -= 30.0; }
          else if (b >= 20) { result.push(20.0); b -= 20.0; }
          else if (b >= 10) { result.push(10.0); b -= 10.0; }
        }
      }
    }

    if (t < 0) {
      setError(`Dimension too small for standard ${currentMode === 'imperial' ? '81' : '87'}-piece set.`);
      setBlocks([]);
      return;
    }

    setBlocks(
      result.map((val) => ({
        value: val,
        label: val.toFixed(decPlaces),
      }))
    );
  };

  useEffect(() => {
    calculateStack(targetValue, mode);
  }, [targetValue, mode]);

  const totalSum = blocks.reduce((acc, curr) => acc + curr.value, 0);
  const unit = mode === 'imperial' ? 'in' : 'mm';
  const decPlaces = mode === 'imperial' ? 4 : 3;

  const copyToClipboard = () => {
    const text = blocks
      .map((b, i) => `Block ${i + 1}: ${b.label} ${unit}`)
      .join('\n') + `\nTotal Stack: ${totalSum.toFixed(decPlaces)} ${unit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 0' }}>
      {/* Header Info */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
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
          Precision Metrology Tool
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Johansson Gage Block Stack Calculator
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem' }}>
          Calculate exact gauge block combinations for toolroom inspection, calibration, and precision milling.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '25px', alignItems: 'start' }}>
        
        {/* Left Column: Input & Controls Card */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          {/* Mode Selector Tabs */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            background: 'var(--bg-primary)', 
            padding: '4px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '25px',
            border: '1px solid var(--border-color)'
          }}>
            <button
              onClick={() => handleModeChange('imperial')}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'imperial' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'imperial' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Imperial (81-pc)
            </button>
            <button
              onClick={() => handleModeChange('metric')}
              style={{
                padding: '12px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'metric' ? 'var(--accent-cyan)' : 'transparent',
                color: mode === 'metric' ? '#000' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              Metric (87-pc)
            </button>
          </div>

          {/* Target Value Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              TARGET MEASUREMENT ({mode === 'imperial' ? 'INCHES' : 'MILLIMETERS'})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={targetValue}
                step={mode === 'imperial' ? '0.0001' : '0.001'}
                min="0.0100"
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={mode === 'imperial' ? 'e.g. 2.7342' : 'e.g. 34.145'}
                className="input-precision"
                style={{ paddingRight: '50px' }}
              />
              <span style={{ 
                position: 'absolute', 
                right: '18px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-muted)', 
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>
                {unit}
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div style={{ marginBottom: '25px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Test Presets:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(mode === 'imperial' ? imperialPresets : metricPresets).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setTargetValue(preset)}
                  style={{
                    background: targetValue === preset ? 'rgba(0, 240, 255, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${targetValue === preset ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                    color: targetValue === preset ? 'var(--accent-cyan)' : 'var(--text-primary)',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {preset} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              background: 'rgba(255, 77, 79, 0.15)',
              border: '1px solid var(--text-error)',
              color: '#ff8082',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button 
            onClick={() => calculateStack(targetValue, mode)}
            className="btn-precision"
            style={{ width: '100%', padding: '15px' }}
          >
            ⚡ Recalculate Stack
          </button>

          {/* Legacy Static Notice */}
          <div style={{ 
            marginTop: '25px', 
            paddingTop: '20px', 
            borderTop: '1px dashed var(--border-color)', 
            fontSize: '0.82rem', 
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>📄 Standalone HTML version saved:</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px' }}>
              Site/HeightGauge/BlockCalculator.htm
            </span>
          </div>
        </div>

        {/* Right Column: Visualizer & Breakdown Table */}
        <div className="glass-panel" style={{ padding: '30px', minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📐 Stack Verification</span>
              {blocks.length > 0 && !error && (
                <span style={{ 
                  background: 'rgba(0, 255, 128, 0.15)', 
                  color: '#00ff80', 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  border: '1px solid rgba(0, 255, 128, 0.4)' 
                }}>
                  ✓ MATCHED
                </span>
              )}
            </h3>

            {blocks.length > 0 && !error && (
              <button 
                onClick={copyToClipboard}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Stack'}
              </button>
            )}
          </div>

          {blocks.length === 0 || error ? (
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'var(--text-muted)',
              textAlign: 'center',
              padding: '40px 20px',
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}>📏</div>
              <p style={{ fontSize: '1rem', fontWeight: 500 }}>Enter a target dimension to visualize the block stack.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '5px' }}>The calculator will select the minimum number of precision blocks needed.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              {/* Visual Gauge Block Stack Representation */}
              <div style={{ 
                background: 'var(--bg-primary)', 
                padding: '25px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '25px', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px', 
                  marginBottom: '15px',
                  width: '100%',
                  textAlign: 'left'
                }}>
                  Visual Stack Assembly ({blocks.length} blocks)
                </div>

                {/* The Blocks Stack */}
                <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', width: '100%', maxWidth: '280px', gap: '3px' }}>
                  {blocks.map((b, idx) => {
                    // Calculate relative visual thickness (clamped between 28px and 65px for aesthetic balance)
                    const minHeight = 32;
                    const maxHeight = 70;
                    const ratio = Math.min(b.value / (mode === 'imperial' ? 4.0 : 100.0), 1);
                    const visualHeight = minHeight + ratio * (maxHeight - minHeight);

                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${100 - idx * 2}%`,
                          height: `${visualHeight}px`,
                          background: 'linear-gradient(180deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
                          border: '1px solid #475569',
                          borderTop: '2px solid #94a3b8',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 15px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                          position: 'relative',
                          transition: 'transform 0.2s ease',
                          cursor: 'default'
                        }}
                        title={`Block ${idx + 1}: ${b.label} ${unit}`}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>#{idx + 1}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
                          {b.label} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{unit}</span>
                        </span>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)', opacity: 0.6 }} />
                      </div>
                    );
                  })}
                </div>

                {/* Surface Plate Base */}
                <div style={{ 
                  width: '100%', 
                  height: '14px', 
                  background: 'linear-gradient(90deg, #475569, #64748b, #475569)', 
                  borderRadius: '2px', 
                  marginTop: '4px',
                  borderTop: '2px solid #cbd5e1',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.7)',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', right: '8px', bottom: '-18px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    GRANITE SURFACE PLATE (REF 0.0000")
                  </span>
                </div>
              </div>

              {/* Breakdown Table */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>Sequence</th>
                      <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Gage Block Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map((b, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: 'var(--bg-tertiary)', textAlign: 'center', lineHeight: '24px', fontSize: '0.75rem', marginRight: '8px' }}>
                            {idx + 1}
                          </span>
                          Block {idx + 1}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                          {b.label} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{unit}</span>
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr style={{ background: 'rgba(0, 240, 255, 0.08)', fontWeight: 700 }}>
                      <td style={{ padding: '14px 16px', color: '#fff' }}>TOTAL STACK HEIGHT</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#00f0ff', textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}>
                        {totalSum.toFixed(decPlaces)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{unit}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
