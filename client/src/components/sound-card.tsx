import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SoundSettingsModal } from "@/components/sound-settings-modal";
import { KeybindCaptureModal } from "@/components/keybind-capture-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Stop, Trash2, Link, Keyboard, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Sound } from "@shared/schema";

interface SoundCardProps {
  sound: Sound;
  onPlay: () => void;
  onStop: () => void;
}

const colorConfig = {
  red: {
    header: "bg-sound-red hover:bg-sound-red-dark",
    button: "bg-sound-red hover:bg-sound-red-dark"
  },
  green: {
    header: "bg-sound-green hover:bg-sound-green-dark",
    button: "bg-sound-green hover:bg-sound-green-dark"
  },
  purple: {
    header: "bg-sound-purple hover:bg-sound-purple-dark",
    button: "bg-sound-purple hover:bg-sound-purple-dark"
  },
  blue: {
    header: "bg-sound-blue hover:bg-sound-blue-dark",
    button: "bg-sound-blue hover:bg-sound-blue-dark"
  }
};

export function SoundCard({ sound, onPlay, onStop }: SoundCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isKeybindOpen, setIsKeybindOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/sounds/${sound.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sound deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sound. Please try again.",
        variant: "destructive",
      });
    },
  });

  const colors = colorConfig[sound.color as keyof typeof colorConfig] || colorConfig.blue;

  const handleDelete = () => {
    if (isDeleting) {
      deleteMutation.mutate();
    } else {
      setIsDeleting(true);
      // Reset delete confirmation after 3 seconds
      setTimeout(() => setIsDeleting(false), 3000);
    }
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className={cn("p-4 text-white", colors.header)}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg truncate">{sound.name}</h3>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Link className="w-4 h-4" />
              <span className="text-sm font-medium">{sound.volume}%</span>
            </div>
            <span className="text-sm">{formatDuration(sound.duration)}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className={cn(
                "p-1 text-white hover:bg-white/20",
                isDeleting && "bg-red-600 hover:bg-red-700"
              )}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Keybind Area */}
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">
              {sound.keybind || "No keybind"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsKeybindOpen(true)}
              className="p-1 h-6 w-6 text-gray-400 hover:text-gray-600"
            >
              <Keyboard className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 h-7 w-7 text-gray-400 hover:text-gray-600"
            >
              <Settings className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              onClick={onStop}
              className="w-8 h-8 rounded-full text-white p-0 bg-red-600 hover:bg-red-700"
            >
              <Stop className="w-3 h-3 fill-current" />
            </Button>
            <Button
              size="sm"
              onClick={onPlay}
              className={cn(
                "w-8 h-8 rounded-full text-white p-0",
                colors.button
              )}
            >
              <Play className="w-3 h-3 fill-current" />
            </Button>
          </div>
        </div>
      </div>
      
      <SoundSettingsModal
        sound={sound}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <KeybindCaptureModal
        sound={sound}
        isOpen={isKeybindOpen}
        onClose={() => setIsKeybindOpen(false)}
      />
    </div>
  );
}
