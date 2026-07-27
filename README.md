# Machinist // Like.Audio: Application Overview

The **Machinist.like.audio** application is a comprehensive, state-of-the-art digital hub designed specifically for toolroom machinists, fabricators, and metallurgical engineers. Developed by Like.Audio, this platform offers a robust suite of precision calculators, metrology formulas, and setup utilities tailored for milling, turning, drilling, and welding projects. By consolidating complex industrial mathematics, thermal processing data, and interactive references into a single interface, the application streamlines shop floor operations, enhances quality control, and eliminates the guesswork from advanced fabrication and machine setup.

## Metrology, Inspection & GD&T
This category focuses on tools required for precise measurement, angle setup, and quality control verification.
*   **Jo Block & Height Gauge:** Calculates exact gauge block combinations for height setups.
*   **Sine Bar & Sine Vise:** Determines the precision gauge block stack heights required to achieve specific angles.
*   **True Position (GD&T):** Evaluates positional deviation based on X/Y measurements and provides PASS/FAIL verdicts.
*   **Fits & Tolerances:** Provides limits for ISO 286 hole-basis shafts and holes.
*   **Surface Finish Conversion:** Converts between various surface finish standards, including Ra, RMS, Rz, CLA, and ISO N grades.

---

## Holemaking & Layout
These modules assist with calculations and references for drilling, centering, and laying out bolt patterns.
*   **Bolt Circle Layout:** Computes the exact Cartesian (X, Y) coordinate positions for holes.
*   **Bolt Circle Diameter:** Reverse-engineers the diameter of a bolt circle using standard caliper measurements.
*   **Interactive Drill Size Index:** Functions as a searchable index of standard twist drills.
*   **Drill Point Length:** Calculates the extra depth added to a hole by a 118° or 135° drill tip.

---

## Threading & Fasteners
This section covers everything related to cutting threads and identifying hardware.
*   **Tap, Drill & Die:** Identifies tap drills, standard drills for specific thread engagement percentages, and die rod guidance.
*   **Interactive Tap & Thread Index:** Provides comprehensive data from ISO 724 Metric and USA screw tables.
*   **Geometric Die Head Chasers:** Serves as a chaser index for 5/16" Geometric die heads.
*   **Thread Milling:** Calculates helical interpolation paths and generates G-code for CNC thread mills.
*   **Screw Head & Drive Index:** Offers an SVG library detailing drive recesses, head shapes, and nut types.

---

## Lathe & Turning Operations
These modules handle calculations specific to cylindrical parts for manual or CNC lathes.
*   **Knurling Blank Diameter:** Determines optimal turned workpiece blank diameters to prevent double-tracking.
*   **Threading / Change Gears:** Calculates simple and compound gear train combinations.
*   **Taper Angle:** Converts dimensions between taper measurements, taper-per-foot, ratios, and angles.

---

## Milling, Gearing & Machine Setup
Setup calculations tailored for manual milling machines, dividing heads, and gear cutting.
*   **Hardinge Dividing Head:** Calculates exact index plates, hole circles, and crank handle turns.
*   **Gorton P1-2 Pantomill:** Computes exact pantograph bar setting distances and master-to-work ratios.
*   **Spur Gear Calculator:** Determines metric module and imperial spur gear dimensions.

---

## Machining Math & Geometry
This section provides core shop floor mathematics.
*   **Speeds & Feeds:** Determines the correct spindle cutting speed (RPM) and table feed rate.
*   **Right Triangle / Trig Solver:** Solves right triangle dimensions using two known variables.
*   **Polar ⇄ Rectangular:** Converts angles and radii into X/Y machine coordinates.

---

## Sheet Metal Forming & Bending
These modules calculate flat pattern cut lengths, bend allowances, and deductions for sheet metal fabrication.
*   **Bend Allowance (BA):** Calculates the arc length of the bend along the material's neutral axis using the formula: $$BA = \frac{\pi \cdot (R + K \cdot T) \cdot A}{180}$$.
*   **Bend Deduction (BD):** Computes the material to subtract from outside dimensions to find the flat pattern length using the formula: $$BD = 2 \cdot (R + T) \cdot \tan\left(\frac{A}{2}\right) - BA$$.
*   **Flat Pattern Length (FL):** Calculates the total length of the raw sheet metal blank required before bending.
*   **K-Factor and Y-Factor:** Computes the neutral axis displacement ratio ($K$) and its radian modifier variation ($Y$).
*   **Outside Setback (OSSB):** Finds the distance from the bend tangent point to the apex of the outside corner.
*   **Developed Length (DL):** Computes the flattened arc length of curved sections.

---

## Metallurgy & Thermal Processing
This suite acts as an authoritative reference for forging, melting, and thermal processing.
*   **Stock Volume and Weight Formulas:** Calculates the starting raw material required for rectangular, flat, round, and tapered stock. For example, the volume of a cylinder is determined by: $$V = \frac{\pi \times d^2 \times h}{4}$$.
*   **Heat and Color Cheat Sheet:** Correlates the incandescent color of heated steel with its temperature and process stage, such as Forge Welding (2,300° – 2,500°F) or Normalizing (1,450° – 1,600°F).
*   **Heating, Melting, & Casting Temperatures Guide:** Provides specific solidus, liquidus, and casting pouring temperatures for ferrous metals, aluminum alloys, copper/brass/bronze, and precious metals.
*   **Thermal Expansion Calculator:** Determines linear expansion across temperature differentials, which is essential for shrink-fitting collars, sleeves, and bearings.

---

## Welding Calculators
This master fabrication suite contains six independent computational modules for welding professionals.
*   **Heat Input / Arc Energy Calculator:** Measures the electrical energy transferred into the base metal using the formula: $$HI = \frac{A \times V \times 60}{S \times 1000}$$.
*   **Deposition Rate Calculator:** Quantifies the mass of filler metal melted and deposited per hour of continuous arc time.
*   **Preheat Temperature & Carbon Equivalent (CE) Calculator:** Evaluates alloy hardenability to prevent Hydrogen-Induced Cold Cracking using the IIW method: $$CE_{\text{IIW}} = \%C + \frac{\%Mn}{6} + \frac{\%Cr + \%Mo + \%V}{5} + \frac{\%Ni + \%Cu}{15}$$.
*   **Weld Volume & Consumables Calculator:** Estimates consumable filler metal weight by determining the cross-sectional area of single-V and double-V butt joints.
*   **Welding Cost Analysis Calculator:** Combines labor rates, wire consumption, gas flow, and overhead to provide a Cost Per Foot and Total Job Bid Cost.
*   **Machine Duty Cycle & Thermal Derating Calculator:** Computes the safe operating percentage of a machine when operating at a desired amperage using the NEMA / IEC formula: $$N_{\text{new}} = \left(\frac{I_{\text{rated}}}{I_{\text{desired}}}\right)^2 \times N_{\text{rated}}$$.