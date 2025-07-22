import { useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Sound, Settings } from "@shared/schema";

export function useAudio() {
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffers = useRef<Map<string, AudioBuffer>>(new Map());
  const activeSources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      // Cleanup
      activeSources.current.forEach(source => {
        try {
          source.stop();
        } catch (e) {
          // Source might already be stopped
        }
      });
      activeSources.current.clear();
    };
  }, []);

  const loadAudio = useCallback(async (sound: Sound): Promise<AudioBuffer> => {
    if (!audioContext.current) {
      throw new Error("Audio context not initialized");
    }

    // Check if already loaded
    const cached = audioBuffers.current.get(sound.filename);
    if (cached) return cached;

    try {
      const response = await fetch(`/api/audio/${sound.filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
      
      audioBuffers.current.set(sound.filename, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error("Error loading audio:", error);
      throw error;
    }
  }, []);

  const playSound = useCallback(async (sound: Sound) => {
    if (!audioContext.current) return;

    try {
      // Resume audio context if suspended (required by browsers)
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      const audioBuffer = await loadAudio(sound);
      
      // Stop existing instances of the same sound if overlap is not allowed
      if (!settings?.allowOverlap) {
        activeSources.current.forEach(source => {
          if ((source as any).soundId === sound.id) {
            try {
              source.stop();
            } catch (e) {
              // Source might already be stopped
            }
          }
        });
      }

      // Create source and gain nodes
      const source = audioContext.current.createBufferSource();
      const gainNode = audioContext.current.createGain();
      
      source.buffer = audioBuffer;
      
      // Apply volume (convert percentage to gain)
      gainNode.gain.value = (sound.volume / 100) * 0.8; // Max 0.8 to prevent clipping
      
      // Apply gain settings if available
      if (settings?.primaryOutputGain !== undefined && settings.primaryOutputGain !== null) {
        const primaryGain = Math.pow(10, settings.primaryOutputGain / 20);
        gainNode.gain.value *= primaryGain;
      }

      // Connect audio graph
      source.connect(gainNode);
      gainNode.connect(audioContext.current.destination);
      
      // Track active source
      (source as any).soundId = sound.id;
      activeSources.current.add(source);
      
      // Remove from active sources when finished
      source.onended = () => {
        activeSources.current.delete(source);
      };

      // Start playback
      source.start();
      
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  }, [loadAudio, settings]);

  const stopAllSounds = useCallback(() => {
    activeSources.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Source might already be stopped
      }
    });
    activeSources.current.clear();
  }, []);

  return {
    playSound,
    stopAllSounds,
  };
}
