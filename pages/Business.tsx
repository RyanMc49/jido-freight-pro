import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { DollarSign, Fuel, Gauge, Wrench } from "lucide-react";

const stats = [
  { label: "Revenue", value: "$12,450", icon: DollarSign, color: "text-green-500" },
  { label: "Fuel Costs", value: "$3,820", icon: Fuel, color: "text-orange-500" },
  { label: "Miles Driven", value: "8,240", icon: Gauge, color: "text-blue-500" },
  { label: "Maintenance", value: "$1,200", icon: Wrench, color: "text-purple-500" },
];

export default function Business() {
  return (
    <AppLayout>
      <DashboardHeader title="Business Suite" showNotifications={false} />
      <div className="p-4 space-y-4 pb-20">
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <Card key={s.label} className="p-4">
              <s.icon size={24} className={s.color + " mb-2"} />
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Card>
          ))}
        </div>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Monthly Overview</h3>
          <div className="h-32 bg-muted rounded flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Chart coming soon</p>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
