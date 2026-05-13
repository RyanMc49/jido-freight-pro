import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  title: string;
  showNotifications?: boolean;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ title, showNotifications = true, onMenuClick }: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
            <Menu size={20} />
          </Button>
        )}
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
      </div>
      {showNotifications && (
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>
      )}
    </div>
  );
}
