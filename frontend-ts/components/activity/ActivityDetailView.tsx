"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import ActivityStats from "./ActivityStats";
import LapTable from "./LapTable";
import PaceHRChart from "./PaceHRChart";
import { getActivity } from "@/lib/api/activities";
import { Activity } from "@/lib/types";

interface ActivityDetailViewProps {
  activityId: number;
}

export default function ActivityDetailView({ activityId }: ActivityDetailViewProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getActivity(activityId);
        if (!cancelled) setActivity(data);
      } catch {
        // handled by auth interceptor
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activityId]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!activity) {
    return (
      <Typography color="text.secondary" sx={{ py: 2 }}>
        활동 데이터를 불러올 수 없습니다.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            활동 요약
          </Typography>
          <ActivityStats activity={activity} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            랩 분석
          </Typography>
          <LapTable laps={activity.laps} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            페이스 &amp; 심박수
          </Typography>
          <PaceHRChart laps={activity.laps} />
        </CardContent>
      </Card>
    </Box>
  );
}
