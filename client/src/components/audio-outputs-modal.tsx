import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Headphones, Speaker } from "lucide-react";

interface AudioOutputsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

export function AudioOutputsModal({ isOpen, onClose }: AudioOutputsModalProps) {
  const [audioDevices, setAudioDevices] = useState<AudioDevice[]>([]);
  const [primaryOutput, setPrimaryOutput] = useState<string>("default");
  const [secondaryOutput, setSecondaryOutput] = useState<string>("default");

  useEffect(() => {
    if (isOpen) {
      loadAudioDevices();
    }
  }, [isOpen]);

  const loadAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioOutputs = devices
        .filter(device => device.kind === 'audiooutput' && device.deviceId && device.deviceId !== '')
        .map(device => ({ 
          deviceId: device.deviceId, 
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`, 
          kind: 'output' 
        }));
      
      setAudioDevices(audioOutputs);
    } catch (error) {
      console.error('Failed to enumerate audio devices:', error);
    }
  };

  const handleSave = () => {
    // TODO: Save audio output preferences to settings
    console.log('Saving audio outputs:', { primaryOutput, secondaryOutput });
    onClose();
  };

  const outputDevices = audioDevices;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="audio-outputs-description">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Headphones className="w-5 h-5" />
            <span>Audio Outputs</span>
          </DialogTitle>
        </DialogHeader>
        
        <p id="audio-outputs-description" className="text-sm text-gray-600 mb-4">
          Configure your audio output devices for different sound channels.
        </p>
        
        <div className="space-y-6">
          {/* Primary Output */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Speaker className="w-4 h-4" />
              <span>Primary Output</span>
            </Label>
            <Select value={primaryOutput} onValueChange={setPrimaryOutput}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Output</SelectItem>
                {outputDevices.map((device) => (
                  <SelectItem key={`primary-${device.deviceId}`} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Secondary Output */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Speaker className="w-4 h-4" />
              <span>Secondary Output</span>
            </Label>
            <Select value={secondaryOutput} onValueChange={setSecondaryOutput}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Output</SelectItem>
                {outputDevices.map((device) => (
                  <SelectItem key={`secondary-${device.deviceId}`} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}