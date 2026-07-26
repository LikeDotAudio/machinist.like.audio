import { useState } from 'react';
import './index.css';
import { JoBlockCalculator } from './components/JoBlockCalculator';
import { HardingeDividingHead } from './components/HardingeDividingHead';

export function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'dividing_head' | 'about'>('calculator');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header style={{ 
        background: 'rgba(10, 13, 20, 0.85)', 
        backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid var(--border-color)', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        padding: '15px 24px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '8px', 
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#000',
              fontSize: '1.2rem',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)'
            }}>
              M
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '1.5px', color: '#fff' }}>
                MACHINIST <span style={{ color: 'var(--accent-cyan)', fontWeight: 300 }}>// LIKE.AUDIO</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                PRECISION METROLOGY & INDUSTRIAL AUDIO LAB
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('calculator')}
              style={{
                background: activeTab === 'calculator' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: activeTab === 'calculator' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'calculator' ? 'rgba(0, 240, 255, 0.4)' : 'transparent'}`,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              📐 Jo Block Calculator
            </button>

            <button
              onClick={() => setActiveTab('dividing_head')}
              style={{
                background: activeTab === 'dividing_head' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                color: activeTab === 'dividing_head' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === 'dividing_head' ? 'rgba(0, 240, 255, 0.4)' : 'transparent'}`,
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              ⚙️ Dividing Head Lab
            </button>

            <button
              onClick={() => setActiveTab('about')}
              style={{
                background: activeTab === 'about' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: activeTab === 'about' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid transparent',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-sans)'
              }}
            >
              ℹ️ System Architecture
            </button>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }} />

            {/* Live CI/CD Status Badge */}
            <a 
              href="https://github.com/LikeDotAudio/machinist.like.audio/actions" 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0, 255, 128, 0.1)',
                color: '#00ff80',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(0, 255, 128, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ff80', boxShadow: '0 0 8px #00ff80' }} />
              <span>FTPS CD LIVE</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '40px 20px' }}>
        {activeTab === 'calculator' ? (
          <JoBlockCalculator />
        ) : activeTab === 'dividing_head' ? (
          <HardingeDividingHead />
        ) : (
          <div style={{ maxWidth: '800px', margin: '40px auto' }} className="glass-panel">
            <div style={{ padding: '40px' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '20px' }}>
                System Architecture & Deployment
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.8' }}>
                This web application is engineered for precision machinists and audio developers. It features real-time metrology computation with state-of-the-art interactive visualization.
              </p>

              <div style={{ background: 'var(--bg-primary)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '25px' }}>
                <h4 style={{ color: 'var(--accent-cyan)', marginBottom: '10px', fontSize: '1rem' }}>🔒 Secure CI/CD Deployment Pipeline</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>
                  The application uses GitHub Actions for continuous deployment over encrypted FTPS (Explicit TLS, Port 21). All credentials are stored in GitHub Repository Secrets:
                </p>
                <ul style={{ color: 'var(--text-primary)', fontSize: '0.85rem', paddingLeft: '20px', fontFamily: 'var(--font-mono)' }}>
                  <li>FTP_SERVER: machinist.like.audio</li>
                  <li>FTP_USERNAME: machinist@like.audio</li>
                  <li>FTP_PASSWORD: *** (Secret Vault)</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <a 
                  href="https://github.com/LikeDotAudio/machinist.like.audio" 
                  target="_blank" 
                  rel="noreferrer"
                  className="btn-precision"
                  style={{ textDecoration: 'none', fontSize: '0.85rem' }}
                >
                  🐙 View GitHub Repo
                </a>
                <button 
                  onClick={() => setActiveTab('calculator')} 
                  className="btn-secondary"
                >
                  ← Back to Calculator
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ 
        background: 'var(--bg-primary)', 
        borderTop: '1px solid var(--border-color)', 
        padding: '25px 20px', 
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            © {new Date().getFullYear()} <strong style={{ color: 'var(--text-primary)' }}>Like.Audio</strong> // Engineered for Precision.
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <a href="https://machinist.like.audio/Site/Index.htm" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              📁 Static Tool Directory
            </a>
            <a href="https://machinist.like.audio/Site/HardingeDivigingHead/DividingHeadCalculator.htm" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ⚙️ Legacy HTML Indexer
            </a>
            <a href="https://github.com/LikeDotAudio/machinist.like.audio" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
              ⚡ GitHub CI/CD
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
