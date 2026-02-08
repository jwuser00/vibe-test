"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppLayout from "@/components/layout/AppLayout";
import RaceForm from "@/components/race/RaceForm";
import Toast from "@/components/common/Toast";
import { createRace } from "@/lib/api/races";
import { useToast } from "@/lib/hooks/useToast";
import { RaceFormData } from "@/lib/types";

export default function NewRacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const handleSubmit = async (data: RaceFormData) => {
    setLoading(true);
    try {
      const race = await createRace(data);
      showToast("대회가 등록되었습니다", "success");
      router.push(`/races/${race.id}`);
    } catch {
      showToast("대회 등록에 실패했습니다", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/races")}
        sx={{ mb: 2 }}
      >
        대회 목록으로
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>
        새 대회 등록
      </Typography>

      <Card>
        <CardContent>
          <RaceForm onSubmit={handleSubmit} loading={loading} submitLabel="등록" />
        </CardContent>
      </Card>

      <Toast toast={toast} onClose={closeToast} />
    </AppLayout>
  );
}
