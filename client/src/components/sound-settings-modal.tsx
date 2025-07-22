import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings } from "lucide-react";
import type { Sound, InsertSound } from "@shared/schema";

interface SoundSettingsModalProps {
  sound: Sound | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettingsModal({ sound, isOpen, onClose }: SoundSettingsModalProps) {
  const [name, setName] = useState("");
  const [volume, setVolume] = useState([100]);
  const [color, setColor] = useState("blue");
  const [keybind, setKeybind] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sound) {
      setName(sound.name);
      setVolume([sound.volume]);
      setColor(sound.color);
      setKeybind(sound.keybind || "");
    }
  }, [sound]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<InsertSound>) => {
      if (!sound) return;
      const response = await apiRequest("PATCH", `/api/sounds/${sound.id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sound settings updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds/search'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sound settings.",
        variant: "destructive",
      });
    },
  });

  const handleKeybindCapture = () => {
    setIsListening(true);
    
    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const keys: string[] = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.metaKey) keys.push('Meta');
      
      if (e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift' && e.key !== 'Meta') {
        keys.push(e.key === ' ' ? 'Space' : e.key);
      }
      
      setKeybind(keys.join('+'));
      setIsListening(false);
      document.removeEventListener('keydown', handleKeydown);
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Auto-stop listening after 5 seconds
    setTimeout(() => {
      setIsListening(false);
      document.removeEventListener('keydown', handleKeydown);
    }, 5000);
  };

  const handleSave = () => {
    const updates: Partial<InsertSound> = {
      name,
      volume: volume[0],
      color,
      keybind: keybind || undefined,
    };
    updateMutation.mutate(updates);
  };

  if (!sound) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="sound-settings-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Sound Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <p id="sound-settings-description" className="text-sm text-gray-600 mb-4">
          Configure the settings for this sound including name, volume, color, and keybind.
        </p>
        
        <div className="space-y-6">
          {/* Sound Name */}
          <div className="space-y-2">
            <Label htmlFor="sound-name">Sound Name</Label>
            <Input
              id="sound-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter sound name"
            />
          </div>

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Volume</Label>
              <span className="text-sm text-gray-600">{volume[0]}%</span>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="sound-color">Color Theme</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="red">Red</SelectItem>
                <SelectItem value="green">Green</SelectItem>
                <SelectItem value="purple">Purple</SelectItem>
                <SelectItem value="blue">Blue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Keybind */}
          <div className="space-y-2">
            <Label htmlFor="sound-keybind">Keyboard Shortcut</Label>
            <div className="flex space-x-2">
              <Input
                id="sound-keybind"
                value={keybind}
                onChange={(e) => setKeybind(e.target.value)}
                placeholder="No keybind"
                readOnly={isListening}
              />
              <Button 
                type="button"
                onClick={handleKeybindCapture}
                variant="outline"
                disabled={isListening}
                size="sm"
              >
                {isListening ? "Listening..." : "Capture"}
              </Button>
            </div>
            {isListening && (
              <p className="text-sm text-gray-600">
                Press any key combination to set the keybind...
              </p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {isListening && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-center">Press any key combination to set the keybind...</p>
              <p className="text-sm text-gray-600 text-center mt-2">
                Listening for keybind...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}