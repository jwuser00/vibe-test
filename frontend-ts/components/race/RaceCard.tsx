"use client";

import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PlaceIcon from "@mui/icons-material/Place";
import { Race } from "@/lib/types";
import { toKST, distanceTypeLabel } from "@/lib/utils/format";
import RaceStatusChip from "./RaceStatusChip";

interface RaceCardProps {
  race: Race;
}

export default function RaceCard({ race }: RaceCardProps) {
  const router = useRouter();
  const kstDate = toKST(race.race_date);

  return (
    <Card>
      <CardActionArea onClick={() => router.push(`/races/${race.id}`)}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {race.race_name}
            </Typography>
            <RaceStatusChip status={race.status} />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {kstDate.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
              </Typography>
            </Box>

            {race.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PlaceIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  {race.location}
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              {distanceTypeLabel(race.distance_type)}
              {race.distance_type === "custom" && race.distance_custom
                ? ` (${(race.distance_custom / 1000).toFixed(1)}km)`
                : ""}
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
