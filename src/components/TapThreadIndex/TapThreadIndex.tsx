import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

export interface MetricThreadItem {
  id: string;
  nominal: string; // e.g. "M 6.00"
  pitch: number;   // e.g. 1
  rootRadius: number; // e.g. 0.144
  pitchDiameter: number; // e.g. 5.35
  minorDiameterD3: number; // e.g. 4.773
  minorDiameterD1: number; // e.g. 4.917
  threadHeightH3: number; // e.g. 0.613
  drillMm: number; // e.g. 5
}

export interface ImperialThreadItem {
  id: string;
  nominal: string; // e.g. "1/4-20" or "#10-32"
  type: 'USA' | 'NUMBER' | 'METRIC_SCREW';
  tpiOrPitch: string;
  tapDrillName: string; // e.g. "7" or "21"
  decIn: number;
  mmEq: number;
}

// ISO 724 / DIN 13 T1 Metric Screw Threads Database
export const METRIC_THREADS: MetricThreadItem[] = [
  { id: 'm1-00', nominal: 'M 1.00', pitch: 0.25, rootRadius: 0.036, pitchDiameter: 0.838, minorDiameterD3: 0.693, minorDiameterD1: 0.729, threadHeightH3: 0.153, drillMm: 0.75 },
  { id: 'm1-10', nominal: 'M 1.10', pitch: 0.25, rootRadius: 0.036, pitchDiameter: 0.938, minorDiameterD3: 0.793, minorDiameterD1: 0.829, threadHeightH3: 0.153, drillMm: 0.85 },
  { id: 'm1-20', nominal: 'M 1.20', pitch: 0.25, rootRadius: 0.036, pitchDiameter: 1.038, minorDiameterD3: 0.893, minorDiameterD1: 0.929, threadHeightH3: 0.153, drillMm: 0.95 },
  { id: 'm1-40', nominal: 'M 1.40', pitch: 0.30, rootRadius: 0.043, pitchDiameter: 1.205, minorDiameterD3: 1.032, minorDiameterD1: 1.075, threadHeightH3: 0.184, drillMm: 1.10 },
  { id: 'm1-60', nominal: 'M 1.60', pitch: 0.35, rootRadius: 0.051, pitchDiameter: 1.373, minorDiameterD3: 1.171, minorDiameterD1: 1.221, threadHeightH3: 0.215, drillMm: 1.25 },
  { id: 'm1-80', nominal: 'M 1.80', pitch: 0.35, rootRadius: 0.051, pitchDiameter: 1.573, minorDiameterD3: 1.371, minorDiameterD1: 1.421, threadHeightH3: 0.215, drillMm: 1.45 },
  { id: 'm2-00', nominal: 'M 2.00', pitch: 0.40, rootRadius: 0.058, pitchDiameter: 1.740, minorDiameterD3: 1.509, minorDiameterD1: 1.567, threadHeightH3: 0.245, drillMm: 1.60 },
  { id: 'm2-20', nominal: 'M 2.20', pitch: 0.45, rootRadius: 0.065, pitchDiameter: 1.908, minorDiameterD3: 1.648, minorDiameterD1: 1.713, threadHeightH3: 0.276, drillMm: 1.75 },
  { id: 'm2-50', nominal: 'M 2.50', pitch: 0.45, rootRadius: 0.065, pitchDiameter: 2.208, minorDiameterD3: 1.948, minorDiameterD1: 2.013, threadHeightH3: 0.276, drillMm: 2.05 },
  { id: 'm3-00', nominal: 'M 3.00', pitch: 0.50, rootRadius: 0.072, pitchDiameter: 2.675, minorDiameterD3: 2.387, minorDiameterD1: 2.459, threadHeightH3: 0.307, drillMm: 2.50 },
  { id: 'm3-50', nominal: 'M 3.50', pitch: 0.60, rootRadius: 0.087, pitchDiameter: 3.110, minorDiameterD3: 2.764, minorDiameterD1: 2.850, threadHeightH3: 0.368, drillMm: 2.90 },
  { id: 'm4-00', nominal: 'M 4.00', pitch: 0.70, rootRadius: 0.101, pitchDiameter: 3.545, minorDiameterD3: 3.141, minorDiameterD1: 3.242, threadHeightH3: 0.429, drillMm: 3.30 },
  { id: 'm4-50', nominal: 'M 4.50', pitch: 0.75, rootRadius: 0.108, pitchDiameter: 4.013, minorDiameterD3: 3.580, minorDiameterD1: 3.688, threadHeightH3: 0.460, drillMm: 3.80 },
  { id: 'm5-00', nominal: 'M 5.00', pitch: 0.80, rootRadius: 0.115, pitchDiameter: 4.480, minorDiameterD3: 4.019, minorDiameterD1: 4.134, threadHeightH3: 0.491, drillMm: 4.20 },
  { id: 'm6-00', nominal: 'M 6.00', pitch: 1.00, rootRadius: 0.144, pitchDiameter: 5.350, minorDiameterD3: 4.773, minorDiameterD1: 4.917, threadHeightH3: 0.613, drillMm: 5.00 },
  { id: 'm7-00', nominal: 'M 7.00', pitch: 1.00, rootRadius: 0.144, pitchDiameter: 6.350, minorDiameterD3: 5.773, minorDiameterD1: 5.917, threadHeightH3: 0.613, drillMm: 6.00 },
  { id: 'm8-00', nominal: 'M 8.00', pitch: 1.25, rootRadius: 0.180, pitchDiameter: 7.188, minorDiameterD3: 6.466, minorDiameterD1: 6.647, threadHeightH3: 0.767, drillMm: 6.80 },
  { id: 'm9-00', nominal: 'M 9.00', pitch: 1.25, rootRadius: 0.180, pitchDiameter: 8.188, minorDiameterD3: 7.466, minorDiameterD1: 7.647, threadHeightH3: 0.767, drillMm: 7.80 },
  { id: 'm10-00', nominal: 'M 10.00', pitch: 1.50, rootRadius: 0.217, pitchDiameter: 9.026, minorDiameterD3: 8.160, minorDiameterD1: 8.376, threadHeightH3: 0.920, drillMm: 8.50 },
  { id: 'm11-00', nominal: 'M 11.00', pitch: 1.50, rootRadius: 0.217, pitchDiameter: 10.026, minorDiameterD3: 9.160, minorDiameterD1: 9.376, threadHeightH3: 0.920, drillMm: 9.50 },
  { id: 'm12-00', nominal: 'M 12.00', pitch: 1.75, rootRadius: 0.253, pitchDiameter: 10.863, minorDiameterD3: 9.853, minorDiameterD1: 10.106, threadHeightH3: 1.074, drillMm: 10.20 },
  { id: 'm14-00', nominal: 'M 14.00', pitch: 2.00, rootRadius: 0.289, pitchDiameter: 12.701, minorDiameterD3: 11.546, minorDiameterD1: 11.835, threadHeightH3: 1.227, drillMm: 12.00 },
  { id: 'm16-00', nominal: 'M 16.00', pitch: 2.00, rootRadius: 0.289, pitchDiameter: 14.701, minorDiameterD3: 13.546, minorDiameterD1: 13.835, threadHeightH3: 1.227, drillMm: 14.00 },
  { id: 'm18-00', nominal: 'M 18.00', pitch: 2.50, rootRadius: 0.361, pitchDiameter: 16.376, minorDiameterD3: 14.933, minorDiameterD1: 15.394, threadHeightH3: 1.534, drillMm: 15.50 },
  { id: 'm20-00', nominal: 'M 20.00', pitch: 2.50, rootRadius: 0.361, pitchDiameter: 18.376, minorDiameterD3: 16.933, minorDiameterD1: 17.294, threadHeightH3: 1.534, drillMm: 17.50 },
  { id: 'm22-00', nominal: 'M 22.00', pitch: 2.50, rootRadius: 0.361, pitchDiameter: 20.376, minorDiameterD3: 18.933, minorDiameterD1: 19.294, threadHeightH3: 1.534, drillMm: 19.50 },
  { id: 'm24-00', nominal: 'M 24.00', pitch: 3.00, rootRadius: 0.433, pitchDiameter: 22.051, minorDiameterD3: 20.319, minorDiameterD1: 20.752, threadHeightH3: 1.840, drillMm: 21.00 },
  { id: 'm27-00', nominal: 'M 27.00', pitch: 3.00, rootRadius: 0.433, pitchDiameter: 25.051, minorDiameterD3: 23.319, minorDiameterD1: 23.752, threadHeightH3: 1.840, drillMm: 24.00 },
  { id: 'm30-00', nominal: 'M 30.00', pitch: 3.50, rootRadius: 0.505, pitchDiameter: 27.727, minorDiameterD3: 25.706, minorDiameterD1: 26.211, threadHeightH3: 2.147, drillMm: 26.50 },
  { id: 'm33-00', nominal: 'M 33.00', pitch: 3.50, rootRadius: 0.505, pitchDiameter: 30.727, minorDiameterD3: 28.706, minorDiameterD1: 29.211, threadHeightH3: 2.147, drillMm: 29.50 },
  { id: 'm36-00', nominal: 'M 36.00', pitch: 4.00, rootRadius: 0.577, pitchDiameter: 33.402, minorDiameterD3: 31.093, minorDiameterD1: 31.670, threadHeightH3: 2.454, drillMm: 32.00 },
  { id: 'm39-00', nominal: 'M 39.00', pitch: 4.00, rootRadius: 0.577, pitchDiameter: 36.402, minorDiameterD3: 34.093, minorDiameterD1: 34.670, threadHeightH3: 2.454, drillMm: 35.00 },
  { id: 'm42-00', nominal: 'M 42.00', pitch: 4.50, rootRadius: 0.650, pitchDiameter: 39.077, minorDiameterD3: 36.479, minorDiameterD1: 37.129, threadHeightH3: 2.760, drillMm: 37.50 },
  { id: 'm45-00', nominal: 'M 45.00', pitch: 4.50, rootRadius: 0.650, pitchDiameter: 42.077, minorDiameterD3: 39.479, minorDiameterD1: 40.129, threadHeightH3: 2.760, drillMm: 40.50 },
  { id: 'm48-00', nominal: 'M 48.00', pitch: 5.00, rootRadius: 0.722, pitchDiameter: 44.752, minorDiameterD3: 41.866, minorDiameterD1: 42.857, threadHeightH3: 3.067, drillMm: 43.00 },
  { id: 'm52-00', nominal: 'M 52.00', pitch: 5.00, rootRadius: 0.722, pitchDiameter: 48.752, minorDiameterD3: 45.866, minorDiameterD1: 46.587, threadHeightH3: 3.067, drillMm: 47.00 },
  { id: 'm56-00', nominal: 'M 56.00', pitch: 5.50, rootRadius: 0.794, pitchDiameter: 52.428, minorDiameterD3: 49.252, minorDiameterD1: 50.046, threadHeightH3: 3.374, drillMm: 50.50 },
  { id: 'm60-00', nominal: 'M 60.00', pitch: 5.50, rootRadius: 0.794, pitchDiameter: 56.428, minorDiameterD3: 53.252, minorDiameterD1: 54.046, threadHeightH3: 3.374, drillMm: 54.50 },
  { id: 'm64-00', nominal: 'M 64.00', pitch: 6.00, rootRadius: 0.866, pitchDiameter: 60.103, minorDiameterD3: 56.639, minorDiameterD1: 57.505, threadHeightH3: 3.681, drillMm: 58.00 },
  { id: 'm68-00', nominal: 'M 68.00', pitch: 6.00, rootRadius: 0.866, pitchDiameter: 64.103, minorDiameterD3: 60.639, minorDiameterD1: 61.505, threadHeightH3: 3.681, drillMm: 62.00 },
];

// USA Fractional & Number Screw Pitch Database
export const IMPERIAL_THREADS: ImperialThreadItem[] = [
  { id: 'num-0-80', nominal: '#0-80', type: 'NUMBER', tpiOrPitch: '80 TPI', tapDrillName: '3/64', decIn: 0.0469, mmEq: 1.1913 },
  { id: 'num-1-64', nominal: '#1-64', type: 'NUMBER', tpiOrPitch: '64 TPI', tapDrillName: '#53', decIn: 0.0595, mmEq: 1.5113 },
  { id: 'num-2-56', nominal: '#2-56', type: 'NUMBER', tpiOrPitch: '56 TPI', tapDrillName: '#50', decIn: 0.0700, mmEq: 1.7780 },
  { id: 'num-3-48', nominal: '#3-48', type: 'NUMBER', tpiOrPitch: '48 TPI', tapDrillName: '#47', decIn: 0.0785, mmEq: 1.9939 },
  { id: 'num-4-40', nominal: '#4-40', type: 'NUMBER', tpiOrPitch: '40 TPI', tapDrillName: '#43', decIn: 0.0890, mmEq: 2.2606 },
  { id: 'num-5-40', nominal: '#5-40', type: 'NUMBER', tpiOrPitch: '40 TPI', tapDrillName: '#38', decIn: 0.1015, mmEq: 2.5781 },
  { id: 'num-6-32', nominal: '#6-32', type: 'NUMBER', tpiOrPitch: '32 TPI', tapDrillName: '#36', decIn: 0.1065, mmEq: 2.7051 },
  { id: 'num-8-32', nominal: '#8-32', type: 'NUMBER', tpiOrPitch: '32 TPI', tapDrillName: '#29', decIn: 0.1360, mmEq: 3.4544 },
  { id: 'num-10-24', nominal: '#10-24', type: 'NUMBER', tpiOrPitch: '24 TPI', tapDrillName: '#25', decIn: 0.1495, mmEq: 3.7973 },
  { id: 'num-10-32', nominal: '#10-32', type: 'NUMBER', tpiOrPitch: '32 TPI', tapDrillName: '#21', decIn: 0.1590, mmEq: 4.0386 },
  { id: 'num-12-24', nominal: '#12-24', type: 'NUMBER', tpiOrPitch: '24 TPI', tapDrillName: '#16', decIn: 0.1770, mmEq: 4.4958 },
  { id: 'num-12-28', nominal: '#12-28', type: 'NUMBER', tpiOrPitch: '28 TPI', tapDrillName: '#14', decIn: 0.1820, mmEq: 4.6228 },
  { id: 'usa-1-4-20', nominal: '1/4-20', type: 'USA', tpiOrPitch: '20 TPI', tapDrillName: '#7', decIn: 0.2010, mmEq: 5.1054 },
  { id: 'usa-1-4-28', nominal: '1/4-28', type: 'USA', tpiOrPitch: '28 TPI', tapDrillName: '#3', decIn: 0.2130, mmEq: 5.4102 },
  { id: 'usa-5-16-18', nominal: '5/16-18', type: 'USA', tpiOrPitch: '18 TPI', tapDrillName: 'F', decIn: 0.2570, mmEq: 6.5278 },
  { id: 'usa-5-16-24', nominal: '5/16-24', type: 'USA', tpiOrPitch: '24 TPI', tapDrillName: 'I', decIn: 0.2720, mmEq: 6.9088 },
  { id: 'usa-3-8-16', nominal: '3/8-16', type: 'USA', tpiOrPitch: '16 TPI', tapDrillName: '5/16', decIn: 0.3125, mmEq: 7.9375 },
  { id: 'usa-3-8-24', nominal: '3/8-24', type: 'USA', tpiOrPitch: '24 TPI', tapDrillName: 'Q', decIn: 0.3320, mmEq: 8.4328 },
  { id: 'usa-7-16-14', nominal: '7/16-14', type: 'USA', tpiOrPitch: '14 TPI', tapDrillName: 'U', decIn: 0.3680, mmEq: 9.3472 },
  { id: 'usa-7-16-20', nominal: '7/16-20', type: 'USA', tpiOrPitch: '20 TPI', tapDrillName: 'W', decIn: 0.3860, mmEq: 9.8044 },
  { id: 'usa-1-2-13', nominal: '1/2-13', type: 'USA', tpiOrPitch: '13 TPI', tapDrillName: '27/64', decIn: 0.4219, mmEq: 10.7163 },
  { id: 'usa-1-2-20', nominal: '1/2-20', type: 'USA', tpiOrPitch: '20 TPI', tapDrillName: '29/64', decIn: 0.4531, mmEq: 11.5087 },
  { id: 'usa-9-16-12', nominal: '9/16-12', type: 'USA', tpiOrPitch: '12 TPI', tapDrillName: '31/64', decIn: 0.4844, mmEq: 12.3038 },
  { id: 'usa-9-16-18', nominal: '9/16-18', type: 'USA', tpiOrPitch: '18 TPI', tapDrillName: '33/64', decIn: 0.5156, mmEq: 13.0962 },
  { id: 'usa-5-8-11', nominal: '5/8-11', type: 'USA', tpiOrPitch: '11 TPI', tapDrillName: '17/32', decIn: 0.5313, mmEq: 13.4938 },
  { id: 'usa-5-8-18', nominal: '5/8-18', type: 'USA', tpiOrPitch: '18 TPI', tapDrillName: '37/64', decIn: 0.5781, mmEq: 14.6837 },
  { id: 'usa-3-4-10', nominal: '3/4-10', type: 'USA', tpiOrPitch: '10 TPI', tapDrillName: '21/32', decIn: 0.6563, mmEq: 16.6688 },
  { id: 'usa-3-4-16', nominal: '3/4-16', type: 'USA', tpiOrPitch: '16 TPI', tapDrillName: '11/16', decIn: 0.6875, mmEq: 17.4625 },
  { id: 'usa-7-8-9', nominal: '7/8-9', type: 'USA', tpiOrPitch: '9 TPI', tapDrillName: '49/64', decIn: 0.7656, mmEq: 19.4462 },
  { id: 'usa-7-8-14', nominal: '7/8-14', type: 'USA', tpiOrPitch: '14 TPI', tapDrillName: '13/16', decIn: 0.8125, mmEq: 20.6375 },
  { id: 'usa-1-8', nominal: '1.0-8', type: 'USA', tpiOrPitch: '8 TPI', tapDrillName: '7/8', decIn: 0.8750, mmEq: 22.2250 },
  { id: 'usa-1-12', nominal: '1.0-12', type: 'USA', tpiOrPitch: '12 TPI', tapDrillName: '59/64', decIn: 0.9219, mmEq: 23.4163 },
  { id: 'usa-1-14', nominal: '1.0-14', type: 'USA', tpiOrPitch: '14 TPI', tapDrillName: '15/16', decIn: 0.9375, mmEq: 23.8125 },
  { id: 'usa-1-1-8-7', nominal: '1-1/8-7', type: 'USA', tpiOrPitch: '7 TPI', tapDrillName: '63/64', decIn: 0.9844, mmEq: 25.0038 },
  { id: 'usa-1-1-4-7', nominal: '1-1/4-7', type: 'USA', tpiOrPitch: '7 TPI', tapDrillName: '1-7/64', decIn: 1.1094, mmEq: 28.1781 },
  { id: 'usa-1-1-2-6', nominal: '1-1/2-6', type: 'USA', tpiOrPitch: '6 TPI', tapDrillName: '1-11/32', decIn: 1.3438, mmEq: 34.1313 },
];

export const TapThreadIndex: React.FC = () => {
  const { unit } = useUnit();
  const [activeTab, setActiveTab] = useState<'metric' | 'imperial'>(unit);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetricId, setSelectedMetricId] = useState<string>('m6-00');
  const [selectedImperialId, setSelectedImperialId] = useState<string>('usa-1-4-20');

  React.useEffect(() => {
    setActiveTab(unit);
  }, [unit]);

  const filteredMetric = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return METRIC_THREADS.filter(m => !q || m.nominal.toLowerCase().includes(q) || m.pitch.toString().includes(q) || m.drillMm.toString().includes(q));
  }, [searchQuery]);

  const filteredImperial = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return IMPERIAL_THREADS.filter(i => !q || i.nominal.toLowerCase().includes(q) || i.tapDrillName.toLowerCase().includes(q) || i.tpiOrPitch.toLowerCase().includes(q));
  }, [searchQuery]);

  const selMetric = useMemo(() => METRIC_THREADS.find(m => m.id === selectedMetricId) || METRIC_THREADS[14], [selectedMetricId]);
  const selImperial = useMemo(() => IMPERIAL_THREADS.find(i => i.id === selectedImperialId) || IMPERIAL_THREADS[12], [selectedImperialId]);

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
            ISO 724 & ASME THREAD REFERENCE // TAP DRILL SELECTOR
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Interactive Tap & Thread Reference Index
          </h2>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <button
            onClick={() => { setActiveTab('metric'); setSearchQuery(''); }}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '6px',
              background: activeTab === 'metric' ? 'var(--accent-cyan)' : 'transparent',
              color: activeTab === 'metric' ? '#000' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            📏 Metric ISO 724 ({METRIC_THREADS.length})
          </button>
          <button
            onClick={() => { setActiveTab('imperial'); setSearchQuery(''); }}
            style={{
              padding: '8px 18px',
              border: 'none',
              borderRadius: '6px',
              background: activeTab === 'imperial' ? '#f59e0b' : 'transparent',
              color: activeTab === 'imperial' ? '#000' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            🔩 USA Fractional / Number ({IMPERIAL_THREADS.length})
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>
        
        {/* Left Card: Search & Table */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={activeTab === 'metric' ? "Search metric thread (e.g., M6, 1.5 pitch, 8.5mm drill)..." : "Search USA thread (e.g., 1/4-20, #10-32, #7 drill)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-precision"
              style={{ width: '100%', paddingLeft: '38px' }}
            />
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Table Output */}
          <div style={{ 
            maxHeight: '480px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '6px', 
            paddingRight: '6px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            padding: '8px'
          }}>
            {activeTab === 'metric' ? (
              filteredMetric.map(thr => {
                const isSelected = thr.id === selectedMetricId;
                return (
                  <div
                    key={thr.id}
                    onClick={() => setSelectedMetricId(thr.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: isSelected ? 'linear-gradient(90deg, rgba(0, 240, 255, 0.2), rgba(0, 128, 255, 0.1))' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-cyan)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: isSelected ? 'var(--accent-cyan)' : '#fff' }}>{thr.nominal}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>Pitch: {thr.pitch} mm</span>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TAP DRILL</span>
                      <strong style={{ color: '#00f0ff', fontSize: '1rem' }}>{thr.drillMm} mm</strong>
                    </div>
                  </div>
                );
              })
            ) : (
              filteredImperial.map(thr => {
                const isSelected = thr.id === selectedImperialId;
                return (
                  <div
                    key={thr.id}
                    onClick={() => setSelectedImperialId(thr.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '6px',
                      background: isSelected ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.1))' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? '#f59e0b' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: isSelected ? '#f59e0b' : '#fff' }}>{thr.nominal}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '10px' }}>{thr.tpiOrPitch}</span>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TAP DRILL</span>
                      <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>{thr.tapDrillName} ({thr.decIn.toFixed(4)}")</strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Card (Ordered Left: order: -1): Thread Profile Geometry & Tap Drill Visualizer */}
        <div className="glass-panel" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)', order: -1 }}>
          
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                THREAD GEOMETRY & DRILL SPECS
              </span>
              <h3 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {activeTab === 'metric' ? selMetric.nominal : selImperial.nominal}
              </h3>
            </div>
            <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>RECOMMENDED DRILL</span>
              <strong style={{ fontSize: '1.4rem', color: activeTab === 'metric' ? 'var(--accent-cyan)' : '#fbbf24' }}>
                {activeTab === 'metric' ? `${selMetric.drillMm} mm` : `${selImperial.tapDrillName}`}
              </strong>
            </div>
          </div>

          {/* SVG Thread Tooth Geometry Diagram */}
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid',
            borderColor: activeTab === 'metric' ? 'var(--accent-cyan)' : '#fbbf24',
            padding: '25px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ position: 'absolute', top: '10px', left: '15px', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              60° METRIC / UNIFIED THREAD TOOTH PROFILE
            </div>

            <svg viewBox="0 0 320 130" style={{ width: '100%', maxWidth: '300px', height: '130px', marginTop: '10px' }}>
              <defs>
                <linearGradient id="threadToothGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>

              {/* Pitch Line */}
              <line x1="20" y1="65" x2="300" y2="65" stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" />
              <text x="290" y="60" fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="end">PITCH LINE (d2 / D2)</text>

              {/* Thread Tooth Polygon (3 teeth) */}
              <path
                d="M 20 110 L 40 30 L 60 30 L 90 110 L 110 110 L 140 30 L 160 30 L 190 110 L 210 110 L 240 30 L 260 30 L 290 110 L 300 110 L 300 125 L 20 125 Z"
                fill="url(#threadToothGrad)"
                stroke={activeTab === 'metric' ? 'var(--accent-cyan)' : '#fbbf24'}
                strokeWidth="2"
                strokeLinejoin="round"
              />

              {/* Dimension callouts */}
              {activeTab === 'metric' && (
                <>
                  <line x1="140" y1="20" x2="240" y2="20" stroke="#00f0ff" strokeWidth="1" />
                  <text x="190" y="16" fill="#00f0ff" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                    Pitch (P) = {selMetric.pitch} mm
                  </text>
                  <text x="150" y="80" fill="#fff" fontSize="8" fontWeight="700" fontFamily="var(--font-mono)">
                    H3 = {selMetric.threadHeightH3} mm
                  </text>
                  <text x="50" y="105" fill="#94a3b8" fontSize="8" fontFamily="var(--font-mono)">
                    r = {selMetric.rootRadius}
                  </text>
                </>
              )}

              {activeTab === 'imperial' && (
                <>
                  <text x="190" y="18" fill="#fbbf24" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="var(--font-mono)">
                    {selImperial.tpiOrPitch}
                  </text>
                  <text x="150" y="80" fill="#fff" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)">
                    Tap Drill: {selImperial.tapDrillName}
                  </text>
                </>
              )}
            </svg>

            {/* Detailed Parameter Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', width: '100%', marginTop: '15px', background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '6px' }}>
              {activeTab === 'metric' ? (
                <>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>MAJOR DIA (d = D)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{selMetric.nominal.replace('M ', '')} mm</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>PITCH DIA (d2 = D2)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{selMetric.pitchDiameter} mm</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>MINOR DIA (D3 / D1)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{selMetric.minorDiameterD3} / {selMetric.minorDiameterD1} mm</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>THREAD HEIGHT (H3)</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{selMetric.threadHeightH3} mm</strong>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>TAP DRILL SIZE</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24', fontSize: '1.1rem' }}>{selImperial.tapDrillName}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DECIMAL EQUIVALENT</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>{selImperial.decIn.toFixed(4)}"</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>METRIC EQUIVALENT</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{selImperial.mmEq.toFixed(3)} mm</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>THREAD TYPE</span>
                    <strong style={{ fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>{selImperial.type === 'USA' ? 'Unified National (UNC/UNF)' : 'American Number Machine Screw'}</strong>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TapThreadIndex;
