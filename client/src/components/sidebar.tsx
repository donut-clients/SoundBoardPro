import { Link, useLocation } from "wouter";
import { Grid3X3, Upload, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage?: string;
  onSettingsClick?: () => void;
}

export function Sidebar({ currentPage, onSettingsClick }: SidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-custom rounded-lg flex items-center justify-center">
            <div className="text-white text-lg">♪</div>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-purple-custom">SoundBoard Pro</h1>
            <p className="text-sm text-gray-600">Audio Control Center</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/" className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors",
              isActive("/") 
                ? "bg-purple-50 text-purple-custom font-medium" 
                : "text-gray-600 hover:bg-gray-50"
            )}>
              <Grid3X3 className="w-5 h-5" />
              <span>Sound Board</span>
            </Link>
          </li>
          <li>
            <Link href="/upload" className={cn(
              "flex items-center space-x-3 p-3 rounded-lg transition-colors",
              isActive("/upload") 
                ? "bg-purple-50 text-purple-custom font-medium" 
                : "text-gray-600 hover:bg-gray-50"
            )}>
              <Upload className="w-5 h-5" />
              <span>Upload Sounds</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={onSettingsClick}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
