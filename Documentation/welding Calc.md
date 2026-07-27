# Welding Calculators // Master Fabrication Mathematics Suite
## Modular Architecture & Sub-Page Documentation

This reference guide establishes the mathematical principles, variables, and shop-floor applications for the 6 core calculators within the **Welding & Fabrication Suite** of Machinist.like.audio. In accordance with modular design, each calculator functions as an independent computational sub-page within the interactive application.

---

## 📑 Suite Navigation & Sub-Page Index
1. [🔥 Sub-Page 1: Heat Input / Arc Energy Calculator](#1--heat-input--arc-energy-calculator)
2. [⚖️ Sub-Page 2: Deposition Rate Calculator](#2--deposition-rate-calculator)
3. [🌡️ Sub-Page 3: Preheat Temperature & Carbon Equivalent (CE) Calculator](#3--preheat-temperature--carbon-equivalent-ce-calculator)
4. [🔩 Sub-Page 4: Weld Volume & Consumables Calculator](#4--weld-volume--consumables-calculator)
5. [💰 Sub-Page 5: Welding Cost Analysis Calculator](#5--welding-cost-analysis-calculator)
6. [⏱️ Sub-Page 6: Machine Duty Cycle & Thermal Derating Calculator](#6--machine-duty-cycle--thermal-derating-calculator)

---

## 1. 🔥 Heat Input / Arc Energy Calculator

### **The Concept**
Heat Input measures the total electrical energy transferred from the welding arc into a unit length of the base metal. Controlling heat input is vital for structural engineering: excessive heat causes grain coarsening, wide Heat-Affected Zones (HAZ), distortion, and loss of toughness, while insufficient heat input leads to lack of fusion, rapid quenching, and brittle martensite formation.

### **Visual & Practical Guide**
* **Process Compatibility:** SMAW (Stick), GMAW (MIG), GTAW (TIG), FCAW (Flux-Core), and SAW (Sub-Arc).
* **Thermal Pulse Indicator:** Visualized in the UI by an animated pulse whose intensity changes with amperage and travel speed.

### **The Formula**
$$HI = \frac{A \times V \times 60}{S \times 1000}$$
*(Where $HI$ is in $\text{kJ/in}$ or $\text{kJ/mm}$ when speed $S$ is in $\text{in/min}$ or $\text{mm/min}$)*

| Variable | Symbol | Input Unit | Description & Metallurgical Impact |
| :--- | :--- | :--- | :--- |
| **Heat Input** | **$HI$** | **$\text{kJ/in}$ or $\text{kJ/mm}$** | **Result.** The energy intensity deposited per unit length of weld seam. |
| **Amperage** | $A$ | Amperes ($\text{A}$) | Direct ($+$) impact. Increasing current raises arc thermal energy linearly. |
| **Voltage** | $V$ | Volts ($\text{V}$) | Direct ($+$) impact. Voltage determines arc length and width; higher voltage spreads thermal energy across a broader HAZ. |
| **Travel Speed** | $S$ | $\text{in/min}$ or $\text{mm/min}$| Inverse ($-$) impact. Moving faster spreads the energy over a longer distance, dramatically reducing localized heat concentration. |
| **Time Constant**| $60$ | Constant | Converts travel speed from minutes to seconds for joule/kilojoule standardization. |

---

## 2. ⚖️ Deposition Rate Calculator

### **The Concept**
Deposition Rate quantifies the mass of filler metal melted and deposited into the joint per hour of continuous arc time. It is the primary metric for fabricating productivity and estimating job completion times.

### **Visual & Practical Guide**
* **Spool & Feed Mechanics:** Correlates wire feed speed (WFS) with wire cross-sectional area and process efficiency ($E$).
* **Droplet Accumulator:** Visualized in the UI by a real-time filling gauge representing $\text{lb/hr}$ or $\text{kg/hr}$ output.

### **The Formula (GMAW / FCAW / SAW)**
$$R = \text{WFS} \times \frac{\pi \times d^2}{4} \times \rho \times 60 \times E$$

*(Simplified empirical approximation for steel wire: $R \approx \text{WFS} \times d^2 \times 13.1 \times E$ in $\text{lb/hr}$)*

| Variable | Symbol | Input Unit | Description & Productivity Impact |
| :--- | :--- | :--- | :--- |
| **Deposition Rate** | **$R$** | **$\text{lb/hr}$ or $\text{kg/hr}$** | **Result.** The continuous hourly metal output. |
| **Wire Feed Speed** | $\text{WFS}$ | $\text{in/min}$ or $\text{m/min}$ | Direct ($+$) impact. Higher wire feed speed introduces more consumable volume into the arc per minute. |
| **Wire Diameter** | $d$ | Inches ($\text{in}$) or $\text{mm}$ | Squared ($d^2$) ($+$) impact. Doubling wire diameter quadruples the cross-sectional area and deposited mass! |
| **Material Density**| $\rho$ | $\text{lb/in}^3$ or $\text{g/cm}^3$ | $\rho_{\text{steel}} = 0.284\text{ lb/in}^3$, $\rho_{\text{aluminum}} = 0.098\text{ lb/in}^3$, $\rho_{\text{stainless}} = 0.290\text{ lb/in}^3$. |
| **Process Efficiency**| $E$ | Percentage ($\%$) | SAW ($\sim 98\%$), GMAW with Solid Wire/Ar-CO2 ($\sim 92\%$), FCAW ($\sim 85\%$), SMAW/Stick ($\sim 65\%$ due to stub loss and slag). |

---

## 3. 🌡️ Preheat Temperature & Carbon Equivalent (CE) Calculator

### **The Concept**
When welding structural steels, rapid cooling of the weldment causes dissolved hydrogen to become trapped in hard, brittle martensitic grain structures, leading to Hydrogen-Induced Cold Cracking (HICC) or Underbead Cracking. Preheating slows the cooling rate, allowing hydrogen to diffuse out safely. The Carbon Equivalent ($CE_{\text{IIW}}$) formula quantifies the hardenability of alloy steel based on chemical composition.

### **Visual & Practical Guide**
* **Chemical Profile:** Evaluates $\%C$, $\%Mn$, $\%Cr$, $\%Mo$, $\%V$, $\%Ni$, and $\%Cu$ from mill test certificates.
* **Thermal Shield Gauge:** Recommends exact minimum preheat temperatures based on $CE_{\text{IIW}}$ and base metal thickness ($T_{\text{in}}$).

### **The Formula (IIW / AWS D1.1 Method)**
$$CE_{\text{IIW}} = \%C + \frac{\%Mn}{6} + \frac{\%Cr + \%Mo + \%V}{5} + \frac{\%Ni + \%Cu}{15}$$

### **Preheat Guidance Thresholds:**
* **$CE \le 0.40\%$:** Excellent weldability. No preheat required for plate thicknesses under $0.75\text{ in}$ ($19\text{ mm}$); warm to $50^\circ\text{F}$ ($10^\circ\text{C}$) to remove moisture.
* **$0.40\% < CE \le 0.45\%$:** Moderate cracking risk. Preheat to **$150^\circ\text{–}250^\circ\text{F}$ ($65^\circ\text{–}120^\circ\text{C}$)** for thicknesses over $0.50\text{ in}$ ($13\text{ mm}$).
* **$0.45\% < CE \le 0.52\%$:** High cracking risk. Preheat to **$250^\circ\text{–}350^\circ\text{F}$ ($120^\circ\text{–}175^\circ\text{C}$)** and maintain interpass temperature; use low-hydrogen electrodes (E7018).
* **$CE > 0.52\%$:** Extreme cracking risk (Tool Steels, Armor Plate). Preheat to **$350^\circ\text{–}500^\circ\text{F}$ ($175^\circ\text{–}260^\circ\text{C}$)** with controlled post-weld heat treatment (PWHT).

---

## 4. 🔩 Weld Volume & Consumables Calculator

### **The Concept**
Accurately estimating consumable filler metal weight requires determining the cross-sectional area of the weld groove and multiplying by joint length, density, and waste efficiency. This module calculates Single-V and Double-V butt joints with root openings and reinforcement cap allowance.

### **Visual & Practical Guide**
* **V-Groove Cross Section:** Interactive SVG displaying groove angle ($\theta$), root opening ($R$), root face ($F$), plate thickness ($T$), and weld cap reinforcement.
* **Consumable Bin:** Calculates exact purchasing pounds or kilograms required for bidding.

### **The Formula (Single-V Butt Joint)**
$$A_{\text{groove}} = \left(T - F\right)^2 \times \tan\left(\frac{\theta}{2}\right) + \left(R \times T\right) + A_{\text{cap}}$$

$$W_{\text{req}} = \frac{A_{\text{groove}} \times L_{\text{weld}} \times \rho}{E}$$

| Variable | Symbol | Input Unit | Description & Geometric Impact |
| :--- | :--- | :--- | :--- |
| **Total Weight Req.** | **$W_{\text{req}}$**| **$\text{lbs}$ or $\text{kg}$** | **Result.** The actual consumable purchase weight needed to finish the joint. |
| **Groove Angle** | $\theta$ | Degrees ($^\circ$) | Direct ($+$) impact. Increasing groove angle (e.g., from $45^\circ$ to $60^\circ$) significantly expands volume required. |
| **Root Opening** | $R$ | Inches ($\text{in}$) or $\text{mm}$ | Direct ($+$) impact. Adds a rectangular column of weld volume across the entire length. |
| **Weld Length** | $L_{\text{weld}}$ | Feet ($\text{ft}$) or Meters ($\text{m}$) | Linear ($+$) scaling factor for joint length. |
| **Process Efficiency**| $E$ | Percentage ($\%$) | Accounts for spatter, slag, and stub waste (divide by $E$ to purchase enough filler). |

---

## 5. 💰 Welding Cost Analysis Calculator

### **The Concept**
Cost estimation unites labor rates, wire/electrode consumption, shielding gas flow, and machine overhead into a singular financial metric: **Cost Per Foot (or Meter)** and **Total Job Bid Cost**. Labor and overhead typically represent **70%–85%** of total welding cost, proving that increasing deposition rate ($R$) and duty cycle reduces job cost far more than buying cheaper wire!

### **The Formula**
$$\text{Cost}/L = \text{Labor Cost}/L + \text{Filler Cost}/L + \text{Gas Cost}/L$$

$$\text{Labor Cost}/L = \frac{\text{Labor Rate} (\text{\$/hr}) \times \left(\frac{W_{\text{weld}}/L}{R}\right)}{\text{Operating Factor} (\%)}$$

$$\text{Gas Cost}/L = \frac{\text{Gas Flow} (\text{CFH}) \times \text{Gas Rate} (\text{\$/CF}) \times \left(\frac{W_{\text{weld}}/L}{R}\right)}{\text{Operating Factor} (\%)}$$

| Expense Category | Key Variables | Cost Impact Analysis |
| :--- | :--- | :--- |
| **Labor & Overhead**| Hourly Rate ($\text{\$/hr}$), Operating Factor (Arctime $\%$) | **Highest Impact ($\sim 75\%$ of bid).** Improving operating factor from $20\%$ (manual stick) to $50\%$ (wire feed) cuts labor cost by more than half. |
| **Consumables** | Filler Metal Price ($\text{\$/lb}$), Weight Required ($W_{\text{req}}$) | **Moderate Impact ($\sim 15\%$ of bid).** |
| **Shielding Gas** | Flow Rate ($\text{CFH}$ or $\text{L/min}$), Cylinder Price ($\text{\$/CF}$) | **Minor Impact ($\sim 10\%$ of bid).** Ar-CO2 mixtures or pure CO2 provide cost savings over helium blends. |

---

## 6. ⏱️ Machine Duty Cycle & Thermal Derating Calculator

### **The Concept**
Welding power sources are thermally rated by their Duty Cycle—the percentage of a 10-minute period a machine can operate continuously at a rated amperage before internal transformers or semiconductors overheat and shut down (e.g., $250\text{ A @ }60\%$ duty cycle means $6\text{ min}$ welding, $4\text{ min}$ cooling). Because resistive heating ($I^2R$) increases with the **square** of the amperage, operating even slightly above rated amperage causes the allowable duty cycle to collapse exponentially!

### **Visual & Practical Guide**
* **10-Minute Thermal Clock:** Visualized in the UI by a dynamic circular clock showing exact allowable arc-on time versus required mandatory cooling rest time.
* **Overheat Warning:** Instant alert if requested amperage exceeds $100\%$ continuous rating.

### **The Formula (NEMA / IEC Thermal Derating)**
$$N_{\text{new}} = \left(\frac{I_{\text{rated}}}{I_{\text{desired}}}\right)^2 \times N_{\text{rated}}$$

| Variable | Symbol | Input Unit | Description & Derating Impact |
| :--- | :--- | :--- | :--- |
| **New Duty Cycle** | **$N_{\text{new}}$**| **Percentage ($\%$)** | **Result.** The safe operating percentage at the desired amperage. |
| **Rated Amperage** | $I_{\text{rated}}$| Amperes ($\text{A}$) | Nameplate specification (e.g., $200\text{ A}$). |
| **Rated Duty Cycle** | $N_{\text{rated}}$| Percentage ($\%$) | Nameplate duty cycle specification (e.g., $60\%$). |
| **Desired Amperage** | $I_{\text{desired}}$| Amperes ($\text{A}$) | Squared ($I^2$) ($-$) impact. If you run a $200\text{ A @ }60\%$ machine at $250\text{ A}$, the new duty cycle drops to: $N = (200/250)^2 \times 60\% = 0.64 \times 60\% = \mathbf{38.4\%}$ ($3.8\text{ min}$ on, $6.2\text{ min}$ off)! |