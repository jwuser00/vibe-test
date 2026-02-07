"use client";

import Box from "@mui/material/Box";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Lap } from "@/lib/types";

interface PaceHRChartProps {
  laps: Lap[];
}

export default function PaceHRChart({ laps }: PaceHRChartProps) {
  return (
    <Box sx={{ width: "100%", height: 350 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={laps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
          <XAxis dataKey="lap_number" stroke="#5a5c69" />
          <YAxis
            yAxisId="left"
            stroke="#4e73df"
            label={{
              value: "Pace (sec/km)",
              angle: -90,
              position: "insideLeft",
              fill: "#4e73df",
            }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#e74a3b"
            label={{
              value: "HR (bpm)",
              angle: 90,
              position: "insideRight",
              fill: "#e74a3b",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e3e6f0",
              borderRadius: 8,
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="pace"
            stroke="#4e73df"
            name="Pace (sec/km)"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avg_hr"
            stroke="#e74a3b"
            name="Avg HR"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}
