import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// FormulaSheet — an illustrated "math lesson" panel placed below a calculator.
// Each item states the formula, explains it in plain English, and substitutes
// the user's LIVE inputs so every number on screen can be validated by hand
// against the supplied reference charts.
// ---------------------------------------------------------------------------

export interface FormulaItem {
  /** e.g. "Pitch Circle Diameter (PCD)" */
  name: string;
  /** The general formula, e.g. "PCD = N × MOD" */
  formula: string;
  /** Plain-English explanation of what the quantity is and where the formula comes from */
  explanation: string;
  /** Live substitution with the user's current inputs, e.g. "PCD = 24 × 2 = 48.000 mm" */
  worked?: string;
  /** Optional small SVG illustration */
  diagram?: React.ReactNode;
}

interface FormulaSheetProps {
  title: string;
  intro?: string;
  /** Source note, e.g. "Validated against Machinery's Handbook Class 2A limit tables" */
  reference?: string;
  items: FormulaItem[];
}

export const FormulaSheet: React.FC<FormulaSheetProps> = ({ title, intro, reference, items }) => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className="glass-panel" style={{ marginTop: '25px', padding: '18px 22px' }}>
      {/* Header / toggle */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '10px' }}
      >
        <div>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            📐 FORMULA REFERENCE — HOW THE MATH WORKS
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{title}</h3>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '1.1rem', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>▾</span>
      </div>

      {open && (
        <div style={{ marginTop: '14px' }}>
          {intro && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: '0 0 14px' }}>
              {intro}
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {idx + 1}. {item.name}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', fontWeight: 700, color: 'var(--accent-cyan)', background: 'rgba(244, 144, 44, 0.07)', border: '1px solid rgba(244, 144, 44, 0.2)', borderRadius: '6px', padding: '8px 12px' }}>
                  {item.formula}
                </div>
                {item.diagram && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>{item.diagram}</div>
                )}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {item.explanation}
                </p>
                {item.worked && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#00ff80', background: 'rgba(0, 255, 128, 0.06)', border: '1px solid rgba(0, 255, 128, 0.25)', borderRadius: '6px', padding: '7px 12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>With your inputs</span>
                    {item.worked}
                  </div>
                )}
              </div>
            ))}
          </div>

          {reference && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '14px 0 0', lineHeight: 1.5 }}>
              📖 {reference}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FormulaSheet;
