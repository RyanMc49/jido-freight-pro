import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function AIAssistant() {
  return (
    <AppLayout>
      <DashboardHeader title="AI Co-Pilot" showNotifications={false} />
      <div className="p-4 pb-20">
        <Card className="p-6 text-center">
          <MessageCircle size={48} className="mx-auto mb-3 text-accent/30" />
          <h2 className="font-bold text-lg mb-2">AI Route Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Ask me about routes, fuel stops, weather conditions, or anything trucking.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}
