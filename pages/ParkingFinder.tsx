import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Star } from "lucide-react";

const spots = [
  { id: 1, name: "Pilot Flying J #412", distance: 2.1, available: 12, total: 40, rating: 4.2, amenities: "showers, food, wifi" },
  { id: 2, name: "Love's Travel Stop #287", distance: 3.5, available: 8, total: 35, rating: 4.5, amenities: "showers, food, laundry" },
  { id: 3, name: "TA Travel Center #103", distance: 5.2, available: 3, total: 50, rating: 3.8, amenities: "showers, food, scale" },
  { id: 4, name: "Rest Area I-35 MM 158", distance: 8.7, available: 22, total: 25, rating: 3.0, amenities: "restrooms" },
];

export default function ParkingFinder() {
  return (
    <AppLayout>
      <DashboardHeader title="Parking Finder" showNotifications={false} />
      <div className="p-4 space-y-3 pb-20">
        {spots.map(s => (
          <Card key={s.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin size={10} /> {s.distance} miles
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.available > 5 ? "bg-green-500" : s.available > 0 ? "bg-yellow-500" : "bg-red-500"}`}
                      style={{ width: `${(s.available / s.total) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{s.available}/{s.total}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Star size={10} className="text-yellow-500" />
                  <span className="text-[10px]">{s.rating}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">{s.amenities}</span>
                </div>
              </div>
              <Button size="sm" className="bg-accent text-white h-8 text-xs">
                <Navigation size={12} className="mr-1" /> Navigate
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
