class GameAudio {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.gain.value = 0.7;
        this.masterVolume.connect(this.audioContext.destination);
        
        this.musicVolume = this.audioContext.createGain();
        this.musicVolume.gain.value = 0.5;
        this.musicVolume.connect(this.masterVolume);
        
        this.sfxVolume = this.audioContext.createGain();
        this.sfxVolume.gain.value = 0.8;
        this.sfxVolume.connect(this.masterVolume);
        
        this.musicNodes = [];
        this.isPlaying = false;
    }
    
    playNote(frequency, duration, volume = 0.3, type = 'square', destination = this.sfxVolume) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = volume;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return oscillator;
    }
    
    playShoot() {
        this.playNote(800, 0.05, 0.3, 'square');
        this.playNote(600, 0.1, 0.2, 'square');
    }
    
    playExplosion() {
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.2, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() - 0.5) * 2;
        }
        
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.2);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.4;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxVolume);
        
        noise.start();
        
        this.playNote(150, 0.1, 0.4, 'sine');
        this.playNote(100, 0.15, 0.3, 'sine');
    }
    
    playPlayerHit() {
        this.playNote(200, 0.1, 0.5, 'sawtooth');
        this.playNote(150, 0.15, 0.4, 'sawtooth');
        this.playNote(100, 0.2, 0.3, 'sawtooth');
        
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.3, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() - 0.5) * 2;
        }
        
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1000;
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 0.2;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.sfxVolume);
        
        noise.start();
    }
    
    playGameOver() {
        const notes = [440, 415, 392, 370, 349, 330, 311, 294, 277, 262];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.3, 0.3, 'triangle');
            }, i * 100);
        });
    }
    
    playHighScore() {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playNote(freq, 0.2, 0.4, 'sine');
                this.playNote(freq * 0.5, 0.2, 0.2, 'triangle');
            }, i * 150);
        });
        
        setTimeout(() => {
            this.playNote(1318.51, 0.5, 0.5, 'sine');
            this.playNote(659.25, 0.5, 0.3, 'triangle');
            this.playNote(329.63, 0.5, 0.2, 'square');
        }, 600);
    }
    
    startMusic() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        
        const bassPattern = [
            { note: 110, duration: 0.5 },
            { note: 110, duration: 0.5 },
            { note: 138.59, duration: 0.5 },
            { note: 138.59, duration: 0.5 },
            { note: 146.83, duration: 0.5 },
            { note: 146.83, duration: 0.5 },
            { note: 110, duration: 0.5 },
            { note: 110, duration: 0.5 }
        ];
        
        const melodyPattern = [
            { note: 440, duration: 0.25 },
            { note: 0, duration: 0.25 },
            { note: 440, duration: 0.25 },
            { note: 554.37, duration: 0.25 },
            { note: 659.25, duration: 0.5 },
            { note: 554.37, duration: 0.5 },
            { note: 440, duration: 0.25 },
            { note: 0, duration: 0.25 },
            { note: 440, duration: 0.25 },
            { note: 369.99, duration: 0.25 },
            { note: 440, duration: 0.5 },
            { note: 0, duration: 0.5 }
        ];
        
        const arpPattern = [
            { note: 880, duration: 0.125 },
            { note: 1108.73, duration: 0.125 },
            { note: 1318.51, duration: 0.125 },
            { note: 1108.73, duration: 0.125 }
        ];
        
        let bassIndex = 0;
        let melodyIndex = 0;
        let arpIndex = 0;
        let nextBassTime = this.audioContext.currentTime;
        let nextMelodyTime = this.audioContext.currentTime;
        let nextArpTime = this.audioContext.currentTime + 4;
        
        const scheduleBass = () => {
            if (!this.isPlaying) return;
            
            while (nextBassTime < this.audioContext.currentTime + 0.1) {
                const { note, duration } = bassPattern[bassIndex];
                if (note > 0) {
                    const osc = this.playNote(note, duration * 0.9, 0.2, 'triangle', this.musicVolume);
                    this.musicNodes.push(osc);
                }
                nextBassTime += duration;
                bassIndex = (bassIndex + 1) % bassPattern.length;
            }
            setTimeout(scheduleBass, 50);
        };
        
        const scheduleMelody = () => {
            if (!this.isPlaying) return;
            
            while (nextMelodyTime < this.audioContext.currentTime + 0.1) {
                const { note, duration } = melodyPattern[melodyIndex];
                if (note > 0) {
                    const osc = this.playNote(note, duration * 0.9, 0.15, 'square', this.musicVolume);
                    this.musicNodes.push(osc);
                }
                nextMelodyTime += duration;
                melodyIndex = (melodyIndex + 1) % melodyPattern.length;
            }
            setTimeout(scheduleMelody, 50);
        };
        
        const scheduleArp = () => {
            if (!this.isPlaying) return;
            
            while (nextArpTime < this.audioContext.currentTime + 0.1) {
                const { note, duration } = arpPattern[arpIndex];
                const osc = this.playNote(note, duration * 0.8, 0.1, 'sine', this.musicVolume);
                this.musicNodes.push(osc);
                nextArpTime += duration;
                arpIndex = (arpIndex + 1) % arpPattern.length;
                
                if (arpIndex === 0) {
                    nextArpTime += 3.5;
                }
            }
            setTimeout(scheduleArp, 50);
        };
        
        scheduleBass();
        scheduleMelody();
        scheduleArp();
    }
    
    stopMusic() {
        this.isPlaying = false;
        this.musicNodes.forEach(node => {
            try {
                node.stop();
            } catch (e) {}
        });
        this.musicNodes = [];
    }
    
    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

const gameAudio = new GameAudio();