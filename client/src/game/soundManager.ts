export class SoundManager {
    private static instance: SoundManager;
    private soundVolume: number;
    private audioContext: AudioContext;
    private sounds: Map<string, HTMLAudioElement>;
  
    private constructor() {
      this.soundVolume = 1.0; // Default volume
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.sounds = new Map<string, HTMLAudioElement>();
    }
  
    // Singleton instance
    public static getInstance(): SoundManager {
      if (!SoundManager.instance) {
        SoundManager.instance = new SoundManager();
      }
      return SoundManager.instance;
    }
  
    // Load sound file
    public loadSound(key: string, filePath: string): void {
      const audio = new Audio(filePath);
      audio.volume = this.soundVolume;
      this.sounds.set(key, audio);
    }
  
    // Play sound by key
    public playSound(key: string, loop: boolean = false, volume: number = this.soundVolume): void {
      const sound = this.sounds.get(key);
      if (sound) {
        sound.loop = loop;
        sound.volume = volume;
        sound.play();
      } else {
        console.warn(`Sound with key '${key}' not found.`);
      }
    }
  
    // Stop sound by key
    public stopSound(key: string): void {
      const sound = this.sounds.get(key);
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      } else {
        console.warn(`Sound with key '${key}' not found.`);
      }
    }
  
    // Set global volume for all sounds
    public setVolume(volume: number): void {
      this.soundVolume = volume;
      this.sounds.forEach((audio) => {
        audio.volume = volume;
      });
    }
  }
  