import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from "recharts";
import { useReservoir } from "@/contexts/ReservoirContext";
import { useMemo } from "react";
import { AlertCircle } from "lucide-react";

export const ForecastChart = () => {
  const { forecastInputs, predictions, activeHorizon, hasForecast } = useReservoir();

  const data = useMemo(() => {
    if (!forecastInputs || !predictions) {
      return null;
    }

    const baseTemp = forecastInputs.tempOut;
    const pred = predictions[activeHorizon];

    // Generate historical data (last 7 days with some variation)
    const historical = Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i - 6}`,
      actual: baseTemp + Math.sin(i * 0.5) * 1.2 - 0.5 + (i * 0.1),
      predicted: undefined as number | undefined,
      upper: undefined as number | undefined,
      lower: undefined as number | undefined,
    }));

    // Add current day
    const current = {
      day: "Today",
      actual: baseTemp,
      predicted: undefined as number | undefined,
      upper: undefined as number | undefined,
      lower: undefined as number | undefined,
    };

    // Generate forecast
    const forecast = Array.from({ length: activeHorizon }, (_, i) => {
      const progress = (i + 1) / activeHorizon;
      const tempChange = pred.change * progress;
      const predictedTemp = baseTemp + tempChange;
      const uncertainty = 0.5 + (i + 1) * 0.3;

      return {
        day: `Day +${i + 1}`,
        actual: undefined as number | undefined,
        predicted: Number(predictedTemp.toFixed(1)),
        upper: Number((predictedTemp + uncertainty).toFixed(1)),
        lower: Number((predictedTemp - uncertainty).toFixed(1)),
      };
    });

    return [...historical, current, ...forecast];
  }, [forecastInputs, predictions, activeHorizon]);

  if (!hasForecast || !data) {
    return (
      <div className="flex items-center justify-center h-[350px] bg-muted/30 rounded-lg">
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Enter inputs and click "Generate Forecast"</p>
          <p className="text-xs mt-1">to see temperature predictions</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="day"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
        />
        <YAxis
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          domain={['dataMin - 2', 'dataMax + 2']}
          label={{
            value: "Temperature (°C)",
            angle: -90,
            position: "insideLeft",
            style: { fill: "hsl(var(--muted-foreground))", fontSize: 12 },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number | undefined) =>
            value !== undefined ? [`${value}°C`, ""] : ["-", ""]
          }
        />
        <Legend />

        {/* Confidence interval area */}
        <Area
          type="monotone"
          dataKey="upper"
          stroke="none"
          fill="hsl(var(--primary))"
          fillOpacity={0.15}
          name="95% CI Upper"
          connectNulls={false}
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="none"
          fill="hsl(var(--background))"
          fillOpacity={1}
          name="95% CI Lower"
          connectNulls={false}
        />

        {/* Historical actual values */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ r: 3, fill: "hsl(var(--chart-1))" }}
          name="Historical"
          connectNulls={false}
        />

        {/* Predicted values */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4, fill: "hsl(var(--accent))" }}
          name="Forecast"
          connectNulls={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
