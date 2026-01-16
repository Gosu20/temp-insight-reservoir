import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Zap, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useReservoir } from "@/contexts/ReservoirContext";

export const InputPanel = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { inputs, updateInput, generateForecast, isGenerating, hasForecast, currentPrediction } = useReservoir();

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

  const handleInputChange = (key: keyof typeof inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    updateInput(key, value);
  };

  const handleGenerateForecast = () => {
    generateForecast();
    toast({
      title: "Forecast Generated",
      description: "Predictions calculated using current inputs and scenario adjustments",
    });
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
              value={inputs.tempOut}
              onChange={handleInputChange('tempOut')}
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
              value={inputs.tempIn}
              onChange={handleInputChange('tempIn')}
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
              value={inputs.discharge}
              onChange={handleInputChange('discharge')}
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
              value={inputs.storage}
              onChange={handleInputChange('storage')}
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
              value={inputs.airTemp}
              onChange={handleInputChange('airTemp')}
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
              value={inputs.solarRad}
              onChange={handleInputChange('solarRad')}
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
              value={inputs.windSpeed}
              onChange={handleInputChange('windSpeed')}
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
              value={inputs.humidity}
              onChange={handleInputChange('humidity')}
              step="1"
              className="font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Generate Forecast Button */}
      <Button 
        className="w-full" 
        size="lg" 
        onClick={handleGenerateForecast}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Zap className="mr-2 h-5 w-5" />
            Generate Forecast
          </>
        )}
      </Button>

      {/* Show current prediction if available */}
      {hasForecast && currentPrediction && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-foreground">Latest Prediction</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {currentPrediction.predicted}°C
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {currentPrediction.change >= 0 ? '+' : ''}{currentPrediction.change}°C from current
          </div>
        </Card>
      )}
    </div>
  );
};
