"use client";

import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppLayout from "@/components/layout/AppLayout";
import ActivityDetailView from "@/components/activity/ActivityDetailView";

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  return (
    <AppLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/activities")}
        sx={{ mb: 2 }}
      >
        내 활동으로 돌아가기
      </Button>

      <ActivityDetailView activityId={id} />
    </AppLayout>
  );
}
