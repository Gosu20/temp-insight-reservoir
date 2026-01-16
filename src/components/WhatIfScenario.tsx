import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReservoir } from "@/contexts/ReservoirContext";

export const WhatIfScenario = () => {
  const { toast } = useToast();
  const { inputs, currentPrediction } = useReservoir();
  const [dischargeChange, setDischargeChange] = useState([0]);
  const [airTempChange, setAirTempChange] = useState([0]);
  const [storageChange, setStorageChange] = useState([0]);

  const handleRun = () => {
    // Apply changes to calculate scenario prediction
    const newDischarge = inputs.discharge * (1 + dischargeChange[0] / 100);
    const newAirTemp = inputs.airTemp + airTempChange[0];
    const newStorage = inputs.storage * (1 + storageChange[0] / 100);
    
    // Simplified model for scenario analysis
    const baseTemp = currentPrediction.predicted;
    const dischargeFactor = -0.02 * dischargeChange[0];
    const airTempFactor = 0.08 * airTempChange[0];
    const storageFactor = 0.01 * storageChange[0];
    
    const tempChange = dischargeFactor + airTempFactor + storageFactor;
    const newTemp = baseTemp + tempChange;
    
    toast({
      title: "Scenario Complete",
      description: `Predicted outflow temperature: ${newTemp.toFixed(1)}°C (${tempChange > 0 ? '+' : ''}${tempChange.toFixed(1)}°C change from baseline)`,
    });
  };

  const handleReset = () => {
    setDischargeChange([0]);
    setAirTempChange([0]);
    setStorageChange([0]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Discharge Change (%)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {dischargeChange[0] > 0 ? '+' : ''}{dischargeChange[0]}%
            </Badge>
          </div>
          <Slider
            value={dischargeChange}
            onValueChange={setDischargeChange}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Current: {inputs.discharge.toFixed(1)} m³/s → {(inputs.discharge * (1 + dischargeChange[0] / 100)).toFixed(1)} m³/s
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Air Temperature Change (°C)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {airTempChange[0] > 0 ? '+' : ''}{airTempChange[0]}°C
            </Badge>
          </div>
          <Slider
            value={airTempChange}
            onValueChange={setAirTempChange}
            min={-10}
            max={10}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Current: {inputs.airTemp.toFixed(1)}°C → {(inputs.airTemp + airTempChange[0]).toFixed(1)}°C
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Storage Change (%)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {storageChange[0] > 0 ? '+' : ''}{storageChange[0]}%
            </Badge>
          </div>
          <Slider
            value={storageChange}
            onValueChange={setStorageChange}
            min={-30}
            max={30}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Current: {inputs.storage.toFixed(1)} MCM → {(inputs.storage * (1 + storageChange[0] / 100)).toFixed(1)} MCM
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={handleRun}>
          <Play className="mr-2 h-4 w-4" />
          Run Scenario
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Baseline prediction:</strong>{" "}
          {currentPrediction.predicted}°C. Adjust operational parameters above 
          to explore their impact on outflow temperature.
        </p>
      </div>
    </div>
  );
};
