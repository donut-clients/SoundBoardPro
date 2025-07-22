import { sounds, settings, type Sound, type InsertSound, type Settings, type InsertSettings } from "@shared/schema";

export interface IStorage {
  // Sound management
  getSounds(): Promise<Sound[]>;
  getSound(id: number): Promise<Sound | undefined>;
  createSound(sound: InsertSound): Promise<Sound>;
  updateSound(id: number, updates: Partial<InsertSound>): Promise<Sound | undefined>;
  deleteSound(id: number): Promise<boolean>;
  searchSounds(query: string): Promise<Sound[]>;

  // Settings management
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private sounds: Map<number, Sound>;
  private settings: Settings;
  private currentSoundId: number;

  constructor() {
    this.sounds = new Map();
    this.currentSoundId = 1;
    this.settings = {
      id: 1,
      stopAllSoundsHotkey: "Ctrl+Shift+S",
      modifiedPlaybackSpeedKey: "Alt",
      speedMultiplier: 1.5,
      speedIncrementHotkey: "Ctrl+=",
      speedDecrementHotkey: "Ctrl+-",
      voipPushToTalkKey: "F1",
      allowOverlap: true,
      overlapToggleHotkey: "F2",
      primaryOutputGain: -12,
      secondaryOutputGain: -18,
      micInjectorGain: -6,
    };

    // No pre-installed sounds - start with empty storage
  }

  async getSounds(): Promise<Sound[]> {
    return Array.from(this.sounds.values());
  }

  async getSound(id: number): Promise<Sound | undefined> {
    return this.sounds.get(id);
  }

  async createSound(insertSound: InsertSound): Promise<Sound> {
    const id = this.currentSoundId++;
    const sound: Sound = {
      id,
      name: insertSound.name,
      filename: insertSound.filename,
      duration: insertSound.duration,
      volume: insertSound.volume || 100,
      color: insertSound.color || "blue",
      keybind: insertSound.keybind || null,
      createdAt: new Date().toISOString(),
    };
    this.sounds.set(id, sound);
    return sound;
  }

  async updateSound(id: number, updates: Partial<InsertSound>): Promise<Sound | undefined> {
    const sound = this.sounds.get(id);
    if (!sound) return undefined;

    const updatedSound = { ...sound, ...updates };
    this.sounds.set(id, updatedSound);
    return updatedSound;
  }

  async deleteSound(id: number): Promise<boolean> {
    return this.sounds.delete(id);
  }

  async searchSounds(query: string): Promise<Sound[]> {
    const allSounds = Array.from(this.sounds.values());
    if (!query.trim()) return allSounds;

    const searchTerm = query.toLowerCase();
    return allSounds.filter(sound =>
      sound.name.toLowerCase().includes(searchTerm) ||
      (sound.keybind && sound.keybind.toLowerCase().includes(searchTerm))
    );
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...updates };
    return this.settings;
  }
}

export const storage = new MemStorage();