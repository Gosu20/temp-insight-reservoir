import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useReservoir } from "@/contexts/ReservoirContext";

const categoryColors: Record<string, string> = {
  temporal: "hsl(var(--chart-1))",
  meteorology: "hsl(var(--chart-2))",
  hydrology: "hsl(var(--chart-3))",
  operations: "hsl(var(--chart-4))",
  other: "hsl(var(--chart-5))",
};

export const FeatureImportance = () => {
  const { featureImportance, inputs } = useReservoir();

  // Convert importance to decimal for chart
  const chartData = featureImportance.map(item => ({
    ...item,
    importanceDecimal: item.importance / 100,
  }));

  // Generate dynamic insight based on current conditions
  const getInsight = () => {
    const tempDiff = Math.abs(inputs.airTemp - inputs.tempOut);
    if (tempDiff > 5) {
      return `Air temperature is ${inputs.airTemp > inputs.tempOut ? 'above' : 'below'} water temperature by ${tempDiff.toFixed(1)}°C, increasing its influence on the forecast.`;
    }
    if (inputs.solarRad > 500) {
      return `High solar radiation (${inputs.solarRad} W/m²) is driving significant surface heating effects.`;
    }
    if (inputs.discharge < 50) {
      return `Low discharge rates increase residence time, amplifying storage and thermal stratification effects.`;
    }
    return `Current outflow temperature (${inputs.tempOut}°C) is the primary predictor due to strong thermal persistence.`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-chart-1" />
          <span className="text-muted-foreground">Temporal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-chart-2" />
          <span className="text-muted-foreground">Meteorology</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-chart-3" />
          <span className="text-muted-foreground">Hydrology</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-chart-4" />
          <span className="text-muted-foreground">Operations</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[0, 0.35]}
            tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="feature"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
            formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
          />
          <Bar dataKey="importanceDecimal" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || "hsl(var(--primary))"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Key Insight:</strong>{" "}
          {getInsight()}
        </p>
      </div>
    </div>
  );
};
