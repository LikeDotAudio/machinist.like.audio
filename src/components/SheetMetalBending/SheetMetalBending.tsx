import React, { useState, useMemo } from 'react';

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
  // Unit toggle
  const [unit, setUnit] = useState<'in' | 'mm'>('in');

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
  const [activeTab, setActiveTab] = useState<'calculator' | 'diagram' | 'specs_table'>('calculator');
  const [searchMaterial, setSearchMaterial] = useState<string>('');

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
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '50px', color: 'var(--text-primary)' }}>
      {/* Header Badge */}
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0, 240, 255, 0.1)',
          color: 'var(--accent-cyan)',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '0.78rem',
          fontWeight: 600,
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '10px',
          border: '1px solid rgba(0, 240, 255, 0.3)'
        }}>
          Sheet Metal & Plastic Forming // SendCutSend Standard
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(90deg, #fff, var(--accent-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Sheet Metal Bending Calculator
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', fontSize: '0.98rem', lineHeight: 1.5 }}>
          Calculate exact flat pattern cut lengths, bend allowances, bend deductions, and bend line locations from outer part dimensions using verified industrial gauge tables.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          style={{
            background: activeTab === 'calculator' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            color: activeTab === 'calculator' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>🧮</span> Interactive Calculator
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('diagram')}
          style={{
            background: activeTab === 'diagram' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            color: activeTab === 'diagram' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📐</span> Visual Flat Pattern & Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('specs_table')}
          style={{
            background: activeTab === 'specs_table' ? 'var(--accent-cyan)' : 'var(--bg-secondary)',
            color: activeTab === 'specs_table' ? '#000' : 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            padding: '10px 22px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>📋</span> Material Bending Specs (10 Alloys)
        </button>
      </div>

      {/* TAB 1: INTERACTIVE CALCULATOR */}
      {activeTab === 'calculator' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '25px' }}>
          
          {/* LEFT PANEL: INPUT PARAMETERS */}
          <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid var(--accent-cyan)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚙️</span> Step 1: Material & Specs
              </h3>
              
              {/* Unit Selector */}
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '6px', padding: '3px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setUnit('in')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    background: unit === 'in' ? 'var(--accent-cyan)' : 'transparent',
                    color: unit === 'in' ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Inches (in)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('mm')}
                  style={{
                    padding: '4px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    borderRadius: '4px',
                    border: 'none',
                    background: unit === 'mm' ? 'var(--accent-cyan)' : 'transparent',
                    color: unit === 'mm' ? '#000' : 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  Metric (mm)
                </button>
              </div>
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
            <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', borderRadius: '8px', padding: '12px 16px', marginBottom: '25px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
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

          {/* RIGHT PANEL: MATHEMATICAL RESULTS & FLAT PATTERN OUTPUT */}
          <div className="glass-panel" style={{ padding: '25px', borderTop: '3px solid #00ff80', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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
                background: 'linear-gradient(135deg, rgba(0, 255, 128, 0.12), rgba(0, 240, 255, 0.08))', 
                border: '2px solid rgba(0, 255, 128, 0.5)', 
                borderRadius: '12px', 
                padding: '24px', 
                textAlign: 'center',
                marginBottom: '25px',
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
                <div style={{ background: 'rgba(0, 240, 255, 0.04)', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.3)', padding: '16px', marginBottom: '20px' }}>
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
                  const summary = `SENDCUTSEND BENDING REPORT (${activeParams.specName})\n` +
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
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            📐 Visual Flat Pattern Strip & Formed Profile Preview
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '25px' }}>
            Below is the scaled mathematical visualization of your sheet metal blank before and after press brake bending.
          </p>

          {/* DIAGRAM 1: FLAT PATTERN LAYOUT STRIP */}
          <div style={{ background: 'var(--bg-primary)', padding: '25px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '0.9rem', color: '#00ff80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>
              1. Flat Pattern Layout (Top View Blank) — Total Cut Length: {calculations.flatLength.toFixed(3)} {unitLabel}
            </h4>

            <svg viewBox="0 0 800 180" style={{ width: '100%', height: 'auto', background: '#0a0e17', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
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
                    <rect x={margin} y={y0} width={availableW} height={h} fill="rgba(0, 240, 255, 0.15)" stroke="var(--accent-cyan)" strokeWidth="2" rx="2" />

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

            <svg viewBox="0 0 800 220" style={{ width: '100%', height: 'auto', background: '#0a0e17', borderRadius: '8px', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
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
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                📋 SendCutSend Sheet Metal & Plastic Bending Specifications
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0, 240, 255, 0.08)')}
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
                          background: 'rgba(0, 240, 255, 0.15)',
                          color: 'var(--accent-cyan)',
                          border: '1px solid rgba(0, 240, 255, 0.4)',
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
    </div>
  );
};
