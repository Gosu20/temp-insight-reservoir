import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export const InputPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Data Updated",
        description: "Latest observations loaded from USGS NWIS",
      });
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">Current Conditions</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temp-out" className="text-sm text-muted-foreground">
              Outflow Temperature (°C)
            </Label>
            <Input
              id="temp-out"
              type="number"
              defaultValue="18.5"
              step="0.1"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp-in" className="text-sm text-muted-foreground">
              Inflow Temperature (°C)
            </Label>
            <Input
              id="temp-in"
              type="number"
              defaultValue="16.2"
              step="0.1"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="discharge" className="text-sm text-muted-foreground">
              Discharge (m³/s)
            </Label>
            <Input
              id="discharge"
              type="number"
              defaultValue="142.5"
              step="0.1"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage" className="text-sm text-muted-foreground">
              Storage (MCM)
            </Label>
            <Input
              id="storage"
              type="number"
              defaultValue="285.3"
              step="0.1"
              className="font-mono"
            />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="mb-4 font-semibold text-foreground">Meteorology</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="air-temp" className="text-sm text-muted-foreground">
              Air Temperature (°C)
            </Label>
            <Input
              id="air-temp"
              type="number"
              defaultValue="22.8"
              step="0.1"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solar" className="text-sm text-muted-foreground">
              Solar Radiation (W/m²)
            </Label>
            <Input
              id="solar"
              type="number"
              defaultValue="425"
              step="1"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="wind" className="text-sm text-muted-foreground">
              Wind Speed (m/s)
            </Label>
            <Input
              id="wind"
              type="number"
              defaultValue="3.2"
              step="0.1"
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="humidity" className="text-sm text-muted-foreground">
              Relative Humidity (%)
            </Label>
            <Input
              id="humidity"
              type="number"
              defaultValue="65"
              step="1"
              className="font-mono"
            />
          </div>
        </div>
      </Card>

      <Button className="w-full" size="lg">
        Generate Forecast
      </Button>
    </div>
  );
};
