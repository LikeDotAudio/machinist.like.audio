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
import { GortonP12 } from './components/GortonP12/GortonP12';
import { DrillSizeIndex } from './components/DrillSizeIndex/DrillSizeIndex';
import { TapThreadIndex } from './components/TapThreadIndex/TapThreadIndex';
import { GeometricDieHead } from './components/GeometricDieHead';
import { MetricSpurGears } from './components/MetricSpurGears';
import { ScrewHeadIndex } from './components/ScrewHeadIndex';
import { DrillPointLength } from './components/DrillPointLength';
import { ThreadMilling } from './components/ThreadMilling';
import { TrigSolver } from './components/TrigSolver';
import { PolarRectangular } from './components/PolarRectangular';
import { TaperAngle } from './components/TaperAngle';
import { TruePosition } from './components/TruePosition';
import { FitsTolerances } from './components/FitsTolerances';
import { SurfaceFinish } from './components/SurfaceFinish';
import { HardnessConversion } from './components/HardnessConversion';
import { MaterialWeight } from './components/MaterialWeight';
import { useUnit } from './context/UnitContext';

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
  | 'gorton_p12'
  | 'drill_size_index'
  | 'tap_thread_index'
  | 'geometric_die_head'
  | 'spur_gears'
  | 'screw_head_index'
  | 'drill_point_length'
  | 'thread_milling'
  | 'trig_solver'
  | 'polar_rectangular'
  | 'taper_angle'
  | 'true_position'
  | 'fits_tolerances'
  | 'surface_finish'
  | 'hardness_conversion'
  | 'material_weight'
  | 'about';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('machinist_hub');
  const [stackTargetHeight, setStackTargetHeight] = useState<string | undefined>(undefined);
  const { unit, setUnit } = useUnit();

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
    'sheet_metal_bending',
    'gorton_p12',
    'drill_size_index',
    'tap_thread_index',
    'geometric_die_head',
    'spur_gears',
    'screw_head_index',
    'drill_point_length',
    'thread_milling',
    'trig_solver',
    'polar_rectangular',
    'taper_angle',
    'true_position',
    'fits_tolerances',
    'surface_finish',
    'hardness_conversion',
    'material_weight'
  ].includes(activeTab);

  const renderMachinistHub = () => (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '15px 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'rgba(244, 144, 44, 0.1)', 
          color: 'var(--accent-cyan)', 
          padding: '4px 14px', 
          borderRadius: '20px', 
          fontSize: '0.8rem', 
          fontWeight: 600, 
          letterSpacing: '1px', 
          textTransform: 'uppercase', 
          marginBottom: '10px',
          border: '1px solid rgba(244, 144, 44, 0.3)'
        }}>
          Precision Engineering Suite
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Machinist Calculators Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto', fontSize: '0.95rem' }}>
          Helpful precision calculators, metrology formulas, and setup utilities for toolroom milling, turning, and drilling projects.
        </p>
      </div>

      {/* Ultra-compact grid: halved vertical height, icon beside title, implied launch */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px' }}>
        
        {/* Card 1: Jo Block Stack & Height Gauge */}
        <div 
          onClick={() => setActiveTab('calculator')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #a855f7' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📐</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Jo Block & Height Gauge
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Calculate exact gauge block combinations for precise metrology setups in Imperial (81-pc) and Metric (87-pc) sets.
          </p>
        </div>

        {/* Card 2: Hardinge Dividing Head Indexing */}
        <div 
          onClick={() => setActiveTab('dividing_head')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #38bdf8' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚙️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Hardinge Dividing Head
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find exact index plates, hole circles, and crank handle turns for precision gear cutting and angular divisions.
          </p>
        </div>

        {/* Card 3: Gorton P1-2 Pantomill */}
        <div 
          onClick={() => setActiveTab('gorton_p12')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f59e0b' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📜</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Gorton P1-2 Pantomill
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Calculate exact pantograph bar setting distances, master-to-work ratios, and roll engraving setups (Manual 2701-A).
          </p>
        </div>

        {/* Card 4: Speeds & Feeds */}
        <div 
          onClick={() => setActiveTab('speeds_feeds')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f4902c' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚡</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Speeds & Feeds
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find the correct spindle cutting speed (RPM), table feed rate (IPM/mm), and material removal rate (MRR).
          </p>
        </div>

        {/* Card 5: Bolt Circle Layout */}
        <div 
          onClick={() => setActiveTab('bolt_circle_layout')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #00ff80' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🟢</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bolt Circle Layout
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find exact Cartesian (X, Y) coordinate positions of holes on a bolt circle (PCD) with visual SVG preview.
          </p>
        </div>

        {/* Card 6: Bolt Circle Diameter */}
        <div 
          onClick={() => setActiveTab('bolt_circle_diameter')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #38bdf8' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📏</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Bolt Circle Diameter
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Reverse-engineer the diameter of an existing bolt circle using standard caliper measurements across holes.
          </p>
        </div>

        {/* Card 7: Sine Bar & Sine Vise */}
        <div 
          onClick={() => setActiveTab('sine_bar_vise')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #a855f7' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📐</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Sine Bar & Sine Vise
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find precision gauge block stack heights to tilt sine bars and vises to exact angles (Decimal & D-M-S).
          </p>
        </div>

        {/* Card 8: Tap, Drill & Die */}
        <div 
          onClick={() => setActiveTab('tap_drill_die')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f59e0b' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔩</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Tap, Drill & Die
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find tap drills, closest standard drills for custom engagement %, and die threading rod blank guidance.
          </p>
        </div>

        {/* Card 9: Knurling Blank Diameter */}
        <div 
          onClick={() => setActiveTab('knurling')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #ef4444' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⭕</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Knurling Blank Diameter
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find optimal turned workpiece blank diameters that synchronize with knurl pitch to avoid double-tracking.
          </p>
        </div>

        {/* Card 10: Threading / Change Gears */}
        <div 
          onClick={() => setActiveTab('threading_change_gears')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #3b82f6' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚙️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Threading / Change Gears
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find simple and compound gear train combinations for manual lathes to cut metric or custom thread pitches.
          </p>
        </div>

        {/* Card 11: Sheet Metal Bending */}
        <div 
          onClick={() => setActiveTab('sheet_metal_bending')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #ec4899' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📐</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Sheet Metal Bending
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find flat pattern cut lengths, bend allowances, deductions, and press brake bend line locations (SendCutSend Specs).
          </p>
        </div>

        {/* Card 12: NEW Interactive Drill Size Index */}
        <div 
          onClick={() => setActiveTab('drill_size_index')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f4902c', background: 'linear-gradient(145deg, rgba(244, 144, 44, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🗂️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Interactive Drill Size Index
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Searchable index of standard twist drills (#1-#107, A-Z, Fractional, Metric) with scaled interactive SVG bit visualizer.
          </p>
        </div>

        {/* Card 13: NEW Interactive Tap & Thread Index */}
        <div 
          onClick={() => setActiveTab('tap_thread_index')}
          className="glass-panel" 
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f59e0b', background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔩</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Interactive Tap & Thread Index
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Comprehensive ISO 724 Metric and USA screw tables with interactive SVG tooth profiles and recommended tap drill sizes.
          </p>
        </div>

        {/* Card 14: NEW Geometric Die Head Chaser Selector */}
        <div
          onClick={() => setActiveTab('geometric_die_head')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #c084fc', background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔩</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Geometric Die Head Chasers
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Chaser index for 5/16" Geometric die heads (D, DS, DSA, DJ) with live thread section SVG, Class 2A/3A limits, 3-wire checks, and blank diameters.
          </p>
        </div>

        {/* Card 15: NEW Spur Gear Cutting (Metric & Imperial) */}
        <div
          onClick={() => setActiveTab('spur_gears')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #00ff80', background: 'linear-gradient(145deg, rgba(0, 255, 128, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚙️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Spur Gear Calculator
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Metric module & imperial spur gear dimensions with Hardinge pre-cut gear part numbers (M1–M6) and cutting depth data.
          </p>
        </div>

        {/* Card 16: NEW Screw Head & Drive SVG Library */}
        <div
          onClick={() => setActiveTab('screw_head_index')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #fbbf24', background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🪛</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Screw Head & Drive Index
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            SVG library of drive recesses, head shapes, screw/bolt and nut types with hex key & wrench size charts.
          </p>
        </div>

        {/* Card 17: Drill Point Length */}
        <div
          onClick={() => setActiveTab('drill_point_length')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #38bdf8' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔻</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Drill Point Length
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Find the extra depth added by a 118°/135° drill tip for full breakthrough or full-diameter blind hole depths.
          </p>
        </div>

        {/* Card 18: Thread Milling */}
        <div
          onClick={() => setActiveTab('thread_milling')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #c084fc' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🌀</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Thread Milling
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Helical interpolation paths, centerline feed-rate corrections, and ready-to-paste G-code for CNC thread mills.
          </p>
        </div>

        {/* Card 19: Right Triangle / Trig Solver */}
        <div
          onClick={() => setActiveTab('trig_solver')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #00ff80' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📐</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Right Triangle / Trig Solver
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Solve any right triangle from two knowns — daily trig for chamfer depths, edge breaks, and hole offsets.
          </p>
        </div>

        {/* Card 20: Polar ⇄ Rectangular */}
        <div
          onClick={() => setActiveTab('polar_rectangular')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #3b82f6' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🧭</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Polar ⇄ Rectangular
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Convert angles and radii to X/Y machine coordinates (and back) with a live four-quadrant plot.
          </p>
        </div>

        {/* Card 21: Taper Angle */}
        <div
          onClick={() => setActiveTab('taper_angle')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #f59e0b' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>📏</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Taper Angle
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Convert between taper dimensions, taper-per-foot, ratios, and compound-rest angles with standard taper tables.
          </p>
        </div>

        {/* Card 22: True Position (GD&T) */}
        <div
          onClick={() => setActiveTab('true_position')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #ef4444' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🎯</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              True Position (GD&T)
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Positional deviation from X/Y measurements with MMC bonus tolerance and instant PASS/FAIL verdicts.
          </p>
        </div>

        {/* Card 23: Fits & Tolerances */}
        <div
          onClick={() => setActiveTab('fits_tolerances')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #a855f7' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>🔧</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Fits & Tolerances
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            ISO 286 hole-basis shaft and hole limits for running, sliding, transition, press, and shrink fits.
          </p>
        </div>

        {/* Card 24: Surface Finish */}
        <div
          onClick={() => setActiveTab('surface_finish')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #ec4899' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>✨</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Surface Finish Conversion
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Convert Ra, RMS, Rz, CLA, and ISO N grades with process capability charts and a visual roughness comparator.
          </p>
        </div>

        {/* Card 25: Hardness Conversion */}
        <div
          onClick={() => setActiveTab('hardness_conversion')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #38bdf8' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>💎</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Hardness Conversion
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Translate HRC, HRB, Brinell, Vickers, and approximate tensile strength per ASTM E140 steel correlations.
          </p>
        </div>

        {/* Card 26: Material Weight */}
        <div
          onClick={() => setActiveTab('material_weight')}
          className="glass-panel"
          style={{ padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: '4px solid #00ff80' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>⚖️</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Material Weight
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
            Estimate bar, plate, hex, and tube stock weight from material density for quoting, shipping, and hoist limits.
          </p>
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
              boxShadow: '0 0 15px rgba(244, 144, 44, 0.3)'
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

          {/* Global Measurement Unit Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>UNITS:</span>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)' }}>
              <button
                onClick={() => setUnit('imperial')}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  background: unit === 'imperial' ? '#f59e0b' : 'transparent',
                  color: unit === 'imperial' ? '#000' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: unit === 'imperial' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
                }}
              >
                Imperial (Inches)
              </button>
              <button
                onClick={() => setUnit('metric')}
                style={{
                  padding: '6px 14px',
                  border: 'none',
                  borderRadius: '6px',
                  background: unit === 'metric' ? '#f59e0b' : 'transparent',
                  color: unit === 'metric' ? '#000' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: unit === 'metric' ? '0 2px 8px rgba(245, 158, 11, 0.4)' : 'none'
                }}
              >
                Metric (mm)
              </button>
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
          <JoBlockCalculator initialTargetValue={stackTargetHeight} />
        ) : activeTab === 'dividing_head' ? (
          <HardingeDividingHead />
        ) : activeTab === 'gorton_p12' ? (
          <GortonP12 />
        ) : activeTab === 'machinist_hub' ? (
          renderMachinistHub()
        ) : activeTab === 'speeds_feeds' ? (
          <SpeedsFeeds />
        ) : activeTab === 'bolt_circle_layout' ? (
          <BoltCircleLayout />
        ) : activeTab === 'bolt_circle_diameter' ? (
          <BoltCircleDiameter />
        ) : activeTab === 'sine_bar_vise' ? (
          <SineBarVise onNavigateToStack={(h) => {
            setStackTargetHeight(h.toString());
            setActiveTab('calculator');
          }} />
        ) : activeTab === 'tap_drill_die' ? (
          <TapDrillDie />
        ) : activeTab === 'knurling' ? (
          <Knurling />
        ) : activeTab === 'threading_change_gears' ? (
          <ThreadingChangeGears />
        ) : activeTab === 'sheet_metal_bending' ? (
          <SheetMetalBending />
        ) : activeTab === 'drill_size_index' ? (
          <DrillSizeIndex />
        ) : activeTab === 'tap_thread_index' ? (
          <TapThreadIndex />
        ) : activeTab === 'geometric_die_head' ? (
          <GeometricDieHead />
        ) : activeTab === 'spur_gears' ? (
          <MetricSpurGears />
        ) : activeTab === 'screw_head_index' ? (
          <ScrewHeadIndex />
        ) : activeTab === 'drill_point_length' ? (
          <DrillPointLength />
        ) : activeTab === 'thread_milling' ? (
          <ThreadMilling />
        ) : activeTab === 'trig_solver' ? (
          <TrigSolver />
        ) : activeTab === 'polar_rectangular' ? (
          <PolarRectangular />
        ) : activeTab === 'taper_angle' ? (
          <TaperAngle />
        ) : activeTab === 'true_position' ? (
          <TruePosition />
        ) : activeTab === 'fits_tolerances' ? (
          <FitsTolerances />
        ) : activeTab === 'surface_finish' ? (
          <SurfaceFinish />
        ) : activeTab === 'hardness_conversion' ? (
          <HardnessConversion />
        ) : activeTab === 'material_weight' ? (
          <MaterialWeight />
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

      {/* Footer - Simplified to only include GitHub repo per user instructions */}
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
            <a href="https://github.com/LikeDotAudio/machinist.like.audio" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 600 }}>
              🐙 GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
