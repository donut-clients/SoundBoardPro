
import { useState } from "react";
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

  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/settings");
      return response.json();
    },
  });

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
                      <Input
                        value={settings?.stopAllSoundsHotkey || ""}
                        onChange={(e) => handleUpdateSettings("stopAllSoundsHotkey", e.target.value)}
                        placeholder="Ctrl+Shift+S"
                      />
                    </div>
                    <div>
                      <Label>Modified Playback Speed Key</Label>
                      <Input
                        value={settings?.modifiedPlaybackSpeedKey || ""}
                        onChange={(e) => handleUpdateSettings("modifiedPlaybackSpeedKey", e.target.value)}
                        placeholder="Alt"
                      />
                    </div>
                    <div>
                      <Label>Speed Increment</Label>
                      <Input
                        value={settings?.speedIncrementHotkey || ""}
                        onChange={(e) => handleUpdateSettings("speedIncrementHotkey", e.target.value)}
                        placeholder="Ctrl+="
                      />
                    </div>
                    <div>
                      <Label>Speed Decrement</Label>
                      <Input
                        value={settings?.speedDecrementHotkey || ""}
                        onChange={(e) => handleUpdateSettings("speedDecrementHotkey", e.target.value)}
                        placeholder="Ctrl+-"
                      />
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
                      checked={settings?.allowOverlap || false}
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
                      value={settings?.speedMultiplier || 1.5}
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
                        value={settings?.primaryOutputGain || -12}
                        onChange={(e) => handleUpdateSettings("primaryOutputGain", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Secondary Output Gain</Label>
                      <Input
                        type="number"
                        value={settings?.secondaryOutputGain || -18}
                        onChange={(e) => handleUpdateSettings("secondaryOutputGain", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>Mic Injector Gain</Label>
                      <Input
                        type="number"
                        value={settings?.micInjectorGain || -6}
                        onChange={(e) => handleUpdateSettings("micInjectorGain", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
