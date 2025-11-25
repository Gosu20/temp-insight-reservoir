import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";

interface MetricsPanelProps {
  activeHorizon: 1 | 3 | 7;
}

export const MetricsPanel = ({ activeHorizon }: MetricsPanelProps) => {
  const metrics = {
    1: {
      predicted: 18.9,
      change: 0.4,
      mae: 0.82,
      r2: 0.94,
      confidence: 80,
    },
    3: {
      predicted: 19.5,
      change: 1.0,
      mae: 1.05,
      r2: 0.89,
      confidence: 80,
    },
    7: {
      predicted: 20.2,
      change: 1.7,
      mae: 1.18,
      r2: 0.85,
      confidence: 80,
    },
  };

  const current = metrics[activeHorizon];
  const isIncrease = current.change > 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Predicted T_out</p>
            <p className="text-2xl font-bold text-foreground">{current.predicted}°C</p>
            <div className="flex items-center gap-1 mt-1">
              {isIncrease ? (
                <TrendingUp className="h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="h-3 w-3 text-accent" />
              )}
              <span className={`text-xs ${isIncrease ? 'text-destructive' : 'text-accent'}`}>
                {isIncrease ? '+' : ''}{current.change}°C
              </span>
            </div>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Activity className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">MAE</p>
            <p className="text-2xl font-bold text-foreground">{current.mae}°C</p>
            <p className="text-xs text-muted-foreground mt-1">Mean Absolute Error</p>
          </div>
          <div className="rounded-full bg-accent/10 p-3">
            <Target className="h-5 w-5 text-accent" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">R² Score</p>
            <p className="text-2xl font-bold text-foreground">{current.r2}</p>
            <p className="text-xs text-muted-foreground mt-1">Model Performance</p>
          </div>
          <div className="rounded-full bg-chart-2/10 p-3">
            <TrendingUp className="h-5 w-5 text-chart-2" />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
            <p className="text-2xl font-bold text-foreground">{current.confidence}%</p>
            <p className="text-xs text-muted-foreground mt-1">Prediction Interval</p>
          </div>
          <div className="rounded-full bg-chart-3/10 p-3">
            <Activity className="h-5 w-5 text-chart-3" />
          </div>
        </div>
      </Card>
    </div>
  );
};
