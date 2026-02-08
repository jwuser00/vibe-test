"use client";

import { useEffect, useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { getActivities } from "@/lib/api/activities";
import { Activity } from "@/lib/types";
import { toKST, formatPace } from "@/lib/utils/format";

interface ActivitySelectorProps {
  value: number | null;
  onChange: (activityId: number | null) => void;
}

export default function ActivitySelector({ value, onChange }: ActivitySelectorProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getActivities();
        const sorted = [...data].sort(
          (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
        setActivities(sorted);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <FormControl fullWidth size="small">
      <InputLabel>활동 연결</InputLabel>
      <Select
        value={value ?? ""}
        label="활동 연결"
        onChange={(e) => {
          const v = e.target.value as string | number;
          onChange(v === "" ? null : Number(v));
        }}
      >
        <MenuItem value="">연결 안 함</MenuItem>
        {activities.map((a) => {
          const kst = toKST(a.start_time);
          return (
            <MenuItem key={a.id} value={a.id}>
              {kst.toLocaleDateString("ko-KR")} — {(a.total_distance / 1000).toFixed(2)}km ({formatPace(a.avg_pace)} /km)
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
