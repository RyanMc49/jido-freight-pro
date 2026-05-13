import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Plus } from "lucide-react";

const alerts = [
  { id: 1, type: "construction", title: "Construction on I-5 North", description: "Right lane closed for 3 miles. Expect delays.", severity: "medium", time: "2h ago" },
  { id: 2, type: "accident", title: "Accident I-10 East at Exit 47", description: "Multi-vehicle. CHP on scene.", severity: "high", time: "30m ago" },
  { id: 3, type: "weather", title: "High Winds — I-40 West", description: "Gusts up to 55mph. High-profile vehicles use caution.", severity: "high", time: "1h ago" },
  { id: 4, type: "weigh_station", title: "Weigh Station Open — I-15 SB", description: "All commercial vehicles must exit.", severity: "low", time: "3h ago" },
];

const severityColors: Record<string, string> = {
  high: "border-l-red-500 bg-red-500/5",
  medium: "border-l-yellow-500 bg-yellow-500/5",
  low: "border-l-blue-500 bg-blue-500/5",
  critical: "border-l-purple-500 bg-purple-500/5",
};

export default function RoadAlerts() {
  return (
    <AppLayout>
      <DashboardHeader title="Road Alerts" />
      <div className="p-4 space-y-3 pb-20">
        <Button className="w-full bg-accent text-white">
          <Plus size={16} className="mr-1" /> Report Hazard
        </Button>
        {alerts.map(a => (
          <Card key={a.id} className={`p-3 border-l-4 ${severityColors[a.severity] || ""}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase">{a.severity}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock size={10}/>{a.time}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
