"use client";

import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SpeedIcon from "@mui/icons-material/Speed";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Activity } from "@/lib/types";
import { toKST, formatTimeFromSeconds, formatPace } from "@/lib/utils/format";

interface ActivityCardProps {
  activity: Activity;
  onDelete: (e: React.MouseEvent, id: number) => void;
}

export default function ActivityCard({ activity, onDelete }: ActivityCardProps) {
  const router = useRouter();
  const kstDate = toKST(activity.start_time);

  return (
    <Card>
      <CardActionArea onClick={() => router.push(`/activity/${activity.id}`)}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DirectionsRunIcon sx={{ color: "#fff", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {kstDate.toLocaleDateString("ko-KR")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kstDate.toLocaleTimeString("ko-KR")}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e, activity.id);
              }}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>

          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PlaceIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Distance
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>
                {(activity.total_distance / 1000).toFixed(2)} km
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Time
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>
                {formatTimeFromSeconds(activity.total_time)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <SpeedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Pace
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>
                {formatPace(activity.avg_pace)} /km
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FavoriteIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Avg HR
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>
                {activity.avg_hr ? Math.round(activity.avg_hr) : "-"} bpm
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
