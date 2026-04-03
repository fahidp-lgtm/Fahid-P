import React, { Suspense, lazy, useState, useEffect } from 'react';
import { useStore } from './store';

const GameCanvas = lazy(() => import('./components/ShadowFight'));

export default function App() {
  const [started, setStarted] = useState(false);
  const { playerHealth, enemyHealth, gameOver, message, nextLevelReady, resetGame, advanceLevel, level } = useStore();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  return (
    <>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          {!started && (
            <div style={{ 
                pointerEvents: 'auto', 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'linear-gradient(180deg, #1a0a2e 0%, #0a0508 100%)', 
                flexDirection: 'column',
                padding: '20px' 
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
                    textAlign: 'center'
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
                    lineHeight: '1.6'
                }}>
                   Face your destiny in the arena of shadows.
                </p>
                <button 
                   onClick={() => { setStarted(true); resetGame(); }} 
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
                       transition: 'all 0.3s ease',
                       boxShadow: '0 0 30px rgba(170, 100, 68, 0.4), inset 0 0 20px rgba(170, 100, 68, 0.1)',
                       touchAction: 'manipulation'
                   }}
                   onMouseEnter={(e) => {
                       e.target.style.background = 'rgba(170, 100, 68, 0.25)';
                       e.target.style.boxShadow = '0 0 50px rgba(170, 100, 68, 0.6), inset 0 0 30px rgba(170, 100, 68, 0.2)';
                   }}
                   onMouseLeave={(e) => {
                       e.target.style.background = 'transparent';
                       e.target.style.boxShadow = '0 0 30px rgba(170, 100, 68, 0.4), inset 0 0 20px rgba(170, 100, 68, 0.1)';
                   }}
                >
                   Begin
                </button>
            </div>
          )}

          {started && (
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: isMobile ? '10px' : 'clamp(15px, 3vw, 25px) clamp(20px, 5vw, 50px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
            }}>
               {isMobile && (
                 <a href="index.html" style={{
                     position: 'absolute',
                     top: '10px',
                     left: '10px',
                     padding: '8px 16px',
                     background: 'rgba(0,0,0,0.7)',
                     border: '1px solid rgba(255,255,255,0.2)',
                     color: 'white',
                     borderRadius: '8px',
                     textDecoration: 'none',
                     fontSize: '12px',
                     fontWeight: 'bold',
                     zIndex: 1001,
                     touchAction: 'manipulation'
                 }}>← Back</a>
               )}
               <div style={{ width: isMobile ? '35%' : '42%', marginTop: isMobile ? '35px' : '0' }}>
                   <div style={{ 
                       display: 'flex', 
                       alignItems: 'center', 
                       marginBottom: '10px',
                       gap: '18px'
                   }}>
                       <span style={{ 
                           color: '#e8e8e8', 
                           fontWeight: 'normal', 
                           fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                           fontFamily: 'Georgia, serif',
                           letterSpacing: '3px',
                           textShadow: '0 2px 6px rgba(0,0,0,0.9)'
                       }}>YOU</span>
                       <span style={{
                           color: '#888',
                           fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)',
                           fontFamily: 'Georgia, serif'
                       }}>RONIN</span>
                   </div>
                   <div style={{ 
                       width: '100%', 
                       height: 'clamp(18px, 3vw, 24px)', 
                       background: 'rgba(0,0,0,0.7)', 
                       border: '2px solid #4a2a2a',
                       overflow: 'hidden',
                       boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)'
                   }}>
                       <div style={{ 
                           width: `${playerHealth}%`, 
                           height: '100%', 
                           background: playerHealth > 50 ? 'linear-gradient(180deg, #ff7755 0%, #cc3322 50%, #aa2211 100%)' : 
                                        playerHealth > 25 ? 'linear-gradient(180deg, #ffaa44 0%, #cc6622 50%, #aa4411 100%)' :
                                        'linear-gradient(180deg, #ff3333 0%, #cc1111 50%, #990000 100%)',
                           transition: 'width 0.12s ease-out',
                           boxShadow: playerHealth > 50 ? '0 0 12px rgba(255,100,60,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)' : 'none'
                       }} />
                   </div>
               </div>

               <div style={{ 
                    width: isMobile ? '35%' : '42%', 
                    textAlign: 'right',
                    marginTop: isMobile ? '35px' : '0'
                }}>
                   <div style={{ 
                       color: '#e8e8e8', 
                       marginBottom: '10px', 
                       fontWeight: 'normal', 
                       fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
                       fontFamily: 'Georgia, serif',
                       letterSpacing: '3px',
                       textShadow: '0 2px 6px rgba(0,0,0,0.9)'
                   }}>
                        {level === 1 ? 'RONIN' : level === 2 ? 'SHINIGAMI' : 'SHADOW LORD'}
                   </div>
                   <div style={{ 
                       width: '100%', 
                       height: 'clamp(18px, 3vw, 24px)', 
                       background: 'rgba(0,0,0,0.7)', 
                       border: '2px solid #4a2a2a',
                       display: 'flex',
                       justifyContent: 'flex-end',
                       overflow: 'hidden',
                       boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6), 0 2px 4px rgba(0,0,0,0.4)'
                   }}>
                       <div style={{ 
                           width: `${enemyHealth}%`, 
                           height: '100%', 
                           background: enemyHealth > 50 ? 'linear-gradient(180deg, #ff7755 0%, #cc3322 50%, #aa2211 100%)' : 
                                        enemyHealth > 25 ? 'linear-gradient(180deg, #ffaa44 0%, #cc6622 50%, #aa4411 100%)' :
                                        'linear-gradient(180deg, #ff3333 0%, #cc1111 50%, #990000 100%)',
                           transition: 'width 0.12s ease-out',
                           boxShadow: enemyHealth > 50 ? '0 0 12px rgba(255,100,60,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)' : 'none'
                       }} />
                   </div>
               </div>
            </div>
          )}

          {started && !isMobile && (
            <div style={{
                position: 'absolute', 
                bottom: '30px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                color: '#666666', 
                fontFamily: 'Georgia, serif', 
                padding: '15px 30px', 
                textAlign: 'center',
                fontSize: '0.95rem',
                letterSpacing: '1px',
                background: 'rgba(0,0,0,0.5)',
                borderRadius: '4px',
                border: '1px solid rgba(80,40,60,0.3)'
            }}>
               <span style={{ color: '#999' }}>[A/D]</span> Move &nbsp;&nbsp;
               <span style={{ color: '#999' }}>[W]</span> Jump &nbsp;&nbsp;
               <span style={{ color: '#999' }}>[S]</span> Crouch &nbsp;&nbsp;
               <span style={{ color: '#999' }}>[SHIFT]</span> Block
               <br/>
               <span style={{ color: '#cc7755' }}>[J]</span> Light &nbsp;&nbsp;
               <span style={{ color: '#cc7755' }}>[K]</span> Heavy &nbsp;&nbsp;
               <span style={{ color: '#cc7755' }}>[L]</span> Left &nbsp;&nbsp;
               <span style={{ color: '#cc7755' }}>[I]</span> Right
                
                 <a href="index.html" style={{
                     pointerEvents:'auto', 
                     display: 'block', 
                     marginTop: '15px', 
                     color: '#444444', 
                     textDecoration: 'none',
                     fontSize: '0.9rem',
                     transition: 'color 0.2s'
                 }}
                 onMouseEnter={(e) => e.target.style.color = '#888'}
                 onMouseLeave={(e) => e.target.style.color = '#444'}
                 >← Return</a>
            </div>
          )}

          {started && gameOver && (
            <div style={{
                position: 'absolute', 
                top: '50%', 
                left:'50%', 
                transform: isMobile ? 'translate(-50%, -50%) scale(0.9)' : 'translate(-50%, -50%)', 
                background:'rgba(8, 3, 5, 0.96)',
                padding: isMobile ? '20px 25px' : 'clamp(30px, 8vw, 70px) clamp(40px, 10vw, 120px)', 
                textAlign:'center', 
                pointerEvents: 'auto',
                border: '2px solid #5a2a2a',
                boxShadow: '0 0 80px rgba(0,0,0,0.9), inset 0 0 50px rgba(100,40,60,0.15)',
                maxWidth: isMobile ? '85vw' : '90vw',
                zIndex: 1002
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: message === 'DEFEAT' ? 
                        'radial-gradient(circle, rgba(150,30,30,0.3) 0%, transparent 70%)' :
                        'radial-gradient(circle, rgba(255,150,80,0.3) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    pointerEvents: 'none'
                }} />
                <h2 style={{
                    color: message === 'DEFEAT' ? '#cc4444' : '#ffaa66', 
                    margin: 0, 
                    fontSize: 'clamp(2rem, 8vw, 4rem)', 
                    fontFamily: 'Georgia, serif', 
                    textTransform: 'uppercase', 
                    letterSpacing: 'clamp(4px, 2vw, 8px)',
                    textShadow: message === 'DEFEAT' ? 
                        '0 0 30px rgba(200,50,50,0.6)' : 
                        '0 0 30px rgba(255,150,80,0.6)',
                    position: 'relative'
                }}>{message}</h2>
                <div style={{
                    width: 'clamp(80px, 15vw, 120px)',
                    height: 2,
                    background: 'linear-gradient(90deg, transparent, #664444, transparent)',
                    margin: '35px auto'
                }} />
                <div style={{ marginTop: '50px', display: 'flex', gap: '25px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {nextLevelReady ? (
                         <button onClick={advanceLevel} style={{
                             padding: 'clamp(12px, 3vw, 16px) clamp(30px, 6vw, 40px)', 
                             background:'transparent', 
                             color:'#f5f5f5', 
                             border:'2px solid #aa6644', 
                             cursor:'pointer', 
                             fontFamily: 'Georgia, serif', 
                             fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
                             textTransform: 'uppercase',
                             letterSpacing: '3px',
                             transition: 'all 0.3s',
                             touchAction: 'manipulation'
                         }}
                         onMouseEnter={(e) => {
                             e.target.style.background = 'rgba(170,100,68,0.2)';
                             e.target.style.boxShadow = '0 0 20px rgba(170,100,68,0.4)';
                         }}
                         onMouseLeave={(e) => {
                             e.target.style.background = 'transparent';
                             e.target.style.boxShadow = 'none';
                         }}
                         >Next Battle</button>
                    ) : (
                         <button onClick={resetGame} style={{
                             padding: 'clamp(12px, 3vw, 16px) clamp(30px, 6vw, 40px)', 
                             background:'transparent', 
                             color:'#f5f5f5', 
                             border:'2px solid #aa6644', 
                             cursor:'pointer', 
                             fontFamily: 'Georgia, serif', 
                             fontSize: 'clamp(1rem, 2vw, 1.2rem)', 
                             textTransform: 'uppercase',
                             letterSpacing: '3px',
                             transition: 'all 0.3s',
                             touchAction: 'manipulation'
                         }}
                         onMouseEnter={(e) => {
                             e.target.style.background = 'rgba(170,100,68,0.2)';
                             e.target.style.boxShadow = '0 0 20px rgba(170,100,68,0.4)';
                         }}
                         onMouseLeave={(e) => {
                             e.target.style.background = 'transparent';
                             e.target.style.boxShadow = 'none';
                         }}
                         >Fight Again</button>
                    )}
                </div>
            </div>
          )}
      </div>

      {started && (
        <Suspense fallback={<div style={{ position: 'absolute', inset: 0, background: '#0a0508' }}></div>}>
            <GameCanvas started={started} isMobile={isMobile} />
        </Suspense>
      )}
    </>
  );
}
