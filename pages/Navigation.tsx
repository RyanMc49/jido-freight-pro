import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, Loader2, Crosshair } from "lucide-react";
import MapboxMap, { MapboxMarker, MapboxRoute } from "@/components/MapboxMap";
import { useGeolocation } from "@/hooks/useGeolocation";

interface RouteResult {
  distance: number;
  duration: number;
  coordinates: [number, number][];
}

export default function NavigationScreen() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialDest = params.get("dest") ?? "";

  const { geo, coords: currentLocation, retry: retryLocation } = useGeolocation(true);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState(initialDest);
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [error, setError] = useState("");

  // GPS auto-fill when user taps the crosshair button

  const useCurrentLocation = () => {
    if (geo.status === "success" && currentLocation) {
      setOrigin(`${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`);
    } else {
      retryLocation();
    }
  };

  const handlePlanRoute = async () => {
    if (!origin.trim() || !destination.trim()) {
      setError("Enter both origin and destination");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Step 1: Geocode both addresses
      const [fromRes, toRes] = await Promise.all([
        fetch(`/api/geocode?q=${encodeURIComponent(origin)}`),
        fetch(`/api/geocode?q=${encodeURIComponent(destination)}`),
      ]);
      const fromData = await fromRes.json();
      const toData = await toRes.json();
      
      if (!fromData[0] || !toData[0]) throw new Error("Could not find one or both locations");
      
      // Step 2: Calculate route with coordinates
      const routeRes = await fetch(
        `/api/route?from=${fromData[0].lat},${fromData[0].lng}&to=${toData[0].lat},${toData[0].lng}`
      );
      const routeData = await routeRes.json();
      if (routeData.error) throw new Error(routeData.error);
      setRoute({
        distance: Math.round(routeData.route?.distance || 0),
        duration: routeData.route?.duration || 0,
        coordinates: (routeData.route?.coordinates || []).map((c: number[]) => [c[1], c[0]]),
      });
    } catch (e: any) {
      setError(e.message || "Route calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const hours = route ? Math.floor(route.duration) : 0;
  const mins = route ? Math.round((route.duration - hours) * 60) : 0;
  const eta = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const mapCenter: [number, number] = [-98.5795, 39.8283];
  const markers: MapboxMarker[] = [];
  const mapRoute: MapboxRoute | undefined = route?.coordinates.length ? { coordinates: route.coordinates, color: "#1e88e5" } : undefined;

  return (
    <AppLayout>
      <DashboardHeader title="Navigation" showNotifications={false} />
      <div className="p-4 space-y-3 pb-20">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
            <div className="flex-1 flex gap-1">
              <Input placeholder="Current location" value={origin} onChange={e => setOrigin(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePlanRoute()} className="flex-1" />
              <Button
                size="sm"
                variant={geo.status === "success" && currentLocation ? "default" : "outline"}
                onClick={useCurrentLocation}
                disabled={geo.status === "loading"}
                className="flex-shrink-0 text-xs h-10"
                title="Use current GPS location"
              >
                {geo.status === "loading" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Crosshair size={14} className={geo.status === "success" ? "text-white" : "text-accent"} />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            <Input placeholder="Destination (e.g. Stockton, CA)" value={destination} onChange={e => setDestination(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handlePlanRoute()} />
          </div>
          <Button className="w-full mt-3 bg-accent text-white font-semibold" onClick={handlePlanRoute} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Navigation size={16} className="mr-2" />}
            {loading ? "Calculating..." : "Find Cheapest Diesel"}
          </Button>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </Card>

        <div className="w-full h-64 rounded-xl overflow-hidden border border-border">
          <MapboxMap center={mapCenter} zoom={4} markers={markers} route={mapRoute} className="w-full h-full" />
        </div>

        {route && (
          <Card className="p-4 bg-accent/5 border-accent/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Distance</p>
                <p className="text-2xl font-black text-foreground">{route.distance} <span className="text-sm font-normal text-muted-foreground">mi</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">ETA</p>
                <p className="text-2xl font-black text-foreground">{eta}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
