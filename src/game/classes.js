export class SlashTrail {
    constructor(x, y, angle, length, color = '#ffffff', width = 10) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
        this.color = color;
        this.width = width;
        this.life = 14;
        this.maxLife = 14;
        this.fadeSpeed = 0.07;
    }

    update(ctx) {
        if (this.life <= 0) return;
        
        const alpha = (this.life / this.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha * 0.95;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        const gradient = ctx.createLinearGradient(0, 0, this.length, 0);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(0.15, this.color);
        gradient.addColorStop(0.6, this.color);
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.width * alpha;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(this.length * 0.5, -6 * alpha, this.length, 0);
        ctx.stroke();

        ctx.strokeStyle = `rgba(255,220,180,${alpha * 0.4})`;
        ctx.lineWidth = (this.width + 8) * alpha;
        ctx.stroke();

        ctx.restore();
        this.life -= this.fadeSpeed;
    }
}

export class HitFlash {
    constructor(x, y, width, height, isHeavy = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.life = isHeavy ? 8 : 5;
        this.maxLife = this.life;
        this.isHeavy = isHeavy;
    }

    update(ctx) {
        if (this.life <= 0) return;
        const alpha = (this.life / this.maxLife) * 0.85;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const radius = Math.max(this.width, this.height) * 1.2;
        
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.2, '#ffee88');
        gradient.addColorStop(0.5, '#ffaa44');
        gradient.addColorStop(0.8, '#ff6600');
        gradient.addColorStop(1, 'rgba(255,50,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        this.life--;
    }
}

export class Particle {
    constructor(x, y, color, velocity = null) {
        this.x = x;
        this.y = y;
        if (velocity) {
            this.vx = velocity.vx;
            this.vy = velocity.vy;
        } else {
            this.vx = (Math.random() - 0.5) * 14;
            this.vy = (Math.random() - 0.5) * 14 - 4;
        }
        this.color = color;
        this.life = 18 + Math.random() * 15;
        this.maxLife = this.life;
        this.size = 2.5 + Math.random() * 4.5;
        this.gravity = 0.28;
        this.friction = 0.97;
    }

    update(ctx) {
        this.vx *= this.friction;
        this.vy += this.gravity;
        this.vy *= this.friction;
        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (0.4 + alpha * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export class Fighter {
    constructor({ position, velocity, color = '#1a1a1a', facingRight = true, isPlayer = false }) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.facingRight = facingRight;
        this.isPlayer = isPlayer;
        this.width = 55;
        this.baseHeight = 165;
        this.height = 165;
        this.lastKey = null;

        this.attackBox = {
            position: { x: this.position.x, y: this.position.y },
            width: 100,
            height: 60,
            offset: { x: 55, y: 25 }
        };

        this.attackState = 'idle';
        this.attackFrames = 0;
        this.attackType = 'light_slash';
        this.attackHasHit = false;
        this.comboCount = 0;
        this.comboTimer = 0;

        this.dead = false;
        this.isBlocking = false;
        this.isCrouching = false;
        this.isAirborne = false;

        this.stunFrames = 0;
        this.animTime = 0;
        this.swordAngle = 0;
        this.swordTargetAngle = 0;

        this.slashTrails = [];
        this.hitFlashes = [];
        this.particles = [];

        this.walkCycle = 0;
        this.breathCycle = 0;
        this.idleCycle = 0;
        this.hitRecoil = 0;
        this.fallRotation = 0;
        this.isFalling = false;
        
        this.glowIntensity = 0;
        this.isMoving = false;
        
        this.stanceOffset = 0;
    }

    get isAttacking() {
        return this.attackState === 'active';
    }

    drawSword(ctx, startX, startY, dir, swordAngle, isBlocking, glowIntensity) {
        const swordLength = 80;
        const swordWidth = 5;

        ctx.save();
        ctx.translate(startX, startY);
        
        if (isBlocking) {
            ctx.rotate((-Math.PI / 4) * dir);
        } else {
            ctx.rotate(swordAngle);
        }

        ctx.shadowColor = `rgba(255,200,150,${glowIntensity * 0.3})`;
        ctx.shadowBlur = 8;

        const gradient = ctx.createLinearGradient(0, -swordWidth/2, 0, swordWidth/2);
        gradient.addColorStop(0, '#4a4a4a');
        gradient.addColorStop(0.3, '#2a2a2a');
        gradient.addColorStop(0.7, '#1a1a1a');
        gradient.addColorStop(1, '#0a0a0a');
        
        ctx.fillStyle = '#2a2a2a';
        ctx.beginPath();
        ctx.moveTo(-15, -6);
        ctx.lineTo(-2, -4);
        ctx.lineTo(-2, 4);
        ctx.lineTo(-15, 6);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-2, -swordWidth / 2);
        ctx.lineTo(swordLength - 15, -swordWidth / 2 + 1);
        ctx.lineTo(swordLength, 0);
        ctx.lineTo(swordLength - 15, swordWidth / 2 - 1);
        ctx.lineTo(-2, swordWidth / 2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255,200,150,0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(5, -swordWidth / 2 + 1);
        ctx.lineTo(swordLength - 15, -swordWidth / 2 + 1);
        ctx.stroke();

        ctx.restore();
    }

    draw(ctx) {
        this.animTime += 0.1;
        this.breathCycle += 0.05;
        this.idleCycle += 0.025;

        const dir = this.facingRight ? 1 : -1;
        let pX = this.position.x + this.width / 2;
        let pY = this.position.y + this.height;

        this.isMoving = Math.abs(this.velocity.x) > 0.5 || this.attackState !== 'idle' || this.stunFrames > 0;
        this.glowIntensity += ((this.isMoving ? 1 : 0) - this.glowIntensity) * 0.15;

        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        let breathOffset = Math.sin(this.breathCycle) * 1.5;
        let idleSway = Math.sin(this.idleCycle) * 1.5;
        let weightShift = Math.sin(this.idleCycle * 0.7) * 2;

        let headX = pX;
        let headY = pY - 155 + breathOffset;
        let spineX = pX;
        let spineY = headY + 22;
        let hipX = pX;
        let hipY = pY - 75;

        if (this.hitRecoil > 0) {
            headX -= this.hitRecoil * dir * 0.8;
            spineX -= this.hitRecoil * dir * 0.5;
            hipX -= this.hitRecoil * dir * 0.3;
            this.hitRecoil *= 0.85;
            if (this.hitRecoil < 0.1) this.hitRecoil = 0;
        }

        let fKneeA = 20;
        let fHipA = 95;
        let bKneeA = 15;
        let bHipA = 105;
        let fShoulderA = 55;
        let fElbowA = 80;
        let bShoulderA = 125;
        let bElbowA = 165;

        let frontFootX = 0;
        let backFootX = 0;
        let frontFootSpread = 18;
        let backFootSpread = -15;
        let bodyLean = -3;

        if (this.dead || this.isFalling) {
            this.fallRotation += 0.1;
            if (this.fallRotation > Math.PI / 2) this.fallRotation = Math.PI / 2;
            
            headY = hipY + 60;
            headX = pX - dir * (40 + Math.sin(this.fallRotation) * 20);
            spineX = pX - dir * 25;
            spineY = hipY + 35;
            fShoulderA = -20;
            fElbowA = 30;
            bShoulderA = 20;
            bElbowA = 50;
            fHipA = 20;
            fKneeA = 40;
            bHipA = 160;
            bKneeA = 20;
            this.swordAngle = -Math.PI / 3 * dir;
            frontFootSpread = 0;
            backFootSpread = 0;
            
        } else if (this.stunFrames > 0) {
            let stunIntensity = this.stunFrames / 30;
            headX = pX - dir * 15 * stunIntensity;
            headY = pY - 148 - stunIntensity * 3;
            spineX = pX - dir * 8 * stunIntensity;
            
            fShoulderA = 160 - stunIntensity * 30;
            fElbowA = 170;
            bShoulderA = 155;
            bElbowA = 170;
            fHipA = 70;
            fKneeA = 20;
            bHipA = 115;
            bKneeA = 12;
            
            this.swordAngle = (Math.PI / 4 + stunIntensity * 0.3) * dir;
            this.glowIntensity = 0.6;
            
        } else if (this.isCrouching) {
            hipY += 50;
            headY += 48;
            spineY += 42;
            
            fHipA = -20;
            fKneeA = 130;
            bHipA = 160;
            bKneeA = -95;
            fShoulderA = 65;
            fElbowA = 45;
            frontFootSpread = 12;
            backFootSpread = -12;
            bodyLean = 0;
            
            if (this.attackType === 'thrust' && this.attackState === 'active') {
                fHipA = -50;
                fKneeA = 155;
                fShoulderA = 85;
                fElbowA = 5;
                spineX += dir * 12;
                headX += dir * 8;
            }
            
            this.swordAngle = (Math.PI / 5) * dir;
            
        } else if (this.isBlocking) {
            fShoulderA = -25;
            fElbowA = -45;
            bShoulderA = 25;
            bElbowA = -35;
            frontFootSpread = 22;
            backFootSpread = -20;
            bodyLean = 5;
            
            this.swordAngle = (-Math.PI / 5) * dir;
            
        } else if (this.attackState !== 'idle') {
            this.renderAttackPose(pX, pY, dir, breathOffset, weightShift);
            headX = this.animHeadX || headX;
            headY = this.animHeadY || headY;
            spineX = this.animSpineX || spineX;
            spineY = this.animSpineY || spineY;
            hipX = this.animHipX || hipX;
            hipY = this.animHipY || hipY;
            fShoulderA = this.animFShoulderA;
            fElbowA = this.animFElbowA;
            bShoulderA = this.animBShoulderA;
            bElbowA = this.animBElbowA;
            fHipA = this.animFHipA;
            fKneeA = this.animFKneeA;
            bHipA = this.animBHipA;
            bKneeA = this.animBKneeA;
            this.swordAngle = this.animSwordAngle;
            this.glowIntensity = 0.9;
            frontFootX = this.animFrontFootX || 0;
            backFootX = this.animBackFootX || 0;
            frontFootSpread = this.animFrontFootSpread || 18;
            backFootSpread = this.animBackFootSpread || -15;
            
        } else if (Math.abs(this.velocity.x) > 0.5) {
            this.walkCycle += 0.18;
            let walkSin = Math.sin(this.walkCycle);
            let walkCos = Math.cos(this.walkCycle);
            
            fHipA = 95 + walkSin * 45;
            fKneeA = walkSin > 0 ? walkSin * 55 : 10;
            bHipA = 105 - walkSin * 45;
            bKneeA = walkSin < 0 ? -walkSin * 55 : 8;
            
            fShoulderA = 55 + walkSin * 30;
            bShoulderA = 125 - walkSin * 30;
            fElbowA = 80 + walkSin * 15;
            bElbowA = 165 - walkSin * 15;
            
            frontFootX = walkSin * 12;
            backFootX = -walkSin * 12;
            frontFootSpread = 18 + Math.abs(walkSin) * 8;
            backFootSpread = -15 - Math.abs(walkSin) * 5;
            bodyLean = -5 + walkSin * 3;
            
            hipX += walkSin * 4 * dir;
            headX += walkSin * 2 * dir;
            spineX += walkSin * 3 * dir;
            
            this.swordAngle = (Math.PI / 4 + walkSin * 0.25) * dir;
            this.glowIntensity = 0.5;
            
        } else {
            this.swordAngle += ((Math.PI / 4.5) * dir - this.swordAngle) * 0.08;
            this.glowIntensity *= 0.92;
            
            fShoulderA = 55 + idleSway;
            bShoulderA = 125 - idleSway;
            fElbowA = 80 + idleSway * 0.5;
            bElbowA = 165 - idleSway * 0.5;
            
            frontFootX = weightShift * 0.5;
            backFootX = -weightShift * 0.5;
            bodyLean = -3 + weightShift * 0.3;
            
            hipX += weightShift * 0.3 * dir;
            headX += weightShift * 0.2 * dir;
        }

        let bodyBob = Math.sin(this.breathCycle) * 0.5;
        headY += bodyBob;
        hipY += bodyBob * 0.5;
        spineY += bodyBob * 0.3;

        hipX += bodyLean * dir;
        spineX += (bodyLean + 2) * dir;
        headX += (bodyLean + 1) * dir;

        const drawLimb = (startX, startY, angleDeg, length, thickness, secAngle = 0) => {
            const angleRad = angleDeg * (Math.PI / 180);
            const endX = startX + dir * length * Math.sin(angleRad);
            const endY = startY + length * Math.cos(angleRad);

            const limbGradient = ctx.createLinearGradient(startX, startY, endX, endY);
            limbGradient.addColorStop(0, '#2a2a2a');
            limbGradient.addColorStop(0.5, '#1a1a1a');
            limbGradient.addColorStop(1, '#151515');
            
            ctx.strokeStyle = limbGradient;
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            if (secAngle !== null) {
                const secRad = secAngle * (Math.PI / 180);
                const jEndX = endX + dir * length * 0.75 * Math.sin(secRad);
                const jEndY = endY + length * 0.75 * Math.cos(secRad);
                
                const limbGradient2 = ctx.createLinearGradient(endX, endY, jEndX, jEndY);
                limbGradient2.addColorStop(0, '#2a2a2a');
                limbGradient2.addColorStop(1, '#181818');
                
                ctx.strokeStyle = limbGradient2;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(jEndX, jEndY);
                ctx.stroke();
            }
            return { endX, endY };
        };

        const drawFoot = (startX, startY, angleDeg, length, footXOffset, spread) => {
            const angleRad = angleDeg * (Math.PI / 180);
            const footX = startX + footXOffset + dir * length * Math.sin(angleRad) + spread * (this.facingRight ? 1 : -1);
            const footY = startY + length * Math.cos(angleRad);
            
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX + footXOffset, startY);
            ctx.lineTo(footX, footY);
            ctx.stroke();
            
            return { x: footX, y: footY };
        };

        ctx.shadowColor = `rgba(255,200,150,${this.glowIntensity * 0.25})`;
        ctx.shadowBlur = 10 + this.glowIntensity * 8;

        const bArm = drawLimb(spineX - dir * 3, spineY, bShoulderA, 23, 9, bElbowA);
        const bLeg = drawLimb(hipX + backFootX, hipY, bHipA, 30, 12, bKneeA);
        const bFoot = drawFoot(hipX + backFootX, hipY + 30, bHipA + bKneeA, 20, backFootX, backFootSpread * 0.4);

        const bodyGradient = ctx.createLinearGradient(hipX, hipY, spineX, headY + 15);
        bodyGradient.addColorStop(0, '#2a2a2a');
        bodyGradient.addColorStop(0.5, '#1f1f1f');
        bodyGradient.addColorStop(1, '#1a1a1a');
        
        ctx.lineWidth = 19;
        ctx.lineCap = 'round';
        ctx.strokeStyle = bodyGradient;
        ctx.beginPath();
        ctx.moveTo(hipX + (frontFootX + backFootX) * 0.5, hipY);
        ctx.lineTo(spineX, spineY);
        ctx.lineTo(headX, headY + 14);
        ctx.stroke();

        const headGradient = ctx.createRadialGradient(headX - 3, headY - 3, 0, headX, headY, 14);
        headGradient.addColorStop(0, '#2a2a2a');
        headGradient.addColorStop(0.7, '#1a1a1a');
        headGradient.addColorStop(1, '#151515');
        
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.arc(headX, headY, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        const fArm = drawLimb(spineX + dir * 3, spineY + 3, fShoulderA, 23, 10, fElbowA);
        const fLeg = drawLimb(hipX + frontFootX, hipY, fHipA, 30, 13, fKneeA);
        const fFoot = drawFoot(hipX + frontFootX, hipY + 30, fHipA + fKneeA, 20, frontFootX, frontFootSpread);

        this.drawSword(ctx, fArm.endX + dir * 6, fArm.endY, dir, this.swordAngle, this.isBlocking, this.glowIntensity);

        ctx.strokeStyle = `rgba(255,220,180,${this.glowIntensity * 0.5})`;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(headX, headY, 15, 0, Math.PI * 2);
        ctx.stroke();

        for (let i = this.slashTrails.length - 1; i >= 0; i--) {
            this.slashTrails[i].update(ctx);
            if (this.slashTrails[i].life <= 0) this.slashTrails.splice(i, 1);
        }

        for (let i = this.hitFlashes.length - 1; i >= 0; i--) {
            this.hitFlashes[i].update(ctx);
            if (this.hitFlashes[i].life <= 0) this.hitFlashes.splice(i, 1);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(ctx);
            if (this.particles[i].life <= 0) this.particles.splice(i, 1);
        }
    }

    renderAttackPose(pX, pY, dir, breathOffset, weightShift) {
        let progress, swingCurve;

        if (this.attackType === 'light_slash') {
            let windup = 5, active = 8, recovery = 10;
            
            if (this.attackState === 'windup') {
                progress = this.attackFrames / windup;
                this.animFShoulderA = 125 + progress * 45;
                this.animFElbowA = 35 + progress * 35;
                this.animBShoulderA = 115;
                this.animBElbowA = 155;
                this.animFHipA = 100 + progress * 15;
                this.animFKneeA = 18;
                this.animBHipA = 110;
                this.animBKneeA = 12;
                this.animHipX = pX - dir * progress * 10;
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * 14;
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX - dir * progress * 3;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 2.5 + progress * 0.35) * dir;
                this.animFrontFootX = progress * 8;
                this.animBackFootX = -progress * 5;
                this.animFrontFootSpread = 18 + progress * 10;
                this.animBackFootSpread = -15 - progress * 5;
                
            } else if (this.attackState === 'active') {
                progress = (this.attackFrames - windup) / active;
                swingCurve = Math.sin(progress * Math.PI);
                this.animFShoulderA = 170 - progress * 145;
                this.animFElbowA = 70 - progress * 75;
                this.animBShoulderA = 115 + progress * 35;
                this.animBElbowA = 155 - progress * 35;
                this.animFHipA = 115 - progress * 50;
                this.animFKneeA = 18 + swingCurve * 25;
                this.animBHipA = 110 - progress * 25;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * (2 - progress * 22);
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * (14 - progress * 12);
                this.animSpineY = this.animHipY + 62 - swingCurve * 4;
                this.animHeadX = this.animSpineX + dir * swingCurve * 10;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 3 - progress * Math.PI / 1.2) * dir;
                this.animFrontFootX = 8 - progress * 15;
                this.animBackFootX = -5 + progress * 10;
                this.animFrontFootSpread = 28 - progress * 12;
                this.animBackFootSpread = -20 + progress * 10;
                
                if (this.attackFrames % 3 === 0 && progress > 0.15 && progress < 0.9) {
                    this.slashTrails.push(new SlashTrail(
                        pX + dir * 50, pY - 115,
                        -Math.PI / 6 * dir - progress * 0.4,
                        50 + swingCurve * 25,
                        '#ffffff', 10
                    ));
                }
                
            } else {
                progress = (this.attackFrames - windup - active) / recovery;
                this.animFShoulderA = 25 + progress * 30;
                this.animFElbowA = -5 + progress * 45;
                this.animBShoulderA = 150 - progress * 25;
                this.animBElbowA = 120 + progress * 25;
                this.animFHipA = 65 + progress * 30;
                this.animFKneeA = 43 - progress * 23;
                this.animBHipA = 85 + progress * 10;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * (-20 + progress * 15);
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * (2 + progress * 8);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX + dir * (10 - progress * 6);
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (-Math.PI / 4 + progress * 0.8) * dir;
                this.animFrontFootX = -7 + progress * 8;
                this.animBackFootX = 5 - progress * 5;
                this.animFrontFootSpread = 16 + progress * 5;
                this.animBackFootSpread = -10 + progress * 5;
            }

        } else if (this.attackType === 'heavy_slash') {
            let windup = 10, active = 14, recovery = 16;
            
            if (this.attackState === 'windup') {
                progress = this.attackFrames / windup;
                let easeOut = 1 - Math.pow(1 - progress, 3);
                this.animFShoulderA = 145 + easeOut * 35;
                this.animFElbowA = 45 + easeOut * 35;
                this.animBShoulderA = 138;
                this.animBElbowA = 158;
                this.animFHipA = 105 + easeOut * 25;
                this.animFKneeA = 28 + easeOut * 22;
                this.animBHipA = 112;
                this.animBKneeA = 15;
                this.animHipX = pX - dir * easeOut * 15;
                this.animHipY = pY - 75 - easeOut * 10;
                this.animSpineX = this.animHipX + dir * (14 - easeOut * 6);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX - dir * easeOut * 6;
                this.animHeadY = this.animSpineY - 62 + breathOffset - easeOut * 4;
                this.animSwordAngle = (Math.PI * 0.75 + easeOut * 0.2) * dir;
                this.animFrontFootX = -easeOut * 10;
                this.animBackFootX = easeOut * 8;
                this.animFrontFootSpread = 18 + easeOut * 15;
                this.animBackFootSpread = -15 - easeOut * 8;
                
            } else if (this.attackState === 'active') {
                progress = (this.attackFrames - windup) / active;
                swingCurve = Math.sin(progress * Math.PI);
                let powerCurve = Math.pow(progress, 0.7);
                this.animFShoulderA = 180 - powerCurve * 170;
                this.animFElbowA = 80 - powerCurve * 95;
                this.animBShoulderA = 138 - powerCurve * 45;
                this.animBElbowA = 158 - powerCurve * 55;
                this.animFHipA = 130 - powerCurve * 70;
                this.animFKneeA = 50 + swingCurve * 35;
                this.animBHipA = 112 - powerCurve * 35;
                this.animBKneeA = 15;
                this.animHipX = pX + dir * (5 + powerCurve * 30);
                this.animHipY = pY - 75 - powerCurve * 15;
                this.animSpineX = this.animHipX + dir * (8 + powerCurve * 18);
                this.animSpineY = this.animHipY + 62 - powerCurve * 10;
                this.animHeadX = this.animSpineX + dir * powerCurve * 15;
                this.animHeadY = this.animSpineY - 62 + breathOffset - powerCurve * 6;
                this.animSwordAngle = (-Math.PI / 3 - powerCurve * Math.PI / 2) * dir;
                this.animFrontFootX = -10 + powerCurve * 30;
                this.animBackFootX = 8 - powerCurve * 18;
                this.animFrontFootSpread = 33 - powerCurve * 18;
                this.animBackFootSpread = -23 + powerCurve * 15;
                
                if (this.attackFrames % 2 === 0 && progress > 0.1 && progress < 0.9) {
                    this.slashTrails.push(new SlashTrail(
                        pX + dir * 55, pY - 105 - progress * 30,
                        -Math.PI / 5 * dir - progress * 0.5,
                        60 + swingCurve * 40,
                        '#ffffff', 14
                    ));
                }
                
            } else {
                progress = (this.attackFrames - windup - active) / recovery;
                this.animFShoulderA = 10 + progress * 45;
                this.animFElbowA = -15 + progress * 55;
                this.animBShoulderA = 93 + progress * 35;
                this.animBElbowA = 103 + progress * 35;
                this.animFHipA = 60 + progress * 35;
                this.animFKneeA = 15 - progress * 5;
                this.animBHipA = 77 + progress * 18;
                this.animBKneeA = 15;
                this.animHipX = pX + dir * (35 - progress * 28);
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * (26 - progress * 18);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX + dir * (15 - progress * 10);
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (-Math.PI * 0.8 + progress * 0.9) * dir;
                this.animFrontFootX = 20 - progress * 15;
                this.animBackFootX = -10 + progress * 8;
                this.animFrontFootSpread = 15 + progress * 5;
                this.animBackFootSpread = -8 + progress * 5;
            }

        } else if (this.attackType === 'left_slash') {
            let windup = 7, active = 10, recovery = 12;
            
            if (this.attackState === 'windup') {
                progress = this.attackFrames / windup;
                this.animFShoulderA = 45 + progress * 85;
                this.animFElbowA = -35 + progress * 75;
                this.animBShoulderA = 35;
                this.animBElbowA = 55;
                this.animFHipA = 80;
                this.animFKneeA = 18;
                this.animBHipA = 108;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * progress * 6;
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * 14;
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX + dir * progress * 6;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (-Math.PI / 3.5) * dir;
                this.animFrontFootX = progress * 5;
                this.animBackFootX = -progress * 4;
                this.animFrontFootSpread = 15;
                this.animBackFootSpread = -12;
                
            } else if (this.attackState === 'active') {
                progress = (this.attackFrames - windup) / active;
                swingCurve = Math.sin(progress * Math.PI);
                this.animFShoulderA = 130 - progress * 105;
                this.animFElbowA = 40 - progress * 65;
                this.animBShoulderA = 35 + progress * 35;
                this.animBElbowA = 55 + progress * 45;
                this.animFHipA = 80 + progress * 35;
                this.animFKneeA = 18;
                this.animBHipA = 108 - progress * 18;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * (6 - progress * 18);
                this.animHipY = pY - 75 - swingCurve * 6;
                this.animSpineX = this.animHipX + dir * (14 - progress * 6);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX - dir * swingCurve * 6;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 5 - progress * 0.8) * dir;
                this.animFrontFootX = 5 - progress * 12;
                this.animBackFootX = -4 + progress * 8;
                this.animFrontFootSpread = 15 - progress * 5;
                this.animBackFootSpread = -12 + progress * 5;
                
                if (this.attackFrames % 3 === 0) {
                    this.slashTrails.push(new SlashTrail(
                        pX + dir * 45, pY - 95,
                        Math.PI / 4 * dir - progress * 0.3,
                        45,
                        '#ffffff', 9
                    ));
                }
                
            } else {
                progress = (this.attackFrames - windup - active) / recovery;
                this.animFShoulderA = 25 + progress * 30;
                this.animFElbowA = -25 + progress * 55;
                this.animBShoulderA = 70 + progress * 22;
                this.animBElbowA = 100 + progress * 22;
                this.animFHipA = 115 - progress * 18;
                this.animFKneeA = 18;
                this.animBHipA = 90 + progress * 8;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * (-12 + progress * 10);
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * (8 + progress * 6);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (-Math.PI / 6 + progress * 0.4) * dir;
                this.animFrontFootX = -7 + progress * 8;
                this.animBackFootX = 4 - progress * 4;
                this.animFrontFootSpread = 10 + progress * 5;
                this.animBackFootSpread = -7 + progress * 4;
            }

        } else if (this.attackType === 'right_slash') {
            let windup = 7, active = 10, recovery = 12;
            
            if (this.attackState === 'windup') {
                progress = this.attackFrames / windup;
                this.animFShoulderA = 158 - progress * 48;
                this.animFElbowA = 48 + progress * 35;
                this.animBShoulderA = 138;
                this.animBElbowA = 153;
                this.animFHipA = 95;
                this.animFKneeA = 18;
                this.animBHipA = 105;
                this.animBKneeA = 12;
                this.animHipX = pX - dir * progress * 10;
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * 14;
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX - dir * progress * 6;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 2.5 + progress * 0.3) * dir;
                this.animFrontFootX = -progress * 8;
                this.animBackFootX = progress * 6;
                this.animFrontFootSpread = 18;
                this.animBackFootSpread = -15;
                
            } else if (this.attackState === 'active') {
                progress = (this.attackFrames - windup) / active;
                swingCurve = Math.sin(progress * Math.PI);
                this.animFShoulderA = 110 - progress * 115;
                this.animFElbowA = 83 - progress * 85;
                this.animBShoulderA = 138 - progress * 35;
                this.animBElbowA = 153 - progress * 45;
                this.animFHipA = 95 + progress * 35;
                this.animFKneeA = 18;
                this.animBHipA = 105 - progress * 18;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * (-10 + progress * 22);
                this.animHipY = pY - 75 - swingCurve * 6;
                this.animSpineX = this.animHipX + dir * (14 + progress * 6);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX + dir * swingCurve * 6;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 3.5 - progress * 0.9) * dir;
                this.animFrontFootX = -8 + progress * 15;
                this.animBackFootX = 6 - progress * 10;
                this.animFrontFootSpread = 18 - progress * 5;
                this.animBackFootSpread = -15 + progress * 5;
                
                if (this.attackFrames % 3 === 0) {
                    this.slashTrails.push(new SlashTrail(
                        pX + dir * 50, pY - 100,
                        -Math.PI / 4 * dir,
                        50,
                        '#ffffff', 10
                    ));
                }
                
            } else {
                progress = (this.attackFrames - windup - active) / recovery;
                this.animFShoulderA = -5 + progress * 42;
                this.animFElbowA = -2 + progress * 45;
                this.animBShoulderA = 103 + progress * 25;
                this.animBElbowA = 108 + progress * 28;
                this.animFHipA = 130 - progress * 18;
                this.animFKneeA = 18;
                this.animBHipA = 87 + progress * 12;
                this.animBKneeA = 12;
                this.animHipX = pX + dir * (12 - progress * 12);
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * (20 - progress * 12);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (-Math.PI / 6 + progress * 0.6) * dir;
                this.animFrontFootX = 7 - progress * 8;
                this.animBackFootX = -4 + progress * 4;
                this.animFrontFootSpread = 13 + progress * 5;
                this.animBackFootSpread = -10 + progress * 5;
            }

        } else if (this.attackType === 'thrust') {
            let windup = 6, active = 10, recovery = 12;
            
            if (this.attackState === 'windup') {
                progress = this.attackFrames / windup;
                let easeIn = Math.pow(progress, 2);
                this.animFShoulderA = 90 + easeIn * 65;
                this.animFElbowA = -8 + easeIn * 35;
                this.animBShoulderA = 118;
                this.animBElbowA = 148;
                this.animFHipA = 95 + easeIn * 25;
                this.animFKneeA = 25 + easeIn * 35;
                this.animBHipA = 112 - easeIn * 22;
                this.animBKneeA = 15;
                this.animHipX = pX - dir * easeIn * 18;
                this.animHipY = pY - 75 + easeIn * 18;
                this.animSpineX = this.animHipX + dir * (14 + easeIn * 6);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX + dir * easeIn * 10;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 4 + easeIn * 0.4) * dir;
                this.animFrontFootX = -easeIn * 15;
                this.animBackFootX = easeIn * 12;
                this.animFrontFootSpread = 18 + easeIn * 12;
                this.animBackFootSpread = -15 - easeIn * 8;
                
            } else if (this.attackState === 'active') {
                progress = (this.attackFrames - windup) / active;
                let thrustPower = Math.sin(progress * Math.PI / 2);
                this.animFShoulderA = 155 - thrustPower * 100;
                this.animFElbowA = 27 - thrustPower * 45;
                this.animBShoulderA = 118 - thrustPower * 35;
                this.animBElbowA = 148 - thrustPower * 48;
                this.animFHipA = 120 - thrustPower * 60;
                this.animFKneeA = 60 - thrustPower * 42;
                this.animBHipA = 90 - thrustPower * 25;
                this.animBKneeA = 15;
                this.animHipX = pX + dir * (-18 + thrustPower * 42);
                this.animHipY = pY - 75 + (1 - thrustPower) * 18;
                this.animSpineX = this.animHipX + dir * (20 + thrustPower * 12);
                this.animSpineY = this.animHipY + 62 - thrustPower * 6;
                this.animHeadX = this.animSpineX + dir * thrustPower * 15;
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (Math.PI / 2 - thrustPower * 1.3) * dir;
                this.animFrontFootX = -15 + thrustPower * 35;
                this.animBackFootX = 12 - thrustPower * 22;
                this.animFrontFootSpread = 30 - thrustPower * 15;
                this.animBackFootSpread = -23 + thrustPower * 15;
                
            } else {
                progress = (this.attackFrames - windup - active) / recovery;
                this.animFShoulderA = 55 + progress * 30;
                this.animFElbowA = -18 + progress * 45;
                this.animBShoulderA = 83 + progress * 25;
                this.animBElbowA = 100 + progress * 35;
                this.animFHipA = 60 + progress * 32;
                this.animFKneeA = 18 - progress * 5;
                this.animBHipA = 65 + progress * 25;
                this.animBKneeA = 15;
                this.animHipX = pX + dir * (24 - progress * 20);
                this.animHipY = pY - 75;
                this.animSpineX = this.animHipX + dir * (32 - progress * 18);
                this.animSpineY = this.animHipY + 62;
                this.animHeadX = this.animSpineX + dir * (15 - progress * 10);
                this.animHeadY = this.animSpineY - 62 + breathOffset;
                this.animSwordAngle = (-Math.PI / 4 + progress * 0.6) * dir;
                this.animFrontFootX = 20 - progress * 15;
                this.animBackFootX = -10 + progress * 8;
                this.animFrontFootSpread = 15 + progress * 5;
                this.animBackFootSpread = -8 + progress * 5;
            }
        }
    }

    update(ctx, canvasHeight, gravity) {
        if (!this.dead) {
            this.height = this.isCrouching ? this.baseHeight * 0.65 : this.baseHeight;
            let currentY = this.position.y + (this.baseHeight - this.height);

            this.attackBox.offset.x = this.facingRight ? 55 : -(this.attackBox.width);
            this.attackBox.position.x = this.position.x + this.attackBox.offset.x;
            this.attackBox.position.y = currentY + this.attackBox.offset.y;

            this.isAirborne = this.position.y + this.baseHeight < canvasHeight - 50;

            if (this.comboTimer > 0) {
                this.comboTimer--;
                if (this.comboTimer === 0) this.comboCount = 0;
            }

            if (this.stunFrames > 0) {
                this.stunFrames--;
                this.velocity.x *= 0.8;
                if (this.stunFrames === 0) this.velocity.x = 0;
            } else if (this.attackState !== 'idle') {
                this.attackFrames++;

                let frameData = {
                    light_slash: { windup: 5, active: 8, recovery: 10 },
                    heavy_slash: { windup: 10, active: 14, recovery: 16 },
                    left_slash: { windup: 7, active: 10, recovery: 12 },
                    right_slash: { windup: 7, active: 10, recovery: 12 },
                    thrust: { windup: 6, active: 10, recovery: 12 }
                };

                let data = frameData[this.attackType] || frameData.light_slash;
                let wLimit = data.windup;
                let aLimit = wLimit + data.active;
                let rLimit = aLimit + data.recovery;

                if (this.attackFrames <= wLimit) {
                    this.attackState = 'windup';
                } else if (this.attackFrames <= aLimit) {
                    this.attackState = 'active';
                } else if (this.attackFrames <= rLimit) {
                    this.attackState = 'recovery';
                } else {
                    this.attackState = 'idle';
                }
            }

            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;

            if (this.position.y + this.baseHeight + this.velocity.y >= canvasHeight - 50) {
                this.velocity.y = 0;
                this.position.y = canvasHeight - 50 - this.baseHeight;
            } else {
                this.velocity.y += gravity;
            }
        }
        this.draw(ctx);
    }

    takeHit(damage, knockbackDirection, isHeavy = false, attackType = 'light_slash') {
        if (this.isBlocking) {
            this.velocity.x = knockbackDirection * 3;
            this.hitRecoil = 3;
            return { damageTaken: damage * 0.1, blocked: true };
        } else {
            let stunDuration, knockbackForce;
            if (isHeavy) {
                stunDuration = attackType === 'heavy_slash' ? 32 : 26;
                knockbackForce = 18;
            } else {
                stunDuration = 15;
                knockbackForce = 10;
            }

            this.stunFrames = stunDuration;
            this.velocity.x = knockbackDirection * knockbackForce;
            this.velocity.y = -3;
            this.attackState = 'idle';
            this.attackHasHit = false;
            this.hitRecoil = isHeavy ? 15 : 8;
            this.glowIntensity = 1.2;

            this.hitFlashes.push(new HitFlash(
                this.position.x, this.position.y,
                this.width, this.baseHeight, isHeavy
            ));

            let particleCount = isHeavy ? 14 : 8;
            for (let i = 0; i < particleCount; i++) {
                let pVel = {
                    vx: -knockbackDirection * (4 + Math.random() * 8),
                    vy: (Math.random() - 0.5) * 12 - 3
                };
                this.particles.push(new Particle(
                    this.position.x + this.width / 2 + (Math.random() - 0.5) * 30,
                    this.position.y + 50 + Math.random() * 60,
                    isHeavy ? '#ff7733' : '#999999',
                    pVel
                ));
            }

            return { damageTaken: damage, blocked: false };
        }
    }

    attack(type) {
        if (this.dead || this.isBlocking || this.stunFrames > 0) return false;
        if (this.attackState === 'active' || this.attackState === 'windup') return false;

        this.attackState = 'windup';
        this.attackFrames = 0;
        this.attackHasHit = false;
        this.attackType = type;
        this.comboCount++;
        this.comboTimer = 45;

        let hitboxConfig = {
            light_slash: { width: 90, height: 50, offsetY: 25 },
            heavy_slash: { width: 115, height: 60, offsetY: 20 },
            left_slash: { width: 85, height: 55, offsetY: 28 },
            right_slash: { width: 85, height: 55, offsetY: 25 },
            thrust: { width: 100, height: 40, offsetY: 35 }
        };

        let config = hitboxConfig[type] || hitboxConfig.light_slash;
        this.attackBox.width = config.width;
        this.attackBox.height = config.height;
        this.attackBox.offset.y = config.offsetY;

        return true;
    }
}

export class Spark {
    constructor({ x, y, color }) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.life = 22;
        this.shards = Array.from({ length: 18 }, () => ({
            vx: (Math.random() - 0.5) * 28,
            vy: (Math.random() - 0.5) * 28 - 5,
            x: 0,
            y: 0,
            size: 3 + Math.random() * 6
        }));
    }

    update(ctx) {
        ctx.fillStyle = this.color;
        this.shards.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            s.vy += 0.6;
            const alpha = this.life / 22;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x + s.x, this.y + s.y, s.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        this.life--;
    }
}

export class FloatingText {
    constructor({ text, x, y, color }) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = color;
        this.opacity = 1;
        this.velocity = -1.5;
        this.scale = 0;
        this.targetScale = 1;
    }

    update(ctx) {
        this.y += this.velocity;
        this.opacity -= 0.018;
        this.scale += (this.targetScale - this.scale) * 0.2;

        if (this.opacity <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, this.opacity);
        ctx.translate(this.x, this.y);
        ctx.scale(this.scale, this.scale);
        ctx.fillStyle = this.color;
        ctx.font = 'bold 38px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 10;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}
