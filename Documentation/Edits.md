# Machinist.like.audio // Precision Engineering & Metrology Suite
## Master Tool Categorization & Toolset Architecture

This document establishes the definitive taxonomic categories for all computational tools, reference indices, and visualizers within the **Machinist.like.audio** ecosystem. Each category groups specialized utilities designed for toolroom machinists, CNC programmers, metrologists, metallurgists, and fabrication engineers.

---

## 1. 📐 Metrology, Inspection & GD&T
*Precision measurement, gauge block stacks, geometric dimensioning & tolerancing (GD&T), and material surface inspection utilities.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `calculator` | **Jo Block & Height Gauge Calculator** | ASME B89.1.9 / 81-pc Imperial & 87-pc Metric | Calculating exact gauge block wringing combinations for height gauge zeroing and sine bar setups. |
| `sine_bar_vise` | **Sine Bar & Sine Vise Angle Calculator** | $H = L \times \sin(\theta)$ | Calculating gauge block stack heights required to tilt 5-inch or 10-inch sine bars and toolmaker vises to precise angles. |
| `true_position` | **True Position (GD&T) Calculator** | $\text{TP} = 2 \times \sqrt{\Delta X^2 + \Delta Y^2}$ | Verifying hole location deviations against MMC/LMC bonus tolerance limits with instant PASS/FAIL inspection verdicts. |
| `fits_tolerances` | **Fits & Tolerances (ISO/ANSI)** | ISO 286 Hole-Basis System | Determining exact shaft and hole tolerance limits (H7/g6, H7/p6, etc.) for clearance, transition, and interference fits. |
| `surface_finish` | **Surface Finish Conversion** | Ra, RMS, Rz, CLA, ISO N-Grades | Translating roughness measurements across global standards and mapping them to manufacturing process capabilities. |
| `hardness_conversion` | **Hardness & Tensile Conversion** | ASTM E140 Non-Linear Correlations | Converting hardness readings between Rockwell (HRC/HRB), Brinell (HBW), and Vickers (HV) with tensile strength estimates. |

---

## 2. ⚡ Machining Operations & Milling
*Spindle speeds, table feeds, material removal rates, hole pattern coordinate layouts, and specialized pantograph setups.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `speeds_feeds` | **Speeds & Feeds Calculator** | $\text{RPM} = \frac{\text{SFM} \times 3.82}{D}$, $\text{IPM} = \text{RPM} \times F_z \times Z$ | Optimizing cutting speeds, chip loads, and table feed rates for carbide and HSS end mills across various workpiece materials. |
| `bolt_circle_layout` | **Bolt Circle Layout Calculator** | $X_n = R \times \cos(\theta_n)$, $Y_n = R \times \sin(\theta_n)$ | Computing absolute Cartesian (X, Y) hole center coordinates on a Pitch Circle Diameter (PCD) for manual milling or DRO entry. |
| `bolt_circle_diameter`| **Bolt Circle Diameter Reverse-Engineering**| $\text{PCD} = \frac{C}{\sin(180^\circ / N)}$ | Reverse-engineering the unknown bolt circle diameter of an existing flange using caliper measurements across adjacent holes. |
| `gorton_p12` | **Gorton P1-2 Pantomill Calculator** | Gorton Manual 2701-A Ratio Formulas | Setting slider bar distances, master-to-workpiece ratios, and roll engraving indexing for Gorton P1-2 pantograph machines. |
| `drill_point_length` | **Drill Point & Countersink Depth** | $L = \frac{D / 2}{\tan(\theta / 2)}$ | Determining the extra point length of 118° and 135° drill bits to ensure complete breakthrough or accurate cylindrical depth in blind holes. |
| `thread_milling` | **CNC Thread Milling Generator** | Helical Interpolation & Centerline Feed Compensation | Generating ready-to-paste G-code (G02/G03) and compensated feed rates for internal and external CNC thread milling cycles. |

---

## 3. 🔩 Threading, Tapping & Gear Cutting
*Comprehensive thread indices, tap drill selection, change gear calculations, dividing head indexing, and spur gear geometry.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `dividing_head` | **Hardinge Dividing Head Indexing** | $T = \frac{40}{N}$ (40:1 Worm Ratio) | Selecting index plates, hole circles, and crank turns for cutting gear teeth, splines, and angular bolt patterns on dividing heads. |
| `tap_drill_die` | **Tap, Drill & Die Reference** | $D_{\text{tap}} \approx D_{\text{nominal}} - \text{Pitch}$ (75% Thread) | Finding standard tap drill sizes, custom thread percentage engagement bit selection, and die rod blank turning diameters. |
| `threading_change_gears`| **Lathe Threading Change Gears** | $\frac{\text{Driver}}{\text{Driven}} = \frac{\text{Lead of Thread}}{\text{Lead of Leadscrew}}$ | Calculating simple and compound gear train combinations for manual lathes to cut metric, imperial, or custom module thread pitches. |
| `drill_size_index` | **Interactive Drill Size Index** | #1–#107, A–Z, Fractional (1/64"–1"), Metric | Searching standard twist bit diameters with live scaled SVG drill point visualizers and decimal equivalent sorting. |
| `tap_thread_index` | **Interactive Tap & Thread Index** | ISO 724 Metric & ASME B1.1 UNC/UNF/UNEF | Exploring thread pitch diameters, root depths, and Class 2A/3A fit limits with interactive SVG thread tooth profile previews. |
| `geometric_die_head`| **Geometric Die Head Chasers** | 5/16" D, DS, DSA, DJ Series Specifications | Selecting chaser part numbers, pitch diameters, 3-wire over-wire measurements, and rod blank tolerances for automatic die heads. |
| `spur_gears` | **Spur Gear Calculator** | Metric Module ($M = \frac{D_p}{N}$) & Diametral Pitch ($DP = \frac{N}{D_p}$) | Calculating addendum, dedendum, whole depth, and center distances with Hardinge pre-cut gear cutter number mapping (M1–M8). |
| `screw_head_index` | **Screw Head & Drive Index** | Socket Head Cap, Button, Flat, Hex, Torx | Visualizing fastener head dimensions, drive recess profiles, counterbore diameters, and hex key clearance requirements. |

---

## 4. 🔥 Metallurgy, Thermal Properties & Materials
*Phase transition temperatures, forging heat colors, casting superheat ranges, thermal expansion, and stock weight estimation.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `metallurgy_suite` | **Metallurgy & Thermal Properties Suite** | Solidus/Liquidus Phase Diagrams & Superheat ($\Delta T_{\text{sh}}$) | Determining safe forging temperature ranges, annealing points, melting points, and recommended foundry casting superheat temperatures. |
| `material_weight` | **Material Weight & Stock Calculator** | $W = V \times \rho$ ($\rho_{\text{steel}} \approx 0.284\text{ lb/in}^3$) | Estimating raw material weight for round, square, flat, hex, and tubing stock in steel, aluminum, brass, bronze, copper, and titanium. |

---

## 5. 🧑‍🏭 Welding & Fabrication Suite
*Arc energy heat input, filler deposition rates, hydrogen cracking preheat estimation, weld groove volume, cost analysis, and duty cycle limits.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `welding_suite` | **Welding Calculator Suite (6 Modules)** | AWS D1.1 & IIW Carbon Equivalent ($CE_{IIW}$) | Comprehensive fabrication math covering: <br>1. **Heat Input / Arc Energy** ($kJ/in$ or $kJ/mm$)<br>2. **Deposition Rate** ($lb/hr$ or $kg/hr$)<br>3. **Preheat Temperature & CE** (Cold Cracking Prevention)<br>4. **Weld Volume & Consumables** (Single-V Groove Weight)<br>5. **Welding Cost Analysis** (Labor + Filler + Gas per foot)<br>6. **Machine Duty Cycle** (Thermal Derating Formula) |

---

## 6. 🏗️ Sheet Metal Forming & Bending
*Press brake bend deductions, bend allowances, flat pattern development, OSSB, K-Factors, and turned knurling blank sizing.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `sheet_metal_bending`| **Sheet Metal Bending & Bend Simulator** | $\text{BA} = \frac{\pi(R + K \cdot T)\theta}{180}$, $\text{BD} = 2 \cdot \text{OSSB} - \text{BA}$ | Developing exact flat pattern cut blanks from outer dimensions using SendCutSend empirical tables, featuring a live interactive bend angle animation simulator. |
| `knurling` | **Knurling Blank Diameter Calculator** | $D_{\text{blank}} \approx \frac{N \times P}{\pi}$ | Calculating optimal turned blank diameters that synchronize with knurl wheel pitch teeth to prevent double-tracking and tool chatter. |

---

## 7. 🧭 Shop Geometry & Mathematical Solvers
*Trigonometric triangle resolution, Cartesian-to-polar coordinate transformations, and machine taper angle conversions.*

| Tool ID | Tool Name | Key Standard / Formula | Practical Shop Application |
| :--- | :--- | :--- | :--- |
| `trig_solver` | **Right Triangle & Trig Solver** | Pythagorean Theorem & Sine/Cosine/Tangent Ratios | Solving unknown side lengths and angles from two known variables for daily shop floor chamfers, tapers, and dovetail calculations. |
| `polar_rectangular`| **Polar ⇄ Rectangular Converter** | $X = r \cos(\theta)$, $Y = r \sin(\theta)$, $r = \sqrt{X^2 + Y^2}$ | Converting bolt hole radii and angular positions into X/Y table coordinates (and vice versa) with live 4-quadrant graphical plotting. |
| `taper_angle` | **Taper Angle & Standard Tapers** | $\text{TPF} = 12 \times \frac{D - d}{L}$, $\theta = 2 \times \arctan\left(\frac{D - d}{2L}\right)$ | Converting between Taper Per Foot (TPF), compound rest angles, and standard toolroom tapers (Morse, Brown & Sharpe, R8, CAT/BT). |

---

## Summary of System Integration
Every tool categorized above is implemented as a client-side TypeScript module within the React single-page application. By organizing the computational tools into these seven domain-specific categories, machinists and engineers can rapidly navigate to the exact mathematical model required for their manufacturing workflow.
