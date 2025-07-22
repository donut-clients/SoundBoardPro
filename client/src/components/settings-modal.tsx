import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { KeybindCaptureModal } from "@/components/keybind-capture-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Keyboard } from "lucide-react";
import type { Settings } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  });

  const [localSettings, setLocalSettings] = useState<Partial<Settings>>({});
  const [keybindModal, setKeybindModal] = useState<{
    isOpen: boolean;
    field: keyof Settings | null;
  }>({ isOpen: false, field: null });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<Settings>) => {
      return apiRequest("PATCH", "/api/settings", updates);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (key: keyof Settings, value: any) => {
    const updates = { ...localSettings, [key]: value };
    setLocalSettings(updates);
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleKeybindCapture = (field: keyof Settings) => {
    setKeybindModal({ isOpen: true, field });
  };

  const handleKeybindSave = (keybind: string) => {
    if (keybindModal.field) {
      handleChange(keybindModal.field, keybind);
    }
    setKeybindModal({ isOpen: false, field: null });
  };

  const currentSettings = { ...settings, ...localSettings };

  const hotkeyFields = [
    { key: "stopAllSoundsHotkey" as keyof Settings, label: "Stop All Sounds" },
    { key: "modifiedPlaybackSpeedKey" as keyof Settings, label: "Modified Playback Speed Key" },
    { key: "speedIncrementHotkey" as keyof Settings, label: "Speed Increment" },
    { key: "speedDecrementHotkey" as keyof Settings, label: "Speed Decrement" },
    { key: "voipPushToTalkKey" as keyof Settings, label: "VoIP Push to Talk" },
    { key: "overlapToggleHotkey" as keyof Settings, label: "Overlap Toggle" },
  ];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Hotkeys Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Hotkeys</h3>
              <div className="space-y-4">
                {hotkeyFields.map(({ key, label }) => (
                  <div key={key} className="flex items-center space-x-2">
                    <div className="flex-1">
                      <Label>{label}</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          value={currentSettings[key] as string || ""}
                          readOnly
                          placeholder="No keybind set"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleKeybindCapture(key)}
                        >
                          <Keyboard className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Audio Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Audio Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Speed Multiplier: {currentSettings.speedMultiplier || 1.5}x</Label>
                  <Slider
                    value={[currentSettings.speedMultiplier || 1.5]}
                    onValueChange={([value]) => handleChange("speedMultiplier", value)}
                    min={0.5}
                    max={3.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="allowOverlap"
                    checked={currentSettings.allowOverlap ?? true}
                    onCheckedChange={(checked) => handleChange("allowOverlap", checked)}
                  />
                  <Label htmlFor="allowOverlap">Allow Sound Overlap</Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Audio Output Settings */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Audio Output Levels</h3>
              <div className="space-y-4">
                <div>
                  <Label>Primary Output Gain: {currentSettings.primaryOutputGain || -12} dB</Label>
                  <Slider
                    value={[currentSettings.primaryOutputGain || -12]}
                    onValueChange={([value]) => handleChange("primaryOutputGain", value)}
                    min={-60}
                    max={12}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Secondary Output Gain: {currentSettings.secondaryOutputGain || -18} dB</Label>
                  <Slider
                    value={[currentSettings.secondaryOutputGain || -18]}
                    onValueChange={([value]) => handleChange("secondaryOutputGain", value)}
                    min={-60}
                    max={12}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Mic Injector Gain: {currentSettings.micInjectorGain || -6} dB</Label>
                  <Slider
                    value={[currentSettings.micInjectorGain || -6]}
                    onValueChange={([value]) => handleChange("micInjectorGain", value)}
                    min={-60}
                    max={12}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 text-right">
              Right-click during keybind capture to set to none
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <KeybindCaptureModal
        isOpen={keybindModal.isOpen}
        onClose={() => setKeybindModal({ isOpen: false, field: null })}
        onCapture={handleKeybindSave}
        currentKeybind={keybindModal.field ? (currentSettings[keybindModal.field] as string) : undefined}
      />
    </>
  );
}