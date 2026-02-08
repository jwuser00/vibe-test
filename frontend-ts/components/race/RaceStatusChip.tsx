"use client";

import Chip from "@mui/material/Chip";
import { RaceStatus } from "@/lib/types";

const statusConfig: Record<RaceStatus, { color: "primary" | "success" | "warning" | "error"; label: string }> = {
  "예정": { color: "primary", label: "예정" },
  "완주": { color: "success", label: "완주" },
  "DNS": { color: "warning", label: "DNS" },
  "DNF": { color: "error", label: "DNF" },
};

interface RaceStatusChipProps {
  status: RaceStatus;
}

export default function RaceStatusChip({ status }: RaceStatusChipProps) {
  const config = statusConfig[status] || { color: "primary" as const, label: status };
  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      sx={{ fontWeight: 700 }}
    />
  );
}
