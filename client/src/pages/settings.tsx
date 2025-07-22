
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [listeningField, setListeningField] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<any>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/settings");
      return response.json();
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: any) => {
      const response = await apiRequest("PATCH", "/api/settings", updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Settings updated successfully!",
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

  const handleUpdateSettings = (field: string, value: any) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  const handleHotkeyCapture = (field: string) => {
    setListeningField(field);
    
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
      
      const keybind = keys.join('+');
      setLocalSettings(prev => ({ ...prev, [field]: keybind }));
      handleUpdateSettings(field, keybind);
      setListeningField(null);
      document.removeEventListener('keydown', handleKeydown);
    };
    
    document.addEventListener('keydown', handleKeydown);
    
    // Auto-stop listening after 5 seconds
    setTimeout(() => {
      setListeningField(null);
      document.removeEventListener('keydown', handleKeydown);
    }, 5000);
  };

  const handleRightClick = (field: string, e: React.MouseEvent) => {
    e.preventDefault();
    setLocalSettings(prev => ({ ...prev, [field]: "" }));
    handleUpdateSettings(field, "");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-soundboard">
        <div className="flex h-screen">
          <Sidebar currentPage="settings" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-white text-lg">Loading settings...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soundboard">
      <div className="flex h-screen">
        <Sidebar currentPage="settings" />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 bg-white/10 backdrop-blur-sm">
            <div>
              <h2 className="text-3xl font-bold text-white">Settings</h2>
              <p className="text-gray-300 mt-1">Configure your soundboard preferences</p>
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Hotkeys */}
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <SettingsIcon className="w-5 h-5" />
                    <span>Hotkeys</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Stop All Sounds</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={localSettings?.stopAllSoundsHotkey || ""}
                          readOnly
                          placeholder="Ctrl+Shift+S"
                          className="bg-gray-50 cursor-pointer"
                          onClick={() => handleHotkeyCapture("stopAllSoundsHotkey")}
                          onContextMenu={(e) => handleRightClick("stopAllSoundsHotkey", e)}
                        />
                        <Button
                          onClick={() => handleHotkeyCapture("stopAllSoundsHotkey")}
                          variant="outline"
                          size="sm"
                          disabled={listeningField === "stopAllSoundsHotkey"}
                        >
                          {listeningField === "stopAllSoundsHotkey" ? "Listening..." : "Change"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Modified Playback Speed Key</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={localSettings?.modifiedPlaybackSpeedKey || ""}
                          readOnly
                          placeholder="Alt"
                          className="bg-gray-50 cursor-pointer"
                          onClick={() => handleHotkeyCapture("modifiedPlaybackSpeedKey")}
                          onContextMenu={(e) => handleRightClick("modifiedPlaybackSpeedKey", e)}
                        />
                        <Button
                          onClick={() => handleHotkeyCapture("modifiedPlaybackSpeedKey")}
                          variant="outline"
                          size="sm"
                          disabled={listeningField === "modifiedPlaybackSpeedKey"}
                        >
                          {listeningField === "modifiedPlaybackSpeedKey" ? "Listening..." : "Change"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Speed Increment</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={localSettings?.speedIncrementHotkey || ""}
                          readOnly
                          placeholder="Ctrl+="
                          className="bg-gray-50 cursor-pointer"
                          onClick={() => handleHotkeyCapture("speedIncrementHotkey")}
                          onContextMenu={(e) => handleRightClick("speedIncrementHotkey", e)}
                        />
                        <Button
                          onClick={() => handleHotkeyCapture("speedIncrementHotkey")}
                          variant="outline"
                          size="sm"
                          disabled={listeningField === "speedIncrementHotkey"}
                        >
                          {listeningField === "speedIncrementHotkey" ? "Listening..." : "Change"}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label>Speed Decrement</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={localSettings?.speedDecrementHotkey || ""}
                          readOnly
                          placeholder="Ctrl+-"
                          className="bg-gray-50 cursor-pointer"
                          onClick={() => handleHotkeyCapture("speedDecrementHotkey")}
                          onContextMenu={(e) => handleRightClick("speedDecrementHotkey", e)}
                        />
                        <Button
                          onClick={() => handleHotkeyCapture("speedDecrementHotkey")}
                          variant="outline"
                          size="sm"
                          disabled={listeningField === "speedDecrementHotkey"}
                        >
                          {listeningField === "speedDecrementHotkey" ? "Listening..." : "Change"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Settings */}
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle>Audio Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Allow Sound Overlap</Label>
                    <Switch
                      checked={localSettings?.allowOverlap || false}
                      onCheckedChange={(checked) => handleUpdateSettings("allowOverlap", checked)}
                    />
                  </div>
                  <div>
                    <Label>Speed Multiplier</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="3.0"
                      value={localSettings?.speedMultiplier || 1.5}
                      onChange={(e) => handleUpdateSettings("speedMultiplier", parseFloat(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Audio Levels */}
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle>Audio Levels (dB)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Primary Output Gain</Label>
                      <Input
                        type="number"
                        value={localSettings?.primaryOutputGain || -12}
                        onChange={(e) => handleUpdateSettings("primaryOutputGain", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Secondary Output Gain</Label>
                      <Input
                        type="number"
                        value={localSettings?.secondaryOutputGain || -18}
                        onChange={(e) => handleUpdateSettings("secondaryOutputGain", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Mic Injector Gain</Label>
                      <Input
                        type="number"
                        value={localSettings?.micInjectorGain || -6}
                        onChange={(e) => handleUpdateSettings("micInjectorGain", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Help text */}
          <div className="fixed bottom-4 right-4 text-sm text-gray-300 bg-black/50 px-3 py-2 rounded-lg backdrop-blur-sm">
            Right-click hotkey fields to clear them
          </div>
        </div>
      </div>

      {/* Key capture overlay */}
      {listeningField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p className="text-center text-lg font-medium">Press any key combination</p>
            <p className="text-sm text-gray-600 text-center mt-2">
              Listening for: {listeningField}
            </p>
            <p className="text-xs text-gray-500 text-center mt-4">
              Will auto-cancel in 5 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
