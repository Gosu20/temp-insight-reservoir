import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";

interface ForecastChartProps {
  horizon: 1 | 3 | 7;
}

export const ForecastChart = ({ horizon }: ForecastChartProps) => {
  const generateData = () => {
    const baseTemp = 18.5;
    const historical = Array.from({ length: 7 }, (_, i) => ({
      day: `Day ${i - 6}`,
      actual: baseTemp + Math.sin(i * 0.5) * 1.2 + (Math.random() - 0.5) * 0.3,
    }));

    const forecast = Array.from({ length: horizon }, (_, i) => ({
      day: `Day +${i + 1}`,
      predicted: baseTemp + 0.4 + i * 0.3 + Math.sin((7 + i) * 0.5) * 1.2,
      upper: baseTemp + 0.4 + i * 0.3 + Math.sin((7 + i) * 0.5) * 1.2 + 1.5,
      lower: baseTemp + 0.4 + i * 0.3 + Math.sin((7 + i) * 0.5) * 1.2 - 1.5,
    }));

    return [...historical, ...forecast];
  };

  const data = generateData();

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
        />
        <Legend />
        
        {/* Confidence interval */}
        <Area
          type="monotone"
          dataKey="upper"
          stroke="none"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
          name="Upper CI"
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="none"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
          name="Lower CI"
        />
        
        {/* Historical actual */}
        <Line
          type="monotone"
          dataKey="actual"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          dot={{ r: 3 }}
          name="Historical"
        />
        
        {/* Predicted */}
        <Line
          type="monotone"
          dataKey="predicted"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 4 }}
          name="Forecast"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
