import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStore } from './store';

const GameCanvas = lazy(() => import('./components/ShadowFight'));

export default function App() {
  const [started, setStarted] = useState(false);
  const { playerHealth, enemyHealth, gameOver, message, nextLevelReady, resetGame, advanceLevel, level } = useStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsMobile(touch || window.innerWidth <= 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  const handleStart = () => {
    setStarted(true);
    resetGame();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#0a0508' }}>
      {/* Game Canvas - always rendered when started */}
      {started && (
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#0a0508' }} />}>
          <GameCanvas started={started} isMobile={isMobile} />
        </Suspense>
      )}

      {/* Start Screen */}
      {!started && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0508 100%)',
          zIndex: 200
        }}>
          <div style={{
            position: 'absolute',
            top: '25%',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,120,60,0.4) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }} />
          <h1 style={{
            color: '#f5f5f5',
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            margin: '0 0 15px 0',
            letterSpacing: 'clamp(4px, 2vw, 10px)',
            textShadow: '0 0 50px rgba(255,120,60,0.6), 0 4px 8px rgba(0,0,0,0.9)',
            fontWeight: 'normal',
            textAlign: 'center',
            zIndex: 1
          }}>SHADOW FIGHT</h1>
          <div style={{
            width: 'clamp(100px, 30vw, 200px)',
            height: 2,
            background: 'linear-gradient(90deg, transparent, #ff8855, transparent)',
            margin: '25px 0'
          }} />
          <p style={{
            color: '#888888',
            marginBottom: 'clamp(30px, 8vw, 60px)',
            textAlign: 'center',
            maxWidth: '90%',
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 3vw, 1.2rem)',
            fontFamily: 'Georgia, serif',
            lineHeight: '1.6',
            zIndex: 1
          }}>
            Face your destiny in the arena of shadows.
          </p>
          <button
            onClick={handleStart}
            style={{
              background: 'transparent',
              color: '#f5f5f5',
              border: '2px solid #aa6644',
              padding: 'clamp(14px, 4vw, 20px) clamp(40px, 10vw, 70px)',
              fontSize: 'clamp(16px, 3vw, 20px)',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              textTransform: 'uppercase',
              letterSpacing: 'clamp(3px, 1vw, 5px)',
              boxShadow: '0 0 30px rgba(170, 100, 68, 0.4)',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              zIndex: 1
            }}
          >
            Begin
          </button>
        </div>
      )}

      {/* Health Bars & HUD */}
      {started && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: isMobile ? '10px 15px' : '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 50,
          pointerEvents: 'none'
        }}>
          {isMobile && (
            <a href="index.html" style={{
              position: 'absolute',
              top: '10px',
              left: '15px',
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.8)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 'bold',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              pointerEvents: 'auto',
              zIndex: 51
            }}>← Back</a>
          )}
          
          <div style={{ width: isMobile ? '38%' : '42%', marginTop: isMobile ? '45px' : '0' }}>
            <div style={{
              color: '#e8e8e8',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              fontFamily: 'Georgia, serif',
              letterSpacing: '2px',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              marginBottom: '8px'
            }}>YOU</div>
            <div style={{
              width: '100%',
              height: isMobile ? '16px' : '22px',
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid #4a2a2a',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${playerHealth}%`,
                height: '100%',
                background: playerHealth > 50 ? 'linear-gradient(180deg, #ff7755, #cc3322)' :
                           playerHealth > 25 ? 'linear-gradient(180deg, #ffaa44, #cc6622)' :
                           'linear-gradient(180deg, #ff3333, #cc1111)',
                transition: 'width 0.12s'
              }} />
            </div>
          </div>

          <div style={{ width: isMobile ? '38%' : '42%', textAlign: 'right', marginTop: isMobile ? '45px' : '0' }}>
            <div style={{
              color: '#e8e8e8',
              fontSize: isMobile ? '0.9rem' : '1.1rem',
              fontFamily: 'Georgia, serif',
              letterSpacing: '2px',
              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
              marginBottom: '8px'
            }}>
              {level === 1 ? 'RONIN' : level === 2 ? 'SHINIGAMI' : 'SHADOW LORD'}
            </div>
            <div style={{
              width: '100%',
              height: isMobile ? '16px' : '22px',
              background: 'rgba(0,0,0,0.7)',
              border: '2px solid #4a2a2a',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${enemyHealth}%`,
                height: '100%',
                background: enemyHealth > 50 ? 'linear-gradient(180deg, #ff7755, #cc3322)' :
                           enemyHealth > 25 ? 'linear-gradient(180deg, #ffaa44, #cc6622)' :
                           'linear-gradient(180deg, #ff3333, #cc1111)',
                transition: 'width 0.12s'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Controls */}
      {started && !isMobile && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          padding: '15px 25px',
          borderRadius: '8px',
          border: '1px solid rgba(80,40,60,0.3)',
          color: '#888',
          fontFamily: 'Georgia, serif',
          fontSize: '0.9rem',
          textAlign: 'center',
          zIndex: 50
        }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: '#999' }}>[A/D]</span> Move &nbsp;
            <span style={{ color: '#999' }}>[W]</span> Jump &nbsp;
            <span style={{ color: '#999' }}>[S]</span> Crouch &nbsp;
            <span style={{ color: '#999' }}>[SHIFT]</span> Block
          </div>
          <div>
            <span style={{ color: '#cc7755' }}>[J]</span> Light &nbsp;
            <span style={{ color: '#cc7755' }}>[K]</span> Heavy &nbsp;
            <span style={{ color: '#cc7755' }}>[L]</span> Left &nbsp;
            <span style={{ color: '#cc7755' }}>[I]</span> Right
          </div>
          <a href="index.html" style={{
            display: 'inline-block',
            marginTop: '12px',
            color: '#666',
            textDecoration: 'none',
            fontSize: '0.85rem'
          }}>← Return</a>
        </div>
      )}

      {/* Game Over Modal */}
      {started && gameOver && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(8, 3, 5, 0.96)',
          padding: isMobile ? '25px 35px' : '40px 80px',
          textAlign: 'center',
          border: '2px solid #5a2a2a',
          boxShadow: '0 0 80px rgba(0,0,0,0.9)',
          zIndex: 150
        }}>
          <h2 style={{
            color: message === 'DEFEAT' ? '#cc4444' : '#ffaa66',
            margin: 0,
            fontSize: isMobile ? '2rem' : 'clamp(2rem, 6vw, 4rem)',
            fontFamily: 'Georgia, serif',
            textTransform: 'uppercase',
            letterSpacing: '4px',
            textShadow: message === 'DEFEAT' ?
              '0 0 30px rgba(200,50,50,0.6)' :
              '0 0 30px rgba(255,150,80,0.6)'
          }}>{message}</h2>
          
          <div style={{
            width: '100px',
            height: 2,
            background: 'linear-gradient(90deg, transparent, #664444, transparent)',
            margin: '30px auto'
          }} />
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {nextLevelReady ? (
              <button onClick={advanceLevel} style={{
                padding: '12px 30px',
                background: 'transparent',
                color: '#f5f5f5',
                border: '2px solid #aa6644',
                fontSize: '1rem',
                fontFamily: 'Georgia, serif',
                textTransform: 'uppercase',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}>Next Battle</button>
            ) : (
              <button onClick={resetGame} style={{
                padding: '12px 30px',
                background: 'transparent',
                color: '#f5f5f5',
                border: '2px solid #aa6644',
                fontSize: '1rem',
                fontFamily: 'Georgia, serif',
                textTransform: 'uppercase',
                cursor: 'pointer',
                touchAction: 'manipulation'
              }}>Fight Again</button>
            )}
            <a href="index.html" style={{
              padding: '12px 30px',
              background: 'transparent',
              color: '#888',
              border: '2px solid #444',
              fontSize: '1rem',
              fontFamily: 'Georgia, serif',
              textTransform: 'uppercase',
              textDecoration: 'none',
              touchAction: 'manipulation'
            }}>Exit</a>
          </div>
        </div>
      )}
    </div>
  );
}
