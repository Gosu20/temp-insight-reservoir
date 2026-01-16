import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { useReservoir } from "@/contexts/ReservoirContext";

export const WhatIfScenario = () => {
  const { inputs, adjustments, updateAdjustment, resetAdjustments, hasForecast, forecastAdjustments } = useReservoir();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Discharge Change (%)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {adjustments.dischargeChange > 0 ? '+' : ''}{adjustments.dischargeChange}%
            </Badge>
          </div>
          <Slider
            value={[adjustments.dischargeChange]}
            onValueChange={([v]) => updateAdjustment('dischargeChange', v)}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Base: {inputs.discharge.toFixed(1)} m³/s → Adjusted: {(inputs.discharge * (1 + adjustments.dischargeChange / 100)).toFixed(1)} m³/s
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Air Temperature Change (°C)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {adjustments.airTempChange > 0 ? '+' : ''}{adjustments.airTempChange}°C
            </Badge>
          </div>
          <Slider
            value={[adjustments.airTempChange]}
            onValueChange={([v]) => updateAdjustment('airTempChange', v)}
            min={-10}
            max={10}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Base: {inputs.airTemp.toFixed(1)}°C → Adjusted: {(inputs.airTemp + adjustments.airTempChange).toFixed(1)}°C
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Storage Change (%)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {adjustments.storageChange > 0 ? '+' : ''}{adjustments.storageChange}%
            </Badge>
          </div>
          <Slider
            value={[adjustments.storageChange]}
            onValueChange={([v]) => updateAdjustment('storageChange', v)}
            min={-30}
            max={30}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Base: {inputs.storage.toFixed(1)} MCM → Adjusted: {(inputs.storage * (1 + adjustments.storageChange / 100)).toFixed(1)} MCM
          </p>
        </div>
      </div>

      <Button variant="outline" onClick={resetAdjustments} className="w-full">
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset Adjustments
      </Button>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">How to use:</strong>{" "}
          Adjust the sliders above to simulate operational changes, then click{" "}
          <strong className="text-foreground">"Generate Forecast"</strong> to see 
          how these changes affect the predicted outflow temperature.
        </p>
        {hasForecast && forecastAdjustments && (
          <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
            <strong className="text-foreground">Last forecast used:</strong>{" "}
            Discharge {forecastAdjustments.dischargeChange >= 0 ? '+' : ''}{forecastAdjustments.dischargeChange}%, 
            Air Temp {forecastAdjustments.airTempChange >= 0 ? '+' : ''}{forecastAdjustments.airTempChange}°C, 
            Storage {forecastAdjustments.storageChange >= 0 ? '+' : ''}{forecastAdjustments.storageChange}%
          </p>
        )}
      </div>
    </div>
  );
};
