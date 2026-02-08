"use client";

import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import TimerIcon from "@mui/icons-material/Timer";
import { Race } from "@/lib/types";
import { toKST, distanceTypeLabel, formatTargetTime, daysUntil } from "@/lib/utils/format";

interface UpcomingRaceCardProps {
  race: Race;
}

export default function UpcomingRaceCard({ race }: UpcomingRaceCardProps) {
  const router = useRouter();
  const kstDate = toKST(race.race_date);
  const days = daysUntil(race.race_date);

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "primary.light",
        borderLeft: "4px solid",
        borderLeftColor: "primary.main",
      }}
    >
      <CardActionArea onClick={() => router.push(`/races/${race.id}`)}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>
              {race.race_name}
            </Typography>
            <Chip
              label={days > 0 ? `D-${days}` : days === 0 ? "D-Day" : `D+${Math.abs(days)}`}
              color="primary"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {kstDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
              </Typography>
            </Box>

            {race.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PlaceIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {race.location}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {distanceTypeLabel(race.distance_type)}
                {race.distance_type === "custom" && race.distance_custom
                  ? ` (${(race.distance_custom / 1000).toFixed(1)}km)`
                  : ""}
              </Typography>
            </Box>

            {race.target_time && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TimerIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  목표: {formatTargetTime(race.target_time)}
                </Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
