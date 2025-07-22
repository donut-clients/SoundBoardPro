import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Settings } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Partial<Settings>>({});
  const [isListening, setIsListening] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: currentSettings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    enabled: isOpen,
  });

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      const response = await apiRequest("PATCH", "/api/settings", updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleHotkeyCapture = (field: string) => {
    setIsListening(field);
    
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
      
      setSettings(prev => ({
        ...prev,
        [field]: keys.join('+')
      }));
      setIsListening(null);
      document.removeEventListener('keydown', handleKeydown);
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Auto-stop listening after 5 seconds
    setTimeout(() => {
      setIsListening(null);
      document.removeEventListener('keydown', handleKeydown);
    }, 5000);
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  if (!currentSettings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="settings-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Settings</DialogTitle>
        </DialogHeader>
        
        <p id="settings-description" className="text-sm text-gray-600 mb-4">
          Configure your soundboard hotkeys, audio levels, and playback preferences.
        </p>
        
        <div className="space-y-8">
          {/* Hotkey Settings */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Hotkey Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Stop All Sounds</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.stopAllSoundsHotkey || ""}
                    readOnly
                    className="w-32 bg-gray-50"
                  />
                  <Button
                    onClick={() => handleHotkeyCapture('stopAllSoundsHotkey')}
                    variant="outline"
                    size="sm"
                    disabled={isListening === 'stopAllSoundsHotkey'}
                  >
                    {isListening === 'stopAllSoundsHotkey' ? "Listening..." : "Change"}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Modified Playback Speed</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.modifiedPlaybackSpeedKey || ""}
                    readOnly
                    className="w-32 bg-gray-50"
                  />
                  <Button
                    onClick={() => handleHotkeyCapture('modifiedPlaybackSpeedKey')}
                    variant="outline"
                    size="sm"
                    disabled={isListening === 'modifiedPlaybackSpeedKey'}
                  >
                    {isListening === 'modifiedPlaybackSpeedKey' ? "Listening..." : "Change"}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Playback Speed Multiplier</Label>
                <Select 
                  value={settings.speedMultiplier?.toString()} 
                  onValueChange={(value) => setSettings(prev => ({ ...prev, speedMultiplier: parseFloat(value) }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x</SelectItem>
                    <SelectItem value="1">1x</SelectItem>
                    <SelectItem value="1.5">1.5x</SelectItem>
                    <SelectItem value="2">2x</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Speed Increment</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.speedIncrementHotkey || ""}
                    readOnly
                    className="w-32 bg-gray-50"
                  />
                  <Button
                    onClick={() => handleHotkeyCapture('speedIncrementHotkey')}
                    variant="outline"
                    size="sm"
                    disabled={isListening === 'speedIncrementHotkey'}
                  >
                    {isListening === 'speedIncrementHotkey' ? "Listening..." : "Change"}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Speed Decrement</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.speedDecrementHotkey || ""}
                    readOnly
                    className="w-32 bg-gray-50"
                  />
                  <Button
                    onClick={() => handleHotkeyCapture('speedDecrementHotkey')}
                    variant="outline"
                    size="sm"
                    disabled={isListening === 'speedDecrementHotkey'}
                  >
                    {isListening === 'speedDecrementHotkey' ? "Listening..." : "Change"}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">VoIP Push-to-Talk</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.voipPushToTalkKey || ""}
                    readOnly
                    className="w-32 bg-gray-50"
                  />
                  <Button
                    onClick={() => handleHotkeyCapture('voipPushToTalkKey')}
                    variant="outline"
                    size="sm"
                    disabled={isListening === 'voipPushToTalkKey'}
                  >
                    {isListening === 'voipPushToTalkKey' ? "Listening..." : "Change"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Audio Settings */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Audio Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Overlap Same Sound File</Label>
                <Switch
                  checked={settings.allowOverlap || false}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowOverlap: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Overlap Toggle Hotkey</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    value={settings.overlapToggleHotkey || ""}
                    readOnly
                    className="w-32 bg-gray-50"
                  />
                  <Button
                    onClick={() => handleHotkeyCapture('overlapToggleHotkey')}
                    variant="outline"
                    size="sm"
                    disabled={isListening === 'overlapToggleHotkey'}
                  >
                    {isListening === 'overlapToggleHotkey' ? "Listening..." : "Change"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Audio Gain Controls */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Audio Gain Controls</h4>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Primary Output Gain</Label>
                  <span className="text-sm text-gray-600">{settings.primaryOutputGain || -12} dB</span>
                </div>
                <Slider
                  value={[settings.primaryOutputGain || -12]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, primaryOutputGain: value[0] }))}
                  min={-66}
                  max={20}
                  step={1}
                  className="slider-primary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-66 dB</span>
                  <span>+20 dB</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Secondary Output Gain</Label>
                  <span className="text-sm text-gray-600">{settings.secondaryOutputGain || -18} dB</span>
                </div>
                <Slider
                  value={[settings.secondaryOutputGain || -18]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, secondaryOutputGain: value[0] }))}
                  min={-66}
                  max={20}
                  step={1}
                  className="slider-secondary"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-66 dB</span>
                  <span>+20 dB</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Mic Injector Gain</Label>
                  <span className="text-sm text-gray-600">{settings.micInjectorGain || -6} dB</span>
                </div>
                <Slider
                  value={[settings.micInjectorGain || -6]}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, micInjectorGain: value[0] }))}
                  min={-66}
                  max={20}
                  step={1}
                  className="slider-mic"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>-66 dB</span>
                  <span>+20 dB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
        
        {isListening && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <p className="text-center">Press any key combination to set the hotkey...</p>
              <p className="text-sm text-gray-600 text-center mt-2">
                Currently listening for: {isListening}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
