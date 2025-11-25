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

export const FeatureImportance = () => {
  const data = [
    { feature: "Seasonality", importance: 0.34, category: "temporal" },
    { feature: "Air Temp", importance: 0.28, category: "meteorology" },
    { feature: "Inflow Temp", importance: 0.18, category: "hydrology" },
    { feature: "Storage", importance: 0.12, category: "operations" },
    { feature: "Solar Radiation", importance: 0.11, category: "meteorology" },
    { feature: "Discharge", importance: 0.09, category: "operations" },
    { feature: "Wind Speed", importance: 0.06, category: "meteorology" },
    { feature: "Lag T_out(t-1)", importance: 0.15, category: "temporal" },
  ].sort((a, b) => b.importance - a.importance);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      temporal: "hsl(var(--chart-1))",
      meteorology: "hsl(var(--chart-2))",
      hydrology: "hsl(var(--chart-3))",
      operations: "hsl(var(--chart-4))",
    };
    return colors[category] || "hsl(var(--primary))";
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-xs">
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
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            type="number"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={[0, 0.4]}
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
          <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-lg bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Key Insight:</strong> Seasonality and air
          temperature are the dominant drivers of outflow temperature predictions,
          contributing over 60% of the model's decision-making. Operations (discharge,
          storage) have moderate influence, enabling what-if scenario planning.
        </p>
      </div>
    </div>
  );
};
