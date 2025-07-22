import { pgTable, text, serial, integer, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sounds = pgTable("sounds", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  filename: text("filename").notNull(),
  duration: real("duration").notNull(),
  volume: integer("volume").notNull().default(100),
  color: text("color").notNull().default("blue"),
  keybind: text("keybind"),
  createdAt: text("created_at").notNull().default("now()"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  stopAllSoundsHotkey: text("stop_all_sounds_hotkey").default("Ctrl+Shift+S"),
  modifiedPlaybackSpeedKey: text("modified_playback_speed_key").default("Alt"),
  speedMultiplier: real("speed_multiplier").default(1.5),
  speedIncrementHotkey: text("speed_increment_hotkey").default("Ctrl+="),
  speedDecrementHotkey: text("speed_decrement_hotkey").default("Ctrl+-"),
  voipPushToTalkKey: text("voip_push_to_talk_key").default("F1"),
  allowOverlap: boolean("allow_overlap").default(true),
  overlapToggleHotkey: text("overlap_toggle_hotkey").default("F2"),
  primaryOutputGain: integer("primary_output_gain").default(-12),
  secondaryOutputGain: integer("secondary_output_gain").default(-18),
  micInjectorGain: integer("mic_injector_gain").default(-6),
});

export const insertSoundSchema = createInsertSchema(sounds).omit({
  id: true,
  createdAt: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type Sound = typeof sounds.$inferSelect;
export type InsertSound = z.infer<typeof insertSoundSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
