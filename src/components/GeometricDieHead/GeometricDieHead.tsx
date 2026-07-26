import React, { useState, useMemo } from 'react';
import { useUnit } from '../../context/UnitContext';

// ---------------------------------------------------------------------------
// Geometric-style 5/16" Die Head (D, DS, DSA, DJ) Chaser Database
// Source: APK Drill Index — "Geometric die thread sizes" sheet + Class 2A/3A
// external screw thread limit tables.
// STANDARD = catalog chaser sets (Regular, ~$165/set). SPECIAL = special-order
// grind. METRIC = metric chaser sizes. REFERENCE = external screw thread limit
// data beyond the 5/16" head chaser list.
// ---------------------------------------------------------------------------

export type ChaserType = 'STANDARD' | 'SPECIAL' | 'METRIC' | 'REFERENCE';
export type ThreadClass = '2A' | '3A';

export interface ThreadLimits {
  majorMax: number;
  majorMin: number;
  pdMax: number;
  pdMin: number;
  minorMax: number;
}

export interface DieChaser {
  id: string;
  /** Display designation, e.g. "#10-32", "1/4-20", "M 5.00 × 0.8" */
  nominal: string;
  type: ChaserType;
  /** TPI for inch threads, pitch in mm for metric threads */
  tpiOrPitch: number;
  /** Basic major diameter in inches (inch threads) or mm (metric threads) */
  majorBasic: number;
  /** True when the basic major was not on the sheet and was derived from the standard series formula */
  majorCalculated?: boolean;
  suffix?: 'NC' | 'NF';
  partNo?: string;
  /** Number of chaser sets owned (0 = not owned) */
  ownedQty: number;
  /** Class 2A / 3A external thread limit dimensions (inches), where recorded */
  limits?: Partial<Record<ThreadClass, ThreadLimits>>;
}

const L = (majorMax: number, majorMin: number, pdMax: number, pdMin: number, minorMax: number): ThreadLimits =>
  ({ majorMax, majorMin, pdMax, pdMin, minorMax });

const n = (num: number, tpi: number, type: ChaserType, opts: Partial<DieChaser> = {}): DieChaser => ({
  id: `n${num}-${tpi}`,
  nominal: `#${num}-${tpi}`,
  type,
  tpiOrPitch: tpi,
  majorBasic: 0.060 + 0.013 * num,
  ownedQty: 0,
  ...opts,
});

const f = (label: string, dec: number, tpi: number, type: ChaserType, opts: Partial<DieChaser> = {}): DieChaser => ({
  id: `f${label.replace(/[/ ]/g, '-')}-${tpi}`,
  nominal: `${label}-${tpi}`,
  type,
  tpiOrPitch: tpi,
  majorBasic: dec,
  ownedQty: 0,
  ...opts,
});

const m = (dia: number, pitch: number, opts: Partial<DieChaser> = {}): DieChaser => ({
  id: `m${dia.toFixed(2)}-${pitch}`,
  nominal: `M ${dia.toFixed(2)} × ${pitch}`,
  type: 'METRIC',
  tpiOrPitch: pitch,
  majorBasic: dia,
  ownedQty: 0,
  ...opts,
});

export const DIE_CHASERS: DieChaser[] = [
  // --- Number sizes (5/16" die head chasers) ---
  n(0, 80, 'SPECIAL', { ownedQty: 1, limits: { '2A': L(0.0595, 0.0563, 0.0514, 0.0496, 0.0442), '3A': L(0.06, 0.0568, 0.0519, 0.0506, 0.0447) } }),
  n(1, 56, 'SPECIAL'),
  n(1, 64, 'SPECIAL', { limits: { '2A': L(0.0724, 0.0686, 0.0623, 0.0603, 0.0532), '3A': L(0.073, 0.0692, 0.0629, 0.0614, 0.0538) } }),
  n(1, 72, 'SPECIAL', { limits: { '2A': L(0.0724, 0.0689, 0.0634, 0.0615, 0.0554), '3A': L(0.073, 0.0695, 0.064, 0.0626, 0.056) } }),
  n(2, 56, 'SPECIAL', { limits: { '2A': L(0.0854, 0.0813, 0.0738, 0.0717, 0.0635), '3A': L(0.086, 0.0819, 0.0744, 0.0728, 0.0641) } }),
  n(2, 64, 'SPECIAL', { ownedQty: 1, limits: { '2A': L(0.0854, 0.0816, 0.0753, 0.0733, 0.0662), '3A': L(0.086, 0.0822, 0.0759, 0.0744, 0.0668) } }),
  n(3, 48, 'SPECIAL', { limits: { '2A': L(0.0983, 0.0938, 0.0848, 0.0825, 0.0727), '3A': L(0.099, 0.0945, 0.0855, 0.0838, 0.0734) } }),
  n(3, 56, 'SPECIAL', { ownedQty: 1, limits: { '2A': L(0.0983, 0.0942, 0.0867, 0.0845, 0.0764), '3A': L(0.099, 0.0949, 0.0874, 0.0858, 0.0771) } }),
  n(4, 28, 'SPECIAL', { ownedQty: 1 }),
  n(4, 32, 'SPECIAL'),
  n(4, 36, 'SPECIAL'),
  n(4, 40, 'STANDARD', { suffix: 'NC', ownedQty: 1, limits: { '2A': L(0.1112, 0.1061, 0.095, 0.0925, 0.0805), '3A': L(0.112, 0.1069, 0.0958, 0.0939, 0.0813) } }),
  n(4, 48, 'SPECIAL', { limits: { '2A': L(0.1113, 0.1068, 0.0978, 0.0954, 0.0857), '3A': L(0.112, 0.1075, 0.0985, 0.0967, 0.0864) } }),
  n(4, 64, 'SPECIAL'),
  n(5, 30, 'SPECIAL'),
  n(5, 32, 'SPECIAL'),
  n(5, 36, 'SPECIAL'),
  n(5, 40, 'STANDARD', { suffix: 'NC', partNo: 'DHC-5-40-5', ownedQty: 3, limits: { '2A': L(0.1242, 0.1191, 0.108, 0.1054, 0.0935), '3A': L(0.125, 0.1199, 0.1088, 0.1069, 0.0943) } }),
  n(5, 44, 'STANDARD', { suffix: 'NF', partNo: 'DHC-5-44-5', limits: { '2A': L(0.1243, 0.1195, 0.1095, 0.107, 0.0964), '3A': L(0.125, 0.1202, 0.1102, 0.1083, 0.0971) } }),
  n(5, 48, 'SPECIAL', { ownedQty: 1 }),
  n(6, 32, 'STANDARD', { suffix: 'NC', partNo: 'DHC-6-32-5', ownedQty: 2, limits: { '2A': L(0.1372, 0.1312, 0.1169, 0.1141, 0.0989), '3A': L(0.138, 0.132, 0.1177, 0.1156, 0.0997) } }),
  n(6, 36, 'SPECIAL'),
  n(6, 40, 'STANDARD', { suffix: 'NF', partNo: 'DHC-6-40-5', limits: { '2A': L(0.1372, 0.1321, 0.121, 0.1184, 0.1065), '3A': L(0.138, 0.1329, 0.1218, 0.1198, 0.1073) } }),
  n(6, 48, 'SPECIAL'),
  n(7, 32, 'SPECIAL', { majorCalculated: true }),
  n(8, 30, 'SPECIAL'),
  n(8, 32, 'STANDARD', { suffix: 'NC', partNo: 'DHC-8-32-5', ownedQty: 1, limits: { '2A': L(0.1631, 0.1571, 0.1428, 0.1399, 0.1248), '3A': L(0.164, 0.158, 0.1437, 0.1415, 0.1257) } }),
  n(8, 36, 'STANDARD', { suffix: 'NF', partNo: 'DHC-8-36-5', ownedQty: 1, limits: { '2A': L(0.1632, 0.1577, 0.1452, 0.1424, 0.1291), '3A': L(0.164, 0.1585, 0.146, 0.1439, 0.1299) } }),
  n(8, 40, 'SPECIAL'),
  n(8, 48, 'SPECIAL'),
  n(10, 24, 'STANDARD', { suffix: 'NC', partNo: 'DHC-10-24-5', ownedQty: 1, limits: { '2A': L(0.189, 0.1818, 0.1619, 0.1586, 0.1379), '3A': L(0.19, 0.1828, 0.1629, 0.1604, 0.1389) } }),
  n(10, 32, 'STANDARD', { suffix: 'NF', partNo: 'DHC-10-32-5', ownedQty: 1, limits: { '2A': L(0.1891, 0.1831, 0.1688, 0.1658, 0.1508), '3A': L(0.19, 0.184, 0.1697, 0.1674, 0.1517) } }),
  n(10, 40, 'SPECIAL'),
  n(10, 48, 'SPECIAL'),
  n(10, 56, 'SPECIAL'),
  n(12, 20, 'SPECIAL', { majorCalculated: true }),
  n(12, 24, 'STANDARD', { suffix: 'NC', partNo: 'DHC-12-24-5', majorCalculated: true }),
  n(12, 28, 'STANDARD', { suffix: 'NF', partNo: 'DHC-12-28-5', majorCalculated: true }),
  n(12, 32, 'SPECIAL', { ownedQty: 1, majorCalculated: true }),
  n(12, 36, 'SPECIAL', { majorCalculated: true }),
  n(12, 40, 'SPECIAL', { majorCalculated: true }),
  n(12, 48, 'SPECIAL', { majorCalculated: true }),
  n(14, 24, 'SPECIAL', { majorCalculated: true }),
  n(14, 27, 'SPECIAL', { majorCalculated: true }),
  n(14, 32, 'SPECIAL', { majorCalculated: true }),
  n(14, 36, 'SPECIAL', { majorCalculated: true }),
  n(14, 40, 'SPECIAL', { majorCalculated: true }),
  n(14, 48, 'SPECIAL', { majorCalculated: true }),
  n(14, 56, 'SPECIAL', { majorCalculated: true }),
  // --- Fractional sizes (5/16" die head chasers) ---
  f('1/4', 0.25, 20, 'STANDARD', { suffix: 'NC', partNo: 'DHC-1/4-20-5', ownedQty: 2, limits: { '2A': L(0.2489, 0.2408, 0.2164, 0.2127, 0.1876), '3A': L(0.25, 0.2419, 0.2175, 0.2147, 0.1887) } }),
  f('1/4', 0.25, 24, 'SPECIAL'),
  f('1/4', 0.25, 27, 'SPECIAL'),
  f('1/4', 0.25, 28, 'STANDARD', { suffix: 'NF', partNo: 'DHC-1/4-28-5', ownedQty: 2, limits: { '2A': L(0.249, 0.2425, 0.2258, 0.2225, 0.2052), '3A': L(0.25, 0.2435, 0.2268, 0.2243, 0.2062) } }),
  f('1/4', 0.25, 32, 'SPECIAL'),
  f('1/4', 0.25, 36, 'SPECIAL', { ownedQty: 3 }),
  f('1/4', 0.25, 40, 'SPECIAL'),
  f('1/4', 0.25, 48, 'SPECIAL'),
  f('1/4', 0.25, 56, 'SPECIAL'),
  f('5/16', 0.3125, 18, 'STANDARD', { suffix: 'NC', partNo: 'DHC-5/16-18-5', ownedQty: 1, limits: { '2A': L(0.3113, 0.3026, 0.2752, 0.2712, 0.2431), '3A': L(0.3125, 0.3038, 0.2764, 0.2734, 0.2443) } }),
  f('5/16', 0.3125, 20, 'SPECIAL'),
  f('5/16', 0.3125, 24, 'STANDARD', { suffix: 'NF', partNo: 'DHC-5/16-24-5', ownedQty: 3, limits: { '2A': L(0.3114, 0.3042, 0.2843, 0.2806, 0.2603), '3A': L(0.3125, 0.3053, 0.2854, 0.2827, 0.2614) } }),
  f('5/16', 0.3125, 27, 'SPECIAL', { ownedQty: 2 }),
  f('5/16', 0.3125, 28, 'SPECIAL'),
  f('5/16', 0.3125, 32, 'SPECIAL'),
  f('5/16', 0.3125, 36, 'SPECIAL'),
  f('5/16', 0.3125, 40, 'SPECIAL'),
  f('5/16', 0.3125, 48, 'SPECIAL'),
  f('3/8', 0.375, 32, 'SPECIAL', { ownedQty: 2 }),
  // --- Metric sizes ---
  m(1.0, 0.25), m(1.1, 0.25), m(1.2, 0.25), m(1.4, 0.3), m(1.6, 0.35), m(1.8, 0.35),
  m(2.0, 0.4), m(2.2, 0.45), m(2.5, 0.45), m(3.0, 0.5), m(3.5, 0.6), m(4.0, 0.7),
  m(4.5, 0.75), m(5.0, 0.8, { ownedQty: 2 }), m(6.0, 1.0), m(7.0, 1.0),
  // --- External screw thread limit reference (beyond the 5/16" head list) ---
  f('3/8', 0.375, 16, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.3737, 0.3643, 0.3331, 0.3287, 0.297), '3A': L(0.375, 0.3656, 0.3344, 0.3311, 0.2983) } }),
  f('3/8', 0.375, 24, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.3739, 0.3667, 0.3468, 0.343, 0.3228), '3A': L(0.375, 0.3678, 0.3479, 0.345, 0.3239) } }),
  f('7/16', 0.4375, 14, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.4361, 0.4258, 0.3897, 0.385, 0.3485), '3A': L(0.4375, 0.4272, 0.3911, 0.3876, 0.3499) } }),
  f('7/16', 0.4375, 20, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.4362, 0.4281, 0.4037, 0.3995, 0.3749), '3A': L(0.4375, 0.4294, 0.405, 0.4019, 0.3762) } }),
  f('1/2', 0.5, 13, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.4985, 0.4876, 0.4485, 0.4435, 0.4041), '3A': L(0.5, 0.4891, 0.45, 0.4463, 0.4056) } }),
  f('1/2', 0.5, 20, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.4987, 0.4906, 0.4662, 0.4619, 0.4374), '3A': L(0.5, 0.4919, 0.4675, 0.4643, 0.4387) } }),
  f('9/16', 0.5625, 12, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.5609, 0.5495, 0.5068, 0.5016, 0.4617), '3A': L(0.5609, 0.5495, 0.5068, 0.5016, 0.4617) } }),
  f('9/16', 0.5625, 14, 'REFERENCE', { limits: { '2A': L(0.551, 0.5507, 0.5146, 0.5096, 0.476) } }),
  f('9/16', 0.5625, 16, 'REFERENCE', { limits: { '2A': L(0.5611, 0.5517, 0.5205, 0.5158, 0.4866), '3A': L(0.5625, 0.5531, 0.5219, 0.5184, 0.488) } }),
  f('9/16', 0.5625, 18, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.5611, 0.5524, 0.525, 0.5205, 0.495), '3A': L(0.5625, 0.5538, 0.5264, 0.523, 0.4964) } }),
  f('9/16', 0.5625, 20, 'REFERENCE', { limits: { '2A': L(0.5612, 0.5531, 0.5287, 0.5245, 0.5017), '3A': L(0.5625, 0.5544, 0.53, 0.5268, 0.503) } }),
  f('9/16', 0.5625, 24, 'REFERENCE', { limits: { '2A': L(0.5613, 0.5541, 0.5342, 0.5303, 0.5117), '3A': L(0.5625, 0.5553, 0.5354, 0.5325, 0.5129) } }),
  f('9/16', 0.5625, 32, 'REFERENCE', { limits: { '2A': L(0.5615, 0.5555, 0.5412, 0.5377, 0.5243), '3A': L(0.5625, 0.5565, 0.5422, 0.5396, 0.5253) } }),
  f('5/8', 0.625, 11, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.6234, 0.6113, 0.5644, 0.5589, 0.5119), '3A': L(0.625, 0.6129, 0.566, 0.5619, 0.5135) } }),
  f('5/8', 0.625, 18, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.6236, 0.6149, 0.5875, 0.5828, 0.5554), '3A': L(0.625, 0.6163, 0.5889, 0.5854, 0.5568) } }),
  f('3/4', 0.75, 10, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.7482, 0.7353, 0.6832, 0.6773, 0.6255), '3A': L(0.75, 0.7371, 0.685, 0.6806, 0.6273) } }),
  f('3/4', 0.75, 16, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.7485, 0.7391, 0.7079, 0.7029, 0.6718), '3A': L(0.75, 0.7406, 0.7094, 0.7056, 0.6733) } }),
  f('7/8', 0.875, 9, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.8731, 0.8592, 0.8009, 0.7946, 0.7368), '3A': L(0.875, 0.8611, 0.8028, 0.7981, 0.7387) } }),
  f('7/8', 0.875, 14, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.8734, 0.8631, 0.827, 0.8216, 0.7858), '3A': L(0.875, 0.8647, 0.8286, 0.8245, 0.7874) } }),
  f('1', 1.0, 8, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(0.998, 0.983, 0.9168, 0.91, 0.8446), '3A': L(1, 0.985, 0.9188, 0.9137, 0.8466) } }),
  f('1', 1.0, 12, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(0.9982, 0.9868, 0.9441, 0.9382, 0.896), '3A': L(1, 0.9886, 0.9459, 0.9415, 0.8978) } }),
  f('1-1/8', 1.125, 7, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(1.1228, 1.1064, 1.03, 1.0228, 0.9475) } }),
  f('1-1/8', 1.125, 12, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(1.1232, 1.1118, 1.0691, 1.0631, 1.021) } }),
  f('1-1/4', 1.25, 7, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(1.2478, 1.2314, 1.155, 1.1476, 1.0725) } }),
  f('1-1/4', 1.25, 12, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(1.2482, 1.2368, 1.1941, 1.1879, 1.146) } }),
  f('1-3/8', 1.375, 6, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(1.3726, 1.3544, 1.2643, 1.2563, 1.1681) } }),
  f('1-3/8', 1.375, 12, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(1.3731, 1.3617, 1.319, 1.3127, 1.2709) } }),
  f('1-1/2', 1.5, 6, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(1.4976, 1.4794, 1.3893, 1.3812, 1.2931) } }),
  f('1-1/2', 1.5, 12, 'REFERENCE', { suffix: 'NF', limits: { '2A': L(1.4981, 1.4867, 1.444, 1.4376, 1.3959) } }),
  f('1-3/4', 1.75, 5, 'REFERENCE', { suffix: 'NC', limits: { '2A': L(1.7473, 1.7268, 1.6174, 1.6085, 1.5019) } }),
  f('2', 2.0, 6, 'REFERENCE', { limits: { '2A': L(1.9971, 1.9751, 1.8528, 1.8433, 1.7245) } }),
];

type FilterType = 'ALL' | ChaserType;

const TYPE_COLORS: Record<ChaserType, { fg: string; bg: string; border: string }> = {
  STANDARD: { fg: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)' },
  SPECIAL: { fg: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)' },
  METRIC: { fg: '#00f0ff', bg: 'rgba(0, 240, 255, 0.12)', border: 'rgba(0, 240, 255, 0.35)' },
  REFERENCE: { fg: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.35)' },
};

const TYPE_LABELS: Record<ChaserType, string> = {
  STANDARD: 'STANDARD',
  SPECIAL: 'SPECIAL',
  METRIC: 'METRIC',
  REFERENCE: 'REF',
};

export const GeometricDieHead: React.FC = () => {
  const { unit } = useUnit();
  const [typeFilter, setTypeFilter] = useState<FilterType>(unit === 'metric' ? 'METRIC' : 'ALL');
  const [ownedOnly, setOwnedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('f1-4-20');
  const [threadClass, setThreadClass] = useState<ThreadClass>('2A');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/\s+/g, '');
    return DIE_CHASERS.filter(c => {
      if (typeFilter !== 'ALL' && c.type !== typeFilter) return false;
      if (ownedOnly && c.ownedQty === 0) return false;
      if (!q) return true;
      const hay = `${c.nominal}${c.partNo ?? ''}${c.suffix ?? ''}${c.majorBasic}`.toLowerCase().replace(/\s+/g, '');
      return hay.includes(q);
    });
  }, [typeFilter, ownedOnly, searchQuery]);

  const sel = useMemo(() => DIE_CHASERS.find(c => c.id === selectedId) || DIE_CHASERS[0], [selectedId]);

  const ownedCount = DIE_CHASERS.filter(c => c.ownedQty > 0).length;
  const standardCount = DIE_CHASERS.filter(c => c.type === 'STANDARD').length;

  // --- Derived geometry for the selected chaser ---
  const isMetric = sel.type === 'METRIC';
  // Active thread class: fall back to whichever class is recorded
  const availableClasses = (Object.keys(sel.limits ?? {}) as ThreadClass[]);
  const cls: ThreadClass | undefined = availableClasses.includes(threadClass) ? threadClass : availableClasses[0];
  const lim = cls ? sel.limits![cls] : undefined;
  // Pitch in the thread's native unit (inches for inch threads, mm for metric)
  const pitch = isMetric ? sel.tpiOrPitch : 1 / sel.tpiOrPitch;
  // Basic 60° thread-form diameters: d2 = d − 0.6495P, d3 = d − 1.2269P
  const pdBasic = sel.majorBasic - 0.649519 * pitch;
  const minorBasic = sel.majorBasic - 1.226869 * pitch;
  const threadDepth = 0.613435 * pitch;
  // Display values: recorded limits when available, else calculated basic
  const majorDisp = lim?.majorMax ?? sel.majorBasic;
  const pdDisp = lim?.pdMax ?? pdBasic;
  const minorDisp = lim?.minorMax ?? minorBasic;
  // Three-wire measurement: best wire W = 0.57735P, M = E + 3W − 0.86603P
  const bestWire = 0.57735 * pitch;
  const wireConst = 3 * bestWire - 0.866025 * pitch;
  const mowMax = (lim?.pdMax ?? pdBasic) + wireConst;
  const mowMin = lim ? lim.pdMin + wireConst : undefined;
  // Helix (lead) angle at the pitch diameter: tan λ = P / (π·d2)
  const helixDeg = Math.atan(pitch / (Math.PI * pdDisp)) * (180 / Math.PI);
  // Blank (rod) diameter guidance: within major limits when known, else just under basic
  const blankMax = lim?.majorMax ?? sel.majorBasic - 0.05 * pitch;
  const blankMin = lim?.majorMin ?? sel.majorBasic - 0.15 * pitch;

  const dual = (native: number, decimals: { in: number; mm: number } = { in: 4, mm: 3 }) => {
    const inches = isMetric ? native / 25.4 : native;
    const mm = isMetric ? native : native * 25.4;
    return unit === 'metric'
      ? `${mm.toFixed(decimals.mm)} mm`
      : `${inches.toFixed(decimals.in)}"`;
  };
  const dualSub = (native: number) => {
    const inches = isMetric ? native / 25.4 : native;
    const mm = isMetric ? native : native * 25.4;
    return unit === 'metric' ? `${inches.toFixed(4)}"` : `${mm.toFixed(3)} mm`;
  };

  const typeColor = TYPE_COLORS[sel.type];

  // --- Live SVG thread-chart geometry (scaled from the selected thread) ---
  const svgGeo = useMemo(() => {
    const W = 560, H = 290, cy = 152;
    const majorHalf = 92;
    const majorTopY = cy - majorHalf;
    const pxPerUnit = (2 * majorHalf) / majorDisp;
    let scale = 1;
    const rawPitchPx = pitch * pxPerUnit;
    if (rawPitchPx < 30) scale = 30 / rawPitchPx;
    if (rawPitchPx > 110) scale = 110 / rawPitchPx;
    const pitchPx = rawPitchPx * scale;
    const radial = (dia: number) => ((majorDisp - dia) / 2) * pxPerUnit * scale;
    const depthPx = Math.max(radial(minorDisp), 8);
    const minorTopY = majorTopY + depthPx;
    const pdTopY = majorTopY + Math.max(radial(pdDisp), 4);

    // UN-style tooth: root flat P/4, flank 0.3125P, crest flat P/8
    const x0 = 40, x1 = 400;
    const rootFlat = 0.25 * pitchPx, flank = 0.3125 * pitchPx, crestFlat = 0.125 * pitchPx;
    const top: [number, number][] = [[x0, minorTopY]];
    let x = x0;
    const crestXs: number[] = [];
    while (x < x1 + pitchPx) {
      const a = x + rootFlat / 2;
      const b = a + flank;
      const c = b + crestFlat;
      const d = x + pitchPx;
      crestXs.push(b + crestFlat / 2);
      top.push([a, minorTopY], [b, majorTopY], [c, majorTopY], [d, minorTopY]);
      x = d;
    }
    const bottom = [...top].reverse().map(([px2, py]) => [px2, 2 * cy - py] as [number, number]);
    const pathD = `M ${top.map(p => p.join(' ')).join(' L ')} L ${top[top.length - 1][0]} ${bottom[0][1]} L ${bottom.map(p => p.join(' ')).join(' L ')} Z`;
    return {
      W, H, cy, majorTopY, minorTopY, pdTopY, pitchPx, pathD, crestXs, x0, x1,
      scaled: scale !== 1, scale,
      majorBotY: 2 * cy - majorTopY, minorBotY: 2 * cy - minorTopY, pdBotY: 2 * cy - pdTopY,
    };
  }, [majorDisp, minorDisp, pdDisp, pitch]);

  const g = svgGeo;
  // First fully-visible crest pair for the pitch callout
  const pc0 = g.crestXs.find(cx => cx > g.x0 + g.pitchPx * 0.4) ?? g.crestXs[0];
  const pc1 = pc0 + g.pitchPx;

  const specRow = (label: string, native: number | undefined, opts: { accent?: string; calc?: boolean } = {}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}{opts.calc && <span style={{ color: '#c084fc', marginLeft: '6px', fontSize: '0.68rem' }}>CALC</span>}
      </span>
      {native === undefined ? (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>—</span>
      ) : (
        <span style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
          <strong style={{ color: opts.accent ?? '#fff', fontSize: '0.92rem' }}>{dual(native)}</strong>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>{dualSub(native)}</span>
        </span>
      )}
    </div>
  );

  const dimText = { fontFamily: 'var(--font-mono)', fontWeight: 700 } as const;

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto', padding: '10px 0' }}>
      {/* Compact Title Bar */}
      <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>
          🔩 Geometric Die Head <span style={{ color: 'var(--accent-cyan)', fontWeight: 400 }}>// Chaser & Thread Limits</span>
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: '#fff' }}>{DIE_CHASERS.length}</strong> sizes
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: TYPE_COLORS.STANDARD.bg, border: `1px solid ${TYPE_COLORS.STANDARD.border}`, fontSize: '0.78rem', color: TYPE_COLORS.STANDARD.fg }}>
            <strong>{standardCount}</strong> standard
          </div>
          <div style={{ padding: '4px 12px', borderRadius: '8px', background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.35)', fontSize: '0.78rem', color: '#00ff80' }}>
            <strong>{ownedCount}</strong> owned
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px' }}>

        {/* Left Card: Live Thread Chart & Specs */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 48, 0.8) 100%)' }}>

          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {sel.nominal}{sel.suffix ? ` (${sel.suffix})` : ''}
              </h3>
              {sel.partNo && (
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>P/N {sel.partNo}</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: typeColor.fg, background: typeColor.bg, border: `1px solid ${typeColor.border}` }}>
                  {sel.type === 'SPECIAL' ? 'SPECIAL ORDER' : sel.type === 'REFERENCE' ? 'THREAD REF' : sel.type}
                </span>
                {sel.ownedQty > 0 ? (
                  <span style={{ padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: '#00ff80', background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.35)' }}>
                    ✓ OWNED{sel.ownedQty > 1 ? ` × ${sel.ownedQty}` : ''}
                  </span>
                ) : sel.type !== 'REFERENCE' && (
                  <span style={{ padding: '3px 10px', borderRadius: '14px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)' }}>
                    NOT OWNED
                  </span>
                )}
              </div>
              {/* Class 2A / 3A toggle */}
              {availableClasses.length > 0 && (
                <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  {(['2A', '3A'] as ThreadClass[]).map(c => {
                    const has = availableClasses.includes(c);
                    const active = cls === c;
                    return (
                      <button
                        key={c}
                        onClick={() => has && setThreadClass(c)}
                        disabled={!has}
                        style={{
                          padding: '4px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          background: active ? 'var(--accent-cyan)' : 'transparent',
                          color: active ? '#000' : has ? 'var(--text-secondary)' : 'rgba(255,255,255,0.15)',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: has ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Class {c}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* LIVE External Screw Thread Chart (SVG) */}
          <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: `2px solid ${typeColor.border}`, padding: '10px 6px 4px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '8px', left: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              EXTERNAL SCREW THREAD — LIVE SECTION
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '14px', fontSize: '0.7rem', color: typeColor.fg, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-mono)' }}>
              {lim ? `CLASS ${cls} LIMITS (MAX)` : 'BASIC FORM (CALC)'}{g.scaled ? ` · DEPTH ×${g.scale.toFixed(1)}` : ''}
            </div>
            <svg viewBox={`0 0 ${g.W} ${g.H}`} style={{ width: '100%', height: 'auto', marginTop: '14px' }}>
              <defs>
                <linearGradient id="dieThreadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b6b7f" />
                  <stop offset="45%" stopColor="#2c3a4e" />
                  <stop offset="55%" stopColor="#2c3a4e" />
                  <stop offset="100%" stopColor="#5b6b7f" />
                </linearGradient>
                <clipPath id="dieThreadClip">
                  <rect x={g.x0} y="0" width={g.x1 - g.x0} height={g.H} />
                </clipPath>
              </defs>

              {/* Threaded rod cross-section */}
              <g clipPath="url(#dieThreadClip)">
                <path d={g.pathD} fill="url(#dieThreadGrad)" stroke={typeColor.fg} strokeWidth="1.5" strokeLinejoin="round" />
              </g>
              {/* Centerline */}
              <line x1={g.x0 - 20} y1={g.cy} x2={g.x1 + 20} y2={g.cy} stroke="rgba(255,255,255,0.35)" strokeWidth="1" strokeDasharray="14 4 3 4" />
              {/* Pitch line (upper) */}
              <line x1={g.x0} y1={g.pdTopY} x2={g.x1} y2={g.pdTopY} stroke="rgba(0,240,255,0.45)" strokeWidth="1" strokeDasharray="5 4" />

              {/* PITCH callout */}
              <line x1={pc0} y1={g.majorTopY - 4} x2={pc0} y2={g.majorTopY - 26} stroke="#fff" strokeWidth="0.8" />
              <line x1={pc1} y1={g.majorTopY - 4} x2={pc1} y2={g.majorTopY - 26} stroke="#fff" strokeWidth="0.8" />
              <line x1={pc0} y1={g.majorTopY - 20} x2={pc1} y2={g.majorTopY - 20} stroke="#fff" strokeWidth="0.8" markerStart="url(#none)" />
              <text x={(pc0 + pc1) / 2} y={g.majorTopY - 26} fill="#fff" fontSize="10" textAnchor="middle" style={dimText}>
                PITCH {isMetric ? `${pitch} mm` : `${dual(pitch)} (${sel.tpiOrPitch} TPI)`}
              </text>

              {/* THREAD ANGLE callout */}
              <text x={pc1 + g.pitchPx} y={g.majorTopY - 8} fill={typeColor.fg} fontSize="10" textAnchor="middle" style={dimText}>
                60° THREAD ANGLE
              </text>
              <line x1={pc1 + g.pitchPx} y1={g.majorTopY - 4} x2={pc1 + g.pitchPx * 0.82} y2={g.minorTopY - 2} stroke={typeColor.fg} strokeWidth="0.7" opacity="0.6" />
              <line x1={pc1 + g.pitchPx} y1={g.majorTopY - 4} x2={pc1 + g.pitchPx * 1.18} y2={g.minorTopY - 2} stroke={typeColor.fg} strokeWidth="0.7" opacity="0.6" />

              {/* DEPTH dim */}
              <line x1={g.x1 + 12} y1={g.majorTopY} x2={g.x1 + 12} y2={g.minorTopY} stroke="#fff" strokeWidth="0.8" />
              <line x1={g.x1 - 2} y1={g.majorTopY} x2={g.x1 + 16} y2={g.majorTopY} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              <line x1={g.x1 - 2} y1={g.minorTopY} x2={g.x1 + 16} y2={g.minorTopY} stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
              <text x={g.x1 + 20} y={(g.majorTopY + g.minorTopY) / 2 + 3} fill="#fff" fontSize="9" style={dimText}>
                DEPTH {dual(threadDepth)}
              </text>

              {/* MINOR DIA dim */}
              <line x1={g.x1 + 44} y1={g.minorTopY} x2={g.x1 + 44} y2={g.minorBotY} stroke="#c084fc" strokeWidth="0.9" />
              <line x1={g.x1 - 2} y1={g.minorBotY} x2={g.x1 + 48} y2={g.minorBotY} stroke="rgba(192,132,252,0.4)" strokeWidth="0.6" />
              <text x={g.x1 + 50} y={g.cy - 26} fill="#c084fc" fontSize="9" style={dimText}>MINOR</text>
              <text x={g.x1 + 50} y={g.cy - 16} fill="#c084fc" fontSize="9" style={dimText}>DIA.</text>
              <text x={g.x1 + 50} y={g.cy - 5} fill="#c084fc" fontSize="9" style={dimText}>{dual(minorDisp)}</text>

              {/* PITCH DIA dim */}
              <line x1={g.x1 + 92} y1={g.pdTopY} x2={g.x1 + 92} y2={g.pdBotY} stroke="#00f0ff" strokeWidth="0.9" />
              <line x1={g.x1 - 2} y1={g.pdTopY} x2={g.x1 + 96} y2={g.pdTopY} stroke="rgba(0,240,255,0.35)" strokeWidth="0.6" />
              <line x1={g.x1 - 2} y1={g.pdBotY} x2={g.x1 + 96} y2={g.pdBotY} stroke="rgba(0,240,255,0.35)" strokeWidth="0.6" />
              <text x={g.x1 + 98} y={g.cy + 12} fill="#00f0ff" fontSize="9" style={dimText}>PITCH</text>
              <text x={g.x1 + 98} y={g.cy + 22} fill="#00f0ff" fontSize="9" style={dimText}>DIA.</text>
              <text x={g.x1 + 98} y={g.cy + 33} fill="#00f0ff" fontSize="9" style={dimText}>{dual(pdDisp)}</text>

              {/* MAJOR DIA dim */}
              <line x1={g.x1 + 140} y1={g.majorTopY} x2={g.x1 + 140} y2={g.majorBotY} stroke={typeColor.fg} strokeWidth="0.9" />
              <line x1={g.x1 - 2} y1={g.majorBotY} x2={g.x1 + 144} y2={g.majorBotY} stroke={typeColor.border} strokeWidth="0.6" />
              <text x={g.x1 + 108} y={g.majorBotY + 16} fill={typeColor.fg} fontSize="9" style={dimText}>MAJOR DIA. {dual(majorDisp)}</text>

              {/* ROOT & CREST leaders */}
              <text x={g.x0 + 60} y={g.H - 6} fill="var(--text-muted, #94a3b8)" fontSize="9" style={dimText}>ROOT</text>
              <line x1={g.x0 + 72} y1={g.H - 15} x2={pc0 - g.pitchPx * 0.5} y2={g.minorBotY + 1} stroke="#94a3b8" strokeWidth="0.6" />
              <text x={g.x0 + 130} y={g.H - 6} fill="var(--text-muted, #94a3b8)" fontSize="9" style={dimText}>CREST</text>
              <line x1={g.x0 + 142} y1={g.H - 15} x2={pc1} y2={g.majorBotY - 1} stroke="#94a3b8" strokeWidth="0.6" />

              {/* HELIX ANGLE */}
              <text x={g.x0} y={22} fill="#00ff80" fontSize="9" style={dimText}>
                HELIX ANGLE λ = {helixDeg.toFixed(2)}°
              </text>
            </svg>
          </div>

          {/* Spec Table */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              {lim ? `CLASS ${cls} EXTERNAL THREAD LIMITS` : 'BASIC THREAD GEOMETRY (CALCULATED)'}
            </div>
            {specRow('Major Ø Basic', sel.majorBasic, { accent: typeColor.fg, calc: sel.majorCalculated })}
            {lim && specRow('Major Ø Max / Min', undefined)}
            {lim && specRow('· Max', lim.majorMax)}
            {lim && specRow('· Min', lim.majorMin)}
            {specRow('Pitch Ø Max', lim ? lim.pdMax : pdBasic, { accent: '#00f0ff', calc: !lim })}
            {lim ? specRow('Pitch Ø Min', lim.pdMin) : specRow('Minor Ø Basic', minorBasic, { calc: true })}
            {lim && specRow('Minor Ø Max', lim.minorMax)}
            {specRow(isMetric ? 'Pitch (P)' : `Pitch (1/${sel.tpiOrPitch} TPI)`, pitch)}
          </div>

          {/* 3-Wire Measurement */}
          <div style={{ background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              3-WIRE PITCH Ø CHECK
            </div>
            {specRow('Best Wire Size (0.57735·P)', bestWire, { accent: '#00f0ff' })}
            {specRow('Measure Over Wires Max', mowMax, { calc: !lim })}
            {mowMin !== undefined && specRow('Measure Over Wires Min', mowMin)}
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              M = E + 3W − 0.86603·P. Thread cut by the die head is in tolerance when the
              over-wire reading falls {mowMin !== undefined ? 'between Min and Max' : 'at or below Max'}.
            </p>
          </div>

          {/* Blank guidance */}
          <div style={{ background: 'rgba(0, 255, 128, 0.05)', border: '1px solid rgba(0, 255, 128, 0.2)', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.72rem', color: '#00ff80', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
              BLANK (ROD) DIAMETER
            </div>
            {specRow('Turn Blank To (Max)', blankMax, { accent: '#00ff80', calc: !lim })}
            {specRow('Turn Blank To (Min)', blankMin, { calc: !lim })}
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
              {lim
                ? 'Crests form at blank size — turn the rod inside the Major Ø Max/Min window before running the die head.'
                : 'Limit data not recorded for this size — range approximated at 5–15% of pitch under basic major. Turn a test blank and verify with the 3-wire check above.'}
            </p>
          </div>
        </div>

        {/* Right Card: Search, Filters & Index */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Type Filter Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-primary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              {(['ALL', 'STANDARD', 'SPECIAL', 'METRIC', 'REFERENCE'] as FilterType[]).map(t => {
                const active = typeFilter === t;
                const color = t === 'ALL' ? '#fff' : TYPE_COLORS[t as ChaserType].fg;
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    style={{
                      padding: '7px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      background: active ? (t === 'ALL' ? 'rgba(255,255,255,0.15)' : TYPE_COLORS[t as ChaserType].bg) : 'transparent',
                      color: active ? color : 'var(--text-secondary)',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: active && t !== 'ALL' ? `inset 0 0 0 1px ${TYPE_COLORS[t as ChaserType].border}` : 'none'
                    }}
                  >
                    {t === 'ALL' ? 'All' : t === 'REFERENCE' ? 'Ref' : t.charAt(0) + t.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setOwnedOnly(o => !o)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: ownedOnly ? 'rgba(0, 255, 128, 0.5)' : 'var(--border-color)',
                background: ownedOnly ? 'rgba(0, 255, 128, 0.12)' : 'var(--bg-primary)',
                color: ownedOnly ? '#00ff80' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              ✓ Owned Only
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search chaser (e.g., 1/4-28, #10, M 5, DHC-8-32)..."
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

          {/* Chaser List */}
          <div style={{
            maxHeight: '640px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-primary)',
            padding: '8px'
          }}>
            {filtered.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No chasers match the current filters.
              </div>
            )}
            {filtered.map(c => {
              const isSelected = c.id === selectedId;
              const tc = TYPE_COLORS[c.type];
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 14px',
                    borderRadius: '6px',
                    background: isSelected ? `linear-gradient(90deg, ${tc.bg}, transparent)` : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? tc.border : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '0.98rem', color: isSelected ? tc.fg : '#fff', minWidth: '92px' }}>
                      {c.nominal}
                    </strong>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.5px', color: tc.fg, background: tc.bg, border: `1px solid ${tc.border}` }}>
                      {TYPE_LABELS[c.type]}{c.suffix ? ` · ${c.suffix}` : ''}
                    </span>
                    {c.ownedQty > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: '10px', fontSize: '0.63rem', fontWeight: 700, color: '#00ff80', background: 'rgba(0, 255, 128, 0.1)', border: '1px solid rgba(0, 255, 128, 0.35)' }}>
                        ✓{c.ownedQty > 1 ? ` ×${c.ownedQty}` : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>MAJOR Ø</span>
                    <strong style={{ color: isSelected ? tc.fg : 'var(--text-secondary)', fontSize: '0.88rem' }}>
                      {c.type === 'METRIC' ? `${c.majorBasic.toFixed(2)} mm` : `${c.majorBasic.toFixed(4)}"`}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Footer: tool description & legend (kept out of the header per site convention) */}
      <div className="glass-panel" style={{ marginTop: '25px', padding: '16px 22px' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
          GEOMETRIC 5/16" DIE HEADS (D, DS, DSA, DJ) // CHASER INDEX & CLASS 2A/3A THREAD LIMITS
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Interactive selector for Geometric-style self-opening die head chasers with live external-thread section rendering,
          Class 2A/3A limit dimensions, 3-wire pitch diameter checks, and blank (rod) turning guidance.{' '}
          <strong style={{ color: TYPE_COLORS.STANDARD.fg }}>Standard</strong> sizes are regular catalog chaser sets for
          5/16" D, DS, DSA & DJ heads (~$165/set of 4). <strong style={{ color: TYPE_COLORS.SPECIAL.fg }}>Special</strong> sizes
          are special-order grinds. <strong style={{ color: TYPE_COLORS.METRIC.fg }}>Metric</strong> sizes follow the ISO coarse
          series. <strong style={{ color: TYPE_COLORS.REFERENCE.fg }}>Ref</strong> entries are external screw thread limit data
          (3/8" – 2") beyond the 5/16" head capacity, for larger die heads and single-point work. Values marked{' '}
          <span style={{ color: '#c084fc' }}>CALC</span> are derived from the basic 60° thread form, not measured limit tables.
        </p>
      </div>
    </div>
  );
};

export default GeometricDieHead;
