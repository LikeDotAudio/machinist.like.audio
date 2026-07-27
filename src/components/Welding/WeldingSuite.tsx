import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

type WeldingSubTab = 
  | 'heat_input' 
  | 'deposition_rate' 
  | 'preheat_ce' 
  | 'weld_volume' 
  | 'welding_cost' 
  | 'duty_cycle';

export const WeldingSuite: React.FC = () => {
  const { unit: globalUnit } = useUnit();
  const unit: 'in' | 'mm' = globalUnit === 'imperial' ? 'in' : 'mm';

  const [activeTab, setActiveTab] = useState<WeldingSubTab>('heat_input');

  // 1. Heat Input State
  const [hiAmps, setHiAmps] = useState<string>('150');
  const [hiVolts, setHiVolts] = useState<string>('22.5');
  const [hiSpeed, setHiSpeed] = useState<string>('10.0'); // in/min or mm/min

  // 2. Deposition Rate State
  const [depWfs, setDepWfs] = useState<string>('350'); // in/min or m/min
  const [depDia, setDepDia] = useState<string>('0.035'); // wire diameter
  const [depEff, setDepEff] = useState<string>('92'); // efficiency %
  const [depDensity, setDepDensity] = useState<string>('0.284'); // steel density lb/in3

  // 3. Preheat / CE State
  const [ceC, setCeC] = useState<string>('0.22');
  const [ceMn, setCeMn] = useState<string>('1.20');
  const [ceCr, setCeCr] = useState<string>('0.15');
  const [ceMo, setCeMo] = useState<string>('0.05');
  const [ceV, setCeV] = useState<string>('0.02');
  const [ceNi, setCeNi] = useState<string>('0.10');
  const [ceCu, setCeCu] = useState<string>('0.15');
  const [ceThickness, setCeThickness] = useState<string>('0.75'); // plate thickness

  // 4. Weld Volume State
  const [volAngle, setVolAngle] = useState<string>('60'); // groove angle deg
  const [volRootGap, setVolRootGap] = useState<string>('0.125'); // root opening
  const [volThickness, setVolThickness] = useState<string>('0.500'); // plate thickness
  const [volLength, setVolLength] = useState<string>('20.0'); // joint length in feet or meters
  const [volEff, setVolEff] = useState<string>('85'); // % efficiency

  // 5. Cost State
  const [costLaborRate, setCostLaborRate] = useState<string>('65.00'); // $/hr
  const [costOpFactor, setCostOpFactor] = useState<string>('35'); // % arc time
  const [costWirePrice, setCostWirePrice] = useState<string>('3.50'); // $/lb or $/kg
  const [costGasFlow, setCostGasFlow] = useState<string>('35'); // CFH or L/min
  const [costGasPrice, setCostGasPrice] = useState<string>('0.15'); // $/CF
  const [costDepRate, setCostDepRate] = useState<string>('8.5'); // lb/hr or kg/hr
  const [costJobLength, setCostJobLength] = useState<string>('50'); // ft or m
  const [costWeightPerUnit, setCostWeightPerUnit] = useState<string>('0.45'); // lb/ft or kg/m

  // 6. Duty Cycle State
  const [dcRatedAmps, setDcRatedAmps] = useState<string>('200');
  const [dcRatedPct, setDcRatedPct] = useState<string>('60');
  const [dcDesiredAmps, setDcDesiredAmps] = useState<string>('240');

  // Calculations
  const hiCalc = useMemo(() => {
    const A = parseFloat(hiAmps) || 0;
    const V = parseFloat(hiVolts) || 0;
    const S = parseFloat(hiSpeed) || 1; // avoid / 0
    // HI (kJ/in or kJ/mm) = (A * V * 60) / (S * 1000)
    const hi = (A * V * 60) / (S * 1000);
    const unitLabel = unit === 'in' ? 'kJ/in' : 'kJ/mm';
    return { hi, unitLabel };
  }, [hiAmps, hiVolts, hiSpeed, unit]);

  const depCalc = useMemo(() => {
    const wfs = parseFloat(depWfs) || 0;
    const dia = parseFloat(depDia) || 0;
    const eff = (parseFloat(depEff) || 100) / 100;
    const rho = parseFloat(depDensity) || 0.284;

    let rate = 0;
    if (unit === 'in') {
      // Area = pi * dia^2 / 4; Rate (lb/hr) = WFS(in/min) * 60 * Area * rho * eff
      const area = Math.PI * Math.pow(dia, 2) / 4;
      rate = wfs * 60 * area * rho * eff;
    } else {
      // Metric: wfs in m/min, dia in mm, rho in g/cm3 -> kg/hr
      // Area in mm2 = pi * dia^2 / 4; vol in m3/min = wfs * (area / 1e6); kg/hr = vol * rho * 1000 * 60 * eff
      const areaMm2 = Math.PI * Math.pow(dia, 2) / 4;
      const volCm3Min = wfs * 100 * (areaMm2 / 100);
      rate = (volCm3Min * rho * 60 * eff) / 1000;
    }
    const unitLabel = unit === 'in' ? 'lb/hr' : 'kg/hr';
    return { rate, unitLabel };
  }, [depWfs, depDia, depEff, depDensity, unit]);

  const ceCalc = useMemo(() => {
    const C = parseFloat(ceC) || 0;
    const Mn = parseFloat(ceMn) || 0;
    const Cr = parseFloat(ceCr) || 0;
    const Mo = parseFloat(ceMo) || 0;
    const V = parseFloat(ceV) || 0;
    const Ni = parseFloat(ceNi) || 0;
    const Cu = parseFloat(ceCu) || 0;
    const T = parseFloat(ceThickness) || 0.5;

    const ce = C + (Mn / 6) + ((Cr + Mo + V) / 5) + ((Ni + Cu) / 15);
    let risk = 'Low Risk';
    let riskColor = '#00ff80';
    let preheatF = 50; // room temp / moisture warm

    if (ce > 0.52) {
      risk = 'Extreme Risk (Tool/Armor Steel)';
      riskColor = '#ef4444';
      preheatF = T > (unit === 'in' ? 0.5 : 12.7) ? 400 : 350;
    } else if (ce > 0.45) {
      risk = 'High Risk (Low Hydrogen Required)';
      riskColor = '#f97316';
      preheatF = T > (unit === 'in' ? 0.5 : 12.7) ? 300 : 250;
    } else if (ce > 0.40) {
      risk = 'Moderate Risk';
      riskColor = '#f59e0b';
      preheatF = T > (unit === 'in' ? 0.5 : 12.7) ? 200 : 150;
    }

    const preheatC = Math.round((preheatF - 32) * 5 / 9);
    const preheatDisplay = unit === 'in' ? `${preheatF}°F` : `${preheatC}°C`;

    return { ce, risk, riskColor, preheatDisplay, preheatF, preheatC };
  }, [ceC, ceMn, ceCr, ceMo, ceV, ceNi, ceCu, ceThickness, unit]);

  const volCalc = useMemo(() => {
    const angle = parseFloat(volAngle) || 60;
    const gap = parseFloat(volRootGap) || 0;
    const T = parseFloat(volThickness) || 0.5;
    const L = parseFloat(volLength) || 10; // ft or m
    const eff = (parseFloat(volEff) || 85) / 100;

    const angleRad = (angle * Math.PI) / 180;
    // Single-V groove cross sectional area: A = T^2 * tan(angle/2) + gap * T + cap reinforcement (~10%)
    const areaGroove = Math.pow(T, 2) * Math.tan(angleRad / 2) + (gap * T);
    const totalArea = areaGroove * 1.10; // add 10% for cap

    let weight = 0;
    if (unit === 'in') {
      // Area in in2, L in ft -> volume in in3 = totalArea * L * 12; steel rho ~ 0.284
      const volIn3 = totalArea * L * 12;
      weight = (volIn3 * 0.284) / eff;
    } else {
      // Area in mm2, L in m -> volume in mm3 = totalArea * L * 1000 -> cm3 = / 1000; kg = cm3 * 7.85 / 1000 / eff
      const volCm3 = totalArea * L;
      weight = (volCm3 * 7.85 / 1000) / eff;
    }

    const unitLabel = unit === 'in' ? 'lbs' : 'kg';
    const areaUnit = unit === 'in' ? 'in²' : 'mm²';
    return { totalArea, areaUnit, weight, unitLabel };
  }, [volAngle, volRootGap, volThickness, volLength, volEff, unit]);

  const costCalc = useMemo(() => {
    const laborRate = parseFloat(costLaborRate) || 0;
    const opFactor = (parseFloat(costOpFactor) || 35) / 100;
    const wirePrice = parseFloat(costWirePrice) || 0;
    const gasFlow = parseFloat(costGasFlow) || 0;
    const gasPrice = parseFloat(costGasPrice) || 0;
    const depRate = parseFloat(costDepRate) || 5;
    const jobLen = parseFloat(costJobLength) || 100;
    const wPerUnit = parseFloat(costWeightPerUnit) || 0.5; // lb/ft or kg/m

    // Time to deposit 1 unit length (ft or m) in hours = wPerUnit / depRate
    const arcHoursPerUnit = wPerUnit / depRate;
    const totalHoursPerUnit = arcHoursPerUnit / opFactor;

    const laborCostPerUnit = totalHoursPerUnit * laborRate;
    const fillerCostPerUnit = wPerUnit * wirePrice;
    const gasCostPerUnit = totalHoursPerUnit * gasFlow * gasPrice;

    const totalCostPerUnit = laborCostPerUnit + fillerCostPerUnit + gasCostPerUnit;
    const totalJobCost = totalCostPerUnit * jobLen;

    const unitLabel = unit === 'in' ? '$/ft' : '$/m';
    return { laborCostPerUnit, fillerCostPerUnit, gasCostPerUnit, totalCostPerUnit, totalJobCost, unitLabel };
  }, [costLaborRate, costOpFactor, costWirePrice, costGasFlow, costGasPrice, costDepRate, costJobLength, costWeightPerUnit, unit]);

  const dcCalc = useMemo(() => {
    const I_rated = parseFloat(dcRatedAmps) || 200;
    const N_rated = parseFloat(dcRatedPct) || 60;
    const I_des = parseFloat(dcDesiredAmps) || 200;

    // N_new = (I_rated / I_desired)^2 * N_rated
    const newPct = Math.min(100, Math.pow(I_rated / I_des, 2) * N_rated);
    const arcOnMin = (newPct / 100) * 10;
    const restMin = Math.max(0, 10 - arcOnMin);
    const isOverheated = I_des > I_rated && newPct < 20;

    return { newPct, arcOnMin, restMin, isOverheated };
  }, [dcRatedAmps, dcRatedPct, dcDesiredAmps]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '90px', color: 'var(--text-primary)' }}>
      {/* Ultra-compact inline header: zero vertical waste */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🔥</span>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Welding Mathematics Suite</h1>
          <span style={{ fontSize: '0.75rem', background: 'rgba(244, 144, 44, 0.15)', color: 'var(--accent-cyan)', padding: '2px 10px', borderRadius: '12px', fontWeight: 700, border: '1px solid rgba(244, 144, 44, 0.3)' }}>6 Modular Sub-Pages</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Arc energy, deposition, CE preheat, volume & cost
        </div>
      </div>

      {/* SUB-PAGE 1: HEAT INPUT */}
      {activeTab === 'heat_input' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid var(--accent-cyan)' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            🔥 Sub-Page 1: Heat Input & Arc Thermal Energy Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Calculate total arc energy transferred into the base metal (HI = [A × V × 60] / [S × 1000]). Proper heat input prevents HAZ grain coarsening and underbead brittleness.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Welding Current (Amperes A)
                  </label>
                  <input type="number" step="5" value={hiAmps} onChange={(e) => setHiAmps(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Arc Voltage (Volts V)
                  </label>
                  <input type="number" step="0.5" value={hiVolts} onChange={(e) => setHiVolts(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Travel Speed ({unit === 'in' ? 'in/min' : 'mm/min'})
                  </label>
                  <input type="number" step="0.5" value={hiSpeed} onChange={(e) => setHiSpeed(e.target.value)} className="input-precision" />
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(244, 144, 44, 0.12), rgba(15, 23, 42, 0.6))', border: '2px solid rgba(244, 144, 44, 0.5)', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Total Heat Input ($HI$)
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {hiCalc.hi.toFixed(2)} <span style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>{hiCalc.unitLabel}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
                Thermal Pulse Energy: {hiCalc.hi < 35 ? '❄️ Low / Rapid Quench Risk' : hiCalc.hi > 80 ? '🔥 High / HAZ Coarsening Risk' : '✅ Balanced Structural Zone'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 2: DEPOSITION RATE */}
      {activeTab === 'deposition_rate' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #00ff80' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            ⚖️ Sub-Page 2: Filler Metal Deposition Rate Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Calculate continuous hourly mass output (R = WFS × A_wire × Density × 60 × Efficiency). Essential for estimating job completion times and consumable consumption.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Wire Feed Speed ({unit === 'in' ? 'in/min' : 'm/min'})
                  </label>
                  <input type="number" step="10" value={depWfs} onChange={(e) => setDepWfs(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Wire Dia ({unit === 'in' ? 'in' : 'mm'})
                  </label>
                  <input type="number" step={unit === 'in' ? '0.005' : '0.2'} value={depDia} onChange={(e) => setDepDia(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Process Efficiency (%)
                  </label>
                  <input type="number" step="1" value={depEff} onChange={(e) => setDepEff(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Density ({unit === 'in' ? 'lb/in³' : 'g/cm³'})
                  </label>
                  <input type="number" step="0.01" value={depDensity} onChange={(e) => setDepDensity(e.target.value)} className="input-precision" />
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(0, 255, 128, 0.12), rgba(15, 23, 42, 0.6))', border: '2px solid rgba(0, 255, 128, 0.5)', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#00ff80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Continuous Hourly Output ($R$)
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {depCalc.rate.toFixed(2)} <span style={{ fontSize: '1.5rem', color: '#00ff80' }}>{depCalc.unitLabel}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
                Process Efficiency: <strong>{depEff}%</strong> (Accounts for spatter & slag loss)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 3: PREHEAT & CE IIW */}
      {activeTab === 'preheat_ce' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #f59e0b' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            🌡️ Sub-Page 3: Carbon Equivalent (CE_IIW) & Preheat Temperature Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Predict steel hardenability (CE = %C + %Mn/6 + [%Cr+%Mo+%V]/5 + [%Ni+%Cu]/15) and determine mandatory minimum preheat temperature to prevent underbead cold cracking.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Carbon (C)</label>
                  <input type="number" step="0.01" value={ceC} onChange={(e) => setCeC(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Mang (Mn)</label>
                  <input type="number" step="0.05" value={ceMn} onChange={(e) => setCeMn(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Chrom (Cr)</label>
                  <input type="number" step="0.02" value={ceCr} onChange={(e) => setCeCr(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Moly (Mo)</label>
                  <input type="number" step="0.01" value={ceMo} onChange={(e) => setCeMo(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Vanad (V)</label>
                  <input type="number" step="0.01" value={ceV} onChange={(e) => setCeV(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Nickel (Ni)</label>
                  <input type="number" step="0.02" value={ceNi} onChange={(e) => setCeNi(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>% Copper (Cu)</label>
                  <input type="number" step="0.02" value={ceCu} onChange={(e) => setCeCu(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Thick ({unit === 'in' ? 'in' : 'mm'})</label>
                  <input type="number" step="0.125" value={ceThickness} onChange={(e) => setCeThickness(e.target.value)} className="input-precision" />
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.6))', border: `2px solid ${ceCalc.riskColor}`, borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: ceCalc.riskColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Carbon Equivalent (CE_IIW) // {ceCalc.risk}
              </div>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', margin: '8px 0' }}>
                {ceCalc.ce.toFixed(3)}%
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Recommended Min Preheat: </span>
                <strong style={{ color: ceCalc.riskColor, fontSize: '1.4rem', fontFamily: 'var(--font-mono)' }}>{ceCalc.preheatDisplay}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 4: WELD VOLUME & CONSUMABLES */}
      {activeTab === 'weld_volume' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #c084fc' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            🔩 Sub-Page 4: Weld Groove Volume & Consumable Weight Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Calculate Single-V butt joint cross-sectional area and determine exact filler metal purchase pounds or kilograms required for a weld seam.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Groove Angle (Deg °)
                  </label>
                  <input type="number" step="5" value={volAngle} onChange={(e) => setVolAngle(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Root Opening ({unit === 'in' ? 'in' : 'mm'})
                  </label>
                  <input type="number" step="0.031" value={volRootGap} onChange={(e) => setVolRootGap(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Plate Thick ({unit === 'in' ? 'in' : 'mm'})
                  </label>
                  <input type="number" step="0.125" value={volThickness} onChange={(e) => setVolThickness(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Joint Length ({unit === 'in' ? 'ft' : 'm'})
                  </label>
                  <input type="number" step="5" value={volLength} onChange={(e) => setVolLength(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Deposition Eff (%)
                  </label>
                  <input type="number" step="5" min="1" max="100" value={volEff} onChange={(e) => setVolEff(e.target.value)} className="input-precision" />
                </div>
              </div>

              {/* Interactive SVG V-Groove */}
              <div style={{ marginTop: '20px', background: '#0a0e17', padding: '15px', borderRadius: '8px', border: '1px solid rgba(192, 132, 252, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Single-V Butt Joint Profile (@ {volAngle}° Groove / Root: {volRootGap} {unit === 'in' ? 'in' : 'mm'})
                </div>
                <svg viewBox="0 0 300 100" style={{ width: '100%', height: 'auto', maxHeight: '90px' }}>
                  {/* Left Plate */}
                  <polygon points="20,20 110,20 135,80 20,80" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.5" />
                  {/* Right Plate */}
                  <polygon points="280,20 190,20 165,80 280,80" fill="rgba(255,255,255,0.15)" stroke="#fff" strokeWidth="1.5" />
                  {/* Weld Metal Fill */}
                  <polygon points="110,20 190,20 165,80 135,80" fill="rgba(192, 132, 252, 0.5)" stroke="#c084fc" strokeWidth="2" />
                  <text x="150" y="55" fill="#fff" fontSize="12" fontWeight="bold" textAnchor="middle">{volAngle}°</text>
                </svg>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.12), rgba(15, 23, 42, 0.6))', border: '2px solid rgba(192, 132, 252, 0.5)', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Required Filler Purchase Weight (W_req)
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {volCalc.weight.toFixed(2)} <span style={{ fontSize: '1.5rem', color: '#c084fc' }}>{volCalc.unitLabel}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
                Groove Area: <strong>{volCalc.totalArea.toFixed(4)} {volCalc.areaUnit}</strong> (Includes 10% cap reinforcement)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 5: COST ANALYSIS */}
      {activeTab === 'welding_cost' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #38bdf8' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            💰 Sub-Page 5: Comprehensive Welding Cost Analysis Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Combine labor rate, operating factor (arc time %), filler metal price, and shielding gas flow to compute exact cost per unit length and total project bid cost.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Labor & Overhead ($/hr)
                  </label>
                  <input type="number" step="5" value={costLaborRate} onChange={(e) => setCostLaborRate(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Operating Factor (Arc-On %)
                  </label>
                  <input type="number" step="5" value={costOpFactor} onChange={(e) => setCostOpFactor(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Filler Price ($/{unit === 'in' ? 'lb' : 'kg'})
                  </label>
                  <input type="number" step="0.50" value={costWirePrice} onChange={(e) => setCostWirePrice(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Deposition Rate ({unit === 'in' ? 'lb/hr' : 'kg/hr'})
                  </label>
                  <input type="number" step="0.5" value={costDepRate} onChange={(e) => setCostDepRate(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Gas Flow ({unit === 'in' ? 'CFH' : 'L/min'}) & Price
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input type="number" step="5" value={costGasFlow} onChange={(e) => setCostGasFlow(e.target.value)} className="input-precision" style={{ width: '50%' }} />
                    <input type="number" step="0.05" value={costGasPrice} onChange={(e) => setCostGasPrice(e.target.value)} className="input-precision" style={{ width: '50%' }} title="$/CF" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Total Job Length ({unit === 'in' ? 'ft' : 'm'})
                  </label>
                  <input type="number" step="10" value={costJobLength} onChange={(e) => setCostJobLength(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Weld Wt ({unit === 'in' ? 'lb/ft' : 'kg/m'})
                  </label>
                  <input type="number" step="0.05" value={costWeightPerUnit} onChange={(e) => setCostWeightPerUnit(e.target.value)} className="input-precision" />
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(15, 23, 42, 0.6))', border: '2px solid rgba(56, 189, 248, 0.5)', borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Total Job Bid Cost ({costJobLength} {unit === 'in' ? 'ft' : 'm'})
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                ${costCalc.totalJobCost.toFixed(2)}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00ff80', marginTop: '10px', fontFamily: 'var(--font-mono)' }}>
                Unit Cost: ${costCalc.totalCostPerUnit.toFixed(2)} {costCalc.unitLabel}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Labor: ${costCalc.laborCostPerUnit.toFixed(2)} | Filler: ${costCalc.fillerCostPerUnit.toFixed(2)} | Gas: ${costCalc.gasCostPerUnit.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-PAGE 6: DUTY CYCLE */}
      {activeTab === 'duty_cycle' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #ef4444' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            ⏱️ Sub-Page 6: Machine Duty Cycle & Thermal Derating Calculator
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Determine derated duty cycle percentage (N_new = [I_rated / I_desired]² × N_rated) and continuous 10-minute arc-on versus mandatory cooling rest intervals.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '30px' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Machine Rated Output Amps (A)
                  </label>
                  <input type="number" step="10" value={dcRatedAmps} onChange={(e) => setDcRatedAmps(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Rated Duty Cycle Spec (%)
                  </label>
                  <input type="number" step="10" value={dcRatedPct} onChange={(e) => setDcRatedPct(e.target.value)} className="input-precision" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Desired Operating Amperage (A)
                  </label>
                  <input type="number" step="10" value={dcDesiredAmps} onChange={(e) => setDcDesiredAmps(e.target.value)} className="input-precision" />
                </div>
              </div>

              {/* 10-Min Clock SVG */}
              <div style={{ marginTop: '20px', background: '#0a0e17', padding: '15px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', textTransform: 'uppercase', marginBottom: '8px' }}>
                  10-Minute NEMA Thermal Cycle Allocation
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                  <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px' }}>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="16" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={dcCalc.isOverheated ? '#ef4444' : '#00ff80'}
                      strokeWidth="16"
                      strokeDasharray={`${(dcCalc.newPct / 100) * 251.2} 251.2`}
                      transform="rotate(-90 50 50)"
                    />
                    <text x="50" y="54" fill="#fff" fontSize="14" fontWeight="bold" textAnchor="middle">{Math.round(dcCalc.newPct)}%</text>
                  </svg>
                  <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                    <div>🔥 Arc-On: <strong style={{ color: '#00ff80' }}>{dcCalc.arcOnMin.toFixed(1)} min</strong></div>
                    <div>❄️ Cooling: <strong style={{ color: '#38bdf8' }}>{dcCalc.restMin.toFixed(1)} min</strong></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(15, 23, 42, 0.6))', border: `2px solid ${dcCalc.isOverheated ? '#ef4444' : '#00ff80'}`, borderRadius: '12px', padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: dcCalc.isOverheated ? '#ef4444' : '#00ff80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
                Derated Duty Cycle (N_new)
              </div>
              <div style={{ fontSize: '3.6rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                {dcCalc.newPct.toFixed(1)}%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
                {dcCalc.isOverheated ? '⚠️ CRITICAL: Overheating Hazard! Reduce Amps or Increase Rest Time!' : '✅ Continuous Safe Operation within 10-Min Cycle.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky South Footer for Module Navigation */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(10, 13, 20, 0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '2px solid rgba(244, 144, 44, 0.4)',
        boxShadow: '0 -6px 25px rgba(0, 0, 0, 0.7)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        zIndex: 1000
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '5px' }}>MODULE TOPICS:</span>
        {[
          { id: 'heat_input', label: '🔥 1. Heat Input' },
          { id: 'deposition_rate', label: '⚖️ 2. Deposition' },
          { id: 'preheat_ce', label: '🌡️ 3. Preheat & CE' },
          { id: 'weld_volume', label: '🔩 4. Weld Volume' },
          { id: 'welding_cost', label: '💰 5. Cost Analysis' },
          { id: 'duty_cycle', label: '⏱️ 6. Duty Cycle' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === tab.id ? '#000' : 'var(--text-secondary)',
              border: activeTab === tab.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              padding: '7px 14px',
              borderRadius: '20px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === tab.id ? '0 0 12px rgba(244, 144, 44, 0.5)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </footer>
    </div>
  );
};
