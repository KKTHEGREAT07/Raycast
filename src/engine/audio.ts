type Soundscape = "menu" | "game" | "pause";

/** Small procedural sound layer so the game works without extra audio assets. */
export default class AudioManager {
    private context: AudioContext | null = null;
    private master: GainNode | null = null;
    private ambience: GainNode | null = null;
    private effects: GainNode | null = null;
    private ambienceOscillators: OscillatorNode[] = [];
    private ambienceTimer: number | null = null;
    private walking = new Audio("/u_3x9ga8wevj-walking-sound-effect-272246.mp3");
    private scene: Soundscape = "menu";
    private walkingActive = false;
    private masterVolume = 0.5;
    private ambienceVolume = 1;
    private effectsVolume = 1;

    constructor() {
        this.walking.loop = false;
        this.walking.volume = 0.32 * this.effectsVolume;
        this.walking.preload = "auto";
        this.walking.addEventListener("ended", this.playNextFootstepLoop);
    }

    private async initialize() {
        if (!this.context) {
            this.context = new AudioContext();
            this.master = this.context.createGain();
            this.master.gain.value = this.masterVolume;
            this.master.connect(this.context.destination);

            this.ambience = this.context.createGain();
            this.ambience.gain.value = 0;
            this.ambience.connect(this.master);

            this.effects = this.context.createGain();
            this.effects.gain.value = this.effectsVolume;
            this.effects.connect(this.master);

            for (const [frequency, volume] of [[55, 0.12], [82.4, 0.045], [110, 0.025]]) {
                const oscillator = this.context.createOscillator();
                const gain = this.context.createGain();
                oscillator.type = "sine";
                oscillator.frequency.value = frequency;
                gain.gain.value = volume;
                oscillator.connect(gain);
                gain.connect(this.ambience);
                oscillator.start();
                this.ambienceOscillators.push(oscillator);
            }
        }

        if (this.context.state === "suspended") await this.context.resume();
    }

    async enterScene(scene: Soundscape) {
        await this.initialize();
        this.scene = scene;
        if (!this.context || !this.ambience) return;

        const now = this.context.currentTime;
        const sceneLevel = scene === "game" ? 0.6 : scene === "pause" ? 0.85 : 0.75;
        const target = sceneLevel * this.ambienceVolume;
        this.ambience.gain.cancelScheduledValues(now);
        this.ambience.gain.setTargetAtTime(target, now, 0.8);

        if (this.ambienceTimer !== null) window.clearInterval(this.ambienceTimer);
        const interval = scene === "pause" ? 5200 : scene === "game" ? 9000 : 7200;
        this.ambienceTimer = window.setInterval(() => this.playAmbientMotif(), interval);

        if (scene === "menu") this.playNotes([220, 329.6, 440], 0.16, 0.7, 0.97, 1.03);
        if (scene === "pause") this.playNotes([392, 293.7], 0.12, 0.24, 0.96, 1.04);
        if (scene === "game") this.playNotes([146.8, 220], 0.11, 0.42, 0.96, 1.04);
    }

    async buttonClick() {
        await this.initialize();
        this.playNotes([660, 880], 0.16, 0.075, 0.94, 1.06);
    }

    setMasterVolume(value: number) {
        this.masterVolume = value;
        if (this.master && this.context) {
            this.master.gain.setTargetAtTime(value, this.context.currentTime, 0.04);
        }
    }

    setAmbienceVolume(value: number) {
        this.ambienceVolume = value;
        if (this.ambience && this.context) {
            const sceneLevel = this.scene === "game" ? 0.6 : this.scene === "pause" ? 0.85 : 0.75;
            this.ambience.gain.setTargetAtTime(sceneLevel * value, this.context.currentTime, 0.04);
        }
    }

    setEffectsVolume(value: number) {
        this.effectsVolume = value;
        if (this.effects && this.context) {
            this.effects.gain.setTargetAtTime(value, this.context.currentTime, 0.04);
        }
        this.walking.volume = 0.32 * value;
    }

    setWalking(isWalking: boolean) {
        if (!isWalking || this.scene !== "game") {
            this.walkingActive = false;
            this.walking.pause();
            this.walking.currentTime = 0;
            return;
        }

        this.walkingActive = true;
        if (this.walking.paused) this.playFootstepLoop();
    }

    private playFootstepLoop = () => {
        if (!this.walkingActive || this.scene !== "game") return;
        // A small rate change gives each repeated footstep a slightly different pitch.
        this.walking.playbackRate = 0.91 + Math.random() * 0.18;
        try {
            void this.walking.play().catch(() => {
                // Browsers can defer media playback until the next user gesture.
            });
        } catch {
            // Browsers can defer media playback until the next user gesture.
        }
    };

    async wallImpact() {
        await this.initialize();
        if (!this.context || !this.effects) return;

        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = "triangle";
        const pitch = 0.92 + Math.random() * 0.16;
        oscillator.frequency.setValueAtTime(105 * pitch, now);
        oscillator.frequency.exponentialRampToValueAtTime(42 * pitch, now + 0.13);
        gain.gain.setValueAtTime(0.26, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        oscillator.connect(gain);
        gain.connect(this.effects);
        oscillator.start(now);
        oscillator.stop(now + 0.17);
    }

    private playAmbientMotif() {
        if (this.scene === "menu") {
            const root = [164.8, 196, 220, 261.6][Math.floor(Math.random() * 4)];
            this.playNotes([root, root * (1.25 + Math.random() * 0.08)], 0.065, 1.3, 0.96, 1.04, "ambience");
        } else if (this.scene === "pause") {
            const root = [130.8, 146.8, 174.6][Math.floor(Math.random() * 3)];
            this.playNotes([root, root * 1.5], 0.06, 0.9, 0.94, 1.06, "ambience");
        } else {
            const root = [73.4, 82.4, 98][Math.floor(Math.random() * 3)];
            this.playNotes([root, root * (1.4 + Math.random() * 0.2)], 0.05, 1.8, 0.9, 1.1, "ambience");
        }
    }

    private playNotes(
        frequencies: number[],
        volume: number,
        duration: number,
        minPitch = 1,
        maxPitch = 1,
        bus: "effects" | "ambience" = "effects"
    ) {
        const output = bus === "ambience" ? this.ambience : this.effects;
        if (!this.context || !output) return;
        const now = this.context.currentTime;

        frequencies.forEach((frequency, index) => {
            const oscillator = this.context!.createOscillator();
            const gain = this.context!.createGain();
            const start = now + index * duration * 0.7;
            oscillator.type = "sine";
            oscillator.frequency.value = frequency * (minPitch + Math.random() * (maxPitch - minPitch));
            gain.gain.setValueAtTime(0.001, start);
            gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
            oscillator.connect(gain);
            gain.connect(output);
            oscillator.start(start);
            oscillator.stop(start + duration + 0.01);
        });
    }

    destroy() {
        this.walkingActive = false;
        this.walking.pause();
        this.walking.removeEventListener("ended", this.playNextFootstepLoop);
        if (this.ambienceTimer !== null) window.clearInterval(this.ambienceTimer);
        this.ambienceOscillators.forEach((oscillator) => oscillator.stop());
        void this.context?.close();
    }

    private playNextFootstepLoop = () => this.playFootstepLoop();
}
