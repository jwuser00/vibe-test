"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { MonthlyRunningDay } from "@/lib/types";
import { formatPace } from "@/lib/utils/format";

interface MonthlyRunningChartProps {
  data: MonthlyRunningDay[];
}

export default function MonthlyRunningChart({ data }: MonthlyRunningChartProps) {
  const hasAnyRun = data.some((d) => d.distance_km > 0);

  if (data.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">
          이번 달 러닝 기록이 없습니다
        </Typography>
      </Box>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date.substring(8), // DD
    distance_km: d.distance_km,
    avg_pace: d.avg_pace,
  }));

  // Smart Y-axis scaling for distance
  const runDays = data.filter((d) => d.distance_km > 0);
  const maxDistance = runDays.length > 0 ? Math.max(...runDays.map((d) => d.distance_km)) : 10;
  const distanceMax = Math.ceil(maxDistance * 1.2) || 10;

  // Smart Y-axis for pace (inverted: lower is faster)
  const paces = data.filter((d) => d.avg_pace).map((d) => d.avg_pace!);
  const paceMin = paces.length > 0 ? Math.floor(Math.min(...paces) / 30) * 30 : 240;
  const paceMax = paces.length > 0 ? Math.ceil(Math.max(...paces) / 30) * 30 : 480;

  return (
    <Box>
      {!hasAnyRun && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 1 }}>
          아직 이번 달 러닝 기록이 없습니다. 달려볼까요?
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            interval={0}
            tickFormatter={(v) => `${parseInt(v)}`}
          />
          <YAxis
            yAxisId="distance"
            orientation="left"
            domain={[0, distanceMax]}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}km`}
          />
          {paces.length > 0 && (
            <YAxis
              yAxisId="pace"
              orientation="right"
              domain={[paceMin, paceMax]}
              reversed
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatPace(v)}
            />
          )}
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "거리") return [`${v.toFixed(2)} km`, name];
              if (name === "페이스") return [formatPace(v) + " /km", name];
              return [v, name];
            }}
            labelFormatter={(label) => `${parseInt(label)}일`}
          />
          <Legend />
          <Bar
            yAxisId="distance"
            dataKey="distance_km"
            name="거리"
            fill="#4e73df"
            radius={[2, 2, 0, 0]}
            barSize={12}
          />
          {paces.length > 0 && (
            <Line
              yAxisId="pace"
              type="monotone"
              dataKey="avg_pace"
              name="페이스"
              stroke="#e74a3b"
              strokeWidth={2}
              dot={{ r: 3, fill: "#e74a3b" }}
              connectNulls
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </Box>
  );
}
