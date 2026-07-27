import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete?: () => void;
  isModal?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, isModal = false }) => {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress === 100 && onComplete && !isModal) {
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 600);
      return () => clearTimeout(completeTimer);
    }
  }, [progress, onComplete, isModal]);

  return (
    <div style={{
      position: isModal ? 'relative' : 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isModal ? 'transparent' : 'radial-gradient(circle at 50% 50%, #0c1427 0%, #050811 100%)',
      zIndex: isModal ? 1 : 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden',
      color: '#fff',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Embedded CSS Animations for Math Streams and 3D Box Conversion */}
      <style>{`
        @keyframes streamInLeft {
          0% { transform: translate(-220px, -140px) scale(0.6); opacity: 0; }
          40% { opacity: 1; filter: drop-shadow(0 0 10px #38bdf8); }
          100% { transform: translate(0px, 0px) scale(0.1); opacity: 0; }
        }
        @keyframes streamInRight {
          0% { transform: translate(220px, -120px) scale(0.6); opacity: 0; }
          40% { opacity: 1; filter: drop-shadow(0 0 10px #00ff80); }
          100% { transform: translate(0px, 0px) scale(0.1); opacity: 0; }
        }
        @keyframes streamInBottomLeft {
          0% { transform: translate(-200px, 160px) scale(0.6); opacity: 0; }
          40% { opacity: 1; filter: drop-shadow(0 0 10px #c084fc); }
          100% { transform: translate(0px, 0px) scale(0.1); opacity: 0; }
        }
        @keyframes streamInBottomRight {
          0% { transform: translate(200px, 160px) scale(0.6); opacity: 0; }
          40% { opacity: 1; filter: drop-shadow(0 0 10px #f59e0b); }
          100% { transform: translate(0px, 0px) scale(0.1); opacity: 0; }
        }
        @keyframes streamInTop {
          0% { transform: translate(0px, -200px) scale(0.7); opacity: 0; }
          40% { opacity: 1; filter: drop-shadow(0 0 12px #38bdf8); }
          100% { transform: translate(0px, 0px) scale(0.1); opacity: 0; }
        }
        @keyframes streamInBottom {
          0% { transform: translate(0px, 200px) scale(0.7); opacity: 0; }
          40% { opacity: 1; filter: drop-shadow(0 0 12px #00ff80); }
          100% { transform: translate(0px, 0px) scale(0.1); opacity: 0; }
        }
        @keyframes boxHoverPulse {
          0%, 100% { transform: scale(1) translateY(0px); filter: drop-shadow(0 0 25px rgba(56, 189, 248, 0.5)); }
          50% { transform: scale(1.05) translateY(-8px); filter: drop-shadow(0 0 45px rgba(0, 255, 128, 0.8)); }
        }
        @keyframes orbitRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbitRingRev {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .anim-stream-1 { animation: streamInLeft 2.2s cubic-bezier(0.2, 0.8, 0.2, 1) infinite; }
        .anim-stream-2 { animation: streamInRight 2.5s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.3s; }
        .anim-stream-3 { animation: streamInBottomLeft 2.3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.6s; }
        .anim-stream-4 { animation: streamInBottomRight 2.6s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.9s; }
        .anim-stream-5 { animation: streamInTop 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.2s; }
        .anim-stream-6 { animation: streamInBottom 2.4s cubic-bezier(0.2, 0.8, 0.2, 1) infinite 0.7s; }
        .anim-box { animation: boxHoverPulse 3.5s ease-in-out infinite; transform-origin: center; }
        .anim-ring-1 { animation: orbitRing 16s linear infinite; transform-origin: center; }
        .anim-ring-2 { animation: orbitRingRev 22s linear infinite; transform-origin: center; }
      `}</style>

      {/* Main Vector Animation Stage */}
      <div style={{ position: 'relative', width: isModal ? '300px' : '420px', height: isModal ? '300px' : '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 500 500" width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="splashBoxTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9b2c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="splashBoxLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="splashBoxRight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9b2c" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <filter id="splashGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rotating Energy Calibration Rings */}
          <g className="anim-ring-1" opacity="0.4">
            <circle cx="250" cy="250" r="190" fill="none" stroke="#ff9b2c" strokeWidth="1.5" strokeDasharray="12 16" />
            <polygon points="250,50 423,150 423,350 250,450 77,350 77,150" fill="none" stroke="#ff9b2c" strokeWidth="1" strokeDasharray="8 8" />
          </g>
          <g className="anim-ring-2" opacity="0.25">
            <circle cx="250" cy="250" r="145" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="20 10" />
          </g>

          {/* STREAM 1: Speeds & Feeds / RPM Formula (Left) */}
          <g className="anim-stream-1" style={{ transformOrigin: '250px 250px' }}>
            <text x="30" y="120" fill="#38bdf8" fontFamily="'Fira Code', monospace" fontWeight="800" fontSize="22">RPM = SFM×3.82 / D</text>
            <text x="50" y="150" fill="#ff9b2c" fontFamily="'Fira Code', monospace" fontSize="18">IPM = RPM × Fz × Z</text>
            <line x1="140" y1="135" x2="220" y2="210" stroke="#ff9b2c" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="140" cy="135" r="5" fill="#38bdf8" filter="url(#splashGlow)" />
          </g>

          {/* STREAM 2: Bend Allowance / OSSB Formula (Right) */}
          <g className="anim-stream-2" style={{ transformOrigin: '250px 250px' }}>
            <text x="290" y="110" fill="#ff9b2c" fontFamily="'Fira Code', monospace" fontWeight="800" fontSize="22">BA = π(R + K·T)θ / 180</text>
            <text x="320" y="140" fill="#c084fc" fontFamily="'Fira Code', monospace" fontSize="18">BD = 2·OSSB - BA</text>
            <line x1="340" y1="130" x2="280" y2="210" stroke="#ff9b2c" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="340" cy="130" r="5" fill="#ff9b2c" filter="url(#splashGlow)" />
          </g>

          {/* STREAM 3: True Position GD&T Formula (Bottom Left) */}
          <g className="anim-stream-3" style={{ transformOrigin: '250px 250px' }}>
            <text x="20" y="380" fill="#ff9b2c" fontFamily="'Fira Code', monospace" fontWeight="800" fontSize="22">TP = 2·√(ΔX² + ΔY²)</text>
            <text x="40" y="410" fill="#38bdf8" fontFamily="'Fira Code', monospace" fontSize="18">MMC Bonus = ØM - ØAct</text>
            <line x1="150" y1="375" x2="220" y2="290" stroke="#ff9b2c" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="150" cy="375" r="5" fill="#ff9b2c" filter="url(#splashGlow)" />
          </g>

          {/* STREAM 4: Sine Bar & Sine Vise Formula (Bottom Right) */}
          <g className="anim-stream-4" style={{ transformOrigin: '250px 250px' }}>
            <text x="310" y="390" fill="#ff9b2c" fontFamily="'Fira Code', monospace" fontWeight="800" fontSize="22">H = L × sin(θ)</text>
            <text x="330" y="420" fill="#c084fc" fontFamily="'Fira Code', monospace" fontSize="18">CE = C + Mn/6 + ...</text>
            <line x1="350" y1="380" x2="280" y2="290" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />
            <circle cx="350" cy="380" r="5" fill="#ff9b2c" filter="url(#splashGlow)" />
          </g>

          {/* STREAM 5: Thermal Expansion / Metallurgy (Top) */}
          <g className="anim-stream-5" style={{ transformOrigin: '250px 250px' }}>
            <text x="180" y="50" fill="#ff9b2c" fontFamily="'Fira Code', monospace" fontWeight="800" fontSize="24">ΔL = α·L₀·ΔT</text>
            <text x="200" y="80" fill="#c084fc" fontFamily="'Fira Code', monospace" fontSize="20">T_superheat = T_liq + ΔT</text>
            <line x1="250" y1="85" x2="250" y2="180" stroke="#ff9b2c" strokeWidth="2.5" strokeDasharray="6 4" />
          </g>

          {/* STREAM 6: Dividing Head & Tapers (Bottom) */}
          <g className="anim-stream-6" style={{ transformOrigin: '250px 250px' }}>
            <text x="170" y="470" fill="#ff9b2c" fontFamily="'Fira Code', monospace" fontWeight="800" fontSize="24">T = 40 / N (Worm Ratio)</text>
            <text x="190" y="445" fill="#38bdf8" fontFamily="'Fira Code', monospace" fontSize="20">TPF = 12 × (D - d) / L</text>
            <line x1="250" y1="430" x2="250" y2="320" stroke="#ff9b2c" strokeWidth="2.5" strokeDasharray="6 4" />
          </g>

          {/* CENTRAL 3D PRECISION MACHINED BOX / WORKPIECE BEING FORGED BY MATH */}
          <g className="anim-box" filter="url(#splashGlow)">
            {/* Top Isometric Face (Vibrant Orange / Amber) */}
            <polygon points="250,170 350,225 250,280 150,225" fill="url(#splashBoxTop)" stroke="#fed7aa" strokeWidth="3" strokeLinejoin="round" />
            {/* Left Isometric Face */}
            <polygon points="150,225 250,280 250,390 150,335" fill="url(#splashBoxLeft)" stroke="#38bdf8" strokeWidth="3" strokeLinejoin="round" />
            {/* Right Isometric Face (Rich Orange / Amber) */}
            <polygon points="250,280 350,225 350,335 250,390" fill="url(#splashBoxRight)" stroke="#ff9b2c" strokeWidth="3" strokeLinejoin="round" />
            
            {/* CNC Machined Center Bore Feature */}
            <ellipse cx="250" cy="225" rx="42" ry="22" fill="#050811" stroke="#ff9b2c" strokeWidth="3" />
            <ellipse cx="250" cy="232" rx="30" ry="15" fill="#d97706" opacity="0.8" />
            <circle cx="250" cy="232" r="7" fill="#ff9b2c" filter="url(#splashGlow)" />

            {/* Edge Highlight / Precision Grinding Lines */}
            <line x1="250" y1="280" x2="250" y2="390" stroke="#fff" strokeWidth="2.5" opacity="0.9" />
            <line x1="150" y1="225" x2="250" y2="280" stroke="#fff" strokeWidth="2" opacity="0.7" />
            <line x1="350" y1="225" x2="250" y2="280" stroke="#fff" strokeWidth="2" opacity="0.7" />

            {/* Laser Scanning Horizontal Beam */}
            <line x1="140" y1="280" x2="360" y2="280" stroke="#ff9b2c" strokeWidth="2" opacity="0.6" strokeDasharray="4 4" />
          </g>

          {/* Impact Conversion Glow Dots where equations hit the box */}
          <circle cx="250" cy="170" r="7" fill="#fff" filter="url(#splashGlow)" />
          <circle cx="150" cy="225" r="6" fill="#38bdf8" filter="url(#splashGlow)" />
          <circle cx="350" cy="225" r="6" fill="#ff9b2c" filter="url(#splashGlow)" />
          <circle cx="250" cy="390" r="7" fill="#ff9b2c" filter="url(#splashGlow)" />
          <circle cx="250" cy="280" r="5" fill="#fff" />
        </svg>
      </div>

      {/* Brand Title & Conversion Status */}
      <div style={{ textAlign: 'center', marginTop: '10px', zIndex: 10 }}>
        <div style={{ 
          fontSize: isModal ? '1.3rem' : '1.8rem', 
          fontWeight: 800, 
          letterSpacing: '2px', 
          color: '#fff',
          textShadow: '0 0 20px rgba(56, 189, 248, 0.6)'
        }}>
          MACHINIST <span style={{ color: 'var(--accent-cyan)', fontWeight: 300 }}>// LIKE.AUDIO</span>
        </div>
        <div style={{ 
          fontSize: isModal ? '0.75rem' : '0.95rem', 
          color: 'var(--accent-green)', 
          fontWeight: 600, 
          letterSpacing: '1px', 
          textTransform: 'uppercase',
          marginTop: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#00ff80', boxShadow: '0 0 10px #00ff80' }}></span>
          Converting Math Formulas into Precision Form...
        </div>

        {/* Loading Progress Bar */}
        <div style={{ 
          width: isModal ? '220px' : '320px', 
          height: '6px', 
          background: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '3px', 
          margin: '18px auto 0 auto', 
          overflow: 'hidden',
          border: '1px solid rgba(56, 189, 248, 0.3)'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: 'linear-gradient(90deg, #38bdf8, #00ff80)', 
            transition: 'width 0.05s linear',
            boxShadow: '0 0 12px #00ff80'
          }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontFamily: "'Fira Code', monospace" }}>
          ENGINE COMPILATION: {progress}% // STANDALONE READY
        </div>
      </div>

      {/* Skip Button (only when used as standalone splash screen) */}
      {!isModal && onComplete && (
        <button
          onClick={onComplete}
          style={{
            marginTop: '25px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            zIndex: 20
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(56, 189, 248, 0.2)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}
        >
          Enter Precision Hub ➔
        </button>
      )}
    </div>
  );
};
