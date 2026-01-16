import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ForecastChart } from "@/components/ForecastChart";
import { FeatureImportance } from "@/components/FeatureImportance";
import { InputPanel } from "@/components/InputPanel";
import { MetricsPanel } from "@/components/MetricsPanel";
import { WhatIfScenario } from "@/components/WhatIfScenario";
import { ReservoirProvider, useReservoir } from "@/contexts/ReservoirContext";
import { Droplets, TrendingUp, Brain, Settings, Download } from "lucide-react";
import { generatePythonBackend } from "@/lib/pythonBackendGenerator";
import { toast } from "sonner";

const DashboardContent = () => {
  const { activeHorizon, setActiveHorizon } = useReservoir();

  const handleDownloadBackend = async () => {
    toast.info("Generating Python backend...");
    try {
      await generatePythonBackend();
      toast.success("Backend code downloaded successfully!");
    } catch (error) {
      toast.error("Failed to generate backend code");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary p-2">
                <Droplets className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Reservoir Temperature Forecast
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interpretable ML for Outflow Water Temperature Prediction
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleDownloadBackend} 
                variant="outline" 
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Python Backend
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Model: GAM v2.1</span>
                <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Panel - Inputs */}
          <div className="lg:col-span-4">
            <InputPanel />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Metrics */}
            <MetricsPanel />

            {/* Forecast Chart */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Temperature Forecast
                  </h2>
                </div>
                <Tabs value={activeHorizon.toString()} onValueChange={(v) => setActiveHorizon(Number(v) as 1 | 3 | 7)}>
                  <TabsList>
                    <TabsTrigger value="1">1 Day</TabsTrigger>
                    <TabsTrigger value="3">3 Days</TabsTrigger>
                    <TabsTrigger value="7">7 Days</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <ForecastChart />
            </Card>

            {/* Interpretability */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  Feature Importance & Drivers
                </h2>
              </div>
              <FeatureImportance />
            </Card>

            {/* What-If Scenarios */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-foreground">
                  What-If Scenarios
                </h2>
              </div>
              <WhatIfScenario />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ReservoirProvider>
      <DashboardContent />
    </ReservoirProvider>
  );
};

export default Index;
