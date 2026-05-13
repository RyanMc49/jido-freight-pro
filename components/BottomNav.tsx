import { MapPin, Fuel, Briefcase, User, AlertCircle, MessageCircle, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Map", icon: MapPin },
    { path: "/fuel", label: "Fuel", icon: Fuel },
    { path: "/live-fuel", label: "Live Prices", icon: Zap },
    { path: "/alerts", label: "Alerts", icon: AlertCircle },
    { path: "/ai", label: "AI", icon: MessageCircle },
    { path: "/business", label: "Business", icon: Briefcase },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden overflow-x-auto">
      <div className="flex justify-around items-center h-16 min-w-max">
        {navItems.map(({ path, label, icon: Icon }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex flex-col items-center justify-center px-4 h-16 transition-colors whitespace-nowrap border-t-2 ${
              isActive(path)
                ? "text-accent border-accent"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
