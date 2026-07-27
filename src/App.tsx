import { useState, useEffect } from 'react';
import './index.css';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

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
import { Metallurgy } from './components/Metallurgy/Metallurgy';
import { WeldingSuite } from './components/Welding/WeldingSuite';
import { SplashScreen } from './components/SplashScreen/SplashScreen';
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
  | 'metallurgy_suite'
  | 'welding_suite'
  | 'about';

interface HubTool {
  id: TabType;
  category: string;
  icon: string;
  title: string;
  description: string;
  borderColor: string;
}

const HUB_CATEGORIES = [
  { id: 'all', label: '🌟 All Tools', description: 'Complete precision engineering and metrology library.' },
  { id: 'metrology', label: '📐 Metrology & GD&T', description: 'Precision measurement, gauge block stacks, geometric dimensioning & tolerancing (GD&T), and material surface inspection utilities.' },
  { id: 'machining', label: '⚡ Machining & Milling', description: 'Spindle speeds, table feeds, material removal rates, hole pattern coordinate layouts, and specialized pantograph setups.' },
  { id: 'threading', label: '🔩 Threading & Gears', description: 'Comprehensive thread indices, tap drill selection, change gear calculations, dividing head indexing, and spur gear geometry.' },
  { id: 'metallurgy', label: '🔥 Metallurgy & Materials', description: 'Phase transition temperatures, forging heat colors, casting superheat ranges, thermal expansion, and stock weight estimation.' },
  { id: 'welding', label: '🧑‍🏭 Welding & Fabrication', description: 'Arc energy heat input, filler deposition rates, hydrogen cracking preheat estimation, weld groove volume, cost analysis, and duty cycle limits.' },
  { id: 'forming', label: '🏗️ Sheet Metal Forming', description: 'Press brake bend deductions, bend allowances, flat pattern development, OSSB, K-Factors, and turned knurling blank sizing.' },
  { id: 'geometry', label: '🧭 Math & Geometry', description: 'Trigonometric triangle resolution, Cartesian-to-polar coordinate transformations, and machine taper angle conversions.' }
];

const HUB_TOOLS: HubTool[] = [
  { id: 'calculator', category: 'metrology', icon: '📐', title: 'Jo Block & Height Gauge', description: 'Calculate exact gauge block combinations for precise metrology setups in Imperial (81-pc) and Metric (87-pc) sets.', borderColor: '#a855f7' },
  { id: 'dividing_head', category: 'threading', icon: '⚙️', title: 'Hardinge Dividing Head', description: 'Find exact index plates, hole circles, and crank handle turns for precision gear cutting and angular divisions.', borderColor: '#38bdf8' },
  { id: 'gorton_p12', category: 'machining', icon: '⚡', title: 'Gorton P1-2 Pantomill', description: 'Set slider bar distances, master-to-workpiece ratios, and roll engraving indexing for Gorton P1-2 pantographs.', borderColor: '#f59e0b' },
  { id: 'speeds_feeds', category: 'machining', icon: '🏎️', title: 'Speeds & Feeds Calculator', description: 'Optimize cutting speeds (SFM/RPM), chip loads, and table feeds (IPM) for carbide and HSS end mills across alloys.', borderColor: '#00ff80' },
  { id: 'bolt_circle_layout', category: 'machining', icon: '⭕', title: 'Bolt Circle Layout', description: 'Compute absolute Cartesian (X, Y) hole center coordinates on a Pitch Circle Diameter (PCD) for manual milling or DRO entry.', borderColor: '#ec4899' },
  { id: 'bolt_circle_diameter', category: 'machining', icon: '🔍', title: 'Bolt Circle Reverse-Engineering', description: 'Reverse-engineer unknown bolt circle diameters (PCD) from caliper measurements across adjacent holes.', borderColor: '#38bdf8' },
  { id: 'sine_bar_vise', category: 'metrology', icon: '📐', title: 'Sine Bar & Sine Vise Angle', description: 'Calculate gauge block stack heights required to tilt 5-inch or 10-inch sine bars and toolmaker vises to precise angles.', borderColor: '#a855f7' },
  { id: 'tap_drill_die', category: 'threading', icon: '🔩', title: 'Tap, Drill & Die Reference', description: 'Find standard tap drill sizes, custom thread percentage engagement bit selection, and die rod blank turning diameters.', borderColor: '#f59e0b' },
  { id: 'knurling', category: 'forming', icon: '💎', title: 'Knurling Blank Diameter', description: 'Calculate optimal turned blank diameters that synchronize with knurl wheel pitch teeth to prevent tool chatter and double-tracking.', borderColor: '#00ff80' },
  { id: 'threading_change_gears', category: 'threading', icon: '⚙️', title: 'Lathe Threading Change Gears', description: 'Calculate simple and compound gear train combinations for manual lathes to cut metric, imperial, or custom module thread pitches.', borderColor: '#ec4899' },
  { id: 'sheet_metal_bending', category: 'forming', icon: '🏗️', title: 'Sheet Metal Bending Simulator', description: 'Develop exact flat pattern cut blanks using industry standard bending tables, featuring a live interactive bend angle animation simulator.', borderColor: '#38bdf8' },
  { id: 'drill_size_index', category: 'threading', icon: '🔢', title: 'Interactive Drill Size Index', description: 'Search standard twist bit diameters (#1–#107, A–Z, Fractional, Metric) with live scaled SVG drill point visualizers.', borderColor: '#a855f7' },
  { id: 'tap_thread_index', category: 'threading', icon: '📐', title: 'Interactive Tap & Thread Index', description: 'Explore ISO Metric & ASME UNC/UNF thread pitch diameters, root depths, and Class 2A/3A fit limits with interactive SVG previews.', borderColor: '#f59e0b' },
  { id: 'geometric_die_head', category: 'threading', icon: '🔩', title: 'Geometric Die Head Chasers', description: 'Select chaser part numbers, pitch diameters, 3-wire over-wire measurements, and rod blank tolerances for automatic die heads.', borderColor: '#00ff80' },
  { id: 'spur_gears', category: 'threading', icon: '⚙️', title: 'Spur Gear Calculator', description: 'Calculate addendum, dedendum, whole depth, and center distances with Hardinge pre-cut gear cutter number mapping (M1–M8).', borderColor: '#ec4899' },
  { id: 'screw_head_index', category: 'threading', icon: '🪛', title: 'Screw Head & Drive Library', description: 'Visualize fastener head dimensions, drive recess profiles (Hex, Torx, Socket), counterbore diameters, and hex key clearances.', borderColor: '#38bdf8' },
  { id: 'drill_point_length', category: 'machining', icon: '📐', title: 'Drill Point & Countersink Depth', description: 'Determine the extra point length of 118° and 135° drill bits to ensure complete breakthrough or accurate cylindrical depth in blind holes.', borderColor: '#a855f7' },
  { id: 'thread_milling', category: 'machining', icon: '🌀', title: 'CNC Thread Milling Generator', description: 'Generate ready-to-paste helical G-code (G02/G03) and compensated feed rates for internal and external CNC thread milling cycles.', borderColor: '#f59e0b' },
  { id: 'trig_solver', category: 'geometry', icon: '📐', title: 'Right Triangle Trig Solver', description: 'Solve unknown side lengths and angles from two known variables for daily shop floor chamfers, tapers, and dovetails.', borderColor: '#00ff80' },
  { id: 'polar_rectangular', category: 'geometry', icon: '🧭', title: 'Polar ⇄ Rectangular Converter', description: 'Convert bolt hole radii and angular positions into X/Y table coordinates (and vice versa) with live 4-quadrant plotting.', borderColor: '#ec4899' },
  { id: 'taper_angle', category: 'geometry', icon: '📐', title: 'Taper Angle & Standard Tapers', description: 'Convert between Taper Per Foot (TPF), compound rest angles, and standard toolroom tapers (Morse, B&S, R8, CAT/BT).', borderColor: '#38bdf8' },
  { id: 'true_position', category: 'metrology', icon: '🎯', title: 'True Position (GD&T) Calculator', description: 'Verify hole location deviations against MMC/LMC bonus tolerance limits with instant PASS/FAIL inspection verdicts.', borderColor: '#a855f7' },
  { id: 'fits_tolerances', category: 'metrology', icon: '📏', title: 'Fits & Tolerances (ISO/ANSI)', description: 'Determine exact shaft and hole tolerance limits (H7/g6, H7/p6, etc.) for clearance, transition, and interference fits.', borderColor: '#f59e0b' },
  { id: 'surface_finish', category: 'metrology', icon: '✨', title: 'Surface Finish Conversion', description: 'Translate roughness measurements across global standards (Ra, RMS, Rz, CLA, ISO N-Grades) and map them to shop capabilities.', borderColor: '#00ff80' },
  { id: 'hardness_conversion', category: 'metrology', icon: '🔬', title: 'Hardness & Tensile Conversion', description: 'Convert hardness readings between Rockwell (HRC/HRB), Brinell (HBW), and Vickers (HV) with tensile strength estimates.', borderColor: '#ec4899' },
  { id: 'material_weight', category: 'metallurgy', icon: '⚖️', title: 'Material Weight & Stock Calc', description: 'Estimate raw material weight for round, square, flat, hex, and tubing stock in steel, aluminum, brass, bronze, copper, and titanium.', borderColor: '#38bdf8' },
  { id: 'metallurgy_suite', category: 'metallurgy', icon: '🔥', title: 'Metallurgy & Thermal Suite', description: 'Explore heating, melting (solidus/liquidus), thermal expansion, and casting superheat temperatures across 21 industrial alloys.', borderColor: '#f59e0b' },
  { id: 'welding_suite', category: 'welding', icon: '🧑‍🏭', title: 'Welding & Fabrication Suite', description: '6 sub-calculators for heat input/arc energy, deposition rate, preheat CE IIW, weld groove volume, cost analysis, and duty cycle.', borderColor: '#00ff80' }
];

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('machinist_hub');
  const [stackTargetHeight, setStackTargetHeight] = useState<string | undefined>(undefined);
  const [hubCategory, setHubCategory] = useState<string>('all');
  const { unit, setUnit } = useUnit();

  // PWA Standalone & Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [showInstallGuide, setShowInstallGuide] = useState<boolean>(false);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone || 
                         document.referrer.includes('android-app://');
    if (isStandalone) {
      setIsAppInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallGuide(true);
    }
  };

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
    'material_weight',
    'metallurgy_suite',
    'welding_suite'
  ].includes(activeTab);

  const renderMachinistHub = () => (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '90px' }}>
      {/* Categorized Tool Sections mapped from Edits.md Taxonomy */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {HUB_CATEGORIES.filter((cat) => cat.id !== 'all' && (hubCategory === 'all' || hubCategory === cat.id)).map((cat, index) => {
          const categoryTools = HUB_TOOLS.filter((tool) => tool.category === cat.id);
          if (categoryTools.length === 0) return null;

          return (
            <div key={cat.id} style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {/* Ultra-Compact Section Header: Zero vertical waste */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                borderBottom: '1px solid rgba(56, 189, 248, 0.3)', 
                paddingBottom: '8px', 
                marginBottom: '14px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))', 
                    color: '#000', 
                    padding: '2px 8px', 
                    borderRadius: '10px', 
                    fontWeight: 800 
                  }}>
                    CAT {index + 1}
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    {cat.label}
                  </h2>
                  {cat.description && (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      — {cat.description}
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: '0.72rem', 
                  background: 'var(--bg-primary)', 
                  color: 'var(--accent-cyan)', 
                  padding: '3px 10px', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  border: '1px solid var(--border-color)'
                }}>
                  {categoryTools.length} {categoryTools.length === 1 ? 'Module' : 'Modules'}
                </div>
              </div>

              {/* Grid of Tools for this Category */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                {categoryTools.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => setActiveTab(tool.id)}
                    className="glass-panel"
                    style={{
                      padding: '18px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderLeft: `4px solid ${tool.borderColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.02)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1.25rem' }}>{tool.icon}</span>
                          <span>{tool.title}</span>
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        {tool.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky South Footer for Hub Categories */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 13, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '2px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 -6px 25px rgba(0, 0, 0, 0.7)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        zIndex: 1000
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '5px' }}>HUB CATEGORIES:</span>
        {HUB_CATEGORIES.map((cat) => {
          const isActive = hubCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setHubCategory(cat.id)}
              style={{
                background: isActive ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
                color: isActive ? '#000' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                padding: '6px 14px',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isActive ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
              }}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </footer>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {/* Top Navigation Bar */}
      <header style={{ 
        background: 'rgba(10, 13, 20, 0.85)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--border-color)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        padding: '8px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('machinist_hub')}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#000',
              fontSize: '1.15rem',
              boxShadow: '0 0 15px rgba(244, 144, 44, 0.3)'
            }}>
              M
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '1.5px', color: '#fff' }}>
                MACHINIST <span style={{ color: 'var(--accent-cyan)', fontWeight: 300 }}>// LIKE.AUDIO</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                PRECISION METROLOGY & INDUSTRIAL CALCULATORS
              </div>
            </div>
          </div>

          {/* Global Measurement Unit Switcher, Back to Hub button & PWA Install Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isMachinistTool && activeTab !== 'machinist_hub' && (
              <button
                onClick={() => setActiveTab('machinist_hub')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  background: 'rgba(244, 144, 44, 0.15)',
                  color: '#f59e0b',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  border: '1px solid rgba(244, 144, 44, 0.4)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ← HUB
              </button>
            )}
            {!isAppInstalled && (
              <button
                onClick={handleInstallClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  background: 'linear-gradient(135deg, var(--accent-cyan), #00ff80)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.5px'
                }}
                title="Install standalone app for browser-free shop floor use"
              >
                <span>📲</span> INSTALL APP
              </button>
            )}
            
            {/* Unit Toggle */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setUnit('imperial')}
                style={{
                  padding: '4px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: unit === 'imperial' ? '#f59e0b' : 'transparent',
                  color: unit === 'imperial' ? '#000' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
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
                  padding: '4px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: unit === 'metric' ? '#f59e0b' : 'transparent',
                  color: unit === 'metric' ? '#000' : 'var(--text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
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

      <main style={{ flex: 1, padding: '12px 20px 80px 20px' }}>
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
        ) : activeTab === 'metallurgy_suite' ? (
          <Metallurgy />
        ) : activeTab === 'welding_suite' ? (
          <WeldingSuite />
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
                  <li><strong>Standards Compliance:</strong> Formulas calibrated to industrial handbook standards (ASME, Machinery's Handbook).</li>
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

      {/* PWA Install Guide Modal */}
      {showInstallGuide && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '550px',
            width: '100%',
            padding: '30px',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
            position: 'relative',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ fontSize: '2.5rem' }}>📲</div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0 0 4px 0' }}>
                  Install Machinist Hub
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '1px' }}>
                  STANDALONE BROWSER-FREE MODE
                </span>
              </div>
            </div>

            {/* Embedded Math-to-Box Conversion Animation */}
            <div style={{ margin: '0 auto 15px auto', display: 'flex', justifyContent: 'center', background: 'rgba(5, 8, 17, 0.6)', borderRadius: '12px', padding: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <SplashScreen isModal={true} />
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Run Machinist Hub as a native app directly on your shop floor computer, tablet, or smartphone without address bars, tabs, or browser clutter.
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent-cyan)', marginBottom: '16px' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🖥️</span> Google Chrome / Edge (Desktop & Android)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Click the <strong>Install / App Available (⊕)</strong> icon on the right side of your browser address bar, or open the browser menu <strong>(⋮)</strong> and select <strong>"Install Machinist.like.audio"</strong> or <strong>"Add to Home screen"</strong>.
              </div>
            </div>

            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginBottom: '25px' }}>
              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📱</span> Apple iOS / iPadOS (Safari)
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tap the <strong>Share (⎋)</strong> button at the bottom of Safari, scroll down the options list, and tap <strong>"Add to Home Screen (➕)"</strong>.
              </div>
            </div>

            <button
              onClick={() => setShowInstallGuide(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                color: '#000',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)',
                letterSpacing: '1px'
              }}
            >
              GOT IT, CLOSE GUIDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
