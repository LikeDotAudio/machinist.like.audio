import { useState } from 'react';
import './index.css';
import { JoBlockCalculator } from './components/HeightGauge';
import { HardingeDividingHead } from './components/HardingeDividingHead';
import { SpeedsFeeds } from './components/SpeedsFeeds/SpeedsFeeds';
import { BoltCircleLayout } from './components/BoltCircleLayout/BoltCircleLayout';
import { BoltCircleDiameter } from './components/BoltCircleDiameter/BoltCircleDiameter';
import { SineBarVise } from './components/SineBarVise/SineBarVise';
import { TapDrillDie } from './components/TapDrillDie/TapDrillDie';
import { Knurling } from './components/Knurling/Knurling';
import { ThreadingChangeGears } from './components/ThreadingChangeGears/ThreadingChangeGears';
import { SheetMetalBending } from './components/SheetMetalBending/SheetMetalBending';

type TabType = 
  | 'calculator' 
  | 'dividing_head' 
  | 'machinist_hub' 
  | 'speeds_feeds' 
  | 'bolt_circle_layout' 
  | 'bolt_circle_diameter' 
  | 'sine_bar_vise' 
  | 'tap_drill_die' 
  | 'knurling' 
  | 'threading_change_gears' 
  | 'sheet_metal_bending'
  | 'about';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('machinist_hub');

  const isMachinistTool = [
    'machinist_hub',
    'calculator',
    'dividing_head',
    'speeds_feeds',
    'bolt_circle_layout',
    'bolt_circle_diameter',
    'sine_bar_vise',
    'tap_drill_die',
    'knurling',
    'threading_change_gears',
    'sheet_metal_bending'
  ].includes(activeTab);

  const renderMachinistHub = () => (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '20px 0' }}>
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
          Precision Engineering Suite
        </div>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
          Machinist Calculators Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '1.05rem' }}>
          Helpful precision calculators, metrology formulas, and setup utilities for toolroom milling, turning, and drilling projects.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
        
        {/* Card 1: Jo Block Stack & Height Gauge */}
        <div 
          onClick={() => setActiveTab('calculator')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #a855f7' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📐</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Jo Block & Height Gauge
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Calculate exact gauge block combinations for precise metrology height gauge setups in Imperial (81-pc) and Metric (87-pc) sets.
            </p>
          </div>
          <div style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 2: Hardinge Dividing Head Indexing */}
        <div 
          onClick={() => setActiveTab('dividing_head')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #38bdf8' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚙️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Hardinge Dividing Head
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find exact index plates, hole circles, and crank handle turns for precision gear cutting and angular divisions.
            </p>
          </div>
          <div style={{ color: '#7dd3fc', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => setActiveTab('speeds_feeds')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #00f0ff' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚡</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Speeds & Feeds
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find the correct spindle cutting speed (RPM), table feed rate (IPM/mm), and material removal rate (MRR).
            </p>
          </div>
          <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => setActiveTab('bolt_circle_layout')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #00ff80' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🟢</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Bolt Circle Layout
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find exact Cartesian (X, Y) coordinate positions of holes on a bolt circle (PCD) with visual SVG preview.
            </p>
          </div>
          <div style={{ color: '#00ff80', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => setActiveTab('bolt_circle_diameter')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #38bdf8' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📏</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Bolt Circle Diameter
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Reverse-engineer the diameter of an existing bolt circle using standard caliper measurements across holes.
            </p>
          </div>
          <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => setActiveTab('sine_bar_vise')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #a855f7' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📐</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sine Bar & Sine Vise
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find precision gauge block stack heights to tilt sine bars and vises to exact angles (Decimal & D-M-S).
            </p>
          </div>
          <div style={{ color: '#c084fc', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 5 */}
        <div 
          onClick={() => setActiveTab('tap_drill_die')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #f59e0b' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>🔩</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Tap, Drill & Die
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find tap drills, closest standard drills for custom engagement %, and die threading rod blank guidance.
            </p>
          </div>
          <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 6 */}
        <div 
          onClick={() => setActiveTab('knurling')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #ef4444' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⭕</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Knurling Blank Diameter
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find optimal turned workpiece blank diameters that synchronize with knurl pitch to avoid double-tracking.
            </p>
          </div>
          <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 7 */}
        <div 
          onClick={() => setActiveTab('threading_change_gears')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #3b82f6' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚙️</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Threading / Change Gears
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find simple and compound gear train combinations for manual lathes to cut metric or custom thread pitches.
            </p>
          </div>
          <div style={{ color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

        {/* Card 8 */}
        <div 
          onClick={() => setActiveTab('sheet_metal_bending')}
          className="glass-panel" 
          style={{ padding: '30px', cursor: 'pointer', transition: 'all 0.25s ease', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '3px solid #ec4899' }}
        >
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>📐</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sheet Metal Bending
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
              Find flat pattern cut lengths, bend allowances, deductions, and press brake bend line locations (SendCutSend Specs).
            </p>
          </div>
          <div style={{ color: '#f472b6', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Launch Tool</span> ➔
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{ 
        background: 'rgba(10, 13, 20, 0.85)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--border-color)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        padding: '15px 24px'
      }}>
        <div style={{ maxWidth: '1350px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('machinist_hub')}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#000',
              fontSize: '1.2rem',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
            }}>
              M
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '1.5px', color: '#fff' }}>
                MACHINIST <span style={{ color: 'var(--accent-cyan)', fontWeight: 300 }}>// LIKE.AUDIO</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                PRECISION METROLOGY & INDUSTRIAL AUDIO LAB
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header navigation breadcrumb when inside a specific machinist tool */}
      {isMachinistTool && activeTab !== 'machinist_hub' && (
        <div style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', padding: '10px 24px' }}>
          <div style={{ maxWidth: '1250px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('machinist_hub')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent-cyan)',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ← Back to Machinist Calculators Hub
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Precision Metrology Suite // Lab Utility
            </span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 20px' }}>
        {activeTab === 'calculator' ? (
          <JoBlockCalculator />
        ) : activeTab === 'dividing_head' ? (
          <HardingeDividingHead />
        ) : activeTab === 'machinist_hub' ? (
          renderMachinistHub()
        ) : activeTab === 'speeds_feeds' ? (
          <SpeedsFeeds />
        ) : activeTab === 'bolt_circle_layout' ? (
          <BoltCircleLayout />
        ) : activeTab === 'bolt_circle_diameter' ? (
          <BoltCircleDiameter />
        ) : activeTab === 'sine_bar_vise' ? (
          <SineBarVise />
        ) : activeTab === 'tap_drill_die' ? (
          <TapDrillDie />
        ) : activeTab === 'knurling' ? (
          <Knurling />
        ) : activeTab === 'threading_change_gears' ? (
          <ThreadingChangeGears />
        ) : activeTab === 'sheet_metal_bending' ? (
          <SheetMetalBending />
        ) : (
          <div style={{ maxWidth: '800px', margin: '40px auto' }} className="glass-panel">
            <div style={{ padding: '40px' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
                System Architecture & Deployment
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.8' }}>
                This web application is engineered for precision machinists and audio developers. It features real-time metrology computation with state-of-the-art interactive visualization.
              </p>

              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '25px' }}>
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '10px', fontSize: '1rem' }}>⚙️ Technical Stack & Capabilities</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  Designed for high-precision metrology and industrial audio applications, the suite leverages modern web standards for instantaneous client-side computation:
                </p>
                <ul style={{ color: 'var(--text-primary)', fontSize: '0.88rem', paddingLeft: '20px', lineHeight: '1.7' }}>
                  <li><strong>Core Engine:</strong> React 18 with TypeScript for type-safe metrology math and zero server latency.</li>
                  <li><strong>Visualization:</strong> Scaled interactive vector graphics (SVG) for real-time bolt patterns, gear trains, and press brake profiles.</li>
                  <li><strong>Standards Compliance:</strong> Formulas calibrated to industrial handbook standards (SendCutSend, ASME, Machinery's Handbook).</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <a 
                  href="https://github.com/LikeDotAudio/machinist.like.audio" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-precision"
                  style={{ textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  🐙 View GitHub Repo
                </a>
                <button 
                  onClick={() => setActiveTab('machinist_hub')} 
                  className="btn-secondary"
                >
                  ← Back to Machinist Calculators Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        background: 'var(--bg-primary)', 
        borderTop: '1px solid var(--border-color)', 
        padding: '25px 20px', 
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)' }}>Like.Audio</strong> // Engineered for Precision.
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href="https://machinist.like.audio/Site/Index.htm" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              📁 Static Tool Directory
            </a>
            <span onClick={() => setActiveTab('about')} style={{ color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'none' }}>
              ℹ️ Architecture & Tech Stack
            </span>
            <a href="https://github.com/LikeDotAudio/machinist.like.audio" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              🐙 GitHub Repo
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
