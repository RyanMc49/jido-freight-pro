import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, ChevronRight, ChevronDown, LogOut, Truck, Bell, HelpCircle, Shield, PenLine } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function Profile() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { geo, coords, retry } = useGeolocation(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Try loading from localStorage, fall back to generic
    const saved = typeof window !== "undefined" ? localStorage.getItem("jido-display-name") : null;
    setUserName(saved || "Driver");
  }, []);

  const sections = [
    {
      id: "account", label: "Account Settings", icon: User,
      items: [
        { label: "Display Name", value: userName || "Driver", action: () => {
          const name = prompt("Enter your display name:", userName || "Driver");
          if (name) { setUserName(name); localStorage.setItem("jido-display-name", name); }
        }},
        { label: "Location Access", value: geo.status === "success" ? "Granted ✓" : geo.status === "denied" ? "Denied — tap to retry" : "Checking...", action: () => { if (geo.status !== "success") retry(); }},
        { label: "App Version", value: "JIDO FREIGHT PRO v2.0", action: undefined },
      ],
    },
    {
      id: "truck", label: "Truck Profile", icon: Truck,
      items: [
        { label: "Setup", value: "Configure your truck specs", action: undefined },
        { label: "Height", value: "Set truck height", action: undefined },
        { label: "Weight", value: "Set max weight", action: undefined },
        { label: "Hazmat", value: "Set hazmat status", action: undefined },
      ],
    },
    {
      id: "prefs", label: "Preferences", icon: Bell,
      items: [
        { label: "Price Alerts", value: "Notify on fuel drops", action: undefined },
        { label: "Route Defaults", value: "Avoid tolls, hazmat routes", action: undefined },
      ],
    },
    {
      id: "help", label: "Help & Support", icon: HelpCircle,
      items: [
        { label: "Contact", value: "support@jidofreight.com", action: undefined },
        { label: "FAQ", value: "Common questions & answers", action: undefined },
      ],
    },
  ];

  return (
    <AppLayout>
      <DashboardHeader title="Profile" />
      <div className="p-4 space-y-3 pb-20">
        {/* User card */}
        <Card className="p-4 flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
            <User size={28} className="text-accent" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-lg">{userName || "Driver"}</p>
            <p className="text-sm text-muted-foreground">Professional Driver</p>
            <p className="text-xs text-accent font-medium mt-0.5">JIDO FREIGHT PRO</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => {
            const name = prompt("Enter your display name:", userName);
            if (name) { setUserName(name); localStorage.setItem("jido-display-name", name); }
          }}>
            <PenLine size={16} className="text-muted-foreground" />
          </Button>
        </Card>

        {/* Expandable sections */}
        {sections.map(section => (
          <Card key={section.id} className="overflow-hidden">
            <button onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left">
              <div className="flex items-center gap-3">
                <section.icon size={18} className="text-accent/60" />
                <span className="font-medium text-sm">{section.label}</span>
              </div>
              {openSection === section.id ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
            </button>
            {openSection === section.id && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="pt-3 space-y-2">
                  {section.items.map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1.5">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <button onClick={item.action} className={`text-sm ${item.action ? "text-accent hover:underline cursor-pointer" : "text-foreground cursor-default"} font-medium`}>
                        {item.value}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}

        <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/5 mt-4"
          onClick={() => { localStorage.clear(); window.location.reload(); }}>
          <LogOut size={16} className="mr-2" />Sign Out
        </Button>
      </div>
    </AppLayout>
  );
}
