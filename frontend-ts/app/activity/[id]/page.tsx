"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppLayout from "@/components/layout/AppLayout";
import ActivityStats from "@/components/activity/ActivityStats";
import LapTable from "@/components/activity/LapTable";
import PaceHRChart from "@/components/activity/PaceHRChart";
import { getActivity } from "@/lib/api/activities";
import { Activity } from "@/lib/types";

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [activity, setActivity] = useState<Activity | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const data = await getActivity(id);
        setActivity(data);
      } catch {
        // handled by auth interceptor
      }
    };
    load();
  }, [id]);

  return (
    <AppLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/dashboard")}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>

      {!activity ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Activity Analysis
              </Typography>
              <ActivityStats activity={activity} />
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Lap Analysis
              </Typography>
              <LapTable laps={activity.laps} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pace &amp; Heart Rate
              </Typography>
              <PaceHRChart laps={activity.laps} />
            </CardContent>
          </Card>
        </>
      )}
    </AppLayout>
  );
}
