import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Database as DatabaseIcon, Search, Plus, Play } from "lucide-react";

interface Sound {
  id: string;
  name: string;
  filename: string;
  duration: number;
  color: string;
  volume: number;
  keybind?: string;
}

export default function Database() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all sounds from database
  const { data: allSounds = [], isLoading } = useQuery({
    queryKey: ['/api/sounds/database'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/sounds/database");
      return response.json();
    },
  });

  // Add sound to user's collection
  const addSoundMutation = useMutation({
    mutationFn: async (soundId: string) => {
      const response = await apiRequest("POST", `/api/sounds/add/${soundId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sound added to your collection!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add sound. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter sounds based on search term
  const filteredSounds = allSounds.filter((sound: Sound) =>
    sound.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSound = (soundId: string) => {
    addSoundMutation.mutate(soundId);
  };

  const playPreview = (filename: string) => {
    const audio = new Audio(`/api/sounds/play/${filename}`);
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-400 bg-red-50';
      case 'green': return 'border-green-400 bg-green-50';
      case 'purple': return 'border-purple-400 bg-purple-50';
      case 'blue': return 'border-blue-400 bg-blue-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soundboard">
      <div className="flex h-screen">
        <Sidebar currentPage="database" />

        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 bg-white/10 backdrop-blur-sm">
            <div>
              <h2 className="text-3xl font-bold text-white">Sound Database</h2>
              <p className="text-gray-300 mt-1">Browse and add sounds from the community database</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-6 bg-white/5">
            <div className="max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search sounds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Sounds Grid */}
          <div className="flex-1 p-6 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white text-lg">Loading sounds...</div>
              </div>
            ) : filteredSounds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <DatabaseIcon className="w-16 h-16 text-gray-400 mb-4" />
                <div className="text-white text-lg mb-2">
                  {searchTerm ? "No sounds found" : "No sounds in database"}
                </div>
                <div className="text-gray-400">
                  {searchTerm ? "Try a different search term" : "Upload some sounds to get started"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSounds.map((sound: Sound) => (
                  <Card key={sound.id} className={`transition-all hover:shadow-lg ${getColorClass(sound.color)}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                        {sound.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Duration: {sound.duration.toFixed(1)}s</span>
                        <span>Volume: {sound.volume}%</span>
                      </div>

                      {sound.keybind && (
                        <div className="text-xs text-gray-500">
                          Keybind: {sound.keybind}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => playPreview(sound.filename)}
                          className="flex-1"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddSound(sound.id)}
                          disabled={addSoundMutation.isPending}
                          className="flex-1"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}