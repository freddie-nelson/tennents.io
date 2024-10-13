export class SoundManager {
  private static instance: SoundManager;
  private soundVolume: number;
  private audioContext: AudioContext;
  private sounds: Map<string, HTMLAudioElement[]>;
  private maxSounds: number = 5;

  private constructor() {
    this.soundVolume = 0.5; // Default volume
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.sounds = new Map<string, HTMLAudioElement[]>();
  }

  // Singleton instance
  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public static initSounds() {
    // Initialize sounds
    const soundManager = SoundManager.getInstance();
    soundManager.loadSound("keg", "/SFX/Burp.mp3");
    soundManager.loadSound("tennentsSuper", "/SFX/RAHHHH - Sound Effect [ ezmp3.cc ].mp3");
    soundManager.loadSound("tennentsClassic", "/SFX/wine-glass-clink-36036.mp3");
    soundManager.loadSound("tennents", "/SFX/opening-beer-can-6336.mp3");
    soundManager.loadSound("tennentsLite", "/SFX/chug.mp3");

    soundManager.loadSound("veryHurt", "/SFX/Metal pipe.mp3");
    soundManager.loadSound("hurtALot", "/SFX/elite death sound.mp3");
    soundManager.loadSound("hurtVeryMuch", "/SFX/LEGO YODA DEATH SOUND EFFECT  STAR WARS [ ezmp3.cc ].mp3");
    soundManager.loadSound(
      "hurtRatherBadly",
      "/SFX/Roblox Death Sound (Oof) - Sound Effect (HD) [ ezmp3.cc ].mp3"
    );
    soundManager.loadSound("hurt", "/SFX/Minecraft Damage (Oof) - Sound Effect (HD) [ ezmp3.cc ].mp3");

    soundManager.loadSound("kebab", "/SFX/chewing.mp3");
    soundManager.loadSound("oj", "/SFX/short-choir-6116.mp3");
    soundManager.loadSound("coffee", "/SFX/coffee-pouring-243569.mp3");
    soundManager.loadSound("water", "/SFX/short-choir-6116.mp3");
    soundManager.loadSound("tennentsZero", "/SFX/tennents-zero.mp3");
  }

  // Load sound file
  public loadSound(key: string, filePath: string): void {
    const audio = new Audio(filePath);
    audio.volume = this.soundVolume;
    this.sounds.set(key, [audio]);
  }

  // Play sound by key
  public playSound(key: string, loop: boolean = false, volume: number = this.soundVolume): void {
    const sounds = this.sounds.get(key);
    if (!sounds) {
      return;
    }

    let sound = sounds.find((sound) => sound.paused);
    if (!sound) {
      if (sounds.length >= this.maxSounds) {
        sound = sounds[0];
      } else {
        sound = sounds[0].cloneNode() as HTMLAudioElement;
        sounds.push(sound);
      }
    }

    sound.loop = loop;
    sound.volume = volume;

    if (!sound.paused) {
      sound.currentTime = 0;
    } else {
      sound.play();
    }

    sound.onended = () => {
      const sounds = this.sounds.get(key);
      if (sounds?.length > 2) {
        this.sounds.set(
          key,
          sounds.filter((s) => s !== sound)
        );
      }
    };
  }

  // Stop sound by key
  public stopSound(key: string): void {
    const sounds = this.sounds.get(key);
    if (!sounds) {
      return;
    }

    sounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  // Set global volume for all sounds
  public setVolume(volume: number): void {
    this.soundVolume = volume;
    this.sounds.forEach((audio) => {
      audio.forEach((sound) => {
        sound.volume = volume;
      });
    });
  }
}
