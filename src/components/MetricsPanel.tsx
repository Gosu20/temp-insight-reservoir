import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { useReservoir } from "@/contexts/ReservoirContext";

export const MetricsPanel = () => {
  const { currentPrediction, activeHorizon } = useReservoir();
  const isIncrease = currentPrediction.change > 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Predicted T_out (+{activeHorizon}d)
            </p>
            <p className="text-2xl font-bold text-foreground">
              {currentPrediction.predicted}°C
            </p>
            <div className="flex items-center gap-1 mt-1">
              {isIncrease ? (
                <TrendingUp className="h-3 w-3 text-destructive" />
              ) : (
                <TrendingDown className="h-3 w-3 text-accent" />
              )}
              <span className={`text-xs ${isIncrease ? 'text-destructive' : 'text-accent'}`}>
                {isIncrease ? '+' : ''}{currentPrediction.change}°C
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
            <p className="text-2xl font-bold text-foreground">
              {currentPrediction.mae}°C
            </p>
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
            <p className="text-2xl font-bold text-foreground">
              {currentPrediction.r2}
            </p>
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
            <p className="text-2xl font-bold text-foreground">
              {currentPrediction.confidence}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              ±{(currentPrediction.upperBound - currentPrediction.lowerBound).toFixed(1)}°C
            </p>
          </div>
          <div className="rounded-full bg-chart-3/10 p-3">
            <Activity className="h-5 w-5 text-chart-3" />
          </div>
        </div>
      </Card>
    </div>
  );
};
