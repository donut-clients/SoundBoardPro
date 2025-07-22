import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { SoundCard } from "@/components/sound-card";
import { SettingsModal } from "@/components/settings-modal";
import { AudioOutputsModal } from "@/components/audio-outputs-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useAudio } from "@/hooks/use-audio";
import { apiRequest } from "@/lib/queryClient";
import { Headphones, RotateCcw, Plus, Search } from "lucide-react";
import type { Sound } from "@shared/schema";

export default function Soundboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAudioOutputsOpen, setIsAudioOutputsOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: sounds = [], isLoading } = useQuery<Sound[]>({
    queryKey: ['/api/sounds'],
  });

  const { data: searchResults = [] } = useQuery<Sound[]>({
    queryKey: ['/api/sounds/search', { q: searchQuery }],
    enabled: !!searchQuery.trim(),
  });

  const displaySounds = searchQuery.trim() ? searchResults : sounds;
  
  const { playSound, stopAllSounds } = useAudio();
  useHotkeys({ stopAllSounds });

  const resetKeybindsMutation = useMutation({
    mutationFn: async () => {
      // Reset keybinds for all sounds
      const promises = sounds.map(sound => 
        apiRequest("PATCH", `/api/sounds/${sound.id}`, { keybind: undefined })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All keybinds have been reset.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds'] });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds/search'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset keybinds.",
        variant: "destructive",
      });
    },
  });

  const handleResetKeybinds = () => {
    resetKeybindsMutation.mutate();
  };

  const handleAudioOutputs = () => {
    setIsAudioOutputsOpen(true);
  };

  const handleAddSound = () => {
    // TODO: Navigate to upload page or open upload modal
    window.location.href = "/upload";
  };

  return (
    <div className="min-h-screen bg-gradient-soundboard">
      <div className="flex h-screen">
        <Sidebar 
          currentPage="soundboard" 
          onSettingsClick={() => setIsSettingsOpen(true)} 
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 bg-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white">Sound Board</h2>
                <p className="text-gray-300 mt-1">Trigger sounds with keyboard shortcuts</p>
              </div>
              
              {/* Top Right Controls */}
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleAudioOutputs}
                  className="bg-purple-700 hover:bg-purple-800 text-white"
                >
                  <Headphones className="w-4 h-4 mr-2" />
                  Audio Outputs
                </Button>
                <Button 
                  onClick={handleResetKeybinds}
                  variant="secondary"
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                  disabled={resetKeybindsMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {resetKeybindsMutation.isPending ? "Resetting..." : "Reset Keybinds"}
                </Button>
                <Button 
                  onClick={handleAddSound}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Sound
                </Button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search sounds..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          
          {/* Sound Cards Area */}
          <div className="flex-1 p-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-lg h-48 animate-pulse" />
                ))}
              </div>
            ) : displaySounds.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-white">
                  <h3 className="text-xl font-semibold mb-2">
                    {searchQuery.trim() ? "No sounds found" : "No sounds available"}
                  </h3>
                  <p className="text-gray-300">
                    {searchQuery.trim() 
                      ? "Try adjusting your search terms" 
                      : "Upload some sounds to get started"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displaySounds.map((sound) => (
                  <SoundCard 
                    key={sound.id} 
                    sound={sound} 
                    onPlay={() => playSound(sound)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <AudioOutputsModal
        isOpen={isAudioOutputsOpen}
        onClose={() => setIsAudioOutputsOpen(false)}
      />
    </div>
  );
}
