import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import DashboardHeader from "@/components/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, MapPin, Loader2, Search } from "lucide-react";

interface FuelStop {
  name: string; brand: string; dieselPrice: number | null;
  address: string; lat: number; lng: number; lastUpdated: string | null;
}

export default function LiveFuelPrices() {
  const [query, setQuery] = useState("");
  const [prices, setPrices] = useState<FuelStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [locationName, setLocationName] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setPrices([]);

    try {
      // Step 1: Geocode the search query
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      const geoData = await geoRes.json();
      if (!geoData[0]) throw new Error("Location not found");

      const { lat, lng, label } = geoData[0];
      setLocationName(label || query);

      // Step 2: Fetch live prices for those coordinates
      const priceRes = await fetch(`/api/live-prices?lat=${lat}&lng=${lng}&radius=50`);
      const priceData = await priceRes.json();
      
      if (priceData.error) throw new Error(priceData.error);
      setPrices(priceData.prices || []);
    } catch (e: any) {
      setError(e.message || "Failed to load prices");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  return (
    <AppLayout>
      <DashboardHeader title="Live Fuel Prices" showNotifications={false} />
      <div className="p-4 space-y-3 pb-20">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="City, ZIP, or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 h-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading} className="bg-accent text-white h-10 flex-shrink-0">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </Button>
        </div>

        {/* Location badge */}
        {locationName && (
          <Card className="p-3 bg-accent/10 border-accent/30">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap size={12} className="text-accent" />
              Showing diesel prices near <span className="font-semibold text-foreground">{locationName}</span>
            </p>
          </Card>
        )}

        {/* Results */}
        {loading && (
          <div className="text-center py-16">
            <Loader2 size={32} className="animate-spin mx-auto mb-3 text-accent/40" />
            <p className="text-sm text-muted-foreground">Searching live prices...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && searched && prices.length === 0 && (
          <div className="text-center py-16">
            <Zap size={32} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">No diesel prices found near {locationName || query}</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different city or ZIP code</p>
          </div>
        )}

        {!loading && !error && prices.length > 0 && (
          <>
            <p className="text-xs text-muted-foreground">{prices.length} stations found</p>
            {prices.map((s, i) => (
              <Card key={i} className="p-3 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {s.address || "Unknown address"}
                    </p>
                    {s.lastUpdated && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Updated {new Date(s.lastUpdated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-accent">${s.dieselPrice?.toFixed(2) || "--"}</p>
                    <p className="text-[10px] text-muted-foreground">per gallon</p>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}

        {/* Initial idle state */}
        {!loading && !searched && (
          <div className="text-center py-20">
            <Zap size={48} className="mx-auto mb-4 text-muted-foreground/20" />
            <h2 className="font-bold text-lg text-foreground mb-1">Live Diesel Prices</h2>
            <p className="text-sm text-muted-foreground">Enter a city or ZIP code above to find real-time diesel prices from GasBuddy</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
