import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Keyboard } from "lucide-react";
import type { Sound, InsertSound } from "@shared/schema";

interface KeybindCaptureModalProps {
  sound: Sound | null;
  isOpen: boolean;
  onClose: () => void;
}

export function KeybindCaptureModal({ sound, isOpen, onClose }: KeybindCaptureModalProps) {
  const [keybind, setKeybind] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sound) {
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
        description: "Keybind updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds/search'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update keybind.",
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
      keybind: keybind || undefined,
    };
    updateMutation.mutate(updates);
  };

  const handleClear = () => {
    setKeybind("");
  };

  if (!sound) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" aria-describedby="keybind-capture-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5" />
            <span>Set Keybind</span>
          </DialogTitle>
        </DialogHeader>
        
        <p id="keybind-capture-description" className="text-sm text-gray-600 mb-4">
          Set a keyboard shortcut for "{sound.name}".
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-keybind">Current Keybind</Label>
            <div className="flex space-x-2">
              <Input
                id="current-keybind"
                value={keybind}
                onChange={(e) => setKeybind(e.target.value)}
                placeholder="No keybind"
                readOnly={isListening}
              />
              <Button 
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
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {isListening && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-center">Press any key combination to set the keybind...</p>
              <p className="text-sm text-gray-600 text-center mt-2">
                Listening for: {sound.name}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}