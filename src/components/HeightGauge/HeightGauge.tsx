import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

interface Block {
  value: number;
  label: string;
}

interface StackResult {
  blocks: Block[];
  error: string | null;
  total: number;
}

interface HeightGaugeProps {
  initialTargetValue?: string;
}

export const HeightGauge: React.FC<HeightGaugeProps> = ({ initialTargetValue }) => {
  const { unit: inputUnit } = useUnit();
  const prevUnitRef = useRef<'imperial' | 'metric'>(inputUnit);
  const [targetValue, setTargetValue] = useState<string>(initialTargetValue || '2.7342');
  const [imperialStack, setImperialStack] = useState<StackResult>({ blocks: [], error: null, total: 0 });
  const [metricStack, setMetricStack] = useState<StackResult>({ blocks: [], error: null, total: 0 });
  const [copiedImp, setCopiedImp] = useState(false);
  const [copiedMet, setCopiedMet] = useState(false);

  useEffect(() => {
    if (initialTargetValue !== undefined && initialTargetValue !== '') {
      setTargetValue(initialTargetValue);
    }
  }, [initialTargetValue]);

  const imperialPresets = ['0.5000', '1.0000', '2.7342', '3.1415', '3.8750'];
  const metricPresets = ['10.000', '25.400', '69.449', '75.500', '100.000'];

  const computeImperialStack = (val: number): StackResult => {
    if (isNaN(val) || val <= 0) {
      return { blocks: [], error: 'Please enter a valid positive measurement.', total: 0 };
    }
    let t = Math.round(val * 10000);
    const result: number[] = [];

    // Step 1: 4th decimal place (0.0001 - 0.0009)
    const step1 = t % 10;
    if (step1 !== 0) {
      const b = 1000 + step1;
      result.push(b / 10000);
      t -= b;
    }

    // Step 2: 3rd decimal place (0.001 - 0.049 in steps of 0.001)
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

    if (t < 0) {
      return { blocks: [], error: 'Dimension too small or cannot be built with standard 81-piece set.', total: 0 };
    }

    const blocks = result.map(v => ({ value: v, label: v.toFixed(4) }));
    const total = blocks.reduce((acc, curr) => acc + curr.value, 0);
    return { blocks, error: null, total };
  };

  const computeMetricStack = (val: number): StackResult => {
    if (isNaN(val) || val <= 0) {
      return { blocks: [], error: 'Please enter a valid positive measurement.', total: 0 };
    }
    let t = Math.round(val * 1000);
    const result: number[] = [];

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

    // Step 3: 1st decimal place (0.5 - 9.5 in steps of 0.5)
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

    if (t < 0) {
      return { blocks: [], error: 'Dimension too small or cannot be built with standard 87-piece set.', total: 0 };
    }

    const blocks = result.map(v => ({ value: v, label: v.toFixed(3) }));
    const total = blocks.reduce((acc, curr) => acc + curr.value, 0);
    return { blocks, error: null, total };
  };

  useEffect(() => {
    const val = parseFloat(targetValue);
    if (isNaN(val) || val <= 0) {
      setImperialStack({ blocks: [], error: 'Enter a valid number.', total: 0 });
      setMetricStack({ blocks: [], error: 'Enter a valid number.', total: 0 });
      return;
    }

    let impTarget = val;
    let metTarget = val;

    if (inputUnit === 'imperial') {
      metTarget = val * 25.4;
    } else {
      impTarget = val / 25.4;
    }

    setImperialStack(computeImperialStack(impTarget));
    setMetricStack(computeMetricStack(metTarget));
  }, [targetValue, inputUnit]);

  const copyStack = (stack: StackResult, unit: string, setCopied: React.Dispatch<React.SetStateAction<boolean>>) => {
    const text = stack.blocks
      .map((b, i) => `Block ${i + 1}: ${b.label} ${unit}`)
      .join('\n') + `\nTotal Stack: ${stack.total.toFixed(unit === 'in' ? 4 : 3)} ${unit}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (prevUnitRef.current === inputUnit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = inputUnit;

    const val = parseFloat(targetValue);
    if (!isNaN(val) && val > 0) {
      if (inputUnit === 'metric' && oldUnit === 'imperial') {
        setTargetValue((val * 25.4).toFixed(3));
      } else if (inputUnit === 'imperial' && oldUnit === 'metric') {
        setTargetValue((val / 25.4).toFixed(4));
      }
    }
  }, [inputUnit]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0' }}>
      <div className="glass-panel" style={{ padding: '20px 25px', marginBottom: '25px', maxWidth: '850px', margin: '0 auto 25px auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '25px', alignItems: 'center' }}>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Target Measurement ({inputUnit === 'imperial' ? 'Inches' : 'Millimeters'})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                value={targetValue}
                step={inputUnit === 'imperial' ? '0.0001' : '0.001'}
                min="0.0100"
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder={inputUnit === 'imperial' ? 'e.g. 2.7342' : 'e.g. 69.449'}
                className="input-precision"
                style={{ paddingRight: '50px', fontSize: '1.1rem' }}
              />
              <span style={{ 
                position: 'absolute', 
                right: '18px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--accent-cyan)', 
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                {inputUnit === 'imperial' ? 'in' : 'mm'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginRight: '5px' }}>
            Quick Presets ({inputUnit === 'imperial' ? 'in' : 'mm'}):
          </span>
          {(inputUnit === 'imperial' ? imperialPresets : metricPresets).map((preset) => (
            <button
              key={preset}
              onClick={() => setTargetValue(preset)}
              style={{
                background: targetValue === preset ? 'rgba(244, 144, 44, 0.15)' : 'var(--bg-tertiary)',
                border: `1px solid ${targetValue === preset ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                color: targetValue === preset ? 'var(--accent-cyan)' : 'var(--text-primary)',
                padding: '5px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {preset} {inputUnit === 'imperial' ? 'in' : 'mm'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        <div className="glass-panel" style={{ padding: '30px', minHeight: '520px', display: 'flex', flexDirection: 'column', borderTop: '3px solid #60a5fa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>🇺🇸 Imperial Stack</span>
                {imperialStack.blocks.length > 0 && !imperialStack.error && (
                  <span style={{ 
                    background: 'rgba(0, 255, 128, 0.15)', 
                    color: '#00ff80', 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(0, 255, 128, 0.4)',
                    fontWeight: 600
                  }}>
                    81-PIECE SET
                  </span>
                )}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target: {inputUnit === 'imperial' ? `${targetValue} in` : `${(parseFloat(targetValue) / 25.4).toFixed(4)} in (converted)`}
              </span>
            </div>

            {imperialStack.blocks.length > 0 && !imperialStack.error && (
              <button 
                onClick={() => copyStack(imperialStack, 'in', setCopiedImp)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {copiedImp ? '✓ Copied!' : '📋 Copy Stack'}
              </button>
            )}
          </div>

          {imperialStack.error ? (
            <div style={{ background: 'rgba(255, 77, 79, 0.15)', border: '1px solid var(--text-error)', color: '#ff8082', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', margin: 'auto 0' }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <span>{imperialStack.error}</span>
            </div>
          ) : imperialStack.blocks.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Enter a valid dimension above.
            </div>
          ) : (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ 
                background: 'var(--bg-primary)', 
                padding: '25px 20px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '20px', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', width: '100%' }}>
                  Visual Assembly ({imperialStack.blocks.length} blocks)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', width: '100%', maxWidth: '260px', gap: '3px' }}>
                  {imperialStack.blocks.map((b, idx) => {
                    const minHeight = 30;
                    const maxHeight = 68;
                    const ratio = Math.min(b.value / 4.0, 1);
                    const visualHeight = minHeight + ratio * (maxHeight - minHeight);

                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${100 - idx * 3}%`,
                          height: `${visualHeight}px`,
                          background: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 50%, #1e3a8a 100%)',
                          border: '1px solid #60a5fa',
                          borderTop: '2px solid #93c5fd',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#bfdbfe', fontWeight: 600 }}>#{idx + 1}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                          {b.label} <span style={{ fontSize: '0.7rem', color: '#93c5fd' }}>in</span>
                        </span>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.8 }} />
                      </div>
                    );
                  })}
                </div>

                <div style={{ 
                  width: '100%', 
                  height: '14px', 
                  background: 'linear-gradient(90deg, #475569, #64748b, #475569)', 
                  borderRadius: '2px', 
                  marginTop: '4px',
                  borderTop: '2px solid #cbd5e1',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', right: '8px', bottom: '-18px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    GRANITE SURFACE PLATE (REF 0.0000")
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Sequence</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Gage Block Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imperialStack.blocks.map((b, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', textAlign: 'center', lineHeight: '22px', fontSize: '0.75rem', marginRight: '8px', fontWeight: 700 }}>
                            {idx + 1}
                          </span>
                          Block {idx + 1}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#60a5fa' }}>
                          {b.label} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>in</span>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(59, 130, 246, 0.1)', fontWeight: 700 }}>
                      <td style={{ padding: '12px 14px', color: '#fff' }}>TOTAL STACK HEIGHT</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: '#60a5fa' }}>
                        {imperialStack.total.toFixed(4)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>in</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '30px', minHeight: '520px', display: 'flex', flexDirection: 'column', borderTop: '3px solid #10b981', order: inputUnit === 'metric' ? -1 : 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span>🇪🇺 Metric Stack</span>
                {metricStack.blocks.length > 0 && !metricStack.error && (
                  <span style={{ 
                    background: 'rgba(16, 185, 129, 0.15)', 
                    color: '#34d399', 
                    fontSize: '0.7rem', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    fontWeight: 600
                  }}>
                    87-PIECE SET
                  </span>
                )}
              </h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Target: {inputUnit === 'metric' ? `${targetValue} mm` : `${(parseFloat(targetValue) * 25.4).toFixed(3)} mm (converted)`}
              </span>
            </div>

            {metricStack.blocks.length > 0 && !metricStack.error && (
              <button 
                onClick={() => copyStack(metricStack, 'mm', setCopiedMet)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              >
                {copiedMet ? '✓ Copied!' : '📋 Copy Stack'}
              </button>
            )}
          </div>

          {metricStack.error ? (
            <div style={{ background: 'rgba(255, 77, 79, 0.15)', border: '1px solid var(--text-error)', color: '#ff8082', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '10px', margin: 'auto 0' }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <span>{metricStack.error}</span>
            </div>
          ) : metricStack.blocks.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Enter a valid dimension above.
            </div>
          ) : (
            <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ 
                background: 'var(--bg-primary)', 
                padding: '25px 20px', 
                borderRadius: 'var(--radius-md)', 
                marginBottom: '20px', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', width: '100%' }}>
                  Visual Assembly ({metricStack.blocks.length} blocks)
                </div>

                <div style={{ display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', width: '100%', maxWidth: '260px', gap: '3px' }}>
                  {metricStack.blocks.map((b, idx) => {
                    const minHeight = 30;
                    const maxHeight = 68;
                    const ratio = Math.min(b.value / 100.0, 1);
                    const visualHeight = minHeight + ratio * (maxHeight - minHeight);

                    return (
                      <div
                        key={idx}
                        style={{
                          width: `${100 - idx * 3}%`,
                          height: `${visualHeight}px`,
                          background: 'linear-gradient(180deg, #10b981 0%, #047857 50%, #064e3b 100%)',
                          border: '1px solid #34d399',
                          borderTop: '2px solid #6ee7b7',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0 12px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: '#d1fae5', fontWeight: 600 }}>#{idx + 1}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                          {b.label} <span style={{ fontSize: '0.7rem', color: '#a7f3d0' }}>mm</span>
                        </span>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff', opacity: 0.8 }} />
                      </div>
                    );
                  })}
                </div>

                <div style={{ 
                  width: '100%', 
                  height: '14px', 
                  background: 'linear-gradient(90deg, #475569, #64748b, #475569)', 
                  borderRadius: '2px', 
                  marginTop: '4px',
                  borderTop: '2px solid #cbd5e1',
                  position: 'relative'
                }}>
                  <span style={{ position: 'absolute', right: '8px', bottom: '-18px', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    GRANITE SURFACE PLATE (REF 0.000 mm)
                  </span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-color)' }}>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600 }}>Sequence</th>
                      <th style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontWeight: 600, textAlign: 'right' }}>Gage Block Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricStack.blocks.map((b, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          <span style={{ display: 'inline-block', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', textAlign: 'center', lineHeight: '22px', fontSize: '0.75rem', marginRight: '8px', fontWeight: 700 }}>
                            {idx + 1}
                          </span>
                          Block {idx + 1}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#34d399' }}>
                          {b.label} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>mm</span>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: 'rgba(16, 185, 129, 0.1)', fontWeight: 700 }}>
                      <td style={{ padding: '12px 14px', color: '#fff' }}>TOTAL STACK HEIGHT</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: '#34d399' }}>
                        {metricStack.total.toFixed(3)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>mm</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Footer: tool description */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '14px 20px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
          Side-By-Side Precision Metrology // Tool Guidance
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>
          Compare exact gauge block combinations side-by-side in both Imperial (81-pc) and Metric (87-pc) sets simultaneously.
        </p>
      </div>
    </div>
  );
};

export const JoBlockCalculator = HeightGauge;
