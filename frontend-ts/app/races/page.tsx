"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import AddIcon from "@mui/icons-material/Add";
import AppLayout from "@/components/layout/AppLayout";
import RaceCard from "@/components/race/RaceCard";
import { getRaces } from "@/lib/api/races";
import { Race, RaceStatus } from "@/lib/types";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "예정", label: "예정" },
  { value: "완주", label: "완주" },
  { value: "DNS", label: "DNS" },
  { value: "DNF", label: "DNF" },
];

export default function RacesPage() {
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadRaces = useCallback(async () => {
    try {
      const status = statusFilter === "all" ? undefined : statusFilter;
      const data = await getRaces(status);
      setRaces(data);
    } catch {
      // handled by auth interceptor
    }
  }, [statusFilter]);

  useEffect(() => {
    loadRaces();
  }, [loadRaces]);

  return (
    <AppLayout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">대회 관리</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/races/new")}
          sx={{ textTransform: "none" }}
        >
          새 대회 등록
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={(_, v) => v && setStatusFilter(v)}
          size="small"
        >
          {STATUS_FILTERS.map((f) => (
            <ToggleButton key={f.value} value={f.value} sx={{ textTransform: "none", px: 2 }}>
              {f.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {races.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <Typography color="text.secondary">
            {statusFilter === "all" ? "등록된 대회가 없습니다" : `'${statusFilter}' 상태의 대회가 없습니다`}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {races.map((race) => (
            <Grid key={race.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <RaceCard race={race} />
            </Grid>
          ))}
        </Grid>
      )}
    </AppLayout>
  );
}
