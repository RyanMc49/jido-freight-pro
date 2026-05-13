import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fuel, AlertCircle, X, Search, Navigation, Loader2, Zap, MapPin, RefreshCw, MessageCircle, Briefcase, User, ChevronRight, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import MapboxMap, { MapboxMarker, MapboxRoute } from "@/components/MapboxMap";
import { useGeolocation } from "@/hooks/useGeolocation";

interface RouteData {
  distance: number; duration: number;
  cheapestStop?: { name: string; dieselPrice: number; address: string; brand: string };
  totalStops: number;
  coordinates: [number, number][];
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState<RouteData | null>(null);
  const { geo, coords: currentLocation, retry: retryLocation } = useGeolocation(true);

  // DO NOT auto-request — mobile browsers require user gesture
  // Location is requested when user taps the button

  const handleSearch = async () => {
    if (!destination.trim()) return;
    if (!currentLocation) { toast.error("Waiting for GPS location..."); retryLocation(); return; }
    
    setLoading(true);
    try {
      // Geocode destination
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(destination.trim())}`);
      const geoData = await geoRes.json();
      if (!geoData[0]) throw new Error("Destination not found");
      const { lat, lng } = geoData[0];

      // Calculate route from current location to destination
      const routeRes = await fetch(`/api/route?from=${currentLocation.lat},${currentLocation.lng}&to=${lat},${lng}`);
      const routeData = await routeRes.json();
      if (routeData.error) throw new Error(routeData.error);

      const cheapest = routeData.cheapest?.[0] || null;
      setRoute({
        distance: Math.round(routeData.route?.distance || 0),
        duration: routeData.route?.duration || 0,
        cheapestStop: cheapest ? { name: cheapest.name, dieselPrice: cheapest.dieselPrice, address: cheapest.address, brand: cheapest.brand } : undefined,
        totalStops: routeData.totalStops || 0,
        coordinates: (routeData.route?.coordinates || []).map((c: number[]) => [c[1], c[0]]),
      });
    } catch (e: any) {
      toast.error(e.message || "Route calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const hours = route ? Math.floor(route.duration) : 0;
  const mins = route ? Math.round((route.duration - hours) * 60) : 0;

  const mapMarkers = useMemo<MapboxMarker[]>(() => {
    const m: MapboxMarker[] = [];
    if (currentLocation) m.push({ id: "me", lat: currentLocation.lat, lng: currentLocation.lng, icon: "truck", popup: "You" });
    if (route?.cheapestStop) m.push({ id: "cheapest", lat: 0, lng: 0, icon: "fuel", color: "#22c55e", popup: `<b>${route.cheapestStop.name}</b><br>$${route.cheapestStop.dieselPrice}/gal` });
    return m;
  }, [currentLocation, route]);

  const mapCenter = useMemo<[number, number]>(() => currentLocation ? [currentLocation.lng, currentLocation.lat] : [-98.5795, 39.8283], [currentLocation]);
  const mapRoute: MapboxRoute | undefined = route?.coordinates.length ? { coordinates: route.coordinates, color: "#1e88e5" } : undefined;

  const handleFindMyLocation = () => retryLocation();
  const handleMenuClick = () => setMenuOpen(!menuOpen);

  const menuItems = [
    { label: "Home Dashboard", path: "/", icon: MapPin },
    { label: "Navigation", path: "/navigation", icon: Navigation },
    { label: "Fuel Finder", path: "/fuel", icon: Fuel },
    { label: "Live Fuel Prices", path: "/live-fuel", icon: Zap },
    { label: "Road Alerts", path: "/alerts", icon: AlertCircle },
    { label: "AI Co-Pilot", path: "/ai", icon: MessageCircle },
    { label: "Business Suite", path: "/business", icon: Briefcase },
    { label: "Profile", path: "/profile", icon: User },
  ];

  return (
    <AppLayout>
      <DashboardHeader title="Map & Navigation" onMenuClick={handleMenuClick} />
      
      {menuOpen && (
        <div className="fixed top-16 left-0 right-0 bg-card border-b border-border z-50 md:hidden shadow-lg">
          <div className="p-2 space-y-0.5">
            {menuItems.map((item) => (
              <button key={item.path} onClick={() => { navigate(item.path); setMenuOpen(false); }}
                className="w-full text-left px-4 py-3 hover:bg-accent/5 rounded-lg text-foreground hover:text-accent transition-colors flex items-center gap-3">
                <item.icon size={18} className="text-accent/60" /><span className="flex-1 font-medium">{item.label}</span><ChevronRight size={14} className="text-muted-foreground/40" />
              </button>
            ))}
            <button onClick={() => setMenuOpen(false)} className="w-full text-left px-4 py-3 rounded-lg hover:bg-destructive/5 text-destructive flex items-center gap-3 mt-1 border-t border-border">
              <X size={18} /><span className="flex-1 font-medium">Close Menu</span>
            </button>
          </div>
        </div>
      )}
      
      <div className="p-4 space-y-4">
        {/* Location card — requires user tap for mobile GPS */}
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Your Current Location</p>
          {geo.status === "success" && currentLocation ? (
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono text-foreground">{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
              <Button size="sm" variant="ghost" onClick={handleFindMyLocation}><RefreshCw size={14} className="text-accent" /></Button>
            </div>
          ) : geo.status === "timeout" ? (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Could not detect location</p>
              <Button size="sm" onClick={handleFindMyLocation} className="bg-accent text-white">
                <MapPin size={14} className="mr-1" /> Try Again
              </Button>
            </div>
          ) : geo.status === "loading" ? (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-accent" />
              <span className="text-sm text-muted-foreground">Detecting...</span>
            </div>
          ) : (
            <Button onClick={handleFindMyLocation} className="w-full bg-accent text-white">
              <MapPin size={16} className="mr-2" />
              {geo.status === "denied" ? "Location Blocked — Tap to Retry" : "📍 Use Current Location"}
            </Button>
          )}
        </div>

        {/* Destination */}
        <div className="bg-card border border-border rounded-lg p-4">
          <label className="block text-sm font-semibold text-foreground mb-2">Where are you heading?</label>
          <div className="flex gap-2">
            <Input type="text" placeholder="Enter destination city or address" value={destination}
              onChange={(e) => setDestination(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="flex-1" />
            <Button onClick={handleSearch} disabled={loading} className="bg-accent text-white">
              {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
            </Button>
          </div>
        </div>

        {/* Map */}
        <div className="w-full h-72 rounded-xl overflow-hidden border border-border shadow-md">
          <MapboxMap center={mapCenter} zoom={currentLocation ? 12 : 4} markers={mapMarkers} route={mapRoute} showTraffic className="w-full h-full" />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Quick Access</h3>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/fuel")}><Fuel size={24} className="text-accent" /><span className="text-xs">Find Fuel</span></Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/live-fuel")}><Zap size={24} className="text-accent" /><span className="text-xs">Live Prices</span></Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate("/alerts")}><AlertCircle size={24} className="text-accent" /><span className="text-xs">Alerts</span></Button>
          </div>
          <Button className="w-full bg-accent hover:bg-accent/90 text-white" onClick={() => navigate("/navigation")}><Navigation size={18} className="mr-2" />Start Navigation</Button>
        </div>

        {/* Route Summary — shows real data after search */}
        {route ? (
          <>
            <Card className="p-4 bg-accent/5 border-accent/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">Route Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Distance:</span><span className="text-foreground font-semibold">{route.distance} miles</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Est. Time:</span><span className="text-foreground font-semibold">{hours}h {mins}m</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Fuel Stops on Route:</span><span className="text-foreground font-semibold">{route.totalStops} stations</span></div>
              </div>
            </Card>

            {route.cheapestStop && (
              <Card className="p-4 border-l-4 border-l-green-500 bg-green-500/5">
                <div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-green-500" /><h3 className="text-sm font-semibold text-foreground">Cheapest Diesel on Route</h3></div>
                <div className="flex justify-between items-end mt-2">
                  <div>
                    <p className="font-bold text-foreground">{route.cheapestStop.name}</p>
                    <p className="text-xs text-muted-foreground">{route.cheapestStop.address}</p>
                  </div>
                  <p className="text-2xl font-black text-green-500">${route.cheapestStop.dieselPrice.toFixed(2)}<span className="text-xs font-normal text-muted-foreground">/gal</span></p>
                </div>
                <Button size="sm" className="mt-2 bg-accent text-white" onClick={() => navigate(`/navigation?dest=${encodeURIComponent(destination)}`)}>
                  <Navigation size={14} className="mr-1" /> Route to Cheapest Fuel
                </Button>
              </Card>
            )}
          </>
        ) : (
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">Route Summary</h3>
            <p className="text-sm text-muted-foreground">Enter a destination above to see your route and find the cheapest diesel along the way.</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
