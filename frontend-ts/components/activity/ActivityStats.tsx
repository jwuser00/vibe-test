"use client";

import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import FavoriteIcon from "@mui/icons-material/Favorite";
import BoltIcon from "@mui/icons-material/Bolt";
import { Activity } from "@/lib/types";
import { formatTime, formatPace } from "@/lib/utils/format";

interface ActivityStatsProps {
  activity: Activity;
}

const stats = [
  {
    key: "distance",
    label: "Total Distance",
    icon: <PlaceIcon fontSize="small" />,
    getValue: (a: Activity) => `${(a.total_distance / 1000).toFixed(2)}`,
    unit: "km",
  },
  {
    key: "time",
    label: "Total Time",
    icon: <AccessTimeIcon fontSize="small" />,
    getValue: (a: Activity) => formatTime(a.total_time),
    unit: "",
  },
  {
    key: "pace",
    label: "Avg Pace",
    icon: <SpeedIcon fontSize="small" />,
    getValue: (a: Activity) => formatPace(a.avg_pace),
    unit: "/km",
  },
  {
    key: "hr",
    label: "Avg HR",
    icon: <FavoriteIcon fontSize="small" />,
    getValue: (a: Activity) => (a.avg_hr ? Math.round(a.avg_hr).toString() : "-"),
    unit: "bpm",
  },
  {
    key: "cadence",
    label: "Avg Cadence",
    icon: <BoltIcon fontSize="small" />,
    getValue: (a: Activity) =>
      a.avg_cadence ? Math.round(a.avg_cadence).toString() : "-",
    unit: "spm",
  },
];

export default function ActivityStats({ activity }: ActivityStatsProps) {
  return (
    <Grid container spacing={2}>
      {stats.map((stat) => (
        <Grid key={stat.key} size={{ xs: 6, sm: 4, md: 2.4 }}>
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                color: "text.secondary",
                mb: 0.5,
              }}
            >
              {stat.icon}
              <Typography variant="caption">{stat.label}</Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {stat.getValue(activity)}{" "}
              {stat.unit && (
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                >
                  {stat.unit}
                </Typography>
              )}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
