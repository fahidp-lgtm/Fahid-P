import React, { useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store';
import { Fighter, FloatingText, Spark, SlashTrail } from '../game/classes';

export default function ShadowFight({ started, isMobile }) {
    const canvasRef = useRef(null);
    const touchControlsRef = useRef({
        left: false,
        right: false,
        up: false,
        down: false,
        attack: false,
        heavy: false,
        leftSlash: false,
        rightSlash: false,
        block: false
    });

    useEffect(() => {
        if (!started) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;
            
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            
            ctx.scale(dpr, dpr);
            
            return { width: displayWidth, height: displayHeight };
        };
        
        const { width: canvasWidth, height: canvasHeight } = updateCanvasSize();
        
        window.addEventListener('resize', () => {
            updateCanvasSize();
        });

        const gravity = 0.5;
        let animationId;

        const texts = [];
        const sparks = [];
        const ambientParticles = [];

        let screenShakeFrames = 0;
        let hitStopFrames = 0;

        const level = useStore.getState().level;
        let aiTickRate = level === 1 ? 900 : level === 2 ? 650 : 400;

        const GROUND_Y = canvasHeight - 50;
        const ARENA_WIDTH = canvasWidth * 0.85;
        const ARENA_LEFT = (canvasWidth - ARENA_WIDTH) / 2;
        const ARENA_RIGHT = ARENA_LEFT + ARENA_WIDTH;

        const player = new Fighter({
            position: { x: canvasWidth * 0.3, y: 0 },
            velocity: { x: 0, y: 0 },
            color: '#1a1a1a',
            facingRight: true,
            isPlayer: true
        });

        const enemy = new Fighter({
            position: { x: canvasWidth * 0.7, y: 0 },
            velocity: { x: 0, y: 0 },
            color: '#1a1a1a',
            facingRight: false,
            isPlayer: false
        });

        for (let i = 0; i < 25; i++) {
            ambientParticles.push({
                x: Math.random() * canvasWidth,
                y: Math.random() * canvasHeight,
                size: 1 + Math.random() * 2,
                speed: 0.2 + Math.random() * 0.4,
                opacity: 0.1 + Math.random() * 0.2,
                drift: (Math.random() - 0.5) * 0.3
            });
        }

        const keys = {
            a: { pressed: false },
            d: { pressed: false },
            shift: { pressed: false },
            s: { pressed: false }
        };

        const handleKeyDown = (e) => {
            if (useStore.getState().gameOver || player.dead || player.stunFrames > 0) return;
            switch (e.key) {
                case 'd':
                case 'ArrowRight':
                    keys.d.pressed = true;
                    player.lastKey = 'd';
                    break;
                case 'a':
                case 'ArrowLeft':
                    keys.a.pressed = true;
                    player.lastKey = 'a';
                    break;
                case 'w':
                case 'ArrowUp':
                    if (player.velocity.y === 0 && !player.isCrouching) player.velocity.y = -14;
                    break;
                case 's':
                case 'ArrowDown':
                    keys.s.pressed = true;
                    break;
                case 'Shift':
                    keys.shift.pressed = true;
                    break;
                case 'j':
                    if (player.isCrouching) {
                        player.attack('thrust');
                    } else if (player.isAirborne) {
                        player.attack('heavy_slash');
                    } else {
                        player.attack('light_slash');
                    }
                    break;
                case 'k':
                    player.attack('heavy_slash');
                    break;
                case 'l':
                    if (player.isAirborne) {
                        player.attack('light_slash');
                    } else {
                        player.attack('left_slash');
                    }
                    break;
                case 'i':
                    player.attack('right_slash');
                    break;
            }
        };

        const handleKeyUp = (e) => {
            switch (e.key) {
                case 'd':
                case 'ArrowRight':
                    keys.d.pressed = false;
                    break;
                case 'a':
                case 'ArrowLeft':
                    keys.a.pressed = false;
                    break;
                case 's':
                case 'ArrowDown':
                    keys.s.pressed = false;
                    break;
                case 'Shift':
                    keys.shift.pressed = false;
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        function rectangularCollision({ rectangle1, rectangle2 }) {
            let r2Height = rectangle2.isCrouching ? rectangle2.baseHeight * 0.65 : rectangle2.baseHeight;
            let r2Y = rectangle2.position.y + (rectangle2.baseHeight - r2Height);

            return (
                rectangle1.attackBox.position.x + rectangle1.attackBox.width >= rectangle2.position.x &&
                rectangle1.attackBox.position.x <= rectangle2.position.x + rectangle2.width &&
                rectangle1.attackBox.position.y + rectangle1.attackBox.height >= r2Y &&
                rectangle1.attackBox.position.y <= r2Y + r2Height
            );
        }

        const aiInterval = setInterval(() => {
            if (useStore.getState().gameOver || enemy.dead || player.dead || enemy.stunFrames > 0 || hitStopFrames > 0) return;

            enemy.isBlocking = false;
            enemy.isCrouching = false;

            const distance = Math.abs(enemy.position.x - player.position.x);
            let action = 'idle';

            if (distance > 280) {
                action = Math.random() > 0.2 ? 'moveForward' : 'jump';
            } else if (distance < 100) {
                if (player.attackState !== 'idle' && Math.random() > 0.4) {
                    action = Math.random() > 0.5 ? 'block' : 'moveBackward';
                } else {
                    action = Math.random() > 0.3 ? 'attack' : 'moveBackward';
                }
            } else if (distance < 180) {
                if (Math.random() > 0.5) {
                    action = 'attack';
                } else if (Math.random() > 0.4) {
                    action = 'moveForward';
                } else {
                    action = 'moveBackward';
                }
            } else {
                if (Math.random() > 0.45) {
                    action = 'attack';
                } else {
                    action = 'moveForward';
                }
            }

            if (action === 'moveBackward') {
                enemy.velocity.x = (enemy.position.x > player.position.x) ? 4.5 : -4.5;
                setTimeout(() => { if (enemy.stunFrames === 0) enemy.velocity.x = 0; }, aiTickRate);
            } else if (action === 'moveForward') {
                enemy.velocity.x = (enemy.position.x > player.position.x) ? -4.5 : 4.5;
                setTimeout(() => { if (enemy.stunFrames === 0) enemy.velocity.x = 0; }, aiTickRate);
            } else if (action === 'jump') {
                if (enemy.velocity.y === 0) enemy.velocity.y = -13;
            } else if (action === 'block') {
                enemy.isBlocking = true;
                setTimeout(() => enemy.isBlocking = false, aiTickRate);
            } else if (action === 'attack') {
                const attackMix = Math.random();
                if (attackMix > 0.7 && level >= 2) {
                    enemy.attack('heavy_slash');
                } else if (attackMix > 0.45) {
                    enemy.attack('light_slash');
                } else if (attackMix > 0.2) {
                    enemy.attack('left_slash');
                } else {
                    enemy.attack('right_slash');
                }
            }
        }, aiTickRate);

        function drawBackground() {
            const w = canvasWidth;
            const h = canvasHeight;

            const skyGradient = ctx.createLinearGradient(0, 0, 0, h * 0.7);
            skyGradient.addColorStop(0, '#1a0a2e');
            skyGradient.addColorStop(0.3, '#2d1b4e');
            skyGradient.addColorStop(0.6, '#4a1942');
            skyGradient.addColorStop(1, '#7a2c3a');
            ctx.fillStyle = skyGradient;
            ctx.fillRect(0, 0, w, h * 0.7);

            const sunGradient = ctx.createRadialGradient(w * 0.7, h * 0.35, 0, w * 0.7, h * 0.35, 120);
            sunGradient.addColorStop(0, 'rgba(255, 180, 100, 0.9)');
            sunGradient.addColorStop(0.3, 'rgba(255, 120, 60, 0.6)');
            sunGradient.addColorStop(0.6, 'rgba(200, 80, 50, 0.3)');
            sunGradient.addColorStop(1, 'rgba(150, 50, 30, 0)');
            ctx.fillStyle = sunGradient;
            ctx.fillRect(0, 0, w, h * 0.7);

            ctx.fillStyle = 'rgba(255, 200, 150, 0.15)';
            ctx.beginPath();
            ctx.arc(w * 0.7, h * 0.35, 60, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#1a0a2e';
            ctx.fillRect(0, h * 0.7, w, h * 0.3);

            const midgroundGradient = ctx.createLinearGradient(0, h * 0.4, 0, h * 0.75);
            midgroundGradient.addColorStop(0, 'rgba(20, 10, 30, 0)');
            midgroundGradient.addColorStop(1, 'rgba(10, 5, 20, 0.8)');
            ctx.fillStyle = midgroundGradient;
            ctx.fillRect(0, h * 0.4, w, h * 0.35);

            ctx.fillStyle = 'rgba(30, 15, 40, 0.5)';
            ctx.beginPath();
            ctx.moveTo(0, h * 0.65);
            ctx.quadraticCurveTo(w * 0.15, h * 0.55, w * 0.25, h * 0.6);
            ctx.quadraticCurveTo(w * 0.4, h * 0.52, w * 0.5, h * 0.58);
            ctx.quadraticCurveTo(w * 0.7, h * 0.5, w * 0.85, h * 0.55);
            ctx.quadraticCurveTo(w * 0.95, h * 0.6, w, h * 0.62);
            ctx.lineTo(w, h * 0.75);
            ctx.lineTo(0, h * 0.75);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = 'rgba(15, 8, 25, 0.7)';
            ctx.beginPath();
            ctx.moveTo(0, h * 0.7);
            ctx.lineTo(w * 0.1, h * 0.65);
            ctx.lineTo(w * 0.2, h * 0.72);
            ctx.lineTo(w * 0.35, h * 0.68);
            ctx.lineTo(w * 0.5, h * 0.73);
            ctx.lineTo(w * 0.7, h * 0.69);
            ctx.lineTo(w * 0.85, h * 0.74);
            ctx.lineTo(w, h * 0.7);
            ctx.lineTo(w, h * 0.75);
            ctx.lineTo(0, h * 0.75);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = 'rgba(80, 40, 60, 0.3)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const bx = w * (i / 8) + 30;
                const bh = 80 + Math.sin(i * 1.5) * 40;
                ctx.beginPath();
                ctx.moveTo(bx, h * 0.75);
                ctx.lineTo(bx + 15, h * 0.75 - bh);
                ctx.lineTo(bx + 35, h * 0.75);
                ctx.closePath();
                ctx.stroke();
            }

            const groundGradient = ctx.createLinearGradient(0, h - 60, 0, h);
            groundGradient.addColorStop(0, '#0a0508');
            groundGradient.addColorStop(0.3, '#150a10');
            groundGradient.addColorStop(1, '#0a0508');
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, h - 60, w, 60);

            ctx.strokeStyle = 'rgba(100, 50, 70, 0.2)';
            ctx.lineWidth = 1;
            for (let i = 0; i < w; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, h - 60);
                ctx.lineTo(i + 20, h);
                ctx.stroke();
            }

            const glowY = h * 0.72;
            const glowGradient = ctx.createLinearGradient(0, glowY - 20, 0, glowY + 40);
            glowGradient.addColorStop(0, 'rgba(200, 80, 50, 0)');
            glowGradient.addColorStop(0.5, 'rgba(200, 80, 50, 0.1)');
            glowGradient.addColorStop(1, 'rgba(200, 80, 50, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, glowY - 20, w, 60);
        }

        function updateAmbientParticles() {
            ambientParticles.forEach(p => {
                p.y -= p.speed;
                p.x += p.drift + Math.sin(p.y * 0.01) * 0.3;
                if (p.y < -10) {
                    p.y = canvasHeight + 10;
                    p.x = Math.random() * canvasWidth;
                }
            });
        }

        function drawAmbientParticles() {
            ambientParticles.forEach(p => {
                ctx.fillStyle = `rgba(255, 200, 150, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        function drawVignette() {
            const gradient = ctx.createRadialGradient(
                canvasWidth / 2, canvasHeight / 2, canvasHeight * 0.3,
                canvasWidth / 2, canvasHeight / 2, canvasHeight
            );
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }

        function animate() {
            animationId = window.requestAnimationFrame(animate);

            updateAmbientParticles();
            drawBackground();
            drawAmbientParticles();

            if (screenShakeFrames > 0) {
                ctx.save();
                ctx.translate(Math.random() * 16 - 8, Math.random() * 16 - 8);
                screenShakeFrames--;
            }

            const state = useStore.getState();

            player.facingRight = player.position.x < enemy.position.x;
            enemy.facingRight = enemy.position.x < player.position.x;

            if (hitStopFrames > 0) {
                hitStopFrames--;
                player.draw(ctx);
                enemy.draw(ctx);
            } else {
                player.update(ctx, canvasHeight, gravity);
                enemy.update(ctx, canvasHeight, gravity);
            }

            const playerLeft = player.position.x;
            const playerRight = player.position.x + player.width;
            const enemyLeft = enemy.position.x;
            const enemyRight = enemy.position.x + enemy.width;

            if (playerLeft <= ARENA_LEFT) player.position.x = ARENA_LEFT;
            if (playerRight >= ARENA_RIGHT) player.position.x = ARENA_RIGHT - player.width;
            if (enemyLeft <= ARENA_LEFT) enemy.position.x = ARENA_LEFT;
            if (enemyRight >= ARENA_RIGHT) enemy.position.x = ARENA_RIGHT - enemy.width;

            const minDistance = 70;
            if (playerRight > enemyLeft - minDistance && playerLeft < enemyRight + minDistance) {
                const overlap = Math.min(playerRight - enemyLeft + minDistance, enemyRight - playerLeft + minDistance);
                if (player.position.x < enemy.position.x) {
                    player.position.x -= overlap * 0.5;
                    enemy.position.x += overlap * 0.5;
                } else {
                    player.position.x += overlap * 0.5;
                    enemy.position.x -= overlap * 0.5;
                }
            }

            const tc = touchControlsRef.current;
            keys.a.pressed = tc.left;
            keys.d.pressed = tc.right;
            keys.s.pressed = tc.down;
            keys.shift.pressed = tc.block;

            if (tc.up && player.velocity.y === 0 && !player.isCrouching) {
                player.velocity.y = -14;
            }

            if (tc.attack) {
                if (player.isCrouching) {
                    player.attack('thrust');
                } else if (player.isAirborne) {
                    player.attack('heavy_slash');
                } else {
                    player.attack('light_slash');
                }
                tc.attack = false;
            }

            if (tc.heavy) {
                player.attack('heavy_slash');
                tc.heavy = false;
            }

            if (tc.leftSlash && !player.isAirborne) {
                player.attack('left_slash');
                tc.leftSlash = false;
            }

            if (tc.rightSlash) {
                player.attack('right_slash');
                tc.rightSlash = false;
            }

            player.isBlocking = keys.shift.pressed && player.stunFrames === 0 && player.attackState === 'idle';
            player.isCrouching = keys.s.pressed && player.stunFrames === 0 && player.attackState === 'idle';

            let speedMod = (player.isBlocking || player.isCrouching) ? 0.5 : 0.75;

            if (player.stunFrames === 0 && hitStopFrames === 0) {
                player.velocity.x = 0;
                if (keys.a.pressed && player.lastKey === 'a') player.velocity.x = -5.5 * speedMod;
                else if (keys.d.pressed && player.lastKey === 'd') player.velocity.x = 5.5 * speedMod;
            }

            function processHit(attacker, defender, isPlayer) {
                let isHeavy = attacker.attackType === 'heavy_slash' || attacker.attackType === 'thrust';

                let damage = isHeavy ? 11 : 7;
                if (attacker.comboCount >= 3) damage *= 1.2;

                let pushDir = attacker.facingRight ? 1 : -1;
                let outcome = defender.takeHit(damage, pushDir, isHeavy, attacker.attackType);

                hitStopFrames = isHeavy ? 9 : 5;
                if (!outcome.blocked) screenShakeFrames = isHeavy ? 12 : 4;

                let cX = defender.position.x + (pushDir === 1 ? defender.width : 0);
                let sparkColor = outcome.blocked ? '#aaaaaa' : '#ff8844';
                sparks.push(new Spark({ x: cX, y: defender.position.y + 60, color: sparkColor }));

                if (!outcome.blocked && isHeavy) {
                    for (let i = 0; i < 4; i++) {
                        sparks.push(new Spark({
                            x: cX + (Math.random() - 0.5) * 40,
                            y: defender.position.y + 40 + Math.random() * 50,
                            color: '#ff6622'
                        }));
                    }
                }

                let targetEntity = isPlayer ? 'enemyHealth' : 'playerHealth';
                state.setHealth(targetEntity, -outcome.damageTaken);

                if (!outcome.blocked && attacker.comboCount >= 3) {
                    let comboText = '';
                    if (attacker.comboCount >= 7) comboText = 'FURY!';
                    else if (attacker.comboCount >= 6) comboText = 'COMBO x6';
                    else if (attacker.comboCount >= 5) comboText = 'COMBO x5';
                    else if (attacker.comboCount >= 4) comboText = 'COMBO x4';
                    else if (attacker.comboCount >= 3) comboText = 'COMBO x3';

                    if (comboText) {
                        texts.push(new FloatingText({
                            text: comboText,
                            x: attacker.position.x,
                            y: attacker.position.y - 30,
                            color: '#ffaa44'
                        }));
                    }
                }

                if (state[targetEntity] <= 0) {
                    if (isPlayer) state.setGameOver(true, level >= 3 ? 'MASTERSLAYER' : 'VICTORY', level < 3);
                    else state.setGameOver(true, 'DEFEAT');
                    defender.dead = true;
                }
            }

            if (player.isAttacking && !player.attackHasHit && rectangularCollision({ rectangle1: player, rectangle2: enemy })) {
                player.attackHasHit = true;
                processHit(player, enemy, true);
            }

            if (enemy.isAttacking && !enemy.attackHasHit && rectangularCollision({ rectangle1: enemy, rectangle2: player })) {
                enemy.attackHasHit = true;
                processHit(enemy, player, false);
            }

            for (let i = sparks.length - 1; i >= 0; i--) {
                sparks[i].update(ctx);
                if (sparks[i].life <= 0) sparks.splice(i, 1);
            }

            for (let i = texts.length - 1; i >= 0; i--) {
                texts[i].update(ctx);
                if (texts[i].opacity <= 0) texts.splice(i, 1);
            }

            drawVignette();

            if (screenShakeFrames >= 0) ctx.restore();
        }

        animate();

        return () => {
            window.cancelAnimationFrame(animationId);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('resize', updateCanvasSize);
            clearInterval(aiInterval);
        };
    }, [started, useStore.getState().level]);

    const handleTouchStart = useCallback((control) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        touchControlsRef.current[control] = true;
    }, []);

    const handleTouchEnd = useCallback((control) => (e) => {
        e.preventDefault();
        e.stopPropagation();
        touchControlsRef.current[control] = false;
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                style={{ display: 'block', width: '100%', height: '100%', touchAction: 'none' }}
            />
            {isMobile && started && (
                <div className="game-touch-controls visible" style={{ pointerEvents: 'auto' }}>
                    <div className="touch-actions-row2">
                        <button
                            className="touch-action-btn-small left-slash"
                            onTouchStart={handleTouchStart('leftSlash')}
                            onTouchEnd={handleTouchEnd('leftSlash')}
                        >
                            L<br/>LEFT
                        </button>
                        <button
                            className="touch-action-btn-small right-slash"
                            onTouchStart={handleTouchStart('rightSlash')}
                            onTouchEnd={handleTouchEnd('rightSlash')}
                        >
                            I<br/>RIGHT
                        </button>
                    </div>
                    <div className="touch-dpad">
                        <button
                            className="touch-dpad-btn up"
                            onTouchStart={handleTouchStart('up')}
                            onTouchEnd={handleTouchEnd('up')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M18 15l-6-6-6 6"/>
                            </svg>
                        </button>
                        <button
                            className="touch-dpad-btn down"
                            onTouchStart={handleTouchStart('down')}
                            onTouchEnd={handleTouchEnd('down')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>
                        <button
                            className="touch-dpad-btn left"
                            onTouchStart={handleTouchStart('left')}
                            onTouchEnd={handleTouchEnd('left')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </button>
                        <button
                            className="touch-dpad-btn right"
                            onTouchStart={handleTouchStart('right')}
                            onTouchEnd={handleTouchEnd('right')}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    </div>
                    <div className="touch-actions">
                        <button
                            className="touch-action-btn jump"
                            onTouchStart={handleTouchStart('up')}
                            onTouchEnd={handleTouchEnd('up')}
                        >
                            JUMP
                        </button>
                        <button
                            className="touch-action-btn attack"
                            onTouchStart={handleTouchStart('attack')}
                            onTouchEnd={handleTouchEnd('attack')}
                        >
                            J<br/>ATK
                        </button>
                        <button
                            className="touch-action-btn heavy"
                            onTouchStart={handleTouchStart('heavy')}
                            onTouchEnd={handleTouchEnd('heavy')}
                        >
                            K<br/>HEAVY
                        </button>
                        <button
                            className="touch-action-btn block"
                            onTouchStart={handleTouchStart('block')}
                            onTouchEnd={handleTouchEnd('block')}
                        >
                            SHIFT<br/>BLOCK
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
