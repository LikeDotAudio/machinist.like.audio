import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useUnit } from '../../context/UnitContext';

// SendCutSend Material Bending Specifications Database
export interface BendingSpec {
  material: string;
  thicknessInches: number;
  thicknessMm: number;
  kFactor: number;
  bendDeduction90Inches: number;
  effectiveRadius90Inches: number;
  dieWidthInches: number;
  minFlangeLength90Inches: number;
  minCornerReliefInches: number;
  bendReliefDepthInches: number;
}

export const SENDCUTSEND_BENDING_SPECS: BendingSpec[] = [
  // 4130 Chromoly
  { material: '4130 Chromoly', thicknessInches: 0.050, thicknessMm: 1.27, kFactor: 0.38, bendDeduction90Inches: 0.0945, effectiveRadius90Inches: 0.050, dieWidthInches: 0.472, minFlangeLength90Inches: 0.302, minCornerReliefInches: 0.018, bendReliefDepthInches: 0.120 },
  { material: '4130 Chromoly', thicknessInches: 0.063, thicknessMm: 1.60, kFactor: 0.41, bendDeduction90Inches: 0.1065, effectiveRadius90Inches: 0.050, dieWidthInches: 0.472, minFlangeLength90Inches: 0.308, minCornerReliefInches: 0.025, bendReliefDepthInches: 0.133 },
  { material: '4130 Chromoly', thicknessInches: 0.125, thicknessMm: 3.18, kFactor: 0.43, bendDeduction90Inches: 0.2050, effectiveRadius90Inches: 0.090, dieWidthInches: 0.984, minFlangeLength90Inches: 0.723, minCornerReliefInches: 0.038, bendReliefDepthInches: 0.235 },
  { material: '4130 Chromoly', thicknessInches: 0.190, thicknessMm: 4.83, kFactor: 0.37, bendDeduction90Inches: 0.3240, effectiveRadius90Inches: 0.125, dieWidthInches: 0.984, minFlangeLength90Inches: 0.782, minCornerReliefInches: 0.043, bendReliefDepthInches: 0.335 },
  { material: '4130 Chromoly', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.36, bendDeduction90Inches: 0.4335, effectiveRadius90Inches: 0.170, dieWidthInches: 1.575, minFlangeLength90Inches: 1.367, minCornerReliefInches: 0.048, bendReliefDepthInches: 0.440 },

  // 5052 Aluminum
  { material: '5052 Aluminum', thicknessInches: 0.040, thicknessMm: 1.02, kFactor: 0.45, bendDeduction90Inches: 0.0620, effectiveRadius90Inches: 0.024, dieWidthInches: 0.472, minFlangeLength90Inches: 0.286, minCornerReliefInches: 0.024, bendReliefDepthInches: 0.084 },
  { material: '5052 Aluminum', thicknessInches: 0.063, thicknessMm: 1.60, kFactor: 0.42, bendDeduction90Inches: 0.0960, effectiveRadius90Inches: 0.035, dieWidthInches: 0.472, minFlangeLength90Inches: 0.303, minCornerReliefInches: 0.030, bendReliefDepthInches: 0.118 },
  { material: '5052 Aluminum', thicknessInches: 0.080, thicknessMm: 2.03, kFactor: 0.48, bendDeduction90Inches: 0.1160, effectiveRadius90Inches: 0.038, dieWidthInches: 0.472, minFlangeLength90Inches: 0.313, minCornerReliefInches: 0.037, bendReliefDepthInches: 0.138 },
  { material: '5052 Aluminum', thicknessInches: 0.090, thicknessMm: 2.29, kFactor: 0.37, bendDeduction90Inches: 0.1420, effectiveRadius90Inches: 0.032, dieWidthInches: 0.472, minFlangeLength90Inches: 0.326, minCornerReliefInches: 0.034, bendReliefDepthInches: 0.142 },
  { material: '5052 Aluminum', thicknessInches: 0.100, thicknessMm: 2.54, kFactor: 0.40, bendDeduction90Inches: 0.1910, effectiveRadius90Inches: 0.125, dieWidthInches: 0.630, minFlangeLength90Inches: 0.463, minCornerReliefInches: 0.020, bendReliefDepthInches: 0.245 },
  { material: '5052 Aluminum', thicknessInches: 0.125, thicknessMm: 3.18, kFactor: 0.44, bendDeduction90Inches: 0.2160, effectiveRadius90Inches: 0.125, dieWidthInches: 0.630, minFlangeLength90Inches: 0.476, minCornerReliefInches: 0.032, bendReliefDepthInches: 0.270 },
  { material: '5052 Aluminum', thicknessInches: 0.187, thicknessMm: 4.75, kFactor: 0.43, bendDeduction90Inches: 0.3560, effectiveRadius90Inches: 0.250, dieWidthInches: 0.984, minFlangeLength90Inches: 0.798, minCornerReliefInches: 0.024, bendReliefDepthInches: 0.457 },
  { material: '5052 Aluminum', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.42, bendDeduction90Inches: 0.4420, effectiveRadius90Inches: 0.250, dieWidthInches: 1.575, minFlangeLength90Inches: 1.371, minCornerReliefInches: 0.044, bendReliefDepthInches: 0.520 },

  // Brass
  { material: 'Brass', thicknessInches: 0.040, thicknessMm: 1.02, kFactor: 0.38, bendDeduction90Inches: 0.0740, effectiveRadius90Inches: 0.040, dieWidthInches: 0.472, minFlangeLength90Inches: 0.292, minCornerReliefInches: 0.018, bendReliefDepthInches: 0.100 },
  { material: 'Brass', thicknessInches: 0.063, thicknessMm: 1.60, kFactor: 0.38, bendDeduction90Inches: 0.1050, effectiveRadius90Inches: 0.040, dieWidthInches: 0.472, minFlangeLength90Inches: 0.308, minCornerReliefInches: 0.026, bendReliefDepthInches: 0.123 },
  { material: 'Brass', thicknessInches: 0.125, thicknessMm: 3.18, kFactor: 0.36, bendDeduction90Inches: 0.2050, effectiveRadius90Inches: 0.060, dieWidthInches: 0.630, minFlangeLength90Inches: 0.471, minCornerReliefInches: 0.038, bendReliefDepthInches: 0.205 },
  { material: 'Brass', thicknessInches: 0.187, thicknessMm: 4.75, kFactor: 0.38, bendDeduction90Inches: 0.3240, effectiveRadius90Inches: 0.095, dieWidthInches: 0.984, minFlangeLength90Inches: 0.782, minCornerReliefInches: 0.040, bendReliefDepthInches: 0.302 },
  { material: 'Brass', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.38, bendDeduction90Inches: 0.4240, effectiveRadius90Inches: 0.130, dieWidthInches: 1.575, minFlangeLength90Inches: 1.362, minCornerReliefInches: 0.053, bendReliefDepthInches: 0.400 },

  // Copper
  { material: 'Copper', thicknessInches: 0.040, thicknessMm: 1.02, kFactor: 0.34, bendDeduction90Inches: 0.0810, effectiveRadius90Inches: 0.052, dieWidthInches: 0.472, minFlangeLength90Inches: 0.296, minCornerReliefInches: 0.015, bendReliefDepthInches: 0.112 },
  { material: 'Copper', thicknessInches: 0.063, thicknessMm: 1.60, kFactor: 0.36, bendDeduction90Inches: 0.0990, effectiveRadius90Inches: 0.024, dieWidthInches: 0.472, minFlangeLength90Inches: 0.305, minCornerReliefInches: 0.029, bendReliefDepthInches: 0.107 },
  { material: 'Copper', thicknessInches: 0.125, thicknessMm: 3.18, kFactor: 0.34, bendDeduction90Inches: 0.2050, effectiveRadius90Inches: 0.050, dieWidthInches: 0.630, minFlangeLength90Inches: 0.471, minCornerReliefInches: 0.038, bendReliefDepthInches: 0.195 },
  { material: 'Copper', thicknessInches: 0.187, thicknessMm: 4.75, kFactor: 0.36, bendDeduction90Inches: 0.3200, effectiveRadius90Inches: 0.118, dieWidthInches: 0.984, minFlangeLength90Inches: 0.780, minCornerReliefInches: 0.042, bendReliefDepthInches: 0.325 },
  { material: 'Copper', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.33, bendDeduction90Inches: 0.4300, effectiveRadius90Inches: 0.140, dieWidthInches: 1.575, minFlangeLength90Inches: 1.365, minCornerReliefInches: 0.050, bendReliefDepthInches: 0.410 },

  // G90 Steel
  { material: 'G90 Steel', thicknessInches: 0.030, thicknessMm: 0.76, kFactor: 0.38, bendDeduction90Inches: 0.0610, effectiveRadius90Inches: 0.045, dieWidthInches: 0.472, minFlangeLength90Inches: 0.286, minCornerReliefInches: 0.015, bendReliefDepthInches: 0.095 },
  { material: 'G90 Steel', thicknessInches: 0.048, thicknessMm: 1.22, kFactor: 0.38, bendDeduction90Inches: 0.0860, effectiveRadius90Inches: 0.045, dieWidthInches: 0.472, minFlangeLength90Inches: 0.298, minCornerReliefInches: 0.020, bendReliefDepthInches: 0.113 },
  { material: 'G90 Steel', thicknessInches: 0.059, thicknessMm: 1.50, kFactor: 0.36, bendDeduction90Inches: 0.1120, effectiveRadius90Inches: 0.063, dieWidthInches: 0.472, minFlangeLength90Inches: 0.311, minCornerReliefInches: 0.018, bendReliefDepthInches: 0.142 },
  { material: 'G90 Steel', thicknessInches: 0.074, thicknessMm: 1.88, kFactor: 0.40, bendDeduction90Inches: 0.1290, effectiveRadius90Inches: 0.063, dieWidthInches: 0.472, minFlangeLength90Inches: 0.320, minCornerReliefInches: 0.025, bendReliefDepthInches: 0.157 },

  // Mild Steel
  { material: 'Mild Steel', thicknessInches: 0.030, thicknessMm: 0.76, kFactor: 0.38, bendDeduction90Inches: 0.0610, effectiveRadius90Inches: 0.045, dieWidthInches: 0.472, minFlangeLength90Inches: 0.286, minCornerReliefInches: 0.015, bendReliefDepthInches: 0.095 },
  { material: 'Mild Steel', thicknessInches: 0.048, thicknessMm: 1.22, kFactor: 0.38, bendDeduction90Inches: 0.0860, effectiveRadius90Inches: 0.045, dieWidthInches: 0.472, minFlangeLength90Inches: 0.298, minCornerReliefInches: 0.020, bendReliefDepthInches: 0.113 },
  { material: 'Mild Steel', thicknessInches: 0.059, thicknessMm: 1.50, kFactor: 0.40, bendDeduction90Inches: 0.1080, effectiveRadius90Inches: 0.063, dieWidthInches: 0.472, minFlangeLength90Inches: 0.309, minCornerReliefInches: 0.020, bendReliefDepthInches: 0.142 },
  { material: 'Mild Steel', thicknessInches: 0.074, thicknessMm: 1.88, kFactor: 0.40, bendDeduction90Inches: 0.1290, effectiveRadius90Inches: 0.063, dieWidthInches: 0.472, minFlangeLength90Inches: 0.320, minCornerReliefInches: 0.025, bendReliefDepthInches: 0.157 },
  { material: 'Mild Steel', thicknessInches: 0.104, thicknessMm: 2.64, kFactor: 0.34, bendDeduction90Inches: 0.1815, effectiveRadius90Inches: 0.063, dieWidthInches: 0.630, minFlangeLength90Inches: 0.459, minCornerReliefInches: 0.028, bendReliefDepthInches: 0.187 },
  { material: 'Mild Steel', thicknessInches: 0.119, thicknessMm: 3.02, kFactor: 0.38, bendDeduction90Inches: 0.1955, effectiveRadius90Inches: 0.063, dieWidthInches: 0.630, minFlangeLength90Inches: 0.466, minCornerReliefInches: 0.036, bendReliefDepthInches: 0.202 },
  { material: 'Mild Steel', thicknessInches: 0.135, thicknessMm: 3.43, kFactor: 0.32, bendDeduction90Inches: 0.2440, effectiveRadius90Inches: 0.100, dieWidthInches: 0.984, minFlangeLength90Inches: 0.742, minCornerReliefInches: 0.028, bendReliefDepthInches: 0.255 },
  { material: 'Mild Steel', thicknessInches: 0.187, thicknessMm: 4.75, kFactor: 0.36, bendDeduction90Inches: 0.3225, effectiveRadius90Inches: 0.125, dieWidthInches: 0.984, minFlangeLength90Inches: 0.781, minCornerReliefInches: 0.041, bendReliefDepthInches: 0.332 },
  { material: 'Mild Steel', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.36, bendDeduction90Inches: 0.4215, effectiveRadius90Inches: 0.150, dieWidthInches: 1.575, minFlangeLength90Inches: 1.361, minCornerReliefInches: 0.054, bendReliefDepthInches: 0.420 },

  // Polycarbonate
  { material: 'Polycarbonate', thicknessInches: 0.118, thicknessMm: 3.00, kFactor: 0.33, bendDeduction90Inches: 0.1950, effectiveRadius90Inches: 0.040, dieWidthInches: 0.472, minFlangeLength90Inches: 0.386, minCornerReliefInches: 0.083, bendReliefDepthInches: 0.178 },
  { material: 'Polycarbonate', thicknessInches: 0.177, thicknessMm: 4.50, kFactor: 0.33, bendDeduction90Inches: 0.2960, effectiveRadius90Inches: 0.085, dieWidthInches: 0.984, minFlangeLength90Inches: 0.848, minCornerReliefInches: 0.214, bendReliefDepthInches: 0.282 },
  { material: 'Polycarbonate', thicknessInches: 0.220, thicknessMm: 5.59, kFactor: 0.33, bendDeduction90Inches: 0.3670, effectiveRadius90Inches: 0.100, dieWidthInches: 0.984, minFlangeLength90Inches: 0.884, minCornerReliefInches: 0.235, bendReliefDepthInches: 0.340 },

  // 304 Stainless Steel
  { material: '304 Stainless Steel', thicknessInches: 0.030, thicknessMm: 0.76, kFactor: 0.36, bendDeduction90Inches: 0.0785, effectiveRadius90Inches: 0.080, dieWidthInches: 0.472, minFlangeLength90Inches: 0.294, minCornerReliefInches: 0.006, bendReliefDepthInches: 0.130 },
  { material: '304 Stainless Steel', thicknessInches: 0.048, thicknessMm: 1.22, kFactor: 0.36, bendDeduction90Inches: 0.1045, effectiveRadius90Inches: 0.080, dieWidthInches: 0.472, minFlangeLength90Inches: 0.307, minCornerReliefInches: 0.011, bendReliefDepthInches: 0.148 },
  { material: '304 Stainless Steel', thicknessInches: 0.060, thicknessMm: 1.52, kFactor: 0.34, bendDeduction90Inches: 0.1185, effectiveRadius90Inches: 0.070, dieWidthInches: 0.472, minFlangeLength90Inches: 0.314, minCornerReliefInches: 0.016, bendReliefDepthInches: 0.150 },
  { material: '304 Stainless Steel', thicknessInches: 0.074, thicknessMm: 1.88, kFactor: 0.36, bendDeduction90Inches: 0.1370, effectiveRadius90Inches: 0.075, dieWidthInches: 0.472, minFlangeLength90Inches: 0.324, minCornerReliefInches: 0.021, bendReliefDepthInches: 0.169 },
  { material: '304 Stainless Steel', thicknessInches: 0.100, thicknessMm: 2.54, kFactor: 0.36, bendDeduction90Inches: 0.2230, effectiveRadius90Inches: 0.187, dieWidthInches: 0.984, minFlangeLength90Inches: 0.732, minCornerReliefInches: 0.004, bendReliefDepthInches: 0.307 },
  { material: '304 Stainless Steel', thicknessInches: 0.125, thicknessMm: 3.18, kFactor: 0.38, bendDeduction90Inches: 0.2400, effectiveRadius90Inches: 0.150, dieWidthInches: 0.984, minFlangeLength90Inches: 0.740, minCornerReliefInches: 0.020, bendReliefDepthInches: 0.295 },
  { material: '304 Stainless Steel', thicknessInches: 0.187, thicknessMm: 4.75, kFactor: 0.35, bendDeduction90Inches: 0.3285, effectiveRadius90Inches: 0.130, dieWidthInches: 0.984, minFlangeLength90Inches: 0.784, minCornerReliefInches: 0.038, bendReliefDepthInches: 0.337 },
  { material: '304 Stainless Steel', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.34, bendDeduction90Inches: 0.4620, effectiveRadius90Inches: 0.225, dieWidthInches: 1.575, minFlangeLength90Inches: 1.381, minCornerReliefInches: 0.034, bendReliefDepthInches: 0.495 },

  // 316 Stainless Steel
  { material: '316 Stainless Steel', thicknessInches: 0.060, thicknessMm: 1.52, kFactor: 0.34, bendDeduction90Inches: 0.1185, effectiveRadius90Inches: 0.070, dieWidthInches: 0.472, minFlangeLength90Inches: 0.314, minCornerReliefInches: 0.016, bendReliefDepthInches: 0.150 },
  { material: '316 Stainless Steel', thicknessInches: 0.125, thicknessMm: 3.18, kFactor: 0.38, bendDeduction90Inches: 0.2400, effectiveRadius90Inches: 0.150, dieWidthInches: 0.984, minFlangeLength90Inches: 0.740, minCornerReliefInches: 0.020, bendReliefDepthInches: 0.295 },
  { material: '316 Stainless Steel', thicknessInches: 0.187, thicknessMm: 4.75, kFactor: 0.35, bendDeduction90Inches: 0.3285, effectiveRadius90Inches: 0.130, dieWidthInches: 0.984, minFlangeLength90Inches: 0.784, minCornerReliefInches: 0.038, bendReliefDepthInches: 0.337 },
  { material: '316 Stainless Steel', thicknessInches: 0.250, thicknessMm: 6.35, kFactor: 0.34, bendDeduction90Inches: 0.4620, effectiveRadius90Inches: 0.225, dieWidthInches: 1.575, minFlangeLength90Inches: 1.381, minCornerReliefInches: 0.034, bendReliefDepthInches: 0.495 },

  // Titanium Grade 2
  { material: 'Titanium Grade 2', thicknessInches: 0.040, thicknessMm: 1.02, kFactor: 0.38, bendDeduction90Inches: 0.0790, effectiveRadius90Inches: 0.045, dieWidthInches: 0.472, minFlangeLength90Inches: 0.295, minCornerReliefInches: 0.016, bendReliefDepthInches: 0.105 },
];

const UNIQUE_MATERIALS = Array.from(new Set(SENDCUTSEND_BENDING_SPECS.map(s => s.material)));

export const SheetMetalBending: React.FC = () => {
  // Global Unit context
  const { unit: globalUnit } = useUnit();
  const unit: 'in' | 'mm' = globalUnit === 'imperial' ? 'in' : 'mm';
  const prevUnitRef = useRef<'in' | 'mm'>(unit);

  // Material and Spec selection
  const [selectedMaterial, setSelectedMaterial] = useState<string>('Mild Steel');
  const [selectedSpecIdx, setSelectedSpecIdx] = useState<number>(5); // 0.119" Mild Steel default
  const [isCustomSpec, setIsCustomSpec] = useState<boolean>(false);

  // Custom spec state
  const [customThickness, setCustomThickness] = useState<string>('0.119');
  const [customKFactor, setCustomKFactor] = useState<string>('0.38');
  const [customRadius, setCustomRadius] = useState<string>('0.063');

  // Part Geometry Inputs (Outside Dimensions)
  const [baseLength, setBaseLength] = useState<string>('10.000');
  const [leftFlange, setLeftFlange] = useState<string>('4.000');
  const [rightFlange, setRightFlange] = useState<string>('4.000');
  const [bendAngle, setBendAngle] = useState<number>(90);

  // Active UI Tab
  const [activeTab, setActiveTab] = useState<'calculator' | 'diagram' | 'specs_table' | 'simulator'>('calculator');
  const [searchMaterial, setSearchMaterial] = useState<string>('');

  // Live Bend Simulator State
  const [simAngle, setSimAngle] = useState<number>(90);
  const [simRadius, setSimRadius] = useState<string>('0.125');
  const [simThickness, setSimThickness] = useState<string>('0.100');
  const [simKFactor, setSimKFactor] = useState<string>('0.42');
  const [simFlange1, setSimFlange1] = useState<string>('4.000');
  const [simFlange2, setSimFlange2] = useState<string>('4.000');

  // Simulator Math Engine (60 FPS Reactive Solvers)
  const simCalc = useMemo(() => {
    const angle = Math.min(179, Math.max(1, simAngle)); // degrees
    const R = parseFloat(simRadius) || 0.125;
    const T = parseFloat(simThickness) || 0.100;
    const K = parseFloat(simKFactor) || 0.42;
    const L1 = parseFloat(simFlange1) || 4.0;
    const L2 = parseFloat(simFlange2) || 4.0;

    // Y-Factor = K * (pi / 2)
    const Y = K * (Math.PI / 2);
    // Neutral Axis Radius = R + K * T
    const r_neutral = R + K * T;

    // Bend Allowance BA = DL = (pi / 180) * (R + K * T) * angle
    const BA = (Math.PI / 180) * r_neutral * angle;
    const DL = BA;

    // Outside Setback OSSB = (R + T) * tan(angle / 2 in rad)
    const halfRad = ((angle / 2) * Math.PI) / 180;
    const OSSB = (R + T) * Math.tan(halfRad);

    // Bend Deduction BD = 2 * OSSB - BA
    const BD = (2 * OSSB) - BA;

    // Flat Pattern Length FL = L1 + L2 - BD
    const FL = L1 + L2 - BD;

    return { angle, R, T, K, L1, L2, Y, r_neutral, BA, DL, OSSB, BD, FL };
  }, [simAngle, simRadius, simThickness, simKFactor, simFlange1, simFlange2]);

  useEffect(() => {
    if (prevUnitRef.current === unit) return;
    const oldUnit = prevUnitRef.current;
    prevUnitRef.current = unit;

    const bVal = parseFloat(baseLength) || 0;
    const lVal = parseFloat(leftFlange) || 0;
    const rVal = parseFloat(rightFlange) || 0;
    const ctVal = parseFloat(customThickness) || 0;
    const crVal = parseFloat(customRadius) || 0;

    if (unit === 'mm' && oldUnit === 'in') {
      setBaseLength((bVal * 25.4).toFixed(2));
      setLeftFlange((lVal * 25.4).toFixed(2));
      setRightFlange((rVal * 25.4).toFixed(2));
      setCustomThickness((ctVal * 25.4).toFixed(3));
      setCustomRadius((crVal * 25.4).toFixed(3));
    } else if (unit === 'in' && oldUnit === 'mm') {
      setBaseLength((bVal / 25.4).toFixed(3));
      setLeftFlange((lVal / 25.4).toFixed(3));
      setRightFlange((rVal / 25.4).toFixed(3));
      setCustomThickness((ctVal / 25.4).toFixed(3));
      setCustomRadius((crVal / 25.4).toFixed(3));
    }
  }, [unit]);

  // Filter specs for current material
  const availableSpecs = useMemo(() => {
    return SENDCUTSEND_BENDING_SPECS.filter(s => s.material === selectedMaterial);
  }, [selectedMaterial]);

  // Active Bending Parameters
  const activeParams = useMemo(() => {
    if (isCustomSpec) {
      const T_in = unit === 'in' ? (parseFloat(customThickness) || 0.1) : (parseFloat(customThickness) || 2.54) / 25.4;
      const R_in = unit === 'in' ? (parseFloat(customRadius) || 0.063) : (parseFloat(customRadius) || 1.6) / 25.4;
      const K = parseFloat(customKFactor) || 0.38;
      return {
        thickness_in: T_in,
        radius_in: R_in,
        kFactor: K,
        minFlange_in: R_in * 3 + T_in * 2, // approximation for custom
        dieWidth_in: T_in * 8,
        specName: 'Custom Specification',
      };
    } else {
      const spec = availableSpecs[selectedSpecIdx] || availableSpecs[0] || SENDCUTSEND_BENDING_SPECS[0];
      return {
        thickness_in: spec.thicknessInches,
        radius_in: spec.effectiveRadius90Inches,
        kFactor: spec.kFactor,
        minFlange_in: spec.minFlangeLength90Inches,
        dieWidth_in: spec.dieWidthInches,
        specName: `${spec.thicknessInches}" (${spec.thicknessMm}mm) ${spec.material}`,
      };
    }
  }, [isCustomSpec, availableSpecs, selectedSpecIdx, unit, customThickness, customRadius, customKFactor]);

  // Mathematical Bending Solver
  const calculations = useMemo(() => {
    const T = activeParams.thickness_in;
    const R = activeParams.radius_in;
    const K = activeParams.kFactor;
    const A = bendAngle; // degrees
    const A_rad = (A * Math.PI) / 180;

    // Bend Allowance Formula: BA = Pi * (R + K * T) * A / 180
    const BA = (Math.PI * (R + K * T) * A) / 180;

    // Outside Setback Formula: OSSB = tan(A / 2) * (R + T)
    const OSSB = Math.tan(A_rad / 2) * (R + T);

    // Bend Deduction Formula: BD = 2 * OSSB - BA
    const BD = 2 * OSSB - BA;

    // Convert lengths from UI units to inches for uniform math
    const L_base = unit === 'in' ? (parseFloat(baseLength) || 0) : (parseFloat(baseLength) || 0) / 25.4;
    const L_left = unit === 'in' ? (parseFloat(leftFlange) || 0) : (parseFloat(leftFlange) || 0) / 25.4;
    const L_right = unit === 'in' ? (parseFloat(rightFlange) || 0) : (parseFloat(rightFlange) || 0) / 25.4;

    const numBends = (L_left > 0 ? 1 : 0) + (L_right > 0 ? 1 : 0);

    // Total Flat Pattern Length = Sum of outside dimensions - (numBends * BD)
    const totalOutside = L_base + L_left + L_right;
    const flatLength = totalOutside - numBends * BD;

    // Bend line positions from outer edges of flat pattern
    // From Left Edge to Bend Line 1:
    const leftBendLine = L_left > 0 ? L_left - BD / 2 : 0;
    // From Right Edge to Bend Line 2:
    const rightBendLine = L_right > 0 ? L_right - BD / 2 : 0;

    // Inside dimensions after bending
    const insideBase = L_base - (numBends * T);
    const insideLeft = L_left > 0 ? L_left - T : 0;
    const insideRight = L_right > 0 ? L_right - T : 0;

    // Scale results back to display units
    const scale = unit === 'in' ? 1 : 25.4;

    return {
      BA: BA * scale,
      OSSB: OSSB * scale,
      BD: BD * scale,
      flatLength: flatLength * scale,
      leftBendLine: leftBendLine * scale,
      rightBendLine: rightBendLine * scale,
      insideBase: insideBase * scale,
      insideLeft: insideLeft * scale,
      insideRight: insideRight * scale,
      minFlangeRequired: activeParams.minFlange_in * scale,
      dieWidth: activeParams.dieWidth_in * scale,
      numBends,
      isLeftFlangeTooShort: L_left > 0 && L_left < activeParams.minFlange_in,
      isRightFlangeTooShort: L_right > 0 && L_right < activeParams.minFlange_in,
    };
  }, [activeParams, bendAngle, baseLength, leftFlange, rightFlange, unit]);

  // Handle Material switch
  const handleMaterialChange = (mat: string) => {
    setSelectedMaterial(mat);
    setIsCustomSpec(false);
    setSelectedSpecIdx(0);
  };

  const unitLabel = unit === 'in' ? 'in' : 'mm';

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '90px', color: 'var(--text-primary)' }}>
      {/* TAB 1: INTERACTIVE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '25px' }}>
          
          {/* LEFT PANEL: INPUT PARAMETERS */}
          <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> Step 1: Material & Specs
              </h3>
            </div>

            {/* Material Category Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Sheet Material Type
              </label>
              <select
                value={isCustomSpec ? 'CUSTOM' : selectedMaterial}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setIsCustomSpec(true);
                  } else {
                    handleMaterialChange(e.target.value);
                  }
                }}
                style={{ width: '100%', background: 'var(--bg-primary)', color: 'var(--accent-cyan)', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
              >
                {UNIQUE_MATERIALS.map(mat => (
                  <option key={mat} value={mat}>{mat}</option>
                ))}
                <option value="CUSTOM">⚡ Custom Material / Manual Override...</option>
              </select>
            </div>

            {/* Thickness / Spec Selector */}
            {!isCustomSpec ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Material Thickness Gauge
                </label>
                <select
                  value={selectedSpecIdx}
                  onChange={(e) => setSelectedSpecIdx(parseInt(e.target.value) || 0)}
                  style={{ width: '100%', background: 'var(--bg-primary)', color: '#fff', border: '1px solid var(--border-color)', padding: '10px 12px', borderRadius: '6px', fontSize: '0.92rem', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
                >
                  {availableSpecs.map((spec, idx) => (
                    <option key={idx} value={idx}>
                      {unit === 'in' 
                        ? `${spec.thicknessInches.toFixed(3)}" (${spec.thicknessMm}mm) — K: ${spec.kFactor} | Rad: ${spec.effectiveRadius90Inches}"`
                        : `${spec.thicknessMm.toFixed(2)} mm (${spec.thicknessInches.toFixed(3)}") — K: ${spec.kFactor} | Rad: ${(spec.effectiveRadius90Inches * 25.4).toFixed(2)}mm`
                      }
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              /* Custom Override Inputs */
              <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', border: '1px dashed var(--accent-cyan)', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Thickness ({unitLabel})</label>
                  <input
                    type="number"
                    step={unit === 'in' ? '0.005' : '0.1'}
                    value={customThickness}
                    onChange={(e) => setCustomThickness(e.target.value)}
                    className="input-precision"
                    style={{ fontSize: '0.85rem', padding: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>K-Factor (0.3 - 0.5)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="0.9"
                    value={customKFactor}
                    onChange={(e) => setCustomKFactor(e.target.value)}
                    className="input-precision"
                    style={{ fontSize: '0.85rem', padding: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Radius ({unitLabel})</label>
                  <input
                    type="number"
                    step={unit === 'in' ? '0.005' : '0.1'}
                    value={customRadius}
                    onChange={(e) => setCustomRadius(e.target.value)}
                    className="input-precision"
                    style={{ fontSize: '0.85rem', padding: '6px' }}
                  />
                </div>
              </div>
            )}

            {/* Active Spec Mini Dashboard */}
            <div style={{ background: 'rgba(244, 144, 44, 0.05)', border: '1px solid rgba(244, 144, 44, 0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>K-Factor</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {activeParams.kFactor.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Effective Radius</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>
                  {unit === 'in' ? `${activeParams.radius_in.toFixed(3)}"` : `${(activeParams.radius_in * 25.4).toFixed(2)}mm`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Flange @ 90°</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#00ff80', fontFamily: 'var(--font-mono)' }}>
                  {unit === 'in' ? `${activeParams.minFlange_in.toFixed(3)}"` : `${(activeParams.minFlange_in * 25.4).toFixed(2)}mm`}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📐</span> Step 2: Formed Dimensions (Outside)
            </h3>

            {/* Bend Angle Slider */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Bend Angle (Degrees)
                </label>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                  {bendAngle}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="170"
                step="1"
                value={bendAngle}
                onChange={(e) => setBendAngle(parseInt(e.target.value) || 90)}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                <span onClick={() => setBendAngle(30)} style={{ cursor: 'pointer' }}>30° Acute</span>
                <span onClick={() => setBendAngle(45)} style={{ cursor: 'pointer' }}>45°</span>
                <span onClick={() => setBendAngle(90)} style={{ cursor: 'pointer', color: bendAngle === 90 ? 'var(--accent-cyan)' : 'inherit', fontWeight: bendAngle === 90 ? 700 : 400 }}>90° Right Angle</span>
                <span onClick={() => setBendAngle(120)} style={{ cursor: 'pointer' }}>120° Obtuse</span>
                <span onClick={() => setBendAngle(135)} style={{ cursor: 'pointer' }}>135°</span>
              </div>
            </div>

            {/* Geometry Inputs Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Base / Center Span Outside Length ({unitLabel})
                </label>
                <input
                  type="number"
                  step={unit === 'in' ? '0.125' : '1'}
                  value={baseLength}
                  onChange={(e) => setBaseLength(e.target.value)}
                  className="input-precision"
                  placeholder="e.g. 10.000"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Left Flange Length ({unitLabel})
                  </label>
                  <input
                    type="number"
                    step={unit === 'in' ? '0.125' : '1'}
                    value={leftFlange}
                    onChange={(e) => setLeftFlange(e.target.value)}
                    className="input-precision"
                    style={{ borderColor: calculations.isLeftFlangeTooShort ? '#ef4444' : 'var(--border-color)' }}
                    placeholder="0 = No Flange"
                  />
                  {calculations.isLeftFlangeTooShort && (
                    <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>
                      ⚠️ Below min ({calculations.minFlangeRequired.toFixed(3)} {unitLabel})
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Right Flange Length ({unitLabel})
                  </label>
                  <input
                    type="number"
                    step={unit === 'in' ? '0.125' : '1'}
                    value={rightFlange}
                    onChange={(e) => setRightFlange(e.target.value)}
                    className="input-precision"
                    style={{ borderColor: calculations.isRightFlangeTooShort ? '#ef4444' : 'var(--border-color)' }}
                    placeholder="0 = No Flange"
                  />
                  {calculations.isRightFlangeTooShort && (
                    <div style={{ color: '#ef4444', fontSize: '0.72rem', marginTop: '4px', fontWeight: 600 }}>
                      ⚠️ Below min ({calculations.minFlangeRequired.toFixed(3)} {unitLabel})
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Helper presets */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Presets:</span>
              <button
                type="button"
                onClick={() => { setBaseLength(unit === 'in' ? '10.000' : '250.0'); setLeftFlange(unit === 'in' ? '4.000' : '100.0'); setRightFlange(unit === 'in' ? '4.000' : '100.0'); setBendAngle(90); }}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                U-Channel (10" × 4" × 4")
              </button>
              <button
                type="button"
                onClick={() => { setBaseLength(unit === 'in' ? '6.000' : '150.0'); setLeftFlange(unit === 'in' ? '3.000' : '75.0'); setRightFlange('0'); setBendAngle(90); }}
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                L-Bracket (6" × 3")
              </button>
            </div>
          </div>

          {/* RIGHT PANEL (Ordered Left): MATHEMATICAL RESULTS & FLAT PATTERN OUTPUT */}
          <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid #00ff80', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', order: -1 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> Step 3: Flat Pattern Cut Results
                </h3>
                <span style={{ fontSize: '0.75rem', background: 'rgba(0, 255, 128, 0.15)', color: '#00ff80', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                  {calculations.numBends} Bending Operation{calculations.numBends !== 1 ? 's' : ''}
                </span>
              </div>

              {/* HERO RESULT: TOTAL FLAT PATTERN LENGTH */}
              <div style={{ 
                background: 'linear-gradient(135deg, rgba(0, 255, 128, 0.12), rgba(244, 144, 44, 0.08))', 
                border: '2px solid rgba(0, 255, 128, 0.5)', 
                borderRadius: '12px', 
                padding: '24px', 
                textAlign: 'center',
                marginBottom: '20px',
                boxShadow: '0 0 25px rgba(0, 255, 128, 0.1)'
              }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#00ff80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  Required Flat Pattern Cut Length
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-mono)', lineHeight: 1.1 }}>
                  {calculations.flatLength.toFixed(3)} <span style={{ fontSize: '1.4rem', fontWeight: 500, color: 'var(--accent-cyan)' }}>{unitLabel}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Unbent blank size ready for laser or waterjet cutting before brake forming
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(90deg, var(--accent-cyan), #00ff80)',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '1rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '25px',
                  boxShadow: '0 4px 15px rgba(244, 144, 44, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span>📐</span> View Interactive 2D Bending Diagrams & Animations →
              </button>

              {/* DETAILED FORMING PARAMETERS TABLE */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  📊 Forming Metrology & Deduction Breakdown
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Bend Allowance (BA):</span>
                    <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{calculations.BA.toFixed(4)} {unitLabel}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Outside Setback (OSSB):</span>
                    <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{calculations.OSSB.toFixed(4)} {unitLabel}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', gridColumn: 'span 2', borderLeft: '3px solid #f59e0b' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Bend Deduction (per bend @ {bendAngle}°):</span>
                    <strong style={{ color: '#f59e0b', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>{calculations.BD.toFixed(4)} {unitLabel}</strong>
                  </div>
                </div>
              </div>

              {/* BEND LINE LOCATIONS FROM OUTER EDGES */}
              {calculations.numBends > 0 && (
                <div style={{ background: 'rgba(244, 144, 44, 0.04)', borderRadius: '8px', border: '1px solid rgba(244, 144, 44, 0.3)', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📍</span> Press Brake Bend Line Layout (From Outer Edge)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: calculations.numBends === 2 ? '1fr 1fr' : '1fr', gap: '10px' }}>
                    {(parseFloat(leftFlange) > 0) && (
                      <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From Left Blank Edge ➔ Bend Line 1</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {calculations.leftBendLine.toFixed(3)} {unitLabel}
                        </div>
                      </div>
                    )}
                    {(parseFloat(rightFlange) > 0) && (
                      <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>From Right Blank Edge ➔ Bend Line 2</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {calculations.rightBendLine.toFixed(3)} {unitLabel}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ESTIMATED INSIDE DIMENSIONS AFTER BENDING */}
              <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '14px', fontSize: '0.85rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                  ℹ️ Estimated Inside Dimensions After Bending (assuming standard thickness clearance)
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  <span>Base Inside: <strong style={{ color: '#fff' }}>{calculations.insideBase.toFixed(3)} {unitLabel}</strong></span>
                  {(parseFloat(leftFlange) > 0) && <span>Left Inside: <strong style={{ color: '#fff' }}>{calculations.insideLeft.toFixed(3)} {unitLabel}</strong></span>}
                  {(parseFloat(rightFlange) > 0) && <span>Right Inside: <strong style={{ color: '#fff' }}>{calculations.insideRight.toFixed(3)} {unitLabel}</strong></span>}
                </div>
              </div>
            </div>

            {/* Quick Copy to Clipboard Button */}
            <div style={{ marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  const summary = `PRECISION BENDING REPORT (${activeParams.specName})\n` +
                    `Flat Pattern Length: ${calculations.flatLength.toFixed(3)} ${unitLabel}\n` +
                    `Bend Deduction (BD): ${calculations.BD.toFixed(4)} ${unitLabel}\n` +
                    `Bend Allowance (BA): ${calculations.BA.toFixed(4)} ${unitLabel}\n` +
                    `Left Bend Line: ${calculations.leftBendLine.toFixed(3)} ${unitLabel} from edge\n` +
                    `Right Bend Line: ${calculations.rightBendLine.toFixed(3)} ${unitLabel} from edge`;
                  navigator.clipboard.writeText(summary);
                  alert('Bending summary copied to clipboard!');
                }}
                className="btn-precision"
                style={{ width: '100%', padding: '12px', fontSize: '0.9rem' }}
              >
                📋 Copy Bending Report to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL DIAGRAMS (FLAT PATTERN & 2D FORMED PROFILE) */}
      {activeTab === 'diagram' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid var(--accent-cyan)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📐 Visual Flat Pattern Strip & Formed Profile Preview
            </h3>
            <button
              type="button"
              onClick={() => setActiveTab('calculator')}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.9rem', cursor: 'pointer' }}
            >
              ← Back to Calculator Inputs
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Below is the scaled mathematical visualization of your sheet metal blank before and after press brake bending.
          </p>

          {/* DIAGRAM 1: FLAT PATTERN LAYOUT STRIP */}
          <div style={{ background: 'var(--bg-primary)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#00ff80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
              1. Flat Pattern Layout (Top View Blank) — Total Cut Length: {calculations.flatLength.toFixed(3)} {unitLabel}
            </h4>

            <svg viewBox="0 0 800 180" style={{ width: '100%', height: 'auto', background: '#0a0e17', borderRadius: '8px', border: '1px solid rgba(244, 144, 44, 0.2)' }}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="180" fill="url(#grid)" />

              {/* Compute visual SVG coordinates */}
              {(() => {
                const margin = 60;
                const availableW = 800 - margin * 2;
                const L_tot = calculations.flatLength || 1;
                const scaleX = availableW / L_tot;
                const y0 = 60;
                const h = 60;

                const x_leftLine = margin + calculations.leftBendLine * scaleX;
                const x_rightLine = margin + (calculations.flatLength - calculations.rightBendLine) * scaleX;

                return (
                  <g>
                    {/* Blank outline */}
                    <rect x={margin} y={y0} width={availableW} height={h} fill="rgba(244, 144, 44, 0.15)" stroke="var(--accent-cyan)" strokeWidth="2" rx="2" />

                    {/* Overall dimension bar */}
                    <line x1={margin} y1={25} x2={margin + availableW} y2={25} stroke="#fff" strokeWidth="1.5" />
                    <line x1={margin} y1={18} x2={margin} y2={32} stroke="#fff" strokeWidth="1.5" />
                    <line x1={margin + availableW} y1={18} x2={margin + availableW} y2={32} stroke="#fff" strokeWidth="1.5" />
                    <text x={margin + availableW / 2} y={18} fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      TOTAL BLANK: {calculations.flatLength.toFixed(3)} {unitLabel}
                    </text>

                    {/* Left Bend Line */}
                    {(parseFloat(leftFlange) > 0) && (
                      <g>
                        <line x1={x_leftLine} y1={y0 - 10} x2={x_leftLine} y2={y0 + h + 10} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
                        <text x={x_leftLine} y={y0 + h + 25} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          BEND LINE 1
                        </text>
                        {/* Dimension from left edge */}
                        <line x1={margin} y1={y0 + h + 40} x2={x_leftLine} y2={y0 + h + 40} stroke="#f59e0b" strokeWidth="1" />
                        <line x1={margin} y1={y0 + h + 35} x2={margin} y2={y0 + h + 45} stroke="#f59e0b" strokeWidth="1" />
                        <line x1={x_leftLine} y1={y0 + h + 35} x2={x_leftLine} y2={y0 + h + 45} stroke="#f59e0b" strokeWidth="1" />
                        <text x={(margin + x_leftLine) / 2} y={y0 + h + 53} fill="#f59e0b" fontSize="11" textAnchor="middle" fontFamily="monospace">
                          {calculations.leftBendLine.toFixed(3)} {unitLabel}
                        </text>
                      </g>
                    )}

                    {/* Right Bend Line */}
                    {(parseFloat(rightFlange) > 0) && (
                      <g>
                        <line x1={x_rightLine} y1={y0 - 10} x2={x_rightLine} y2={y0 + h + 10} stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
                        <text x={x_rightLine} y={y0 + h + 25} fill="#f59e0b" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                          BEND LINE 2
                        </text>
                        {/* Dimension from right edge */}
                        <line x1={x_rightLine} y1={y0 + h + 40} x2={margin + availableW} y2={y0 + h + 40} stroke="#f59e0b" strokeWidth="1" />
                        <line x1={x_rightLine} y1={y0 + h + 35} x2={x_rightLine} y2={y0 + h + 45} stroke="#f59e0b" strokeWidth="1" />
                        <line x1={margin + availableW} y1={y0 + h + 35} x2={margin + availableW} y2={y0 + h + 45} stroke="#f59e0b" strokeWidth="1" />
                        <text x={(x_rightLine + margin + availableW) / 2} y={y0 + h + 53} fill="#f59e0b" fontSize="11" textAnchor="middle" fontFamily="monospace">
                          {calculations.rightBendLine.toFixed(3)} {unitLabel}
                        </text>
                      </g>
                    )}

                    {/* Center Base Label */}
                    <text x={margin + availableW / 2} y={y0 + h / 2 + 5} fill="var(--accent-cyan)" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      {activeParams.specName}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>

          {/* DIAGRAM 2: 2D FORMED PROFILE SKETCH */}
          <div style={{ background: 'var(--bg-primary)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
              2. Formed Profile Preview (Side Elevation View @ {bendAngle}° Bends)
            </h4>

            <svg viewBox="0 0 800 220" style={{ width: '100%', height: 'auto', background: '#0a0e17', borderRadius: '8px', border: '1px solid rgba(244, 144, 44, 0.2)' }}>
              <rect width="800" height="220" fill="url(#grid)" />

              {/* Render 2D U-channel or L-bracket representation */}
              {(() => {
                const cx = 400;
                const cy = 160;
                const L_base = parseFloat(baseLength) || 10;
                const L_left = parseFloat(leftFlange) || 0;
                const L_right = parseFloat(rightFlange) || 0;

                const maxDim = Math.max(L_base, L_left * 2, L_right * 2, 10);
                const scale = 300 / maxDim;

                const halfBase = (L_base * scale) / 2;
                const x_left = cx - halfBase;
                const x_right = cx + halfBase;

                // Calculate flange tip points based on bend angle A
                // A bend angle of 90 deg means flange points straight up (angle = 90 deg)
                const A_rad = (bendAngle * Math.PI) / 180;
                const leftTipX = x_left - (L_left * scale) * Math.cos(A_rad);
                const leftTipY = cy - (L_left * scale) * Math.sin(A_rad);

                const rightTipX = x_right + (L_right * scale) * Math.cos(A_rad);
                const rightTipY = cy - (L_right * scale) * Math.sin(A_rad);

                return (
                  <g>
                    {/* Base floor line */}
                    <line x1={x_left} y1={cy} x2={x_right} y2={cy} stroke="var(--accent-cyan)" strokeWidth="6" strokeLinecap="round" />

                    {/* Left Flange */}
                    {L_left > 0 && (
                      <g>
                        <line x1={x_left} y1={cy} x2={leftTipX} y2={leftTipY} stroke="#00ff80" strokeWidth="6" strokeLinecap="round" />
                        <circle cx={x_left} cy={cy} r="5" fill="#f59e0b" />
                        <text x={leftTipX - 10} y={leftTipY - 10} fill="#00ff80" fontSize="12" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                          Left Flange: {L_left.toFixed(3)} {unitLabel}
                        </text>
                      </g>
                    )}

                    {/* Right Flange */}
                    {L_right > 0 && (
                      <g>
                        <line x1={x_right} y1={cy} x2={rightTipX} y2={rightTipY} stroke="#00ff80" strokeWidth="6" strokeLinecap="round" />
                        <circle cx={x_right} cy={cy} r="5" fill="#f59e0b" />
                        <text x={rightTipX + 10} y={rightTipY - 10} fill="#00ff80" fontSize="12" fontWeight="bold" textAnchor="start" fontFamily="monospace">
                          Right Flange: {L_right.toFixed(3)} {unitLabel}
                        </text>
                      </g>
                    )}

                    {/* Base Dimension */}
                    <text x={cx} y={cy + 30} fill="#fff" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      Base (Outside): {L_base.toFixed(3)} {unitLabel}
                    </text>

                    <text x={cx} y={30} fill="var(--text-muted)" fontSize="12" textAnchor="middle" fontFamily="monospace">
                      Radius: {unit === 'in' ? `${activeParams.radius_in.toFixed(3)}"` : `${(activeParams.radius_in * 25.4).toFixed(2)}mm`} | K-Factor: {activeParams.kFactor}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>
      )}

      {/* TAB 3: MATERIAL BENDING SPECS DATABASE */}
      {activeTab === 'specs_table' && (
        <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                📋 Industrial Sheet Metal & Plastic Bending Specifications
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Complete lookup table of K-Factors, Bend Deductions, Effective Radii, and Die Widths for precision press brake tooling.
              </p>
            </div>

            {/* Filter Input */}
            <input
              type="text"
              placeholder="🔍 Search alloy (e.g. Aluminum, Chromoly, Stainless)..."
              value={searchMaterial}
              onChange={(e) => setSearchMaterial(e.target.value)}
              className="input-precision"
              style={{ width: '300px', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '600px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-cyan)', borderBottom: '2px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '12px 14px' }}>Material Alloy</th>
                  <th style={{ padding: '12px 14px' }}>Thickness</th>
                  <th style={{ padding: '12px 14px' }}>K-Factor</th>
                  <th style={{ padding: '12px 14px' }}>Bend Deduction (90°)</th>
                  <th style={{ padding: '12px 14px' }}>Effective Radius (90°)</th>
                  <th style={{ padding: '12px 14px' }}>Die Width</th>
                  <th style={{ padding: '12px 14px' }}>Min Flange @ 90°</th>
                  <th style={{ padding: '12px 14px' }}>Min Corner Relief</th>
                  <th style={{ padding: '12px 14px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {SENDCUTSEND_BENDING_SPECS.filter(s => 
                  s.material.toLowerCase().includes(searchMaterial.toLowerCase()) ||
                  s.thicknessInches.toString().includes(searchMaterial)
                ).map((spec, idx) => (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(244, 144, 44, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.01)' : 'transparent')}
                  >
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-sans)' }}>{spec.material}</td>
                    <td style={{ padding: '10px 14px', color: 'var(--accent-cyan)' }}>
                      {unit === 'in' ? `${spec.thicknessInches.toFixed(3)}"` : `${spec.thicknessMm} mm`}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#f59e0b', fontWeight: 600 }}>{spec.kFactor}</td>
                    <td style={{ padding: '10px 14px', color: '#00ff80' }}>
                      {unit === 'in' ? `${spec.bendDeduction90Inches.toFixed(4)}"` : `${(spec.bendDeduction90Inches * 25.4).toFixed(3)} mm`}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {unit === 'in' ? `${spec.effectiveRadius90Inches.toFixed(3)}"` : `${(spec.effectiveRadius90Inches * 25.4).toFixed(2)} mm`}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {unit === 'in' ? `${spec.dieWidthInches.toFixed(3)}"` : `${(spec.dieWidthInches * 25.4).toFixed(2)} mm`}
                    </td>
                    <td style={{ padding: '10px 14px', color: '#fff' }}>
                      {unit === 'in' ? `${spec.minFlangeLength90Inches.toFixed(3)}"` : `${(spec.minFlangeLength90Inches * 25.4).toFixed(2)} mm`}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>
                      {unit === 'in' ? `${spec.minCornerReliefInches.toFixed(3)}"` : `${(spec.minCornerReliefInches * 25.4).toFixed(2)} mm`}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMaterial(spec.material);
                          setIsCustomSpec(false);
                          const matSpecs = SENDCUTSEND_BENDING_SPECS.filter(s => s.material === spec.material);
                          const subIdx = matSpecs.findIndex(s => s.thicknessInches === spec.thicknessInches);
                          if (subIdx >= 0) setSelectedSpecIdx(subIdx);
                          setActiveTab('calculator');
                        }}
                        style={{
                          background: 'rgba(244, 144, 44, 0.15)',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(244, 144, 44, 0.4)',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Use Spec ➔
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE LIVE BEND SIMULATOR & FORMULAS */}
      {activeTab === 'simulator' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Interactive Workspace: Control Panel & Live Digital Dashboard right at the top! */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
            
            {/* LEFT PANEL: SLIDER CONTROLS */}
            <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid #38bdf8' }}>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🎛️</span> Live Deformation Control Levers
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Bend Angle Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Bend Angle (θ): <span style={{ color: 'var(--accent-cyan)' }}>{simAngle}°</span>
                    </label>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>1° (Flat) to 179° (Sharp Fold)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="179"
                    step="1"
                    value={simAngle}
                    onChange={(e) => setSimAngle(parseInt(e.target.value) || 90)}
                    style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
                  />
                </div>

                {/* Inside Radius Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Inside Radius (R): <span style={{ color: '#00ff80' }}>{simRadius}"</span>
                    </label>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>0.010" to 1.000"</span>
                  </div>
                  <input
                    type="range"
                    min="0.010"
                    max="1.000"
                    step="0.005"
                    value={simRadius}
                    onChange={(e) => setSimRadius(e.target.value)}
                    style={{ width: '100%', accentColor: '#00ff80', cursor: 'pointer' }}
                  />
                </div>

                {/* Material Thickness Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Material Thickness (T): <span style={{ color: '#f59e0b' }}>{simThickness}"</span>
                    </label>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>0.020" to 0.500"</span>
                  </div>
                  <input
                    type="range"
                    min="0.020"
                    max="0.500"
                    step="0.005"
                    value={simThickness}
                    onChange={(e) => setSimThickness(e.target.value)}
                    style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
                  />
                </div>

                {/* K-Factor Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      K-Factor (K): <span style={{ color: '#a855f7' }}>{simKFactor}</span>
                    </label>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>0.25 (Soft) to 0.50 (Coining)</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="0.50"
                    step="0.01"
                    value={simKFactor}
                    onChange={(e) => setSimKFactor(e.target.value)}
                    style={{ width: '100%', accentColor: '#a855f7', cursor: 'pointer' }}
                  />
                </div>

                {/* Flange Length 1 Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Flange 1 Length (L₁): <span style={{ color: 'var(--text-primary)' }}>{simFlange1}"</span>
                    </label>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>1.00" to 12.00"</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="12.00"
                    step="0.25"
                    value={simFlange1}
                    onChange={(e) => setSimFlange1(e.target.value)}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                </div>

                {/* Flange Length 2 Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Flange 2 Length (L₂): <span style={{ color: 'var(--text-primary)' }}>{simFlange2}"</span>
                    </label>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>1.00" to 12.00"</span>
                  </div>
                  <input
                    type="range"
                    min="1.00"
                    max="12.00"
                    step="0.25"
                    value={simFlange2}
                    onChange={(e) => setSimFlange2(e.target.value)}
                    style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                  />
                </div>

              </div>
            </div>

            {/* RIGHT PANEL: LIVE METROLOGY DASHBOARD (WATCH NUMBERS GROW & SHRINK) */}
            <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid #00ff80', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📊</span> Live Metrology Readouts
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Real-time computation of the 7 core relationships. Watch values dynamically grow and shrink as you form the bend!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  
                  {/* Card 1: Flat Pattern Length (FL) */}
                  <div style={{ background: 'rgba(0, 255, 128, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(0, 255, 128, 0.3)', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
                      Flat Pattern Length (FL)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00ff80', fontFamily: 'monospace' }}>
                      {simCalc.FL.toFixed(4)}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      L₁ + L₂ - BD
                    </div>
                  </div>

                  {/* Card 2: Bend Deduction (BD) */}
                  <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
                      Bend Deduction (BD)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
                      {simCalc.BD.toFixed(4)}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      2 × OSSB - BA
                    </div>
                  </div>

                  {/* Card 3: Bend Allowance / Developed Arc (BA / DL) */}
                  <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(56, 189, 248, 0.3)', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
                      Bend Allowance (BA / DL)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', fontFamily: 'monospace' }}>
                      {simCalc.BA.toFixed(4)}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Neutral Arc Length
                    </div>
                  </div>

                  {/* Card 4: Outside Setback (OSSB) */}
                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
                      Outside Setback (OSSB)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>
                      {simCalc.OSSB.toFixed(4)}"
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Tangent to Apex Distance
                    </div>
                  </div>

                  {/* Card 5: K-Factor ($K$) */}
                  <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.3)', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
                      K-Factor Ratio (K)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#a855f7', fontFamily: 'monospace' }}>
                      {simCalc.K.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      t / T (Neutral Shift)
                    </div>
                  </div>

                  {/* Card 6: Y-Factor ($Y$) */}
                  <div style={{ background: 'rgba(236, 72, 153, 0.08)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(236, 72, 153, 0.3)', textAlign: 'center', transition: 'all 0.15s ease' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>
                      Y-Factor Value (Y)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ec4899', fontFamily: 'monospace' }}>
                      {simCalc.Y.toFixed(4)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      K × (π / 2) (CAD Factor)
                    </div>
                  </div>

                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px dashed var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Neutral Axis Radius (r_neutral):</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{simCalc.r_neutral.toFixed(4)}"</span>
              </div>
            </div>

          </div>

          {/* LIVE ANIMATED VECTOR VISUALIZER */}
          <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #f59e0b', textAlign: 'center' }}>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span>⚡</span> Live Vector Bending Simulation & Geometry Projections
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '700px', margin: '0 auto 20px auto' }}>
              Real-time vector visualization of the plastic deformation zone. Notice how the dashed green neutral axis (K × T) shifts inward from the geometric centerline as bend angle θ increases.
            </p>

            <div style={{ background: '#0a0e17', borderRadius: '12px', padding: '20px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
              <svg viewBox="0 0 800 360" style={{ width: '100%', height: 'auto', maxHeight: '380px' }}>
                <defs>
                  <pattern id="simGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                </defs>
                <rect width="800" height="360" fill="url(#simGrid)" />

                {/* Base reference line */}
                <line x1="50" y1="280" x2="750" y2="280" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <text x="70" y="300" fill="rgba(255,255,255,0.3)" fontSize="12" fontFamily="monospace">DATUM PLANO: HORIZONTAL BASE</text>

                {/* Left Flange (Fixed Horizontal) */}
                <rect x="100" y={280 - Math.min(50, simCalc.T * 100)} width="240" height={Math.min(50, simCalc.T * 100)} fill="url(#metalGrad)" stroke="#94a3b8" strokeWidth="2" />
                <text x="220" y={270 - Math.min(50, simCalc.T * 100)} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">FLANGE 1 ({simCalc.L1}")</text>

                {/* Bend Zone & Right Flange Representation (Rotated dynamically by simAngle) */}
                <g transform={`translate(340, ${280})`}>
                  {/* Outer Apex Setback Projection Lines */}
                  <line x1="0" y1="0" x2={Math.min(120, simCalc.OSSB * 80)} y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="0" cy="0" r="4" fill="#38bdf8" />
                  <text x="0" y="20" fill="#38bdf8" fontSize="11" textAnchor="middle" fontWeight="bold">TANGENT POINT</text>
                  
                  {/* Rotated Right Flange */}
                  <g transform={`rotate(-${simCalc.angle}, 0, 0)`}>
                    <rect x="0" y={-Math.min(50, simCalc.T * 100)} width="240" height={Math.min(50, simCalc.T * 100)} fill="url(#metalGrad)" stroke="#94a3b8" strokeWidth="2" opacity="0.9" />
                    <line x1="0" y1="0" x2={Math.min(120, simCalc.OSSB * 80)} y2="0" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                    <text x="120" y={-Math.min(50, simCalc.T * 100) - 10} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">FLANGE 2 ({simCalc.L2}")</text>

                    {/* Neutral Axis Arc representation */}
                    <line x1="20" y1={-Math.min(50, simCalc.T * 100) * simCalc.K} x2="220" y2={-Math.min(50, simCalc.T * 100) * simCalc.K} stroke="#00ff80" strokeWidth="2" strokeDasharray="6 4" />
                  </g>
                </g>

                {/* Left Neutral Axis Line */}
                <line x1="100" y1={280 - Math.min(50, simCalc.T * 100) * simCalc.K} x2="340" y2={280 - Math.min(50, simCalc.T * 100) * simCalc.K} stroke="#00ff80" strokeWidth="2" strokeDasharray="6 4" />

                {/* HUD Overlay Indicators */}
                <g transform="translate(550, 40)">
                  <rect x="0" y="0" width="220" height="110" fill="rgba(15, 23, 42, 0.8)" stroke="var(--border-color)" rx="6" />
                  <text x="15" y="25" fill="#00ff80" fontSize="12" fontWeight="bold" fontFamily="monospace">--- NEUTRAL AXIS (K={simCalc.K})</text>
                  <text x="15" y="48" fill="#f59e0b" fontSize="12" fontWeight="bold" fontFamily="monospace">... APEX SETBACK (OSSB)</text>
                  <text x="15" y="71" fill="#38bdf8" fontSize="12" fontWeight="bold" fontFamily="monospace">=== BEND ALLOWANCE ({simCalc.BA.toFixed(3)}")</text>
                  <text x="15" y="94" fill="#ef4444" fontSize="12" fontWeight="bold" fontFamily="monospace">▼ BEND DEDUCTION ({simCalc.BD.toFixed(3)}")</text>
                </g>

                {/* Live Angle Arc Indicator */}
                <path d={`M 400 280 A 60 60 0 0 0 ${400 - 60 * Math.cos((simCalc.angle * Math.PI)/180)} ${280 - 60 * Math.sin((simCalc.angle * Math.PI)/180)}`} fill="none" stroke="var(--accent-cyan)" strokeWidth="2" />
                <text x="430" y="250" fill="var(--accent-cyan)" fontSize="16" fontWeight="bold" fontFamily="monospace">θ = {simCalc.angle}°</text>
              </svg>
            </div>
          </div>

          {/* BOTTOM SECTION: THE 7 FORMULA EXPLANATIONS FROM IMAGE-1.PNG */}
          <div className="glass-panel" style={{ padding: '30px', borderTop: '3px solid #a855f7' }}>
            <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📚</span> Authoritative Breakdown of the 7 Bending Formulas (image-1.png)
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px', lineHeight: 1.6 }}>
              In precision sheet metal engineering, these 7 core geometric relationships govern the exact transition between flat raw stock and formed 3D parts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Formula 1: K-Factor */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid #a855f7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#a855f7', margin: 0 }}>1. K-Factor (K)</h5>
                  <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Ratio</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '1.1rem', textAlign: 'center' }}>
                  K = t / T
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The ratio representing the inward shift of the neutral axis (t) relative to total material thickness (T). Standard air bending in mild steel uses K ≈ 0.42 to 0.45.
                </p>
              </div>

              {/* Formula 2: Y-Factor */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid #ec4899' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ec4899', margin: 0 }}>2. Y-Factor (Y)</h5>
                  <span style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>CAD Factor</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '1.1rem', textAlign: 'center' }}>
                  Y = K × (π / 2)
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  An alternative representation of neutral axis location utilized in CAD systems (PTC Creo, marine software). A K-Factor of 0.45 converts to a Y-Factor of 0.7068.
                </p>
              </div>

              {/* Formula 3: Outside Setback (OSSB) */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f59e0b', margin: 0 }}>3. Outside Setback (OSSB)</h5>
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Geometry</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '1.0rem', textAlign: 'center' }}>
                  OSSB = (R + T) × tan(θ / 2)
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The distance along the outside flange from the tangent bend start line to the sharp apex intersection vertex. Crucial for determining Bend Deduction.
                </p>
              </div>

              {/* Formula 4: Bend Allowance (BA) */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid #38bdf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#38bdf8', margin: 0 }}>4. Bend Allowance (BA)</h5>
                  <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Neutral Arc</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '0.95rem', textAlign: 'center' }}>
                  BA = (π / 180) × (R + K·T) × θ
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The true physical length of metal along the neutral axis through the curved bend zone. Because this layer neither stretches nor shrinks, its length is preserved!
                </p>
              </div>

              {/* Formula 5: Developed Length of Arc (DL) */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid #00ff80' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#00ff80', margin: 0 }}>5. Developed Arc Length (DL)</h5>
                  <span style={{ background: 'rgba(0, 255, 128, 0.15)', color: '#00ff80', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>ISO Standard</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '1.1rem', textAlign: 'center' }}>
                  DL ≡ BA
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Synonymous with Bend Allowance in European and international metrology specifications. Represents the exact arc circumference of the neutral layer.
                </p>
              </div>

              {/* Formula 6: Bend Deduction (BD) */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid #ef4444' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ef4444', margin: 0 }}>6. Bend Deduction (BD)</h5>
                  <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Subtraction</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '1.05rem', textAlign: 'center' }}>
                  BD = (2 × OSSB) - BA
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The exact length subtracted per bend from the sum of outside mold dimensions to correct for corner duplication and metal stretching.
                </p>
              </div>

              {/* Formula 7: Flat Pattern Length (FL) */}
              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: '10px', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-cyan)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', margin: 0 }}>7. Flat Pattern Length (FL)</h5>
                  <span style={{ background: 'rgba(244, 144, 44, 0.15)', color: 'var(--accent-cyan)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>Final Blank</span>
                </div>
                <div style={{ background: '#0a0e17', padding: '10px', borderRadius: '6px', fontFamily: 'monospace', color: '#00ff80', marginBottom: '10px', fontSize: '1.05rem', textAlign: 'center' }}>
                  FL = L₁ + L₂ - BD
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  The actionable flat sheet metal blank cut length required for laser cutting or punching. Guarantees precision formed parts after brake bending.
                </p>
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
        borderTop: '2px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 -6px 25px rgba(0, 0, 0, 0.7)',
        padding: '10px 20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        zIndex: 1000
      }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '5px' }}>MODULE TOPICS:</span>
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          style={{
            background: activeTab === 'calculator' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'calculator' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'calculator' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            padding: '7px 16px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: activeTab === 'calculator' ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
          }}
        >
          <span>🧮</span> Interactive Calculator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diagram')}
          style={{
            background: activeTab === 'diagram' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'diagram' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'diagram' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            padding: '7px 16px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: activeTab === 'diagram' ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
          }}
        >
          <span>📐</span> Visual Flat Pattern & Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specs_table')}
          style={{
            background: activeTab === 'specs_table' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'specs_table' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'specs_table' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            padding: '7px 16px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: activeTab === 'specs_table' ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
          }}
        >
          <span>📋</span> Material Bending Specs (10 Alloys)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('simulator')}
          style={{
            background: activeTab === 'simulator' ? 'var(--accent-cyan)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'simulator' ? '#000' : 'var(--text-secondary)',
            border: activeTab === 'simulator' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
            padding: '7px 16px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: activeTab === 'simulator' ? '0 0 12px rgba(56, 189, 248, 0.5)' : 'none'
          }}
        >
          <span>🎮</span> Live Bend Simulator & Formulas
        </button>
      </footer>
    </div>
  );
};
