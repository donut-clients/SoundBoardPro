import { Link, useLocation } from "wouter";
import { Grid3X3, Upload, Settings, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentPage?: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    {
      icon: Grid3X3,
      label: "Soundboard",
      href: "/",
      id: "soundboard"
    },
    {
      icon: Upload,
      label: "Upload",
      href: "/upload", 
      id: "upload"
    },
    {
      icon: Database,
      label: "Database",
      href: "/database",
      id: "database"
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      id: "settings"
    }
  ];

  return (
    <div className="w-64 bg-white/10 backdrop-blur-sm border-r border-white/20 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">Soundboard</h1>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || location === item.href;

            return (
              <li key={item.id}>
                <Link href={item.href} className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                    isActive 
                      ? "bg-white/20 text-white" 
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  )}>
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}