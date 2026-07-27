![alt text](image-1.png)

# Comprehensive Sheet Metal Forming & Mathematical Metrology Guide
## Technical Exposition of Press Brake Bending Formulas

This manual provides the theoretical derivations, empirical standards, and shop-floor applications for the 7 core sheet metal forming relationships illustrated in **image-1.png**. In precision sheet metal fabrication, plastic deformation causes the outer fibers of the metal bend to stretch in tension while the inner fibers compress. Understanding the migration of the neutral axis is essential for calculating exact flat pattern blank development lengths.

---

## 1. 📐 The Neutral Axis & K-Factor ($K$)

### **The Concept**
When sheet metal is bent in a press brake, the material on the inside of the bend radius undergoes compression, while the material on the outside undergoes tension. Between these two opposing stress zones lies a boundary layer where the metal neither stretches nor compresses: the **Neutral Axis**. 

In flat, unbent stock, the neutral axis sits exactly in the center of the material thickness ($50\%$ or $0.50$). However, as plastic bending deformation occurs, the compressive forces push the neutral axis inward toward the inner bend radius. The **K-Factor** quantifies this inward shift as a dimensionless ratio.

### **The Formula**
$$K = \frac{t}{T}$$

| Variable | Symbol | Definition & Shop Impact |
| :--- | :--- | :--- |
| **K-Factor** | **$K$** | **The Ratio.** Represents the location of the neutral axis relative to thickness ($0.25$ to $0.50$). |
| **Neutral Axis Distance**| $t$ | Distance from the inner bend radius surface to the neutral axis (inches or mm). |
| **Material Thickness** | $T$ | Total sheet metal thickness (inches or mm). |

### **Empirical Shop K-Factor Constants:**
* **Air Bending (Soft Copper / Soft Aluminum):** $K \approx 0.33$
* **Air Bending (Mild Steel / 5052 / 6061 Aluminum):** $K \approx 0.42$ to $0.45$
* **Air Bending (Stainless Steel / Spring Steel):** $K \approx 0.45$ to $0.48$
* **Bottoming / Coin Bending:** $K \approx 0.50$ (High tonnage forces the neutral axis back toward the centerline).

---

## 2. 🧮 Y-Factor ($Y$)

### **The Concept**
While K-Factor is the universal standard in North American and ISO sheet metal engineering, certain CAD/CAM software systems (such as older PTC Creo or specialized marine unfolding packages) utilize the **Y-Factor**. The Y-Factor is an alternative mathematical representation of the neutral axis shift scaled by a factor of $\frac{\pi}{2}$ (approx. $1.5708$).

### **The Formula & Conversion**
$$Y = K \times \frac{\pi}{2} = K \times 1.570796$$

$$K = \frac{2 \times Y}{\pi} = Y \times 0.636620$$

| Variable | Symbol | Typical Industrial Value |
| :--- | :--- | :--- |
| **Y-Factor** | **$Y$** | Typical range: **$0.50$ to $0.78$** (A K-Factor of $0.45$ equals a Y-Factor of $0.7068$). |
| **K-Factor** | $K$ | Typical range: **$0.33$ to $0.50$**. |

---

## 3. 📍 Outside Setback (OSSB)

### **The Concept**
The **Outside Setback (OSSB)** is the linear distance measured along the outside flange surface from the start of the bend arc (the tangent point where flat metal transitions into curved metal) to the theoretical apex vertex (the intersection point where the two outside flange planes would meet if they were sharp corners).

OSSB is a foundational geometric building block required to calculate Bend Deduction ($BD$).

### **The Formula**
$$\text{OSSB} = \left(R + T\right) \times \tan\left(\frac{\theta}{2}\right)$$

| Variable | Symbol | Definition & Geometric Behavior |
| :--- | :--- | :--- |
| **Outside Setback** | **$\text{OSSB}$** | **Result.** The distance from bend line tangent to outer intersection apex. |
| **Inside Radius** | $R$ | The inner bend radius formed by the press brake punch tip. As radius increases, OSSB grows linearly. |
| **Material Thickness**| $T$ | Sheet thickness. Thicker material pushes the outer apex further out, increasing OSSB. |
| **Bend Angle** | $\theta$ | The included bend angle (for a standard $90^\circ$ bend, $\tan(45^\circ) = 1.000$, so $\text{OSSB} = R + T$). For acute bends ($>90^\circ$ deformation), $\text{OSSB}$ expands rapidly! |

---

## 4. 🌙 Bend Allowance (BA) & Developed Length of Arc (DL)

### **The Concept**
The **Bend Allowance (BA)**—also called the **Developed Length of Arc (DL)**—is the exact physical arc length of the metal along the neutral axis between the two tangent bend lines. Because the neutral axis neither stretches nor compresses, calculating the circumference of this arc yields the true metal length required to form the curved corner.

### **The Formula**
$$\text{BA} = \text{DL} = \frac{\pi}{180} \times \left(R + K \cdot T\right) \times \theta$$

$$(\text{For a standard } 90^\circ \text{ bend: } \text{BA} = 1.5708 \times (R + K \cdot T))$$

| Variable | Symbol | Physical Meaning |
| :--- | :--- | :--- |
| **Bend Allowance / DL**| **$\text{BA}$ / $\text{DL}$** | **Result.** True neutral arc length through the bend zone. |
| **Inside Radius** | $R$ | Larger punch tip radii create broader arcs, increasing Bend Allowance. |
| **K-Factor $\times$ Thickness**| $K \cdot T$ | Determines the exact radius of the neutral axis circle ($r_{\text{neutral}} = R + K \cdot T$). |
| **Bend Angle** | $\theta$ | The angle of bending deformation in degrees ($1^\circ$ to $179^\circ$). |

---

## 5. ✂️ Bend Deduction (BD)

### **The Concept**
When a machinist measures a sheet metal drawing, dimensions are almost always given to the outside mold lines (apex vertices). If you simply added the two outside flange dimensions together ($L_1 + L_2$), the resulting blank would be too long because the metal in the corner is counted twice (once in each flange square)! 

The **Bend Deduction (BD)** is the total amount of metal length that must be **subtracted** from the sum of the outer flange dimensions to account for corner stretching and geometry duplication.

### **The Formula**
$$\text{BD} = \left(2 \times \text{OSSB}\right) - \text{BA}$$

| Variable | Symbol | Relationship |
| :--- | :--- | :--- |
| **Bend Deduction** | **$\text{BD}$** | **Result.** The exact value to subtract per bend from total outer dimensions. |
| **Outside Setback** | $\text{OSSB}$| Two setbacks ($2 \times \text{OSSB}$) represent the sharp corner box that encloses the bend. |
| **Bend Allowance** | $\text{BA}$ | Subtracting the true arc length ($\text{BA}$) from the corner box ($2 \cdot \text{OSSB}$) leaves the deduction amount. |

---

## 6. 📏 Flat Pattern Length (FL)

### **The Concept**
The **Flat Pattern Length (FL)**—or **Developed Blank Length**—is the final actionable dimension required by the laser cutting, waterjet, or CNC punching operator. It represents the exact total length of flat sheet metal stock that must be cut so that after press brake bending, all finished outside flange dimensions hit their print tolerances to within $\pm0.005\text{ in}$ ($\pm0.12\text{ mm}$).

### **The Formula (For $N$ Bends)**
$$\text{FL} = \sum_{i=1}^{n+1} L_i - \sum_{j=1}^{n} \text{BD}_j$$

*(For a single 2-flange bend: $\text{FL} = L_1 + L_2 - \text{BD}$)*
*(Alternatively, using inside dimensions and Bend Allowance: $\text{FL} = L_{\text{in},1} + L_{\text{in},2} + \text{BA}$)*

---

## 7. 🎮 Interactive Live Bend Simulator Engine
Within the **Machinist.like.audio** web application, these 7 metrological formulas power the **Interactive Bend Simulator**. As the user drags the live sliders for Bend Angle ($\theta$), Inside Radius ($R$), Thickness ($T$), and K-Factor ($K$):
1. The mathematical solver recalculates $\text{BA}$, $\text{BD}$, $\text{OSSB}$, $\text{FL}$, $\text{K}$, and $\text{Y}$ at 60 frames per second.
2. The real-time SVG vector display dynamically morphs from a flat horizontal strip into a formed 2D profile, showing the exact migration of the tangent bend lines, neutral axis arc, and apex setback vertices in real time!

---
*Verified by Like.Audio Sheet Metal Metrology Standards // Reference 2026.*
