class WebAudioEngine {
    constructor() {
        this.ctx = null;
    }

    init() {
        // Needs user interaction to start context legally
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playWhoosh() {
        try {
            if (!this.ctx) this.init();
            const bufferSize = this.ctx.sampleRate * 0.2; // 200ms
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate white noise for the swing motion
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noiseNode = this.ctx.createBufferSource();
            noiseNode.buffer = buffer;

            // Sweeping Bandpass filter to replicate moving air 'whoosh'
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(600, this.ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.1);
            
            const gainNode = this.ctx.createGain();
            gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

            noiseNode.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            noiseNode.start();
        } catch(e){} // Catch strict browser audio locks gracefully
    }

    playImpact(heavy = false) {
        try {
            if (!this.ctx) this.init();
            
            // Hard physical thud using dual oscillators
            const osc = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            osc.type = heavy ? 'square' : 'triangle';
            osc.frequency.setValueAtTime(150, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.1);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(100, this.ctx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(heavy ? 1.0 : 0.6, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

            osc.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(this.ctx.destination);
            
            osc.start(); osc2.start();
            osc.stop(this.ctx.currentTime + 0.2);
            osc2.stop(this.ctx.currentTime + 0.2);
        } catch(e){}
    }
}

export const combatAudio = new WebAudioEngine();
