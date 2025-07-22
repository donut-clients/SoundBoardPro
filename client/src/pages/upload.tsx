import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload as UploadIcon, FileAudio } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [volume, setVolume] = useState("100");
  const [color, setColor] = useState("blue");
  const [keybind, setKeybind] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiRequest("POST", "/api/sounds", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sound uploaded successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sounds'] });
      // Reset form
      setFile(null);
      setName("");
      setVolume("100");
      setColor("blue");
      setKeybind("");
      setDuration(0);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload sound. Please try again.",
        variant: "destructive",
      });
    },
  });

  const [duration, setDuration] = useState<number>(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      
      // Get audio duration
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(selectedFile);
      audio.src = objectUrl;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 1.0);
        URL.revokeObjectURL(objectUrl);
      });
      
      audio.addEventListener('error', () => {
        console.warn('Could not load audio metadata, using default duration');
        setDuration(1.0);
        URL.revokeObjectURL(objectUrl);
      });
    }
  };

  const handleKeybindCapture = () => {
    setIsListening(true);
    
    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault();
      
      const keys = [];
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast({
        title: "Error",
        description: "Please select an audio file.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', name);
    formData.append('volume', volume);
    formData.append('color', color);
    formData.append('duration', duration.toString());
    if (keybind) {
      formData.append('keybind', keybind);
    }

    uploadMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-soundboard">
      <div className="flex h-screen">
        <Sidebar currentPage="upload" />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 bg-white/10 backdrop-blur-sm">
            <div>
              <h2 className="text-3xl font-bold text-white">Upload Sounds</h2>
              <p className="text-gray-300 mt-1">Add new sounds to your sound board</p>
            </div>
          </div>
          
          {/* Upload Form */}
          <div className="flex-1 p-6">
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UploadIcon className="w-5 h-5" />
                    <span>Upload Audio File</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="file">Audio File</Label>
                      <div className="relative">
                        <Input
                          id="file"
                          type="file"
                          accept="audio/*"
                          onChange={handleFileChange}
                          className="cursor-pointer"
                        />
                        {file && (
                          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
                            <FileAudio className="w-4 h-4" />
                            <span>{file.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sound Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Sound Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter a name for this sound"
                        required
                      />
                    </div>

                    {/* Volume */}
                    <div className="space-y-2">
                      <Label htmlFor="volume">Volume (%)</Label>
                      <Input
                        id="volume"
                        type="number"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                      />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
                      <Label htmlFor="color">Color Theme</Label>
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
                      <Label htmlFor="keybind">Keyboard Shortcut (Optional)</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="keybind"
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

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={uploadMutation.isPending || !file}
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload Sound"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
