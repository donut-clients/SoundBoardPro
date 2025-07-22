import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface KeybindCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (keybind: string) => void;
  currentKeybind?: string;
}

export function KeybindCaptureModal({ 
  isOpen, 
  onClose, 
  onCapture, 
  currentKeybind 
}: KeybindCaptureModalProps) {
  const [capturedKey, setCapturedKey] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCapturedKey("");
      setIsCapturing(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCapturing) return;

      e.preventDefault();
      e.stopPropagation();

      const keys = [];
      if (e.ctrlKey) keys.push("Ctrl");
      if (e.altKey) keys.push("Alt");
      if (e.shiftKey) keys.push("Shift");
      if (e.metaKey) keys.push("Meta");

      // Handle special keys
      let keyName = e.key;
      if (keyName === " ") keyName = "Space";
      if (keyName === "ArrowUp") keyName = "↑";
      if (keyName === "ArrowDown") keyName = "↓";
      if (keyName === "ArrowLeft") keyName = "←";
      if (keyName === "ArrowRight") keyName = "→";

      if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        keys.push(keyName);
      }

      if (keys.length > 0) {
        const keybind = keys.join("+");
        setCapturedKey(keybind);
        setIsCapturing(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!isCapturing) return;
      e.preventDefault();
      setCapturedKey("");
      setIsCapturing(false);
      onCapture("");
      onClose();
    };

    if (isCapturing) {
      document.addEventListener("keydown", handleKeyDown, true);
      document.addEventListener("contextmenu", handleContextMenu, true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
    };
  }, [isCapturing, isOpen, onCapture, onClose]);

  const handleStartCapture = () => {
    setCapturedKey("");
    setIsCapturing(true);
  };

  const handleSave = () => {
    onCapture(capturedKey);
    onClose();
  };

  const handleClear = () => {
    onCapture("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capture Keybind</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              {isCapturing ? 
                "Press any key combination or right-click to clear..." : 
                "Click 'Start Capture' and then press your desired key combination"
              }
            </p>

            <div className="border rounded-lg p-4 min-h-[60px] flex items-center justify-center bg-gray-50">
              <span className="font-mono text-lg">
                {capturedKey || currentKeybind || "No keybind set"}
              </span>
            </div>
          </div>

          <div className="flex justify-between space-x-2">
            <Button
              onClick={handleStartCapture}
              disabled={isCapturing}
              variant="outline"
            >
              {isCapturing ? "Capturing..." : "Start Capture"}
            </Button>

            <div className="space-x-2">
              <Button onClick={handleClear} variant="destructive">
                Clear
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!capturedKey}
              >
                Save
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-right">
            Right-click during capture to set to none
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}