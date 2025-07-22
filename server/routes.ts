import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertSoundSchema, insertSettingsSchema } from "@shared/schema";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files only
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all sounds
  app.get("/api/sounds", async (req, res) => {
    try {
      const sounds = await storage.getSounds();
      res.json(sounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sounds" });
    }
  });

  // Search sounds
  app.get("/api/sounds/search", async (req, res) => {
    try {
      const query = req.query.q as string || "";
      const sounds = await storage.searchSounds(query);
      res.json(sounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to search sounds" });
    }
  });

  // Get a specific sound
  app.get("/api/sounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sound = await storage.getSound(id);
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }
      res.json(sound);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sound" });
    }
  });

  // Upload and create a new sound
  app.post("/api/sounds", upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const soundData = {
        name: req.body.name || path.parse(req.file.originalname).name,
        filename: req.file.filename,
        duration: parseFloat(req.body.duration) || 1.0, // Default to 1 second if not provided
        volume: parseInt(req.body.volume) || 100,
        color: req.body.color || "blue",
        keybind: req.body.keybind || undefined,
      };

      const validatedData = insertSoundSchema.parse(soundData);
      const sound = await storage.createSound(validatedData);
      res.status(201).json(sound);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(400).json({ message: "Failed to create sound", error: error.message || error });
    }
  });

  // Update a sound
  app.patch("/api/sounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertSoundSchema.partial().parse(req.body);
      const sound = await storage.updateSound(id, updates);
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }
      res.json(sound);
    } catch (error) {
      res.status(400).json({ message: "Failed to update sound", error: error });
    }
  });

  app.delete("/api/sounds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const sound = await storage.getSound(id);
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }

      // Delete the audio file
      const filePath = path.join(uploadDir, sound.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const deleted = await storage.deleteSound(id);
      if (!deleted) {
        return res.status(404).json({ message: "Sound not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sound" });
    }
  });

  // Get all sounds from database (for community browsing)
  app.get("/api/sounds/database", async (req, res) => {
    try {
      const sounds = await storage.getSounds(); // Use existing getSounds method
      res.json(sounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sounds" });
    }
  });

  // Add sound from database to user's collection
  app.post("/api/sounds/add/:id", async (req, res) => {
    try {
      const sound = await storage.getSound(parseInt(req.params.id));
      if (!sound) {
        return res.status(404).json({ message: "Sound not found" });
      }

      // Create a copy for the user (you might want to implement user sessions later)
      const newSound = await storage.createSound({
        ...sound,
        id: undefined, // Let it generate a new ID
      });

      res.status(201).json(newSound);
    } catch (error) {
      res.status(400).json({ message: "Failed to add sound", error: error.message || error });
    }
  });

  // Serve audio files
  app.get("/api/audio/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Audio file not found" });
    }

    res.sendFile(filePath);
  });

  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.patch("/api/settings", async (req, res) => {
    try {
      const updates = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Failed to update settings", error: error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}