import React, { useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Fighter } from '../game/classes';

// Game state - module level for persistent access
const gameState = {
    player: null,
    enemy: null,
    keys: { a: false, d: false, s: false, shift: false },
    touch: {
        left: false,
        right: false,
        up: false,
        down: false,
        attack: false,
        heavy: false,
        leftSlash: false,
        rightSlash: false,
        block: false
    },
    pendingActions: {
        attack: false,
        heavy: false,
        leftSlash: false,
        rightSlash: false,
        jump: false
    }
};

// Touch handler function - defined at module level for consistent access
function handleTouchInput(action, value) {
    gameState.touch[action] = value;
    
    // Set lastKey for movement buttons (needed for game loop logic)
    if (action === 'left' && value) {
        gameState.player.lastKey = 'a';
    }
    if (action === 'right' && value) {
        gameState.player.lastKey = 'd';
    }
    
    // For one-shot actions, set pending action
    if (value && (action === 'attack' || action === 'heavy' || action === 'leftSlash' || action === 'rightSlash')) {
        gameState.pendingActions[action] = true;
        gameState.touch[action] = false;
    }
    if (action === 'up' && value) {
        gameState.pendingActions.jump = true;
    }
}

export default function ShadowFight({ started, isMobile }) {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    useEffect(() => {
        if (!started) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const dpr = window.devicePixelRatio || 1;
        const W = window.innerWidth;
        const H = window.innerHeight;
        
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Reset touch state
        gameState.touch = {
            left: false, right: false, up: false, down: false,
            attack: false, heavy: false, leftSlash: false, rightSlash: false, block: false
        };
        gameState.pendingActions = {
            attack: false, heavy: false, leftSlash: false, rightSlash: false, jump: false
        };
        gameState.keys = { a: false, d: false, s: false, shift: false };

        const gravity = 0.5;
        const texts = [];
        const sparks = [];
        const particles = [];
        
        let shakeFrames = 0;
        let hitStopFrames = 0;
        
        const level = useStore.getState().level;
        const tickRate = level === 1 ? 900 : level === 2 ? 650 : 400;

        gameState.player = new Fighter({
            position: { x: W * 0.3, y: H - 215 },
            velocity: { x: 0, y: 0 },
            color: '#1a1a1a',
            facingRight: true,
            isPlayer: true
        });

        gameState.enemy = new Fighter({
            position: { x: W * 0.7, y: H - 215 },
            velocity: { x: 0, y: 0 },
            color: '#1a1a1a',
            facingRight: false,
            isPlayer: false
        });

        for (let i = 0; i < 20; i++) {
            particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                size: 1 + Math.random() * 2,
                speed: 0.2 + Math.random() * 0.3,
                opacity: 0.1 + Math.random() * 0.15,
                drift: (Math.random() - 0.5) * 0.2
            });
        }

        const handleKeyDown = (e) => {
            if (useStore.getState().gameOver || gameState.player.dead || gameState.player.stunFrames > 0) return;
            switch (e.key) {
                case 'd': case 'ArrowRight': gameState.keys.d = true; gameState.player.lastKey = 'd'; break;
                case 'a': case 'ArrowLeft': gameState.keys.a = true; gameState.player.lastKey = 'a'; break;
                case 'w': case 'ArrowUp': 
                    if (gameState.player.velocity.y === 0) {
                        gameState.pendingActions.jump = true;
                    }
                    break;
                case 's': case 'ArrowDown': gameState.keys.s = true; break;
                case 'Shift': gameState.keys.shift = true; break;
                case 'j': gameState.pendingActions.attack = true; break;
                case 'k': gameState.pendingActions.heavy = true; break;
                case 'l': gameState.pendingActions.leftSlash = true; break;
                case 'i': gameState.pendingActions.rightSlash = true; break;
            }
        };

        const handleKeyUp = (e) => {
            switch (e.key) {
                case 'd': case 'ArrowRight': gameState.keys.d = false; break;
                case 'a': case 'ArrowLeft': gameState.keys.a = false; break;
                case 's': case 'ArrowDown': gameState.keys.s = false; break;
                case 'Shift': gameState.keys.shift = false; break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const aiInterval = setInterval(() => {
            const { player, enemy } = gameState;
            if (useStore.getState().gameOver || enemy.dead || player.dead || enemy.stunFrames > 0) return;
            
            enemy.isBlocking = false;
            enemy.isCrouching = false;
            
            const dist = Math.abs(enemy.position.x - player.position.x);
            const r = Math.random();
            
            let action = 'idle';
            if (dist > 280) action = r > 0.2 ? 'forward' : 'jump';
            else if (dist < 100) action = r > 0.5 ? 'attack' : (r > 0.25 ? 'back' : 'block');
            else if (dist < 180) action = r > 0.5 ? 'attack' : (r > 0.25 ? 'forward' : 'back');
            else action = r > 0.55 ? 'attack' : 'forward';
            
            const moveSpeed = 4.5;
            if (action === 'back') {
                enemy.velocity.x = enemy.position.x > player.position.x ? moveSpeed : -moveSpeed;
            } else if (action === 'forward') {
                enemy.velocity.x = enemy.position.x > player.position.x ? -moveSpeed : moveSpeed;
            } else if (action === 'jump') {
                if (enemy.velocity.y === 0) enemy.velocity.y = -13;
            } else if (action === 'block') {
                enemy.isBlocking = true;
            } else if (action === 'attack') {
                const a = Math.random();
                if (a > 0.7 && level >= 2) enemy.attack('heavy_slash');
                else if (a > 0.4) enemy.attack('light_slash');
                else if (a > 0.2) enemy.attack('left_slash');
                else enemy.attack('right_slash');
            }
            
            if (action !== 'attack' && action !== 'block') {
                setTimeout(() => { if (enemy.stunFrames === 0) enemy.velocity.x = 0; }, tickRate);
            }
            if (action === 'block') {
                setTimeout(() => { enemy.isBlocking = false; }, tickRate);
            }
        }, tickRate);

        function drawBg() {
            ctx.fillStyle = '#1a0a2e';
            ctx.fillRect(0, 0, W, H * 0.7);
            
            const sun = ctx.createRadialGradient(W * 0.7, H * 0.35, 0, W * 0.7, H * 0.35, 120);
            sun.addColorStop(0, 'rgba(255, 180, 100, 0.9)');
            sun.addColorStop(0.5, 'rgba(200, 80, 50, 0.4)');
            sun.addColorStop(1, 'rgba(150, 50, 30, 0)');
            ctx.fillStyle = sun;
            ctx.fillRect(0, 0, W, H * 0.7);
            
            ctx.fillStyle = '#1a0a2e';
            ctx.fillRect(0, H * 0.7, W, H * 0.3);
            
            ctx.fillStyle = 'rgba(30, 15, 40, 0.6)';
            ctx.beginPath();
            ctx.moveTo(0, H * 0.65);
            ctx.quadraticCurveTo(W * 0.3, H * 0.55, W * 0.6, H * 0.6);
            ctx.quadraticCurveTo(W * 0.85, H * 0.55, W, H * 0.65);
            ctx.lineTo(W, H * 0.75);
            ctx.lineTo(0, H * 0.75);
            ctx.fill();
            
            ctx.fillStyle = '#0a0508';
            ctx.fillRect(0, H - 60, W, 60);
        }

        function drawParticles() {
            particles.forEach(p => {
                p.y -= p.speed;
                p.x += p.drift;
                if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
                ctx.fillStyle = `rgba(255, 200, 150, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function drawVignette() {
            const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H);
            vg.addColorStop(0, 'rgba(0,0,0,0)');
            vg.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, W, H);
        }

        function animate() {
            animationRef.current = requestAnimationFrame(animate);
            
            const { player, enemy, keys, touch, pendingActions } = gameState;
            
            drawBg();
            drawParticles();
            
            if (shakeFrames > 0) {
                ctx.save();
                ctx.translate(Math.random() * 12 - 6, Math.random() * 12 - 6);
                shakeFrames--;
            }
            
            const state = useStore.getState();
            
            player.facingRight = player.position.x < enemy.position.x;
            enemy.facingRight = enemy.position.x < player.position.x;
            
            if (hitStopFrames > 0) {
                hitStopFrames--;
                player.draw(ctx);
                enemy.draw(ctx);
            } else {
                player.update(ctx, H, gravity);
                enemy.update(ctx, H, gravity);
            }
            
            // Combine keyboard and touch inputs
            const leftPressed = keys.a || touch.left;
            const rightPressed = keys.d || touch.right;
            const downPressed = keys.s || touch.down;
            const blockPressed = keys.shift || touch.block;
            
            // Handle jump (from pending actions)
            if (pendingActions.jump && player.velocity.y === 0) {
                player.velocity.y = -14;
            }
            pendingActions.jump = false;
            
            // Handle attacks (from pending actions - one-shot)
            if (pendingActions.attack) {
                player.attack(player.isCrouching ? 'thrust' : (player.isAirborne ? 'heavy_slash' : 'light_slash'));
            }
            if (pendingActions.heavy) {
                player.attack('heavy_slash');
            }
            if (pendingActions.leftSlash) {
                player.attack('left_slash');
            }
            if (pendingActions.rightSlash) {
                player.attack('right_slash');
            }
            // Reset pending attack actions
            pendingActions.attack = false;
            pendingActions.heavy = false;
            pendingActions.leftSlash = false;
            pendingActions.rightSlash = false;
            
            // Handle blocking and crouching
            player.isBlocking = blockPressed && player.stunFrames === 0 && player.attackState === 'idle';
            player.isCrouching = downPressed && player.stunFrames === 0 && player.attackState === 'idle';
            
            const speedMod = (player.isBlocking || player.isCrouching) ? 0.5 : 0.75;
            
            // Handle movement
            if (player.stunFrames === 0 && hitStopFrames === 0) {
                player.velocity.x = 0;
                if (leftPressed && player.lastKey === 'a') player.velocity.x = -5.5 * speedMod;
                else if (rightPressed && player.lastKey === 'd') player.velocity.x = 5.5 * speedMod;
            }
            
            // Boundary checks
            const arenaLeft = W * 0.075;
            const arenaRight = W * 0.925;
            player.position.x = Math.max(arenaLeft, Math.min(arenaRight - player.width, player.position.x));
            enemy.position.x = Math.max(arenaLeft, Math.min(arenaRight - enemy.width, enemy.position.x));
            
            function hits(atk, def) {
                const aBox = atk.attackBox;
                const dBox = def.position;
                const dh = def.isCrouching ? def.baseHeight * 0.65 : def.baseHeight;
                const dy = dBox.y + (def.baseHeight - dh);
                return aBox.position.x < dBox.x + def.width &&
                       aBox.position.x + aBox.width > dBox.x &&
                       aBox.position.y < dy + dh &&
                       aBox.position.y + aBox.height > dy;
            }
            
            function processHit(atk, def, isPlayer) {
                const heavy = atk.attackType === 'heavy_slash' || atk.attackType === 'thrust';
                let dmg = heavy ? 11 : 7;
                if (atk.comboCount >= 3) dmg *= 1.2;
                
                const dir = atk.facingRight ? 1 : -1;
                const result = def.takeHit(dmg, dir, heavy, atk.attackType);
                
                hitStopFrames = heavy ? 9 : 5;
                if (!result.blocked) shakeFrames = heavy ? 12 : 4;
                
                sparks.push({ x: def.position.x + (dir === 1 ? def.width : 0), y: def.position.y + 60, life: 22, shards: Array(18).fill().map(() => ({ vx: (Math.random() - 0.5) * 28, vy: (Math.random() - 0.5) * 28 - 5, sx: 0, sy: 0, s: 3 + Math.random() * 6 })) });
                
                const entity = isPlayer ? 'enemyHealth' : 'playerHealth';
                state.setHealth(entity, -result.damageTaken);
                
                if (!result.blocked && atk.comboCount >= 3) {
                    let txt = '';
                    if (atk.comboCount >= 7) txt = 'FURY!';
                    else if (atk.comboCount >= 6) txt = 'COMBO x6';
                    else if (atk.comboCount >= 5) txt = 'COMBO x5';
                    else if (atk.comboCount >= 4) txt = 'COMBO x4';
                    else if (atk.comboCount >= 3) txt = 'COMBO x3';
                    if (txt) texts.push({ text: txt, x: atk.position.x, y: atk.position.y - 30, color: '#ffaa44', scale: 0, life: 1 });
                }
                
                if (state[entity] <= 0) {
                    state.setGameOver(true, isPlayer ? (level >= 3 ? 'MASTERSLAYER' : 'VICTORY') : 'DEFEAT', isPlayer && level < 3);
                    def.dead = true;
                }
            }
            
            if (player.isAttacking && !player.attackHasHit && hits(player, enemy)) {
                player.attackHasHit = true;
                processHit(player, enemy, true);
            }
            if (enemy.isAttacking && !enemy.attackHasHit && hits(enemy, player)) {
                enemy.attackHasHit = true;
                processHit(enemy, player, false);
            }
            
            sparks.forEach((sp, i) => {
                ctx.fillStyle = sp.life % 2 === 0 ? '#ff8844' : '#ffaa44';
                sp.shards.forEach(s => {
                    s.sx += s.vx;
                    s.sy += s.vy;
                    s.vy += 0.6;
                    ctx.globalAlpha = sp.life / 22;
                    ctx.beginPath();
                    ctx.arc(sp.x + s.sx, sp.y + s.sy, s.s * (sp.life / 22), 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
                sp.life--;
                if (sp.life <= 0) sparks.splice(i, 1);
            });
            
            texts.forEach((t, i) => {
                t.y -= 1.5;
                ctx.save();
                ctx.globalAlpha = t.life;
                ctx.translate(t.x, t.y);
                t.scale = Math.min(1, t.scale + 0.15);
                ctx.scale(t.scale, t.scale);
                ctx.fillStyle = t.color;
                ctx.font = 'bold 36px Georgia';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 8;
                ctx.fillText(t.text, 0, 0);
                ctx.restore();
                t.life -= 0.02;
                if (t.life <= 0) texts.splice(i, 1);
            });
            
            drawVignette();
            if (shakeFrames >= 0) ctx.restore();
        }

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearInterval(aiInterval);
        };
    }, [started]);

    // Touch handlers - use module-level function
    const setTouch = (action, value) => (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        handleTouchInput(action, value);
    };

    if (!started) return null;

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 1,
                    display: 'block',
                    touchAction: 'none'
                }}
            />
            
            {isMobile && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        padding: '15px',
                        paddingBottom: 'max(15px, env(safe-area-inset-bottom))',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end'
                    }}>
                        {/* D-Pad */}
                        <div style={{
                            position: 'relative',
                            width: '165px',
                            height: '165px',
                            pointerEvents: 'auto'
                        }}>
                            <button
                                onTouchStart={setTouch('up', true)}
                                onTouchEnd={setTouch('up', false)}
                                onTouchCancel={setTouch('up', false)}
                                onClick={setTouch('up', true)}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(99, 102, 241, 0.9)',
                                    border: '3px solid rgba(255,255,255,0.6)',
                                    borderRadius: '15px',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    touchAction: 'manipulation',
                                    cursor: 'pointer',
                                    WebkitTapHighlightColor: 'transparent',
                                    userSelect: 'none',
                                    outline: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >↑</button>
                            <button
                                onTouchStart={setTouch('down', true)}
                                onTouchEnd={setTouch('down', false)}
                                onTouchCancel={setTouch('down', false)}
                                onClick={setTouch('down', true)}
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(99, 102, 241, 0.9)',
                                    border: '3px solid rgba(255,255,255,0.6)',
                                    borderRadius: '15px',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    touchAction: 'manipulation',
                                    cursor: 'pointer',
                                    WebkitTapHighlightColor: 'transparent',
                                    userSelect: 'none',
                                    outline: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >↓</button>
                            <button
                                onTouchStart={setTouch('left', true)}
                                onTouchEnd={setTouch('left', false)}
                                onTouchCancel={setTouch('left', false)}
                                onClick={setTouch('left', true)}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: 0,
                                    transform: 'translateY(-50%)',
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(99, 102, 241, 0.9)',
                                    border: '3px solid rgba(255,255,255,0.6)',
                                    borderRadius: '15px',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    touchAction: 'manipulation',
                                    cursor: 'pointer',
                                    WebkitTapHighlightColor: 'transparent',
                                    userSelect: 'none',
                                    outline: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >←</button>
                            <button
                                onTouchStart={setTouch('right', true)}
                                onTouchEnd={setTouch('right', false)}
                                onTouchCancel={setTouch('right', false)}
                                onClick={setTouch('right', true)}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: 0,
                                    transform: 'translateY(-50%)',
                                    width: '60px',
                                    height: '60px',
                                    background: 'rgba(99, 102, 241, 0.9)',
                                    border: '3px solid rgba(255,255,255,0.6)',
                                    borderRadius: '15px',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    touchAction: 'manipulation',
                                    cursor: 'pointer',
                                    WebkitTapHighlightColor: 'transparent',
                                    userSelect: 'none',
                                    outline: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                }}
                            >→</button>
                        </div>

                        {/* Action Buttons */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            pointerEvents: 'auto'
                        }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onTouchStart={setTouch('leftSlash', true)}
                                    onTouchEnd={setTouch('leftSlash', false)}
                                    onTouchCancel={setTouch('leftSlash', false)}
                                    onClick={setTouch('leftSlash', true)}
                                    style={{
                                        width: '65px',
                                        height: '65px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                        border: '3px solid rgba(255,255,255,0.5)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        touchAction: 'manipulation',
                                        cursor: 'pointer',
                                        WebkitTapHighlightColor: 'transparent',
                                        userSelect: 'none',
                                        outline: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >L</button>
                                <button
                                    onTouchStart={setTouch('rightSlash', true)}
                                    onTouchEnd={setTouch('rightSlash', false)}
                                    onTouchCancel={setTouch('rightSlash', false)}
                                    onClick={setTouch('rightSlash', true)}
                                    style={{
                                        width: '65px',
                                        height: '65px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ec4899, #db2777)',
                                        border: '3px solid rgba(255,255,255,0.5)',
                                        color: 'white',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        touchAction: 'manipulation',
                                        cursor: 'pointer',
                                        WebkitTapHighlightColor: 'transparent',
                                        userSelect: 'none',
                                        outline: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >I</button>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onTouchStart={setTouch('attack', true)}
                                    onTouchEnd={setTouch('attack', false)}
                                    onTouchCancel={setTouch('attack', false)}
                                    onClick={setTouch('attack', true)}
                                    style={{
                                        width: '75px',
                                        height: '75px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        border: '3px solid rgba(255,255,255,0.5)',
                                        color: 'white',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        touchAction: 'manipulation',
                                        cursor: 'pointer',
                                        WebkitTapHighlightColor: 'transparent',
                                        userSelect: 'none',
                                        outline: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >J</button>
                                <button
                                    onTouchStart={setTouch('heavy', true)}
                                    onTouchEnd={setTouch('heavy', false)}
                                    onTouchCancel={setTouch('heavy', false)}
                                    onClick={setTouch('heavy', true)}
                                    style={{
                                        width: '75px',
                                        height: '75px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        border: '3px solid rgba(255,255,255,0.5)',
                                        color: 'white',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        touchAction: 'manipulation',
                                        cursor: 'pointer',
                                        WebkitTapHighlightColor: 'transparent',
                                        userSelect: 'none',
                                        outline: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >K</button>
                                <button
                                    onTouchStart={setTouch('block', true)}
                                    onTouchEnd={setTouch('block', false)}
                                    onTouchCancel={setTouch('block', false)}
                                    onClick={setTouch('block', true)}
                                    style={{
                                        width: '75px',
                                        height: '75px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                        border: '3px solid rgba(255,255,255,0.5)',
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        touchAction: 'manipulation',
                                        cursor: 'pointer',
                                        WebkitTapHighlightColor: 'transparent',
                                        userSelect: 'none',
                                        outline: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >SHIFT</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
