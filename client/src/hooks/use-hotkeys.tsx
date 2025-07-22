import { useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Settings } from "@shared/schema";

interface UseHotkeysProps {
  stopAllSounds: () => void;
}

export function useHotkeys({ stopAllSounds }: UseHotkeysProps) {
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const parseKeybind = useCallback((keybind: string): { keys: Set<string>, mainKey: string } => {
    const parts = keybind.split('+').map(k => k.trim());
    const mainKey = parts[parts.length - 1];
    const modifiers = new Set(parts.slice(0, -1));
    return { keys: modifiers, mainKey };
  }, []);

  const isKeybindMatch = useCallback((event: KeyboardEvent, keybind: string): boolean => {
    const { keys: requiredModifiers, mainKey } = parseKeybind(keybind);
    
    // Check main key
    const eventKey = event.key === ' ' ? 'Space' : event.key;
    if (eventKey !== mainKey) return false;
    
    // Check modifiers
    const activeModifiers = new Set();
    if (event.ctrlKey) activeModifiers.add('Ctrl');
    if (event.altKey) activeModifiers.add('Alt');
    if (event.shiftKey) activeModifiers.add('Shift');
    if (event.metaKey) activeModifiers.add('Meta');
    
    // Must have exactly the same modifiers
    if (activeModifiers.size !== requiredModifiers.size) return false;
    for (const modifier of Array.from(requiredModifiers)) {
      if (!activeModifiers.has(modifier)) return false;
    }
    
    return true;
  }, [parseKeybind]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!settings) return;

      // Prevent default if this is a recognized hotkey
      let preventDefault = false;

      // Stop all sounds hotkey
      if (settings.stopAllSoundsHotkey && isKeybindMatch(event, settings.stopAllSoundsHotkey)) {
        preventDefault = true;
        stopAllSounds();
      }

      // Speed increment hotkey
      if (settings.speedIncrementHotkey && isKeybindMatch(event, settings.speedIncrementHotkey)) {
        preventDefault = true;
        // TODO: Implement speed increment logic
        console.log("Speed increment triggered");
      }

      // Speed decrement hotkey
      if (settings.speedDecrementHotkey && isKeybindMatch(event, settings.speedDecrementHotkey)) {
        preventDefault = true;
        // TODO: Implement speed decrement logic
        console.log("Speed decrement triggered");
      }

      // VoIP Push-to-Talk hotkey
      if (settings.voipPushToTalkKey && isKeybindMatch(event, settings.voipPushToTalkKey)) {
        preventDefault = true;
        // TODO: Implement VoIP push-to-talk logic
        console.log("VoIP push-to-talk activated");
      }

      // Overlap toggle hotkey
      if (settings.overlapToggleHotkey && isKeybindMatch(event, settings.overlapToggleHotkey)) {
        preventDefault = true;
        // TODO: Implement overlap toggle logic
        console.log("Overlap toggle triggered");
      }

      if (preventDefault) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!settings) return;

      // VoIP Push-to-Talk release
      if (settings.voipPushToTalkKey && isKeybindMatch(event, settings.voipPushToTalkKey)) {
        // TODO: Implement VoIP push-to-talk release logic
        console.log("VoIP push-to-talk released");
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [settings, stopAllSounds, isKeybindMatch]);

  return {
    isKeybindMatch,
  };
}
