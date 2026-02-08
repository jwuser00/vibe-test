"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { RaceFormData, DistanceType } from "@/lib/types";

const DISTANCE_OPTIONS: { value: DistanceType; label: string }[] = [
  { value: "full", label: "풀마라톤" },
  { value: "half", label: "하프마라톤" },
  { value: "10km", label: "10km" },
  { value: "5km", label: "5km" },
  { value: "custom", label: "커스텀" },
];

interface RaceFormProps {
  initialData?: Partial<RaceFormData>;
  onSubmit: (data: RaceFormData) => void;
  loading?: boolean;
  submitLabel?: string;
}

function formatDateForInput(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function RaceForm({ initialData, onSubmit, loading, submitLabel = "저장" }: RaceFormProps) {
  const [raceName, setRaceName] = useState(initialData?.race_name ?? "");
  const [raceDate, setRaceDate] = useState(formatDateForInput(initialData?.race_date));
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [distanceType, setDistanceType] = useState<DistanceType>(initialData?.distance_type ?? "half");
  const [distanceCustomKm, setDistanceCustomKm] = useState(
    initialData?.distance_custom ? String(initialData.distance_custom / 1000) : ""
  );
  const [targetH, setTargetH] = useState(
    initialData?.target_time ? String(Math.floor(initialData.target_time / 3600)) : ""
  );
  const [targetM, setTargetM] = useState(
    initialData?.target_time ? String(Math.floor((initialData.target_time % 3600) / 60)) : ""
  );
  const [targetS, setTargetS] = useState(
    initialData?.target_time ? String(Math.floor(initialData.target_time % 60)) : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseInt(targetH) || 0;
    const m = parseInt(targetM) || 0;
    const s = parseInt(targetS) || 0;
    const targetTime = h * 3600 + m * 60 + s;

    onSubmit({
      race_name: raceName,
      race_date: new Date(raceDate).toISOString(),
      location,
      distance_type: distanceType,
      distance_custom: distanceType === "custom" ? parseFloat(distanceCustomKm) * 1000 : null,
      target_time: targetTime > 0 ? targetTime : null,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="대회명"
            value={raceName}
            onChange={(e) => setRaceName(e.target.value)}
            required
            fullWidth
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="대회 일시"
            type="datetime-local"
            value={raceDate}
            onChange={(e) => setRaceDate(e.target.value)}
            required
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="장소"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>거리</InputLabel>
            <Select
              value={distanceType}
              label="거리"
              onChange={(e) => setDistanceType(e.target.value as DistanceType)}
            >
              {DISTANCE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {distanceType === "custom" && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="커스텀 거리 (km)"
              type="number"
              value={distanceCustomKm}
              onChange={(e) => setDistanceCustomKm(e.target.value)}
              fullWidth
              size="small"
              slotProps={{ htmlInput: { step: "0.1", min: "0" } }}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            목표 시간
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              label="시"
              type="number"
              value={targetH}
              onChange={(e) => setTargetH(e.target.value)}
              size="small"
              sx={{ width: 80 }}
              slotProps={{ htmlInput: { min: "0" } }}
            />
            <Typography>:</Typography>
            <TextField
              label="분"
              type="number"
              value={targetM}
              onChange={(e) => setTargetM(e.target.value)}
              size="small"
              sx={{ width: 80 }}
              slotProps={{ htmlInput: { min: "0", max: "59" } }}
            />
            <Typography>:</Typography>
            <TextField
              label="초"
              type="number"
              value={targetS}
              onChange={(e) => setTargetS(e.target.value)}
              size="small"
              sx={{ width: 80 }}
              slotProps={{ htmlInput: { min: "0", max: "59" } }}
            />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Button type="submit" variant="contained" disabled={loading} fullWidth>
            {loading ? "저장 중..." : submitLabel}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
