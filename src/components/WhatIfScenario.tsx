import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const WhatIfScenario = () => {
  const { toast } = useToast();
  const [discharge, setDischarge] = useState([0]);
  const [airTemp, setAirTemp] = useState([0]);
  const [storage, setStorage] = useState([0]);

  const handleRun = () => {
    const tempChange =
      discharge[0] * 0.02 + airTemp[0] * 0.08 - storage[0] * 0.01;
    const newTemp = (18.9 + tempChange).toFixed(1);
    
    toast({
      title: "Scenario Complete",
      description: `Predicted outflow temperature: ${newTemp}°C (${tempChange > 0 ? '+' : ''}${tempChange.toFixed(1)}°C change)`,
    });
  };

  const handleReset = () => {
    setDischarge([0]);
    setAirTemp([0]);
    setStorage([0]);
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
              {discharge[0] > 0 ? '+' : ''}{discharge[0]}%
            </Badge>
          </div>
          <Slider
            value={discharge}
            onValueChange={setDischarge}
            min={-50}
            max={50}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Air Temperature Change (°C)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {airTemp[0] > 0 ? '+' : ''}{airTemp[0]}°C
            </Badge>
          </div>
          <Slider
            value={airTemp}
            onValueChange={setAirTemp}
            min={-10}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">
              Storage Change (%)
            </Label>
            <Badge variant="secondary" className="font-mono">
              {storage[0] > 0 ? '+' : ''}{storage[0]}%
            </Badge>
          </div>
          <Slider
            value={storage}
            onValueChange={setStorage}
            min={-30}
            max={30}
            step={5}
            className="w-full"
          />
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
          <strong className="text-foreground">Usage:</strong> Adjust operational
          parameters to explore their impact on predicted outflow temperature. This
          helps operators understand sensitivity and make informed decisions for
          compliance and ecological management.
        </p>
      </div>
    </div>
  );
};
