import { useEffect, useState } from 'react';

export function useControls() {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    boost: false,
    jump: false,
    reset: false
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Explicitly matching event.code as requested
      switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls(c => ({...c, forward: true}));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls(c => ({...c, backward: true}));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls(c => ({...c, left: true}));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls(c => ({...c, right: true}));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls(c => ({...c, boost: true}));
          break;
        case 'Space':
          setControls(c => ({...c, jump: true}));
          break;
        case 'KeyR':
          setControls(c => ({...c, reset: true}));
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls(c => ({...c, forward: false}));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls(c => ({...c, backward: false}));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls(c => ({...c, left: false}));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls(c => ({...c, right: false}));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setControls(c => ({...c, boost: false}));
          break;
        case 'Space':
          setControls(c => ({...c, jump: false}));
          break;
        case 'KeyR':
          setControls(c => ({...c, reset: false}));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
}
